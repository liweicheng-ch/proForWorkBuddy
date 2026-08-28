# 奇妙脑力岛
## 3-6岁儿童智力、专注力与阅读理解训练 Android App

**文档版本：V1.0.0**  
**文档类型：Android 客户端开发 PRD**  
**项目阶段：MVP**  
**目标平台：Android**  
**开发方式：hermes / AI Coding Agent**  
**数据模式：完全本地化**  
**后端：暂不开发**  
**在线 AI：暂不接入**  

---

# 0. 给 hermes 的最高优先级说明

你现在需要根据本 PRD 开发一款完整的 Android 儿童教育 App：

> **奇妙脑力岛**

目标用户：

> 3-6岁儿童及其家长。

核心目标：

> 通过游戏化方式训练儿童的专注力、记忆力、逻辑思维和阅读理解能力。

---

## 0.1 当前开发范围

本阶段：

**只开发 Android 客户端。**

不开发：

- 后端
- Web管理后台
- CMS
- MySQL
- Redis
- API服务器
- 用户服务器
- 在线账号系统
- 云同步
- 在线支付
- 在线 AI
- 社交功能

所有数据：

> **本地存储。**

---

# 1. 强制技术环境

这是本项目最重要的技术约束。

## 1.1 版本

```text
JDK                  8
Gradle               7.2
Android Gradle Plugin 7.1.3
Kotlin               1.6.21

compileSdk            32
targetSdk             32
minSdk                23

Compose Compiler      1.2.0

Room                  2.4.3
Lifecycle              2.4.1
Navigation Compose     2.4.2
DataStore              1.0.0
Coil                  2.1.x
```

---

## 1.2 严禁自动升级

hermes 禁止未经明确批准修改：

- JDK
- Gradle
- AGP
- Kotlin
- Compose Compiler
- compileSdk
- targetSdk

禁止主动升级到：

- JDK 11
- JDK 17
- JDK 21
- Gradle 8+
- AGP 8+
- Kotlin 2.x

如果发现某个依赖与当前环境不兼容：

> 不允许自行升级整个项目。

必须报告：

```text
当前依赖：
需要版本：
冲突原因：
推荐解决方案：
```

---

# 2. 产品定位

## 2.1 产品名称

中文名称：

> 奇妙脑力岛

英文内部名称：

> BrainIsland

Application ID：

```text
com.example.brainisland
```

如果项目已有 applicationId，则保持已有配置，不要擅自修改。

---

# 3. 产品一句话定位

> 一款面向3-6岁儿童，通过游戏化学习方式训练专注力、记忆力、逻辑思维和阅读理解能力的儿童认知训练 App。

---

# 4. 产品核心理念

不是：

> 刷题 App。

而是：

> **游戏 → 思考 → 完成 → 奖励 → 能力成长 → 个性化任务**

儿童看到的是：

> 冒险、游戏、奖励、角色。

家长看到的是：

> 学习记录、能力成长、训练建议。

---

# 5. MVP核心目标

第一版本只验证以下几个问题：

1. 儿童是否愿意主动使用。
2. 儿童是否能够理解游戏规则。
3. 游戏是否具有足够趣味性。
4. 儿童是否愿意完成连续任务。
5. 家长是否能够理解孩子的学习数据。
6. 动态难度是否能够根据表现调整。
7. 本地能力模型是否能够正常运行。

---

# 6. MVP核心能力

第一版只开发4个核心能力：

```text
1. 专注力
2. 记忆力
3. 逻辑思维
4. 阅读理解
```

暂时不开发：

- 数学启蒙
- 语言表达
- 创造力

这些进入 V2。

---

# 7. 用户角色

## 7.1 儿童用户

年龄：

```text
3岁
4岁
5岁
6岁
```

儿童端要求：

- 大按钮
- 少文字
- 多图片
- 多语音
- 强动画
- 即时反馈
- 简单操作
- 无复杂菜单
- 无负面评价

---

## 7.2 家长用户

家长端负责：

- 创建孩子
- 查看能力
- 查看学习记录
- 查看学习时间
- 查看成长趋势
- 设置每日学习时间
- 设置家长密码

---

# 8. 年龄体系

必须根据年龄自动调整游戏难度。

---

## 8.1 3岁

主要：

- 颜色
- 形状
- 简单观察
- 简单匹配
- 简单记忆
- 单步指令
- 简单图片故事

---

## 8.2 4岁

主要：

- 分类
- 排序
- 简单规律
- 顺序记忆
- 简短故事理解
- 简单空间关系

---

## 8.3 5岁

主要：

- 多条件分类
- 复杂规律
- 位置记忆
- 故事情节理解
- 简单因果推理

---

## 8.4 6岁

主要：

- 多步骤规则
- 复杂图形规律
- 长序列记忆
- 故事推理
- 因果判断
- 阅读理解

---

# 9. 产品整体架构

