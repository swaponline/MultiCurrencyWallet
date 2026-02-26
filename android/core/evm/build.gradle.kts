plugins {
  id("com.android.library")
  id("org.jetbrains.kotlin.android")
  id("org.jetbrains.kotlin.kapt")
  id("com.google.dagger.hilt.android")
}

android {
  namespace = "com.mcw.core.evm"
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

  packaging {
    resources {
      excludes += "META-INF/DEPENDENCIES"
      excludes += "META-INF/LICENSE"
      excludes += "META-INF/LICENSE.txt"
      excludes += "META-INF/NOTICE"
      excludes += "META-INF/NOTICE.txt"
    }
  }
}

dependencies {
  // EVM operations
  implementation("org.web3j:core:4.10.3")

  // Project modules
  implementation(project(":core:crypto"))
  implementation(project(":core:network"))

  // Hilt
  implementation("com.google.dagger:hilt-android:2.50")
  kapt("com.google.dagger:hilt-android-compiler:2.50")

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
