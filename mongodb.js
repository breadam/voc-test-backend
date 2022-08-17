import { MongoClient, ObjectId } from 'mongodb';

export default class MongoDB{

    static DBNAME = 'voc-db'
    static URL = 'mongodb+srv://voc-admin:voc-admin@voc-test.hp4bq47.mongodb.net/?retryWrites=true&w=majority'
    static client;

    static async setup(){
        const client = new MongoClient(this.URL);
        await client.connect();
        MongoDB.client = client;
    }

    static resource(name){
        return MongoDB.client.db(this.DBNAME).collection(name);
    }


    static async getAll(resource,pageId,pageSize){
        const ret = await this.resource(resource).find({});
        const arr = await ret.toArray();
        return arr.map(normalizeId);
    }

    static async getOne(resource,id){
        let objId = id;

        if(typeof(id) === 'string'){
            objId = ObjectId(id);
        }

        const ret = await this.resource(resource).findOne({_id:objId});
        return normalizeId(ret);
    }

    static async getMany(resource,ids){
        const ret = await this.resource(resource).find({_id:{ $in: ids.split(',').map(id => ObjectId(id))}});
        const arr = await ret.toArray();
        return arr.map(normalizeId);
    }

    static async findOne(resource,params){
        const ret = await this.resource(resource).findOne(params);
        return  normalizeId(ret);
    }

    static async findMany(resource,params,pageId,pageSize){
        const ret = await this.resource(resource).find(params);
        const arr = await ret.toArray();
        return arr.map(normalizeId);
    }

    static async createOne(resource,data){
        
        convertToObjectId(data);

        const ret = await this.resource(resource).insertOne(data);
        data.id = ret.insertedId;
        return data;
    }

    static async updateOne(resource,id,data){
        let objId = id;

        if(typeof(id) === 'string'){
            objId = ObjectId(id);
        }

        convertToObjectId(data);

        return normalizeId(await this.resource(resource).updateOne({_id:objId},{$set:data}));
    }

    static async saveOne(resource,data){
        
        convertToObjectId(data);

        const ret = await this.resource(resource).updateOne({_id:data.id},{$set:data},{ upsert: true});
        return normalizeId(ret);
    }

    static async deleteOne(resource,id){
        let objId = id;

        if(typeof(id) === 'string'){
            objId = ObjectId(id);
        }
        return await this.resource(resource).deleteOne({_id:objId});
    }

    static async deleteMany(resource,ids){
        return await this.resource(resource).deleteMany({_id:{ $in: ids.split(',').map(id => ObjectId(id))}});
    }

    static parseSearch(query){
        const params = {};
        query.split(',').forEach((q) => {
			const s = q.split(':');
            const key = s[0];
            const val = s[1];
            if(val === 'true'){
                params[key] = true;
            }else if(val === 'false'){
                params[key] = false;
            }else if(key.includes('Id')){
                params[key] = ObjectId(val);
            }else{
                params[key] = val;
            }
			
		});
        return params;
    }

    static _getPage(list,pageId,pageSize){
    }
}


function normalizeId(document) {
    
    if(!document){
        return;
    }

    var _id = document._id && document._id.toString();
  
    if (_id) {
      document.id = _id.toString();
      delete document._id;
    }
  
    return document;
};

function convertToObjectId(data){
    for(let key in data){
        
        if(data[key] && (key == 'id' || key.includes('Id'))){

            if(Array.isArray(data[key])){
                data[key] = data[key].map(d => {
                    if(isObject(d)){
                        return convertToObjectId(d);
                    }else{
                        return ObjectId(d)
                    }
                });
            }else if(isObject(data[key])){
                data[key] = convertToObjectId(data[key]);
            }else{
                data[key] = ObjectId(data[key]);
            }
        }
    }

    return data;
}

function isObject(obj){
    return Object.prototype.toString.call(obj) === '[object Object]';
};