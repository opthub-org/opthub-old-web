import Vue from "vue"
import { Line } from "vue-chartjs/legacy"
import zoomPlugin from 'chartjs-plugin-zoom'

import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LinearScale,
  LogarithmicScale,
  LineElement,
  PointElement,
} from "chart.js"

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LinearScale,
  LogarithmicScale,
  LineElement,
  PointElement,
  zoomPlugin,
)

Vue.component("line-chart", {
  extends: Line,
})