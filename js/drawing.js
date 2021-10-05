import './data.js';

/**
 * Classes where teachers should always be shown for clarity
 */
const FORCE_SHOW_TEACHER_CLASSES = ["11", "12"];

/**
 * set css classes for overflowing affected elements bar
 * - showing shadows on the overflowed side(s) of the affected elements bar
 */
window.handleAffectedElementsOverflow = function() {
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

/**
 * generate message elements for messages of the day and add them to the messages container
 */
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

/**
 * generate affected element selects and add them to the selection bar
 */
window.drawAffectedElements = function(data) {
    let affectedElementsBarObj = document.getElementById("affected-elements");

    if(data.payload.rows.length == 0) {
        affectedElementsBarObj.style.visibility = "hidden";
    } else {
        affectedElementsBarObj.style.visibility = "visible";
    }

    while (affectedElementsBarObj.firstChild) {
        affectedElementsBarObj.removeChild(affectedElementsBarObj.firstChild);
    }

    let filterIconObj = document.createElement("img");
    filterIconObj.src = "icons/filter.svg"
    filterIconObj.classList.add("icon", "filter-icon");
    affectedElementsBarObj.appendChild(filterIconObj);
    
    let affectedElements;
    
    // dynamically get affected teachers / classes based on is_teacher
    if (is_teacher) {
        affectedElements = getAffectedTeachers(data);
    } else {
        affectedElements = getAffectedClasses(data);
    }

    affectedElements.forEach((affectedElement) => {

        let affectedElementObj = document.createElement("div");
        affectedElementObj.innerText = affectedElement;
        affectedElementObj.classList.add("affected-element");
        
        if (affectedElement == selectedTeacher || affectedElement == selectedClass) {
            affectedElementObj.classList.add("selected");
        }

        affectedElementObj.onclick = function() {
            window.RESET_AUTOSCROLL = true;
            setSelectedElement(affectedElement, data);

            //manage highlighting of selected element
        
            let element;
            for(element of affectedElementsBarObj.children) {
                if(element.innerText == selectedClass || element.innerText == selectedTeacher) {
                    element.classList.add("selected");
                } else {
                    element.classList.remove("selected");
                }
            }
        }

        affectedElementsBarObj.appendChild(affectedElementObj);
    });

    affectedElementsBarObj.onscroll = handleAffectedElementsOverflow;
}

/**
 * generate substitution elements and add them to the substitutions container
 */
window.drawSubstitutions = function(data) {

    let substitutionsElement = document.getElementById("substitutions");

    while (substitutionsElement.firstChild) {
        substitutionsElement.removeChild(substitutionsElement.firstChild);
    }

    if (data.payload.rows.length == 0) {
        
        //no substitutions in the first place
        let noSubstMessage = document.createElement("p");
        noSubstMessage.classList.add("no-subst-msg");
        noSubstMessage.innerHTML = "<img src=\"icons/cancelled.svg\" class=\"icon\">Keine Vertretungen";

        substitutionsElement.appendChild(noSubstMessage);

    } else if (!is_teacher && selectedClass != "" && !data.payload.affectedElements["1"].includes(selectedClass)) {
        
        // selected class is not affected
        let noSubstMessage = document.createElement("p");
        noSubstMessage.classList.add("no-subst-msg");
        noSubstMessage.innerHTML = "<img src=\"icons/cancelled.svg\" class=\"icon\">Keine Vertretungen für die " + selectedClass;

        substitutionsElement.appendChild(noSubstMessage);

    } else if (is_teacher && selectedTeacher != "" && !getAffectedTeachers(data).includes(selectedTeacher)) {
        
        // selected teacher is not affected
        let noSubstMessage = document.createElement("p");
        noSubstMessage.classList.add("no-subst-msg");
        noSubstMessage.innerHTML = "<img src=\"icons/cancelled.svg\" class=\"icon\">Keine Vertretungen für Sie (" + selectedTeacher + ")";

        substitutionsElement.appendChild(noSubstMessage);

    } else {

        //draw substitutions
        data.payload.rows.forEach(element => {
            
            let periods     = element.data[0];
            let classes     = getAffectedClassesOfRow(element);
            let course_long = element.data[2]; // FACH_KLASSE_LEHRER
            
            if(course_long) {
                var course_long_split = course_long.split("_");
                
                if(course_long_split.length == 3) {
                    var course_check = course_long_split[0];
                    var class_check = course_long_split[1];
                    var teacher_check = course_long_split[2];
                    
                    // TODO **DIRTY** workaround for SPL1_12_1 <- Why the 1 though? Schötti / GTW was soll das?!
                    if(parseInt(teacher_check).toString() == teacher_check) {
                        teacher_check = ""; 
                    }
                }
            }

            let course      = element.data[3];
            let room        = element.data[4];
            let teacher     = element.data[5];
            let subst_type  = element.data[6];
            let message     = element.data[7];
            
            let cssClasses  = element.cssClasses;
            let group       = element.group;

            if(group != classes[0]) // do not draw duplicate substitution more than once
                return;

            if(selectedClass && !classes.includes(selectedClass)) // only draw filtered for class
                return;

            if(selectedTeacher && !teacher.includes(selectedTeacher)) // only draw filtered for teacher 
                return;

            if(is_teacher && subst_type == "Entfall") // if teacher, do not draw cancelled classes
                return;

            if(is_teacher && selectedTeacher && teacher.includes("<span class=\"cancelStyle\">"+selectedTeacher+"</span>")) // do not inform the teacher who is being substituted
                return;

            //#endregion EXIT STATEMENTS

            let substElement = document.createElement("div");
            
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

                var course_change_html = "";
                var teacher_note_html = "";

                if(course_check && course.replace(" ", "") != course_check.replace(" ", "")) {
                    course_change_html = " (<span class=\"cancelStyle\">" + course_check + "</span>)";
                }
 
                if(teacher_check && listsIntersect(FORCE_SHOW_TEACHER_CLASSES, classes)) {
                    teacher_note_html = " ("+teacher_check+")"
                }

                let courseElement = document.createElement("p");
                courseElement.innerHTML = "<img src=\"icons/book-open-variant.svg\" class=\"subst-icon\"> <div class=\"subst-data-val\">" + course + course_change_html + teacher_note_html + "</div>";
                courseElement.id = "course"
                courseElement.classList.add("subst-data")
                substElement.appendChild(courseElement);    
            }
            
            // only draw room label if not cancelled
            if(room && subst_type != "Entfall") {
                
                let roomElement = document.createElement("p");
                roomElement.innerHTML = "<img src=\"icons/map-marker.svg\" class=\"subst-icon\"> <div class=\"subst-data-val\">" + room + "</div>";
                roomElement.id = "room"
                roomElement.classList.add("subst-data")
                substElement.appendChild(roomElement);
            }
            
            // only draw teacher label if type is not cancelled or room change
            if(teacher && is_teacher || teacher && subst_type != "Entfall" && subst_type != "Raum&auml;nderung") {
                
                var teacher_change_html = "";

                if(teacher_check && teacher != teacher_check && !teacher.includes("cancelStyle")) {
                    teacher_change_html = " (<span class=\"cancelStyle\">"+ teacher_check +"</span>)";
                }

                let teacherElement = document.createElement("p");
                teacherElement.innerHTML = "<img src=\"icons/teacher.svg\" class=\"subst-icon\"> <div class=\"subst-data-val\">" + teacher + teacher_change_html + "</div>";
                teacherElement.id = "teacher"
                teacherElement.classList.add("subst-data")
                substElement.appendChild(teacherElement);
            }
            
            // set subst type icon based on type, do not draw subst type label when type is "Text"
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
        });
    }
}

