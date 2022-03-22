'use strict'

import './utils.js'
import './data.js'
import './settings.js'
import './drawing.js'
import './events.js'
import './gimmicks.js'
import './components.js'


window.generalInit()
window.initEvents()
window.draw()


Settings.init()

Settings.add_category("view", "Ansicht")
Settings.add_setting("view", "is_teacher", "settings-toggle", "Lehreransicht", (saved) => {
    if(saved !== undefined)
        return saved
}, (val) => {
    if (val) {
        window.settings.selectedClass = ''
        $('.substitutions')[0].classList.add('teacher')
    } else {
        window.settings.selectedTeacher = ''
        $('.substitutions')[0].classList.remove('teacher')
    }
    Settings.save()
})

Settings.add_category("appearance", "Darstellung")
Settings.add_setting("appearance", "darkmode", "settings-toggle", "Dark mode", (saved) => {
    if (saved === undefined) {
        return  window.matchMedia('screen and (prefers-color-scheme: dark)').matches // get darkmode preference from browser
    }
    return saved
}, (val) => {
    if (val) {
        document.body.classList.add('dark')
    } else {
        document.body.classList.remove('dark')
    }
    Settings.save()
})
