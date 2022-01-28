window.Substitution = class {
  constructor (dataRow) {
    this.periods = dataRow.data[0]
    this.begin = parseInt(this.periods)

    this.course = dataRow.data[3]
    this.room = dataRow.data[4]
    this.teachers_raw = dataRow.data[5]
    this.type = dataRow.data[6]
    this.message = dataRow.data[7]

    this.cssClasses = dataRow.cssClasses
    this.group = dataRow.group

    let teacherDataText = this.teachers_raw.replace(/(<([^>]+)>)/ig, '')
    teacherDataText = teacherDataText.replace(/[(),]/ig, '')

    this.teachers = teacherDataText.split(' ')

    this.teachers.forEach((t) => {
      if (!this.teachers.includes(t) && !PLACEHOLDERS.includes(this.teachers_raw)) {
        this.teachers.push(t)
      }
    })

    this.classes_raw = dataRow.data[1]

    this.classes = dataRow.data[1].split(', ')
    this.classes = this.classes.sort() // standard javascript sort -> should pre-sort letters
    this.classes = this.classes.sort((a, b) => parseInt(a.replace(/\D/g, '')) - parseInt(b.replace(/\D/g, ''))) // sort by actual year
  }
}

window.Message = class {
  constructor (messageData) {
    this.subject = messageData.subject
    this.body = messageData.body
  }
}

window.Day = class {
  constructor (data) {
    this.teacher_substitutions = []
    this.student_substitutions = []
    this.messages = []

    this.date = data.payload.date
    this.nextDate = data.payload.nextDate
    this.weekDay = data.payload.weekDay

    this.lastUpdate = data.payload.lastUpdate

    data.payload.messageData.messages.forEach((messageData) => {
      this.messages.push(new window.Message(messageData))
    })

    // #region get affected classes
    this.affectedClasses = data.payload.affectedElements['1']

    // sort affected classes by year
    this.affectedClasses = this.affectedClasses.sort((a, b) => parseInt(a.replace(/\D/g, '')) - parseInt(b.replace(/\D/g, '')))

    // filter out placeholders that shouldn't appear in affected elements
    this.affectedClasses = this.affectedClasses.filter(
      (affectedClass) => !PLACEHOLDERS.includes(affectedClass)
    )

    // #endregion

    // #region get affected teachers
    this.affectedTeachers = []

    data.payload.rows.forEach((element) => {
      const substType = element.data[6]
      const teacherDataRaw = element.data[5]

      let teacherDataText = teacherDataRaw.replace(/(<([^>]+)>)/ig, '')
      teacherDataText = teacherDataText.replace(/[(),]/ig, '')

      const teachers = teacherDataText.split(' ')

      teachers.forEach((teacher) => {
        if (!this.affectedTeachers.includes(teacher) && // do not add teacher multiple times
            !PLACEHOLDERS.includes(teacher) && // do not add placeholders
            !teacherDataRaw.includes('<span class=\'cancelStyle\'>' + teacher + '</span>') && // do not add substituted only teachers
            substType !== 'Entfall') { // do not add cancelled teachers
          this.affectedTeachers.push(teacher)
        }
      })
    })

    this.affectedTeachers = this.affectedTeachers.sort()

    // filter out placeholders that shouldn't appear in affected elements
    this.affectedTeachers = this.affectedTeachers.filter(
      (affectedTeacher) => !PLACEHOLDERS.includes(affectedTeacher)
    )
    // #endregion

    data.payload.rows.forEach((row) => {
      const subst = new window.Substitution(row)
      this.teacher_substitutions.push(subst)
      this.student_substitutions.push(subst)
    })

    // #region sort substitutions for teachers

    // sort by substitution begin
    this.teacher_substitutions.sort((a, b) => a.begin - b.begin)

    // sort by first teacher in teacher info
    // this means the substituting teacher is relevant for sorting, not the substituted
    // if there's only one teacher, we don't have a problem in the first place
    this.teacher_substitutions.sort((a, b) => a.teachers[0].toUpperCase() > b.teachers[0].toUpperCase())

    // #endregion

    // #region sort substitutions for students

    // sort by subject
    this.student_substitutions.sort((a, b) => a.course.toUpperCase() > b.course.toUpperCase())

    // sort by substitution begin
    this.student_substitutions.sort((a, b) => a.begin - b.begin)

    // sort by first affected class
    this.student_substitutions.sort((a, b) => a.classes[0].toUpperCase() > b.classes[0].toUpperCase())
    this.student_substitutions.sort((a, b) => parseInt(a.group.replace(/\D/g, '')) - parseInt(b.group.replace(/\D/g, '')))

    // #endregion
  }

  get substitutions () {
    if (window.settings.isTeacher) {
      return this.teacher_substitutions
    } else {
      return this.student_substitutions
    }
  }
}

/**
* A list of placeholders that should not be interpreted as teachers or classes
*/
const PLACEHOLDERS = [
  '?',
  '---',
  '-',
  '...',
  '.',
  ''
]

const REFRESH_CACHE_MILL = 2 * 60 * 1000

window.dataCache = {}

class CacheEntry {
  constructor (data) {
    this.timestamp = new Date().getTime()
    this.day = new window.Day(data)
  }
}

/**
* Returns data from cache if data new enough, otherwise fetches new data and returns
* @param {int} dateOffset
* @returns day object of specified date offset
*/
window.getCachedDay = async function (dateOffset = window.settings.currentDateOffset) {
  if (!window.dataCache[dateOffset] || window.dataCache[dateOffset].timestamp < new Date().getTime() - REFRESH_CACHE_MILL) {
    await window.getData(dateOffset).then(data => {
      window.dataCache[dateOffset] = new CacheEntry(data)
      console.debug('dataCache[' + dateOffset.toString() + '] = ', window.dataCache[dateOffset])
    }).catch(error => window.errorMessage(error))
  }

  return window.dataCache[dateOffset].day
}

/**
* get API data through proxy, parse json, return parsed object
*/
window.getData = async function (dateOffset = window.settings.currentDateOffset) {
  const data = await fetch('php/getData.php?dateOffset=' + dateOffset).then(response => response.json())
  console.debug('got data: ', data)
  return data
}
