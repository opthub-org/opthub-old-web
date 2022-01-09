<template>
  <p>{{ $t('Logging in...') }}</p>
</template>

<script>
export default {
  auth: false,
  mounted() {
    const token = this.$auth.getToken('auth0')
    if (token) {
      this.$apolloHelpers.onLogin(token.split(' ')[1])
    }
  },
  head() {
    return {
      title: this.$t('Logging in...'),
    }
  },
}
</script>

<i18n lang="yaml">
ja:
  Logging in...: ログイン中…
</i18n>
