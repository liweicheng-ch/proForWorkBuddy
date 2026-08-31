package com.brainisland.kid.ui

import android.app.Dialog
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.os.Bundle
import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import androidx.fragment.app.Fragment
import com.brainisland.kid.data.Store
import com.brainisland.kid.tts.TtsBox
import com.brainisland.kid.util.KidUi

/** 我的：头像 + 统计 + 家长中心入口（PIN 1234） */
class MeFragment : Fragment() {

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, sa: Bundle?): View {
        val ctx = requireContext()
        val scroll = ScrollView(ctx)
        val root = KidUi.column(ctx, 18)
        scroll.addView(root)

        /* ---------- 头像卡 ---------- */
        val profileCard = KidUi.card(ctx).apply {
            background = KidUi.gradient(Color.parseColor("#4FC3F7"), Color.parseColor("#7FD8FF"), 22)
        }
        val avatarRow = LinearLayout(ctx).apply { gravity = Gravity.CENTER_VERTICAL }
        val avatar = KidUi.text(ctx, "🐰", 52f, Color.BLACK).apply {
            background = KidUi.circle(Color.WHITE)
            layoutParams = LinearLayout.LayoutParams(KidUi.dp(ctx, 84), KidUi.dp(ctx, 84))
            gravity = Gravity.CENTER
        }
        val nameCol = LinearLayout(ctx).apply { orientation = LinearLayout.VERTICAL }
        nameCol.addView(KidUi.text(ctx, "小兔", 22f, Color.WHITE, bold = true, gravity = Gravity.LEFT))
        nameCol.addView(KidUi.text(ctx, "4 岁 · Level B 小读者", 13f, Color.WHITE, gravity = Gravity.LEFT))
        avatarRow.addView(avatar)
        val alp = LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f)
        (alp as LinearLayout.LayoutParams).leftMargin = KidUi.dp(ctx, 16)
        avatarRow.addView(nameCol, alp)
        avatar.setOnClickListener {
            KidUi.pop(it)
            TtsBox.speak("我是小兔，谢谢你一直陪我玩！")
        }
        profileCard.addView(avatarRow)
        root.addView(profileCard)

        /* ---------- 统计 ---------- */
        val statRow = LinearLayout(ctx).apply { gravity = Gravity.CENTER }
        val stars = Store.stars(ctx)
        val days = Store.days(ctx)
        statRow.addView(statCard(ctx, "⭐", "$stars", "我的星星"))
        statRow.addView(statCard(ctx, "📅", "$days", "学习天数"))
        statRow.addView(statCard(ctx, "🏅", "Lv.3", "综合等级"))
        root.addView(statRow)

        /* ---------- 家长中心 ---------- */
        val parentCard = KidUi.card(ctx)
        val prow = LinearLayout(ctx).apply { gravity = Gravity.CENTER_VERTICAL }
        val picon = KidUi.text(ctx, "🔐", 28f, Color.BLACK).apply {
            background = KidUi.rounded(Color.parseColor("#E7DEFA"), 14)
            layoutParams = LinearLayout.LayoutParams(KidUi.dp(ctx, 52), KidUi.dp(ctx, 52))
            gravity = Gravity.CENTER
        }
        val pcol = LinearLayout(ctx).apply { orientation = LinearLayout.VERTICAL }
        pcol.addView(KidUi.text(ctx, "家长中心", 17f, Color.parseColor("#3A2E2A"), bold = true, gravity = Gravity.LEFT))
        pcol.addView(KidUi.text(ctx, "查看能力报告 · 用密码进入（1234）", 12f, Color.parseColor("#8C7B76"), gravity = Gravity.LEFT))
        prow.addView(picon)
        val plp = LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f)
        (plp as LinearLayout.LayoutParams).leftMargin = KidUi.dp(ctx, 12)
        prow.addView(pcol, plp)
        prow.addView(KidUi.text(ctx, "›", 26f, Color.parseColor("#8C7B76")))
        parentCard.addView(prow)
        parentCard.setOnClickListener { showPinDialog() }
        root.addView(parentCard)

        /* ---------- 关于 ---------- */
        root.addView(KidUi.text(ctx, "奇妙脑力岛 v1.0.0\n给 3-6 岁小朋友的认知训练乐园",
            12f, Color.parseColor("#8C7B76")))

        return scroll
    }

    private fun statCard(ctx: android.content.Context, icon: String, value: String, label: String): LinearLayout {
        val card = LinearLayout(ctx).apply {
            orientation = LinearLayout.VERTICAL
            background = KidUi.rounded(Color.WHITE, 18, Color.parseColor("#F3E5D8"))
            setPadding(KidUi.dp(ctx, 10), KidUi.dp(ctx, 14), KidUi.dp(ctx, 10), KidUi.dp(ctx, 14))
            gravity = Gravity.CENTER
            val lp = LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f)
            lp.setMargins(KidUi.dp(ctx, 4), KidUi.dp(ctx, 4), KidUi.dp(ctx, 4), KidUi.dp(ctx, 4))
            layoutParams = lp
        }
        card.addView(KidUi.text(ctx, icon, 24f, Color.BLACK))
        card.addView(KidUi.text(ctx, value, 20f, Color.parseColor("#FF9A3D"), bold = true))
        card.addView(KidUi.text(ctx, label, 12f, Color.parseColor("#8C7B76")))
        return card
    }

    /* ---------- PIN 弹层 ---------- */
    private fun showPinDialog() {
        val ctx = requireContext()
        val dialog = Dialog(ctx)
        val root = LinearLayout(ctx).apply {
            orientation = LinearLayout.VERTICAL
            background = KidUi.rounded(Color.WHITE, 24)
            setPadding(KidUi.dp(ctx, 22), KidUi.dp(ctx, 20), KidUi.dp(ctx, 22), KidUi.dp(ctx, 20))
        }
        root.addView(KidUi.text(ctx, "🔐 家长验证", 18f, Color.parseColor("#3A2E2A"), bold = true))
        root.addView(KidUi.text(ctx, "请输入 4 位数字密码", 12f, Color.parseColor("#8C7B76")))

        val pinDisplay = KidUi.text(ctx, "", 24f, Color.parseColor("#AB8CE0"), bold = true).apply {
            background = KidUi.rounded(Color.parseColor("#F5F0FF"), 12)
            val lp = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, KidUi.dp(ctx, 52))
            lp.topMargin = KidUi.dp(ctx, 10)
            layoutParams = lp
            gravity = Gravity.CENTER
        }
        root.addView(pinDisplay)

        val sb = StringBuilder()
        fun refresh() { pinDisplay.text = sb.toString().map { '●' }.joinToString("") }

        // 键盘 3x4
        for (r in listOf(listOf("1", "2", "3"), listOf("4", "5", "6"), listOf("7", "8", "9"))) {
            val row = LinearLayout(ctx)
            for (k in r) {
                val key = KidUi.bigBtn(ctx, k, Color.parseColor("#E7DEFA"), Color.parseColor("#D3C4F5")) {
                    if (sb.length < 4) { sb.append(k); refresh(); }
                    if (sb.length == 4) {
                        dialog.dismiss()
                        if (sb.toString() == Store.PIN) ParentActivity.start(ctx)
                        else android.widget.Toast.makeText(ctx, "密码不对，再试试～", android.widget.Toast.LENGTH_SHORT).show()
                    }
                }
                key.setTextColor(Color.parseColor("#3C3489"))
                key.layoutParams = LinearLayout.LayoutParams(0, KidUi.dp(ctx, 52), 1f).apply {
                    setMargins(KidUi.dp(ctx, 4), KidUi.dp(ctx, 4), KidUi.dp(ctx, 4), KidUi.dp(ctx, 4))
                }
                row.addView(key)
            }
            root.addView(row)
        }
        // 最后一行：清空 + 0 + 取消
        val lastRow = LinearLayout(ctx)
        val clear = KidUi.bigBtn(ctx, "清除", Color.parseColor("#F1EFE8"), Color.parseColor("#E2DFD5")) {
            sb.clear(); refresh()
        }
        clear.setTextColor(Color.parseColor("#5F5E5A"))
        clear.layoutParams = LinearLayout.LayoutParams(0, KidUi.dp(ctx, 52), 1f).apply {
            setMargins(KidUi.dp(ctx, 4), KidUi.dp(ctx, 4), KidUi.dp(ctx, 4), KidUi.dp(ctx, 4))
        }
        val zero = KidUi.bigBtn(ctx, "0", Color.parseColor("#E7DEFA"), Color.parseColor("#D3C4F5")) {
            if (sb.length < 4) { sb.append("0"); refresh() }
        }
        zero.setTextColor(Color.parseColor("#3C3489"))
        zero.layoutParams = LinearLayout.LayoutParams(0, KidUi.dp(ctx, 52), 1f).apply {
            setMargins(KidUi.dp(ctx, 4), KidUi.dp(ctx, 4), KidUi.dp(ctx, 4), KidUi.dp(ctx, 4))
        }
        val cancel = KidUi.bigBtn(ctx, "取消", Color.parseColor("#F1EFE8"), Color.parseColor("#E2DFD5")) {
            dialog.dismiss()
        }
        cancel.setTextColor(Color.parseColor("#5F5E5A"))
        cancel.layoutParams = LinearLayout.LayoutParams(0, KidUi.dp(ctx, 52), 1f).apply {
            setMargins(KidUi.dp(ctx, 4), KidUi.dp(ctx, 4), KidUi.dp(ctx, 4), KidUi.dp(ctx, 4))
        }
        lastRow.addView(clear); lastRow.addView(zero); lastRow.addView(cancel)
        root.addView(lastRow)

        dialog.setContentView(root)
        dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
        dialog.show()
    }
}
