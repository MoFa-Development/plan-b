window.getData = async function(dateOffset = currentDateOffset) {
    return await fetch("php/getData.php?dateOffset="+dateOffset).then(response => response.json());
}

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

    return affectedTeachers;
}