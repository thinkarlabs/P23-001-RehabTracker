var session = function(){
    
	
	var textInput = document.getElementById('text-input');
    var charCount = document.getElementById('char-count');

    textInput.addEventListener('input', function() {
    var inputText = textInput.value;
    var charCountValue = inputText.length;
    var charLimit = textInput.maxLength;
    var remainingChars = charLimit - charCountValue;
  
    charCount.textContent = charCountValue + " characters (" + remainingChars + " characters remaining)";
    })
	
}
session();


function validate(){
  var validationStatus={
    age:true,
    phone:true,
    plannedSession:true,
    emailid:true,
    name:true,
  }

  

  let nameInput = document.getElementById("myname");
  let eerrorMessages = document.getElementById("eerrormessages");
  if (nameInput.value === "" || nameInput.value.length < 3) {
    eerrorMessages.innerHTML = "Name should be atleast 3 characters";
    nameInput.classList.add("error");
    validationStatus["name"]=false;
  } else {
    eerrorMessages.innerHTML = "";
    nameInput.classList.remove("error");
  }

  let ageInput = document.getElementById("age");
  let errorMessage = document.getElementById("error-message");

  if (ageInput.value < 1 || ageInput.value > 100) {
    errorMessage.innerHTML = "Age must be between 1 to 100";
    ageInput.classList.add("error");
    validationStatus["age"]=false;
    
  } 
  else {
    errorMessage.innerHTML = "";
    ageInput.classList.remove("error");
  }

  let phoneInput = document.getElementById("phone");
  let errorMessages = document.getElementById("errormessage");

if (!/^[6-9]\d{9}$/.test(phoneInput.value)) {
  errorMessages.innerHTML = "Phone number must start with 9, 8, 7 or 6  and should be of 10 digits";
  phoneInput.classList.add("error");
  validationStatus["phone"] = false;
} else {
  errorMessages.innerHTML = "";
  phoneInput.classList.remove("error");
}


  let sessionInput = document.getElementById("plannedSession");
  let errrorMessages = document.getElementById("errrormessage");
 
  if (sessionInput.value < 1 || sessionInput.value > 20) {
    console.log(sessionInput.value)
    errrorMessages.innerHTML = "Planned session must be between 1 to 20";
    sessionInput.classList.add("error");
    validationStatus["plannedSession"]=false;
  } else {
    errrorMessages.innerHTML = "";
    sessionInput.classList.remove("error");
  }
  

  let emailInput = document.getElementById("email");
  let errorMessagess = document.getElementById("errormessagess");
  let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailRegex.test(emailInput.value)) {
  errorMessagess.innerHTML = "Please enter a valid email address";
  emailInput.classList.add("error");
} else {
  console.log("jbj" + emailInput.value);
  errorMessagess.innerHTML = "";
  emailInput.classList.remove("error");
}

if(validationStatus["age"]==true && validationStatus["phone"]==true && validationStatus["plannedSession"]==true && validationStatus["emailid"]==true && validationStatus["name"]==true ){
  x_do("web.patientE","updatepatientform");
}
  
}

