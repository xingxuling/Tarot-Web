# 广告集成技术需求文档

## 1. 广告网络选项

### Google AdSense/AdMob
- 适用于网页端
- 支持横幅、插页式和原生广告
- 需要网站审核
- 集成方式：JavaScript SDK

### Unity Ads
- 支持激励视频
- 跨平台支持
- 游戏化广告体验
- 集成方式：JavaScript SDK

## 2. 前端实现需求

### 组件结构
```typescript
// 广告容器组件
interface AdContainerProps {
  type: 'banner' | 'interstitial' | 'rewarded';
  position?: 'top' | 'bottom';
  onClose?: () => void;
  onReward?: () => void;
}

// 广告上下文
interface AdContextType {
  showAd: (type: string) => Promise<void>;
  hideAd: () => void;
  isAdVisible: boolean;
  lastAdShow: Date;
}
```

### 广告状态管理
- 追踪上次展示时间
- 管理广告频率限制
- 处理广告加载状态

## 3. 后端API需求

### 广告追踪
```
POST /api/v1/ad-events
{
  "userId": string,
  "adType": string,
  "action": "view" | "click" | "complete",
  "timestamp": string
}
```

### 用户奖励
```
POST /api/v1/rewards
{
  "userId": string,
  "rewardType": string,
  "amount": number
}
```

### 统计分析
```
GET /api/v1/analytics/ads
Query Parameters:
  - startDate: string
  - endDate: string
  - adType: string
```

## 4. 数据库模型

### AdEvent
```sql
CREATE TABLE ad_events (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  ad_type VARCHAR(50),
  action VARCHAR(20),
  timestamp TIMESTAMP,
  revenue DECIMAL(10,2)
);
```

### UserReward
```sql
CREATE TABLE user_rewards (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  reward_type VARCHAR(50),
  amount INTEGER,
  granted_at TIMESTAMP
);
```

## 5. 实现优先级

1. 开屏广告集成
2. 横幅广告组件
3. 广告追踪系统
4. 奖励视频集成
5. 统计分析面板

## 6. 性能考虑

- 广告加载不应阻塞主应用加载
- 使用懒加载优化广告资源
- 实现广告失败后的优雅降级
- 缓存广告配置减少请求

## 7. 测试需求

- 广告展示/隐藏逻辑
- 奖励发放机制
- 广告频率限制
- 离线处理能力
- 错误恢复机制
