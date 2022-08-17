import Resource from '../Resource.js';

export default Resource({

    beforeCreate(ctx,data){
        data.organizationId = ctx.organizationId;
    },

    async afterFindMany(ctx,items){
        await addGlobalRoms(ctx.store,items);
    },

    async afterGetMany(ctx,items){
        await addGlobalRoms(ctx.store,items);
    },

    async afterGetAll(ctx,items){
        await addGlobalRoms(ctx.store,items);
    }
});

async function addGlobalRoms(Store,items){
    const roms = await Store.getAll('roms');
        
    roms.forEach((item) => {
        if(!('organizationId' in item)){
            items.push(item);
        }
    });
}