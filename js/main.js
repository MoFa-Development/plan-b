import './utils.js';
import './drawing.js';
import './settings.js';
import './data.js';
import './events.js';
import './gimmicks.js';

'use strict';

window.currentDateOffset = 0;
window.selectedClass = "";
window.selectedTeacher = "";
window.is_teacher = false;
window.darkmode = false;
window.autoscroll = false;

initEvents();