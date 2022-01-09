<template>
  <div v-if="!$apollo.loading">
    <h1>{{ $t('User') + ': ' + user.name }}</h1>
    <dl>
      <dt>{{ $t('Created at') }}</dt>
      <dd>{{ user.created_at }}</dd>
      <dt>{{ $t('Updated at') }}</dt>
      <dd>{{ user.updated_at }}</dd>
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
          <td>{{ p.created_at }}</td>
          <td>{{ p.updated_at }}</td>
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
          <td>{{ m.created_at }}</td>
          <td>{{ m.updated_at }}</td>
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
          <td>{{ c.created_at }}</td>
          <td>{{ c.updated_at }}</td>
        </tr>
      </tbody>
    </v-simple-table>
  </div>
</template>

<script>
import dayjs from 'dayjs'
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
        try {
          const u = data.users[0]
          u.created_at = dayjs(u.created_at)
            .locale(this.$i18n.locale)
            .format('YYYY-MM-DD HH:mm:ss')
          u.updated_at = dayjs(u.updated_at)
            .locale(this.$i18n.locale)
            .format('YYYY-MM-DD HH:mm:ss')
          u.problems = u.problems.map((p) => {
            p.created_at = dayjs(p.craeted_at)
              .locale(this.$i18n.locale)
              .format('YYYY-MM-DD HH:mm:ss')
            p.updated_at = dayjs(p.updated_at)
              .locale(this.$i18n.locale)
              .format('YYYY-MM-DD HH:mm:ss')
            return p
          })
          u.indicators = u.indicators.map((i) => {
            i.created_at = dayjs(i.craeted_at)
              .locale(this.$i18n.locale)
              .format('YYYY-MM-DD HH:mm:ss')
            i.updated_at = dayjs(i.updated_at)
              .locale(this.$i18n.locale)
              .format('YYYY-MM-DD HH:mm:ss')
            return i
          })
          u.competitions = u.competitions.map((c) => {
            c.created_at = dayjs(c.craeted_at)
              .locale(this.$i18n.locale)
              .format('YYYY-MM-DD HH:mm:ss')
            c.updated_at = dayjs(c.updated_at)
              .locale(this.$i18n.locale)
              .format('YYYY-MM-DD HH:mm:ss')
            return c
          })
          return u
        } catch (error) {
          console.error(error)
          return this.user
        }
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
