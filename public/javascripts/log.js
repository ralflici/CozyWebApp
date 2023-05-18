"use strict";

let adminChecked = false;

$(document).ready(function() {

    // switch to signup section
    $("#signup-switch").click(function() {
        $("#login").fadeOut(0);
        $("#signup").fadeIn(0);
    });

    // switch to login section
    $("#login-switch").click(function() {
        $("#login").fadeIn(0);
        $("#signup").fadeOut(0);
    });

    // login function
    $("#login-form").submit(async function(e) {
        // prevent default submission
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
        // request login
        const response = await fetch("/login", options);
        // if server responded with 401, display the error to the user
        if(response.status === 401) {
            $("#login-wrong").css("opacity", "1");
            $("#login-password").val("");
            const json = await response.json();
            console.warn(json.message);
        }
        // otherwise redirect to the profile
        else {
            $("#login-wrong").css("opacity", "0");
            if (response.redirected)
                window.location.href = response.url;
        }
    });

    // signup function
    $("#signup-form").submit(async function(e) {
        // prevent default submission
        e.preventDefault();

        // if passwords are not equal return
        if ($("#signup-button").hasClass("unavailable")) return;

        const username = $("#signup-username").val();
        const password = $("#signup-password1").val();
        const admin = $('.switch>input').prop('checked');
        const adminCode = $("#admin-code").val();
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({username: username, password: password, admin: admin, adminCode: adminCode})
        }
        // request the signup
        const response = await fetch("/signup", options);
        // if server responded with 403, display the error to the user
        if (response.status == 403)
            $("#signup-wrong").css("opacity", 1);
        else 
            $("#signup-wrong").css("opacity", 0);
        if (response.redirected)
                window.location.href = response.url;
    });

    // change button style dynamically based on the passwords comparison
    $("#signup-password2").on("input", function() {
        const pass1 = $("#signup-password1").val();
        const pass2 = $("#signup-password2").val();
        if (pass1 === pass2)
            $("#signup-button").removeClass("unavailable");
        else
            $("#signup-button").addClass("unavailable");
    });

    // show the admin-code input element if the user wants to sign in as admin
    $(".switch>input").click(function() {
        if (!adminChecked) {
            $("#admin-code").fadeIn(0);
        }
        else {
            $("#admin-code").fadeOut(0);
        }
        adminChecked = !adminChecked;
    })
});