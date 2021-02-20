"use strict";

let mapShowed = false;
let minPrice, maxPrice, min, max;

let preferences = {
    location: undefined,
    type: [],
    dates: {
        start: undefined,
        end: undefined
    },
    guests: {
        adults: 0,
        children: 0,
        infants: 0
    },
    price: {
        min: -1, 
        max: 1000000
    },
    rooms: {
        beds: 0,
        bedrooms: 0,
        bathrooms: 0
    }
};

// 0:    0px -  425px (mobile)
// 1:  426px - 1280px (small)
// 2: 1281px - 1920px (normal)
// 3: 1921px -    inf (wide)
let screenType;

// define window width
let windowWidth = $(window).width();
$(window).resize(function() {
    windowWidth = $(window).width();
    defineScreenSize();
    // change button text when resizing
    if (screenType >= 2 && $("#get-started").text() == "Find you place ▼") {
        $("#get-started").text("Find your place");
    }
    else if (screenType < 2 && $("#get-started").text() == "Find your place") {
        $("#get-started").text("Find you place ▼");
    }
});

// function to define the screen size and adjust the left container's border radius
function defineScreenSize() {
    if (windowWidth < 426) {
        screenType = 0;
        $(".left-container").css("border-radius", "0px");
    }
    else if (windowWidth < 1281) {
        $(".left-container").css("border-radius", "0px");
        screenType = 1;
    }
    else if (windowWidth < 1921) {
        $(".left-container").css("border-radius", "0 40px 40px 0");
        screenType = 2
    }
    else {
        $(".left-container").css("border-radius", "40px");
        screenType = 3
    }
}

async function searchLocation(text) {
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({location : text})
    }
    const response = await fetch("/locations/name", options);
    return response.json();
}

function dropdownResults(locs) {
    // remove previously added elements
    $(".search-result").remove();
    // if there are results append them to the dropdown element
    if (locs.length !== 0) {
        $(".search-dropdown")
            .css("width", $(".right-container").width() + "px")
            .fadeIn(0);
        for (let i in locs) {
            $(".search-dropdown").append(`<div class="search-result" id="${locs[i].name}">${locs[i].name}</div>`);
        }

        // bind click event to the location elements to select them
        $(".search-result").click(function() {
            // get the location name
            const choosen = $(this).text();
            // insert it in the search bar
            $("#search").val(choosen);
            // remove all other results
            $("search-result").remove();
            // hide the dropdown element
            $(".search-dropdown").fadeOut(0);
            // search the location by it's name
            searchLocation(choosen)
                .then((res) => {
                    // trigger the click events to select the right continent and location's slide
                    const continent = $(`.continent#${res[0].continent}`)[0];
                    const location = $(`span[id="${res[0].name}"]`)[0];
                    const click = new MouseEvent('click');
                    if (!$(`#${res[0].continent}`).hasClass("selected"))
                        continent.dispatchEvent(click);
                    location.dispatchEvent(click);
                })
                .catch((err) => console.log(err));
        });
    }
    // otherwise show the "No results" message
    else {
        $(".search-dropdown").append(`<div class="search-result" style="color: #cccccc; font-style: italic; font-weight: 300">No results</div>`);
    }
}

// function to retrieve the minimum and maximum price
async function getOutmostPrices(loc) {
    let location;
    // if the argument is not set then get the absolute minimum and maximum prices of all the places
    if (loc === undefined)
        location = {location: ""};
    else
        location = {location: loc};
    
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(location)
    }
    const response = await fetch("/places/outmost_price", options);
    const json = await response.json();

    // store the data in global variables
    min = json.min_price;
    max = json.max_price;
    minPrice = min;
    maxPrice = max;

    // adjust the form parameters based on the retrieved data
    $("#min-price").attr("min", json.min_price);
    if (preferences.price.min < 0)
        $("#min-price").val(json.min_price);
    else
        $("#min-price").val(preferences.price.min);
    
    $("#max-price").attr("max", json.max_price);
    if (preferences.price.max > 10000)
        $("#max-price").val(json.max_price);
    else
        $("#max-price").val(preferences.price.max);
}

