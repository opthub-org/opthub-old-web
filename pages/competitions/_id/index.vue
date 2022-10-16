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
      <li>{{ $t('Created at') + ': ' + competition.created_at }}</li>
      <li>{{ $t('Updated at') + ': ' + competition.updated_at }}</li>
    </ul>

    <h2 id="important-dates">{{ $t('Important Dates') }}</h2>
    <ul>
      <li>{{ $t('Open at') + ': ' + competition.open_at }}</li>
      <li>{{ $t('Close at') + ': ' + competition.close_at }}</li>
    </ul>

    <h2 id="matches">{{ $t('Matches') }}</h2>
    <v-simple-table>
      <thead>
        <tr>
          <th>{{ $t('Match') }}</th>
          <th>{{ $t('Problem') }}</th>
          <th>{{ $t('Indicator') }}</th>
          <th>{{ $t('Budget') }}</th>
          <th>{{ $t('Created at') }}</th>
          <th>{{ $t('Updated at') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="m in competition.matches" :key="m.id">
          <td>
            <nuxt-link :to="localePath('/matches/' + m.id)">{{
              m.name
            }}</nuxt-link>
          </td>
          <td>{{ m.problem ? m.problem.id : $t('(private)') }}</td>
          <td>{{ m.indicator ? m.indicator.id : $t('(private)') }}</td>
          <td>{{ m.budget }}</td>
          <td>{{ m.created_at }}</td>
          <td>{{ m.updated_at }}</td>
        </tr>
      </tbody>
    </v-simple-table>
  </div>
</template>

<script>
import dayjs from 'dayjs'
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
        try {
          const c = data.competitions_by_pk
          c.open_at = dayjs(c.open_at)
            .locale(this.$i18n.locale)
            .format('YYYY-MM-DD HH:mm')
          c.close_at = dayjs(c.close_at)
            .locale(this.$i18n.locale)
            .format('YYYY-MM-DD HH:mm')
          c.created_at = dayjs(c.created_at)
            .locale(this.$i18n.locale)
            .format('YYYY-MM-DD HH:mm:ss')
          c.updated_at = dayjs(c.updated_at)
            .locale(this.$i18n.locale)
            .format('YYYY-MM-DD HH:mm:ss')
          c.matches = c.matches.map((m) => {
            m.created_at = dayjs(m.created_at)
              .locale(this.$i18n.locale)
              .format('YYYY-MM-DD HH:mm:ss')
            m.updated_at = dayjs(m.updated_at)
              .locale(this.$i18n.locale)
              .format('YYYY-MM-DD HH:mm:ss')
            return m
          })
          return c
        } catch (error) {
          console.error(error)
          return this.competition
        }
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
