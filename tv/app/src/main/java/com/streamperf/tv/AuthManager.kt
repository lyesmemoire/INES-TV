package com.streamperf.tv

import io.github.jan.supabase.gotrue.auth
import io.github.jan.supabase.gotrue.providers.builtin.Email
import io.github.jan.supabase.gotrue.user.UserInfo

class AuthManager {

    // ─── Sign In ─────────────────────────────────────────────────────────────

    suspend fun signIn(email: String, password: String): Result<UserInfo> {
        return try {
            SupabaseManager.client.auth.signInWith(Email) {
                this.email = email
                this.password = password
            }
            val user = SupabaseManager.client.auth.currentUserOrNull()
                ?: return Result.failure(Exception("Authentication failed"))
            Result.success(user)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // ─── Sign Up ─────────────────────────────────────────────────────────────

    suspend fun signUp(email: String, password: String): Result<UserInfo> {
        return try {
            SupabaseManager.client.auth.signUpWith(Email) {
                this.email = email
                this.password = password
            }
            val user = SupabaseManager.client.auth.currentUserOrNull()
                ?: return Result.failure(Exception("Sign up failed"))
            Result.success(user)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // ─── Sign Out ────────────────────────────────────────────────────────────

    suspend fun signOut() {
        try {
            SupabaseManager.client.auth.signOut()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    // ─── Session ─────────────────────────────────────────────────────────────

    fun isAuthenticated(): Boolean {
        return SupabaseManager.client.auth.currentSessionOrNull() != null
    }

    fun getUserId(): String? {
        return SupabaseManager.client.auth.currentUserOrNull()?.id
    }

    fun getToken(): String? {
        return SupabaseManager.client.auth.currentSessionOrNull()?.accessToken
    }

    suspend fun refreshSession(): Boolean {
        return try {
            SupabaseManager.client.auth.refreshCurrentSession()
            true
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }

    // ─── Restore Session ─────────────────────────────────────────────────────
    // GoTrue-kt persists session to disk automatically.
    // Call this on app start to re-authenticate silently.

    suspend fun restoreSession(): Boolean {
        return try {
            SupabaseManager.client.auth.awaitInitialization()
            isAuthenticated()
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }
}
