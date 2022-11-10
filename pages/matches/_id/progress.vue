<template>
  <div v-if="!$apollo.loading">
    <h1>{{ $t('Match') + ': ' + match.competition.id + ' ' + match.name }}</h1>
    <p>{{ $t('Budget') + ': ' + match.budget }}</p>
    <line-chart
      :chart-data="chartdata"
      :options="options"
      :styles="chartstyles"
    />
    <p>{{ t(isLeaderboardPublic ? "All players' scores" : 'Your scores') }}</p>
    <v-card>
      <v-data-table
        :headers="[
          { text: $t('Rank'), value: 'rank' },
          { text: $t('User'), value: 'user.name' },
          { text: $t('Score'), value: 'score' },
          { text: $t('Submitted'), value: 'submitted' },
          { text: $t('Evaluating'), value: 'evaluating' },
          { text: $t('Evaluated'), value: 'evaluated' },
          { text: $t('Scoring'), value: 'scoring' },
          { text: $t('Scored'), value: 'scored' },
          { text: $t('Registered'), value: 'created_at' },
          { text: $t('Last Update'), value: 'updated_at' },
        ]"
        :items="progress"
        :items-per-page="10"
        :loading="$apollo.loading"
        :footer-props="{
          'items-per-page-options': [10, 20, 50, 100],
          showFirstLastPage: true,
        }"
        multi-sort
        :locale="$i18n.locale"
        :loading-text="$t('loading')"
        :no-data-text="$t('no data')"
      >
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
import LineChart from '~/components/LineChart.vue'

export default {
  auth: false,
  components: {
    LineChart,
  },
  data() {
    return {
      match: {},
      progress: [],
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
          data: p.scores,
        })),
      }
    },
    options() {
      return {
        maintainAspectRatio: false,
        scales: {
          yAxes: [{ type: 'logarithmic' }],
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
      return this.match.public || this.isCompetitionClosed() || this.isCompetitionOwned()
    },
    isCompetitionClosed() {
      return this.competition.close_at < this.$dayjs()
    },
    isCompetitionOwned() {
      return this.competition.owner.name === this.$auth.user['https://hasura.io/jwt/claims']['x-hasura-username']
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
            budget
            scores
            submitted
            evaluating
            evaluated
            scoring
            scored
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
          return data.progress
            .map((p) => {
              p.scores = p.scores.filter(s => s !== null)
              p.score = p.scores[p.scores.length - 1]
              return p
            })
            .sort((a, b) => a.score - b.score)
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
  Match: 競技
  Rank: 順位
  User: プレイヤー
  Score: 得点
  Submitted: 送信済
  Evaluating: 評価中
  Evaluated: 評価済
  Scoring: 採点中
  Scored: 採点済
  Registered: 参加日時
  Last Update: 最終更新
  All players' scores: 全プレイヤーのスコアの推移
  Your scores: あなたのスコアの推移
  loading: 読込中
  no data: データがありません
</i18n>
