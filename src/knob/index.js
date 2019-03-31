const Gpio = require('pigpio').Gpio

const pinHPF = new Gpio(26, {
  mode: Gpio.INPUT,
  pullUpDown: Gpio.PUD_DOWN,
  alert: true
})

const pinLPF = new Gpio(13, {
  mode: Gpio.INPUT,
  pullUpDown: Gpio.PUD_UP,
  alert: true
})

pinHPF.glitchFilter(200)
pinLPF.glitchFilter(200)

const clamp_low = 0
const clamp_high = 511

let highUp = false
let lowUp = false

let lpfOffTime = 0
let lpfOnTime = 0

let hpfOffTime = 0
let hpfOnTime = 0

let hpfStartTick
let lpfStartTick

let hpfTicks = 0
let lpfTicks = 0
let direction = 0

let gaugeValue = 0
let lastGaugeValue = -1

function updateGauge (delta, tick) {
  gaugeValue += delta

  gaugeValue = Math.max(clamp_low, Math.min(clamp_high, gaugeValue))
}

pinHPF.on('alert', (level, tick) => {
  highUp = level === 1

  const endTick = tick
  const diff = (endTick >> 0) - (hpfStartTick >> 0)
  hpfStartTick = tick

  if (diff > 15000) {
    direction = 0
    hpfTicks = 0
    lpfTicks = 0
  }

  if (highUp) {
    hpfOffTime = diff
  } else {
    hpfOnTime = diff

    if (
      2.5 * hpfOffTime < hpfOnTime &&
      hpfOnTime < 5.0 * hpfOffTime &&
      hpfOffTime < 2500
    ) {
      // console.log(hpfOnTime / hpfOffTime)

      hpfTicks++
      if (hpfTicks >= 3) {
        lpfTicks = 0
        if (direction != 1) {
          direction = 1

          updateGauge(hpfTicks - 1, tick)
          // console.log('CW CW')
          hpfTicks = 0
        }
      }

      if (direction == 1) {
        updateGauge(1, tick)
        // console.log('CW tick ' + hpfOnTime + ' ' + hpfOffTime)
      }
    } else {
      hpfTicks = 0
      if (direction == 1) direction = 0
    }
  }
})

pinLPF.on('alert', (level, tick) => {
  lowUp = level === 1

  const endTick = tick
  const diff = (endTick >> 0) - (lpfStartTick >> 0)
  lpfStartTick = tick

  if (diff > 15000) {
    direction = 0
    hpfTicks = 0
    lpfTicks = 0
  }

  if (lowUp) {
    lpfOffTime = diff
  } else {
    lpfOnTime = diff

    if (
      2.25 * lpfOnTime < lpfOffTime &&
      lpfOffTime < 4 * lpfOnTime &&
      lpfOnTime < 2500
    ) {
      // console.log(lpfOffTime / lpfOnTime)

      lpfTicks++
      if (lpfTicks >= 3) {
        hpfTicks = 0
        if (direction != -1) {
          direction = -1

          updateGauge(1 - lpfTicks, tick)
          // console.log('CCW CCW')
          lpfTicks = 0
        } else if (lpfTicks % 50 == 0) {
          // Compensate CCW lag
          updateGauge(-1, tick)
        }
      }

      if (direction == -1) {
        updateGauge(-1, tick)
        // console.log('CCW tick ' + lpfOnTime + ' ' + lpfOffTime)
      }
    } else {
      lpfTicks = 0
      if (direction == -1) direction = 0
    }
  }
})

const spawn = require('child_process').spawn
py = spawn('python', ['../lcd/gauge.py'])

setInterval(() => {
  if (gaugeValue != lastGaugeValue) {
    // console.log('Value: ' + gaugeValue)
    lastGaugeValue = gaugeValue

    py.stdin.write(gaugeValue + '\n')
  }
}, 25)

updateGauge(Math.floor((clamp_low + clamp_high) / 2), -1)
