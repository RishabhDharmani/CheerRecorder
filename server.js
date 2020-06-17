const express = require('express');
const path = require('path');
const app = express();
const WebSocket = require('ws');
var count=0;

app.use(express.static("public"));

const port = 3000;
app.listen(port, () => {
  console.log(`listening http://localhost:${port}`);
});


const socketServer = new WebSocket.Server({port: 3030});

socketServer.on('connection', function(data){

	data.on('message', function(message){

		var bytearray = new Uint8Array(message);
		console.log(bytearray);
	});

	
});