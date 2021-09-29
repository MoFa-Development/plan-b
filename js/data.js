/**
 * A list of placeholders that should not be interpreted as teachers or classes
 */
const PLACEHOLDERS = [
    "?",
    "---",
    "-",
    "...",
    "."
]

const REFRESH_CACHE_MILL = 2*60*1000;

window.dataCache = {};

class CacheEntry {
    constructor(data) {
        this.timestamp = new Date().getTime();
        this.data = data;
    }
}

/**
 * Returns data from cache if data new enough, otherwise fetches new data and returns
 * @param {int} dateOffset 
 * @returns data of specified day
 */
window.getCachedData = async function(dateOffset = currentDateOffset) {
    if(!dataCache[dateOffset] || dataCache[dateOffset].timestamp < new Date().getTime()-REFRESH_CACHE_MILL) {
        
        await getData(dateOffset).then(data => {
            dataCache[dateOffset] = new CacheEntry(data);
            console.debug("dataCache["+dateOffset.toString()+"] = ", dataCache[dateOffset]);
        }).catch(error => errorMessage(error));
    }

    return dataCache[dateOffset].data;
}

/**
 * get API data through proxy, parse json, return parsed object
 */
window.getData = async function(dateOffset = currentDateOffset) {
    let data = await fetch("php/getData.php?dateOffset="+dateOffset).then(response => response.json());
    console.debug("got data: ", data);
    return data;
}

/**
 * sort data dynamically based on `window.is_teacher`
 */
window.sortData = function(data) {

    let _data = Object.assign({}, data);
    
    if(is_teacher) {
        // sort by substitution begin 
        _data.payload.rows.sort((a, b) => getSubstitutionBegin(a) - getSubstitutionBegin(b));

        // sort by first teacher in teacher info
        // this means the substituting teacher is relevant for sorting, not the substituted
        // if there's only one teacher, we don't have a problem in the first place
        _data.payload.rows.sort((a, b) => getAffectedTeachersOfRow(a)[0].toUpperCase() > getAffectedTeachersOfRow(b)[0].toUpperCase());
    } else {
        // sort by substitution begin
        _data.payload.rows.sort((a, b) => getSubstitutionBegin(a) - getSubstitutionBegin(b));
    
        // sort by first affected class
        _data.payload.rows.sort((a, b) => getAffectedClassesOfRow(a)[0].toUpperCase() > getAffectedClassesOfRow(b)[0].toUpperCase());
        _data.payload.rows.sort((a, b) => parseInt(a.group.replace(/\D/g,'')) - parseInt(b.group.replace(/\D/g,'')));
    }

    return _data;
};

/**
 * Get first lesson affected by given substitution
 * 
 * @param {*} row from `data.payload.rows[n]`
 * @returns {number} first lesson affected by given substitution
 */
window.getSubstitutionBegin = function(row) {
    let timeInfo = row.data[0];

    return parseInt(timeInfo);
};

/**
 * Get a list of all teachers affected by the given substitution
 * 
 * @param {*} row from `data.payload.rows[n]`
 * @returns {*[]} list of all teachers affected by the given substitution
 */
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

/**
 * based on API data, return all affected teachers
 *
 * @param {*} data API data of the current day
 * @returns {*[]} list of all affected teachers of the current day
 */
window.getAffectedTeachers = function(data) {
    let affectedTeachers = [];

    data.payload.rows.forEach((element) => {
        let subst_type = element.data[6];
        let teacher_data_raw = element.data[5];
        
        let teacher_data_text = teacher_data_raw.replace(/(<([^>]+)>)/ig, '');
        teacher_data_text = teacher_data_text.replace(/(\(|\)|\,)/ig, '');

        let teachers = teacher_data_text.split(" ")

        teachers.forEach((teacher) => {
            if(!affectedTeachers.includes(teacher) && // do not add teacher multiple times
                        !PLACEHOLDERS.includes(teacher) && // do not add placeholders
                        !teacher_data_raw.includes("<span class=\"cancelStyle\">"+teacher+"</span>") && // do not add substituted only teachers
                        subst_type != "Entfall" // do not add cancelled teachers
                        ) {
                affectedTeachers.push(teacher);
            }
        })
    })

    affectedTeachers = affectedTeachers.sort();

    // filter out placeholders that shouldn't appear in affected elements
    affectedTeachers = affectedTeachers.filter(
        (affectedTeacher) => !PLACEHOLDERS.includes(affectedTeacher)
    )

    return affectedTeachers;
};

/**
 * Get a list of all classes affected by the given substitution
 * 
 * @param {*} row from `data.payload.rows[n]`
 * @returns {*[]} list of all classes affected by the given substitution
 */
window.getAffectedClassesOfRow = function(row) {
    let classes_raw = row.data[1].split(", ");

    classes_raw = classes_raw.sort(); // standard javascript sort -> should pre-sort letters
    classes_raw = classes_raw.sort((a, b) => parseInt(a.replace(/\D/g,'')) - parseInt(b.replace(/\D/g,''))); // sort by actual year

    let classes = classes_raw;
    return classes;
}

/**
 * based on API data, return all affected classes
 * 
 * @param {*} data API data of the current day
 * @returns {*[]} list of all affected classes of the current day
 */
window.getAffectedClasses = function(data) {
    let affectedClasses = data.payload.affectedElements["1"];
        
    // sort affected classes by year
    affectedClasses = affectedClasses.sort((a, b) => parseInt(a.replace(/\D/g,'')) - parseInt(b.replace(/\D/g,'')));

    // filter out placeholders that shouldn't appear in affected elements
    affectedClasses = affectedClasses.filter(
        (affectedClass) => !PLACEHOLDERS.includes(affectedClass)
    )

    return affectedClasses;
};