<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm8 md6>
      <div class="text-center">
        <logo />
      </div>
      <v-card class="my-2">
        <v-card-title class="headline">
          {{ $t('Welcome to EC Competition') }}
        </v-card-title>
        <v-card-text>
          <p v-html="$t('text-par1', url)" />
          <p v-html="$t('text-par2')" />
        </v-card-text>
      </v-card>
      <v-card class="my-2">
        <v-card-title>
          {{ $t('How to play a competition') }}
        </v-card-title>
        <v-card-text>
          <p>{{ $t('text-play') }}</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            nuxt
            :to="localePath('/competitions/tutorial')"
          >
            {{ $t('Get Started') }}
          </v-btn>
        </v-card-actions>
      </v-card>
      <v-card class="my-2">
        <v-card-title>
          {{ $t('How to organize a competition') }}
        </v-card-title>
        <v-card-text>
          <p>{{ $t('text-organize') }}</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" nuxt :to="localePath('/organize')">
            {{ $t('Get Started') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import Logo from '~/components/Logo.vue'

export default {
  auth: false,
  components: {
    Logo,
  },
  data() {
    return {
      url: {
        sigrbp: 'http://www.jpnsec.org/sig.html',
        ecsymp: 'http://www.jpnsec.org/symposium202003.html',
      },
    }
  },
  head() {
    return {
      title: this.$t('Welcome to EC Competition'),
      meta: [
        {
          hid: 'og:title',
          property: 'og:title',
          content: this.$t('Welcome to EC Competition'),
        },
        {
          hid: 'og:description',
          property: 'og:description',
          content: this.$t('text-description'),
        },
      ],
    }
  },
}
</script>

<i18n lang="yaml">
en:
  text-par1: Evolutionary Computation Competition (EC-Comp) is an optimization competition held by <a href="{sigrbp}">Special Interest Group of Real-world Benchmark Problems, Japan Society for Evolutionary Computation (JPNSEC SIG-RBP)</a>. Since 2017, the competition is held between September and November every year. During the competition period, participants are given a set of optimization problems and compete to find the best solution to each of the problems. The winners are announced and awarded in <a href="{ecsymp}">Evolutionary Computation Symposium</a> held in mid December.
  text-par2: Optimization problems asked in this competition are adopted from real-world industry or sciense. Through the competition, we expect researchers and practitioners exchange their insights, promoting academic research and industrial applications of evolutionary computation.
  text-play: Anyone can play a competition. Try a 30-minute tutorial to learn how to play.
  text-organize: Anyone can organize their own competition. Let's sign in and create a new competition.
  text-description: Evolutionary Computation Competition (EC-Comp) is an optimization competition held by Special Interest Group of Real-world Benchmark Problems, Japan Society for Evolutionary Computation (JPNSEC SIG-RBP).
ja:
  text-par1: 進化計算コンペティションは，<a href="{sigrbp}">進化計算学会 実世界ベンチマーク問題分科会</a>が開催する最適化コンペティションです．与えられた最適化問題に対して，誰が最も優れた近似最適解を見つけられるかを競います．2017年に始まり，毎年9月～11月に開催されます．競技の結果は12月の<a href="{ecsymp}">進化計算シンポジウム</a>で発表します．
  text-par2: 本コンペティションの最大の特徴は，産業や科学の現場で現れるリアルな最適化問題が出題されることです．例年，企業や研究機関などで実際に使われている最適化問題を募集し，出題しています．最適化は社会の様々な場面で使われていますが，そのような事例が公開されることはなかなかありません．本コンペティションを通して実社会で現れる最適化問題に関する知見を収集・共有することにより，最適化の産業応用と学術研究を促進します．
  text-play: コンペにはどなたでも参加することができます．ユーザ登録して，コンペ用ツールをセットアップしましょう．チュートリアルをプレイすれば，30分で遊び方がわかります．
  text-organize: どなたでも開催することができます．ユーザ登録して，コンペを登録します．
  text-description: 進化計算コンペティションは，進化計算学会 実世界ベンチマーク問題分科会が開催する最適化コンペティションです．
  Welcome to EC Competition: 進化計算コンペティションへようこそ
  How to play a competition: コンペに参加したい！
  How to organize a competition: コンペを開催したい！
  Get Started: スタート
</i18n>
