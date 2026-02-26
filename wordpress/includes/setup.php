<?php
/**
 * Setup
 * 
 * @package Multi Currency Wallet
 */

/**
 * On activation plugin
 */
if ( ! function_exists( 'mcwallet_register_activation_hook' ) ) {
	function mcwallet_register_activation_hook() {
		mcwallet_add_rewrite_rules();
		flush_rewrite_rules();
		mcwallet_add_default_token();
		mcwallet_add_default_banners();
		mcwallet_update_version();
	}
	register_activation_hook( MCWALLET_FILE, 'mcwallet_register_activation_hook' );
}

/**
 * Load the plugin text domain for translation.
 */
function mcwallet_load_plugin_textdomain() {
	load_plugin_textdomain( 'multi-currency-wallet', false, dirname( plugin_basename( __FILE__ ), 2 ) . '/lang/' );
}
add_action( 'plugins_loaded', 'mcwallet_load_plugin_textdomain' );
