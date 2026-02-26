<?php
/**
 * Shortcode
 * 
 * @package Envato API Functions
 */

/**
 * Add Shortcode mcwallet_widget
 */
function mcwallet_shortcode( $atts ){

	// Execute shortcode only once in the page
	static $already_run = false;

	extract( shortcode_atts( array(
		'page' => '',
	), $atts ) );

	$widget_html = '';
	$iframe_src = mcwallet_page_url();
	if ( $page ) {
		$iframe_src = $iframe_src . '#/' . $page . '-wallet';
	}

	if ( $already_run !== true ) {
		$widget_html = '<style>
		.mcwallet-widget-iframe {
			min-height: 750px;
			width: 100%;
			border: 0;
		}
		</style>';
		$widget_html .= '<iframe src="' . esc_url( $iframe_src ) . '" class="mcwallet-widget-iframe"></iframe>';
	}

	$already_run = true;

	return $widget_html;
}
add_shortcode( 'mcwallet_widget', 'mcwallet_shortcode' );
