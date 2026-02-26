package com.mcw.core.network

import okhttp3.HttpUrl.Companion.toHttpUrlOrNull
import okhttp3.Interceptor
import okhttp3.Response
import java.io.IOException

/**
 * OkHttp interceptor implementing round-robin API failover.
 * Ported from web's apiLooper.ts (src/common/utils/apiLooper.ts).
 *
 * Behavior:
 * 1. Routes requests to the first healthy endpoint from [EndpointHealthTracker]
 * 2. On HTTP 5xx response, marks endpoint as unhealthy and retries on the next one
 * 3. Waits [retryDelayMs] between retries (500ms default, matching web's request queuing)
 * 4. If all endpoints fail, throws [AllEndpointsOfflineException]
 *
 * The interceptor replaces the request URL's host/scheme/port with the target
 * endpoint while preserving the original path, query, and headers.
 *
 * Thread safety: relies on [EndpointHealthTracker] which uses ConcurrentHashMap.
 */
class ApiFailoverInterceptor(
  private val endpointHealth: EndpointHealthTracker,
  private val retryDelayMs: Long = RETRY_DELAY_MS,
) : Interceptor {

  companion object {
    /** Default delay between retry requests (matches web's 500ms queuing) */
    const val RETRY_DELAY_MS = 500L

    /** HTTP status codes considered server errors triggering failover */
    private const val SERVER_ERROR_THRESHOLD = 500
  }

  override fun intercept(chain: Interceptor.Chain): Response {
    val originalRequest = chain.request()
    val originalUrl = originalRequest.url

    // Extract the path + query from the original request to preserve across failover
    val pathSegments = originalUrl.encodedPath
    val query = originalUrl.encodedQuery

    // Try each healthy endpoint in round-robin order
    val allEndpoints = endpointHealth.getAllEndpoints()
    var lastException: IOException? = null
    var lastResponse: Response? = null

    for (endpoint in allEndpoints) {
      if (!endpointHealth.isHealthy(endpoint)) {
        continue
      }

      val targetUrl = endpoint.toHttpUrlOrNull() ?: continue

      // Build new URL: target endpoint base + original path + query
      val newUrlBuilder = targetUrl.newBuilder()
        .encodedPath(pathSegments)
      if (query != null) {
        newUrlBuilder.encodedQuery(query)
      }

      val newRequest = originalRequest.newBuilder()
        .url(newUrlBuilder.build())
        .build()

      try {
        // Close previous response body before retrying to avoid resource leak
        lastResponse?.close()

        val response = chain.proceed(newRequest)

        if (response.code >= SERVER_ERROR_THRESHOLD) {
          // Server error: mark endpoint unhealthy, close response, try next
          endpointHealth.markUnhealthy(endpoint)
          lastResponse = response

          // Apply retry delay (500ms queuing per web's apiLooper pattern)
          if (retryDelayMs > 0) {
            Thread.sleep(retryDelayMs)
          }
          continue
        }

        // Success: mark endpoint healthy and return response
        endpointHealth.markHealthy(endpoint)
        return response
      } catch (e: IOException) {
        // Network error: mark endpoint unhealthy, try next
        endpointHealth.markUnhealthy(endpoint)
        lastException = e

        if (retryDelayMs > 0) {
          Thread.sleep(retryDelayMs)
        }
      }
    }

    // All endpoints exhausted
    // If we have a response (even a 5xx), return it so caller can inspect
    lastResponse?.let { return it }

    // No response at all (all threw IOException)
    throw lastException ?: AllEndpointsOfflineException()
  }
}
