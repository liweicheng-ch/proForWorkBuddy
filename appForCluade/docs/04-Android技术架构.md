# 04-Android 技术架构 (XML Views 版)

> **技术栈调整**：由于 JDK 8 约束与 AGP 7.1.3 (要求 Java 11) 冲突，采用 XML Views 替代 Jetpack Compose，以确保完全离线运行

## 1. 版本锁定 (兼容 JDK 8)

```
JDK               8
Gradle            7.2
AGP               4.2.2    (降级以兼容 JDK 8)
Kotlin            1.4.31    (AGP 4.2.2 内部版本)
compileSdk        31
targetSdk         31
minSdk            23

// 支持库版本 (全部兼容 JDK 8)
appcompat         1.4.0
constraintlayout  2.1.3
material          1.5.0
recyclerview      1.2.1
viewpager2        1.1.0-beta01
navigation-fragment-ktx 2.4.2
navigation-ui-ktx 2.4.2
lifecycle-viewmodel-ktx 2.4.1
lifecycle-livedata-ktx 2.4.1
room-runtime      2.4.3
datastore-preferences 1.0.0
coil              2.1.0
gson              2.9.0
```

## 2. 架构模式调整

**原：** MVVM + Compose + StateFlow  
**现：** MVVM + XML Views + LiveData + ViewBinding

```
UI (XML/ViewBinding) → ViewModel → UseCase → Repository → Room/JSON/DataStore
       ↑                      ↑
    LiveData              Coroutines
```

## 3. 目录结构 (适配 XML Views)

```
app/src/main/java/com/brainisland/kid/
├── core/
│   ├── audio/AudioManager.kt
│   ├── tts/TtsManager.kt
│   ├── designsystem/  ColorRes/ThemeRes/StyleRes
│   └── util/
├── data/
│   ├── local/  Room DB + DAO + Entity
│   ├── repository/  Repository实现
│   └── json/  JSON解析工具
├── domain/
│   ├── model/  领域模型
│   ├── repository/  Repository接口
│   └── usecase/  UseCase
├── feature/
│   ├── home/  首页 (activity/fragment + xml + viewmodel)
│   ├── learn/  学习中心
│   ├── ability/  能力详情
│   ├── reading/  阅读中心
│   ├── game/  游戏容器
│   ├── onboarding/  首次启动
│   ├── profile/  我的
│   ├── parent/  家长中心
│   └── common/  共享组件 (BaseActivity, BaseFragment)
├── navigation/  NavGraph XML + 导航控制器
└── MainActivity.kt (传统Activity)
```

## 4. Room 数据库 (保持不变)

11个Entity: Child, Ability, GameConfig, GameSession, AnswerRecord, DailyTask, Reward, Achievement, LearningRecord, StoryArticle, AppSetting

## 5. DataStore (保持不变)

轻量配置: isFirstLaunch, selectedChildId, parentPin, dailyLimit, sessionLimit, soundEnabled, musicEnabled

## 6. 音频系统 (保持不变)

MediaPlayer + SoundPool池(短音效) + Android TTS + BGM循环

## 7. 离线约束 (保持不变)

无INTERNET权限, 所有资源在assets/, 游戏数据JSON, 阅读内容JSON, 图片用Emoji/Vector

## 8. XML Views 特定组件

### 8.1 布局文件结构
```
res/layout/
├── activity_main.xml          // 主容器
├── fragment_home.xml         // 首页布局
├── fragment_learn.xml        // 学习中心
├── fragment_reading.xml      // 阅读中心
├── fragment_profile.xml      // 我的页面
├── item_game_card.xml        // 游戏卡片
├── item_story_card.xml       // 故事卡片
└── dialog_*                  // 各种对话框
```

### 8.2 设计系统 (XML版)
```
res/values/
├── colors.xml     // 颜色资源 (参照 HTML 原型)
├── styles.xml     // 主题和样式
├── dimens.xml     // 间距/圆角
└── strings.xml    // 文本资源
```

### 8.3 颜色映射 (HTML原型 → Android XML)
```xml
<!-- res/values/colors.xml -->
<color name="sun">#FFB703</color>       <!-- 橙黄主 -->
<color name="sun_dark">#FB8500</color>   <!-- 橙黄深 -->
<color name="sky">#4CC9F0</color>       <!-- 天空蓝 -->
<color name="cream">#FFF9EC</color>      <!-- 页面背景 -->
<color name="ink">#4A3B2A</color>        <!-- 主文字 -->
<color name="ink_light">#8A7B66</color>  <!-- 次文字 -->
<color name="pink_dark">#FF477E</color>  <!-- 错误色 -->
```

## 9. 迁移实施要点

1. **Compose Theme → XML Styles**
   - MaterialTheme → Theme.AppCompat 派生
   - Typography → TextAppearance 样式
   - ColorScheme → color.xml 资源

2. **StateFlow → LiveData**
   - ViewModel 使用 `MutableLiveData` / `LiveData`
   - Fragment 使用 `observe()`

3. **Navigation Compose → Navigation Component**
   - NavHostFragment 在 XML 布局中
   - nav_graph.xml 定义导航结构

4. **UI 组件映射**
   - Compose Button → MaterialButton
   - Compose Card → MaterialCardView
   - Compose Text → TextView
   - Compose Image → ImageView (Coil)
   - Compose Column/Row → LinearLayout

## 10. 优点与权衡

**优点：**
- ✅ 100% 兼容 JDK 8
- ✅ 稳定成熟的 Android 组件
- ✅ 广泛的社区支持和文档
- ✅ 更好的性能预测

**权衡：**
- ⚠️ 代码量增加 (XML + Java/Kotlin)
- ⚠️ 缺少 Compose 的声明式优势
- ⚠️ ViewBinding 额外模板代码

## 11. 下一步实施步骤

1. **清理阶段**: 删除所有 Compose 相关文件
2. **基础框架**: 创建 BaseActivity/BaseFragment
3. **首页实现**: XML 布局 + ViewModel + 导航
4. **能力入口**: RecyclerView + 能力卡片
5. **游戏容器**: Fragment 切换 + 游戏生命周期

---

**备注**: 此架构确保在 JDK 8 约束下提供完整的儿童认知训练功能，所有游戏逻辑和业务规则保持不变，仅 UI 层采用传统 Android 视图系统。
