import dayjs from "dayjs";

const INTERVAL = 10000;

function isOffline(readingDate){
    return dayjs().subtract(5,'minutes').isAfter(dayjs(readingDate));
}

export default function (Store){

    async function loop(){

        const readings = await Store.getAll('readings');
        
        let deviceIds = {};

        const sortedReadings = await readings.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
        
        for(const reading of sortedReadings){
            if(!reading.deviceId || deviceIds[reading.deviceId]){
                return;
            }
    
            const device = await Store.getOne('devices',reading.deviceId);
        
            if(!device){
                deviceIds[reading.deviceId] = true;
                return;
            }
    
            let status = true;
    
            if(isOffline(reading.createdAt)){
                status = false;
                await Store.createOne('readings',{
                    deviceId:device.id,
                    organizationId:device.organizationId,
                    code:device.code,
                    createdAt:new Date(),
                });
            }

            if(device.status !== status){
                device.status = status;
                await Store.updateOne('devices',device.id,device);
            }

            deviceIds[reading.deviceId] = true;
        }
        
        deviceIds = null;

        setTimeout(loop,INTERVAL);
    }

    return function(){
        setTimeout(loop,0)
    };
}
