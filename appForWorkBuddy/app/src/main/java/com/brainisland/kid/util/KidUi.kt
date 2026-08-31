package com.brainisland.kid.util

import android.animation.AnimatorSet
import android.animation.ObjectAnimator
import android.animation.ValueAnimator
import android.content.Context
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.view.animation.AccelerateInterpolator
import android.view.animation.DecelerateInterpolator
import android.view.animation.OvershootInterpolator
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.TextView

/**
 * 儿童动漫风 UI 构建工具：糖果色 / 大圆角 / emoji 插画 / 弹跳动画
 */
object KidUi {

    fun dp(ctx: Context, v: Int): Int = (v * ctx.resources.displayMetrics.density).toInt()

    /** 纯色圆角背景 */
    fun rounded(color: Int, radiusDp: Int, stroke: Int? = null, strokeDp: Int = 1): GradientDrawable {
        val d = GradientDrawable().apply {
            shape = GradientDrawable.RECTANGLE
            setColor(color)
            cornerRadius = radiusDp * 10f
        }
        if (stroke != null) d.setStroke(strokeDp * 2, stroke)
        return d
    }

    /** 渐变圆角背景 */
    fun gradient(c1: Int, c2: Int, radiusDp: Int): GradientDrawable {
        val d = GradientDrawable().apply {
            shape = GradientDrawable.RECTANGLE
            orientation = GradientDrawable.Orientation.TL_BR
            colors = intArrayOf(c1, c2)
            cornerRadius = radiusDp * 10f
        }
        return d
    }

    /** 圆角圆形背景 */
    fun circle(color: Int): GradientDrawable {
        val d = GradientDrawable().apply {
            shape = GradientDrawable.OVAL
            setColor(color)
        }
        return d
    }

    /** 通用文本 */
    fun text(ctx: Context, content: String, sizeSp: Float, color: Int,
             bold: Boolean = false, gravity: Int = Gravity.CENTER): TextView {
        val tv = TextView(ctx)
        tv.text = content
        tv.textSize = sizeSp
        tv.setTextColor(color)
        tv.gravity = gravity
        if (bold) tv.typeface = Typeface.DEFAULT_BOLD
        return tv
    }

    /** 游戏 tile：大 emoji 方块 */
    fun tile(ctx: Context, emoji: String, sizeDp: Int, onClick: ((View) -> Unit)? = null): TextView {
        val tv = text(ctx, emoji, 30f, Color.parseColor("#3A2E2A"))
        val lp = LinearLayout.LayoutParams(dp(ctx, sizeDp), dp(ctx, sizeDp))
        lp.setMargins(dp(ctx, 6), dp(ctx, 6), dp(ctx, 6), dp(ctx, 6))
        tv.layoutParams = lp
        tv.background = rounded(Color.WHITE, 18, Color.parseColor("#F0E0D0"))
        tv.setPadding(0, dp(ctx, 10), 0, dp(ctx, 10))
        if (onClick != null) {
            tv.setOnClickListener {
                pop(it)
                onClick(it)
            }
        }
        return tv
    }

    /** 大按钮（渐变糖果色） */
    fun bigBtn(ctx: Context, label: String, c1: Int, c2: Int,
               onClick: ((View) -> Unit)? = null): TextView {
        val tv = text(ctx, label, 17f, Color.WHITE, bold = true)
        tv.background = gradient(c1, c2, 26)
        tv.setPadding(dp(ctx, 28), dp(ctx, 13), dp(ctx, 28), dp(ctx, 13))
        if (onClick != null) {
            tv.setOnClickListener {
                pop(it)
                onClick(it)
            }
        }
        return tv
    }

    /** 小圆图标按钮 */
    fun iconBtn(ctx: Context, label: String, bg: Int, sizeDp: Int = 40,
                onClick: ((View) -> Unit)? = null): TextView {
        val tv = text(ctx, label, 18f, Color.WHITE)
        tv.background = circle(bg)
        tv.gravity = Gravity.CENTER
        val lp = FrameLayout.LayoutParams(dp(ctx, sizeDp), dp(ctx, sizeDp))
        lp.setMargins(dp(ctx, 4), dp(ctx, 4), dp(ctx, 4), dp(ctx, 4))
        tv.layoutParams = lp
        tv.setOnClickListener {
            pop(it)
            onClick?.invoke(it)
        }
        return tv
    }

