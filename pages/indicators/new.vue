<template>
  <div>
    <v-toolbar color="white" flat>
      <v-toolbar-title class="headline">{{
        $t('New Indicator')
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
import createIndicator from '~/apollo/mutations/createIndicator.gql'
import listIndicators from '~/apollo/queries/listIndicators.gql'
import getUser from '~/apollo/queries/getUser.gql'
export default {
  data() {
    return {
      indicator: {
        description_en: `\
# Hypervolume Indicator
This is a template of indicator description.

## Definition
$s(Y, z) = \\mathrm{vol}\\left(\\bigcup_{y \\in Y} [y_1, z_1] \\times \\cdots \\times [y_M, z_M]\\right)$

## Input format
An input data must be two lines.
The first line is a JSON object having properties \`"objective"\` and \`"constraint"\`.
The second line is a JSON array of objects each having properties \`"objective"\` and \`"constraint"\`.

### Valid examples
\`\`\`json
{"objective": [1, 2]}
\`\`\`

\`\`\`json
{"objective": [1, 2], "constraint": 1}
\`\`\`

\`\`\`json
{"objective": [1, 2], "constraint": [0, 0, 0]}
\`\`\`

\`\`\`json
{"objective": [1, 2, 3], "constraint": [0, 0]}
\`\`\`

### Invalid examples
\`\`\`json
{"objective": 1, "constraint": [0, 0]}
\`\`\`
\`"objective"\` must be an array.

\`\`\`json
{"objective": [1], "constraint": [0, 0]}
\`\`\`
\`"objective"\` must be an array of at least length 2.

## Output format
A JSON object with key \`"score"\`.

### Examples
\`\`\`json
{"score": 2.1}
\`\`\`
`,
        description_ja: `\
# ハイパーボリューム指標
## 定義
$\\text{minimize } f(x_1, x_2) = x_1^2 + x_2^2 \\quad \\text{subject to } -1 \\le x_i \\le 1$

## 入力フォーマット
入力データは2行です．
1行目はJSONオブジェクトで \`"objective"\` （必須）と \`"constraint"\` （オプション）をもちます．
2行目はJSONオブジェクトの配列で，各要素は \`"objective"\` （必須）と \`"constraint"\` （オプション）をもちます．

### 正しい例
\`\`\`json
{"objective": [1, 2]}
\`\`\`

\`\`\`json
{"objective": [1, 2], "constraint": 1}
\`\`\`

\`\`\`json
{"objective": [1, 2], "constraint": [0, 0, 0]}
\`\`\`

\`\`\`json
{"objective": [1, 2, 3], "constraint": [0, 0]}
\`\`\`

### 誤った例
\`\`\`json
{"objective": 1, "constraint": [0, 0]}
\`\`\`
\`"objective"\` は配列でなければなりません．

\`\`\`json
{"objective": [1], "constraint": [0, 0]}
\`\`\`
\`"objective"\` は長さ2以上の配列でなければなりません．

## 出力フォーマット
キー \`"score"\` をもつJSONオブジェクト．

### 例
\`\`\`json
{"score": 2.1}
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
      await this.$apollo.mutate({
        mutation: createIndicator,
        variables: { ...this.indicator },
        refetchQueries: [
          { query: listIndicators },
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
      title: this.$t('New Indicator'),
    }
  },
}
</script>

<i18n lang="yaml">
ja:
  New Indicator: 指標を作成する
  ID: ID
  2--32 characters: 2~32文字
  Image: イメージ
  Docker image tag: Dockerイメージタグ
  Hypervolume indicator: ハイパーボリューム指標
  Submit: 送信
</i18n>
