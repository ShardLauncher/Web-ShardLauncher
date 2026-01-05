<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
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

<style scoped>
.app-footer {
  padding: 80px 6% 40px;
  position: relative;
  overflow: hidden;
  border-top: 1px solid var(--border-color);
  background: linear-gradient(to top, rgba(0, 0, 0, 0.05), transparent);
  margin-top: auto;
}

.footer-bg-text {
  position: absolute;
  bottom: -10%;
  left: 50%;
  transform: translateX(-50%);
  font-size: 25vw;
  font-weight: 800;
  opacity: 0.03;
  pointer-events: none;
  font-family: 'Space Grotesk', sans-serif;
  white-space: nowrap;
  background: linear-gradient(to bottom, var(--text-main), transparent);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
  gap: 60px;
}

.f-left {
  max-width: 400px;
}

.brand-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.footer-logo {
  width: 32px;
  height: 32px;
  border-radius: 8px;
}

.f-left h2 {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--text-main);
  margin: 0;
}

.brand-desc {
  color: var(--text-muted);
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 30px;
}

.socials {
  display: flex;
  gap: 20px;
}

.socials a {
  font-size: 1.5rem;
  color: var(--text-muted);
  transition: all 0.3s var(--ease-smooth);
}

.socials a:hover {
  color: var(--primary);
  transform: translateY(-3px);
}

.f-right {
  display: flex;
  gap: 100px;
}

.f-col h4 {
  font-size: 0.9rem;
  color: var(--text-main);
  margin-bottom: 24px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.f-col a {
  display: block;
  color: var(--text-muted);
  text-decoration: none;
  margin-bottom: 12px;
  font-size: 0.95rem;
  transition: all 0.3s var(--ease-smooth);
}

.f-col a:hover {
  color: var(--primary);
  transform: translateX(5px);
}

.copyright {
  margin-top: 60px;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.85rem;
  padding-top: 30px;
  border-top: 1px solid var(--border-color);
  position: relative;
  z-index: 1;
}

@media (max-width: 1024px) {
  .footer-content {
    flex-direction: column;
    gap: 50px;
  }
  
  .f-left {
    max-width: 100%;
  }
  
  .f-right {
    gap: 80px;
  }
}

@media (max-width: 768px) {
  .app-footer {
    padding: 60px 6% 30px;
  }
  
  .f-right {
    flex-direction: row;
    justify-content: space-between;
    gap: 30px;
  }

  .f-col {
    flex: 1;
  }
  
  .copyright {
    margin-top: 40px;
  }
}

@media (max-width: 480px) {
  .f-right {
    flex-direction: column;
    gap: 40px;
  }
}
</style>
