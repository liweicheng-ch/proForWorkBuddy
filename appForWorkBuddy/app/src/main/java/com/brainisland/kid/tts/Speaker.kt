package com.brainisland.kid.tts

import android.content.Context
import android.speech.tts.TextToSpeech
import java.util.Locale

/**
 * TTS 朗读（PRD V2.1：zh-CN · 语速 0.85 · 音调 1.2）
 */
class Speaker(ctx: Context) {
    private var tts: TextToSpeech? = null
    @Volatile private var ready = false

    init {
        tts = TextToSpeech(ctx.applicationContext) { status ->
            if (status == TextToSpeech.SUCCESS) {
                try {
                    tts?.language = Locale.SIMPLIFIED_CHINESE
                    tts?.setSpeechRate(0.85f)
                    tts?.setPitch(1.2f)
                    ready = true
                } catch (e: Exception) {
                    ready = false
                }
            }
        }
    }

    fun speak(text: String) {
        if (!ready) return
        tts?.stop()
        tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, "kid_${System.nanoTime()}")
    }

    fun stop() {
        try { tts?.stop() } catch (e: Exception) { }
    }

    fun shutdown() {
        try { tts?.stop(); tts?.shutdown() } catch (e: Exception) { }
        tts = null
    }
}
