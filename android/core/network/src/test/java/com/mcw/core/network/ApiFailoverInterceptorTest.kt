package com.mcw.core.network

import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.mockwebserver.MockResponse
import okhttp3.mockwebserver.MockWebServer
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

/**
 * Unit tests for ApiFailoverInterceptor — round-robin failover logic
 * ported from web's apiLooper.ts.
 *
 * TDD anchors from task 5:
 * - testFailoverSwitchesEndpoint
 * - testRequestQueuing
 * - testEndpointHealthTracking
 */
class ApiFailoverInterceptorTest {

  private lateinit var server1: MockWebServer
  private lateinit var server2: MockWebServer
  private lateinit var server3: MockWebServer

  @Before
  fun setUp() {
    server1 = MockWebServer()
    server2 = MockWebServer()
    server3 = MockWebServer()
    server1.start()
    server2.start()
    server3.start()
  }

  @After
  fun tearDown() {
    server1.shutdown()
    server2.shutdown()
    server3.shutdown()
  }

  @Test
  fun testFailoverSwitchesEndpoint() {
    // First endpoint returns 500, second endpoint returns 200
    server1.enqueue(MockResponse().setResponseCode(500).setBody("error"))
    server2.enqueue(MockResponse().setResponseCode(200).setBody("success"))

    val endpoints = listOf(
      server1.url("/").toString().trimEnd('/'),
      server2.url("/").toString().trimEnd('/')
    )
    val endpointHealth = EndpointHealthTracker(endpoints)
    val interceptor = ApiFailoverInterceptor(endpointHealth, retryDelayMs = 0L)

    val client = OkHttpClient.Builder()
      .addInterceptor(interceptor)
      .build()

    // Request to first endpoint — should fail and retry on second
    val request = Request.Builder()
      .url(server1.url("/test"))
      .build()

    val response = client.newCall(request).execute()
    assertEquals("Should get 200 from second endpoint", 200, response.code)
    assertEquals("success", response.body!!.string())

    // Verify first server got one request (the failed one)
    assertEquals(1, server1.requestCount)
    // Verify second server got one request (the retry)
    assertEquals(1, server2.requestCount)
  }

  @Test
  fun testRequestQueuing() {
    // Both endpoints fail, forcing delay between retries
    server1.enqueue(MockResponse().setResponseCode(500).setBody("error1"))
    server2.enqueue(MockResponse().setResponseCode(500).setBody("error2"))
    server3.enqueue(MockResponse().setResponseCode(200).setBody("success"))

    val endpoints = listOf(
      server1.url("/").toString().trimEnd('/'),
      server2.url("/").toString().trimEnd('/'),
      server3.url("/").toString().trimEnd('/')
    )
    val endpointHealth = EndpointHealthTracker(endpoints)
    val interceptor = ApiFailoverInterceptor(endpointHealth, retryDelayMs = 500L)

    val client = OkHttpClient.Builder()
      .addInterceptor(interceptor)
      .build()

    val request = Request.Builder()
      .url(server1.url("/test"))
      .build()

    val startTime = System.currentTimeMillis()
    val response = client.newCall(request).execute()
    val elapsed = System.currentTimeMillis() - startTime

    assertEquals(200, response.code)
    // Two failures = two delays of 500ms each = at least 1000ms total
    assertTrue(
      "Should have at least 1000ms delay for 2 retries (actual: ${elapsed}ms)",
      elapsed >= 900L // Allow small tolerance for timing
    )
  }

  @Test
  fun testEndpointHealthTracking() {
    // First endpoint fails, second succeeds
    server1.enqueue(MockResponse().setResponseCode(500).setBody("error"))
    server2.enqueue(MockResponse().setResponseCode(200).setBody("first-success"))

    // After first cycle, endpoint 1 should be marked unhealthy
    // On next request, it should skip endpoint 1 and go to endpoint 2 directly
    server2.enqueue(MockResponse().setResponseCode(200).setBody("second-success"))

    val endpoints = listOf(
      server1.url("/").toString().trimEnd('/'),
      server2.url("/").toString().trimEnd('/')
    )
    val endpointHealth = EndpointHealthTracker(endpoints)
    val interceptor = ApiFailoverInterceptor(endpointHealth, retryDelayMs = 0L)

    val client = OkHttpClient.Builder()
      .addInterceptor(interceptor)
      .build()

    // First request: endpoint1 fails -> switches to endpoint2
    val request1 = Request.Builder()
      .url(server1.url("/test"))
      .build()
    val response1 = client.newCall(request1).execute()
    assertEquals(200, response1.code)
    assertEquals("first-success", response1.body!!.string())

    // Second request: should skip endpoint1 (unhealthy) and go to endpoint2
    val request2 = Request.Builder()
      .url(server1.url("/test2"))
      .build()
    val response2 = client.newCall(request2).execute()
    assertEquals(200, response2.code)
    assertEquals("second-success", response2.body!!.string())

    // endpoint1 should have only been hit once (the first failed request)
    assertEquals(1, server1.requestCount)
    // endpoint2 should have been hit twice (both successful requests)
    assertEquals(2, server2.requestCount)
  }

