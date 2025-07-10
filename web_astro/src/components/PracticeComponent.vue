<template>
  <div id="practice_component" class="container">
    <div class="row">
      <div class="col-md-8 offset-md-2">
        <div id="monitor">
          <div id="monitorscreen">
            <video
              id="my-player"
              class="video-js vjs-fluid"
              controls
              preload="auto"
              playbackRates="[0.2, 0.5, 1, 1.5, 2]"
            >
              <source :src="videoPath" type="video/mp4"/>
            </video>
          </div>
        </div>
        <div class="bar bar-1">
          <div class='bar-led' v-for="n in 12" :id="'num'+(n-1)" :key="n"></div>
        </div>
        <div class="bar bar-2">
          <div class='bar-led' v-for="n in 12" :id="'num'+(n+11)" :key="n+12"></div>
        </div>
        <div class="bar bar-3">
          <div class='bar-led' v-for="n in 12" :id="'num'+(n+23)" :key="n+24"></div>
        </div>
        <br>
        <table class="table table-borderless">
          <tbody>
            <tr>
              <th scope="row">再生速度</th>
              <td>
                <button @click="slower()" class="btn btn-outline-secondary btn-sm px-2">ー</button>
                <span class="font-weight-normal px-2">×{{ Math.round(playbackRate*100)/100 }}</span>
                <button @click="faster()" class="btn btn-outline-secondary btn-sm px-2">＋</button>
              </td>
            </tr>
            <tr>
              <th scope="row">AB再生
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" v-model="ABisActive">
                </div>
              </th>
              <td>
                <button @click="restart" class="btn btn-outline-secondary btn-sm">＜</button>
                <button @click="setA" class="btn btn-dark btn-sm">A</button>
                <button @click="setB" class="btn btn-dark btn-sm">B</button>
                <button @click="toend" class="btn btn-outline-secondary btn-sm">＞</button>
              </td>
            </tr>
            <tr>
              <th scope="row">光る位置の調整</th>
              <td>
                <button @click="lightDown" class="btn btn-outline-secondary btn-sm px-2">ー</button>
                <span class="font-weight-normal px-2">{{ light }}</span>
                <button @click="lightUp" class="btn btn-outline-secondary btn-sm px-2">＋</button>
              </td>
            </tr>
            <tr>
              <th scope="row">鍵盤のオクターブ調整</th>
              <td>
                <button @click="octaveDown" class="btn btn-outline-secondary btn-sm px-2">ー</button>
                <span class="font-weight-normal px-2">{{ octave }}</span>
                <button @click="octaveUp" class="btn btn-outline-secondary btn-sm px-2">＋</button>
              </td>
            </tr>
            <tr>
              <th scope="row">練習モード
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" v-model="practiceIsActive" @change="practiceButton">
                </div>
              </th>
              <td>
                <select class="form-select" aria-label="MIDIキーボードを選択" @change="setInputDevice">
                  <option selected :value="-1">MIDIキーボードを選択</option>
                  <option v-for="(input, index) in inputDevices" :value="index" :key="index">
                    {{ input.name }}
                  </option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="accordion accordion-flush" id="accordionFlushExample">
          <div class="accordion-item">
            <h2 class="accordion-header" id="flush-headingOne">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapseOne" aria-expanded="false" aria-controls="flush-collapseOne">
                キーボード認識結果
              </button>
            </h2>
            <div id="flush-collapseOne" class="accordion-collapse collapse" aria-labelledby="flush-headingOne" data-bs-parent="#accordionFlushExample">
              <div class="accordion-body">
                <canvas class="keyboard-output" id="canvasOutput1"></canvas>
                <canvas class="keyboard-output" id="canvasOutput2"></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'
import cvReadyPromise from "@techstark/opencv-js"

const props = defineProps<{
  videoPath: string
  title: string
}>()

// 状態の定義
const videoObject = ref<any>(null)
const videoAnalysis = ref<HTMLVideoElement | null>(null)
const videoSrcIsSet = ref(false)
const ABisActive = ref(false)
const practiceIsActive = ref(false)
const videoLength = ref<number | null>(null)
const playbackRate = ref(1)
const videoShow = ref(false)
const Atime = ref<number | null>(null)
const Btime = ref<number | null>(null)

const midiOutputIsReady = ref(false)
const outputDevice = ref<any>(null)
const inputDevices = ref<any[]>([])
const inputDevice = ref<any>(null)
const midiObserverId = ref<number | null>(null)
const practiceNote = ref<boolean[]>(Array.from({ length: 128 }, () => false))

