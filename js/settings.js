/**
 * globally reachable settings object  
 */
window.settings = {
    currentDateOffset: 0,
    selectedClass: "",
    selectedTeacher: "",
    is_teacher: false,
    darkmode: false,
    autoscroll: false
};

/**
 * default available accent colors
 */
const COLORS = ["#E53935", "#D81B60", "#8E24AA", "#5E35B1", "#3949AB", "#1E88E5", "#039BE5", "#00ACC1", "#00897B", "#43A047"];
const TIME_SHOW_NEXT_DAY = 16 //:00 o' clock in 24-hour format

settings.autoscroll = false;

/**
 * show settings menu
 */
window.showSettings = function() {
    $("#settings-overlay-container")[0].style.visibility = "visible";
    $("#settings-overlay-container")[0].style.opacity = 1;
}

/**
 * hide settings menu
 */
window.hideSettings = function() {
    $("#settings-overlay-container")[0].style.visibility = "hidden";
    $("#settings-overlay-container")[0].style.opacity = 0;
}

/**
 * applies url parameters to cookies
 */
window.applyUrlParameters = function() {
    var urlParams = new URLSearchParams(location.search);
    
    for(var pair of urlParams.entries()) {
        setCookie(pair[0].toLowerCase(), pair[1].toLowerCase().split(";")[0], 9999);
    }
}

/**
 * load and apply settings stored in cookies,
 * get darkmode preference from browser if no darkmode cookie available
 */
window.loadSettings = function loadSettings() {
    applyUrlParameters();

    if(getCookie("darkmode")) {
        settings.darkmode = getCookie("darkmode") == "true"; // get darkmode preference from cookie
    } else {
        settings.darkmode = matchMedia("screen and (prefers-color-scheme: dark)").matches; // get darkmode preference from browser
    }

    // apply darkmode setting
    if(settings.darkmode) {
        document.querySelector('body').classList.add("dark"); // darkmode on
    } else {
        document.querySelector('body').classList.remove("dark"); // darkmode off
    }

    $("#dark-mode-switch")[0].checked = settings.darkmode; // set dark mode switch in settings menu


    // get autoscroll preference from cookie
    if(getCookie("autoscroll")) {
        settings.autoscroll = getCookie("autoscroll") == "true";
    } else {
        settings.autoscroll = false;
    }

    // apply autoscroll setting
    if(settings.autoscroll) {
        document.body.classList.add("monitor-mode");
        
        for(let elem of $(".substitutions")) {
            console.debug(elem)
            
            elem.classList.add("autoscroll")
        }
        //window.initAutscroll()
    } else {
        document.body.classList.remove("monitor-mode");
        
        for(let elem of $(".substitutions")) {
            elem.classList.remove("autoscroll")
        }
    }

    $("#autoscroll-switch")[0].checked = settings.autoscroll;


    // add accent color selects to settings menu
    let c;
    let colorsElem = $("#colors")[0];
    for(c of COLORS){
        let colorSelector = document.createElement("div");
        colorSelector.style.background = c;
        colorSelector.id = "color" + c;
        colorSelector.classList.add("colorSelector");
        colorSelector.setAttribute("onclick","colorClick(this);");
        colorsElem.appendChild(colorSelector);
        console.debug("colorsElem: ", colorsElem);
        console.debug("color: ", c);
    }

    // get accent color from cookie, generate dynamic dark accent color, pass colors to CSS
    if(getCookie("accent_color")) {
        let accent_color = getCookie("accent_color");
        let accent_dark = shadeColor(accent_color, -20);

        document.querySelector('body').style.setProperty('--accent', accent_color);
        document.querySelector('body').style.setProperty('--accent-dark', accent_dark);

        if(COLORS.includes(accent_color.toUpperCase()))
            document.getElementById("color" + accent_color.toUpperCase()).classList.add("selected");
    }

    // get teacher mode preference from cookie
    if(getCookie("is_teacher")) {
        settings.is_teacher = getCookie("is_teacher") == "true"    
    }

    if(settings.is_teacher) {
        $(".substitutions")[0].classList.add("teacher");
    } else {
        $(".substitutions")[0].classList.remove("teacher");
    }

    $("#is-teacher")[0].checked = settings.is_teacher; // set teacher mode switch in settings menu
}

/**
 * handle onclick on teacher mode switch
 * 
 * @param {HTMLElement} obj clicked checkbox element
 */
window.setIsTeacher = function(obj) {
    settings.is_teacher = obj.checked;

    if(settings.is_teacher) {
        settings.selectedClass = "";
    } else {
        settings.selectedTeacher = "";
    }

    if(settings.is_teacher) {
        $(".substitutions")[0].classList.add("teacher");
    } else {
        $(".substitutions")[0].classList.remove("teacher");
    }

    setCookie("is_teacher", settings.is_teacher, 9999);
    draw();
}


/**
 * handle onclick on darkmode switch
 * 
 * @param {HTMLElement} obj clicked checkbox element
 */
window.setDarkmode = function(obj) {
    settings.darkmode = obj.checked;

    setCookie("darkmode", settings.darkmode, 9999);

    if(settings.darkmode) {
        document.body.classList.add("dark");
    } else {
        document.body.classList.remove("dark");
    }
}

/**
 * handle onclick on autoscroll switch
 * 
 * @param {HTMLElement} obj clicked checkbox element
 */
window.setAutoscroll = function(obj) {
    settings.autoscroll = obj.checked;

    setCookie("autoscroll", settings.autoscroll, 9999);

    if(settings.autoscroll) {
        document.body.classList.add("monitor-mode");
        
        for(let elem of $(".substitutions")) {
            elem.classList.add("autoscroll")
        }
        window.initAutoscroll()
    } else {
        document.body.classList.remove("monitor-mode");
        
        for(let elem of $(".substitutions")) {
            elem.classList.remove("autoscroll")
        }
    }

    window.RESET_AUTOSCROLL = true;
}

/**
 * handle onclick on accent color select element
 * 
 * @param {HTMLElement} obj clicked checkbox element
 */
window.colorClick = function(obj) {
    Array.from(document.getElementsByClassName("colorSelector")).forEach((el) => {
        el.classList.remove("selected");
    });
    obj.classList.add("selected");
    
    let accent_color = rgb2hex(obj.style.backgroundColor);
    let accent_dark = shadeColor(accent_color, -20); 

    document.body.style.setProperty('--accent', accent_color);
    document.body.style.setProperty('--accent-dark', accent_dark);
    
    setCookie("accent_color", accent_color, 9999);
}

/**
 * set or unset selected teacher / class
 * 
 * @param {HTMLElement} elem selectedElement HTMLElement
 * @param {*} data API data of the current day
 */
window.Day.prototype.setSelectedElement = function(elem) {
    if(settings.is_teacher) {
        settings.selectedClass = "";
        
        if (settings.selectedTeacher == elem) {
            settings.selectedTeacher = "";
        } else {
            settings.selectedTeacher = elem;
        }

    } else {
        settings.selectedTeacher = "";

        if (settings.selectedClass == elem) {
            settings.selectedClass = "";
        } else {
            settings.selectedClass = elem;
        }
    }

    this.drawSubstitutions();
}