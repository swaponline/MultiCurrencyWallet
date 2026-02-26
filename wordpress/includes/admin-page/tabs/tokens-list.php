<?php
/**
 * Tab Tokens list Template
 * 
 * @package Multi Currency Wallet
 */

?>
<div class="mcwallet-shortcode-panel-row">

	<table class="wp-list-table widefat striped wp-list-tokens">
		<thead>
			<tr>
				<td class="item-count">
					<span>#</span>
				</td>
				<td class="item-icon">
					<span><?php esc_html_e( 'Icon', 'multi-currency-wallet' ); ?></span>
				</td>
				<td class="item-name">
					<span><?php esc_html_e( 'Token name', 'multi-currency-wallet' ); ?></span>
				</td>
				<td class="item-symbol">
					<span><?php esc_html_e( 'Token symbol', 'multi-currency-wallet' ); ?></span>
				</td>
				<td class="item-decimals">
					<span><?php esc_html_e( 'Decimals', 'multi-currency-wallet' ); ?></span>
				</td>
				<td class="item-address">
					<span><?php esc_html_e( 'Contract address', 'multi-currency-wallet' ); ?></span>
				</td>
				<td class="item-echange-rate">
					<span><?php esc_html_e( 'Exchange Rate / Price', 'multi-currency-wallet' ); ?></span>
				</td>
				<td class="item-action">
					<span><?php esc_html_e( 'Action', 'multi-currency-wallet' ); ?></span>
				</td>
			</tr>
		</thead>
		<tbody>
			<?php if ( $erc20tokens ) {
				// Sort tokens by order from subarray.
				uasort( $erc20tokens, function( $a, $b ) {
					if ( isset( $a['order'] ) ) {
						return $a['order'] <=> $b['order'];
					}
				});
				?>
				<?php foreach( $erc20tokens as $name => $token ) {
					$img = '<span class="token-letter">' . mcwallet_token_letter( $token['name'] ) . '</span>';
					if ( mcwallet_remote_image_file_exists( $token['icon'] ) ) {
						$img = '<img src="' . esc_attr( $token['icon'] ) . '" alt="' . esc_attr( $name ) . '">';
					}
					$token_bg = '';
					if ( isset( $token['bg'] ) ) {
						$token_bg = $token['bg'];
					}
					$token_rate = '';
					if ( isset( $token['rate'] ) && $token['rate'] ) {
						$token_rate = $token['rate'];
					}
          $token_price = '';
          if ( isset( $token['price'] ) && $token['price'] ) {
            $token_price = $token['price'];
          }
					if ( ! isset( $token['standard'] ) ) {
						$token['standard'] = 'erc20';
					}
					$order = 1;
					if ( isset( $token['order'] ) ) {
						$order = intval( $token['order'] );
					}
				?>
				<tr class="item" data-order="<?php echo esc_attr( $order ); ?>" data-name="<?php echo esc_attr( $name ); ?>">
					<th class="item-count">
						<div class="drag-icons-group">
							<i class="dashicons dashicons-ellipsis"></i>
							<i class="dashicons dashicons-ellipsis"></i>
						</div>
						<span></span>
					</th>
					<td class="item-icon">
						<a href="<?php echo esc_url( mcwallet_page_url() ) . '#/' . esc_url( $name );?>-wallet" target="_blank" style="background-color: <?php echo esc_attr( $token_bg ); ?>">
							<?php echo wp_kses_post( $img ); ?>
						</a>
					</td>
					<td class="item-name">
						<strong><?php echo esc_html( $token['name'] );?></strong>
					</td>
					<td class="item-symbol">
						<span><?php echo esc_html( $token['symbol'] );?></span>
					</td>
					<td class="item-decimals">
						<span><?php echo esc_html( $token['decimals'] );?></span>
					</td>
					<td class="item-address">
						<code><?php echo esc_html( $token['standard'] );?></code>
						<code><?php echo esc_html( $token['address'] );?></code>
					</td>
					<td class="item-exchange-rate">
            <?php
              if ($token_rate !== '') {
                ?>
            <div>
              <span>Rate: <?php echo esc_html( $token_rate );?></span>
            </div>
                <?php
              }
              if ($token_price !== '') {
                ?>
            <div>
              <span>Price: <?php echo esc_html( $token_price );?> <?php echo esc_html(get_option( 'fiat_currency', 'USD' ))?></span>
            </div>
                <?php
              }
            ?>
					</td>
					<td class="item-action">
						<a href="#" class="button-link-delete mcwallet-remove-token" data-name="<?php echo esc_html( $name );?>"><span class="dashicons dashicons-trash"></span></a>
					</td>
				</tr>
			<?php } ?>
			<?php } else { ?>
				<tr class="item item-empty">
					<td colspan="8">
						<span><?php esc_html_e( 'No tokens', 'multi-currency-wallet' );?></span>
					</td>
				</tr>
			<?php } ?>
			
		</tbody>
		<tfoot>
			<tr>
				<td class="item-count">
					<span>#</span>
				</td>
				<td class="item-icon">
					<span><?php esc_html_e( 'Icon', 'multi-currency-wallet' );?></span>
				</td>
				<td class="item-name">
					<span><?php esc_html_e( 'Token name', 'multi-currency-wallet' );?></span>
				</td>
				<td class="item-symbol">
					<span><?php esc_html_e( 'Token symbol', 'multi-currency-wallet' );?></span>
				</td>
				<td class="item-decimals">
					<span><?php esc_html_e( 'Decimals', 'multi-currency-wallet' );?></span>
				</td>
				<td class="item-address">
					<span><?php esc_html_e( 'Сontract address', 'multi-currency-wallet' );?></span>
				</td>
				<td class="item-echange-rate">
					<span><?php esc_html_e( 'Exchange Rate / Price', 'multi-currency-wallet' ); ?></span>
				</td>
				<td class="item-action">
					<span><?php esc_html_e( 'Action', 'multi-currency-wallet' );?></span>
				</td>
			</tr>
		</tfoot>
	</table><!-- .wp-list-tokens -->

</div><!-- .mcwallet-shortcode-panel-row -->

<div class="mcwallet-shortcode-panel-row">

	<form action="" class="wp-mcwallet-widget-form">
		<?php settings_fields( 'mcwallet' ); ?>
		<?php mcwallet_do_settings_sections();?>
	</form>

</div><!-- .mcwallet-shortcode-panel-row -->