async function getLocationsContinent(continent) {
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({continent : continent})
    }
    const response = await fetch("/locations/continent", options);
    return response.json();
}

function displayLocationSlides(locations) {
    // append the location's slides
    for (let i in locations) {
        $(".location-slideshow").append(
            `<span class="location-image ${locations[i].continent}" id="${locations[i].name}">
                <div class="location-text">
                    <div class="location-city">${locations[i].name}</div>
                    <div class="location-country">${locations[i].country}</div>
                </div>
            </span>`);
        $(`span[id="${locations[i].name}"]`).css("background-image", `url(${locations[i].image})`);
    }
    // bind the event listener to each slide in order make them selectable
    $(".location-image").click(function() {
        // initialize everything
        if($(this).hasClass("selected")) return;
        $(".location-image.unselected").removeClass("unselected");
        $(".location-image.selected").removeClass("selected");

        // get the selected location's name
        const thisName = $(this).attr("id");
        // add the right classes to all location's slides
        $(`.location-image:not([id="${thisName}"])`).addClass("unselected");
        $(this).addClass("selected");
        // save the choosen location in the prference global variable
        preferences.location = thisName;
        
        // initialize the price preference back to default values
        preferences.price = {min: -1, max: 1000000};
        // if the dates are also selected make the search-button available
        if (preferences.dates.start !== undefined && preferences.dates.end !== undefined)
            $("#search-button").removeClass("unavailable");
    });
}

function submit() {
    // (for small screens) change the scroll element style
    $(".scroll").css("background-color", "#ffffff");
    // show the map element is it was hidden
    if (!mapShowed)
        $(".map").fadeIn(100);
    mapShowed = true;
    
    // remove any marker
    for (let i in markers)
        mymap.removeLayer(markers[i]);
    markers = [];
    
    // remove previosly inserted popups
    $(".left-container").find(".result-number").remove();
    
    // submit preferences to the server
    submitPreferences()
        .then((data) => {
            // display a popup showing the number of results
            if (data.length > 1)
                $(".left-container").append(`<div class="result-number">There are ${data.length} results</div>`);
            else if (data.length === 1)
                $(".left-container").append(`<div class="result-number">There is ${data.length} result</div>`);
            else
                $(".left-container").append(`<div class="result-number">Sorry, there are no results.</div>`);
            // (for small screens) delay the popup fade-in because the window has to scroll up smoothly to the top first
            if (screenType < 2)
                $(".result-number").css("animation-delay", "0.6s");

            // get the outmost prices for that specific location and use them to draw the price chart
            getOutmostPrices(preferences.location)
                .then((res) => {
                    // remove the standard "Submit your preferences text"
                    $(".chart-text").remove();
                    // load tha map with the places
                    initMap(data);
                    // remove previous charts and draw the new one
                    if(myChart)
                        myChart.destroy();
                    initChart(data);
                })
                .catch((err) => console.log(err));
        })
        .catch((err) => console.log(err));
    // (for small screens) scroll to the top to see the map
    if (screenType < 2) {
        window.scrollTo(0, 0);
    }
}

async function submitPreferences() {
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(preferences)
    }
    const response = await fetch("/places/submit", options);
    return response.json();
}

const ctx = document.getElementById('chart-canvas').getContext('2d');
let myChart;
function initChart(places) {
    // set the basic variables for the chart
    // segments stores the number of sub-ranges in which the main price prange is divided
    const segments = 8;
    // basis stores the sub-range value (a little offset is added to avoid counting the same place in two different subranges)
    const basis = (max + 0.001 - min)/segments;
    // labels stores the text info of the sub-range value
    let labels = [];
    // data stores the amount of places for each sub-range
    let data = new Array(segments);

    for (let i = 1; i <= segments; i++) {
        // (for small screens) since the small space available, avoid labels
        if (screenType < 2)
            labels.push("");
        // get only 2 decimal numbers
        else
            labels.push((basis*(i-1) + min).toFixed(2) + "€ - " + (basis*i + min).toFixed(2) + "€");
        
        // set the amount of places for each sub-range
        data[i-1] = 0;
        for (let j in places) {
            if (places[j].price >= (basis*(i-1) + min) && places[j].price < (basis*i) + min) {
                data[i-1]++;
            }
        }
    }

    // draw the chart
    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                //label: 'Places',
                data: data,
                backgroundColor: "#EF49231A",
                borderColor: "#EF4923",
                borderWidth: 2
            }]
        },
        options: {
            legend: {
                display: false
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        max: (Math.max(...data) + 1),
                        stepSize: 1,
                        fontSize: 12
                    }
                }],
                xAxes: [{
                    ticks: {
                        fontSize: 12
                    }
                }]
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

let markers = [];
// initialize the leafletJS map by loading a tile layer and adding it to the map html element
let mymap = L.map('map');
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZmluZ2VycHJpbnRsYWIiLCJhIjoiY2traWlrcHYwMW5yZDJ3cXRjeW9uOTl1NSJ9.7bIbZx0Mar8v-fyKmjq7hg', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1IjoiZmluZ2VycHJpbnRsYWIiLCJhIjoiY2traWlrcHYwMW5yZDJ3cXRjeW9uOTl1NSJ9.7bIbZx0Mar8v-fyKmjq7hg'
}).addTo(mymap);

// define the custom icons and their properties
const entirePlaceIcon = L.icon({
    iconUrl: "../images/entire_place_icon.svg",
    iconSize: [51, 45],
    iconAnchor: [26, 45],
    popupAnchor: [0, -44]
});
const privateRoomIcon = L.icon({
    iconUrl: "../images/private_room_icon.svg",
    iconSize: [51, 45],
    iconAnchor: [26, 45],
    popupAnchor: [0, -44]
});
const sharedRoomIcon = L.icon({
    iconUrl: "../images/shared_room_icon.svg",
    iconSize: [51, 45],
    iconAnchor: [26, 45],
    popupAnchor: [0, -44]
});

// show the places in the map
function initMap(data) {
    let lon = 0, lat = 0;
    for (let i in data) {
        // set the coordinates
        lon += data[i].coordinates[0];
        lat += data[i].coordinates[1];
        
        // set the right icon for that type of place and add it to the map
        let icon;
        if (data[i].type === "entire place") icon = entirePlaceIcon;
        else if (data[i].type === "private room") icon = privateRoomIcon;
        else icon = sharedRoomIcon;

        let markerOptions = {
            icon: icon,
            title: data[i].name,
            alt: data[i]._id
        }
        let marker = L.marker([data[i].coordinates[1], data[i].coordinates[0]], markerOptions).addTo(mymap);
        
        // define the main popup with all the information about the place and bind it to the corresponding marker
        let popup = L.popup().setContent(
            `<div class="popup" id="${data[i]._id}">
                <div class="popup-slide-container">
                    <div class="popup-vignette" onclick="sendMessage(event)" title="Send a message">💬</div>
                    <div class="popup-checkmark" onclick="book(event)" title="Book this place">✓</div>
                    <img class="popup-image visible" src='${data[i].images[0]}' alt='interiors'>
                    <img class="popup-image" src='${data[i].images[1]}' alt='interiors'>
                    <img class="popup-image" src='${data[i].images[2]}' alt='interiors'>
                    <div class="popup-image-arrow" id="prev" onclick="swapImages(event)">
                        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.0" x="0px" y="0px" viewBox="0 0 24 24" enable-background="new 0 0 24 24" xml:space="preserve">
                            <g>
                                <polyline stroke="#707070" fill="none" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" points="15.5,21 6.5,12 15.5,3 "/>
                            </g>
                        </svg>
                    </div>
                    <div class="popup-image-arrow" id="next" onclick="swapImages(event)">
                        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.0" x="0px" y="0px" viewBox="0 0 24 24" enable-background="new 0 0 24 24" xml:space="preserve" style="transform: rotate(180deg);">
                            <g>
                                <polyline stroke="#707070" fill="none" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" points="15.5,21 6.5,12 15.5,3 "/>
                            </g>
                        </svg>
                    </div>
                </div>
                <div class="popup-slide-indicator">
                    <span class="popup-slide-circle active"></span>
                    <span class="popup-slide-circle"></span>
                    <span class="popup-slide-circle"></span>
                </div>
                <div class="popup-text-container">
                    <p class="popup-text">${data[i].name}</p>
                    <p class="popup-price">${data[i].price}€<br>night</p>
                </div>
            </div>`
        );
        marker.bindPopup(popup);
        markers.push(marker);
    }
    let center = [0,0];
    // if there are no places, get the coordinates of the location form the opencage API
    if (data.length === 0) {
        const location = preferences.location.replace(/\s/g, "+");
        fetch(`https://api.opencagedata.com/geocode/v1/json?q=${location}&key=664cf514e86f4b389007b11e68f15ccb`)
        .then((res) => res.json())
        .then((json) => {
            center = [json.results[0].geometry.lat, json.results[0].geometry.lng];
            mymap.setView(center, 12);
        })
        .catch((err) => console.log(err));
    }
    // otherwise center the view on the average value of the places coordinates
    else {
        center = [(lat/data.length), (lon/data.length)];
        mymap.setView(center, 12);
    }
}

