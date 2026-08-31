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
import com.brainisland.kid.game.GameActivity
import com.brainisland.kid.tts.TtsBox
import com.brainisland.kid.util.KidUi

/** 能力详情页：hero 头 + 5 个游戏卡 */
class AbilityActivity : AppCompatActivity() {

    companion object {
        private const val EXTRA_ABILITY = "ability"
        fun start(ctx: Context, ability: String) {
            ctx.startActivity(Intent(ctx, AbilityActivity::class.java).apply {
                putExtra(EXTRA_ABILITY, ability)
            })
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val abilityKey = intent.getStringExtra(EXTRA_ABILITY) ?: "attention"
        val ability = Seed.ABILITIES.first { it.key == abilityKey }
        val games = Seed.gamesOfAbility(abilityKey)
        val ctx = this

        val colorMap = mapOf(
            "att" to listOf("#FF9A3D", "#FFB347", "#FFE3B3"),
            "mem" to listOf("#AB8CE0", "#C3A9F0", "#E7DEFA"),
            "log" to listOf("#4FC3F7", "#7FD8FF", "#C9EDFF"),
            "rea" to listOf("#FF8A9B", "#FFAEB8", "#FFDDE2")
        )
        val colors = colorMap[ability.colorKey]!!

        val scroll = ScrollView(ctx)
        val root = KidUi.column(ctx, 18)
        scroll.addView(root)

        /* ---------- 返回 + hero ---------- */
        val topRow = LinearLayout(ctx).apply { gravity = Gravity.CENTER_VERTICAL }
        topRow.addView(KidUi.iconBtn(ctx, "‹", Color.parseColor(colors[0])) { finish() })
        topRow.addView(KidUi.text(ctx, ability.name, 18f, Color.parseColor("#3A2E2A"), bold = true),
            LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f))
        topRow.addView(KidUi.iconBtn(ctx, "🔊", Color.parseColor(colors[0])) {
            TtsBox.speak("${ability.name}，这里有五个好玩的游戏！")
        })
        root.addView(topRow)

        val hero = LinearLayout(ctx).apply {
            orientation = LinearLayout.VERTICAL
            background = KidUi.gradient(Color.parseColor(colors[0]), Color.parseColor(colors[1]), 22)
            setPadding(KidUi.dp(ctx, 20), KidUi.dp(ctx, 18), KidUi.dp(ctx, 20), KidUi.dp(ctx, 18))
        }
        hero.addView(KidUi.text(ctx, "${ability.icon} ${ability.place}", 22f, Color.WHITE, bold = true, gravity = Gravity.LEFT))
        hero.addView(KidUi.text(ctx, ability.desc, 13f, Color.WHITE, gravity = Gravity.LEFT))
        hero.addView(KidUi.text(ctx, "共 ${Seed.gamesOfAbility(abilityKey).size} 个游戏 · ${ability.lv}", 12f, Color.WHITE, gravity = Gravity.LEFT))
        root.addView(hero)

        /* ---------- 游戏卡 ---------- */
        games.forEachIndexed { idx, g ->
            val card = KidUi.card(ctx).apply {
                background = KidUi.rounded(Color.WHITE, 20, Color.parseColor(colors[2]))
            }
            val row = LinearLayout(ctx).apply { gravity = Gravity.CENTER_VERTICAL }
            val icon = KidUi.text(ctx, g.icon, 30f, Color.BLACK).apply {
                background = KidUi.rounded(Color.parseColor(colors[2]), 16)
                layoutParams = LinearLayout.LayoutParams(KidUi.dp(ctx, 58), KidUi.dp(ctx, 58))
                gravity = Gravity.CENTER
            }
            val col = LinearLayout(ctx).apply { orientation = LinearLayout.VERTICAL }
            col.addView(KidUi.text(ctx, g.name, 17f, Color.parseColor("#3A2E2A"), bold = true, gravity = Gravity.LEFT))
            col.addView(KidUi.text(ctx, g.diff, 12f, Color.parseColor("#8C7B76"), gravity = Gravity.LEFT))
            col.addView(KidUi.text(ctx, g.desc, 12f, Color.parseColor("#8C7B76"), gravity = Gravity.LEFT))
            row.addView(icon)
            val rlp = LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f)
            rlp.leftMargin = KidUi.dp(ctx, 12)
            row.addView(col, rlp)
            row.addView(KidUi.bigBtn(ctx, "开始", Color.parseColor(colors[0]), Color.parseColor(colors[1])) {
                GameActivity.start(ctx, g.id)
            })
            card.addView(row)
            card.setOnClickListener { GameActivity.start(ctx, g.id) }
            KidUi.bounceIn(card, idx * 80L)
            root.addView(card)
        }

        setContentView(scroll)
    }
}
