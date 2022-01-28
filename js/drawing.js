/**
* Classes where teachers should always be shown for clarity
*/
const FORCE_SHOW_TEACHER_CLASSES = ['11', '12']

/**
* set css classes for overflowing affected elements bar
* - showing shadows on the overflowed side(s) of the affected elements bar
*/
window.handleAffectedElementsOverflow = function () {
  const element = $('.affected-elements')[0]

  const elementWidth = element.clientWidth
  const scroll = element.scrollLeft
  const scrollMax = element.scrollWidth - elementWidth

  if (scrollMax === 0) {
    element.style.justifyContent = 'center'
    element.classList.remove('overflow-both', 'overflow-left', 'overflow-right')
  } else if (scroll <= 0) {
    element.style.justifyContent = 'left'
    element.classList.add('overflow-right')
    element.classList.remove('overflow-both', 'overflow-left')
  } else if (scroll < scrollMax) {
    element.style.justifyContent = 'left'
    element.classList.add('overflow-both')
    element.classList.remove('overflow-right', 'overflow-left')
  } else {
    element.style.justifyContent = 'left'
    element.classList.add('overflow-left')
    element.classList.remove('overflow-right', 'overflow-both')
  }
}

window.Message.prototype.toElem = function () {
  const messageElement = document.createElement('div')
  messageElement.classList.add('message')

  if (this.subject) {
    const subjectElement = document.createElement('div')
    subjectElement.innerHTML = this.subject
    subjectElement.id = 'subject'
    messageElement.appendChild(subjectElement)
  }

  const messageBodyElement = document.createElement('div')
  messageBodyElement.innerHTML = this.body
  messageBodyElement.id = 'message-body'
  messageElement.appendChild(messageBodyElement)

  return messageElement
}

/**
* generate message elements for messages of the day and add them to the messages container
*/
window.Day.prototype.drawMessages = function () {
  const messages = $('.messages')[0]

  while (messages.firstChild) {
    messages.removeChild(messages.firstChild)
  }

  this.messages.forEach(msg => {
    const messageElement = msg.toElem()

    if (messageElement) {
      messages.appendChild(messageElement)
    }
  })
}

/**
* generate affected element selects and add them to the selection bar
*/
window.Day.prototype.drawAffectedElements = function () {
  const affectedElementsBarObj = $('.affected-elements')[0]

  if (this.substitutions.length === 0) {
    affectedElementsBarObj.style.visibility = 'hidden'
  } else {
    affectedElementsBarObj.style.visibility = 'visible'
  }

  while (affectedElementsBarObj.firstChild) {
    affectedElementsBarObj.removeChild(affectedElementsBarObj.firstChild)
  }

  const filterIconObj = document.createElement('img')
  filterIconObj.src = 'icons/filter.svg'
  filterIconObj.classList.add('icon', 'filter-icon')
  affectedElementsBarObj.appendChild(filterIconObj)

  let affectedElements

  // dynamically get affected teachers / classes based on is_teacher
  if (window.settings.isTeacher) {
    affectedElements = this.affectedTeachers
  } else {
    affectedElements = this.affectedClasses
  }

  var day = this

  affectedElements.forEach((affectedElement) => {
    const affectedElementObj = document.createElement('div')
    affectedElementObj.innerText = affectedElement
    affectedElementObj.classList.add('affected-element')

    if (affectedElement === window.settings.selectedTeacher ||
        affectedElement === window.settings.selectedClass) {
      affectedElementObj.classList.add('selected')
    }

    affectedElementObj.onclick = function () {
      window.RESET_AUTOSCROLL = true

      day.setSelectedElement(affectedElement)

      // manage highlighting of selected element

      let element
      for (element of affectedElementsBarObj.children) {
        if (element.innerText === window.settings.selectedClass ||
            element.innerText === window.settings.selectedTeacher) {
          element.classList.add('selected')
        } else {
          element.classList.remove('selected')
        }
      }
    }

    affectedElementsBarObj.appendChild(affectedElementObj)
  })

  affectedElementsBarObj.onscroll = window.handleAffectedElementsOverflow
}

