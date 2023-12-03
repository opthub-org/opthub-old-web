<template>
  <div v-if="!$apollo.loading">
    <h1>{{ $t('Match') + ': ' + match.competition.id + ' ' + match.name }}</h1>
    <p>{{ $t('Budget') + ': ' + match.budget }}</p>

    <v-btn small @click="showAllGraphs()">
      <v-icon>mdi-account-multiple-plus</v-icon>
    </v-btn>
    <v-btn small @click="hideAllGraphs()">
      <v-icon>mdi-account-multiple-minus</v-icon>
    </v-btn>
    <v-btn small @click="$refs.lineChart.getCurrentChart().resetZoom()">
      <v-icon>mdi-magnify-close</v-icon>
    </v-btn>
    <v-tooltip right>
      <template v-slot:activator="{ on, attrs }">
        <v-btn icon v-on="on">
          <v-icon>mdi-help-circle</v-icon>
        </v-btn>
      </template>
      <p>
        {{ $t('CHART MANIPULATION:') }}<br /><br />
        {{ '&nbsp; * ' + $t('Drag: Zoom into draged area.') }}<br />
        {{ '&nbsp; * ' + $t('Pinch/Wheel over X-scale: Zoom-in/out along X-axis.') }}<br />
        {{ '&nbsp; * ' + $t('Pinch/Wheel over Y-scale: Zoom-in/out along Y-axis.') }}<br />
        {{ '&nbsp; * ' + $t('Ctrl + Drag: Pan viewport area.') }}
      </p>
    </v-tooltip>
    <line-chart :chart-data="chartdata" :chart-options="options" :styles="chartstyles" ref="lineChart" />
    <v-card>
      <v-data-table :headers="[
        { text: $t('Rank'), value: 'rank', align: 'end' },
        { text: $t('User'), value: 'user.name' },
        { text: $t('Score'), value: 'score', align: 'end' },
        { text: $t('Submitted'), value: 'submitted', align: 'end' },
        { text: $t('Evaluating'), value: 'evaluating', align: 'end' },
        { text: $t('Evaluated'), value: 'evaluated', align: 'end' },
        { text: $t('Evaluation error'), value: 'evaluation_error', align: 'end' },
        { text: $t('Scoring'), value: 'scoring', align: 'end' },
        { text: $t('Scored'), value: 'scored', align: 'end' },
        { text: $t('Scoring error'), value: 'scoring_error', align: 'end' },
        { text: $t('Budget left'), value: 'budget_left', align: 'end' },
        { text: $t('Registered'), value: 'created_at', align: 'end' },
        { text: $t('Last Update'), value: 'updated_at', align: 'end' },
      ]" :items="progress" :items-per-page="10" :loading="$apollo.loading" :footer-props="{
  'items-per-page-options': [10, 20, 50, 100],
  showFirstLastPage: true,
}" multi-sort :locale="$i18n.locale" :loading-text="$t('loading')" :no-data-text="$t('no data')">
        <template v-slot:item.user.name="{ item }">
          <nuxt-link :to="localePath('/users/' + item.user.name)">{{
            item.user.name
          }}</nuxt-link>
        </template>
        <template v-slot:item.created_at="{ item }">
          {{ $dayjs(item.created_at).locale($i18n.locale).fromNow() }}
        </template>
        <template v-slot:item.updated_at="{ item }">
          {{ $dayjs(item.updated_at).locale($i18n.locale).fromNow() }}
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
import gql from 'graphql-tag'
import palette from 'google-palette'
import getMatch from '~/apollo/queries/getMatch.gql'

