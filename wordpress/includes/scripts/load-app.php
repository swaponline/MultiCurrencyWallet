<?php
/**
 * Load app scripts
 * 
 * @package Envato API Functions
 */

if ( version_compare( PHP_VERSION, '7.0.0' ) >= 0) {
	$path_levels = dirname( __FILE__, 6 ) . '/';
} else {
	$path_levels = dirname( __FILE__ ) . '../../../../../../';
}

require_once $path_levels . 'wp-load.php';

$upload_path = wp_upload_dir()['basedir'];

$_GET_ver = ( isset( $_GET['ver'] ) ) ? sanitize_text_field( $_GET['ver'] ) : false;

$use_testnet = ( get_option( 'mcwallet_use_testnet' ) === 'true' ) ? true : false;

$version = md5( ( $_GET_ver) ? sanitize_text_field( $_GET_ver ) : ( (MCWALLET_VER) ? MCWALLET_VER : 'no') );

$cache_file = $upload_path . '/swap-wallet-app-' . $version . '-' . (($use_testnet) ? 'testnet' : 'mainnet'). '.js';

if ( file_exists( $cache_file ) ) {
	header("Cache-control: public");
	header("Expires: " . gmdate("D, d M Y H:i:s", time() + 60*60*24) . " GMT");
	header( 'Content-Type: application/javascript; charset=UTF-8' );
	echo file_get_contents( $cache_file );

} else {
	$path = MCWALLET_PATH . (($use_testnet) ? 'vendors/swap/testnet/app.js' : 'vendors/swap/app.js');

	$app  = file_get_contents( $path );

	$strings = get_option( 'mcwallet_strings' );

	if ( $strings ) {
		foreach ( $strings as $string ) {
			$key                  = '"' . $string[0] . '"';
			$value                = '"' . $string[1] . '"';
			$replacements[ $key ] = $value;
		}
		if ( $replacements ) {
			$app = str_replace( array_keys( $replacements ), $replacements, $app );
		}
	}

	file_put_contents( $cache_file, $app );

	header("Cache-control: public");
	header("Expires: " . gmdate("D, d M Y H:i:s", time() + 60*60*24) . " GMT");
	header( 'Content-Type: application/javascript; charset=UTF-8' );

	echo file_get_contents( $cache_file );
}
exit;
