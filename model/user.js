const MongoClient = require('mongodb').MongoClient;
var md5 = require('md5');

const addUser = async({user_name,password,phone_number,...userDetails}) => {
	const dbName = process.env.DATABASE_NAME;
	let res = {
		status : 1,
		data : []
	};

	// Create a new MongoClient
	const client = new MongoClient(process.env.CONNECTION_URL,{
		useUnifiedTopology: true
	});

	try {
	    await client.connect();
	    const db = client.db(dbName);
	    const col = db.collection("users");
	  	const docs = await col.find({phone_number:phone_number}).toArray();

	  	if(docs.length == 0 || true) {
	  		let user = {
	  			user_name,
	  			password : md5(password),
	  			phone_number,
	  			groups : [],
	  			status : "A"
	  		}
	  		let result = await col.insertOne(user);
	  		if(result.insertedCount == 1) {
	  			client.close();
	  			res['status'] = 1;
	  			res['data'] = result.ops ?? [];
	  			return res;
	  		} else {
	  			client.close();
	  			res['status'] = 0;
	  			return res;
	  		}
	  	} else {
	  		res['status'] = 2;
	  		return res;
	  	}
	} catch(err) {
	    console.log(err.stack);
	}
}

const userExists = async({password,phone_number,...userDetails}) => {
	password = md5(password);
	const dbName = process.env.DATABASE_NAME;

	// Create a new MongoClient
	const client = new MongoClient(process.env.CONNECTION_URL,{
		useUnifiedTopology: true
	});

	try {
	    await client.connect();
	    const db = client.db(dbName);
	    const col = db.collection("users");

	    let findObj = {
	  		phone_number:phone_number,
	  		password : password
	  	}
	  	const docs = await col.find(findObj).project({
	  		phone_number : 1,
	  		_id : 1,
	  		user_name : 1
	  	}).toArray();
	  	client.close();
	  	return docs;
	} catch(err) {
	    console.log(err.stack);
	}
}

module.exports = {
	addUser,
	userExists
}