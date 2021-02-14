$(document).ready(function() {
    loadProfileInfo();
    loadPic();

    $("#contact").click(() => {window.alert("Function still in development");});
    $("#share").click(() => {
        navigator.clipboard.writeText("http://127.0.0.1:5500/index.htm");
        window.alert("Link copied to you clipboard");
    });
    $("#login-footer").click(() => {window.location.href = 'log.html';});
});

async function loadProfileInfo() {
    const options = {
        method: "GET",
        headers: {
            "Authorization": (document.cookie ? "Bearer " + document.cookie.split("jwt=")[1].split(";")[0] : "0"),
        }
    };
    const response = await fetch("/user/profile-info", options);
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
            "Authorization" : document.cookie ? "Bearer " + document.cookie.split("jwt=")[1].split(";")[0] : "0",
            "Content-Type": "image/jpeg"
        }
    };
    const response = await fetch("/user/picture", options);
    const data = await response.text();
    if (data == "") {
        $("#user-icon>img").attr("src", "../images/userIcon.svg");
        $(".user-info-image>img").attr("src", "../images/userIcon.svg");
        $(".pic>img").attr("src", "../images/userIcon.svg");
    }
    else {
        $("#user-icon>img").attr("src", data);
        $(".user-info-image>img").attr("src", data);
        $(".pic>img").attr("src", data);
    }
    $(".pic").css({"height" :$(".pic").width() + "px"});
}