```text
                    奇妙脑力岛
                         │
              ┌──────────┴──────────┐
              │                     │
           儿童模式              家长模式
              │                     │
       ┌──────┼──────┐        ┌─────┼─────┐
       │      │      │        │     │     │
     专注    记忆    逻辑      报告   记录  设置
       │      │      │
       └──────┼──────┘
              │
           阅读理解
              │
              ↓
          游戏引擎
              │
              ↓
          游戏结果
              │
       ┌──────┴──────┐
       ↓             ↓
    能力评分       奖励系统
       │             │
       └──────┬──────┘
              ↓
           每日任务
```

---

# 10. 本地数据架构

本阶段：

```text
Android
  │
  ├── Room
  │
  ├── DataStore
  │
  └── assets JSON
```

---

# 11. Android项目架构

采用：

> MVVM + Clean Architecture + Repository

目录：

```text
app/
├── core/
│   ├── common/
│   ├── database/
│   ├── datastore/
│   ├── model/
│   ├── navigation/
│   ├── audio/
│   ├── analytics/
│   └── ui/
│
├── data/
│   ├── local/
│   ├── repository/
│   └── json/
│
├── domain/
│   ├── model/
│   ├── repository/
│   └── usecase/
│
├── feature/
│   ├── onboarding/
│   ├── home/
│   ├── learning/
│   ├── attention/
│   ├── memory/
│   ├── logic/
│   ├── reading/
│   ├── story/
│   ├── reward/
│   ├── profile/
│   └── parent/
│
├── game/
│   ├── engine/
│   ├── component/
│   ├── animation/
│   ├── sound/
│   └── games/
│
└── MainActivity.kt
```

---

# 12. Android技术栈

必须优先使用：

```text
Kotlin
Jetpack Compose
Material 3
MVVM
Clean Architecture
Room
DataStore
Navigation Compose
Coroutines
StateFlow
Coil
Media3
```

不要引入不必要的第三方框架。

---

# 13. Java/Kotlin编译配置

必须使用：

```kotlin
android {
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }
}

kotlinOptions {
    jvmTarget = "1.8"
}
```

---

# 14. Gradle要求

`gradle-wrapper.properties`：

```text
distributionUrl=https\://services.gradle.org/distributions/gradle-7.2-bin.zip
```

不得修改。

---

# 15. App启动流程

```text
Splash
 ↓
首次启动判断
 ↓
如果第一次
 ↓
欢迎页面
 ↓
家长验证
 ↓
创建儿童
 ↓
选择年龄
 ↓
选择头像
 ↓
选择兴趣
 ↓
基础能力体验
 ↓
生成初始能力
 ↓
进入首页
```

如果已经创建孩子：

```text
Splash
 ↓
首页
```

---

# 16. 首次启动

第一次进入必须创建一个本地儿童档案。

字段：

```text
nickname
age
avatar
interests
createdAt
```

不要求：

- 手机号
- 邮箱
- 微信
- 身份证
- 精确地址

---

# 17. 儿童角色

第一版角色：

```text
兔子
小熊
小猫
小狗
小狐狸
```

角色只是陪伴角色。

角色不能制造焦虑。

禁止：

> “你怎么又错了？”

应该：

> “没关系，我们再试一次！”

---

# 18. 儿童首页

首页采用：

> **游戏世界地图**

核心区域：

```text
角色
今日任务
星星数量
学习进度
4个能力入口
故事入口
奖励入口
```

页面概念：

```text
┌──────────────────────────┐
│ ☀️ 早上好，小兔           │
│ ⭐ 120                    │
│                          │
│        🏝️               │
│     奇妙脑力岛            │
│                          │
│ 🧠 专注森林               │
│ 🧩 思维城                 │
│ 🧠 记忆山                 │
│ 📖 故事森林               │
│                          │
│ 今日任务                  │
│ ███████░░ 2/4             │
│                          │
│ 首页  学习  故事  我的    │
└──────────────────────────┘
```

---

# 19. 底部导航

固定：

```text
首页
学习
故事
我的
```

儿童端不要超过4个主导航。

---

# 20. 学习中心

学习中心显示：

```text
专注力
记忆力
逻辑思维
阅读理解
```

每个能力显示：

```text
图标
名称
当前等级
训练进度
推荐游戏
```

---

# 21. 能力颜色

不要在代码中散落颜色。

统一使用 DesignSystem。

例如：

```text
Attention
Memory
Logic
Reading
```

每个能力定义：

```text
primary
secondary
background
icon
```

---

# 22. 游戏系统

所有小游戏必须遵循统一生命周期：

```text
IDLE
 ↓
INTRO
 ↓
DEMO
 ↓
PLAYING
 ↓
SUCCESS / FAILURE
 ↓
REWARD
 ↓
FINISH
```

---

# 23. 游戏统一接口

设计统一接口：

```kotlin
interface Game {

    val gameId: String

    fun start()

    fun pause()

    fun resume()

    fun restart()

    fun finish()

}
```

游戏结果：

```kotlin
data class GameResult(
    val gameId: String,
    val score: Int,
    val accuracy: Float,
    val duration: Long,
    val difficulty: Int,
    val retryCount: Int,
    val hintCount: Int,
    val success: Boolean
)
```

---

# 24. 游戏内容配置

游戏内容不得全部硬编码。

使用：

```text
assets/games/
```

