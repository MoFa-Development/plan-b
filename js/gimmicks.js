
/**
 * load and add gimmicks with corresponding handler functions
 */
window.initGimmicks = async function() {
    if(!autoscroll)
        return;

    var gimmicks = await getGimmicksData();
    for(let i = 0; i<gimmicks.length; i++) {
        let current_date = new Date(gimmicks[i].date);
        if(current_date < Date.now()) {
            if(gimmicks[i-1])
                initGimmick(gimmicks[i-1]);
            else
                initGimmick(gimmicks[i]);
        }
    }
}

/**
 * get API data through proxy, parse json, return parsed object
 */
 window.getGimmicksData = async function() {
    let data = await fetch("php/getGimmicksData.php").then(response => response.json());
    return data;
}

/**
 * initialize gimmick object
 */
 window.initGimmick = function(gimmick) {
    let el = document.getElementById("gimmick");
    el.innerHTML = gimmick.content;
    el.style = gimmick.styles;
 }