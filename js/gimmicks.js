const GIMMICKS = [
    {
        date: Date(2020, 0, 0),
        content: `oegym.de/plan-b`,
        styles: `
            position: absolute;
            left: 10;
            bottom: 10;
            width = 5%;`
    }
];

/**
 * load and add gimmicks with corresponding handler functions
 */
window.initGimmicks = function() {
    for(let i = 0; i<keys.length - 1; i++) {
        let current_date = GIMMICKS[i].date;
        if(current_date < Date.now()) {
            if(GIMMICKS[i-1])
                initGimmick(GIMMICKS[i-1]);
            else
                initGimmick(GIMMICKS[i]);
        }
    }
}

/**
 * initialize gimmick object
 */
 window.initGimmick = function(gimmick) {  
    console.log("init gimmick: " + gimmick.content);
    let el = document.getElementById("gimmick");
    el.innerHTML = gimmick.content;
 }