"use strict";

let selectedPlaceImage;

$(document).ready(function() {
    // retrieve the info from the server and display it
    displayChats();
    displayBookings();
    displayPlaces();

    // adjust the link to include the admin's jwt
    $("a").attr("href", window.location.href + "/new-place");

    $("#log-out").click(function() {
        // override the cookie
        document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        // redirect to login page
        window.location.href = "/log.html";
    });
});

async function loadChats() {
    const options = {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + document.cookie.split("jwt=")[1].split(";")[0],
        }
    };
    const response = await fetch("/admin/chats-list", options);
    return response.json();
}

async function displayChats() {
    const chats = await loadChats();
    for (let i in chats) {
        $("#messages-container>.content").append(`
            <div class="item-container" id="${chats[i]._id}">
                <span class="item-image-container" style="overflow: hidden;"><img src="${chats[i].place.images[0]}" style="width: 100%; height: 100%; object-fit: cover;"></img></span>
                <span class="item-text">
                    <div class="item-name">${chats[i].place.name}</div>
                    <div class="item-bottom">
                        <span class="item-user">${chats[i].user.name}</span>
                        <span class="item-icons">
                            <span class="item-open-icon" onclick="openConversation(this)">···</span>
                        </span>
                    </div>
                </span>
            </div>
        `);
    }
}

async function loadBookings() {
    const options = {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + document.cookie.split("jwt=")[1].split(";")[0],
        }
    };
    const response = await fetch("/admin/bookings-list", options);
    return response.json();
}

async function displayBookings() {
    const list = await loadBookings();
    for (let i in list) {
        // adjust the date format
        let start = new Date(list[i].dates[0]).toString().slice(4, 15).split(" ");
        let end = new Date(list[i].dates[1]).toString().slice(4, 15).split(" ");

        // set the right status icon
        let icons;
        if (list[i].status === "approved") {
            icons = `<span class="status-icon"><img src="../images/approved.svg" title="Approved"></span>`;
        }
        else if (list[i].status === "rejected"){
            icons = `<span class="status-icon"><img src="../images/rejected.svg" title="Rejected"></span>`;
        }
        else {
            icons = 
                `<span class="status-icon">
                    <span class="choice-icon approve" style="cursor: pointer;" onclick="approve(this)"><img src="../images/approved.svg" title="Approve" style="cursor: pointer;"></span>
                    <span class="choice-icon reject" style="cursor: pointer;" onclick="reject(this)"><img src="../images/rejected.svg" title="Reject" style="cursor: pointer;"></span>
                </span>`;
        }

        $("#bookings-container>.content").append(`
            <div class="item-container" id="${list[i]._id}" >
                <span class="item-image-container" style="overflow: hidden;"><img src="${list[i].place.images[0]}" style="width: 100%; height: 100%; object-fit: cover;"></img></span>
                <span class="item-text">
                    <div class="item-name">${list[i].place.name}</div>
                    <div class="item-date">${start[1]} ${start[0]} ${start[2]} - ${end[1]} ${end[0]} ${end[2]}</div>
                    <div class="item-bottom">
                        <span class="item-user">${list[i].user.name}</span>
                        <span class="item-icons">${icons}</span>
                    </div>
                </span>
            </div>
        `);
    }
}

// function triggered by the approve icon
async function approve(elem) {
    // get the booking id from the container
    const id = $(elem).parents(".item-container")[0].id;
    const options = {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + document.cookie.split("jwt=")[1].split(";")[0],
            "Content-Type": "application/json"
        },
        body: JSON.stringify({bookingID: id})
    };
    const response = await fetch("/admin/approve-booking", options);
    // refresh the page
    if (response.redirected)
        window.location.href = response.url;
}

// function triggered by the reject icon
async function reject(elem) {
    // get the booking id from the container
    const id = $(elem).parents(".item-container")[0].id;
    const options = {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + document.cookie.split("jwt=")[1].split(";")[0],
            "Content-Type": "application/json"
        },
        body: JSON.stringify({bookingID: id})
    };
    const response = await fetch("/admin/reject-booking", options);
    // refresh the page
    if (response.redirected)
        window.location.href = response.url;
}

