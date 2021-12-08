window.errorMessage = function(error) {
    console.debug(error);

    $("#messages")[0].innerHTML = "";
    $("#affected-elements")[0].innerHTML = "";
    $("#affected-elements")[0].classList = [];

    $("#substitutions")[0].innerHTML = "<p class=\"no-subst-msg\"><img src=\"icons/cancelled.svg\" class=\"icon\">Es ist ein Fehler aufgetreten. <br><sub>("+error+")</sub></p>";
}

/**
 * Convert CSS rgba(r,g,b) to hex string
 */
window.rgb2hex = (rgba) => `#${rgba.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+\.{0,1}\d*))?\)$/).slice(1).map((n, i) => (i === 3 ? Math.round(parseFloat(n) * 255) : parseFloat(n)).toString(16).padStart(2, '0').replace('NaN', '')).join('')}`

/**
 * Set cookie
 * 
 * @param {String} cname Cookie name 
 * @param {String} cvalue Cookie value
 * @param {number} exdays Days until expiration
 */
window.setCookie = function(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=" + window.location.pathname + ";SameSite=Lax;";
}

/**
 * Get cookie value
 * 
 * @param {String} cname 
 * @returns {String} Cookie value
 */
window.getCookie = function(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');

    for(let i = 0; i < ca.length; i++) {
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

/**
 * shade color (brighten or darken)
 * 
 * @param {String} color hex encoded color
 * @param {number} percent absolute percentage to shade to (100% changes nothing)
 * @returns 
 */
window.shadeColor = function(color, percent) {
    let R = parseInt(color.substring(1,3),16);
    let G = parseInt(color.substring(3,5),16);
    let B = parseInt(color.substring(5,7),16);

    R = parseInt(R * (100 + percent) / 100);
    G = parseInt(G * (100 + percent) / 100);
    B = parseInt(B * (100 + percent) / 100);

    R = (R<255)?R:255;  
    G = (G<255)?G:255;  
    B = (B<255)?B:255;  

    let RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
    let GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
    let BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));

    return "#"+RR+GG+BB;
}

/**
 * Reset animation of given element found by id
 * @param {String} id Element id
 */
window.reset_animation = function(id) {
    var elem = $('#'+id)[0];
    elem.style.animation = 'none';
    elem.offsetHeight; //trigger reflow
    elem.style.animation = null; 
}

/**
 * Check if lists have at least one common element
 * 
 * @param {Array} a
 * @param {Array} b
 * @returns {boolean}
 */
window.listsIntersect = function(a, b) {
    for (var i = 0; i < a.length; i++) {
        if(b.includes(a[i])) {
            return true;
        }
    }

    return false;
}