buildscript {
  extra.apply {
    set("compileSdk", 34)
    set("minSdk", 26)
    set("targetSdk", 34)
  }
}

plugins {
  id("com.android.application") version "8.2.2" apply false
  id("com.android.library") version "8.2.2" apply false
  id("org.jetbrains.kotlin.android") version "1.9.22" apply false
  id("org.jetbrains.kotlin.jvm") version "1.9.22" apply false
  id("com.google.dagger.hilt.android") version "2.50" apply false
  id("com.google.gms.google-services") version "4.4.0" apply false
  id("com.google.firebase.crashlytics") version "2.9.9" apply false
  id("org.jetbrains.kotlin.kapt") version "1.9.22" apply false
}

// Resolve BouncyCastle duplicate classes: bitcoinj uses bcprov-jdk15to18,
// web3j uses bcprov-jdk18on. Force the newer variant across all modules.
subprojects {
  configurations.all {
    resolutionStrategy {
      dependencySubstitution {
        substitute(module("org.bouncycastle:bcprov-jdk15to18"))
          .using(module("org.bouncycastle:bcprov-jdk18on:1.77"))
          .because("Unify BouncyCastle: bitcoinj and web3j use different variants")
      }
    }
  }
}
