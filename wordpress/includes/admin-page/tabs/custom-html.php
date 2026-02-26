<?php
/**
 * Tab Custom Html Template
 * 
 * @package Multi Currency Wallet
 */

?>
<div class="mcwallet-shortcode-panel-row">

	<h3><?php esc_html_e( 'Custom code', 'multi-currency-wallet' ); ?></h3>

	<table class="form-table">
		<tbody>
			<tr>
				<th scope="row">
					<label><?php esc_html_e( 'Before close tag &lt;/head&gt;', 'multi-currency-wallet' );?></label>
				</th>
				<td>
					<textarea name="mcwallet_head_code" class="large-text" rows="10"><?php echo get_option( 'mcwallet_head_code' ); ?></textarea>
				</td>
			</tr>
			<tr>
				<th scope="row">
					<label><?php esc_html_e( 'After open tag &lt;body&gt;', 'multi-currency-wallet' );?></label>
				</th>
				<td>
					<textarea name="mcwallet_body_code" class="large-text" rows="10"><?php echo get_option( 'mcwallet_body_code' ); ?></textarea>
				</td>
			</tr>
			<tr>
				<th scope="row">
					<label><?php esc_html_e( 'Before close tag &lt;/body&gt;', 'multi-currency-wallet' ); ?></label>
				</th>
				<td>
					<textarea name="mcwallet_footer_code" class="large-text" rows="10"><?php echo get_option( 'mcwallet_footer_code' ); ?></textarea>
				</td>
			</tr>
			<tr>
				<th scope="row"></th>
				<td>
					<?php submit_button( esc_attr__( 'Update options', 'multi-currency-wallet' ), 'primary mcwallet-update-options', 'mcwallet-update-options', false ); ?>
					<span class="spinner"></span>
				</td>
			</tr>
		</tbody>
	</table><!-- .form-table -->

</div><!-- .mcwallet-shortcode-panel-row -->
