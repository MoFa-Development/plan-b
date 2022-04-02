
window.apply_settings = function() {


    //
    // Ansicht
    //
    Settings.add_category("view", "Ansicht")

    // Lehreransicht
    Settings.add_setting("view", "is_teacher", "settings-toggle", "Lehreransicht", (saved) => {
        if(saved !== undefined)
            return saved
        else
            return false
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

    // Autoscroll
    Settings.add_setting("view", "autoscroll", "settings-toggle", "Autoscroll", (saved) => {
        if(saved !== undefined)
            return saved
        else
            return false
    }, (val) => {
        if (val) {
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

        Settings.save()
    })

    //
    // Darstellung
    //
    Settings.add_category("appearance", "Darstellung")

    // Dark Mode
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

    // Akzentfarbeconst
    Settings.add_setting("appearance", "accent-color", "settings-colors", "Akzentfarbe", (saved) => {
        if (saved === undefined) {
            return  COLORS[0]
        }
        return saved
    }, (val) => {
        const accentColor = val
        const accentDark = window.shadeColor(val, -20)
    
        document.querySelector('body').style.setProperty('--accent', accentColor)
        document.querySelector('body').style.setProperty('--accent-dark', accentDark)

        Settings.save()
    })

    //
    // About
    //
    Settings.add_category("about", "About")

    // GitHub Repo
    Settings.add_setting("about", "link", "link-github", "GitHub Repo", (saved) => {}, (val) => {})
}

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

const TIME_SHOW_NEXT_DAY = 16 // :00 o' clock in 24-hour format

/**
 * @name Settings
 * @description Object for the handling of all settings
 * @method load Loads categories and settings from cookies
 * @method save Saves all category and setting data as a json object in a cookie
 * @method get Returns the setting object with the given setting_key
 * @method set Sets the value of the setting with the given setting_key
 * @method add_setting
 * @method add_category
 * @method show
 * @method hide
 */
window.Settings = {
    saved: {},
    categories: {},
    init: function() {
        Settings.load()
        window.apply_settings()
    },
    load: function() {
        Settings.saved = JSON.parse(window.getCookie("settings"))


        // GET parameters overwrite all settings with the given key
        var urlParams = new URLSearchParams(window.location.search)
        for (var pair of urlParams.entries()) {
            Settings.set_saved_val(pair[0], pair[1])
        }
    },
    save: function() {

        for(var category of Object.keys(Settings.categories)) {
            
            if(Settings.saved[category] === undefined)
                continue
            
            var settings = Settings.saved[category].settings
            for(var child of Settings.categories[category].childNodes) {
                if(child instanceof Setting) {
                    settings[child.key] = {
                        default: child.default_val,
                        on_change: child.on_change,
                        saved_val: child.data.value
                    }
                }
            }

            Settings.saved[category] = {
                settings: settings
            }
        }
        window.setCookie("settings", JSON.stringify(Settings.saved), 9999)
    },
    get: function(setting_key) {
        var setting
        for(var category of Object.keys(Settings.saved)) {
            setting = Settings.saved[category].settings[setting_key] ?? setting
        }
        return setting
    },
    set: function(setting_key, value) {
        for(var category of Object.keys(Settings.saved)) {
            if(Settings.saved[category].settings[setting_key])
                Settings.saved[category].settings[setting_key].data.value = value
        }
    },
    get_saved_val: function(setting_key) {
        var setting_val
        for(var category of Object.keys(Settings.saved)) {
            setting_val = Settings.saved[category].settings[setting_key] ? Settings.saved[category].settings[setting_key].saved_val : setting_val
        }
        return setting_val
    },
    set_saved_val: function(setting_key, value) {
        for(var category of Settings.saved) {
            if(category.settings[setting_key])
                category.settings[setting_key].saved_val = value
        }
    },
    add_category: function(category_key, label) {
        let category = document.createElement('settings-category')
        $('#settings-overlay')[0].appendChild(category)
        Settings.categories[category_key] = category


        const loadingElement = $('#settings-loading')[0]
        loadingElement.style.display = ''

        // Custom Elements don't get upgraded; Workaround: tryTimed() tries every 500 miliseconds
        customElements.upgrade(category)
        window.customElements.whenDefined('settings-category').then( async() => {

            await window.tryTimed(() => {category.initialize(category_key, label)})

            loadingElement.style.display = 'none'
        })
    },
    add_setting: function(category_key, key, component, label, default_val, on_change) {
        if(Settings.categories[category_key]) {
            let setting = document.createElement(component)
            
            const loadingElement = $('#settings-loading')[0]
            loadingElement.style.display = ''


            // Custom Elements don't get upgraded; Workaround: tryTimed() tries every 500 miliseconds
            customElements.upgrade(setting)
            customElements.whenDefined(component).then(async () => {

                await window.tryTimed(() => {
                    setting.initialize(key, label, default_val, on_change, Settings.get_saved_val(key))
                })
                await window.tryTimed(() => {
                    window.Settings.categories[category_key].add_setting(setting)
                })

                loadingElement.style.display = 'none'
            })
        }
        else {
            throw Error("Settings category not found: " + category_key)
        }
    },
    show() {
        $('#settings-overlay-container')[0].style.visibility = 'visible'
        $('#settings-overlay-container')[0].style.opacity = 1
    },
    hide: function() {
        $('#settings-overlay-container')[0].style.visibility = 'hidden'
        $('#settings-overlay-container')[0].style.opacity = 0
    }
}

/**
 * @name Setting
 * @description Class representing one setting option
 * @param {string} key 
 * @param {string} label
 * @param {any} default_val
 * @param {string} on_change
 * @param {string} saved_val
 * @param {boolean} displayed
 */
window.Setting = class Setting extends HTMLElement {
    initialize(key, label, default_val, on_change, saved_val = undefined, displayed = true) {
        this.key = key
        var val = default_val.call(this, saved_val)
        this.addData("value", val === undefined ? saved_val : val)
        this.addData("label", label)
        this.displayed = displayed
        this.on_change = on_change

        // Adjust components to current value
        this["setupComponent"]()

        // Run on_change function to directly apply changes
        this["on_change"](this.data.value)
    }
    set displayed(val) {
        this.style.display = val ? '' : 'none';
    }
}

/**
 * @name SettingsCategory
 * @description Class representing a settings category
 * @param {string} key
 * @param {string} label
 * @param {boolean} displayed
 */
 window.SettingsCategory = class SettingsCategory extends HTMLElement {
    initialize(key, label, displayed = true) {
        this.key = key
        this.addData("label", label)
        this.displayed = displayed
    }
    add_setting(setting) {
        this.appendChild(setting)
    }
    set displayed(val) {
        this.style.display = val ? '' : 'none';
    }
}










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
  window.initSettings = function () {
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
  
    // apply autoscroll setting
    window.setAutoscroll(window.Settings.get("autoscroll"))
  
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