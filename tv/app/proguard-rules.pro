# 1. BASE ANDROID + COMPOSE (NE PAS TOUCHER)
-keep class androidx.compose.** { *; }
-keep class androidx.activity.** { *; }
-keep class androidx.lifecycle.** { *; }

-dontwarn androidx.compose.**
-dontwarn androidx.activity.**
-dontwarn androidx.lifecycle.**

# 2. COMPOSE STABILITY (CRITICAL TV PERFORMANCE)
# Preserve Compose runtime stability
-keep class kotlin.Metadata { *; }

# Prevent recomposition issues on @Stable models
-keepattributes *Annotation*

-keep class * {
    @androidx.compose.runtime.Stable *;
}

-keep class * {
    @androidx.compose.runtime.Immutable *;
}

# 3. EXOPLAYER (MEDIA3) (ULTRA CRITICAL — DO NOT BREAK)
-keep class androidx.media3.** { *; }
-keep interface androidx.media3.** { *; }

-dontwarn androidx.media3.**

# Prevent reflection crash on MediaItem / SourceFactory
-keepclassmembers class androidx.media3.** {
    *;
}

# 4. SUPABASE / NETWORK (KTOR / SERIALIZATION SAFE)
-keep class io.ktor.** { *; }
-keep class kotlinx.serialization.** { *; }

-dontwarn io.ktor.**
-dontwarn kotlinx.serialization.**

# Keep serialization models (IMPORTANT)
-keepclassmembers class * {
    @kotlinx.serialization.Serializable *;
}

# 5. AI ENGINE (BEHAVIOR GRAPH + MODELS)
-keep class com.streamperf.tv.os.** { *; }

# Prevent stripping of data classes used in recomposition logic
-keepclassmembers class * {
    public <init>(...);
}

# 6. DATA MODELS (CHANNEL / EPG / NODE)
-keep class com.streamperf.tv.models.** { *; }

-keepclassmembers class * {
    public final java.lang.String *;
    public final int *;
    public final long *;
}

# 7. REFLECTION SAFETY (ANTI-CRASH ZONE)
# Prevent runtime crash from missing constructors (Kotlin serialization / Supabase)
-keepattributes Signature
-keepattributes InnerClasses
-keepattributes EnclosingMethod
-keepattributes RuntimeVisibleAnnotations

# 8. GENERIC SAFETY (TV DEVICE COMPATIBILITY)
-dontwarn javax.**
-dontwarn java.awt.**
-dontwarn org.w3c.**

# Prevent crash on low-end TV boxes
-dontoptimize

# 9. LOGGING STRIP (PRODUCTION CLEAN)
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
    public static *** i(...);
}

# 10. CRITICAL DO NOT BREAK BLOCK
-keep class com.streamperf.tv.** { *; }
-keep class com.streamperf.tv.player.** { *; }
-keep class com.streamperf.tv.ui.** { *; }

# 11. SERIALIZATION / JSON (IMPORTANT)
-keep class kotlinx.serialization.json.** { *; }

# FINAL SAFETY LAYER
-keep class **.models.** { *; }
-keep class **.os.** { *; }
-keep class **.player.** { *; }
