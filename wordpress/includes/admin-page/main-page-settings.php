<?php
/**
 * Register Settings
 */
function mcwallet_register_settings() {
	register_setting(
		'mcwallet',
		'mcwallet_tokens'
	);
}
add_action( 'admin_init', 'mcwallet_register_settings' );

/**
 * Do Setting Sectios
 */
function mcwallet_do_settings_sections() {
	?>

	<h3><?php esc_html_e( 'Add new token', 'multi-currency-wallet' );?></h3>

	<table class="form-table">
		<tbody>
			<tr>
				<th scope="row">
					<label><?php esc_html_e( 'Token standard', 'multi-currency-wallet' );?></label>
				</th>
				<td>
					<select name="standard" class="regular-text">
						<option value="erc20" <?php selected( true, true ); ?>><?php esc_html_e( 'Ethereum (ERC-20)', 'multi-currency-wallet' ); ?></option>
						<option value="bep20"><?php esc_html_e( 'Binance Smart chain (BEP-20)', 'multi-currency-wallet' ); ?></option>
						<option value="erc20matic"><?php esc_html_e( 'Polygon (ERC-20)', 'multi-currency-wallet' ); ?></option>
						<option value="erc20ftm"><?php esc_html_e( 'Fantom (ERC-20)', 'multi-currency-wallet' ); ?></option>
						<option value="erc20avax"><?php esc_html_e( 'Avalanche (ERC-20)', 'multi-currency-wallet' ); ?></option>
						<option value="erc20movr"><?php esc_html_e( 'Moonriver (ERC-20)', 'multi-currency-wallet' ); ?></option>
						<option value="erc20aurora"><?php esc_html_e( 'Aurora (ERC-20)', 'multi-currency-wallet' ); ?></option>
            <option value="phi20_v2"><?php esc_html_e( 'PHIv2 (ERC-20)', 'multi-currency-wallet' ); ?></option>
            <option value="fkw20"><?php esc_html_e( 'Forawa (FKW-20)', 'multi-currency-wallet' ); ?></option>
            <option value="phpx20"><?php esc_html_e( 'phpX (PHPX-20)', 'multi-currency-wallet' ); ?></option>
						<!-- Uncommenting when add web3 php tokens info fetcher instead of etherscal-like
							<option value="erc20one"></option>
							<option value="erc20xdai"></option>
						-->
					</select>
				</td>
			</tr>
			<tr>
				<th scope="row">
					<label><?php esc_html_e( 'Сontract address', 'multi-currency-wallet' );?></label>
				</th>
				<td>
					<input name="address" type="text" class="regular-text">
					<p class="description"><?php _e('Select from the list <a href="https://etherscan.io/tokens" target="blank">https://etherscan.io/tokens</a> or create own <a href="https://vittominacori.github.io/erc20-generator/" target="_blank">https://vittominacori.github.io/erc20-generator/</a>','multi-currency-wallet');?></p>
				</td>
			</tr>
			<tr>
				<th scope="row">
					<label><?php esc_html_e( 'Token name', 'multi-currency-wallet' );?> (<?php esc_html_e( 'not required', 'multi-currency-wallet' );?>)</label>
				</th>
				<td>
					<input name="name" type="text" class="regular-text">
					<p class="description"><?php esc_html_e( 'If the field is empty then the token name will be substituted automatically', 'multi-currency-wallet' );?></p>
				</td>
			</tr>
      <tr>
        <th scope="row">
          <label><?php esc_html_e( 'Custom fiat price ('. get_option( 'fiat_currency', 'USD' ).')')?></label>
        </th>
        <td>
          <input name="price" type="number" value="" size="7" class="textright" placeholder="" />
          <p class="description"><?php esc_html_e( 'If a token does not have a price in open sources, you can indicate it yourself', 'multi-currency-wallet' );?></p>
        </td>
      </tr>
			<tr>
				<th scope="row">
					<label><?php esc_html_e( 'Recommended exchange rate', 'multi-currency-wallet' );?></label>
				</th>
				<td>
					<input name="rate" type="number" value="" size="7" class="textright" placeholder="0">
					<p class="description"><?php esc_html_e( 'Recommended exchange rate', 'multi-currency-wallet' ); ?> <a href="https://screenshots.wpmix.net/chrome_vnv8OIFJ4oZ9QfCxrLM6CjQ05HG02mFG.png" target="_blank">(?)</a> <?php esc_html_e( 'this rate uses ONLY in the wallet, not int he exchange', 'multi-currency-wallet' );?></p>
				</td>
			</tr>
			<tr>
				<th scope="row">
					<label><?php esc_html_e( 'Icon image url', 'multi-currency-wallet' );?></label>
				</th>
				<td>
					<div class="mcwallet-form-inline">
						<input name="icon" type="text" class="large-text mcwallet-input-icon">
						<button class="button button-secondary mcwallet-load-icon"><?php esc_html_e( 'Upload icon', 'multi-currency-wallet');?></button>
					</div>
				</td>
			</tr>
			<tr>
				<th scope="row">
					<label><?php esc_html_e( 'Icon Background Color', 'multi-currency-wallet' );?></label>
				</th>
				<td>
					<input name="color" class="mcwallet-icon-bg" type="text" value="">
				</td>
			</tr>
			<tr>
				<th scope="row">
					<label><?php esc_html_e( 'How To Deposit (optional)', 'multi-currency-wallet' );?></label>
				</th>
				<td>
					<?php
					$how_deposit_content = '';
					wp_editor( $how_deposit_content, 'howdeposit', array(
						'textarea_name' => 'howdeposit',
						'textarea_rows' => 10,
						'quicktags'     => false
					) );
					?>
				</td>
			</tr>
			<tr>
				<th scope="row">
					<label><?php esc_html_e( 'How To Withdraw  (optional)', 'multi-currency-wallet' );?></label>
				</th>
				<td>
					<?php
					$how_deposit_content = '';
					wp_editor( $how_deposit_content, 'howwithdraw', array(
						'textarea_name' => 'howwithdraw',
						'textarea_rows' => 10,
						'quicktags'     => false
					) );
					?>
				</td>
			</tr>
			<tr>
				<th scope="row"></th>
				<td>
					<?php $order_value = count( get_option( 'mcwallet_tokens' ) ) + 1; ?>
					<input name="order" type="hidden" value="<?php echo esc_attr( $order_value ); ?>">
					<?php submit_button( esc_attr__( 'Add new token', 'multi-currency-wallet' ), 'primary mcwallet-add-token', 'mcwallet-add-token', false ); ?>
					<span class="spinner"></span>
				</td>
			</tr>
		</tbody>
	</table>

<?php
}
