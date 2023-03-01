var s1 = function(PoseStream) {
 let capture;
 let posenet;
 let noseX, noseY;
 let singlePose;
 let skeleton=true;
 let pics;
 let buttonS;
 let buttonC;
 let canvas
 let recorder
 let chunks = [];
 let recording_movement = [];
 let stream;
 let videoURL;
 let PartXY = false;
 let posi = "Down"
 let playing = false;
 let Total_Squats=0;
 let detectorConfig;
 let detector;
 let edges;
 let highlightBack = false;
 let poses;
 let RkneeFlexion=0;
 let LkneeFlexion=0;
 let HipDown;
 let kneem;
 let getcurTime =  new Date();
 let Prevtime = getcurTime.getTime();
 let distanceHipAnkle=0;
 let count =0;
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
	  await PoseStream.receivedPoses();
	}
	PoseStream.videoReady = async function() {
	  //console.log('video ready');
	}
 PoseStream.setup = async function() {
	var msg = new SpeechSynthesisUtterance('Loading,Squats Tracking. please wait...');
	window.speechSynthesis.speak(msg);
	canvas = PoseStream.createCanvas(650,440);
    capture = PoseStream.createCapture(PoseStream.VIDEO,PoseStream.videoReady)
	//capture = PoseStream.createVideo('static/data/videoplayback.mp4');
	capture.elt.style = "display:block";
	//capture.loop();
    capture.hide();
    //posenet = ml5.poseNet(capture, PoseStream.modelLoaded);
    //posenet.on('pose', PoseStream.receivedPoses);
	buttonS = document.getElementById('mybutton');
	buttonS.addEventListener("click", PoseStream.record);
	buttonC = document.getElementById('cbutton');
	buttonC.addEventListener("click",PoseStream.stopCapture);
	await PoseStream.init();
	PoseStream.Squats();
  }
  PoseStream.stopCapture = function() {
		capture.remove();
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
	Total_Squats=0;
    stream = document.querySelector('canvas').captureStream(30);
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
  PoseStream.receivedPoses = async function() {
	poses = await detector.estimatePoses(capture.elt);
	setTimeout(PoseStream.receivedPoses, 0);
  }
  PoseStream.modelLoaded = function() {
    console.log('Model has loaded');
  }
  PoseStream.SaveMyJson = function() {
    PoseStream.saveJSON(singlePose, 'Frame.json')
    PoseStream.saveCanvas(canvas, 'myCanvas', 'jpg');
    pics = canvas.get();
  }
  
 PoseStream.draw=function() {
	  PoseStream.background(220);
	  PoseStream.translate(PoseStream.width, 0);
	  if(poses && poses.length > 0){
		  PoseStream.scale(-1, 1);
		  PoseStream.image(capture, 0, 0, capture.width, capture.height);
		  // Draw keypoints and skeleton
		  PoseStream.drawKeypoints();
		  if (skeleton) {
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
			PoseStream.text("LeftKnee : "+Math.round(LkneeFlexion)+ '°', 25, 30);
			PoseStream.text("RightKnee : "+Math.round(RkneeFlexion)+ '°', 25, 60);
			PoseStream.text("Dist Hip-Ankle : "+Math.round(distanceHipAnkle), 480, 60);
			PoseStream.fill([0, 255, 0]);
			PoseStream.text("Completed Suqats : "+Total_Squats, 480, 30);
			if(count < 17){
				PoseStream.fill([255, 0, 0]);
				PoseStream.text("Whole body not visible! ", 200,30);
			}
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
			PoseStream.kneeFlex();
		  }
		  else {
			//PoseStream.text("Whole body not visible!");
		  }
		  
		}
	  }
	}

// Draws lines between the keypoints
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
	PoseStream.kneeFlex=function(){
		var lknee = poses[0].keypoints[13];
		var lhip = poses[0].keypoints[11];
		var lankle = poses[0].keypoints[15];
		var rknee = poses[0].keypoints[14];
		var rhip = poses[0].keypoints[12];
		var rankle = poses[0].keypoints[16];
		/*LkneeFlexion = (
		  Math.atan2(
			lankle.y - lknee.y,
			lankle.x - lknee.x
		  )
		  - Math.atan2(
			lhip.y - lknee.y,
			lhip.x - lknee.x
		  )
		) * (180 / Math.PI);*/
		var la = Math.sqrt(
			Math.pow(lknee.x - lhip.x, 2) + 
			Math.pow(lknee.y - lhip.y, 2)
		  ); // length of thigh segment
		  
		var lb = Math.sqrt(
			Math.pow(lankle.x - lknee.x, 2) + 
			Math.pow(lankle.y - lknee.y, 2)
		  ); // length of lower leg segment
		  
		var lc = Math.sqrt(
			Math.pow(lankle.x - lhip.x, 2) + 
			Math.pow(lankle.y - lhip.y, 2)
		  );
		  var lcosAngle = (Math.pow(la, 2) + Math.pow(lb, 2) - Math.pow(lc, 2)) / (2 * la * lb);
		  LkneeFlexion = (Math.acos(lcosAngle) * 180 / Math.PI);
		
		var a = Math.sqrt(
			Math.pow(rknee.x - rhip.x, 2) + 
			Math.pow(rknee.y - rhip.y, 2)
		  ); // length of thigh segment
		  
		  var b = Math.sqrt(
			Math.pow(rankle.x - rknee.x, 2) + 
			Math.pow(rankle.y - rknee.y, 2)
		  ); // length of lower leg segment
		  
		  var c = Math.sqrt(
			Math.pow(rankle.x - rhip.x, 2) + 
			Math.pow(rankle.y - rhip.y, 2)
		  ); // length of hypotenuse segment
		  
		  var cosAngle = (Math.pow(a, 2) + Math.pow(b, 2) - Math.pow(c, 2)) / (2 * a * b);
		  RkneeFlexion = (Math.acos(cosAngle) * 180 / Math.PI);
		  var hipmid = [ (lhip.x + rhip.x)/2 , (lhip.y + rhip.y)/2];
		  var ancmid = [ (lankle.x + rankle.x)/2 , (lankle.y + rankle.y)/2];
		  var xDelta = hipmid[0]-ancmid[0];
		  var yDelta = hipmid[1]-ancmid[1];
		  distanceHipAnkle = Math.sqrt( xDelta*xDelta + yDelta*yDelta );
	}
	PoseStream.Squats=function(){
		if (poses && poses.length > 0 && count==17) 
		{
			if ((Math.round(LkneeFlexion) < 100 && Math.round(RkneeFlexion)<100) || (poses[0].keypoints[11].y+10>=poses[0].keypoints[13].y && poses[0].keypoints[12].y+10>=poses[0].keypoints[14].y) || distanceHipAnkle<105 ) {
				HipDown = true;
				//console.log(poses[0].keypoints[11].y,poses[0].keypoints[13].y);
				kneem = "Up";
			  }
			if (Math.round(LkneeFlexion)>170 && Math.round(RkneeFlexion)>170 && distanceHipAnkle>160) {
				if (HipDown && (Math.abs(Prevtime - (new Date().getTime())) / 1000)>1) {
					var now = new Date();
					//console.log(Prevtime ,new Date().getTime());
					Total_Squats = Total_Squats + 1;
					HipDown = false;
					kneem = "Down";
					Prevtime = now.getTime();
				}
			}
		
		}

		  setTimeout(PoseStream.Squats, 100);
		}

};
new p5(s1);

