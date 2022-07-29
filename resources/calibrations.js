import Resource from '../Resource.js';

export default Resource({

    labels:{
    },

    beforeCreate(ctx,data){
        data.organizationId = ctx.organizationId;
    },
})