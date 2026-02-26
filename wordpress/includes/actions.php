<?php
/**
 * Actions
 * 
 * @package Envato API Functions
 */

/**
 * Add custom code before close tag head
 */
function mcwallet_custom_head(){
	if ( get_option( 'mcwallet_head_code' ) ) {
		echo "\n" . wp_specialchars_decode( get_option( 'mcwallet_head_code' ), ENT_QUOTES ) . "\n";
	}
}
add_action( 'mcwallet_head', 'mcwallet_custom_head' );

/**
 * Add custom code after open tag body
 */
function mcwallet_custom_body_open(){
	if ( get_option( 'mcwallet_body_code' ) ) {
		echo "\n" . wp_specialchars_decode( get_option( 'mcwallet_body_code' ), ENT_QUOTES ) . "\n";
	}
}
add_action( 'mcwallet_body_open', 'mcwallet_custom_body_open' );

/**
 * Add custom code before close tag body
 */
function mcwallet_custom_footer(){
	if ( get_option( 'mcwallet_footer_code' ) ) {
		echo "\n" . wp_specialchars_decode( get_option( 'mcwallet_footer_code' ), ENT_QUOTES ) . "\n";
	}
}
add_action( 'mcwallet_footer', 'mcwallet_custom_footer' );
