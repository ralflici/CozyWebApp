$(document).ready(function() {
    $.get("/user/profile-info", function(user) {
        $(".user-name").text((user.name == "" || user.name == undefined) ? "Name Surname" : user.name);
        $("#name-input").val(user.name);
        $("#email-input").val(user.email);
        $("#location-input").val(user.location);
        $("#bio-input").val(user.bio);
    });

    // ---------------- FOOTER --------------- //
    $("#contact").click(() => {window.alert("Function still in development");});
    $("#share").click(() => {
        navigator.clipboard.writeText("http://127.0.0.1:5500/index.htm");
        window.alert("Link copied to you clipboard");
    });
    $("#login-footer").click(() => {window.location.href = 'log.html';});
    // --------------------------------------- //
});