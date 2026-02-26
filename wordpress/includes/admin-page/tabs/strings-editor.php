<?php
/**
 * Tab String Editor Template
 * 
 * @package Multi Currency Wallet
 */

?>
<div class="mcwallet-shortcode-panel-row">
	<div class="mcwallet-strings-section">

		<div class="mcwallet-strings-header">
			<h3><?php esc_html_e( 'Original String', 'multi-currency-wallet' ); ?></h3>
			<h3><?php esc_html_e( 'Replacement String', 'multi-currency-wallet' ); ?></h3>
		</div>

		<div class="mcwallet-strings-body">
			<div class="mcwallet-strings-row">
				<div class="mcwallet-string-col">
					<strong><?php esc_html_e( 'Splash Screen', 'multi-currency-wallet' ); ?> &quot;</strong>
					<span><?php esc_html_e( 'Loading...', 'multi-currency-wallet' ); ?></span>
					<strong>&quot;</strong>
				</div>
				<div class="mcwallet-string-col">
					<input type="text" name="string_splash_loading" class="large-text" value="<?php
						echo esc_attr( get_option( 'string_splash_loading', __( 'Loading...', 'multi-currency-wallet' ) ) );
					?>">
				</div>
				<div class="mcwallet-string-action">
					<span class="dashicons dashicons-trash" style="visibility: hidden"></span>
				</div>
			</div>
			<div class="mcwallet-strings-row">
				<div class="mcwallet-string-col">
					<strong><?php esc_html_e( 'Splash Screen first loading', 'multi-currency-wallet' ); ?> &quot;</strong>
					<span><?php esc_html_e( 'Please wait while the application is loading', 'multi-currency-wallet' ); ?></span>
					<strong>&quot;</strong>
				</div>
				<div class="mcwallet-string-col">
					<input type="text" name="string_splash_first_loading" class="large-text" value="<?php
						echo esc_attr( wp_unslash( get_option( 'string_splash_first_loading', __( 'Please wait while the application is loading, it may take one minute...', 'multi-currency-wallet' ) ) ) );
					?>">
				</div>
				<div class="mcwallet-string-action">
					<span class="dashicons dashicons-trash" style="visibility: hidden"></span>
				</div>
			</div>
			<?php
			$strings = get_option( 'mcwallet_strings');

			if ( $strings ) {
				foreach ( $strings as $key => $string ) {
					$string_search  = isset( $string[0] ) ? $string[0] : '';
					$string_replace = isset( $string[1] ) ? $string[1] : '';
				?>
				<div class="mcwallet-strings-row">
					<div class="mcwallet-string-col">
						<input type="text" name="<?php echo esc_attr( $key ); ?>" class="large-text mcwallet-string-input" value="<?php echo esc_attr( wp_unslash( $string_search ) ); ?>">
					</div>
					<div class="mcwallet-string-col">
						<input type="text" name="<?php echo esc_attr( $key ); ?>" class="large-text mcwallet-string-input" value="<?php echo esc_attr( wp_unslash( $string_replace ) ); ?>">
					</div>
					<div class="mcwallet-string-action">
						<a href="#" class="button-link-delete mcwallet-remove-string"><span class="dashicons dashicons-trash"></span></a>
					</div>
				</div>
				<?php
				}
			} else {
			?>
				<div class="mcwallet-strings-empty-row"><?php esc_html_e( 'no strings', 'multi-currency-wallet' ); ?></div>
			<?php } ?>
		</div>

		<div class="mcwallet-strings-footer">
			<span>
				<?php submit_button( esc_attr__( 'Update options', 'multi-currency-wallet' ), 'primary mcwallet-update-options', 'mcwallet-update-options', false ); ?>
				<span class="spinner"></span>
			</span>
			<button class="button button-secondary mcwallet-add-string"><?php esc_html_e( 'Add string', 'multi-currency-wallet' ); ?></button>
		</div>

		<div class="mcwallet-strings-info">
			<?php esc_html_e( 'How it works:',  'multi-currency-wallet' );?> <a href="https://youtu.be/NB1bvM7ZE3w" target="_blank">https://youtu.be/NB1bvM7ZE3w</a>
		</div>

	</div>
</div><!-- .mcwallet-shortcode-panel-row -->