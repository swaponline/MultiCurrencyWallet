<?php
/**
 * Add License page to submenu
 */
function mcwallet_license_submenu_page() {
	add_submenu_page(
		'mcwallet',
		esc_html__( 'License', 'multi-currency-wallet' ),
		esc_html__( 'License', 'multi-currency-wallet' ),
		'manage_options',
		'mcwallet-license',
		'mcwallet_license_page',
		2
	);

	//call register settings function
	add_action( 'admin_init', 'mcwallet_register_settings_license' );
}
add_action('admin_menu', 'mcwallet_license_submenu_page', 11 );


function mcwallet_register_settings_license() {
	//register our settings
	register_setting( 'mcwallet-settings-license', 'mcwallet_purchase_code', 'mcwallet_sanitize_purchase_code' );
}

/**
 * Widget Page
 */
function mcwallet_license_page() {

?>

<div class="wrap">
	<h2><?php echo get_admin_page_title(); ?></h2>
	<?php settings_errors(); ?>

	<div class="mcwallet-welcome-panel">
		<div class="mcwallet-welcome-panel-content">

			<h3><?php esc_html_e( 'License Activation', 'multi-currency-wallet' ); ?></h3>
			<p><?php esc_html_e( 'The active support gives access to the latest version from the developer&#039;s server. An expired license DOES NOT AFFECT the plugin&#039;s functionality. You still can download versions from codecanyon (but updates are released less often there).', 'multi-currency-wallet' ); ?></p>
			<?php if ( get_option( 'mcwallet_purchase_code' ) ) { ?>
				<?php if ( mcwallet_is_supported() ) {
					$d = new DateTime( get_option( 'mcwallet_license_supported_until' ) );

					$date_until = $d->format( 'Y-m-d H:i'); // 012345
					?>
					<p><?php esc_html_e( 'Your support is valid until:', 'multi-currency-wallet' ); ?> <strong><?php echo esc_html( $date_until ); ?></strong></p>
				<?php } else { ?>
					<p><?php esc_html_e( 'Your support is expired, please renew the plugin license.', 'multi-currency-wallet' ); ?></p>
				<?php } ?>
			<?php } ?>

			<form method="post" action="options.php">

				<?php settings_fields( 'mcwallet-settings-license' ); ?>
				<?php do_settings_sections( 'mcwallet-settings-license' ); ?>

				<table class="form-table">
					<tbody>
						<tr>
							<th scope="row">
								<label><?php esc_html_e( 'Purchase Code', 'multi-currency-wallet' );?></label>
							</th>
							<td>
								<input name="mcwallet_purchase_code" type="text" class="regular-text" value="<?php echo esc_attr( get_option( 'mcwallet_purchase_code' ) );?>" placeholder="00000000-0000-0000-0000-000000000000">
							</td>
						</tr>
						<?php if ( ! get_option( 'mcwallet_purchase_code' ) ) { ?>
							<tr>
								<th scope="row">
									<label><?php esc_html_e( 'Your Email', 'multi-currency-wallet' );?></label>
								</th>
								<td>
									<input name="mcwallet_email" type="text" class="regular-text" value="<?php echo esc_attr( get_option( 'admin_email' ) );?>">
								</td>
							</tr>
						<?php } ?>
						<tr>
							<th scope="row"></th>
							<td>
								<?php
									$button_text = esc_attr__( 'Activate License', 'multi-currency-wallet' );
									if ( get_option( 'mcwallet_purchase_code' ) ) {
										$button_text = esc_attr__( 'Update License', 'multi-currency-wallet' );
									}
									submit_button( $button_text, 'primary', false );
								?>
							</td>
						</tr>
					</tbody>
				</table><!-- .form-table -->
			</form>

		</div>
	</div>
</div>

<?php
}
