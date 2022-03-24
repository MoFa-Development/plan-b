/**
* load and add gimmicks with corresponding handler functions
*/
window.initGimmicks = async function () {
  if (!window.Settings.get("autoscroll")) {
    return
  }

  var gimmicks = await window.getGimmicksData()

  for (let i = 0; i < gimmicks.length; i++) {
    const currentDate = new Date(gimmicks[i].date)

    if (currentDate < Date.now()) {
      if (gimmicks[i - 1]) {
        window.initGimmick(gimmicks[i - 1])
      } else {
        window.initGimmick(gimmicks[i])
      }
    }
  }
}

/**
* get API data through proxy, parse json, return parsed object
*/
window.getGimmicksData = async function () {
  return await fetch('php/getGimmicksData.php').then(response => response.json())
}

/**
* initialize gimmick object
*/
window.initGimmick = function (gimmick) {
  const el = $('#gimmick')
  el.innerHTML = gimmick.content
  el.style = gimmick.styles
}