export default {
  auth: false,
  data() {
    return {
      match: {},
      progress: [],
      hideAll: false,
    }
  },
  computed: {
    chartdata() {
      const lab = new Array(this.match.budget).fill(1).map((n, i) => n + i)
      const pal = palette('mpn65', 65).map((hex) => '#' + hex)
      return {
        labels: lab,
        datasets: this.progress.map((p, i) => ({
          label: p.user.name,
          borderColor: pal[i % pal.length],
          backgroundColor: pal[i % pal.length],
          data: p.scores,
          hide: this.hideAll,
        })),
      }
    },
    options() {
      return {
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: this.$t(this.isLeaderboardPublic ? "Scores of All Players" : 'Your Scores'),
          },
          legend: {
            labels: {
              boxWidth: 12,
            },
          },
          tooltip: {
            callbacks: {
              label(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += context.parsed.y.toExponential(4)
                }
                return label
              },
            },
          },
          zoom: {
            pan: {
              enabled: true,
              modifierKey: 'ctrl',
            },
            zoom: {
              overScaleMode: 'xy',
              wheel: {
                enabled: true,
              },
              drag: {
                enabled: true,
                borderWidth: 1,
              },
              pinch: {
                enabled: true,
              },
            },
          },
          limits: {
            x: {
              min: 'original',
              max: 'original',
            },
            y: {
              min: 'original',
              max: 'original',
            },
          },
        },
        scales: {
          x: {
            type: 'linear',
            bounds: 'data',
          },
          y: {
            type: 'logarithmic',
            bounds: 'data',
            ticks: {
              callback: function (tick, index, ticks) {
                return tick === 0 ? 0 : tick.toExponential(1)
              }
            }
          }
        },
        elements: {
          line: { tension: 0 },
        },
      }
    },
    chartstyles() {
      return {
        width: '100%',
      }
    },
    isLeaderboardPublic() {
      return this.match.public || this.isCompetitionClosed || this.isCompetitionOwned
    },
    isCompetitionClosed() {
      return this.$dayjs().isAfter(this.match.competition.close_at)
    },
    isCompetitionOwned() {
      return this.match.competition.owner.name === this.$auth.user?.['https://hasura.io/jwt/claims']?.['x-hasura-username']
    },
  },
  methods: {
    async hideAllGraphs() {
      const chart = this.$refs.lineChart.getCurrentChart()
      chart.data.datasets.forEach(item => {
        item.hidden = true
      })
      chart.update()
    },
    showAllGraphs() {
      const chart = this.$refs.lineChart.getCurrentChart()
      chart.data.datasets.forEach(item => {
        item.hidden = false
      })
      chart.update()
    },
  },
  head() {
    return {
      title:
        this.$t('Progress') +
        ': ' +
        this.$t('Match') +
        ' ' +
        this.$route.params.id,
    }
  },
  apollo: {
    match: {
      query: getMatch,
      variables() {
        return { id: this.$route.params.id }
      },
      update(data) {
        try {
          return data.matches_by_pk
        } catch (error) {
          console.error(error)
          return this.match
        }
      },
    },
    progress: {
      query: gql`
        query(
          $offset: Int = 0
          $limit: Int = 20
          $where: progress_bool_exp = {}
        ) {
          progress(offset: $offset, limit: $limit, where: $where) {
            user {
              name
            }
            match_id
            match {
              indicator_id
            }
            budget
            scores
            submitted
            evaluating
            evaluated
            evaluation_error
            scoring
            scored
            scoring_error
            created_at
            updated_at
          }
        }
      `,
      variables() {
        return {
          offset: 0,
          limit: 100,
          where: { match_id: { _eq: this.$route.params.id } },
        }
      },
      update(data) {
        try {
          const minimize = (a, b) => a.score == null ? +1 : b.score == null ? -1 : a.score - b.score
          const maximize = (a, b) => a.score == null ? +1 : b.score == null ? -1 : b.score - a.score
          const comparator = data.progress[0]?.match?.indicator_id?.includes?.("hypervolume") ? maximize : minimize
          return data.progress
            .map((p) => {
              p.scores = p.scores.filter(s => s !== null)
              p.score = p.scores[p.scores.length - 1]
              p.budget_left = p.budget - p.scored + p.scoring_error
              return p
            })
            .sort(comparator)
            .map((p, i) => {
              p.rank = i + 1
              return p
            })
        } catch (error) {
          console.error(error)
          return this.progress
        }
      },
    },
  },
}
</script>

<i18n lang="yaml">
ja:
  Progress: 進行状況
  Budget: 評価回数
  Budget left: 残り評価回数
  Match: 競技
  Rank: 順位
  User: プレイヤー
  Score: 得点
  Submitted: 送信済
  Evaluating: 評価中
  Evaluated: 評価済
  Evaluation error: 評価エラー
  Scoring: 採点中
  Scored: 採点済
  Scoring error: 採点エラー
  Registered: 参加日時
  Last Update: 最終更新
  Scores of All Players: 全プレイヤーのスコアの推移
  Your scores: あなたのスコアの推移
  loading: 読込中
  no data: データがありません
  "CHART MANIPULATION:": グラフの操作法：
  "Drag: Zoom into draged area.": ドラッグ：選択領域を拡大表示する。
  "Pinch/Wheel over X-scale: Zoom-in/out along X-axis.": X軸上でピンチ/ホイール：X軸方向に拡大縮小する。
  "Pinch/Wheel over Y-scale: Zoom-in/out along Y-axis.": Y軸上でピンチ/ホイール：Y軸方向に拡大縮小する。
  "Ctrl + Drag: Pan viewport area.": Ctrlを押しながらドラッグ：表示範囲を移動する。
</i18n>
