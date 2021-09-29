const GIMMICKS = [
    {
        date: new Date(2020, 0, 0),
        content: `oegym.de/plan-b`,
        styles: `
            position: fixed;
            left: 1em;
            bottom: 1em;
            font-size: 1em;
            display: flex;
            font-family: 'Lato', sans-serif;
            background: linear-gradient(
                to right, 
                hsl(98 100% 62%), 
                hsl(204 100% 59%)
              );
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;`
    }
];

/**
 * load and add gimmicks with corresponding handler functions
 */
window.initGimmicks = function() {
    for(let i = 0; i<GIMMICKS.length; i++) {
        let current_date = GIMMICKS[i].date;
        if(current_date < Date.now()) {
            console.log("test");
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
    let el = document.getElementById("gimmick");
    el.innerHTML = gimmick.content;
    el.style = gimmick.styles;
 }