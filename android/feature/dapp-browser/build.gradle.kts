plugins {
  id("com.android.library")
  id("org.jetbrains.kotlin.android")
  id("org.jetbrains.kotlin.kapt")
  id("com.google.dagger.hilt.android")
}

android {
  namespace = "com.mcw.feature.dappbrowser"
  compileSdk = rootProject.extra["compileSdk"] as Int

  defaultConfig {
    minSdk = rootProject.extra["minSdk"] as Int
    testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    consumerProguardFiles("consumer-rules.pro")
  }

  buildFeatures {
    compose = true
  }

  composeOptions {
    kotlinCompilerExtensionVersion = "1.5.8"
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
  // Compose BOM
  val composeBom = platform("androidx.compose:compose-bom:2024.02.00")
  implementation(composeBom)

  // Compose
  implementation("androidx.compose.ui:ui")
  implementation("androidx.compose.material3:material3")
  implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.7.0")

  // WebView
  implementation("androidx.webkit:webkit:1.10.0")

  // Project modules
  implementation(project(":core:evm"))
  implementation(project(":core:auth"))
  implementation(project(":core:network"))

  // Hilt
  implementation("com.google.dagger:hilt-android:2.50")
  kapt("com.google.dagger:hilt-android-compiler:2.50")
  implementation("androidx.hilt:hilt-navigation-compose:1.1.0")

  // Navigation Compose
  implementation("androidx.navigation:navigation-compose:2.7.6")

  // Moshi for JSON parsing (JS bridge messages)
  implementation("com.squareup.moshi:moshi-kotlin:1.15.0")

  // Coroutines
  implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")

  // Core KTX
  implementation("androidx.core:core-ktx:1.12.0")

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
