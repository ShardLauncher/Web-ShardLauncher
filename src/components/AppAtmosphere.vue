<template>
  <div class="noise"></div>
  <div class="ambient-light">
    <div class="orb orb-1"></div>
    <div class="orb orb-2"></div>
  </div>
  <div class="shards-container">
    <div class="floating-shard s1" style="--r: 0deg;"></div>
    <div class="floating-shard s2" style="--r: 45deg;"></div>
  </div>
</template>

<style scoped>
.ambient-light {
  position: fixed; width: 100vw; height: 100vh; z-index: -1; overflow: hidden;
}
.orb {
  position: absolute; border-radius: 50%;
  filter: blur(80px); opacity: 0.5;
  mix-blend-mode: screen;
  animation: drift 20s infinite alternate ease-in-out;
  will-change: transform;
}

:root[data-theme="light"] .orb { opacity: 0.6; mix-blend-mode: multiply; filter: blur(100px); }

.orb-1 { width: 50vw; height: 50vw; background: radial-gradient(circle, var(--primary), transparent 70%); top: -10%; left: -15%; }
.orb-2 { width: 40vw; height: 40vw; background: radial-gradient(circle, var(--accent), transparent 70%); bottom: -10%; right: -10%; animation-delay: -5s; }

.shards-container { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 0; height: 100vh; }
.floating-shard {
  position: absolute; background: var(--glass-shine);
  backdrop-filter: blur(3px);
  border: 1px solid var(--border-color);
  z-index: 1;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
}
.s1 { width: 60px; height: 60px; top: 15%; left: 8%; clip-path: polygon(50% 0%, 0% 100%, 100% 100%); animation: float 8s infinite ease-in-out; }
.s2 { width: 40px; height: 80px; bottom: 20%; right: 5%; clip-path: polygon(20% 0%, 100% 0, 80% 100%, 0% 100%); animation: float 10s infinite ease-in-out reverse; }

@keyframes drift { 0% { transform: translate(0,0) scale(1); } 100% { transform: translate(30px, 40px) scale(1.05); } }
@keyframes float { 0%, 100% { transform: translateY(0) rotate(var(--r, 0deg)); } 50% { transform: translateY(-15px) rotate(calc(var(--r, 0deg) + 8deg)); } }

@media (max-width: 768px) {
  .floating-shard { display: none; }
  .orb-1 { width: 80vw; height: 80vw; }
  .orb-2 { width: 70vw; height: 70vw; }
}
</style>
