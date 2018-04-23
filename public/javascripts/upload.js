$(document).ready(function(){
        $("form").submit(function(){
                // alert("hello");
                var UploadFile = document.querySelector('.UploadFile')
                var user_id = UploadFile.querySelector('.user_id').value
                var username = UploadFile.querySelector('.username').value
                var files = UploadFile.querySelector('.files').value
                if(!files)
                        alert("please select the files");
                else {
                        alert("Submitted");
                }                               
        });
});

      