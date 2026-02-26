<?php
/**
 * Functions Pro
 * 
 * @package Envato API Functions
 */

/**
 * Hide admin tabs if no license.
 */
function mcwallet_admin_page_tabs_init( $tabs ){
	if ( ! get_option( 'mcwallet_purchase_code' ) ) {
		$tabs = array(
			'no-license' => esc_html__( 'No license', 'multi-currency-wallet' ),
		);
	}
	return $tabs;
}
add_filter( 'mcwallet_admin_page_tabs', 'mcwallet_admin_page_tabs_init' );

/**
 * Add content to no license admin tab.
 */
function mcwallet_admin_page_tab_custom( $content, $slug ){
	if ( 'no-license' === $slug ) {
		$license_page_url = admin_url( 'admin.php?page=mcwallet-license' );
		$content = '
			<div class="mcwallet-shortcode-panel-row">
				<h3>' . esc_html__( 'Please activate MCW plugin license', 'multi-currency-wallet' ) . '</h3>
				<p><a href="' . esc_url( $license_page_url ) . '" class="button button-primary">' . esc_html__( 'Go to license page', 'multi-currency-wallet' ) . '</a></p>
			</div>
		';
	}
	return $content;
}
add_filter( 'mcwallet_admin_page_tab', 'mcwallet_admin_page_tab_custom', 10, 2 );

/**
 * Add content to no license front template.
 */
function mcwallet_front_template_message(){
	if ( ! get_option( 'mcwallet_purchase_code' ) ) {
		?>
		<h1><center><?php esc_html_e( 'Please activate MCW plugin license', 'multi-currency-wallet' ); ?></center></h1>
		<?php
	}
}
add_action( 'mcwallet_footer', 'mcwallet_front_template_message' );

/**
 * Add license info to global window variables.
 */
function mcwallet_window_variable_license( $variables ){
	$variables['licenceInfo'] = mcwallet_support_days_left();
	return $variables;
}
add_filter( 'mcwallet_window_variables', 'mcwallet_window_variable_license', 10, 2 );

/**
 * Update Admin Page Footer info.
 */
function mcwallet_info_bar_custom_content( $content ) {
	$filename = MCWALLET_PATH . 'multi-currency-wallet-pro.php';
	$update_time = gmdate( 'H\h : i\m : s\s', time() - filectime( $filename ) );
	$content = sprintf( esc_html__( 'Plugin version: %s | Build version: %s | Updated: %s ago.', 'multi-currency-wallet' ), MCWALLET_VER, MCWALLET_BUILD_VER, $update_time );
	return $content;
}
add_filter( 'mcwallet_info_bar_content', 'mcwallet_info_bar_custom_content' );

/**
 * Disable Design page if no license
 */
function mcwallet_disable_fee() {
	return false;
}
add_filter( 'mcwallet_disable_fee', 'mcwallet_disable_fee' );

/**
 * Disable Design page if no license
 */
function mcwallet_disable_if_no_license( $status ) {
	if ( ! get_option( 'mcwallet_purchase_code' ) ) {
		$status = true;
	}
	return $status;
}
add_filter( 'mcwallet_disable_desing_submenu', 'mcwallet_disable_if_no_license' );
add_filter( 'mcwallet_disable_banner', 'mcwallet_disable_if_no_license' );
add_filter( 'mcwallet_disable_front_template', 'mcwallet_disable_if_no_license' );

/**
 * Remove Blog - from wp title
 */
function mcwallet_wp_title( $title ){
	str_replace( 'Blog - ', '', $title );

	return $title;
}
add_filter( 'wp_title', 'mcwallet_wp_title', 10, 3 );
