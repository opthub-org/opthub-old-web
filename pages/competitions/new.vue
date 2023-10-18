<template>
  <v-container fluid>
    <v-row>
      <v-toolbar color="white" flat>
        <v-toolbar-title class="headline">{{
          $t('New Competition')
        }}</v-toolbar-title>
      </v-toolbar>
    </v-row>
    <v-row>
      <v-col cols="4">
        <v-text-field v-model="competition.id" :label="$t('ID')" :hint="$t('2--32 characters')"
          :placeholder="$t('eccomp2020')" />
      </v-col>
      <v-col cols="3">
        <datetime-picker v-model="competition.open_at" :label="$t('Open at')" />
      </v-col>
      <v-col cols="3">
        <datetime-picker v-model="competition.close_at" :label="$t('Close at')" />
      </v-col>
      <v-col cols="2">
        <v-checkbox v-model="competition.public" :label="$t('Public')" :hint="$t('Check to disclose this competition')" />
      </v-col>
    </v-row>

    <v-row v-for="match in competition.matches" :key="match.id">
      <v-card width="100%" class="ma-2">
        <v-card-title>
          {{ match.id >= 0 ? $t('Match ID: ') + match.id : $t('New Match: ') + (-match.id) }}
        </v-card-title>
        <v-container fluid>
          <v-row>
            <v-col cols="3">
              <v-text-field v-model="match.name" :label="$t('Name')" :hint="$t('2--32 characters')"
                :placeholder="$t('match1')" />
            </v-col>
            <v-col cols="3">
              <v-autocomplete v-model="match.problem_id" :items="problems" :label="$t('Problem')"
                :hint="$t('2--32 characters')" :placeholder="$t('problem1')" />
            </v-col>
            <v-col cols="3">
              <v-autocomplete v-model="match.indicator_id" :items="indicators" :label="$t('Indicator')"
                :hint="$t('2--32 characters')" :placeholder="$t('indicator1')" />
            </v-col>
            <v-col cols="1">
              <v-text-field v-model="match.budget" :label="$t('Budget')" :hint="$t('Positive integer')"
                :placeholder="$t('1000')" />
            </v-col>
            <v-col cols="1">
              <v-checkbox v-model="match.public" :label="$t('Public Leaderboard')"
                :hint="$t('Check to disclose the leaderboard of this match')" />
            </v-col>
            <v-col cols="1">
              <v-btn color="secondary" @click="removeMatch(match.id)">
                {{ $t('Delete') }}
              </v-btn>
            </v-col>
          </v-row>
          <v-row>
            <v-card outlined width="100%" class="ma-2">
              <v-card-title>
                {{ $t('Environments') }}
              </v-card-title>
              <v-container fluid>
                <v-row v-for="env in match.environments" :key="env.id">
                  <v-col cols="4">
                    <v-text-field v-model="env.key" :label="$t('Key')" :hint="$t('2--32 characters')"
                      :placeholder="$t('ENV_VAR')" />
                  </v-col>
                  <v-col cols="6">
                    <v-text-field v-model="env.value" :label="$t('Value')" :hint="$t('2--32 characters')"
                      :placeholder="$t('hoge')" />
                  </v-col>
                  <v-col cols="1">
                    <v-checkbox v-model="env.public" :label="$t('Public')"
                      :hint="$t('Check to disclose this variable')" />
                  </v-col>
                  <v-col cols="1">
                    <v-btn color="secondary" @click="removeEnvironment(match.id, env.id)">
                      {{ $t('Delete') }}
                    </v-btn>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col>
                    <v-btn @click="addEnvironment(match.id)">
                      {{ $t('Add environment') }}
                    </v-btn>
                  </v-col>
                </v-row>
              </v-container>
            </v-card>
          </v-row>
        </v-container>
      </v-card>
    </v-row>
    <v-row>
      <v-col>
        <v-btn @click="addMatch()">
          {{ $t('Add match') }}
        </v-btn>
      </v-col>
    </v-row>

    <client-only>
      <v-row>
        <v-col>
          <mavon-editor v-if="$i18n.locale === 'en'" v-model="competition.description_en" language="en"
            :box-shadow="false" :style="'z-index: ' + zIndex" :toolbars="markdownOption" @fullScreen="fullscreen" />
          <mavon-editor v-if="$i18n.locale === 'ja'" v-model="competition.description_ja" language="ja"
            :box-shadow="false" :style="'z-index: ' + zIndex" :toolbars="markdownOption" @fullScreen="fullscreen" />
        </v-col>
      </v-row>
    </client-only>

    <v-row>
      <v-col>
        <v-btn :loading="submitting" color="primary" @click="submit">{{ $t('Submit') }}</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import competition_en from '!raw-loader!~/content/competition_en.md'
