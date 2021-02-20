$(document).ready(function() {
    loadProfileInfo();
    loadPic();

    // footer dummy events
    $("#contact").click(() => {window.alert("Function still in development");});
    $("#share").click(() => {
        navigator.clipboard.writeText(window.location.href.substring(0, window.location.href.indexOf("user/")));
        window.alert("Link copied to you clipboard");
    });
    $("#login-footer").click(() => {window.location.href = 'log.html';});
});

async function loadProfileInfo() {
    const options = {
        method: "GET",
        headers: {
            // if the jwt cookie exsists attach it to the header otherwise attach "0" as a non valid jwt
            "Authorization": (document.cookie ? "Bearer " + document.cookie.split("jwt=")[1].split(";")[0] : "0"),
        }
    };
    // retrieve user info
    const response = await fetch("/user/profile-info", options);
    // if no error occurred load the info
    if (response.status < 400) {
        const user = await response.json();
        $(".user-name").text((user.name == "" || user.name == undefined) ? "Name Surname" : user.name);
        $("#name-input").val(user.name);
        $("#email-input").val(user.email);
        $("#location-input").val(user.location);
        $("#bio-input").val(user.bio);
    }  
}

async function loadPic() {
    const options = {
        method: "GET",
        headers: {
            // if the jwt cookie exsists attach it to the header otherwise attach "0" as a non valid jwt
            "Authorization" : document.cookie ? "Bearer " + document.cookie.split("jwt=")[1].split(";")[0] : "0",
            "Content-Type": "image/jpeg"
        }
    };
    // get the image
    const response = await fetch("/user/picture", options);
    // convert it to text (since it's stored as a string in the database)
    const data = await response.text();
    // if the user hasn't set an image, load the default icon
    if (data == "") {
        $("#user-icon>img").attr("src", "../images/userIcon.svg");
        $(".user-info-image>img").attr("src", "../images/userIcon.svg");
        $(".pic>img").attr("src", "../images/userIcon.svg");
    }
    // otherwise load the user's image
    else {
        $("#user-icon>img").attr("src", data);
        $(".user-info-image>img").attr("src", data);
        $(".pic>img").attr("src", data);
    }
    // resize the image
    $(".pic").css({"height" :$(".pic").width() + "px"});
}