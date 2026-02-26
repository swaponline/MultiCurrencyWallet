<?php
/**
 * User Panel
 * 
 * @package Multi Currency Wallet
 */

// Add the checkbox to user profile home
function mcwallet_show_extra_profile_fields( $user ) {

	$data   = get_user_meta( $user->ID, '_mcwallet_data' );
	$backup = get_user_meta( $user->ID, '_mcwallet_backup' );

	?>
	<br>
	<h2><?php esc_html_e( 'Wallet info', 'multi-currency-wallet' ); ?></h2>

	<div class="notice notice-error inline notice-alt">
		<p><?php esc_html_e( 'Don\'t send funds to these addresses! Ask address from the user directly, be sure he has saved his 12 words seed phrase!', 'multi-currency-wallet' ); ?></p>
	</div>

	<?php if ( isset( $data[0] ) ) { ?>
		<table class="form-table mcwallet-form-table widefat striped" role="presentation">
			<tbody>
				<?php foreach ( $data[0] as $k => $item ) { ?>
					<?php
					if ( $k === 'WPuserUid' ) {
						continue;
					}
					?>
					<tr class="user-description-wrap">
						<th><?php echo esc_html( $k ); ?></th>
						<td>
							<?php if ( is_array( $item ) ) { ?>
								<?php foreach ( $item as $j => $el ) { ?>
									<div><strong><?php echo esc_html( $j ); ?>:</strong> <?php echo esc_html( $el ); ?></div>
								<?php } ?>
								</ul>
							<?php } ?>
						</td>
					</tr>
				<?php } ?>
			</tbody>
		</table>
	<?php }

	// debug info.
	if ( get_option( 'mcwallet_remember_userwallet' ) ) { ?>
		<h2><?php esc_html_e( 'Backup', 'multi-currency-wallet' ); ?></h2>
		<table class="form-table mcwallet-form-table widefat striped" role="presentation">
			<tbody>
				<tr class="user-description-wrap">
					<th><?php esc_html_e( 'Backup Info', 'multi-currency-wallet' ); ?></th>
					<td>
						<?php if ( $backup ) { ?>
							<pre><?php print_r( $backup ); ?></pre>
						<?php } else { ?>
							<p><?php esc_html_e( 'This parameter is currently empty.', 'multi-currency-wallet' ); ?></p>
						<?php } ?>
					</td>
				</tr>
			</tbody>
		</table>
	<?php
	}

}
add_action( 'show_user_profile', 'mcwallet_show_extra_profile_fields' );
add_action( 'edit_user_profile', 'mcwallet_show_extra_profile_fields' );
