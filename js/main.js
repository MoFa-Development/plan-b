var currentDateOffset = 0;
var selectedClass = "";

async function getData(dateOffset = currentDateOffset) {
    return await fetch("php/getData.php?dateOffset="+dateOffset).then(response => response.json());
}

function decideOverflow() {
    var element = document.getElementById("affected-classes");

    scroll = element.scrollLeft;
    scroll_max = element.scrollWidth - element.clientWidth;
    element_width = element.clientWidth;

    //console.debug("scroll", scroll);
    //console.debug("scroll_max", scroll_max);
    //console.debug("element_width", element_width);

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

function drawMessages(data) {
    var messages = document.getElementById("messages");

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

function drawAffectedClasses(data) {
    var affectedClassesElement = document.getElementById("affected-classes");

    while (affectedClassesElement.firstChild) {
        affectedClassesElement.removeChild(affectedClassesElement.firstChild);
    }

    var affectedClasses = data.payload.affectedElements["1"].sort((a, b) => parseInt(a) > parseInt(b));

    affectedClasses.forEach((affectedClass) => {
        affectedClassesElement = document.getElementById("affected-classes");
        
        affectedClassElement = document.createElement("div");
        affectedClassElement.innerText = affectedClass;
        affectedClassElement.classList.add("affected-class");
        
        if(affectedClass == selectedClass) {
            affectedClassElement.classList.add("selected");
        }

        affectedClassElement.onclick = function() {
            setSelectedClass(affectedClass, data);
        }

        affectedClassesElement.appendChild(affectedClassElement);
    });

    affectedClassesElement.onscroll = decideOverflow;
}

function drawSubstitutions(data) {

    var substitutionsElement = document.getElementById("substitutions");

    while (substitutionsElement.firstChild) {
        substitutionsElement.removeChild(substitutionsElement.firstChild);
    }

    data.payload.rows.sort((a, b) => parseInt(a.group) - parseInt(b.group));

    data.payload.rows.forEach(element => {

        let periods     = element.data[0];
        let classes     = element.data[1].split(", ").sort((a, b) => a > b);
        let course_long = element.data[2];
        let course      = element.data[3];
        let room        = element.data[4];
        let teacher     = element.data[5];
        let subst_type  = element.data[6];
        let message     = element.data[7];

        let cssClasses  = element.cssClasses;
        let group       = element.group;

        if(group == classes[0] && (selectedClass == "" || classes.includes(selectedClass))) {
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
}

function draw() {
    var loadingElement = document.getElementById("loading");
    loadingElement.style.visibility = "visible";
    
    var dateTitleElement = document.getElementById("title-day");
    
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

        dateTitleElement.innerHTML = data.payload.weekDay + ", " + date_string;

        drawMessages(data);

        drawAffectedClasses(data);

        decideOverflow();

        drawSubstitutions(data);
    });

    loadingElement.style.visibility = "hidden";
}

function nextDay() {
    currentDateOffset++;
    draw();
}

function prevDay() {
    currentDateOffset--;
    draw();
}

function setSelectedClass(_selectedClass, data) {
    selectedClass = _selectedClass;

    var affectedClassesElement = document.getElementById("affected-classes");
    
    for(element of affectedClassesElement.children) {
        if(element.innerText == selectedClass) {
            element.classList.add("selected")
        } else {
            element.classList.remove("selected");
        }
    }

    drawSubstitutions(data);
    
    //console.debug("selectedClass", selectedClass);
}

function showSettings() {
    document.getElementById("settings-overlay-container").style.visibility = "visible";
    document.getElementById("settings-overlay-container").style.opacity = 1;
    document.getElementById("settings-overlay-container").style["-moz-opacity"] = 1;
}

function hideSettings() {
    document.getElementById("settings-overlay-container").style.visibility = "hidden";
    document.getElementById("settings-overlay-container").style.opacity = 0;
    document.getElementById("settings-overlay-container").style["-moz-opacity"] = 0;
}

events = [
    ["load", loadSettings],
    ["load", draw],
    ["keyup", (e) => {
        if(e.code == "Escape") {
            hideSettings();
        } else if (e.code = "Space") {
            // Die lange Taste wurde gedrückt :O
        }
    }],
    ["resize", decideOverflow],
    ["deviceorientation", decideOverflow]
]

if(window.addEventListener) {
    addEvent = window.addEventListener;
} else {
    addEvent = window.attachEvent;
}

for([event_name, func] of events) {
    addEvent(event_name, func);
    //console.debug("event_name", event_name);
    //console.debug("func", func);
}

const COLORS = ["#E53935", "#D81B60", "#8E24AA", "#5E35B1", "#3949AB", "#1E88E5", "#039BE5", "#00ACC1", "#00897B", "#43A047"];

function loadSettings() {
    if(getCookie("accent_color"))
        document.querySelector('body').style.setProperty('--accent', getCookie("accent_color"));
    for(c of COLORS){
        let colorSelector = document.createElement("div");
        colorSelector.setAttribute("style", "background: " + c);
        colorSelector.setAttribute("class", "colorSelector");
        colorSelector.setAttribute("onclick","colorClick(this);");
        document.getElementById("colors").appendChild(colorSelector);
    }
}

function colorClick(obj) {
    Array.from(document.getElementsByClassName("colorSelector")).forEach((el) => {
        el.classList.remove("selected");
    });
    obj.classList.add("selected");
    document.querySelector('body').style.setProperty('--accent', obj.style.backgroundColor);
    setCookie("accent_color", obj.style.backgroundColor, 999999);
}

function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }