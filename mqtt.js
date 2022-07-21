import {connect} from 'mqtt';

import Store from './Store.js';

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

            Store.createOne('readings',{
                deviceId:device?.id,
                organizationId:device?.organizationId,
                code:code,
                createdAt:fields[1],
                temperature:fields[2],
                humidity:fields[4],
                iaq:fields[8]
            });

        }else if(topic === 'Status'){

        }
    });

    client.on('error',function(err){
        console.log(err);
    });
}