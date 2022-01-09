<template>
  <v-layout>
    <v-flex class="text-center">
      <img src="/v.png" alt="Vuetify.js" class="mb-5" />
      <v-alert type="warning">{{ $t('stay-tuned') }}</v-alert>
    </v-flex>
  </v-layout>
</template>

<i18n lang="yaml">
en:
  stay-tuned: User-organized competitions will be released after EC-Comp 2020. Stay tuned!
ja:
  stay-tuned: 一般ユーザによるコンペティションの開催機能は，進化計算コンペティション2020の終了後に開放される予定です．ご期待ください．
</i18n>

<script>
export default {
  auth: false,
}
</script>
