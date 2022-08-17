import {connect} from 'mqtt';
import { checkTriggers, isTargetDevice } from './alert-engine.js';

//import Store from './store.js';

export default async ({url,username,password},Store) => {

    const client = connect(url,{
        username,
        password
    });

    client.on('connect', function () {    
        client.subscribe('Send', function (err) {});
        client.subscribe('Status', function (err) {});
    });

    client.on('message', async function (topic, message) {
        if(topic === 'Send'){
            
            const fields = message.toString().split('#');
            const code = fields[0];
            /*
            const date = fields[1];
            const temperature = fields[2];
            const temperatureUnit = fields[3];
            const humidity = fields[4];
            const humidityUnit = fields[5];
            const pressure = fields[6];
            const pressureUnit = fields[7];
            const iaq = fields[8];
            const iaqUnit = fields[9];
            */

            const device = await Store.findOne('devices',{code});
            const organizationId = device?.organizationId;

            const reading = await Store.createOne('readings',{
                deviceId:device?.id,
                organizationId:organizationId,
                code:code,
                readAt:fields[1],
                createdAt:new Date(),
                temperature:fields[2],
                humidity:fields[4],
                iaq:fields[8]
            });

            const comparators = await Store.getAll('comparators');
            const sensors = await Store.getAll('sensors');

            if(device){

                const rules = await Store.findMany('alert-rules',{organizationId});
                
                for(const rule of rules){

                    if(!isTargetDevice(rule,device)){
                        return;
                    }

                    const triggers = rule.triggerIds.map(({sensorId,comparatorId,value}) => ({
                        sensor:sensors.find(s => sensorId.equals(s.id)),
                        comparator:comparators.find(c => comparatorId.equals(c.id)),
                        value
                    }));

                    const alerts = checkTriggers(triggers,reading);
                    const roles = await Store.findMany('roles',{organizationId});

                    for(const item of alerts){
                        const alert = await Store.createOne('alerts',{
                            organizationId,
                            alertRuleId:rule.id,
                            deviceId:device.id,
                            triggerId:{
                                sensorId:item.sensor.id,
                                comparatorId:item.comparator.id,
                                value:item.value,
                            },
                            createdAt:new Date()
                        });

                        for(const role of roles){

                            if(role.name === 'Owner'){

                                await Store.createOne('notifications',{
                                    type:'alert',
                                    userId:role.userId,
                                    deviceId:device.id,
                                    organizationId,
                                    alertId:alert.id,
                                    createdAt:new Date()
                                });
                            }
                        }
                    }
                }
            }

        }else if(topic === 'Status'){
            const fields = message.toString().split('#');

            const code = fields[0];
         // const localIp = fields[1];
            const romName = fields[2];

            let rom = await Store.findOne('roms',{name:romName});

            if(!rom){
                rom = await Store.createOne('roms',{name:romName});
            }

            const device = await Store.findOne('devices',{code});

            if(device){
                device.activeRomId = rom.id;
                await Store.updateOne('devices',device.id,device);
            }
        }
    });

    client.on('error',function(err){
        console.log(err);
    });
}