package com.brainisland.kid.game

import android.app.Dialog
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.brainisland.kid.data.Seed
import com.brainisland.kid.data.Store
import com.brainisland.kid.tts.TtsBox
import com.brainisland.kid.util.KidUi
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * 通用游戏容器：标题 / 轮次 / 星星 / 指令 / 进度 / 反馈 / 暂停 / 结果弹层
 * 游戏生命周期（PRD §22）：INTRO → PLAYING → SUCCESS/FAILURE → REWARD → FINISH
 */
class GameActivity : AppCompatActivity() {

    companion object {
        private const val EXTRA_GAME = "game_id"
        private const val EXTRA_ARTICLE = "article_id"

        fun start(ctx: Context, gameId: String, articleId: String? = null) {
            ctx.startActivity(Intent(ctx, GameActivity::class.java).apply {
                putExtra(EXTRA_GAME, gameId)
                putExtra(EXTRA_ARTICLE, articleId)
            })
        }
    }

    lateinit var session: GameSession
    private val handler = Handler(Looper.getMainLooper())

    private lateinit var titleView: TextView
    private lateinit var roundView: TextView
    private lateinit var starsView: TextView
    private lateinit var diffView: TextView
    private lateinit var pauseBtn: TextView
    private lateinit var instEmoji: TextView
    private lateinit var instText: TextView
    private lateinit var progressBar: LinearLayout
    private lateinit var fbView: TextView
    private lateinit var stageScroll: ScrollView
    lateinit var stage: LinearLayout

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val gameId = intent.getStringExtra(EXTRA_GAME) ?: "find_target"
        val articleId = intent.getStringExtra(EXTRA_ARTICLE)
        val cfg = Seed.gameById(gameId)

        buildUi(cfg)

