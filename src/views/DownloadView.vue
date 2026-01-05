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
  
  if (cached) {
    try {
      const { data, timestamp } = JSON.parse(cached)
      // Use cache if it's less than 1 hour old
      if (Date.now() - timestamp < 3600000) {
        stableRelease.value = data
        if (data.assets && data.assets.length > 0) {
          selectedAssetUrl.value = data.assets[0].browser_download_url
        }
      }
    } catch (e) {
      localStorage.removeItem(cacheKey)
    }
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
  
  if (cached) {
    try {
      const { data, timestamp } = JSON.parse(cached)
      if (Date.now() - timestamp < 3600000) {
        latestCommit.value = data
      }
    } catch (e) {
      localStorage.removeItem(cacheKey)
    }
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${CONFIG.repo}/commits/master`)
    if (res.status === 403) {
      isRateLimited.value = true
      console.warn("GitHub API rate limit exceeded, using cached data if available.")
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

onMounted(() => {
  fetchLatestRelease()
  fetchLatestCommit()
  detectArchitecture()
})
</script>

<template>
  <div class="download-view">
    <nav class="sub-nav">
      <router-link to="/" class="back-link">
        <i class="ri-arrow-left-line"></i> <span>{{ t('nav.back') }}</span>
      </router-link>
    </nav>

    <div class="download-wrapper">
      <!-- Stable Release Card -->
      <div class="download-card release-card">
        <div v-if="isRateLimited && !stableRelease" class="api-warning">
          <i class="ri-error-warning-line"></i>
          <span>{{ t('msg.rate_limit') }}</span>
        </div>
        <div class="card-header">
          <span class="card-badge">{{ t('dl.stable') }}</span>
          <h1 class="card-title">{{ t('dl.stable_title') }}</h1>
          <p class="card-desc">{{ t('dl.stable_desc') }}</p>
        </div>

        <div class="build-info">
          <div class="info-row">
            <span>{{ t('info.updated') }}</span>
            <span>{{ releaseDate }}</span>
          </div>
          <div class="info-row">
            <span>{{ t('info.version') }}</span>
            <span>{{ stableRelease?.tag_name || '...' }}</span>
          </div>
          <div class="commit-msg">{{ stableRelease?.name || t('msg.fetching') }}</div>
        </div>

        <button class="secondary-btn" @click="showModal = true">
          <i class="ri-file-list-3-line"></i> <span>{{ t('btn.changelog') }}</span>
        </button>

        <div class="control-group">
          <label class="label">{{ t('lbl.release_assets') }}</label>
          <div class="c-select" :class="{ 'open': assetOpen }">
            <div class="c-select-trigger" @click="assetOpen = !assetOpen">
              <span class="selected-text">{{ stableRelease?.assets?.find(a => a.browser_download_url === selectedAssetUrl)?.name || t('opt.loading') }}</span>
              <i class="ri-arrow-down-s-line"></i>
            </div>
            <div class="c-options">
              <div v-for="asset in stableRelease?.assets" :key="asset.name" 
                   class="c-option" :class="{ 'selected': selectedAssetUrl === asset.browser_download_url }"
                   @click="selectAsset(asset.browser_download_url)">
                <i class="ri-file-zip-line"></i><span>{{ asset.name }}</span>
              </div>
            </div>
          </div>
        </div>

        <a :href="selectedAssetUrl" class="dl-btn">
          <i class="ri-rocket-2-fill"></i>
          <span>{{ t('btn.download_stable') }}</span>
        </a>

        <div class="github-link">
          <a :href="`https://github.com/${CONFIG.repo}/releases`" target="_blank">
            <span>{{ t('msg.all_releases') }}</span> <i class="ri-external-link-line"></i>
          </a>
        </div>
      </div>

      <!-- Nightly Build Card -->
      <div class="download-card">
        <div class="card-header">
          <span class="card-badge snapshot">{{ t('dl.snapshot') }}</span>
          <h1 class="card-title">{{ t('dl.title') }}</h1>
          <p class="card-desc">{{ t('dl.desc') }}</p>
        </div>

        <div class="build-info">
          <div class="info-row">
            <span>{{ t('info.updated') }}</span>
            <span>{{ timeAgo }}</span>
          </div>
          <div class="info-row">
            <span>{{ t('info.version') }}</span>
            <span>{{ latestCommit?.sha.substring(0, 7) || '...' }}</span>
          </div>
          <div class="commit-msg">{{ latestCommit?.commit.message || t('msg.fetching') }}</div>
        </div>

        <div class="control-group">
          <label class="label">{{ t('lbl.source') }}</label>
          <div class="c-select" :class="{ 'open': sourceOpen }">
            <div class="c-select-trigger" @click="sourceOpen = !sourceOpen">
              <span class="selected-text">{{ t(`opt.src.${currentSource}`) }}</span>
              <i class="ri-arrow-down-s-line"></i>
            </div>
            <div class="c-options">
              <div class="c-option" :class="{ 'selected': currentSource === 'nightly' }" @click="selectSource('nightly')">
                {{ t('opt.src.nightly') }}
              </div>
              <div class="c-option" :class="{ 'selected': currentSource === 'actions' }" @click="selectSource('actions')">
                {{ t('opt.src.actions') }}
              </div>
            </div>
          </div>
        </div>

        <div class="control-group">
          <label class="label">{{ t('lbl.arch') }}</label>
          <div class="c-select" :class="{ 'open': archOpen, 'disabled': currentSource === 'actions' }">
            <div class="c-select-trigger" @click="archOpen = !archOpen">
              <span class="selected-text">{{ t(`opt.arch.${currentArch === 'arm64-v8a' ? 'arm64' : currentArch === 'armeabi-v7a' ? 'armv7' : currentArch === 'x86_64' ? 'x64' : currentArch}`) }}</span>
              <i class="ri-arrow-down-s-line"></i>
            </div>
            <div class="c-options">
              <div class="c-option" :class="{ 'selected': currentArch === 'all' }" @click="selectArch('all')">{{ t('opt.arch.all') }}</div>
              <div class="c-option" :class="{ 'selected': currentArch === 'arm64-v8a' }" @click="selectArch('arm64-v8a')">{{ t('opt.arch.arm64') }}</div>
              <div class="c-option" :class="{ 'selected': currentArch === 'armeabi-v7a' }" @click="selectArch('armeabi-v7a')">{{ t('opt.arch.armv7') }}</div>
              <div class="c-option" :class="{ 'selected': currentArch === 'x86_64' }" @click="selectArch('x86_64')">{{ t('opt.arch.x64') }}</div>
              <div class="c-option" :class="{ 'selected': currentArch === 'x86' }" @click="selectArch('x86')">{{ t('opt.arch.x86') }}</div>
            </div>
          </div>
          <div class="detected-badge" :class="{ 'visible': detectedArch !== 'all' && currentSource !== 'actions' }">
            <i class="ri-magic-line"></i> <span>{{ t('msg.detected') }}</span>&nbsp;<span>{{ detectedArch.toUpperCase() }}</span>
          </div>
        </div>

        <a :href="nightlyDownloadUrl" class="dl-btn" :target="currentSource === 'actions' ? '_blank' : '_self'">
          <i :class="currentSource === 'actions' ? 'ri-external-link-line' : 'ri-download-cloud-2-fill'"></i>
          <span>{{ currentSource === 'actions' ? t('btn.go_actions') : t('btn.download') }}</span>
        </a>

        <div class="disclaimer">
          {{ t('msg.disclaimer') }}
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div class="modal-overlay" :class="{ 'open': showModal }" @click.self="showModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <span class="modal-title">{{ t('modal.title') }}</span>
          <button class="modal-close" @click="showModal = false">&times;</button>
        </div>
        <div class="modal-body">
          {{ stableRelease?.body || 'No release notes provided.' }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.download-view {
  min-height: 100vh; display: flex; flex-direction: column; padding-top: 80px;
}

.api-warning {
  background: rgba(255, 171, 0, 0.1);
  border: 1px solid rgba(255, 171, 0, 0.3);
  color: #ffab00;
  padding: 12px 16px;
  border-radius: 12px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
}

.sub-nav { padding: 24px 6%; }
.back-link {
  color: var(--text-muted); text-decoration: none; font-weight: 500; display: flex; align-items: center; gap: 6px;
  transition: 0.3s;
}
.back-link:hover { color: var(--primary); transform: translateX(-4px); }

.download-wrapper {
  flex: 1; display: flex; align-items: center; justify-content: center;
  flex-wrap: wrap; gap: 30px; padding: 40px 20px;
}

.download-card {
  width: 100%; max-width: 480px; background: var(--bg-card);
  border: 1px solid var(--border-color); border-radius: 24px;
  padding: 40px; backdrop-filter: blur(20px);
  box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1);
  display: flex; flex-direction: column; transition: 0.3s;
}

.release-card {
  border-color: rgba(var(--primary-rgb), 0.3);
  background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.05), var(--bg-card));
}

