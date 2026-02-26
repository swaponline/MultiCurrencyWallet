<?php
/**
 * Init Pro
 * 
 * @package Envato API Functions
 */

/**
 * Get License Info
 */
function mcwallet_get_license_info( $code = null, $email = '' ){

	$url = 'https://wallet.wpmix.net/wp-json/license/info?code=' . $code . '&email=' . $email . '&site=' . get_site_url();

	$response = wp_remote_get( $url,
		array(
			'headers' => array(
				'timeout' => 120,
			),
		)
	);

	$response = wp_remote_retrieve_body( $response );
	$response = json_decode( $response );

	$code = 'undefined';
	if ( isset( $response->code ) ) {
		$code = $response->code;
	}
	$return = array(
		'code' => strval( $code ),
	);

	if ( 'success' === $code ) {
		$return['sold_at']         = $response->sold_at;
		$return['supported_until'] = $response->supported_until;
	}

	return $return;
}

/**
 * Sanitize Purchase Code
 */
function mcwallet_sanitize_purchase_code( $code ){
	$code = trim( $code );

	if( empty( $code ) ) {
		$message = esc_html__( 'The purchase code must not be empty.', 'multi-currency-wallet' );
	} else {
		$message = esc_html__( 'Please enter a valid purchase code.', 'multi-currency-wallet' );
	}
	if ( preg_match("/^([a-f0-9]{8})-(([a-f0-9]{4})-){3}([a-f0-9]{12})$/i", $code ) ) {

		$email = '';
		if ( isset( $_POST['mcwallet_email'] ) && is_email( $_POST['mcwallet_email'] ) ) {
			$email = $_POST['mcwallet_email'];
		}

		$info = mcwallet_get_license_info( $code, $email );

		if ( '404' === $info['code'] ) {
			$message = esc_html__( 'Please enter a valid purchase code.', 'multi-currency-wallet' );
			add_settings_error( 'mcwallet_purchase_code', 'settings_updated', $message, 'error' );
			return;
		}

		if ( 'success' === $info['code'] ) {
			if ( isset( $info['sold_at'] ) ) {
				update_option( 'mcwallet_license_sold_at', $info['sold_at'] );
			}
			if ( isset( $info['supported_until'] ) ) {
				update_option( 'mcwallet_license_supported_until', $info['supported_until'] );
			}
		} else {
			delete_option( 'mcwallet_license_sold_at' );
			delete_option( 'mcwallet_license_supported_until' );
		}

		$message = esc_html__( 'Your license code has been successfully added.', 'multi-currency-wallet' );

		add_settings_error( 'mcwallet_purchase_code', 'settings_updated', $message, 'updated' );
		return $code;
	} else {
		delete_option( 'mcwallet_license_sold_at' );
		delete_option( 'mcwallet_license_supported_until' );
	}

	add_settings_error( 'mcwallet_purchase_code', 'settings_updated', $message, 'error' );
	return false;
}

/**
 * Validate Purchase Code
 */
function mcwallet_validate_purchase_code( $code ){
	if ( mcwallet_sanitize_purchase_code( $code ) ) {
		return true;
	}
	return false;
}

/**
 * If Support Has Expired
 */
function mcwallet_is_supported() {
	if ( get_option( 'mcwallet_license_supported_until' ) ) {

		$date_now   = new DateTime( 'NOW' );
		$date_until = new DateTime( get_option( 'mcwallet_license_supported_until' ) );
		$diff       = $date_now->diff( $date_until );
		if ( $diff->invert ) {
			return false;
		}
		return true;
	}
	return false;
}

/**
 * Get Support days left
 */
function mcwallet_support_days_left() {
	$left = 'false';

	if ( ! mcwallet_is_supported() ) {
		return $left;
	}

	$date_now   = new DateTime( 'NOW' );
	$date_until = new DateTime( get_option( 'mcwallet_license_supported_until' ) );
	$diff       = $date_now->diff( $date_until );

	if( isset( $diff->days ) && $diff->days ) {
		$left = $diff->days;
	}

	return $left;
}

/**
 * If Active License
 */
function mcwallet_is_active_license() {
	if ( get_option( 'mcwallet_purchase_code' ) ) {
		if ( ! mcwallet_is_supported() ) {
			return false;
		}
		return true;
	}
	return false;
}


function mcwallet_license_admin_notice() {

	if ( mcwallet_is_active_license() ) {
		return;
	}

	$screen = get_current_screen();
	if ( isset( $screen->base ) && 'mcwallet_page_mcwallet-license' === $screen->base ) {
		return;
	}

	if ( get_option( 'mcwallet_purchase_code' ) && ! mcwallet_is_supported() ) {
		?>
		<div class="notice notice-warning">
			<p><?php echo sprintf ( esc_html__( 'The new version of MCW plugin with fixes and new features is ready but you can&#039;t install it automatically because your license is expired. Please %srenew the license%s.', 'multi-currency-wallet' ), '<a href="' . esc_url( admin_url( 'admin.php?page=mcwallet-license' ) ) . '">', '</a>' ); ?></p>
		</div>
		<?php
	} else {
		?>
		<div class="notice notice-error">
			<p><?php echo sprintf ( esc_html__( 'For further Multi Currency Wallet updates that include fixes and new features, you need to %sactivate the license%s.', 'multi-currency-wallet' ), '<a href="' . esc_url( admin_url( 'admin.php?page=mcwallet-license' ) ) . '">', '</a>' ); ?></p>
		</div>
		<?php
	}
}
add_action( 'admin_notices', 'mcwallet_license_admin_notice' );
