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
import createCompetition from '~/apollo/mutations/createCompetition.gql'
import DatetimePicker from '~/components/DatetimePicker'
import dayjs from 'dayjs'
import getUser from '~/apollo/queries/getUser.gql'
import listCompetitions from '~/apollo/queries/listCompetitions.gql'
import listIndicators from '~/apollo/queries/listIndicators.gql'
import listProblems from '~/apollo/queries/listProblems.gql'

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


## Competition Overview

Explain the competition here.


### Single-Objective Track

Explain matches and overall ranking method here.


### Multi-Objective Track

Explain matches and overall ranking method here.

---

## References

References go here.
`,
        description_ja: `\
# 進化計算コンペティション2020

これはテンプレートです．

**お知らせ**
- **2021年10月21日12時00分:** Webサイトを公開しました！

<!--
## 結果発表

- 単目的部門
  - トップ賞：<a href="/ja/users/USER">USER</a>
  - 準トップ賞：<a href="/ja/users/USER">USER</a>
  - 産業応用特別賞：<a href="/ja/users/USER">USER</a>
- 多目的部門
  - トップ賞：<a href="/ja/users/USER">USER</a>
  - 準トップ賞：<a href="/ja/users/USER">USER</a>
  - 産業応用特別賞：<a href="/ja/users/USER">USER</a>

<a href="">結果発表スライド</a>
-->

## コンペティション開催の趣旨<span id="purpose" class="mt-n12 pt-12" />

