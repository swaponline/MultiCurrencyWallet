package com.mcw.core.network

import com.mcw.core.network.api.BitpayApi
import com.mcw.core.network.api.BlockcypherApi
import com.mcw.core.network.api.CoinGeckoApi
import com.mcw.core.network.api.EtherscanApi
import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.TimeUnit
import javax.inject.Singleton

/**
 * OkHttp-based HTTP client with round-robin API failover.
 *
 * Provides configured Retrofit API interfaces for:
 * - Bitpay (BTC balance, UTXOs, broadcast)
 * - Etherscan (EVM transaction history)
 * - Blockcypher (BTC fee estimation)
 * - CoinGecko (fiat prices)
 *
 * Each API uses its own [EndpointHealthTracker] and [ApiFailoverInterceptor]
 * for independent failover. Health state is in-memory only (resets on restart).
 *
 * Connection/read/write timeouts: 30s (reasonable for mobile networks).
 */
@Singleton
class NetworkClient {

  companion object {
    private const val CONNECT_TIMEOUT_SECONDS = 30L
    private const val READ_TIMEOUT_SECONDS = 30L
    private const val WRITE_TIMEOUT_SECONDS = 30L
  }

  private val moshi: Moshi = Moshi.Builder()
    .addLast(KotlinJsonAdapterFactory())
    .build()

  /** Per-API health trackers, keyed by API name */
  private val healthTrackers = ConcurrentHashMap<String, EndpointHealthTracker>()

  /**
   * Get or create an [EndpointHealthTracker] for an API config.
   */
  fun getHealthTracker(config: ApiConfig): EndpointHealthTracker {
    return healthTrackers.getOrPut(config.name) {
      EndpointHealthTracker(config.endpoints)
    }
  }

  /**
   * Create an OkHttpClient with failover interceptor for a specific API.
   */
  fun createOkHttpClient(
    config: ApiConfig,
    enableLogging: Boolean = false,
  ): OkHttpClient {
    val healthTracker = getHealthTracker(config)
    val failoverInterceptor = ApiFailoverInterceptor(healthTracker)

    val builder = OkHttpClient.Builder()
      .addInterceptor(failoverInterceptor)
      .connectTimeout(CONNECT_TIMEOUT_SECONDS, TimeUnit.SECONDS)
      .readTimeout(READ_TIMEOUT_SECONDS, TimeUnit.SECONDS)
      .writeTimeout(WRITE_TIMEOUT_SECONDS, TimeUnit.SECONDS)

    if (enableLogging) {
      val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
      }
      builder.addInterceptor(loggingInterceptor)
    }

    return builder.build()
  }

  /**
   * Create a Retrofit instance for a specific API config.
   * Uses the first endpoint as the base URL.
   */
  fun createRetrofit(config: ApiConfig, enableLogging: Boolean = false): Retrofit {
    val client = createOkHttpClient(config, enableLogging)
    val baseUrl = config.endpoints.first().let { url ->
      // Ensure base URL ends with /
      if (url.endsWith("/")) url else "$url/"
    }

    return Retrofit.Builder()
      .baseUrl(baseUrl)
      .client(client)
      .addConverterFactory(MoshiConverterFactory.create(moshi))
      .build()
  }

  // ===== Pre-configured API instances =====

  /** Bitpay API for BTC operations */
  val bitpayApi: BitpayApi by lazy {
    createRetrofit(ApiEndpoints.bitpay).create(BitpayApi::class.java)
  }

  /** Etherscan API for ETH transaction history */
  val etherscanApi: EtherscanApi by lazy {
    createRetrofit(ApiEndpoints.etherscan).create(EtherscanApi::class.java)
  }

  /** BSCScan API (uses same Etherscan V2 interface) */
  val bscscanApi: EtherscanApi by lazy {
    createRetrofit(ApiEndpoints.bscscan).create(EtherscanApi::class.java)
  }

  /** PolygonScan API (uses same Etherscan V2 interface) */
  val polygonscanApi: EtherscanApi by lazy {
    createRetrofit(ApiEndpoints.polygonscan).create(EtherscanApi::class.java)
  }

  /** Blockcypher API for BTC fee estimation */
  val blockcypherApi: BlockcypherApi by lazy {
    createRetrofit(ApiEndpoints.blockcypher).create(BlockcypherApi::class.java)
  }

  /** CoinGecko API for fiat prices */
  val coinGeckoApi: CoinGeckoApi by lazy {
    createRetrofit(ApiEndpoints.coinGecko).create(CoinGeckoApi::class.java)
  }

  /**
   * Get Etherscan-compatible API for a specific EVM chain.
   */
  fun getEtherscanApiForChain(chainName: String): EtherscanApi {
    return when (chainName.uppercase()) {
      "ETH" -> etherscanApi
      "BSC" -> bscscanApi
      "POLYGON" -> polygonscanApi
      else -> throw IllegalArgumentException("Unsupported chain: $chainName")
    }
  }

  /**
   * Get API key for a specific chain's explorer.
   */
  fun getExplorerApiKey(chainName: String): String {
    return when (chainName.uppercase()) {
      "ETH" -> ApiEndpoints.etherscan.apiKey
      "BSC" -> ApiEndpoints.bscscan.apiKey
      "POLYGON" -> ApiEndpoints.polygonscan.apiKey
      else -> throw IllegalArgumentException("Unsupported chain: $chainName")
    }
  }

  /**
   * Reset all endpoint health trackers.
   * Called on manual refresh or connectivity change.
   */
  fun resetAllHealthTrackers() {
    healthTrackers.values.forEach { it.reset() }
  }
}
