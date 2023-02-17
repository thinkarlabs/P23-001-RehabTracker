var s1 = function(PoseStream) {
	let capture;
	let poseNet;
	let pose;
	let skeleton;
	let count = 0;
	let lastPose = "";
	let canvas;
	let buttonS;
	let recorder;
	let chunks = [];
	let recording_movement = [];
	let stream;
	let videoURL;
	let dist;
	let brain;
	let poseLabel = "";
	// Load PoseNet Model with ml5 wrapper
	let poseNetOptions = {
	  architecture: 'ResNet50',
	  outputStride: 32,
	  detectionType: 'single',
	  // inputResolution: 193,
	  inputResolution: 161
	  }
	PoseStream.setup = function() {
	  canvas = PoseStream.createCanvas(650,440);
	  capture = PoseStream.createCapture(PoseStream.VIDEO)
	  capture.elt.style = "display:block";
	  capture.hide();
	  //capture.elt.style = "display:block";
	  poseNet = ml5.poseNet(capture,poseNetOptions,PoseStream.modelLoaded);
	  poseNet.on('pose', PoseStream.gotPoses);
	  buttonS = document.getElementById('mybutton');
	  buttonS.addEventListener("click",PoseStream.record);
	  PoseStream.armsUp();
	}
	PoseStream.record = function() {
    chunks.length = 0;
	//Standind_HipY = false;
	//Total_Squats=0;
    stream = document.querySelector('canvas').captureStream(30),
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


	PoseStream.gotPoses=function(poses) {
	  // console.log(poses);
	  if (poses.length > 0) {
		pose = poses[0].pose;
		skeleton = poses[0].skeleton;
	  }
	}

	PoseStream.modelLoaded=function() {
		console.log('poseNet ready');
	}

	PoseStream.armsUp =function(){
	  if (pose) {
		let confidenceThreshold = 0.3;
		let downHeightTolerance = 150;
		let upHeightTolerance = 70;
		let leftYDist;
		let rightYDist;
	  
		function jointDistEvaluate(joint1, joint2, confidenceThreshold){
		  let jointDist = null;
		  if (pose.keypoints[joint1].score >= confidenceThreshold && pose.keypoints[joint2].score >= confidenceThreshold) {
			jointDist = pose.keypoints[joint1].position.y - pose.keypoints[joint2].position.y;;
		  } 
		  return jointDist;
		}
		
		// distance between shoulders and wrists
		leftYDist = jointDistEvaluate(5, 9, confidenceThreshold);
		rightYDist = jointDistEvaluate(6, 10, confidenceThreshold);

		function classifyPose() {
		  if ((Math.abs(leftYDist) >= downHeightTolerance) && (Math.abs(rightYDist) >= downHeightTolerance)) {
			poseLabel = "DOWN";
		  }
		  else if ((Math.abs(leftYDist) <= upHeightTolerance) && (Math.abs(rightYDist) <= upHeightTolerance)) {
			poseLabel = "UP";
		  }
		  //console.log("poseLabel: " + poseLabel);
		  if (lastPose == "DOWN" && poseLabel == "UP") {
			//console.log("lastpose: "+lastPose);
			//console.log("current: " + poseLabel);
			//audio.play();
			if (bothHandsUp()) { // check if both hands are up
				count++;
			  }
			}
			lastPose =  poseLabel
		  }
		  
		  function bothHandsUp() {
			// return true if both hands are up, false otherwise
			return (Math.abs(leftYDist) <= upHeightTolerance) && (Math.abs(rightYDist) <= upHeightTolerance);
		  }

		classifyPose();

	  }
	  setTimeout(PoseStream.armsUp, 100);
	}
  


	PoseStream.draw=function() {
	  PoseStream.push();
	  PoseStream.translate(capture.width, 0);
	  PoseStream.scale(-1, 1);
	  PoseStream.image(capture, 0, 0, capture.width, capture.height);

	  if (pose) {
		for (let i = 0; i < skeleton.length; i++) {
		  let a = skeleton[i][0];
		  let b = skeleton[i][1];
		  // strokeWeight(2);
		  // stroke(0);
		  PoseStream.strokeWeight(1.5);
		  PoseStream.stroke(255,0,0);

		  PoseStream.line(a.position.x, a.position.y, b.position.x, b.position.y);
		}
		for (let i = 0; i < pose.keypoints.length; i++) {
		  let x = pose.keypoints[i].position.x;
		  let y = pose.keypoints[i].position.y;
		  // fill(0);
		  // stroke(255);
		  // ellipse(x, y, 16, 16);
		  PoseStream.fill(0, 0, 0);
		  PoseStream.ellipse(x, y, 10, 10);
		}
	  }
	  PoseStream.pop();

	  PoseStream.fill(255, 0, 255);
	  PoseStream.noStroke();
	  PoseStream.textSize(64);
	  PoseStream.textAlign(PoseStream.CENTER, PoseStream.CENTER);
	  PoseStream.text(count, 550, 370);
	  PoseStream.fill(51);
	  PoseStream.noStroke();
	  PoseStream.textSize(50);
	  PoseStream.textAlign(PoseStream.CENTER, PoseStream.CENTER);
	  PoseStream.text(poseLabel, 550, 415);
	}
};
new p5(s1);