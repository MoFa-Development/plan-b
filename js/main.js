var currentDateOffset = 0;

async function getData(dateOffset = currentDateOffset) {
    return await fetch("/php/getData.php?dateOffset="+dateOffset).then(response => response.json());
}

function drawSubstitutionTable() {
    var main = document.getElementById("main");
    var day_title = document.getElementById("title-day");

    main.childNodes.forEach(child => {
        main.removeChild(child)
    })

    getData(currentDateOffset).then(data => {
        
        day = data.payload.date.toString().slice(6,8);
        month = data.payload.date.toString().slice(4,6);
        year = data.payload.date.toString().slice(0,4);
        date_string = day + "." + month + "." + year;

        day_title.innerHTML = data.payload.weekDay + ", " + date_string;

        data.payload.rows.forEach(element => {

            let periods     = element.data[0];
            let classes     = element.data[1].split(", ");
            let course_long = element.data[2];
            let course      = element.data[3];
            let room        = element.data[4];
            let teacher     = element.data[5];
            let message     = element.data[6];

            let cssClasses  = element.cssClasses.join(", ");
            let group       = element.group; 

            var p = document.createElement("p");
            p.appendChild(document.createTextNode(`[${classes.join(", ")}] Stunden: ${periods} (${course}) ${room} ${teacher} --- ${message}`));
            main.appendChild(p);
        });

    });
}

function nextDay() {
    currentDateOffset++;
    drawSubstitutionTable();
}

function prevDay() {
    currentDateOffset--;
    drawSubstitutionTable();
}

if(window.addEventListener) {
    window.addEventListener('load', drawSubstitutionTable);
} else {
    window.attachEvent('onload', drawSubstitutionTable);
}