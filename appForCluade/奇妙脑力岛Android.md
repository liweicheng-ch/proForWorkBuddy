# 奇妙脑力岛 Android 客户端自动开发总控 Prompt

## 0. Agent 角色

你现在接手一个完整的儿童智力提升 Android App 项目。

你同时承担以下角色：

- Android 产品经理
- Android 架构师
- Android 高级开发工程师
- UI/UX 开发工程师
- 儿童教育产品开发工程师
- 小游戏开发工程师
- 音频/图片资源管理工程师
- QA 测试工程师
- 自动化测试工程师
- Code Review 工程师

你的目标不是给我提供代码示例，而是：

【直接在本地项目中完成 Android 客户端的实际开发、编译、测试和修复。】

---

# 1. 项目目录

项目根目录：

E:\code\myAiPro\kidForWorkBuddy

现有需求文档：

E:\code\myAiPro\kidForWorkBuddy\prd.md

E:\code\myAiPro\kidForWorkBuddy\prdv2.1.md

E:\code\myAiPro\kidForWorkBuddy\奇妙脑力岛完整 PRD.md

项目中已经存在 HTML 原型。

你必须主动扫描整个项目目录，找到 HTML 原型的实际位置。

同时检查：

- html
- css
- js
- json
- images
- svg
- audio
- fonts
- icon
- animation
- mock
- data

等所有相关文件。

---

# 2. 最重要的项目范围限制

## 当前版本只开发 Android 客户端。

【不开发服务器】

【不开发后端】

【不开发 API 服务】

【不开发管理后台】

【不开发云数据库】

【不开发用户云同步】

【不开发服务器账号系统】

【不开发服务器登录】

【不开发服务器接口】

【不需要与服务器进行任何业务交互】

---

# 3. 网络限制

当前版本：

【核心功能必须完全离线运行。】

正常使用 App 时：

不依赖互联网。

不得为了实现普通功能而引入：

- Retrofit
- OkHttp
- Volley
- WebSocket
- REST API
- GraphQL
- Firebase
- 云数据库
- 远程用户系统

如果某个依赖仅仅是某个第三方 SDK 的内部依赖，必须确认其是否真的需要联网。

如果没有必要：

不要引入。

---

# 4. 数据全部本地化

当前版本所有数据都保存在 Android 本地。

包括：

- 用户信息
- 用户昵称
- 用户头像
- 年龄
- 游戏进度
- 关卡进度
- 游戏得分
- 星级
- 金币
- 勋章
- 成就
- 错题
- 正确率
- 游戏时间
- 学习记录
- 连续学习
- 设置
- 音效设置
- 背景音乐设置
- 游戏解锁状态
- 阅读记录
- 阅读理解结果
- 训练统计

---

# 5. 本地数据方案

根据实际数据规模选择：

简单配置：

SharedPreferences

结构化数据：

Room

静态游戏数据：

JSON

静态题目：

JSON

资源：

res/drawable

res/raw

assets

不要为了简单而把所有数据全部写死在 Kotlin/Java 代码中。

---

# 6. 本地数据架构

建议设计：

User

Game

GameLevel

GameQuestion

GameRecord

UserProgress

Achievement

DailyTraining

ReadingRecord

Setting

等实体。

最终根据 PRD 调整。

例如：

User：

- id
- name
- avatar
- age
- createdAt

GameRecord：

- id
- userId
- gameId
- levelId
- score
- correct
- wrong
- duration
- stars
- createdAt

UserProgress：

- userId
- gameId
- currentLevel
- maxLevel
- totalScore
- totalStars

---

# 7. 多用户问题

当前版本不需要服务器账号。

如果 PRD 中存在儿童账号：

采用：

【本地用户系统】

即可。

例如：

本地可以创建多个儿童档案：

小明

小红

小华

每个儿童的数据完全独立。

不需要：

手机号

微信登录

QQ登录

邮箱登录

服务器账号

---

# 8. 网络权限

如果项目实际不需要网络：

AndroidManifest.xml：

不要添加：

android.permission.INTERNET

如果某个第三方库强制要求网络权限：

必须分析原因。

如果不是核心功能需要：

优先移除。

最终目标：

【核心 App 完全离线可用。】

---

# 9. 开发环境

