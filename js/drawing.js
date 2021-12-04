/**
 * Classes where teachers should always be shown for clarity
 */
const FORCE_SHOW_TEACHER_CLASSES = ["11", "12"];

/**
 * set css classes for overflowing affected elements bar
 * - showing shadows on the overflowed side(s) of the affected elements bar
 */
window.handleAffectedElementsOverflow = function() {
    let element = $("#affected-elements")[0];

    let element_width = element.clientWidth;
    let scroll = element.scrollLeft;
    let scroll_max = element.scrollWidth - element_width;

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

window.Message.prototype.toElem = function() {
    let messageElement = document.createElement("div");
    messageElement.classList.add("message")

    if(this.subject) {
        let subjectElement = document.createElement("div");
        subjectElement.innerHTML = this.subject;
        subjectElement.id = "subject";
        messageElement.appendChild(subjectElement);
    }

    let messageBodyElement = document.createElement("div");
    messageBodyElement.innerHTML = this.body;
    messageBodyElement.id = "message-body";
    messageElement.appendChild(messageBodyElement);

    return messageElement;
}

/**
 * generate message elements for messages of the day and add them to the messages container
 */
window.Day.prototype.drawMessages = function() {
    let messages = $("#messages")[0];

    while (messages.firstChild) {
        messages.removeChild(messages.firstChild);
    }

    this.messages.forEach(msg => {
        let messageElement = msg.toElem();
        
        if(messageElement) {
            messages.appendChild(messageElement);
        }
    });
}

/**
 * generate affected element selects and add them to the selection bar
 */
window.Day.prototype.drawAffectedElements = function() {
    let affectedElementsBarObj = $("#affected-elements")[0];

    if(this.substitutions.length == 0) {
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
    if (settings.is_teacher) {
        affectedElements = this.affectedTeachers;
    } else {
        affectedElements = this.affectedClasses;
    }

    var day = this;

    affectedElements.forEach((affectedElement) => {

        let affectedElementObj = document.createElement("div");
        affectedElementObj.innerText = affectedElement;
        affectedElementObj.classList.add("affected-element");
        
        if (affectedElement == settings.selectedTeacher || affectedElement == settings.selectedClass) {
            affectedElementObj.classList.add("selected");
        }

        affectedElementObj.onclick = function() {
            window.RESET_AUTOSCROLL = true;
            
            day.setSelectedElement(affectedElement);

            //manage highlighting of selected element
        
            let element;
            for(element of affectedElementsBarObj.children) {
                if(element.innerText == settings.selectedClass || element.innerText == settings.selectedTeacher) {
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

window.Substitution.prototype.toElem = function() {
    
    //#region EXIT STATEMENTS
    
    if(this.group != this.classes[0]) // do not draw duplicate substitution more than once
        return null;

    if(settings.selectedClass && !this.classes.includes(settings.selectedClass)) // only draw filtered for class
        return null;

    if(settings.selectedTeacher && !this.teachers_raw.includes(settings.selectedTeacher)) // only draw filtered for teacher 
        return null;

    if(settings.is_teacher && this.type == "Entfall") // if teacher, do not draw cancelled classes
        return null;

    if(settings.is_teacher && settings.selectedTeacher && this.teachers_raw.includes("<span class=\"cancelStyle\">"+settings.selectedTeacher+"</span>")) // do not inform the teacher who is being substituted
        return null;

    //#endregion EXIT STATEMENTS

    let substElement = document.createElement("div");

    let periodsElement = document.createElement("p");
    periodsElement.innerHTML = "<img src=\"icons/book-clock.svg\" class=\"subst-icon\"> <div class=\"subst-data-val\">" + this.periods + "</div>";
    periodsElement.id = "periods";
    periodsElement.classList.add("subst-data")
    substElement.appendChild(periodsElement);

    let classesElement = document.createElement("p");
    classesElement.innerHTML = "<img src=\"icons/account-multiple.svg\" class=\"subst-icon\"> <div class=\"subst-data-val\">" + this.classes.join(", ") + "</div>";
    classesElement.id = "classes";
    classesElement.classList.add("subst-data")
    substElement.appendChild(classesElement);

    if(this.course) {
        var course_change_html = "";
        var teacher_note_html = "";

        if(this.course_check && this.course.replace(" ", "") != this.course_check.replace(" ", "")) {
            course_change_html = " (<span class=\"cancelStyle\">" + this.course_check + "</span>)";
        }

        if(this.teacher_check && listsIntersect(FORCE_SHOW_TEACHER_CLASSES, this.classes)) {
            teacher_note_html = " ("+this.teacher_check+")"
        }

        let courseElement = document.createElement("p");
        courseElement.innerHTML = "<img src=\"icons/book-open-variant.svg\" class=\"subst-icon\"> <div class=\"subst-data-val\">" + this.course + course_change_html + teacher_note_html + "</div>";
        courseElement.id = "course"
        courseElement.classList.add("subst-data")
        substElement.appendChild(courseElement);
    }

    // only draw room label if not cancelled
    if(this.room && this.type != "Entfall") {
        let roomElement = document.createElement("p");
        roomElement.innerHTML = "<img src=\"icons/map-marker.svg\" class=\"subst-icon\"> <div class=\"subst-data-val\">" + this.room + "</div>";
        roomElement.id = "room"
        roomElement.classList.add("subst-data")
        substElement.appendChild(roomElement);
    }

    // only draw teacher label if type is not cancelled or room change
    if(this.teachers_raw && settings.is_teacher || this.teachers_raw && this.type != "Entfall" && this.type != "Raum&auml;nderung") {
        
        var teacher_change_html = "";

        if(this.teacher_check && this.teachers_raw != this.teacher_check && !this.teachers_raw.includes("cancelStyle")) {
            teacher_change_html = " (<span class=\"cancelStyle\">"+ this.teacher_check +"</span>)";
        }

        let teacherElement = document.createElement("p");
        teacherElement.innerHTML = "<img src=\"icons/teacher.svg\" class=\"subst-icon\"> <div class=\"subst-data-val\">" + this.teachers_raw + teacher_change_html + "</div>";
        teacherElement.id = "teacher"
        teacherElement.classList.add("subst-data")
        substElement.appendChild(teacherElement);
    }

    // set subst type icon based on type, do not draw subst type label when type is "Text"
    if(this.type && this.type != "Text") {
        let typeElement = document.createElement("p");
        
        let icon = "information";
        
        if(this.type == "Entfall") {
            icon = "cancelled";
        } else if(this.type == "Raum&auml;nderung") {
            icon = "swap";
        }
        
        typeElement.innerHTML = "<img src=\"icons/"+ icon +".svg\" class=\"subst-icon\"> <div class=\"subst-data-val\">" + this.type + "</div>";
        typeElement.id = "type"
        typeElement.classList.add("subst-data")
        substElement.appendChild(typeElement);
    }

    if(this.message) {
        let messageElement = document.createElement("p");
        messageElement.innerHTML = "<img src=\"icons/information.svg\" class=\"subst-icon\"><div class=\"subst-data-val\">" + this.message + "</div>";
        messageElement.id = "message";
        messageElement.classList.add("subst-data")
        substElement.appendChild(messageElement);
    }

    substElement.classList.add("subst-element");
    this.cssClasses.forEach(cssClass => substElement.classList.add(cssClass));

    return substElement;
}

/**
 * generate substitution elements and add them to the substitutions container
 */
window.Day.prototype.drawSubstitutions = function() {

    let substitutionsElement = $("#substitutions")[0];

    while (substitutionsElement.firstChild) {
        substitutionsElement.removeChild(substitutionsElement.firstChild);
    }

    if (this.substitutions.length == 0) {
        
        //no substitutions in the first place
        let noSubstMessage = document.createElement("p");
        noSubstMessage.classList.add("no-subst-msg");
        noSubstMessage.innerHTML = "<img src=\"icons/cancelled.svg\" class=\"icon\">Keine Vertretungen";

        substitutionsElement.appendChild(noSubstMessage);

    } else if (!settings.is_teacher && settings.selectedClass != "" && !this.affectedClasses.includes(settings.selectedClass)) {

        // selected class is not affected
        let noSubstMessage = document.createElement("p");
        noSubstMessage.classList.add("no-subst-msg");
        noSubstMessage.innerHTML = "<img src=\"icons/cancelled.svg\" class=\"icon\">Keine Vertretungen für die " + settings.selectedClass;

        substitutionsElement.appendChild(noSubstMessage);

    } else if (settings.is_teacher && settings.selectedTeacher != "" && !this.affectedTeachers.includes(settings.selectedTeacher)) {
        
        // selected teacher is not affected
        let noSubstMessage = document.createElement("p");
        noSubstMessage.classList.add("no-subst-msg");
        noSubstMessage.innerHTML = "<img src=\"icons/cancelled.svg\" class=\"icon\">Keine Vertretungen für Sie (" + settings.selectedTeacher + ")";

        substitutionsElement.appendChild(noSubstMessage);

    } else {
        let collectionElement;
        let lastAffected;
        let variation = false;

        //draw substitutions
        this.substitutions.forEach(subst => {
            let currentAffected;
            
            if(settings.is_teacher) {
                currentAffected = subst.teachers_raw;
            } else {
                currentAffected = subst.classes_raw;
            }
            
            if(currentAffected != lastAffected) {
                collectionElement = document.createElement("div");
                collectionElement.classList.add("subst-collection");
                substitutions.appendChild(collectionElement);

                lastAffected = currentAffected;
            }


            let substElement = subst.toElem();
            
            if(substElement) {
                if(variation) {
                    substElement.classList.add("variation");
                }

                collectionElement.appendChild(substElement);

                variation = !variation;
            }
        });
    }
}

/**
 * draw general surrounding and invoke drawMessages, drawSubstitutions & drawAffectedElements
 */
window.Day.prototype.draw = function() {
    let dateTitleElement = $("#title-day")[0];
    
    try {
        // hide next day button if last day with data
        let next_day_btn = $("#btn-next-day")[0];
        let prev_day_btn = $("#btn-prev-day")[0];

        next_day_btn.onclick = window.nextDay;
        prev_day_btn.onclick = window.prevDay;

        if(this.nextDate == 0) {
            next_day_btn.disabled = true;
            next_day_btn.style.visibility = "hidden";
            next_day_btn.classList.add("disabled");
        } else {
            next_day_btn.disabled = false;
            next_day_btn.style.visibility = "visible";
            next_day_btn.classList.remove("disabled");
        }

        // draw date
        let day = this.date.toString().slice(6,8);
        let month = this.date.toString().slice(4,6);
        let year = this.date.toString().slice(0,4);

        let date_string = day + "." + month + "." + year;

        dateTitleElement.innerHTML = this.weekDay + ", " + date_string;

        this.drawMessages();
        this.drawAffectedElements();
        handleAffectedElementsOverflow();
        this.drawSubstitutions();

    } catch (error) {
        console.debug(this);
        
        let affectedElementsBarObj = $("#affected-elements")[0];

        if(this.substitutions.length == 0) {
            affectedElementsBarObj.style.visibility = "hidden";
        } else {
            affectedElementsBarObj.style.visibility = "visible";
        }

        dateTitleElement.innerHTML = "";

        errorMessage(error);
    }
}

/**
 * master draw function, called on load or day change
 */
window.draw = function() {
    
    let loadingElement = $("#loading")[0];
    loadingElement.style.visibility = "visible";
    
    getCachedDay(settings.currentDateOffset).then((day) => {
        day.draw();
        initAutoscroll()
    })

    loadingElement.style.visibility = "hidden";

    getCachedDay(settings.currentDateOffset+1);
    getCachedDay(settings.currentDateOffset-1);
}