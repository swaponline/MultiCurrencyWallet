<?php
/**
 * MCWallet Widget Template
 *
 * @package MCWallet
 */

if ( get_option( 'mcwallet_is_logged' ) && ! is_user_logged_in() ) {
	auth_redirect();
}

/** Action before template load */
do_action( 'mcwallet_before_template' );

?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<?php wp_head(); ?>
<?php mcwallet_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php mcwallet_body_open(); ?>

	<?php if ( ! apply_filters( 'mcwallet_disable_front_template', false ) ) { ?>

		<div id="root"></div><!-- #root -->
		<!-- Loader before any JS -->
		<div id="wrapper_element" class="overlay">
			<div class="center">
				<div id="loader" class="loader">
					<img id="loaderImg" class="logo-light" src="<?php echo esc_url( mcwallet_logo_url() ); ?>" alt="<?php echo esc_attr( get_bloginfo( 'name' ) ); ?>">
					<img id="loaderImg" class="logo-dark" src="<?php echo esc_url( mcwallet_dark_logo_url() ); ?>" alt="<?php echo esc_attr( get_bloginfo( 'name' ) ); ?>">
				</div>
				<div id="beforeJSTip" class="tips">
					<?php echo esc_html( get_option( 'string_splash_loading', __( 'Loading...', 'multi-currency-wallet' ) ) ); ?>
				</div>
			</div>
			<div class="mb-4 show-on-fail-ls d-none" id="onFailLocalStorageMessage">
				<span><?php esc_html_e( 'Not every function works In this window, please open new tab.', 'multi-currency-wallet' ); ?>
					<?php esc_html_e( 'If the error will repeat please contact admin', 'multi-currency-wallet' ); ?>
					<br>
					<a href="https://t.me/swaponlinebot">https://t.me/swaponlinebot</a>
				</span>
				<button class="btn btn-primary btc-open-in-new-tab">
					<a href="https://wallet.wpmix.net" id="onFailLocalStorageLink" target="_blank">
						<?php esc_html_e( 'Open App in new tab', 'multi-currency-wallet' ); ?>
					</a>
				</button>
			</div>
			<div id="usersInform" class="usersInform"></div>
		</div>

		<div id="portal"></div>

	<?php } ?>

	<?php mcwallet_footer(); ?>

<?php
if ( is_customize_preview() ) {
	wp_footer();
}
?>
</body>
</html>
