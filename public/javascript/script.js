var userInfo = localStorage.getItem('user_details');
if(!userInfo) {
	window.location = "http://localhost:3000/login";
} else {
	userInfo = JSON.parse(userInfo);
	document.getElementById('user_name').innerHTML = "Welcome " + userInfo.user_name;
}


// Configuration array;
let config = {
	path: "/my_first_chat_application",
	query: {
			"user_name" : userInfo.user_name,
			"phone" : userInfo.phone_number,
			"_id" : userInfo._id
	}
};

// Socket instance
var socket = io("ws://localhost:3000", config);

var groupDetails = [];

// Util functions
const shareLink = (link) => {
	if (navigator.share) { 
    navigator.share({
      title: 'Share url',
      url: link
    }).then(() => {
       
    }).catch(console.error);
  } else {
      shareDialog.classList.add('is-open');
  }
}

const listContact = (contactList) => {

	document.getElementById('contacts').innerHTML = "";

	contactList.forEach( (contact) => {
		
			let container = document.createElement('div');
			container.style.cssText = "display : flex";

			// created_by: "60dc41195975eb08d04af89a"
			// name: "Friends 1998"
			// _id: "6425d7b3-0051-479b-ba69-2e4d2d230708"

		  let labelTag = document.createElement('label');
			labelTag.className = "btn btn-outline-secondary label";
			var name = contact.name;
		    labelTag.innerHTML = name;
		    labelTag.id = contact.unique_id;
		    labelTag.onclick = function () {
	    		getChat(contact.unique_id);
			};

		  container.appendChild(labelTag);

			if(contact.created_by == socket.id) {
			  let labelTag2 = document.createElement('label');
			  labelTag2.className = "share-button align-center";
			  labelTag2.innerHTML += '<svg fill="#000000" xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 24 24" width="24px" height="24px"><path d="M 18 2 C 16.35499 2 15 3.3549904 15 5 C 15 5.1909529 15.021791 5.3771224 15.056641 5.5585938 L 7.921875 9.7207031 C 7.3985399 9.2778539 6.7320771 9 6 9 C 4.3549904 9 3 10.35499 3 12 C 3 13.64501 4.3549904 15 6 15 C 6.7320771 15 7.3985399 14.722146 7.921875 14.279297 L 15.056641 18.439453 C 15.021555 18.621514 15 18.808386 15 19 C 15 20.64501 16.35499 22 18 22 C 19.64501 22 21 20.64501 21 19 C 21 17.35499 19.64501 16 18 16 C 17.26748 16 16.601593 16.279328 16.078125 16.722656 L 8.9433594 12.558594 C 8.9782095 12.377122 9 12.190953 9 12 C 9 11.809047 8.9782095 11.622878 8.9433594 11.441406 L 16.078125 7.2792969 C 16.60146 7.7221461 17.267923 8 18 8 C 19.64501 8 21 6.6450096 21 5 C 21 3.3549904 19.64501 2 18 2 z M 18 4 C 18.564129 4 19 4.4358706 19 5 C 19 5.5641294 18.564129 6 18 6 C 17.435871 6 17 5.5641294 17 5 C 17 4.4358706 17.435871 4 18 4 z M 6 11 C 6.5641294 11 7 11.435871 7 12 C 7 12.564129 6.5641294 13 6 13 C 5.4358706 13 5 12.564129 5 12 C 5 11.435871 5.4358706 11 6 11 z M 18 18 C 18.564129 18 19 18.435871 19 19 C 19 19.564129 18.564129 20 18 20 C 17.435871 20 17 19.564129 17 19 C 17 18.435871 17.435871 18 18 18 z"/></svg>';
		  	container.appendChild(labelTag2);
			  labelTag2.onclick = function () {
		    		shareLink('http://localhost:3000/join_by_link/'+contact.unique_id);
				};

				let labelTag3 = document.createElement('label');
			  labelTag3.className = "align-center";
			  labelTag3.innerHTML += '<?xml version="1.0"?><svg fill="#000000" xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 24 24" width="24px" height="24px">    <path d="M 18.414062 2 C 18.158062 2 17.902031 2.0979687 17.707031 2.2929688 L 15.707031 4.2929688 L 14.292969 5.7070312 L 3 17 L 3 21 L 7 21 L 21.707031 6.2929688 C 22.098031 5.9019687 22.098031 5.2689063 21.707031 4.8789062 L 19.121094 2.2929688 C 18.926094 2.0979687 18.670063 2 18.414062 2 z M 18.414062 4.4140625 L 19.585938 5.5859375 L 18.292969 6.8789062 L 17.121094 5.7070312 L 18.414062 4.4140625 z M 15.707031 7.1210938 L 16.878906 8.2929688 L 6.171875 19 L 5 19 L 5 17.828125 L 15.707031 7.1210938 z"/></svg>';
		  	container.appendChild(labelTag3);
			  labelTag3.onclick = function () {
		    		window.location.href = 'http://localhost:3000/edit_group/'+contact.unique_id;
				};


			  const shareDialog = document.querySelector('.share-dialog');
			  const closeButton = document.querySelector('.close-button');
			   		   
			  closeButton.addEventListener('click', event => {
			     shareDialog.classList.remove('is-open');
			  });
			}
			document.getElementById('contacts').appendChild(container);
	})
}

