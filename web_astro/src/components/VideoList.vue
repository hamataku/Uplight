<template>
  <div class="my-4">
    <h3 class="pb-2">{{ title }}</h3>
    <div class="d-flex flex-wrap justify-content-center">
      <div v-for="video in videoItems" :key="video.id" class="video-item m-3">
        <img :src="video.thumbnailUrl" :alt="video.title" class="video-thumbnail mb-2">
        <div class="video-title mb-2">{{ video.title }}</div>
        <div class="video-buttons">
          <a :href="`practice?id=${video.id}`" class="btn btn-primary m-1">練習モード</a>
          <a :href="`scoring?id=${video.id}`" class="btn btn-success m-1">採点モード</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface VideoItem {
  id: number;
  title: string;
  thumbnailUrl: string;
}

interface Props {
  list: number[];
  video_lists: { [key: number]: VideoData };
  title: string;
}

interface VideoData {
  title: string;
  thumbnailPath: string;
}

const props = defineProps<Props>();

const videoItems = computed<VideoItem[]>(() => {
  return props.list.map(id => ({
    id,
    title: props.video_lists[id].title,
    thumbnailUrl: `/Uplight/web_astro${props.video_lists[id].thumbnailPath}`
  }));
});
</script>

<style scoped>
.video-item {
  width: 300px;
  display: inline-block;
  vertical-align: top;
}

.video-thumbnail {
  width: 100%;
  height: 169px; /* 16:9 aspect ratio */
  object-fit: cover;
  border-radius: 8px;
}

.video-title {
  font-size: 1rem;
  font-weight: bold;
}

.video-buttons {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}
</style>
