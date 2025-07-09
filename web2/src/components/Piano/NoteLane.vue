<template>
  <div class="note-lane">
    <canvas ref="canvasRef" :width="canvasWidth" :height="canvasHeight"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'

interface Note {
  midi: number
  startTime: number
  duration: number
  velocity: number
}

const props = defineProps<{
  notes: Note[]
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const canvasWidth = ref(0)
const canvasHeight = ref(0)
const currentTime = ref(0)
const animationFrameId = ref(0)
const isPlaying = ref(false)
const startAnimationTime = ref(0)
const localNotes = ref<Note[]>([])

// propsの変更を監視してローカルの状態を更新
watch(() => props.notes, (newNotes) => {
  localNotes.value = newNotes
}, { deep: true })

// ノートのX座標を計算
const getNoteX = (midi: number, whiteKeyWidth: number) => {
  const noteIndex = midi - 36 // C2からの相対位置
  const octave = Math.floor(noteIndex / 12)
  const note = noteIndex % 12
  
  // 白鍵の位置を計算
  const whiteKeyIndex = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6][note]
  let x = (octave * 7 + whiteKeyIndex) * whiteKeyWidth

  // 黒鍵の場合は位置を調整
  if (isBlackKey(midi)) {
    x -= whiteKeyWidth * 0.3
  }

  return x
}

// 黒鍵かどうかを判定
const isBlackKey = (midi: number) => {
  const note = (midi - 36) % 12
  return [1, 3, 6, 8, 10].includes(note)
}

const animate = () => {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // キャンバスをクリア
  ctx.clearRect(0, 0, canvasWidth.value, canvasHeight.value)

  // 各ノートを描画
  localNotes.value.forEach(note => {
    const whiteKeyWidth = canvasWidth.value / 36 // 61鍵の白鍵の数
    const noteX = getNoteX(note.midi, whiteKeyWidth)
    const noteWidth = isBlackKey(note.midi) ? whiteKeyWidth * 0.6 : whiteKeyWidth

    // ノートの位置を計算（上から下に移動）
    const noteStartY = canvasHeight.value - (note.startTime - currentTime.value) * 100
    const noteHeight = note.duration * 100

    // 画面内に表示されるノートのみ描画
    if (noteStartY > -noteHeight && noteStartY < canvasHeight.value) {
      ctx.fillStyle = isBlackKey(note.midi) ? '#1976d2' : '#64b5f6'
      ctx.fillRect(noteX, noteStartY, noteWidth, noteHeight)
    }
  })

  if (isPlaying.value) {
    // 再生中は時間を更新
    currentTime.value = (performance.now() - startAnimationTime.value) / 1000
    // 次のフレームを要求
    animationFrameId.value = requestAnimationFrame(animate)
  }
}

// キャンバスの初期化とイベントリスナーの設定
let handleResize: () => void

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return

  // 初期サイズの設定
  canvasWidth.value = window.innerWidth
  canvasHeight.value = window.innerHeight - 150

  handleResize = () => {
    canvasWidth.value = window.innerWidth
    canvasHeight.value = window.innerHeight - 150
    if (canvas) {
      canvas.width = canvasWidth.value
      canvas.height = canvasHeight.value
    }
    // リサイズ時に再描画
    requestAnimationFrame(animate)
  }

  window.addEventListener('resize', handleResize)
  // 初期描画
  animate()
})

// コンポーネントのクリーンアップ
onUnmounted(() => {
  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value)
  }
  if (handleResize) {
    window.removeEventListener('resize', handleResize)
  }
})

// アニメーション制御メソッド
const startAnimation = () => {
  isPlaying.value = true
  startAnimationTime.value = performance.now()
  animate()
}

const pauseAnimation = () => {
  isPlaying.value = false
}

const stopAnimation = () => {
  isPlaying.value = false
  currentTime.value = 0
  animate() // 停止時に最終フレームを描画
}

const seekTo = (time: number) => {
  currentTime.value = time
  animate() // シーク時にフレームを更新
}

// 外部に公開するメソッド
defineExpose({
  startAnimation,
  pauseAnimation,
  stopAnimation,
  seekTo
})
</script>

<style scoped>
.note-lane {
  flex: 1;
  overflow: hidden;
  position: relative;
}

canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
