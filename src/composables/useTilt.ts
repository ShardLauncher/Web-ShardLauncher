import { ref, onMounted, onUnmounted } from 'vue'

export function useTilt(targetRef: any) {
  let bounds: DOMRect | null = null

  function rotateToMouse(e: MouseEvent) {
    if (!targetRef.value || window.innerWidth <= 1024) return

    if (!bounds) {
      bounds = targetRef.value.getBoundingClientRect()
    }

    const mouseX = e.clientX
    const mouseY = e.clientY
    const leftX = mouseX - bounds!.x
    const topY = mouseY - bounds!.y
    const center = {
      x: leftX - bounds!.width / 2,
      y: topY - bounds!.height / 2
    }
    const distance = Math.sqrt(center.x ** 2 + center.y ** 2)

    targetRef.value.style.transform = `
      scale3d(1.02, 1.02, 1.02)
      rotate3d(
        ${center.y / 100},
        ${-center.x / 100},
        0,
        ${Math.log(distance) * 2}deg
      )
    `
  }

  function handleMouseEnter() {
    bounds = targetRef.value?.getBoundingClientRect() || null
    document.addEventListener('mousemove', rotateToMouse)
  }

  function handleMouseLeave() {
    document.removeEventListener('mousemove', rotateToMouse)
    if (targetRef.value) {
      targetRef.value.style.transform = ''
    }
  }

  onMounted(() => {
    if (targetRef.value) {
      targetRef.value.addEventListener('mouseenter', handleMouseEnter)
      targetRef.value.addEventListener('mouseleave', handleMouseLeave)
    }
  })

  onUnmounted(() => {
    if (targetRef.value) {
      targetRef.value.removeEventListener('mouseenter', handleMouseEnter)
      targetRef.value.removeEventListener('mouseleave', handleMouseLeave)
    }
    document.removeEventListener('mousemove', rotateToMouse)
  })

  return {
    handleMouseEnter,
    handleMouseLeave
  }
}
