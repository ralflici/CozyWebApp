"use strict";

$(document).ready(function() {
    // ----------- GLOBAL VARIABLES ---------- //
    let mapShowed = false;
    let windowWidth = $(window).width();
    let windowHeight = $(window).height();

    let min = getPrice(false), max = getPrice(true);
    let minPrice = 10, maxPrice = 100;
    
    // 0:    0px -  425px (mobile)
    // 1:  426px - 1366px (small)
    // 2: 1367px - 1920px (normal)
    // 3: 1921px -    inf (wide)
    let screenType;

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
        price: [],
        rooms: {
            beds: 0,
            bedrooms: 0,
            bathrooms: 0
        }
    }
    // --------------------------------------- //



    // ------------- SCREEN SIZE ------------- // 
    defineScreenSize();
    $(window).resize(function() {
        windowWidth = $(window).width();
        windowHeight = $(window).height();
        defineScreenSize();
    })

    function defineScreenSize() {
        if (windowWidth < 426) {
            screenType = 0;
            $(".left-container").css("border-radius", "0px");
        }
        else if (windowWidth < 1367) {
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
    // --------------------------------------- //



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
        //console.log(locs);
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
    };

    $("#min-price")
        .attr("min", min) // <------------------ Can't do this cause min is fetched and thus must be awaited
        .val(min)
        .change(function() {
            if ($(this).val() == "")
                $(this).val(minPrice);
            else {
                if (parseInt($(this).val()) < maxPrice && parseInt($(this).val()) >= min)
                    minPrice = parseInt($(this).val());
                else {
                    $(this).val(minPrice);
                }
            }
        });

    $("#max-price")
        .attr("max", max)
        .val(max)
        .change(function() {
            if ($(this).val() == "")
                $(this).val(maxPrice);
            else {
                if (parseInt($(this).val()) > minPrice && parseInt($(this).val()) <= max)
                    maxPrice = parseInt($(this).val());
                else {
                    $(this).val(maxPrice);
                }
            }
        });

    function getPrice(max) {
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({})
        }
        async function communicate() {
            const response = await fetch("/places/price", options);
            const json = await response.json();
            return json; //this return a promise so in order to get it when it's resolved we have to use '.then()' 
        }
        let price;
        communicate()
            .then((places) => {
                console.log(places);
                let prices = [];
                for (let i in places) 
                    prices.push(places[i].price);
                if (max)
                    price = Math.max(...prices);
                else
                    price = Math.min(...prices);
                console.log(price)
                return price;
            })
            .catch((err) => console.log(err));
    }
    // --------------------------------------- //


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
    function getLocationsContinent(continent) {
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({continent : continent})
        }
        async function communicate() {
            const response = await fetch("/locations/continent", options);
            const json = await response.json();
            return json; //this return a promise so in order to get it when it's resolved we have to use '.then()' 
        }
        return communicate()
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
            $(".location-image.selected").removeClass("selected");
            $(this).addClass("selected");
            preferences.location = $(this).find(".location-city").text();
        })
    }
    // --------------------------------------- //



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
        console.log(preferences)
    });
    // --------------------------------------- //



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
    // --------------------------------------- //



    // ------------- PRICE CHART ------------- //
    const points = 20;
    var values = new Array(points);

    let sketch = function(p) {
        var basis = (max-min)/points;

        const width = $("#chart-container").width();
        const height = $("#chart-container").height();
        let noiseOffset = 0;
        let density = width/points;
        p.setup = function() {
            p.createCanvas(width, height);
            for (let i = 0; i < values.length; i++) {
                values[i] = p.noise(noiseOffset)*250;
                noiseOffset += 0.8;
            }
        }

        p.draw = function() {
            p.background("#ffffff");
            p.stroke("#EF4923");
            p.strokeWeight(1);
            let full = p.color(239, 73, 35, 90);
            let empty = p.color(239, 73, 35, 10);

            let start = Math.floor((minPrice-min)/basis);
            let finish = Math.floor((max-maxPrice)/basis);
            let i;
            for (i = 0; i < start; i++) {
                p.fill(empty);
                p.rect(i*density, height-values[i], density, values[i]+2);
            }
            for (; i < values.length - finish; i++) {
                p.fill(full);
                p.rect(i*density, height-values[i], density, values[i]+2);
            }
            for (; i < values.length; i++) {
                p.fill(empty);
                p.rect(i*density, height-values[i], density, values[i]+2);
            }
        }
    };
    new p5(sketch, "chart-container");
    // --------------------------------------- //



    // --------------- BUTTONS --------------- //
    $(".big-button").click(function() {
        let id = this.id;
        if (id === "get-started")
            console.log("get started");
        else if (id === "search-button") {
            if (!mapShowed) {
                mapShowed = true;
                $(".scroll").css("background-color", "#ffffff");
                $(".map").fadeIn(100);
                //$("#popup").fadeIn(100);
                //$(".small-popup").fadeIn(100);
                initMap();
            }
            if (screenType < 2) {
                window.scrollTo(0, 0);
            }
        }
    });
    // --------------------------------------- //


    // ----------------- MAP ----------------- // 
    function initMap() {
        /*
        const containerCastello = document.getElementById('popup');
        const castello = new ol.Overlay({
            element: containerCastello,
            autopan: true,
            autoPanAnimation: {
                duration: 250
            }
        });
        castello.setPosition([1473372.7202053638, 5790745.382380794]);
        
        const overlay = new ol.Overlay({
            element: containerOverlay,
            autopan: true,
            autoPanAnimation: {
                duration: 250
            }
        });
        overlay.setPosition([1474000, 5790000]);
        */

        /*
        var overlay = new Array();
        $.getJSON("geoExample.geojson", function(json) {
            let popup = new Array(json.features.length);
            for (let i = 0; i < json.features.length; i++) {
                popup[i] = document.createElement("div");
                popup[i].setAttribute("id", json.features[i].properties.id);
                popup[i].className = "small-popup";
                popup[i].innerHTML =
                    `<svg xmlns="http://www.w3.org/2000/svg" width="29" height="44.726" viewBox="0 0 29 44.726">
                        <g id="Esclusione_1" data-name="Esclusione 1" fill="#fff">
                            <path d="M 14.49990081787109 43.53302383422852 C 14.13278388977051 43.15526962280273 13.37441253662109 42.24657440185547 12.01256084442139 40.12351989746094 C 10.58529090881348 37.89847946166992 8.967680931091309 35.06888961791992 7.457700729370117 32.15600204467773 C 5.622070789337158 28.61493110656738 4.061790943145752 25.18827056884766 2.945550918579102 22.24649047851563 C 1.65458083152771 18.84423065185547 1.000000834465027 16.23790168762207 1.000000834465027 14.49990081787109 C 1.000000834465027 10.89389133453369 2.404220819473267 7.503751277923584 4.953980922698975 4.953980922698975 C 7.503750801086426 2.404221057891846 10.89389038085938 1.000001192092896 14.49990081787109 1.000001192092896 C 18.10591125488281 1.000001192092896 21.49604988098145 2.404221057891846 24.04582023620605 4.953980922698975 C 26.5955810546875 7.503751277923584 27.99980163574219 10.89389133453369 27.99980163574219 14.49990081787109 C 27.99980163574219 16.23790168762207 27.3452205657959 18.84423065185547 26.05425071716309 22.24649047851563 C 24.93801116943359 25.18827056884766 23.37773132324219 28.61493110656738 21.54211044311523 32.15600204467773 C 20.0321216583252 35.06888961791992 18.41451072692871 37.89847946166992 16.98724174499512 40.12351989746094 C 15.62538909912109 42.24657440185547 14.86701774597168 43.15526962280273 14.49990081787109 43.53302383422852 Z M 14.49990081787109 8.999900817871094 C 11.46719074249268 8.999900817871094 8.999900817871094 11.46719074249268 8.999900817871094 14.49990081787109 C 8.999900817871094 17.53261184692383 11.46719074249268 19.99990081787109 14.49990081787109 19.99990081787109 C 17.5326099395752 19.99990081787109 19.99990081787109 17.53261184692383 19.99990081787109 14.49990081787109 C 19.99990081787109 11.46719074249268 17.5326099395752 8.999900817871094 14.49990081787109 8.999900817871094 Z" stroke="none"/>
                            <path d="M 14.49990081787109 41.97443389892578 C 14.93983173370361 41.39493942260742 15.53948593139648 40.53951263427734 16.30554008483887 39.33283233642578 C 17.67598152160645 37.17414093017578 19.22040176391602 34.46192169189453 20.65430068969727 31.69578170776367 C 22.47251129150391 28.18831062316895 24.01648139953613 24.79812049865723 25.11930084228516 21.89172172546387 C 26.67355155944824 17.79561042785645 26.99980163574219 15.61115074157715 26.99980163574219 14.49990081787109 C 26.99980163574219 11.16100120544434 25.69960021972656 8.021981239318848 23.33872032165527 5.661091327667236 C 20.97782135009766 3.300201177597046 17.83880043029785 2.000001192092896 14.49990081787109 2.000001192092896 C 11.16100120544434 2.000001192092896 8.021981239318848 3.300201177597046 5.661090850830078 5.661081314086914 C 3.300200700759888 8.021981239318848 2.000000715255737 11.16100120544434 2.000000715255737 14.49990081787109 C 2.000000715255737 15.61115074157715 2.326250791549683 17.79561042785645 3.880500793457031 21.89172172546387 C 4.983320713043213 24.79812049865723 6.527290821075439 28.18831062316895 8.345500946044922 31.69578170776367 C 9.779400825500488 34.46192169189453 11.32382106781006 37.17414093017578 12.694260597229 39.33283233642578 C 13.4603157043457 40.53951263427734 14.05996990203857 41.39493942260742 14.49990081787109 41.97443389892578 M 14.49990081787109 7.999901294708252 C 18.08401107788086 7.999901294708252 20.99990081787109 10.91579151153564 20.99990081787109 14.49990081787109 C 20.99990081787109 18.08401107788086 18.08401107788086 20.99990081787109 14.49990081787109 20.99990081787109 C 10.91579055786133 20.99990081787109 7.999900817871094 18.08401107788086 7.999900817871094 14.49990081787109 C 7.999900817871094 10.91579151153564 10.91579055786133 7.999901294708252 14.49990081787109 7.999901294708252 M 14.49990081787109 44.72640228271484 C 13.6042308807373 44.72640228271484 9.97273063659668 39.18062210083008 6.569890975952148 32.6162223815918 C 4.716860771179199 29.04157066345215 3.140280723571777 25.57846069335938 2.010590791702271 22.60125160217285 C 0.6764608025550842 19.08525085449219 8.178710686479462e-07 16.35956192016602 8.178710686479462e-07 14.49990081787109 C 8.178710686479462e-07 10.62677097320557 1.508240818977356 6.985511302947998 4.246870994567871 4.246870994567871 C 6.98551082611084 1.508241176605225 10.62677097320557 1.141357415690436e-06 14.49990081787109 1.141357415690436e-06 C 18.37303161621094 1.141357415690436e-06 22.01429176330566 1.508241176605225 24.75293159484863 4.246870994567871 C 27.4915599822998 6.985511302947998 28.99980163574219 10.62677097320557 28.99980163574219 14.49990081787109 C 28.99980163574219 16.35956192016602 28.32334136962891 19.08525085449219 26.98921012878418 22.60125160217285 C 25.85951995849609 25.57846069335938 24.28293991088867 29.04157066345215 22.42991065979004 32.6162223815918 C 19.02707099914551 39.18062210083008 15.39557075500488 44.72640228271484 14.49990081787109 44.72640228271484 Z M 14.49990081787109 9.999900817871094 C 12.01859092712402 9.999900817871094 9.999900817871094 12.01859092712402 9.999900817871094 14.49990081787109 C 9.999900817871094 16.98121070861816 12.01859092712402 18.99990081787109 14.49990081787109 18.99990081787109 C 16.98121070861816 18.99990081787109 18.99990081787109 16.98121070861816 18.99990081787109 14.49990081787109 C 18.99990081787109 12.01859092712402 16.98121070861816 9.999900817871094 14.49990081787109 9.999900817871094 Z" stroke="none" fill="#707070"/>
                        </g>
                    </svg>`
                ;
                document.querySelector(".left-container").appendChild(popup[i]);
                
                let loc = new ol.Overlay({
                    element: popup[i],
                    autopan: true,
                    autoPanAnimation: {
                        duration: 250
                    }
                });
                loc.setPosition(json.features[i].geometry.coordinates);
                overlay.push(loc);
            }
        });
        */

        // Define the placeholder icon style
        const iconStyle = new ol.style.Style({
            image: new ol.style.Icon({
                anchor: [0.5, 1],
                anchorXUnits: 'fraction',
                anchorYUnits: 'fraction',
                src: '/images/smallPopup.svg',
            }),
        });
        // Set the source of the required geojson data
        const geojsonSource = new ol.source.Vector({
            url: "/data/geoExample.geojson",
            format: new ol.format.GeoJSON()
        });
        // Load the geojson data into a vector image and assign it the icon style
        const geoData = new ol.layer.VectorImage({
            source: geojsonSource,
            visible: true,
            title: "Example",
            style: iconStyle
        });

        // Define the map
        const center = [13.230720, 46.064940];
        const map = new ol.Map({
            view: new ol.View({
                center: ol.proj.fromLonLat(center),
                zoom: 15,
                maxZoom: 18,
                minZoom: 12
            }),
            target: 'map',
        });

        // Define the default map layer  
        const standardLayer = new ol.layer.Tile({
            source: new ol.source.OSM(),
            visible: true,
            title: "OSMStandard"
        })
        // Add the layers to the map
        map.addLayer(standardLayer);
        map.addLayer(geoData);

        // Fade in the popup if the user clicks on the icons
        map.on("click", function(e) {
            var feature = map.forEachFeatureAtPixel(e.pixel, function (feature) {
                return feature;
            });
            if (feature) {
                showPopup(feature, map);
            }
            else {
                $(".ol-popup").fadeOut(100);
            }
        });
        // Fade out the popup when there is a movement in tha map to avoid weird behavior
        map.on("movestart", function() {
            $(".ol-popup").fadeOut(100);
        })
    }

    function showPopup(icon, map) {
        let coordinate = icon.getGeometry().getCoordinates();
        let pixel = map.getPixelFromCoordinate(coordinate);
        let id = icon.get("id");
        let name = icon.get("name");
        let price = icon.get("price");

        // TODO:
        // load images
        // display slide indicators

        $(".ol-popup")
            .attr('id', id)
            .css("z-index", "10")
            .fadeIn(100)
            .css("top", pixel[1]  - 408)
            .css("left", pixel[0]  - 135);
        $(".popup-text").text(name);
        $(".popup-price").text(price + "€/night");
    }

    $(window).scroll((e) => {
        if (screenType < 2) return;
        let scroll = $(window).scrollTop();
        if (scroll < $(".right-container").height());
            $(".left-container").css("transform", "translateY(" + scroll + "px)");
    })

    $(".scroll").click(function() {
        window.scrollTo(0, $(".left-container").height());
    })
    // --------------------------------------- //



    // ---------------- POPUP ---------------- // 
    $(".popup-image-arrow").click(function() {
        let visible = $(".popup-slide-container").children(".visible");
        if (this.id === "prev") {
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
    })


    // TODO:
    // send info to server about the user's action
    $(".popup-vignette").click(function() {
        const locationID = $(this).parents(".ol-popup").attr("id");
        //window.location.href = "./user/messages.htm";
        sendMessage(locationID);
    })
    function sendMessage(id) {
        console.log("send message to location with id " + id)
    }
    $(".popup-checkmark").click(function() {
        const locationID = $(this).parents(".ol-popup").attr("id");
        //window.location.href = "./user/bookings.htm";
        book(locationID);
    })
    function book(id) {
        console.log("book location with id " + id)
    }
    // --------------------------------------- //



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
                currentMonthPos -= parseInt($(".month-container").width()) / 10;
                $(".month").css("transform", "translate(" + currentMonthPos.toString() + "px");
            }
        }
        else {
            if (currentMonth > 1) {
                currentMonth--;
                currentMonthPos += parseInt($(".month-container").width()) / 10;
                $(".month").css("transform", "translate(" + currentMonthPos.toString() + "px");
            }
        }
    });

    $(".reset-icon>img").click(resetCalendar);
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
    }
    // --------------------------------------- //


    // ------------- SERVER ----------------- //
    function sendServer(path, dataObject) {
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dataObject)
        }
        async function communicate() {
            const response = await fetch(path, options);
            const json = await response.json();
            return json; //this return a promise so in order to get it when it's resolved we have to use '.then()' 
        }
        return communicate()
        //.then(res => console.log(res))
        //.catch(err => console.log(err));
    }
    
    /*
    fetch("/api", options)
    .then(response => response.json())
    .then(res => console.log(res))
    .catch(error => console.log(error));

    fetch("https://api.punkapi.com/v2/beers/random", {mode: "cors"})
    .then(function(response) {
        response.json().then(function(data) {
            console.log(data[0]);
        });
    })
    */
    // --------------------------------------- //
});