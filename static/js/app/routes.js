let x_routes = {
  //"route": {x_api: "", x_page:"", x_div:"",x_code:""}
  "web.login": {x_page:"./static/pages/login.htm?v0.01"},
  "physio.injuries": {x_api : "/static/data/injuries.txt?v3",x_page:"./static/pages/physio/injuries.htm?v1",x_code:"/static/pages/physio/injuries.js"},
  "physio.injury.new": {x_api : "/static/data/exercises.txt?v1a",x_page:"./static/pages/physio/injury.htm"},
  "physio.sessions": {x_page:"./static/pages/physio/sessions.htm"},
  "physio.session.list": {x_api : "/static/data/schedule.txt",x_div:"ses_det",x_page:"./static/pages/physio/session_det.htm?v0.01"},
  "physio.session.new": {x_api : "/static/data/exercises.txt?v1a",x_page:"./static/pages/physio/session.htm?v0.01"},
  "physio.session.track": {x_page:"./static/pages/physio/track.htm?v0.01",x_code:"/static/js/app/script4.js"},
  "physio.session.track.squats": {x_page:"./static/pages/physio/track.htm?v0.01",x_code:"/static/js/app/squats.js"},
  "physio.session.track.shoulder": {x_page:"./static/pages/physio/track.htm?v0.01",x_code:"/static/js/app/exercise_armup.js"},
  "physio.session.track.kneelift": {x_page:"./static/pages/physio/track.htm?v0.01",x_code:"/static/js/app/kneelift.js"},
  "physio.patients": {x_api : "/patient",x_page:"./static/pages/physio/patients.htm?v0.01"},
  "physio.patient.new": {x_page:"./static/pages/physio/patient.htm"},
  "physio.patient.edit": {x_api : "/patients",x_page:"./static/pages/physio/patientedit.htm"},
  "physio.exercises": {x_api : "/static/data/exercises.txt?v1a", x_page:"./static/pages/physio/exercises.htm"},
  "physio.exercise.new": {x_page:"./static/pages/admin/contest.htm"}
}

let x_actions = {
  "web.login": {x_act:"post",x_do:"/user/login",x_go:"physio.sessions"},
  "web.logout": {x_act:"post",x_do:"/user/logout",x_go:"web.login"},
  "web.patientD":{x_act:"del",x_do:"/patient",x_go:"physio.patients"},
  "web.patientA":{x_act:"post",x_do:"/patient",x_go:"physio.patients"},
  "web.patientE":{x_act:"post",x_do:"/editpatient",x_go:"physio.patients"}
  
}
	
