import dayjs from "dayjs";

import Store from "./store.js";

const INTERVAL = 5000;

function isOffline(readingDate){
    return dayjs().subtract(5,'minutes').isAfter(dayjs(readingDate));
}

function loop(){

    const readings = Store.loadResource('readings');

    readings.forEach((reading) => {

        if(!reading.deviceId){
            return;
        }

        const device = Store.getOne('devices',reading.deviceId);
    
        if(!device){
            return;
        }

        let status = true;

        if(isOffline(reading.createdAt)){
            status = false;
        }

        if(device.status !== status){
            
            Store.updateOne('devices',device.id,{
                status
            });
        }
    });

    setTimeout(loop,INTERVAL);
}

export default function run(){
    setTimeout(loop,INTERVAL);
}
