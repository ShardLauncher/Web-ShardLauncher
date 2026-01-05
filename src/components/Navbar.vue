<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
const scrolled = ref(false)
const theme = ref(localStorage.getItem('theme') || 'dark')
const lang = ref(locale.value)
const langOpen = ref(false)

const router = useRouter()

const handleScroll = () => {
  scrolled.value = window.scrollY > 50
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
  <nav :class="{ 'scrolled': scrolled }">
    <router-link to="/" class="brand">
      <img src="/logo.png" alt="ShardLauncher">
      <span>ShardLauncher</span>
    </router-link>

    <div class="nav-tools">
      <div class="custom-select-wrapper" :class="{ 'open': langOpen }">
        <div class="custom-select-trigger" @click="langOpen = !langOpen">
          <span class="custom-select-label">{{ lang === 'zh' ? '简体中文' : 'English' }}</span>
        </div>
        <div class="custom-options">
          <div class="custom-option" :class="{ 'selected': lang === 'zh' }" @click="setLang('zh')">简体中文</div>
          <div class="custom-option" :class="{ 'selected': lang === 'en' }" @click="setLang('en')">English</div>
        </div>
      </div>

      <button class="tool-btn" @click="toggleTheme">
        <i :class="theme === 'dark' ? 'ri-sun-line' : 'ri-moon-line'"></i>
      </button>

      <router-link to="/download" class="tool-btn">
        <i class="ri-download-line"></i>
      </router-link>
    </div>
  </nav>
</template>

<style scoped>
nav {
  position: fixed; top: 0; width: 100%; padding: 16px 6%;
  display: flex; justify-content: space-between; align-items: center;
  z-index: 100; transition: 0.4s var(--ease-smooth);
}
nav.scrolled {
  padding: 12px 6%;
  background: rgba(var(--bg-surface), 0.01);
  backdrop-filter: blur(16px) saturate(180%);
  border-bottom: 1px solid var(--border-color);
}

.brand {
  font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 1.5rem;
  color: var(--text-main); text-decoration: none; display: flex; align-items: center; gap: 12px;
}
.brand img { width: 32px; height: 32px; border-radius: 6px; }

.nav-tools { display: flex; align-items: center; gap: 12px; }
.tool-btn {
  background: transparent; border: 1px solid var(--border-color);
  color: var(--text-main); width: 42px; height: 42px; border-radius: 50%;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: 0.3s cubic-bezier(0.3, 2, 0.3, 1);
}
.tool-btn:hover { background: var(--text-main); color: var(--bg-body); transform: scale(1.1); border-color: transparent; }

/* Custom Language Selector */
.custom-select-wrapper {
  position: relative;
  user-select: none;
}

.custom-select-trigger {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  height: 42px;
  padding: 0 40px 0 20px;
  border: 1px solid var(--border-color);
  border-radius: 100px;
  background-color: var(--bg-card);
  backdrop-filter: blur(10px);
  color: var(--text-main);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s var(--ease-smooth);
}

.custom-select-trigger::after {
  content: '';
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.7)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: center;
  background-size: 16px;
  transition: transform 0.3s var(--ease-smooth);
}

[data-theme="light"] .custom-select-trigger::after {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='rgba(0,0,0,0.6)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
}

.custom-options {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  min-width: 160px;
  border: 1px solid var(--border-color);
  border-radius: 16px;
  background-color: var(--bg-card);
  backdrop-filter: blur(16px) saturate(180%);
  box-shadow: 0 8px 20px rgba(0,0,0,0.2);
  padding: 8px;
  z-index: 200;
  opacity: 0;
  visibility: hidden;
  transform: translateY(10px) scale(0.98);
  transition: all 0.3s var(--ease-smooth);
}

.custom-select-wrapper.open .custom-options {
  opacity: 1;
  visibility: visible;
  transform: translateY(0) scale(1);
}

.custom-select-wrapper.open .custom-select-trigger::after {
  transform: translateY(-50%) rotate(180deg);
}

.custom-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  color: var(--text-muted);
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s var(--ease-smooth);
}

.custom-option:hover {
  background-color: var(--glass-shine);
  color: var(--text-main);
}

.custom-option.selected {
  color: var(--primary);
  font-weight: 600;
}
@media (max-width: 768px) {
  nav { padding: 16px 4%; }
  .brand span { display: none; }
  .custom-select-trigger { padding: 0 32px 0 12px; font-size: 0.8rem; height: 36px; }
  .tool-btn { width: 36px; height: 36px; }
  .custom-options { min-width: 120px; }
}
</style>
