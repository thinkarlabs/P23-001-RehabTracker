var session = function(){
	var pinput,sinput
	pinput = document.getElementById("patientDetails");
	if (pinput) {
		localStorage.setItem("current_patient",pinput.value);
	} else {
		console.log("Element does not exist");
	}
	sinput = document.getElementById("newsession");
	if(sinput){
		sinput.addEventListener("click", add_session);
		function add_session(){
			x_get('/addsession/'+localStorage.getItem("current_patient"),'');
		}
	}
	
}
session();