我的本地环境：

JDK 8

Gradle 7.2

这是固定条件。

【严禁升级 JDK】

【严禁升级 Gradle】

【严禁要求我安装 JDK 17】

【严禁要求我安装 JDK 21】

【严禁为了使用最新 Android 技术而破坏当前环境】

必须选择兼容：

JDK 8

Gradle 7.2

的 Android Gradle Plugin、Kotlin 和 AndroidX 版本。

开发之前先检查：

java -version

gradle/wrapper 版本

Android SDK

Build Tools

Compile SDK

Target SDK

然后选择兼容方案。

---

# 10. Android 技术架构

## 10.1 技术栈调整 (2026-09-04)

**关键变更：由于 JDK 8 约束与 AGP 7.1.3（要求 Java 11）冲突，采用 XML Views 替代 Jetpack Compose**

**原因：**
- PRD 要求 JDK 8 + Gradle 7.2
- AGP 7.1.3 强制要求 Java 11 运行（物理限制）
- AGP 4.2.2 是兼容 JDK 8 的最高版本
- AGP 4.2.2 内部依赖 Kotlin 1.4.31，与 Compose Compiler 1.0.5 冲突

## 10.2 最终技术栈（兼容 JDK 8）

```
核心约束：
JDK               8
Gradle            7.2
AGP               4.2.2    (降级以兼容 JDK 8)
Kotlin            1.4.31   (AGP 4.2.2 内部版本)

开发框架：
XML Views         替代 Jetpack Compose
ViewBinding       UI 绑定
LiveData          MVVM 状态管理
Navigation Component 页面导航
Material Design 1.5 UI 组件

核心依赖：
appcompat         1.4.0
constraintlayout  2.1.3
material          1.5.0
recyclerview      1.2.1
viewpager2        1.1.0-beta01
navigation-fragment-ktx 2.4.2
navigation-ui-ktx 2.4.2
lifecycle-viewmodel-ktx 2.4.1
lifecycle-livedata-ktx 2.4.1

数据存储：
room-runtime      2.4.3
datastore-preferences 1.0.0

媒体工具：
coil              2.1.0
gson              2.9.0

版本锁定：
compileSdk        31
targetSdk         31
minSdk            23
```

## 10.3 架构模式调整

**原方案：** MVVM + Compose + StateFlow  
**现方案：** MVVM + XML Views + LiveData + ViewBinding

```
UI (XML/ViewBinding) → ViewModel → UseCase → Repository → Room/JSON/DataStore
       ↑                      ↑
    LiveData              Coroutines
```

## 10.4 兼容性检查

所有第三方依赖必须检查：

【是否兼容 JDK 8 + Gradle 7.2 + AGP 4.2.2】

如果不兼容：

选择兼容版本或替代方案。

不要为了追求新版本而升级整个工程。

---

# 11. 项目架构

推荐：

app
├── activity
├── fragment
├── view
├── adapter
├── model
├── repository
├── database
├── manager
├── utils
├── audio
├── resource
├── game
│   ├── common
│   ├── concentration
│   ├── memory
│   ├── logic
│   ├── sorting
│   ├── classification
│   ├── maze
│   ├── pattern
│   └── reading
└── data

可以根据项目实际情况调整。

---

# 12. HTML 原型是重要参考

必须认真分析 HTML 原型。

HTML 原型用于确定：

- 页面结构
- UI布局
- 颜色
- 字体
- 卡片
- 按钮
- 图标
- 游戏界面
- 动画
- 交互
- 页面跳转
- 游戏流程

Android 版本应该尽可能还原 HTML 原型。

不能简单做成：

普通列表 + 普通按钮 + 普通 Android 页面。

最终应该保持：

【儿童游戏化产品体验。】

---

# 13. PRD 分析

必须完整读取：

prd.md

prdv2.1.md

奇妙脑力岛完整 PRD.md

不能只读取文件开头。

必须分析：

- 产品目标
- 用户
- 年龄
- 游戏
- 页面
- 游戏规则
- 题目
- 数据
- UI
- 动画
- 音频
- 成就
- 统计
- 家长功能
- 设置

---

# 14. PRD 冲突处理

如果三个 PRD 存在冲突：

优先级：

