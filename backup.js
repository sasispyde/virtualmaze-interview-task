const getClient = () => {
	console.log("cc"); 
	client.exists(clientPhoneNumber, (err, reply) => {
		if (reply === 1) {
			client.get(clientPhoneNumber, (err,clientDetails) => {
				if(clientDetails) {
					console.log(clientDetails);
					clientDetails = JSON.parse(clientDetails);
					socket.id = clientDetails.socket_id;
				} else if(err){
					console.error(err.message ?? "Failed to connect REDIS server.");
				}
			})
		} else {
			// fr2IHj-MImN6RWZLAAAA
			const clientDetails = {
				"socket_id" : socket.id,
				"user_name" : clientUserName,
				"phone_number" : clientPhoneNumber
			};
			client.set(clientPhoneNumber, JSON.stringify(clientDetails));
		}
	});
}