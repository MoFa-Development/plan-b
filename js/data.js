const PLACEHOLDERS = [
    "?",
    "---",
    "-",
    "...",
    "."
]

// get API data through proxy, parse json, return parsed object
window.getData = async function(dateOffset = currentDateOffset) {
    return await fetch("php/getData.php?dateOffset="+dateOffset).then(response => response.json());
}

// based on API data, return all affected teachers
window.getAffectedTeachers = function(data) {
    let affectedTeachers = [];

    data.payload.rows.forEach((element) => {
        let teacher_data_raw = element.data[5];
        let teacher_data_text = teacher_data_raw.replace(/(<([^>]+)>)/ig, '');
        teacher_data_text = teacher_data_text.replace(/(\(|\)|\,)/ig, '');

        let teachers = teacher_data_text.split(" ")

        teachers.forEach((teacher) => {
            if(!affectedTeachers.includes(teacher) && teacher != "---") {
                affectedTeachers.push(teacher);
            }
        })
    })

    affectedTeachers = affectedTeachers.sort();

    // filter out placeholders that shouldn't appear in affected elements
    affectedTeachers = affectedTeachers.filter(
        (affectedTeacher) => PLACEHOLDERS.includes(affectedTeacher) == false
    )

    return affectedTeachers;
}

// based on API data, return all affected classes
window.getAffectedClasses = function(data) {
    let affectedClasses = data.payload.affectedElements["1"];
        
    // sort affected classes by year
    affectedClasses = affectedClasses.sort((a, b) => parseInt(a.replace(/\D/g,'')) - parseInt(b.replace(/\D/g,'')));

    // filter out placeholders that shouldn't appear in affected elements
    affectedClasses = affectedClasses.filter(
        (affectedClass) => PLACEHOLDERS.includes(affectedClass) == false
    )

    return affectedClasses;
}