/*jshint esversion: 6 */

"use strict";

import './utils.js';
import './settings.js';
import './data.js';
import './drawing.js';
import './events.js';
import './gimmicks.js';
import './components.js';

window.initEvents();
window.Settings.init();
window.initGimmicks();
window.initAutoscroll();

// data refreshing
setInterval(window.draw, 1000 * 60 * refreshIntervalMinutes);
// autoscroll
setInterval(window.handleAutoscroll, autoscrollInterval);
// checking for inactivity
setInterval(window.handleInactivity, 1000);
