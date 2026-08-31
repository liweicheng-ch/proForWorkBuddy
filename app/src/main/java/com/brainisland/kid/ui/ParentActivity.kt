package com.brainisland.kid.ui

import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import android.view.Gravity
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.ScrollView
import androidx.appcompat.app.AppCompatActivity
import com.brainisland.kid.data.Seed
import com.brainisland.kid.data.Store
import com.brainisland.kid.util.KidUi

/** 家长中心：能力报告（无后台，数据全本地） */
class ParentActivity : AppCompatActivity() {

    companion object {
        fun start(ctx: Context) {
            ctx.startActivity(Intent(ctx, ParentActivity::class.java))
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val ctx = this

        val scroll = ScrollView(ctx)
        val root = KidUi.column(ctx, 18)
        scroll.addView(root)

        val topRow = LinearLayout(ctx).apply { gravity = Gravity.CENTER_VERTICAL }
        topRow.addView(KidUi.iconBtn(ctx, "‹", Color.parseColor("#AB8CE0")) { finish() })
        topRow.addView(KidUi.text(ctx, "🔐 家长中心 · 能力报告", 18f, Color.parseColor("#3A2E2A"), bold = true),
            LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f))
        root.addView(topRow)

        /* ---------- 综合统计 ---------- */
        val statCard = KidUi.card(ctx).apply {
            background = KidUi.gradient(Color.parseColor("#AB8CE0"), Color.parseColor("#C3A9F0"), 20)
        }
        statCard.addView(KidUi.text(ctx, "小兔 · 4 岁 · 综合评价", 16f, Color.WHITE, bold = true, gravity = Gravity.LEFT))
        val stars = Store.stars(ctx)
        val days = Store.days(ctx)
        statCard.addView(KidUi.text(ctx,
            "累计星星 $stars 颗 · 学习 $days 天\n各能力分数基于本地训练记录动态成长（每 10 星 +1 分）",
            12f, Color.WHITE, gravity = Gravity.LEFT))
        root.addView(statCard)

        /* ---------- 四能力报告条 ---------- */
        Seed.ABILITIES.forEach { a ->
            val card = KidUi.card(ctx)
            card.addView(KidUi.text(ctx, "${a.icon} ${a.name}", 16f, Color.parseColor("#3A2E2A"), bold = true, gravity = Gravity.LEFT))
            card.addView(KidUi.text(ctx, "${a.lv} · ${a.trend}", 12f, Color.parseColor("#8C7B76"), gravity = Gravity.LEFT))

            val score = Store.abilityScore(ctx, a.key, a.score)
            val abs = Store.abilityStars(ctx, a.key)

            val barWrap = LinearLayout(ctx).apply {
                background = KidUi.rounded(Color.parseColor("#F1EFE8"), 10)
                layoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, KidUi.dp(ctx, 16)).apply {
                    topMargin = KidUi.dp(ctx, 8)
                }
            }
            val colorHex = when (a.colorKey) {
                "att" -> "#FF9A3D"; "mem" -> "#AB8CE0"; "log" -> "#4FC3F7"; else -> "#FF8A9B"
            }
            val bar = View(ctx).apply {
                background = KidUi.rounded(Color.parseColor(colorHex), 10)
                layoutParams = LinearLayout.LayoutParams(
                    (score * resources.displayMetrics.widthPixels / 100f).toInt(), KidUi.dp(ctx, 16))
            }
            val cnt = LinearLayout(ctx)
            cnt.addView(bar)
            barWrap.addView(cnt)
            card.addView(barWrap)
            card.addView(KidUi.text(ctx, "得分 $score / 100 · 本地训练累计 $abs 星", 12f, Color.parseColor("#8C7B76"), gravity = Gravity.LEFT))
            root.addView(card)
        }

        /* ---------- 建议 ---------- */
        val tipCard = KidUi.card(ctx).apply {
            background = KidUi.rounded(Color.parseColor("#FFF3D6"), 20)
        }
        tipCard.addView(KidUi.text(ctx, "💡 训练小贴士", 15f, Color.parseColor("#633806"), bold = true, gravity = Gravity.LEFT))
        tipCard.addView(KidUi.text(ctx,
            "· 每天 10 分钟，比一次玩很久更有效\n· 阅读理解分数偏低，建议多玩「故事森林」\n· 连续答对会自动提升难度，不用担心太简单",
            12f, Color.parseColor("#854F0B"), gravity = Gravity.LEFT))
        root.addView(tipCard)

        /* ---------- 退出 ---------- */
        root.addView(KidUi.bigBtn(ctx, "退出家长中心", Color.parseColor("#8C7B76"), Color.parseColor("#B4B2A9")) {
            finish()
        })

        setContentView(scroll)
    }

    private fun View(ctx: android.content.Context): android.view.View = android.view.View(ctx)
}