/**
 * master draw function, called on load or day change
 */
window.draw = function() {

    let loadingElement = document.getElementById("loading");
    loadingElement.style.visibility = "visible";

    let dateTitleElement = document.getElementById("title-day");

    getCachedData(currentDateOffset).then(data => {
        try {
            // hide next day button if last day with data
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

            // draw date
            let day = data.payload.date.toString().slice(6,8);
            let month = data.payload.date.toString().slice(4,6);
            let year = data.payload.date.toString().slice(0,4);

            let date_string = day + "." + month + "." + year;

            dateTitleElement.innerHTML = data.payload.weekDay + ", " + date_string;

            drawMessages(data);

            drawAffectedElements(data);

            handleAffectedElementsOverflow();

            drawSubstitutions(data);

        } catch (error) {
            console.debug(data);
            
            let affectedElementsBarObj = document.getElementById("affected-elements");

            if(data.payload.rows.length == 0) {
                affectedElementsBarObj.style.visibility = "hidden";
            } else {
                affectedElementsBarObj.style.visibility = "visible";
            }

            dateTitleElement.innerHTML = "";

            errorMessage(error);
        }
    }).catch(error => errorMessage(error));
    
    loadingElement.style.visibility = "hidden";

    getCachedData(currentDateOffset+1);
    getCachedData(currentDateOffset-1);
}