window.Substitution.prototype.toElem = function () {
  // #region EXIT STATEMENTS

  if (this.group !== this.classes[0]) { // do not draw duplicate substitution more than once
    return null
  }

  if (window.settings.selectedClass &&
      !this.classes.includes(window.settings.selectedClass)) { // only draw filtered for class
    return null
  }

  if (window.settings.selectedTeacher &&
      !this.teachers_raw.includes(window.settings.selectedTeacher)) { // only draw filtered for teacher
    return null
  }

  if (window.settings.isTeacher && this.type === 'Entfall') { // if teacher, do not draw cancelled classes
    return null
  }

  if (window.settings.isTeacher && window.settings.selectedTeacher &&
      this.teachers_raw.includes('<span class=\'cancelStyle\'>' + window.settings.selectedTeacher + '</span>')) { // do not inform the teacher who is being substituted
    return null
  }

  // #endregion EXIT STATEMENTS

  const substElement = document.createElement('div')

  const periodsElement = document.createElement('p')
  periodsElement.innerHTML = '<img src=\'icons/book-clock.svg\' class=\'subst-icon\'> <div class=\'subst-data-val\'>' + this.periods + '</div>'
  periodsElement.id = 'periods'
  periodsElement.classList.add('subst-data')
  substElement.appendChild(periodsElement)

  const classesElement = document.createElement('p')
  classesElement.innerHTML = '<img src=\'icons/account-multiple.svg\' class=\'subst-icon\'> <div class=\'subst-data-val\'>' + this.classes.join(', ') + '</div>'
  classesElement.id = 'classes'
  classesElement.classList.add('subst-data')
  substElement.appendChild(classesElement)

  if (this.course) {
    var courseChangeHtml = ''
    var teacherNoteHtml = ''

    const courseElement = document.createElement('p')
    courseElement.innerHTML = '<img src=\'icons/book-open-variant.svg\' class=\'subst-icon\'> <div class=\'subst-data-val\'>' + this.course + courseChangeHtml + teacherNoteHtml + '</div>'
    courseElement.id = 'course'
    courseElement.classList.add('subst-data')
    substElement.appendChild(courseElement)
  }

  // only draw room label if not cancelled
  if (this.room && this.type !== 'Entfall') {
    const roomElement = document.createElement('p')
    roomElement.innerHTML = '<img src=\'icons/map-marker.svg\' class=\'subst-icon\'> <div class=\'subst-data-val\'>' + this.room + '</div>'
    roomElement.id = 'room'
    roomElement.classList.add('subst-data')
    substElement.appendChild(roomElement)
  }

  // only draw teacher label if...
  if (this.teachers_raw && // data is given
      (window.settings.isTeacher || // is teacher
      window.listsIntersect(FORCE_SHOW_TEACHER_CLASSES, this.classes) || // classes from FORCE_SHOW_TEACHER_CLASSES are included
      (this.type !== 'Entfall' && this.type !== 'Raum&aumlnderung')) // substitution is not of type 'cancelled' or 'room change'
  ) {
    var teacherChangeHtml = ''

    const teacherElement = document.createElement('p')
    teacherElement.innerHTML = '<img src=\'icons/teacher.svg\' class=\'subst-icon\'> <div class=\'subst-data-val\'>' + this.teachers_raw + teacherChangeHtml + '</div>'
    teacherElement.id = 'teacher'
    teacherElement.classList.add('subst-data')
    substElement.appendChild(teacherElement)
  }

  // set subst type icon based on type, do not draw subst type label when type is 'Text'
  if (this.type && this.type !== 'Text') {
    const typeElement = document.createElement('p')

    let icon = 'information'

    if (this.type === 'Entfall') {
      icon = 'cancelled'
    } else if (this.type === 'Raum&aumlnderung') {
      icon = 'swap'
    }

    typeElement.innerHTML = '<img src=\'icons/' + icon + '.svg\' class=\'subst-icon\'> <div class=\'subst-data-val\'>' + this.type + '</div>'
    typeElement.id = 'type'
    typeElement.classList.add('subst-data')
    substElement.appendChild(typeElement)
  }

  if (this.message) {
    const messageElement = document.createElement('p')
    messageElement.innerHTML = '<img src=\'icons/information.svg\' class=\'subst-icon\'><div class=\'subst-data-val\'>' + this.message + '</div>'
    messageElement.id = 'message'
    messageElement.classList.add('subst-data')
    substElement.appendChild(messageElement)
  }

  substElement.classList.add('subst-element')
  this.cssClasses.forEach(cssClass => substElement.classList.add(cssClass))

  return substElement
}

