<script setup lang="ts">
import { ref, computed, watch, defineAsyncComponent, markRaw } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const router = useRouter()
const { locale } = useI18n()

// 侧边栏配置
const sidebarConfig = {
  zh: [
    {
      title: '入门',
      items: [
        { text: '简介', link: '/docs/zh/index' },
        { text: '安装指南', link: '/docs/zh/install' }
      ]
    }
  ],
  en: [
    {
      title: 'Getting Started',
      items: [
        { text: 'Introduction', link: '/docs/en/index' },
        { text: 'Installation', link: '/docs/en/install' }
      ]
    }
  ]
}

const currentLocale = computed(() => (route.params.lang as string) || locale.value)
const menu = computed(() => sidebarConfig[currentLocale.value as keyof typeof sidebarConfig] || sidebarConfig.zh)

// 动态加载 Markdown 组件
const contentComponent = ref<any>(null)

const loadDoc = async () => {
  const lang = route.params.lang || currentLocale.value
  const path = Array.isArray(route.params.path) ? route.params.path.join('/') : (route.params.path || 'index')
  
  try {
    // 动态导入 markdown 文件
    const module = await import(`../../docs/${lang}/${path}.md`)
    contentComponent.value = markRaw(module.default)
  } catch (e) {
    console.error('Failed to load doc:', e)
    // 尝试 fallback 到 index
    if (path !== 'index') {
      router.push(`/docs/${lang}/index`)
    }
  }
}

// 监听语言变化，实现自动跳转对应语言文档
watch(locale, (newLang) => {
  if (route.name === 'docs' && route.params.lang !== newLang) {
    const path = Array.isArray(route.params.path) ? route.params.path.join('/') : (route.params.path || 'index')
    router.push(`/docs/${newLang}/${path}`)
  }
})

watch(() => [route.params.lang, route.params.path], loadDoc, { immediate: true })

// 移动端侧边栏状态
const isSidebarOpen = ref(false)

// 路由变化时关闭侧边栏
watch(() => route.path, () => {
  isSidebarOpen.value = false
})
</script>

<template>
  <div class="docs-container">
    <!-- 移动端侧边栏切换按钮 -->
    <button 
      class="mobile-menu-toggle" 
      @click="isSidebarOpen = !isSidebarOpen" 
      aria-label="Toggle Menu"
    >
      <svg v-if="!isSidebarOpen" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    </button>

    <!-- 侧边栏遮罩 -->
    <div 
      class="sidebar-overlay" 
      :class="{ 'show': isSidebarOpen }" 
      @click="isSidebarOpen = false"
    ></div>

    <!-- 侧边栏 -->
    <aside class="docs-sidebar" :class="{ 'open': isSidebarOpen }">
      <div v-for="group in menu" :key="group.title" class="sidebar-group">
        <h3 class="group-title">{{ group.title }}</h3>
        <ul class="group-items">
          <li v-for="item in group.items" :key="item.link">
            <router-link 
              :to="item.link" 
              class="sidebar-link"
              :class="{ 'active': route.path === item.link }"
            >
              {{ item.text }}
            </router-link>
          </li>
        </ul>
      </div>
    </aside>

    <!-- 内容区 -->
    <article class="docs-content">
      <div class="markdown-body">
        <component :is="contentComponent" v-if="contentComponent" />
        <div v-else class="loading">Loading...</div>
      </div>
    </article>
  </div>
</template>

<style scoped>
.docs-container {
  display: flex;
  min-height: calc(100vh - 100px);
  margin-top: 100px;
  max-width: 1440px;
  margin-left: auto;
  margin-right: auto;
  padding: 0 40px;
  position: relative;
}

.docs-sidebar {
  width: 280px;
  padding: 40px 0;
  border-right: 1px solid var(--border-color);
  position: sticky;
  top: 100px;
  height: calc(100vh - 100px);
  overflow-y: auto;
  transition: transform 0.3s var(--ease-smooth);
}

.sidebar-group {
  margin-bottom: 32px;
}

.group-title {
  font-size: 0.9rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text-main);
  margin-bottom: 12px;
  letter-spacing: 1px;
}

.group-items {
  list-style: none;
  padding: 0;
}

.sidebar-link {
  display: block;
  padding: 8px 0;
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.95rem;
  transition: 0.3s;
}

.sidebar-link:hover {
  color: var(--primary);
  transform: translateX(4px);
}

.sidebar-link.active {
  color: var(--primary);
  font-weight: 600;
}

