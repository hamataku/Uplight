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
              <source :src="videoPath" type="video/mp4" />
            </video>
          </div>
        </div>
        <div class="bar bar-1">
          <div class="bar-led" v-for="n in 12" :key="n-1" :id="'num'+(n-1)"></div>
        </div>
        <div class="bar bar-2">
          <div class="bar-led" v-for="n in 12" :key="n+11" :id="'num'+(n+11)"></div>
        </div>
        <div class="bar bar-3">
          <div class="bar-led" v-for="n in 12" :key="n+23" :id="'num'+(n+23)"></div>
        </div>
        <br>
        <table class="table table-borderless">
          <tbody>
            <tr>
              <th scope="row">再生速度</th>
              <td>
                <button @click="slower" class="btn btn-outline-secondary btn-sm px-2">ー</button>
                <span class="font-weight-normal px-2">×{{ Math.round(playbackRate*100)/100 }}</span>
                <button @click="faster" class="btn btn-outline-secondary btn-sm px-2">＋</button>
              </td>
            </tr>
            <tr>
              <th scope="row">AB再生</th>
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
              <th scope="row">練習モード</th>
              <td>
                <select class="form-select" aria-label="MIDIキーボードを選択" @change="setInputDevice">
                  <option selected :value="-1">MIDIキーボードを選択</option>
                  <option v-for="(input, index) in inputDevices" :key="index" :value="index">
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
import { ref, onMounted, watch } from 'vue';
import 'video.js/dist/video-js.css';
import videojs from 'video.js';

// Props
interface Props {
  videoPath: string;
  title: string;
}
const props = defineProps<Props>();

// State
const videoObject = ref<any>(null);
const videoAnalysis = ref<HTMLVideoElement | null>(null);
const videoSrcIsSet = ref(false);
const ABisActive = ref(false);
const practiceIsActive = ref(false);
const videoLength = ref<number | null>(null);
const playbackRate = ref(1);
const videoShow = ref(false);
const Atime = ref<number | null>(null);
const Btime = ref<number | null>(null);

const midiOutputIsReady = ref(false);
const outputDevice = ref<any>(null);
const inputDevices = ref<any[]>([]);
const inputDevice = ref<any>(null);
const midiObserverId = ref<number | null>(null);
const practiceNote = ref(Array.from({ length: 128 }, () => false));

const keyList = ref<[number, number][]>([]);
const keyDefaultColor = ref<number[]>([]);
const keyNoteState = ref<boolean[]>([]);
const light = ref(0);
const octave = ref(0);
const keyTop = ref<number | null>(null);

// Methods
const slower = () => {
  setSpeed(playbackRate.value - 0.05);
};

const faster = () => {
  setSpeed(playbackRate.value + 0.05);
};

const setSpeed = (rate: number) => {
  if (0 < rate && rate < 5) {
    playbackRate.value = rate;
  }
};

const setA = () => {
  if (!videoObject.value) return;
  const now = videoObject.value.currentTime();
  if (Btime.value && Btime.value <= now) {
    return;
  }
  Atime.value = now;
};

const setB = () => {
  if (!videoObject.value) return;
  const now = videoObject.value.currentTime();
  if (Atime.value && now <= Atime.value) {
    return;
  }
  Btime.value = now;
};

const lightUp = () => {
  light.value += 1;
  if (light.value > 5) {
    light.value = 9;
  }
  clearAll();
};

const lightDown = () => {
  light.value -= 1;
  if (light.value < -5) {
    light.value = -5;
  }
  clearAll();
};

const octaveUp = () => {
  octave.value += 1;
  if (octave.value > 5) {
    octave.value = 9;
  }
  practiceNote.value = Array.from({ length: 128 }, () => false);
};

const octaveDown = () => {
  octave.value -= 1;
  if (octave.value < -5) {
    octave.value = -5;
  }
  practiceNote.value = Array.from({ length: 128 }, () => false);
};

const restart = () => {
  if (videoObject.value) {
    videoObject.value.currentTime(0);
  }
};

const toend = () => {
  if (videoObject.value && videoLength.value) {
    videoObject.value.currentTime(videoLength.value);
  }
};

const clearAll = () => {
  for (let i = 0; i < 128; ++i) {
    uplightSend(i, false);
  }
};

const uplightSend = (note: number, state: boolean) => {
  if (note < 0 || note > 127) {
    return;
  }
  if (state) {
    if (midiOutputIsReady.value) {
      outputDevice.value.send([0x90, note, 127]);
    }
    if (note >= 35) {
      return;
    }
    let rem = note % 12;
    const element = document.getElementById("num" + note);
    if (element) {
      if (rem == 0 || rem == 2 || rem == 4 || rem == 5 || rem == 7 || rem == 9 || rem == 11) {
        element.style.backgroundColor = "deeppink";
      } else {
        element.style.backgroundColor = "aqua";
      }
    }
  } else {
    if (midiOutputIsReady.value) {
      outputDevice.value.send([0x80, note, 0]);
    }
    if (note >= 35) {
      return;
    }
    const element = document.getElementById("num" + note);
    if (element) {
      element.style.backgroundColor = "white";
    }
  }
};

// Setup
onMounted(() => {
  videoObject.value = videojs("my-player");
  videoObject.value.ready(() => {
    let p = document.querySelectorAll('.vjs-progress-holder')[0];
    let markerA = document.createElement('div');
    markerA.className = 'vjs-marker marker-a';
    let markerB = document.createElement('div');
    markerB.className = 'vjs-marker marker-b';
    p.appendChild(markerA);
    p.appendChild(markerB);

    // Setup video
    videoObject.value.src({ type: "video/mp4", src: props.videoPath });
    videoObject.value.load();
    videoSrcIsSet.value = true;
    videoObject.value.on("loadeddata", () => {
      videoLength.value = videoObject.value.duration();
    });
  });
});

// Watches
watch(playbackRate, (newValue) => {
  if (videoObject.value) {
    videoObject.value.playbackRate(newValue);
  }
});
</script>

<style>
.bar {
  display: flex;
  justify-content: center;
  gap: 5px;
  margin: 5px 0;
}

.bar-led {
  width: 20px;
  height: 20px;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 50%;
}

.keyboard-output {
  width: 100%;
  margin-top: 10px;
}

.vjs-marker {
  position: absolute;
  width: 4px;
  height: 100%;
  background-color: white;
  opacity: 0.8;
}

.marker-a {
  background-color: blue;
}

.marker-b {
  background-color: red;
}
</style>