例如：

```text
assets/
└── games/
    ├── attention/
    │   ├── find_target.json
    │   ├── find_difference.json
    │   ├── visual_tracking.json
    │   ├── eliminate_interference.json
    │   └── auditory_attention.json
    │
    ├── memory/
    ├── logic/
    └── reading/
```

---

# 25. 游戏JSON

统一结构：

```json
{
  "gameId": "attention_find_target",
  "name": "找一找",
  "ability": "attention",
  "ageMin": 3,
  "ageMax": 6,
  "difficultyMin": 1,
  "difficultyMax": 10,
  "levels": []
}
```

---

# 26. 游戏关卡结构

```json
{
  "level": 1,
  "difficulty": 1,
  "instruction": "找到小猫",
  "instructionAudio": "find_cat.mp3",
  "itemCount": 3,
  "targetCount": 1,
  "reward": 10
}
```

---

# 27. 第一版游戏数量

必须完成：

> **20个核心小游戏。**

---

# 28. 专注力游戏

## GAME-001 找目标

规则：

屏幕出现多个物体。

系统：

> “找到小猫。”

儿童点击小猫。

难度：

```text
Level 1：3个物体
Level 2：4个物体
Level 3：5个物体
Level 4：6个物体
Level 5：7个物体
Level 6：8个物体
Level 7：9个物体
Level 8：10个物体
Level 9：11个物体
Level 10：12个物体
```

训练：

> 视觉选择性注意。

---

# 29. GAME-002 找不同

屏幕出现相似物体。

找出唯一不同。

难度：

- 元素数量
- 差异大小
- 干扰程度

逐步增加。

---

# 30. GAME-003 视觉追踪

一个目标移动。

儿童需要持续观察目标。

最终选择目标出现的位置。

---

# 31. GAME-004 消除干扰

例如：

屏幕有：

```text
苹果
香蕉
汽车
草莓
球
```

语音：

> “只找到水果。”

儿童只能点击水果。

---

# 32. GAME-005 听觉注意

播放：

```text
狗叫
猫叫
汽车
鸟叫
```

要求：

> “听到小狗叫的时候点击小狗。”

训练：

> 听觉注意。

---

# 33. 记忆力游戏

## GAME-006 翻牌记忆

显示卡片。

点击后翻开。

记忆相同图片位置。

---

# 34. GAME-007 顺序记忆

依次显示：

```text
🐶 → 🍎 → 🚗
```

隐藏。

问题：

> 第二个是什么？

---

# 35. GAME-008 图片记忆

展示图片3-8秒。

隐藏。

询问：

> “刚才哪个出现过？”

---

# 36. GAME-009 位置记忆

显示：

```text
🐱
     🍎

⭐
```

隐藏。

询问：

> “小猫刚才在哪里？”

---

# 37. GAME-010 故事记忆

播放简短故事。

完成后回答：

- 谁出现了？
- 在哪里？
- 做了什么？
- 什么颜色？
- 先发生什么？

---

# 38. 逻辑游戏

## GAME-011 分类

把物品拖入：

```text
动物
水果
交通工具
```

---

# 39. GAME-012 排序

例如：

```text
小 → 中 → 大
```

儿童拖动排列。

---

# 40. GAME-013 找规律

```text
🔴 🔵 🔴 🔵 ?
```

选择：

```text
🔴
```

---

# 41. GAME-014 图形推理

例如：

```text
▲ ● ▲ ● ?
```

选择：

```text
▲
```

---

# 42. GAME-015 条件推理

例如：

> 小兔比小猫高，小猫比小狗高。

问题：

> 谁最高？

---

# 43. 阅读理解

## GAME-016 听故事

播放：

30秒～3分钟故事。

儿童听故事。

完成后可以：

- 选择答案
- 排序
- 找人物

---

# 44. GAME-017 故事选择

故事：

> 小兔子今天去森林找苹果。

问题：

> 小兔子去了哪里？

答案：

> 森林。

---

# 45. GAME-018 故事排序

提供4张图片。

儿童按照故事发生顺序排列。

---

# 46. GAME-019 人物判断

故事：

> 小熊拿着红色气球来到公园。

问题：

> 谁拿着气球？

答案：

> 小熊。

---

# 47. GAME-020 因果推理

例如：

> 小熊没有带雨伞就出门，后来下雨了。

问题：

> 小熊为什么被雨淋湿？

训练：

> 因果理解。

---

# 47.5 阅读理解题库规范

## 47.5.1 题库规模

总计 100 篇文章，按年龄分级：

| 级别 | 年龄 | 篇数 | 特征 |
|---|---|---|---|
| Level A | 3岁 | 25篇 | 短句为主，生活场景，2道题 |
| Level B | 4岁 | 25篇 | 扩展段落，自然/科学入门，3道题 |
| Level C | 5岁 | 25篇 | 科普知识，多步骤推理，3道题 |
| Level D | 6岁 | 25篇 | 深度科普，情感理解，3-4道题 |

## 47.5.2 主题分布

6大主题，每个级别均衡覆盖：动物、自然、科学、冒险、日常、情绪。

## 47.5.3 数据结构

