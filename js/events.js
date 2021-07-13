const DARKMODE_AFFECTED_QUERIES = ["body", ".navbar-arrow", ".subst-icon", ".icon", ".settings-btn-icon", "a"];

window.initEvents = function() {
    
    const EVENTS = [
        ["load", window.loadSettings],
        ["load", window.draw],
        ["keyup", (e) => {
            if(e.code == "Escape") {
                hideSettings();
            } else if (e.code == "Space") {
                // Die lange Taste wurde gedrückt :O
            }
        }],
        ["resize", window.decideOverflow],
        ["deviceorientation", window.decideOverflow]
    ];

    let addEvent

    if(window.addEventListener) {
        addEvent = window.addEventListener;
    } else {
        addEvent = window.attachEvent;
    }

    let event_name
    let func

    for([event_name, func] of EVENTS) {
        addEvent(event_name, func);
    }

}

window.setSelectedClass = function(_selectedClass, data) {
    selectedTeacher = "";

    if (selectedClass == _selectedClass)
        selectedClass = "";
    else
        selectedClass = _selectedClass;

    let affectedElementsElement = document.getElementById("affected-elements");
    
    let element
    for(element of affectedElementsElement.children) {
        if(element.innerText == selectedClass) {
            element.classList.add("selected")
        } else {
            element.classList.remove("selected");
        }
    }

    drawSubstitutions(data);
}

window.setSelectedTeacher = function(_selectedTeacher, data) {
    selectedClass = "";
    
    if (selectedTeacher == _selectedTeacher)
        selectedTeacher = "";
    else
        selectedTeacher = _selectedTeacher;

    let affectedElementsElement = document.getElementById("affected-elements");
    
    let element
    
    for(element of affectedElementsElement.children) {
        if(element.innerText == selectedTeacher) {
            element.classList.add("selected");
        } else {
            element.classList.remove("selected");
        }
    }

    drawSubstitutions(data);
}

window.setIsTeacher = function(obj) {
    is_teacher = obj.checked;

    if(is_teacher) {
        selectedClass = "";
    } else {
        selectedTeacher = "";
    }

    setCookie("is_teacher", is_teacher, 9999);
    draw();
}

window.setDarkmode = function(obj) {
    darkmode = obj.checked;

    setCookie("darkmode", darkmode, 9999);

    if(darkmode) {
        document.querySelector('body').classList.add("dark");
    } else {
        document.querySelector('body').classList.remove("dark");
    }
}

window.colorClick = function(obj) {
    Array.from(document.getElementsByClassName("colorSelector")).forEach((el) => {
        el.classList.remove("selected");
    });
    obj.classList.add("selected");
    
    let accent_color = rgb2hex(obj.style.backgroundColor);
    let accent_dark = shadeColor(accent_color, -20); 

    document.querySelector('body').style.setProperty('--accent', accent_color);
    document.querySelector('body').style.setProperty('--accent-dark', accent_dark);
    
    setCookie("accent_color", accent_color, 9999);
}