// function to swap the place's popup images (in a perpetual fashion)
function swapImages(event) {
    const target = $(event.target).parents(".popup-image-arrow");
    let visible = $(".popup-slide-container").children(".visible");
    if (target.attr("id") === "prev") {
        let prev = visible.prev(".popup-image");
        if (prev.length === 0) {
            prev = $(".popup-image").last();
            $(".popup-slide-circle")
                .removeClass("active")
                .last().addClass("active");
        }
        else {
            let circle = $(".popup-slide-circle.active").removeClass("active");
            circle.prev().addClass("active")
        }
        visible
            .css("filter", "blur(5px)")
            .fadeOut(200)
            .removeClass("visible");
        prev
            .fadeIn(200)
            .css("filter", "none")
            .addClass("visible");
    }
    else {
        let next = visible.next(".popup-image");
        if (next.length === 0) {
            next = $(".popup-image").first();
            $(".popup-slide-circle")
                .removeClass("active")
                .first().addClass("active");
        }
        else {
            let circle = $(".popup-slide-circle.active").removeClass("active");
            circle.next().addClass("active");
        }
        visible
            .css("filter", "blur(5px)")
            .fadeOut(200)
            .removeClass("visible");
        next
            .fadeIn(200)
            .css("filter", "none")
            .addClass("visible");
    }
}

// function triggered by the reset-icon
function resetCalendar() {
    calendar.start = undefined;
    calendar.startDate = undefined;
    calendar.end = undefined;
    calendar.endDate = undefined;
    $(".date").removeClass("selected");
    $(".day")
        .removeClass("selected")
        .removeClass("start")
        .removeClass("end")
        .removeClass("in-range");
    preferences.dates = {start: undefined, end: undefined};
    // make search-button unavailable since there are no selected dates
    if (!$("#search-button").hasClass("unavailable"))
        $("#search-button").addClass("unavailable")
}

// if a user is already logged in change the text of the big button on the left
function changeButton(logged) {
    if (logged) {
        $("#get-started-link").attr("href", "#");
        // (for small screens) add an arrow since there no left and right container and the clicking the button will make the window scroll down
        if (screenType < 2)
            $("#get-started").text("Find you place ▼");
        else
            $("#get-started").text("Find you place");
    }
    else {
        $("#get-started").text("Get started");
    }
}

// function used to open a chat
async function sendMessage(e) {
    let jwt;
    try {
        jwt = document.cookie.split("jwt=")[1].split(";")[0];
    }
    catch(err) {
        jwt = "0";
    }
    // Find the popup id (which is the place._id)
    const placeID = e.target.parentNode.parentNode.id;
    console.log("send message to " + placeID);
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + jwt
        },
        body: JSON.stringify({placeID: placeID})
    };
    // send the request
    const response = await fetch("/user/" + jwt + "/chat", options);
    // if the response is 401 (user not authenticated) display a popup redirecting to the login page
    if (response.status == 401 && $(".auth-popup").length === 0)
        $(".left-container").append(`<div class="auth-popup">You must <a href="/log.html" target="_blank">authenticate</a></div>`);
    // if the response is ok open the chat in a new page
    if (response.redirected)
        window.open(response.url,'_blank');
}

