$(document).ready(function() {

    $("item-open-icon").click(function() {
        const chat = $(this).parents(".item-container");
        console.log("opening chat:", chat.id);
    });
    getChatsList();
});

async function getChatsList() {
    const options = {
        mehod: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    }
    const response = await fetch("/user/chat-list", options);
    const chats = await response.json();
    if (chats.length === 0) {
        $(".main-messages-container").append(`
            <div class="no-messages-container">
                <p class="no-messages-text">There are no<br>messages to read</p>
            </div>
        `)
    }
    else {
        for (let i in chats) {
            $(".main-messages-container").append(`
                <div class="item-container" id="${chats[i]._id}">
                    <span class="item-image-container" style="overflow: hidden;"><img src="${chats[i].place.images[0]}" style="width: 100%; height: 100%; object-fit: cover;"></img></span>
                    <span class="item-text">
                        <div class="item-name">${chats[i].place.name}</div>
                        <div class="item-bottom">
                            <span class="item-price">${chats[i].place.price}€/night</span>
                            <span class="item-open-icon">···</span>
                        </div>
                    </span>
                </div>
            `);
        }
        $(".item-container").click(function() {
            const chatID = $(this).attr("id");
                window.location.href = "/user/chat/" + chatID;
        })
    }
}

$.ajax({
    url: '/user/picture',
    type: 'GET',
    success: function(data){
        if (data == "") {
            $("#user-icon>img").attr("src", "../images/userIcon.svg");
            $(".user-info-image>img").attr("src", "../images/userIcon.svg");
        }
        else {
            $("#user-icon>img").attr("src", data);
            $(".user-info-image>img").attr("src", data);
        }
    },
    error: function(data) {
        $("#user-icon>img").attr("src", "../images/userIcon.svg");
        $(".user-info-image>img").attr("src", "../images/userIcon.svg");
        console.warn('Could not load profile picture.');
    }
});

$.get("/user/profile-info", function(info) {
    if (info.name != "")
        $(".user-name").text(info.name);
    else
        $(".user-name").text("Name Surname");
});