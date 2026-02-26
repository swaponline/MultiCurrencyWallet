pluginManagement {
  repositories {
    google()
    mavenCentral()
    gradlePluginPortal()
  }
}

dependencyResolutionManagement {
  repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
  repositories {
    google()
    mavenCentral()
    maven {
      url = uri("https://jitpack.io")
      content {
        includeGroupByRegex("com\\.github\\..*")
        includeGroup("com.walletconnect.Scarlet")
      }
    }
  }
}

rootProject.name = "MCWallet"

include(":app")
include(":core:crypto")
include(":core:storage")
include(":core:auth")
include(":core:network")
include(":core:btc")
include(":core:evm")
include(":feature:dapp-browser")
include(":feature:walletconnect")
