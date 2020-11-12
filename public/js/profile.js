function SaveProfileData(){
    const name = document.getElementById("p-name").value;
    const surname = document.getElementById("p-surname").value;
    const email = document.getElementById("p-email").value;
    const username = document.getElementById("p-username").value;
    
    //Fetch Api to send a request
    fetch('/Login', {
        method: 'post',
        headers: {
            "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
        },
        body: reqbody
    })
    .then(res => {
        if (res.status == 200)
            return res.text();
        else
            alert("An error occured please try again!");
    })
    .then(text => {
        //Get results and convert them to an object
        const res = JSON.parse(text);
        //if ststus is true print success and locate to a different page else print error
        if (res.status){
            alert(res.message);
            //localStorage.setItem('output', JSON.stringify(res.output));
            location.assign("/User/Profile");
        }else{
            alert(res.message);
        }
    })
    .catch(res => {
        //Print any error related to sending request
        alert(res);
    });
}