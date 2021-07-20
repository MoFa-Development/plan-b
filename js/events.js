const autoscrollFPS = 30;
const autoscrollWait = 3.0;
const autoscrollPixelPerFrame = 2; 

const autoscrollInterval = 1000 / autoscrollFPS;
const autoscrollWaitCount = autoscrollWait*1000 / autoscrollFPS;

window.initEvents = function() {
    
    const EVENTS = [
        ["load", window.loadSettings],
        ["load", window.draw],
        ["load", () => {
            setInterval(handleAutoscroll, autoscrollInterval);
        }],
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

window.setAutoscroll = function(obj) {
    autoscroll = obj.checked;

    setCookie("autoscroll", autoscroll, 9999);

    if(autoscroll) {
        document.getElementById("substitutions").classList.add("autoscroll");
    } else {
        document.getElementById("substitutions").classList.remove("autoscroll");
    }
}

window.handleAutoscroll = function(obj) {
    if(autoscroll) {
        document.querySelector("body").style.maxHeight = "100vh";

        let autoscrollElements = Array.from(document.getElementsByClassName("autoscroll"));
        
        autoscrollElements.forEach((e) => {
            let scroll = e.scrollTop;
            let scrollMax = e.scrollHeight - e.clientHeight;

            if(!e.waitCount) {
                e.waitCount = 0;
            }

            if(scrollMax != 0 && scroll < scrollMax) {
            
                if(e.waitCount == 0) {
                    e.scrollTop += autoscrollPixelPerFrame;
                } else {
                    e.waitCount--;
                }
            
            } else if(scrollMax != 0) {
                                   
                if(e.waitCount == autoscrollWaitCount) {
                    e.scrollTop = 0;
                } else {
                    e.waitCount++;
                }
            }
        });
    } else {
        document.querySelector("body").style.maxHeight = "100%";
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

window.nextDay = function() {
    currentDateOffset++;
    draw();
    reset_animation("title-day");
    document.getElementById("title-day").style.animation="slide-left 0.5s cubic-bezier(0.075, 0.82, 0.165, 1)";
}

window.prevDay = function() {
    currentDateOffset--;
    draw();
    reset_animation("title-day");
    document.getElementById("title-day").style.animation="slide-right 0.5s cubic-bezier(0.075, 0.82, 0.165, 1)";
}