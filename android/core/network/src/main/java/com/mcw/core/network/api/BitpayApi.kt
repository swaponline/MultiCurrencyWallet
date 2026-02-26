package com.mcw.core.network.api

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path

/**
 * Retrofit interface for Bitpay/Bitcore API — BTC balance and transactions.
 *
 * Base URL: https://api.bitcore.io/api/BTC/mainnet
 * Source: src/front/config/mainnet/api.js -> bitpay
 */
interface BitpayApi {

  /**
   * Fetch BTC address balance.
   * Web equivalent: GET {bitpay}/address/{addr}/balance/
   */
  @GET("address/{address}/balance/")
  suspend fun getBalance(
    @Path("address") address: String,
  ): BitpayBalanceResponse

  /**
   * Fetch unspent transaction outputs for an address.
   * Web equivalent: GET {bitpay}/address/{addr}/?unspent=true
   */
  @GET("address/{address}/?unspent=true")
  suspend fun getUnspentOutputs(
    @Path("address") address: String,
  ): List<BitpayUtxo>

  /**
   * Broadcast a signed transaction.
   * Web equivalent: POST {bitpay}/tx/send
   */
  @POST("tx/send")
  suspend fun broadcastTransaction(
    @Body body: BitpayBroadcastRequest,
  ): BitpayBroadcastResponse
}

@JsonClass(generateAdapter = true)
data class BitpayBalanceResponse(
  @Json(name = "confirmed") val confirmed: Long,
  @Json(name = "unconfirmed") val unconfirmed: Long,
  @Json(name = "balance") val balance: Long,
)

@JsonClass(generateAdapter = true)
data class BitpayUtxo(
  @Json(name = "mintTxid") val txid: String,
  @Json(name = "mintIndex") val vout: Int,
  @Json(name = "value") val value: Long,
  @Json(name = "script") val script: String,
  @Json(name = "address") val address: String,
  @Json(name = "confirmations") val confirmations: Int,
)

@JsonClass(generateAdapter = true)
data class BitpayBroadcastRequest(
  @Json(name = "rawTx") val rawTx: String,
)

@JsonClass(generateAdapter = true)
data class BitpayBroadcastResponse(
  @Json(name = "txid") val txid: String,
)
