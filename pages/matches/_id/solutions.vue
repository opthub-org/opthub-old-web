<template>
  <div v-if="!$apollo.loading">
    <h1>{{ $t('Match') + ': ' + match.competition.id + ' ' + match.name }}</h1>
    <v-data-table
      :headers="[
        { text: $t('ID'), value: 'id' },
        { text: $t('Variable'), value: 'variable' },
        { text: $t('Objective'), value: 'objective' },
        { text: $t('Constraint'), value: 'constraint' },
        { text: $t('Score'), value: 'score' },
        { text: $t('Created at'), value: 'created_at' },
        { text: $t('Evaluation Started at'), value: 'evaluation_started_at' },
        { text: $t('Evaluation Finished at'), value: 'evaluation_finished_at' },
        { text: $t('Scoring Started at'), value: 'scoring_started_at' },
        { text: $t('Scoring Finished at'), value: 'scoring_finished_at' },
        { text: $t('Updated at'), value: 'updated_at' },
      ]"
      :items="solutions"
      :items-per-page="10"
      :loading="$apollo.loading"
      :footer-props="{
        'items-per-page-options': [10, 20, 50, 100],
        showFirstLastPage: true,
      }"
      multi-sort
      dense
      :locale="$i18n.locale"
      :loading-text="$t('loading')"
      :no-data-text="$t('no data')"
    >
      <template v-slot:item.created_at="{ item }">
        {{ $dayjs(item.created_at).locale($i18n.locale).fromNow() }}
      </template>
      <template v-slot:item.evaluation_started_at="{ item }">
        {{ $dayjs(item.evaluation_started_at).locale($i18n.locale).fromNow() }}
      </template>
      <template v-slot:item.evaluation_finished_at="{ item }">
        {{ $dayjs(item.evaluation_finished_at).locale($i18n.locale).fromNow() }}
      </template>
      <template v-slot:item.scoring_started_at="{ item }">
        {{ $dayjs(item.scoring_started_at).locale($i18n.locale).fromNow() }}
      </template>
      <template v-slot:item.scoring_finished_at="{ item }">
        {{ $dayjs(item.scoring_finished_at).locale($i18n.locale).fromNow() }}
      </template>
      <template v-slot:item.updated_at="{ item }">
        {{ $dayjs(item.updated_at).locale($i18n.locale).fromNow() }}
      </template>
    </v-data-table>
  </div>
</template>

<script>
import getMatch from '~/apollo/queries/getMatch.gql'
import listSolutions from '~/apollo/queries/listSolutions.gql'

export default {
  data() {
    return {
      match: {},
      solutions: [],
    }
  },
  head() {
    return {
      title:
        this.$t('Solutions') +
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
    solutions: {
      query: listSolutions,
      variables() {
        return {
          match_id: this.$route.params.id,
          owner_name: this.$auth.user['https://hasura.io/jwt/claims'][
            'x-hasura-username'
          ],
        }
      },
      update(data) {
        try {
          return data.solutions.sort()
        } catch (error) {
          console.error(error)
          return this.solutions
        }
      },
    },
  },
}
</script>

<i18n lang="yaml">
ja:
  Solutions: 解
  Match: 競技
  ID: ID
  Variable: 変数
  Objective: 目的
  Constraint: 制約
  Score: 得点
  Created at: 作成日時
  Evaluation Started at: 評価開始
  Evaluation Finished at: 評価終了
  Scoring Started at: 採点開始
  Scoring Finished at: 採点終了
  Updated at: 更新日時
  loading: 読込中
  no data: データがありません
</i18n>
