package com.brainisland.kid.tts

/** 全局 TTS 共享入口 */
object TtsBox {
    @Volatile var speaker: Speaker? = null

    fun speak(text: String) {
        speaker?.speak(text)
    }

    fun stop() {
        speaker?.stop()
    }
}
