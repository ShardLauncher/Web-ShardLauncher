<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from './components/Navbar.vue'
import AppFooter from './components/AppFooter.vue'
import AppAtmosphere from './components/AppAtmosphere.vue'

const route = useRoute()
const showFooter = computed(() => route.path !== '/generator')
</script>

<template>
  <div class="app-wrapper">
    <AppAtmosphere />
    <Navbar />
    <main>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <AppFooter v-if="showFooter" />
  </div>
</template>

<style>
.app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

main {
  min-height: 100vh;
  /* padding-top: 80px; Removed to let views handle their own spacing */
}
</style>
