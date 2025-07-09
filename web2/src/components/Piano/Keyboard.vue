<template>
  <div class="keyboard" ref="keyboardRef">
    <div v-for="note in notes" 
         :key="note.midi" 
         :class="['key', note.type, { active: activeKeys.includes(note.midi) }]"
         :style="getKeyStyle(note)"
         @mousedown="noteOn(note.midi)"
         @mouseup="noteOff(note.midi)"
         @mouseleave="noteOff(note.midi)">
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

interface Note {
  midi: number
  type: 'white' | 'black'
  name: string
}

const keyboardRef = ref<HTMLDivElement | null>(null)
const activeKeys = ref<number[]>([])

// 61鍵の音階データを生成（C2からC7）
const notes = computed(() => {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const notes: Note[] = []
  
  for (let midi = 36; midi <= 96; midi++) {
    const noteIndex = midi % 12
    const noteName = noteNames[noteIndex]
    const type = noteName.includes('#') ? 'black' : 'white'
    
    notes.push({
      midi,
      type,
      name: noteName
    })
  }
  
  return notes
})

const getKeyStyle = (note: Note) => {
  const style: Record<string, string> = {}
  if (note.type === 'black') {
    const whiteKeyWidth = 100 / notes.value.filter(n => n.type === 'white').length
    const position = notes.value.slice(0, notes.value.findIndex(n => n.midi === note.midi))
      .filter(n => n.type === 'white').length
    style.left = `${position * whiteKeyWidth - (whiteKeyWidth * 0.3)}%`
    style.width = `${whiteKeyWidth * 0.6}%`
  }
  return style
}

const noteOn = (midi: number) => {
  if (!activeKeys.value.includes(midi)) {
    activeKeys.value.push(midi)
  }
  // 音を鳴らすロジックはここに追加予定
}

const noteOff = (midi: number) => {
  activeKeys.value = activeKeys.value.filter(key => key !== midi)
  // 音を止めるロジックはここに追加予定
}
</script>

<style scoped>
.keyboard {
  position: relative;
  width: 100%;
  height: 150px;
  background: #1a1a1a;
  display: flex;
  user-select: none;
}

.key {
  position: relative;
  height: 100%;
  border: 1px solid #000;
  box-sizing: border-box;
  transition: background-color 0.1s;
}

.key.white {
  background: white;
  flex: 1;
  z-index: 1;
}

.key.black {
  position: absolute;
  background: black;
  height: 60%;
  z-index: 2;
}

.key.active {
  background: #64b5f6;
}

.key.white.active {
  background: #e3f2fd;
}

.key.black.active {
  background: #1976d2;
}
</style>
