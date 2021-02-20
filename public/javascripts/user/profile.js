"use strict";

$(document).ready(function() {
    // resize the user's picture when the window is resized
    $(window).resize(function(){
        $(".pic").css({"height" :$(".pic").width() + "px"});
    });

    // dynamically check the format of the email through a regular expression
    $("#email-input").on("input", function() {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if(!re.test(String(this.value).toLowerCase())) {
            $("#edit-profile").addClass("unavailable");
            $("#wrong-email").css("opacity", 1);
        }
        // if the format is wrong change the style of the "edit-profile" button
        else {
            $("#edit-profile").removeClass("unavailable");
            $("#wrong-email").css("opacity", 0);
        }
    });

    // add the authorization info to the hidden input element included in the 'picture-container' form
    // this ensures the success of the 'edit picture' operation since it is a submit function therefore
    // there is no way of setting the headers
    $("#jwt").val("Bearer " + document.cookie.split("jwt=")[1].split(";")[0]);

    // submit the profile info
    $("#profile-form").submit(async function(event) {
        // prevent default submit
        event.preventDefault();
        // check whether the button is available (email format)
        if ($("#edit-profile").hasClass("unavailable")) return;
        // remove spaces or other useless characters from the input's values
        const userData = {
            name: $("#name-input").val().replace(/^\s+|\s+$/g, ''),
            email: $("#email-input").val().replace(/^\s+|\s+$/g, ''),
            location: $("#location-input").val().replace(/^\s+|\s+$/g, ''),
            bio: $("#bio-input").val().replace(/^\s+|\s+$/g, '')
        }
        const options = {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + document.cookie.split("jwt=")[1].split(";")[0],
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userData)
        };
        // edit the profile
        const response = await fetch("/user/edit-profile", options);
        // refresh the page
        if (response.redirected)
            window.location.href = response.url;
    });

    // password change function
    $("#change-password").click(function() {
        // display the popup (as a grid to center it in the view)
        $("#change-password-popup").css("display", "grid");
        // scroll to the top to see the popup
        window.scrollTo(0,0);
        // event listener to dynamically check the equality of the newly inserted passwords and change the button's style
        $("#new-pass2").on("input", function() {
            if ($(this).val() === $("#new-pass1").val())
                $("#submit-pass-change").removeClass("unavailable");
            else
                $("#submit-pass-change").addClass("unavailable");
        });
        // submit function
        $("#change-password-form").submit(async function(event) {
            // prevent the default submission
            event.preventDefault();
            // check if the submission is possible by looking at the button
            if ($("#submit-pass-change").hasClass("unavailable")) return;

            const oldPass = $("#old-pass").val();
            const newPass = $("#new-pass1").val();
            const options = {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + document.cookie.split("jwt=")[1].split(";")[0],
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({oldPass: oldPass, newPass: newPass})
            };
            // change the password
            const response = await fetch("/user/change-password", options);
            const json = await response.json();
            // if there was an error with the old password show it to the client
            if (response.status === 401) {
                console.warn(json.message);
                $("#wrong-old-pass").css("opacity", "1");
            }
            // otherwise close the popup
            else {
                console.log(json.message);
                $("#wrong-old-pass").css("opacity", "0");
                $("#change-password-popup").css("display", "none");
            }
        });
        // close the popup if the close icon is clicked
        $(".close-icon").click(function() {
            $("#change-password-popup").css("display", "none");
        });
    });

    // delete account function
    $("#delete-account").click(function() {
        // display the popup (as a grid to center it in the view)
        $("#delete-account-popup").css("display", "grid");
        // scroll to the top to see the popup
        window.scrollTo(0,0);

        // close the popup
        $(".close-icon").click(function() {
            $("#delete-account-popup").css("display", "none");
        });
        $("#no-delete").click(function() {
            $("#delete-account-popup").css("display", "none");
        });
        // delete the account
        $("#yes-delete").click(async function() {
            const response = await fetch("/user/delete-account", { method: "POST", headers: { "Authorization": "Bearer " + document.cookie.split("jwt=")[1].split(";")[0], "Content-Type": "applications/json" }});
            // redirect to /log.html
            if (response.redirected)
                window.location.href = response.url;
        });
    });

    // logout function
    $("#logout").click(function() {
        // override the cookie
        document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        // redirect to /log.html
        window.location.href = "/log.html";
    });
});

// if the user clicks the "edit" button element, trigger the "input-picture" event to load an image
$("#edit-picture").click(function(event) {
    event.preventDefault();
    $("#input-picture").click();
});
// if the user clicks on the image element, trigger the "input-picture" event to load an image
$(".pic").click(function(event) {
    event.preventDefault();
    $("#input-picture").click();
});
// if the "input-picture" change event is triggered, submit the the change
$("#input-picture").on("change", function() {
    $("#picture-container").submit();
});
