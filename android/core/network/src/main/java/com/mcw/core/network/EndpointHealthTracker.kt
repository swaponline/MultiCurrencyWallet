package com.mcw.core.network

import java.util.concurrent.ConcurrentHashMap

/**
 * Tracks health status of API endpoints in-memory.
 * Resets on app restart (no persistence), matching web wallet behavior
 * per tech-spec Decision 7.
 *
 * Thread-safe: uses ConcurrentHashMap for status tracking and
 * synchronized blocks for round-robin rotation.
 */
class EndpointHealthTracker(
  private val endpoints: List<String>,
) {

  /**
   * In-memory health status per endpoint URL.
   * true = healthy (default), false = unhealthy (failed recently).
   */
  private val healthStatus = ConcurrentHashMap<String, Boolean>()

  /**
   * Priority-ordered list of endpoints for round-robin.
   * Modified when an endpoint fails to rotate it to the back.
   */
  private val priorityList: MutableList<String>

  init {
    priorityList = endpoints.toMutableList()
    endpoints.forEach { healthStatus[it] = true }
  }

  /**
   * Check if an endpoint is currently considered healthy.
   */
  fun isHealthy(endpoint: String): Boolean {
    return healthStatus[endpoint] ?: false
  }

  /**
   * Mark an endpoint as unhealthy after a failure.
   * Rotates it to the back of the priority list.
   */
  fun markUnhealthy(endpoint: String) {
    healthStatus[endpoint] = false
    synchronized(priorityList) {
      // Rotate failed endpoint to back of list
      if (priorityList.remove(endpoint)) {
        priorityList.add(endpoint)
      }
    }
  }

  /**
   * Mark an endpoint as healthy after a successful response.
   */
  fun markHealthy(endpoint: String) {
    healthStatus[endpoint] = true
  }

  /**
   * Get the next healthy endpoint to try, using round-robin order.
   * Skips endpoints marked as unhealthy.
   *
   * @param currentEndpoint The endpoint that just failed (optional, used for
   *   logging/debugging context in future enhancements)
   * @return The next healthy endpoint URL, or null if all endpoints are unhealthy
   */
  @Suppress("UNUSED_PARAMETER")
  fun getNextHealthyEndpoint(currentEndpoint: String? = null): String? {
    synchronized(priorityList) {
      return priorityList.firstOrNull { isHealthy(it) }
    }
  }

  /**
   * Get all endpoints in current priority order (for testing/debugging).
   */
  fun getAllEndpoints(): List<String> {
    synchronized(priorityList) {
      return priorityList.toList()
    }
  }

  /**
   * Check if any endpoint is still healthy.
   */
  fun hasHealthyEndpoint(): Boolean {
    return healthStatus.values.any { it }
  }

  /**
   * Reset all endpoints to healthy state.
   * Called on app restart or manual refresh.
   */
  fun reset() {
    endpoints.forEach { healthStatus[it] = true }
    synchronized(priorityList) {
      priorityList.clear()
      priorityList.addAll(endpoints)
    }
  }
}
