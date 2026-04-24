package com.streamperf.tv.ui

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.tv.material3.*
import androidx.tv.material3.ButtonDefaults as TvButtonDefaults
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults as M3OutlinedTextFieldDefaults
import com.streamperf.tv.AuthManager
import kotlinx.coroutines.launch

sealed class LoginState {
    object Idle : LoginState()
    object Loading : LoginState()
    data class Error(val message: String) : LoginState()
    object Success : LoginState()
}

@OptIn(ExperimentalTvMaterial3Api::class)
@Composable
fun LoginScreen(
    authManager: AuthManager,
    onLoginSuccess: () -> Unit
) {
    val scope = rememberCoroutineScope()
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var loginState by remember { mutableStateOf<LoginState>(LoginState.Idle) }

    val emailFocus = remember { FocusRequester() }
    val passwordFocus = remember { FocusRequester() }
    val buttonFocus = remember { FocusRequester() }

    LaunchedEffect(Unit) {
        emailFocus.requestFocus()
    }

    LaunchedEffect(loginState) {
        if (loginState is LoginState.Success) {
            onLoginSuccess()
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.radialGradient(
                    colors = listOf(Color(0xFF18181B), Color(0xFF09090B)),
                    radius = 1200f
                )
            ),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(24.dp),
            modifier = Modifier
                .width(480.dp)
                .background(Color(0xFF18181B), RoundedCornerShape(24.dp))
                .padding(48.dp)
        ) {
            // Logo / Title
            Text(
                text = "StreamPerf",
                color = Color(0xFF10B981),
                fontSize = 36.sp,
                fontWeight = FontWeight.Black
            )
            Text(
                text = "TV",
                color = Color.White,
                fontSize = 18.sp,
                fontWeight = FontWeight.Light,
                modifier = Modifier.offset(y = (-16).dp)
            )

            Spacer(modifier = Modifier.height(8.dp))

            // Email Field
            Column(modifier = Modifier.fillMaxWidth()) {
                Text(
                    text = "E-mail",
                    color = Color(0xFFA1A1AA),
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    modifier = Modifier.padding(bottom = 8.dp)
                )
                OutlinedTextField(
                    value = email,
                    onValueChange = { email = it },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(
                        keyboardType = KeyboardType.Email,
                        imeAction = ImeAction.Next
                    ),
                    keyboardActions = KeyboardActions(
                        onNext = { passwordFocus.requestFocus() }
                    ),
                    colors = M3OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Color(0xFF10B981),
                        unfocusedBorderColor = Color(0xFF3F3F46),
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White,
                        cursorColor = Color(0xFF10B981)
                    ),
                    modifier = Modifier
                        .fillMaxWidth()
                        .focusRequester(emailFocus),
                    shape = RoundedCornerShape(12.dp)
                )
            }

            // Password Field
            Column(modifier = Modifier.fillMaxWidth()) {
                Text(
                    text = "Mot de passe",
                    color = Color(0xFFA1A1AA),
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    modifier = Modifier.padding(bottom = 8.dp)
                )
                OutlinedTextField(
                    value = password,
                    onValueChange = { password = it },
                    singleLine = true,
                    visualTransformation = PasswordVisualTransformation(),
                    keyboardOptions = KeyboardOptions(
                        keyboardType = KeyboardType.Password,
                        imeAction = ImeAction.Done
                    ),
                    keyboardActions = KeyboardActions(
                        onDone = { buttonFocus.requestFocus() }
                    ),
                    colors = M3OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Color(0xFF10B981),
                        unfocusedBorderColor = Color(0xFF3F3F46),
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White,
                        cursorColor = Color(0xFF10B981)
                    ),
                    modifier = Modifier
                        .fillMaxWidth()
                        .focusRequester(passwordFocus),
                    shape = RoundedCornerShape(12.dp)
                )
            }

            // Error Banner
            AnimatedVisibility(
                visible = loginState is LoginState.Error,
                enter = fadeIn(),
                exit = fadeOut()
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color(0x33EF4444), RoundedCornerShape(8.dp))
                        .padding(12.dp)
                ) {
                    Text(
                        text = (loginState as? LoginState.Error)?.message ?: "",
                        color = Color(0xFFF87171),
                        fontSize = 14.sp
                    )
                }
            }

            // Login Button
                Button(
                    onClick = {
                        if (email.isBlank() || password.isBlank()) {
                            loginState = LoginState.Error("Email et mot de passe requis.")
                            return@Button
                        }
                        scope.launch {
                            loginState = LoginState.Loading
                            val result = authManager.signIn(email.trim(), password)
                            loginState = if (result.isSuccess) {
                                LoginState.Success
                            } else {
                                LoginState.Error(
                                    result.exceptionOrNull()?.message ?: "Erreur de connexion"
                                )
                            }
                        }
                    },
                    enabled = loginState !is LoginState.Loading,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(52.dp)
                        .focusRequester(buttonFocus),
                    shape = TvButtonDefaults.shape(shape = RoundedCornerShape(12.dp))
                ) {
                if (loginState is LoginState.Loading) {
                    Text(
                        text = "Connexion en cours…",
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp
                    )
                } else {
                    Text(
                        text = "SE CONNECTER",
                        fontWeight = FontWeight.Black,
                        fontSize = 16.sp
                    )
                }
            }

            // Skip (guest mode)
            Button(
                onClick = onLoginSuccess,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = "Continuer sans compte",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium
                )
            }
        }
    }
}
