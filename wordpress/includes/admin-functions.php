<?php
/**
 * Admin Functions
 * 
 * @package Multi Currency Wallet
 */

/**
 * Redefine logout
 */

/**
 * Admin Page Tabs
 */
function mcwallet_admin_page_tabs( $tabs = array() ) {
	$tabs = array(
		'tokens-list'    => esc_html__( 'Tokens list', 'multi-currency-wallet' ),
		'options'        => esc_html__( 'Options', 'multi-currency-wallet' ),
		'custom-html'    => esc_html__( 'Custom HTML', 'multi-currency-wallet' ),
		'strings-editor' => esc_html__( 'Strings Editor', 'multi-currency-wallet' ),
		'edit-faq'       => esc_html__( 'Edit FAQ', 'multi-currency-wallet' ),
		'edit-menu'      => esc_html__( 'Edit Menu items', 'multi-currency-wallet' ),
	);
	return apply_filters( 'mcwallet_admin_page_tabs', $tabs );
}

/**
 * Admin page render faq rows
 */
function mcwallet_render_faq_rows( $rows, $type ) {
	if ( count( $rows ) ) {
		foreach ($rows as $k => $own_faq) {
			?>
			<tr class="mcwallet-own-faq-row">
				<td>
					<input type="text" data-mcwallet-target="mcwallet-faq-title" value="<?php echo esc_attr( $own_faq['title'] ); ?>">
				</td>
				<td>
					<textarea data-mcwallet-target="mcwallet-faq-content"><?php echo esc_html( $own_faq['content'] ); ?></textarea>
				</td>
				<td>
					<a href="#" data-mcwallet-action="mcwallet_faq_move_up">[<?php esc_html_e( 'Up', 'multi-currency-wallet' ); ?>]</a>
					<a href="#" data-mcwallet-action="mcwallet_faq_move_down">[<?php esc_html_e( 'Down', 'multi-currency-wallet' ); ?>]</a>
					<a href="#" data-mcwallet-action="mcwallet_faq_remove">[<?php esc_html_e( 'Delete', 'multi-currency-wallet' ); ?>]</a>
				</td>
			</tr>
			<?php
		}
	}
	?>
	<tr class="<?php echo ( count( $rows) ) ? '-mc-hidden' : ''; ?>" data-mcwallet-role="empty-row">
		<td colspan="3" align="center"><?php esc_html_e( 'Empty', 'multi-currency-wallet' ); ?></td>
	</tr>
	<?php
}

/**
 * Admin page render menu rows
 */
function mcwallet_render_menu_rows( $rows, $type ) {
	if ( count( $rows ) ) {
		foreach ( $rows as $k => $own_menu ) {
			?>
			<tr class="mcwallet-own-menu-row">
				<td>
					<input type="text" data-mcwallet-target="mcwallet-menu-title" value="<?php echo esc_attr( $own_menu['title'] ); ?>">
				</td>
				<td>
					<input type="text" data-mcwallet-target="mcwallet-menu-link" value="<?php echo esc_attr( $own_menu['link'] ); ?>">
				</td>
				<td>
					<input type="checkbox" data-mcwallet-target="mcwallet-menu-newwindow" <?php echo ( isset($own_menu['newwindow'] ) and $own_menu['newwindow'] ) ? 'checked' : ''; ?>>
				</td>
				<td>
					<a href="#" data-mcwallet-action="mcwallet_menu_move_up">[<?php esc_html_e( 'Up', 'multi-currency-wallet' ); ?>]</a>
					<a href="#" data-mcwallet-action="mcwallet_menu_move_down">[<?php esc_html_e( 'Down', 'multi-currency-wallet' ); ?>]</a>
					<a href="#" data-mcwallet-action="mcwallet_menu_remove">[<?php esc_html_e( 'Delete', 'multi-currency-wallet' ); ?>]</a>
				</td>
			</tr>
			<?php
		}
	}
	?>
	<tr class="<?php echo ( count( $rows ) ) ? '-mc-hidden' : ''; ?>" data-mcwallet-role="empty-row">
		<td colspan="4" align="center"><?php esc_html_e( 'Empty', 'multi-currency-wallet' ); ?></td>
	</tr>
	<?php
}