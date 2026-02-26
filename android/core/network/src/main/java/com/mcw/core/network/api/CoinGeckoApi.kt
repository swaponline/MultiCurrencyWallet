package com.mcw.core.network.api

import retrofit2.http.GET
import retrofit2.http.Query

/**
 * Retrofit interface for CoinGecko API — fiat price data.
 *
 * Base URL: https://api.coingecko.com/api/v3
 *
 * Used for USD price conversion of BTC, ETH, BNB, MATIC.
 * Free tier API with rate limiting — request queuing via
 * ApiFailoverInterceptor handles rate limiting gracefully.
 */
interface CoinGeckoApi {

  /**
   * Fetch simple price data for multiple coins.
   * Web equivalent: CoinGecko price fetch for fiat display.
   *
   * @param ids Comma-separated coin IDs (e.g., "bitcoin,ethereum,binancecoin,matic-network")
   * @param vsCurrencies Comma-separated fiat currencies (e.g., "usd")
   * @return Map of coin ID -> currency -> price
   */
  @GET("simple/price")
  suspend fun getSimplePrice(
    @Query("ids") ids: String,
    @Query("vs_currencies") vsCurrencies: String = "usd",
  ): Map<String, Map<String, Double>>
}
