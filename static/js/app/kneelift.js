setTimeout(() => {
	var s2= function(PoseStream) {
		//document.querySelectorAll('head > script')
		//.forEach(script => console.log(script.src));
		// console.log(document.getElementsByTagName('head')[0]);
		//document.head.querySelector('script[name="ContentScript"]').setAttribute("src", "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-core");
			//<script src="https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection"></script>
		let canvas;
		let detector;
		let detectorConfig;
		let poses;
		let pose;
		let prevPose = null;
		let videoURL;
		let capture;
		let skeleton = true;
		let recording_started=false;
		let model;
		let reps = 0;
		let lreps = 0;
		let highlightBack = false;
		let playing = false;
		let LKneeAboveHip=false;
		let RKneeAboveHip=false;
		let LkneeFlexion=0;
		let RkneeFlexion=0;
		let buttonS;
		let buttonC;
		let recorder
		let chunks = [];
		let recording_movement = []
		let stream;
		let kneem="";
		let count;
		let record_start =0
		PoseStream.init =async function() {
		  detectorConfig = {modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER };
		  //detectorConfig = {modelType: "SinglePose.Thunder" };
		  //console.log(poseDetection.SupportedModels.MoveNet);
		  //console.log(detectorConfig);
		  //detectorConfig = {modelType: loadLayersModel("https://tfhub.dev/google/tfjs-model/movenet/singlepose/thunder/4") };
		  detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);
		  //console.log(detector);
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
		  await PoseStream.getPoses();
		}
	
		PoseStream.videoReady = async function() {
		  //console.log('video ready');
		}
	
		PoseStream.setup = async function() {
		  var msg = new SpeechSynthesisUtterance('Loading, Knee Lift Tracking please wait...');
		  window.speechSynthesis.speak(msg);
		  canvas = PoseStream.createCanvas(650, 440);
		  capture = PoseStream.createCapture(PoseStream.VIDEO, PoseStream.videoReady);
		  capture.elt.style = "display:block";
		  //video = createVideo('knee4.mp4',videoReady);
		  //video.size(960, 720);
		  capture.hide()
		  buttonS = document.getElementById('mybutton');
		  buttonC = document.getElementById('cbutton');
		  buttonS.addEventListener("click", PoseStream.record);
		  buttonC.addEventListener("click",PoseStream.stopCapture);
		  await PoseStream.init();
		  PoseStream.KneeUp();
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
			capture.remove();
			// console.log("Poses are"+JSON.stringify(recording_movement))
			x_post(code,'/addexercisesession','physio.session.new')
		}
		PoseStream.getPoses=async function() {
		  poses = await detector.estimatePoses(capture.elt);
		  setTimeout(PoseStream.getPoses, 0);
		  //console.log(poses);
		}
		PoseStream.record = function() {
			chunks.length = 0;
			//Standind_HipY = false;
			reps=0;
			lreps=0;
			stream = document.querySelector('canvas').captureStream(30);
			recorder = new MediaRecorder(stream);
			recorder.ondataavailable = function(e) {
			  // Whenever data is available from the MediaRecorder put it in the array
			  chunks.push(e.data);
			};
			recorder.onstop = function(e) {
			  var viddiv = document.getElementById('right');
			  var video = document.getElementById('myvideo');
			//   console.log("length "+recording_movement.length)
			  if (video === null) {
				video1 = document.createElement('video');
				video.setAttribute('id', 'myvideo');
				video.style.width = "310px";
				viddiv.appendChild(video1);
				video.controls = true;
				recording_started=false;
			  }
			  // Create a blob - Binary Large Object of type video/webm
			  var blob = new Blob(chunks, { 'type': 'video/webm' });
			  // Generate a URL for the blob
			  videoURL = window.URL.createObjectURL(blob);
			  // Make the video element source point to that URL
			  video.src = videoURL;
			  //PoseStream.saveJSON(recording_movement, 'Frame.json');
			//   recording_movement = [];
			};
			recorder.start();
			document.getElementById("mybutton").style.display = "none";
			var pbutton = document.getElementById('pauser');
			recording_started=true;
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
					  document.getElementById("mybutton").style.display = "inline";
					  pbutton.style.display = 'none';
					  timer = 30;
				   }
				   recordTimer();
				}, 1000);
		}
		recordTimer();
	  }
	
		PoseStream.toggleVid=function() {
		  if (playing) {
			capture.pause();
			button.html('play');
		  } else {
			capture.loop();
			button.html('pause');
		  }
		  playing = !playing;
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
				PoseStream.text("L-Knee : "+Math.round(LkneeFlexion) + '°', 25,30);
				PoseStream.text("R-Knee : "+Math.round(RkneeFlexion) + '°', 25 ,60);
				//console.log("X",poses[0].keypoints[13].x);
				//let pushupString = `Left Knee completed: ${lreps}   Right Knee completed :${reps}`;
				//let flexString = `Left Knee Flexation: ${kneeFlexion}`
				PoseStream.fill([0, 255, 0]);
				PoseStream.text("L-count : "+lreps, 480, 30);
				PoseStream.text("R-count : "+reps,480, 60);
				PoseStream.text("Moving : "+kneem, 480, 90);
				if(count < 17){
					PoseStream.fill([255, 0, 0]);
					PoseStream.text("Whole body not visible! ", 230,30);
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
				//console.log('Not fully visible!');
			  }
			  //inUpPosition();
			  //inDownPosition();
			  
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
	
		PoseStream.KneeUp=function(){
			//console.log(poses,poses.length);
			if (poses.length > 0) {
				pose = poses[0];
				if (prevPose !== null && pose !== null && JSON.stringify(pose) !==JSON.stringify(prevPose) && recording_started==true){
					recording_movement.push(pose);
				}
				prevPose = pose;
			  }
			  setTimeout(PoseStream.gotPoses, 0);
	
			if (poses && poses.length > 0 && count==17) 
			{
				if ( Math.round(LkneeFlexion) < 70 && Math.round(RkneeFlexion )>150 && (poses[0].keypoints[15].y<poses[0].keypoints[16].y) ) {
					LKneeAboveHip = true;
					kneem = "LUp";
				  }
				if (Math.round(LkneeFlexion)>170) {
					if (LKneeAboveHip) {
						console.log(LkneeFlexion,"LDown");
						lreps = lreps + 1;
						LKneeAboveHip = false;
						kneem = "LDown";
					}
				}
				if ( Math.round(RkneeFlexion) < 70 && Math.round(LkneeFlexion )>150 && (poses[0].keypoints[15].y>poses[0].keypoints[16].y)) {
					//console.log(poses[0].keypoints[13].y,poses[0].keypoints[11].y,"check");
					//console.log(RkneeFlexion,"RUP",LkneeFlexion);
					RKneeAboveHip = true;
					kneem = "RUp";
				  }
				if (Math.round(RkneeFlexion)>170) {
					if (RKneeAboveHip) {
						//console.log(RkneeFlexion,"RDown");
						reps = reps + 1;
						RKneeAboveHip = false;
						kneem = "RDown";
					}
				}
			
			}
	
			  setTimeout(PoseStream.KneeUp, 100);
			}
	
		PoseStream.kneeFlex=function(){
			var lknee = poses[0].keypoints[13];
			var lhip = poses[0].keypoints[11];
			var lankle = poses[0].keypoints[15];
			var rknee = poses[0].keypoints[14];
			var rhip = poses[0].keypoints[12];
			var rankle = poses[0].keypoints[16];
			LkneeFlexion = (
			  Math.atan2(
				lankle.y - lknee.y,
				lankle.x - lknee.x
			  )
			  - Math.atan2(
				lhip.y - lknee.y,
				lhip.x - lknee.x
			  )
			) * (180 / Math.PI);
			
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
		}
	}
	new p5(s2);
	
	}, 2000);
	