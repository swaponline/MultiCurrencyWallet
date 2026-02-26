<?php
/**
 * Init Pro
 * 
 * @package Multi Currency Wallet
 */

/**
 * Enavto API
 */
require MCWALLET_PATH . 'pro/envato-api.php';

/**
 * Pro Functions
 */
require MCWALLET_PATH . 'pro/functions-pro.php';

/**
 * Updates
 */
if ( mcwallet_is_active_license() ) {
	require MCWALLET_PATH . 'pro/info.php';
}

/**
 * Pro Functions
 */
require MCWALLET_PATH . 'pro/admin-page-pro.php';
