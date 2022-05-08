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

    // Akzentfarbe
    Settings.add_setting("appearance", "accent-color", "settings-colors", "Akzentfarbe", (saved) => {
        if (saved === undefined) {
            return 0
        }
        return saved
    }, (val) => {
        // Update logic within component
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

        // GET parameters overwrite all settings with the given key
        var urlParams = new URLSearchParams(window.location.search)
        for (var pair of urlParams.entries()) {
            Settings.set(pair[0], pair[1])
        }
    },
    load: function() {
        try {
            Settings.saved = JSON.parse(window.getCookie("settings"))
        }
        catch(e) {
            Settings.saved = {}
        }
    },
    save: function() {

        for(var category of Object.keys(Settings.categories)) {

            for(var child of Settings.categories[category].childNodes) {
                if(child instanceof Setting) {
                    if(child.key === undefined) // If setting is not initialized yet, don't save it
                        continue
                    if(Settings.saved[category] === undefined)
                        Settings.saved[category] = {settings:{}}
                    Settings.saved[category].settings[child.key] = {
                            //default: child.default_val,
                            //on_change: child.on_change,
                            saved_val: child.data.value
                    }
                }
            }

        }
        window.setCookie("settings", JSON.stringify(Settings.saved), 9999)
    },
    get: function(setting_key) {
        var setting
        try {
            setting = Settings.get_setting(setting_key).saved_val
        } catch(e) {
            for(var category of Object.keys(Settings.saved)) {
                for(var child of Object.keys(Settings.saved[category].settings)) {
                    if(child === setting_key) {
                        setting = Settings.saved[category].settings[child].saved_val ?? setting
                    }
                }
            }
        }
        return setting
    },
    get_setting: function(setting_key) {
        var setting
        for(var category of Object.keys(Settings.categories)) {
            for(var child of Settings.categories[category].childNodes) {
                if(child instanceof Setting) {
                    if(child.key === setting_key) {
                        setting = child ?? setting
                    }
                }
            }
        }
        return setting
    },
    set: function(setting_key, value) {
        // Try as soon as setting is intialized
        tryTimed(() => {
            Settings.get_setting(setting_key).data.value = value
            Settings.get_setting(setting_key)["on_change"](value)
        });
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
                    setting.initialize(key, label, default_val, on_change, Settings.get(key))
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





// TODO: Implement hidden class/teacher filter setting


/////////////////
// Legacy code //
/////////////////

/**
* globally reachable settings object
*/
window.settings = {
    filter: '',
    currentDateOffset: 0,
}
  
const TIME_SHOW_NEXT_DAY = 16 // :00 o' clock in 24-hour format