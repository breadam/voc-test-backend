import Resource from '../Resource.js';
import Store from '../store.js';

export default Resource({

    beforeCreate(ctx,data){
        data.organizationId = ctx.organizationId;
    },

    afterFindMany(ctx,items){
       addGlobalRoms(items);
    },

    afterGetMany(ctx,items){
        addGlobalRoms(items);
    },

    afterGetAll(ctx,items){
        addGlobalRoms(items);
    }
});

function addGlobalRoms(items){
    const roms = Store.getAll('roms');
        
    roms.forEach((item) => {
        if(!('organizationId' in item)){
            items.push(item);
        }
    });
}