"use strict";

//let jwt = document.cookie.split("jwt=")[1].split(";")[0];

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

let windowWidth = $(window).width();
$(window).resize(function() {
    windowWidth = $(window).width();
    defineScreenSize();
    if (screenType >= 2 && $("#get-started").text() == "Find you place ▼") {
        $("#get-started").text("Find your place");
    }
    else if (screenType < 2 && $("#get-started").text() == "Find your place") {
        $("#get-started").text("Find you place ▼");
    }
});

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
    return;
}

function searchLocation(text) {
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({location : text})
    }
    async function communicate() {
        const response = await fetch("/locations/name", options);
        const json = await response.json();
        return json; //this return a promise so in order to get it when it's resolved we have to use '.then()' 
    }
    return communicate()
}

function dropdownResults(locs) {
    $(".search-result").remove();
    if (locs.length !== 0) {
        $(".search-dropdown")
            .css("width", $(".right-container").width() + "px")
            .fadeIn(0);
        for (let i in locs) {
            $(".search-dropdown").append(`<div class="search-result" id="${locs[i].name}">${locs[i].name}</div>`);
        }

        $(".search-result").click(function() {
            const choosen = $(this).text();
            document.getElementById("search").value = choosen;
            $("search-result").remove();
            $(".search-dropdown").fadeOut(0);
            searchLocation(choosen)
                .then((res) => {
                    //console.log(res[0].continent);
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
    else {
        $(".search-dropdown").append(`<div class="search-result" style="color: #cccccc; font-style: italic; font-weight: 300">No results</div>`);
    }
}


async function getOutmostPrices(loc) {
    let location;
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

    min = json.min_price;
    max = json.max_price;
    minPrice = min;
    maxPrice = max;
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
    const json = await response.json();
    return json; //this return a promise so in order to get it when it's resolved we have to use '.then()' 
}

function displayLocationSlides(locations) {
    $(".location-image").remove();
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
    $(".location-image").click(function() {
        // initialise everything
        if($(this).hasClass("selected")) return;
        $(".location-image.unselected").removeClass("unselected");
        $(".location-image.selected").removeClass("selected");

        const thisName = $(this).attr("id");
        $(`.location-image:not([id="${thisName}"])`).addClass("unselected");
        $(this).addClass("selected");
        preferences.location = thisName;
        //const click = new MouseEvent('click');
        
        preferences.price = {min: -1, max: 1000000};
        if (preferences.dates.start !== undefined && preferences.dates.end !== undefined)
            $("#search-button").removeClass("unavailable");
    });
}

function submit() {
    $(".scroll").css("background-color", "#ffffff");
    
    if (!mapShowed) $(".map").fadeIn(100);
    mapShowed = true;
    
    for (let i in markers)
        mymap.removeLayer(markers[i]);
    markers = [];
    
    $(".left-container").find(".result-number").remove();
    submitPreferences()
        .then((data) => {
            if (data.length > 1)
                $(".left-container").append(`<div class="result-number">There are ${data.length} results</div>`);
            else if (data.length === 1)
                $(".left-container").append(`<div class="result-number">There is ${data.length} result</div>`);
            else
                $(".left-container").append(`<div class="result-number">Sorry, there are no results.</div>`);

            if (screenType < 2)
                $(".result-number").css("animation-delay", "0.6s");

            getOutmostPrices(preferences.location)
                .then((res) => {
                    $(".chart-text").remove();
                    initMap(data);
                    if(myChart) myChart.destroy();
                    initChart(data);
                })
                .catch((err) => console.log(err));
        })
        .catch((err) => console.log(err));
    
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
    const json = await response.json();
    return json;
}

const ctx = document.getElementById('chart-canvas').getContext('2d');
let myChart;
function initChart(places) {
    const segments = 8;
    const basis = (max + 0.001 - min)/segments;
    let labels = [];
    let data = new Array(segments);

    for (let i = 1; i <= segments; i++) {
        if (screenType < 2)
            labels.push("");
        else
            labels.push((basis*(i-1) + min).toFixed(2) + "€ - " + (basis*i + min).toFixed(2) + "€");
        data[i-1] = 0;
        for (let j in places) {
            if (places[j].price >= (basis*(i-1) + min) && places[j].price < (basis*i) + min) {
                data[i-1]++;
            }
        }
    }

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
let mymap = L.map('map');
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZmluZ2VycHJpbnRsYWIiLCJhIjoiY2traWlrcHYwMW5yZDJ3cXRjeW9uOTl1NSJ9.7bIbZx0Mar8v-fyKmjq7hg', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1IjoiZmluZ2VycHJpbnRsYWIiLCJhIjoiY2traWlrcHYwMW5yZDJ3cXRjeW9uOTl1NSJ9.7bIbZx0Mar8v-fyKmjq7hg'
}).addTo(mymap);

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

function initMap(data) {
    let lon = 0, lat = 0;
    for (let i in data) {
        lon += data[i].coordinates[0];
        lat += data[i].coordinates[1];
        
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
    // If there are no results, get the coordinates of the location form the opencage API
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
    else {
        center = [(lat/data.length), (lon/data.length)];
        mymap.setView(center, 12);
    }
}

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
    if (!$("#search-button").hasClass("unavailable"))
        $("#search-button").addClass("unavailable")
}

function changeButton(logged) {
    if (logged) {
        if (screenType < 2)
            $("#get-started").text("Find you place ▼");
        else
            $("#get-started").text("Find you place");
    }
    else {
        $("#get-started").text("Get started");
        //$("#get-started-link").attr("href", "/user/log.html");
    }
}

async function sendMessage(e) {
    // Find the popup id (which is the place._id)
    const placeID = e.target.parentNode.parentNode.id;
    console.log("send message to " + placeID);
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({placeID: placeID})
    };
    const response = await fetch("/user/chat", options);
    console.log(response);
    if (response.status == 401 && $(".auth-popup").length === 0)
        $(".left-container").append(`<div class="auth-popup">You must <a href="./user/log.html" target="_blank">authenticate</a></div>`);
    if (response.redirected)
        window.open(response.url,'_blank');
}

async function book(e) {
    // Find the popup id (which is the place._id)
    const placeID = e.target.parentNode.parentNode.id;
    const nights = (preferences.dates.end - preferences.dates.start) / 86400000 ;
    const price = parseInt($(".popup-price").text().split(" ")[0]);
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({placeID: placeID, dates: new Array(preferences.dates.start, preferences.dates.end), price: price, nights: nights})
    };
    const response = await fetch("/user/book-place", options);
    if (response.status == 401) {
        if ($(".auth-popup").length === 0)
            $(".left-container").append(`<div class="auth-popup">You must <a href="./user/log.html" target="_blank">authenticate</a></div>`);
    }
    else if (response.status == 403) {
        $(".auth-popup").remove();
        $(".success-popup").remove();
        $(".fail-popup").remove();
        $(".left-container").append(`<div class="fail-popup">This place is not available anymore</div>`);
    }
    else {
        $(".auth-popup").remove();
        $(".success-popup").remove();
        $(".fail-popup").remove();
        $(".left-container").append(`<div class="success-popup">Succesfully booked</div>`);
    }
}

async function loadPic() {
    const response = await fetch("/user/picture", {method: "GET", headers: { "Content-Type": "application/json" }});
    if (response.status === 200) {
        changeButton(true);
        if ($(".auth-popup").length !== 0)
            $(".auth-popup").addClass("hide");
        const img = await response.text();
        if (img == "")
            $("#user-icon>img").attr("src", "../images/userIcon.svg");
        else
            $("#user-icon>img").attr("src", img);
    }
    else {
        changeButton(false);
        $("#user-icon>img").attr("src", "../images/userIcon.svg");
        console.warn('Could not load profile picture.');
    }
}
loadPic();
//$(window).on('focus', loadPic);

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
        
        if (index != -1 && $($("a")[i]).attr("href").indexOf("log") == -1) {
            path = "/user/" + jwt + "/" + path.split("user/")[1];
            $($("a")[i]).attr("href", path);
        }
    }
}




