const $enemy = $("#kite-enemy"),
  $kiteCircle = $("#kite-circle"),
  $hint = $("#hint"),
  $stats = {
    accuracy: $("#stat-accuracy"),
    cps: $("#stat-cps"),
    time: $("#stat-time"),
  }

let settings = {
  enemySize: 75,
  kiteRadius: 350,
  kiteTolerance: 50
}, stats = {
  clicks: 0,
  goodClicks: 0,
  startTime: null,
  playing: false
}

let toClickTarget = true;

function updateUI() {
  // update enemy size
  $enemy.css({ width: settings.enemySize, height: settings.enemySize })
  // update ring size
  let r = settings.kiteRadius - settings.kiteTolerance / 2
  $kiteCircle.css({
    width: r * 2, height: r * 2,
    borderWidth: settings.kiteTolerance
  })
  // update hint
  $hint.text("Click the " + (toClickTarget ? "target" : "ring") + (stats.playing ? "" : " to start"))
  $kiteCircle.toggleClass('highlight', !toClickTarget)
  $enemy.toggleClass('highlight', toClickTarget)
  $(document.body).toggleClass('playing', stats.playing)
}
// Render the settings
updateUI()
updateStats()

// Add event listener for input change
$("#settings input").on('input', function () {
  const val = $(this).val()
  const toChange = $(this).attr('data-change')
  settings[toChange] = val
  updateUI()
})

$(document).on('mousedown', function (e) {
  e.preventDefault()
  let [width, height] = [$(window).width(), $(window).height()]
  let [x, y] = [e.pageX - width / 2, e.pageY - height / 2]

  // Add mouseclick dot.
  let dot = $("<div>")
    .addClass('dot')
    .css({ top: y, left: x })
  $("#dots").append(dot)
  setTimeout(() => dot.remove(), 2000)


  // Track the click
  stats.clicks++;

  // Use Pythagorean theroem to calculate distance from center
  let distFromCenter = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))

  // Check if click was accurate
  if (toClickTarget) {
    if (distFromCenter <= settings.enemySize / 2) {
      stats.goodClicks++;
    }
  } else {
    if (distFromCenter > settings.kiteRadius - settings.kiteTolerance / 2 &&
      distFromCenter < settings.kiteRadius + settings.kiteTolerance / 2) {
      // tis a good click
      stats.goodClicks++;
    }
  }

  if (stats.playing == false) {
    // starting the game now
    stats.startTime = performance.now()
    stats.playing = true
  }

  toClickTarget = !toClickTarget
  updateUI()
  updateStats()
})

$(document).on('contextmenu', function (e) { return false; });


// Disable click event on settings
$("#panel").on('mousedown', function (e) {
  e.stopPropagation();
})


function updateStats() {
  if (!stats.playing) {
    $stats.accuracy.text("0%")
    $stats.cps.text("0.0")
    $stats.time.text("0s")
    return;
  }
  $stats.accuracy.text(`${stats.goodClicks}/${stats.clicks} (` + (stats.goodClicks * 100 / stats.clicks).toFixed(0) + "%)")
  let time = (performance.now() - stats.startTime) / 1000;
  $stats.cps.text((stats.goodClicks / time).toFixed(1))
  $stats.time.text(time.toFixed(1) + "s")
}

$("#reset-stats").on('click', function () {
  toClickTarget = true
  stats.clicks = stats.goodClicks = 0
  stats.startTime = null
  stats.playing = false
  updateStats()
  updateUI()
})

setInterval(updateStats, 50)