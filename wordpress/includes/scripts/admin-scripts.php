<?php
/**
 * Admin Scripts
 * 
 * @package Envato API Functions
 */

/**
 * Admin Enqueue Scripts
 */
function mcwallet_admin_enqueue_scripts( $hook ) {

	global $typenow;

	/* Register style */
	wp_register_style( 'mcwallet-admin', MCWALLET_URL . 'assets/css/admin.css', false, MCWALLET_VER . '-' . MCWALLET_BUILD_VER );
	/* Enqueue admin css */
	wp_enqueue_style( 'mcwallet-admin' );

	/* Load scripts only on mcwallet admin page */
	if ( 'toplevel_page_mcwallet' == $hook || 'mcwallet_page_mcwallet-design' == $hook || 'mcwallet_banner' == $typenow ) {

		/* Register script */
		wp_register_script( 'mcwallet-admin', MCWALLET_URL . 'assets/js/admin.js', array( 'jquery', 'jquery-ui-core', 'jquery-ui-sortable' ), MCWALLET_VER . '-' . MCWALLET_BUILD_VER, true );
		/* Load media and thickbox */
		wp_enqueue_media();
		add_thickbox();
		wp_enqueue_script( 'wp-color-picker' );
		wp_enqueue_style( 'wp-color-picker' );
		wp_enqueue_script( 'mcwallet-admin' );

		/* Translatable string */
		wp_localize_script('mcwallet-admin', 'mcwallet',
			array(
				'ajaxurl' => admin_url( 'admin-ajax.php' ),
				'nonce'   => wp_create_nonce( 'mcwallet-nonce' ),
				'notices' => array(
					'success'       => esc_html__( 'Token successfully added!', 'multi-currency-wallet' ),
					'wrong'         => esc_html__( 'Something is wrong, please try again!', 'multi-currency-wallet' ),
					'empty'         => esc_html__( 'ERC20 contract address is empty!', 'multi-currency-wallet' ),
					'invalid'       => esc_html__( 'Please add a valid ERC20 address!', 'multi-currency-wallet' ),
					'updated'       => esc_html__( 'Options updated!', 'multi-currency-wallet' ),
					'removed'       => esc_html__( 'Token successfully removed!', 'multi-currency-wallet' ),
					'noTokens'      => esc_html__( 'No tokens', 'multi-currency-wallet' ),
					'confirmDelete' => esc_html__( 'Confirm delete', 'multi-currency-wallet' ),
				),
				'uploader' => array(
					'title'  => esc_html__( 'Insert image', 'multi-currency-wallet' ),
					'button' => esc_html__( 'Use this image', 'multi-currency-wallet' ),
				),
			)
		);
	}

}
add_action( 'admin_enqueue_scripts', 'mcwallet_admin_enqueue_scripts' );
