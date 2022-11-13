// import colors from 'vuetify/es5/util/colors'

export default {
  /*
   ** Headers of the page
   ** See https://nuxtjs.org/api/configuration-head
   */
  head: {
    titleTemplate: '%s - ' + process.env.npm_package_name,
    title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: process.env.npm_package_description || '',
      },
      { hid: 'og:site_name', property: 'og:site_name', content: 'EC-Comp' },
      { hid: 'og:type', property: 'og:type', content: 'website' },
      {
        hid: 'og:url',
        property: 'og:url',
        content: 'https://ec-comp.jpnsec.org/',
      },
      { hid: 'og:title', property: 'og:title', content: 'EC-Comp' },
      {
        hid: 'og:description',
        property: 'og:description',
        content:
          'This is a website for Evolutionary Computation Competition (EC-Comp).',
      },
      {
        hid: 'og:image',
        property: 'og:image',
        content: 'https://ec-comp.jpnsec.org/icon.png',
      },
      { name: 'twitter:card', content: 'summary' },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
  },
  /*
   ** Global CSS
   */
  css: [],
  /*
   ** Plugins to load before mounting the App
   ** https://nuxtjs.org/guide/plugins
   */
  plugins: [
    { src: '@/plugins/mavon-editor', mode: 'client' },
    { src: '@/plugins/chart', mode: 'client' },
  ],
  /*
   ** Auto import components
   ** See https://nuxtjs.org/api/configuration-components
   */
  components: true,
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: [
    '@nuxtjs/stylelint-module',
    '@nuxtjs/vuetify',
    '@nuxt/postcss8',
  ],
  /*
   ** Nuxt.js modules
   */
  modules: [
    'nuxt-helmet',
    '@nuxtjs/axios',
    '@nuxtjs/apollo',
    '@nuxtjs/auth',
    '@nuxtjs/dayjs',
    '@nuxtjs/i18n',
    '@nuxtjs/markdownit',
    '@nuxtjs/pwa',
  ],
  helmet: {},
  apollo: {
    clientConfigs: {
      default: {
        httpEndpoint: 'https://opthub-api.herokuapp.com/v1/graphql',
      },
    },
    cookieAttributes: {
      maxAge: 60 * 60 * 2,
      sameSite: 'lax',
      secure: true,
    },
  },
  auth: {
    cookie: {
      options: {
        sameSite: 'lax',
        secure: true,
      },
    },
    strategies: {
      auth0: {
        domain: 'opthub.us.auth0.com',
        client_id: 'YUUNMGWilBChhAqT8TYjHf8eom7FHIvB',
        audience: 'https://opthub-api.herokuapp.com/v1/graphql',
        scope: ['openid', 'profile', 'email', 'offline_access'],
        responseType: 'code',
        grantType: 'authorization_code',
        codeChallengeMethod: 'S256',
      },
    },
    redirect: {
      login: '/',
      logout: '/',
      callback: '/callback',
      home: '/',
    },
    resetOnError: true, // Logout when JWT expired
  },
  /*
   ** Axios module configuration
   ** See https://axios.nuxtjs.org/options
   */
  axios: {},
  dayjs: {
    locales: ['en', 'ja'],
    defaultLocale: 'en',
    defaultTimeZone: 'Asia/Tokyo',
    plugins: [
      'utc', // import 'dayjs/plugin/utc'
      'timezone', // import 'dayjs/plugin/timezone'
      'relativeTime', // import 'dayjs/plugin/relativeTimezone'
      'localizedFormat', // import 'dayjs/plugin/localizedFormat'
    ], // Your Day.js plugin
  },
  i18n: {
    locales: [
      { code: 'ja', iso: 'ja-JP' },
      { code: 'en', iso: 'en-US' },
    ],
    defaultLocale: 'en',
    detectBrowserLanguage: {
      fallbackLocale: 'en',
      onlyOnRoot: true,
      cookieSecure: true,
    },
    seo: true,
    strategy: 'prefix_and_default',
    lazy: false,
    vueI18nLoader: true,
    vueI18n: {
      fallbackLocale: 'en',
      silentTranslationWarn: true,
      silentFallbackWarn: true,
    },
  },
  /*
   ** Markdownit module configuration
   ** See https://markdownit.nuxtjs.org/configuration
   */
  markdownit: {
    injected: true,
    linkify: true,
  },
  /*
   ** vuetify module configuration
   ** https://github.com/nuxt-community/vuetify-module
   */
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    theme: {
      dark: false,
      /*
      themes: {
        dark: {
          primary: colors.blue.darken2,
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3,
        },
      },
      */
    },
  },
  /*
   ** Enable auth middleware globally
   ** https://auth.nuxtjs.org/guide/middleware.html
   */
  router: {
    middleware: ['auth'],
  },
  /*
   ** Build configuration
   ** See https://nuxtjs.org/api/configuration-build/
   */
  build: {},
  serverMiddleware: ['~/middleware/response-header.js'],
}