// function used to make a booking
async function book(e) {
    let jwt;
    try {
        jwt = document.cookie.split("jwt=")[1].split(";")[0];
    }
    catch(err) {
        jwt = "0";
    }
    // Find the popup id (which is the place._id)
    const placeID = e.target.parentNode.parentNode.id;
    const nights = (preferences.dates.end - preferences.dates.start) / 86400000 ;
    const price = parseInt($(".popup-price").text().split(" ")[0]);
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + jwt
        },
        body: JSON.stringify({placeID: placeID, dates: new Array(preferences.dates.start, preferences.dates.end), price: price, nights: nights})
    };
    // send the request
    const response = await fetch("/user/book-place", options);
    // if server responded with 401 (user not authenticated) display a popup redirecting to the login page
    if (response.status == 401) {
        if ($(".auth-popup").length === 0)
            $(".left-container").append(`<div class="auth-popup">You must <a href="/log.html" target="_blank">authenticate</a></div>`);
    }
    // if server responded with 403 (place not available) remove all popups and display a popup showing the error
    else if (response.status == 403) {
        $(".auth-popup").remove();
        $(".success-popup").remove();
        $(".fail-popup").remove();
        $(".left-container").append(`<div class="fail-popup">This place is not available anymore</div>`);
    }
    // otherwise remove all popups and display a successfull message
    else {
        $(".auth-popup").remove();
        $(".success-popup").remove();
        $(".fail-popup").remove();
        $(".left-container").append(`<div class="success-popup">Succesfully booked</div>`);
    }
}

async function loadPic() {
    let jwt;
    try {
        jwt = document.cookie.split("jwt=")[1].split(";")[0];
    }
    catch(err) {
        jwt = "0";
    }
    const options = {
        method: "GET", 
        headers: { 
            "Authorization": "Bearer " + jwt,
            "Content-Type": "image/jpeg"
        }
    };
    const response = await fetch("/user/picture", options);
    // if the server responded ok (user is authenticated)
    if (response.status === 200) {
        // this means that the user has already logged in so the left container's button should have the value "Find your place"
        changeButton(true);

        //if ($(".auth-popup").length !== 0)
        //    $(".auth-popup").addClass("hide");
        
        // convert the body to text
        const img = await response.text();
        // if the user hasn't set an image load the default user icon
        if (img == "")
            $("#user-icon>img").attr("src", "../images/userIcon.svg");
        // otherwise load the image
        else
            $("#user-icon>img").attr("src", img);
    }
    // otherwise load the default user icon (user in not authenticated)
    else {
        // this means that the user has not logged in so the left container's button should have the value "Get started"
        changeButton(false);
        $("#user-icon>img").attr("src", "../images/userIcon.svg");
        console.warn('Could not load profile picture.');
    }
}

// this function checks if the user is authenticated everytime the window has focus
//$(window).on('focus', loadPic);

// this function adjusts the a tag's 'href' so that it includes the user's jwt since there is no way of setting the headers
// when requesting a static html page through a direct link 
function includeJWTInURLs() {
    let jwt;
    try {
        jwt = document.cookie.split("jwt=")[1].split(";")[0];
    }
    catch(err) {
        jwt = "0";
    }
    for (let i = 0; i < $("a").length; i++) {
        let index = $($("a")[i]).attr("href").indexOf("user/");
        let path = $($("a")[i]).attr("href");
        
        // if the original href include the substring "user/" the url should be modified
        if (index != -1 && $($("a")[i]).attr("href").indexOf("log") == -1) {
            path = "/user/" + jwt + "/" + path.split("user/")[1];
            $($("a")[i]).attr("href", path);
        }
    }
}




