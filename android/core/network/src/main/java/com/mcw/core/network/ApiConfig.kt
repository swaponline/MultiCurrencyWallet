package com.mcw.core.network

/**
 * Configuration for an API service with multiple endpoints for failover.
 *
 * @param name Identifier for this API (e.g., "bitpay", "etherscan")
 * @param endpoints List of base URLs in priority order for round-robin failover
 * @param apiKey Optional API key for authenticated endpoints
 */
data class ApiConfig(
  val name: String,
  val endpoints: List<String>,
  val apiKey: String = "",
)
