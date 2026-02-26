package com.mcw.wallet

import org.junit.Assert.assertNotNull
import org.junit.Test

class SmokeTest {
  @Test
  fun applicationClassExists() {
    val clazz = MCWalletApplication::class.java
    assertNotNull(clazz)
  }
}
