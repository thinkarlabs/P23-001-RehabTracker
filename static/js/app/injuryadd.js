var checkbox = function() {
     document.getElementById('saveBtn').addEventListener('click', validateCheckbox);
};

function validateCheckbox(event) {
    var validation = {
        title: true,
        aim: true,
        description: true,
        exercises: true
    }

    var checkboxes = document.querySelectorAll('input[type=checkbox]');
    var errorMesssages = document.getElementById("ERROR1");
    var exercises = document.getElementById("selectExercises1");
    var listElement = document.getElementById("listId");
    var checked = false;
        for (var i = 0; i < checkboxes.length; i++) {
            if (checkboxes[i].checked == true) {
                checked = true;
            }
        }
        if (!checked) {
            errorMesssages.innerHTML = "Please select at least ONE exercise";
            listElement.classList.add("error");
            validation["exercises"] = false;
        } else {
            errorMesssages.innerHTML = "";
            listElement.classList.remove("error");
        }

    var titleInput = document.getElementById("title");
    var errorMessage = document.getElementById("error-message");
    var titleLength = titleInput.value.length;
    if (titleLength < 4) {
        errorMessage.innerHTML = "Enter a title of 4 characters!";
        titleInput.classList.add("error");
        validation["title"] = false;
    }else{
        errorMessage.innerHTML = "";
        titleInput.classList.remove("error");
    }

    var aimInput = document.getElementById("aim");
    var error_Message = document.getElementById("errormessages");
    var aimLength = aimInput.value.length;
    if (aimLength < 30) {
        error_Message.innerHTML = "Enter a minumum of 30 characters!";
        aimInput.classList.add("error");
        validation["aim"] = false;
    }else{
        error_Message.innerHTML = "";
        aimInput.classList.remove("error");
        
    }
    var descInput = document.getElementById("text-input");
    var error_Message = document.getElementById("errormessages1");
    var descLength = descInput.value.length;
    if (descLength < 40) {
        error_Message.innerHTML = "Enter a minumum of 40 characters!";
        descInput.classList.add("error");
        validation["description"] = false;
    }else{
        error_Message.innerHTML = "";
        descInput.classList.remove("error");
        
    }
    if(validation["title"] ==true && validation["aim"] ==true && validation["exercises"] ==true && validation["description"] == true ){
        x_do("web.injuriesA","addinjuryform");
      }
}
var description=function(){
    var textInput = document.getElementById('text-input');
    var charCount = document.getElementById('char-count');
    textInput.addEventListener('input',function(){
    var inputText = textInput.value;
    var charCountValue = inputText.length;
    var charLimit = textInput.maxLength;
    var remainingChars = charLimit - charCountValue;
    charCount.textContent = charCountValue + "characters("+remainingChars+"characters remaining)";
    })
}

description();
checkbox();
