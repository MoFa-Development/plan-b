const COLORS = ["#E53935", "#D81B60", "#8E24AA", "#5E35B1", "#3949AB", "#1E88E5", "#039BE5", "#00ACC1", "#00897B", "#43A047"];

window.showSettings = function() {
    document.getElementById("settings-overlay-container").style.visibility = "visible";
    document.getElementById("settings-overlay-container").style.opacity = 1;
}

window.hideSettings = function() {
    document.getElementById("settings-overlay-container").style.visibility = "hidden";
    document.getElementById("settings-overlay-container").style.opacity = 0;
}

window.loadSettings = function loadSettings() {
    
    if(getCookie("darkmode")) {
        darkmode = getCookie("darkmode") == "true";
    } else {
        darkmode = window.matchMedia("screen and (prefers-color-scheme: dark)").matches;
    }

    if(darkmode) {
        document.querySelector('body').classList.add("dark");
    } else {
        document.querySelector('body').classList.remove("dark");
    }

    document.getElementById("dark-mode-switch").checked = darkmode;


    if(getCookie("autoscroll")) {
        autoscroll = getCookie("autoscroll") == "true";
    } else {
        autoscroll = false;
    }

    if(autoscroll) {
        document.getElementById("substitutions").classList.add("autoscroll");
    } else {
        document.getElementById("substitutions").classList.remove("autoscroll");
    }

    document.getElementById("autoscroll-switch").checked = autoscroll;


    let c
    for(c of COLORS){
        let colorSelector = document.createElement("div");
        colorSelector.setAttribute("style", "background: " + c);
        colorSelector.setAttribute("id", "color" + c);
        colorSelector.setAttribute("class", "colorSelector");
        colorSelector.setAttribute("onclick","colorClick(this);");
        document.getElementById("colors").appendChild(colorSelector);
    }

    if(getCookie("accent_color")) {
        let accent_color = getCookie("accent_color");
        let accent_dark = shadeColor(accent_color, -20);

        document.querySelector('body').style.setProperty('--accent', accent_color);
        document.querySelector('body').style.setProperty('--accent-dark', accent_dark);

        if(COLORS.includes(accent_color.toUpperCase()))
            document.getElementById("color" + accent_color.toUpperCase()).classList.add("selected");
    }


    if(getCookie("is_teacher")) {
        is_teacher = getCookie("is_teacher") == "true"    
    }

    document.getElementById("is-teacher").checked = is_teacher;
}