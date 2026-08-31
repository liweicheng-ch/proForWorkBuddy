package com.brainisland.kid.game

import android.graphics.Color
import android.view.Gravity
import android.view.ViewGroup
import android.widget.GridLayout
import android.widget.LinearLayout
import android.widget.TextView
import com.brainisland.kid.data.Seed
import com.brainisland.kid.util.KidUi

/**
 * 逻辑思维引擎（PRD GAME-011~015）：分类 / 排序 / 找规律 / 图形推理 / 条件推理
 */

/* ================= 逻辑 · 11 分类（GAME-011） ================= */
internal fun categorize(s: GameSession) {
    val ctx = s.ctx
    val cat = Seed.CATEGORIES[(s.round - 1) % Seed.CATEGORIES.size]
    s.s["cat"] = cat
    var found = 0
    val cells = (cat.items + cat.decoy).shuffled()

    s.setInst("🗂️", "把「${cat.name}」都放进篮子！")
    s.stage.addView(Engines.tileGrid(s, cells, 4) { e, v ->
        val isItem = e in cat.items
        if (isItem) {
            if (v.alpha < 1f) return@tileGrid
            v.alpha = 0.3f
            found++
            basketView?.text = "已放入 $found / 4 个"
            s.feedback("✅")
            if (found >= 4) {
                s.locked = true
                s.addStars(4)
                s.speak("太棒啦！全都放对了！")
                s.post(900) { s.nextRound() }
            }
        } else {
            if (v.alpha < 1f) return@tileGrid
            KidUi.shake(v)
            s.feedback("💭")
            s.speak("这个不是${cat.name}哦！")
        }
    })

    // 篮子计数卡
    val basket = KidUi.card(ctx).apply {
        background = KidUi.rounded(Color.parseColor("#FFF3D6"), 20)
    }
    val row = LinearLayout(ctx).apply { gravity = Gravity.CENTER_VERTICAL }
    val icon = TextView(ctx).apply {
        text = "🧺"
        textSize = 30f
        gravity = Gravity.CENTER
        background = KidUi.rounded(Color.WHITE, 14)
        layoutParams = LinearLayout.LayoutParams(KidUi.dp(ctx, 56), KidUi.dp(ctx, 56))
    }
    val col = LinearLayout(ctx).apply { orientation = LinearLayout.VERTICAL }
    col.addView(KidUi.text(ctx, "篮子 · ${cat.name}", 15f, Color.parseColor("#633806"), bold = true, gravity = Gravity.LEFT))
    val cnt = KidUi.text(ctx, "已放入 0 / 4 个", 12f, Color.parseColor("#854F0B"), gravity = Gravity.LEFT)
    col.addView(cnt)
    row.addView(icon)
    row.addView(col)
    basket.addView(row)
    s.stage.addView(basket)
    basketView = cnt

    s.post(500) { s.speak("把「${cat.name}」都放进篮子！") }
}

private var basketView: TextView? = null

