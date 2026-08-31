package com.brainisland.kid.data

/** 四大能力 */
data class Ability(
    val key: String,
    val name: String,
    val place: String,
    val icon: String,          // emoji
    val score: Int,
    val lv: String,
    val trend: String,
    val desc: String,
    val colorKey: String       // att / mem / log / rea
)

/** 游戏配置 */
data class GameDef(
    val id: String,
    val name: String,
    val icon: String,
    val ability: String,
    val diff: String,
    val desc: String,
    val colorKey: String
)

/** 阅读级别 */
data class ReadLevel(val key: String, val age: Int, val name: String, val desc: String)

/** 主题 */
data class Theme(val key: String, val name: String, val icon: String)

/** 文章题目 */
data class QuizItem(val q: String, val a: String, val opts: List<String>)

/** 阅读文章 */
data class Article(
    val id: String,
    val level: String,
    val theme: String,
    val title: String,
    val text: String,
    val questions: List<QuizItem>
)

/** 排序题池条目 */
data class OrderItem(val emoji: String, val name: String, val size: Int)

/** 条件推理题 */
data class CondQuiz(
    val text: String,
    val q: String,
    val a: String,
    val opts: List<Pair<String, String>>   // (emoji, text)
)

/** 图形/文字规律题 */
data class PatternQuiz(
    val seq: List<String>,
    val ans: String,
    val opts: List<String>
)

/** 人物判断 / 因果推理题 */
data class TextQuiz(
    val text: String,
    val q: String,
    val a: String,
    val opts: List<String>
)
