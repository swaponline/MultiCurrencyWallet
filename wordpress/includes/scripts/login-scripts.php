<?php
/**
 * Login Scripts
 * 
 * @package Envato API Functions
 */

/**
 * Login Enqueue Scripts
 */
function mcwallet_login_enqueue_scripts() {

	/* Register styles */
	if ( ! get_option( 'mcwallet_logo' ) ) {
		return;
	}

	wp_enqueue_style( 'mcwallet-login', MCWALLET_URL . 'assets/css/login.css', array( 'login' ), MCWALLET_VER . '-' . MCWALLET_BUILD_VER );

	$image     = mcwallet_logo_url();
	$login_css = "
		:root {
			--mcwallet-login-logo: url({$image});
		}";
	wp_add_inline_style( 'login', $login_css );

}
add_action( 'login_enqueue_scripts', 'mcwallet_login_enqueue_scripts' );