/* ================= 逻辑 · 12 排序（GAME-012） ================= */
internal fun orderBy(s: GameSession) {
    val ctx = s.ctx
    val n = listOf(3, 4, 5)[Math.min(s.round - 1, 2)]
    val items = Seed.ORDER_POOL.shuffled().take(n).sortedBy { it.size }
    s.s["order"] = items
    var step = 0

    s.setInst("📏", "从小到大，把它们一个个排好！")

    items.shuffled().forEach { it ->
        val row = LinearLayout(ctx).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            background = KidUi.rounded(Color.WHITE, 16, Color.parseColor("#F0E0D0"))
            setPadding(KidUi.dp(ctx, 14), KidUi.dp(ctx, 10), KidUi.dp(ctx, 14), KidUi.dp(ctx, 10))
            val lp = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT)
            lp.setMargins(0, KidUi.dp(ctx, 6), 0, KidUi.dp(ctx, 6))
            layoutParams = lp
        }
        val emoji = TextView(ctx).apply {
            text = it.emoji
            textSize = 30f
            gravity = Gravity.CENTER
            background = KidUi.rounded(Color.parseColor("#C9EDFF"), 14)
            layoutParams = LinearLayout.LayoutParams(KidUi.dp(ctx, 52), KidUi.dp(ctx, 52))
        }
        val name = TextView(ctx).apply {
            text = it.name
            textSize = 15f
            setTextColor(Color.parseColor("#3A2E2A"))
            gravity = Gravity.LEFT
            layoutParams = LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f).apply {
                leftMargin = KidUi.dp(ctx, 12)
            }
        }
        val idx = TextView(ctx).apply {
            text = "?"
            textSize = 18f
            setTextColor(Color.parseColor("#4FC3F7"))
            gravity = Gravity.CENTER
            background = KidUi.rounded(Color.parseColor("#E6F1FB"), 12)
            layoutParams = LinearLayout.LayoutParams(KidUi.dp(ctx, 40), KidUi.dp(ctx, 40))
        }
        row.addView(emoji); row.addView(name); row.addView(idx)
        row.setOnClickListener { v ->
            if (s.locked || v.alpha < 1f) return@setOnClickListener
            val expected = items[step]
            if (it.size == expected.size) {
                v.alpha = 0.55f
                idx.text = "${step + 1}"
                step++
                s.feedback("✅")
                if (step >= items.size) {
                    s.locked = true
                    s.addStars(items.size * 2)
                    s.speak("排好队啦，真棒！")
                    s.post(900) { s.nextRound() }
                }
            } else {
                KidUi.shake(v)
                s.feedback("💭")
                s.speak("再想想，最小的还没排哦！")
            }
        }
        s.stage.addView(row)
    }
    s.post(500) { s.speak("从小到大排好！先点最小的！") }
}

/* ================= 逻辑 · 13 找规律（GAME-013） ================= */
internal fun pattern(s: GameSession) {
    val p = Seed.PATTERNS[(s.round - 1) % Seed.PATTERNS.size]
    s.s["pattern"] = p

    s.setInst("🔤", "看一看，下一个是什么？")
    s.stage.addView(Engines.seqRow(s, p.seq + "❓", lastIsQuestion = true))
    s.stage.addView(Engines.optList(s, p.opts, emojiOf = { it }) { o, v ->
        s.onAnswer(o == p.ans, v)
    })
    s.post(500) { s.speak("看一看规律，下一个是什么？") }
}

/* ================= 逻辑 · 14 图形推理（GAME-014） ================= */
internal fun shapeReason(s: GameSession) {
    val p = Seed.SHAPE_PATTERNS[(s.round - 1) % Seed.SHAPE_PATTERNS.size]
    s.s["pattern"] = p

    s.setInst("🔷", "图形在按规律跳舞，下一个是谁？")
    s.stage.addView(Engines.seqRow(s, p.seq + "❓", lastIsQuestion = true))
    s.stage.addView(Engines.optList(s, p.opts, emojiOf = { it }) { o, v ->
        s.onAnswer(o == p.ans, v)
    })
    s.post(500) { s.speak("图形在跳舞，下一个是谁？") }
}

/* ================= 逻辑 · 15 条件推理（GAME-015） ================= */
internal fun conditional(s: GameSession) {
    val q = Seed.CONDITIONAL_QUIZ[(s.round - 1) % Seed.CONDITIONAL_QUIZ.size]
    s.s["condQ"] = q

    s.setInst("⚖️", "比一比，想一想！")
    val textCard = KidUi.card(s.ctx).apply {
        background = KidUi.rounded(Color.parseColor("#E6F1FB"), 20)
    }
    textCard.addView(KidUi.text(s.ctx, q.text, 17f, Color.parseColor("#0C447C"), bold = true, gravity = Gravity.LEFT))
    s.stage.addView(textCard)

    s.stage.addView(Engines.optList(s, q.opts.map { it.second }, emojiOf = { e ->
        q.opts.firstOrNull { it.second == e }?.first ?: "🔸"
    }) { o, v ->
        s.onAnswer(o == q.a, v)
    })
    s.post(500) { s.speak(q.text + " " + q.q) }
}
