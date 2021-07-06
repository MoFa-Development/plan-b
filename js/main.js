async function getData(dateOffset = 0) {
    const data = await fetch("/php/getData.php?dateOffset="+dateOffset).then(response => response.json());
    return data
}

window.onload = function () {
    getData().then(data => {
        data.payload.rows.forEach(element => {
            
            let time        = element.data[0]
            let classes     = element.data[1].split(", ")
            let course_long = element.data[2]
            let course      = element.data[2]
            let room        = element.data[3]
            let teacher     = element.data[4]
            let subst_type  = element.data[5]
            
            let message     = element.data[6]

            let cssClasses  = element.cssClasses
            let group       = element.group; 

            var p = document.createElement("p");
            p.appendChild(document.createTextNode(JSON.stringify(element)));
            document.getElementById("main").appendChild(p);
        });

    })
}