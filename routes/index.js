import Router from 'koa-router';
import jwt from 'jsonwebtoken';

import Store from '../store.js';

import {JWT_PASSWORD} from '../config.js';

import auth from '../middlewares/auth.js';

const router = new Router({
	prefix: ''
});

router.get('/',(ctx,next) => {
    const list = Store.getResourceList();

	const resources = list.map((resource) => {
		return `
			<li>
				<h3>${resource}</h3>
				<table>	
					<tr><td><a href="/api/${resource}">Get All</a></td><td>/api/${resource}/</td></tr>
					<tr><td><a href="/api/${resource}/1">Get One</a></td><td>/api/${resource}/&ltitem_id&gt</td></tr>
					<tr><td><a href="/api/${resource}?ids=1,2">Get Many</a></td><td>/api/${resource}?ids=&ltid_list&gt</td></tr>
					<tr><td><a href="/api/${resource}?search=id:1">Find Many</a></td><td>/api/${resource}?search=&ltquery_list&gt</td></tr>
					<tr><td><a href="/api/${resource}?search=id:1">Create One</a></td><td>/api/${resource}?search=&ltquery_list&gt</td></tr>
					<tr><td><a href="/api/${resource}?search=id:1">Update One</a></td><td>/api/${resource}?search=&ltquery_list&gt</td></tr>
					<tr><td><a href="/api/${resource}?search=id:1">Delete One</a></td><td>/api/${resource}?search=&ltquery_list&gt</td></tr>
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

router.post('/login',(ctx,next) => {

	const body = ctx.request.body;
	const email = body.email;
	const password = body.password;

	const user = Store.findOne('users',{email,password});
	
	if(user){
		
		const token = jwt.sign({userId:user.id},JWT_PASSWORD);
		
		ctx.body = {
			user,
			token
		};
		next();
	}else{
		ctx.body = 'Error';
		next();	
	}
});

router.post('/signup',(ctx,next) => {
	
	const body = ctx.request.body;
	const name = body.name;
	const email = body.email;
	const password = body.password;
    
	const user = Store.createOne('users',{
		name,
		email,
		password
	});

	const organization = Store.createOne('organizations',{
		type:'user',
		userId:user.id,
	});

	Store.createOne('roles',{
		organizationId:organization.id,
		userId:user.id,
		name:'admin'
	});

	const token = jwt.sign({userId:user.id},JWT_PASSWORD);

	ctx.body = {
		token,
		user
	};

    next();
});

router.get('/me',auth,(ctx,next) => {
	
	const user = ctx.user;

	if(user){
		ctx.body = user;
		next();
	}else{
		ctx.status = 403;
		next();	
	}
});

router.get('/deviceRom/update',(ctx,next) => {

	const {uuid,romVersion} = ctx.query;

	const device = Store.findOne('devices',{code:uuid});

	if(device){
		ctx.body = "none";
		return next();
	}

	const rom = Store.getOne('roms',device.romId);

	const currentVersion = getVersionCode(romVersion);
	const deviceVersion = getVersionCode(rom.name);

	if(currentVersion.name === deviceVersion.name && deviceVersion.version > currentVersion.version){
		ctx.body = rom.url;
	}else{
		ctx.body = 'none';
	}

	next();
});

router.get('/calibration/calibration',(ctx,next) => {

	const {uuid,temp,hum,iaq} = ctx.query;
	
	const device = Store.findOne('devices',{code:uuid});
	
	if(!device){
		ctx.body = 'none';
		return next();
	}

	const calibrations = Store.findMany('calibrations',{deviceId:device.id}).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

	if(calibrations.length === 0){
		ctx.body = 'none';
		return next();
	}

	const cTemperature = calibrations[0].temperature;
	const cHumidity = calibrations[0].humidity;
	const cIaq = calibrations[0].iaq;

	let ret = '';
	
	if(temp && cTemperature !== temp){
		const deltaTemperature = cTemperature - temp;
		ret += deltaTemperature;
	}

	if(hum && cHumidity !== hum){
		const deltaHumidity = cHumidity - hum;
		ret += '#' + deltaHumidity;
	}

	if(iaq && cIaq !== iaq){
		const deltaIaq = cIaq - iaq;
		ret += '#' + deltaIaq;
	}

	if(!ret){
		ctx.body = 'none';
	}else{
		ctx.body = ret;
	}
	next();
})

function getVersionCode(romVersion){
	const romVersionArray = romVersion.split('_');
	const romVersionNumber = romVersionArray.pop();
	const name = romVersionArray.join('_');

	const code = romVersionNumber.substring(1,romVersionNumber.length);
	
	return {
		name: name + '_' + romVersionNumber.charAt(0),
		version:code
	};
}


export default router;