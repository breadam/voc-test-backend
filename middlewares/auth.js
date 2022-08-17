import jwt from 'jsonwebtoken';

import { JWT_PASSWORD } from '../config.js';

export default async (ctx,next) => {
    
    const Store = ctx.store;

    if(ctx.token){
        
        const decoded = jwt.verify(ctx.token, JWT_PASSWORD);
        const user = await Store.getOne('users',decoded.userId);

        if(user){
            ctx.user = user;
        }

        if(ctx.organizationId){
            const organization = await Store.getOne('organizations',ctx.organizationId);
            ctx.organization = organization;
        }
    }
    
    return next();
}