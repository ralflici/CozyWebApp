$(document).ready(function() {
    // ---------------- FOOTER --------------- //
    $("#contact").click(() => {window.alert("Function still in development");});
    $("#share").click(() => {
        navigator.clipboard.writeText("http://127.0.0.1:5500/index.htm");
        window.alert("Link copied to you clipboard");
    });
    $("#login-footer").click(() => {window.location.href = 'log.html';});
    // --------------------------------------- //
});