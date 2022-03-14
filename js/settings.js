/**
* globally reachable settings object
*/
window.settings = {
  filter: '',
  currentDateOffset: 0,
  is_teacher: false,
  darkmode: false,
  autoscroll: false
}

const COLORS = ['#E53935', '#D81B60', '#8E24AA', '#5E35B1', '#3949AB', '#1E88E5', '#039BE5', '#00ACC1', '#00897B', '#43A047']

const TIME_SHOW_NEXT_DAY = 16 // :00 o' clock in 24-hour format

window.settings.autoscroll = false

/**
* show settings menu
*/
window.showSettings = function () {
  $('#settings-overlay-container')[0].style.visibility = 'visible'
  $('#settings-overlay-container')[0].style.opacity = 1
}

/**
* hide settings menu
*/
window.hideSettings = function () {
  $('#settings-overlay-container')[0].style.visibility = 'hidden'
  $('#settings-overlay-container')[0].style.opacity = 0
}

/**
* applies url parameters to cookies
*/
window.applyUrlParameters = function () {
  var urlParams = new URLSearchParams(window.location.search)

  for (var pair of urlParams.entries()) {
    window.setCookie(pair[0].toLowerCase(), pair[1].toLowerCase().split('')[0], 9999)
  }
}

/**
* load and apply settings stored in cookies,
* get darkmode preference from browser if no darkmode cookie available
*/
window.loadSettings = function loadSettings () {
  window.applyUrlParameters()

  if (window.getCookie('filter')) {
    window.settings.filter = window.getCookie('filter')
  } else {
    window.settings.filter = ""
  }

  if (window.getCookie('darkmode')) {
    window.settings.darkmode = window.getCookie('darkmode') === 'true' // get darkmode preference from cookie
  } else {
    window.settings.darkmode = window.matchMedia('screen and (prefers-color-scheme: dark)').matches // get darkmode preference from browser
  }

  // apply darkmode setting
  window.setDarkmode(window.settings.darkmode)

  // get autoscroll preference from cookie
  if (window.getCookie('autoscroll')) {
    window.settings.autoscroll = window.getCookie('autoscroll') === 'true'
  } else {
    window.settings.autoscroll = false
  }

  // apply autoscroll setting
  window.setAutoscroll(window.settings.autoscroll)

  // add accent color selects to settings menu
  let c
  const colorsElem = $('#colors')[0]

  for (c of COLORS) {
    const colorSelector = document.createElement('div')
    colorSelector.style.background = c
    colorSelector.id = 'color' + c
    colorSelector.classList.add('colorSelector')
    colorSelector.setAttribute('onclick', 'colorClick(this)')
    colorsElem.appendChild(colorSelector)
  }

  // get accent color from cookie, generate dynamic dark accent color, pass colors to CSS
  if (window.getCookie('accentColor')) {
    const accentColor = window.getCookie('accentColor')
    const accentDark = window.shadeColor(accentColor, -20)

    document.querySelector('body').style.setProperty('--accent', accentColor)
    document.querySelector('body').style.setProperty('--accent-dark', accentDark)

    if (COLORS.includes(accentColor.toUpperCase())) {
      document.getElementById('color' + accentColor.toUpperCase()).classList.add('selected')
    }
  }

  // get teacher mode preference from cookie
  if (window.getCookie('isTeacher')) {
    window.settings.isTeacher = window.getCookie('isTeacher') === 'true'
  }

  // apply is teacher setting
  window.setIsTeacher(window.settings.isTeacher)
}

window.setIsTeacher = function (isTeacher) {
  window.settings.isTeacher = isTeacher

  $('#teacher-switch')[0].checked = window.settings.isTeacher
  window.setCookie('isTeacher', window.settings.isTeacher, 9999)

  if (window.settings.isTeacher) {
    window.settings.selectedClass = ''
  } else {
    window.settings.selectedTeacher = ''
  }

  if (window.settings.isTeacher) {
    $('.substitutions')[0].classList.add('teacher')
  } else {
    $('.substitutions')[0].classList.remove('teacher')
  }

  window.draw()
}

/**
* sets darkmode setting and applies it.
* @param {boolean} darkmode value to apply to darkmode setting
*/
window.setDarkmode = function (darkmode) {
  window.settings.darkmode = darkmode

  $('#darkmode-switch')[0].checked = window.settings.darkmode
  window.setCookie('darkmode', window.settings.darkmode, 9999)

  if (window.settings.darkmode) {
    document.body.classList.add('dark')
  } else {
    document.body.classList.remove('dark')
  }
}

/**
* sets autoscroll setting and applies it.
* @param {boolean} autoscroll value to apply to autoscroll setting
*/
window.setAutoscroll = function (autoscroll) {
  window.settings.autoscroll = autoscroll

  $('#autoscroll-switch')[0].checked = window.settings.autoscroll
  window.setCookie('autoscroll', window.settings.autoscroll, 9999)

  if (window.settings.autoscroll) {
    document.body.classList.add('monitor-mode')

    for (const elem of $('.substitutions')) {
      elem.classList.add('autoscroll')
    }

    window.initAutoscroll()
  } else {
    document.body.classList.remove('monitor-mode')

    for (const elem of $('.substitutions')) {
      elem.classList.remove('autoscroll')
    }
  }

  window.initAutoscroll()
  window.RESET_AUTOSCROLL = true
}

/**
* handle onclick on accent color select element
* @param {HTMLElement} obj clicked checkbox element
*/
window.colorClick = function (obj) {
  Array.from(document.getElementsByClassName('colorSelector')).forEach((el) => {
    el.classList.remove('selected')
  })
  obj.classList.add('selected')

  const accentColor = window.rgb2hex(obj.style.backgroundColor)
  const accentDark = window.shadeColor(accentColor, -20)

  document.body.style.setProperty('--accent', accentColor)
  document.body.style.setProperty('--accent-dark', accentDark)

  window.setCookie('accentColor', accentColor, 9999)
}

/**
* set or unset selected teacher / class
*
* @param {HTMLElement} elem selectedElement HTMLElement
* @param {*} data API data of the current day
*/
window.setSelectedElement = function (elem) {
  window.settings.filter = elem
  window.setCookie('filter', elem)
}