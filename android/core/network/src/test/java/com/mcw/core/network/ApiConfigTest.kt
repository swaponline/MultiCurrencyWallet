package com.mcw.core.network

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Tests for API configuration data classes and endpoint constants.
 * Verifies endpoints extracted from web config are correct.
 */
class ApiConfigTest {

  @Test
  fun testBitpayConfig_hasValidEndpoints() {
    val config = ApiEndpoints.bitpay
    assertTrue("Bitpay should have at least one endpoint", config.endpoints.isNotEmpty())
    config.endpoints.forEach { url ->
      assertTrue("Bitpay endpoint must be HTTPS: $url", url.startsWith("https://"))
    }
  }

  @Test
  fun testEtherscanConfig_hasApiKey() {
    val config = ApiEndpoints.etherscan
    assertNotNull("Etherscan config should have API key", config.apiKey)
    assertTrue("Etherscan API key should not be empty", config.apiKey.isNotEmpty())
  }

  @Test
  fun testBlockcypherConfig_hasValidEndpoint() {
    val config = ApiEndpoints.blockcypher
    assertTrue("Blockcypher should have at least one endpoint", config.endpoints.isNotEmpty())
    config.endpoints.forEach { url ->
      assertTrue("Blockcypher endpoint must be HTTPS: $url", url.startsWith("https://"))
    }
  }

  @Test
  fun testCoinGeckoConfig_hasValidEndpoint() {
    val config = ApiEndpoints.coinGecko
    assertTrue("CoinGecko should have at least one endpoint", config.endpoints.isNotEmpty())
    config.endpoints.forEach { url ->
      assertTrue("CoinGecko endpoint must be HTTPS: $url", url.startsWith("https://"))
    }
  }

  @Test
  fun testEvmRpcConfig_ethMainnet() {
    val config = ApiEndpoints.evmRpc
    val ethRpc = config["ETH"]
    assertNotNull("ETH RPC config should exist", ethRpc)
    assertTrue("ETH RPC should have endpoints", ethRpc!!.endpoints.isNotEmpty())
  }

  @Test
  fun testEvmRpcConfig_bscMainnet() {
    val config = ApiEndpoints.evmRpc
    val bscRpc = config["BSC"]
    assertNotNull("BSC RPC config should exist", bscRpc)
    assertTrue("BSC RPC should have endpoints", bscRpc!!.endpoints.isNotEmpty())
  }

  @Test
  fun testEvmRpcConfig_polygonMainnet() {
    val config = ApiEndpoints.evmRpc
    val maticRpc = config["POLYGON"]
    assertNotNull("Polygon RPC config should exist", maticRpc)
    assertTrue("Polygon RPC should have endpoints", maticRpc!!.endpoints.isNotEmpty())
  }

  @Test
  fun testBscscanConfig_hasApiKey() {
    val config = ApiEndpoints.bscscan
    assertNotNull("BSCScan config should have API key", config.apiKey)
    assertTrue("BSCScan API key should not be empty", config.apiKey.isNotEmpty())
  }

  @Test
  fun testPolygonscanConfig_hasApiKey() {
    val config = ApiEndpoints.polygonscan
    assertNotNull("PolygonScan config should have API key", config.apiKey)
    assertTrue("PolygonScan API key should not be empty", config.apiKey.isNotEmpty())
  }

  @Test
  fun testApiConfig_dataClassEquality() {
    val config1 = ApiConfig(
      name = "test",
      endpoints = listOf("https://api1.example.com"),
      apiKey = "key1"
    )
    val config2 = ApiConfig(
      name = "test",
      endpoints = listOf("https://api1.example.com"),
      apiKey = "key1"
    )
    assertEquals("Data class equality should work", config1, config2)
  }

  @Test
  fun testApiConfig_copyWithDifferentKey() {
    val config = ApiConfig(
      name = "test",
      endpoints = listOf("https://api1.example.com"),
      apiKey = "key1"
    )
    val modified = config.copy(apiKey = "key2")
    assertEquals("key2", modified.apiKey)
    assertEquals("test", modified.name)
  }
}
