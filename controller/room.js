const express = require('express');
const router  = express.Router();

const { addGroup,getUserGroups,updateGroup,alidateUserAlreadyIngroup , validateGroupExistsAndPushGroup } = require('../model/room');

router.post('/add' , async(req,res) => {
	let response = await addGroup(req.body);

	let responseObject = {
		"status" : 1,
		"message" : "Successfully group created",
		"data" : []
	}

	if(response == 0) {
		responseObject['status'] = 0;
		responseObject['message'] = "Failed to create group.";
	}
	res.json(responseObject);
});


router.post('/join_by_link' , async(req,res) => {
	let responseObject = {
		"status" : 0,
		"message" : "Yor already in thet group"
	}
	let response = await validateUserAlreadyIngroup(req.body);

	console.log(req.body);

	if(response.length != 0 ) {
		responseObject['status'] = 0;
		responseObject.send(responseObject)
	} else {
		let response = await validateGroupExistsAndPushGroup(req.body);
		if(response == 1) {
			responseObject = {
				"status" : 1,
				"message" : "You have successfully joined into the group"
			}		
		} else if(response == 0){
			responseObject = {
				"status" : 0,
				"message" : "Failed to join."
			}
		} else {
			responseObject = {
				"status" : 0,
				"message" : "Invalid group details."
			}
		}
	}
	res.json(responseObject);
});


router.post('/update', async(req,res) => {
	let response = await updateGroup(req.body);
	let responseObject = {
		"status" : 1,
		"message" : "Successfully group updated",
		"data" : []
	}
	if(response == 0) {
		responseObject['status'] = 0;
		responseObject['message'] = "Failed to update group.";
	}
	res.send(responseObject);
})

module.exports = router;