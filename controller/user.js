const express = require('express');
const router  = express.Router();

const { addUser,userExists } = require('../model/user');

router.post('/add' , async(req,res) => {
	let response = await addUser(req.body);

	let responseObject = {
		"status" : 1,
		"message" : "Failed to insert",
		"data" : []
	}

	if(response.status == 0) {
		responseObject['status'] = 0;
	} else if(response.status == 2) {
		responseObject['status'] = 2;
		responseObject['message'] = "User already exists";
	} else {
		responseObject['message'] = "User successfully registered";
		let data = {
			user_name : response.data[0].user_name,
			phone_number : response.data[0].phone_number,
			_id : response.data[0]._id
		}
		responseObject['data'] = data;
	}
	res.json(responseObject);
});


router.post('/login' , async(req,res) => {
	let response = await userExists(req.body);

	let responseObject = {
		"status" : 1,
		"message" : "Failed to insert",
		"data" : []
	}

	if(response.length == 0) {
		responseObject['status'] = 0;
		responseObject['message'] = "Invalid login details.";
	} else {
		responseObject['status'] = 1;
		responseObject['message'] = "User successfully loged in.";
		responseObject['data'] = response[0];
	}
	res.json(responseObject);
});

module.exports = router;