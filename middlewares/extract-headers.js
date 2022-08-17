import { ObjectId } from "mongodb";

export default (ctx,next) => {
    const authorization = ctx.headers.authorization;
    
    if(!authorization){
        return next();
    }

    ctx.token = ctx.headers.authorization?.split(' ')[1];
    ctx.organizationId = ObjectId(ctx.headers['x-organizationid']);
    return next();
}