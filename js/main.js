var SCHOOL = "Oekumenisches-Gymnasium"

function getData() {
    req = new XMLHttpRequest()

    req.open("GET", "https://ajax.webuntis.com/WebUntis/monitor/substitution/data?school=" + SCHOOL, true);

    req.onload = function() {
        console.log(this)
    };

    req.send();
}
