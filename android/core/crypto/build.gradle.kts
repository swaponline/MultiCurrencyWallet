plugins {
  id("java-library")
  id("org.jetbrains.kotlin.jvm")
}

java {
  sourceCompatibility = JavaVersion.VERSION_17
  targetCompatibility = JavaVersion.VERSION_17
}

kotlin {
  jvmToolchain(17)
}

dependencies {
  // BIP39/BIP44 key derivation, BTC address generation
  implementation("org.bitcoinj:bitcoinj-core:0.16.3")

  // ETH key derivation, address generation
  implementation("org.web3j:core:4.10.3")

  // Testing
  testImplementation("junit:junit:4.13.2")
  testImplementation("org.mockito:mockito-core:5.8.0")
}
