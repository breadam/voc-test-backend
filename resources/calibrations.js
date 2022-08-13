import Resource from '../Resource.js';
import Store from '../store.js';

export default Resource({

    labels:{
    },

    beforeCreate(ctx,data){
        data.organizationId = ctx.organizationId;
    },

    afterCreate(ctx,item){
        Store.updateOne('devices',item.deviceId,{
            calibrationId:item.id
        });
        
    },
})