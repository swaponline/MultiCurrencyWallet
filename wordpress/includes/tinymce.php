<?php
/**
 * TinyMCE
 * 
 * @package Envato API Functions
 */

/**
 * Add Custom media Button
 */
function mcwallet_media_button( $editor_id ) {

	$howdeposit_text = esc_html__( '<h2>Transfer euro via your bank using this details:</h2><p>Bank: COMMERZBANK AG, D-60311 Frankfurt am Main, Germany<br>Account: 400800094501EUR<br>Description: {userAddress}</p>
	<p>Your payment will be processed in 24 hours. With any questions email us: <a href="mailto:payments@mydomain.com">payments@mydomain.com</a>', 'multi-currency-wallet' );

	$howwithdraw_text = esc_html__( '<h2>Enter amount to withdraw in form below</h2><p>Enter account details and click "Request payment"<br>
Your payment will be processed in 24 hours<br>Email with any questions <a href="mailto:payments@mydomain.com">payments@mydomain.com</a>', 'multi-currency-wallet' );

	if ( 'howdeposit' === $editor_id ){
		echo ' <a href="#" class="button insert-text-template" data-editor-id="howdeposit" data-text="' . esc_attr( $howdeposit_text ) . '">' . esc_html__( 'Default Template: Euro bank transfer', 'multi-currency-wallet' ) . '</a>';
	}
	if ( 'howwithdraw' === $editor_id ){
		echo ' <a href="#" class="button insert-text-template" data-editor-id="howwithdraw" data-text="' . esc_attr( $howwithdraw_text ) . '">' . esc_html__( 'Default Template: Simple form', 'multi-currency-wallet' ) . '</a>';
	}
}
add_action( 'media_buttons', 'mcwallet_media_button' );
