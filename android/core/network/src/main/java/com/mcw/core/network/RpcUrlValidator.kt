package com.mcw.core.network

import java.net.InetAddress
import java.net.URI
import java.net.URISyntaxException

/**
 * Validates custom RPC URLs per tech-spec security requirements:
 * - HTTPS only: reject http://, file://, data://, javascript://
 * - Block private IPs: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 127.0.0.0/8
 * - Block 0.0.0.0 and IPv6 loopback (::1)
 * - Block "localhost" hostname
 *
 * Used in Settings screen for custom RPC URL configuration
 * and in WebView URL validation (Decision 9).
 */
object RpcUrlValidator {

  /**
   * Result of URL validation.
   * @param isValid Whether the URL passed all validation checks
   * @param errorMessage Human-readable error message (null if valid)
   */
  data class ValidationResult(
    val isValid: Boolean,
    val errorMessage: String? = null,
  )

  /**
   * Validate a URL for use as a custom RPC endpoint.
   *
   * Checks in order:
   * 1. Non-empty
   * 2. Parseable as URI
   * 3. HTTPS scheme only
   * 4. Not a private/loopback IP
   * 5. Not localhost hostname
   */
  fun validate(url: String): ValidationResult {
    val trimmed = url.trim()

    if (trimmed.isEmpty()) {
      return ValidationResult(false, "URL must not be empty")
    }

    // Parse URI
    val uri: URI = try {
      URI(trimmed)
    } catch (e: URISyntaxException) {
      return ValidationResult(false, "Invalid URL format")
    }

    // Check scheme — HTTPS only
    val scheme = uri.scheme?.lowercase()
    if (scheme != "https") {
      return ValidationResult(
        false,
        "Only HTTPS URLs are allowed. Got: ${scheme ?: "no scheme"}"
      )
    }

    // Extract host
    val host = uri.host
    if (host.isNullOrBlank()) {
      return ValidationResult(false, "URL must have a valid host")
    }

    val hostLower = host.lowercase()

    // Block "localhost" hostname
    if (hostLower == "localhost") {
      return ValidationResult(false, "Private/loopback addresses are not allowed: localhost")
    }

    // Check if host is an IP address and validate against private ranges
    val ipCheckResult = checkPrivateIp(hostLower)
    if (ipCheckResult != null) {
      return ipCheckResult
    }

    return ValidationResult(true)
  }

  /**
   * Check if a host string is a private/loopback IP address.
   * Returns a ValidationResult if the IP is private, null if it's not an IP or is public.
   *
   * NOTE on DNS rebinding: InetAddress.getByName() resolves hostnames via DNS. A malicious
   * hostname could resolve to a public IP during this validation but later resolve to a private
   * IP during actual OkHttp connection. This is an accepted MVP limitation — OkHttp performs
   * its own DNS resolution at connection time, so this check primarily prevents obvious
   * private IP inputs. For hostnames, the HTTPS requirement and network_security_config.xml
   * provide additional protection. Post-MVP: add runtime connection interceptor to also
   * validate resolved IPs at connection time.
   */
  private fun checkPrivateIp(host: String): ValidationResult? {
    // Handle IPv6 in brackets (e.g., [::1])
    val cleanHost = host.removeSurrounding("[", "]")

    // Try to parse as InetAddress
    val inetAddr: InetAddress = try {
      // Use getByName which handles both IPv4 and IPv6
      InetAddress.getByName(cleanHost)
    } catch (e: Exception) {
      // Not a valid IP — it's a hostname, which is fine
      return null
    }

    val addrBytes = inetAddr.address

    // Check if the resolved address is loopback
    if (inetAddr.isLoopbackAddress) {
      return ValidationResult(false, "Private/loopback addresses are not allowed: $host")
    }

    // IPv4 checks
    if (addrBytes.size == 4) {
      val b0 = addrBytes[0].toInt() and 0xFF
      val b1 = addrBytes[1].toInt() and 0xFF

      // 0.0.0.0
      if (addrBytes.all { it.toInt() == 0 }) {
        return ValidationResult(false, "Private addresses are not allowed: $host")
      }

      // 10.0.0.0/8
      if (b0 == 10) {
        return ValidationResult(false, "Private IP range 10.0.0.0/8 is not allowed: $host")
      }

      // 172.16.0.0/12 (172.16.x.x through 172.31.x.x)
      if (b0 == 172 && b1 in 16..31) {
        return ValidationResult(false, "Private IP range 172.16.0.0/12 is not allowed: $host")
      }

      // 192.168.0.0/16
      if (b0 == 192 && b1 == 168) {
        return ValidationResult(false, "Private IP range 192.168.0.0/16 is not allowed: $host")
      }

      // 127.0.0.0/8 (additional check beyond isLoopbackAddress)
      if (b0 == 127) {
        return ValidationResult(false, "Private/loopback addresses are not allowed: $host")
      }
    }

    // IPv6 loopback (::1) — also caught by isLoopbackAddress above,
    // but explicit check for clarity
    if (addrBytes.size == 16 && inetAddr.isLoopbackAddress) {
      return ValidationResult(false, "Private/loopback addresses are not allowed: $host")
    }

    return null
  }
}
