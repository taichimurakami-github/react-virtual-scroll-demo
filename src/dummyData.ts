import { CardData } from "./components/CardContent";

const getRandom = (seed = 0, x = 110203489, y = 903884291, z = 793120342) => {
  // xOrShift like
  const t = x ^ (x << 11);
  x = y;
  y = z;
  z = seed;
  return seed ^ (seed >>> 19) ^ (t ^ (t >>> 8));
};

export const dummyDataList: Omit<CardData, "key">[] = [
  {
    id: 1,
    imgUrl: null,
    title: "Test Content Apple M4",
    description:
      "M4は恐るべきスピードと機能を届けます。毎日のアクティビティも、複数のアプリを使った作業とビデオ通話のマルチタスクも思いのまま。プロ向けアプリやゲームでは、精巧なコンテンツを処理することもできます。",
    date: "2024/10/10",
  },
  {
    id: 2,
    imgUrl: null,
    title: "Test Content Youtube Channel",
    description:
      "これが YouTube における、あなたの公開ステータスです。自分の動画をアップロードしたり、動画にコメントしたり、再生リストを作成したりするには、チャンネルが必要です。",
    date: "2024/11/1",
  },
  {
    id: 3,
    imgUrl: null,
    title: "Test Content Youtube Channel",
    description:
      "これが YouTube における、あなたの公開ステータスです。自分の動画をアップロードしたり、動画にコメントしたり、再生リストを作成したりするには、チャンネルが必要です。",
    date: "2024/11/1",
  },
  {
    id: 4,
    imgUrl: null,
    title: "Test Content Youtube Channel",
    description:
      "これが YouTube における、あなたの公開ステータスです。自分の動画をアップロードしたり、動画にコメントしたり、再生リストを作成したりするには、チャンネルが必要です。",
    date: "2024/11/1",
  },
  {
    id: 5,
    imgUrl: null,
    title: "Test Content Youtube Channel",
    description:
      "これが YouTube における、あなたの公開ステータスです。自分の動画をアップロードしたり、動画にコメントしたり、再生リストを作成したりするには、チャンネルが必要です。",
    date: "2024/11/1",
  },
];

export const getDummyData = (id: number, seed: number): CardData => {
  const dummyContent = dummyDataList[id];

  const key = `dummy_card_content_${getRandom(seed)}`;

  return {
    ...dummyContent,
    key,
  };
};