進化計算コンペティションは，進化計算の実応用と産学交流を促進するために，2017年に始まった最適化コンペティションです．過去4年のコンペティションでは，製造業・航空宇宙・ゲーム分野における最適化問題を出題してきました．
- [2017年：複数車種の同時設計](http://is-csse-muroran.sakura.ne.jp/ec2017/EC2017compe.html)
- [2018年：月着陸地点の選定](http://www.jpnsec.org/files/competition2018/EC-Symposium-2018-Competition.html)
- [2019年：発電用風車の設計](http://www.jpnsec.org/files/competition2019/EC-Symposium-2019-Competition.html)
- [2020年：ゲーム用乱数の設計](http://ec-comp.jpnsec.org/ja/competitions/eccomp2020)

今回は～～～～を出題します．

## スケジュール<span id="schedule" class="mt-n12 pt-12" />

|イベント|日時|アナウンス|
|-|-|-|
|Webサイト公開|2021年10月21日（木）12:00|本ページ|
|チュートリアル問題公開|2021年10月26日（火）21:00|[こちら](/ja/competitions/tutorial)|
|競技開始|2021年10月26日（火）21:00|本ページ，進化計算学会ML|
|競技終了|2021年12月18日（土）23:59|本ページ|
|結果発表|2021年12月25日（土）午前|[進化計算シンポジウム2021](http://www.jpnsec.org/symposium202103.html)（oVice開催）|

結果発表に参加するためには，進化計算シンポジウム2021へのお申込みが必要です．詳しくは[進化計算シンポジウム2021のページ](http://www.jpnsec.org/symposium202103.html)をご覧ください．


## 参加方法<span id="participation" class="mt-n12 pt-12" />

どなたでも無料で参加できます．

[こちらのチュートリアル](/ja/competitions/tutorial)にしたがって，**所属組織のメールアドレス**でアカウントを作成してください．

==**昨年のコンペに参加された方へ**==
昨年に作成したアカウントは引き続きお使いいただけます．クライアントツールを最新版に更新してプレイしていただきますようお願いいたします．

コンペティションは単目的部門と多目的部門に別れており，各アカウントはいずれか一方または両方の部門に参加することができます．それぞれの部門には，問題を解くことで参加したとみなされます．1つの部門は複数の問題からなり，参加した部門のすべての問題を解く必要があります．

1人で参加することも，複数人が1チームとして参加することもできます．1チームの人数に制限はありません．チームで参加する場合は，代表者を1人決めて代表者がアカウントを作成してください．１人の参加者が複数のチームに所属することはできません．ただし指導教員は[禁止事項](#prohibitions)に違反しない範囲で複数のチームにアドバイスできます．[Q&Aもご覧ください](#q4)．


## 禁止事項<span id="prohibitions" class="mt-n12 pt-12" />

以下に違反した場合は失格となります．

- 1人で複数のアカウントを作成してはいけません．
- アカウントおよびアクセストークンを他人に譲渡してはいけません．
- 競技期間中は，サーバに送受信したデータおよびその派生物（データを使って構築した応答曲面やソルバプログラム等）をチームメンバー以外の人に教えてはいけません．また，SNS等の不特定多数が閲覧できる場所に公開してはいけません．
- コンペティションに関するソフトウェアをリバースエンジニアリングしてはいけません．
- 悪意をもってコンペティションサーバを停止または不安定化する行為をしてはいけません．


## 結果発表について<span id="announcement" class="mt-n12 pt-12" />

### 12月25日のプログラム（暫定）
| 時間 | 内容 | 発表者 |
|-|-|-|
| 09:00--09:05 | 開催趣旨の説明 | 進化 花子（X株式会社）|
| 09:05--09:20 | コンペ問題の説明 | 進化 太郎（Y大学）|
| 09:20--11:30 | 参加者からのプレゼン（1件5分）| 各参加者 |
| 11:30--12:00 | 結果の総括およびディスカッション | 進化 花子（X株式会社）|


### 表彰<span id="awards" class="mt-n12 pt-12" />

単目的部門・多目的部門のそれぞれに複数の賞を用意します．受賞者には進化計算学会から表彰がございます．詳しくは後日発表いたします．


### 参加者へのお願い<span id="notice" class="mt-n12 pt-12" />

- 参加者には，結果発表においてプレゼンテーション（発表5分，質疑なし）をお願いします．以下の点について説明してください．スライドは12月23日までに[お問合せ先](#contact)にご提出ください．
    - 利用したアルゴリズムの説明
    - 工夫した点
    - 結果
- 「結果の総括」において，皆さまから提出していただいたデータの比較を行いますのでご了承ください．
- 実問題の研究を促進するために，皆さまから提出していただいたデータは後日コンペサーバ上で公開させていただきます．特にご希望がなければ，データの所有権はデータを送信したアカウントの所有者に帰属するものとし，ライセンスは[クリエイティブコモンズ 表示 - 継承 3.0](https://creativecommons.org/licenses/by-sa/3.0/deed.ja)とさせていただきます．これは，誰もが皆さまのデータを利用して研究を行ったり，論文を執筆したりできることを意味します（データを利用した論文には皆さまの名前が記載されます）．データの非公開や異なるライセンスをご希望でしたらお知らせください．

---

## コンペティションの概要<span id="summary" class="mt-n12 pt-12" />

出題内容について概要を説明します．問題と指標の詳細はここには記載せず，問題と指標の説明欄に記載してください．


### 単目的部門<span id="sop" class="mt-n12 pt-12" />

単目的部門の競技と総合順位の決め方について説明します．


### 多目的部門<span id="mop" class="mt-n12 pt-12" />

多目的部門の競技と総合順位の決め方について説明します．


---

## Q & A<span id="qa" class="mt-n12 pt-12" />

### Q1. 進化計算を使って解かなければいけませんか？<span id="q1" class="mt-n12 pt-12" />

**A.** どんな方法で解いても構いません．人力でいくつか解を送って様子をみたり，応答曲面を構築したり，途中でソルバーを打ち切って再スタートすることもできます．ホワイトボックスな関数については，ローカルでプログラムを組んで好きなだけ評価しても構いません．要するに，禁止事項に抵触しない限りは何でもアリです．もし判断に迷うことがあれば，[お問合せ先](#contact)までご質問ください．


### Q2. 間違って解データを送信してしまいました．やり直せますか？<span id="q2" class="mt-n12 pt-12" />

**A.** 今年のコンペは一定の評価回数で競うため，一度送信したデータを取り消すことはできません．<a href="#matches">デモ問題</a>で十分にテストしてから本番の問題を解くようにしてください．


### Q3. 問題を解いている最中にソルバープログラム（またはコンペサーバ）が落ちました．途中から再開できますか？<span id="q3" class="mt-n12 pt-12" />

**A.** 一度送信したデータはサーバに記録されており，\`opt list solutions\`コマンドで取得できます．しかし，ソルバーを同じ状態から再開するためには，ソルバーの状態変数や乱数種なども復元する必要があるはずです．これらはご自身で定期的にファイルに保存するなどして，突然のトラブルに備えてください．


### Q4. コンペ運営に関わっている教員とその学生はコンペに参加できますか？<span id="q4" class="mt-n12 pt-12" />

**A.** 参加できます．代表幹事以外の委員は，問題を解くうえで有利になるようなインサイダー情報は知ることができません．そのため，運営に関わる教員やその学生であっても，一般参加者と同じ公平な条件で参加できます．


### Q5. うちの研究室からは複数のチームが参加します．教員はすべてのチームに参加したいのですが？<span id="q5" class="mt-n12 pt-12" />

**A.** 教員は指導目的で複数のチームにアドバイスできるものとします．ただし，お互いのチームのデータを教えないようにしてください．アドバイスの内容も，個々のチームのデータだけから分かることに限定してください．


### Q6. アカウントを削除できますか？<span id="q6" class="mt-n12 pt-12" />

**A.** 競技期間終了後に削除できます．[お問合せ先](#contact)までご連絡ください．なお，アカウントを削除すると，そのアカウントで送信したデータも削除されます．


### Q7. 解は並列に送信できますか？<span id="q7" class="mt-n12 pt-12" />

**A.** 複数の問題に同時に解を送信することもできますし，同じ問題に複数の解を同時に送信することもできます．並列数に上限はありません．解はサーバに登録された順番に評価されます．解を並列に送信するには，以下のような方法があります．
- 複数の端末を起動してそれぞれで\`opt submit\`コマンドを実行する．
- 1つの端末で複数の\`opt submit\`コマンドをバックグラウンド実行する．
- \`opt submit\`コマンドに\`--no-wait\`オプションを指定する．この場合，サーバでの評価・採点を待たずにコマンドが終了します．評価・採点の結果を取得するには，しばらく待ってから以下のコマンドを実行します．
\`\`\`
opt list solutions --query "_and: [{match_id: {_eq: MATCH}}, {owner: {name: {_eq: USER}}}]"
\`\`\`
ここで\`MATCH\`には競技IDを，\`USER\`にはあなたのユーザ名を入力します.


### Q8. シード集合を変えてもシミュレーション結果 (得られる目的関数値) にばらつきはほとんどないようです．コンペティション本番にてこの性質を利用しても良いでしょうか？<span id="q8" class="mt-n12 pt-12" />

**A.** 利用しても問題ありません．例えば，ローカル環境で得られた良い解集合を進化アルゴリズムの初期集団とするwarm start戦略を採用されても，問題ありません．


### Q9. 設計変数paymentの探索範囲に上限は設定されているのでしょうか？<span id="q9" class="mt-n12 pt-12" />

**A.** 探索範囲の上限は設定していません．どんな値でも与えることができますが，あまり大きな値を与えると施策予算オーバーで実行不可能解になります．この場合，実行不可能でも評価回数は消費されますのでご注意ください．評価回数を消費するかしないかの基準は以下のようになっています．
- シミュレーションが走らない限り，評価回数は消費しない（解のフォーマットエラー，サーバタイムアウトなど）
- シミュレータが走ったら，その結果によらず評価回数を消費する（実行不可能解や過去と同じ解でも消費する）


## お問合せ先<span id="contact" class="mt-n12 pt-12" />

進化計算学会 実世界ベンチマーク問題分科会
<a href="mailto:sig-rbp@googlegroups.com">sig-rbp@googlegroups.com</a>

---

## 参考文献

ここに参考文献を記述してください．
`,
        matches: [],
      },
      problems: [],
      indicators: [],
      nextId: -1,  // Generates unique v-for keys by decrement since existing IDs in DB are positive
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
          competitions_insert_input: {
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
            matches: {
              data: this.competition.matches.map(m => { return {
                name: m.name,
                budget: m.budget,
                problem_id: m.problem_id,
                indicator_id: m.indicator_id,
                environments: {
                  data: m.environments.map(e => { return {
                    key: e.key,
                    value: e.value,
                    public: e.public,
                  }})
                }
              }}),
            },
          },
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
    addMatch () {
      this.competition.matches.push({
        id: this.nextId--,
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
    },
    addEnvironment (matchId) {
      const match = this.competition.matches.find((match) => { return match.id == matchId })
      match.environments.push({
        match_id: matchId,
        id: this.nextId--,
        key: '',
        value: '',
        public: false
      })
    },
    removeEnvironment (matchId, envId) {
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
  Problem: 問題
  Indicator: 指標
  Submit: 送信
  Value: 値
</i18n>
