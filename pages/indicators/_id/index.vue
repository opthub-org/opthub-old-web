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
            <v-btn
              v-bind="attrs"
              :disabled="!isEditable"
              nuxt
              append
              to="edit"
              >{{ $t('Edit') }}</v-btn
            >
          </div>
        </template>
        <span>{{ $t('Owner only') }}</span>
      </v-tooltip>
    </v-toolbar>

    <client-only>
      <mavon-editor
        v-if="$i18n.locale === 'en'"
        v-model="indicator.description_en"
        language="en"
        default-open="preview"
        style="z-index: 1;"
        :box-shadow="false"
        :editable="false"
        :subfield="false"
        :toolbars-flag="false"
      />
      <mavon-editor
        v-if="$i18n.locale === 'ja'"
        v-model="indicator.description_ja"
        language="ja"
        default-open="preview"
        style="z-index: 1;"
        :box-shadow="false"
        :editable="false"
        :subfield="false"
        :toolbars-flag="false"
      />
    </client-only>

    <ul>
      <li>{{ $t('Owner') + ': ' + indicator.owner.name }}</li>
      <li>{{ $t('Image') + ': ' + indicator.image }}</li>
      <li>{{ $t('Created at') + ': ' + indicator.created_at }}</li>
      <li>{{ $t('Updated at') + ': ' + indicator.updated_at }}</li>
    </ul>

    <h2>{{ $t('Used in') }}</h2>
    <v-simple-table>
      <thead>
        <tr>
          <th>{{ $t('Competition') }}</th>
          <th>{{ $t('Match') }}</th>
          <th>{{ $t('Owner') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="m in indicator.matches" :key="m.id">
          <td>
            <nuxt-link :to="localePath('/competitions/' + m.competition.id)">{{
              m.competition.id
            }}</nuxt-link>
          </td>
          <td>
            <nuxt-link :to="localePath('/matches/' + m.id)">{{
              m.name
            }}</nuxt-link>
          </td>
          <td>
            <nuxt-link :to="localePath('/users/' + m.competition.owner.name)">{{
              m.competition.owner.name
            }}</nuxt-link>
          </td>
        </tr>
      </tbody>
    </v-simple-table>
  </div>
</template>

<script>
import dayjs from 'dayjs'
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
      return (
        this.$auth.loggedIn &&
        this.$auth.user['https://hasura.io/jwt/claims']['x-hasura-username'] ===
          this.indicator.owner.name
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
        try {
          const i = data.indicators_by_pk
          i.created_at = dayjs(i.created_at)
            .locale(this.$i18n.locale)
            .format('YYYY-MM-DD HH:mm:ss')
          i.updated_at = dayjs(i.updated_at)
            .locale(this.$i18n.locale)
            .format('YYYY-MM-DD HH:mm:ss')
          return i
        } catch (error) {
          console.error(error)
          return this.indicator
        }
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
