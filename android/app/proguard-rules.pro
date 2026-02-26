# ProGuard rules for MCW Wallet

# bitcoinj
-keep class org.bitcoinj.** { *; }
-dontwarn org.bitcoinj.**

# web3j
-keep class org.web3j.** { *; }
-dontwarn org.web3j.**

# Bouncycastle (used by bitcoinj and web3j)
-keep class org.bouncycastle.** { *; }
-dontwarn org.bouncycastle.**

# Moshi
-keep class com.squareup.moshi.** { *; }
-keepclassmembers class ** {
    @com.squareup.moshi.Json <fields>;
}

# OkHttp
-dontwarn okhttp3.**
-dontwarn okio.**

# Retrofit
-keep class retrofit2.** { *; }
-keepattributes Signature
-keepattributes Exceptions

# WalletConnect
-keep class com.walletconnect.** { *; }
-dontwarn com.walletconnect.**

# Firebase Crashlytics
-keepattributes SourceFile,LineNumberTable
-keep public class * extends java.lang.Exception

# Hilt
-keep class dagger.hilt.** { *; }
-keep class javax.inject.** { *; }
-keep class * extends dagger.hilt.android.internal.managers.ViewComponentManager.FragmentContextWrapper { *; }

# Kotlin
-keep class kotlin.** { *; }
-dontwarn kotlin.**
