<template>
  <div class="controls">
    <div class="control-buttons">
      <button @click="togglePlay" class="play-button">
        {{ isPlaying ? '⏸' : '▶' }}
      </button>
      <button @click="handleStop" class="stop-button">⏹</button>
    </div>
    <div class="seek-container">
      <input
        type="range"
        :min="0"
        :max="duration"
        v-model="currentTime"
        @input="handleSeek"
        class="seek-bar"
      />
      <div class="time-display">
        {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'play'): void
  (e: 'pause'): void
  (e: 'stop'): void
  (e: 'seek', time: number): void
}>()

const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)

const togglePlay = () => {
  isPlaying.value = !isPlaying.value
  if (isPlaying.value) {
    emit('play')
  } else {
    emit('pause')
  }
}

const handleStop = () => {
  isPlaying.value = false
  currentTime.value = 0
  emit('stop')
}

const handleSeek = (event: Event) => {
  const target = event.target as HTMLInputElement
  currentTime.value = Number(target.value)
  emit('seek', currentTime.value)
}

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const setDuration = (value: number) => {
  duration.value = value
}

defineExpose({
  setDuration
})
</script>

<style scoped>
.controls {
  background: #2a2a2a;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.control-buttons {
  display: flex;
  gap: 0.5rem;
}

button {
  background: #3a3a3a;
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: background-color 0.2s;
}

button:hover {
  background: #4a4a4a;
}

.seek-container {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.seek-bar {
  width: 100%;
  height: 4px;
  -webkit-appearance: none;
  background: #4a4a4a;
  border-radius: 2px;
  outline: none;
}

.seek-bar::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  background: #64b5f6;
  border-radius: 50%;
  cursor: pointer;
}

.time-display {
  color: #ddd;
  font-size: 0.8rem;
  text-align: center;
}
</style>
