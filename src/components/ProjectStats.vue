<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const stats = ref({
  stars: '--',
  commits: '--',
  prs: '--',
  issues: '--',
  contributors: '--'
})

const animateValue = (key: keyof typeof stats.value, start: number, end: number, duration: number) => {
  let startTimestamp: number | null = null
  const step = (timestamp: number) => {
    if (!startTimestamp) startTimestamp = timestamp
    const progress = Math.min((timestamp - startTimestamp) / duration, 1)
    const easeProgress = 1 - Math.pow(1 - progress, 4)
    const current = Math.floor(easeProgress * (end - start) + start)
    stats.value[key] = current.toString()
    if (progress < 1) {
      window.requestAnimationFrame(step)
    } else {
      stats.value[key] = end.toString()
    }
  }
  window.requestAnimationFrame(step)
}

const fetchGitHubStats = async () => {
  const repo = 'ShardLauncher/ShardLauncher'
  try {
    const repoRes = await fetch(`https://api.github.com/repos/${repo}`)
    if (!repoRes.ok) throw new Error('API Rate Limit')
    const repoData = await repoRes.json()

    animateValue('stars', 0, repoData.stargazers_count, 2000)
    animateValue('issues', 0, repoData.open_issues_count, 2000)

    const prRes = await fetch(`https://api.github.com/search/issues?q=repo:${repo}+type:pr`)
    const prData = await prRes.json()
    if (prData.total_count) {
      animateValue('prs', 0, prData.total_count, 2000)
    }

    const contribRes = await fetch(`https://api.github.com/repos/${repo}/contributors?per_page=1&anon=true`)
    const contribLink = contribRes.headers.get('link')
    if (contribLink) {
      const match = contribLink.match(/&page=(\d+)>; rel="last"/)
      if (match) {
        animateValue('contributors', 0, parseInt(match[1]), 2000)
      }
    } else {
      const contribData = await contribRes.json()
      animateValue('contributors', 0, contribData.length, 2000)
    }

    const commitRes = await fetch(`https://api.github.com/repos/${repo}/commits?per_page=1`)
    const commitLink = commitRes.headers.get('link')
    if (commitLink) {
      const match = commitLink.match(/&page=(\d+)>; rel="last"/)
      if (match) {
        animateValue('commits', 0, parseInt(match[1]), 2500)
      }
    }
  } catch (error) {
    console.warn('GitHub Stats Fetch Failed:', error)
  }
}

onMounted(() => {
  setTimeout(fetchGitHubStats, 500)
})
</script>

<template>
  <section class="stats-section">
    <div class="stats-container stagger-animate delay-3">
      <div class="stat-item">
        <i class="ri-star-smile-line stat-icon"></i>
        <div class="stat-number">{{ stats.stars }}</div>
        <div class="stat-label">{{ t('stat.stars') }}</div>
      </div>
      <div class="stat-item">
        <i class="ri-git-commit-line stat-icon"></i>
        <div class="stat-number">{{ stats.commits }}</div>
        <div class="stat-label">{{ t('stat.commits') }}</div>
      </div>
      <div class="stat-item">
        <i class="ri-git-pull-request-line stat-icon"></i>
        <div class="stat-number">{{ stats.prs }}</div>
        <div class="stat-label">{{ t('stat.prs') }}</div>
      </div>
      <div class="stat-item">
        <i class="ri-bug-line stat-icon"></i>
        <div class="stat-number">{{ stats.issues }}</div>
        <div class="stat-label">{{ t('stat.issues') }}</div>
      </div>
      <div class="stat-item">
        <i class="ri-user-heart-line stat-icon"></i>
        <div class="stat-number">{{ stats.contributors }}</div>
        <div class="stat-label">{{ t('stat.contributors') }}</div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.stats-section {
  padding: 40px 6% 120px;
  max-width: 1600px;
  margin: 0 auto;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
  padding: 40px;
  background: rgba(var(--bg-surface), 0.3);
  border: 1px solid var(--border-color);
  border-radius: 24px;
  backdrop-filter: blur(10px);
  position: relative;
}

.stats-container::before {
  content: ''; position: absolute; top: 0; left: 20%; right: 20%; height: 1px;
  background: linear-gradient(90deg, transparent, var(--primary), transparent);
  opacity: 0.5;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 10px;
  position: relative;
}

.stat-item:not(:last-child)::after {
  content: ''; position: absolute; right: -10px; top: 20%; height: 60%; width: 1px;
  background: var(--border-color);
}

.stat-icon {
  font-size: 1.5rem;
  color: var(--text-muted);
  margin-bottom: 8px;
  transition: 0.3s;
}

.stat-number {
  font-family: 'Space Grotesk', monospace;
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 4px;
  line-height: 1.1;
  background: linear-gradient(180deg, var(--text-main) 0%, rgba(255,255,255,0.7) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

[data-theme="light"] .stat-number {
  background: linear-gradient(180deg, var(--text-main) 0%, rgba(0,0,0,0.6) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-label {
  font-size: 0.85rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 600;
}

.stat-item:hover .stat-icon {
  color: var(--primary);
  transform: scale(1.1);
  text-shadow: 0 0 10px var(--primary);
}

@media (max-width: 1024px) {
  .stats-container { grid-template-columns: repeat(3, 1fr); gap: 30px; }
  .stat-item:not(:last-child)::after { display: none; }
}

@media (max-width: 767px) {
  .stats-section { padding: 40px 6% 80px; }
  .stats-container { grid-template-columns: repeat(2, 1fr); padding: 24px 16px; gap: 16px; }
  .stat-item:last-child { grid-column: span 2; }
  .stat-number { font-size: 1.6rem; }
  .stat-label { font-size: 0.75rem; }
  .stat-icon { font-size: 1.2rem; }
}

@media (max-width: 480px) {
  .stats-container { grid-template-columns: 1fr; }
  .stat-item:last-child { grid-column: auto; }
}
</style>
