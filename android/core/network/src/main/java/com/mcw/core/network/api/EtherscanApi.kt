package com.mcw.core.network.api

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass
import retrofit2.http.GET
import retrofit2.http.Query

/**
 * Retrofit interface for Etherscan V2 API — EVM transaction history.
 *
 * Base URL: https://api.etherscan.io/v2/api (with chainid query param)
 * Source: src/front/config/mainnet/api.js -> etherscan, bscscan, maticscan
 *
 * The Etherscan V2 API uses a unified endpoint with chainid parameter
 * to query different EVM chains.
 */
interface EtherscanApi {

  /**
   * Fetch transaction list for an address.
   * Web equivalent: etherscan API with module=account&action=txlist
   */
  @GET(".")
  suspend fun getTransactions(
    @Query("chainid") chainId: Long,
    @Query("module") module: String = "account",
    @Query("action") action: String = "txlist",
    @Query("address") address: String,
    @Query("startblock") startBlock: Long = 0,
    @Query("endblock") endBlock: Long = 99999999,
    @Query("sort") sort: String = "desc",
    @Query("apikey") apiKey: String,
  ): EtherscanResponse<List<EtherscanTransaction>>

  /**
   * Fetch ERC20 token transfer events for an address.
   */
  @GET(".")
  suspend fun getTokenTransfers(
    @Query("chainid") chainId: Long,
    @Query("module") module: String = "account",
    @Query("action") action: String = "tokentx",
    @Query("address") address: String,
    @Query("startblock") startBlock: Long = 0,
    @Query("endblock") endBlock: Long = 99999999,
    @Query("sort") sort: String = "desc",
    @Query("apikey") apiKey: String,
  ): EtherscanResponse<List<EtherscanTokenTransaction>>
}

@JsonClass(generateAdapter = true)
data class EtherscanResponse<T>(
  @Json(name = "status") val status: String,
  @Json(name = "message") val message: String,
  @Json(name = "result") val result: T,
)

@JsonClass(generateAdapter = true)
data class EtherscanTransaction(
  @Json(name = "blockNumber") val blockNumber: String,
  @Json(name = "timeStamp") val timeStamp: String,
  @Json(name = "hash") val hash: String,
  @Json(name = "from") val from: String,
  @Json(name = "to") val to: String,
  @Json(name = "value") val value: String,
  @Json(name = "gas") val gas: String,
  @Json(name = "gasPrice") val gasPrice: String,
  @Json(name = "gasUsed") val gasUsed: String,
  @Json(name = "isError") val isError: String,
  @Json(name = "txreceipt_status") val txReceiptStatus: String,
  @Json(name = "confirmations") val confirmations: String,
)

@JsonClass(generateAdapter = true)
data class EtherscanTokenTransaction(
  @Json(name = "blockNumber") val blockNumber: String,
  @Json(name = "timeStamp") val timeStamp: String,
  @Json(name = "hash") val hash: String,
  @Json(name = "from") val from: String,
  @Json(name = "to") val to: String,
  @Json(name = "value") val value: String,
  @Json(name = "tokenName") val tokenName: String,
  @Json(name = "tokenSymbol") val tokenSymbol: String,
  @Json(name = "tokenDecimal") val tokenDecimal: String,
  @Json(name = "contractAddress") val contractAddress: String,
  @Json(name = "gas") val gas: String,
  @Json(name = "gasPrice") val gasPrice: String,
  @Json(name = "gasUsed") val gasUsed: String,
  @Json(name = "confirmations") val confirmations: String,
)
