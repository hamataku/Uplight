export interface VideoData {
  id: number;
  title: string;
  videoPath: string;
  thumbnailPath: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export const videos: VideoData[] = [
  {
    id: 0,
    title: "きらきら星",
    videoPath: "/videos/kirakira_boshi.mp4",
    thumbnailPath: "/videos/kirakira_boshi.png",
    difficulty: "beginner"
  },
  {
    id: 1,
    title: "かえるのうた",
    videoPath: "/videos/kaeru_no_uta.mp4",
    thumbnailPath: "/videos/kaeru_no_uta.png",
    difficulty: "beginner"
  },
  {
    id: 2,
    title: "小さな世界",
    videoPath: "/videos/small_world.mp4",
    thumbnailPath: "/videos/small_world.png",
    difficulty: "intermediate"
  },
  {
    id: 3,
    title: "となりのトトロ",
    videoPath: "/videos/tonari_no_totoro.mp4",
    thumbnailPath: "/videos/tonari_no_totoro.png",
    difficulty: "intermediate"
  },
  {
    id: 4,
    title: "ビリーブ",
    videoPath: "/videos/believe.mp4",
    thumbnailPath: "/videos/believe.png",
    difficulty: "advanced"
  },
  {
    id: 5,
    title: "カントリーロード",
    videoPath: "/videos/country_road.mp4",
    thumbnailPath: "/videos/country_road.png",
    difficulty: "advanced"
  }
];

export const getVideoById = (id: string | null): VideoData | undefined => {
  if (id === null) return undefined;
  return videos.find(v => v.id === Number(id));
};
