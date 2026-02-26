<?php
/**
 * Init
 * 
 * @package Multi Currency Wallet
 */

/**
 * Setup
 */
require MCWALLET_PATH . 'includes/setup.php';

/**
 * Functions
 */
require MCWALLET_PATH . 'includes/functions.php';

/**
 * Admin Functions
 */
require MCWALLET_PATH . 'includes/admin-functions.php';

/**
 * Customizer
 */
require MCWALLET_PATH . 'includes/customizer/customizer.php';

/**
 * User panel
 */
require MCWALLET_PATH . 'includes/user-panel.php';

/**
 * Etherscan API functions
 */
require MCWALLET_PATH . 'includes/etherscan-api.php';

/**
 * Load pro functions if exists
 */
$mcwallet_pro_path = MCWALLET_PATH . 'pro/init-pro.php';
if ( file_exists( $mcwallet_pro_path ) ) {
	require MCWALLET_PATH . 'pro/init-pro.php';
}

/**
 * Admin Page
 */
require MCWALLET_PATH . 'includes/admin-page/admin-page.php';

/**
 * Ajax
 */
if ( wp_doing_ajax() ) {
	require MCWALLET_PATH . 'includes/ajax.php';
}

/**
 * Tags
 */
require MCWALLET_PATH . 'includes/tags.php';

/**
 * Scripts
 */
require MCWALLET_PATH . 'includes/scripts/scripts.php';

/**
 * Actions
 */
require MCWALLET_PATH . 'includes/actions.php';

/**
 * Shortcode
 */
require MCWALLET_PATH . 'includes/shortcode.php';

/**
 * Custom Tinymce
 */
require MCWALLET_PATH . 'includes/tinymce.php';

/**
 * Banners
 */
require MCWALLET_PATH . 'includes/banners.php';
