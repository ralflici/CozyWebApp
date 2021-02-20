"use strict";

$(window).ready(function() {
    loadConversation();
});

async function loadConversation() {
    const options = {
        method: "GET",
        header: {
            "Authorization": "Bearer " + document.cookie.split("jwt=")[1].split(";")[0]
        }
    };
    const response = await fetch(window.location.href + "/conversation", options);
    const data = await response.json();
    // if there were no errors
    if (response.status < 400) {
        // populate the place slide with the information retrieved
        $(".place-slide-container").append(`
            <div class="place-slide-image"><img width="100%" height="100%" style="object-fit: cover;" src="${data.place.images[0]}"></img></div>
            <h2 class="place-slide-name">${data.place.name}</h2>
            <p class="place-slide-location">${data.place.location.name}<br>${data.place.location.country}</p>
            <p class="place-slide-price">${data.place.price}€/night</p>
        `);

        // load the user image for the chat
        const response = await fetch("/user/picture", { method: "GET", headers: { "Content-Type": "image/jpeg", "Authorization": "Bearer " + document.cookie.split("jwt=")[1].split(";")[0] }});
        // convert it to text since it is stored as a string
        let image = await response.text();
        // if the user hasn't loaded any picture then user the standard icon
        if (image == "")
            image = "../images/userIcon.svg";

        // if there are messages in the chat append the vignette with the messages's content
        if (data.chat.content.length !== 0) {
            for (let i in data.chat.content) {
                const message = data.chat.content[i];
                const date = new Date(message.date).toString().substring(4,10).split(" ");
                $("#conversation-container").append(`
                    <div class="message-item ${message.sender}">
                        <span class="sender-image"><img src="${message.sender === "user" ? image : data.place.images[0]}" alt=""></img></span>
                        <span class="message-content">${message.message}</span>
                        <div class="message-date">${date[1] + " " + date[0]}</div>
                    </div>
                `);
                // scroll to the end of the chat to see the most recent messages
                $("#conversation-container").scrollTop(999999999);
            }
        }
        // if there are no messages append an element saying "Start a conversation"
        else {
            $("#conversation-container").append(`<p id="start-conversation">Start a conversation</p>`);
        }
    }
    else {
        console.log(response);
    }
}


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

$("button").click(sendMessage);

async function sendMessage() {
    // never send "Write a message"
    if ($("#message-input").val() === "Write a message") return;
    // get the message text and the chat's id from the current url
    const message = $("#message-input").val();
    const arr = window.location.href.split("/");
    const chatID = arr[arr.length-1];
    
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + document.cookie.split("jwt=")[1].split(";")[0]
        },
        body: JSON.stringify({chatID: chatID, sender: "user", message: message})
    };
    // send the message
    const response = await fetch("/user/send-message", options);
    // refresh the page
    if (response.redirected)
        window.location.href = response.url;
};