$(document).ready(function() {
    loadPic();
    defineScreenSize();

    // set some event listeners to give a bettere user experience by changing the search form style on user interaction
    $(".search-form").focus(function() {
        if (this.value === "Search") {
            this.value="";
            $(this).css("color", "#000000").css("font-weight", "500");
        }
    });
    $(".search-form").focusout(function() {
        if (this.value == "") {
            this.value = "Search";
            $(this).css("color", "#cccccc").css("font-weight", "300");
            $("search-result").remove();
            $(".search-dropdown").fadeOut(0);
        }
    });
    $(".search-form").on("input", function() {
        if (this.value !== "")
            searchLocation(this.value)
                .then((locs) => dropdownResults(locs))
                .catch(err => console.log(err));
    });

    // get the outmost prices of all the places in the database
    getOutmostPrices();

    // set the event listeners of the price form
    $("#min-price").change(function() {
        // if the value is empty fill it with min price
        if ($(this).val() == "")
            $(this).val(minPrice);
        // if not check if it's less that the max price otherwise set it to the min price
        else {
            if (parseInt($(this).val()) < maxPrice && parseInt($(this).val()) >= min)
                minPrice = parseInt($(this).val());
            else {
                $(this).val(minPrice);
            }
        }
        // finally set the preference accordingly
        preferences.price.min = minPrice;
    });
    $("#max-price").change(function() {
        // if the value is empty fill it with max price
        if ($(this).val() == "")
            $(this).val(maxPrice);
        // if not check if it's greater that the min price otherwise set it to the max price
        else {
            if (parseInt($(this).val()) > minPrice && parseInt($(this).val()) <= max)
                maxPrice = parseInt($(this).val());
            else {
                $(this).val(maxPrice);
            }
        }
        // finally set the preference accordingly
        preferences.price.max = maxPrice;
    });

    // if the use presses 'enter' in the price form prevent default submission and trigger a click event on the search button
    $(".price-container").submit(function(e) {
        e.preventDefault();
        $("#search-button").click();
    });

    getLocationsContinent("")
        .then((locs) => displayLocationSlides(locs))
        .catch((err) => console.log(err));
    // if a continent is selected hide the locations that don't have that continent as a class
    $(".continent").click(function () {
        if ($(this).hasClass("selected")) {
            $(this).removeClass("selected");
            $(`.location-image.hide`).removeClass("hide");
        }
        else {
            $(".continent").removeClass("selected");
            $(this).addClass("selected")
            const continentName = $(this).text();
            $(".location-image").removeClass("hide");
            $('span[class^="location-image"]:not(.'+ continentName +')')
                .removeClass("selected")
                .addClass("hide");
        }
    });

    // set an event listener to handle the selection of the type of place
    $(".typeplace").click(function() {
        if (!$(this).hasClass("selected")) {
            $(this).addClass("selected");
            preferences.type.push($(this).find(".typeplace-text").text().toLowerCase());
        }
        else {
            $(this).removeClass("selected");
            preferences.type.splice(preferences.type.indexOf($(this).find(".typeplace-text").text().toLowerCase()), 1);
        }
    });

    // set event listeners for the "control icons" (small circular buttons containing either '+' or '-')
    $(".control-icon").click(function() {
        // minus button
        if ($(this).text() == "-") {
            let parent = $(this).parents(".date");
            // date button
            if (parent.length !== 0) {
                // subtract a day to the current date
                preferences.dates = calendar.controlDate(parent, false);
            }
            // guests or rooms button
            else {
                parent = $(this).parents(".type");
                let number = parseInt($(this).next().text());
                
                // if the number is 1 change the item's style
                if ($(parent).hasClass("selected")) {
                    if (number === 1)
                        $(parent).removeClass("selected");
                    // or the number is greater or equal then 1 subtract 1 
                    $(this).next().text(--number);
                }
            }
            
        }
        // plus button
        else if ($(this).text() == "+") {
            
            let parent = $(this).parents(".date");
            // date
            if (parent.length !== 0) {
                // add a day to the current date
                preferences.dates = calendar.controlDate(parent, true);
            }
            // guests or rooms button
            else {
                parent = $(this).parents(".type");
                let number = parseInt($(this).prev().text());

                // if the number is 0 change the item's style
                if (parent) {
                    if (!$(parent).hasClass("selected")) {
                        $(parent).addClass("selected");
                    }
                    // add 1
                    $(this).prev().text(++number);
                }
            }
        }
        // set the preferences accordingly
        preferences.guests = {
            adults: parseInt($("#number-adults").text()),
            children: parseInt($("#number-children").text()),
            infants: parseInt($("#number-infants").text())
        };
        preferences.rooms = {
            beds: parseInt($("#number-beds").text()),
            bedrooms: parseInt($("#number-bedrooms").text()),
            bathrooms: parseInt($("#number-bathrooms").text())
        };
    });

    $(".big-button").click(function() {
        let id = this.id;
        // if the user clicks on the left-container button and it's "Find your place" (and not "Get started")
        if (id === "get-started" && $("#get-started").text() != "Get started") {
            // (for small screens) scroll down to the filters
            if (screenType < 2) {
                $(window).scrollTop($(".left-container").height());
            }
            // focus the search bar
            else {
                $(window).scrollTop(0);
                $("#search").focus();
            }
        }
        // if the user clicks on the search button and it it available submit his preferences to the server
        else if (id === "search-button") {
            if ($(this).hasClass("unavailable")) {
                return;
            }
            submit();
        }
    });

    // when scrolling, if the screen is not small, the left container always stays visible
    $(window).scroll((e) => {
        if (screenType < 2) return;
        let scroll = $(window).scrollTop();
        if (scroll < $(".right-container").height());
            $(".left-container").css("transform", "translateY(" + scroll + "px)");
    })

    // (for small screens) scroll down when the user click the arrow down element
    $(".scroll").click(function() {
        window.scrollTo(0, $(".left-container").height());
    })


    // initialize calendar
    calendar.initCalendar();
    // clicking a day which is not passed, marks it as selected/unselected 
    $(".day").click(function() {
        let thisLi = $(this);
        if (thisLi.hasClass("passed")) return;
        let day = thisLi.text();
        let month = thisLi.parents().prevAll(".month-name").text();

        // if the start date is not defined then mark that day as the start date
        if (calendar.startDate == undefined) {
            calendar.setDate(thisLi, day, month, "start");
        }
        // if the end date is not defined
        else if (calendar.endDate == undefined) {
            // if the clicked day is the same as the start reset the start date
            if (thisLi[0] === calendar.startDayLi[0]) {
                calendar.start = undefined;
                calendar.startDate = undefined;
                resetCalendar();
            }
            // otherwise mark that day as the end date 
            else {
                preferences.dates = calendar.setDate(thisLi, day, month, "end");
                // if the location was already selected make the search button available
                if (preferences.location !== undefined)
                    $("#search-button").removeClass("unavailable");
            }
        }
        // if both start and end date were set reset the calendar and mark the clicked day as the start date
        else {
            resetCalendar();
            calendar.setDate(thisLi, day, month, "start");
        }
    });
    // slide months
    var currentMonthPos = 0, currentMonth = 1;
    $(".month-arrow").click(function() {
        // next month
        if (this.id === "next-month") {
            // allowed only if there is a following month to show
            if (currentMonth < 9) {
                currentMonth++;
                // on small screeen display only one month in the calendar
                if (screenType === 0)
                    currentMonthPos -= parseInt($(".month-container").width()) / 5;
                // on bigger screen display 2 months
                else
                    currentMonthPos -= parseInt($(".month-container").width()) / 10;
                $(".month").css("transform", "translate(" + currentMonthPos.toString() + "px");
            }
        }
        // previous month
        else {
            // allowed only if there is a previous month to show
            if (currentMonth > 1) {
                currentMonth--;
                // on small screeen display only one month in the calendar
                if (screenType === 0)
                    currentMonthPos += parseInt($(".month-container").width()) / 5;
                // on bigger screen display 2 months
                else
                    currentMonthPos += parseInt($(".month-container").width()) / 10;
                $(".month").css("transform", "translate(" + currentMonthPos.toString() + "px");
            }
        }
    });
    // clicking the reset icon will reset the calendar
    $(".reset-icon>img").click(resetCalendar);

    includeJWTInURLs();
});