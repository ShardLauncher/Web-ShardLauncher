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
</script>

<template>
  <div class="docs-container">
    <!-- 侧边栏 -->
    <aside class="docs-sidebar">
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