```json
{
  "id": "A01",
  "level": "A",
  "theme": "animal",
  "title": "小猫钓鱼",
  "text": "小猫去河边钓鱼。河水清清的...",
  "questions": [
    {
      "q": "小猫去干什么？",
      "a": "钓鱼",
      "opts": ["钓鱼", "游泳", "跑步"]
    }
  ]
}
```

## 47.5.4 存储

- 文件：`js/reading_content.js`
- 全局变量：`ReadingContent` 数组
- 按 `level` 字段筛选对应年龄

## 47.5.5 年龄自动分级

```javascript
function getReadingLevel() {
  var age = state.age;
  if (age <= 3) return 'A';
  if (age <= 4) return 'B';
  if (age <= 5) return 'C';
  return 'D';
}
```

---

# 48. 游戏难度

统一：

```text
1-10
```

---

# 49. 动态难度算法

每个游戏保存：

```text
accuracy
duration
retryCount
hintCount
difficulty
```

规则：

```text
连续3次正确率 >= 90%
→ difficulty + 1

连续2次正确率 <= 50%
→ difficulty - 1

50% < accuracy < 90%
→ 保持
```

范围：

```text
1 <= difficulty <= 10
```

---

# 50. 特殊情况

如果儿童连续失败：

```text
降低难度
增加提示
减少干扰元素
```

如果儿童连续成功：

```text
提高难度
增加干扰
增加元素
增加步骤
```

---

# 51. 提示系统

每个游戏支持：

```text
hintCount
```

提示不直接给答案。

例如：

错误：

> “答案是小猫。”

禁止。

应该：

> “再仔细看看，它的耳朵是什么形状？”

---

# 52. 游戏时间

默认：

```text
单局30秒～5分钟
```

复杂故事：

```text
最多10分钟
```

---

# 53. 游戏反馈

成功：

> “太棒啦！”

失败：

> “再试一次！”

连续失败：

> 自动降低难度。

连续成功：

> 适当提高难度。

禁止：

- 红色大叉
- 错误警报
- “失败”
- “你错了”
- “太差了”

---

# 54. 游戏结果

儿童端：

```text
🎉 完成啦！

⭐⭐⭐⭐⭐

获得：
⭐ 20星星

🏆 获得新徽章
```

不显示：

```text
错误3题
正确7题
```

这些数据进入家长报告。

---

# 55. 奖励系统

奖励：

```text
星星
徽章
角色装饰
家园装饰
```

---

# 56. 星星规则

基础：

```text
完成任务 +10
```

额外：

```text
首次完成 +10
连续任务 +5
高难度 +5
```

每日星星建议设置上限。

---

# 57. 成就

第一版：

```text
第一次完成游戏
完成5个游戏
完成10个游戏
完成20个游戏
连续学习3天
连续学习7天
专注力达到60
记忆力达到60
逻辑达到60
阅读达到60
完成第一个故事
完成10个故事
```

---

# 58. 每日任务

每天默认：

```text
专注力 1个
记忆力 1个
逻辑 1个
阅读 1个
```

总计：

> 4个任务。

完成：

> 今日学习完成。

---

# 59. 每日学习时间

默认：

```text
3-4岁：15分钟
4-5岁：20分钟
5-6岁：30分钟
```

家长可以修改。

---

# 60. 时间控制

支持：

```text
dailyLimit
sessionLimit
restReminder
```

例如：

```text
每日30分钟
单次10分钟
```

达到时间：

> “今天的脑力冒险完成啦，明天再见！”

---

# 61. 能力评分

四个能力：

```text
attention
memory
logic
reading
```

初始：

```text
50
```

每次游戏结束后计算。

---

# 62. 能力评分公式

基础表现：

```text
performance =
accuracy * 0.5
+ speedScore * 0.15
+ independenceScore * 0.15
+ difficultyScore * 0.20
```

新的能力：

```text
newScore =
oldScore * 0.7
+
performance * 0.3
```

能力评分范围：

```text
0-100
```

一次游戏不能造成巨大分数变化。

---

# 63. 能力等级

```text
0-39   正在成长
40-59  基础阶段
60-74  稳定阶段
75-89  良好阶段
90-100 优秀阶段
```

儿童端不要显示负面评价。

---

# 64. 能力趋势

保存：

```text
previousScore
currentScore
trend
```

趋势：

```text
UP
DOWN
STABLE
```

家长端显示：

```text
专注力 76 ↑
记忆力 68 ↑
逻辑力 72 →
阅读力 59 ↑
```

---

# 65. 学习记录

每次游戏结束记录：

```text
id
childId
gameId
ability
difficulty
score
accuracy
duration
retryCount
hintCount
success
createdAt
```

---

# 66. Room数据库

核心Entity：

```text
ChildEntity
AbilityEntity
GameEntity
GameSessionEntity
AnswerRecordEntity
DailyTaskEntity
RewardEntity
AchievementEntity
LearningRecordEntity
StoryEntity
AppSettingEntity
```

---

# 67. ChildEntity

字段：

```text
id
nickname
age
avatar
interests
createdAt
updatedAt
```

---

