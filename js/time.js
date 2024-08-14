var current = "";

/*
 * Changes the website design based on local time.
 */
function styleByTime() {
    var t = new Date();
    var h = t.getHours();
    var temp;

    // Define time ranges for different periods of the day
    if (h >= 6 && h < 8)
        temp = "sunrise"; // 6 AM to 8 AM (Sunrise)
    else if (h >= 8 && h < 12)
        temp = "morning"; // 8 AM to 12 PM (Morning)
    else if (h >= 12 && h < 18)
        temp = "afternoon"; // 12 PM to 6 PM (Afternoon)
    else if (h >= 18 && h < 20)
        temp = "sunset"; // 6 PM to 8 PM (Sunset)
    else
        temp = "night"; // 8 PM to 6 AM (Night)

    if (temp != current) {
        // Update background image based on the time of day
        if (temp == "sunrise" || temp == "sunset") {
            d3.select("body").style("background-image", "url(\"img/bg_sunset.png\")");
            current = temp;
        } else if (temp == "morning") {
            d3.select("body").style("background-image", "url(\"img/bg_morning.png\")");
            current = "morning";
        } else if (temp == "afternoon") {
            d3.select("body").style("background-image", "url(\"img/bg_afternoon.png\")");
            current = "afternoon";
        } else if (temp == "night") {
            d3.select("body").style("background-image", "url(\"img/bg_night.png\")");
            current = "night";
        }
    }

    setTimeout(styleByTime, 1000);
}

styleByTime();