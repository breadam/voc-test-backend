import Resource from '../Resource.js';

export default Resource({

    beforeCreate(ctx,data){
        data.isSeen = false;
    },

    labels:{
        count(ctx,items){
            return items.filter(item => item.userId === ctx.user.id).length;
        }
    }
})