window.RESET_AUTOSCROLL = false

const autoscrollFPS = 30
const autoscrollScrollPerFrame = 1
const autoscrollInterval = 1000 / autoscrollFPS

const refreshIntervalMinutes = 5

let lastInteractionTimestamp = 0
const TIMEOUT_INACTIVE = 5000

window.handleInteraction = function () {
  lastInteractionTimestamp = Date.now()
  document.body.classList.remove('inactive')
}

/**
* Hide settings
*/
window.handleInactivity = function () {
  if (window.settings.autoscroll && Date.now() - lastInteractionTimestamp > TIMEOUT_INACTIVE) {
    if (!document.body.classList.contains('inactive')) {
      document.body.classList.add('inactive')
    }
  } else {
    document.body.classList.remove('inactive')
  }
}

window.generalInit = function () {
  window.initSettings()
  window.initGimmicks()
  window.initAutoscroll()

  // hiding the settings button
  setInterval(window.handleInactivity, 1000)
  // autoscroll
  setInterval(window.handleAutoscroll, autoscrollInterval)
  // data refreshing
  setInterval(window.draw, 1000 * 60 * refreshIntervalMinutes)
}

window.clearAutoscroll = function () {
  for (const clone of $('.autoscroll-visual')) {
    clone.remove()
  }
}

/**
* initialize autoscroll (must be called at every redraw)
*/
window.initAutoscroll = function () {
  window.clearAutoscroll()

  if (window.settings.autoscroll) {
    document.body.style.height = '100vh'

    const autoscrollElements = $('.autoscroll')

    for (const elem of autoscrollElements) {
      if (elem.clientHeight < elem.scrollHeight) {
        const spacer = document.createElement('spacer')

        spacer.classList.add('autoscroll-visual')
        elem.appendChild(spacer)

        elem.originalScrollHeight = elem.scrollHeight
        elem.originalScrollTopMax = elem.scrollTopMax

        for (const child of elem.children) {
          const clone = child.cloneNode(true)
          clone.classList.add('autoscroll-visual')
          elem.appendChild(clone)

          if (elem.scrollHeight > elem.originalScrollHeight + elem.clientHeight) {
            break
          }
        }
      }
    }
  } else {
    document.body.style.height = '100%'
  }
}

/**
* handle next autoscroll animation frame
*/
window.handleAutoscroll = function () {
  if (window.RESET_AUTOSCROLL) {
    window.initAutoscroll()

    for (const elem of $('.autoscroll')) {
      elem.scroll({
        top: 0
      })
    }

    window.RESET_AUTOSCROLL = false
  }

  if (window.settings.autoscroll) {
    const autoscrollElements = $('.autoscroll')

    for (const elem of autoscrollElements) {
      if (elem.clientHeight < elem.scrollHeight) { // is the autoscroll element overflowing
        if (elem.scrollTop >= elem.scrollTopMax) { // rescue if scrolled to bottom somehow
          window.initAutoscroll()
          elem.scroll({
            top: 0
          })
        }

        if (elem.scrollTop < elem.originalScrollHeight) { // must be further scrolled
          elem.scrollBy({
            top: autoscrollScrollPerFrame
          })
        } else { // scrolled to the reset point
          elem.scroll({
            top: 0
          })
        }
      }
    }
  }
}

/**
* handle onclick on next day button
*/
window.nextDay = function () {
  window.settings.currentDateOffset++
  window.draw()
  window.reset_animation('title-day')
  $('#title-day')[0].style.animation = 'slide-left 0.5s cubic-bezier(0.075, 0.82, 0.165, 1)'
}

/**
* handle onclick on previous day button
*/
window.prevDay = function () {
  window.settings.currentDateOffset--
  window.draw()
  window.reset_animation('title-day')
  $('#title-day')[0].style.animation = 'slide-right 0.5s cubic-bezier(0.075, 0.82, 0.165, 1)'
}

/**
* list of events with corresponding handler functions
*/
const EVENTS = [
  ['keyup', (e) => {
    if (e.code === 'Escape') {
      window.hideSettings()
    }
  }],
  ['mousemove', window.handleInteraction],
  ['touchstart', window.handleInteraction],
  ['touchmove', window.handleInteraction],
  ['resize', (e) => {
    window.handleAffectedElementsOverflow()
    window.initAutoscroll()
  }],
  ['deviceorientation', (e) => {
    window.handleAffectedElementsOverflow()
    window.initAutoscroll()
  }]
]

/**
* load and add events with corresponding handler functions
*/
window.initEvents = function () {
  let addEvent

  if (window.addEventListener) {
    addEvent = window.addEventListener
  } else {
    addEvent = window.attachEvent
  }

  let eventName
  let func

  for ([eventName, func] of EVENTS) {
    addEvent(eventName, func)
  }
}
