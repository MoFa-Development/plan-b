import './utils.js';
import './data.js';
import './settings.js';
import './drawing.js';
import './gimmicks.js';
import './events.js';

'use strict';

window.currentDateOffset = 0;
window.selectedClass = "";
window.selectedTeacher = "";
window.is_teacher = false;
window.darkmode = false;
window.autoscroll = false;

initEvents();