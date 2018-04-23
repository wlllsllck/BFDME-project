$(document).ready(function(){
    $("form").submit(function(){
            var VerifyFile = document.querySelector('.VerifyFile')
            var files = VerifyFile.querySelector('.files').value
            if(!files)
                    alert("please select the files");
            else {
                    alert("Submitted");
            }                               
    });
});