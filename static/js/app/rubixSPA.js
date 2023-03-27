var debugLevel = 2; //1,2,3,4,5.

function bind_events(){
	$("[data-do]").on('click', function(e) {
		x_do($(this).data('do'), $(this).data('form'));		
	});

	$("[data-nav]").on('click', function(e) {
		x_nav($(this).data('nav'));		
	});
}

function x_nav(_route){
	//If a route key is valid, add to history and load the route.
	routeKey = _route.split('?')[0]
	if (x_routes[routeKey] === undefined){x_log('Invalid Route..',1); return;}
	history.pushState(_route, "", "");
	x_load(_route);
}

function x_load(_url,_formname){
	//A RouteKey can have an an x-api to call, x-page to render,x-event to raise and a x-div to load page to.
	routeKey = _url.split('?')[0]
	params = _url.split('?')[1]
	if (x_routes[routeKey].x_api !== undefined){
		var api_url = x_routes[routeKey].x_api
		if (params !== undefined) {api_url += '?' + params}
		
		x_log(api_url,1);
		if (api_url === '/patient' || x_routes[routeKey].x_api==='/patients' || x_routes[routeKey].x_api==='/getsession'){
			
			if (x_routes[routeKey].x_api==='/patients' || x_routes[routeKey].x_api==='/getsession'){
				api_url = api_url.split('?');
				api_url = api_url[0]+"/"+api_url[1].substring(1, api_url[1].length-1);
				
			}
			x_get(api_url,routeKey); 
		}
		else{
			$.getJSON(api_url).done(json => x_render(routeKey, json));
		}
		
	}
	else{
		x_render(routeKey);
	}	
}

function x_render(routeKey,json){
    var purl = x_routes[routeKey].x_page;
	var div = "x-body";
	if (x_routes[routeKey].x_div !== undefined){div = x_routes[routeKey].x_div;} 
    
	x_log(purl,1);	
	var env = nunjucks.configure([''],{ autoescape: false });
	document.getElementById(div).innerHTML = nunjucks.render(purl, json);
	if (x_routes[routeKey].x_code !== undefined){loadScript(x_routes[routeKey].x_code)}
	bind_events();
}
function x_do(_url, _formname){
	routeKey = _url.split('/')[0]
	params = _url.split('/')[1]
	if (x_actions[routeKey] === undefined){x_log('Invalid Action Route..',1); return;}
	
	action_nav = x_actions[routeKey].x_go
	action_url = x_actions[routeKey].x_do
	if (params !== undefined) {action_url += '/' + params}
	

	if (x_actions[routeKey].x_act === 'post'){
		const _form = document.getElementById(_formname);
		x_post(_form, action_url,action_nav); 
	}
	if (x_actions[routeKey].x_act === 'del'){
		x_del(action_url,action_nav,_formname); 
	}
	if (x_actions[routeKey].x_act === 'get'){
		x_get(action_url,action_nav); 
	}
	
}

function x_post(_form, _url, _nav){
	formdata = getFormData($(_form));
	//console.log(formdata);
	$.ajax({
      type: "POST",
	  contentType: "application/json; charset=utf-8",
      url: _url,
      data: formdata,
	  beforeSend:function(xhr) {
       xhr.withCredentials=true;
	   xhr.setRequestHeader('Authorization', 'Bearer '+localStorage.getItem("access_token"));
	  },
	  crossDomain: true
    }).done(function (data) {
		if(_url === '/user/login'){localStorage.setItem("access_token",data['access_token']);}
		if(_url === '/user/logout'){localStorage.removeItem("access_token");}
		if (data["msg"] === "Success"){
			x_nav(_nav);
		}
		else{
			x_nav("web.login");
		}
    });
	
}

function x_get(_url,routeKey){	
	$.ajax({
      type: "GET",
	  contentType: "application/json; charset=utf-8",
      url: _url,
	  beforeSend:function(xhr) {
       xhr.withCredentials=true;
	   xhr.setRequestHeader('Authorization', 'Bearer '+localStorage.getItem("access_token"));
	  },
	  crossDomain: true
    }).done(function (data) {
		if(_url === '/user/login'){localStorage.setItem("access_token",data['access_token']);}
		if(_url === '/user/logout'){localStorage.removeItem("access_token");}
		if (data["msg"] === "Success"){
			if(routeKey){
			x_render(routeKey, data);
			}
		}
		else{
			x_nav("web.login");
		}
    });
	
}

function x_put(_form, _url, _nav){	
	formdata = getFormData($(_form));
	$.ajax({
      type: "PUT",
	  contentType: "application/json; charset=utf-8",
      url: _url,
      data: formdata,
	  beforeSend:function(xhr) {
       xhr.withCredentials=true;
	   xhr.setRequestHeader('Authorization', 'Bearer '+localStorage.getItem("access_token"));
	  },
	  crossDomain: true
    }).done(function (data) {
		if(_url === '/user/login'){localStorage.setItem("access_token",data['access_token']);}
		if(_url === '/user/logout'){localStorage.removeItem("access_token");}
		if (data["msg"] === "Success"){
			x_nav(_nav);
		}
		else{
			x_nav("web.login");
		}
    });
	
}

function x_del(_url, _nav,params){
	if (confirm('Are you sure you want to delete this item?')){
		$.ajax({
		  type: "DELETE",
		  contentType: "application/json; charset=utf-8",
		  url: _url+"/"+params,
		  beforeSend:function(xhr) {
			xhr.withCredentials=true;
			xhr.setRequestHeader('Authorization', 'Bearer '+localStorage.getItem("access_token"));
		   },
		   crossDomain: true
		}).done(function (data) {
		    console.log(data);
			if (data["msg"] === "Success"){
				x_nav(_nav);
			}
			else{
				x_nav("web.login");
			}		  
		});
	}
}
function getFormData($form) {
	var unindexed_array = $form.serializeArray();
	var indexed_array = {};
	$.map(unindexed_array, function(n,i){
		indexed_array[n['name']] = n['value']
	});
	
	jsonString = JSON.stringify(indexed_array);
	return jsonString
}


function loadScript(scriptSource){ 
	var script = document.createElement('script');
	script.src = scriptSource;
	document.body.appendChild(script);
}
window.addEventListener('popstate', onPopState);

function onPopState(e) {
    let state = e.state;
    if (state !== null) {x_load(state);}
    else {history.back();}
}

function x_log(s,f){
	if (f <= debugLevel) console.log(s);
}

function attachidtoButton(){
	//console.log("hey",document.getElementById("getpdetailsbutton").attributes["data-nav"].value);
	fld = document.getElementById('getpdetailsbutton').attributes['data-nav'].value.split('?')[0]+'?';
	document.getElementById("getpdetailsbutton").attributes["data-nav"].value = fld+'"'+document.getElementById("getpdetails").value+'"';
}

function myFunction() {
  document.getElementById("myDropdown").classList.toggle("show");
}
function filterFunction() {
  var input, filter, ul, li, a, i;
  input = document.getElementById("myInput");
  filter = input.value.toUpperCase();
  div = document.getElementById("myDropdown");
  a = div.getElementsByTagName("a");
  for (i = 0; i < a.length; i++) {
    txtValue = a[i].textContent || a[i].innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      a[i].style.display = "";
    } else {
      a[i].style.display = "none";
    }
  }
}
