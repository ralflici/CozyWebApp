$.ajax({
    url: window.location.href + "/conversation",
    type: 'GET',
    beforeSend: function(xhr) {
        xhr.setRequestHeader("Authorization", "Bearer " + document.cookie.split("jwt=")[1].split(";")[0]);
    },
    success: async function(data){
        $(".place-slide-container").append(`
            <div class="place-slide-image"><img width="100%" height="100%" style="object-fit: cover;" src="${data.place.images[0]}"></img></div>
            <h2 class="place-slide-name">${data.place.name}</h2>
            <p class="place-slide-location">${data.place.location.name}<br>${data.place.location.country}</p>
            <p class="place-slide-price">${data.place.price}€/night</p>
        `);

        const response = await fetch("/user/picture", { method: "GET", headers: { "Content-Type": "image/jpeg", "Authorization": "Bearer " + document.cookie.split("jwt=")[1].split(";")[0] }});
        let image = await response.text();
        if (image == "")
            image = "../images/userIcon.svg";

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
                $("#conversation-container").scrollTop(999999999);
            }
        }
        else {
            $("#conversation-container").append(`<p id="start-conversation">Start a conversation</p>`);
        }
    },
    error: function(data) {
        console.log(data)
    }
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

$("button").click(sendMessage);

async function sendMessage() {
    if ($("#message-input").val() === "Write a message") return;
    const message = $("#message-input").val();
    const arr = window.location.href.split("/");
    const chatID = arr[arr.length-1];
    console.log("Message to send:\n" + message);
    console.log("chat id:", chatID);
    
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + document.cookie.split("jwt=")[1].split(";")[0]
        },
        body: JSON.stringify({chatID: chatID, sender: "user", message: message})
    };
    const response = await fetch("/user/send-message", options);
    if (response.redirected)
        window.location.href = response.url;
};
