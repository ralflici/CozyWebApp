$(document).ready(function() {
    getList()
    .then((list) => {
        if (list.length != 0) {
            $(".no-bookings-container").remove();
            for (let i in list) {
                const start = new Date(list[i].dates[0]).toString().slice(0, 15);
                const end = new Date(list[i].dates[1]).toString().slice(0, 15);
                $(".main-bookings-container").append(`
                    <div class="item-container" id="${list[i].place._id}" >
                        <span class="item-image-container" style="overflow: hidden;"><img src="${list[i].place.images[0]}" style="width: 100%; height: 100%; object-fit: cover;"></img></span>
                        <span class="item-text">
                            <div class="item-name">${list[i].place.name}</div>
                            <div class="item-date">${start} - ${end}</div>
                            <div class="item-price">${list[i].price}€</div>
                        </span>
                    </div>
                `);
            }
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