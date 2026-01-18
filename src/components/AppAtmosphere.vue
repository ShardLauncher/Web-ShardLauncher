<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const canvasRef = ref<HTMLCanvasElement | null>(null)
let animationFrameId: number
let particles: Particle[] = []
let particleColor = '255, 255, 255'

// Mouse state
const mouse = {
  x: -1000,
  y: -1000,
  radius: 150
}

class Particle {
  x: number
  y: number
  originX: number
  originY: number
  size: number
  speedX: number
  speedY: number
  opacity: number
  fadeSpeed: number
  
  constructor(canvasWidth: number, canvasHeight: number) {
    this.x = Math.random() * canvasWidth
    this.y = Math.random() * canvasHeight
    this.originX = this.x
    this.originY = this.y
    this.size = Math.random() * 2 + 0.5
    this.speedX = (Math.random() - 0.5) * 0.3
    this.speedY = (Math.random() - 0.5) * 0.3
    this.opacity = Math.random() * 0.5 + 0.1
    this.fadeSpeed = (Math.random() - 0.5) * 0.005
  }

  update(canvasWidth: number, canvasHeight: number) {
    // Base movement
    this.x += this.speedX
    this.y += this.speedY
    this.opacity += this.fadeSpeed

    // Mouse Interaction
    const dx = mouse.x - this.x
    const dy = mouse.y - this.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    if (distance < mouse.radius) {
      const forceDirectionX = dx / distance
      const forceDirectionY = dy / distance
      const force = (mouse.radius - distance) / mouse.radius
      const directionX = forceDirectionX * force * 3
      const directionY = forceDirectionY * force * 3
      
      this.x -= directionX
      this.y -= directionY
    }

    if (this.opacity <= 0.1 || this.opacity >= 0.6) {
      this.fadeSpeed = -this.fadeSpeed
    }

    // Wrap around screen
    if (this.x < 0) this.x = canvasWidth
    if (this.x > canvasWidth) this.x = 0
    if (this.y < 0) this.y = canvasHeight
    if (this.y > canvasHeight) this.y = 0
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = `rgba(${particleColor}, ${this.opacity})`
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fill()
    
    // Connect particles near mouse
    const dx = mouse.x - this.x
    const dy = mouse.y - this.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    if (distance < 120) {
      ctx.beginPath()
      ctx.strokeStyle = `rgba(${particleColor}, ${0.15 - distance/120 * 0.15})`
      ctx.lineWidth = 1
      ctx.moveTo(this.x, this.y)
      ctx.lineTo(mouse.x, mouse.y)
      ctx.stroke()
    }
  }
}

const updateThemeColor = () => {
  const styles = getComputedStyle(document.documentElement)
  const color = styles.getPropertyValue('--particle-rgb').trim()
  if (color) {
    particleColor = color
  }
}

const initParticles = (width: number, height: number) => {
  particles = []
  const particleCount = Math.min(Math.floor((width * height) / 10000), 100) // Density based on screen size
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle(width, height))
  }
}

const animate = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  particles.forEach(p => {
    p.update(canvas.width, canvas.height)
    p.draw(ctx)
  })

  animationFrameId = requestAnimationFrame(animate)
}

const handleResize = () => {
  if (canvasRef.value) {
    canvasRef.value.width = window.innerWidth
    canvasRef.value.height = window.innerHeight
    initParticles(window.innerWidth, window.innerHeight)
  }
}

let observer: MutationObserver | null = null

const handleMouseMove = (e: MouseEvent) => {
  mouse.x = e.clientX
  mouse.y = e.clientY
}

const handleMouseLeave = () => {
  mouse.x = -1000
  mouse.y = -1000
}

onMounted(() => {
  if (canvasRef.value) {
    canvasRef.value.width = window.innerWidth
    canvasRef.value.height = window.innerHeight
    
    updateThemeColor()
    initParticles(window.innerWidth, window.innerHeight)
    animate()
    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseout', handleMouseLeave)
    
    // Watch for theme changes
    observer = new MutationObserver(() => {
      updateThemeColor()
    })
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class']
    })
  }
})

onUnmounted(() => {
  cancelAnimationFrame(animationFrameId)
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseout', handleMouseLeave)
  if (observer) {
    observer.disconnect()
  }
})
</script>

<template>
  <div class="noise"></div>
  <div class="ambient-light">
    <div class="orb orb-1"></div>
    <div class="orb orb-2"></div>
  </div>
  <canvas ref="canvasRef" class="particles-canvas"></canvas>
</template>

<style scoped>
.particles-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1; /* Behind content but in front of background/orbs if needed, check layout */
  pointer-events: none;
}
/* Ensure z-index layering is correct */
.noise { z-index: 900; }
.ambient-light { z-index: -2; }
.particles-canvas { z-index: -1; }
</style>