.card-header { margin-bottom: 30px; text-align: center; }
.card-title { font-family: 'Space Grotesk'; font-size: 1.8rem; margin-bottom: 8px; color: var(--text-main); }
.card-desc { color: var(--text-muted); font-size: 0.9rem; }

.card-badge {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 12px; border-radius: 100px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;
  background: rgba(var(--primary-rgb), 0.1); color: var(--primary); border: 1px solid rgba(var(--primary-rgb), 0.2);
  margin-bottom: 12px;
}

.card-badge.snapshot {
  background: rgba(255, 50, 50, 0.1); color: #ff4d4d; border-color: rgba(255, 50, 50, 0.2);
}

.build-info {
  background: rgba(0,0,0,0.2); border-radius: 12px; padding: 16px; margin-bottom: 30px;
  border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 8px;
}

[data-theme="light"] .build-info { background: rgba(255,255,255,0.4); }

.info-row { display: flex; justify-content: space-between; font-size: 0.9rem; color: var(--text-muted); }
.info-row span:last-child { color: var(--text-main); font-family: monospace; }

.commit-msg {
  font-size: 0.85rem; color: var(--text-muted); font-style: italic; margin-top: 4px;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}

.secondary-btn {
  background: transparent; border: 1px solid var(--border-color);
  color: var(--text-muted); padding: 8px 16px; border-radius: 8px;
  font-size: 0.85rem; cursor: pointer; transition: 0.2s;
  display: flex; align-items: center; justify-content: center; gap: 6px;
  margin-bottom: 20px; width: 100%;
}
.secondary-btn:hover { border-color: var(--primary); color: var(--primary); background: var(--glass-shine); }

