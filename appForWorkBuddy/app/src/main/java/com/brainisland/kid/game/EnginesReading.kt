package com.brainisland.kid.game

import android.graphics.Color
import android.view.Gravity
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.TextView
import com.brainisland.kid.data.Article
import com.brainisland.kid.data.Seed
import com.brainisland.kid.data.Store
import com.brainisland.kid.util.KidUi

/**
 * 阅读理解引擎（PRD V2.2 五引擎 GAME-016~020）
 * 统一流程：取文章 → 故事展示 → 答题
 */

/** 按当前级别与已用文章取一篇 */
private fun articleForRound(s: GameSession): Article {
    val level = Store.readLevel(s.ctx)
    if (s.articleId != null && s.round == 1) {
        val pre = Seed.articleById(s.articleId)
        if (pre.level == level) {
            s.s["used"] = listOf(pre.id)
            return pre
        }
    }
    val arts = Seed.articlesBy(level, null)
    @Suppress("UNCHECKED_CAST")
    val used = (s.s["used"] as? List<String>) ?: emptyList()
    val fresh = arts.filter { it.id !in used }
    val pool = if (fresh.isNotEmpty()) fresh else arts
    val art = pool[(s.round - 1) % pool.size]
    s.s["used"] = used + art.id
    return art
}

/** 出题并渲染选项 */
private fun renderQuiz(s: GameSession, art: Article) {
    val q = art.questions[Math.min((s.round - 1) % art.questions.size, art.questions.size - 1)]
    s.s["artQ"] = q
    s.setInst("❓", q.q)
    s.stage.addView(Engines.optList(s, q.opts) { o, v ->
        s.onAnswer(o == q.a, v)
    })
    s.post(400) { s.speak(q.q) }
}

/* ================= 阅读 · 16 读文答题（GAME-016） ================= */
internal fun storyQuiz(s: GameSession) {
    val art = articleForRound(s)
    s.s["art"] = art

    s.setInst("📖", "先读一读，再回答问题！")
    s.stage.addView(Engines.storyCard(s, "${art.level} 级 · 读文答题", "📖 ${art.title}", art.text,
        showReplay = false, replayText = "", btnText = "🎯 开始答题") {
        renderQuiz(s, art)
    })
    s.post(500) { s.speak("请读一读《${art.title}》") }
}

/* ================= 阅读 · 17 听故事（GAME-017，自动朗读+隐藏暂停） ================= */
internal fun storyListen(s: GameSession) {
    val art = articleForRound(s)
    s.s["art"] = art

    s.setInst("🔊", "竖起小耳朵，听故事！")
    // PRD V2.2：展示阶段隐藏暂停按钮
    s.hidePause(true)
    s.stage.addView(Engines.storyCard(s, "${art.level} 级 · 听故事", "🔊 ${art.title}", art.text,
        showReplay = true, replayText = "再听一遍", btnText = "🎯 听完啦，开始答题") {
        s.hidePause(false)
        renderQuiz(s, art)
    })
    s.post(500) { s.speak(art.title + "。" + art.text.replace("\n", "，")) }
}

