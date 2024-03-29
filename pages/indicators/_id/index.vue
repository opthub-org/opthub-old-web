<template>
  <div v-if="!$apollo.loading">
    <v-toolbar color="white" flat>
      <v-toolbar-title class="headline">{{
        $t('Indicator') + ': ' + indicator.id
      }}</v-toolbar-title>
      <v-spacer />
      <v-tooltip :z-index="!isEditable ? 0 : -1" left>
        <template v-slot:activator="{ on, attrs }">
          <div v-on="on">
            <v-btn v-bind="attrs" :disabled="!isEditable" nuxt append to="edit">{{ $t('Edit') }}</v-btn>
          </div>
        </template>
        <span>{{ $t('Owner only') }}</span>
      </v-tooltip>
    </v-toolbar>

    <client-only>
      <mavon-editor v-if="$i18n.locale === 'en'" v-model="indicator.description_en" language="en" default-open="preview"
        style="z-index: 1;" :box-shadow="false" :editable="false" :subfield="false" :toolbars-flag="false" />
      <mavon-editor v-if="$i18n.locale === 'ja'" v-model="indicator.description_ja" language="ja" default-open="preview"
        style="z-index: 1;" :box-shadow="false" :editable="false" :subfield="false" :toolbars-flag="false" />
    </client-only>

    <ul>
      <li>{{ $t('Owner') + ': ' + indicator.owner.name }}</li>
      <li>{{ $t('Image') + ': ' + indicator.image }}</li>
      <li>{{ $t('Created at') + ': ' + $dayjs(indicator.created_at).locale($i18n.locale).format('llll') }}</li>
      <li>{{ $t('Updated at') + ': ' + $dayjs(indicator.updated_at).locale($i18n.locale).format('llll') }}</li>
    </ul>

    <h2>{{ $t('Used in') }}</h2>
    <v-data-table :headers="[
      { text: $t('Competition'), value: 'competition.id' },
      { text: $t('Match'), value: 'name' },
      { text: $t('Owner'), value: 'competition.owner.name' },
      { text: $t('Created at'), value: 'created_at' },
      { text: $t('Updated at'), value: 'updated_at' },
    ]" :items="indicator.matches" :items-per-page="10" :loading="$apollo.loading" :footer-props="{
  'items-per-page-options': [10, 20, 50, 100],
  showFirstLastPage: true,
}" multi-sort :locale="$i18n.locale" :loading-text="$t('loading')" :no-data-text="$t('no data')">
      <template v-slot:item.competition.id="{ item }">
        <nuxt-link :to="localePath('/competitions/' + item.competition.id)">{{ item.competition.id }}</nuxt-link>
      </template>
      <template v-slot:item.name="{ item }">
        <nuxt-link :to="localePath('/matches/' + item.id)">{{ item.name }}</nuxt-link>
      </template>
      <template v-slot:item.competition.owner.name="{ item }">
        <nuxt-link :to="localePath('/users/' + item.competition.owner.name)">{{ item.competition.owner.name }}</nuxt-link>
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
import getIndicator from '~/apollo/queries/getIndicator.gql'

export default {
  auth: false,
  data() {
    return {
      indicator: {},
    }
  },
  computed: {
    isEditable() {
      return this.$auth.loggedIn && (
        this.$auth.user['https://hasura.io/jwt/claims']['x-hasura-username'] === this.indicator.owner.name ||
        this.$auth.user['https://hasura.io/jwt/claims']['x-hasura-default-role'] === 'admin'
      )
    },
  },
  head() {
    return {
      title: this.$t('Indicator') + ': ' + this.$route.params.id,
    }
  },
  apollo: {
    indicator: {
      query: getIndicator,
      variables() {
        return { id: this.$route.params.id }
      },
      update(data) {
        return data.indicators_by_pk
      },
    },
  },
}
</script>

<i18n lang="yaml">
ja:
  Indicator: 指標
  Edit: 編集
  Owner only: 所有者のみ
  Owner: 所有者
  Image: イメージ
  Created at: 作成日時
  Updated at: 更新日時
  Used in: この指標を使用している競技
  Competition: コンペティション
  Match: 競技
  loading: 読込中
  no data: データがありません
</i18n>
