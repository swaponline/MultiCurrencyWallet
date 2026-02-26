package com.mcw.core.network.api

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass
import retrofit2.http.GET

/**
 * Retrofit interface for Blockcypher API — BTC fee estimation.
 *
 * Base URL: https://api.blockcypher.com/v1/btc/main
 * Source: src/front/config/mainnet/api.js -> blockcypher
 *
 * Web equivalent: getFeesRateBlockcypher() in btc.ts
 * Returns fee rates in sat/KB for slow, normal, and fast tiers.
 */
interface BlockcypherApi {

  /**
   * Fetch current BTC fee rates.
   * Web equivalent: GET {blockcypher}/
   * Returns high/medium/low fee_per_kb values.
   */
  @GET(".")
  suspend fun getFeeRates(): BlockcypherFeeResponse
}

@JsonClass(generateAdapter = true)
data class BlockcypherFeeResponse(
  @Json(name = "high_fee_per_kb") val highFeePerKb: Long,
  @Json(name = "medium_fee_per_kb") val mediumFeePerKb: Long,
  @Json(name = "low_fee_per_kb") val lowFeePerKb: Long,
)
