import Resource from '../Resource.js';

export default Resource({

    labels:{
        unique(ctx,items){
            return items
                .filter((item) => item.organizationId === ctx.organizationId)
                .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
                .reduce((r, o) => {
                    const index = r.findIndex(({ deviceId }) => deviceId === o.deviceId);
                    if(index === -1){
                        r.push(o);
                    }
                    return r;
                },[]);
        }
    },

    beforeCreate(ctx,data){
        data.organizationId = ctx.organizationId;
    },
})