const keyList = ref<[number, number][]>([])
const keyDefaultColor = ref<number[]>([])
const keyNoteState = ref<boolean[]>([])
const light = ref(0)
const octave = ref(0)
const keyTop = ref<number | null>(null)

// 計算プロパティ
const Apos = computed(() => {
  if (!videoLength.value) return '0%'
  return ((Atime.value || 0) / videoLength.value) * 100 + '%'
})

const Bpos = computed(() => {
  if (!videoLength.value) return '0%'
  return ((Btime.value || 0) / videoLength.value) * 100 + '%'
})

// メソッド
const check = (text: string) => {
  console.log(text)
}

const setSrc = (filename: string) => {
  if (!videoObject.value) return

  videoObject.value.src({ type: "video/mp4", src: filename })
  videoObject.value.load()
  videoSrcIsSet.value = true
  
  videoObject.value.on("loadeddata", () => {
    videoLength.value = videoObject.value.duration()
  })

  Atime.value = null
  Btime.value = null

  videoAnalysis.value = document.createElement('video')
  videoAnalysis.value.src = filename
  videoAnalysis.value.width = 1280
  videoAnalysis.value.height = 720
  videoAnalysis.value.load()
  videoAnalysis.value.play()
  videoAnalysis.value.addEventListener('canplaythrough', getKeyPosition)
}

const getKeyPosition = async () => {
  if (!videoAnalysis.value) return
  videoAnalysis.value.removeEventListener('canplaythrough', getKeyPosition)

  const cv = await cvReadyPromise
  
  const width = videoAnalysis.value.width
  const height = videoAnalysis.value.height
  let src = new cv.Mat(height, width, cv.CV_8UC4)
  let mono = new cv.Mat(height, width, cv.CV_8UC1)

  videoAnalysis.value.pause()
  let cap = new cv.VideoCapture(videoAnalysis.value)
  cap.read(src)
  cv.cvtColor(src, mono, cv.COLOR_RGBA2GRAY)

  // binarize, canny, and houghlinesP
  cv.threshold(mono, mono, 200, 255, cv.THRESH_BINARY)
  cv.Canny(mono, mono, 0, 0, 3)
  let h_lines = new cv.Mat()
  cv.HoughLinesP(mono, h_lines, 1, Math.PI/180, 100, 1000, 100)

  // get the top and the bottom lines of the keyboard
  let minY = 1000
  let maxY = 0
  let minIndex = 0
  let maxIndex = 0
  for (let i = 0; i < h_lines.rows; ++i) {
    if (h_lines.data32S[i*4 + 1] < minY && h_lines.data32S[i*4 + 1] > mono.rows/3) {
      minY = h_lines.data32S[i*4 + 1]
      minIndex = i
    }
    if (h_lines.data32S[i*4 + 1] > maxY && h_lines.data32S[i*4 + 1] > mono.rows/3) {
      maxY = h_lines.data32S[i*4 + 1]
      maxIndex = i
    }
  }

  keyTop.value = minY
  console.log(minY)

  // cut out the keyboard region
  let rect = new cv.Rect(
    0,
    h_lines.data32S[minIndex * 4 + 1],
    width,
    (h_lines.data32S[maxIndex * 4 + 1] - h_lines.data32S[minIndex * 4 + 1]) * 7 / 9
  )
  
  let dst = mono.roi(rect)
  let colorDst = src.roi(rect)

  // dilate the image to fix dotted lines
  let M = cv.Mat.ones(3, 3, cv.CV_8U)
  let anchor = new cv.Point(-1, -1)
  cv.dilate(dst, dst, M, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue())
  cv.imshow('canvasOutput1', dst)

  // detect vertical lines
  let lines = new cv.Mat()
  cv.HoughLinesP(dst, lines, 1, Math.PI, 100, dst.rows/3*2)

  // sort position of lines
  let posList: [number, number][] = []
  for (let i = 0; i < lines.rows; ++i) {
    if (lines.data32S[i * 4] < 8) {
      continue
    }
    posList.push([lines.data32S[i * 4], lines.data32S[i * 4 + 1]])
  }
  posList.sort((a, b) => a[0] - b[0])

  // thin out the lines
  for (let i = 0; i < posList.length - 1; ++i) {
    if (Math.abs(posList[i][0] - posList[i + 1][0]) < 8) {
      posList[i + 1][0] = (posList[i][0] + posList[i + 1][0]) / 2
      posList[i + 1][1] = Math.max(posList[i][1], posList[i + 1][1])
      posList.splice(i, 1)
      i -= 1
    }
  }

  // 補完処理
  for (let i = 0; i < posList.length - 1; ++i) {
    if (posList[i + 1][0] - posList[i][0] > (dst.cols / posList.length + 10)) {
      posList.splice(i + 1, 0, [(posList[i][0] + posList[i + 1][0]) / 2, (posList[i][1] + posList[i + 1][1]) / 2])
    }
  }

  // detect first long line between B and C
  let threshold = dst.rows - 10
  let standard = 0
  for (let i = 0; i < posList.length - 13; ++i) {
    if (posList[i][1] > threshold && posList[i + 5][1] > threshold && posList[i + 12][1] > threshold) {
      standard = i % 12 + 1 - 1 * 12
      console.log("standard: ", standard)
      break
    }
  }

  // make key_list
  keyList.value = []
  for (let i = 0; i < posList.length + 1; ++i) {
    if (i == 0) {
      keyList.value.push([Math.floor(posList[i][0] / 3 * 2), i - standard])
    } else if (i == posList.length) {
      keyList.value.push([Math.floor((posList[i - 1][0] + dst.cols) / 2), i - standard])
    } else {
      keyList.value.push([Math.floor((posList[i][0] + posList[i - 1][0]) / 2), i - standard])
    }
  }

  // get key_default_color
  keyDefaultColor.value = []
  for (let i = 0; i < keyList.value.length; ++i) {
    let rem = keyList.value[i][1] % 12
    if (rem == 0 || rem == 2 || rem == 4 || rem == 5 || rem == 7 || rem == 9 || rem == 11) {
      keyDefaultColor.value.push(255) // 白鍵
    } else {
      keyDefaultColor.value.push(0) // 黒鍵
    }
  }

  console.log(keyList.value)

  // show the detected lines
  let color = new cv.Scalar(0, 255, 0, 255)
  for (let i = 0; i < posList.length; ++i) {
    let startPoint = new cv.Point(posList[i][0], 0)
    let endPoint = new cv.Point(posList[i][0], posList[i][1])
    cv.line(colorDst, startPoint, endPoint, color, 4)
  }
  cv.imshow('canvasOutput2', colorDst)
  
  M.delete()
  src.delete()
  mono.delete()
  dst.delete()
  colorDst.delete()
  videoShow.value = true
}

