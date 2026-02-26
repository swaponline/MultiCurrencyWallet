plugins {
  id("com.android.application")
  id("org.jetbrains.kotlin.android")
  id("org.jetbrains.kotlin.kapt")
  id("com.google.dagger.hilt.android")
  id("com.google.gms.google-services")
  id("com.google.firebase.crashlytics")
}

android {
  namespace = "com.mcw.wallet"
  compileSdk = rootProject.extra["compileSdk"] as Int

  defaultConfig {
    applicationId = "com.mcw.wallet"
    minSdk = rootProject.extra["minSdk"] as Int
    targetSdk = rootProject.extra["targetSdk"] as Int
    versionCode = 1
    versionName = "1.0.0"

    testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"

    // White-label: app name from build config
    resValue("string", "app_name", project.findProperty("APP_NAME")?.toString() ?: "MCW Wallet")
  }

  buildTypes {
    release {
      isMinifyEnabled = true
      proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
    }
    debug {
      isMinifyEnabled = false
    }
  }

  buildFeatures {
    compose = true
    buildConfig = true
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
  // Project modules
  implementation(project(":core:crypto"))
  implementation(project(":core:storage"))
  implementation(project(":core:auth"))
  implementation(project(":core:network"))
  implementation(project(":core:btc"))
  implementation(project(":core:evm"))
  implementation(project(":feature:dapp-browser"))
  implementation(project(":feature:walletconnect"))

  // Compose BOM
  val composeBom = platform("androidx.compose:compose-bom:2024.02.00")
  implementation(composeBom)
  androidTestImplementation(composeBom)

  // Compose
  implementation("androidx.compose.ui:ui")
  implementation("androidx.compose.ui:ui-graphics")
  implementation("androidx.compose.ui:ui-tooling-preview")
  implementation("androidx.compose.material3:material3")
  implementation("androidx.compose.material:material-icons-extended")
  implementation("androidx.activity:activity-compose:1.8.2")
  implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.7.0")
  implementation("androidx.lifecycle:lifecycle-runtime-compose:2.7.0")

  // Navigation Compose
  implementation("androidx.navigation:navigation-compose:2.7.6")

  // Hilt
  implementation("com.google.dagger:hilt-android:2.50")
  kapt("com.google.dagger:hilt-android-compiler:2.50")
  implementation("androidx.hilt:hilt-navigation-compose:1.1.0")

  // Firebase Crashlytics
  implementation(platform("com.google.firebase:firebase-bom:32.7.0"))
  implementation("com.google.firebase:firebase-crashlytics")
  implementation("com.google.firebase:firebase-analytics")

  // Core KTX
  implementation("androidx.core:core-ktx:1.12.0")

  // Testing
  testImplementation("junit:junit:4.13.2")
  testImplementation("org.mockito:mockito-core:5.8.0")
  testImplementation("org.mockito.kotlin:mockito-kotlin:5.2.1")
  testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.7.3")
  androidTestImplementation("androidx.test.ext:junit:1.1.5")
  androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")
  androidTestImplementation("androidx.compose.ui:ui-test-junit4")
  debugImplementation("androidx.compose.ui:ui-tooling")
  debugImplementation("androidx.compose.ui:ui-test-manifest")
}

kapt {
  correctErrorTypes = true
}
