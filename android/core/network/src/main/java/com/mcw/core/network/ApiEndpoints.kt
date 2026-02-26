package com.mcw.core.network

/**
 * API endpoint configurations extracted from web wallet config files.
 *
 * Sources:
 * - src/front/config/mainnet/api.js (API URLs and keys)
 * - src/front/config/mainnet/web3.js (RPC URLs)
 *
 * API keys are free-tier and already public in the web bundle's JavaScript source.
 * Acceptable for MVP per tech-spec Decision 10.
 */
object ApiEndpoints {

  // Infura API key from web config
  private const val INFURA_API_KEY = "fdd4494101ed4a28b41bb66d7fe9c692"

  val bitpay = ApiConfig(
    name = "bitpay",
    endpoints = listOf(
      "https://api.bitcore.io/api/BTC/mainnet",
    ),
  )

  val etherscan = ApiConfig(
    name = "etherscan",
    endpoints = listOf(
      "https://api.etherscan.io/v2/api?chainid=1",
    ),
    apiKey = "GK6YHJ5NMEF67R4FTRNQS2EK3HRBP5VVHW",
  )

  val bscscan = ApiConfig(
    name = "bscscan",
    endpoints = listOf(
      "https://api.etherscan.io/v2/api?chainid=56",
    ),
    apiKey = "WI4QEJSV19U3TF2H1DPQ2HR6712HW4MYKJ",
  )

  val polygonscan = ApiConfig(
    name = "polygonscan",
    endpoints = listOf(
      "https://api.etherscan.io/v2/api?chainid=137",
    ),
    apiKey = "8S2R45ZWG94HI7YK9RCXSK4VCASJ4XVA15",
  )

  val blockcypher = ApiConfig(
    name = "blockcypher",
    endpoints = listOf(
      "https://api.blockcypher.com/v1/btc/main",
    ),
  )

  val coinGecko = ApiConfig(
    name = "coingecko",
    endpoints = listOf(
      "https://api.coingecko.com/api/v3",
    ),
  )

  /**
   * EVM RPC endpoint configs keyed by chain name.
   * Single ETH key is reused across all EVM chains -- only the RPC URL differs.
   */
  val evmRpc: Map<String, ApiConfig> = mapOf(
    "ETH" to ApiConfig(
      name = "eth_rpc",
      endpoints = listOf(
        "https://mainnet.infura.io/v3/$INFURA_API_KEY",
      ),
    ),
    "BSC" to ApiConfig(
      name = "bsc_rpc",
      endpoints = listOf(
        "https://bsc-dataseed.binance.org/",
      ),
    ),
    "POLYGON" to ApiConfig(
      name = "polygon_rpc",
      endpoints = listOf(
        "https://polygon-bor-rpc.publicnode.com",
      ),
    ),
  )
}
