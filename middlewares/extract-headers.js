export default (ctx,next) => {
    const authorization = ctx.headers.authorization;
    
    if(!authorization){
        return next();
    }

    ctx.token = ctx.headers.authorization.split(' ')[1];
    ctx.organizationId = ctx.headers['x-voc-organization-id'];
    next();
}