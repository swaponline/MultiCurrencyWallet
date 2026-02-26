<?php
/**
 * Template tags
 * 
 * @package Envato API Functions
 */

/**
 * Admin page footer info markup.
 */
function mcwallet_info_bar_markup() {
	?>
	<div class="mcwallet-info-bar">
		<?php
			$info = sprintf( esc_html__( 'Plugin version: %s', 'multi-currency-wallet' ), MCWALLET_VER );
			echo esc_html( apply_filters( 'mcwallet_info_bar_content', $info ) );
		?>
	</div>
	<?php
}
