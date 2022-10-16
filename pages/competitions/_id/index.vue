<template>
  <div v-if="!$apollo.loading">
    <v-toolbar color="white" flat>
      <v-toolbar-title class="headline">{{
        $t('Competition') + ': ' + competition.id
      }}</v-toolbar-title>
      <v-spacer />
      <v-tooltip :z-index="!isEditable ? 0 : -1" left>
        <template #activator="{ on, attrs }">
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
        v-model="competition.description_en"
        default-open="preview"
        language="en"
        style="z-index: 1"
        xss-options="{}"
        :box-shadow="false"
        :editable="false"
        :subfield="false"
        :toolbars-flag="false"
      />
      <mavon-editor
        v-if="$i18n.locale === 'ja'"
        v-model="competition.description_ja"
        default-open="preview"
        language="ja"
        style="z-index: 1"
        xss-options="{}"
        :box-shadow="false"
        :editable="false"
        :subfield="false"
        :toolbars-flag="false"
      />
    </client-only>
    <ul>
      <li>{{ $t('Owner') + ': ' + competition.owner.name }}</li>
      <li>{{ $t('Created at') + ': ' + $dayjs(competition.created_at).locale($i18n.locale).fromNow() }}</li>
      <li>{{ $t('Updated at') + ': ' + $dayjs(competition.updated_at).locale($i18n.locale).fromNow() }}</li>
    </ul>

    <h2 id="important-dates">{{ $t('Important Dates') }}</h2>
    <ul>
      <li>{{ $t('Open at') + ': ' + $dayjs(competition.open_at).locale($i18n.locale).format('llll') }}</li>
      <li>{{ $t('Close at') + ': ' + $dayjs(competition.close_at).locale($i18n.locale).format('llll') }}</li>
    </ul>

    <h2 id="matches">{{ $t('Matches') }}</h2>
    <v-data-table
      :headers="[
        { text: $t('Match'), value: 'name' },
        { text: $t('Problem'), value: 'problem.id' },
        { text: $t('Indicator'), value: 'indicator.id' },
        { text: $t('Budget'), value: 'budget' },
        { text: $t('Created at'), value: 'created_at' },
        { text: $t('Updated at'), value: 'updated_at' },
      ]"
      :items="competition.matches"
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
      <template v-slot:item.name="{ item }">
        <nuxt-link :to="localePath('/matches/' + item.id)">{{ item.name }}</nuxt-link>
      </template>
      <template v-slot:item.problem.id="{ item }">
        {{ item.problem ? item.problem.id : $t('(private)') }}
      </template>
      <template v-slot:item.indicator.id="{ item }">
        {{ item.indicator ? item.indicator.id : $t('(private)') }}
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
import getCompetition from '~/apollo/queries/getCompetition.gql'

export default {
  auth: false,
  data() {
    return {
      competition: {},
      ogpDescription: '',
    }
  },
  head() {
    return {
      title: this.$t('Competition') + ': ' + this.$route.params.id,
      meta: [
        {
          hid: 'og:title',
          property: 'og:title',
          content: this.$t('Competition') + ': ' + this.$route.params.id,
        },
        {
          hid: 'og:description',
          property: 'og:description',
          content: this.ogpDescription,
        },
      ],
    }
  },
  computed: {
    isEditable() {
      return (
        this.$auth.loggedIn &&
        this.$auth.user['https://hasura.io/jwt/claims']['x-hasura-username'] ===
          this.competition.owner.name
      )
    },
  },
  updated() {
    // get an HTML element which has an id 'description' and set one's text as OGP description
    let ogpDescription = ''
    const descriptionElem = document.getElementById('description')
    if (descriptionElem !== null) {
      ogpDescription = descriptionElem.textContent
    }
    this.ogpDescription = ogpDescription
  },
  apollo: {
    competition: {
      query: getCompetition,
      variables() {
        return { id: this.$route.params.id }
      },
      update(data) {
        return data.competitions_by_pk
      },
    },
  },
}
</script>

<i18n lang="yaml">
ja:
  ID: ID
  Name: 名前
  Owner: 所有者
  Matches: 競技
  Match: 競技
  Problem: 問題
  Indicator: 指標
  Budget: 評価回数
  Open at: 競技開始
  Close at: 競技終了
  Created at: 作成日時
  Updated at: 更新日時
  Competition: コンペティション
  Edit: 編集
  Important Dates: スケジュール
  Owner only: 所有者のみ
  loading: 読込中
  no data: データがありません
  (private): （非公開）
</i18n>
