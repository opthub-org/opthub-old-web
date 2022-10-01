<template>
  <div>
    <v-toolbar color="white" flat>
      <v-toolbar-title class="headline">{{
        $t('New Competition')
      }}</v-toolbar-title>
    </v-toolbar>

    <v-text-field
      v-model="competition.id"
      :label="$t('ID')"
      :hint="$t('2--32 characters')"
      :placeholder="$t('eccomp2020')"
    />
    <datetime-picker v-model="competition.open_at" :label="$t('Open at')" />
    <datetime-picker v-model="competition.close_at" :label="$t('Close at')" />

    <v-radio-group v-model="competition.public">
      <v-radio
        :label="$t('Public')"
        :value="true"
      />
      <v-radio
        :label="$t('Private')"
        :value="false"
      />
    </v-radio-group>

    <client-only>
      <mavon-editor
        v-if="$i18n.locale === 'en'"
        v-model="competition.description_en"
        language="en"
        :box-shadow="false"
        :style="'z-index: ' + zIndex"
        :toolbars="markdownOption"
        @fullScreen="fullscreen"
      />
      <mavon-editor
        v-if="$i18n.locale === 'ja'"
        v-model="competition.description_ja"
        language="ja"
        :box-shadow="false"
        :style="'z-index: ' + zIndex"
        :toolbars="markdownOption"
        @fullScreen="fullscreen"
      />
    </client-only>
    <v-btn :loading="submitting" @click="submit">{{ $t('Submit') }}</v-btn>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import createCompetition from '~/apollo/mutations/createCompetition.gql'
import listCompetitions from '~/apollo/queries/listCompetitions.gql'
import getUser from '~/apollo/queries/getUser.gql'
import DatetimePicker from '~/components/DatetimePicker'
export default {
  components: {
    DatetimePicker,
  },
  data() {
    const now = dayjs()
    return {
      competition: {
        id: 'eccomp2020',
        public: false,
        open_at: now.format('YYYY-MM-DD HH:mm'),
        close_at: now.add(1, 'day').format('YYYY-MM-DD HH:mm'),
        description_en: `\
# EC Competition 2020

This is a template.

## Background

Explain the background of the problems here.


## Variables

Explain variables here.


## Objectives

Explain objectives here.


## Constraints

Explain constraints here.
`,
        description_ja: `\
# 進化計算コンペティション2020

これはテンプレートです．

## 背景

ここに問題の背景を記述してください．


## 変数

ここに変数の説明を記述してください．


## 目的

ここに目的の説明を記述してください．


## 制約

ここに制約の説明を記述してください．
`,
      },
      markdownOption: {
        bold: true,
        italic: true,
        header: true,
        underline: true,
        strikethrough: true,
        mark: true,
        superscript: true,
        subscript: true,
        quote: true,
        ol: true,
        ul: true,
        link: true,
        imagelink: true,
        code: true,
        table: true,
        fullscreen: true,
        readmodel: true,
        htmlcode: true,
        help: true,
      },
      submitting: false,
      zIndex: 1,
    }
  },
  methods: {
    fullscreen(status, _) {
      this.zIndex = status ? 10 : 1
    },
    async submit() {
      this.submitting = true
      await this.$apollo.mutate({
        mutation: createCompetition,
        variables: {
          id: this.competition.id,
          public: this.competition.public,
          open_at: dayjs(this.competition.open_at).format(
            'YYYY-MM-DD HH:mm:ssZ'
          ),
          close_at: dayjs(this.competition.close_at).format(
            'YYYY-MM-DD HH:mm:ssZ'
          ),
          description_en: this.competition.description_en,
          description_ja: this.competition.description_ja,
        },
        refetchQueries: [
          { query: listCompetitions },
          {
            query: getUser,
            variables: {
              name: this.$auth.user['https://hasura.io/jwt/claims'][
                'x-hasura-username'
              ],
            },
          },
        ],
      })
      this.$router.push(this.localePath('/competitions/' + this.competition.id))
    },
  },
  head() {
    return {
      title: this.$t('New Competition'),
    }
  },
}
</script>

<i18n lang="yaml">
ja:
  2--32 characters: 2~32文字
  Close at: 競技終了
  ID: ID
  New Competition: コンペティションを作成する
  Open at: 競技開始
  Public: 公開
  Private: 非公開
  Submit: 送信
</i18n>
