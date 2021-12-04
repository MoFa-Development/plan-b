const autoscrollFPS = 25;
window.autoscrollPixelPerFrame = 1;
const autoscrollInterval = 1000 / autoscrollFPS;

const refreshIntervalMinutes = 5;

window.RESET_AUTOSCROLL = false;

window.lastMouseMovedTimestamp = 0;
const TIMEOUT_INACTIVE = 5000;

/**
 * list of events with corresponding handler functions
 */
const EVENTS = [
    ["load", window.loadSettings],
    ["load", window.initGimmicks],
    ["load", window.draw],
    ["load", () => {
        // hiding the settings button
        setInterval(handleInactivity, 1000);

        // autoscroll
        setInterval(handleAutoscroll, autoscrollInterval);
        
        // data refreshing
        setInterval(draw, 1000*60*refreshIntervalMinutes);
    }],
    ["keyup", (e) => {
        if(e.code == "Escape") {
            hideSettings();
        }
    }],
    ["mousemove", (e) => {
        window.lastMouseMovedTimestamp = Date.now();
        document.body.classList.remove("inactive");
    }],
    ["resize", window.handleAffectedElementsOverflow],
    ["resize", window.initAutoscroll],
    ["deviceorientation", window.handleAffectedElementsOverflow]
];


/**
 * Hide settings
 */
window.handleInactivity = function() {
    
    if(settings.autoscroll && Date.now() - lastMouseMovedTimestamp > TIMEOUT_INACTIVE) {
        if(!document.body.classList.contains("inactive")) {
            document.body.classList.add("inactive");
        }
    } else {
        document.body.classList.remove("inactive");
    }
}

/**
 * load and add events with corresponding handler functions
 */
window.initEvents = function() {  
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

window.clearAutoscroll = function() {
    for(let clone of $(".autoscroll-dummy")) {
        clone.remove()
    }
}

/**
 * initialize autoscroll (must be called at every redraw)
 */
window.initAutoscroll = function() {
    console.debug("[initAutoscroll]", settings.autoscroll, $(".autoscroll"))

    window.clearAutoscroll();

    if(settings.autoscroll) {
        document.body.style.height = "100vh";

        let autoscrollElements = $(".autoscroll");

        for(let e of autoscrollElements) {

            console.debug("trying: ", e.clientHeight, " < ", e.scrollHeight)

            if(e.clientHeight < e.scrollHeight) {
                console.debug("init autoscroll for: ", e);

                let spacer = document.createElement("spacer");
                spacer.classList.add("autoscroll-dummy");
                e.appendChild(spacer)

                e.originalScrollHeight = e.scrollHeight;
                e.originalScrollTopMax = e.scrollTopMax;
            
                for(let child of e.children) {
                    let clone = child.cloneNode(true)
                    clone.classList.add("autoscroll-dummy")
                    e.appendChild(clone)

                    if(e.scrollHeight > e.originalScrollHeight + e.clientHeight) {
                        break;
                    }
                }
            }
        }
    } else {
        document.body.style.height = "100%";
    }
}

/**
 * handle next autoscroll animation frame
 */
window.handleAutoscroll = function() {
    if(RESET_AUTOSCROLL) {
        for(let e of $(".autoscroll")) {
            e.scrollTop = 0;
        }

        window.RESET_AUTOSCROLL = false;
    }
    
    if(settings.autoscroll) {
        let autoscrollElements = $(".autoscroll");

        for(let e of autoscrollElements) {
            if(e.clientHeight < e.scrollHeight) { // is the autoscroll element overflowing
                if(e.scrollTop < e.originalScrollHeight) { // is it NOT scrolled to the bottom
                    e.scrollBy({
                        top: autoscrollPixelPerFrame
                    });
                } else { // scrolled to the bottom
                    e.scroll({
                        top: 0
                    });
                }
            }
        }
    }
}

/**
 * handle onclick on next day button
 */ 
window.nextDay = function() {
    settings.currentDateOffset++;
    draw();
    reset_animation("title-day");
    $("#title-day")[0].style.animation="slide-left 0.5s cubic-bezier(0.075, 0.82, 0.165, 1)";
}

/**
 * handle onclick on previous day button
 */
window.prevDay = function() {
    settings.currentDateOffset--;
    draw();
    reset_animation("title-day");
    $("#title-day")[0].style.animation="slide-right 0.5s cubic-bezier(0.075, 0.82, 0.165, 1)";
}