package com.brainisland.kid.ui

import android.graphics.Color
import android.os.Bundle
import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import androidx.fragment.app.Fragment
import com.brainisland.kid.R
import com.brainisland.kid.data.Seed
import com.brainisland.kid.data.Store
import com.brainisland.kid.game.GameActivity
import com.brainisland.kid.tts.TtsBox
import com.brainisland.kid.util.KidUi
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/** 首页：问候 + 吉祥物 + 今日任务 + 快速开始 */
class HomeFragment : Fragment() {

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, sa: Bundle?): View {
        val ctx = requireContext()
        val scroll = ScrollView(ctx)
        val root = KidUi.column(ctx, 18)
        scroll.addView(root)

        val today = SimpleDateFormat("yyyyMMdd", Locale.US).format(Date())

        /* ---------- 问候条 ---------- */
        val helloCard = KidUi.card(ctx)
        val helloRow = LinearLayout(ctx).apply { orientation = LinearLayout.HORIZONTAL; gravity = Gravity.CENTER_VERTICAL }
        val helloLeft = LinearLayout(ctx).apply { orientation = LinearLayout.VERTICAL }
        val greeting = KidUi.text(ctx, greetingText(), 20f, Color.parseColor("#3A2E2A"), bold = true, gravity = Gravity.LEFT)
        val sub = KidUi.text(ctx, "学习 ${Store.days(ctx)} 天 · 快乐满满", 13f, Color.parseColor("#8C7B76"), gravity = Gravity.LEFT)
        helloLeft.addView(greeting)
        helloLeft.addView(sub)
        val sun = KidUi.text(ctx, "☀️", 40f, Color.BLACK)
        val sunLp = LinearLayout.LayoutParams(KidUi.dp(ctx, 64), KidUi.dp(ctx, 64))
        sunLp.leftMargin = KidUi.dp(ctx, 12)
        sun.gravity = Gravity.CENTER
        sun.layoutParams = sunLp
        helloRow.addView(helloLeft, LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f))
        helloRow.addView(sun)
        helloCard.addView(helloRow)
        helloCard.setOnClickListener { TtsBox.speak("早上好，小兔！今天也要加油哦！") }
        root.addView(helloCard)

        /* ---------- 今日任务 ---------- */
        val taskCard = KidUi.card(ctx)
        taskCard.addView(KidUi.text(ctx, "🎯 今日任务", 17f, Color.parseColor("#3A2E2A"), bold = true, gravity = Gravity.LEFT))
        val done = Store.todayDone(requireContext(), today)
        val taskRow = LinearLayout(ctx).apply { gravity = Gravity.CENTER_VERTICAL }
        val barBg = View(ctx).apply {
            background = KidUi.rounded(Color.parseColor("#FFE3B3"), 8)
            layoutParams = LinearLayout.LayoutParams(0, KidUi.dp(ctx, 14), 1f).apply { rightMargin = KidUi.dp(ctx, 12) }
        }
        val barFg = View(ctx).apply {
            background = KidUi.rounded(Color.parseColor("#FF9A3D"), 8)
            layoutParams = FrameLayout.LayoutParams(
                (Math.min(100, done * 25) / 100f * 1000).toInt().coerceAtMost(1000), KidUi.dp(ctx, 14))
        }
        // 用 FrameLayout 套进度条
        val barWrap = FrameLayout(ctx).apply { layoutParams = LinearLayout.LayoutParams(0, KidUi.dp(ctx, 14), 1f) }
        (barBg.layoutParams as LinearLayout.LayoutParams).let { barWrap.layoutParams = it }
        barWrap.addView(barBg)
        barWrap.addView(barFg)
        val taskNum = KidUi.text(ctx, "完成 $done / 4 个任务", 13f, Color.parseColor("#8C7B76"))
        taskRow.addView(barWrap)
        taskRow.addView(taskNum)
        val taskHint = KidUi.text(ctx, "每完成一个小游戏，任务就 +1 哦！", 12f, Color.parseColor("#8C7B76"), gravity = Gravity.LEFT)
        taskCard.addView(taskRow)
        taskCard.addView(taskHint)
        root.addView(taskCard)

        /* ---------- 岛屿世界（吉祥物 + 快速开始） ---------- */
        val worldCard = KidUi.card(ctx).apply {
            background = KidUi.gradient(Color.parseColor("#FFF3D6"), Color.parseColor("#FFE3B3"), 20)
        }
        val worldTitle = KidUi.text(ctx, "🏝️ 奇妙脑力岛", 19f, Color.parseColor("#633806"), bold = true, gravity = Gravity.LEFT)
        worldCard.addView(worldTitle)
        val worldDesc = KidUi.text(ctx, "和小兔一起，每天玩 10 分钟，\n专注力 · 记忆力 · 逻辑思维 · 阅读理解 一起成长！",
            13f, Color.parseColor("#854F0B"), gravity = Gravity.LEFT)
        worldCard.addView(worldDesc)

        val mascotRow = LinearLayout(ctx).apply { orientation = LinearLayout.HORIZONTAL; gravity = Gravity.CENTER }
        val mascot = KidUi.text(ctx, "🐰", 56f, Color.BLACK)
        mascot.setOnClickListener {
            KidUi.pop(it)
            TtsBox.speak("你好呀！我是你的小向导，今天想去哪里冒险呀？")
        }
        mascotRow.addView(mascot)
        worldCard.addView(mascotRow)

        val startBtn = KidUi.bigBtn(ctx, "🚀 随机玩一个", Color.parseColor("#FF9A3D"), Color.parseColor("#FFB347")) {
            val g = Seed.GAME_LIST.random()
            GameActivity.start(requireContext(), g.id)
        }
        val blp = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT)
        blp.topMargin = KidUi.dp(ctx, 6)
        startBtn.layoutParams = blp
        worldCard.addView(startBtn)
        root.addView(worldCard)

        /* ---------- 能力速览 ---------- */
        root.addView(KidUi.text(ctx, "📊 我的能力", 17f, Color.parseColor("#3A2E2A"), bold = true, gravity = Gravity.LEFT))
        Seed.ABILITIES.forEach { a ->
            val row = KidUi.card(ctx)
            val line = LinearLayout(ctx).apply { orientation = LinearLayout.HORIZONTAL; gravity = Gravity.CENTER_VERTICAL }
            val icon = KidUi.text(ctx, a.icon, 26f, Color.BLACK).apply {
                background = KidUi.rounded(Color.parseColor("#FFF3D6"), 14)
                val lp = LinearLayout.LayoutParams(KidUi.dp(ctx, 48), KidUi.dp(ctx, 48))
                lp.rightMargin = KidUi.dp(ctx, 12)
                layoutParams = lp
                gravity = Gravity.CENTER
            }
            val nameCol = LinearLayout(ctx).apply { orientation = LinearLayout.VERTICAL }
            nameCol.addView(KidUi.text(ctx, a.name, 16f, Color.parseColor("#3A2E2A"), bold = true, gravity = Gravity.LEFT))
            nameCol.addView(KidUi.text(ctx, a.lv, 12f, Color.parseColor("#8C7B76"), gravity = Gravity.LEFT))
            line.addView(icon)
            line.addView(nameCol, LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f))
            val score = Store.abilityScore(requireContext(), a.key, a.score)
            line.addView(KidUi.text(ctx, "$score", 18f, Color.parseColor("#FF9A3D"), bold = true))
            row.addView(line)
            root.addView(row)
        }

        return scroll
    }

    private fun greetingText(): String {
        val h = SimpleDateFormat("HH", Locale.US).format(Date()).toInt()
        return when {
            h < 11 -> "早上好，小兔 ☀️"
            h < 14 -> "中午好，小兔 🍚"
            h < 18 -> "下午好，小兔 🌤️"
            else -> "晚上好，小兔 🌙"
        }
    }
}