# 68. AbilityEntity

字段：

```text
id
childId
abilityType
score
level
accuracy
totalSessions
previousScore
trend
updatedAt
```

---

# 69. GameSessionEntity

字段：

```text
id
childId
gameId
abilityType
difficulty
score
accuracy
duration
retryCount
hintCount
success
createdAt
```

---

# 70. DailyTaskEntity

字段：

```text
id
childId
date
gameId
abilityType
difficulty
status
completedAt
```

状态：

```text
PENDING
PLAYING
COMPLETED
SKIPPED
```

---

# 71. DataStore

DataStore只保存轻量配置：

```text
isFirstLaunch
selectedChildId
parentPin
dailyLimit
sessionLimit
soundEnabled
musicEnabled
notificationEnabled
```

不要把大量学习数据放DataStore。

---

# 72. 本地JSON

游戏内容：

```text
assets/games/
```

故事：

```text
assets/stories/
```

音频：

```text
assets/audio/
```

图片：

```text
assets/images/
```

---

# 73. 离线运行

核心功能必须完全离线：

- 首页
- 学习
- 游戏
- 故事
- 奖励
- 能力报告
- 学习记录
- 家长设置

禁止核心功能依赖网络。

---

# 74. AI架构预留

虽然 V1 不接在线 AI，但代码必须预留接口。

定义：

```kotlin
interface RecommendationEngine {

    fun generateDailyPlan(
        child: Child,
        abilities: List<Ability>,
        records: List<GameSession>
    ): DailyPlan
}
```

第一版实现：

```text
RuleBasedRecommendationEngine
```

未来：

```text
AIRecommendationEngine
```

不要在业务层直接写：

```text
OpenAI
Claude
Gemini
```

---

# 75. 本地推荐规则

例如：

```text
reading < 60
→ 阅读任务权重 +30%

attention < 60
→ 专注任务权重 +20%

memory < 60
→ 记忆任务权重 +20%

logic < 60
→ 逻辑任务权重 +20%
```

同一游戏连续完成：

```text
3次高正确率
→ 优先提高难度
```

---

# 76. 家长模式

进入方式：

```text
儿童端
 ↓
长按家长入口
 ↓
PIN验证
 ↓
家长中心
```

第一版使用：

> 4位数字PIN。

---

# 77. 家长首页

显示：

```text
孩子昵称
年龄

今日学习
学习时间
完成任务
正确率

能力表现
```

---

# 78. 能力报告

显示：

```text
能力雷达图
```

如果雷达图实现复杂，可以第一版使用：

```text
横向进度条
```

例如：

```text
专注力  █████████░ 76
记忆力  ████████░░ 68
逻辑力  ████████░░ 72
阅读力  ██████░░░░ 59
```

---

# 79. 学习记录

支持：

```text
今天
最近7天
最近30天
```

显示：

```text
游戏名称
能力
难度
正确率
用时
```

---

# 80. 家长学习建议

第一版不使用AI。

采用规则：

```text
如果阅读 < 60：

建议：
“最近可以多进行故事理解训练。”

如果专注 < 60：

建议：
“可以适当增加短时间专注游戏。”

如果记忆 < 60：

建议：
“可以增加顺序记忆和图片记忆训练。”
```

---

# 81. 家长设置

包括：

```text
每日学习时间
单次学习时间
声音
音乐
家长PIN
儿童信息
关于App
隐私
```

---

# 82. 儿童模式禁止功能

儿童不能：

- 修改年龄
- 修改家长PIN
- 删除孩子
- 修改时间限制
- 购买会员
- 修改隐私设置

---

# 83. 设计原则

儿童UI必须：

- 大按钮
- 大图片
- 大图标
- 少文字
- 圆角
- 明亮
- 友好
- 动画
- 语音提示

---

# 84. 点击区域

所有儿童核心操作：

> 最小44dp。

建议：

> 56dp以上。

---

# 85. 动画

必须提供：

- 页面进入动画
- 卡片动画
- 点击缩放
- 成功动画
- 奖励动画
- 星星飞行动画
- 角色动画
- 游戏转场

---

# 86. 音频

支持：

```text
背景音乐
点击音效
成功音效
奖励音效
语音指导
故事语音
```

用户可以关闭。

---

# 87. 音频降级

如果音频资源不存在：

> App仍然正常运行。

不能因为音频加载失败导致崩溃。

---

# 88. 图片资源

资源必须合法。

优先：

1. 自制
2. AI生成
3. 合法商业素材

禁止直接复制：

- 其他App图片
- 游戏角色
- 商业IP
- 未授权音乐

---

# 89. 屏幕适配

至少支持：

```text
手机
小屏
大屏
平板
横屏/竖屏根据产品最终定义
```

第一版默认：

> 竖屏。

---

# 90. 屏幕方向

默认：

```text
portrait
```

游戏也默认竖屏。

如果后续某个游戏需要横屏，再单独设计。

---

# 91. 性能要求

目标：

```text
App启动 <= 3秒
普通页面 <= 1秒
游戏启动 <= 2秒
动画目标 >= 60 FPS
```

低端Android设备也必须基本可用。

