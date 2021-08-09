const MongoClient = require('mongodb').MongoClient;
const {ObjectId} = require('mongodb');
var md5 = require('md5');
const uuid = require("uuid");

const addGroup = async({group_name,created_by,password}) => {
	const dbName = process.env.DATABASE_NAME;

	// Create a new MongoClient
	const client = new MongoClient(process.env.CONNECTION_URL,{
		useUnifiedTopology: true
	});

	try {
	    await client.connect();
	    const db = client.db(dbName);
	    const col = db.collection("groups");
	    const uniqueId = uuid.v4();

	    let group = {
	    	unique_id : uniqueId,
	    	group_name,
	    	chats : [],
	    	users : [],
	    	status: "A",
	    	password : md5(password),
	    	original_password : password,
	    	created_by
	    };

  		let result = await col.insertOne(group);
  		if(result.insertedCount == 1) {
  			let resultUpdate = await db.collection("users").updateOne(
				   { _id: ObjectId(created_by) },
				   { $push: { groups : uniqueId } }
  			);
  			if(resultUpdate.modifiedCount == 1) {
  				client.close();
  				return 1;
  			} else {
  				client.close();
  				return 0;
  			}
  			return 1;
  		} else {
  			client.close();
  			return 0;
  		}

	} catch(err) {
	    console.log(err.stack);
	}
}

const getUserGroups = async(id) => {

	return new Promise( async(resolve,reject) => {
		const dbName = process.env.DATABASE_NAME;
		const client = new MongoClient(process.env.CONNECTION_URL,{
			useUnifiedTopology: true
		});

		let argument = [
			{
				"$match" : {
					"_id" : ObjectId(id)
				}
			},
			{
			    '$lookup': {
			            from: "groups",
			            let: { groups : "$groups" },
			            pipeline: [
			                {
			                    '$match': {
			                        '$expr': {
			                            '$in': ["$unique_id", "$$groups"]
			                        }
			                    }
			                }
			            ],
			            as: "groups"
			        }
			},
		    { 
		        '$unwind': { path: "$groups" }    
		    },
		    {
		        '$group' : { 
		            _id : "$_id" ,
		            groups : { 
		            	'$push' : {
		                    _id : "$groups._id",
		                    name:"$groups.group_name",
		                    created_by:"$groups.created_by",
		                    unique_id:"$groups.unique_id",
		                }
		            }
		        }
		    }
		];

		await client.connect();
		const db = client.db(dbName);
		const collection = db.collection( 'users' );
		collection.aggregate( argument ,
			function(err, cursor) {
				if(err) {
					console.log(err);
					return [];
				}
				cursor.toArray(function(err, documents) {
					if(err) {
						reject(err);
					}
				  	client.close();
				  	resolve(documents);
				});
			}
		);
	})
}

const getChat = (id) => {

	return new Promise( async(resolve,reject) => {
		const dbName = process.env.DATABASE_NAME;

		// Create a new MongoClient
		const client = new MongoClient(process.env.CONNECTION_URL,{
			useUnifiedTopology: true
		});

		try {
			await client.connect();
		    const db = client.db(dbName);
		    const col = db.collection("groups");
			const docs = await col.find({unique_id:id}).project({ _id : 1,chats: 1 }).toArray();
			client.close();
			resolve(docs);
		} catch(err) {
			console.log(err);
		}
	});
}

const getGroupInfo = async(id) => {
	const dbName = process.env.DATABASE_NAME;

	// Create a new MongoClient
	const client = new MongoClient(process.env.CONNECTION_URL,{
		useUnifiedTopology: true
	});

	try {
		await client.connect();
	    const db = client.db(dbName);
	    const col = db.collection("groups");
		const docs = await col.find({unique_id:id}).project({ _id : 1,group_name : 1,original_password : 1 }).toArray();
		client.close();
		return docs;
	} catch(err) {
		console.log(err);
	}
}

const storeMessage = async(socketId,message,user_id) => {
	return new Promise( async(resolve,reject) => {
		const dbName = process.env.DATABASE_NAME;

		// Create a new MongoClient
		const client = new MongoClient(process.env.CONNECTION_URL,{
			useUnifiedTopology: true
		});

		let res = {
			"status" : 0,
			"data" : {}
		}

		try {
			await client.connect();
		    const db = client.db(dbName);

		    let chat = {
	            "user_id" : user_id,
	            "message" : message,
	            "date" : new Date()
	        }
		    let resultUpdate = await db.collection("groups").updateOne(
				   { unique_id : socketId },
				   { $push: { chats : chat } }
  			);

  			if(resultUpdate.modifiedCount == 1) {
  				client.close();
  				res['status'] = 1;
  				res['data'] = chat;
  				resolve(res);
  			} else {
  				client.close();
  				resolve(res);
  			}
  			resolve(1);
		} catch(err) {
			console.log(err);
		}
	})
}

const validateUserAlreadyIngroup = async({user_id,id,...details}) => {
	const dbName = process.env.DATABASE_NAME;

	// Create a new MongoClient
	const client = new MongoClient(process.env.CONNECTION_URL,{
		useUnifiedTopology: true
	});

	try {
		await client.connect();
	    const db = client.db(dbName);
	    const col = db.collection("users");
		const docs = await col.find({
			_id:ObjectId(user_id),
			"groups" : "id"
		}).project({ _id : 1}).toArray();
		client.close();
		return docs;
	} catch(err) {
		console.log(err);
	}
}

const validateGroupExistsAndPushGroup = async({id,password,user_id,...details}) => {
	const dbName = process.env.DATABASE_NAME;

	// Create a new MongoClient
	const client = new MongoClient(process.env.CONNECTION_URL,{
		useUnifiedTopology: true
	});

	try {
		await client.connect();
	    const db = client.db(dbName);
	    const col = db.collection("groups");
		const docs = await col.find({
			unique_id : id,
			password : md5(password)
		}).project({ _id : 1}).toArray();
		if(docs.length != 0) {
			let resultUpdate = await db.collection("users").updateOne(
				   { _id : ObjectId(user_id) },
				   { $push: { groups : id } }
  			);

			console.log({ _id : ObjectId(user_id) });
			// console.log(resultUpdate);

  			if(resultUpdate.modifiedCount == 1){
  				client.close();
  				return 1;
  			} else {
  				client.close();
  				return 0;
  			}
		} else {
			client.close();
			return 2;
		}	
	} catch(err) {
		console.log(err);
	}
}

const updateGroup = async({ group_name,password,id }) => {

	const dbName = process.env.DATABASE_NAME;

	// Create a new MongoClient
	const client = new MongoClient(process.env.CONNECTION_URL,{
		useUnifiedTopology: true
	});

	let res = {
		"status" : 0,
		"data" : {}
	}

	try {
		await client.connect();
	    const db = client.db(dbName);

	    let updateObject = {
            "group_name" : group_name,
            "original_password" : password,
            "password" : md5(password)
        }
	    let resultUpdate = await db.collection("groups").updateOne(
			{ unique_id : id },
			{ $set: updateObject }
		);

		if(resultUpdate.modifiedCount == 1) {
				client.close();
				return 1;
		} else {
			client.close();
			return 0;
		}
		return 1;
	} catch(err) {
		console.log(err);
	}
}

module.exports = {
	addGroup,
	getUserGroups,
	getChat,
	storeMessage,
	getGroupInfo,
	validateUserAlreadyIngroup,
	validateGroupExistsAndPushGroup,
	updateGroup
}