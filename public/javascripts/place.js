"use strict";

$(document).ready(async function() {
    loadLocations();

    // adjust the link to redirect the main admin page
    $("#back-link").attr("href", "/admin/" + document.cookie.split("jwt=")[1].split(";")[0]);

    // if the user wants to register a new location display the additional input elements otherwise hide them
    $("select#location").change(function() {
        if(this.value === "new-location") {
            $("#new-location").fadeIn(0);
        }
        else
            $("#new-location").fadeOut(0);
    });

    // If there's a cookie, edit an existing place otherwise insert a new place
    if (document.cookie.indexOf("place") !== -1) {
        // get the place's id from the cookie
        const placeID = document.cookie.split("place=")[1].split(";")[0]
        // request the place's informations from the server and load them in the form
        const response = await fetch("/places/" + placeID);
        const info = await response.json();

        // adjust the form's action url to include admin's jwt
        $("form").attr("action", "/admin/" + document.cookie.split("jwt=")[1].split(";")[0] + "/edit-place");

        $("#placeID").val(placeID);

        $("#name").val(info.name);
        
        if (info.type === "entire place")
           $("#entire-place").prop("checked", true);
        else if (info.type === "private room")
           $("#private-room").prop("checked", true);
        else
           $("#shared-place").prop("checked", true);
        
        $("#adults").val(info.guests.adults);
        $("#children").val(info.guests.children);
        $("#infants").val(info.guests.infants);

        $("#price").val(info.price);

        $("#beds").val(info.rooms.beds);
        $("#bedrooms").val(info.rooms.bedrooms);
        $("#bathrooms").val(info.rooms.bathrooms);

        $("#lon").val(info.coordinates[0]);
        $("#lat").val(info.coordinates[1]);

        $("#image0").val(info.images[0]);
        $("#image1").val(info.images[1]);
        $("#image2").val(info.images[2]);

        $("#location").val(info.location.name);

        // delete the place cookie because it's not needed anymore
        document.cookie = "place=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
});

// function to load the locations in dropdown menu (select input)
async function loadLocations() {
    const response = await fetch("/locations");
    const list = await response.json();

    for (let i in list) {
        $("select#location").append(`<option value="${list[i].name}">${list[i].name}</option>`)
    }
    $("select#location").append(`<option value="new-location">Insert new location</option>`);
}