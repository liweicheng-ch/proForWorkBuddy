package com.brainisland.kid.game

import android.graphics.Color
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.widget.GridLayout
import android.widget.LinearLayout
import android.widget.TextView
import com.brainisland.kid.data.Seed
import com.brainisland.kid.util.KidUi

/**
 * 游戏引擎注册表 + 公共构建工具 + 专注力/记忆力引擎（PRD GAME-001~010）
 */
object Engines {

    private val engines: Map<String, (GameSession) -> Unit> = mapOf(
        // 专注力
        "find_target" to ::findTarget,
        "find_diff" to ::findDiff,
        "visual_track" to ::visualTrack,
        "eliminate_interf" to ::eliminateInterf,
        "auditory_att" to ::auditoryAtt,
        // 记忆力
        "card_flip" to ::cardFlip,
        "seq_memory" to ::seqMemory,
        "pic_memory" to ::picMemory,
        "pos_memory" to ::posMemory,
        "story_memory" to ::storyMemory,
        // 逻辑
        "categorize" to ::categorize,
        "order_by" to ::orderBy,
        "pattern" to ::pattern,
        "shape_reason" to ::shapeReason,
        "conditional" to ::conditional,
        // 阅读（EnginesReading.kt）
        "story_quiz" to ::storyQuiz,
        "story_listen" to ::storyListen,
        "story_sequence" to ::storySequence,
        "story_character" to ::storyCharacter,
        "story_cause" to ::storyCause
    )

    fun run(id: String, s: GameSession) {
        engines[id]?.invoke(s) ?: findTarget(s)
    }

    /* ================= 公共构建工具 ================= */

