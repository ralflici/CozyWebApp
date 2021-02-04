$(document).ready(function() {

    // ---------------- LOGIN --------------- //
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
            $(".login-wrong").fadeIn(100);
            $("#login-password").val("");
        }
        else {
            $(".login-wrong").fadeOut(0);
            //window.location.href = response.url;
            console.log(response);
        }
    });
    $("#signup-form").submit(async function(e) {
        e.preventDefault();
        if ($("#signup-password1").val() !== $("#signup-password2").val()) {
            alert("Passwords don't match");
            return;
        }
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
    });
    $("#signup-password2").on("input", function() {
        const pass1 = $("#signup-password1").val();
        const pass2 = $("#signup-password2").val();
        if (pass1 === pass2)
            $("#signup-button").removeClass("unavailable");
        else
            $("#signup-button").addClass("unavailable");
    });
    // --------------------------------------- //



    // ------------- USER PR0FILE ------------ //
    $("#profile-form").submit(async function(e) {
        e.preventDefault();
        const userData = {
            name: $("#name-input").val(),
            email: $("#email-input").val(),
            location: $("#location-input").val(),
            bio: $("#bio.input").val()
        }
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userData)
        };
        const response = await fetch("/user/edit-profile", options);
        const json = await response.json();
        console.log(json);
    })
    $("#change-password").click(function() {
        $("#change-password-popup").fadeIn(400);

        $(".close-icon").click(function() {
            $("#change-password-popup").fadeOut(400);
        });
    });

    $("#delete-account").click(function() {
        $("#delete-account-popup").fadeIn(400);

        $(".close-icon").click(function() {
            $("#delete-account-popup").fadeOut(400);
        });
        $("#no-delete").click(function() {
            $("#delete-account-popup").fadeOut(400);
        });
    });
    // --------------------------------------- //



    // --------------- PICTURE --------------- //
    $(window).resize(function(){
        $(".pic").css({"height" :$(".pic").width() + "px"});
    });
    // --------------------------------------- //


    // ---------------- FOOTER --------------- //
    $("#contact").click(() => {window.alert("Function still in development");});
    $("#share").click(() => {
        navigator.clipboard.writeText("http://127.0.0.1:5500/index.htm");
        window.alert("Link copied to you clipboard");
    });
    $("#login-footer").click(() => {window.location.href = 'log.htm';});
    // --------------------------------------- //
});

$.get("/user/picture", function(data) {
    $("#user-icon>img").attr("src", `data:image/jpeg;base64,${data}`);
    $(".user-info-image>img").attr("src", `data:image/jpeg;base64,${data}`);
    $(".pic>img").attr("src", `data:image/jpeg;base64,${data}`);
    $(".pic").css({"height" :$(".pic").width() + "px"});
});