奇妙脑力岛完整 PRD.md

>

prdv2.1.md

>

prd.md

但是不能机械覆盖。

还必须结合：

HTML 原型

进行判断。

对于重要冲突：

记录：

docs/PRD冲突与决策.md

格式：

问题：

方案A：

方案B：

最终方案：

选择原因：

---

# 15. 第一阶段：项目侦察

不要立即写大量代码。

首先：

扫描项目。

读取三个 PRD。

找到 HTML 原型。

分析原型。

检查 Android 环境。

检查是否已经存在 Android 项目。

检查 Gradle。

检查 JDK。

检查 Android SDK。

然后生成：

docs/01-项目分析.md

docs/02-最终需求规格.md

docs/03-HTML原型Android映射.md

docs/04-Android技术架构.md

docs/PRD冲突与决策.md

---

# 16. 页面映射

建立：

HTML页面 → Android页面

例如：

首页

→ MainActivity

游戏大厅

→ GameListFragment

游戏详情

→ GameDetailActivity

找不同

→ FindDifferentGameActivity

迷宫

→ MazeGameActivity

阅读理解

→ ReadingGameActivity

具体名称根据项目实际情况确定。

---

# 17. 游戏系统

小游戏是本 App 的核心。

每个游戏必须独立。

不要把所有游戏代码写到：

MainActivity

中。

应该建立：

BaseGameActivity

BaseGameView

GameManager

GameLevel

GameResult

ScoreManager

DifficultyManager

AudioManager

ResourceManager

等基础能力。

---

# 18. 游戏标准流程

每个小游戏至少支持：

进入游戏

↓

游戏介绍

↓

游戏规则

↓

开始

↓

游戏进行

↓

用户操作

↓

正确/错误反馈

↓

得分

↓

游戏结束

↓

星级评价

↓

下一关

↓

重新开始

↓

返回

---

# 19. 游戏数据驱动

题目、关卡尽量不要硬编码。

例如：

assets/games/

assets/questions/

assets/levels/

通过 JSON 管理。

例如：

game.json

level.json

question.json

这样后续可以快速增加题目和关卡。

---

# 20. 核心训练能力

根据 PRD 实现：

专注力

记忆力

观察力

逻辑思维

空间思维

分类能力

排序能力

规律能力

阅读理解

反应能力

等。

如果 PRD 中还有其他能力：

以 PRD 为准。

---

# 21. 小游戏类型

根据 PRD 和 HTML 原型实现。

可能包括：

找不同

记忆卡片

数字记忆

图形记忆

找规律

分类

排序

迷宫

拼图

空间推理

视觉追踪

快速反应

阅读理解

听力理解

故事理解

等。

不要自行大量增加与 PRD 无关的游戏。

如果发现非常适合儿童智力训练的新游戏：

可以记录：

docs/游戏扩展建议.md

当前阶段不要擅自加入核心版本。

---

# 22. 难度系统

游戏需要支持：

Level 1

Level 2

Level 3

Level 4

Level 5

或者：

Easy

Normal

Hard

Expert

具体以 PRD 为准。

难度可以影响：

题目数量

干扰项数量

时间

速度

复杂度

图形数量

选项数量

等。

架构必须支持以后动态调整。

---

# 23. 游戏评分

建立统一评分机制。

考虑：

正确率

完成时间

连续正确

错误次数

难度

完成情况

最终计算：

Score

Stars

Achievement

等。

具体公式按照 PRD 实现。

如果 PRD 没有规定：

采用合理的儿童游戏化评分方案。

并记录决策。

---

# 24. 音频系统

建立：

AudioManager

统一处理：

点击音效

成功

失败

升级

奖励

金币

星星

提示

动物声音

故事

阅读

题目朗读

背景音乐

等。

例如：

AudioManager.playSuccess()

AudioManager.playWrong()

AudioManager.play("cat")

AudioManager.playQuestion(...)

---

# 25. 音频资源要求

必须优先检查现有音频资源。

缺少时：

优先使用：

AI生成

程序生成

合法公开资源

可商用素材

TTS

等。

必须注意版权。

禁止随意下载明显存在版权风险的音频。

每个外部资源需要记录：

资源名称

来源

授权情况

用途

---

# 26. 图片资源

统一：

