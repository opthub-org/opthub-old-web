<template>
  <div>
    <v-toolbar color="white" flat>
      <v-toolbar-title class="headline">{{ $t('Users') }}</v-toolbar-title>
    </v-toolbar>
    <v-data-table :headers="headers" :items="users" :items-per-page="10" :loading="$apollo.loading" :footer-props="{
      'items-per-page-options': [10, 20, 50, 100],
      showFirstLastPage: true,
    }" multi-sort :locale="$i18n.locale" :loading-text="$t('loading')" :no-data-text="$t('no data')">
      <template v-slot:item.name="{ item }">
        <nuxt-link :to="localePath('/users/' + item.name)">{{
          item.name
        }}</nuxt-link>
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
import listUsers from '~/apollo/queries/listUsers.gql'

export default {
  auth: false,

  data() {
    return {
      headers: [
        { text: this.$t('Name'), value: 'name' },
        { text: this.$t('Created at'), value: 'created_at' },
        { text: this.$t('Updated at'), value: 'updated_at' },
      ],
      users: [],
    }
  },

  head() {
    return {
      title: this.$t('Users'),
    }
  },

  apollo: {
    users: {
      query: listUsers,
      variables: {
        offset: null,
        limit: null,
        where: null,
      },
      update(data) {
        return data.users.sort()
      },
    },
  },
}
</script>

<i18n lang="yaml">
ja:
  Users: ユーザー
  Name: 名前
  Created at: 作成日時
  Updated at: 更新日時
  loading: 読込中
  no data: データがありません
</i18n>
