

//////////////////////// Global Variables for Functions /////////////////////////////

var gumStream; 						//stream from getUserMedia()
var input;						//MediaStreamAudioSourceNode we'll be recording
var bufferLength;					//Number of frequency bins
var dataArray = [];					//Stores all the frequency data of all frames 					
var pause;						//Start and stop audio frame collection
var jsonStoring;					//Store and send as JSON object
var websocket;						// Variable for websocket connection


////////////////////////// AudioContext variables //////////////////////////////////

var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext; //audio context to help us record
var analyser;	  //analyser for getting frequency data	

////////////////// Assign buttons to respective variables /////////////////////////

var recordButton = document.getElementById("recordButton");
var stopButton = document.getElementById("stopButton");
var pauseButton = document.getElementById("pauseButton");

////////////////////// Add events to those 3 buttons //////////////////////////////

recordButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", stopRecording);
pauseButton.addEventListener("click", pauseRecording);

////////////////////// Start Recording Function //////////////////////////////////

function startRecording() {

	console.log("recordButton clicked");
    
    	//Simple constraints object
	var constraints = { audio: true, video:false }

    	//Disable the record button until we get a success or fail from getUserMedia()
	recordButton.disabled = true;
	stopButton.disabled = false;
	pauseButton.disabled = false;

    	//Using the standard promise based getUserMedia()
	navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {

		console.log("getUserMedia() success");

		/*
			create an audio context after getUserMedia is called
			create analyser node for frequency data collection
		*/
		audioContext = new AudioContext();
		analyser = audioContext.createAnalyser();

		//assign to gumStream for later use
		gumStream = stream;

		//define variable as a websocket
		websocket = new WebSocket("wss://localhost:3030");

		//use the stream
		input = audioContext.createMediaStreamSource(stream);

		//connecting input to analyser node
		input.connect(analyser);

		/*
			frequency will be collected using fast fourier transform for every frame
			set the size of bins for collecting frequency
			the total bins are half the fft size
			bufferLength is the total bins
		*/
		analyser.fftSize = 1024;
		bufferLength = analyser.frequencyBinCount;

		/*	
			start collection of frequency data of frames
			start the visualizer 
		*/	
		pause = false;
		frameLooper();

		console.log("Recording started");
	})
}

/////////////// Record frequency data, Calling visualizer function ///////////////

function frameLooper(){

	//if paused/stopped will not collect data
	if(pause) return;

	//start taking frames as inputs		
	window.requestAnimationFrame(frameLooper);

	//array to store frequency data of each frame
	fbc_array = new Uint8Array(analyser.frequencyBinCount);
	analyser.getByteFrequencyData(fbc_array);

	//check if websocket is connected
	if (websocket.readyState === WebSocket.OPEN){

      	//sending each audio frame array as a buffer through websockets
		websocket.send(fbc_array.buffer);
   }

	//creating the visualizer
	visualizer(fbc_array);
}

////////////////////// Pause and Resume function /////////////////////////////////

function pauseRecording(){
	console.log("pauseButton clicked rec.recording=");
	if (pause ===false){
		//pause
		pauseButton.innerHTML="Resume";
		pause = true;
	}
	else{
		//resume
		pauseButton.innerHTML="Pause";
		pause= false;
		frameLooper();
	}
}

////////////////////// Stop Recording and Store Data /////////////////////////////

function stopRecording() {
	console.log("stopButton clicked");

	//disable the stop button, enable the record to allow for new recordings
	stopButton.disabled = true;
	recordButton.disabled = false;
	pauseButton.disabled = true;

	//reset button just in case the recording is stopped while paused
	pauseButton.innerHTML="Pause";

	//pause the input of audio frames and visualizer
	pause = true;


	//stop microphone access
	gumStream.getAudioTracks()[0].stop();

	//close the websocket connection
	if (websocket.readyState === WebSocket.OPEN){

    	websocket.close( );
    	console.log("Websocket Closed");
   }
}


// ///////////////////////// Visualizer Function ///////////////////////////////////

function visualizer(fbc_array){

	// Taking Canvas for applying visualizer
	var canvas = document.getElementById("slide");
	var ctx = canvas.getContext("2d");

	//defines the width and height of the visualizer
	var WIDTH = canvas.width;
   	var HEIGHT = canvas.height;

   	//define width and height of each bar of frequency
   	var barWidth = (WIDTH/bufferLength);
   	var barHeight;
   	var x = 0;

   	//initial colour black
   	ctx.fillStyle = "#000";
   	ctx.fillRect(0, 0, WIDTH, HEIGHT);

   	//loop for each frequency bar height
    for (var i = 0; i < bufferLength; i++) {
	    barHeight = fbc_array[i];
        
        //applying different shades of colors to bars to make it look better
    	var r = barHeight + (25 * (i/bufferLength));
        var g = 250 * (i/bufferLength);
        var b = 50;

        //filling according to set colors
        ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
        ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

        x += barWidth;
      }
}
