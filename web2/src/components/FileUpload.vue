<template>
  <div class="upload-section">
    <div
      class="file-upload"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
      :class="{ 'dragging': isDragging }"
    >
      <input
        type="file"
        ref="fileInput"
        @change="handleFileSelect"
        accept=".mid,.midi,.musicxml"
        class="file-input"
      />
      <div class="upload-content">
        <div class="upload-icon">📁</div>
        <p class="upload-text">
          MIDIファイルをドラッグ&ドロップ
          <br />
          または
          <button class="browse-button" @click="triggerFileInput">
            ファイルを選択
          </button>
        </p>
      </div>
    </div>
    <button class="test-button" @click="loadTestData">
      テストデータを読み込む
    </button>
  </div>
</template>

<script setup lang="ts">
import { testSong } from '../utils/test-data'
import { ref } from 'vue'
import { parseMidiFile } from '../utils/parsers/midi'

const emit = defineEmits<{
  (e: 'file-loaded', data: {
    notes: Array<{
      midi: number
      startTime: number
      duration: number
      velocity: number
    }>
    duration: number
    tempo: number
  }): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)

const handleDragOver = (event: DragEvent) => {
  isDragging.value = true
}

const handleDragLeave = (event: DragEvent) => {
  isDragging.value = false
}

const handleDrop = async (event: DragEvent) => {
  isDragging.value = false
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    await processFile(files[0])
  }
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    await processFile(files[0])
  }
}

const processFile = async (file: File) => {
  try {
    if (file.name.toLowerCase().endsWith('.mid') || file.name.toLowerCase().endsWith('.midi')) {
      const parsedData = await parseMidiFile(file)
      emit('file-loaded', parsedData)
    } else if (file.name.toLowerCase().endsWith('.musicxml')) {
      // TODO: MusicXMLパーサーの実装
      throw new Error('MusicXML形式は現在サポートされていません')
    } else {
      throw new Error('サポートされていないファイル形式です')
    }
  } catch (error) {
    console.error('ファイルの処理中にエラーが発生しました:', error)
    // TODO: エラー表示の実装
  }
}

const loadTestData = () => {
  emit('file-loaded', testSong)
}
</script>

<style scoped>
.upload-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.file-upload {
  width: 100%;
  height: 200px;
  border: 2px dashed #4a4a4a;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  background: #2a2a2a;
}

.file-upload.dragging {
  border-color: #64b5f6;
  background: #1a1a1a;
}

.file-input {
  display: none;
}

.upload-content {
  text-align: center;
  color: #ddd;
}

.upload-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.upload-text {
  margin: 0;
  line-height: 1.5;
}

.browse-button {
  background: none;
  border: none;
  color: #64b5f6;
  cursor: pointer;
  padding: 0;
  font: inherit;
  text-decoration: underline;
}

.browse-button:hover {
  color: #90caf9;
}

.test-button {
  background: #3a3a3a;
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  width: 100%;
}

.test-button:hover {
  background: #4a4a4a;
}
</style>