// AB再生関連
const setA = () => {
  if (!videoObject.value) return
  let now = videoObject.value.currentTime()
  if (Btime.value && Btime.value <= now) {
    return
  }
  Atime.value = now
}

const setB = () => {
  if (!videoObject.value) return
  let now = videoObject.value.currentTime()
  if (Atime.value && now <= Atime.value) {
    return
  }
  Btime.value = now
}

// 再生速度関連
const slower = () => {
  setSpeed(playbackRate.value - 0.05)
}

const faster = () => {
  setSpeed(playbackRate.value + 0.05)
}

const setSpeed = (rate: number) => {
  if (0 < rate && rate < 5) {
    playbackRate.value = rate
  }
}

// 光る位置の調整
const lightUp = () => {
  light.value += 1
  if (light.value > 5) {
    light.value = 9
  }
  clearAll()
}

const lightDown = () => {
  light.value -= 1
  if (light.value < -5) {
    light.value = -5
  }
  clearAll()
}

// オクターブ調整
const octaveUp = () => {
  octave.value += 1
  if (octave.value > 5) {
    octave.value = 9
  }
  practiceNote.value = Array.from({ length: 128 }, () => false)
}

const octaveDown = () => {
  octave.value -= 1
  if (octave.value < -5) {
    octave.value = -5
  }
  practiceNote.value = Array.from({ length: 128 }, () => false)
}

// その他のコントロール
const restart = () => {
  if (!videoObject.value) return
  videoObject.value.currentTime(0)
}

const toend = () => {
  if (!videoObject.value || !videoLength.value) return
  videoObject.value.currentTime(videoLength.value)
}

const clearAll = () => {
  for (let i = 0; i < 128; ++i) {
    uplightSend(i, false)
  }
}

const uplightSend = (note: number, state: boolean) => {
  if (note < 0 || note > 127) {
    return
  }
  if (state) {
    if (midiOutputIsReady.value) {
      outputDevice.value.send([0x90, note, 127])
    }
    if (note >= 35) {
      return
    }
    let rem = note % 12
    if (rem == 0 || rem == 2 || rem == 4 || rem == 5 || rem == 7 || rem == 9 || rem == 11) {
      document.getElementById("num" + note)!.style.backgroundColor = "deeppink"
    } else {
      document.getElementById("num" + note)!.style.backgroundColor = "aqua"
    }
  } else {
    if (midiOutputIsReady.value) {
      outputDevice.value.send([0x80, note, 0])
    }
    if (note >= 35) {
      return
    }
    document.getElementById("num" + note)!.style.backgroundColor = "white"
  }
}

