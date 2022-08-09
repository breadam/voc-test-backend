import Router from 'koa-router';

import Store from '../store.js';

import auth from '../middlewares/auth.js';

import resources from '../resources/index.js';

const router = new Router({
	prefix: '/api'
});

router.use(auth);

router.get('/:resource',(ctx, next) => {

	const resource = ctx.params.resource;
	const ids = ctx.query.ids;
	const search = ctx.query.search;
	const label = ctx.query.label;
	const pageId = Number.parseInt(ctx.query.pageId);
	const pageSize = Number.parseInt(ctx.query.pageSize);

	if(ids){
		resources[resource]?.beforeGetMany(ctx,ids);
		const items = Store.getMany(resource,ids);
		resources[resource]?.afterGetMany(ctx,items);
		ctx.body = items;
		return next();
	}

	if(search){
		const params = Store.parseSearch(search);
		resources[resource]?.beforeFindMany(ctx,params);
		const items = Store.findMany(resource,params,pageId,pageSize);
		resources[resource]?.afterFindMany(ctx,items);
		ctx.body = items;
		return next();
	}

	if(label){
		const items = Store.getAll(resource);
		const filter = resources[resource]?.labels[label];

		if(filter){
			const filtered = (ctx,items);
			ctx.body = filtered;
		}else{
			ctx.body = '';
		}
		return next();
	}

	resources[resource]?.beforeGetAll(ctx);
	const items = Store.getAll(resource,pageId,pageSize);
	resources[resource]?.afterGetAll(ctx,items);
	ctx.body = items;
	return next();
});

router.get('/:resource/:id', (ctx, next) => {
	const resource = ctx.params.resource;
	const id = ctx.params.id;

	resources[resource]?.beforeGetOne(ctx);

	const item = Store.getOne(resource,id);

	resources[resource]?.afterGetOne(ctx);

	ctx.body = item;
	next();
});

router.post('/:resource', (ctx, next) => {
	const resource = ctx.params.resource;
	const data = ctx.request.body;
	const organizationType = ctx.organizationType;

	resources[resource]?.beforeCreate(ctx,data);

	if(organizationType === "user"){
		data.ownerId = ctx.user.id;
		data.ownerType = 'user';
	}else if(organizationType === 'organization'){
		data.ownerId = ctx.organizationId;
		data.ownerType = 'organization';
	}
	
	data.createdById = ctx.user.id;
	data.createdAt = new Date();
	data.updatedById = ctx.user.id;
	data.updatedAt = new Date();
	
	const item = Store.createOne(resource,data);

	resources[resource]?.afterCreate(ctx,item);
	
	ctx.body = item;
	next();
});

router.put('/:resource/:id', (ctx, next) => {
	const resource = ctx.params.resource;
	const id = ctx.params.id;
	const data = ctx.request.body;
	
	resources[resource]?.beforeUpdate(ctx,data);

	data.updatedById = ctx.user.id;
	data.updatedAt = new Date();

	const item = Store.updateOne(resource,id,data);

	if(item){
		resources[resource]?.afterUpdate(ctx,item);
	}
	
	ctx.body = item;

	next();
});

router.delete('/:resource', (ctx, next) => {

	const resource = ctx.params.resource;
	const ids = ctx.query.ids;
	
	if(ids){
		Store.deleteMany(resource,ids);
	}
	ctx.body = '';
	next();
});

router.delete('/:resource/:id', (ctx, next) => {
	const resource = ctx.params.resource;
	const id = ctx.params.id;
	
	resources[resource]?.beforeDelete(ctx);

	Store.deleteOne(resource,id);

	resources[resource]?.afterDelete(ctx);
	
	ctx.body = '';
	next();
});

export default router;