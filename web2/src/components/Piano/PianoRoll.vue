<template>
  <div class="piano-roll" v-show="hasData">
    <NoteLane ref="noteLaneRef" :notes="currentNotes" />
    <Keyboard ref="keyboardRef" />
    <Controls
      ref="controlsRef"
      @play="startPlayback"
      @pause="pausePlayback"
      @stop="stopPlayback"
      @seek="handleSeek"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import NoteLane from './NoteLane.vue'
import Keyboard from './Keyboard.vue'
import Controls from './Controls.vue'
import * as Tone from 'tone'


// 型定義
interface Note {
  midi: number
  startTime: number
  duration: number
  velocity: number
}

const hasData = ref(false)
const currentNotes = ref<Note[]>([])
const noteLaneRef = ref<InstanceType<typeof NoteLane> | null>(null)
const keyboardRef = ref<InstanceType<typeof Keyboard> | null>(null)
const controlsRef = ref<InstanceType<typeof Controls> | null>(null)

const synth = ref<Tone.PolySynth | null>(null)
let startTime = 0

onMounted(() => {
  // Tone.jsの初期化
  synth.value = new Tone.PolySynth().toDestination()
})

// ファイルがロードされたときの処理
const loadSong = (data: { notes: Note[], duration: number, tempo: number }) => {
  currentNotes.value = data.notes
  hasData.value = true
  
  if (controlsRef.value) {
    controlsRef.value.setDuration(data.duration)
  }
}

// 再生制御
const startPlayback = async () => {
  await Tone.start()
  startTime = Tone.now()
  
  currentNotes.value.forEach(note => {
    if (synth.value) {
      synth.value.triggerAttackRelease(
        Tone.Frequency(note.midi, "midi").toFrequency(),
        note.duration,
        startTime + note.startTime,
        note.velocity / 127
      )
    }
  })
  
  // アニメーションの開始
  if (noteLaneRef.value) {
    noteLaneRef.value.startAnimation()
  }
}

const pausePlayback = () => {
  Tone.Transport.pause()
  if (noteLaneRef.value) {
    noteLaneRef.value.pauseAnimation()
  }
}

const stopPlayback = () => {
  Tone.Transport.stop()
  if (synth.value) {
    synth.value.releaseAll()
  }
  if (noteLaneRef.value) {
    noteLaneRef.value.stopAnimation()
  }
}

const handleSeek = (time: number) => {
  if (noteLaneRef.value) {
    noteLaneRef.value.seekTo(time)
  }
}

defineExpose({
  loadSong
})
</script>

<style scoped>
.piano-roll {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #1a1a1a;
  color: white;
}
</style>
