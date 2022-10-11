<template>
  <v-container fluid>
    <v-row>
      <v-toolbar color="white" flat>
        <v-toolbar-title class="headline">{{
          $t('Edit Competition')
        }}</v-toolbar-title>
      </v-toolbar>
    </v-row>
    <v-row>
      <v-col cols="4">
        <v-text-field
          v-model="competition.id"
          :label="$t('ID')"
          :hint="$t('2--32 characters')"
          :placeholder="$t('eccomp2020')"
        />
      </v-col>
      <v-col cols="3">
        <datetime-picker v-model="competition.open_at" :label="$t('Open at')" />
      </v-col>
      <v-col cols="3">
        <datetime-picker v-model="competition.close_at" :label="$t('Close at')" />
      </v-col>
      <v-col cols="2">
        <v-checkbox
          v-model="competition.public"
          :label="$t('Public')"
          :hint="$t('Check to disclose this competition')"
        />
      </v-col>
    </v-row>
    <client-only>
      <v-row>
        <v-col>
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
        </v-col>
      </v-row>
    </client-only>

    <v-row v-for="match in competition.matches" :key="match.id">
      <v-card width="100%" class="ma-2">
        <v-card-title>
          {{ match.id >= 0 ? $t('Match ID: ') + match.id : $t('New Match: ') + (-match.id) }}
        </v-card-title>
        <v-container fluid>
          <v-row>
            <v-col cols="3">
              <v-text-field
                v-model="match.name"
                :label="$t('Name')"
                :hint="$t('2--32 characters')"
                :placeholder="$t('match1')"
              />
            </v-col>
            <v-col cols="3">
              <v-autocomplete
                v-model="match.problem_id"
                :items="problems"
                :label="$t('Problem')"
                :hint="$t('2--32 characters')"
                :placeholder="$t('problem1')"
              />
            </v-col>
            <v-col cols="3">
              <v-autocomplete
                v-model="match.indicator_id"
                :items="indicators"
                :label="$t('Indicator')"
                :hint="$t('2--32 characters')"
                :placeholder="$t('indicator1')"
              />
            </v-col>
            <v-col cols="2">
              <v-text-field
                v-model="match.budget"
                :label="$t('Budget')"
                :hint="$t('Positive integer')"
                :placeholder="$t('1000')"
              />
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
                    <v-text-field
                      v-model="env.key"
                      :label="$t('Key')"
                      :hint="$t('2--32 characters')"
                      :placeholder="$t('ENV_VAR')"
                    />
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      v-model="env.value"
                      :label="$t('Value')"
                      :hint="$t('2--32 characters')"
                      :placeholder="$t('hoge')"
                    />
                  </v-col>
                  <v-col cols="1">
                    <v-checkbox
                      v-model="env.public"
                      :label="$t('Public')"
                      :hint="$t('Check to disclose this variable')"
                    />
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
    <v-row>
      <v-col>
        <v-btn :loading="submitting" color="primary" @click="submit">{{ $t('Submit') }}</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import DatetimePicker from '~/components/DatetimePicker'
import dayjs from 'dayjs'
import getCompetition from '~/apollo/queries/getCompetition.gql'
import getUser from '~/apollo/queries/getUser.gql'
import listCompetitions from '~/apollo/queries/listCompetitions.gql'
import listIndicators from '~/apollo/queries/listIndicators.gql'
import listProblems from '~/apollo/queries/listProblems.gql'
import updateCompetition from '~/apollo/mutations/updateCompetition.gql'

export default {
  components: {
    DatetimePicker,
  },
  data() {
    return {
      competition: {},
      problems: [],
      indicators: [],
      matches_delete: [],
      environments_delete: [],
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
      await this.$apollo.mutate({
        mutation: updateCompetition,
        variables: {
          competitions_pk_columns: { id: this.$route.params.id },
          competitions_set: {
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

          // delete existing matches as well as its environments and solutions
          matches_delete: this.matches_delete.filter(id => id >= 0),

          // update existing matches without environments
          matches_updates: this.competition.matches.filter(m => m.id >= 0).map(m => { return {
            where: { id: { _eq: m.id } },
            _set: {
              name: m.name,
              budget: m.budget,
              problem_id: m.problem_id,
              indicator_id: m.indicator_id,
            },
          }}),

          // insert new matches with new environments
          matches_insert: this.competition.matches.filter(m => m.id < 0).map(m => { return {
            competition_id: this.competition.id,
            name: m.name,
            budget: m.budget,
            problem_id: m.problem_id,
            indicator_id: m.indicator_id,
            environments: {
              data: m.environments.map(e => { return {
                public: e.public,
                key: e.key,
                value: e.value,
              }}),
            },
          }}),

          // delete existing environments of existing matches
          environments_delete: this.environments_delete.filter(id => id >= 0),

          // update existing environments of existing matches
          environments_updates: this.competition.matches.flatMap(m => m.environments).filter(e => e.id >= 0).map(e => { return {
            where: { id: { _eq: e.id } },
            _set: {
              public: e.public,
              key: e.key,
              value: e.value,
            },
          }}),

          // insert new environments of existing matches
          environments_insert: this.competition.matches.filter(m => m.id >= 0).flatMap(m => m.environments).filter(e => e.id < 0).map(e => { return {
            match_id: e.match_id,
            public: e.public,
            key: e.key,
            value: e.value,
          }}),
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
    addMatch () {
      this.competition.matches.push({
        id: this.nextMatchId--,
        name: '',
        budget: '',
        problem_id: '',
        indicator_id: '',
        environments: []
      })
    },
    removeMatch (id) {
      const matches = this.competition.matches.filter((match) => { return match.id !== id })
      this.competition.matches = matches
      if (id >= 0) {
        this.matches_delete.push(id)
      }
    },
    addEnvironment (matchId) {
      const match = this.competition.matches.find((match) => { return match.id == matchId })
      match.environments.push({
        match_id: matchId,
        id: this.nextEnvId--,
        key: '',
        value: '',
        public: false
      })
    },
    removeEnvironment (matchId, envId) {
      const match = this.competition.matches.find((match) => { return match.id == matchId })
      const envs = match.environments.filter((env) => { return env.id !== envId })
      match.environments = envs
      if (envId >= 0) {
        this.environments_delete.push(envId)
      }
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
  Check to disclose this competition: チェックするとこのコンペティションを公開します
  Check to disclose this variable: チェックするとこの変数を公開します
  Close at: 競技終了
  Delete: 削除
  Edit Competition: コンペティションを編集する
  Environments: 環境変数
  ID: ID
  Key: キー
  "Match ID: ": 競技ID：
  "New Match: ": 新規競技：
  Name: 名前
  Open at: 競技開始
  Positive integer: 正の整数
  Public: 公開
  Problem: 問題
  Indicator: 指標
  Submit: 送信
  Value: 値
</i18n>
