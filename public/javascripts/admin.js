let selectedPlaceImage;

$(document).ready(function() {
    displayChats();
    displayBookings();
    displayPlaces();

    $("a").attr("href", window.location.href + "/new-place");

    $(".log-out").click(function() {
        document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
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
    //console.log(chats);
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
        let start = new Date(list[i].dates[0]).toString().slice(4, 15).split(" ");
        let end = new Date(list[i].dates[1]).toString().slice(4, 15).split(" ");

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

    $(".item-delete-icon").click(async function(event) {
        const bookingID = $(this).parents(".item-container").attr("id");
        const response = await deleteBooking(bookingID)
        //console.log("response:", response);
        if (response.redirected)
            window.location.href = response.url;
    });
}

async function approve(elem) {
    const id = $(elem).parents(".item-container")[0].id;
    console.log(id);
    const options = {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + document.cookie.split("jwt=")[1].split(";")[0],
            "Content-Type": "application/json"
        },
        body: JSON.stringify({bookingID: id})
    };
    const response = await fetch("/admin/approve-booking", options);
    if (response.redirected)
        window.location.href = response.url;
}

async function reject(elem) {
    const id = $(elem).parents(".item-container")[0].id;
    console.log(id);
    const options = {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + document.cookie.split("jwt=")[1].split(";")[0],
            "Content-Type": "application/json"
        },
        body: JSON.stringify({bookingID: id})
    };
    const response = await fetch("/admin/reject-booking", options);
    if (response.redirected)
        window.location.href = response.url;
}

async function openConversation(elem) {
    const chatID = $(elem).parents(".item-container")[0].id;
    const conversation = await loadConversation(chatID);
    console.log(conversation);
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
    
    selectedPlaceImage = conversation.place.images[0];

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
        $("#conversation-container").scrollTop(999999999);
    }

    $("#close-icon").click(function() {
        selectedPlaceImage = undefined;
        $(".chat-popup").remove();
    });

    $('textarea').each(function () {
        this.setAttribute('style', 'height:' + (this.scrollHeight) + 'px;overflow-y:hidden;');
        //$("#message-form").setAttribute('style', 'height:' + (this.scrollHeight) + 'px;overflow-y:hidden;');
    }).on('input', function () {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        $("#message-form").css("height", "auto").css("height", (this.scrollHeight + 13) + "px");
        $("#char-number").text(this.value.length + "/500");
    }).focus(function() {
        $(this).css("color", "#000");
        if ($(this).val() === "Write a message")
            $(this).val("");
    }).focusout(function() {
        if ($(this).val() === "") {
            $(this).val("Write a message");
            $(this).css("color", "#707070");
        }
        else {
            $(this).css("color", "#000");
        }
    });

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
    console.log("Message to send:\n" + message);
    console.log("chat id:", chatID);
    
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + document.cookie.split("jwt=")[1].split(";")[0]
        },
        body: JSON.stringify({chatID: chatID, sender: "place", message: message})
    };
    const response = await fetch("/admin/send-message", options);
    if (response.status === 200) {
        let date = new Date();
        date = date.toDateString().slice(4,9).split(" ");
        $("#conversation-container").append(`
            <div class="message-item place">
                <span class="sender-image"><img src="${selectedPlaceImage}" alt=""></img></span>
                <span class="message-content">${message}</span>
                <div class="message-date">${date[1] + " " + date[0]}</div>
            </div>
        `);
        $("#conversation-container").scrollTop(999999999);
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
    console.log(elem.id);
    const response = await fetch("/admin/" + document.cookie.split("jwt=")[1].split(";")[0] + "/place/" + elem.id);
    console.log(response)
    window.location.href = response.url
}