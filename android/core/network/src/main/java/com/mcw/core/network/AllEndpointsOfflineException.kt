package com.mcw.core.network

import java.io.IOException

/**
 * Thrown when all configured API endpoints are offline or unhealthy.
 * Matches web wallet's "All endpoints of api is offline" error from apiLooper.ts.
 */
class AllEndpointsOfflineException(
  val apiName: String = "unknown",
) : IOException("All endpoints of $apiName are offline")
