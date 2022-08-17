import Resource from '../Resource.js';

export default Resource({

    afterCreate(ctx,item){
        const Store = ctx.store;
        Store.createOne('roles',{
            organizationId:item.id,
            userId:ctx.user.id,
			name:'Owner'
        });
    }
})