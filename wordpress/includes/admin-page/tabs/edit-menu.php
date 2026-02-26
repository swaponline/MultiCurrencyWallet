<?php
/**
 * Tab Edit Menu Template
 * 
 * @package Multi Currency Wallet
 */

?>
<div class="mcwallet-shortcode-panel-row">
	<?php
		$own_before_menus = get_option( 'mcwallet_own_before_menus' , array() );
		$own_after_menus = get_option( 'mcwallet_own_after_menus', array() );
	?>
	<h3><?php esc_html_e( 'Edit menu items', 'multi-currency-wallet' );?></h3>

	<table class="mcwallet-menu-list wp-list-table widefat striped">
		<thead>
			<tr>
				<th width="25%"><?php esc_html_e('Title', 'multi-currency-wallet'); ?></th>
				<th><?php esc_html_e('Link', 'multi-currency-wallet'); ?></th>
				<th width="200px"><?php esc_html_e('New window?', 'multi-currency-wallet'); ?></th>
				<th width="250px"><?php esc_html_e('Actions', 'multi-currency-wallet'); ?></th>
			</tr>
		</thead>
		<tbody id="mcwallet-menu-before" data-mcwallet-role="menu-before-holder">
			<?php mcwallet_render_menu_rows( $own_before_menus, 'before' ); ?>
		</tbody>
		<tbody>
			<tr>
				<td colspan="4" class="mcwallet-menu-message">
					<?php esc_html_e('Default menu items (&quot;Wallet&quot;, &quot;Transactions&quot;, &quot;Exchange&quot;)', 'multi-currency-wallet' ); ?>
				</td>
			</tr>
		</tbody>
		<tbody id="mcwallet-menu-after" data-mcwallet-role="menu-after-holder">
			<?php mcwallet_render_menu_rows( $own_after_menus, 'after' ); ?>
		</tbody>
		<thead>
			<tr>
				<td colspan="4">
					<h3><?php esc_html_e( 'Add new menu item', 'multi-currency-wallet' );?></h3>
				</td>
			</tr>
		</thead>
		<tbody>
			<tr class="mcwallet-own-menu-row">
				<td>
					<input type="text" data-mcwallet-role="mcwallet-addmenu-title" value="">
				</td>
				<td>
					<input type="text" data-mcwallet-role="mcwallet-addmenu-link" value="">
				</td>
				<td>
					<input type="checkbox" data-mcwallet-role="mcwallet-addmenu-newwindow">
				</td>
				<td>
					<a href="#" data-mcwallet-action="mcwallet_menu_add">[<?php esc_html_e( 'Add menu', 'multi-currency-wallet' ); ?>]</a>
				</td>
			</tr>
		</tbody>
		<tbody class="-mc-hidden" data-mcwallet-role="menu_template">
			<tr class="mcwallet-own-menu-row">
				<td>
					<input type="text" data-mcwallet-target="mcwallet-menu-title" value="" />
				</td>
				<td>
					<input type="text" data-mcwallet-target="mcwallet-menu-link" value="" />
				</td>
				<td>
					<input type="checkbox" data-mcwallet-target="mcwallet-menu-newwindow" />
				</td>
				<td>
					<a href="#" data-mcwallet-action="mcwallet_menu_move_up">[<?php esc_html_e( 'Up', 'multi-currency-wallet' ); ?>]</a>
					<a href="#" data-mcwallet-action="mcwallet_menu_move_down">[<?php esc_html_e( 'Down', 'multi-currency-wallet' ); ?>]</a>
					<a href="#" data-mcwallet-action="mcwallet_menu_remove">[<?php esc_html_e( 'Delete', 'multi-currency-wallet' ); ?>]</a>
				</td>
			</tr>
		</tbody>
	</table>

	<table class="form-table">
		<tr>
			<td>
				<span class="mcwallet-submit-group">
					<input type="submit" name="mcwallet-update-menu" id="mcwallet-update-menu" class="button button-primary" value="<?php esc_attr_e( 'Update menu items', 'multi-currency-wallet' ); ?>" >
					<span class="spinner"></span>
				</span>
			</td>
		</tr>
	</table>

</div>
