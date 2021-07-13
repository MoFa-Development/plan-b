window.decideOverflow = function() {
    let element = document.getElementById("affected-elements");

    let scroll = element.scrollLeft;
    let scroll_max = element.scrollWidth - element.clientWidth;
    let element_width = element.clientWidth;

    if(scroll_max == 0) {
        element.style.justifyContent = "center";
        element.classList.remove("overflow-both", "overflow-left", "overflow-right");
    } else if(scroll <= 0) {
        element.style.justifyContent = "left";
        element.classList.add("overflow-right");
        element.classList.remove("overflow-both", "overflow-left");
    } else if(scroll < scroll_max) {
        element.style.justifyContent = "left";
        element.classList.add("overflow-both");
        element.classList.remove("overflow-right", "overflow-left");
    } else {
        element.style.justifyContent = "left";
        element.classList.add("overflow-left");
        element.classList.remove("overflow-right", "overflow-both");
    }
}

window.drawMessages = function(data) {
    let messages = document.getElementById("messages");

    while (messages.firstChild) {
        messages.removeChild(messages.firstChild);
    }

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
    });
}

window.drawAffectedElements = function(data) {
    let affectedElementsElement = document.getElementById("affected-elements");

    while (affectedElementsElement.firstChild) {
        affectedElementsElement.removeChild(affectedElementsElement.firstChild);
    }

    if (is_teacher) {
        let affectedTeachers = getAffectedTeachers(data);

        affectedTeachers.forEach((affectedTeacher) => {
            
            let affectedTeacherElement = document.createElement("div");
            affectedTeacherElement.innerText = affectedTeacher;
            affectedTeacherElement.classList.add("affected-element");
            
            if(affectedTeacher == selectedTeacher) {
                affectedTeacherElement.classList.add("selected");
            }

            affectedTeacherElement.onclick = function() {
                setSelectedTeacher(affectedTeacher, data);
            }

            affectedElementsElement.appendChild(affectedTeacherElement);
        });

    } else {
        let affectedClasses = data.payload.affectedElements["1"].sort((a, b) => parseInt(a.replace(/\D/g,'')) - parseInt(b.replace(/\D/g,'')));

        affectedClasses.forEach((affectedClass) => {

            let affectedClassElement = document.createElement("div");
            affectedClassElement.innerText = affectedClass;
            affectedClassElement.classList.add("affected-element");
            
            if(affectedClass == selectedClass) {
                affectedClassElement.classList.add("selected");
            }

            affectedClassElement.onclick = function() {
                setSelectedClass(affectedClass, data);
            }

            affectedElementsElement.appendChild(affectedClassElement);
        });
    }

    affectedElementsElement.onscroll = decideOverflow;
}

window.drawSubstitutions = function(data) {

    let substitutionsElement = document.getElementById("substitutions");

    while (substitutionsElement.firstChild) {
        substitutionsElement.removeChild(substitutionsElement.firstChild);
    }

    data.payload.rows.sort((a, b) => parseInt(a.group.replace(/\D/g,'')) - parseInt(b.group.replace(/\D/g,'')));

    data.payload.rows.forEach(element => {

        let periods     = element.data[0];
        let classes     = element.data[1].split(", ").sort().sort((a, b) => parseInt(a.replace(/\D/g,'')) - parseInt(b.replace(/\D/g,'')));
        let course_long = element.data[2];
        let course      = element.data[3];
        let room        = element.data[4];
        let teacher     = element.data[5];
        let subst_type  = element.data[6];
        let message     = element.data[7];

        let cssClasses  = element.cssClasses;
        let group       = element.group;

        if(group == classes[0] && (selectedClass == "" || classes.includes(selectedClass)) && (selectedTeacher == "" || teacher.includes(selectedTeacher))) {
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
            
            if(room && subst_type != "Entfall") {
                let roomElement = document.createElement("p");
                roomElement.innerHTML = "<img src=\"icons/map-marker.svg\" class=\"subst-icon\"> <div class=\"subst-data-val\">" + room + "</div>";
                roomElement.id = "room"
                roomElement.classList.add("subst-data")
                substElement.appendChild(roomElement);
            }
            
            if(subst_type != "Entfall") {
                let teacherElement = document.createElement("p");
                teacherElement.innerHTML = "<img src=\"icons/teacher.svg\" class=\"subst-icon\"> <div class=\"subst-data-val\">" + teacher + "</div>";
                teacherElement.id = "teacher"
                teacherElement.classList.add("subst-data")
                substElement.appendChild(teacherElement);
            }
            
            if(subst_type && subst_type != "Text") {
                let typeElement = document.createElement("p");

                let icon = "information";
                
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
}

window.draw = function() {
    let loadingElement = document.getElementById("loading");
    loadingElement.style.visibility = "visible";
    
    let dateTitleElement = document.getElementById("title-day");
    
    getData(currentDateOffset).then(data => {

        let next_day_btn = document.getElementById("btn-next-day");
        let prev_day_btn = document.getElementById("btn-prev-day");

        if(data.payload.nextDate == 0) {
            next_day_btn.disabled = true;
            next_day_btn.style.visibility = "hidden";
            next_day_btn.classList.add("disabled");
        } else {
            next_day_btn.disabled = false;
            next_day_btn.style.visibility = "visible";
            next_day_btn.classList.remove("disabled");
        }

        let day = data.payload.date.toString().slice(6,8);
        let month = data.payload.date.toString().slice(4,6);
        let year = data.payload.date.toString().slice(0,4);
        let date_string = day + "." + month + "." + year;

        dateTitleElement.innerHTML = data.payload.weekDay + ", " + date_string;

        drawMessages(data);

        drawAffectedElements(data);

        decideOverflow();

        drawSubstitutions(data);
    });

    loadingElement.style.visibility = "hidden";
}

window.nextDay = function() {
    currentDateOffset++;
    draw();
}

window.prevDay = function() {
    currentDateOffset--;
    draw();
}