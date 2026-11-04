<script setup lang="ts">
/**
 * Interactive 3D "neural core" rendered with Three.js.
 * - `.client.vue` suffix: Nuxt only renders this in the browser (WebGL has no server).
 * - Loaded lazily from HeroSection via <LazyHeroScene>, so three.js is a separate chunk.
 * - Pauses when off-screen or the tab is hidden; renders one still frame for reduced motion.
 */
import * as THREE from 'three'

const props = defineProps<{ dark: boolean }>()
const emit = defineEmits<{ ready: [] }>()

const container = ref<HTMLDivElement>()

const PALETTE = {
  dark: { a: '#a78bfa', b: '#22d3ee', core: '#8b5cf6' },
  light: { a: '#6d28d9', b: '#0891b2', core: '#7c3aed' },
}

const NODE_COUNT = 110
const RADIUS = 2.1
const LINK_DISTANCE = 0.95
const PULSE_COUNT = 28

let renderer: THREE.WebGLRenderer | undefined
let cleanup: (() => void) | undefined
let applyTheme: ((dark: boolean) => void) | undefined
let redraw: (() => void) | undefined

/** Evenly distributed points on a sphere (Fibonacci lattice). */
function fibonacciSphere(count: number, radius: number) {
  const points: THREE.Vector3[] = []
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const theta = golden * i
    points.push(new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r).multiplyScalar(radius))
  }
  return points
}

/** Soft round sprite so points render as glowing dots instead of squares. */
function createDotTexture() {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.35, 'rgba(255,255,255,0.8)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  return new THREE.CanvasTexture(canvas)
}