.control-group { margin-bottom: 20px; position: relative; }
.label { display: block; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 8px; font-weight: 600; }

.c-select { position: relative; width: 100%; }
.c-select-trigger {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 16px; background: var(--bg-surface);
  border: 1px solid var(--border-color); border-radius: 12px;
  color: var(--text-main); font-size: 1rem; cursor: pointer; transition: 0.3s;
}
.c-select-trigger:hover { border-color: rgba(255,255,255,0.3); }
.c-select-trigger i { transition: transform 0.3s; color: var(--text-muted); }

.c-select.open .c-select-trigger { border-color: var(--primary); }
.c-select.open .c-select-trigger i { transform: rotate(180deg); color: var(--primary); }
.c-select.disabled { opacity: 0.5; pointer-events: none; filter: grayscale(1); }

.c-options {
  position: absolute; top: calc(100% + 8px); left: 0; right: 0;
  background: var(--bg-surface); border: 1px solid var(--border-color);
  border-radius: 12px; padding: 6px; z-index: 50;
  opacity: 0; visibility: hidden; transform: translateY(10px);
  transition: all 0.3s var(--ease-smooth); box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  max-height: 250px; overflow-y: auto;
}

.c-select.open .c-options { opacity: 1; visibility: visible; transform: translateY(0); }

.c-option {
  padding: 10px 12px; border-radius: 8px; cursor: pointer;
  color: var(--text-muted); font-size: 0.95rem; transition: 0.2s;
  display: flex; align-items: center; gap: 8px;
}
.c-option:hover { background: var(--glass-shine); color: var(--text-main); }
.c-option.selected { background: var(--glass-shine); color: var(--primary); font-weight: 600; }

.dl-btn {
  display: flex; justify-content: center; align-items: center; gap: 10px;
  width: 100%; padding: 18px; margin-top: 10px;
  background: var(--text-main); color: var(--bg-body);
  border: none; border-radius: 100px; font-size: 1rem; font-weight: 700;
  text-decoration: none; cursor: pointer; transition: 0.3s;
}
.dl-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 20px -5px rgba(0,0,0,0.3); }

.detected-badge {
  font-size: 0.75rem; color: var(--primary); margin-top: 6px; display: flex; align-items: center; gap: 4px;
  opacity: 0; transform: translateY(-5px); transition: 0.3s;
}
.detected-badge.visible { opacity: 1; transform: translateY(0); }

.github-link { text-align: center; margin-top: 15px; font-size: 0.8rem; }
.github-link a { color: var(--primary); text-decoration: none; opacity: 0.7; transition: 0.3s; }
.github-link a:hover { opacity: 1; }

.disclaimer { text-align: center; margin-top: 15px; font-size: 0.8rem; color: var(--text-muted); opacity: 0.7; }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(8px);
  z-index: 1000; opacity: 0; visibility: hidden; transition: 0.3s;
  display: flex; align-items: center; justify-content: center; padding: 20px;
}
.modal-overlay.open { opacity: 1; visibility: visible; }

.modal-content {
  background: var(--bg-surface); width: 100%; max-width: 600px; max-height: 80vh;
  border-radius: 20px; border: 1px solid var(--border-color);
  display: flex; flex-direction: column; transform: scale(0.95); transition: 0.3s;
}
.modal-overlay.open .modal-content { transform: scale(1); }

.modal-header {
  padding: 20px 24px; border-bottom: 1px solid var(--border-color);
  display: flex; justify-content: space-between; align-items: center;
}
.modal-title { font-family: 'Space Grotesk'; font-size: 1.25rem; font-weight: 700; color: var(--text-main); }
.modal-close { background: none; border: none; color: var(--text-muted); font-size: 1.5rem; cursor: pointer; }

.modal-body {
  padding: 24px; overflow-y: auto; font-size: 0.95rem; line-height: 1.6; color: var(--text-muted);
  white-space: pre-wrap; font-family: monospace;
}

@media (max-width: 768px) {
  .download-view { padding-top: 60px; }
  .download-wrapper { padding: 20px 16px; }
  .download-card { padding: 24px; }
  .card-title { font-size: 1.5rem; }
  .dl-btn { padding: 14px; }
  
  .modal-content { max-height: 90vh; border-radius: 0; border: none; }
  .modal-body { padding: 16px; font-size: 0.85rem; }
}
</style>
