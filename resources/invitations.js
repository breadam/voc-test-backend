import Store from '../store.js';
import Resource from '../Resource.js';

export default Resource({

    beforeCreate(ctx,data){
        data.state = 'pending';
    },

    afterCreate(ctx,data){

        const user = Store.findOne('users',{email:data.email});

        if(user){
            Store.createOne('notifications',{
                type:"invitation-received",
                invitationId:data.id,
                organizationId:data.organizationId,
                userId:user.id,
                fromUserId:ctx.user.id,
                isSeen:false
            });
        }
    },

    afterUpdate(ctx,{state,id,organizationId,email,createdById}){

        if(state === 'accept'){
            
            const user = Store.findOne('users',{email:email});
            
            if(user){

                Store.createOne('roles',{
                    organizationId:organizationId,
                    userId:user.id,
                    name:'viewer'
                });

                Store.createOne('notifications',{
                    type:"invitation-accepted",
                    invitationId:id,
                    organizationId:organizationId,
                    userId:createdById,
                    fromUserId:user.id,
                    isSeen:false
                });
            }
        }else if(state === 'decline'){

            const user = Store.findOne('users',{email:email});

            if(user){

                Store.createOne('notifications',{
                    type:"invitation-declined",
                    invitationId:id,
                    organizationId:organizationId,
                    userId:createdById,
                    fromUserId:user.id,
                    isSeen:false
                });
            }
        }
    },
})