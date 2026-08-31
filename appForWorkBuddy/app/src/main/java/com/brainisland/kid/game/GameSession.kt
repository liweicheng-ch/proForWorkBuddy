package com.brainisland.kid.game

import android.content.Context
import android.view.View
import com.brainisland.kid.data.Seed
import com.brainisland.kid.tts.TtsBox
import com.brainisland.kid.util.KidUi

/**
 * 游戏会话：向引擎提供统一的上下文 API（对齐原型 games.js 的 G + helpers）
 */
class GameSession(
    val activity: GameActivity,
    val gameId: String,
    val articleId: String?
) {
    var round = 0
    var rounds = 3
    var totalStars = 0
    var locked = false

    val name: String = Seed.gameById(gameId).name
    val ability: String = Seed.gameById(gameId).ability

    /** 引擎自定义状态（模拟 G.s） */
    val s = mutableMapOf<String, Any?>()

    val ctx: Context get() = activity

    /* ---------- 流程 ---------- */
    fun start() {
        totalStars = 0
        round = 0
        activity.setStars(0)
        setupRound()
    }

    fun setupRound() {
        round++
        locked = false
        activity.renderProgress(round, rounds)
        activity.clearStage()
        Engines.run(gameId, this)
    }

    fun nextRound() {
        if (round < rounds) setupRound() else finish()
    }

    fun restart() {
        totalStars = 0
        round = 0
        activity.setStars(0)
        setupRound()
    }

    fun finish() {
        activity.showResult(this)
    }

    /* ---------- UI API ---------- */
    fun setInst(emoji: String, text: String) {
        activity.setInst(emoji, text)
    }

    fun speak(text: String) {
        TtsBox.speak(text)
    }

    fun feedback(emoji: String) {
        activity.showFeedback(emoji)
    }

    fun addStars(n: Int) {
        totalStars += n
        activity.setStars(totalStars)
    }

    fun hidePause(hidden: Boolean) {
        activity.hidePauseBtn(hidden)
    }

    fun post(delayedMs: Long, action: () -> Unit) {
        activity.post(delayedMs, action)
    }

    val stage: android.widget.LinearLayout get() = activity.stage

    /* ---------- 统一作答（对齐 handleAnswer） ---------- */
    fun onAnswer(correct: Boolean, view: View? = null, after: (() -> Unit)? = null) {
        if (locked) return
        if (correct) {
            locked = true
            view?.let { KidUi.celebrate(it); markCorrect(it) }
            addStars(3)
            feedback("🎉")
            speak(PRAISES.random())
            post(900) { after?.invoke() ?: nextRound() }
        } else {
            view?.let { KidUi.shake(it); markWrong(it) }
            feedback("💭")
            speak("没关系，我们再试一次！")
            post(500) {
                view?.let { unmark(it) }
                locked = false
            }
        }
    }

    private fun markCorrect(v: View) {
        (v.background?.mutate() as? android.graphics.drawable.GradientDrawable)?.setColor(0xFFD2F0D3.toInt())
        (v as? android.widget.TextView)?.setTextColor(0xFF27500A.toInt())
    }

    private fun markWrong(v: View) {
        (v.background?.mutate() as? android.graphics.drawable.GradientDrawable)?.setColor(0xFFF7C1C1.toInt())
    }

    private fun unmark(v: View) {
        (v.background?.mutate() as? android.graphics.drawable.GradientDrawable)?.setColor(android.graphics.Color.WHITE)
    }

    companion object {
        val PRAISES = listOf("太棒啦！", "好厉害！", "你真棒！")
    }
}