---

# 92. 内存要求

避免：

- 大图片直接加载
- 无限制缓存
- 游戏资源常驻内存
- 不释放MediaPlayer
- 不释放动画资源

---

# 93. 崩溃处理

任何游戏异常：

> 不能让整个App崩溃。

游戏层出现异常：

```text
Game Error
 ↓
安全退出当前游戏
 ↓
保存必要数据
 ↓
返回游戏列表
```

儿童端显示：

> “刚才的小岛出了点小问题，我们重新来一次吧！”

---

# 94. Repository设计

例如：

```kotlin
interface ChildRepository {

    fun getCurrentChild(): Flow<Child?>

    suspend fun saveChild(child: Child)

    suspend fun updateChild(child: Child)
}
```

游戏：

```kotlin
interface GameRepository {

    suspend fun getGames(): List<Game>

    suspend fun getGame(gameId: String): Game?

    suspend fun getRecommendedGames(): List<Game>
}
```

---

# 95. UseCase

至少：

```text
CreateChildUseCase
GetChildUseCase
GetGamesUseCase
StartGameUseCase
FinishGameUseCase
CalculateAbilityUseCase
UpdateDifficultyUseCase
GenerateDailyPlanUseCase
GetLearningReportUseCase
AddRewardUseCase
UnlockAchievementUseCase
```

---

# 96. ViewModel

每个功能独立ViewModel。

例如：

```text
HomeViewModel
LearningViewModel
GameViewModel
RewardViewModel
ParentHomeViewModel
AbilityReportViewModel
LearningRecordViewModel
```

---

# 97. 状态管理

使用：

```text
StateFlow
```

UI不得直接操作数据库。

正确：

```text
UI
 ↓
ViewModel
 ↓
UseCase
 ↓
Repository
 ↓
Room
```

错误：

```text
UI
 ↓
Room
```

---

# 98. 导航

统一使用：

```text
Navigation Compose
```

Routes集中管理。

例如：

```text
Splash
Onboarding
ChildCreate
Home
Learning
GameList
GamePlay
GameResult
Story
Reward
Profile
ParentVerify
ParentHome
AbilityReport
LearningRecord
Settings
```

禁止在各页面散落字符串Route。

---

# 99. 错误处理

统一：

```text
UiState
```

例如：

```kotlin
sealed class UiState<out T> {
    object Loading : UiState<Nothing>()
    data class Success<T>(val data: T) : UiState<T>()
    data class Error(val message: String) : UiState<Nothing>()
}
```

---

# 100. 日志

可以使用统一Logger。

开发环境：

> DEBUG。

Release：

> 禁止输出儿童敏感信息。

日志不能打印：

- 儿童真实身份信息
- 家长PIN
- 敏感数据

---

# 101. 埋点

V1不接服务器。

本地保存基础统计：

```text
app_open
game_start
game_finish
game_success
game_failure
hint_used
retry
reward_received
story_start
story_finish
daily_plan_start
daily_plan_finish
parent_open
report_view
```

以后接服务器时可以直接上传。

---

# 102. 测试

必须实现：

## Unit Test

测试：

- 能力评分
- 动态难度
- 奖励计算
- 每日任务
- 推荐算法

---

## UI Test

测试：

- 首页
- 游戏
- 游戏结果
- 家长验证
- 能力报告

---

# 103. 核心业务测试

必须验证：

```text
创建儿童
 ↓
选择年龄
 ↓
进入首页
 ↓
开始游戏
 ↓
完成游戏
 ↓
产生GameResult
 ↓
保存GameSession
 ↓
更新Ability
 ↓
生成Reward
 ↓
更新DailyTask
 ↓
更新Recommendation
```

---

# 104. 数据一致性

游戏完成必须保证：

```text
GameSession
Ability
Reward
DailyTask
```

数据状态正确。

如果中途异常：

> 不能重复发放奖励。

---

# 105. 防止重复奖励

每个任务：

```text
DailyTask.id
```

只能完成一次。

如果重复提交：

> 不得重复增加星星。

---

# 106. 首次能力测评

不要叫：

> 测试。

儿童端叫：

> “来玩几个小游戏吧！”

默认完成：

```text
专注力 2题
记忆力 2题
逻辑 2题
阅读 2题
```

共：

> 8个小游戏。

根据结果建立初始能力。

---

# 107. 默认能力

如果测评不足：

```text
score = 50
```

并随着真实学习数据逐步调整。

---

# 108. 本地备份

第一版可以提供：

> 导出学习数据。

格式：

```text
JSON
```

用于开发测试。

未来再做云同步。

---

# 109. 数据删除

家长端支持：

> 删除儿童数据。

删除后：

```text
Child
Ability
GameSession
DailyTask
Reward
Achievement
LearningRecord
```

全部删除。

---

# 110. 商业化

V1暂不实现支付。

但是页面结构预留：

```text
SubscriptionScreen
```

暂时显示：

> “会员功能即将开放。”

禁止儿童端显示购买按钮。

---

# 111. V1不做的功能

明确禁止开发：