assets/images

或：

res/drawable

禁止：

直接依赖远程图片 URL。

核心游戏图片必须打包到 App。

缺少图片：

优先：

AI生成

自行设计

合法公开素材

可商用素材

---

# 27. 资源完整性检查

建立：

resource-manifest.json

记录：

图片

音频

动画

字体

等。

开发完成后自动检查：

PRD要求资源

vs

本地资源

发现缺失：

自动补充或者记录。

---

# 28. 完全离线原则

安装 APK 后：

关闭网络。

依然应该可以：

打开 App

创建儿童档案

进入首页

进入游戏

玩游戏

保存数据

查看成绩

查看历史

查看成就

查看训练统计

播放本地音频

加载本地图片

阅读本地内容

完成阅读理解

---

# 29. 数据持久化测试

必须测试：

关闭 App

重新打开

数据仍然存在。

测试：

游戏进度

金币

星星

等级

成绩

儿童档案

设置

等。

---

# 30. 首页

根据 HTML 原型和最终 PRD实现。

可能包含：

儿童头像

昵称

等级

星星

金币

今日训练

游戏入口

推荐游戏

训练进度

成就

家长入口

等。

不要擅自增加不符合原型的复杂功能。

---

# 31. 家长功能

如果 PRD 中存在家长页面：

当前版本也只做：

【本地功能】

例如：

学习统计

游戏时间

正确率

游戏记录

能力分析

错误分析

训练报告

设置

等。

不需要：

服务器同步

账号登录

云端报告

---

# 32. 儿童体验

UI必须：

大按钮

大字体

明显反馈

儿童友好

低认知负担

动画

声音

游戏化

避免：

复杂菜单

密集文字

小点击区域

成人化设计

---

# 33. 性能

重点检查：

启动速度

内存

Bitmap

音频

动画

Activity

Fragment

RecyclerView

Canvas

避免：

内存泄漏

重复加载 Bitmap

重复加载音频

大量对象创建

---

# 34. 生命周期

重点测试：

切后台

恢复

锁屏

重新进入

Activity切换

游戏中退出

游戏重新进入

数据是否正确保存。

---

# 35. Android 权限

当前客户端不需要服务器。

因此尽量减少权限。

除非 PRD 明确需要：

不要申请：

定位

通讯录

短信

电话

存储

网络

等权限。

如果需要文件读取：

优先采用 Android 官方兼容方案。

---

# 36. 不要频繁询问我

除非遇到：

核心需求无法判断

必须输入 API Key

必须使用账号

必须由我提供真实资源

不可恢复错误

否则：

【不要每完成一个功能就问我是否继续。】

应该自主执行。

例如：

首页完成

↓

继续游戏大厅

↓

继续游戏

↓

继续数据库

↓

继续测试

↓

继续修复

---

# 37. 自动修复

如果出现：

Gradle错误

编译错误

依赖冲突

资源错误

Manifest错误

Java/Kotlin错误

布局错误

运行错误

必须：

分析

定位

修改

编译

验证

再次测试

不要直接把错误丢给我。

---

# 38. 编译验证

每完成一个重要模块：

执行：

gradlew assembleDebug

或者：

./gradlew assembleDebug

确保能够编译。

最终执行：

gradlew clean

gradlew assembleDebug

---

# 39. 测试

建立：

docs/测试用例.md

至少覆盖：

App启动

首页

儿童档案

游戏大厅

游戏详情

游戏开始

游戏答题

正确

错误

下一关

重新开始

退出

数据保存

重新打开

音效

背景音乐

阅读理解

成就

统计

家长页面

设置

离线运行

异常退出

生命周期

---

# 40. 自动测试报告

建立：

docs/测试报告.md

记录：

测试时间

测试环境

测试版本

测试数量

通过数量

失败数量

Bug数量

严重程度

修复状态

---

# 41. UI 原型回归

Android 开发完成后：

重新对照 HTML 原型。

逐页面检查：

布局

颜色

字体

按钮

图标

图片

动画

交互

页面跳转

游戏流程

发现明显差异：

自动修复。

---

# 42. 不允许假功能

禁止：

按钮点击无反应

假游戏

假数据

假统计

假的成功页面

假的进度

用 TODO 冒充完成

