// 韦特牌组数据
export interface TarotCard {
  id: number;
  name: string;
  nameEn: string;
  type: 'major' | 'wands' | 'cups' | 'swords' | 'pentacles';
  meaning: {
    upright: string;
    reversed: string;
    current?: string;
  };
  image: string;
  isReversed?: boolean;
}

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
  {
    id: 2,
    name: "女祭司",
    nameEn: "The High Priestess",
    type: "major",
    meaning: {
      upright: "直觉，神秘，内在知识，智慧，洞察力",
      reversed: "表面性格，混乱，缺乏洞察力"
    },
    image: "👑"
  },
  {
    id: 3,
    name: "女皇",
    nameEn: "The Empress",
    type: "major",
    meaning: {
      upright: "丰饶，母性，创造力，自然，滋养",
      reversed: "依赖，过度保护，创造力受阻"
    },
    image: "👸"
  },
  {
    id: 4,
    name: "皇帝",
    nameEn: "The Emperor",
    type: "major",
    meaning: {
      upright: "权威，领导力，稳定，控制，父性",
      reversed: "专制，僵化，过度控制"
    },
    image: "👑"
  },
  {
    id: 5,
    name: "教皇",
    nameEn: "The Hierophant",
    type: "major",
    meaning: {
      upright: "传统，信仰，教育，指导，精神追求",
      reversed: "叛逆，不守规矩，过度限制"
    },
    image: "🙏"
  },
  {
    id: 6,
    name: "恋人",
    nameEn: "The Lovers",
    type: "major",
    meaning: {
      upright: "爱情，和谐，关系，选择，价值观",
      reversed: "不和谐，分离，错误选择"
    },
    image: "💑"
  },
  {
    id: 7,
    name: "战车",
    nameEn: "The Chariot",
    type: "major",
    meaning: {
      upright: "胜利，意志力，决心，自信，进取",
      reversed: "失败，方向错误，自负"
    },
    image: "🏃"
  },
  {
    id: 8,
    name: "力量",
    nameEn: "Strength",
    type: "major",
    meaning: {
      upright: "力量，勇气，耐心，同情心，内在力量",
      reversed: "软弱，自我怀疑，缺乏信心"
    },
    image: "💪"
  },
  {
    id: 9,
    name: "隐士",
    nameEn: "The Hermit",
    type: "major",
    meaning: {
      upright: "内省，寻找智慧，独处，指导",
      reversed: "孤独，隔离，偏执"
    },
    image: "🏮"
  },
  {
    id: 10,
    name: "命运之轮",
    nameEn: "Wheel of Fortune",
    type: "major",
    meaning: {
      upright: "命运，转折点，机遇，变化",
      reversed: "厄运，阻碍，意外"
    },
    image: "🎡"
  },
  {
    id: 11,
    name: "正义",
    nameEn: "Justice",
    type: "major",
    meaning: {
      upright: "正义，平衡，真理，因果",
      reversed: "不公平，失衡，欺骗"
    },
    image: "⚖️"
  },
  {
    id: 12,
    name: "倒吊人",
    nameEn: "The Hanged Man",
    type: "major",
    meaning: {
      upright: "牺牲，放下，新视角，智慧",
      reversed: "犹豫不决，拖延，抗拒"
    },
    image: "🙃"
  },
  {
    id: 13,
    name: "死神",
    nameEn: "Death",
    type: "major",
    meaning: {
      upright: "结束，转变，重生，改变",
      reversed: "停滞，抗拒改变，恐惧"
    },
    image: "💀"
  },
  {
    id: 14,
    name: "节制",
    nameEn: "Temperance",
    type: "major",
    meaning: {
      upright: "平衡，和谐，适度，耐心",
      reversed: "不平衡，过度，冲突"
    },
    image: "🕊️"
  },
  {
    id: 15,
    name: "恶魔",
    nameEn: "The Devil",
    type: "major",
    meaning: {
      upright: "束缚，欲望，执着，物质主义",
      reversed: "释放，觉醒，重获自由"
    },
    image: "😈"
  },
  {
    id: 16,
    name: "塔",
    nameEn: "The Tower",
    type: "major",
    meaning: {
      upright: "突变，崩塌，启示，解放",
      reversed: "避免灾难，恐惧改变"
    },
    image: "🗼"
  },
  {
    id: 17,
    name: "星星",
    nameEn: "The Star",
    type: "major",
    meaning: {
      upright: "希望，信心，启发，宁静",
      reversed: "失望，丧失信心，悲观"
    },
    image: "⭐"
  },
  {
    id: 18,
    name: "月亮",
    nameEn: "The Moon",
    type: "major",
    meaning: {
      upright: "直觉，幻想，不确定性，潜意识",
      reversed: "恐惧，困惑，误解"
    },
    image: "🌙"
  },
  {
    id: 19,
    name: "太阳",
    nameEn: "The Sun",
    type: "major",
    meaning: {
      upright: "快乐，活力，成功，真理",
      reversed: "暂时的不快，自负"
    },
    image: "☀️"
  },
  {
    id: 20,
    name: "审判",
    nameEn: "Judgement",
    type: "major",
    meaning: {
      upright: "重生，内在召唤，觉醒，宽恕",
      reversed: "自我怀疑，拒绝改变"
    },
    image: "📯"
  },
  {
    id: 21,
    name: "世界",
    nameEn: "The World",
    type: "major",
    meaning: {
      upright: "完成，整合，成就，旅行",
      reversed: "未完成，停滞，拖延"
    },
    image: "🌍"
  }
];

