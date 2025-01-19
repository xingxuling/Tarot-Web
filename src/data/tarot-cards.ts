import { TarotCard, TarotSpread } from '../types/tarot';

// 韦特牌组数据
export const MAJOR_ARCANA: TarotCard[] = [
  {
    id: 0,
    name: "愚者",
    nameEn: "The Fool",
    type: "major",
    meaning: {
      upright: "新的开始，冒险，自发性，纯真，自由精神",
      reversed: "鲁莽，冒失，危险，不负责任"
    },
    image: "🃏"
  },
  {
    id: 1,
    name: "魔术师",
    nameEn: "The Magician",
    type: "major",
    meaning: {
      upright: "创造力，技能，意志力，专注，主动",
      reversed: "技能误用，能力欠缺，机会错失"
    },
    image: "🎭"
  },
  // Add more major arcana cards...
];

export const SPREADS = [
  {
    id: "single",
    name: "单张牌阵",
    nameEn: "Single Card Spread",
    description: "简单的单张牌阵，适合日常占卜和回答简单问题",
    positions: [
      {
        id: 0,
        name: "当前形势",
        nameEn: "Current Situation",
        description: "代表当前情况或问题的核心",
        x: 50,
        y: 50
      }
    ]
  },
  {
    id: "three-card",
    name: "三张牌阵",
    nameEn: "Three Card Spread",
    description: "经典的三张牌阵，可以解读过去、现在和未来",
    positions: [
      {
        id: 0,
        name: "过去",
        nameEn: "Past",
        description: "影响当前情况的过去因素",
        x: 20,
        y: 50
      },
      {
        id: 1,
        name: "现在",
        nameEn: "Present",
        description: "当前的情况和挑战",
        x: 50,
        y: 50
      },
      {
        id: 2,
        name: "未来",
        nameEn: "Future",
        description: "可能的发展方向和结果",
        x: 80,
        y: 50
      }
    ]
  }
];
