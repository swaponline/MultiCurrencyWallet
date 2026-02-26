<?php
/**
 * Tab Edit Faq Template
 * 
 * @package Multi Currency Wallet
 */

?>
<div class="mcwallet-shortcode-panel-row">
	<?php
		$own_before_faqs = get_option( 'mcwallet_own_before_faqs' , array() );
		$own_after_faqs  = get_option( 'mcwallet_own_after_faqs', array() );
	?>
	<h3><?php esc_html_e( 'Edit FAQ section', 'multi-currency-wallet' ); ?></h3>

	<table class="mcwallet-faq-list wp-list-table widefat striped">
		<thead>
			<tr>
				<th width="25%"><?php esc_html_e('Caption', 'multi-currency-wallet'); ?></td>
				<th><?php esc_html_e('Content', 'multi-currency-wallet'); ?></th>
				<th width="250px"><?php esc_html_e('Actions', 'multi-currency-wallet'); ?></th>
			</tr>
		</thead>
		<tbody id="mcwallet-faq-before" data-mcwallet-role="faq-before-holder">
			<?php mcwallet_render_faq_rows( $own_before_faqs, 'before' ); ?>
		</tbody>
		<tbody>
			<tr>
				<td colspan="3" class="mcwallet-faq-message">
					<?php esc_html_e( 'Default FAQ block (&quot;How are my private keys stored&quot;, &quot;What are the fees involved&quot;, &quot;Why minning fee is to high&quot;)', 'multi-currency-wallet' ); ?>
				</td>
			</tr>
		</tbody>
		<tbody id="mcwallet-faq-after" data-mcwallet-role="faq-after-holder">
			<?php mcwallet_render_faq_rows( $own_after_faqs, 'after' ); ?>
		</tbody>
		<thead>
			<tr>
				<td colspan="3">
					<h3><?php esc_html_e( 'Add new FAQ section', 'multi-currency-wallet' );?></h3>
				</td>
			</tr>
		</thead>
		<tbody>
			<tr class="mcwallet-own-faq-row">
				<td>
					<input type="text" data-mcwallet-role="mcwallet-addfaq-title" value="" />
				</td>
				<td>
					<textarea data-mcwallet-role="mcwallet-addfaq-content"></textarea>
				</td>
				<td>
					<a href="#" data-mcwallet-action="mcwallet_faq_add">[<?php esc_html_e( 'Add FAQ', 'multi-currency-wallet' ); ?>]</a>
				</td>
			</tr>
		</tbody>
		<tbody class="-mc-hidden" data-mcwallet-role="faq_template">
			<tr class="mcwallet-own-faq-row">
				<td>
					<input type="text" data-mcwallet-target="mcwallet-faq-title" value="" />
				</td>
				<td>
					<textarea data-mcwallet-target="mcwallet-faq-content"></textarea>
				</td>
				<td>
					<a href="#" data-mcwallet-action="mcwallet_faq_move_up">[<?php esc_html_e( 'Up', 'multi-currency-wallet' ); ?>]</a>
					<a href="#" data-mcwallet-action="mcwallet_faq_move_down">[<?php esc_html_e( 'Down', 'multi-currency-wallet' ); ?>]</a>
					<a href="#" data-mcwallet-action="mcwallet_faq_remove">[<?php esc_html_e( 'Delete', 'multi-currency-wallet' ); ?>]</a>
				</td>
			</tr>
		</tbody>
	</table>

	<table class="form-table">
		<tr>
			<td>
				<span class="mcwallet-submit-group">
					<input type="submit" name="mcwallet-update-faq" id="mcwallet-update-faq" class="button button-primary" value="<?php esc_attr_e( 'Update FAQ', 'multi-currency-wallet' ); ?>">
					<span class="spinner"></span>
				</span>
			</td>
		</tr>
	</table>

</div>
