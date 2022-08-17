import Router from 'koa-router';
import jwt from 'jsonwebtoken';

import {JWT_PASSWORD} from '../config.js';

import auth from '../middlewares/auth.js';

import resources from '../resources/index.js';
import { ObjectId } from 'mongodb';

const router = new Router({
	prefix: '/v1'
});

router.get('/:resource',auth,async (ctx, next) => {

	const Store = ctx.store;
	const resource = ctx.params.resource;
	const ids = ctx.query.ids;
	const search = ctx.query.search;
	const label = ctx.query.label;
	const pageId = Number.parseInt(ctx.query.pageId);
	const pageSize = Number.parseInt(ctx.query.pageSize);

	if(resource === 'profile' || resource === 'identity'){
		return next();
	}

	if(ids){
		await resources[resource]?.beforeGetMany(ctx,ids);
		const items = await Store.getMany(resource,ids);
		await resources[resource]?.afterGetMany(ctx,items);
		ctx.body = {items:{data:items}};
		return next();
	}

	if(search){
		const params = Store.parseSearch(search);
		await resources[resource]?.beforeFindMany(ctx,params);
		const items = await Store.findMany(resource,params,pageId,pageSize);
		await resources[resource]?.afterFindMany(ctx,items);
		ctx.body = {items:{data:items}};
		return next();
	}

	if(label){
		const items = await Store.getAll(resource);
		const filter = resources[resource]?.labels[label];

		if(filter){
			const filtered = filter(ctx,items);
			ctx.body = {items:{data:filtered}};
		}else{
			ctx.body = '';
		}
		return next();
	}

	await resources[resource]?.beforeGetAll(ctx);
	const items = await Store.getAll(resource,pageId,pageSize);
	await resources[resource]?.afterGetAll(ctx,items);
	ctx.body = {items:{data:items}};
	return next();
});

router.get('/many/:resource',auth,async (ctx, next) => {

	const Store = ctx.store;
	const resource = ctx.params.resource;
	const ids = ctx.query.ids;
	const search = ctx.query.search;
	const label = ctx.query.label;
	const pageId = Number.parseInt(ctx.query.pageId);
	const pageSize = Number.parseInt(ctx.query.pageSize);

	if(resource === 'profile' || resource === 'identity'){
		return next();
	}

	if(ids){
		await resources[resource]?.beforeGetMany(ctx,ids);
		const items = await Store.getMany(resource,ids);
		await resources[resource]?.afterGetMany(ctx,items);
		ctx.body = {items:{data:items}};
		return next();
	}

	if(search){
		const params = Store.parseSearch(search);
		await resources[resource]?.beforeFindMany(ctx,params);
		const items = await Store.findMany(resource,params,pageId,pageSize);
		await resources[resource]?.afterFindMany(ctx,items);
		ctx.body = {items:{data:items}};
		return next();
	}

	if(label){
		const items = await Store.getAll(resource);
		const filter = resources[resource]?.labels[label];

		if(filter){
			const filtered = (ctx,items);
			ctx.body = {items:{data:filtered}};
		}else{
			ctx.body = '';
		}
		return next();
	}

	await resources[resource]?.beforeGetAll(ctx);
	const items = await Store.getAll(resource,pageId,pageSize);
	await resources[resource]?.afterGetAll(ctx,items);
	ctx.body = {items:{data:items}};
	return next();
});

router.get('/:resource/:id', auth,async (ctx, next) => {
	const Store = ctx.store;
	const resource = ctx.params.resource;
	const id = ctx.params.id;
	
	if(resource === 'many' || id === 'me'){
		return next();
	}

	await resources[resource]?.beforeGetOne(ctx);

	const item = await Store.getOne(resource,id);

	await resources[resource]?.afterGetOne(ctx);

	ctx.body = item;
	return next();
});

router.post('/:resource', auth,async (ctx, next) => {
	const Store = ctx.store;
	const resource = ctx.params.resource;
	const data = ctx.request.body;
	const organizationType = ctx.organizationType;

	if(resource === 'profile' || resource === 'identity'){
		return next();
	}

	await resources[resource]?.beforeCreate(ctx,data);

	if(organizationType === "user"){
		data.ownerId = ctx.user._id;
		data.ownerType = 'user';
	}else if(organizationType === 'organization'){
		data.ownerId = ctx.organizationId;
		data.ownerType = 'organization';
	}
	
	data.createdById = ObjectId(ctx.user.id);
	data.createdAt = new Date();
	data.updatedById = ObjectId(ctx.user.id);
	data.updatedAt = new Date();
	
	const item = await Store.createOne(resource,data);

	await resources[resource]?.afterCreate(ctx,item);
	
	ctx.body = item;
	return next();
});

router.put('/:resource/:id', auth,async (ctx, next) => {

	const Store = ctx.store;
	const resource = ctx.params.resource;
	const id = ctx.params.id;
	const data = ctx.request.body;

	if(resource === 'profile' || resource === 'identity'){
		return next();
	}

	await resources[resource]?.beforeUpdate(ctx,data);

	data.updatedById = ObjectId(ctx.user.id);
	data.updatedAt = new Date();

	const item = await Store.updateOne(resource,id,data);

	if(item){
		await resources[resource]?.afterUpdate(ctx,item);
	}
	
	ctx.body = item;

	return next();
});

router.delete('/:resource', auth,async (ctx, next) => {
	const Store = ctx.store;
	const resource = ctx.params.resource;
	const ids = ctx.query.ids;
	
	if(resource === 'profile' || resource === 'identity'){
		return next();
	}

	if(ids){
		await Store.deleteMany(resource,ids);
	}
	ctx.body = '';
	return next();
});

router.delete('/:resource/:id', auth,async (ctx, next) => {
	const Store = ctx.store;
	const resource = ctx.params.resource;
	const id = ctx.params.id;
	
	if(resource === 'profile' || resource === 'identity'){
		return next();
	}

	await resources[resource]?.beforeDelete(ctx);

	await Store.deleteOne(resource,id);

	await resources[resource]?.afterDelete(ctx);
	
	ctx.body = '';
	return next();
});

router.post('/identity/login',async (ctx,next) => {

	const Store = ctx.store;
	const body = ctx.request.body;
	const email = body.email;
	const password = body.password;

	const user = await Store.findOne('users',{email,password});
	
	if(user){
		
		const token = jwt.sign({userId:user.id},JWT_PASSWORD);
		
		ctx.body = {
			user,
			token
		};
		return next();
	}else{
		ctx.body = 'Error';
		return next();	
	}
});

router.post('/identity/register-individual',async (ctx,next) => {
	const Store = ctx.store;
	const body = ctx.request.body;
	const name = body.name;
	const email = body.email;
	const password = body.password;

	const user = await Store.createOne('users',{
		name,
		email,
		password
	});

	const organization = await Store.createOne('organizations',{
		type:'user',
		userId:user.id,
	});

	const role = await Store.createOne('roles',{
		organizationId:organization.id,
		userId:user.id,
		name:'Owner'
	});

	const token = jwt.sign({userId:user.id},JWT_PASSWORD);

	ctx.body = {
		token,
		user
	};

    return next();
});

router.get('/profile/me',auth,(ctx,next) => {

	const user = ctx.user;

	if(user){
		ctx.body = user;
		return next();
	}else{
		ctx.status = 403;
		ctx.body = '';
		return next();
	}
});

router.get('/roles/me',auth,async (ctx,next) => {

	const user = ctx.user;
	const Store = ctx.store;

	const roles = await Store.findMany('roles',{userId: ObjectId(user.id)});
	ctx.body = {items:{data:roles}};
	return next();
});

export default router;