```text
后端
在线账号
手机号登录
微信登录
云同步
CMS
在线AI
AI聊天
AI语音识别
在线支付
广告
社交
排行榜
好友
直播
社区
商城
3D世界
多人游戏
```

如果hermes发现这些功能：

> 不要主动开发。

---

# 112. V2规划

V2增加：

```text
数学启蒙
语言表达
创造力
100+小游戏
500+关卡
AI故事
AI学习建议
AI语音
宠物系统
家园系统
更多角色
```

---

# 113. V3规划

V3：

```text
AI个性化学习
儿童能力成长模型
智能课程系统
云端账号
家长多设备同步
CMS
AI内容生产
在线数据分析
```

---

# 114. 第一阶段开发任务

hermes必须按照以下顺序开发。

---

## TASK-001

项目初始化。

完成：

- Gradle
- Android Plugin
- Kotlin
- Compose
- 基础Activity
- Git

验收：

```text
gradlew.bat assembleDebug
```

必须：

```text
BUILD SUCCESSFUL
```

---

## TASK-002

建立项目目录。

---

## TASK-003

建立Design System。

包括：

- Color
- Typography
- Shape
- Button
- Card
- Icon
- Animation

---

## TASK-004

建立Room数据库。

---

## TASK-005

建立DataStore。

---

## TASK-006

建立Navigation。

---

## TASK-007

完成首次启动流程。

---

## TASK-008

完成儿童档案。

---

## TASK-009

完成儿童首页。

---

## TASK-010

完成学习中心。

---

## TASK-011

建立GameEngine。

---

## TASK-012

完成GAME-001。

---

## TASK-013

完成GAME-002。

---

## TASK-014

完成GAME-003。

---

## TASK-015

完成GAME-004。

---

## TASK-016

完成GAME-005。

---

## TASK-017

完成GAME-006。

---

## TASK-018

完成GAME-007。

---

## TASK-019

完成GAME-008。

---

## TASK-020

完成GAME-009。

---

## TASK-021

完成GAME-010。

---

## TASK-022

完成GAME-011。

---

## TASK-023

完成GAME-012。

---

## TASK-024

完成GAME-013。

---

## TASK-025

完成GAME-014。

---

## TASK-026

完成GAME-015。

---

## TASK-027

完成GAME-016。

---

## TASK-028

完成GAME-017。

---

## TASK-029

完成GAME-018。

---

## TASK-030

完成GAME-019。

---

## TASK-031

完成GAME-020。

---

## TASK-032

完成奖励系统。

---

## TASK-033

完成能力评分。

---

## TASK-034

完成动态难度。

---

## TASK-035

完成每日任务。

---

## TASK-036

完成成就系统。

---

## TASK-037

完成家长验证。

---

## TASK-038

完成家长首页。

---

## TASK-039

完成能力报告。

---

## TASK-040

完成学习记录。

---

## TASK-041

完成时间控制。

---

## TASK-042

完成设置。

---

## TASK-043

完善离线能力。

---

## TASK-044

完善异常处理。

---

## TASK-045

完成Unit Test。

---

## TASK-046

完成UI Test。

---

## TASK-047

性能优化。

---

## TASK-048

完整回归测试。

---

## TASK-049

Release构建。

---

# 115. hermes执行方式

hermes不能一次性执行全部TASK。

每次只执行：

> 一个Task。

例如：

```text
执行 TASK-001。
```

完成之后：

```text
执行 TASK-002。
```

---

# 116. 每个Task执行流程

每个Task必须：

```text
1. 阅读PRD
2. 检查当前项目状态
3. 分析任务
4. 修改代码
5. 编译
6. 测试
7. 修复问题
8. 再次编译
9. 汇报
```

---

# 117. Task完成报告格式

hermes完成任务后必须输出：

```text
TASK ID:

TASK NAME:

完成内容：

新增文件：

修改文件：

删除文件：

数据库变化：

功能变化：

测试命令：

测试结果：

BUILD RESULT:

已知问题：

下一步建议：
```

---

# 118. 禁止行为

hermes禁止：

1. 一次性生成全部代码。
2. 修改技术栈。
3. 升级Gradle。
4. 升级JDK。
5. 升级Kotlin。
6. 删除已有功能。
7. 修改数据库却不迁移。
8. 为了编译通过而删除代码。
9. 引入没有必要的依赖。
10. 使用未经授权的资源。
11. 把API Key写入客户端。
12. 把儿童敏感信息打印到日志。
13. 擅自开发后端。
14. 擅自加入在线AI。
15. 擅自加入支付。
16. 擅自改变产品定位。

---

# 119. 如果需求存在冲突

优先级：

```text
儿童安全
>
数据安全
>
项目稳定性
>
核心学习功能
>
用户体验
>
性能
>
扩展性
>
新功能
```

---

# 120. 如果需要引入新依赖

必须先检查：

```text
JDK 8兼容性
Gradle 7.2兼容性
AGP 7.1.3兼容性
Kotlin 1.6.21兼容性
```

如果无法确认：

> 不引入。

---

# 121. 如果发现技术方案不合理

不要直接重构整个项目。

先报告：

