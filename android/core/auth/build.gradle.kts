plugins {
  id("com.android.library")
  id("org.jetbrains.kotlin.android")
  id("org.jetbrains.kotlin.kapt")
  id("com.google.dagger.hilt.android")
}

android {
  namespace = "com.mcw.core.auth"
  compileSdk = rootProject.extra["compileSdk"] as Int

  defaultConfig {
    minSdk = rootProject.extra["minSdk"] as Int
    testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    consumerProguardFiles("consumer-rules.pro")
  }

  compileOptions {
    sourceCompatibility = JavaVersion.VERSION_17
    targetCompatibility = JavaVersion.VERSION_17
  }

  kotlinOptions {
    jvmTarget = "17"
  }
}

dependencies {
  // BiometricPrompt for fingerprint/face unlock
  implementation("androidx.biometric:biometric:1.1.0")

  // Project modules
  implementation(project(":core:storage"))

  // Hilt
  implementation("com.google.dagger:hilt-android:2.50")
  kapt("com.google.dagger:hilt-android-compiler:2.50")

  // Core KTX
  implementation("androidx.core:core-ktx:1.12.0")

  // Lifecycle (for auto-lock)
  implementation("androidx.lifecycle:lifecycle-process:2.7.0")
  implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.7.0")

  // Testing
  testImplementation("junit:junit:4.13.2")
  testImplementation("org.mockito:mockito-core:5.8.0")
  testImplementation("org.mockito.kotlin:mockito-kotlin:5.2.1")
  testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.7.3")
  androidTestImplementation("androidx.test.ext:junit:1.1.5")
  androidTestImplementation("androidx.test:runner:1.5.2")
}

kapt {
  correctErrorTypes = true
}