    /** emoji 瓦片网格 */
    fun tileGrid(s: GameSession, items: List<String>, cols: Int, sizeDp: Int = 78,
                 label: Boolean = false, labelOf: (String) -> String = { "" },
                 onClick: (String, TextView) -> Unit): GridLayout {
        val ctx = s.ctx
        val grid = GridLayout(ctx).apply {
            columnCount = cols
            alignmentMode = GridLayout.ALIGN_BOUNDS
            layoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT)
        }
        items.forEachIndexed { i, e ->
            val tv = TextView(ctx).apply {
                text = if (label) "$e\n${labelOf(e)}" else e
                textSize = if (label) 22f else 30f
                setTextColor(Color.parseColor("#3A2E2A"))
                gravity = Gravity.CENTER
                background = KidUi.rounded(Color.WHITE, 18, Color.parseColor("#F0E0D0"))
                setPadding(0, KidUi.dp(ctx, if (label) 6 else 12), 0, KidUi.dp(ctx, if (label) 6 else 12))
                val lp = GridLayout.LayoutParams()
                lp.width = 0
                lp.height = ViewGroup.LayoutParams.WRAP_CONTENT
                lp.columnSpec = GridLayout.spec(GridLayout.UNDEFINED, 1f)
                lp.setMargins(KidUi.dp(ctx, 5), KidUi.dp(ctx, 5), KidUi.dp(ctx, 5), KidUi.dp(ctx, 5))
                layoutParams = lp
                setOnClickListener {
                    if (s.locked) return@setOnClickListener
                    KidUi.pop(it)
                    onClick(e, this)
                }
            }
            KidUi.bounceIn(tv, i * 50L)
            grid.addView(tv)
        }
        return grid
    }

    /** 选择题选项（emoji + 文字） */
    fun optList(s: GameSession, options: List<String>, emojiOf: (String) -> String = { "🔸" },
                onClick: (String, TextView) -> Unit): LinearLayout {
        val ctx = s.ctx
        val box = LinearLayout(ctx).apply {
            orientation = LinearLayout.VERTICAL
            layoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT)
        }
        options.forEach { o ->
            val tv = TextView(ctx).apply {
                text = "${emojiOf(o)}  $o"
                textSize = 16f
                setTextColor(Color.parseColor("#3A2E2A"))
                gravity = Gravity.CENTER_VERTICAL
                background = KidUi.rounded(Color.WHITE, 16, Color.parseColor("#F0E0D0"))
                setPadding(KidUi.dp(ctx, 18), KidUi.dp(ctx, 14), KidUi.dp(ctx, 18), KidUi.dp(ctx, 14))
                val lp = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT)
                lp.setMargins(0, KidUi.dp(ctx, 6), 0, KidUi.dp(ctx, 6))
                layoutParams = lp
                setOnClickListener {
                    if (s.locked) return@setOnClickListener
                    KidUi.pop(it)
                    onClick(o, this)
                }
            }
            box.addView(tv)
        }
        return box
    }

    /** 序列展示行（找规律/顺序记忆） */
    fun seqRow(s: GameSession, items: List<String>, lastIsQuestion: Boolean = false): LinearLayout {
        val ctx = s.ctx
        val row = LinearLayout(ctx).apply {
            gravity = Gravity.CENTER
            layoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT)
        }
        items.forEachIndexed { i, e ->
            val tv = TextView(ctx).apply {
                text = e
                textSize = 24f
                gravity = Gravity.CENTER
                setTextColor(Color.parseColor("#3A2E2A"))
                background = KidUi.rounded(
                    if (lastIsQuestion && i == items.size - 1) Color.parseColor("#FFF3D6") else Color.WHITE,
                    14, if (lastIsQuestion && i == items.size - 1) Color.parseColor("#FFD166") else Color.parseColor("#F0E0D0"))
                layoutParams = LinearLayout.LayoutParams(KidUi.dp(ctx, 54), KidUi.dp(ctx, 54)).apply {
                    setMargins(KidUi.dp(ctx, 4), KidUi.dp(ctx, 4), KidUi.dp(ctx, 4), KidUi.dp(ctx, 4))
                }
                tag = "seq_$i"
            }
            row.addView(tv)
        }
        return row
    }

    /** 文章展示卡（阅读引擎通用） */
    fun storyCard(s: GameSession, badge: String, title: String, text: String,
                  showReplay: Boolean, replayText: String, btnText: String,
                  onStart: () -> Unit): LinearLayout {
        val ctx = s.ctx
        val card = KidUi.card(ctx).apply {
            background = KidUi.rounded(Color.WHITE, 20, Color.parseColor("#F3E5D8"))
        }
        val badgeView = TextView(ctx).apply {
            setText(badge)
            textSize = 11f
            setTextColor(Color.parseColor("#993556"))
            background = KidUi.rounded(Color.parseColor("#FFDDE2"), 10)
            setPadding(KidUi.dp(ctx, 10), KidUi.dp(ctx, 4), KidUi.dp(ctx, 10), KidUi.dp(ctx, 4))
            layoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT)
        }
        card.addView(badgeView)
        card.addView(KidUi.text(ctx, title, 19f, Color.parseColor("#3A2E2A"), bold = true, gravity = Gravity.LEFT))
        card.addView(KidUi.text(ctx, text, 15f, Color.parseColor("#5F5E5A"), gravity = Gravity.LEFT).apply {
            setLineSpacing(KidUi.dp(ctx, 4).toFloat(), 1f)
        })
        if (showReplay) {
            val replay = KidUi.bigBtn(ctx, "🔊 $replayText", Color.parseColor("#4FC3F7"), Color.parseColor("#7FD8FF")) {
                s.speak(title + "。" + text.replace("\n", "，"))
            }
            replay.textSize = 14f
            card.addView(replay)
        }
        card.addView(KidUi.bigBtn(ctx, btnText, Color.parseColor("#FF9A3D"), Color.parseColor("#FFB347")) {
            s.stage.removeAllViews()
            onStart()
        })
        return card
    }

    /* ================= 专注力 · 1 找一找（GAME-001） ================= */
    private fun findTarget(s: GameSession) {
        val animals = Seed.ANIMAL_NAME.keys.toList()
        val target = animals.random()
        s.s["target"] = target
        val count = listOf(6, 9, 12)[Math.min(s.round - 1, 2)]
        var pool = animals.shuffled().take(count).toMutableList()
        if (target !in pool) pool[pool.indices.random()] = target
        pool.shuffle()

        s.setInst(target, "找到${Seed.ANIMAL_NAME[target]}！")
        s.stage.addView(tileGrid(s, pool, if (count > 6) 4 else 3) { e, v ->
            s.onAnswer(e == target, v)
        })
        s.post(500) { s.speak("找到${Seed.ANIMAL_NAME[target]}！") }
    }

    /* ================= 专注力 · 2 找不同（GAME-002） ================= */
    private fun findDiff(s: GameSession) {
        val pair = Seed.DIFF_PAIRS.random()
        val n = listOf(6, 8, 9)[Math.min(s.round - 1, 2)]
        val diffIdx = (0 until n).random()
        val cells = (0 until n).map { if (it == diffIdx) pair[1] else pair[0] }.shuffled()

        s.setInst("🕵️", "找出不一样的那个！")
        s.stage.addView(tileGrid(s, cells, 3) { e, v ->
            s.onAnswer(e == pair[1], v)
        })
        s.post(500) { s.speak("找出不一样的那个！") }
    }

    /* ================= 专注力 · 3 视觉追踪（GAME-003） ================= */
    private fun visualTrack(s: GameSession) {
        val ctx = s.ctx
        var ball = 0
        val moves = 1 + s.round
        var cur = 0
        var playing = false

        s.setInst("👀", "看仔细！小星星在哪一个杯子里？")

        val cupRow = LinearLayout(ctx).apply {
            gravity = Gravity.CENTER
            layoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT)
        }
        val cups = (0 until 3).map { i ->
            TextView(ctx).apply {
                text = "🥤"
                textSize = 44f
                gravity = Gravity.CENTER
                setTextColor(Color.parseColor("#3A2E2A"))
                background = KidUi.rounded(Color.WHITE, 20, Color.parseColor("#F0E0D0"))
                layoutParams = LinearLayout.LayoutParams(KidUi.dp(ctx, 96), KidUi.dp(ctx, 110)).apply {
                    setMargins(KidUi.dp(ctx, 8), KidUi.dp(ctx, 20), KidUi.dp(ctx, 8), KidUi.dp(ctx, 20))
                }
                setOnClickListener {
                    if (playing || s.locked) return@setOnClickListener
                    val ok = i == ball
                    if (ok) text = "⭐\n🥤"
                    s.onAnswer(ok, it) { s.post(200) { s.nextRound() } }
                }
            }
        }
        cups.forEach { cupRow.addView(it) }
        s.stage.addView(cupRow)

        fun runMoves() {
            playing = true
            fun step() {
                if (cur >= moves) {
                    s.speak("好了！小星星现在在哪里？")
                    playing = false
                    return
                }
                cur++
                val other = (0 until 3).filter { it != ball }.random()
                // 交换动画：两个杯子弹跳 + 旧杯亮一下
                val c1 = cups[ball]
                val c2 = cups[other]
                KidUi.celebrate(c1); KidUi.celebrate(c2)
                s.post(350) {
                    ball = other
                    s.post(500) { step() }
                }
            }
            step()
        }

        s.post(400) {
            s.speak("看仔细！小星星要开始跳了！")
            s.post(800) { runMoves() }
        }
    }

    /* ================= 专注力 · 4 消除干扰（GAME-004） ================= */
    private fun eliminateInterf(s: GameSession) {
        val cat = Seed.CATEGORIES[(s.round - 1) % Seed.CATEGORIES.size]
        s.s["cat"] = cat
        var found = 0
        val cells = (cat.items + cat.decoy).shuffled()

        s.setInst(cat.items[0], "只点「${cat.name}」！")
        s.stage.addView(tileGrid(s, cells, 4) { e, v ->
            val isItem = e in cat.items
            if (isItem) {
                if (v.alpha < 1f) return@tileGrid
                v.alpha = 0.3f
                found++
                s.feedback("✅")
                if (found >= 4) {
                    s.locked = true
                    s.addStars(4)
                    s.speak("太棒啦！都找对了！")
                    s.post(900) { s.nextRound() }
                }
            } else {
                if (v.alpha < 1f) return@tileGrid
                KidUi.shake(v)
                s.feedback("💭")
                s.speak("这个不是${cat.name}哦，再找找！")
            }
        })
        s.post(500) { s.speak("只点「${cat.name}」！") }
    }

    /* ================= 专注力 · 5 听觉注意（GAME-005） ================= */
    private fun auditoryAtt(s: GameSession) {
        val pool = Seed.SOUND_ANIMALS.shuffled().take(4)
        val target = pool.random()
        s.s["soundTarget"] = target

        s.setInst("👂", "仔细听！这是谁的声音？")
        val nameOf = Seed.SOUND_ANIMALS.associate { (e, n, _) -> e to n }
        s.stage.addView(tileGrid(s, pool.map { it.first }, 2, label = true, labelOf = { nameOf[it] ?: "" }) { e, v ->
            s.onAnswer(e == target.first, v)
        })
        s.post(600) { s.speak("听一听，这是谁的声音？${target.third} 猜猜我是谁？") }
    }

    /* ================= 记忆力 · 6 翻牌记忆（GAME-006） ================= */
    private fun cardFlip(s: GameSession) {
        val ctx = s.ctx
        val pairs = listOf(3, 4, 5)[Math.min(s.round - 1, 2)]
        val chosen = Seed.FLIP_EMOJIS.shuffled().take(pairs)
        val deck = (chosen + chosen).shuffled()

        s.setInst("🃏", "翻开卡片，找到一样的配对！")

        var first: TextView? = null
        var busy = false
        var matched = 0

        val grid = GridLayout(ctx).apply {
            columnCount = if (pairs >= 4) 4 else 3
            layoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT)
        }
        deck.forEachIndexed { i, e ->
            val tv = TextView(ctx).apply {
                text = "❓"
                textSize = 34f
                gravity = Gravity.CENTER
                setTextColor(Color.parseColor("#AB8CE0"))
                background = KidUi.rounded(Color.parseColor("#E7DEFA"), 18, Color.parseColor("#C3A9F0"))
                setPadding(0, KidUi.dp(ctx, 16), 0, KidUi.dp(ctx, 16))
                val lp = GridLayout.LayoutParams()
                lp.width = 0
                lp.columnSpec = GridLayout.spec(GridLayout.UNDEFINED, 1f)
                lp.setMargins(KidUi.dp(ctx, 5), KidUi.dp(ctx, 5), KidUi.dp(ctx, 5), KidUi.dp(ctx, 5))
                layoutParams = lp
                setOnClickListener {
                    if (busy || s.locked) return@setOnClickListener
                    if (text != "❓") return@setOnClickListener
                    KidUi.pop(it)
                    text = e
                    val f = first
                    if (f == null) {
                        first = this
                    } else {
                        first = null
                        busy = true
                        if (f.text == e) {
                            s.post(350) {
                                markPair(this); markPair(f)
                                matched++
                                busy = false
                                s.feedback("🎉")
                                if (matched >= pairs) {
                                    s.locked = true
                                    s.addStars(pairs * 2)
                                    s.speak("全部配对成功！")
                                    s.post(900) { s.nextRound() }
                                }
                            }
                        } else {
                            s.post(800) {
                                this.text = "❓"; f.text = "❓"
                                busy = false
                                s.feedback("💭")
                                s.speak("不一样哦，再试一次！")
                            }
                        }
                    }
                }
            }
            KidUi.bounceIn(tv, i * 60L)
            grid.addView(tv)
        }
        s.stage.addView(grid)
        s.post(500) { s.speak("翻开卡片，找到一样的配对！") }
    }

    private fun markPair(v: TextView) {
        v.alpha = 0.35f
        (v.background?.mutate() as? android.graphics.drawable.GradientDrawable)
            ?.setColor(Color.parseColor("#D2F0D3"))
    }

    /* ================= 记忆力 · 7 顺序记忆（GAME-007） ================= */
    private fun seqMemory(s: GameSession) {
        val base = Seed.SEQ_POOLS[(s.round - 1) % Seed.SEQ_POOLS.size]
        val len = listOf(3, 4, 5)[Math.min(s.round - 1, 2)]
        val seq = (base + Seed.SEQ_DECOY_POOL.random()).take(len)
        val qIdx = seq.indices.random()
        s.s["seq"] = seq
        s.s["qIdx"] = qIdx

        s.setInst("🔢", "记住它们出现的顺序！")
        val row = seqRow(s, seq)
        s.stage.addView(row)

        val ordinals = listOf("一", "二", "三", "四", "五")
        seq.forEachIndexed { i, _ ->
            s.post(500 + i * 900L) {
                (row.getChildAt(i) as? TextView)?.let { box ->
                    (box.background?.mutate() as? android.graphics.drawable.GradientDrawable)
                        ?.setColor(Color.parseColor("#FFF3D6"))
                    KidUi.celebrate(box)
                }
                s.speak("第${ordinals[i]}个，${seq[i]}")
            }
        }
        s.post(500 + seq.size * 900L + 400) {
            row.removeAllViews()
            repeat(seq.size) { i ->
                val box = TextView(s.ctx).apply {
                    text = "❓"
                    textSize = 26f
                    gravity = Gravity.CENTER
                    setTextColor(Color.parseColor("#AB8CE0"))
                    background = KidUi.rounded(Color.WHITE, 14, Color.parseColor("#F0E0D0"))
                    layoutParams = LinearLayout.LayoutParams(KidUi.dp(s.ctx, 54), KidUi.dp(s.ctx, 54)).apply {
                        setMargins(KidUi.dp(s.ctx, 4), 0, KidUi.dp(s.ctx, 4), 0)
                    }
                }
                row.addView(box)
            }
            s.speak("第${ordinals[qIdx]}个是什么？")
            val correct = seq[qIdx]
            val decoys = Seed.SEQ_OPT_POOL.filter { it != correct }.shuffled().take(3)
            s.stage.addView(optList(s, (listOf(correct) + decoys).shuffled(), emojiOf = { it }) { o, v ->
                s.onAnswer(o == correct, v)
            })
        }
    }

    /* ================= 记忆力 · 8 图片记忆（GAME-008） ================= */
    private fun picMemory(s: GameSession) {
        val n = listOf(3, 4, 5)[Math.min(s.round - 1, 2)]
        val shown = Seed.PIC_POOL.shuffled().take(n)
        val target = shown.random()
        s.s["picTarget"] = target

        s.setInst("🖼️", "看仔细！记住这些图案！")
        s.stage.addView(tileGrid(s, shown, 4) { _, _ -> })
        s.post(500) { s.speak("记住这些图案，等会要考考你！") }

        s.post(2600 + n * 500L) {
            s.stage.removeAllViews()
            s.setInst("❓", "刚才哪个图案出现过？")
            val decoys = Seed.PIC_POOL.filter { it != target }.shuffled().take(3)
            s.stage.addView(optList(s, (listOf(target) + decoys).shuffled(), emojiOf = { it }) { o, v ->
                s.onAnswer(o == target, v)
            })
            s.post(400) { s.speak("刚才哪个图案出现过？") }
        }
    }

    /* ================= 记忆力 · 9 位置记忆（GAME-009） ================= */
    private fun posMemory(s: GameSession) {
        val n = listOf(1, 2, 3)[Math.min(s.round - 1, 2)]
        val items = Seed.POS_ITEMS.take(n)
        val target = items.random()
        val cells = MutableList(9) { "" }
        val used = mutableListOf<Int>()
        while (used.size < n) {
            val p = (0 until 9).random()
            if (p !in used) used.add(p)
        }
        used.forEachIndexed { i, p -> cells[p] = items[i] }
        s.s["posCells"] = cells.toList()
        s.s["posTarget"] = target

        s.setInst("🗺️", "记住每样东西放在哪里！")
        fun renderCells(quizMode: Boolean) {
            s.stage.removeAllViews()
            val grid = GridLayout(s.ctx).apply {
                columnCount = 3
                layoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT)
            }
            cells.forEachIndexed { idx, e ->
                val tv = TextView(s.ctx).apply {
                    text = e
                    textSize = 26f
                    gravity = Gravity.CENTER
                    setTextColor(Color.parseColor("#3A2E2A"))
                    alpha = if (quizMode && e.isNotEmpty()) 0.25f else 1f
                    background = KidUi.rounded(Color.WHITE, 18, Color.parseColor("#F0E0D0"))
                    val lp = GridLayout.LayoutParams()
                    lp.width = 0
                    lp.height = KidUi.dp(s.ctx, 88)
                    lp.columnSpec = GridLayout.spec(GridLayout.UNDEFINED, 1f)
                    lp.setMargins(KidUi.dp(s.ctx, 5), KidUi.dp(s.ctx, 5), KidUi.dp(s.ctx, 5), KidUi.dp(s.ctx, 5))
                    layoutParams = lp
                    if (quizMode) {
                        setOnClickListener {
                            if (s.locked) return@setOnClickListener
                            KidUi.pop(it)
                            val correct = cells[idx] == target
                            if (correct) text = target
                            s.onAnswer(correct, it)
                        }
                    }
                }
                grid.addView(tv)
            }
            s.stage.addView(grid)
        }
        renderCells(false)
        s.post(500) { s.speak("记住每样东西放在哪里！") }

        s.post(2500 + n * 400L) {
            s.setInst("❓", "$target 刚才在哪里？")
            renderCells(true)
            s.post(400) { s.speak("$target 刚才在哪里？点一点！") }
        }
    }

    /* ================= 记忆力 · 10 故事记忆（GAME-010） ================= */
    private fun storyMemory(s: GameSession) {
        val arts = Seed.articlesBy("A", null)
        val art = arts[(s.round - 1) % arts.size]
        s.s["memArticle"] = art

        s.setInst("🎬", "仔细听故事，等会要回答问题！")
        s.stage.addView(storyCard(s, "Level A · 故事记忆", "📖 ${art.title}", art.text,
            showReplay = true, replayText = "再听一遍", btnText = "🎯 开始答题") {
            val q = art.questions.random()
            s.s["memQ"] = q
            s.setInst("❓", q.q)
            s.stage.addView(optList(s, q.opts) { o, v ->
                s.onAnswer(o == q.a, v)
            })
            s.post(400) { s.speak(q.q) }
        })
        s.post(500) { s.speak(art.title + "。" + art.text.replace("\n", "，")) }
    }
}
