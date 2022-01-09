<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" clipped app>
      <v-list>
        <v-list-item
          v-for="(item, i) in items"
          :key="i"
          :to="localePath(item.to)"
          router
          exact
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="$t(item.title)" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar clipped-left dense app>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title v-text="$t(title)" />
      <v-spacer />
      <v-btn
        class="mx-1"
        small
        text
        outlined
        rounded
        :disabled="$i18n.locale === 'en'"
        nuxt
        :to="switchLocalePath('en')"
        >English</v-btn
      >
      <v-btn
        class="mx-1"
        small
        text
        outlined
        rounded
        :disabled="$i18n.locale === 'ja'"
        nuxt
        :to="switchLocalePath('ja')"
        >日本語</v-btn
      >
      <v-spacer />
      <v-btn v-if="!$auth.loggedIn" color="primary" @click="login">
        {{ $t('Login') }}
      </v-btn>
      <v-menu v-else offset-y>
        <template v-slot:activator="{ on, attrs }">
          <v-btn small icon v-bind="attrs" v-on="on">
            <v-avatar>
              <img
                :src="$auth.user.picture"
                :alt="
                  $auth.user['https://hasura.io/jwt/claims'][
                    'x-hasura-username'
                  ]
                "
              />
            </v-avatar>
          </v-btn>
        </template>
        <v-list rounded>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title
                class="title"
                v-text="
                  $auth.user['https://hasura.io/jwt/claims'][
                    'x-hasura-username'
                  ]
                "
              />
              <v-list-item-subtitle v-text="$auth.user.email" />
            </v-list-item-content>
          </v-list-item>
          <v-divider />
          <v-list-item
            :to="
              localePath(
                '/users/' +
                  $auth.user['https://hasura.io/jwt/claims'][
                    'x-hasura-username'
                  ]
              )
            "
          >
            <v-list-item-content>
              <v-list-item-title v-text="$t('Profile')" />
            </v-list-item-content>
          </v-list-item>
          <v-list-item @click="logout">
            <v-list-item-content v-text="$t('Logout')" />
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>
    <v-main>
      <v-container>
        <nuxt />
      </v-container>
    </v-main>
    <v-footer absolute app>
      <span>
        &copy; {{ new Date().getFullYear() }}
        <a href="http://www.jpnsec.org/sig.html">{{ $t('SIG-RBP members') }}</a>
      </span>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  data() {
    return {
      drawer: true,
      items: [
        {
          icon: 'mdi-apps',
          title: 'Welcome',
          to: '/',
        },
        {
          icon: 'mdi-account',
          title: 'Users',
          to: '/users',
        },
        {
          icon: 'mdi-gamepad-variant',
          title: 'Competitions',
          to: '/competitions',
        },
        {
          icon: 'mdi-function-variant',
          title: 'Problems',
          to: '/problems',
        },
        {
          icon: 'mdi-chart-bar',
          title: 'Indicators',
          to: '/indicators',
        },
      ],
      miniVariant: false,
      rightDrawer: false,
      title: 'EC-Comp',
    }
  },
  methods: {
    login() {
      this.$auth.$storage.setUniversal('redirect', this.$route.path)
      this.$auth.loginWith('auth0')
    },
    async logout() {
      this.$auth.logout()
      await this.$apolloHelpers.onLogout()
    },
  },
}
</script>

<i18n lang="yaml">
ja:
  EC-Comp: 進化計算コンペティション
  Welcome: ようこそ
  Users: ユーザー
  Competitions: コンペティション
  Problems: 問題
  Indicators: 指標
  Login: ログイン
  Logout: ログアウト
  Profile: プロフィール
  SIG-RBP members: 実世界ベンチマーク問題分科会
</i18n>