onMounted(() => {
  const el = container.value
  if (!el) return

  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' })
  }
  catch {
    return // No WebGL: the CSS orb behind the canvas stays as the fallback.
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0x000000, 0)
  el.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
  camera.position.set(0, 0, 7.2)

  const root = new THREE.Group()
  scene.add(root)

  const dot = createDotTexture()

  // ── Core: two nested wireframe icosahedrons ──
  const coreMaterial = new THREE.MeshBasicMaterial({ wireframe: true, transparent: true, opacity: 0.28 })
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.05, 1), coreMaterial)
  const innerMaterial = new THREE.MeshBasicMaterial({ wireframe: true, transparent: true, opacity: 0.5 })
  const inner = new THREE.Mesh(new THREE.IcosahedronGeometry(0.5, 0), innerMaterial)
  root.add(core, inner)

  // ── Network: nodes on a sphere, linked to their near neighbours ──
  const nodes = fibonacciSphere(NODE_COUNT, RADIUS)
  const nodePositions = new Float32Array(nodes.flatMap(v => [v.x, v.y, v.z]))
  const nodeColors = new Float32Array(NODE_COUNT * 3)
  const nodeGeometry = new THREE.BufferGeometry()
  nodeGeometry.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3))
  nodeGeometry.setAttribute('color', new THREE.BufferAttribute(nodeColors, 3))
  const nodeMaterial = new THREE.PointsMaterial({
    size: 0.11, map: dot, vertexColors: true, transparent: true, depthWrite: false,
  })
  root.add(new THREE.Points(nodeGeometry, nodeMaterial))

  const edges: [number, number][] = []
  for (let i = 0; i < NODE_COUNT; i++) {
    for (let j = i + 1; j < NODE_COUNT; j++) {
      if (nodes[i]!.distanceTo(nodes[j]!) < LINK_DISTANCE) edges.push([i, j])
    }
  }
  const linePositions = new Float32Array(edges.length * 6)
  const lineColors = new Float32Array(edges.length * 6)
  edges.forEach(([a, b], k) => {
    linePositions.set([nodes[a]!.x, nodes[a]!.y, nodes[a]!.z, nodes[b]!.x, nodes[b]!.y, nodes[b]!.z], k * 6)
  })
  const lineGeometry = new THREE.BufferGeometry()
  lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3))
  lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3))
  const lineMaterial = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.32, depthWrite: false })
  root.add(new THREE.LineSegments(lineGeometry, lineMaterial))

  // ── Pulses: bright dots travelling along random edges (signals firing) ──
  const pulses = Array.from({ length: PULSE_COUNT }, () => ({
    edge: Math.floor(Math.random() * edges.length),
    t: Math.random(),
    speed: 0.35 + Math.random() * 0.6,
  }))
  const pulsePositions = new Float32Array(PULSE_COUNT * 3)
  const pulseGeometry = new THREE.BufferGeometry()
  pulseGeometry.setAttribute('position', new THREE.BufferAttribute(pulsePositions, 3))
  const pulseMaterial = new THREE.PointsMaterial({
    size: 0.16, map: dot, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  })
  root.add(new THREE.Points(pulseGeometry, pulseMaterial))

  // ── Orbit rings ──
  const ringMaterial = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.35 })
  const makeRing = (radius: number, tiltX: number, tiltY: number) => {
    const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, Math.PI * 2)
    const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(160))
    const ring = new THREE.LineLoop(geometry, ringMaterial)
    ring.rotation.set(tiltX, tiltY, 0)
    return ring
  }
  const rings = [makeRing(2.75, 1.25, 0.3), makeRing(3.05, 1.9, -0.5)]
  root.add(...rings)

  // ── Ambient dust around the scene ──
  const DUST = 380
  const dustPositions = new Float32Array(DUST * 3)
  for (let i = 0; i < DUST; i++) {
    const v = new THREE.Vector3().randomDirection().multiplyScalar(3.4 + Math.random() * 4)
    dustPositions.set([v.x, v.y, v.z], i * 3)
  }
  const dustGeometry = new THREE.BufferGeometry()
  dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3))
  const dustMaterial = new THREE.PointsMaterial({ size: 0.04, map: dot, transparent: true, opacity: 0.55, depthWrite: false })
  const dust = new THREE.Points(dustGeometry, dustMaterial)
  scene.add(dust)

  // ── Theme-aware colours (gradient from colour A at the top to B at the bottom) ──
  applyTheme = (dark: boolean) => {
    const palette = dark ? PALETTE.dark : PALETTE.light
    const a = new THREE.Color(palette.a)
    const b = new THREE.Color(palette.b)
    const tmp = new THREE.Color()
    const colorAt = (y: number) => tmp.copy(b).lerp(a, (y / RADIUS + 1) / 2)

    nodes.forEach((v, i) => nodeColors.set(colorAt(v.y).toArray(), i * 3))
    edges.forEach(([i, j], k) => {
      lineColors.set(colorAt(nodes[i]!.y).toArray(), k * 6)
      lineColors.set(colorAt(nodes[j]!.y).toArray(), k * 6 + 3)
    })
    nodeGeometry.attributes.color!.needsUpdate = true
    lineGeometry.attributes.color!.needsUpdate = true

    coreMaterial.color.set(palette.core)
    innerMaterial.color.set(palette.b)
    ringMaterial.color.set(palette.a)
    pulseMaterial.color.set(dark ? '#ffffff' : palette.b)
    pulseMaterial.blending = dark ? THREE.AdditiveBlending : THREE.NormalBlending
    pulseMaterial.needsUpdate = true
    dustMaterial.color.set(dark ? '#c4b5fd' : '#6d28d9')
    lineMaterial.opacity = dark ? 0.32 : 0.45
  }
  applyTheme(props.dark)

  // ── Interaction: the scene leans toward the pointer ──
  const pointer = { x: 0, y: 0 }
  const onPointerMove = (e: PointerEvent) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1
  }
  window.addEventListener('pointermove', onPointerMove, { passive: true })

  // ── Sizing ──
  const resize = () => {
    const { clientWidth: w, clientHeight: h } = el
    if (!w || !h) return
    renderer!.setSize(w, h, false)
    camera.aspect = w / h
    // Pull the camera back on narrow/tall containers so the sphere always fits.
    camera.position.z = w / h < 1 ? 7.2 / Math.max(w / h, 0.6) : 7.2
    camera.updateProjectionMatrix()
    if (reducedMotion) renderer!.render(scene, camera)
  }
  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(el)
  resize()

  // ── Animation loop (only runs while visible) ──
  const timer = new THREE.Timer()
  let frame = 0
  let inView = true
  let elapsed = 0

  const updatePulses = (dt: number) => {
    pulses.forEach((pulse, i) => {
      pulse.t += dt * pulse.speed
      if (pulse.t >= 1) {
        pulse.t = 0
        pulse.edge = Math.floor(Math.random() * edges.length)
      }
      const [a, b] = edges[pulse.edge]!
      const p = nodes[a]!.clone().lerp(nodes[b]!, pulse.t)
      pulsePositions.set([p.x, p.y, p.z], i * 3)
    })
    pulseGeometry.attributes.position!.needsUpdate = true
  }

  const render = () => {
    timer.update()
    const dt = Math.min(timer.getDelta(), 0.05)
    elapsed += dt

    root.rotation.y += dt * 0.12
    root.rotation.x += (pointer.y * 0.35 - root.rotation.x) * 0.04
    root.position.x += (pointer.x * 0.25 - root.position.x) * 0.04

    core.rotation.x -= dt * 0.25
    core.rotation.z += dt * 0.15
    inner.rotation.y -= dt * 0.6
    const breathe = 1 + Math.sin(elapsed * 1.6) * 0.05
    core.scale.setScalar(breathe)
    inner.scale.setScalar(2 - breathe)

    rings[0]!.rotation.z += dt * 0.2
    rings[1]!.rotation.z -= dt * 0.14
    dust.rotation.y -= dt * 0.02

    updatePulses(dt)
    renderer!.render(scene, camera)
    frame = requestAnimationFrame(render)
  }

  const start = () => {
    if (reducedMotion || frame || !inView || document.hidden) return
    timer.update() // discard time spent paused
    frame = requestAnimationFrame(render)
  }
  const stop = () => {
    cancelAnimationFrame(frame)
    frame = 0
  }

  const visibilityObserver = new IntersectionObserver(([entry]) => {
    inView = !!entry?.isIntersecting
    if (inView) start()
    else stop()
  })
  visibilityObserver.observe(el)

  const onVisibilityChange = () => (document.hidden ? stop() : start())
  document.addEventListener('visibilitychange', onVisibilityChange)

  if (reducedMotion) {
    redraw = () => renderer?.render(scene, camera)
    updatePulses(0)
    redraw()
  }
  else {
    start()
  }
  emit('ready')

  cleanup = () => {
    stop()
    resizeObserver.disconnect()
    visibilityObserver.disconnect()
    window.removeEventListener('pointermove', onPointerMove)
    document.removeEventListener('visibilitychange', onVisibilityChange)
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      mesh.geometry?.dispose()
      const material = mesh.material as THREE.Material | THREE.Material[] | undefined
      if (Array.isArray(material)) material.forEach(m => m.dispose())
      else material?.dispose()
    })
    dot.dispose()
    renderer?.dispose()
    renderer?.domElement.remove()
  }
})

// React to the theme toggle without rebuilding the scene.
watch(() => props.dark, (dark) => {
  applyTheme?.(dark)
  redraw?.() // the loop isn't running under reduced motion, so repaint once
})

onBeforeUnmount(() => cleanup?.())
</script>

<template>
  <div ref="container" class="scene" aria-hidden="true" />
</template>

<style scoped>
.scene {
  position: absolute;
  inset: 0;
}

.scene :deep(canvas) {
  width: 100% !important;
  height: 100% !important;
  animation: fade-in 1.2s var(--ease) both;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: scale(0.94);
  }
}
</style>
