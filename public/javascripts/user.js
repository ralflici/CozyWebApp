$(document).ready(function() {
    // ---------------- LOGIN --------------- //
    $("#signup-switch").click(function() {
        $("#login").fadeOut(0);
        $("#signup").fadeIn(0);
    })
    $("#login-switch").click(function() {
        $("#login").fadeIn(0);
        $("#signup").fadeOut(0);
    })
    // --------------------------------------- //



    // ------------- USER PR0FILE ------------ //
    $("#change-password").click(function() {
        $("#change-password-popup").fadeIn(400);

        $(".close-icon").click(function() {
            $("#change-password-popup").fadeOut(400);
        })
    })

    $("#delete-account").click(function() {
        $("#delete-account-popup").fadeIn(400);

        $(".close-icon").click(function() {
            $("#delete-account-popup").fadeOut(400);
        })
        $("#no-delete").click(function() {
            $("#delete-account-popup").fadeOut(400);
        })
    })
    // --------------------------------------- //



    // --------------- PICTURE --------------- //
    $("#edit-picture").change(function(event) {
        const fl = $("#edit-picture")[0].files[0];
        try {
            $(".pic>img").attr("src", URL.createObjectURL(fl));
            $(".pic").css({"height" :$(".pic").width() + "px"});
        }
        catch {
            console.warn("Upload failed");
        }
    });
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