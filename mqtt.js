import {connect} from 'mqtt';
import { checkTriggers, isTargetDevice } from './alert-engine.js';

import Store from './store.js';

export default ({url,username,password}) => {

    const client = connect(url,{
        username,
        password
    });

    client.on('connect', function () {    
        client.subscribe('Send', function (err) {});
        client.subscribe('Status', function (err) {});
    });

    client.on('message', function (topic, message) {
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

            const device = Store.findOne('devices',{code});
            const organizationId = device?.organizationId;

            const reading = Store.createOne('readings',{
                deviceId:device?.id,
                organizationId:organizationId,
                code:code,
                createdAt:fields[1],
                temperature:fields[2],
                humidity:fields[4],
                iaq:fields[8]
            });

            if(device){

                const rules = Store.findMany('alert-rules',{organizationId});

                rules.forEach(rule => {
                    if(!isTargetDevice(rule,device)){
                        return;
                    }

                    const alerts = checkTriggers(rule.triggerIds,reading);
                    const roles = Store.findMany('roles',{organizationId});

                    alerts.forEach(item => {

                        const alert = Store.createOne('alerts',{
                            organizationId,
                            alertRuleId:rule.id,
                            deviceId:device.id,
                            triggerIds:item,
                            createdAt:new Date()
                        });

                        roles.forEach(role => {

                            if(role.name === 'admin'){

                                Store.createOne('notifications',{
                                    type:'alert',
                                    userId:role.userId,
                                    deviceId:device.id,
                                    organizationId,
                                    alertId:alert.id,
                                    createdAt:new Date()
                                });
                            }
                        });

                    });
                });

            }

        }else if(topic === 'Status'){
            const fields = message.toString().split('#');

            const code = fields[0];
         // const localIp = fields[1];
            const romName = fields[2];

            let rom = Store.findOne('roms',{name:romName});

            if(!rom){
                rom = Store.createOne('roms',{name:romName});
            }

            let device = Store.findOne('devices',{code});

            if(device){
                device.romId = rom.id;
                Store.updateOne('devices',device.id,device);
            }
        }
    });

    client.on('error',function(err){
        console.log(err);
    });
}