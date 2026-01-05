<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ProjectStats from '../components/ProjectStats.vue'
import { useTilt } from '../composables/useTilt'

const { t } = useI18n()
const tiltCard = ref(null)
useTilt(tiltCard)
</script>

<template>
  <div class="home-view">
    <header class="hero">
      <div class="hero-visual">
        <div class="visual-glass-card" ref="tiltCard">
          <div class="ring"></div>
          <div class="breathing-glow"></div>
          <img src="/logo.png" alt="Shard" class="main-logo">
        </div>
      </div>
      <div class="hero-content">
        <div class="badge stagger-animate">{{ t('hero.badge') }}</div>
        <i18n-t keypath="hero.title" tag="h1" class="stagger-animate delay-1">
          <template #br>
            <br>
          </template>
          <template #span>
            <span class="highlight">{{ t('hero.title_span') }}</span>
          </template>
        </i18n-t>
        <p class="stagger-animate delay-2">{{ t('hero.desc') }}</p>
        <div class="btn-group stagger-animate delay-3">
          <router-link to="/download" class="btn btn-pri">
            <i class="ri-download-cloud-2-fill"></i> <span>{{ t('btn.download') }}</span>
          </router-link>
          <a href="https://github.com/ShardLauncher/ShardLauncher" class="btn btn-sec">
            <i class="ri-github-fill"></i> {{ t('btn.source') }}
          </a>
        </div>
      </div>
    </header>

    <ProjectStats />

    <section class="features">
      <div class="grid-container">
        <div class="feature-card span-2">
          <div class="f-icon"><i class="ri-layout-masonry-fill"></i></div>
          <h3>{{ t('ft.1.t') }}</h3>
          <p>{{ t('ft.1.d') }}</p>
        </div>
        <div class="feature-card">
          <div class="f-icon"><i class="ri-cpu-line"></i></div>
          <h3>{{ t('ft.2.t') }}</h3>
          <p>{{ t('ft.2.d') }}</p>
        </div>
        <div class="feature-card">
          <div class="f-icon"><i class="ri-equalizer-fill"></i></div>
          <h3>{{ t('ft.3.t') }}</h3>
          <p>{{ t('ft.3.d') }}</p>
        </div>
        <div class="feature-card span-2">
          <div class="f-icon"><i class="ri-settings-4-fill"></i></div>
          <h3>{{ t('ft.4.t') }}</h3>
          <p>{{ t('ft.4.d') }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-view {
  padding-top: 0; /* Let hero handle it */
}

.hero {
  position: relative;
  min-height: 65vh;
  display: grid; grid-template-columns: 1.2fr 1fr; gap: 60px;
  align-items: center; padding: 80px 6% 40px; /* Reduced to match navbar height more closely */
  max-width: 1600px; margin: 0 auto;
}

.hero-visual {
  height: 100%; min-height: 450px;
  display: flex; align-items: center; justify-content: center;
  perspective: 1200px;
  position: relative;
}

.visual-glass-card {
  width: 70%; aspect-ratio: 1/1;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.1s linear;
}

.ring {
  position: absolute; inset: -15%; border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transform: rotateX(75deg) translateZ(-60px);
  background: radial-gradient(transparent 60%, rgba(255, 255, 255, 0.02));
  animation: spin 20s linear infinite;
  pointer-events: none;
  filter: blur(1px);
}

@keyframes spin { to { transform: rotateX(75deg) translateZ(-60px) rotate(360deg); } }

.main-logo {
  width: 120%; height: 120%; object-fit: contain;
  position: absolute; top: 5%; left: -10%;
  filter: var(--logo-glow);
  transform: translateZ(50px);
  z-index: 10;
  animation: float-logo 3s ease-in-out infinite;
}

@keyframes float-logo {
  0%, 100% { transform: translateZ(50px) translateY(0); }
  50% { transform: translateZ(50px) translateY(-15px); }
}

.breathing-glow {
  position: absolute; top: 50%; left: 50%;
  width: 60%; height: 60%; background: var(--glow-color);
  border-radius: 50%; transform: translate(-50%, -50%) translateZ(20px);
  filter: blur(80px); opacity: 0.4;
  animation: breathe 5s ease-in-out infinite; z-index: 5;
  pointer-events: none;
}

@keyframes breathe {
  0%, 100% { opacity: 0.2; transform: translate(-50%, -50%) translateZ(20px) scale(0.8); }
  50% { opacity: 0.5; transform: translate(-50%, -50%) translateZ(20px) scale(1.1); }
}

.hero-content { 
  z-index: 2; text-align: left; 
}

.badge {
  display: inline-block; padding: 6px 16px; background: var(--glass-shine);
  border: 1px solid var(--border-color); border-radius: 100px;
  font-size: 0.8rem; font-weight: 700; color: var(--primary);
  letter-spacing: 0.1em; margin-bottom: 24px;
}

.hero h1 {
  font-family: 'Space Grotesk', sans-serif; font-size: 5rem; font-weight: 800;
  line-height: 1.1; margin-bottom: 24px; color: var(--text-main);
}

.hero h1 :deep(.highlight) {
  background: linear-gradient(90deg, var(--primary), #a8ff78);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}

.hero p {
  font-size: 1.2rem; color: var(--text-muted); line-height: 1.6;
  max-width: 540px; margin-bottom: 48px;
}

.btn-group { display: flex; gap: 16px; flex-wrap: wrap; }

.btn {
  padding: 18px 36px; border-radius: 100px; font-weight: 700; font-size: 1rem;
  display: flex; align-items: center; gap: 10px; transition: 0.4s var(--ease-smooth);
  text-decoration: none;
}

.btn-pri { background: var(--primary); color: #000; position: relative; overflow: hidden; }
.btn-pri::before {
  content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transform: skewX(-25deg); transition: 0.5s; z-index: 1;
}
.btn-pri:hover::before { left: 150%; transition: 0.7s; }
.btn-pri:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(var(--primary-rgb), 0.3); }

.btn-sec { background: var(--glass-shine); border: 1px solid var(--border-color); color: var(--text-main); }
.btn-sec:hover { background: var(--border-color); transform: translateY(-5px); }

.features { padding: 0 6% 120px; max-width: 1600px; margin: 0 auto; }

.grid-container {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;
}

.feature-card {
  background: var(--bg-card); border: 1px solid var(--border-color);
  padding: 48px; border-radius: 32px; backdrop-filter: blur(10px);
  transition: 0.4s var(--ease-smooth);
}

.feature-card:hover {
  transform: translateY(-10px); border-color: var(--primary);
  background: rgba(var(--bg-surface), 0.5);
}

.span-2 { grid-column: span 2; }

.f-icon {
  width: 64px; height: 64px; background: var(--glass-shine);
  border-radius: 18px; display: flex; align-items: center; justify-content: center;
  font-size: 1.8rem; color: var(--primary); margin-bottom: 32px;
}

.feature-card h3 { font-size: 1.75rem; font-weight: 700; margin-bottom: 16px; color: var(--text-main); }
.feature-card p { color: var(--text-muted); line-height: 1.6; font-size: 1.05rem; }

@media (max-width: 1024px) {
  .hero { grid-template-columns: 1fr; text-align: center; padding: 100px 6% 60px; gap: 40px; min-height: auto; }
  .hero-content { display: flex; flex-direction: column; align-items: center; order: 2; }
  .hero-visual { min-height: 300px; order: 1; }
  .visual-glass-card { width: 260px; }
  .hero h1 { font-size: 3.5rem; }
  .hero p { margin-left: auto; margin-right: auto; }
  .btn-group { justify-content: center; }
  .grid-container { grid-template-columns: 1fr; }
  .span-2 { grid-column: auto; }
}

@media (max-width: 768px) {
  .hero { padding: 80px 6% 40px; }
  .hero h1 { font-size: 2.8rem; }
  .hero p { font-size: 1.1rem; margin-bottom: 32px; }
  .hero-visual { min-height: 240px; }
  .visual-glass-card { width: 200px; }
  .btn-group { flex-direction: column; width: 100%; max-width: 300px; margin: 0 auto; }
  .btn { width: 100%; }
  
  .feature-card { padding: 32px; }
}
</style>
