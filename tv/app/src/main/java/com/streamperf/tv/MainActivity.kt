package com.streamperf.tv

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import com.streamperf.tv.ui.LoginScreen
import com.streamperf.tv.ui.TvCatalogScreen
import com.streamperf.tv.data.FavoritesManager
import com.streamperf.tv.ui.TvViewModel
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    private lateinit var authManager: AuthManager
    private lateinit var repository: TvRepository
    private lateinit var favoritesManager: FavoritesManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        authManager = AuthManager()
        repository = TvRepository(authManager)
        favoritesManager = FavoritesManager(applicationContext)

        setContent {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color(0xFF09090B))
            ) {
                AppNavigation(authManager = authManager, repository = repository, favoritesManager = favoritesManager)
            }
        }
    }
}

@Composable
private fun AppNavigation(authManager: AuthManager, repository: TvRepository, favoritesManager: FavoritesManager) {
    val scope = rememberCoroutineScope()

    // null = restoring session, true = authenticated, false = needs login
    var authReady by remember { mutableStateOf<Boolean?>(null) }

    LaunchedEffect(Unit) {
        scope.launch {
            authReady = authManager.restoreSession()
        }
    }

    when (authReady) {
        null -> {
            // Silent splash while session is being restored
            Box(modifier = Modifier.fillMaxSize().background(Color(0xFF09090B)))
        }
        false -> {
            LoginScreen(
                authManager = authManager,
                onLoginSuccess = { authReady = true }
            )
        }
        true -> {
            val viewModel = remember { TvViewModel(repository, favoritesManager) }
            TvCatalogScreen(
                viewModel = viewModel,
                authManager = authManager,
                repository = repository,
                favoritesManager = favoritesManager
            )
        }
    }
}
