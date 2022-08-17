import Resource from '../Resource.js';

export default Resource({

    beforeCreate(ctx,data){
        data.organizationId = ctx.organizationId;
    },

    afterCreate(ctx,data){
        const Store = ctx.store;
        const invitations = Store.findMany('invitations',{email:data.email});

        invitations.forEach(invitation => {
            Store.createOne('notifications',{
                type:"invitation-received",
                invitationId:invitation.id,
                organizationId:data.organizationId,
                userId:data.id,
                fromUserId:invitation.createdById,
            });
        });
    }
})