const displayMessage = (messages,id) => {

	if(document.getElementById("message_button_container")) {
		document.getElementById("message_button_container").remove();
	}

	/*
		HTML Format;

		<div class="input-group mb-3" style="margin: 0px 0px 5px 0px !important;position: sticky;bottom: 0px;">
		  	<input style="padding: 10px 12px" id="message" type="text" class="form-control" placeholder="Type...">
		  	<button class="btn btn-primary" type="button" id="send_message">Send</button>
		</div>
	*/

	messages.forEach( (message) => {

		const messageContainer = document.createElement('div');
		const messageText = document.createElement('p');
		const dateText = document.createElement('small');

		if(message.user_id == socket.id) {
			messageContainer.className = "my_chat"
		} else {
			messageContainer.className = "other_chat"
		}

		messageText.innerHTML = message.message;
		messageText.id = message._id;

		var date = new Date(message.date).toString().split(' ').slice(0,5).join(' ');
		dateText.innerHTML = date;

		messageContainer.appendChild(messageText);
		messageContainer.appendChild(dateText);

		document.getElementById('message_container').appendChild(messageContainer);
	})

	const messageButtonContainer = document.createElement('div');
	messageButtonContainer.className = "input-group mb-3";
	messageButtonContainer.id = "message_button_container";
	messageButtonContainer.style.cssText = "margin: 0px 0px 5px 0px !important;position: sticky;bottom: 0px;";

	const messageTypeer = document.createElement('input');
	messageTypeer.style.cssText = "padding: 10px 12px";
	messageTypeer.type = "text";
	messageTypeer.id = "message";
	messageTypeer.className = "form-control";
	messageTypeer.placeholder = "Type...";

	const messageSubmit = document.createElement('button');
	messageSubmit.className = "btn btn-primary";
	messageSubmit.type = "button";
	messageSubmit.id = "send_message";
	messageSubmit.innerHTML = "Send";


	messageButtonContainer.appendChild(messageTypeer);
	messageButtonContainer.appendChild(messageSubmit);

	document.getElementById('chat_container').appendChild(messageButtonContainer);

	document.getElementById('send_message').addEventListener('click', () => {
		const message = document.getElementById('message').value;
		sendMessage(message,id);
		document.getElementById('message').value = "";
	})
}

const changeheight = () => {
	let div = document.getElementById('message_container');
	div.lastElementChild.scrollIntoView({ behavior: 'smooth' });
}

const getChat = (id) => {
	document.getElementById('message_container').innerHTML = "";
	let currentGroup = localStorage.getItem('current_group');
	if(currentGroup == null) {
		localStorage.setItem('current_group',id);
	}
	if(socket.connected) {
		socket.emit("get_chat", id,userInfo.user_name,currentGroup, (response) => {
			// document.getElementById("chat_info_container").style.display = "none";
			// document.getElementById('chat_current_user').innerHTML = name;
			localStorage.setItem('current_group',id);
			displayMessage(response.data[0].chats,id);
			changeheight();
		});
	} else {
		console.log("Failed to get chat");
	}
}

const sendMessage = (message,id) => {
	if(message !== "" && id !== "") {	
		socket.emit('Send message', id,message,userInfo._id,(response) => {
			console.log(response);		
		});
	}
}

// Connect event;
socket.on("connect", () => {
	if(socket.connected) {	
		const userDeails = {
			"user_name" : userInfo.user_name,
			"phone" : userInfo.phone_number,
			"user_id" : socket.id
		}
		// get contact details
		socket.emit("get_contact", userDeails, (response) => {
			groupDetails = response.data[0].groups ?? [];
			listContact(groupDetails);
		});
	} else {
		console.log("Failed to connect");
	}
});

// listening new user
socket.on("new_user", (arg) => {
  	const messageContainer = document.createElement('div');
		const messageText = document.createElement('p');
		const dateText = document.createElement('small');

		messageContainer.className = "new_user"

		messageText.innerHTML = arg.message;

		var date = new Date().toString().split(' ').slice(0,5).join(' ');
		dateText.innerHTML = date;

		messageContainer.appendChild(messageText);
		messageContainer.appendChild(dateText);

		document.getElementById('message_container').appendChild(messageContainer);
		changeheight();
});

socket.on('new_message' , (chat) => {
		const messageContainer = document.createElement('div');
		const messageText = document.createElement('p');
		const dateText = document.createElement('small');

		if(chat.data.user_id == socket.id) {
			messageContainer.className = "my_chat"
		} else {
			messageContainer.className = "other_chat"
		}

		messageText.innerHTML = chat.data.message;

		var date = new Date(chat.data.date).toString().split(' ').slice(0,5).join(' ');
		dateText.innerHTML = date;

		messageContainer.appendChild(messageText);
		messageContainer.appendChild(dateText);

		document.getElementById('message_container').appendChild(messageContainer);

		changeheight();
})

// Listening disconnect event;
socket.on("disconnect", (reason) => {
  console.log(reason);
});

