var currentDateOffset = 0;

async function getData(dateOffset = currentDateOffset) {
    return await fetch("php/getData.php?dateOffset="+dateOffset).then(response => response.json());
}

function drawSubstitutionTable() {
    var messages = document.getElementById("messages");
    var substitutions = document.getElementById("substitutions");
    var day_title = document.getElementById("title-day");

    while (substitutions.firstChild) {
        substitutions.removeChild(substitutions.firstChild);
    }

    while (messages.firstChild) {
        messages.removeChild(messages.firstChild);
    }

    getData(currentDateOffset).then(data => {

        next_day_btn = document.getElementById("btn-next-day");
        prev_day_btn = document.getElementById("btn-prev-day");

        if(data.payload.nextDate == 0) {
            next_day_btn.disabled = true;
            next_day_btn.style.visibility = "hidden";
            next_day_btn.classList.add("disabled");
        } else {
            next_day_btn.disabled = false;
            next_day_btn.style.visibility = "visible";
            next_day_btn.classList.remove("disabled");
        }

        day = data.payload.date.toString().slice(6,8);
        month = data.payload.date.toString().slice(4,6);
        year = data.payload.date.toString().slice(0,4);
        date_string = day + "." + month + "." + year;

        day_title.innerHTML = data.payload.weekDay + ", " + date_string;

        data.payload.messageData.messages.forEach(messageData => {
            let messageElement = document.createElement("div");
            messageElement.classList.add("message")

            if(messageData.subject) {
                let subjectElement = document.createElement("div");
                subjectElement.innerHTML = messageData.subject;
                subjectElement.id = "subject";
                messageElement.appendChild(subjectElement);
            }

            let messageBodyElement = document.createElement("div");
            messageBodyElement.innerHTML = messageData.body;
            messageBodyElement.id = "message-body";
            messageElement.appendChild(messageBodyElement);

            messages.appendChild(messageElement);
        })

        data.payload.rows.sort((a, b) => {return parseInt(a.group) - parseInt(b.group)});

        data.payload.rows.forEach(element => {

            let periods     = element.data[0];
            let classes     = element.data[1].split(", ");
            let course_long = element.data[2];
            let course      = element.data[3];
            let room        = element.data[4];
            let teacher     = element.data[5];
            let subst_type  = element.data[6];
            let message     = element.data[7];

            let cssClasses  = element.cssClasses;
            let group       = element.group;

            if(group == classes[0]) {
                let substElement = document.createElement("div");
                //p.appendChild(document.createTextNode(`[${classes.join(", ")}] Stunden: ${periods} (${course}) ${room} ${teacher} --- ${message}`));
                
                //substElement.innerHTML = `[${classes.join(", ")}] Stunden: ${periods} (${course}) ${room} ${teacher} <br> ${message} <hr>`;
                
                let periodsElement = document.createElement("p");
                periodsElement.innerHTML = "<img src=\"icons/book-clock.svg\" class=\"subst-icon\"> <div class=\"subst-data-val\">" + periods + "</div>";
                periodsElement.id = "periods";
                periodsElement.classList.add("subst-data")
                substElement.appendChild(periodsElement);
                
                let classesElement = document.createElement("p");
                classesElement.innerHTML = "<img src=\"icons/account-multiple.svg\" class=\"subst-icon\"> <div class=\"subst-data-val\">" + classes.join(", ") + "</div>";
                classesElement.id = "classes";
                classesElement.classList.add("subst-data")
                substElement.appendChild(classesElement);
                
                if(course) {
                    let courseElement = document.createElement("p");
                    courseElement.innerHTML = "<img src=\"icons/book-open-variant.svg\" class=\"subst-icon\"> <div class=\"subst-data-val\">" + course + "</div>";
                    courseElement.id = "course"
                    courseElement.classList.add("subst-data")
                    substElement.appendChild(courseElement);    
                }
                
                if(room) {
                    let roomElement = document.createElement("p");
                    roomElement.innerHTML = "<img src=\"icons/map-marker.svg\" class=\"subst-icon\"> <div class=\"subst-data-val\">" + room + "</div>";
                    roomElement.id = "room"
                    roomElement.classList.add("subst-data")
                    substElement.appendChild(roomElement);
                }
                
                let teacherElement = document.createElement("p");
                teacherElement.innerHTML = "<img src=\"icons/teacher.svg\" class=\"subst-icon\"> <div class=\"subst-data-val\">" + teacher + "</div>";
                teacherElement.id = "teacher"
                teacherElement.classList.add("subst-data")
                substElement.appendChild(teacherElement);
                
                if(subst_type && subst_type != "Text") {
                    let typeElement = document.createElement("p");

                    icon = "information";
                    
                    if(subst_type == "Entfall") {
                        icon = "cancelled";
                    } else if(subst_type == "Raum&auml;nderung") {
                        icon = "swap";
                    }

                    typeElement.innerHTML = "<img src=\"icons/"+ icon +".svg\" class=\"subst-icon\"> <div class=\"subst-data-val\">" + subst_type + "</div>";
                    typeElement.id = "type"
                    typeElement.classList.add("subst-data")
                    substElement.appendChild(typeElement);
                }
                
                if(message) {
                    let messageElement = document.createElement("p");
                    messageElement.innerHTML = "<img src=\"icons/information.svg\" class=\"subst-icon\"> <div class=\"subst-data-val\">" + message + "</div>";
                    messageElement.id = "message";
                    messageElement.classList.add("subst-data")
                    substElement.appendChild(messageElement);
                }
                
                substElement.classList.add("subst-element");
                cssClasses.forEach(cssClass => substElement.classList.add(cssClass));
                
                substitutions.appendChild(substElement);
            }
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