export const WANDS: TarotCard[] = [
  {
    id: 22,
    name: "权杖王牌",
    nameEn: "Ace of Wands",
    type: "wands",
    meaning: {
      upright: "创造力的开始，灵感，潜力，机遇",
      reversed: "创意受阻，延迟，缺乏动力"
    },
    image: "🌟"
  },
  // 更多权杖牌...
];

export interface SpreadPosition {
  id: number;
  name: string;
  description: string;
  x: number;
  y: number;
  card?: TarotCard & { isReversed: boolean; meaning: { current: string } };
}

export interface TarotSpread {
  id: string;
  name: string;
  description: string;
  positions: SpreadPosition[];
}

export const TAROT_SPREADS: TarotSpread[] = [
  {
    id: "single",
    name: "单张牌阵",
    description: "简单的单张牌阵，适合日常占卜和回答简单问题",
    positions: [
      {
        id: 0,
        name: "当前形势",
        description: "代表当前情况或问题的核心",
        x: 50,
        y: 50
      }
    ]
  },
  {
    id: "three-card",
    name: "三张牌阵",
    description: "经典的三张牌阵，可以解读过去、现在和未来",
    positions: [
      {
        id: 0,
        name: "过去",
        description: "影响当前情况的过去因素",
        x: 20,
        y: 50
      },
      {
        id: 1,
        name: "现在",
        description: "当前的情况和挑战",
        x: 50,
        y: 50
      },
      {
        id: 2,
        name: "未来",
        description: "可能的发展方向和结果",
        x: 80,
        y: 50
      }
    ]
  },
  {
    id: "celtic-cross",
    name: "凯尔特十字牌阵",
    description: "详细的十字牌阵，可以全面分析问题的各个方面",
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
        name: "基础",
        description: "问题的根源或基础",
        x: 45,
        y: 75
      },
      {
        id: 3,
        name: "过去",
        description: "近期过去的影响",
        x: 15,
        y: 45
      },
      {
        id: 4,
        name: "顶部",
        description: "可能达到的最佳结果",
        x: 45,
        y: 15
      },
      {
        id: 5,
        name: "未来",
        description: "即将发生的事情",
        x: 75,
        y: 45
      }
    ]
  }
];
