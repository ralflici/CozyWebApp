"use strict";

// calendar class
const calendar = {
    // variables
    start: undefined,
    startDate: undefined,
    startDayLi: undefined,
    end: undefined,
    endDate: undefined,
    endDayLi: undefined,

    initCalendar: function() {
        // get the current date: day, month and year
        const now = new Date();
        const thisDay = now.getDate();
        const thisMonthNum = now.getMonth();
        const thisMonthName = this.getMonthName("short", now);
        const thisYear = now.getFullYear();

        // append 10 months (starting from the current) to the calendar container
        this.setupMonth(0, thisDay, thisMonthNum, thisMonthName, thisYear);
        let nextMonthNum = thisMonthNum === 11 ? 0 : thisMonthNum+1;
        let nextMonthYear = nextMonthNum === 0 ? thisYear+1 : thisYear;
        let nextMonthName = this.getMonthName("short", new Date(nextMonthYear, nextMonthNum, 1));

        for (let j = 1; j < 10; j++) {
            this.setupMonth(j, 0, nextMonthNum, nextMonthName, nextMonthYear);
            nextMonthNum = nextMonthNum === 11 ? 0 : nextMonthNum+1;
            nextMonthYear = nextMonthNum === 0 ? nextMonthYear+1 : nextMonthYear;
            nextMonthName = this.getMonthName("short", new Date(nextMonthYear, nextMonthNum, 1));
        }
    },

    setupMonth: function (m, passed, monthNum, monthName, year) {
        $(".month-container").append(`
            <span class="month" id="${monthName + year.toString()}">
                <h2 class="month-name">${monthName + " " + year.toString()}</h2>
                <ul class="weekdays-name">
                    <li>MON</li>
                    <li>TUE</li>
                    <li>WED</li>
                    <li>THU</li>
                    <li>FRI</li>
                    <li>SAT</li>
                    <li>SUN</li>
                </ul>
                <ul class="days-table">
                </ul>
            </span>
        `);

        // append the day elements to every month
        const first = new Date(monthName + "1, " + year.toString());
        const last = new Date(year, monthNum+1, 0);
        let i;
        // first append the dummy elements
        for (i = 0; i < this.myGetDay(first); i++) {
            $(`#${monthName + year.toString()}>.days-table`).append('<li class="dummy-day"></li>');
        }
        // then append the actual days
        for (; i < last.getDate() + this.myGetDay(first); i++) {
            let day = i + 1 - this.myGetDay(first);
            // passed days are different because they can't be selected
            if (day < passed)
                $(`#${monthName + year.toString()}>.days-table`).append('<li class="day passed">' + day.toString() + '</li>');
            else
                $(`#${monthName + year.toString()}>.days-table`).append('<li class="day">' + day.toString() + '</li>');
        }
        // finally fill the month grid with the last dummies
        for (; i < 42; i++) {
            $(`#${monthName + year.toString()}>.days-table`).append('<li class="dummy-day"></li>');
        }
    },

    // returns the month name
    getMonthName: function(format, date) {
        let options = { month: format, timeZone: "Europe/Rome" };
        return new Intl.DateTimeFormat('en-US', options).format(date);
    },

    // this function is needed because the default javascript getDay function returns: Sunday - Saturday : 0 - 6
    // but I wanted the week to start at Monday so my function returns: Monday - Sunday : 0 - 6
    myGetDay: function(date) {
        var d = date.getDay();
        return d > 0 ? --d : 6;
    },

    // this function set the start and end date
    setDate: function(thisLi, day, monthYear, str) {
        // set the start date
        if (str === "start") {
            // get the right date format for the calendar
            this.startDate = day + " " + monthYear;
            let date = new Date(this.startDate);
            let weekDay = date.toDateString().substring(0, 3);
            this.startDate = weekDay + ", " + this.startDate;
            this.start = new Date(this.startDate);
            
            // set the text for the start date element (in the roundtrip container)
            let dateSpan = $("#start-date");
            dateSpan.addClass("selected");
            dateSpan.children(".date-text").text(this.startDate);

            // save the <li> element and change its style
            this.startDayLi = thisLi;
            thisLi.addClass("selected");
        }
        // set the end date
        else {
            let date = new Date(day + " " + monthYear);
            if (date > this.start) {
                // get the right date format for the calendar
                let weekDay = date.toDateString().substring(0, 3);
                this.endDate = weekDay + ", " + day + " " + monthYear;
                this.end = new Date(this.endDate);

                // set the text for the end date element (in the roundtrip container)
                let dateSpan = $("#end-date");
                dateSpan.addClass("selected");
                dateSpan.children(".date-text").text(this.endDate);

                // save the <li> element and change its style
                this.endDayLi = thisLi;
                thisLi.addClass("selected");
            }
        }
        // if both start and end are defined, change the style of the days included in the range
        if (this.start !== undefined && this.end !== undefined) {
            // set hours to avoid weird behavior caused by timezone offsets
            this.start.setHours(23);
            this.end.setHours(0);
            this.fillDaysInRange();
            return {start: this.start.setHours(12), end: this.end.setHours(12)};
        }
    },

    fillDaysInRange: function() {
        // reset everything
        $(".day").removeClass("start");
        $(".day").removeClass("end");
        $(".day").removeClass("in-range");

        // set end and end classes
        this.startDayLi.addClass("start");
        this.endDayLi.addClass("end");

        // get the next day
        let next = this.adjacentDate(this.start, true);
        // till the end
        while(next.date < this.end) {
            // change its style
            next.li.addClass("in-range");
            next = this.adjacentDate(next.date, true);
        }
    },

    // add or subtract a day from either start or end
    controlDate: function(dateSpan, add) {
        // set hours to avoid weird behavior caused by timezone offsets
        this.start.setHours(23);
        this.end.setHours(0);
        if (dateSpan.hasClass("selected")) {
            if (dateSpan[0].id == "start-date") {
                if (add) {
                    let next = this.adjacentDate(this.start, add);
                    if (this.end === undefined || next.date < this.end) {
                        this.startDayLi.removeClass("selected");
                        return this.setDate(next.li, next.li.text(), next.li.parent().prevAll(".month-name").text(), "start");
                    }
                }
                else {
                    let prev = this.adjacentDate(this.start, add);
                    if(!prev.li.hasClass("passed")) {
                        this.startDayLi.removeClass("selected");
                        return this.setDate(prev.li, prev.li.text(), prev.li.parent().prevAll(".month-name").text(), "start");
                    }
                }
            }
            else {
                if (add) {
                    let next = this.adjacentDate(this.end, add)
                    if (next.li.length !== 0) {
                        this.endDayLi.removeClass("selected");
                        return this.setDate(next.li, next.li.text(), next.li.parent().prevAll(".month-name").text(), "end");
                    }
                }
                else {
                    let prev = this.adjacentDate(this.end, add);
                    if(this.start === undefined || prev.date > this.start) {
                        this.endDayLi.removeClass("selected");
                        return this.setDate(prev.li, prev.li.text(), prev.li.parent().prevAll(".month-name").text(), "end");
                    }
                }
            }
        }
    },

    // function to get the following or previous day
    adjacentDate: function(referenceDate, add) {
        let direction = add ? (+1) : (-1);
        let result = {date: undefined, li: undefined};

        let adjacent = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate() + direction);
        result.date = adjacent;
        let month = this.getMonthName("short", adjacent);
        let year = (adjacent.getFullYear()).toString();
        let day = adjacent.getDate();
        let adjacentDayMonthSpan = $(".month-container").find(".month").find("h2:contains("+ month + " " + year +")").parents(".month");
        let adjacentDayLi = $(adjacentDayMonthSpan).find(".day").filter(function() {
            return $(this).text() === day.toString();
        })
        result.li = adjacentDayLi;
        return result;
    }
}
