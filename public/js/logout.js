//Called to logout of the current account
function UserLogout(){
    //Get username from localstorage else leave
    let showInfo = new ShowUserInformation();
    let username = showInfo.showUserName();

    FETCH('http://localhost:5001/user/logout', 'post', `username=${username}`)
    .then(message => {
        localStorage.removeItem('output');
        location.assign('../');
    })
    .catch(message => {
        alert(message);
    })
}