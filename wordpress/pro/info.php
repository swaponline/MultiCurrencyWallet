<?php
/**
 * Plugin Info
 */

/**
 * Info json url
 */
function mcwallet_info_url() {
	$url = 'https://farm.wpmix.net/updates/mcw-info.json';
	return $url;
}

/**
 * Plugin Slug
 */
function mcwallet_plugin_slug() {
	$slug = 'multi-currency-wallet-pro';
	return $slug;
}

/**
 * Plugin Update Transitien Slug
 */
function mcwallet_transient_slug() {
	$slug = 'mcwallet_upgrade_' . mcwallet_plugin_slug();
	return $slug;
}

/**
 * Plugin Info
 */
function mcwallet_plugin_info( $res, $action, $args ) {

	// return false if this is not about getting plugin information.
	if ( 'plugin_information' !== $action ) {
		return false;
	}

	// return false if it is not our plugin.
	if ( mcwallet_plugin_slug() !== $args->slug ) {
		return false;
	}

	// trying to get from cache first.
	if ( false == $remote = get_transient( mcwallet_transient_slug() ) ) {

		// info.json is the file with the actual plugin information on your server.
		$remote = wp_remote_get( mcwallet_info_url(), array(
				'timeout' => 10,
				'headers' => array(
					'Accept' => 'application/json',
				),
		) );

		if ( ! is_wp_error( $remote ) && isset( $remote['response']['code'] ) && $remote['response']['code'] == 200 && ! empty( $remote['body'] ) ) {
			set_transient( mcwallet_transient_slug(), $remote, HOUR_IN_SECONDS );
		}

	}

	if ( ! is_wp_error( $remote ) && isset( $remote['response']['code'] ) && $remote['response']['code'] == 200 && ! empty( $remote['body'] ) ) {

		$remote = json_decode( $remote['body'] );
		$res = new stdClass();

		$res->name           = $remote->name;
		$res->slug           = mcwallet_plugin_slug();
		$res->version        = $remote->version;
		$res->tested         = $remote->tested;
		$res->requires       = $remote->requires;
		$res->author         = 'Ion Burdianov';
		$res->author_profile = 'https://profiles.wordpress.org/burdianov/';
		$res->download_link  = $remote->download_url;
		$res->trunk          = $remote->download_url;
		$res->requires_php   = $remote->requires_php;
		$res->last_updated   = $remote->last_updated;
		$res->sections       = array(
			'description'  => $remote->sections->description,
			'installation' => $remote->sections->installation,
			'changelog'    => $remote->sections->changelog,
		);

		// in case you want the screenshots tab, use the following HTML format for its content:
		// <ol><li><a href="IMG_URL" target="_blank"><img src="IMG_URL" alt="CAPTION" /></a><p>CAPTION</p></li></ol>
		if ( !empty ( $remote->sections->screenshots ) ) {
			$res->sections['screenshots'] = $remote->sections->screenshots;
		}

		$res->banners = array(
			'low' => 'https://ps.w.org/multi-currency-wallet/assets/banner-772x250.png',
			'high' => 'https://ps.w.org/multi-currency-wallet/assets/banner-772x250.png',
		);
		return $res;

	}

	return false;

}
add_filter('plugins_api', 'mcwallet_plugin_info', 20, 3 );

/**
 * Push Update
 */
function mcwallet_push_update( $transient ) {

	if ( empty( $transient->checked ) ) {
		return $transient;
	}

	// trying to get from cache first, to disable cache comment 10,20,21,22,24.
	if ( false == $remote = get_transient( mcwallet_transient_slug() ) ) {

		// info.json is the file with the actual plugin information on your server.
		$remote = wp_remote_get( mcwallet_info_url(),
			array(
				'timeout' => 10,
				'headers' => array(
					'Accept' => 'application/json',
				),
			)
		);

		if ( ! is_wp_error( $remote ) && isset( $remote['response']['code'] ) && $remote['response']['code'] == 200 && ! empty ( $remote['body'] ) ) {
			set_transient( mcwallet_transient_slug(), $remote, 43200 ); // 12 hours cache
		}
	}

	if ( $remote ) {

		$remote = json_decode( $remote['body'] );

		// your installed plugin version should be on the line below! You can obtain it dynamically of course 
		if ( $remote && version_compare( MCWALLET_VER, $remote->version, '<' ) && version_compare( $remote->requires, get_bloginfo('version'), '<' ) ) {
			$res                               = new stdClass();
			$res->slug                         = mcwallet_plugin_slug();
			$res->plugin                       = mcwallet_plugin_slug() . '/' . mcwallet_plugin_slug() . '.php';
			$res->new_version                  = $remote->version;
			$res->tested                       = $remote->tested;
			$res->package                      = $remote->download_url;
			$transient->response[$res->plugin] = $res;
			//$transient->checked[$res->plugin] = $remote->version;
		}
	}
	return $transient;
}
add_filter( 'site_transient_update_plugins', 'mcwallet_push_update' );
add_filter( 'transient_update_plugins', 'mcwallet_push_update' );

/**
 * Clean the cache when new plugin version is installed
 */
function mcwallet_after_update( $upgrader_object, $options ) {
	if ( $options['action'] == 'update' && $options['type'] === 'plugin' ) {
		// just clean the cache when new plugin version is installed.
		delete_transient( mcwallet_transient_slug() );
	}
}
add_action( 'upgrader_process_complete', 'mcwallet_after_update', 10, 2 );

/**
 * Force check update
 */
function mcwallet_update_force_check() {
	if ( ! isset( $_GET['force-check'] ) ) {
		return;
	}
	$current_screen = get_current_screen();
	if ( 'update-core' === $current_screen->id ) {
		delete_transient( mcwallet_transient_slug() );
	}
}
add_action( 'current_screen', 'mcwallet_update_force_check' );
