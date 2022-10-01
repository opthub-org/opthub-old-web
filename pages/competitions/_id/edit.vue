<template>
  <div>
    <v-toolbar color="white" flat>
      <v-toolbar-title class="headline">{{
        $t('Edit Competition')
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
        :label="$t('public')"
        :value="true"
      />
      <v-radio
        :label="$t('private')"
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
import getCompetition from '~/apollo/queries/getCompetition.gql'
import listCompetitions from '~/apollo/queries/listCompetitions.gql'
import updateCompetition from '~/apollo/mutations/updateCompetition.gql'
import getUser from '~/apollo/queries/getUser.gql'
import DatetimePicker from '~/components/DatetimePicker'
export default {
  components: {
    DatetimePicker,
  },
  data() {
    return {
      competition: {},
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
        mutation: updateCompetition,
        variables: {
          id: this.$route.params.id,
          new_id: this.competition.id,
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
            query: getCompetition,
            variables: { id: this.competition.id },
          },
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
      title: this.$t('Edit Competition') + ' ' + this.$route.params.id,
    }
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
          c.created_at = dayjs(c.created_at)
            .locale(this.$i18n.locale)
            .format('YYYY-MM-DD HH:mm:ssZ')
          c.updated_at = dayjs(c.updated_at)
            .locale(this.$i18n.locale)
            .format('YYYY-MM-DD HH:mm:ssZ')
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
  Edit Competition: コンペティションを編集する
  ID: ID
  2--32 characters: 2~32文字
  Open at: 競技開始
  Close at: 競技終了
  Submit: 送信
</i18n>
