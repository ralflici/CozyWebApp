$(document).ready(function() {
    getList()
    .then((list) => {
        if (list.length != 0) {
            $(".no-bookings-container").remove();
            for (let i in list) {
                let start = new Date(list[i].dates[0]).toString().slice(4, 15).split(" ");
                let end = new Date(list[i].dates[1]).toString().slice(4, 15).split(" ");
                let status, statusIcon;
                if (list[i].status === "pending") {
                    status = "Pending"
                    statusIcon = "../../images/pending.svg";
                }
                else if (list[i].status === "approved") {
                    status = "Approved";
                    statusIcon = "../../images/approved.svg";
                }
                else {
                    status = "Rejected";
                    statusIcon = "../../images/rejected.svg";
                }

                $(".main-bookings-container").append(`
                    <div class="item-container" id="${list[i]._id}" >
                        <span class="item-image-container" style="overflow: hidden;"><img src="${list[i].place.images[0]}" style="width: 100%; height: 100%; object-fit: cover;"></img></span>
                        <span class="item-text">
                            <div class="item-name">${list[i].place.name}</div>
                            <div class="item-date">${start[1]} ${start[0]} ${start[2]} - ${end[1]} ${end[0]} ${end[2]}</div>
                            <div class="item-bottom">
                                <span class="item-price">${list[i].price}€</span>
                                <span class="item-icons">
                                    <span class="item-status"><img src="${statusIcon}" title="${status}"></span>
                                    <span class="item-delete-icon"><img style="cursor: pointer;" src="../../images/delete.svg" title="Delete booking"></span>
                                </span>
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
            "Authorization": "Bearer " + document.cookie.split("jwt=")[1].split(";")[0],
            "Content-Type": "application/json"
        }
    }
    const response = await fetch("/user/user-bookings-list", options);
    return await response.json();
}

async function deleteBooking(id) {
    const options = {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + document.cookie.split("jwt=")[1].split(";")[0],
            "Content-Type": "application/json"
        },
        body: JSON.stringify({bookingID: id})
    };
    const response = await fetch("/user/delete-booking", options);
    return response;
}