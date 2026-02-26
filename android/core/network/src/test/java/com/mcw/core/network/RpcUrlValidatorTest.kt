package com.mcw.core.network

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Assert.assertEquals
import org.junit.Test

/**
 * Unit tests for RPC URL validation.
 *
 * TDD anchors from task 5:
 * - testUrlValidationHttps — https://example.com -> allowed
 * - testUrlValidationHttp — http://example.com -> rejected
 * - testUrlValidationPrivateIP — https://192.168.1.1 -> rejected
 * - testUrlValidationLocalhost — https://127.0.0.1 -> rejected
 *
 * Security requirements (tech-spec Decision 9):
 * - HTTPS only: reject http://, file://
 * - Block private IPs: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 127.0.0.0/8
 */
class RpcUrlValidatorTest {

  // ===== HTTPS validation =====

  @Test
  fun testUrlValidationHttps() {
    val result = RpcUrlValidator.validate("https://example.com")
    assertTrue("HTTPS URL should be allowed", result.isValid)
  }

  @Test
  fun testUrlValidationHttp() {
    val result = RpcUrlValidator.validate("http://example.com")
    assertFalse("HTTP URL should be rejected", result.isValid)
    assertTrue(
      "Error should mention HTTPS requirement: ${result.errorMessage}",
      result.errorMessage!!.contains("HTTPS")
    )
  }

  @Test
  fun testUrlValidation_fileScheme() {
    val result = RpcUrlValidator.validate("file:///etc/passwd")
    assertFalse("file:// scheme should be rejected", result.isValid)
    assertTrue(
      "Error should mention HTTPS requirement: ${result.errorMessage}",
      result.errorMessage!!.contains("HTTPS")
    )
  }

  @Test
  fun testUrlValidation_dataScheme() {
    val result = RpcUrlValidator.validate("data:text/html,<h1>test</h1>")
    assertFalse("data: scheme should be rejected", result.isValid)
  }

  @Test
  fun testUrlValidation_javascriptScheme() {
    val result = RpcUrlValidator.validate("javascript:alert(1)")
    assertFalse("javascript: scheme should be rejected", result.isValid)
  }

  // ===== Private IP validation =====

  @Test
  fun testUrlValidationPrivateIP() {
    val result = RpcUrlValidator.validate("https://192.168.1.1")
    assertFalse("Private IP 192.168.1.1 should be rejected", result.isValid)
    assertTrue(
      "Error should mention private IP: ${result.errorMessage}",
      result.errorMessage!!.contains("private") || result.errorMessage!!.contains("Private")
    )
  }

  @Test
  fun testUrlValidationLocalhost() {
    val result = RpcUrlValidator.validate("https://127.0.0.1")
    assertFalse("Localhost 127.0.0.1 should be rejected", result.isValid)
    assertTrue(
      "Error should mention private/loopback IP: ${result.errorMessage}",
      result.errorMessage!!.contains("private") || result.errorMessage!!.contains("Private")
        || result.errorMessage!!.contains("loopback") || result.errorMessage!!.contains("Loopback")
    )
  }

  @Test
  fun testUrlValidation_10Network() {
    val result = RpcUrlValidator.validate("https://10.0.0.1")
    assertFalse("10.0.0.0/8 private IP should be rejected", result.isValid)
  }

  @Test
  fun testUrlValidation_10NetworkHighRange() {
    val result = RpcUrlValidator.validate("https://10.255.255.255")
    assertFalse("10.255.255.255 should be rejected", result.isValid)
  }

  @Test
  fun testUrlValidation_172_16Network() {
    val result = RpcUrlValidator.validate("https://172.16.0.1")
    assertFalse("172.16.0.0/12 private IP should be rejected", result.isValid)
  }

  @Test
  fun testUrlValidation_172_31Network() {
    val result = RpcUrlValidator.validate("https://172.31.255.255")
    assertFalse("172.31.255.255 should be rejected (still in 172.16.0.0/12)", result.isValid)
  }

  @Test
  fun testUrlValidation_172_15Network_allowed() {
    // 172.15.x.x is NOT in 172.16.0.0/12, so it should be allowed
    val result = RpcUrlValidator.validate("https://172.15.0.1")
    assertTrue("172.15.0.1 should be allowed (not in /12 range)", result.isValid)
  }

