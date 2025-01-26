import { TarotSpread } from './tarot-cards';

export const PREMIUM_SPREADS: TarotSpread[] = [
  {
    id: "celtic-cross-pro",
    name: "专业凯尔特十字牌阵",
    description: "完整的十字牌阵，包含详细的位置解读和关系分析",
    positions: [
      {
        id: 0,
        name: "当前处境",
        description: "代表当前的核心问题或情况",
        x: 45,
        y: 45
      },
      {
        id: 1,
        name: "交叉影响",
        description: "影响核心问题的主要因素",
        x: 55,
        y: 45
      },
      {
        id: 2,
        name: "潜意识基础",
        description: "问题的深层原因",
        x: 45,
        y: 75
      },
      {
        id: 3,
        name: "过去影响",
        description: "过去对现状的影响",
        x: 15,
        y: 45
      },
      {
        id: 4,
        name: "潜在可能",
        description: "可能达到的最佳结果",
        x: 45,
        y: 15
      },
      {
        id: 5,
        name: "近期发展",
        description: "即将发生的事情",
        x: 75,
        y: 45
      },
      {
        id: 6,
        name: "自我认知",
        description: "你对自己的看法",
        x: 45,
        y: 85
      },
      {
        id: 7,
        name: "环境影响",
        description: "他人对你的影响",
        x: 25,
        y: 65
      },
      {
        id: 8,
        name: "希望与恐惧",
        description: "内心的期待和担忧",
        x: 65,
        y: 65
      },
      {
        id: 9,
        name: "最终结果",
        description: "事情的最终走向",
        x: 45,
        y: 95
      }
    ]
  },
  {
    id: "relationship-spread",
    name: "关系解析牌阵",
    description: "深入分析两人关系的专业牌阵",
    positions: [
      {
        id: 0,
        name: "自己的立场",
        description: "你在关系中的位置",
        x: 30,
        y: 50
      },
      {
        id: 1,
        name: "对方的立场",
        description: "对方在关系中的位置",
        x: 70,
        y: 50
      },
      {
        id: 2,
        name: "关系的基础",
        description: "关系建立的根基",
        x: 50,
        y: 80
      },
      {
        id: 3,
        name: "过去的影响",
        description: "过去经历对关系的影响",
        x: 50,
        y: 20
      },
      {
        id: 4,
        name: "当前的挑战",
        description: "目前面临的问题",
        x: 50,
        y: 50
      }
    ]
  }
];

export const PREMIUM_CARDS = [
  {
    id: 100,
    name: "命运之轮",
    nameEn: "Wheel of Fortune",
    type: "major",
    meaning: {
      upright: "命运转折，机遇，周期性变化，好运降临",
      reversed: "厄运，阻碍，计划受阻，运势低迷"
    },
    image: "🎡"
  },
  {
    id: 101,
    name: "正义",
    nameEn: "Justice",
    type: "major",
    meaning: {
      upright: "公平，正义，真理，因果报应，平衡",
      reversed: "不公，失衡，偏见，欺骗，惩罚"
    },
    image: "⚖️"
  }
];
