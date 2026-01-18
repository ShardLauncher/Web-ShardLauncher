<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import domtoimage from 'dom-to-image'

const { t } = useI18n()

// Form State
const currentStyle = ref('minimal')
const version = ref('v1.1.0-Release')
const codename = ref('NEBULA')
const type = ref('Release')
const branch = ref('master')
const themeColor = ref('#00ff88')
const radius = ref(16)
const cardTheme = ref('dark')
const uploadedImages = ref<string[]>([])
const colorInput = ref<HTMLInputElement | null>(null)

// UI State
const styleOpen = ref(false)
const themeOpen = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const logs = ref('')

const containerRef = ref<HTMLElement | null>(null)
const previewScale = ref(1)

const updateScale = () => {
  if (containerRef.value) {
    const containerWidth = containerRef.value.clientWidth - 80 // 80 is padding (p-10)
    const cardWidth = 800
    if (containerWidth < cardWidth) {
      previewScale.value = containerWidth / cardWidth
    } else {
      previewScale.value = 1
    }
  }
}

const selectStyle = (val: string) => {
  currentStyle.value = val
  styleOpen.value = false
}

const selectTheme = (val: string) => {
  cardTheme.value = val
  themeOpen.value = false
}

const handleFileChange = (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (!files) return
  
  uploadedImages.value = []
  const count = Math.min(files.length, 3)
  
  for (let i = 0; i < count; i++) {
    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        uploadedImages.value.push(event.target.result as string)
      }
    }
    reader.readAsDataURL(files[i])
  }
}

const handleExport = () => {
  const node = document.getElementById('export-card')
  if (node) {
    // Temporarily remove scale for clean export if any
    const originalTransform = node.style.transform
    node.style.transform = 'none'
    
    domtoimage.toPng(node, {
      quality: 1,
      bgcolor: cardTheme.value === 'dark' ? '#0a0a0a' : '#ffffff'
    })
      .then((dataUrl) => {
        const link = document.createElement('a')
        link.download = `ShardLauncher-${version.value}.png`
        link.href = dataUrl
        link.click()
        node.style.transform = originalTransform
      })
      .catch((error) => {
        console.error('Export failed:', error)
        node.style.transform = originalTransform
      })
  }
}

// Helper for primary RGB
const primaryRGB = computed(() => {
  const hex = themeColor.value.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  return `${r}, ${g}, ${b}`
})

onMounted(() => {
  logs.value = t('designer.default_logs')
  updateScale()
  window.addEventListener('resize', updateScale)
  // Close selects when clicking outside
  window.addEventListener('click', () => {
    styleOpen.value = false
    themeOpen.value = false
  })
})
</script>