页面存在但功能不实现

---

# 43. 不允许过度简化

例如 PRD要求：

“记忆卡片游戏”

不能只做：

点击一个按钮 → 显示“游戏完成”。

必须真正实现：

卡片

记忆

翻牌

判断

计分

错误

成功

关卡

结果

等。

---

# 44. 开发进度

维护：

docs/开发进度.md

格式：

[√] 项目分析

[√] Android项目

[√] 首页

[√] 游戏大厅

[ ] 游戏1

[ ] 游戏2

[ ] 游戏3

[ ] 音频

[ ] 图片

[ ] 测试

[ ] UI回归

[ ] APK

---

# 45. 开发阶段

严格按照：

Phase 1：

项目侦察

↓

Phase 2：

PRD统一

↓

Phase 3：

HTML原型分析

↓

Phase 4：

Android技术架构

↓

Phase 5：

创建Android工程

↓

Phase 6：

基础框架

↓

Phase 7：

首页

↓

Phase 8：

游戏大厅

↓

Phase 9：

核心小游戏

↓

Phase 10：

音频

↓

Phase 11：

图片/动画

↓

Phase 12：

数据持久化

↓

Phase 13：

家长/统计

↓

Phase 14：

测试

↓

Phase 15：

UI原型回归

↓

Phase 16：

Bug修复

↓

Phase 17：

最终APK

---

# 46. 第一批游戏

不要一开始批量开发全部小游戏。

先从 PRD 中选择：

3~5 个最核心、最能代表产品质量的小游戏。

优先：

专注力

记忆力

逻辑思维

空间思维

阅读理解

各选择一个代表游戏。

先把这些游戏做到：

【完整、好玩、稳定、UI接近HTML原型。】

确认游戏架构可复用后，再批量开发其他小游戏。

---

# 47. 最终项目结构

建议：

kidForWorkBuddy
│
├── CLAUDE.md
│
├── prd.md
├── prdv2.1.md
├── 奇妙脑力岛完整 PRD.md
│
├── prototype
│
├── android
│
├── assets
│   ├── images
│   ├── audio
│   ├── animations
│   └── fonts
│
├── data
│   ├── games
│   ├── levels
│   └── questions
│
└── docs
    ├── 01-项目分析.md
    ├── 02-最终需求规格.md
    ├── 03-HTML原型Android映射.md
    ├── 04-Android技术架构.md
    ├── PRD冲突与决策.md
    ├── 游戏扩展建议.md
    ├── 开发进度.md
    ├── 测试用例.md
    └── 测试报告.md

实际结构可以根据项目情况调整。

---

# 48. 最终交付

必须最终得到：

【完整 Android Studio 项目】

并且：

JDK 8

Gradle 7.2

可以正常构建。

最终执行：

gradlew clean

gradlew assembleDebug

生成：

app/build/outputs/apk/debug/app-debug.apk

---

# 49. 最终检查

完成前必须检查：

□ PRD是否全部理解

□ HTML原型是否全部分析

□ 页面是否全部实现

□ 游戏是否真正可玩

□ 数据是否本地保存

□ 关闭网络是否可以运行

□ 音频是否完整

□ 图片是否完整

□ 游戏进度是否保存

□ 儿童档案是否保存

□ 家长统计是否正常

□ 设置是否正常

□ Gradle 7.2

□ JDK 8

□ 无不必要网络依赖

□ 无服务器接口

□ 无明显编译错误

□ 无明显运行错误

□ 测试报告完成

□ APK生成成功

---

# 50. 核心原则

整个开发过程始终遵守：

PRD是业务依据。

HTML原型是UI和交互依据。

Android是最终运行平台。

本版本是：

【纯 Android 客户端】

【Local-First】

【Offline-First】

【无服务器】

【无 API】

【无云同步】

【本地数据】

【本地资源】

【JDK 8】

【Gradle 7.2】

最终目标不是生成一堆代码。

而是：

【真正生成一个可以安装、可以离线运行、可以完整体验、可以长期扩展的儿童智力提升 Android App。】

现在开始执行。

第一阶段只进行项目侦察、PRD分析、HTML原型分析和技术方案设计。

完成后继续自动进入 Android 项目开发，不要因为普通问题反复询问我。