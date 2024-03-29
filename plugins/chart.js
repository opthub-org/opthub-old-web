import Vue from 'vue'
import { Line } from 'vue-chartjs/legacy'
import zoomPlugin from 'chartjs-plugin-zoom'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LinearScale,
  // LogarithmicScale, // chart.js@3.9.1 does not support beginAtZero
  LineElement,
  PointElement,
} from 'chart.js'

// My LogarithmicScale that supports beginAtZero
// See https://github.com/chartjs/Chart.js/pull/10711/files
import { Scale, Ticks } from 'chart.js'

import {
  callback as call,
  finiteOrDefault,
  formatNumber,
  isFinite,
  isNullOrUndef,
  log10,
  _setMinAndMaxByKey,
} from 'chart.js/helpers'

const log10Floor = (v) => Math.floor(log10(v))
const changeExponent = (v, m) => Math.pow(10, log10Floor(v) + m)

function isMajor(tickVal) {
  const remain = tickVal / Math.pow(10, log10Floor(tickVal))
  return remain === 1
}

function steps(min, max, rangeExp) {
  const rangeStep = Math.pow(10, rangeExp)
  const start = Math.floor(min / rangeStep)
  const end = Math.ceil(max / rangeStep)
  return end - start
}

function startExp(min, max) {
  const range = max - min
  let rangeExp = log10Floor(range)
  while (steps(min, max, rangeExp) > 10) {
    rangeExp++
  }
  while (steps(min, max, rangeExp) < 10) {
    rangeExp--
  }
  return Math.min(rangeExp, log10Floor(min))
}

/**
 * Generate a set of logarithmic ticks
 * @param generationOptions the options used to generate the ticks
 * @param dataRange the range of the data
 * @returns {object[]} array of tick objects
 */
function generateTicks(generationOptions, dataRange) {
  let { min, max } = dataRange
  if (dataRange._zero === true) {
    min = Math.pow(10, Math.floor(log10(dataRange._minNotZero)) - 1)
  } else {
    min = finiteOrDefault(generationOptions.min, min)
  }
  const ticks = []
  const minExp = log10Floor(min)
  let exp = startExp(min, max)
  let precision = exp < 0 ? Math.pow(10, Math.abs(exp)) : 1
  const stepSize = Math.pow(10, exp)
  const base = minExp > exp ? Math.pow(10, minExp) : 0
  const start = Math.round((min - base) * precision) / precision
  const offset = Math.floor((min - base) / stepSize / 10) * stepSize * 10
  let significand = Math.floor((start - offset) / Math.pow(10, exp))
  let value = finiteOrDefault(
    generationOptions.min,
    Math.round((base + offset + significand * Math.pow(10, exp)) * precision) /
      precision
  )
  while (value < max) {
    ticks.push({ value, major: isMajor(value), significand })
    if (significand >= 10) {
      significand = significand < 15 ? 15 : 20
    } else {
      significand++
    }
    if (significand >= 20) {
      exp++
      significand = 2
      precision = exp >= 0 ? 1 : precision
    }
    value =
      Math.round(
        (base + offset + significand * Math.pow(10, exp)) * precision
      ) / precision
  }
  const lastTick = finiteOrDefault(generationOptions.max, value)
  ticks.push({ value: lastTick, major: isMajor(lastTick), significand })

  return ticks
}

function parse(raw, _index) {
  if (isNullOrUndef(raw)) {
    return null
  }
  if ((typeof raw === 'number' || raw instanceof Number) && !isFinite(+raw)) {
    return null
  }

  return +raw
}

class LogarithmicScale extends Scale {
  static id = 'logarithmic'
  /**
   * @type {any}
   */
  static defaults = {
    ticks: {
      callback: Ticks.formatters.logarithmic,
      major: {
        enabled: true,
      },
    },
  }

  constructor(cfg) {
    super(cfg)

    /** @type {number} */
    this.start = undefined
    /** @type {number} */
    this.end = undefined
    /** @type {number} */
    this._startValue = undefined
    this._valueRange = 0
  }

  parse(raw, index) {
    // const value = LinearScaleBase.prototype.parse.apply(this, [raw, index])
    const value = parse(raw, index)
    return isFinite(value) && value >= 0 ? value : null
  }