/* ================= 阅读 · 18 故事排序（GAME-018） ================= */
internal fun storySequence(s: GameSession) {
    val ctx = s.ctx
    val art = articleForRound(s)
    s.s["seqArt"] = art

    var sents = splitSentences(art)
    if (sents.size < 3) sents = listOf("小猫去河边钓鱼。", "河水清清的。", "小猫钓到一条大鱼。")
    s.s["sents"] = sents
    var step = 0

    s.setInst("🔢", "按故事顺序，先点第一句！")

    // 标题卡
    val head = KidUi.card(ctx).apply {
        background = KidUi.rounded(Color.parseColor("#C9EDFF"), 20)
    }
    head.addView(KidUi.text(ctx, "📖 ${art.title}", 18f, Color.parseColor("#0C447C"), bold = true, gravity = Gravity.LEFT))
    s.stage.addView(head)

    sents.shuffled().forEach { sent ->
        val row = LinearLayout(ctx).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            background = KidUi.rounded(Color.WHITE, 16, Color.parseColor("#F0E0D0"))
            setPadding(KidUi.dp(ctx, 14), KidUi.dp(ctx, 12), KidUi.dp(ctx, 14), KidUi.dp(ctx, 12))
            val lp = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT)
            lp.setMargins(0, KidUi.dp(ctx, 6), 0, KidUi.dp(ctx, 6))
            layoutParams = lp
        }
        val icon = TextView(ctx).apply {
            text = "📄"
            textSize = 24f
            gravity = Gravity.CENTER
            background = KidUi.rounded(Color.parseColor("#FFF3D6"), 12)
            layoutParams = LinearLayout.LayoutParams(KidUi.dp(ctx, 44), KidUi.dp(ctx, 44))
        }
        val body = TextView(ctx).apply {
            text = sent
            textSize = 14f
            setTextColor(Color.parseColor("#3A2E2A"))
            gravity = Gravity.LEFT
            layoutParams = LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f).apply {
                leftMargin = KidUi.dp(ctx, 10)
            }
        }
        val idx = TextView(ctx).apply {
            text = "?"
            textSize = 17f
            setTextColor(Color.parseColor("#4FC3F7"))
            gravity = Gravity.CENTER
            background = KidUi.rounded(Color.parseColor("#E6F1FB"), 12)
            layoutParams = LinearLayout.LayoutParams(KidUi.dp(ctx, 36), KidUi.dp(ctx, 36))
        }
        row.addView(icon); row.addView(body); row.addView(idx)
        row.setOnClickListener { v ->
            if (s.locked || v.alpha < 1f) return@setOnClickListener
            val expected = sents[step]
            if (sent == expected) {
                v.alpha = 0.55f
                idx.text = "${step + 1}"
                step++
                s.feedback("✅")
                if (step >= sents.size) {
                    s.locked = true
                    s.addStars(sents.size * 2)
                    s.speak("故事排好啦，真棒！")
                    s.post(900) { s.nextRound() }
                } else {
                    s.speak("对！下一句呢？")
                }
            } else {
                KidUi.shake(v)
                s.feedback("💭")
                s.speak("再想想，这一句应该在哪里？")
            }
        }
        s.stage.addView(row)
    }
    s.post(500) { s.speak("把句子按故事顺序排好！先点第一句！") }
}

private fun splitSentences(art: Article): List<String> {
    val text = art.text.replace("\n", "。")
    return text.split("。")
        .filter { it.trim().isNotEmpty() }
        .take(4)
        .map { it.trim() + "。" }
}

/* ================= 阅读 · 19 人物判断（GAME-019） ================= */
internal fun storyCharacter(s: GameSession) {
    val q = Seed.CHARACTER_QUIZ[(s.round - 1) % Seed.CHARACTER_QUIZ.size]
    s.s["charQ"] = q

    s.setInst("👤", "读一读，谁做了什么？")
    val textCard = KidUi.card(s.ctx).apply {
        background = KidUi.rounded(Color.parseColor("#FFDDE2"), 20)
    }
    textCard.addView(KidUi.text(s.ctx, q.text, 17f, Color.parseColor("#993556"), bold = true, gravity = Gravity.LEFT))
    s.stage.addView(textCard)

    s.stage.addView(Engines.optList(s, q.opts, emojiOf = { "👤" }) { o, v ->
        s.onAnswer(o == q.a, v)
    })
    s.post(500) { s.speak(q.text + " " + q.q) }
}

/* ================= 阅读 · 20 因果推理（GAME-020） ================= */
internal fun storyCause(s: GameSession) {
    val q = Seed.CAUSE_QUIZ[(s.round - 1) % Seed.CAUSE_QUIZ.size]
    s.s["causeQ"] = q

    s.setInst("🔗", "想一想，为什么会这样？")
    val textCard = KidUi.card(s.ctx).apply {
        background = KidUi.rounded(Color.parseColor("#C9EDFF"), 20)
    }
    textCard.addView(KidUi.text(s.ctx, q.text, 17f, Color.parseColor("#0C447C"), bold = true, gravity = Gravity.LEFT))
    s.stage.addView(textCard)

    s.stage.addView(Engines.optList(s, q.opts, emojiOf = { "🔗" }) { o, v ->
        s.onAnswer(o == q.a, v)
    })
    s.post(500) { s.speak(q.text + " " + q.q) }
}
