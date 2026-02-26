<?php
/**
 * Admin Page Desing
 * 
 * @package Multi Currency Wallet
 */

/**
 * Add Design page to submenu
 */
function mcwallet_desing_submenu_page() {
	if ( apply_filters( 'mcwallet_disable_desing_submenu', false ) ) {
		return;
	}
	global $submenu;
	$mcwallet_design_url     = add_query_arg( array(
		'autofocus' => array( 'panel' => 'mcwallet_design' ),
		'url'       => mcwallet_page_url(),
	), admin_url( 'customize.php' ) );
	$submenu['mcwallet'][9] = array( esc_html__( 'Design', 'multi-currency-wallet' ), 'manage_options', esc_url( $mcwallet_design_url ) );
}
add_action( 'admin_menu', 'mcwallet_desing_submenu_page', 11 );
