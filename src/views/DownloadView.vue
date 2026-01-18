<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

interface Asset {
  name: string
  browser_download_url: string
}

interface Release {
  published_at: string
  tag_name: string
  name: string
  body: string
  assets: Asset[]
}

interface Commit {
  sha: string
  commit: {
    author: {
      date: string
    }
    message: string
  }
}

const CONFIG = {
  repo: "ShardLauncher/ShardLauncher",
  workflow: "development.yml",
  artifacts: {
    "all": "com.lanrhyme.shardlauncher-all-debug",
    "arm64-v8a": "com.lanrhyme.shardlauncher-arm64-v8a-debug",
    "armeabi-v7a": "com.lanrhyme.shardlauncher-armeabi-v7a-debug",
    "x86_64": "com.lanrhyme.shardlauncher-x86_64-debug",
    "x86": "com.lanrhyme.shardlauncher-x86-debug"
  }
}

const stableRelease = ref<Release | null>(null)
const latestCommit = ref<Commit | null>(null)
const currentArch = ref('all')
const currentSource = ref('nightly')
const selectedAssetUrl = ref('')
const showModal = ref(false)
const detectedArch = ref('all')
const archOpen = ref(false)
const sourceOpen = ref(false)
const assetOpen = ref(false)
const isRateLimited = ref(false)
const loading = ref(true)

const timeAgo = computed(() => {
  if (!latestCommit.value) return '...'
  const date = new Date(latestCommit.value.commit.author.date)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (locale.value === 'zh') {
    return diffDays > 0 ? `${diffDays} 天前` : `${diffHours} 小时前`
  }
  return diffDays > 0 ? `${diffDays} days ago` : `${diffHours} hours ago`
})

const releaseDate = computed(() => {
  if (!stableRelease.value) return '...'
  const date = new Date(stableRelease.value.published_at)
  return date.toLocaleDateString(locale.value === 'zh' ? 'zh-CN' : 'en-US')
})

const nightlyDownloadUrl = computed(() => {
  if (currentSource.value === 'actions') {
    return `https://github.com/${CONFIG.repo}/actions`
  }
  const artifactName = (CONFIG.artifacts as any)[currentArch.value] || CONFIG.artifacts['all']
  return `https://nightly.link/${CONFIG.repo}/workflows/${CONFIG.workflow}/master/${artifactName}.zip`
})

const fetchLatestRelease = async () => {
  const cacheKey = `gh_release_${CONFIG.repo}`
  const cached = localStorage.getItem(cacheKey)
  let validCacheFound = false
  
  if (cached) {
    try {
      const { data, timestamp } = JSON.parse(cached)
      // Always restore data first to show something (stale-while-revalidate pattern)
      stableRelease.value = data
      if (data.assets && data.assets.length > 0) {
        selectedAssetUrl.value = data.assets[0].browser_download_url
      }
      
      if (Date.now() - timestamp < 3600000) {
        validCacheFound = true
      }
    } catch (e) {
      localStorage.removeItem(cacheKey)
    }
  }

  if (validCacheFound) {
    return
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${CONFIG.repo}/releases/latest`)
    if (res.status === 403) {
      isRateLimited.value = true
      console.warn("GitHub API rate limit exceeded, using cached data if available.")
      return
    }
    if (!res.ok) throw new Error("API Error")
    const data = await res.json()
    stableRelease.value = data
    isRateLimited.value = false
    if (data.assets && data.assets.length > 0) {
      selectedAssetUrl.value = data.assets[0].browser_download_url
    }
    localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }))
  } catch (e) {
    console.error("Failed to fetch release info:", e)
  }
}

const fetchLatestCommit = async () => {
  const cacheKey = `gh_commit_${CONFIG.repo}`
  const cached = localStorage.getItem(cacheKey)
  let validCacheFound = false
  
  if (cached) {
    try {
      const { data, timestamp } = JSON.parse(cached)
      // Restore stale data first
      latestCommit.value = data
      
      if (Date.now() - timestamp < 3600000) {
        validCacheFound = true
      }
    } catch (e) {
      localStorage.removeItem(cacheKey)
    }
  }

  if (validCacheFound) {
    return
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${CONFIG.repo}/commits/master`)
    if (res.status === 403) {
      isRateLimited.value = true
      return
    }
    if (!res.ok) throw new Error("API Error")
    const data = await res.json()
    latestCommit.value = data
    isRateLimited.value = false
    localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }))
  } catch (e) {
    console.error("Failed to fetch commit info:", e)
  }
}

