package com.brainisland.kid.ui

import android.graphics.Color
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.ScrollView
import androidx.fragment.app.Fragment
import com.brainisland.kid.data.Seed
import com.brainisland.kid.data.Store
import com.brainisland.kid.tts.TtsBox
import com.brainisland.kid.util.KidUi

/** 学习中心：4 大能力卡（渐变糖果色） */
class LearnFragment : Fragment() {

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, sa: Bundle?): View {
        val ctx = requireContext()
        val scroll = ScrollView(ctx)
        val root = KidUi.column(ctx, 18)
        scroll.addView(root)

        val header = LinearLayout(ctx).apply { orientation = LinearLayout.HORIZONTAL }
        header.addView(KidUi.text(ctx, "🎓 学习中心", 21f, Color.parseColor("#3A2E2A"), bold = true, gravity = LinearLayout.TEXT_ALIGNMENT_CENTER),
            LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f))
        header.addView(KidUi.iconBtn(ctx, "🔊", Color.parseColor("#4FC3F7")) {
            TtsBox.speak("这里是学习中心，选择你想训练的本领吧！")
        })
        root.addView(header)

        root.addView(KidUi.text(ctx, "选择一座小岛，开始今天的冒险吧！",
            13f, Color.parseColor("#8C7B76"), gravity = LinearLayout.TEXT_ALIGNMENT_CENTER))

        val colorMap = mapOf(
            "att" to listOf("#FF9A3D", "#FFB347"),
            "mem" to listOf("#AB8CE0", "#C3A9F0"),
            "log" to listOf("#4FC3F7", "#7FD8FF"),
            "rea" to listOf("#FF8A9B", "#FFAEB8")
        )

        Seed.ABILITIES.forEachIndexed { idx, a ->
            val colors = colorMap[a.colorKey]!!
            val card = LinearLayout(ctx).apply {
                orientation = LinearLayout.VERTICAL
                background = KidUi.gradient(Color.parseColor(colors[0]), Color.parseColor(colors[1]), 22)
                setPadding(KidUi.dp(ctx, 18), KidUi.dp(ctx, 16), KidUi.dp(ctx, 18), KidUi.dp(ctx, 16))
                val lp = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT)
                lp.setMargins(0, KidUi.dp(ctx, 10), 0, KidUi.dp(ctx, 10))
                layoutParams = lp
            }

            val row = LinearLayout(ctx).apply { orientation = LinearLayout.HORIZONTAL; gravity = android.view.Gravity.CENTER_VERTICAL }
            val icon = KidUi.text(ctx, a.icon, 34f, Color.WHITE).apply {
                background = KidUi.circle(Color.parseColor("#33FFFFFF"))
                val lp = LinearLayout.LayoutParams(KidUi.dp(ctx, 62), KidUi.dp(ctx, 62))
                lp.rightMargin = KidUi.dp(ctx, 14)
                layoutParams = lp
                gravity = android.view.Gravity.CENTER
            }
            val col = LinearLayout(ctx).apply { orientation = LinearLayout.VERTICAL }
            col.addView(KidUi.text(ctx, a.name, 19f, Color.WHITE, bold = true, gravity = LinearLayout.TEXT_ALIGNMENT_CENTER))
            col.addView(KidUi.text(ctx, "📍 ${a.place}", 12f, Color.parseColor("#E6FFFFFF".substring(2)), gravity = LinearLayout.TEXT_ALIGNMENT_CENTER))
            col.addView(KidUi.text(ctx, a.desc, 12f, Color.parseColor("#E6FFFFFF".substring(2)), gravity = LinearLayout.TEXT_ALIGNMENT_CENTER))
            row.addView(icon)
            row.addView(col, LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f))
            card.addView(row)

            // 分数进度
            val score = Store.abilityScore(ctx, a.key, a.score)
            val trendRow = LinearLayout(ctx).apply { gravity = android.view.Gravity.CENTER_VERTICAL }
            val trend = KidUi.text(ctx, a.trend, 12f, Color.WHITE, gravity = LinearLayout.TEXT_ALIGNMENT_CENTER)
            trendRow.addView(trend, LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f))
            trendRow.addView(KidUi.text(ctx, "$score 分", 15f, Color.WHITE, bold = true))
            card.addView(trendRow)

            card.setOnClickListener {
                KidUi.pop(it)
                AbilityActivity.start(ctx, a.key)
            }
            KidUi.bounceIn(card, idx * 90L)
            root.addView(card)
        }

        return scroll
    }
}