<template>
  <div class="flex h-[calc(100vh-64px)] mt-[64px] overflow-hidden flex-col lg:flex-row bg-body">
    <!-- Sidebar -->
    <aside class="w-full lg:w-[380px] glass-sidebar p-8 overflow-y-auto z-10 shadow-2xl custom-scrollbar">
      <h2 class="text-2xl font-space font-bold mb-8 flex items-center gap-3">
        <i class="ri-brush-3-fill text-primary" :style="{ color: themeColor }"></i>
        <span>{{ t('designer.title') }}</span>
      </h2>

      <div class="space-y-6">
        <!-- Style Select -->
        <div class="control-group">
          <label class="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2 block">{{ t('designer.style') }}</label>
          <div class="relative" @click.stop>
            <div 
              @click="styleOpen = !styleOpen"
              class="flex justify-between items-center p-3 glass-control rounded-xl cursor-pointer"
            >
              <span class="text-sm">{{ t(`designer.opt.${currentStyle}`) }}</span>
              <i class="ri-arrow-down-s-line transition-transform" :class="{ 'rotate-180': styleOpen }"></i>
            </div>
            <div 
              v-show="styleOpen"
              class="absolute top-full left-0 right-0 mt-2 glass-panel rounded-xl shadow-2xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
            >
              <div 
                v-for="s in ['minimal', 'detailed']" 
                :key="s"
                @click="selectStyle(s)"
                class="p-3 text-sm hover:bg-primary hover:text-black cursor-pointer transition-colors"
                :class="{ 'bg-primary/10 text-primary': currentStyle === s }"
              >
                {{ t(`designer.opt.${s}`) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Version & Codename -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2 block">{{ t('designer.version') }}</label>
            <input v-model="version" type="text" class="w-full glass-control rounded-xl p-3 text-sm outline-none">
          </div>
          <div>
            <label class="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2 block">{{ t('designer.codename') }}</label>
            <input v-model="codename" type="text" class="w-full glass-control rounded-xl p-3 text-sm outline-none uppercase">
          </div>
        </div>

        <!-- Type & Branch -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2 block">{{ t('designer.type') }}</label>
            <input v-model="type" type="text" class="w-full glass-control rounded-xl p-3 text-sm outline-none">
          </div>
          <div>
            <label class="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2 block">{{ t('designer.branch') }}</label>
            <input v-model="branch" type="text" class="w-full glass-control rounded-xl p-3 text-sm outline-none">
          </div>
        </div>

        <!-- Detailed Panel -->
        <div v-if="currentStyle === 'detailed'" class="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <div>
            <label class="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2 block">{{ t('designer.logs') }}</label>
            <textarea v-model="logs" rows="4" class="w-full glass-control rounded-xl p-3 text-sm outline-none resize-none"></textarea>
          </div>
          <div>
            <label class="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2 block">{{ t('designer.imgs') }}</label>
            <div 
              @click="fileInput?.click()"
              class="border-2 border-dashed border-[color:var(--glass-border)] bg-surface/5 rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group"
            >
              <i class="ri-image-add-line text-2xl mb-2 block opacity-50 group-hover:opacity-100 group-hover:text-primary transition-all"></i>
              <span class="text-xs text-text-muted group-hover:text-text-main">{{ uploadedImages.length > 0 ? `${uploadedImages.length} ${t('designer.images_selected')}` : t('designer.imgs_hint') }}</span>
              <input ref="fileInput" type="file" multiple accept="image/*" class="hidden" @change="handleFileChange">
            </div>
          </div>
        </div>

        <!-- Theme Color -->
        <div>
          <label class="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2 block">{{ t('designer.theme_color') }}</label>
          <div 
            @click="colorInput?.click()"
            class="flex items-center gap-4 glass-control rounded-xl p-3 cursor-pointer"
          >
            <div class="w-6 h-6 rounded-full border-2 border-white/20" :style="{ backgroundColor: themeColor }"></div>
            <span class="font-space font-bold text-sm uppercase">{{ themeColor }}</span>
            <input ref="colorInput" v-model="themeColor" type="color" class="hidden">
          </div>
        </div>

        <!-- Radius -->
        <div>
          <label class="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2 block flex justify-between">
            <span>{{ t('designer.radius') }}</span>
            <span class="text-primary">{{ radius }}px</span>
          </label>
          <input 
            v-model="radius" 
            type="range" 
            min="0" 
            max="40" 
            class="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
            :style="{ '--tw-accent-color': themeColor }"
          >
        </div>

        <!-- Card Theme -->
        <div class="control-group">
          <label class="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2 block">{{ t('designer.card_theme') }}</label>
          <div class="relative" @click.stop>
            <div 
              @click="themeOpen = !themeOpen"
              class="flex justify-between items-center p-3 glass-control rounded-xl cursor-pointer"
            >
              <span class="text-sm">{{ t(`designer.opt.${cardTheme}`) }}</span>
              <i class="ri-arrow-down-s-line transition-transform" :class="{ 'rotate-180': themeOpen }"></i>
            </div>
            <div 
              v-show="themeOpen"
              class="absolute top-full left-0 right-0 mt-2 glass-panel rounded-xl shadow-2xl z-20 overflow-hidden"
            >
              <div 
                v-for="themeOpt in ['dark', 'light']" 
                :key="themeOpt"
                @click="selectTheme(themeOpt)"
                class="p-3 text-sm hover:bg-primary hover:text-black cursor-pointer transition-colors"
                :class="{ 'bg-primary/10 text-primary': cardTheme === themeOpt }"
              >
                {{ t(`designer.opt.${themeOpt}`) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Export Button -->
        <button 
          @click="handleExport"
          class="w-full py-4 bg-primary text-black font-extrabold rounded-2xl flex items-center justify-center gap-3 hover:-translate-y-1 transition-all shadow-lg hover:shadow-primary/20"
          :style="{ backgroundColor: themeColor }"
        >
          <i class="ri-camera-fill text-xl"></i>
          {{ t('designer.export') }}
        </button>
      </div>
    </aside>

    <!-- Preview Area -->
    <main ref="containerRef" class="flex-1 p-6 lg:p-10 flex items-center justify-center overflow-auto bg-black/40 min-h-[400px]">
      <div 
        id="export-card"
        class="relative flex transition-all duration-500 overflow-hidden border border-white/10 shrink-0 origin-center"
        :class="[
          currentStyle === 'minimal' ? 'w-[800px] h-[260px] flex-row items-center justify-between px-16' : 'w-[800px] min-h-[500px] flex-col p-12',
          cardTheme === 'dark' ? 'bg-[#0a0a0a] text-white' : 'bg-white text-gray-900 border-black/5'
        ]"
        :style="{ 
          borderRadius: `${radius}px`,
          transform: `scale(${previewScale})`
        }"
      >
        <!-- Decorative Elements -->
        <div 
          class="absolute w-[250px] h-[250px] -top-24 -right-12 rounded-full blur-[50px] opacity-10 pointer-events-none"
          :style="{ backgroundColor: themeColor }"
        ></div>
        <div 
          class="absolute w-[150px] h-[150px] -bottom-12 -left-8 rotate-45 blur-[50px] opacity-10 pointer-events-none"
          :style="{ backgroundColor: themeColor }"
        ></div>
        <div 
          class="absolute w-[40%] h-[40%] rounded-full blur-[80px] opacity-10 animate-pulse pointer-events-none left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          :style="{ backgroundColor: themeColor }"
        ></div>

        <!-- Minimal / Top Section -->
        <div 
          class="relative z-10 flex items-center gap-6"
          :class="{ 'w-full mb-10': currentStyle === 'detailed' }"
        >
          <img 
            src="/logo.png" 
            class="w-[85px] h-[85px] rounded-[18px] shadow-2xl"
            @error="($event.target as HTMLImageElement).src = 'https://avatars.githubusercontent.com/u/148412852?s=200&v=4'"
          >
          <div>
            <h1 class="font-space text-4xl font-bold tracking-tight">ShardLauncher</h1>
            <div 
              class="inline-block px-3 py-1 rounded-full text-[10px] font-black mt-2 uppercase tracking-widest border"
              :style="{ 
                borderColor: themeColor, 
                color: themeColor, 
                backgroundColor: `rgba(${primaryRGB}, 0.1)` 
              }"
            >
              {{ version }}
            </div>
          </div>
        </div>

        <!-- Minimal Meta / Detailed Top Meta -->
        <div 
          class="relative z-10 text-right"
          :class="{ 'absolute top-12 right-12': currentStyle === 'detailed' }"
        >
          <div class="mb-4">
            <p class="text-[10px] uppercase tracking-widest opacity-40 mb-1 font-bold">Update Type</p>
            <p class="font-space font-bold text-lg">{{ type }}</p>
          </div>
          <div class="mb-4">
            <p class="text-[10px] uppercase tracking-widest opacity-40 mb-1 font-bold">Core Branch</p>
            <p class="font-space font-bold text-lg">{{ branch }}</p>
          </div>
          <p class="text-3xl font-space font-black tracking-tighter" :style="{ color: themeColor }">{{ codename }}</p>
        </div>

        <!-- Detailed Content -->
        <template v-if="currentStyle === 'detailed'">
          <div class="relative z-10 grid grid-cols-[1fr_1.1fr] gap-10 mt-4">
            <div class="space-y-4">
              <h3 class="text-xs font-bold opacity-60 flex items-center gap-2">
                <i class="ri-list-check"></i> CHANGELOG
              </h3>
              <div class="text-sm leading-relaxed opacity-70 whitespace-pre-wrap">
                {{ logs }}
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-3">
              <div 
                v-for="(img, idx) in uploadedImages" 
                :key="idx"
                class="rounded-xl overflow-hidden border border-white/10 aspect-[16/10]"
                :class="{ 'col-span-2 aspect-[16/7]': idx === 0 && uploadedImages.length === 1 || idx === 2 }"
              >
                <img :src="img" class="w-full h-full object-cover">
              </div>
              <div v-if="uploadedImages.length === 0" class="col-span-2 aspect-[16/9] bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
                <i class="ri-image-line text-4xl opacity-10"></i>
              </div>
            </div>
          </div>

          <div class="mt-auto pt-10 flex justify-between text-[10px] font-bold opacity-30 uppercase tracking-widest">
            <span>ShardLauncher Open Source Project</span>
            <span>Refined by LanRhyme</span>
          </div>
        </template>
      </div>
    </main>
  </div>
</template>

<style scoped>
.glass-sidebar {
  background: rgba(var(--bg-surface-rgb), 0.3);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid var(--glass-border);
  transition: all 0.3s var(--ease-smooth);
}

@media (min-width: 1024px) {
  .glass-sidebar {
    border-bottom: none;
    border-right: 1px solid var(--glass-border);
    background: rgba(var(--bg-surface-rgb), 0.2);
  }
}

.glass-control {
  background: rgba(var(--bg-surface-rgb), 0.2);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: all 0.3s var(--ease-smooth);
}

.glass-control:hover, .glass-control:focus {
  border-color: rgba(var(--primary-rgb), 0.5);
  background: rgba(var(--bg-surface-rgb), 0.4);
  box-shadow: 0 0 15px rgba(var(--primary-rgb), 0.1);
}

/* Specific overrides for inputs to ensure text visibility and proper sizing */
input.glass-control, textarea.glass-control {
  color: var(--text-main);
}

/* Custom scrollbar for sidebar - Removed to use global style */
</style>


