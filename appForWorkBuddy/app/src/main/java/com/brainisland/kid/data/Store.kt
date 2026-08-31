package com.brainisland.kid.data

import android.content.Context
import android.content.SharedPreferences

/**
 * 本地存储（无后台）：星星、各能力星星、阅读级别、家长 PIN、学习天数
 */
object Store {
    private const val NAME = "brain_island"
    private const val KEY_STARS = "star_count"
    private const val KEY_DAYS = "play_days"
    private const val KEY_LEVEL = "read_level"
    private const val KEY_ABILITY_PREFIX = "ability_stars_"
    private const val KEY_DAILY_PREFIX = "daily_"
    private const val KEY_LAST_DAY = "last_day"

    private fun sp(ctx: Context): SharedPreferences =
        ctx.getSharedPreferences(NAME, Context.MODE_PRIVATE)

    /* ---------- 星星 ---------- */
    fun stars(ctx: Context): Int = sp(ctx).getInt(KEY_STARS, 120)

    fun addStars(ctx: Context, n: Int) {
        sp(ctx).edit().putInt(KEY_STARS, stars(ctx) + n).apply()
    }

    /* ---------- 各能力累计星星 ---------- */
    fun abilityStars(ctx: Context, ability: String): Int =
        sp(ctx).getInt(KEY_ABILITY_PREFIX + ability, 0)

    fun addAbilityStars(ctx: Context, ability: String, n: Int) {
        sp(ctx).edit().putInt(KEY_ABILITY_PREFIX + ability, abilityStars(ctx, ability) + n).apply()
    }

    /* ---------- 能力分（基准分 + 星星成长，仅本地展示） ---------- */
    fun abilityScore(ctx: Context, ability: String, base: Int): Int {
        val bonus = abilityStars(ctx, ability) / 10
        return Math.min(100, base + bonus)
    }

    /* ---------- 学习天数 ---------- */
    fun days(ctx: Context): Int = sp(ctx).getInt(KEY_DAYS, 1)

    /** 每日首次打开时累加 */
    fun touchDay(ctx: Context, today: String) {
        val s = sp(ctx)
        if (s.getString(KEY_LAST_DAY, "") != today) {
            s.edit()
                .putString(KEY_LAST_DAY, today)
                .putInt(KEY_DAYS, s.getInt(KEY_DAYS, 1) + 1)
                .apply()
        }
    }

    /* ---------- 今日任务（完成游戏数） ---------- */
    fun todayDone(ctx: Context, today: String): Int =
        sp(ctx).getInt(KEY_DAILY_PREFIX + today, 0)

    fun addTodayDone(ctx: Context, today: String) {
        sp(ctx).edit().putInt(KEY_DAILY_PREFIX + today, todayDone(ctx, today) + 1).apply()
    }

    /* ---------- 阅读级别（默认按 4 岁映射 B 级） ---------- */
    fun readLevel(ctx: Context): String = sp(ctx).getString(KEY_LEVEL, "B") ?: "B"

    fun setReadLevel(ctx: Context, level: String) {
        sp(ctx).edit().putString(KEY_LEVEL, level).apply()
    }

    /* ---------- 家长 PIN ---------- */
    const val PIN = "1234"
}