  getMinMax(canStack) {
    let { min, max, minDefined, maxDefined } = this.getUserBounds()
    let range
    this._zero = false
    if (minDefined && maxDefined) {
      return { min, max }
    }
    const metas = this.getMatchingVisibleMetas()
    for (let i = 0, ilen = metas.length; i < ilen; ++i) {
      range = metas[i].controller.getMinMax(this, canStack)
      if (!minDefined) {
        min = Math.min(min, range.min)
      }
      if (!maxDefined) {
        max = Math.max(max, range.max)
      }
      if (metas[i].hidden !== true && (min === 0 || this.options.beginAtZero)) {
        this._zero = true
        this._minNotZero = max
        for (let j = 0, jlen = metas[i]._dataset.data.length; j < jlen; ++j) {
          if (metas[i]._dataset.data[j] > 0) {
            this._minNotZero = Math.min(
              this._minNotZero,
              metas[i]._dataset.data[j]
            )
          }
        }
      }
    }

    // Make sure min <= max when only min or max is defined by user and the data is outside that range
    min = maxDefined && min > max ? max : min
    max = minDefined && min > max ? min : max

    return {
      min: finiteOrDefault(min, finiteOrDefault(max, min)),
      max: finiteOrDefault(max, finiteOrDefault(min, max)),
    }
  }

  determineDataLimits() {
    const { min, max } = this.getMinMax(true)

    this.min = isFinite(min) ? Math.max(0, min) : null
    this.max = isFinite(max) ? Math.max(0, max) : null

    // if data has `0` in it or `beginAtZero` is true, min (non zero) value is at bottom
    // of scale, and it does not equal suggestedMin, lower the min bound by one exp.
    if (
      this._zero &&
      this.min !== this._suggestedMin &&
      !isFinite(this._userMin)
    ) {
      this.min =
        min === changeExponent(this.min, 0)
          ? changeExponent(this.min, -1)
          : changeExponent(this.min, 0)
    }

    this.handleTickRangeOptions()
  }

  handleTickRangeOptions() {
    const { minDefined, maxDefined } = this.getUserBounds()
    let min = this.min
    let max = this.max

    const setMin = (v) => (min = minDefined ? min : v)
    const setMax = (v) => (max = maxDefined ? max : v)

    if (min === max) {
      if (min <= 0) {
        // includes null
        setMin(1)
        setMax(10)
      } else {
        setMin(changeExponent(min, -1))
        setMax(changeExponent(max, +1))
      }
    }
    if (min <= 0) {
      setMin(changeExponent(max, -1))
    }
    if (max <= 0) {
      setMax(changeExponent(min, +1))
    }

    this.min = min
    this.max = max
  }

  buildTicks() {
    const opts = this.options

    const generationOptions = {
      min: this._userMin,
      max: this._userMax,
    }
    const ticks = generateTicks(generationOptions, this)

    // At this point, we need to update our max and min given the tick values,
    // since we probably have expanded the range of the scale
    if (opts.bounds === 'ticks') {
      _setMinAndMaxByKey(ticks, this, 'value')
    }

    if (opts.reverse) {
      ticks.reverse()

      this.start = this.max
      this.end = this.min
    } else {
      this.start = this.min
      this.end = this.max
    }

    return ticks
  }

  generateTickLabels(ticks) {
    const tickOpts = this.options.ticks
    let i, ilen, tick
    for (i = 0, ilen = ticks.length; i < ilen; i++) {
      tick = ticks[i]
      if (i === 0 && this._zero === true) {
        tick.label = call(tickOpts.callback, [0, i, ticks], this)
      } else {
        tick.label = call(tickOpts.callback, [tick.value, i, ticks], this)
      }
    }
  }

  /**
   * @param {number} value
   * @return {string}
   */
  getLabelForValue(value) {
    return value === undefined
      ? '0'
      : formatNumber(
          value,
          this.chart.options.locale,
          this.options.ticks.format
        )
  }

  /**
   * @protected
   */
  configure() {
    const start = this.min

    super.configure()

    this._startValue = log10(start)
    this._valueRange = log10(this.max) - log10(start)
  }

  getPixelForValue(value) {
    if (value === undefined || value === 0) {
      value = this.min
    }
    if (value === null || isNaN(value)) {
      return NaN
    }
    return this.getPixelForDecimal(
      value === this.min
        ? 0
        : (log10(value) - this._startValue) / this._valueRange
    )
  }

  getValueForPixel(pixel) {
    const decimal = this.getDecimalForPixel(pixel)
    return Math.pow(10, this._startValue + decimal * this._valueRange)
  }
}
// End of my LogarithmicScale

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LinearScale,
  LogarithmicScale,
  LineElement,
  PointElement,
  zoomPlugin
)

Vue.component('LineChart', {
  extends: Line,
})