```text
问题：
原因：
影响：
推荐方案：
是否需要修改PRD：
```

等待确认。

---

# 122. 图片资源处理

第一版如果没有正式美术资源：

允许先使用：

- Emoji
- 简单Vector
- Compose Canvas
- Kotlin绘制图形
- 临时占位资源

但是必须保证：

> 产品流程完整。

不要为了等待图片资源而阻塞开发。

---

# 123. 游戏资源原则

第一版重点验证：

> 游戏玩法。

因此可以先使用：

```text
VectorDrawable
Canvas
Emoji
简单图形
```

后续再替换正式美术资源。

---

# 124. 儿童体验原则

所有失败都必须友好。

成功：

> “太棒啦！”

失败：

> “再试一次！”

连续失败：

> 降低难度。

儿童不能看到：

> “失败”。

---

# 125. 无障碍和操作

尽可能：

- 大点击区域
- 高对比度
- 不依赖文字
- 支持语音
- 图标清晰

---

# 126. 游戏声音

每个小游戏可以包含：

```text
instruction
success
failure
reward
```

如果资源不存在：

> 自动降级为系统文字提示。

---

# 127. 数据模型枚举

能力：

```kotlin
enum class AbilityType {
    ATTENTION,
    MEMORY,
    LOGIC,
    READING
}
```

任务状态：

```kotlin
enum class TaskStatus {
    PENDING,
    PLAYING,
    COMPLETED,
    SKIPPED
}
```

游戏状态：

```kotlin
enum class GameState {
    IDLE,
    INTRO,
    DEMO,
    PLAYING,
    SUCCESS,
    FAILURE,
    REWARD,
    FINISH
}
```

趋势：

```kotlin
enum class Trend {
    UP,
    DOWN,
    STABLE
}
```

---

# 128. 游戏ID规范

统一：

```text
attention_find_target
attention_find_difference
attention_visual_tracking
attention_eliminate_interference
attention_auditory

memory_card
memory_sequence
memory_image
memory_position
memory_story

logic_classification
logic_sorting
logic_pattern
logic_shape
logic_condition

reading_story
reading_choice
reading_order
reading_character
reading_cause
```

---

# 129. 文件命名规范

Kotlin：

```text
PascalCase
```

例如：

```text
HomeScreen.kt
HomeViewModel.kt
GameEngine.kt
AbilityRepository.kt
```

资源：

```text
snake_case
```

例如：

```text
find_target.json
success.wav
cat.png
```

---

# 130. Git规范

提交：

```text
feat:
fix:
refactor:
test:
docs:
chore:
```

例如：

```text
feat: implement child profile
feat: add attention find target game
fix: prevent duplicate reward
test: add ability score tests
```

---

# 131. MVP最终验收

必须能够完整运行：

```text
安装APK
 ↓
启动
 ↓
创建儿童
 ↓
选择年龄
 ↓
选择角色
 ↓
进入首页
 ↓
查看今日任务
 ↓
进入游戏
 ↓
完成游戏
 ↓
获得星星
 ↓
更新能力
 ↓
生成下一任务
 ↓
进入家长模式
 ↓
查看能力报告
 ↓
查看学习记录
 ↓
设置学习时间
```

整个过程：

> **无需网络。**

---

# 132. MVP最终质量要求

必须满足：

```text
可以编译
可以安装
可以运行
不依赖后端
不依赖网络
核心游戏不崩溃
数据可以保存
能力可以计算
难度可以调整
奖励不会重复
家长报告可以查看
```

---

# 133. 第一版最终目标

最终 APK 打开后，用户应该能够：

> 创建一个3-6岁儿童。

然后：

> 选择角色。

然后：

> 进入奇妙脑力岛。

然后：

> 完成每日4个小游戏。

然后：

> 获得星星和奖励。

然后：

> 查看能力成长。

然后：

> 家长进入家长模式查看学习报告。

整个体验应该形成：

```text
创建孩子
    ↓
能力体验
    ↓
今日任务
    ↓
游戏
    ↓
奖励
    ↓
能力成长
    ↓
新的任务
    ↓
继续学习
```

---

# 134. hermes第一条执行命令

阅读完成本 `prd.md` 后：

**不要立即实现整个项目。**

首先执行：

```text
TASK-001
```

并只完成项目初始化。

第一阶段必须做到：

```text
JDK 8
Gradle 7.2
AGP 7.1.3
Kotlin 1.6.21
compileSdk 32
targetSdk 32
minSdk 23
Jetpack Compose
```

然后执行：

```text
gradlew.bat clean
gradlew.bat assembleDebug
```

确认：

```text
BUILD SUCCESSFUL
```

之后停止。

等待下一条指令。

---

# 135. 最终原则

本项目的核心不是：

> “尽可能多写代码。”

而是：

> **用最少的代码建立一个稳定、可扩展、儿童真正愿意使用的游戏化学习产品。**

第一阶段：

> **先把体验做对。**

第二阶段：

> **再把内容做多。**

第三阶段：

> **最后接入AI和后端。**

任何新功能，如果不能提升：

> 儿童学习体验、学习闭环或者家长价值，

都不应该进入 MVP。