# 03-HTML 原型 → Android 映射

> 依据 prototype/（index.html, js/app.js, js/data.js, js/games.js）分析，提炼 Android 还原规范。
> 游戏 ID 以完整 PRD 第128节为准（冲突处理见《PRD冲突与决策.md》冲突-002）。

---

## 1. 页面 → Android 路由映射

| HTML 页面 | Android (Navigation Compose) | 底部导航 |
|---|---|---|
| page-home 首页 | HomeScreen | 显示 |
| page-learn 学习中心 | LearningScreen | 显示 |
| page-ability 能力详情 | AbilityDetailScreen | 隐藏 |
| page-story 阅读中心 | ReadingScreen | 显示 |
| page-me 我的小岛 | ProfileScreen | 显示 |
| page-game 游戏 | GameScreen（通用容器，20个游戏共用） | 隐藏 |
| page-parent 家长中心 | ParentScreen | 隐藏 |

底部导航 4 项：首页 / 学习 / 阅读 / 我的。

---

## 2. Design System

### 颜色
| 令牌 | Hex | 用途 |
|---|---|---|
| sun | #FFB703 | 橙黄主色 |
| sun-d | #FB8500 | 橙黄深 |
| sky | #4CC9F0 | 天空蓝 |
| sky-l | #BDE0FE | 浅蓝 |
| grass | #80ED99 | 绿 |
| pink | #FF70A6 | 粉 |
| grape | #9B5DE5 | 紫 |
| cream | #FFF9EC | 页面背景 |
| ink | #4A3B2A | 主文字 |
| ink-l | #8A7B66 | 次文字 |
| gold | #FFD166 | 金色强调 |

### 能力渐变
```
att 专注  #FF9E5E→#FF6B35  等级 #FF8C42
mem 记忆  #7FD6FF→#3AA0F5  等级 #3AA0F5
log 逻辑  #C9A2FF→#8A4FE8  等级 #8A4FE8
rea 阅读  #7DE8A8→#38C172  等级 #38C172
```

### 圆角
全局卡片 24px / zone/hero 26px / 翻牌面 20px / 结果卡 30px / 胶囊 999px

### 按钮硬投影（积木风）
按钮底部深色阴影 + 按压缩影下沉

---

## 3. 游戏ID映射

| 能力 | 原型ID | Android ID | 玩法 |
|---|---|---|---|
| 专注 | find_target | attention_find_target | 6/9/12格找目标动物 |
| 专注 | find_diff | attention_find_difference | 成对相似emoji找不同 |
| 专注 | visual_track | attention_visual_tracking | 杯下藏球追踪 |
| 专注 | eliminate_interf | attention_eliminate_interference | 只点目标类别 |
| 专注 | auditory_att | attention_auditory | TTS叫声→点动物 |
| 记忆 | card_flip | memory_card | 翻牌配对 |
| 记忆 | seq_memory | memory_sequence | 序列点亮→问某位 |
| 记忆 | pic_memory | memory_image | 展示后问出现过没 |
| 记忆 | pos_memory | memory_position | 记忆位置点格子 |
| 记忆 | story_memory | memory_story | 读文章答一题 |
| 逻辑 | categorize | logic_classification | 把目标放入篮子 |
| 逻辑 | order_by | logic_sorting | 按大小顺序点选 |
| 逻辑 | pattern | logic_pattern | 序列补全 |
| 逻辑 | shape_reason | logic_shape | 图形序列补全 |
| 逻辑 | conditional | logic_condition | 比较条件推理 |
| 阅读 | story_quiz | reading_choice | 读文答一题 |
| 阅读 | story_listen | reading_story | 听TTS后答题 |
| 阅读 | story_sequence | reading_order | 按顺序点句子 |
| 阅读 | story_character | reading_character | 谁…？ |
| 阅读 | story_cause | reading_cause | 为什么…？ |

---

## 4. 计分规则

- 单次作答：答对 +3星，答错500ms后可重试
- 找全类：找全4个 +4星
- 配对类：翻牌 +pairs*2；排序 +数量*2
- 追踪：正确 +3
- 结算 total = 累计星 + (打满3轮 +5) + 10
- 星级：>=12=3星 / >=6=2星 / 否则1星

---

## 5. 动效

- 页面切换 0.38s scale(.95)+translateY(12px) 弹性缓动
- 答对 correctPop 放大+回弹+绿底#D9FBE3
- 答错 shake + 粉底#FFE3E8
- 翻牌 3D rotateY 180° 0.45s
- 结果弹层：黑遮罩+彩带confetti+皇冠+星星逐个弹入

---

## 6. 首页布局

Hero(天空渐变+太阳+小岛+🐰+问候+⭐星数) → 能力4入口2列grid(带进度) → 今日任务(🎁 2/4) → 奖励入口3列(商店/徽章/阅读)

## 7. 阅读内容

100篇, 4级(A-D), 6主题, 自动分级 age<=3→A <=4→B <=5→C 否则D
字段: id, level, theme, title, text, questions[{q,a,opts[]}]