async function openConversation(elem) {
    // get the chat's id
    const chatID = $(elem).parents(".item-container")[0].id;
    // get the conversation
    const conversation = await loadConversation(chatID);
    // append the chat popup
    $(".main-container").append(`
        <div class="chat-popup">
            <div class="chat" id="${chatID}">
                <div id="close-icon">✖</div>
                <div id="conversation-container"></div>
                <div id="message-form">
                    <textarea type="text" name="message" id="message-input" rows="1">Write a message</textarea>
                    <button id="send-button"><img src="../images/paperPlane.svg" alt="send"></button>
                </div>
                <p id="char-number">0/500</p>
            </div>
        </div>
    `);
    // store the place's image
    selectedPlaceImage = conversation.place.images[0];
    // load all the messages
    for (let i in conversation.chat.content) {
        const message = conversation.chat.content[i];
        const date = new Date(message.date).toString().substring(4,10).split(" ");
        $("#conversation-container").append(`
            <div class="message-item ${message.sender}">
                <span class="sender-image"><img src="${message.sender === "user" ? conversation.user.pic.data : conversation.place.images[0]}" alt=""></img></span>
                <span class="message-content">${message.message}</span>
                <div class="message-date">${date[1] + " " + date[0]}</div>
            </div>
        `);
        // scroll to the end of the chat to see the latest messages
        $("#conversation-container").scrollTop(999999999);
    }
    // bind the event to the close icon
    $("#close-icon").click(function() {
        // erase the place's image for later user in a different chat
        selectedPlaceImage = undefined;
        $(".chat-popup").remove();
    });
    
    // dinamically resize the textarea on input
    $('textarea').each(function () {
        this.setAttribute('style', 'height:' + (this.scrollHeight) + 'px;overflow-y:hidden;');
    })
    .on('input', function () {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        $("#message-form").css("height", "auto").css("height", (this.scrollHeight + 13) + "px");
        $("#char-number").text(this.value.length + "/500");
    })
    // when the textarea is focused remove the "Write a message" text and change the style
    .focus(function() {
        $(this).css("color", "#000");
        if ($(this).val() === "Write a message")
            $(this).val("");
    })
    // when the textarea is focused-out and if there is no text, add the "Write a message" text and change the style
    .focusout(function() {
        if ($(this).val() === "") {
            $(this).val("Write a message");
            $(this).css("color", "#707070");
        }
        else {
            $(this).css("color", "#000");
        }
    });

    // bind the event to the send message button
    $("#send-button").click(function() {
        sendMessage($(this).parents(".chat")[0].id)
    });
}

async function loadConversation(chatID) {
    const options = {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + document.cookie.split("jwt=")[1].split(";")[0]
        }
    };
    const response = await fetch("/admin/conversation/" + chatID, options);
    return response.json();
}

async function sendMessage(chatID) {
    if ($("#message-input").val() === "Write a message") return;
    const message = $("#message-input").val();
    
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + document.cookie.split("jwt=")[1].split(";")[0]
        },
        body: JSON.stringify({chatID: chatID, sender: "place", message: message})
    };
    // send the message
    const response = await fetch("/admin/send-message", options);
    // if the server responded ok, append the new message to the chat
    if (response.status === 200) {
        let date = new Date();
        date = date.toDateString().slice(4,11).split(" ");
        $("#conversation-container").append(`
            <div class="message-item place">
                <span class="sender-image"><img src="${selectedPlaceImage}" alt=""></img></span>
                <span class="message-content">${message}</span>
                <div class="message-date">${date[1] + " " + date[0]}</div>
            </div>
        `);
        // scroll down to show it
        $("#conversation-container").scrollTop(999999999);
        // initialize the textarea
        $("textarea").val("Write a message");
        $("textarea").css("color", "#707070");
    }
};

async function displayPlaces() {
    const response = await fetch("/places");
    const list = await response.json();

    for (let i in list) {
        $("#places-container>.content").append(`
            <div class="item-container" id="${list[i]._id}" onclick="openPlace(this)">
                <span class="item-image-container" style="overflow: hidden;"><img src="${list[i].images[0]}" style="width: 100%; height: 100%; object-fit: cover;"></img></span>
                <span class="item-text">
                    <div class="item-name">${list[i].name}</div>
                    <div class="item-location">${list[i].location.name}, ${list[i].location.country}</div>
                    <div class="item-bottom">
                        <span class="item-location">${list[i].price}€/night</span>
                    </div>
                </span>
            </div>
        `);
    }
}

async function openPlace(elem) {
    // request the place page
    const response = await fetch("/admin/" + document.cookie.split("jwt=")[1].split(";")[0] + "/place/" + elem.id);
    // redirect to that page
    window.location.href = response.url;
}