/**
* generate substitution elements and add them to the substitutions container
*/
window.Day.prototype.drawSubstitutions = function () {
  const substitutionsElement = $('.substitutions')[0]

  while (substitutionsElement.firstChild) {
    substitutionsElement.removeChild(substitutionsElement.firstChild)
  }

  if (this.substitutions.length === 0) {
    // no substitutions in the first place
    const noSubstMessage = document.createElement('p')
    noSubstMessage.classList.add('no-subst-msg')
    noSubstMessage.innerHTML = '<img src=\'icons/cancelled.svg\' class=\'icon\'>Keine Vertretungen'

    substitutionsElement.appendChild(noSubstMessage)
  } else if (!window.settings.isTeacher && window.settings.selectedClass !== '' &&
             !this.affectedClasses.includes(window.settings.selectedClass)) {
    // selected class is not affected
    const noSubstMessage = document.createElement('p')
    noSubstMessage.classList.add('no-subst-msg')
    noSubstMessage.innerHTML = '<img src=\'icons/cancelled.svg\' class=\'icon\'>Keine Vertretungen für die ' + window.settings.selectedClass

    substitutionsElement.appendChild(noSubstMessage)
  } else if (window.settings.isTeacher && window.settings.selectedTeacher !== '' &&
             !this.affectedTeachers.includes(window.settings.selectedTeacher)) {
    // selected teacher is not affected
    const noSubstMessage = document.createElement('p')
    noSubstMessage.classList.add('no-subst-msg')
    noSubstMessage.innerHTML = '<img src=\'icons/cancelled.svg\' class=\'icon\'>Keine Vertretungen für Sie (' + window.settings.selectedTeacher + ')'

    substitutionsElement.appendChild(noSubstMessage)
  } else {
    let collectionElement
    let lastAffected
    let variation = false

    // draw substitutions
    this.substitutions.forEach(subst => {
      let currentAffected

      if (window.settings.isTeacher) {
        currentAffected = subst.teachers_raw
      } else {
        currentAffected = subst.classes_raw
      }

      if (currentAffected !== lastAffected) {
        collectionElement = document.createElement('div')
        collectionElement.classList.add('subst-collection')
        substitutionsElement.appendChild(collectionElement)

        lastAffected = currentAffected
      }

      const substElement = subst.toElem()

      if (substElement) {
        if (variation) {
          substElement.classList.add('variation')
        }

        collectionElement.appendChild(substElement)

        variation = !variation
      }
    })
  }
}

/**
* draw general surrounding and invoke drawMessages, drawSubstitutions & drawAffectedElements
*/
window.Day.prototype.draw = function () {
  const dateTitleElement = $('#title-day')[0]

  try {
    // hide next day button if last day with data
    const nextDayBtn = $('#btn-next-day')[0]
    const prevDayBtn = $('#btn-prev-day')[0]

    nextDayBtn.onclick = window.nextDay
    prevDayBtn.onclick = window.prevDay

    if (this.nextDate === 0) {
      nextDayBtn.disabled = true
      nextDayBtn.style.visibility = 'hidden'
      nextDayBtn.classList.add('disabled')
    } else {
      nextDayBtn.disabled = false
      nextDayBtn.style.visibility = 'visible'
      nextDayBtn.classList.remove('disabled')
    }

    // draw date
    const day = this.date.toString().slice(6, 8)
    const month = this.date.toString().slice(4, 6)
    const year = this.date.toString().slice(0, 4)

    const dateString = day + '.' + month + '.' + year

    dateTitleElement.innerHTML = this.weekDay + ', ' + dateString

    this.drawMessages()
    this.drawAffectedElements()
    window.handleAffectedElementsOverflow()
    this.drawSubstitutions()
  } catch (error) {
    console.debug(this)

    const affectedElementsBarObj = $('.affected-elements')[0]

    if (this.substitutions.length === 0) {
      affectedElementsBarObj.style.visibility = 'hidden'
    } else {
      affectedElementsBarObj.style.visibility = 'visible'
    }

    dateTitleElement.innerHTML = ''

    window.errorMessage(error)
  }
}

/**
* master draw function, called on load or day change
*/
window.draw = function () {
  const loadingElement = $('#loading')[0]
  loadingElement.style.visibility = 'visible'

  window.getCachedDay(window.settings.currentDateOffset).then((day) => {
    day.draw()
    window.initAutoscroll()
  })

  loadingElement.style.visibility = 'hidden'

  window.getCachedDay(window.settings.currentDateOffset + 1)
  window.getCachedDay(window.settings.currentDateOffset - 1)
}