const detectArchitecture = () => {
  const ua = navigator.userAgent.toLowerCase()
  let detected = 'all'
  if (ua.includes('aarch64') || ua.includes('arm64') || ua.includes('armv8')) {
    detected = 'arm64-v8a'
  } else if (ua.includes('armv7') || ua.includes('armeabi')) {
    detected = 'armeabi-v7a'
  } else if (ua.includes('x86_64') || ua.includes('amd64')) {
    detected = 'x86_64'
  } else if (ua.includes('x86') || ua.includes('i686')) {
    detected = 'x86'
  }
  detectedArch.value = detected
  currentArch.value = detected
}

const selectAsset = (url: string) => {
  selectedAssetUrl.value = url
  assetOpen.value = false
}

const selectArch = (arch: string) => {
  currentArch.value = arch
  archOpen.value = false
}

const selectSource = (source: string) => {
  currentSource.value = source
  sourceOpen.value = false
}

onMounted(async () => {
  loading.value = true
  await Promise.all([fetchLatestRelease(), fetchLatestCommit()])
  detectArchitecture()
  loading.value = false
})
</script>

<template>
  <div class="download-view">
    <nav class="sub-nav">
      <router-link to="/" class="back-link">
        <i class="ri-arrow-left-line"></i> <span>{{ t('nav.back') }}</span>
      </router-link>
    </nav>

    <div class="download-container">
      <div class="header-section">
        <h1 class="page-title">{{ t('nav.download') }}</h1>
        <p class="page-subtitle">Select the version that suits you best</p>
      </div>

      <div class="cards-grid">
        <!-- Stable Release Card -->
        <div class="download-card release-card">
          <div class="card-bg-glow"></div>
          <div v-if="isRateLimited && !stableRelease" class="api-warning">
            <i class="ri-error-warning-line"></i>
            <span>{{ t('msg.rate_limit') }}</span>
          </div>
          
          <div class="card-header">
            <div class="badge-container">
              <span class="card-badge stable">
                <i class="ri-shield-check-fill"></i> {{ t('dl.stable') }}
              </span>
            </div>
            <h2 class="card-title">{{ t('dl.stable_title') }}</h2>
            <p class="card-desc">{{ t('dl.stable_desc') }}</p>
          </div>

          <div class="card-body">
            <div class="build-info">
              <div class="info-row">
                <span class="info-label"><i class="ri-calendar-line"></i> {{ t('info.updated') }}</span>
                <span class="info-value">{{ releaseDate }}</span>
              </div>
              <div class="info-row">
                <span class="info-label"><i class="ri-git-branch-line"></i> {{ t('info.version') }}</span>
                <span class="info-value mono">{{ stableRelease?.tag_name || '...' }}</span>
              </div>
            </div>

            <div class="control-group">
              <label class="label">{{ t('lbl.release_assets') }}</label>
              <div class="custom-select" :class="{ 'open': assetOpen }" v-click-outside="() => assetOpen = false">
                <div class="select-trigger" @click.stop="assetOpen = !assetOpen">
                  <span class="selected-text">{{ stableRelease?.assets?.find(a => a.browser_download_url === selectedAssetUrl)?.name || t('opt.loading') }}</span>
                  <i class="ri-arrow-down-s-line"></i>
                </div>
                <div class="select-options">
                  <div v-for="asset in stableRelease?.assets" :key="asset.name" 
                       class="select-option" :class="{ 'selected': selectedAssetUrl === asset.browser_download_url }"
                       @click="selectAsset(asset.browser_download_url)">
                    <i class="ri-file-zip-line"></i><span>{{ asset.name }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="action-area">
              <a :href="selectedAssetUrl" class="dl-btn primary">
                <i class="ri-rocket-2-fill"></i>
                <span>{{ t('btn.download_stable') }}</span>
              </a>
              <button class="secondary-btn" @click="showModal = true">
                <i class="ri-file-list-3-line"></i> <span>{{ t('btn.changelog') }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Nightly Build Card -->
        <div class="download-card nightly-card">
          <div class="card-bg-glow"></div>
          <div class="card-header">
            <div class="badge-container">
              <span class="card-badge snapshot">
                <i class="ri-test-tube-fill"></i> {{ t('dl.snapshot') }}
              </span>
            </div>
            <h2 class="card-title">{{ t('dl.title') }}</h2>
            <p class="card-desc">{{ t('dl.desc') }}</p>
          </div>

          <div class="card-body">
            <div class="build-info">
              <div class="info-row">
                <span class="info-label"><i class="ri-time-line"></i> {{ t('info.updated') }}</span>
                <span class="info-value">{{ timeAgo }}</span>
              </div>
              <div class="info-row">
                <span class="info-label"><i class="ri-git-commit-line"></i> {{ t('info.version') }}</span>
                <span class="info-value mono">{{ latestCommit?.sha.substring(0, 7) || '...' }}</span>
              </div>
              <div class="commit-msg" :title="latestCommit?.commit.message">
                {{ latestCommit?.commit.message || t('msg.fetching') }}
              </div>
            </div>

            <div class="control-group">
              <label class="label">{{ t('lbl.arch') }}</label>
              <div class="custom-select" :class="{ 'open': archOpen, 'disabled': currentSource === 'actions' }" v-click-outside="() => archOpen = false">
                <div class="select-trigger" @click.stop="archOpen = !archOpen">
                  <span class="selected-text">{{ t(`opt.arch.${currentArch === 'arm64-v8a' ? 'arm64' : currentArch === 'armeabi-v7a' ? 'armv7' : currentArch === 'x86_64' ? 'x64' : currentArch}`) }}</span>
                  <i class="ri-arrow-down-s-line"></i>
                </div>
                <div class="select-options">
                  <div class="select-option" :class="{ 'selected': currentArch === 'all' }" @click="selectArch('all')">{{ t('opt.arch.all') }}</div>
                  <div class="select-option" :class="{ 'selected': currentArch === 'arm64-v8a' }" @click="selectArch('arm64-v8a')">{{ t('opt.arch.arm64') }}</div>
                  <div class="select-option" :class="{ 'selected': currentArch === 'armeabi-v7a' }" @click="selectArch('armeabi-v7a')">{{ t('opt.arch.armv7') }}</div>
                  <div class="select-option" :class="{ 'selected': currentArch === 'x86_64' }" @click="selectArch('x86_64')">{{ t('opt.arch.x64') }}</div>
                  <div class="select-option" :class="{ 'selected': currentArch === 'x86' }" @click="selectArch('x86')">{{ t('opt.arch.x86') }}</div>
                </div>
              </div>
              <div class="detected-badge" :class="{ 'visible': detectedArch !== 'all' && currentSource !== 'actions' }">
                <i class="ri-magic-line"></i> <span>{{ t('msg.detected') }}</span>&nbsp;<span>{{ detectedArch.toUpperCase() }}</span>
              </div>
            </div>

            <div class="action-area">
              <a :href="nightlyDownloadUrl" class="dl-btn nightly" :target="currentSource === 'actions' ? '_blank' : '_self'">
                <i :class="currentSource === 'actions' ? 'ri-external-link-line' : 'ri-download-cloud-2-fill'"></i>
                <span>{{ currentSource === 'actions' ? t('btn.go_actions') : t('btn.download') }}</span>
              </a>
              
              <div class="source-toggle">
                <span class="toggle-label">{{ t('lbl.source') }}:</span>
                <button class="text-btn" :class="{ active: currentSource === 'nightly' }" @click="currentSource = 'nightly'">Nightly</button>
                <span class="divider">|</span>
                <button class="text-btn" :class="{ active: currentSource === 'actions' }" @click="currentSource = 'actions'">Actions</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="footer-links">
        <a :href="`https://github.com/${CONFIG.repo}/releases`" target="_blank" class="github-link">
          <i class="ri-github-fill"></i> <span>{{ t('msg.all_releases') }}</span>
        </a>
      </div>
    </div>

    <!-- Modal -->
    <Transition name="modal">
      <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
        <div class="modal-content">
          <div class="modal-header">
            <span class="modal-title">{{ t('modal.title') }}</span>
            <button class="modal-close" @click="showModal = false">
              <i class="ri-close-line"></i>
            </button>
          </div>
          <div class="modal-body custom-scrollbar">
            <div class="markdown-content">{{ stableRelease?.body || 'No release notes provided.' }}</div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.download-view {
  min-height: 100vh;
  padding-top: 80px;
  display: flex;
  flex-direction: column;
}

.sub-nav {
  padding: 20px 6%;
  margin-bottom: 20px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--text-muted);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  padding: 8px 16px;
  border-radius: 100px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid transparent;
}

.back-link:hover {
  color: var(--primary);
  background: rgba(var(--primary-rgb), 0.1);
  border-color: rgba(var(--primary-rgb), 0.2);
  transform: translateX(-4px);
}

.download-container {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 0 24px 60px;
}

.header-section {
  text-align: center;
  margin-bottom: 60px;
}

.page-title {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 12px;
  background: var(--title-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-family: 'Space Grotesk', sans-serif;
}

.page-subtitle {
  color: var(--text-muted);
  font-size: 1.1rem;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 40px;
  align-items: start;
}

.download-card {
  position: relative;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 24px;
  padding: 32px;
  backdrop-filter: blur(20px);
  overflow: hidden;
  transition: all 0.4s var(--ease-smooth);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.download-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px -10px rgba(0,0,0,0.3);
  border-color: rgba(var(--primary-rgb), 0.3);
}

.release-card {
  border-top: 4px solid var(--primary);
}

.nightly-card {
  border-top: 4px solid #f59e0b;
}

.card-bg-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 200px;
  background: radial-gradient(circle at 50% -20%, rgba(var(--primary-rgb), 0.15), transparent 70%);
  opacity: 0.5;
  pointer-events: none;
}

.nightly-card .card-bg-glow {
  background: radial-gradient(circle at 50% -20%, rgba(245, 158, 11, 0.15), transparent 70%);
}

.card-header {
  position: relative;
  margin-bottom: 30px;
  text-align: center;
}

.badge-container {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.card-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-badge.stable {
  background: rgba(var(--primary-rgb), 0.1);
  color: var(--primary);
  border: 1px solid rgba(var(--primary-rgb), 0.2);
}

.card-badge.snapshot {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.card-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 2rem;
  margin-bottom: 8px;
  color: var(--text-main);
}

.card-desc {
  color: var(--text-muted);
  font-size: 0.95rem;
  line-height: 1.5;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 24px;
  flex: 1;
}

.build-info {
  background: rgba(0,0,0,0.2);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid var(--border-color);
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 0.9rem;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-label {
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-value {
  color: var(--text-main);
  font-weight: 500;
}

.info-value.mono {
  font-family: monospace;
  background: rgba(255,255,255,0.05);
  padding: 2px 6px;
  border-radius: 4px;
}

.commit-msg {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
  font-size: 0.85rem;
  color: var(--text-muted);
  font-style: italic;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.control-group {
  position: relative;
}

.label {
  display: block;
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 8px;
  font-weight: 600;
  margin-left: 4px;
}

.custom-select {
  position: relative;
  width: 100%;
}

.select-trigger {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  color: var(--text-main);
  font-size: 0.95rem;
  cursor: pointer;
  transition: 0.3s;
}

.select-trigger:hover {
  border-color: rgba(255,255,255,0.2);
  background: rgba(255,255,255,0.02);
}

.custom-select.open .select-trigger {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.1);
}

.select-options {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 6px;
  z-index: 50;
  opacity: 0;
  visibility: hidden;
  transform: translateY(10px);
  transition: all 0.3s var(--ease-smooth);
  box-shadow: 0 10px 40px rgba(0,0,0,0.4);
  max-height: 240px;
  overflow-y: auto;
}

.custom-select.open .select-options {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.select-option {
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  color: var(--text-muted);
  font-size: 0.9rem;
  transition: 0.2s;
  display: flex;
  align-items: center;
  gap: 10px;
}

.select-option:hover {
  background: var(--glass-shine);
  color: var(--text-main);
}

.select-option.selected {
  background: rgba(var(--primary-rgb), 0.1);
  color: var(--primary);
  font-weight: 600;
}

.nightly-card .select-option.selected {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.detected-badge {
  font-size: 0.75rem;
  color: var(--primary);
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  opacity: 0;
  transform: translateY(-5px);
  transition: 0.3s;
  padding-left: 4px;
}

.detected-badge.visible {
  opacity: 1;
  transform: translateY(0);
}

.action-area {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dl-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 14px;
  font-size: 1rem;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s var(--ease-elastic);
  position: relative;
  overflow: hidden;
}

.dl-btn.primary {
  background: var(--primary);
  color: #000;
  box-shadow: 0 4px 20px rgba(var(--primary-rgb), 0.3);
}

.dl-btn.primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(var(--primary-rgb), 0.5);
}

.dl-btn.nightly {
  background: #f59e0b;
  color: #000;
  box-shadow: 0 4px 20px rgba(245, 158, 11, 0.3);
}

.dl-btn.nightly:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(245, 158, 11, 0.5);
}

.secondary-btn {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  padding: 12px;
  border-radius: 12px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
}

.secondary-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: rgba(var(--primary-rgb), 0.05);
}

.source-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.text-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: inherit;
  padding: 4px 8px;
  border-radius: 6px;
  transition: 0.2s;
}

.text-btn:hover {
  color: var(--text-main);
}

.text-btn.active {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
  font-weight: 600;
}

.footer-links {
  margin-top: 40px;
  text-align: center;
}

.github-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.9rem;
  transition: 0.3s;
  padding: 10px 20px;
  border-radius: 100px;
}

.github-link:hover {
  color: var(--text-main);
  background: var(--bg-surface);
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.8);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-content {
  background: var(--bg-surface);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
  border-radius: 24px;
  border: 1px solid var(--glass-border);
  border-top: 1px solid var(--glass-highlight);
  display: flex;
  flex-direction: column;
  box-shadow: 0 50px 100px -20px rgba(0,0,0,0.5);
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-main);
}

.modal-close {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 4px;
  border-radius: 8px;
  transition: 0.2s;
  display: flex;
}

.modal-close:hover {
  background: var(--glass-shine);
  color: var(--text-main);
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--text-muted);
}

.markdown-content {
  white-space: pre-wrap;
  font-family: monospace;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(1.05);
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.95);
}

.breathing-glow {
  position: absolute; top: 50%; left: 50%;
}

@media (max-width: 768px) {
  .download-view {
    padding-top: 60px;
  }
  
  .header-section {
    margin-bottom: 40px;
  }

  .page-title {
    font-size: 2.2rem;
  }

  .download-container {
    padding: 0 16px 40px;
  }

  .cards-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  
  .download-card {
    padding: 24px;
  }
}
</style>
