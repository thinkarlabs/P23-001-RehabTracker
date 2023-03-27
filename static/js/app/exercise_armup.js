var s1 = function(PoseStream) {
	let capture;
	let poseNet;
	let poses;
	let pose;
	let skeleton;
	let skelt=true;
	let armCount = 0;
	let count =0;
	let lastPose = "";
	let canvas;
	let buttonS;
	let buttonC;
	let recorder;
	let chunks = [];
	let recording_movement = [];
	let stream;
	let videoURL;
	let dist;
	let brain;
	let poseLabel = "";
	let detectorConfig;
	let detector;
	let edges;
	let highlightBack = false;
	let stopped= false;
	let record_start =0
	// Load PoseNet Model with ml5 wrapper
	let poseNetOptions = {
	  architecture: 'ResNet50',
	  outputStride: 32,
	  detectionType: 'single',
	  // inputResolution: 193,
	  inputResolution: 161
	  }
	 PoseStream.init =async function() {
	  detectorConfig = {modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER };
	  detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);
	  edges = {
		'5,7': 'm',
		'7,9': 'm',
		'6,8': 'c',
		'8,10': 'c',
		'5,6': 'y',
		'5,11': 'm',
		'6,12': 'c',
		'11,12': 'y',
		'11,13': 'm',
		'13,15': 'm',
		'12,14': 'c',
		'14,16': 'c'
	  };
	  await PoseStream.gotPoses();
	}
	PoseStream.videoReady = async function() {
	  //console.log('video ready');
	}
	PoseStream.setup = async function() {
	  var msg = new SpeechSynthesisUtterance('Loading,Arm UP Tracking. please wait ...');
	  window.speechSynthesis.speak(msg);
	  canvas = PoseStream.createCanvas(650,440);
	  capture = PoseStream.createCapture(PoseStream.VIDEO);
	  capture.elt.style = "display:block";
	  capture.hide();
	  buttonS = document.getElementById('mybutton');
	  buttonS.addEventListener("click", PoseStream.record);
	  buttonC = document.getElementById('cbutton');
	  buttonC.addEventListener("click",PoseStream.stopCapture);
	  //buttonC.addEventListener("click",stopped=true);
	  await PoseStream.init();
	  PoseStream.armsUp();
	}
	PoseStream.stopCapture = function() {
		stopped = true;
		var code = '<form method="post" >' +
				'<input type="text" class="form-control" id="patientDetails" name="p_id" value="'+localStorage.getItem("current_patient")+'" hidden>'+
				'<input type="text" class="form-control" id="patientDetails" name="start" value="'+record_start+'" hidden>'+
				'<input type="text" class="form-control" id="patientDetails" name="exercise" value="armup" hidden>'+
				'<input type="text" class="form-control" id="patientDetails" name="end" value="'+new Date().getTime()+'" hidden>'+
				"<input type='text' class='form-control' id='patientDetails' name='poses' value='"+JSON.stringify(recording_movement)+"' hidden>"+
				'</form>' + 
		
			//alert("session started");
		capture.remove();
		x_post(code,'/addexercisesession','physio.session.new')
	}
	PoseStream.record = function() {
    chunks.length = 0;
	//Standind_HipY = false;
	armCount=0;
    stream = document.querySelector('canvas').captureStream(30),
    recorder = new MediaRecorder(stream);
    recorder.ondataavailable = function(e) {
      // Whenever data is available from the MediaRecorder put it in the array
      chunks.push(e.data);
	  //console.log(poses[0])
	  recording_movement.push(poses[0]);
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
      //PoseStream.saveJSON(recording_movement, 'Frame.json');
      //recording_movement = [];
    };
    recorder.start();
	record_start = new Date().getTime();
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


	PoseStream.gotPoses= async function() {
	  poses = await detector.estimatePoses(capture.elt);
	  //console.log(poses);
	  if (poses.length > 0) {
		pose = poses[0];
	  }
	  setTimeout(PoseStream.gotPoses, 0);
	}

	PoseStream.modelLoaded=function() {
		console.log('poseNet ready');
	}

    PoseStream.draw=function() {
	  PoseStream.background(220);
	  PoseStream.translate(PoseStream.width, 0);
	  if(poses && poses.length > 0){
		  PoseStream.scale(-1, 1);
		  PoseStream.image(capture, 0, 0, capture.width, capture.height);
		  // Draw keypoints and skeleton
		  PoseStream.drawKeypoints();
		  if (skelt) {
			PoseStream.drawSkeleton();
		  }
		  // Write text
		  PoseStream.fill(255);
		  PoseStream.strokeWeight(2);
		  PoseStream.stroke(51);
		  PoseStream.translate(PoseStream.width, 0);
		  PoseStream.scale(-1, 1);
		  PoseStream.textSize(15);

		  if (poses && poses.length > 0) {
			PoseStream.text("Position : "+poseLabel, 480, 60);
			PoseStream.fill([0, 255, 0]);
			PoseStream.text("Count : "+armCount, 480, 30);
			//if(count < 17){
				//PoseStream.fill([255, 0, 0]);
				//PoseStream.text("Whole body not visible! ", 200,30);
			//}
		  }
		  else {
			PoseStream.text('Loading, please wait...', 100, 90);
		  }
		  
		}
	}
	PoseStream.drawKeypoints=function() {
	  count = 0;
	  if (poses && poses.length > 0) {
		for (let kp of poses[0].keypoints) {
		  const { x, y, score } = kp;
		  if (score > 0.3) {
			count = count + 1;
			PoseStream.fill(255);
			PoseStream.stroke(0);
			PoseStream.strokeWeight(4);
			PoseStream.circle(x, y, 16);
		  }
		  if (count == 17) {
			//console.log('Whole body visible!');
		  }
		  else {
			//PoseStream.text("Whole body not visible!");
		  }
		  
		  
		}
		//PoseStream.armsUp();
	  }
	}
	PoseStream.drawSkeleton=function() {
	  confidence_threshold = 0.5;

	  if (poses && poses.length > 0) {
		for (const [key, value] of Object.entries(edges)) {
		  const p = key.split(",");
		  const p1 = p[0];
		  const p2 = p[1];

		  const y1 = poses[0].keypoints[p1].y;
		  const x1 = poses[0].keypoints[p1].x;
		  const c1 = poses[0].keypoints[p1].score;
		  const y2 = poses[0].keypoints[p2].y;
		  const x2 = poses[0].keypoints[p2].x;
		  const c2 = poses[0].keypoints[p2].score;
		  if ((c1 > confidence_threshold) && (c2 > confidence_threshold)) {
			if ((highlightBack == true) && ((p[1] == 11) || ((p[0] == 6) && (p[1] == 12)) || (p[1] == 13) || (p[0] == 12))) {
			  PoseStream.strokeWeight(3);
			  PoseStream.stroke(255, 0, 0);
			  PoseStream.line(x1, y1, x2, y2);
			}
			else {
			  PoseStream.strokeWeight(2);
			  PoseStream.stroke('rgb(0, 255, 0)');
			  PoseStream.line(x1, y1, x2, y2);
			}
		  }
		}
	  }
	}
	PoseStream.armsUp =function(){
	  if (pose) {
		//console.log("Inside Armup");
		let confidenceThreshold = 0.3;
		let downHeightTolerance = 150;
		let upHeightTolerance = 70;
		let leftYDist;
		let rightYDist;
	  
		function jointDistEvaluate(joint1, joint2, confidenceThreshold){
		  let jointDist = null;
		  if (pose.keypoints[joint1].score >= confidenceThreshold && pose.keypoints[joint2].score >= confidenceThreshold) {
			jointDist = pose.keypoints[joint1].y - pose.keypoints[joint2].y;
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
				armCount++;
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
};
new p5(s1);