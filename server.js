

const express = require('express');							// for using express framework
const path = require('path');								// for working with directories and paths
const WebSocket = require('ws');							// for websocket connections
const https = require('https');								// for https connection
const fs = require('fs');								// for reading ssl certificate files

const app = express();									// app variable for using express
const port = 8000;									// defining port		


//credentials of ssl cert
const options = {
	key: fs.readFileSync('security/key.pem'),
	cert: fs.readFileSync('security/cert.pem'),
  	rejectUnauthorized: false
};

//defining the static files folder
app.use(express.static("docs"));			

//defining https server using credentials and app
var httpsServer = https.createServer(options, app);

//checking fo connection success
app.get('/', (req, res) => { res.send('this is a secure server') });
httpsServer.listen(port, () => {
  console.log(`listening https://localhost:${port}`);
});

const socketServer = new WebSocket.Server({server: httpsServer}); 			// socket server for recieving from client

// server recieves when connection is made 
socketServer.on('connection', function(data){

	data.on('message', function(message){

		//variable to store arrays of data recieved
		var bytearray = new Uint8Array(message);
		//console.log(bytearray);
	});	
});
