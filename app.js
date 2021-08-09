// Creating express app;
const express = require('express');
const uuid = require("uuid");
const url = require('url');
require('dotenv').config();
const { promisify } = require("util");
const app = express();


/* ****** Important stuffs ***** */
// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

// Static files
app.use(express.static('public'));
app.use('/images',express.static(__dirname + '/public/images'));
app.use('/socket.io',express.static(__dirname + '/node_modules/socket.io/client-dist/'));

// View engine
app.set('view engine', "ejs");


// Import Contollers
const userController = require('./controller/user');
const groupController = require('./controller/room');

// import model;
const { getUserGroups,getChat,storeMessage,getGroupInfo } = require('./model/room');

// use contoller
app.use('/user', userController);
app.use('/group', groupController);

// creating the socket.io server
const http = require('http');
const mainServer = http.createServer(app);
const { Server } = require('socket.io');

// Option for creating server;
const options = {
	path : "/my_first_chat_application"
}

// storing the connected users
const connectedUsers = [];
const alreadyConnectedUsers = {};

// Creating IO server;
const io = new Server(mainServer,options);

io.engine.generateId = (req) => {
	const uniqueId = uuid.v4();
  	return uniqueId;
}

// PORT Number;
const port = 3000 || process.env.PORT;

// Routing
app.get('/register', (req,res) => {
	res.render('user_details');
})

app.get('/login', (req,res) => {
	res.render('login');
})

app.get('/', (req,res) => {
	res.render('index');
})

app.get('/create_room', (req,res) => {
	res.render('createRoomNew');
})

app.get('/join_by_link/', async(req,res) => {
	res.redirect('/login');
})

app.get('/edit_group/', async(req,res) => {
	res.redirect('/login');
})

app.get('/edit_group/:id', async(req,res) => {

	console.log(req.params.id);

	if(req.params.id == ""){
		res.redirect('/login');
	}
	let groupInfo = await getGroupInfo(req.params.id);
	if(groupInfo.length == 0) {
		res.redirect('/login');
	}
	res.render('edit' , { "groupInfo" : groupInfo[0]});
})

app.get('/join_by_link/:id', async(req,res) => {
	if(req.params.id == ""){
		res.redirect('/login');
	}
	let groupInfo = await getGroupInfo(req.params.id);
	if(groupInfo.length == 0) {
		res.redirect('/login');
	}
	res.render('join_by_link' , { "groupInfo" : groupInfo[0]});
})

io.use((socket,next) => {

	var userDetails = socket.handshake.query;
	var clientPhoneNumber = userDetails.phone ?? "";
	var clientUserName 	= userDetails.user_name ?? "";
	var _id 	= userDetails._id ?? "";

	socket.id = _id;

	next();
})

// creating Socket.IO connection;
io.on('connection' , (socket) => {

	// Disconnect
	socket.on("disconnect", (reason) => {
		console.log(`user disconnected because of ${reason}`);
	});

	// get contact details
	socket.on('get_contact', async (userDetails,callback) => {
		
		if(userDetails && userDetails.user_id !== undefined) {
			let groups = await getUserGroups(userDetails.user_id);
			callback({
				data : groups
			})
		} else {
			callback({
				data : []
			})
		}
	})

	socket.on('get_chat', async (socketId,user_name,currentGroup,callback) => {
		if(socketId !== undefined) {
			let chats = await getChat(socketId);
			socket.leave(currentGroup);
			socket.join(socketId);
			io.to(socketId).emit('new_user', {
				"name" : user_name,
				"message" : `welcome ${user_name}`
			});
			callback({
				data : chats
			})
		} else {
			callback({
				data : []
			})
		}
	})

	socket.on('Send message' , async(socketId,message,user_id,callback) => {
		if(socketId !== undefined) {
			let chatInsert = await storeMessage(socketId,message,user_id);

			if(chatInsert['status'] == 1) {
				io.to(socketId).emit('new_message', {
					data : chatInsert['data']
				});	
			} else {
				callback({
					status : 0,
					data : []
				})
			}
		} else {
			callback({
				data : []
			})	
		}
	})

	console.log("User connected");
});


// ( !module.parent ) This code is run only when we call node currentFile.js other wide it won't listen;
if(!module.parent) {
	mainServer.listen(port , () => {
		console.log(`Server is listening at port : ${port}`);
	})
}