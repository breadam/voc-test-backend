import Resource from '../Resource.js';

export default Resource({

    labels:{
    },

    beforeCreate(ctx,data){
        data.organizationId = ctx.organizationId;
    },

    async afterCreate(ctx,item){
        await ctx.store.updateOne('devices',item.deviceId,{
            calibrationId:item.id
        });
        
    },
})