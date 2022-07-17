import Router from 'koa-router';
import json from 'koa-json';

import Store from '../store.js';

const router = new Router({
	prefix: '/api'
});

router.use(json());

router.get('/',(ctx,next) => {
	const list = Store.getResourceList();

	const resources = list.map((resource) => {
		return `
			<li>
				<h3>${resource}</h3>
				<table>	
					<tr><td><a href="/api/${resource}">Get All</a></td><td>/api/${resource}/</td></tr>
					<tr><td><a href="/api/${resource}?pageId=1&pageSize=2">Get Page</a></td><td>/api/${resource}?pageId=&ltpage_id&gt&&ltpage_size&gt</td></tr>
					<tr><td><a href="/api/${resource}/1">Get One</a></td><td>/api/${resource}/&ltitem_id&gt</td></tr>
					<tr><td><a href="/api/${resource}?ids=1,2">Get Many</a></td><td>/api/${resource}?ids=&ltid_list&gt</td></tr>
				<table>
			</li>
		`
	}).join('');

	const body = `
		<h2>API</h2>
		<ul>		
			${resources} 
		</ul>`;
	ctx.body = body;
	next();
});

router.get('/:resource', (ctx, next) => {
	const resource = ctx.params.resource;
	const ids = ctx.query.ids;
	const search = ctx.query.search;
	const pageId = Number.parseInt(ctx.query.pageId);
	const pageSize = Number.parseInt(ctx.query.pageSize);
	const fields = ctx.query.fields;

	if(ids){
		const items = Store.getMany(resource,ids);
		ctx.body = items;
		return next();
	}

	if(pageId && pageSize){
		const items = Store.getPage(resource,pageId,pageSize);
		ctx.body = items;
		return next();
	}

	if(search){
		const items = Store.find(resource,search);
		ctx.body = items;
		return next();
	}

	const items = Store.getAll(resource,pageId,pageSize);
	ctx.body = items;
	return next();
});

router.get('/:resource/:id', (ctx, next) => {
	const resource = ctx.params.resource;
	const id = ctx.params.id;
	const fields = ctx.params.id;

	const item = Store.getOne(resource,id);

	ctx.body = item;
	next();
});

router.post('/:resource', (ctx, next) => {
	const resource = ctx.params.resource;
	const data = ctx.body;

	const item = Store.createOne(resource,data);
	ctx.body = item;
	next();
});

router.put('/:resource/:id', (ctx, next) => {
	const resource = ctx.params.resource;
	const id = ctx.params.id;
	const data = ctx.body;

	Store.updateOne(resource,id,data);

	next();
});

router.delete('/:resource/:id', (ctx, next) => {
	const resource = ctx.params.resource;
	const id = ctx.params.id;
	const data = ctx.body;

	const item = Store.deleteOne(resource,id,data);

	ctx.body = item;
	next();
});

export default router;