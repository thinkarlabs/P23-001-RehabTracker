let capture;
let posenet;
let noseX, noseY;
let singlePose, skeleton;
let pics;
let buttonS;
let canvas
let recorder
let chunks = [];
let recording_movement = []
let stream;
let videoURL;
let PartXY = false;
let Standind_HipY = false;
let posi = "Down"
let playing = false;
let Total_Squats=0;
var s1 = function(PoseStream) {
 PoseStream.setup = function() {
	canvas = PoseStream.createCanvas(650,440);
    capture = PoseStream.createCapture(PoseStream.VIDEO)
	//capture = PoseStream.createVideo('static/data/videoplayback.mp4');
	capture.elt.style = "display:block";
	capture.loop();
    capture.hide();
    posenet = ml5.poseNet(capture, PoseStream.modelLoaded);
    posenet.on('pose', PoseStream.receivedPoses);
	buttonS = document.getElementById('mybutton');
	buttonS.addEventListener("click", PoseStream.record);
  }
  PoseStream.toggleVid = function() {
  if (playing) {
    capture.pause();
    button.html('play');
  } else {
    capture.loop();
    button.html('pause');
  }
  playing = !playing;
}
  PoseStream.record = function() {
    chunks.length = 0;
	Standind_HipY = false;
	Total_Squats=0;
    let stream = document.querySelector('canvas').captureStream(30),
    recorder = new MediaRecorder(stream);
    recorder.ondataavailable = function(e) {
      // Whenever data is available from the MediaRecorder put it in the array
      chunks.push(e.data);
    };
    recorder.onstop = function(e) {
      var viddiv = document.getElementById('right');
      var video = document.getElementById('myvideo');
      if (video === null) {
        video = document.createElement('video');
        video.setAttribute('id', 'myvideo');
        video.style.width = "310px";
        viddiv.appendChild(video);
        video.controls = true;
      }
      // Create a blob - Binary Large Object of type video/webm
      var blob = new Blob(chunks, { 'type': 'video/webm' });
      // Generate a URL for the blob
      videoURL = window.URL.createObjectURL(blob);
      // Make the video element source point to that URL
      video.src = videoURL;
      PoseStream.saveJSON(recording_movement, 'Frame.json');
      recording_movement = [];
    };
    recorder.start();
    PartXY = true;
	document.getElementById("mybutton").style.display = "none";
	var pbutton = document.getElementById('pauser');
	pbutton.style.display = 'inline';
	pbutton.addEventListener("click", (event) => {
		if (recorder.state === "recording") {
			recorder.pause();
			document.getElementById("pauser").innerHTML = "Resume"
		  } else if (recorder.state === "paused") {
			recorder.resume();
			document.getElementById("pauser").innerHTML = "Pause"
		  }
	});
	var timer = 15;
	function recordTimer(){
		setTimeout(function(){
		   if (recorder.state === "recording") {
		      timer--;
			  //console.log(timer)
		   }
		   if(timer==0){
			  recorder.stop();
			  PartXY = false;
			  document.getElementById("mybutton").style.display = "inline";
			  pbutton.style.display = 'none';
			  timer = 30;
		   }
		   recordTimer();
		}, 1000);
	}
	recordTimer();
  }
  PoseStream.receivedPoses = function(poses) {
    if (poses.length > 0) {
      singlePose = poses[0].pose;
      skeleton = poses[0].skeleton;
	  if (Standind_HipY === false){
		  Standind_HipY = singlePose["leftHip"]['y']
	  }
	  if((Standind_HipY+40)<=singlePose["leftHip"]['y'] && posi === "Down" ){
		  posi = "UP"
	  }
	  if (posi === "UP" && singlePose["leftHip"]['y'] <= (Standind_HipY+3)){
		  posi = "Down"
		  Total_Squats = Total_Squats+1
	  }
	  var distance = singlePose["rightAnkle"]['x']-singlePose["leftAnkle"]['x']
    }
  }
  PoseStream.modelLoaded = function() {
    console.log('Model has loaded');
  }
  PoseStream.SaveMyJson = function() {
    PoseStream.saveJSON(singlePose, 'Frame.json')
    PoseStream.saveCanvas(canvas, 'myCanvas', 'jpg');
    pics = canvas.get();
  }
  PoseStream.draw = function() {
    // images and videos(webcam)
    PoseStream.image(capture, 0, 0);
    PoseStream.fill(280, 0, 0);

    if (singlePose) {
      for (let i = 0; i < singlePose.keypoints.length; i++) {
        PoseStream.ellipse(singlePose.keypoints[i].position.x, singlePose.keypoints[i].position.y, 20);
      }
      PoseStream.stroke(255, 255, 255);
      PoseStream.strokeWeight(5);
	  PoseStream.text("Completed_Suqats :"+Total_Squats, 100, 90);
      for (let j = 0; j < skeleton.length; j++) {
        PoseStream.line(skeleton[j][0].position.x, skeleton[j][0].position.y, skeleton[j][1].position.x, skeleton[j][1].position.y)
      }
    }
  }

};
new p5(s1);
