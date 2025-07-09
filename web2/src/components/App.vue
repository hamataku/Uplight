<template>
  <div class="app">
    <FileUpload @file-loaded="handleFileLoaded" />
    <PianoRoll ref="pianoRollRef" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import FileUpload from './FileUpload.vue'
import PianoRoll from './Piano/PianoRoll.vue'

interface Note {
  midi: number
  startTime: number
  duration: number
  velocity: number
}

interface SongData {
  notes: Note[]
  duration: number
  tempo: number
}

const pianoRollRef = ref<InstanceType<typeof PianoRoll> | null>(null)

const handleFileLoaded = (data: SongData) => {
  if (pianoRollRef.value) {
    pianoRollRef.value.loadSong(data)
  }
}
</script>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
</style>
