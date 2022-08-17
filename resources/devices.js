import Resource from '../Resource.js';

export default Resource({

    async beforeCreate(ctx,data){
        const Store = ctx.store;
        data.organizationId = ctx.organizationId;

        const readings = await Store.findMany('readings',{code:data.code});
        const devices = readings.filter((reading) => !!reading.deviceId);

        if(devices.length){
            throw new Error('Device code already used');
        }
    },

    async afterCreate(ctx,item){
        const Store = ctx.store;
        const readings = await Store.findMany('readings',{code:item.code});
        
        readings.forEach(async(reading) => {
            reading.deviceId = item.id;
            reading.organizationId = ctx.organizationId;
            await Store.saveOne('readings',reading);
        });
    },

    async beforeUpdate(ctx,data){
        const Store = ctx.store;
        data.organizationId = ctx.organizationId;

        const readings = await Store.findMany('readings',{code:data.code});
        const devices = readings.filter((reading) => !!reading.deviceId && reading.deviceId !== data.id);

        if(devices.length){
            throw new Error('Device code already used');
        }
    },

    async afterUpdate(ctx,item){
        const Store = ctx.store;
        const readings = await Store.findMany('readings',{code:item.code});
        
        readings.forEach(async (reading) => {
            reading.deviceId = item.id;
            reading.organizationId = ctx.organizationId;
            await Store.saveOne('readings',reading);
        });
    }
});