package com.brainisland.kid

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.fragment.app.Fragment
import com.brainisland.kid.tts.Speaker
import com.brainisland.kid.tts.TtsBox
import com.brainisland.kid.data.Store
import com.brainisland.kid.ui.HomeFragment
import com.brainisland.kid.ui.LearnFragment
import com.brainisland.kid.ui.MeFragment
import com.brainisland.kid.ui.ReadingFragment
import com.google.android.material.bottomnavigation.BottomNavigationView
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class MainActivity : AppCompatActivity() {

    private lateinit var nav: BottomNavigationView
    private var current: Fragment? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // 全局 TTS 初始化（一次）
        if (TtsBox.speaker == null) TtsBox.speaker = Speaker(this)

        // 学习天数：每日首次打开 +1
        val today = SimpleDateFormat("yyyyMMdd", Locale.US).format(Date())
        Store.touchDay(this, today)

        nav = findViewById(R.id.bottom_nav)
        nav.setOnNavigationItemSelectedListener { item ->
            when (item.itemId) {
                R.id.tab_home -> { switchTab(HomeFragment()); true }
                R.id.tab_learn -> { switchTab(LearnFragment()); true }
                R.id.tab_reading -> { switchTab(ReadingFragment()); true }
                R.id.tab_me -> { switchTab(MeFragment()); true }
                else -> false
            }
        }
        if (savedInstanceState == null) switchTab(HomeFragment())
    }

    private fun switchTab(f: Fragment) {
        if (current == f) return
        current = f
        supportFragmentManager.beginTransaction()
            .replace(R.id.fragment_container, f)
            .commitAllowingStateLoss()
    }

    override fun onDestroy() {
        TtsBox.speaker?.stop()
        super.onDestroy()
    }
}
