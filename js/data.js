const PLACEHOLDERS = [
    "?",
    "---",
    "-",
    "...",
    "."
]

// get API data through proxy, parse json, return parsed object
window.getData = async function(dateOffset = currentDateOffset) {
    let data = await fetch("php/getData.php?dateOffset="+dateOffset).then(response => response.json());
    console.debug(data);
    return data;
}

// sort data dynamically based on window.is_teacher
window.sortData = function(data) {

    let _data = data;
    
    if(is_teacher) {
        // sort by substitution begin 
        _data.payload.rows = _data.payload.rows.sort((a, b) => getSubstitutionBegin(a) - getSubstitutionBegin(b));

        // sort by first teacher in teacher info
        // this means the substituting teacher is relevant for sorting, not the substituted
        // if there's only one teacher, we don't have a problem in the first place
        _data.payload.rows = _data.payload.rows.sort((a, b) => getAffectedTeachersOfRow(a)[0].toUpperCase() > getAffectedTeachersOfRow(b)[0].toUpperCase());
    } else {
        // sort by substitution begin
        _data.payload.rows = _data.payload.rows.sort((a, b) => getSubstitutionBegin(a) - getSubstitutionBegin(b));
    
        // sort by first affected class
        _data.payload.rows = _data.payload.rows.sort((a, b) => getAffectedClassesOfRow(a)[0].toUpperCase() > getAffectedClassesOfRow(b)[0].toUpperCase());
    }

    return _data;
};

window.getSubstitutionBegin = function(row) {
    let timeInfo = row.data[0];
    
    let beginInt = parseInt(timeInfo);
    return beginInt;
};

window.getAffectedTeachersOfRow = function(row) {
    let affectedTeachers = [];

    let teacher_data_raw = row.data[5];
    let teacher_data_text = teacher_data_raw.replace(/(<([^>]+)>)/ig, '');
    teacher_data_text = teacher_data_text.replace(/(\(|\)|\,)/ig, '');

    let teachers = teacher_data_text.split(" ");

    teachers.forEach((teacher) => {
        if(!affectedTeachers.includes(teacher) && teacher != "---") {
            affectedTeachers.push(teacher);
        }
    });

    return affectedTeachers;
};

// based on API data, return all affected teachers
window.getAffectedTeachers = function(data) {
    let affectedTeachers = [];

    data.payload.rows.forEach((element) => {
        let subst_type = element.data[6];
        let teacher_data_raw = element.data[5];
        
        let teacher_data_text = teacher_data_raw.replace(/(<([^>]+)>)/ig, '');
        teacher_data_text = teacher_data_text.replace(/(\(|\)|\,)/ig, '');

        console.debug(teacher_data_raw)

        let teachers = teacher_data_text.split(" ")

        teachers.forEach((teacher) => {
            if(!affectedTeachers.includes(teacher) &&
                        teacher != "---" &&
                        !teacher_data_raw.includes("<span class=\"cancelStyle\">"+teacher+"</span>") &&
                        subst_type != "Entfall") {
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
};

window.getAffectedClassesOfRow = function(row) {
    let classes_raw = row.data[1].split(", ");

    classes_raw = classes_raw.sort(); // standard javascript sort -> should pre-sort letters
    classes_raw = classes_raw.sort((a, b) => parseInt(a.replace(/\D/g,'')) - parseInt(b.replace(/\D/g,''))); // sort by actual year

    let classes = classes_raw;
    return classes;
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
};