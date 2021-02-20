"use strict";

$(document).ready(function() {
    getChatsList();
});

async function getChatsList() {
    const options = {
        mehod: "GET",
        headers: {
            "Authorization": "Bearer " + document.cookie.split("jwt=")[1].split(";")[0]
        }
    }
    // get user's chats
    const response = await fetch("/user/user-chats-list", options);
    const chats = await response.json();
    // if there aren't signal it to the user
    if (chats.length === 0) {
        $(".main-messages-container").append(`
            <div class="no-messages-container">
                <p class="no-messages-text">There are no<br>messages to read</p>
            </div>
        `)
    }
    // otherwise append the elements relative to the chats
    else {
        for (let i in chats) {
            $(".main-messages-container").append(`
                <div class="item-container" id="${chats[i]._id}">
                    <span class="item-image-container" style="overflow: hidden;"><img src="${chats[i].place.images[0]}" style="width: 100%; height: 100%; object-fit: cover;"></img></span>
                    <span class="item-text">
                        <div class="item-name">${chats[i].place.name}</div>
                        <div class="item-bottom">
                            <span class="item-price">${chats[i].place.price}€/night</span>
                            <span class="item-icons">
                            <a style="cursor: pointer;" href="/user/${document.cookie.split("jwt=")[1].split(";")[0]}/chat/${chats[i]._id}"><span class="item-open-icon">···</span></a>
                            </span>
                        </div>
                    </span>
                </div>
            `);
        }
    }
}