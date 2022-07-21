import jwt from 'jsonwebtoken';

import Store from '../store.js';

import { JWT_PASSWORD } from '../config.js';

export default (ctx,next) => {

    if(ctx.token){

        const decoded = jwt.verify(ctx.token, JWT_PASSWORD);
        const user = Store.getOne('users',decoded.userId);

        if(user){
            ctx.user = user;
        }

        if(ctx.organizationId){
            const organization = Store.getOne('organizations',ctx.organizationId);
            ctx.organization = organization;
        }
    }
    
    next();
}