// 練習モード関連
const practiceButton = () => {
  if (!videoObject.value) return
  videoObject.value.playbackRate(playbackRate.value)
  practiceNote.value = Array.from({ length: 128 }, () => false)
  clearAll()
}

const practiceCheck = () => {
  if (!videoObject.value) return
  if (practiceIsActive.value) {
    let isAllOff = true
    for (let i = 0; i < 128; ++i) {
      if (practiceNote.value[i]) {
        isAllOff = false
        break
      }
    }
    if (isAllOff) {
      videoObject.value.playbackRate(playbackRate.value)
    } else {
      videoObject.value.playbackRate(0)
    }
  }
}

// MIDI関連
const midiObserver = () => {
  try {
    navigator.requestMIDIAccess().then(
      (midiAccess) => {
        try {
          if (inputDevices.value.length == 0) {
            var inputIterator = midiAccess.inputs.values()
            for (var i = inputIterator.next(); !i.done; i = inputIterator.next()) {
              if (!i.value.name.match(/Uplight/)) {
                inputDevices.value.push(i.value)
                return
              }
            }
          }
          var outputIterator = midiAccess.outputs.values()
          for (var o = outputIterator.next(); !o.done; o = outputIterator.next()) {
            if (o.value.name?.match(/Uplight/)) {
              outputDevice.value = o.value
              console.log(outputDevice.value.name)
              midiOutputIsReady.value = true
              clearAll()
              if (midiObserverId.value) {
                clearInterval(midiObserverId.value)
              }
              return
            }
          } 
          console.log("cannot find Uplight")
        } catch (e) {
          console.log("cannot find MIDI device")
        }
      },
      (msg) => {
        console.log("Failed to get MIDI access - " + msg)
      }
    )
  } catch (e) {
    console.log("cannot find MIDI device")
  }
}

const setInputDevice = (input: Event) => {
  practiceNote.value = Array.from({ length: 128 }, () => false)
  const target = input.target as HTMLSelectElement
  if (target.value === "-1") {
    if (inputDevice.value) {
      inputDevice.value.onmidimessage = () => {}
    }
    inputDevice.value = null
    return
  }
  inputDevice.value = inputDevices.value[parseInt(target.value)]
  console.log(inputDevice.value.name + " is selected")
  inputDevice.value.onmidimessage = (event: any) => {
    let note = event.data[1] + octave.value * 12
    if (note < 0 || note > 127) {
      return
    }
    if (event.data[0] == 0x90) {
      if (event.data[2] == 0) {
        console.log("Input Note off: ", note)
      } else {
        console.log("Input Note on:  ", note)
        practiceNote.value[note] = false
      }
    } else if (event.data[0] == 0x80) {
      console.log("Input Note off: ", note)
    }
  }
}

const startLoop = () => {
  const videoBody = document.getElementById("my-player_html5_api") as HTMLVideoElement
  const canvas = document.createElement('canvas')
  canvas.width = 1280
  canvas.height = 720
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return

  const loop = () => {
    if (!videoObject.value) return
    if (videoObject.value.paused() || videoObject.value.seeking()) {
      practiceCheck()
    } else {
      let now = videoObject.value.currentTime()

      ctx.drawImage(videoBody, 0, 0)
      for (let i = 0; i < keyList.value.length; ++i) {
        var imageData = ctx.getImageData(keyList.value[i][0], keyTop.value! + 80, 1, 1)
        let color = Math.floor((imageData.data[0] + imageData.data[1] + imageData.data[2]) / 3)
        if (Math.abs(color - keyDefaultColor.value[i]) > 50) {
          if (!keyNoteState.value[i]) {
            keyNoteState.value[i] = true
            uplightSend(keyList.value[i][1] + light.value * 12, true)
            console.log("Note on:  ", keyList.value[i][1])
            practiceNote.value[keyList.value[i][1]] = true
          }
        } else {
          if (keyNoteState.value[i]) {
            keyNoteState.value[i] = false
            uplightSend(keyList.value[i][1] + light.value * 12, false)
            console.log("Note off: ", keyList.value[i][1])
          }
        }
      }

      //AB再生の処理
      if (
        Atime.value &&
        Btime.value &&
        ABisActive.value &&
        !videoObject.value.paused() &&
        now > Btime.value
      ) {
        videoObject.value.currentTime(Atime.value)
      }
      practiceCheck()
    }
    requestAnimationFrame(loop)
  }
  
  loop()
}