$(document).ready(function() {
    // ------------- SCREEN SIZE ------------- //
    defineScreenSize();
    /*$("#user-icon").click(function() {
        window.location.href = "/user/profile.html";
    });*/



    // ---------------- FORMS ---------------- //
    $(".search-form").focus(function() {
        if (this.value === "Search") {
            this.value="";
            $(this)
                .css("color", "#000000")
                .css("font-weight", "500");
        }
    });

    $(".search-form").focusout(function() {
        if (this.value == "") {
            this.value = "Search";
            $(this)
                .css("color", "#cccccc")
                .css("font-weight", "300");
            $("search-result").remove();
            $(".search-dropdown").fadeOut(0);
        }
    });

    $(".search-form").on("input", function() {
        if (this.value !== "" && this.value.replace(/\s/g, '').length)
            searchLocation(this.value)
                .then((locs) => dropdownResults(locs))
                .catch(err => console.log(err));
    });

    getOutmostPrices();

    $("#min-price").change(function() {
        if ($(this).val() == "")
            $(this).val(minPrice);
        else {
            if (parseInt($(this).val()) < maxPrice && parseInt($(this).val()) >= min)
                minPrice = parseInt($(this).val());
            else {
                $(this).val(minPrice);
            }
        }
        preferences.price.min = minPrice;
    });

    $("#max-price").change(function() {
        if ($(this).val() == "")
            $(this).val(maxPrice);
        else {
            if (parseInt($(this).val()) > minPrice && parseInt($(this).val()) <= max)
                maxPrice = parseInt($(this).val());
            else {
                $(this).val(maxPrice);
            }
        }
        preferences.price.max = maxPrice;
    });

    $(".price-container").submit(function(e) {
        e.preventDefault();
        $("#search-button").click();
    });


    // -------------- LOCATION -------------- //
    getLocationsContinent("")
        .then((locs) => displayLocationSlides(locs))
        .catch((err) => console.log(err));

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



    // ------------ TYPE OF PLACE ------------ //
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



    // ------------ CONTROL ICONS ------------ //
    $(".control-icon").click(function() {
        if ($(this).text() == "-") {
            
            let parent = $(this).parents(".date");
            // Date button
            if (parent.length !== 0) {
                preferences.dates = calendar.controlDate(parent, false);
            }
            // Guests or rooms button
            else {
                parent = $(this).parents(".type");
                let number = parseInt($(this).next().text());
                
                if ($(parent).hasClass("selected")) {
                    if (number === 1)
                        $(parent).removeClass("selected");
                    $(this).next().text(--number);
                }
            }
            
        }
        else if ($(this).text() == "+") {
            
            let parent = $(this).parents(".date");
            // Date
            if (parent.length !== 0) {
                preferences.dates = calendar.controlDate(parent, true);
            }
            // Guests or rooms button
            else {
                parent = $(this).parents(".type");
                let number = parseInt($(this).prev().text());

                if (parent) {
                    if (!$(parent).hasClass("selected")) {
                        $(parent).addClass("selected");
                    }
                    $(this).prev().text(++number);
                }
            }
        }
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



    // --------------- BUTTONS --------------- //
    $("#get-started-link").click(function(e) {
        if ($(this).text() != "Get started") {
            e.preventDefault();
            return;
        }
    });

    $(".big-button").click(function() {
        let id = this.id;
        if (id === "get-started" && $("#get-started").text() != "Get started") {
            if (screenType < 2) {
                $(window).scrollTop($(".left-container").height());
                //setTimeout(function() {$("#search").focus()}, 800);
            }
            else {
                $(window).scrollTop(0);
                $("#search").focus();
            }
        }
        else if (id === "search-button") {
            if ($(this).hasClass("unavailable")) {
                return;
            }
            submit();
        }
    });


    $(window).scroll((e) => {
        if (screenType < 2) return;
        let scroll = $(window).scrollTop();
        if (scroll < $(".right-container").height());
            $(".left-container").css("transform", "translateY(" + scroll + "px)");
    })

    $(".scroll").click(function() {
        window.scrollTo(0, $(".left-container").height());
    })


    // --------------- CALENDAR -------------- //
    calendar.initCalendar();

    $(".day").click(function() {
        let thisLi = $(this);
        if (thisLi.hasClass("passed")) return;
        let day = thisLi.text();
        let month = thisLi.parents().prevAll(".month-name").text();

        if (calendar.startDate == undefined) {
            calendar.setDate(thisLi, day, month, "start");
        }

        else if (calendar.endDate == undefined) {
            if (thisLi[0] === calendar.startDayLi[0]) {
                calendar.start = undefined;
                calendar.startDate = undefined;
                resetCalendar();
            }
            else {
                preferences.dates = calendar.setDate(thisLi, day, month, "end");
                if (preferences.location !== undefined) $("#search-button").removeClass("unavailable");
            }
        }

        else {
            resetCalendar();
            calendar.setDate(thisLi, day, month, "start");
        }
    });

    var currentMonthPos = 0, currentMonth = 1;
    $(".month-arrow").click(function() {
        if (this.id === "next-month") {
            if (currentMonth < 9) {
                currentMonth++;
                if (screenType === 0)
                    currentMonthPos -= parseInt($(".month-container").width()) / 5;
                else
                    currentMonthPos -= parseInt($(".month-container").width()) / 10;
                $(".month").css("transform", "translate(" + currentMonthPos.toString() + "px");
            }
        }
        else {
            if (currentMonth > 1) {
                currentMonth--;
                if (screenType === 0)
                    currentMonthPos += parseInt($(".month-container").width()) / 5;
                else
                    currentMonthPos += parseInt($(".month-container").width()) / 10;
                $(".month").css("transform", "translate(" + currentMonthPos.toString() + "px");
            }
        }
    });

    $(".reset-icon>img").click(resetCalendar);

    includeJWTInURLs();
});