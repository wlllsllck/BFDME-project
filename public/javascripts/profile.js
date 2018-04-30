function post (path, data) {
    return window.fetch(path, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
};

$(document).ready(function(){
    $("form").submit(function(){
            // alert("hello");
            var FilterFile = document.querySelector('.FilterFile')
            var month = FilterFile.querySelector('.month').value
            var year = FilterFile.querySelector('.year').value
            var file = FilterFile.querySelector('.file_name').value
            if(!month & !year & !file)
                    alert("please fill some filters");
            else {
                    alert("Submitted");
                    post('/filter', { month, year, file});
            }                               
    });
});