.docs-content {
  flex: 1;
  padding: 60px;
  max-width: 1000px;
  background: var(--bg-card);
  backdrop-filter: blur(20px) saturate(160%);
  -webkit-backdrop-filter: blur(20px) saturate(160%);
  border-radius: 32px;
  border: 1px solid var(--glass-border);
  border-top: 1px solid var(--glass-highlight);
  margin: 40px 0 80px 40px;
  box-shadow: var(--glass-shadow);
  min-width: 0; /* Prevent flex item from overflowing */
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--text-muted);
}

/* Mobile Toggle Button */
.mobile-menu-toggle {
  display: none;
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--primary);
  color: #000;
  border: none;
  box-shadow: 0 4px 20px rgba(var(--primary-rgb), 0.4);
  z-index: 100;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s;
}

.mobile-menu-toggle:active {
  transform: scale(0.95);
}

.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 40;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s;
}

.sidebar-overlay.show {
  opacity: 1;
  pointer-events: auto;
}

/* Markdown Body Styles - Deep Selectors */
:deep(.markdown-body) {
  line-height: 1.7;
  color: var(--text-main);
}

:deep(.markdown-body h1) {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 2rem;
  background: var(--title-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

:deep(.markdown-body h2) {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 2.5rem 0 1.25rem;
  color: var(--text-main);
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.5rem;
}

:deep(.markdown-body h3) {
  font-size: 1.3rem;
  font-weight: 600;
  margin: 1.5rem 0 1rem;
}

:deep(.markdown-body p) {
  margin-bottom: 1.25rem;
  color: var(--text-muted);
}

:deep(.markdown-body ul), :deep(.markdown-body ol) {
  margin-bottom: 1.25rem;
  padding-left: 1.5rem;
  color: var(--text-muted);
}

:deep(.markdown-body li) {
  margin-bottom: 0.5rem;
}

:deep(.markdown-body code) {
  background: var(--bg-surface);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.9em;
  border: 1px solid var(--border-color);
}

:deep(.markdown-body pre) {
  background: var(--bg-surface);
  padding: 1.5rem;
  border-radius: 12px;
  overflow-x: auto;
  margin-bottom: 1.5rem;
  border: 1px solid var(--border-color);
}

:deep(.markdown-body pre code) {
  background: transparent;
  padding: 0;
  border: none;
  font-size: 0.9rem;
  color: var(--text-main);
}

:deep(.markdown-body blockquote) {
  margin: 1.5rem 0;
  padding: 0.5rem 1.5rem;
  border-left: 4px solid var(--primary);
  background: rgba(var(--primary-rgb), 0.05);
  border-radius: 0 8px 8px 0;
  color: var(--text-muted);
}

:deep(.markdown-body table) {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1.5rem;
}

:deep(.markdown-body th), :deep(.markdown-body td) {
  padding: 12px;
  border: 1px solid var(--border-color);
  text-align: left;
}

:deep(.markdown-body th) {
  background: var(--bg-surface);
  font-weight: 600;
}

:deep(.markdown-body hr) {
  border: none;
  border-top: 1px solid var(--border-color);
  margin: 2rem 0;
}

:deep(.markdown-body img) {
  max-width: 100%;
  border-radius: 12px;
  margin: 1.5rem 0;
  border: 1px solid var(--border-color);
}

@media (max-width: 1024px) {
  .docs-container {
    padding: 0 20px;
    flex-direction: column;
  }

  .mobile-menu-toggle {
    display: flex;
  }

  .docs-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 280px;
    padding: 100px 24px 40px; /* Top padding to clear navbar if needed, or just standard padding */
    transform: translateX(-100%);
    box-shadow: 4px 0 20px rgba(0,0,0,0.3);
    border-right: 1px solid var(--border-color);
    background: var(--bg-body); /* Ensure background for mobile drawer */
    z-index: 50;
  }

  .docs-sidebar.open {
    transform: translateX(0);
  }

  .docs-content {
    margin: 20px 0;
    padding: 32px 24px;
    width: 100%;
  }
}

@media (max-width: 768px) {
  .docs-container {
    margin-top: 80px; /* Reduced margin for mobile */
  }

  .docs-content {
    padding: 24px 16px;
    border-radius: 20px;
  }
  
  :deep(.markdown-body h1) {
    font-size: 2rem;
  }
  
  :deep(.markdown-body h2) {
    font-size: 1.5rem;
  }
}
</style>