  @Test
  fun testUrlValidation_172_32Network_allowed() {
    // 172.32.x.x is NOT in 172.16.0.0/12, so it should be allowed
    val result = RpcUrlValidator.validate("https://172.32.0.1")
    assertTrue("172.32.0.1 should be allowed (not in /12 range)", result.isValid)
  }

  @Test
  fun testUrlValidation_192_168Network_full() {
    val result = RpcUrlValidator.validate("https://192.168.0.1")
    assertFalse("192.168.0.0/16 should be rejected", result.isValid)
  }

  @Test
  fun testUrlValidation_192_168_255() {
    val result = RpcUrlValidator.validate("https://192.168.255.255")
    assertFalse("192.168.255.255 should be rejected", result.isValid)
  }

  @Test
  fun testUrlValidation_127LoopbackRange() {
    val result = RpcUrlValidator.validate("https://127.0.0.2")
    assertFalse("127.0.0.2 should be rejected (loopback range)", result.isValid)
  }

  @Test
  fun testUrlValidation_localhostHostname() {
    val result = RpcUrlValidator.validate("https://localhost")
    assertFalse("localhost hostname should be rejected", result.isValid)
  }

  @Test
  fun testUrlValidation_localhostWithPort() {
    val result = RpcUrlValidator.validate("https://localhost:8545")
    assertFalse("localhost with port should be rejected", result.isValid)
  }

  // ===== Valid public URLs =====

  @Test
  fun testUrlValidation_publicIPAllowed() {
    val result = RpcUrlValidator.validate("https://8.8.8.8")
    assertTrue("Public IP 8.8.8.8 should be allowed", result.isValid)
  }

  @Test
  fun testUrlValidation_domainAllowed() {
    val result = RpcUrlValidator.validate("https://mainnet.infura.io/v3/key123")
    assertTrue("Public domain should be allowed", result.isValid)
  }

  @Test
  fun testUrlValidation_realRpcEndpoints() {
    // Test real RPC endpoints from web config
    assertTrue(
      "BSC RPC should be valid",
      RpcUrlValidator.validate("https://bsc-dataseed.binance.org/").isValid
    )
    assertTrue(
      "Polygon RPC should be valid",
      RpcUrlValidator.validate("https://polygon-bor-rpc.publicnode.com").isValid
    )
  }

  // ===== Edge cases =====

  @Test
  fun testUrlValidation_emptyUrl() {
    val result = RpcUrlValidator.validate("")
    assertFalse("Empty URL should be rejected", result.isValid)
  }

  @Test
  fun testUrlValidation_blankUrl() {
    val result = RpcUrlValidator.validate("   ")
    assertFalse("Blank URL should be rejected", result.isValid)
  }

  @Test
  fun testUrlValidation_nullLikeUrl() {
    val result = RpcUrlValidator.validate("null")
    assertFalse("'null' string should be rejected", result.isValid)
  }

  @Test
  fun testUrlValidation_malformedUrl() {
    val result = RpcUrlValidator.validate("not-a-url")
    assertFalse("Malformed URL should be rejected", result.isValid)
  }

  @Test
  fun testUrlValidation_ipWithPort() {
    val result = RpcUrlValidator.validate("https://192.168.1.1:8545")
    assertFalse("Private IP with port should still be rejected", result.isValid)
  }

  @Test
  fun testUrlValidation_httpsWithPath() {
    val result = RpcUrlValidator.validate("https://api.etherscan.io/v2/api?chainid=1")
    assertTrue("HTTPS URL with path and query should be allowed", result.isValid)
  }

  @Test
  fun testValidationResult_validHasNoError() {
    val result = RpcUrlValidator.validate("https://example.com")
    assertTrue(result.isValid)
    assertEquals(null, result.errorMessage)
  }

  @Test
  fun testValidationResult_invalidHasError() {
    val result = RpcUrlValidator.validate("http://example.com")
    assertFalse(result.isValid)
    assertTrue(result.errorMessage != null && result.errorMessage!!.isNotEmpty())
  }

  // ===== 0.0.0.0 edge case =====

  @Test
  fun testUrlValidation_zeroAddress() {
    val result = RpcUrlValidator.validate("https://0.0.0.0")
    assertFalse("0.0.0.0 should be rejected", result.isValid)
  }

  // ===== IPv6 loopback =====

  @Test
  fun testUrlValidation_ipv6Loopback() {
    val result = RpcUrlValidator.validate("https://[::1]")
    assertFalse("IPv6 loopback should be rejected", result.isValid)
  }
}
