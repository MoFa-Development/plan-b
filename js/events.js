const autoscrollFPS = 20;
const autoscrollWait = 3.0; // time to wait at top / bottom of scrollable view
const autoscrollPixelPerFrame = 2; 

const autoscrollInterval = 1000 / autoscrollFPS;
const autoscrollWaitCount = autoscrollWait*1000 / autoscrollFPS; //amount of frames to wait at top / bottom of scrollable view

const refreshIntervalMinutes = 5;

window.RESET_AUTOSCROLL = false;

/**
 * list of events with corresponding handler functions
 */
const EVENTS = [
    ["load", window.loadSettings],
    ["load", window.draw],
    ["load", () => {
        setInterval(handleAutoscroll, autoscrollInterval);
        setInterval(draw, 1000*60*refreshIntervalMinutes);
    }],
    ["keyup", (e) => {
        if(e.code == "Escape") {
            hideSettings();
        } else if (e.code == "Space") {
            // Die lange Taste wurde gedrückt :O
        }
    }],
    ["resize", window.handleAffectedElementsOverflow],
    ["deviceorientation", window.handleAffectedElementsOverflow]
];

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

/**
 * handle next autoscroll animation frame
 */
window.handleAutoscroll = function() {
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

            if(RESET_AUTOSCROLL) {
                e.scrollTop = 0;
                e.waitCount = autoscrollWaitCount;
                RESET_AUTOSCROLL = false;
            }
        });
    } else {
        document.querySelector("body").style.maxHeight = "100%";
    }
}

/**
 * handle onclick on next day button
 */ 
window.nextDay = function() {
    currentDateOffset++;
    draw();
    reset_animation("title-day");
    document.getElementById("title-day").style.animation="slide-left 0.5s cubic-bezier(0.075, 0.82, 0.165, 1)";
}

/**
 * handle onclick on previous day button
 */
window.prevDay = function() {
    currentDateOffset--;
    draw();
    reset_animation("title-day");
    document.getElementById("title-day").style.animation="slide-right 0.5s cubic-bezier(0.075, 0.82, 0.165, 1)";
}