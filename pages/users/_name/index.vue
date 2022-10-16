<template>
  <div v-if="!$apollo.loading">
    <h1>{{ $t('User') + ': ' + user.name }}</h1>
    <dl>
      <dt>{{ $t('Created at') }}</dt>
      <dd>{{ $dayjs(user.created_at).locale($i18n.locale).format('llll') }}</dd>
      <dt>{{ $t('Updated at') }}</dt>
      <dd>{{ $dayjs(user.updated_at).locale($i18n.locale).format('llll') }}</dd>
    </dl>

    <h2>{{ $t('Played Matches') }}</h2>
    <v-data-table
      :headers="[
        { text: $t('Competition'), value: 'match.competition.id' },
        { text: $t('Match'), value: 'match.name' },
        { text: $t('Budget'), value: 'budget' },
        { text: $t('Submitted'), value: 'submitted' },
        { text: $t('Scored'), value: 'scored' },
        { text: $t('Evaluation error'), value: 'evaluation_error' },
        { text: $t('Scoring error'), value: 'scoring_error' },
        { text: $t('Score'), value: 'score' },
        { text: $t('Created at'), value: 'created_at' },
        { text: $t('Updated at'), value: 'updated_at' },
      ]"
      :items="user.progress"
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
      <template v-slot:item.match.competition.id="{ item }">
        <nuxt-link :to="localePath('/competitions/' + item.match.competition.id)">{{ item.match.competition.id }}</nuxt-link>
      </template>
      <template v-slot:item.match.name="{ item }">
        <nuxt-link :to="localePath('/matches/' + item.match.id)">{{ item.match.name }}</nuxt-link>
      </template>
      <template v-slot:item.created_at="{ item }">
        {{ $dayjs(item.created_at).locale($i18n.locale).fromNow() }}
      </template>
      <template v-slot:item.updated_at="{ item }">
        {{ $dayjs(item.updated_at).locale($i18n.locale).fromNow() }}
      </template>
    </v-data-table>

    <h2>{{ $t('Owned Contents') }}</h2>
    <h3>{{ $t('Problems') }}</h3>
    <v-data-table
      :headers="headers"
      :items="user.problems"
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
      <template v-slot:item.id="{ item }">
        <nuxt-link :to="localePath('/problems/' + item.id)">{{ item.id }}</nuxt-link>
      </template>
      <template v-slot:item.created_at="{ item }">
        {{ $dayjs(item.created_at).locale($i18n.locale).fromNow() }}
      </template>
      <template v-slot:item.updated_at="{ item }">
        {{ $dayjs(item.updated_at).locale($i18n.locale).fromNow() }}
      </template>
    </v-data-table>

    <h3>{{ $t('Indicators') }}</h3>
    <v-data-table
      :headers="headers"
      :items="user.indicators"
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
      <template v-slot:item.id="{ item }">
        <nuxt-link :to="localePath('/indicators/' + item.id)">{{ item.id }}</nuxt-link>
      </template>
      <template v-slot:item.created_at="{ item }">
        {{ $dayjs(item.created_at).locale($i18n.locale).fromNow() }}
      </template>
      <template v-slot:item.updated_at="{ item }">
        {{ $dayjs(item.updated_at).locale($i18n.locale).fromNow() }}
      </template>
    </v-data-table>

    <h3>{{ $t('Competitions') }}</h3>
    <v-data-table
      :headers="headers"
      :items="user.competitions"
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
      <template v-slot:item.id="{ item }">
        <nuxt-link :to="localePath('/competitions/' + item.id)">{{ item.id }}</nuxt-link>
      </template>
      <template v-slot:item.created_at="{ item }">
        {{ $dayjs(item.created_at).locale($i18n.locale).fromNow() }}
      </template>
      <template v-slot:item.updated_at="{ item }">
        {{ $dayjs(item.updated_at).locale($i18n.locale).fromNow() }}
      </template>
    </v-data-table>
  </div>
</template>

<script>
import getUser from '~/apollo/queries/getUser.gql'

export default {
  auth: false,

  data() {
    return {
      user: {},
      headers: [
        { text: this.$t('ID'), value: 'id' },
        { text: this.$t('Created at'), value: 'created_at' },
        { text: this.$t('Updated at'), value: 'updated_at' },
      ],
    }
  },

  head() {
    return {
      title: this.$t('User') + ': ' + this.$route.params.name,
    }
  },

  apollo: {
    user: {
      query: getUser,
      variables() {
        return { name: this.$route.params.name }
      },
      update(data) {
        const u = data.users[0]
        u.progress.map(p => {
          p.score = p.scores.filter(s => s !== null).slice(-1)[0]
          return p
        })
        return u
      },
    },
  },
}
</script>

<i18n lang="yaml">
ja:
  User: ユーザー
  Match: 競技
  Competition: コンペティション
  ID: ID
  Played Matches: 参加した競技
  Budget: 評価回数
  Submitted: 送信した解
  Scored: 採点された解
  Score: 得点
  Evaluation error: 評価エラー
  Scoring error: 採点エラー
  Owned Contents: 所有しているコンテンツ
  Competitions: コンペティション
  Problems: 問題
  Indicators: 指標
  Open at: 競技開始
  Close at: 競技終了
  Created at: 作成日時
  Updated at: 更新日時
  loading: 読込中
  no data: データがありません
</i18n>
