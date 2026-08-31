package com.brainisland.kid.ui

import android.graphics.Color
import android.os.Bundle
import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.HorizontalScrollView
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import androidx.fragment.app.Fragment
import com.brainisland.kid.data.Seed
import com.brainisland.kid.data.Store
import com.brainisland.kid.game.GameActivity
import com.brainisland.kid.tts.TtsBox
import com.brainisland.kid.util.KidUi

/**
 * 阅读理解中心（PRD V2.2）：
 * 5 大阅读引擎 + Level A~D 分级 + 6 大主题 + 文章列表 → 点开进入读文答题
 */
class ReadingFragment : Fragment() {

    private var level: String = "B"
    private var theme: String = "all"
    private lateinit var levelTabs: LinearLayout
    private lateinit var themeChips: LinearLayout
    private lateinit var listHolder: LinearLayout

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, sa: Bundle?): View {
        val ctx = requireContext()
        level = Store.readLevel(ctx)

        val scroll = ScrollView(ctx)
        val root = KidUi.column(ctx, 18)
        scroll.addView(root)

        /* ---------- 标题 ---------- */
        val header = LinearLayout(ctx).apply { orientation = LinearLayout.HORIZONTAL }
        header.addView(KidUi.text(ctx, "📖 阅读中心", 21f, Color.parseColor("#3A2E2A"), bold = true),
            LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f))
        header.addView(KidUi.iconBtn(ctx, "🔊", Color.parseColor("#FF8A9B")) {
            TtsBox.speak("欢迎来到阅读理解中心！选择你喜欢的类别开始吧！")
        })
        root.addView(header)
        root.addView(KidUi.text(ctx, "读故事 · 听故事 · 答问题，理解世界",
            13f, Color.parseColor("#8C7B76"), gravity = Gravity.LEFT))

        /* ---------- 5 个阅读引擎卡 ---------- */
        val engines = listOf(
            Triple("story_quiz", "📖", "读文答题"),
            Triple("story_listen", "🔊", "听故事"),
            Triple("story_sequence", "🔢", "故事排序"),
            Triple("story_character", "👤", "人物判断"),
            Triple("story_cause", "🔗", "因果推理")
        )
        val engineGrid = android.widget.GridLayout(ctx).apply {
            columnCount = 3
            layoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT)
        }
        engines.forEach { (id, icon, name) ->
            val card = LinearLayout(ctx).apply {
                orientation = LinearLayout.VERTICAL
                gravity = Gravity.CENTER
                background = KidUi.rounded(Color.WHITE, 18, Color.parseColor("#FFDDE2"))
                setPadding(KidUi.dp(ctx, 6), KidUi.dp(ctx, 12), KidUi.dp(ctx, 6), KidUi.dp(ctx, 12))
                val lp = android.widget.GridLayout.LayoutParams()
                lp.width = 0
                lp.columnSpec = android.widget.GridLayout.spec(android.widget.GridLayout.UNDEFINED, 1f)
                lp.setMargins(KidUi.dp(ctx, 4), KidUi.dp(ctx, 4), KidUi.dp(ctx, 4), KidUi.dp(ctx, 4))
                layoutParams = lp
                setOnClickListener {
                    KidUi.pop(it)
                    GameActivity.start(ctx, id)
                }
            }
            card.addView(KidUi.text(ctx, icon, 26f, Color.BLACK))
            card.addView(KidUi.text(ctx, name, 12f, Color.parseColor("#993556"), bold = true))
            engineGrid.addView(card)
        }
        root.addView(engineGrid)

        /* ---------- Level 分级 tabs ---------- */
        root.addView(KidUi.text(ctx, "难度分级", 16f, Color.parseColor("#3A2E2A"), bold = true, gravity = Gravity.LEFT))
        levelTabs = LinearLayout(ctx).apply { gravity = Gravity.CENTER_VERTICAL }
        root.addView(levelTabs)

        /* ---------- 主题筛选 ---------- */
        root.addView(KidUi.text(ctx, "主题", 16f, Color.parseColor("#3A2E2A"), bold = true, gravity = Gravity.LEFT))
        val themeScroll = HorizontalScrollView(ctx).apply {
            isHorizontalScrollBarEnabled = false
        }
        themeChips = LinearLayout(ctx)
        themeScroll.addView(themeChips)
        root.addView(themeScroll)

        /* ---------- 文章列表 ---------- */
        listHolder = LinearLayout(ctx).apply { orientation = LinearLayout.VERTICAL }
        root.addView(listHolder)

        refreshLevels()
        refreshThemes()
        refreshList()

        return scroll
    }

    private fun refreshLevels() {
        val ctx = requireContext()
        levelTabs.removeAllViews()
        Seed.LEVELS.forEach { lv ->
            val on = lv.key == level
            val tab = TextView(ctx).apply {
                text = "${lv.name}\n${lv.desc}"
                textSize = 11f
                setTextColor(if (on) Color.WHITE else Color.parseColor("#8C7B76"))
                gravity = Gravity.CENTER
                background = KidUi.rounded(
                    if (on) Color.parseColor("#FF8A9B") else Color.WHITE,
                    14, if (on) null else Color.parseColor("#F0E0D0"))
                setPadding(KidUi.dp(ctx, 10), KidUi.dp(ctx, 8), KidUi.dp(ctx, 10), KidUi.dp(ctx, 8))
                val lp = LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f)
                lp.setMargins(KidUi.dp(ctx, 4), 0, KidUi.dp(ctx, 4), 0)
                layoutParams = lp
                setOnClickListener {
                    KidUi.pop(it)
                    level = lv.key
                    Store.setReadLevel(ctx, level)
                    refreshLevels(); refreshList()
                }
            }
            levelTabs.addView(tab)
        }
    }

    private fun refreshThemes() {
        val ctx = requireContext()
        themeChips.removeAllViews()
        Seed.THEMES.forEach { t ->
            val on = t.key == theme
            val chip = TextView(ctx).apply {
                text = "${t.icon} ${t.name}"
                textSize = 13f
                setTextColor(if (on) Color.WHITE else Color.parseColor("#5F5E5A"))
                background = KidUi.rounded(
                    if (on) Color.parseColor("#4FC3F7") else Color.WHITE,
                    20, if (on) null else Color.parseColor("#F0E0D0"))
                setPadding(KidUi.dp(ctx, 14), KidUi.dp(ctx, 7), KidUi.dp(ctx, 14), KidUi.dp(ctx, 7))
                val lp = LinearLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT)
                lp.setMargins(KidUi.dp(ctx, 6), 0, KidUi.dp(ctx, 6), 0)
                layoutParams = lp
                setOnClickListener {
                    KidUi.pop(it)
                    theme = t.key
                    refreshThemes(); refreshList()
                }
            }
            themeChips.addView(chip)
        }
    }

    private fun refreshList() {
        val ctx = requireContext()
        listHolder.removeAllViews()

        val themeName = Seed.THEMES.firstOrNull { it.key == theme }?.name ?: "全部"
        listHolder.addView(KidUi.text(ctx, "$themeName · ${Seed.articlesBy(level, theme).size} 篇故事",
            13f, Color.parseColor("#8C7B76"), bold = true, gravity = Gravity.LEFT))

        val arts = Seed.articlesBy(level, theme)
        if (arts.isEmpty()) {
            listHolder.addView(KidUi.text(ctx, "这个主题暂时没有故事，换一个看看吧～", 13f, Color.parseColor("#8C7B76")))
            return
        }
        arts.forEach { art ->
            val card = KidUi.card(ctx)
            val row = LinearLayout(ctx).apply { gravity = Gravity.CENTER_VERTICAL }
            val icon = KidUi.text(ctx, themeIcon(art.theme), 26f, Color.BLACK).apply {
                background = KidUi.rounded(Color.parseColor("#FFF3D6"), 14)
                layoutParams = LinearLayout.LayoutParams(KidUi.dp(ctx, 50), KidUtils(50))
                gravity = Gravity.CENTER
            }
            val col = LinearLayout(ctx).apply { orientation = LinearLayout.VERTICAL }
            col.addView(KidUi.text(ctx, art.title, 16f, Color.parseColor("#3A2E2A"), bold = true, gravity = Gravity.LEFT))
            col.addView(KidUi.text(ctx, "${art.questions.size} 道题 · ${themeName}", 12f, Color.parseColor("#8C7B76"), gravity = Gravity.LEFT))
            row.addView(icon)
            val rlp = LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f)
            rlp.leftMargin = KidUi.dp(ctx, 12)
            row.addView(col, rlp)
            row.addView(KidUi.bigBtn(ctx, "读一读", Color.parseColor("#FF8A9B"), Color.parseColor("#FFAEB8")) {
                GameActivity.start(ctx, "story_quiz", art.id)
            })
            card.addView(row)
            card.setOnClickListener { GameActivity.start(ctx, "story_quiz", art.id) }
            listHolder.addView(card)
        }
    }

    private fun themeIcon(key: String): String = when (key) {
        "animal" -> "🐾"; "nature" -> "🌿"; "science" -> "🔬"
        "adventure" -> "🗺️"; "daily" -> "🏠"; "emotion" -> "💗"; else -> "📖"
    }

    private fun KidUtils(dp: Int): Int = KidUi.dp(requireContext(), dp)
}