// ライフサイクルフック
onMounted(() => {
  videoObject.value = videojs("my-player")
  videoObject.value.ready(() => {
    let p = document.querySelectorAll('.vjs-progress-holder')[0]
    let markerA = document.createElement('div')
    markerA.className = 'vjs-marker marker-a'
    let markerB = document.createElement('div')
    markerB.className = 'vjs-marker marker-b'
    p.appendChild(markerA)
    p.appendChild(markerB)

    setSrc(props.videoPath)
    startLoop()      
  })

  midiObserverId.value = window.setInterval(midiObserver, 3000)
})

// ウォッチャー
watch(() => Atime.value, () => {
  if (videoSrcIsSet.value) {
    (document.querySelectorAll('.marker-a')[0] as HTMLElement).style.left = Apos.value
  }
})

watch(() => Btime.value, () => {
  if (videoSrcIsSet.value) {
    (document.querySelectorAll('.marker-b')[0] as HTMLElement).style.left = Bpos.value
  }
})

watch(() => playbackRate.value, () => {
  if (videoObject.value) {
    videoObject.value.playbackRate(playbackRate.value)
  }
})
</script>

<style scoped>
#practice_component {
  padding: 20px;
}

.bar {
  width: 80%;
  background-color: #000;
  aspect-ratio: 20 / 1;
  display: flex;
  justify-content: space-around;
  margin-bottom: 10px;
  border-radius: 1vw;
}

.bar-2 {
  margin-left: 10%;
}

.bar-3 {
  margin-left: 20%;
}

.bar-led {
  background-color: #fff;
  width: 1vw;
  height: 1vw;
  margin-top: auto;
  margin-bottom: auto;
  border-radius: 0.3vw;
}

#monitor {
  background: #000; 
  position: relative;
  border-top: 3px solid #888; 
  margin: 5%;
  padding: 2% 2% 4% 2%; 
  border-radius: 10px; 
  border-bottom-left-radius: 50% 2%; 
  border-bottom-right-radius: 50% 2%; 
  transition: margin-right 1s;
}

#monitor:after {
  content: '';
  display: block;
  position: absolute;
  bottom: 3%;
  left: 36%;
  height: .5%; 
  width: 28%;
  background: #ddd; 
  border-radius: 50%; 
  box-shadow: 0 0 3px 0 white; 
}

#monitorscreen {
  position: relative;
  background-color: #ccc;
  background-size: cover; 
  background-position: top center;
  height: 0;
  padding-bottom: 56.25%; 
  overflow: hidden;
}

@media all and (min-width: 960px) {
  #monitor {
    -webkit-animation: tvflicker .2s infinite alternate; 
    -moz-animation: tvflicker .5s infinite alternate; 
    -o-animation: tvflicker .5s infinite alternate; 
    animation: tvflicker .5s infinite alternate; 
  }

  @-webkit-keyframes tvflicker {
    0%   { box-shadow: 0 0 100px 0 rgba(200,235,255,0.4); }
    100% { box-shadow: 0 0 95px 0 rgba(200,230,255,0.45); }
  }
  @-moz-keyframes tvflicker {
    0%   { box-shadow: 0 0 100px 0 rgba(225,235,255,0.4); }
    100% { box-shadow: 0 0 60px 0 rgba(200,220,255,0.6); }
  }
  @-o-keyframes tvflicker {
    0%   { box-shadow: 0 0 100px 0 rgba(225,235,255,0.4); }
    100% { box-shadow: 0 0 60px 0 rgba(200,220,255,0.6); }
  }
  @keyframes tvflicker {
    0%   { box-shadow: 0 0 100px 0 rgba(225,235,255,0.4); }
    100% { box-shadow: 0 0 60px 0 rgba(200,220,255,0.6); }
  }
}

.keyboard-output {
  width: 100%;
  height: auto;
  margin: 10px 0;
}

.vjs-marker {
  position: absolute;
  height: 100%;
  width: 2px;
  background: white;
  z-index: 1;
}

.marker-a {
  background: red;
}

.marker-b {
  background: blue;
}

.form-check {
  display: inline-block;
  margin-left: 10px;
}

.form-check-input {
  cursor: pointer;
}
</style>