    /** 白卡片 */
    fun card(ctx: Context): LinearLayout {
        val ll = LinearLayout(ctx)
        ll.orientation = LinearLayout.VERTICAL
        ll.background = rounded(Color.WHITE, 20, Color.parseColor("#F3E5D8"))
        ll.setPadding(dp(ctx, 16), dp(ctx, 14), dp(ctx, 16), dp(ctx, 14))
        val lp = LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT)
        lp.setMargins(0, dp(ctx, 10), 0, dp(ctx, 10))
        ll.layoutParams = lp
        return ll
    }

    /** 垂直 LinearLayout */
    fun column(ctx: Context, paddingDp: Int = 16): LinearLayout {
        val ll = LinearLayout(ctx)
        ll.orientation = LinearLayout.VERTICAL
        ll.setPadding(dp(ctx, paddingDp), dp(ctx, paddingDp), dp(ctx, paddingDp), dp(ctx, paddingDp))
        return ll
    }

    /* ---------- 动画 ---------- */
    /** 点击弹跳 */
    fun pop(v: View) {
        val sx = ObjectAnimator.ofFloat(v, "scaleX", 1f, 0.88f, 1f)
        val sy = ObjectAnimator.ofFloat(v, "scaleY", 1f, 0.88f, 1f)
        AnimatorSet().apply {
            playTogether(sx, sy)
            duration = 180
            interpolator = OvershootInterpolator(1.4f)
            start()
        }
    }

    /** 入场弹跳（错落出现） */
    fun bounceIn(v: View, delayMs: Long) {
        v.alpha = 0f
        v.scaleX = 0.6f
        v.scaleY = 0.6f
        v.animate().alpha(1f).scaleX(1f).scaleY(1f)
            .setStartDelay(delayMs)
            .setDuration(320)
            .setInterpolator(OvershootInterpolator(1.2f))
            .start()
    }

    /** 答错抖动 */
    fun shake(v: View) {
        val anim = ObjectAnimator.ofFloat(v, "translationX",
            0f, dpAsFloat(v.context, -8), dpAsFloat(v.context, 8),
            dpAsFloat(v.context, -6), dpAsFloat(v.context, 6), 0f)
        anim.duration = 400
        anim.start()
    }

    private fun dpAsFloat(ctx: Context, v: Int): Float = dp(ctx, v).toFloat()

    /** 答对放大庆祝 */
    fun celebrate(v: View) {
        val sx = ObjectAnimator.ofFloat(v, "scaleX", 1f, 1.2f, 1f)
        val sy = ObjectAnimator.ofFloat(v, "scaleY", 1f, 1.2f, 1f)
        AnimatorSet().apply {
            playTogether(sx, sy)
            duration = 500
            start()
        }
    }

    /** 星星数字滚动动画 */
    fun countUp(tv: TextView, from: Int, to: Int, durationMs: Long = 600) {
        val anim = ValueAnimator.ofInt(from, to)
        anim.duration = durationMs
        anim.addUpdateListener { tv.text = it.animatedValue.toString() }
        anim.start()
    }

    /** 彩纸：emoji 从顶部落下 */
    fun confetti(container: ViewGroup) {
        val ctx = container.context
        val emojis = listOf("⭐", "✨", "🎉", "🌟", "💫", "🎊")
        val density = container.resources.displayMetrics.density
        for (i in 0 until 24) {
            val tv = TextView(ctx)
            tv.text = emojis[i % emojis.size]
            tv.textSize = 22f
            val lp = FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT)
            lp.leftMargin = (Math.random() * (container.width - 40 * density)).toInt()
            lp.topMargin = 0
            tv.layoutParams = lp
            container.addView(tv)
            tv.translationY = -60f
            tv.animate()
                .translationY(container.height.toFloat() + 80f)
                .alpha(0f)
                .setDuration(1400 + (Math.random() * 1600).toLong())
                .setStartDelay((Math.random() * 500).toLong())
                .setInterpolator(AccelerateInterpolator(0.7f))
                .withEndAction { container.removeView(tv) }
                .start()
        }
    }

    /** 淡入 */
    fun fadeIn(v: View, delayMs: Long = 0) {
        v.alpha = 0f
        v.animate().alpha(1f).setStartDelay(delayMs).setDuration(350)
            .setInterpolator(DecelerateInterpolator()).start()
    }
}