import competition_ja from '!raw-loader!~/content/competition_ja.md'
import createCompetition from '~/apollo/mutations/createCompetition.gql'
import DatetimePicker from '~/components/DatetimePicker'
import getUser from '~/apollo/queries/getUser.gql'
import listCompetitions from '~/apollo/queries/listCompetitions.gql'
import listIndicators from '~/apollo/queries/listIndicators.gql'
import listProblems from '~/apollo/queries/listProblems.gql'

export default {
  components: {
    DatetimePicker,
  },
  data() {
    const now = this.$dayjs()
    return {
      competition: {
        id: 'eccomp2020',
        public: false,
        open_at: now.format('YYYY-MM-DD HH:mm'),
        close_at: now.add(1, 'day').format('YYYY-MM-DD HH:mm'),
        description_en: competition_en,
        description_ja: competition_ja,
        matches: [],
      },
      problems: [],
      indicators: [],
      nextMatchId: -1,  // Generates unique v-for keys by decrement since existing IDs in DB are positive
      nextEnvId: -1,  // Generates unique v-for keys by decrement since existing IDs in DB are positive
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
      const variables = {
        id: this.competition.id,
        public: this.competition.public,
        open_at: this.$dayjs(this.competition.open_at).format(
          'YYYY-MM-DD HH:mm:ssZ'
        ),
        close_at: this.$dayjs(this.competition.close_at).format(
          'YYYY-MM-DD HH:mm:ssZ'
        ),
        description_en: this.competition.description_en,
        description_ja: this.competition.description_ja,
        matches: {
          data: this.competition.matches.map(m => {
            return {
              name: m.name,
              budget: m.budget,
              problem_id: m.problem_id,
              indicator_id: m.indicator_id,
              public: m.public,
              environments: {
                data: m.environments.map(e => {
                  return {
                    key: e.key,
                    value: e.value,
                    public: e.public,
                  }
                })
              }
            }
          }),
        },
      }
      if (this.$auth.loggedIn && this.$auth.user['https://hasura.io/jwt/claims']['x-hasura-default-role'] === 'admin') {
        variables.owner_id = this.$auth.user['https://hasura.io/jwt/claims']['x-hasura-user-id']
      }
      await this.$apollo.mutate({
        mutation: createCompetition,
        variables: {
          competitions_insert_input: variables
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
    addMatch() {
      this.competition.matches.push({
        id: this.nextMatchId--,
        name: '',
        budget: '',
        problem_id: '',
        indicator_id: '',
        public: false,
        environments: [],
      })
    },
    removeMatch(id) {
      const matches = this.competition.matches.filter((match) => { return match.id !== id })
      this.competition.matches = matches
    },
    addEnvironment(matchId) {
      const match = this.competition.matches.find((match) => { return match.id == matchId })
      match.environments.push({
        match_id: matchId,
        id: this.nextEnvId--,
        key: '',
        value: '',
        public: false,
      })
    },
    removeEnvironment(matchId, envId) {
      const match = this.competition.matches.find((match) => { return match.id == matchId })
      const envs = match.environments.filter((env) => { return env.id !== envId })
      match.environments = envs
    },
  },
  head() {
    return {
      title: this.$t('New Competition'),
    }
  },
  apollo: {
    problems: {
      query: listProblems,
      update(data) {
        return data.problems.map(p => p.id).sort()
      }
    },
    indicators: {
      query: listIndicators,
      update(data) {
        return data.indicators.map(i => i.id).sort()
      }
    },
  },
}
</script>

<i18n lang="yaml">
ja:
  2--32 characters: 2~32文字
  Add environment: 環境変数を追加
  Add match: 競技を追加
  Budget: 評価回数
  Check to disclose the leaderboard of this match: チェックするとこの競技の順位表を公開します
  Check to disclose this competition: チェックするとこのコンペティションを公開します
  Check to disclose this variable: チェックするとこの変数を公開します
  Close at: 競技終了
  Delete: 削除
  Environments: 環境変数
  ID: ID
  Key: キー
  "Match ID: ": 競技ID：
  "New Match: ": 新規競技：
  Name: 名前
  New Competition: コンペティションを作成する
  Open at: 競技開始
  Positive integer: 正の整数
  Public: 公開
  Public Leaderboard: 順位表を公開
  Problem: 問題
  Indicator: 指標
  Submit: 送信
  Value: 値
</i18n>
