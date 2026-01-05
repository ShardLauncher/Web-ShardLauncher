<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
const scrolled = ref(false)
const theme = ref(localStorage.getItem('theme') || 'dark')
const lang = ref(locale.value)
const langOpen = ref(false)
const menuOpen = ref(false)

const router = useRouter()

const handleScroll = () => {
  scrolled.value = window.scrollY > 50
}

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
  if (menuOpen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

const closeMenu = () => {
  menuOpen.value = false
  document.body.style.overflow = ''
}

const toggleTheme = () => {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  document.documentElement.setAttribute('data-theme', theme.value)
  localStorage.setItem('theme', theme.value)
}

const setLang = (l: string) => {
  lang.value = l
  locale.value = l
  localStorage.setItem('lang', l)
  langOpen.value = false
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  document.documentElement.setAttribute('data-theme', theme.value)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <nav class="main-nav" :class="{ 'scrolled': scrolled, 'menu-open': menuOpen }">
    <router-link to="/" class="brand" @click="closeMenu">
      <img src="/logo.png" alt="ShardLauncher">
      <span>ShardLauncher</span>
    </router-link>

    <div class="nav-tools">
      <router-link :to="`/docs/${lang}/index`" class="docs-btn hide-mobile">
        <i class="ri-book-read-line"></i>
        <span>{{ $t('nav.docs') }}</span>
      </router-link>

      <div class="custom-select-wrapper hide-mobile" :class="{ 'open': langOpen }">
        <div class="custom-select-trigger" @click="langOpen = !langOpen">
          <span class="custom-select-label">{{ lang === 'zh' ? '简体中文' : 'English' }}</span>
        </div>
        <div class="custom-options">
          <div class="custom-option" :class="{ 'selected': lang === 'zh' }" @click="setLang('zh')">简体中文</div>
          <div class="custom-option" :class="{ 'selected': lang === 'en' }" @click="setLang('en')">English</div>
        </div>
      </div>

      <button class="tool-btn hide-mobile" @click="toggleTheme">
        <i :class="theme === 'dark' ? 'ri-sun-line' : 'ri-moon-line'"></i>
      </button>

      <router-link to="/download" class="tool-btn primary-btn hide-mobile">
        <i class="ri-download-line"></i>
      </router-link>

      <button class="hamburger-btn" :class="{ 'active': menuOpen }" @click="toggleMenu">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>

    <!-- Mobile Menu Overlay -->
    <transition name="menu-fade">
      <div v-if="menuOpen" class="mobile-menu-overlay" @click="closeMenu">
        <div class="mobile-menu-content" @click.stop>
          <div class="mobile-nav-links">
            <router-link to="/" class="mobile-link" @click="closeMenu">{{ $t('nav.home') }}</router-link>
            <router-link to="/download" class="mobile-link" @click="closeMenu">{{ $t('nav.download') }}</router-link>
            <router-link :to="`/docs/${lang}/index`" class="mobile-link" @click="closeMenu">{{ $t('nav.docs') }}</router-link>
            <router-link to="/generator" class="mobile-link" @click="closeMenu">{{ $t('nav.designer') }}</router-link>
          </div>
          
          <div class="mobile-nav-tools">
            <div class="mobile-tool-row">
              <button class="mobile-tool-btn" @click="toggleTheme">
                <i :class="theme === 'dark' ? 'ri-sun-line' : 'ri-moon-line'"></i>
                <span>{{ theme === 'dark' ? 'Light Mode' : 'Dark Mode' }}</span>
              </button>
            </div>
            <div class="mobile-tool-row">
              <div class="mobile-lang-switch">
                <button :class="{ 'active': lang === 'zh' }" @click="setLang('zh')">ZH</button>
                <span class="sep">|</span>
                <button :class="{ 'active': lang === 'en' }" @click="setLang('en')">EN</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </nav>
</template>


