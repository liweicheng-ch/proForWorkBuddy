package com.brainisland.kid

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.material.Text
import com.brainisland.kid.ui.theme.BrainIslandTheme
import com.brainisland.kid.ui.theme.Typography

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            BrainIslandTheme {
                Text(
                    text = "奇妙脑力岛",
                    style = Typography.h1
                )
            }
        }
    }
}
