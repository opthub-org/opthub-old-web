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

    <div>
    <h2>match</h2>
    <v-flex md class="ma-auto">
      <v-layout row v-for="match in competition.matches" :key="match.id">
        <v-text-field
          v-model="match.id"
          :label="$t('match ID')"
          :hint="$t('positive integer')"
          :placeholder="$t('0')"
        />
        <v-text-field
          v-model="match.name"
          :label="$t('match name')"
          :hint="$t('2--32 characters')"
          :placeholder="$t('match1')"
        />
        <v-text-field
          v-model="match.budget"
          :label="$t('match budget')"
          :hint="$t('positive integer')"
          :placeholder="$t('1000')"
        />
        <v-text-field
          v-model="match.problem"
          :label="$t('match problem')"
          :hint="$t('2--32 characters')"
          :placeholder="$t('problem1')"
        />
        <v-text-field
          v-model="match.indicator"
          :label="$t('match indicator')"
          :hint="$t('2--32 characters')"
          :placeholder="$t('indicator1')"
        />
        
        <v-btn fab dark small color="red" @click="removeMatch(match.id)">
            <v-icon dark>remove</v-icon>
        </v-btn>

        <div>

        <v-flex md class="ma-auto">
        <v-layout row v-for="env in match.environments" :key="env.id">
          <v-text-field
            v-model="env.key"
            :label="$t('environment key')"
            :hint="$t('2-32 characters')"
            :placeholder="$t('environment key')"
          />
          <v-text-field
            v-model="env.value"
            :label="$t('environment value')"
            :hint="$t('2--32 characters')"
            :placeholder="$t('environment value')"
          />
          <v-checkbox
            v-model="env.public"
            :label="$t('public')"
            :hint="$t('boolean')"
          />
          
          <v-btn fab dark small color="red" @click="removeEnvironment(match.id, env.key)">
              <v-icon dark>remove</v-icon>
          </v-btn>      
        </v-layout>
        </v-flex>
        </div>
        <v-btn fab dark small color="blue" @click="addEnvironment(match.id)">
            <v-icon dark>add</v-icon>
        </v-btn>

      </v-layout>
      <v-btn fab dark small color="blue" @click="addMatch()">
          <v-icon dark>add</v-icon>
      </v-btn>
    </v-flex>
  </div>

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
      let matches = this.competition.matches
      matches.push({
        id: matches.length,
        name: '',
        budget: 0,
        problem: '',
        indicator: '',
        environments: []
      })
    },
    removeMatch (id) {
      let matches = this.competition.matches
      matches = matches.filter((match) => { return match.id !== id })
      let newMatches = []
      for (let i = 0; i < matches.length; i++) {
        let {id, ...matchProps} = matches[i]
        newMatches.push({
          id: i,
          ...matchProps
        })
      }
      this.competition.matches = newMatches
    },
    addEnvironment (id) {
      let match = this.competition.matches.find((match) => {return match.id == id})
      let envs = match.environments
      envs.push({
        id: envs.length,
        key: '',
        value: '',
        public: false
      })
    },
    removeEnvironment (matchId, envId) {
      let match = this.competition.matches.find((match) => {return match.id == matchId})
      let envs = match.environments.filter((env) => { return env.id !== envId })
      let newEnvs = []
      for (let i = 0; i < envs.length; i++) {
        let {id, ...envProps} = envs[i]
        newEnvs.push({
          id: i,
          ...envProps
        })
      }
      match.environments = newEnvs
    }
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
  2--32 characters: 2~32文字
  Close at: 競技終了
  Edit Competition: コンペティションを編集する
  ID: ID
  Open at: 競技開始
  Public: 公開
  Private: 非公開
  Submit: 送信
</i18n>
