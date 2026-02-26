<?php
/**
 * Banners
 * 
 * @package Multi Currency Wallet
 */

/**
 * Add default banners
 */
function mcwallet_add_default_banners() {

	if ( get_option( 'mcwallet_version' ) ) {
		return;
	}

	$banners = get_posts( array( 'post_type'   => 'mcwallet_banner' ) );
	if ( ! empty( $banners ) ) {
		return;
	}

	$posts = array(
		array(
			'post_title'  => 'Try BTC/USDT AtomicSwap exchange',
			'post_type'   => 'mcwallet_banner',
			'post_status' => 'publish',
			'post_author' => 1,
			'meta_input'  => array(
				'banner_text'  => 'Try BTC/USDT AtomicSwap exchange',
				'banner_url'   => '/exchange/usdt-to-btc',
				'banner_icon'  => '',
				'banner_image' => '',
				'banner_color' => '#1f2d48',
			),
		),
		array(
			'post_title'  => 'Buy bitcoin using VISA/MC',
			'post_type'   => 'mcwallet_banner',
			'post_status' => 'publish',
			'post_author' => 1,
			'meta_input'  => array(
				'banner_text'  => 'Deposit using VISA/MC',
				'banner_url'   => 'https://buy.itez.com/swaponline',
				'banner_icon'  => MCWALLET_URL . 'assets/images/banner-mastercard-visa.png',
				'banner_image' => '',
				'banner_color' => '#2aa2d6',
			),
		),
	);

	foreach ( $posts as $post ) {
		wp_insert_post(  wp_slash( $post ) );
	}

}

if ( apply_filters( 'mcwallet_disable_banner', false ) ) {
	return;
}

/**
 * Register Post Type mcwallet_banner
 */
function mcwallet_banner_post_type() {

	$labels = array(
		'name'                  => esc_html__( 'Banners', 'multi-currency-wallet' ),
		'singular_name'         => esc_html__( 'Banner', 'multi-currency-wallet' ),
		'menu_name'             => esc_html__( 'Banners', 'multi-currency-wallet' ),
		'name_admin_bar'        => esc_html__( 'Banners', 'multi-currency-wallet' ),
		'all_items'             => esc_html__( 'All Banners', 'multi-currency-wallet' ),
		'add_new_item'          => esc_html__( 'Add New Banner', 'multi-currency-wallet' ),
		'add_new'               => esc_html__( 'Add New', 'multi-currency-wallet' ),
		'new_item'              => esc_html__( 'New Banner', 'multi-currency-wallet' ),
		'edit_item'             => esc_html__( 'Edit Banner', 'multi-currency-wallet' ),
		'update_item'           => esc_html__( 'Update Banner', 'multi-currency-wallet' ),
		'search_items'          => esc_html__( 'Search Banner', 'multi-currency-wallet' ),
		'not_found'             => esc_html__( 'Not found', 'multi-currency-wallet' ),
		'not_found_in_trash'    => esc_html__( 'Not found in Trash', 'multi-currency-wallet' ),
		'featured_image'        => esc_html__( 'Featured Image', 'multi-currency-wallet' ),
		'set_featured_image'    => esc_html__( 'Set featured image', 'multi-currency-wallet' ),
		'remove_featured_image' => esc_html__( 'Remove featured image', 'multi-currency-wallet' ),
		'use_featured_image'    => esc_html__( 'Use as featured image', 'multi-currency-wallet' ),
	);
	$args = array(
		'labels'                => $labels,
		'supports'              => array( 'title' ),
		'hierarchical'          => false,
		'public'                => false,
		'show_ui'               => true,
		'show_in_menu'          => false,
		'show_in_admin_bar'     => false,
		'show_in_nav_menus'     => false,
		'can_export'            => true,
		'publicly_queryable'    => false,
		'capability_type'       => 'post',
	);
	register_post_type( 'mcwallet_banner', $args );

}
add_action( 'init', 'mcwallet_banner_post_type' );

/**
 * Add page link to submenu
 */
function mcwallet_banners_menu_page() {
	add_submenu_page(
		'mcwallet',
		esc_html__( 'Banners', 'multi-currency-wallet' ),
		esc_html__( 'Banners', 'multi-currency-wallet' ),
		'manage_options',
		'edit.php?post_type=mcwallet_banner',
		'',
		1
	);
}
add_action('admin_menu', 'mcwallet_banners_menu_page');

/**
 * Remove months dropdown results
 */
add_filter('months_dropdown_results', '__return_empty_array');

/**
 * Remove date from posts column
 */
function mcwallet_remove_date_column( $columns ) {
	unset( $columns['date'] );
	return $columns;
}
add_filter( 'manage_mcwallet_banner_posts_columns', 'mcwallet_remove_date_column' );

/**
 * Remove quick edit
 */
function remove_quick_edit( $actions, $post ) {
	if ( 'mcwallet_banner' == $post->post_type ) {
		unset( $actions['inline hide-if-no-js'] );
	}
	return $actions;
}
add_filter( 'post_row_actions', 'remove_quick_edit', 10, 2 );

/**
 * Adds a meta box to post type mcwallet_banner
 */
class MCWallet_Banner_Meta_Box {

	public function __construct() {

		if ( is_admin() ) {
			add_action( 'load-post.php',     array( $this, 'init_metabox' ) );
			add_action( 'load-post-new.php', array( $this, 'init_metabox' ) );
		}

	}

	public function init_metabox() {

		add_action( 'add_meta_boxes',        array( $this, 'add_metabox' )         );
		add_action( 'save_post',             array( $this, 'save_metabox' ), 10, 2 );

	}