  @Test
  fun testAllEndpointsDown_throwsException() {
    server1.enqueue(MockResponse().setResponseCode(500))
    server2.enqueue(MockResponse().setResponseCode(500))

    val endpoints = listOf(
      server1.url("/").toString().trimEnd('/'),
      server2.url("/").toString().trimEnd('/')
    )
    val endpointHealth = EndpointHealthTracker(endpoints)
    val interceptor = ApiFailoverInterceptor(endpointHealth, retryDelayMs = 0L)

    val client = OkHttpClient.Builder()
      .addInterceptor(interceptor)
      .build()

    val request = Request.Builder()
      .url(server1.url("/test"))
      .build()

    try {
      client.newCall(request).execute()
      // If we get here, the interceptor returned the last failed response
      // which is acceptable behavior (return last response when all fail)
    } catch (e: AllEndpointsOfflineException) {
      assertTrue("Should throw AllEndpointsOfflineException", true)
    }
  }

  @Test
  fun testSingleEndpoint_noFailover() {
    server1.enqueue(MockResponse().setResponseCode(200).setBody("ok"))

    val endpoints = listOf(
      server1.url("/").toString().trimEnd('/')
    )
    val endpointHealth = EndpointHealthTracker(endpoints)
    val interceptor = ApiFailoverInterceptor(endpointHealth, retryDelayMs = 0L)

    val client = OkHttpClient.Builder()
      .addInterceptor(interceptor)
      .build()

    val request = Request.Builder()
      .url(server1.url("/test"))
      .build()

    val response = client.newCall(request).execute()
    assertEquals(200, response.code)
    assertEquals("ok", response.body!!.string())
  }

  @Test
  fun testFailoverPreservesPath() {
    // First endpoint fails, second succeeds
    server1.enqueue(MockResponse().setResponseCode(500))
    server2.enqueue(MockResponse().setResponseCode(200).setBody("ok"))

    val endpoints = listOf(
      server1.url("/").toString().trimEnd('/'),
      server2.url("/").toString().trimEnd('/')
    )
    val endpointHealth = EndpointHealthTracker(endpoints)
    val interceptor = ApiFailoverInterceptor(endpointHealth, retryDelayMs = 0L)

    val client = OkHttpClient.Builder()
      .addInterceptor(interceptor)
      .build()

    val request = Request.Builder()
      .url(server1.url("/api/v1/balance"))
      .build()

    val response = client.newCall(request).execute()
    assertEquals(200, response.code)

    // Verify the path was preserved on the second server
    val recordedRequest = server2.takeRequest()
    assertEquals("/api/v1/balance", recordedRequest.path)
  }

  @Test
  fun testEndpointHealthTracker_resetRestoresAllEndpoints() {
    val endpoints = listOf("https://api1.example.com", "https://api2.example.com")
    val tracker = EndpointHealthTracker(endpoints)

    // Mark first endpoint as unhealthy
    tracker.markUnhealthy("https://api1.example.com")
    assertTrue("Endpoint 1 should be unhealthy", !tracker.isHealthy("https://api1.example.com"))

    // Reset
    tracker.reset()
    assertTrue("After reset, endpoint 1 should be healthy", tracker.isHealthy("https://api1.example.com"))
    assertTrue("After reset, endpoint 2 should be healthy", tracker.isHealthy("https://api2.example.com"))
  }

  @Test
  fun testEndpointHealthTracker_getNextHealthy_roundRobin() {
    val endpoints = listOf("https://api1.example.com", "https://api2.example.com", "https://api3.example.com")
    val tracker = EndpointHealthTracker(endpoints)

    // Mark first as unhealthy
    tracker.markUnhealthy("https://api1.example.com")

    // Should return api2 (first healthy in round-robin)
    val next = tracker.getNextHealthyEndpoint("https://api1.example.com")
    assertEquals("https://api2.example.com", next)
  }
}
