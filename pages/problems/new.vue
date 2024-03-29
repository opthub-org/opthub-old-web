<template>
  <div>
    <v-toolbar color="white" flat>
      <v-toolbar-title class="headline">{{
        $t('New Problem')
      }}</v-toolbar-title>
    </v-toolbar>

    <v-text-field v-model="problem.id" :label="$t('ID')" :hint="$t('2--32 characters')" :placeholder="$t('sphere')" />

    <v-text-field v-model="problem.image" :label="$t('Image')" :hint="$t('Docker image tag')"
      :placeholder="$t('opthub/sphere:latest')" />

    <v-radio-group v-model="problem.public">
      <v-radio :label="$t('Public')" :value="true" />
      <v-radio :label="$t('Private')" :value="false" />
    </v-radio-group>

    <client-only>
      <mavon-editor v-if="$i18n.locale === 'en'" v-model="problem.description_en" language="en" :box-shadow="false"
        :style="'z-index: ' + zIndex" :toolbars="markdownOption" @fullScreen="fullscreen" />
      <mavon-editor v-if="$i18n.locale === 'ja'" v-model="problem.description_ja" language="ja" :box-shadow="false"
        :style="'z-index: ' + zIndex" :toolbars="markdownOption" @fullScreen="fullscreen" />
    </client-only>
    <v-btn :loading="submitting" @click="submit">{{ $t('Submit') }}</v-btn>
  </div>
</template>

<script>
import createProblem from '~/apollo/mutations/createProblem.gql'
import listProblems from '~/apollo/queries/listProblems.gql'
import getUser from '~/apollo/queries/getUser.gql'
export default {
  data() {
    return {
      problem: {
        public: false,
        description_en: `\
# Sphere function minimization problem
This is a template for describing a problem.

## Definition
$\\text{minimize } f(x_1, x_2) = x_1^2 + x_2^2 \\quad \\text{subject to } -1 \\le x_i \\le 1$

## Input format
An input data must be a number array of length 2.

### Valid examples
\`\`\`json
[1.5, 2.3]
\`\`\`

\`\`\`json
[1.5e-2, 2.3E-1]
\`\`\`

\`\`\`json
[1.5, 2]
\`\`\`

\`\`\`json
[inf, nan]
\`\`\`

### Invalid examples
\`\`\`json
1.5, 2.3
\`\`\`
Values must be enclosed with square brackets.

\`\`\`json
[1.5, 2.3,]
\`\`\`
Do not put trailing commas.

## Output format
A JSON object with keys \`"objective"\` and \`"constraint"\`.

### Possible examples
\`\`\`json
{"objective": 2.1, "constraint": 2.1}
\`\`\`
`,
        description_ja: `\
# Sphere関数最小化問題
これは問題のテンプレートです．

## 定義
$\\text{minimize } f(x_1, x_2) = x_1^2 + x_2^2 \\quad \\text{subject to } -1 \\le x_i \\le 1$

## 入力フォーマット
長さ2の数値配列．

### 正しい例
\`\`\`json
[1.5, 2.3]
\`\`\`

\`\`\`json
[1.5e-2, 2.3E-1]
\`\`\`

\`\`\`json
[1.5, 2]
\`\`\`

\`\`\`json
[inf, nan]
\`\`\`

### 誤った例
\`\`\`json
1.5, 2.3
\`\`\`
値はカッコで囲ってください．

\`\`\`json
[1.5, 2.3,]
\`\`\`
末尾にコンマを付けてはいけません．

## 出力フォーマット
キー \`"objective"\` と \`"constraint"\` をもつJSONオブジェクト．

### 例
\`\`\`json
{"objective": 2.1, "constraint": 2.1}
\`\`\`
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
      const variables = { ...this.problem }
      if (this.$auth.loggedIn && this.$auth.user['https://hasura.io/jwt/claims']['x-hasura-default-role'] === 'admin') {
        variables.owner_id = this.$auth.user['https://hasura.io/jwt/claims']['x-hasura-user-id']
      }
      await this.$apollo.mutate({
        mutation: createProblem,
        variables: { problems_insert_input: variables },
        refetchQueries: [
          { query: listProblems },
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
      title: this.$t('New Problem'),
    }
  },
}
</script>

<i18n lang="yaml">
ja:
  2--32 characters: 2~32文字
  Docker image tag: Dockerイメージタグ
  ID: ID
  Image: イメージ
  New Problem: 問題を作成する
  Public: 公開
  Private: 非公開
  Sphere problem: Sphere問題
  Submit: 送信
</i18n>
