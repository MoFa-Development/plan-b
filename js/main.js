'use strict'

import './components.js'
import './utils.js'
import './data.js'
import './settings.js'
import './drawing.js'
import './events.js'
import './gimmicks.js'


window.initEvents()
window.loadSettings()
window.initGimmicks()
window.initAutoscroll()

// data refreshing
setInterval(window.draw, 1000 * 60 * refreshIntervalMinutes)
// autoscroll
setInterval(window.handleAutoscroll, autoscrollInterval)
// checking for inactivity
setInterval(window.handleInactivity, 1000)