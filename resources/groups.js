import Resource from '../Resource.js';

export default Resource({

    beforeCreate(ctx,data){
        data.organizationId = ctx.organizationId;
    },
})