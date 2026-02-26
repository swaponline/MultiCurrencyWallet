package com.mcw.core.network.di

import com.mcw.core.network.NetworkClient
import com.mcw.core.network.api.BitpayApi
import com.mcw.core.network.api.BlockcypherApi
import com.mcw.core.network.api.CoinGeckoApi
import com.mcw.core.network.api.EtherscanApi
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Named
import javax.inject.Singleton

/**
 * Hilt module providing network layer dependencies.
 *
 * Provides pre-configured API interfaces via [NetworkClient].
 * All API instances are singletons scoped to the application lifecycle.
 */
@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {

  @Provides
  @Singleton
  fun provideNetworkClient(): NetworkClient {
    return NetworkClient()
  }

  @Provides
  @Singleton
  fun provideBitpayApi(networkClient: NetworkClient): BitpayApi {
    return networkClient.bitpayApi
  }

  @Provides
  @Singleton
  @Named("etherscan")
  fun provideEtherscanApi(networkClient: NetworkClient): EtherscanApi {
    return networkClient.etherscanApi
  }

  @Provides
  @Singleton
  @Named("bscscan")
  fun provideBscscanApi(networkClient: NetworkClient): EtherscanApi {
    return networkClient.bscscanApi
  }

  @Provides
  @Singleton
  @Named("polygonscan")
  fun providePolygonscanApi(networkClient: NetworkClient): EtherscanApi {
    return networkClient.polygonscanApi
  }

  @Provides
  @Singleton
  fun provideBlockcypherApi(networkClient: NetworkClient): BlockcypherApi {
    return networkClient.blockcypherApi
  }

  @Provides
  @Singleton
  fun provideCoinGeckoApi(networkClient: NetworkClient): CoinGeckoApi {
    return networkClient.coinGeckoApi
  }
}
