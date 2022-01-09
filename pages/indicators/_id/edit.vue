<template>
  <div>
    <v-toolbar color="white" flat>
      <v-toolbar-title class="headline">{{
        $t('Edit Indicator')
      }}</v-toolbar-title>
    </v-toolbar>

    <v-text-field
      v-model="indicator.id"
      :label="$t('ID')"
      :hint="$t('2--32 characters')"
      :placeholder="$t('hypervolume')"
    />

    <v-text-field
      v-model="indicator.image"
      :label="$t('Image')"
      :hint="$t('Docker image tag')"
      :placeholder="$t('opthub/hypervolume:latest')"
    />

    <client-only>
      <mavon-editor
        v-if="$i18n.locale === 'en'"
        v-model="indicator.description_en"
        language="en"
        :box-shadow="false"
        :style="'z-index: ' + zIndex"
        :toolbars="markdownOption"
        @fullScreen="fullscreen"
      />
      <mavon-editor
        v-if="$i18n.locale === 'ja'"
        v-model="indicator.description_ja"
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
import getIndicator from '~/apollo/queries/getIndicator.gql'
import listIndicators from '~/apollo/queries/listIndicators.gql'
import updateIndicator from '~/apollo/mutations/updateIndicator.gql'
import getUser from '~/apollo/queries/getUser.gql'
export default {
  data() {
    return {
      indicator: {},
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
        mutation: updateIndicator,
        variables: {
          id: this.$route.params.id,
          new_id: this.indicator.id,
          image: this.indicator.image,
          description_en: this.indicator.description_en,
          description_ja: this.indicator.description_ja,
        },
        refetchQueries: [
          { query: listIndicators },
          {
            query: getIndicator,
            variables: { id: this.indicator.id },
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
      this.$router.push(this.localePath('/indicators/' + this.indicator.id))
    },
  },
  head() {
    return {
      title: this.$t('Edit Indicator') + ' ' + this.$route.params.id,
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
  Edit Indicator: 指標を編集する
  ID: ID
  2--32 characters: 2~32文字
  Image: イメージ
  Docker image tag: Dockerイメージタグ
  Hypervolume indicator: ハイパーボリューム指標
  Submit: 送信
</i18n>
