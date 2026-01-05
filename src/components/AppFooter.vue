<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="app-footer">
    <div class="footer-bg-text">SHARD</div>
    <div class="footer-content">
      <div class="f-left">
        <div class="brand-info">
          <img src="/logo.png" alt="ShardLauncher" class="footer-logo">
          <h2>ShardLauncher</h2>
        </div>
        <p class="brand-desc">{{ t('hero.desc') }}</p>
        <div class="socials">
          <a href="https://github.com/ShardLauncher/ShardLauncher" target="_blank" title="GitHub"><i class="ri-github-line"></i></a>
          <a href="#" title="Twitter"><i class="ri-twitter-x-line"></i></a>
          <a href="#" title="Discord"><i class="ri-discord-line"></i></a>
        </div>
      </div>
      
      <div class="f-right">
        <div class="f-col">
          <h4>{{ t('footer.product') }}</h4>
          <router-link to="/">{{ t('footer.features') }}</router-link>
          <router-link to="/download">{{ t('footer.download') }}</router-link>
          <router-link :to="`/docs/${locale}/index`">{{ t('footer.docs') }}</router-link>
          <a href="https://github.com/ShardLauncher/ShardLauncher/releases" target="_blank">{{ t('footer.changelog') }}</a>
        </div>
        <div class="f-col">
          <h4>{{ t('footer.legal') }}</h4>
          <a href="#">{{ t('footer.privacy') }}</a>
          <a href="#">{{ t('footer.terms') }}</a>
          <a href="https://github.com/ShardLauncher/ShardLauncher/blob/master/LICENSE" target="_blank">{{ t('footer.license') }}</a>
        </div>
      </div>
    </div>
    
    <div class="copyright">
      {{ t('footer.copyright', { year: currentYear }) }}
    </div>
  </footer>
</template>


