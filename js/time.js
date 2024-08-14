var current = "";

/*
 * Changes the website design based on local time.
 */
function styleByTime() {
    var t = new Date();
    var h = t.getHours();
    var temp;

    // Define time ranges for different periods of the day
    if (h >= 6 && h < 12)
        temp = "morning"; // 6 AM to 12 PM
    else if (h >= 12 && h < 18)
        temp = "afternoon"; // 12 PM to 6 PM
    else if (h >= 18 && h < 20)
        temp = "sunset"; // 6 PM to 8 PM
    else
        temp = "night"; // 8 PM to 6 AM

    if (temp != current) {
        // Update background image based on the time of day
        if (temp == "morning") {
            d3.select("body").style("background-image", "url(\"img/bg_morning.png\")");
            current = "morning";
        } else if (temp == "afternoon") {
            d3.select("body").style("background-image", "url(\"img/bg_afternoon.png\")");
            current = "afternoon";
        } else if (temp == "sunset") {
            d3.select("body").style("background-image", "url(\"img/bg_sunset.png\")");
            current = "sunset";
        } else if (temp == "night") {
            d3.select("body").style("background-image", "url(\"img/bg_night.png\")");
            current = "night";
        }
    }

    setTimeout(styleByTime, 1000);
}

styleByTime();