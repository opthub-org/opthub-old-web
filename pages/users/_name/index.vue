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
    <v-simple-table dense>
      <thead>
        <tr>
          <th>{{ $t('Competition') }}</th>
          <th>{{ $t('Match') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="s in user.solutions" :key="s.match.id">
          <td>
            <nuxt-link
              :to="localePath('/competitions/' + s.match.competition.id)"
              >{{ s.match.competition.id }}</nuxt-link
            >
          </td>
          <td>
            <nuxt-link :to="localePath('/matches/' + s.match.id)">{{
              s.match.name
            }}</nuxt-link>
          </td>
        </tr>
      </tbody>
    </v-simple-table>

    <h2>{{ $t('Owned Contents') }}</h2>
    <h3>{{ $t('Problems') }}</h3>
    <v-simple-table dense>
      <thead>
        <tr>
          <th>{{ $t('ID') }}</th>
          <th>{{ $t('Created at') }}</th>
          <th>{{ $t('Updated at') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in user.problems" :key="p.id">
          <td>
            <nuxt-link :to="localePath('/problems/' + p.id)">{{
              p.id
            }}</nuxt-link>
          </td>
          <td>{{ $dayjs(p.created_at).locale($i18n.locale).fromNow() }}</td>
          <td>{{ $dayjs(p.updated_at).locale($i18n.locale).fromNow() }}</td>
        </tr>
      </tbody>
    </v-simple-table>

    <h3>{{ $t('Indicators') }}</h3>
    <v-simple-table dense>
      <thead>
        <tr>
          <th>{{ $t('ID') }}</th>
          <th>{{ $t('Created at') }}</th>
          <th>{{ $t('Updated at') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="m in user.indicators" :key="m.id">
          <td>
            <nuxt-link :to="localePath('/indicators/' + m.id)">{{
              m.id
            }}</nuxt-link>
          </td>
          <td>{{ $dayjs(m.created_at).locale($i18n.locale).fromNow() }}</td>
          <td>{{ $dayjs(m.updated_at).locale($i18n.locale).fromNow() }}</td>
        </tr>
      </tbody>
    </v-simple-table>

    <h3>{{ $t('Competitions') }}</h3>
    <v-simple-table dense>
      <thead>
        <tr>
          <th>{{ $t('ID') }}</th>
          <th>{{ $t('Created at') }}</th>
          <th>{{ $t('Updated at') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="c in user.competitions" :key="c.id">
          <td>
            <nuxt-link :to="localePath('/competitions/' + c.id)">{{
              c.id
            }}</nuxt-link>
          </td>
          <td>{{ $dayjs(c.created_at).locale($i18n.locale).fromNow() }}</td>
          <td>{{ $dayjs(c.updated_at).locale($i18n.locale).fromNow() }}</td>
        </tr>
      </tbody>
    </v-simple-table>
  </div>
</template>

<script>
import getUser from '~/apollo/queries/getUser.gql'

export default {
  auth: false,

  data() {
    return {
      user: {},
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
        return data.users[0]
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
  Owned Contents: 所有しているコンテンツ
  Competitions: コンペティション
  Problems: 問題
  Indicators: 指標
  Open at: 競技開始
  Close at: 競技終了
  Created at: 作成日時
  Updated at: 更新日時
</i18n>