	public function add_metabox() {

		add_meta_box(
			'banner_meta',
			esc_html__( 'Banner Details', 'multi-currency-wallet' ),
			array( $this, 'render_metabox' ),
			'mcwallet_banner',
			'normal',
			'high'
		);

	}

	public function render_metabox( $post ) {
		
		/* Add nonce for security and authentication */
		wp_nonce_field( 'banner_meta_action', 'banner_meta_nonce' );

		// Retrieve an existing value from the database.
		$banner_text  = get_post_meta( $post->ID, 'banner_text', true );
		$banner_url   = get_post_meta( $post->ID, 'banner_url', true );
		$banner_icon  = get_post_meta( $post->ID, 'banner_icon', true );
		$banner_image = get_post_meta( $post->ID, 'banner_image', true );
		$banner_color = get_post_meta( $post->ID, 'banner_color', true );

		// Set default values.
		if( empty( $banner_text ) ) $banner_text = '';
		if( empty( $banner_url ) ) $banner_url = '';
		if( empty( $banner_icon ) ) $banner_icon = '';
		if( empty( $banner_image ) ) $banner_image = '';
		if( empty( $banner_color ) ) $banner_color = '#1f2d48';

		// Form fields.
		echo '<table class="form-table mcwallet-form-table">';
		
		echo '	<tr>';
		echo '		<th><label>' . esc_html__( 'Banner Text', 'multi-currency-wallet' ) . '</label></th>';
		echo '		<td>';
		echo '			<input type="text" name="banner_text" class="large-text" value="' . esc_attr( $banner_text ) . '">';
		echo '		</td>';
		echo '	</tr>';
		
		echo '	<tr>';
		echo '		<th><label>' . esc_html__( 'Banner Url', 'multi-currency-wallet' ) . '</label></th>';
		echo '		<td>';
		echo '			<input type="text" name="banner_url" class="large-text" value="' . esc_attr( $banner_url ) . '">';
		echo '		</td>';
		echo '	</tr>';

		echo '	<tr>';
		echo '		<th><label>' . esc_html__( 'Banner Icon', 'multi-currency-wallet' ) . '</label></th>';
		echo '		<td>
						<div class="mcwallet-form-inline">
							<input name="banner_icon" type="text" class="large-text mcwallet-input-image" value="' . esc_attr( $banner_icon ) . '">
							<button class="button button-secondary mcwallet-load-image">' . esc_html__( 'Add Image', 'multi-currency-wallet' ) . '</button>
						</div>
				  </td>';
		echo '	</tr>';

		echo '	<tr>';
		echo '		<th><label>' . esc_html__( 'Background Image', 'multi-currency-wallet' ) . '</label></th>';
		echo '		<td>
						<div class="mcwallet-form-inline">
							<input name="banner_image" type="text" class="large-text mcwallet-input-image" value="' . esc_attr( $banner_image ) . '">
							<button class="button button-secondary mcwallet-load-image">' . esc_html__( 'Add Image', 'multi-currency-wallet' ) . '</button>
						</div>
					</td>';
		echo '	</tr>';
		
		echo '	<tr>';
		echo '		<th><label>' . esc_html__( 'Background Color', 'multi-currency-wallet' ) . '</label></th>';
		echo '		<td>
						<div class="mcwallet-form-inline">
							<input name="banner_color" class="mcwallet-icon-bg" type="text" value="' . esc_attr( $banner_color ) . '">
						</div>
					</td>';
		echo '	</tr>';

		echo '</table>';

	}

	public function save_metabox( $post_id, $post ) {
		
		/* Add nonce for security and authentication */
		$nonce_name   = isset( $_POST['banner_meta_nonce'] ) ? $_POST['banner_meta_nonce'] : '';
		$nonce_action = 'banner_meta_action';

		/* Check if a nonce is set */
		if ( ! isset( $nonce_name ) )
			return;

		/* Check if a nonce is valid */
		if ( ! wp_verify_nonce( $nonce_name, $nonce_action ) )
			return;

		/* Check if the user has permissions to save data */
		if ( ! current_user_can( 'edit_post', $post_id ) )
			return;

		/* Check if it's not an autosave */
		if ( wp_is_post_autosave( $post_id ) )
			return;

		/* Sanitize user input */
		$banner_text  = isset( $_POST[ 'banner_text' ] ) ? sanitize_text_field( $_POST[ 'banner_text' ] ) : '';
		$banner_url   = isset( $_POST[ 'banner_url' ] ) ? sanitize_text_field( $_POST[ 'banner_url' ] ) : '';
		$banner_icon  = isset( $_POST[ 'banner_icon' ] ) ? sanitize_text_field( $_POST[ 'banner_icon' ] ) : '';
		$banner_image = isset( $_POST[ 'banner_image' ] ) ? sanitize_text_field( $_POST[ 'banner_image' ] ) : '';
		$banner_color = isset( $_POST[ 'banner_color' ] ) ? sanitize_hex_color( $_POST[ 'banner_color' ] ) : '';

		/* Update the meta field in the database */
		update_post_meta( $post_id, 'banner_text', $banner_text );
		update_post_meta( $post_id, 'banner_url', $banner_url );
		update_post_meta( $post_id, 'banner_icon', $banner_icon );
		update_post_meta( $post_id, 'banner_image', $banner_image );
		update_post_meta( $post_id, 'banner_color', $banner_color );

	}

}

new MCWallet_Banner_Meta_Box;
