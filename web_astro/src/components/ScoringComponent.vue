<template>
  <div class="container">
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
        <div class="mt-4">
          <h3>{{ title }} - 採点モード</h3>
          <p class="text-center">採点機能は開発中です。</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import 'video.js/dist/video-js.css';
import videojs from 'video.js';

// Props
interface Props {
  videoPath: string;
  title: string;
}
const props = defineProps<Props>();

// Setup
onMounted(() => {
  const player = videojs("my-player");
  player.ready(() => {
    player.src({ type: "video/mp4", src: props.videoPath });
    player.load();
  });
});
</script>

<style>
#monitor {
  margin-bottom: 2rem;
}
</style>
