<template>
  <div>
    <v-toolbar color="white" flat>
      <v-toolbar-title class="headline">{{
        $t('Edit Problem')
      }}</v-toolbar-title>
    </v-toolbar>

    <v-text-field
      v-model="problem.id"
      :label="$t('ID')"
      :hint="$t('2--32 characters')"
      :placeholder="$t('sphere')"
    />

    <v-text-field
      v-model="problem.image"
      :label="$t('Image')"
      :hint="$t('Docker image tag')"
      :placeholder="$t('opthub/sphere:latest')"
    />

    <v-radio-group v-model="problem.public">
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
        v-model="problem.description_en"
        language="en"
        :box-shadow="false"
        :style="'z-index: ' + zIndex"
        :toolbars="markdownOption"
        @fullScreen="fullscreen"
      />
      <mavon-editor
        v-if="$i18n.locale === 'ja'"
        v-model="problem.description_ja"
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
import getProblem from '~/apollo/queries/getProblem.gql'
import listProblems from '~/apollo/queries/listProblems.gql'
import updateProblem from '~/apollo/mutations/updateProblem.gql'
import getUser from '~/apollo/queries/getUser.gql'
export default {
  data() {
    return {
      problem: {},
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
        mutation: updateProblem,
        variables: {
          id: this.$route.params.id,
          new_id: this.problem.id,
          public: this.problem.public,
          image: this.problem.image,
          description_en: this.problem.description_en,
          description_ja: this.problem.description_ja,
        },
        refetchQueries: [
          { query: listProblems },
          {
            query: getProblem,
            variables: { id: this.problem.id },
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
      this.$router.push(this.localePath('/problems/' + this.problem.id))
    },
  },
  head() {
    return {
      title: this.$t('Edit Problem') + ' ' + this.$route.params.id,
    }
  },
  apollo: {
    problem: {
      query: getProblem,
      variables() {
        return { id: this.$route.params.id }
      },
      update(data) {
        try {
          const p = data.problems_by_pk
          p.created_at = dayjs(p.created_at)
            .locale(this.$i18n.locale)
            .format('YYYY-MM-DD HH:mm:ss')
          p.updated_at = dayjs(p.updated_at)
            .locale(this.$i18n.locale)
            .format('YYYY-MM-DD HH:mm:ss')
          return p
        } catch (error) {
          console.error(error)
          return this.problem
        }
      },
    },
  },
}
</script>

<i18n lang="yaml">
ja:
  2--32 characters: 2~32文字
  Docker image tag: Dockerイメージタグ
  Edit Problem: 問題を編集する
  ID: ID
  Image: イメージ
  Public: 公開
  Private: 非公開
  Sphere problem: Sphere問題
  Submit: 送信
</i18n>
