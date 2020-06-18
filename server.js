

const express = require('express');					// for using express framework
const path = require('path');						// for working with directories and paths
const WebSocket = require('ws');					// for websocket connections

const app = express();							// app variable for using express
const port = 3000;							// defining port		
const socketServer = new WebSocket.Server({port: 3030});		// socket server for recieving from client

//defining the static files folder
app.use(express.static("docs"));			

//checking fo connection success
app.listen(port, () => {
  console.log(`listening http://localhost:${port}`);
});

// server recieves when connection is made 
socketServer.on('connection', function(data){

	data.on('message', function(message){

		//variable to store arrays of data recieved
		var bytearray = new Uint8Array(message);
		//console.log(bytearray);
	});	
});
