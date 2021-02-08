$(document).ready(function() {
    getList()
    .then((list) => {
        if (list.length != 0) {
            $(".no-bookings-container").remove();
            for (let i in list) {
                let start = new Date(list[i].dates[0]).toString().slice(4, 15).split(" ");
                //start = start.slice(0, 3) + "," + start.slice(3, start.length);
                let end = new Date(list[i].dates[1]).toString().slice(4, 15).split(" ");
                //end = end.slice(0, 3) + "," + end.slice(3, end.length);
                $(".main-bookings-container").append(`
                    <div class="item-container" id="${list[i]._id}" >
                        <span class="item-image-container" style="overflow: hidden;"><img src="${list[i].place.images[0]}" style="width: 100%; height: 100%; object-fit: cover;"></img></span>
                        <span class="item-text">
                            <div class="item-name">${list[i].place.name}</div>
                            <div class="item-date">${start[1]} ${start[0]} ${start[2]} - ${end[1]} ${end[0]} ${end[2]}</div>
                            <div class="item-bottom">
                                <span class="item-price">${list[i].price}€</span>
                                <span class="item-delete-icon">✖</span>
                            </div>
                        </span>
                    </div>
                `);
            }
            $(".item-delete-icon").click(async function(event) {
                const bookingID = $(this).parents(".item-container").attr("id");
                const response = await deleteBooking(bookingID)
                console.log("response:", response);
                if (response.redirected)
                    window.location.href = response.url;
            });
        }
        else {
            $(".main-bookings-container").append(`
                <div class="no-bookings-container">
                    <p class="no-bookings-text">There are no bookings</p>
                </div>
            `);
        }
    })
    .catch((err) => {throw err;});
});

async function getList() {
    const options = {
        mehod: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    }
    const response = await fetch("/user/bookings-list", options);
    return await response.json();
}

async function deleteBooking(id) {
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({bookingID: id})
    };
    const response = await fetch("/user/delete-booking", options);
    return response;
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