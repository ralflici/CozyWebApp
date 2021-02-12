$(document).ready(function() {

    $(window).resize(function(){
        $(".pic").css({"height" :$(".pic").width() + "px"});
    });

    $("#email-input").on("input", function() {
        console.log(this.value)
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if(!re.test(String(this.value).toLowerCase())) {
            $("#edit-profile").addClass("unavailable");
            $("#wrong-email").css("opacity", 1);
        }
        else {
            $("#edit-profile").removeClass("unavailable");
            $("#wrong-email").css("opacity", 0);
        }
    })

    $("#profile-form").submit(async function(event) {
        event.preventDefault();
        if ($("#edit-profile").hasClass("unavailable")) {
            return;
        }
        const userData = {
            name: $("#name-input").val().replace(/^\s+|\s+$/g, ''),
            email: $("#email-input").val().replace(/^\s+|\s+$/g, ''),
            location: $("#location-input").val().replace(/^\s+|\s+$/g, ''),
            bio: $("#bio-input").val().replace(/^\s+|\s+$/g, '')
        }
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userData)
        };
        const response = await fetch("/user/edit-profile", options);
        console.log(response)
        if (response.redirected)
            window.location.href = response.url;
    });

    $("#change-password").click(function() {
        $("#change-password-popup").css("display", "grid");
        window.scrollTo(0,0);
        $("#new-pass2").on("input", function() {
            if ($(this).val() === $("#new-pass1").val())
                $("#submit-pass-change").removeClass("unavailable");
            else
                $("#submit-pass-change").addClass("unavailable");
        });
        $("#change-password-form").submit(async function(event) {
            event.preventDefault();
            if ($("#submit-pass-change").hasClass("unavailable")) return;
            const oldPass = $("#old-pass").val();
            const newPass = $("#new-pass1").val();
            const options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({oldPass: oldPass, newPass: newPass})
            };
            const response = await fetch("/user/change-password", options);
            const json = await response.json();
            if (response.status === 401) {
                console.warn(json.message);
                $("#wrong-old-pass").css("opacity", "1");
            }
            else {
                console.log(json.message);
                $("#wrong-old-pass").css("opacity", "0");
                $("#change-password-popup").css("display", "none");
            }
        });

        $(".close-icon").click(function() {
            $("#change-password-popup").css("display", "none");
        });
    });

    $("#delete-account").click(function() {
        $("#delete-account-popup").css("display", "grid");
        window.scrollTo(0,0);

        $(".close-icon").click(function() {
            $("#delete-account-popup").css("display", "none");
        });
        $("#no-delete").click(function() {
            $("#delete-account-popup").css("display", "none");
        });
        $("#yes-delete").click(async function() {
            const response = await fetch("/user/delete-account", { method: "POST", headers: { "Content-Type": "applications/json" }});
            console.log(response);
            if (response.redirected)
                window.location.href = response.url;
        });
    });

    $("#logout").click(async function() {
        const response = await fetch("/user/logout", { method: "GET", headers: { "Content-Type": "application/json" }});
        console.log(response);
        if (response.redirected)
            window.location.href = response.url;
    });
});

$.ajax({
    url: '/user/picture',
    type: 'GET',
    success: function(data){
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
    },
    error: function(data) {
        $("#user-icon>img").attr("src", "../images/userIcon.svg");
        $(".user-info-image>img").attr("src", "../images/userIcon.svg");
        $(".pic>img").attr("src", "../images/userIcon.svg");
        $(".pic").css({"height" :$(".pic").width() + "px"});
        console.warn('Could not load profile picture.');
    }
});

$("#edit-picture").click(function(event) {
    event.preventDefault();
    $("#input-picture").click();
});

$(".pic").click(function(event) {
    event.preventDefault();
    $("#input-picture").click();
});

$("#input-picture").on("change", function() {
    console.log("uploading...");
    console.log(this);
    $(".picture-container").submit();
});
