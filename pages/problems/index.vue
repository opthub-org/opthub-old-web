<template>
  <div>
    <v-toolbar color="white" flat>
      <v-toolbar-title class="headline">{{ $t('Problems') }}</v-toolbar-title>
      <v-spacer />
      <v-tooltip :z-index="!$auth.loggedIn ? 0 : -1" left>
        <template v-slot:activator="{ on, attrs }">
          <div v-on="on">
            <v-btn v-bind="attrs" :disabled="!$auth.loggedIn" nuxt append to="new">{{ $t('New') }}</v-btn>
          </div>
        </template>
        <span>{{ $t('Login needed') }}</span>
      </v-tooltip>
    </v-toolbar>
    <v-data-table :headers="headers" :items="problems" :items-per-page="10" :loading="$apollo.loading" :footer-props="{
      'items-per-page-options': [10, 20, 50, 100],
      showFirstLastPage: true,
    }" multi-sort :locale="$i18n.locale" :loading-text="$t('loading')" :no-data-text="$t('no data')">
      <template v-slot:item.id="{ item }">
        <nuxt-link append :to="item.id">{{ item.id }}</nuxt-link>
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
import dayjs from 'dayjs'
import listProblems from '~/apollo/queries/listProblems.gql'

export default {
  auth: false,

  data() {
    return {
      headers: [
        { text: this.$t('ID'), value: 'id' },
        { text: this.$t('Owner'), value: 'owner.name' },
        { text: this.$t('Used'), value: 'matches.length' },
        { text: this.$t('Created at'), value: 'created_at' },
        { text: this.$t('Updated at'), value: 'updated_at' },
      ],
      problems: [],
    }
  },

  head() {
    return {
      title: this.$t('Problems'),
    }
  },

  apollo: {
    problems: {
      query: listProblems,
      variables: {
        offset: null,
        limit: null,
        where: null,
      },
      update(data) {
        return data.problems.sort()
      },
    },
  },
}
</script>

<i18n lang="yaml">
ja:
  Problems: 問題
  ID: ID
  Owner: 所有者
  Used: 使用競技数
  Created at: 作成日時
  Updated at: 更新日時
  New: 新規作成
  Login needed: ログインしてください
  loading: 読込中
  no data: データがありません
</i18n>
