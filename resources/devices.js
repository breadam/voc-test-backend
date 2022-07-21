import Resource from '../Resource.js';
import Store from '../Store.js';

export default Resource({

    beforeCreate(ctx,data){
        data.organizationId = ctx.organizationId;

        const readings = Store.findMany('readings',{code:data.code});
        const devices = readings.filter((reading) => !!reading.deviceId);

        if(devices.length){
            throw new Error('Device code already used');
        }
    },

    afterCreate(ctx,item){
        const readings = Store.findMany('readings',{code:item.code});
        
        readings.forEach((reading) => {
            reading.deviceId = item.id;
            reading.organizationId = ctx.organizationId;
            Store.saveOne('readings',reading);
        });
    },

    beforeUpdate(ctx,data){
        data.organizationId = ctx.organizationId;

        const readings = Store.findMany('readings',{code:data.code});
        const devices = readings.filter((reading) => !!reading.deviceId && reading.deviceId !== data.id);

        if(devices.length){
            throw new Error('Device code already used');
        }
    },

    afterUpdate(ctx,item){
        const readings = Store.findMany('readings',{code:item.code});
        
        readings.forEach((reading) => {
            reading.deviceId = item.id;
            reading.organizationId = ctx.organizationId;
            Store.saveOne('readings',reading);
        });
    }


})