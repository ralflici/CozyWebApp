"use strict";

const calendar = {
    start: undefined,
    startDate: undefined,
    startDayLi: undefined,
    end: undefined,
    endDate: undefined,
    endDayLi: undefined,

    initCalendar: function (){
        const now = new Date();
        const thisDay = now.getDate();
        const thisWeekDayNum = this.myGetDay(now);
        const thisWeekDayName = this.getWeekDayName("short", now);
        const thisMonthNum = now.getMonth();
        const thisMonthName = this.getMonthName("short", now);
        const thisYear = now.getFullYear();

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
        //$($(".month")[m]).find(".month-name").text(monthName + " " + year.toString());
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

        const first = new Date(monthName + "1, " + year.toString());
        const last = new Date(year, monthNum+1, 0);
        let i;
        for (i = 0; i < this.myGetDay(first); i++) {
            $(`#${monthName + year.toString()}>.days-table`).append('<li class="dummy-day"></li>');
        }
        for (; i < last.getDate() + this.myGetDay(first); i++) {
            let day = i + 1 - this.myGetDay(first);
            if (day < passed)
                $(`#${monthName + year.toString()}>.days-table`).append('<li class="day passed">' + day.toString() + '</li>');
            else
                $(`#${monthName + year.toString()}>.days-table`).append('<li class="day">' + day.toString() + '</li>');
        }
        for (; i < 42; i++) {
            $(`#${monthName + year.toString()}>.days-table`).append('<li class="dummy-day"></li>');
        }
    },

    getWeekDayName: function(format, date) {
        let options = { weekday: format, timeZone: "Europe/Rome" };
        return new Intl.DateTimeFormat('en-US', options).format(date);
    },

    getMonthName: function(format, date) {
        let options = { month: format, timeZone: "Europe/Rome" };
        return new Intl.DateTimeFormat('en-US', options).format(date);
    },

    myGetDay: function(date) {
        var d = date.getDay();
        return d > 0 ? --d : 6;
    },

    setDate: function(thisLi, day, monthYear, str) {
        if (str === "start") {
            this.startDate = day + " " + monthYear;
            let date = new Date(this.startDate);
            let weekDay = date.toDateString().substring(0, 3);
            this.startDate = weekDay + ", " + this.startDate;
            this.start = new Date(this.startDate);
            
            let dateSpan = $("#start-date");
            dateSpan.addClass("selected");
            dateSpan.children(".date-text").text(this.startDate);

            this.startDayLi = thisLi;
            thisLi.addClass("selected");
        }
        else {
            let date = new Date(day + " " + monthYear);
            if (date > this.start) {
                let weekDay = date.toDateString().substring(0, 3);
                this.endDate = weekDay + ", " + day + " " + monthYear;
                this.end = new Date(this.endDate);

                let dateSpan = $("#end-date");
                dateSpan.addClass("selected");
                dateSpan.children(".date-text").text(this.endDate);

                this.endDayLi = thisLi;
                thisLi.addClass("selected");
            }
        }
        if (this.start !== undefined && this.end !== undefined) {
            this.fillDaysInRange();
            return {start: this.start, end: this.end};
        }
    },

    fillDaysInRange: function() {
        $(".day").removeClass("start");
        $(".day").removeClass("end");
        $(".day").removeClass("in-range");

        this.startDayLi.addClass("start");
        this.endDayLi.addClass("end");

        
        let next = this.adjacentDate(this.start, true);
        while(next.date < this.end) {
            next.li.addClass("in-range");
            next = this.adjacentDate(next.date, true);
        }
    },

    controlDate: function(dateSpan, add) {
        if (dateSpan.hasClass("selected")) {
            if (dateSpan[0].id == "start-date") {
                if (add) {
                    let next = this.adjacentDate(this.start, add);
                    if (this.end === undefined || next.date < this.end) {
                        this.startDayLi.removeClass("selected");
                        this.setDate(next.li, next.li.text(), next.li.parent().prevAll(".month-name").text(), "start");
                    }
                }
                else {
                    let prev = this.adjacentDate(this.start, add);
                    if(!prev.li.hasClass("passed")) {
                        this.startDayLi.removeClass("selected");
                        this.setDate(prev.li, prev.li.text(), prev.li.parent().prevAll(".month-name").text(), "start");
                    }
                }
            }
            else {
                if (add) {
                    let next = this.adjacentDate(this.end, add)
                    if (next.li.length !== 0) {
                        this.endDayLi.removeClass("selected");
                        this.setDate(next.li, next.li.text(), next.li.parent().prevAll(".month-name").text(), "end");
                    }
                }
                else {
                    let prev = this.adjacentDate(this.end, add);
                    if(this.start === undefined || prev.date > this.start) {
                        this.endDayLi.removeClass("selected");
                        this.setDate(prev.li, prev.li.text(), prev.li.parent().prevAll(".month-name").text(), "end");
                    }
                }
            }
        }
        return {start: this.startDate, end: this.endDate};
    },

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