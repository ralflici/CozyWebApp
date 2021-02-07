$(document).ready(function() {

    $("#signup-switch").click(function() {
        $("#login").fadeOut(0);
        $("#signup").fadeIn(0);
    });

    $("#login-switch").click(function() {
        $("#login").fadeIn(0);
        $("#signup").fadeOut(0);
    });

    $("#login-form").submit(async function(e) {
        e.preventDefault();
        const username = $("#login-username").val();
        const password = $("#login-password").val();
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({username: username, password: password})
        }
        const response = await fetch("/user/login", options);
        if(response.status === 401) {
            $("#login-wrong").css("opacity", "1");
            $("#login-password").val("");
            const json = await response.json();
            console.warn(json.message);
        }
        else {
            $("#login-wrong").css("opacity", "0");
            if (response.redirected)
                window.location.href = response.url;
        }
    });

    $("#signup-form").submit(async function(e) {
        e.preventDefault();
        if ($("#signup-button").hasClass("unavailable")) return;
        const username = $("#signup-username").val();
        const password = $("#signup-password1").val();
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({username: username, password: password})
        }
        const response = await fetch("/user/signup", options);
        console.log(response.status);
        if (response.redirected)
                window.location.href = response.url;
    });
    $("#signup-password2").on("input", function() {
        const pass1 = $("#signup-password1").val();
        const pass2 = $("#signup-password2").val();
        if (pass1 === pass2)
            $("#signup-button").removeClass("unavailable");
        else
            $("#signup-button").addClass("unavailable");
    });

    /*
    $.get("/user/picture", function(data) {
        //console.log(data);
        $("#user-icon>img").attr("src", data);
    });
    */
    $.ajax({
        url: '/user/picture',
        type: 'GET',
        success: function(data){
            $("#user-icon>img").attr("src", data);
            console.log(data);
        },
        error: function(data) {
            $("#user-icon>img").attr("src", "../images/userIcon.svg");
            console.warn('Could not load profile picture. You must authenticate.');
        }
    });
});