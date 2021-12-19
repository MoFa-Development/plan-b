window.Substitution = class {
    constructor(data_row) {
        this.periods     = data_row.data[0];
        this.begin       = parseInt(this.periods);

        this.course       = data_row.data[3];
        this.room         = data_row.data[4];
        this.teachers_raw = data_row.data[5];
        this.type         = data_row.data[6];
        this.message      = data_row.data[7];
        
        this.cssClasses   = data_row.cssClasses;
        this.group        = data_row.group;

        let teacher_data_text = this.teachers_raw.replace(/(<([^>]+)>)/ig, '');
        teacher_data_text = teacher_data_text.replace(/[\(\)\,]/ig, '');

        this.teachers = teacher_data_text.split(" ");

        this.teachers.forEach((t) => {
            if(!this.teachers.includes(t) && this.teachers_raw != "---") {
                this.teachers.push(t);
            }
        });

        this.classes_raw = data_row.data[1];

        this.classes = data_row.data[1].split(", ");
        this.classes = this.classes.sort(); // standard javascript sort -> should pre-sort letters
        this.classes = this.classes.sort((a, b) => parseInt(a.replace(/\D/g,'')) - parseInt(b.replace(/\D/g,''))); // sort by actual year
    }
}

window.Message = class {
    constructor(message_data) {
        this.subject = message_data.subject;
        this.body = message_data.body;
    }
}

window.Day = class {
    teacher_substitutions = [];
    student_substitutions = [];
    messages = []; 

    constructor(data) {
        this.date = data.payload.date;
        this.nextDate = data.payload.nextDate;
        this.weekDay = data.payload.weekDay;
        
        this.lastUpdate = data.payload.lastUpdate;
        
        data.payload.messageData.messages.forEach((message_data) => {
            this.messages.push(new Message(message_data));
        });

        //#region get affected classes
        this.affectedClasses = data.payload.affectedElements["1"];

        // sort affected classes by year
        this.affectedClasses = this.affectedClasses.sort((a, b) => parseInt(a.replace(/\D/g,'')) - parseInt(b.replace(/\D/g,'')));
        
        // filter out placeholders that shouldn't appear in affected elements
        this.affectedClasses = this.affectedClasses.filter(
            (affectedClass) => !PLACEHOLDERS.includes(affectedClass)
        )

        //#endregion

        //#region get affected teachers
        this.affectedTeachers = [];

        data.payload.rows.forEach((element) => {
            let subst_type = element.data[6];
            let teacher_data_raw = element.data[5];
            
            let teacher_data_text = teacher_data_raw.replace(/(<([^>]+)>)/ig, '');
            teacher_data_text = teacher_data_text.replace(/[\(\)\,]/ig, '');

            let teachers = teacher_data_text.split(" ")

            teachers.forEach((teacher) => {
                if(!this.affectedTeachers.includes(teacher) && // do not add teacher multiple times
                            !PLACEHOLDERS.includes(teacher) && // do not add placeholders
                            !teacher_data_raw.includes("<span class=\"cancelStyle\">"+teacher+"</span>") && // do not add substituted only teachers
                            subst_type != "Entfall" // do not add cancelled teachers
                            ) {
                    this.affectedTeachers.push(teacher);
                }
            })
        })

        this.affectedTeachers = this.affectedTeachers.sort();

        // filter out placeholders that shouldn't appear in affected elements
        this.affectedTeachers = this.affectedTeachers.filter(
            (affectedTeacher) => !PLACEHOLDERS.includes(affectedTeacher)
        )
        //#endregion
    
        data.payload.rows.forEach((row) => {
            let subst = new Substitution(row);
            this.teacher_substitutions.push(subst);
            this.student_substitutions.push(subst);
        });

        //#region sort substitutions for teachers
        
        // sort by substitution begin 
        this.teacher_substitutions.sort((a, b) => a.begin - b.begin);

        // sort by first teacher in teacher info
        // this means the substituting teacher is relevant for sorting, not the substituted
        // if there's only one teacher, we don't have a problem in the first place
        this.teacher_substitutions.sort((a, b) => a.teachers[0].toUpperCase() > b.teachers[0].toUpperCase());
        
        //#endregion

        //#region sort substitutions for students
        
        // sort by subject
        this.student_substitutions.sort((a, b) => a.course.toUpperCase() > b.course.toUpperCase());
        
        // sort by substitution begin
        this.student_substitutions.sort((a, b) => a.begin - b.begin);
        
        // sort by first affected class
        this.student_substitutions.sort((a, b) => a.classes[0].toUpperCase() > b.classes[0].toUpperCase());
        this.student_substitutions.sort((a, b) => parseInt(a.group.replace(/\D/g,'')) - parseInt(b.group.replace(/\D/g,'')));
        
        //#endregion
    }

    get substitutions() {
        if(settings.is_teacher) {
            return this.teacher_substitutions;
        } else {
            return this.student_substitutions;
        }
    }
}

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
        this.day = new Day(data);
    }
}

/**
 * Returns data from cache if data new enough, otherwise fetches new data and returns
 * @param {int} dateOffset 
 * @returns day object of specified date offset
 */
window.getCachedDay = async function(dateOffset = settings.currentDateOffset) {
    if(!dataCache[dateOffset] || dataCache[dateOffset].timestamp < new Date().getTime()-REFRESH_CACHE_MILL) {
        
        await getData(dateOffset).then(data => {
            dataCache[dateOffset] = new CacheEntry(data);
            console.debug("dataCache["+dateOffset.toString()+"] = ", dataCache[dateOffset]);
        }).catch(error => errorMessage(error));
    }

    return dataCache[dateOffset].day;
}

/**
 * get API data through proxy, parse json, return parsed object
 */
window.getData = async function(dateOffset = settings.currentDateOffset) {
    let data = await fetch("php/getData.php?dateOffset="+dateOffset).then(response => response.json());
    console.debug("got data: ", data);
    return data;
}