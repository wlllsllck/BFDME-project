$(document).ready(function(){
    $("form").submit(function(){
            // alert("hello");
            var FilterFile = document.querySelector('.FilterFile')
            var month = FilterFile.querySelector('.month').value
            var year = FilterFile.querySelector('.year').value
            var file = FilterFile.querySelector('.file_name').value
            if(month === 'None' & !year & !file)
                    alert("please fill some filters");
            else {
                    alert("Wait for Filter!!");
            }                               
    });
});
