import Store from '../store.js';
import Resource from '../Resource.js';

export default Resource({

    afterCreate(ctx,item){
        Store.createOne('roles',{
            organizationId:item.id,
            userId:ctx.user.id,
			name:'admin'
        });
    }
})