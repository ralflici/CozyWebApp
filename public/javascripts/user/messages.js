$(document).ready(function() {

    $("item-open-icon").click(function() {
        const chat = $(this).parents(".item-container");
        console.log("opening chat:", chat.id);
    });
});

async function getChatsList() {
    const options = {
        mehod: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    }
    const response = await fetch("/user/chats-list", options);
    const json = await response.json();
    console.log(json);
}