        session = GameSession(this, gameId, articleId)
        session.start()
    }

    /* ================= UI 构建 ================= */
    private fun buildUi(cfg: com.brainisland.kid.data.GameDef) {
        val ctx = this
        val root = LinearLayout(ctx).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(Color.parseColor("#FFF7E8"))
        }

        /* ---------- 顶栏 ---------- */
        val top = LinearLayout(ctx).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setPadding(KidUi.dp(ctx, 14), KidUi.dp(ctx, 12), KidUi.dp(ctx, 14), KidUi.dp(ctx, 4))
        }
        top.addView(KidUi.iconBtn(ctx, "‹", Color.parseColor("#FF9A3D")) { confirmExit() })
        val titleCol = LinearLayout(ctx).apply { orientation = LinearLayout.VERTICAL }
        titleView = KidUi.text(ctx, "${cfg.icon} ${cfg.name}", 17f, Color.parseColor("#3A2E2A"), bold = true, gravity = Gravity.LEFT)
        roundView = KidUi.text(ctx, "第 1 / 3 关", 12f, Color.parseColor("#8C7B76"), gravity = Gravity.LEFT)
        titleCol.addView(titleView)
        titleCol.addView(roundView)
        top.addView(titleCol, LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f))
        val starBadge = KidUi.text(ctx, "⭐ 0", 16f, Color.parseColor("#FF9A3D"), bold = true).apply {
            background = KidUi.rounded(Color.parseColor("#FFF3D6"), 14)
            setPadding(KidUi.dp(ctx, 12), KidUi.dp(ctx, 6), KidUi.dp(ctx, 12), KidUi.dp(ctx, 6))
        }
        starsView = starBadge
        top.addView(starBadge)
        pauseBtn = KidUi.iconBtn(ctx, "⏸", Color.parseColor("#4FC3F7")) { openPause() }
        top.addView(pauseBtn)
        root.addView(top)

        /* ---------- 难度条 ---------- */
        diffView = KidUi.text(ctx, cfg.diff, 11f, Color.parseColor("#8C7B76"), gravity = Gravity.LEFT).apply {
            setPadding(KidUi.dp(ctx, 18), 0, KidUi.dp(ctx, 18), 0)
        }
        root.addView(diffView)

        /* ---------- 进度点 ---------- */
        progressBar = LinearLayout(ctx).apply {
            gravity = Gravity.CENTER
            setPadding(0, KidUi.dp(ctx, 6), 0, KidUi.dp(ctx, 6))
        }
        root.addView(progressBar)

        /* ---------- 指令卡 ---------- */
        val instCard = LinearLayout(ctx).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            background = KidUi.rounded(Color.WHITE, 18, Color.parseColor("#F3E5D8"))
            setPadding(KidUi.dp(ctx, 14), KidUi.dp(ctx, 10), KidUi.dp(ctx, 14), KidUi.dp(ctx, 10))
            val lp = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT)
            lp.setMargins(KidUi.dp(ctx, 16), KidUi.dp(ctx, 4), KidUi.dp(ctx, 16), KidUi.dp(ctx, 4))
            layoutParams = lp
        }
        instEmoji = KidUi.text(ctx, "🎯", 30f, Color.BLACK)
        instEmoji.layoutParams = LinearLayout.LayoutParams(KidUi.dp(ctx, 48), ViewGroup.LayoutParams.WRAP_CONTENT)
        instText = KidUi.text(ctx, "准备开始…", 16f, Color.parseColor("#3A2E2A"), bold = true, gravity = Gravity.LEFT)
        instCard.addView(instEmoji)
        instCard.addView(instText, LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f))
        instCard.addView(KidUi.iconBtn(ctx, "🔊", Color.parseColor("#66BB6A")) {
            TtsBox.speak(instText.text.toString())
        })
        root.addView(instCard)

        /* ---------- 反馈 emoji ---------- */
        fbView = KidUi.text(ctx, "", 44f, Color.BLACK)
        val fbLp = FrameLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT)
        fbLp.gravity = Gravity.CENTER_HORIZONTAL or Gravity.BOTTOM
        fbView.layoutParams = fbLp
        fbView.alpha = 0f

        /* ---------- 舞台 ---------- */
        stage = LinearLayout(ctx).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(KidUi.dp(ctx, 12), KidUi.dp(ctx, 8), KidUi.dp(ctx, 12), KidUi.dp(ctx, 70))
        }
        stageScroll = ScrollView(ctx).apply {
            addView(stage, ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT)
        }
        root.addView(stageScroll, LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f))

        val frame = FrameLayout(ctx).apply { addView(root) }
        frame.addView(fbView)
        setContentView(frame)
    }

    /* ================= 对 Session 暴露的 API ================= */
    fun renderProgress(round: Int, rounds: Int) {
        progressBar.removeAllViews()
        for (i in 1..rounds) {
            val dot = TextView(this).apply {
                layoutParams = LinearLayout.LayoutParams(KidUi.dp(this@GameActivity, 12), KidUi.dp(this@GameActivity, 12)).apply {
                    setMargins(KidUi.dp(this@GameActivity, 4), 0, KidUi.dp(this@GameActivity, 4), 0)
                }
                background = KidUi.circle(Color.parseColor(if (i < round) "#66BB6A" else if (i == round) "#FF9A3D" else "#E2DFD5"))
            }
            progressBar.addView(dot)
        }
        roundView.text = "第 $round / $rounds 关"
    }

    fun setInst(emoji: String, text: String) {
        instEmoji.text = emoji
        instText.text = text
    }

    fun setStars(n: Int) {
        starsView.text = "⭐ $n"
    }

    fun showFeedback(emoji: String) {
        fbView.text = emoji
        fbView.alpha = 1f
        fbView.scaleX = 0.5f
        fbView.scaleY = 0.5f
        fbView.animate().scaleX(1.2f).scaleY(1.2f).alpha(0f).setDuration(800).start()
    }

    fun hidePauseBtn(hidden: Boolean) {
        pauseBtn.visibility = if (hidden) View.GONE else View.VISIBLE
    }

    fun clearStage() {
        stage.removeAllViews()
    }

    fun post(delayed: Long, action: () -> Unit) {
        handler.postDelayed(action, delayed)
    }

    fun cancelPending() {
        handler.removeCallbacksAndMessages(null)
    }

    override fun onDestroy() {
        cancelPending()
        TtsBox.stop()
        super.onDestroy()
    }

    override fun onBackPressed() {
        confirmExit()
    }

    private fun confirmExit() {
        val ctx = this
        val d = Dialog(ctx)
        val root = LinearLayout(ctx).apply {
            orientation = LinearLayout.VERTICAL
            background = KidUi.rounded(Color.WHITE, 24)
            setPadding(KidUi.dp(ctx, 22), KidUi.dp(ctx, 20), KidUi.dp(ctx, 22), KidUi.dp(ctx, 20))
        }
        root.addView(KidUi.text(ctx, "要退出游戏吗？", 18f, Color.parseColor("#3A2E2A"), bold = true))
        root.addView(KidUi.text(ctx, "现在的进度会消失哦～", 12f, Color.parseColor("#8C7B76")))
        val row = LinearLayout(ctx).apply { gravity = Gravity.CENTER }
        val stay = KidUi.bigBtn(ctx, "继续玩", Color.parseColor("#66BB6A"), Color.parseColor("#8ED996")) { d.dismiss() }
        stay.layoutParams = LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f).apply { marginEnd = KidUi.dp(ctx, 6) }
        val quit = KidUi.bigBtn(ctx, "退出", Color.parseColor("#FF8A9B"), Color.parseColor("#FFAEB8")) {
            d.dismiss(); finish()
        }
        quit.layoutParams = LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f).apply { marginStart = KidUi.dp(ctx, 6) }
        row.addView(stay); row.addView(quit)
        root.addView(row)
        d.setContentView(root)
        d.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
        d.show()
    }

    /* ================= 暂停 ================= */
    private fun openPause() {
        TtsBox.stop()
        val ctx = this
        val d = Dialog(ctx)
        val root = LinearLayout(ctx).apply {
            orientation = LinearLayout.VERTICAL
            background = KidUi.rounded(Color.WHITE, 24)
            setPadding(KidUi.dp(ctx, 22), KidUi.dp(ctx, 20), KidUi.dp(ctx, 22), KidUi.dp(ctx, 20))
        }
        root.addView(KidUi.text(ctx, "⏸ 休息一下", 18f, Color.parseColor("#3A2E2A"), bold = true))
        val resume = KidUi.bigBtn(ctx, "▶ 继续游戏", Color.parseColor("#4FC3F7"), Color.parseColor("#7FD8FF")) {
            d.dismiss(); TtsBox.speak("继续加油！")
        }
        root.addView(resume)
        val quit = KidUi.bigBtn(ctx, "🏠 回到首页", Color.parseColor("#FF8A9B"), Color.parseColor("#FFAEB8")) {
            d.dismiss(); finish()
        }
        root.addView(quit)
        d.setContentView(root)
        d.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
        d.show()
    }

    /* ================= 结果弹层 ================= */
    fun showResult(session: GameSession) {
        val ctx = this
        val extra = if (session.round >= session.rounds) 5 else 0
        val total = session.totalStars + extra + 10

        // 入库
        Store.addStars(ctx, total)
        Store.addAbilityStars(ctx, session.ability, session.totalStars)
        val today = SimpleDateFormat("yyyyMMdd", Locale.US).format(Date())
        Store.addTodayDone(ctx, today)

        val d = Dialog(ctx)
        val frame = FrameLayout(ctx)
        val root = LinearLayout(ctx).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER_HORIZONTAL
            background = KidUi.rounded(Color.WHITE, 24)
            setPadding(KidUi.dp(ctx, 22), KidUi.dp(ctx, 20), KidUi.dp(ctx, 22), KidUi.dp(ctx, 20))
        }
        frame.addView(root)

        root.addView(KidUi.text(ctx, "🎉", 44f, Color.BLACK))

        // 三颗星
        val starsRow = LinearLayout(ctx).apply { gravity = Gravity.CENTER }
        val litCount = if (session.totalStars >= 12) 3 else if (session.totalStars >= 6) 2 else 1
        for (i in 0 until 3) {
            starsRow.addView(KidUi.text(ctx, if (i < litCount) "⭐" else "☆", 34f,
                Color.parseColor(if (i < litCount) "#FFD166" else "#D3D1C7"), bold = true).apply {
                layoutParams = LinearLayout.LayoutParams(KidUi.dp(ctx, 44), ViewGroup.LayoutParams.WRAP_CONTENT)
            })
        }
        root.addView(starsRow)

        val title = KidUi.text(ctx, "完成啦！", 22f, Color.parseColor("#3A2E2A"), bold = true)
        root.addView(title)
        root.addView(KidUi.text(ctx, "🏅 「${session.name}」小达人", 13f, Color.parseColor("#8C7B76")))

        val earn = KidUi.text(ctx, "+$total", 30f, Color.parseColor("#FF9A3D"), bold = true)
        root.addView(earn)
        root.addView(KidUi.text(ctx, "颗星星", 12f, Color.parseColor("#8C7B76")))

        val row = LinearLayout(ctx)
        val again = KidUi.bigBtn(ctx, "🔁 再玩一次", Color.parseColor("#4FC3F7"), Color.parseColor("#7FD8FF")) {
            d.dismiss()
            session.restart()
        }
        again.layoutParams = LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f).apply { marginEnd = KidUi.dp(ctx, 6) }
        val home = KidUi.bigBtn(ctx, "🏠 回首页", Color.parseColor("#66BB6A"), Color.parseColor("#8ED996")) {
            d.dismiss(); finish()
        }
        home.layoutParams = LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f).apply { marginStart = KidUi.dp(ctx, 6) }
        row.addView(again); row.addView(home)
        root.addView(row)

        d.setContentView(frame)
        d.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
        d.setCancelable(false)
        d.show()

        // 彩纸
        val decor = d.window!!.decorView as? ViewGroup
        decor?.let { KidUi.confetti(it) }
        TtsBox.speak("太棒啦！你获得了${total}颗星星！")
    }
}
