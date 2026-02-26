<?php
/**
 * Tab Options Template
 * 
 * @package Multi Currency Wallet
 */

$disable_fee = apply_filters( 'mcwallet_disable_fee', true );

?>
<div class="mcwallet-shortcode-panel-row">

	<h3><?php esc_html_e( 'Options', 'multi-currency-wallet' );?></h3>

	<table class="form-table">
		<tbody>
			<tr>
				<th scope="row"></th>
				<td>
					<label for="mcwallet_use_testnet">
						<input name="use_testnet" type="checkbox" id="mcwallet_use_testnet" <?php checked( 'true', get_option( 'mcwallet_use_testnet' ) ); ?>>
						<?php esc_html_e( 'Use Testnet blockchain.', 'multi-currency-wallet' );?>
					</label>
				</td>
			</tr>
      <tr>
        <th scope="row">
          <?php esc_html_e( 'Enable multitab', 'multi-currency-wallet' ); ?>
        </th>
        <td>
          <label for="mcwallet_enable_multitab">
            <input name="mcwallet_enable_multitab" type="checkbox" id="mcwallet_enable_multitab" <?php checked( 'true', get_option( 'mcwallet_enable_multitab', 'false') ); ?>>
            <?php esc_html_e( 'Allow to open wallet in multiple tabs' , 'multi-currency-wallet' ); ?>
          </label>
        </td>
      </tr>
			<tr>
				<th scope="row">
					<?php esc_html_e( 'Enable sending statistics to plugin developers', 'multi-currency-wallet' );?>
				</th>
				<td>
					<label for="mcwallet_enable_stats">
						<input name="statistic_enabled" type="checkbox" id="mcwallet_enable_stats" <?php checked( 'false', get_option( 'mcwallet_enable_stats' ) ); ?>>
						<?php esc_html_e( 'Enable statistics.', 'multi-currency-wallet' );?>
					</label>
				</td>
			</tr>
			<tr>
				<th scope="row">
					<label><?php esc_html_e( 'Wallet front page title', 'multi-currency-wallet' );?></label>
				</th>
				<td>
					<input name="mcwallet_page_title" type="text" class="regular-text" value="<?php echo esc_attr( get_option( 'mcwallet_page_title', esc_html__( 'Hot Wallet with p2p exchange', 'multi-currency-wallet' ) ) );?>">
				</td>
			</tr>
			<tr>
				<th scope="row">
					<label><?php esc_html_e( 'Logo url', 'multi-currency-wallet' );?></label>
				</th>
				<td>
					<div class="mcwallet-form-inline">
						<input name="logo_url" type="text" value="<?php echo esc_attr( mcwallet_logo_url() );?>" class="large-text mcwallet-input-logo">
						<button class="button button-secondary mcwallet-load-logo"><?php esc_html_e( 'Upload logo', 'multi-currency-wallet');?></button>
					</div>
				</td>
			</tr>
			<tr>
				<th scope="row">
					<label><?php esc_html_e( 'Dark Logo url', 'multi-currency-wallet' );?></label>
				</th>
				<td>
					<div class="mcwallet-form-inline">
						<input name="dark_logo_url" type="text" value="<?php echo esc_attr( mcwallet_dark_logo_url() );?>" class="large-text mcwallet-input-dark-logo">
						<button class="button button-secondary mcwallet-load-dark-logo"><?php esc_html_e( 'Upload logo', 'multi-currency-wallet');?></button>
					</div>
				</td>
			</tr>
			<tr>
				<th scope="row">
					<label><?php esc_html_e( 'Logo link', 'multi-currency-wallet' );?></label>
				</th>
				<td>
					<input name="logo_link" type="text" value="<?php echo esc_attr( get_option('mcwallet_logo_link', get_home_url( '/' ) ) );?>" class="large-text">
				</td>
			</tr>
			<tr>
				<th scope="row">
					<label><?php esc_html_e( 'Exchange mode', 'multi-currency-wallet' );?></label>
				</th>
				<td>
					<?php
						$exchangeModes = array(
							'only_quick'  => esc_html__( 'Only quick swap', 'multi-currency-wallet' ),
							'only_atomic' => esc_html__( 'Only atomic swap', 'multi-currency-wallet' ),
							'quick'       => esc_html__( 'Default is quick swap', 'multi-currency-wallet' ),
							'atomic'      => esc_html__( 'Default is atomic swap', 'multi-currency-wallet' ),
						);
						$selected_exchange_mode = get_option( 'selected_exchange_mode' );
						$selected_exchange_mode = $selected_exchange_mode ? $selected_exchange_mode : 'only_quick';
					?>
					<select name="selected_exchange_mode" id="selected_exchange_mode" class="regular-text">
						<?php foreach( $exchangeModes as $key => $title ) { ?>
							<option value="<?php echo esc_attr( $key ); ?>" <?php selected( $key, $selected_exchange_mode ); ?>><?php echo esc_html( $title ); ?></option>
						<?php } ?>
					</select>
				</td>
			</tr>

			<tr>
				<th scope="row">
					<label><?php esc_html_e( 'Quick swap mode', 'multi-currency-wallet' );?></label>
				</th>
				<td>
					<?php
						$quickswapModes = array(
							'aggregator'      => esc_html__( 'Default is 0x.org aggregator', 'multi-currency-wallet' ),
							'source'          => esc_html__( 'Default is source', 'multi-currency-wallet' ),
							'only_aggregator' => esc_html__( 'Only 0x.org aggregator', 'multi-currency-wallet' ),
							'only_source'     => esc_html__( 'Only source', 'multi-currency-wallet' ),
						);
						$selected_quickswap_mode = get_option( 'selected_quickswap_mode' );
						$selected_quickswap_mode = $selected_quickswap_mode ? $selected_quickswap_mode : 'only_quick';
					?>
					<select name="selected_quickswap_mode" id="selected_quickswap_mode" class="regular-text">
						<?php foreach($quickswapModes as $key => $title) { ?>
							<option value="<?php echo esc_attr( $key ); ?>" <?php echo ($key === $selected_quickswap_mode) ? 'selected' : ''?>><?php echo esc_html( $title ); ?></option>
						<?php } ?>
					</select>
				</td>
			</tr>

			<tr>
				<th scope="row">
					<label><?php esc_html_e( 'Quick swap API key', 'multi-currency-wallet' );?></label>
					<p class="desciption">
            <?php esc_html_e( "This type of exchange uses a 0x aggregator. Therefore you need to register and get an API key for it to work:", 'multi-currency-wallet' ); ?> <a target=_blank href="https://dashboard.0x.org/create-account">?</a>
          </p>
				</th>
				<td>
					<input name="zerox_api_key" type="text" class="large-text" value="<?php echo esc_attr( get_option( 'zerox_api_key', '') );?>">
				</td>
			</tr>
			
			<tr>
				<th scope="row">
					<label><?php esc_html_e( 'Default language', 'multi-currency-wallet' );?></label>
				</th>
				<td>
					<?php
						$availableLanguages = array(
							'en' => esc_html__( 'English', 'multi-currency-wallet' ),
							'ru' => esc_html__( 'Russian', 'multi-currency-wallet' ),
							'nl' => esc_html__( 'Dutch', 'multi-currency-wallet' ),
							'es' => esc_html__( 'Spanish', 'multi-currency-wallet' ),
							'de' => esc_html__( 'German', 'multi-currency-wallet' ),
							'pl' => esc_html__( 'Polish', 'multi-currency-wallet' ),
							'pt' => esc_html__( 'Portuguese', 'multi-currency-wallet' ),
							'ko' => esc_html__( 'Korean', 'multi-currency-wallet' ),
              'ar' => esc_html__( 'Arabic', 'multi-currency-wallet' ),
              'fa' => esc_html__( 'Farsi', 'multi-currency-wallet' ),
						);
						$default_language = get_option( 'default_language' );
						$default_language = $default_language ? $default_language : 'en';
					?>
					<select name="default_language" id="default_language" class="regular-text">
						<?php foreach( $availableLanguages as $key => $title ) { ?>
							<option value="<?php echo esc_attr( $key ); ?>" <?php selected( $key, $default_language ); ?>><?php echo esc_html( $title ); ?></option>
						<?php } ?>
					</select>
				</td>
			</tr>
			<tr>
				<th scope="row"></th>
				<td>
					<label for="mcwallet_exchange_disabled">
						<input name="exchange_disabled" type="checkbox" id="mcwallet_exchange_disabled" <?php checked( 'true', get_option( 'mcwallet_exchange_disabled' ) ); ?>>
						<?php esc_html_e( 'Disable exchange', 'multi-currency-wallet' );?>
					</label>
				</td>
			</tr>
			<tr>
				<th scope="row">
					<label><?php esc_html_e( 'Permalink', 'multi-currency-wallet' );?></label>
				</th>
				<td>
					<code><?php echo esc_url( home_url('/') );?></code>
					<input name="page_slug" type="text" value="<?php echo esc_attr( mcwallet_page_slug() );?>" class="regular-text code mcwallet-page-slug" <?php disabled( get_option( 'mcwallet_is_home' ), 'true' ); ?>>
					<code>/</code>
					<a href="<?php echo mcwallet_page_url();?>" class="button mcwallet-button-url<?php if( get_option( 'mcwallet_is_home' ) ) { echo ' disabled';}?>" target="_blank"><?php esc_html_e( 'View page', 'multi-currency-wallet' );?></a>
				</td>
			</tr>
			<tr>
				<th scope="row">
					<label><?php esc_html_e( 'Use as home page', 'multi-currency-wallet' );?></label>
				</th>
				<td>
					<label for="mcwallet_is_home">
						<input name="is_home" type="checkbox" id="mcwallet_is_home" value="true" <?php checked( 'true', get_option( 'mcwallet_is_home' ) ); ?>>
						<?php esc_html_e( 'Use Multi Currency Wallet template as home page.', 'multi-currency-wallet' );?>
					</label>
				</td>
			</tr>
			<tr>
				<th scope="row">
					<label><?php esc_html_e( 'Wallet page access', 'multi-currency-wallet' );?></label>
				</th>
				<td>
					<label for="mcwallet_is_logged">
						<input name="is_logged" type="checkbox" id="mcwallet_is_logged" value="true" <?php checked( 'true', get_option( 'mcwallet_is_logged' ) ); ?>>
						<?php esc_html_e( 'Users must be registered and logged for access wallet.', 'multi-currency-wallet' );?>
					</label>
          <div class="desciption">
            <?php esc_html_e( "Without this option, &quot;Save private information&quot; does not work." ); ?>
          </div>
          <p class="mcwallet-info-block" id="mcwallet-save_private_keys-off" style="display: none">
            <?php esc_html_e( "&quot;Save private information&quot; option was turned off automatically", 'multi-currency-wallet' );?>
          </p>
          <p class="mcwallet-info-block" id="mcwallet-save_private_keys-on" style="display: none">
            <?php esc_html_e( "&quot;Save private information&quot; option turned on automatically", 'multi-currency-wallet' );?>
          </p>
				</td>
			</tr>
			<tr>
				<th scope="row"></th>
				<td>
					<label for="mcwallet_show_all_enabled_wallets">
						<input name="show_all_enabled_wallets" type="checkbox" id="mcwallet_show_all_enabled_wallets" <?php checked( 'true', get_option( 'mcwallet_show_all_enabled_wallets' ) ); ?>>
						<?php esc_html_e( "Show all enabled wallets after save or restore seed phrase (12 words)", 'multi-currency-wallet' );?>
					</label>
				</td>
			</tr>
			<tr>
				<th scope="row"></th>
				<td>
					<label for="mcwallet_remember_userwallet">
						<input name="remeber_userwallet" type="checkbox" id="mcwallet_remember_userwallet" <?php checked( 'true', get_option( 'mcwallet_remember_userwallet' ) ); ?>>
						<?php esc_html_e( "Save private information (keys, etc..) in user's profile (Custodial mode)", 'multi-currency-wallet' );?>
					</label>
          <p class="desciption">
            <?php esc_html_e( "For this setting to work, the &quot;Users must be registered and logged&quot; option must be enabled.", 'multi-currency-wallet' );?>
          </p>
          <p class="mcwallet-info-block" id="mcwallet_must-logged-in-on" style="display: none">
            <?php esc_html_e( "&quot;Users must be registered and logged&quot; option turned on automatically", 'multi-currency-wallet' );?>
          </p>
				</td>
			</tr>
			<tr>
				<th scope="row">
          <label><?php esc_html_e( 'Native coins settings', 'multi-currency-wallet' );?></label>
        </th>
				<td>
					<label for="mcwallet_disable_internal">
						<input name="disable_internal" type="checkbox" id="mcwallet_disable_internal" <?php checked( 'true', get_option( 'mcwallet_disable_internal' ) ); ?>>
						<?php esc_html_e( 'Disable ALL internal wallets. User will use metamask or walletconnect', 'multi-currency-wallet' );?>
					</label>
				</td>
			</tr>
			<?php foreach ( mcwallet_supperted_chains() as $key => $title) { // Disable wallets block ?>
				<tr>
					<th scope="row"></th>
						<td>
							<label for="mcwallet_<?php echo esc_attr( $key ); ?>_disabled">
							<input name="<?php echo esc_attr( $key ); ?>_disabled" type="checkbox" data-option-target="disabled_wallet" data-chain="<?php echo esc_attr( $key ); ?>" id="mcwallet_<?php echo esc_attr( $key ); ?>_disabled" <?php checked( 'true', get_option( "mcwallet_{$key}_disabled" ) ); ?>>
								<?php echo sprintf( esc_html__( 'Disable %s wallet.', 'multi-currency-wallet' ), $title ); ?>
							</label>
						</td>
					</tr>
			<?php } ?>
      <tr>
				<th scope="row"></th>
				<td>
					<label for="mcwallet_fkw_disabled">
						<input name="fkw_disabled" type="checkbox" id="mcwallet_fkw_disabled" <?php checked( 'true', ( get_option( 'mcwallet_fkw_disabled', 'true') === 'true') ? 'true' : 'false' ); ?>>
						<?php esc_html_e( 'Disable Fokawa (FKW) wallet.', 'multi-currency-wallet' );?>
					</label>
				</td>
			</tr>
      <!--
      <tr>
				<th scope="row"></th>
				<td>
					<label for="mcwallet_phpx_disabled">
						<input name="phpx_disabled" type="checkbox" id="mcwallet_phpx_disabled" <?php checked( 'true', ( get_option( 'mcwallet_phpx_disabled', 'true') === 'true') ? 'true' : 'false' ); ?>>
						<?php esc_html_e( 'Disable phpX wallet.', 'multi-currency-wallet' );?>
					</label>
				</td>
			</tr>
      -->
			<tr>
				<th scope="row"></th>
				<td>
					<label for="mcwallet_ghost_enabled">
						<input name="ghost_enabled" type="checkbox" id="mcwallet_ghost_enabled" <?php checked( 'true', ( ! get_option( 'mcwallet_ghost_enabled' ) ) ? 'true' : 'false' ); ?>>
						<?php esc_html_e( 'Disable GHOST wallet.', 'multi-currency-wallet' );?>
					</label>
				</td>
			</tr>
			<tr>
				<th scope="row"></th>
				<td>
					<label for="mcwallet_next_enabled">
						<input name="next_enabled" type="checkbox" id="mcwallet_next_enabled" <?php checked( 'true', ( ! get_option( 'mcwallet_next_enabled' ) ) ? 'true' : 'false' ); ?>>
						<?php esc_html_e( 'Disable NEXT wallet.', 'multi-currency-wallet' );?>
					</label>
				</td>
			</tr>
			<tr>
				<th scope="row"></th>
				<td>
					<label for="mcwallet_invoice_enabled">
						<input name="invoice_enabled" type="checkbox" id="mcwallet_invoice_enabled" <?php checked( 'true', get_option( 'mcwallet_invoice_enabled' ) ); ?>>
						<?php esc_html_e( 'Enable Invoices', 'multi-currency-wallet' );?>
					</label>
				</td>
			</tr>
		</tbody>
	</table><!-- .form-table -->

	<h3><?php esc_html_e( 'Exchange fees', 'multi-currency-wallet' );?></h3>

	<table class="form-table">
		<tbody>
			<tr>
				<th scope="row">
					<label><?php esc_html_e( '0x swap fee', 'multi-currency-wallet' );?></label>
				</th>
				<td>
					<input name="zerox_fee_percent" type="number" min="0" max="1" value="<?php echo esc_attr( get_option( 'zerox_fee_percent', '0' ) );?>" class="tiny-text textright" <?php disabled( true, $disable_fee ); ?>> %
					<p class="description"><?php esc_html_e( 'The percentage of the purchase amount that will be sent to the EVM address (Maximux 0x Fee is 1%)', 'multi-currency-wallet' );?></p>
				</td>
			</tr>
			<tr>
				<th scope="row">
					<label><?php esc_html_e( 'Address where to collect fees', 'multi-currency-wallet' );?></label>
				</th>
				<td>
					<input type="text" value="<?php echo esc_attr( get_option('eth_fee_address') );?>" class="regular-text" disabled>
					<p class="description"><?php esc_html_e( 'The same as EVM compatible address', 'multi-currency-wallet' );?></p>
				</td>
			</tr>
		</tbody>
	</table>


	<h3><?php esc_html_e( 'Transaction fees', 'multi-currency-wallet' );?> (<a target=_blank href="https://support.swaponline.io/docs/fpr-business/admin-fees-formula-wallet-only/">?</a>)</h3>

	<table class="form-table">
		<tbody>
			<tr>
				<th scope="row">
					<label><?php esc_html_e( 'Bitcoin', 'multi-currency-wallet' );?></label>
				</th>
				<td>
					<input name="btc_fee" type="number" min="0" max="100" value="<?php echo esc_attr( get_option( 'btc_fee', '5' ) );?>" class="tiny-text textright" <?php disabled( true, $disable_fee ); ?>> <?php esc_html_e( '%, no less than', 'multi-currency-wallet' ); ?> <input name="btc_min" type="text" value="<?php echo esc_attr( get_option('btc_min') );?>" size="7" class="textright" placeholder="<?php esc_attr_e( 'Enter Min. fee (ex. 0.0001)', 'multi-currency-wallet' ); ?>"> <?php esc_html_e( 'BTC', 'multi-currency-wallet' ); ?>
				</td>
			</tr>
			<tr>
				<th scope="row">
					<label><?php esc_html_e( 'BTC Adress where to collect fees', 'multi-currency-wallet' );?></label>
				</th>
				<td>
					<input name="btc_fee_address" type="text" class="regular-text" value="<?php echo esc_attr( get_option('btc_fee_address') );?>">
				</td>
			</tr>
			<tr>
				<th scope="row">
					<label><?php esc_html_e( 'EVM compatible (ETH, BSC, etc..)', 'multi-currency-wallet' );?></label>
				</th>
				<td>
					<input name="eth_fee" type="number" min="0" max="100" value="<?php echo esc_attr( get_option( 'eth_fee', '5' ) );?>" class="tiny-text textright" <?php disabled( true, $disable_fee ); ?>> <?php esc_html_e( '%, no less than', 'multi-currency-wallet' ); ?> <input name="eth_min" type="text" value="<?php echo esc_attr( get_option('eth_min') );?>" size="7" class="textright" placeholder="<?php esc_attr_e( 'Enter Min. fee (ex. 0.0001)', 'multi-currency-wallet' ); ?>"> <?php esc_html_e( 'ETH', 'multi-currency-wallet' ); ?>
				</td>
			</tr>
			<tr>
				<th scope="row">
					<label><?php esc_html_e( 'EVM compatible Address where to collect fees', 'multi-currency-wallet' );?></label>
				</th>
				<td>
					<input name="eth_fee_address" type="text" class="regular-text" value="<?php echo esc_attr( get_option('eth_fee_address') );?>">
				</td>
			</tr>
			<tr>
				<th scope="row">
					<label><?php esc_html_e( 'Other tokens', 'multi-currency-wallet' );?></label>
				</th>
				<td>
					<input name="tokens_fee" type="number" min="0" max="100" value="<?php echo esc_attr( get_option( 'tokens_fee', '5' ) );?>" class="tiny-text textright" <?php disabled( true, $disable_fee ); ?>> <?php esc_html_e( '%, no less than', 'multi-currency-wallet' ); ?> <input name="tokens_min" type="text" value="<?php echo esc_attr( get_option('tokens_min') );?>" size="7" class="textright" placeholder="<?php esc_attr_e( 'Enter Min. fee (ex. 0.0001)', 'multi-currency-wallet' ); ?>"> <?php esc_html_e( 'Tokens', 'multi-currency-wallet' ); ?>
				</td>
			</tr>
			<tr>
				<th scope="row">
					<label><?php esc_html_e( 'Other tokens address where to collect fees', 'multi-currency-wallet' );?></label>
				</th>
				<td>
					<input type="text" value="<?php echo esc_attr( get_option('eth_fee_address') );?>" class="regular-text" disabled>
					<p class="description"><?php esc_html_e( 'Address the same as Ethereum', 'multi-currency-wallet' );?></p>
				</td>
			</tr>
			<tr>
				<th scope="row">
					<label><?php esc_html_e( 'Default fiat currency', 'multi-currency-wallet' );?></label>
				</th>
				<td>
					<select type="text" name="fiat_currency" class="regular-text">
						<?php foreach( mcwallet_get_valutes() as $key => $valute ) { ?>
							<option value="<?php echo esc_attr( $key ); ?>" <?php selected( get_option( 'fiat_currency', 'USD' ), $key ); ?>><?php echo esc_html( $valute ); ?></option>
						<?php } ?>
					</select>
				</td>
			</tr>
			<tr>
				<th scope="row">
					<label><?php esc_html_e( 'Fiat Gateway Url', 'multi-currency-wallet' );?></label>
				</th>
				<td>
					<input name="fiat_gateway_url" type="text" class="large-text" value="<?php echo esc_attr( get_option( 'fiat_gateway_url', 'https://itez.swaponline.io/?DEFAULT_FIAT={DEFAULT_FIAT}&locale={locale}&btcaddress={btcaddress}') );?>">
				</td>
			</tr>
			<tr>
				<th scope="row">
					<label>
						<?php esc_html_e( 'Transak API key', 'multi-currency-wallet' );?>
						(<a target=_blank href="https://transak.com/">?</a>)
					</label>
				</th>
				<td>
					<input name="transak_api_key" type="text" class="large-text" value="<?php echo esc_attr( get_option( 'transak_api_key', '') );?>">
					<p class="description"><?php esc_html_e( 'With this key, your payment method will be automatically replaced with the Transak service', 'multi-currency-wallet' );?></p>
				</td>
			</tr>
		</tbody>
	</table><!-- .form-table -->

  <h3><?php esc_html_e( 'WalletConnect Options', 'multi-currency-wallet' );?></h3>
  <table class="form-table">
		<tbody>
      <tr>
        <th scope="row">
        </th>
        <td>
          <label for="mcwallet_wc_disabled">
						<input name="mcwallet_wc_disabled" type="checkbox" id="mcwallet_wc_disabled" <?php checked( 'true', get_option( 'wc_disabled', 'false' ) ); ?>>
						<?php esc_html_e( 'Disable WalletConnect', 'multi-currency-wallet' );?>
					</label>
        </td>
      </tr>
      <tr>
				<th scope="row">
					<label><?php esc_html_e( 'ProjectId', 'multi-currency-wallet' );?></label>
				</th>
				<td>
					<label for="mcwallet_wc_projectid">
						<input name="mcwallet_wc_projectid" type="text" class="large-text" id="mcwallet_wc_projectid" value="<?php echo esc_attr( get_option( 'wc_projectid', '') )?>" />
						<span>Your Project ID can be obtained from <a href="https://walletconnect.com/" target="_blank">walletconnect.com</a>. Leave empty for use default </span>
					</label>
				</td>
			</tr>
    </tbody>
  </table>
  
  <h3><?php esc_html_e( 'Infura API settings', 'multi-currency-wallet' );?></h3>
  <table class="form-table">
		<tbody>
      <tr>
				<th scope="row">
					<label><?php esc_html_e( 'ApiKey', 'multi-currency-wallet' );?></label>
				</th>
				<td>
					<label for="mcwallet_infura_api_key">
						<input name="mcwallet_infura_api_key" type="text" class="large-text" id="mcwallet_infura_api_key" value="<?php echo esc_attr( get_option( 'infura_api_key', '') )?>" />
						<span>Your Infura ApiKey can be obtained from <a href="https://www.infura.io/" target="_blank">infura.io</a>. Leave empty for use default </span>
					</label>
				</td>
			</tr>
    </tbody>
  </table>
  
	<h3><?php esc_html_e( 'Custom Options', 'multi-currency-wallet' );?></h3>

	<table class="form-table">
		<tbody>
			<tr>
				<th scope="row">
					<label><?php esc_html_e( 'Show "How it works" block', 'multi-currency-wallet' );?></label>
				</th>
				<td>
					<label for="mcwallet_show_howitworks">
						<input name="show_howitworks" type="checkbox" id="mcwallet_show_howitworks" value="true" <?php checked( 'true', get_option( 'show_howitworks' ) ); ?>>
						<?php esc_html_e( 'Show "How it works" block on Exchange page', 'multi-currency-wallet' );?>
					</label>
				</td>
			</tr>
			<tr>
				<th scope="row"></th>
				<td>
					<label for="mcwallet_hide_service_links">
						<input name="hide_service_links" type="checkbox" id="mcwallet_hide_service_links" <?php checked( 'true', get_option( 'mcwallet_hide_service_links' ) ); ?>>
						<?php esc_html_e( "Hide Service Links (In footer)", 'multi-currency-wallet' );?>
					</label>
				</td>
			</tr>
			<tr>
				<th scope="row"></th>
				<td>
					<?php
						submit_button( esc_attr__( 'Update options', 'multi-currency-wallet' ), 'primary mcwallet-update-options', 'mcwallet-update-options', false );
					?>
					<span class="spinner"></span>
				</td>
			</tr>
		</tbody>
	</table><!-- .form-table -->

	<?php if ( mcwallet_show_admin_use() ) { ?>

		<hr>

		<h3><?php esc_html_e( 'For use', 'multi-currency-wallet' );?></h3>

		<table class="form-table">
			<tbody>
				<tr>
					<th scope="row">
						<label><?php esc_html_e( 'Page url', 'multi-currency-wallet' ); ?></label>
					</th>
					<td>
						<input type="text" onfocus="this.select();" readonly="readonly" class="large-text mcwallet-page-url" value="<?php echo esc_attr( mcwallet_page_url() );?>">
						<p class="desciption"><em><?php esc_html_e( 'Direct link to widget page', 'multi-currency-wallet');?></em></p>
					</td>
				</tr>
				<tr>
					<th scope="row">
						<label><?php esc_html_e( 'Shortcode', 'multi-currency-wallet' ); ?></label>
					</th>
					<td>
						<input type="text" onfocus="this.select();" readonly="readonly" class="regular-text" value="[mcwallet_widget]">
						<p class="desciption"><em><?php esc_html_e( 'Copy and paste this shortcode in your page content.', 'multi-currency-wallet');?></em></p><br>
						<input type="text" onfocus="this.select();" readonly="readonly" class="regular-text" value="<?php echo esc_html( '<?php echo do_shortcode( \'[mcwallet_widget]\' );?>' );?>">
						<p class="desciption"><em><?php esc_html_e( 'Or add this code to the place of the template where you need to display widget.', 'multi-currency-wallet');?></em><br></p>
					</td>
				</tr>
				<tr>
					<th scope="row">
						<label><?php esc_html_e( 'Demo', 'multi-currency-wallet' );?></label>
					</th>
					<td>
						<a href="<?php echo mcwallet_thickbox_url();?>" class="button thickbox mcwallet-button-thickbox" title="<?php esc_attr_e( 'MCWallet Widget Demo', 'multi-currency-wallet' );?>"><?php esc_html_e( 'See Modal Widget Demo', 'multi-currency-wallet' );?></a>
						<a href="<?php echo mcwallet_page_url(); ?>" class="button mcwallet-button-url" target="_blank"><?php esc_html_e( 'View page', 'multi-currency-wallet' ); ?></a>
					</td>
				</tr>
			</tbody>
		</table><!-- .form-table -->

	<?php } ?>

</div><!-- .mcwallet-shortcode-panel-row -->
