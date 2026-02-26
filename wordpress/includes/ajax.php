<?php
/**
 * MCWallet Ajax
 */

function mcwallet_backup_user() {
	$data = json_decode( file_get_contents( 'php://input' ), true );

	if (intval($data['WPuserUid']) !== get_current_user_id()) {
		wp_die('Access deny', 403);
	}

	$user_id        = get_current_user_id();
	$userData       = get_userdata($user_id)->data;
	$userHashString = $user_id.':'.$userData->user_login.':'.$userData->user_registered.':'.$userData->user_pass.':'.NONCE_SALT;
	$user_uniqhash  = md5( $userHashString );

	if ($user_uniqhash != $data['WPuserHash']) {
		wp_die('Access deny', 403);
	}

	$backup = get_user_meta( $user_id, '_mcwallet_backup' );
	if (is_array($backup)
		and isset($backup[0])
		and is_array($backup[0])
	) {
		$backup = $backup[0];
	} else {
		$backup = false;
	}

	if ($data[ 'action' ] && $data[ 'action' ] == 'cleanup') {
		wp_die( '{"answer":"ok"}', 200);
	}

	if ($backup
		and $backup[ 'twentywords' ]
		and $data[ 'twentywords' ]
		and ($backup[ 'twentywords' ] != $data[ 'twentywords' ])
		and ($backup[ 'twentywords' ] != '-')
		and ($data[ 'twentywords' ] != '-')
	) {
		wp_die( '{"error":"rewrite seed"}', 200);
	}

	$arr = ($backup) ? $backup : [];

	$arr[ 'btcMnemonic' ]                       = $data[ 'btcMnemonic' ];
	$arr[ 'ethMnemonic' ]                       = $data[ 'ethMnemonic' ];
	$arr[ 'eth' ]                               = $data[ 'eth' ];
	$arr[ 'btc' ]                               = $data[ 'btc' ];
	$arr[ 'ghost' ]                             = $data[ 'ghost' ];
	$arr[ 'ethOld' ]                            = $data[ 'ethOld' ];
	$arr[ 'btcOld' ]                            = $data[ 'btcOld' ];

	if ($data['twentywords'] !== '-') {
		$arr[ 'twentywords' ]                       = $data[ 'twentywords' ];
	}

	$arr[ 'btcMultisig' ]                       = $data[ 'btcMultisig' ];
	$arr[ 'btcMultisigOtherOwnerKey' ]          = $data[ 'btcMultisigOtherOwnerKey' ];
	$arr[ 'btcMultisigOtherOwnerKeyMnemonic' ]  = $data[ 'btcMultisigOtherOwnerKeyMnemonic' ];
	$arr[ 'btcMultisigOtherOwnerKeyOld' ]       = $data[ 'btcMultisigOtherOwnerKeyOld' ];
	$arr[ 'btcSmsMnemonicKey' ]                 = $data[ 'btcSmsMnemonicKey' ];
	$arr[ 'btcSmsMnemonicKeyGenerated' ]        = $data[ 'btcSmsMnemonicKeyGenerated' ];
	$arr[ 'btcSmsMnemonicKeyMnemonic' ]         = $data[ 'btcSmsMnemonicKeyMnemonic' ];
	$arr[ 'btcSmsMnemonicKeyOld' ]              = $data[ 'btcSmsMnemonicKeyOld' ];
	$arr[ 'btcPinMnemonicKey' ]                 = $data[ 'btcPinMnemonicKey' ];
	$arr[ 'hiddenCoinsList' ]                   = $data[ 'hiddenCoinsList' ];
	
	$arr[ 'isWalletCreate' ]                    = $data[ 'isWalletCreate' ];
	$arr[ 'didProtectedBtcCreated' ]            = $data[ 'didProtectedBtcCreated' ];
	$arr[ 'didPinBtcCreated' ]                  = $data[ 'didPinBtcCreated' ];

	$arr[ 'orders' ]                            = $data[ 'orders' ];

	update_user_meta( $user_id, '_mcwallet_backup', $arr);
	wp_die( '{"answer":"ok"}', 200);
}

add_action( 'wp_ajax_mcwallet_backup_userwallet', 'mcwallet_backup_user' );
// debug action - for allow request from http://localhost:9001/ with hardcore writed userid
// add_action( 'wp_ajax_nopriv_mcwallet_backup_userwallet', 'mcwallet_backup_user' );

function mcwallet_restory_user() {
	$data = json_decode( file_get_contents( 'php://input' ), true );

	if (intval($data['WPuserUid']) !== get_current_user_id()) {
		wp_die('Access deny', 403);
	}

	$user_id        = get_current_user_id();
	$userData       = get_userdata($user_id)->data;
	$userHashString = $user_id.':'.$userData->user_login.':'.$userData->user_registered.':'.$userData->user_pass.':'.NONCE_SALT;
	$user_uniqhash  = md5($userHashString);

	if ($user_uniqhash != $data['WPuserHash']) {
		wp_die('Access deny', 403);
	}

	$backup = get_user_meta( $user_id, '_mcwallet_backup' );
	if (is_array($backup)
		and isset($backup[0])
		and is_array($backup[0])
	) {
		$backup = $backup[0];

		$data = array();
		$data['btcMnemonic']                        = $backup['btcMnemonic'];
		$data['ethMnemonic']                        = $backup['ethMnemonic'];
		$data['eth']                                = $backup['eth'];
		$data['btc']                                = $backup['btc'];
		$data['ghost']                              = $backup['ghost'];
		$data['ethOld']                             = $backup['ethOld'];
		$data['btcOld']                             = $backup['btcOld'];
		$data['twentywords']                        = '-'; // $backup['twentywords'];
		$data['btcMultisig']                        = $backup['btcMultisig'];
		$data['btcMultisigOtherOwnerKey']           = $backup['btcMultisigOtherOwnerKey'];
		$data['btcMultisigOtherOwnerKeyMnemonic']   = $backup['btcMultisigOtherOwnerKeyMnemonic'];
		$data['btcMultisigOtherOwnerKeyOld']        = $backup['btcMultisigOtherOwnerKeyOld'];
		$data['btcSmsMnemonicKey']                  = $backup['btcSmsMnemonicKey'];
		$data['btcSmsMnemonicKeyGenerated']         = $backup['btcSmsMnemonicKeyGenerated'];
		$data['btcSmsMnemonicKeyMnemonic']          = $backup['btcSmsMnemonicKeyMnemonic'];
		$data['btcSmsMnemonicKeyOld']               = $backup['btcSmsMnemonicKeyOld'];
		$data['btcPinMnemonicKey']                  = $backup['btcPinMnemonicKey'];
		$data['hiddenCoinsList']                    = $backup['hiddenCoinsList'];
		$data[ 'isWalletCreate' ]                   = $backup[ 'isWalletCreate' ];
		$data[ 'didProtectedBtcCreated' ]           = $backup[ 'didProtectedBtcCreated' ];
		$data[ 'didPinBtcCreated' ]                 = $backup[ 'didPinBtcCreated' ];
		$data[ 'orders' ]                           = $backup[ 'orders' ];

		$json = array(
			'answer' => 'ok',
			'data' => $data
		);
		wp_send_json($json);
	} else {
		wp_die('{"answer":"not found"}', 200);
	}
}
add_action( 'wp_ajax_mcwallet_restore_userwallet', 'mcwallet_restory_user' );
// debug action - for allow request from http://localhost:9001/ with hardcore writed userid
// add_action( 'wp_ajax_nopriv_mcwallet_restore_userwallet', 'mcwallet_restory_user' );


function mcwallet_update_user_meta() {
	$data = json_decode( file_get_contents( 'php://input' ), true );
	$arr  = [];
	$arr  = array_merge( $arr, mcwallet_santize_date_react( $data, 'ethData' ) );
	$arr  = array_merge( $arr, mcwallet_santize_date_react( $data, 'btcData' ) );
	$arr  = array_merge( $arr, mcwallet_santize_date_react( $data, 'btcMultisigSMSData' ) );
	$arr  = array_merge( $arr, mcwallet_santize_date_react( $data, 'btcMultisigPinData' ) );
	$arr  = array_merge( $arr, mcwallet_santize_date_react( $data, 'btcMultisigUserData' ) );
	$arr  = array_merge( $arr, mcwallet_santize_date_react( $data, 'usdtData' ) );
	$arr  = array_merge( $arr, mcwallet_santize_date_react( $data, 'usdt' ) );

	if ( $arr ) {
		update_user_meta( get_current_user_id(), '_mcwallet_data', $arr );
	}

	wp_die( 2 );
}
add_action( 'wp_ajax_mcwallet_update_user_meta', 'mcwallet_update_user_meta' );

/**
 * @param $data
 * @param $name
 *
 * @return array
 */
function mcwallet_santize_date_react( $data, $name ) {
	$arr = [];
	if ( isset( $data[ $name ] ) && is_array( $data[ $name ] ) ) {
		$arr[ $name ] = [
			'address' => sanitize_text_field( isset( $data[ $name ]['address'] ) ? $data[ $name ]['address'] : '' ),
			'balance' => floatval( isset( $data[ $name ]['balance'] ) ? $data[ $name ]['balance'] : '' ),
		];

		return $arr;
	}

	return [];

}

/**
 * Add token
 */
function mcwallet_add_token() {

	/* Check nonce */
	check_ajax_referer( 'mcwallet-nonce', 'nonce' );

	/* Stop if the current user is not an admin or do not have administrative access */
	if ( ! current_user_can( 'manage_options' ) ) {
		die();
	}

	$status = 'false';
	$token  = array();
	$html   = '';
	$tokens = get_option( 'mcwallet_tokens' );
	if ( ! $tokens ) {
		$tokens = array();
	}

	if ( isset( $_POST['address'] ) && $_POST['address'] ) {
		$status = 'true';

		$address     = sanitize_text_field( $_POST['address'] );
		$custom_name = sanitize_text_field( $_POST['name'] );

	$standard = 'erc20';
	if (in_array($_POST['standard'], array('erc20','bep20','erc20matic','erc20ftm','erc20avax','erc20movr','erc20aurora','phi20_v2','fkw20','phpx20'))) $standard = $_POST['standard'];
    if ( mcwallet_is_address( $address, $standard ) ) {
			$status = 'success';

			$name = mcwallet_hex_to_string( mcwallet_get_remote_result( 'name', $address, $standard), $standard );
			$key  = strtolower( $name . '_' . $standard . '_' .$address);

			if ( $custom_name ) {
				$name = $custom_name;
			}
			$symbol       = mcwallet_hex_to_string( mcwallet_get_remote_result( 'symbol', $address, $standard ), $standard );
			$decimals     = mcwallet_hex_to_number( mcwallet_get_remote_result( 'decimals', $address, $standard ), $standard );
			$standard     = sanitize_text_field( $_POST['standard'] );
			$icon         = sanitize_text_field( $_POST['icon'] );
			$rate         = sanitize_text_field( $_POST['rate'] );
      $price        = sanitize_text_field( $_POST['price'] );
			$icon_bg      = sanitize_hex_color( $_POST['bg'] );
			$how_deposit  = wp_kses_post( wp_unslash( $_POST['howdeposit'] ) );
			$how_withdraw = wp_kses_post( wp_unslash( $_POST['howwithdraw'] ) );
			$order        = intval( $_POST['order'] );

			$img = '<span class="token-letter">' . mcwallet_token_letter( $name ) . '</span>';
			if ( mcwallet_remote_image_file_exists( $icon ) ) {
				$img = '<img src="' . esc_attr( $icon ) . '" alt="' . esc_attr( $name ) . '">';
			}

			$html = '<tr class="item item-fade item-adding" data-order="' . esc_attr( $order ) . '" data-name="' . esc_attr( $key ) . '">
				<th class="item-count">
					<div class="drag-icons-group">
						<i class="dashicons dashicons-ellipsis"></i>
						<i class="dashicons dashicons-ellipsis"></i>
					</div>
					<span></span>
				</th>
				<td class="item-icon">
					<a href="' . esc_url( mcwallet_page_url() ) . '#/' . esc_html( strtoupper( $key ) ) . '/' . $address . '" target="_blank" style="background-color: ' . esc_attr( $icon_bg ) . '">
						' . wp_kses_post( $img ) . '
					</span>
				</td>
				<td class="item-name">
					<strong>' . esc_html( $name ) . '</strong>
				</td>
				<td class="item-symbol">
					<span>' . esc_html( $symbol ) . '</span>
				</td>
				<td class="item-decimals">
					<span>' . esc_html( $decimals ) . '</span>
				</td>
				<td class="item-address">
					<code>' . esc_html( $standard ) . '</code>
					<code>' . esc_html( $address ) . '</code>
				</td>
				<td class="item-echange-rate">
					<span>' . esc_html( $rate ) . '</span>
				</td>
				<td class="item-action">
					<a href="#" class="button-link-delete mcwallet-remove-token" data-name="' . esc_attr( $key ) . '"><span class="dashicons dashicons-trash"></span></a>
				</td>
			</tr>';

			$token[ $key ] = array(
				'name'        => $name,
				'symbol'      => $symbol,
				'address'     => $address,
				'decimals'    => $decimals,
				'standard'    => $standard,
				'icon'        => $icon,
				'rate'        => $rate,
        'price'       => $price,
				'bg'          => $icon_bg,
				'howdeposit'  => $how_deposit,
				'howwithdraw' => $how_withdraw,
				'order'       => $order,
			);

			if ( ! is_array( $tokens ) ) {
				$tokens = $token;
				uasort( $tokens, function( $a, $b ) {
					if ( isset( $a['order'] ) ) {
						return $a['order'] <=> $b['order'];
					}
				});
				update_option( 'mcwallet_tokens', $tokens );
			} elseif ( ! array_key_exists( $key, $tokens ) ) {
				$tokens[ $key ] = array(
					'name'        => $name,
					'symbol'      => $symbol,
					'address'     => $address,
					'decimals'    => $decimals,
					'standard'    => $standard,
					'icon'        => $icon,
					'rate'        => $rate,
          'price'       => $price,
					'bg'          => $icon_bg,
					'howdeposit'  => $how_deposit,
					'howwithdraw' => $how_withdraw,
					'order'       => $order,
				);
				uasort( $tokens, function( $a, $b ) {
					if ( isset( $a['order'] ) ) {
						return $a['order'] <=> $b['order'];
					}
				});
				update_option( 'mcwallet_tokens', $tokens );
			} else {
				$status = 'false';
			}

		} else {
			$status = 'invalid';
		}
	}

	$result_arr = array(
		'status' => $status,
		'tokens' => $tokens,
		'html'   => $html,
	);

	wp_send_json( $result_arr );

}

add_action( 'wp_ajax_mcwallet_add_token', 'mcwallet_add_token' );


/**
 * Remove token
 */
function mcwallet_remove_token() {

	/* Check nonce */
	check_ajax_referer( 'mcwallet-nonce', 'nonce' );

	/* Stop if the current user is not an admin or do not have administrative access */
	if ( ! current_user_can( 'manage_options' ) ) {
		die();
	}

	$result = 'true';

	$tokens = get_option( 'mcwallet_tokens' );

	if ( $_POST['name'] ) {

		$name = sanitize_text_field( $_POST['name'] );

		unset( $tokens[ $name ] );

		if ( $tokens != get_option( 'mcwallet_tokens' ) ) {
			update_option( 'mcwallet_tokens', $tokens );
		} else {
			$result = 'false';
		}

	} else {
		$result = 'false';
	}

	wp_send_json( $result );
}

add_action( 'wp_ajax_remove_token', 'mcwallet_remove_token' );

/**
 * Reorder token
 */
function mcwallet_reorder_token() {

	/* Check nonce */
	check_ajax_referer( 'mcwallet-nonce', 'nonce' );

	/* Stop if the current user is not an admin or do not have administrative access */
	if ( ! current_user_can( 'manage_options' ) ) {
		die();
	}

	if ( $_POST['items'] ) {

		$sorded_items = array_map( 'sanitize_text_field', $_POST['items'] );

		$tokens = get_option( 'mcwallet_tokens' );
		$tokens_ordered = array();
		foreach( $sorded_items as $key => $token ) {
			$tokens[ $token ]['order'] = $key;
			$tokens_ordered[ $token ] = $tokens[ $token ];
		}
		update_option( 'mcwallet_tokens', $tokens_ordered );

		$result = $tokens_ordered;

	} else {
		$result = false;
	}

	wp_send_json( $result );
}
add_action( 'wp_ajax_reorder_token', 'mcwallet_reorder_token' );

/**
 * Update faqs
 */
function mcwallet_update_faqs() {
	/* Check nonce */
	check_ajax_referer( 'mcwallet-nonce', 'nonce' );

	/* Stop if the current user is not an admin or do not have administrative access */
	if ( ! current_user_can( 'manage_options' ) ) {
		die();
	}

	$status = 'false';

	$own_before_faqs = array();
	if (isset($_POST['faqsBefore']) and is_array($_POST['faqsBefore'])) {
		foreach ($_POST['faqsBefore'] as $k=>$faqData) {
			if (is_array($faqData) and isset($faqData['title']) and isset($faqData['content']) and ($faqData['title'] !== '') and ($faqData['content'] !== '')) {
				$own_before_faqs[] = array(
					'title' => sanitize_text_field($faqData['title']),
					'content' => sanitize_text_field($faqData['content'])
				);
			}
		}
	}

	$own_after_faqs = array();
	if (isset($_POST['faqsAfter']) and is_array($_POST['faqsAfter'])) {
		foreach ($_POST['faqsAfter'] as $k=>$faqData) {
			if (is_array($faqData) and isset($faqData['title']) and isset($faqData['content']) and ($faqData['title'] !== '') and ($faqData['content'] !== '')) {
				$own_after_faqs[] = array(
					'title' => sanitize_text_field($faqData['title']),
					'content' => sanitize_text_field($faqData['content'])
				);
			}
		}
	}

	update_option( 'mcwallet_own_before_faqs', $own_before_faqs);
	update_option( 'mcwallet_own_after_faqs', $own_after_faqs);
	wp_send_json( array(
		'status' => 'success'
	));
}
add_action( 'wp_ajax_mcwallet_update_faqs', 'mcwallet_update_faqs' );

/**
 * Update menu items
 */
function mcwallet_update_menus() {
	/* Check nonce */
	check_ajax_referer( 'mcwallet-nonce', 'nonce' );

	/* Stop if the current user is not an admin or do not have administrative access */
	if ( ! current_user_can( 'manage_options' ) ) {
		die();
	}

	$status = 'false';

	$own_before_menus = array();
	if (isset($_POST['menusBefore']) and is_array($_POST['menusBefore'])) {
		foreach ($_POST['menusBefore'] as $k=>$menuData) {
			if (is_array($menuData) and isset($menuData['title']) and isset($menuData['link']) and ($menuData['title'] !== '') and ($menuData['link'] !== '')) {
				$own_before_menus[] = array(
					'title' => sanitize_text_field($menuData['title']),
					'link' => sanitize_text_field($menuData['link']),
					'newwindow' => (isset($menuData['newwindow']) and ($menuData['newwindow'] === 'true')) ? true : false
				);
			}
		}
	}

	$own_after_menus = array();
	if (isset($_POST['menusAfter']) and is_array($_POST['menusAfter'])) {
		foreach ($_POST['menusAfter'] as $k=>$menuData) {
			if (is_array($menuData) and isset($menuData['title']) and isset($menuData['link']) and ($menuData['title'] !== '') and ($menuData['link'] !== '')) {
				$own_after_menus[] = array(
					'title' => sanitize_text_field($menuData['title']),
					'link' => sanitize_text_field($menuData['link']),
					'newwindow' => (isset($menuData['newwindow']) and ($menuData['newwindow'] === 'true')) ? true : false
				);
			}
		}
	}

	update_option( 'mcwallet_own_before_menus', $own_before_menus);
	update_option( 'mcwallet_own_after_menus', $own_after_menus);
	wp_send_json( array(
		'status' => 'success'
	));
}
add_action( 'wp_ajax_mcwallet_update_menus', 'mcwallet_update_menus' );

/**
 * Update options
 */
function mcwallet_update_options() {

	/* Check nonce */
	check_ajax_referer( 'mcwallet-nonce', 'nonce' );

	/* Stop if the current user is not an admin or do not have administrative access */
	if ( ! current_user_can( 'manage_options' ) ) {
		die();
	}

	$status = 'false';

	if ( isset( $_POST['url'] ) && isset( $_POST['slug'] ) ) {

		$url              = sanitize_text_field( $_POST['url'] );
		$dark_logo_url    = sanitize_text_field( $_POST['darkLogoUrl'] );
		$logo_link        = sanitize_text_field( $_POST['logoLink'] );
		$zerox_fee_percent = sanitize_text_field( $_POST['zeroxFeePercent'] );
		$page_title       = sanitize_text_field( $_POST['pageTitle'] );
		$btc_fee          = sanitize_text_field( $_POST['btcFee'] );
		$btc_min          = sanitize_text_field( $_POST['btcMin'] );
		$btc_fee_address  = sanitize_text_field( $_POST['btcFeeAddress'] );
		$eth_fee          = sanitize_text_field( $_POST['ethFee'] );
		$eth_min          = sanitize_text_field( $_POST['ethMin'] );
		$eth_fee_address  = sanitize_text_field( $_POST['ethFeeAddress'] );
		$tokens_fee       = sanitize_text_field( $_POST['tokensFee'] );
		$tokens_min       = sanitize_text_field( $_POST['tokensMin'] );
		$fiat_currency    = sanitize_text_field( $_POST['fiatCurrency'] );
		$fiat_gateway_url = sanitize_text_field( $_POST['fiatGatewayUrl'] );
		$transak_api_key  = sanitize_text_field( $_POST['transakApiKey'] );
		$zerox_api_key    = sanitize_text_field( $_POST['zeroxApiKey'] );
		$code_head        = sanitize_textarea_field( esc_html( wp_unslash( $_POST['codeHead'] ) ) );
		$code_body        = sanitize_textarea_field( esc_html( wp_unslash( $_POST['codeBody'] ) ) );
		$code_footer      = sanitize_textarea_field( esc_html( wp_unslash( $_POST['codeFooter'] ) ) );
		$selected_exchange_mode = sanitize_text_field( $_POST['selected_exchange_mode'] );
		$selected_quickswap_mode = sanitize_text_field( $_POST['selected_quickswap_mode'] );
		$default_language = sanitize_text_field( $_POST['default_language'] );
		$slug             = 'mcwallet';
		$is_home          = 'false';
		$is_logged        = 'false';

    $mcwallet_enable_multitab = sanitize_text_field( $_POST['mcwallet_enable_multitab'] );

    $wc_disabled = sanitize_text_field( $_POST['wc_disabled'] );
    $wc_projectid = sanitize_text_field( $_POST['wc_projectid'] );
    
    $infura_api_key = sanitize_text_field( $_POST['infura_api_key'] );

		$strings      = array();
		$replacements = array();
		if ( isset( $_POST['strings'] ) ) {
			$strings = $_POST['strings'];
		}

		$string_splash_first_loading = sanitize_text_field( $_POST['string_splash_first_loading'] );
		$string_splash_loading = sanitize_text_field( $_POST['string_splash_loading'] );
		update_option( 'string_splash_loading', $string_splash_loading );
		update_option( 'string_splash_first_loading', $string_splash_first_loading );

		if ( $strings ) {
			foreach ( $strings as $string ) {
				$id    = esc_attr( $string['name'] );
				$value = $string['value'];
				if ( $value ) {
					$value                 = sanitize_text_field( $value );
					$replacements[ $id ][] = $value;
				}
			}
		}

		if ( untrailingslashit( $_POST['slug'] ) ) {
			$slug = untrailingslashit( sanitize_title( $_POST['slug'] ) );
		}

    update_option( 'wc_disabled', $wc_disabled );
    update_option( 'wc_projectid', $wc_projectid );
    update_option( 'infura_api_key', $infura_api_key );
		update_option( 'mcwallet_logo', $url );
		update_option( 'mcwallet_dark_logo', $dark_logo_url );
		update_option( 'mcwallet_logo_link', $logo_link );
		update_option( 'zerox_fee_percent', $zerox_fee_percent );
		update_option( 'mcwallet_page_title', $page_title );
		update_option( 'mcwallet_slug', $slug );
		update_option( 'btc_fee', $btc_fee );
		update_option( 'btc_min', $btc_min );
		update_option( 'btc_fee_address', $btc_fee_address );
		update_option( 'eth_fee', $eth_fee );
		update_option( 'eth_min', $eth_min );
		update_option( 'eth_fee_address', $eth_fee_address );
		update_option( 'tokens_fee', $tokens_fee );
		update_option( 'tokens_min', $tokens_min );
		update_option( 'fiat_currency', $fiat_currency );
		update_option( 'fiat_gateway_url', $fiat_gateway_url );
		update_option( 'transak_api_key', $transak_api_key );
		update_option( 'zerox_api_key', $zerox_api_key );
		update_option( 'mcwallet_head_code', $code_head );
		update_option( 'mcwallet_body_code', $code_body );
		update_option( 'mcwallet_footer_code', $code_footer );
		update_option( 'selected_exchange_mode', $selected_exchange_mode );
		update_option( 'selected_quickswap_mode', $selected_quickswap_mode );
		update_option( 'default_language', $default_language );
		update_option( 'mcwallet_strings', $replacements );
    
    update_option( 'mcwallet_enable_multitab', $mcwallet_enable_multitab );

		if ( $_POST['hideServiceLinks'] == 'true' ) {
			update_option( 'mcwallet_hide_service_links', sanitize_text_field( $_POST['hideServiceLinks'] ) );
		} else {
			delete_option( 'mcwallet_hide_service_links' );
		}
		if ( $_POST['rememberUserWallet'] == 'true' ) {
			update_option( 'mcwallet_remember_userwallet', sanitize_text_field( $_POST['rememberUserWallet'] ) );
		} else {
			delete_option( 'mcwallet_remember_userwallet' );
		}

		if ( $_POST['useTestnet'] == 'true' ) {
			update_option( 'mcwallet_use_testnet', sanitize_text_field( $_POST['useTestnet'] ) );
		} else {
			delete_option( 'mcwallet_use_testnet');
		}

		if ( $_POST['statisticEnabled'] == 'true' ) {
			update_option( 'mcwallet_enable_stats', sanitize_text_field( $_POST['statisticEnabled'] ) );
		} else {
			delete_option( 'mcwallet_enable_stats');
		}

		if ( $_POST['disableInternal'] == 'true' ) {
			update_option( 'mcwallet_disable_internal', sanitize_text_field( $_POST['disableInternal'] ) );
		} else {
			delete_option( 'mcwallet_disable_internal' );
		}

		$supported_chains = mcwallet_supperted_chains();
		foreach ($supported_chains as $chain=>$chain_title) {
			if ( $_POST["{$chain}Disabled"] == 'true' ) {
				update_option( "mcwallet_{$chain}_disabled", sanitize_text_field( $_POST["{$chain}Disabled"] ) );
			} else {
				delete_option( "mcwallet_{$chain}_disabled" );
			}
		}

		if ( $_POST['exchangeDisabled'] == 'true' ) {
			update_option( 'mcwallet_exchange_disabled', sanitize_text_field( $_POST['exchangeDisabled'] ) );
		} else {
			delete_option( 'mcwallet_exchange_disabled' );
		}

		if ( $_POST['invoiceEnabled'] == 'true' ) {
			update_option( 'mcwallet_invoice_enabled', sanitize_text_field( $_POST['invoiceEnabled'] ) );
		} else {
			delete_option( 'mcwallet_invoice_enabled' );
		}

		if ( $_POST['SO_addAllEnabledWalletsAfterRestoreOrCreateSeedPhrase'] == 'true' ) {
			update_option( 'mcwallet_show_all_enabled_wallets', sanitize_text_field( 'true' ) );
		} else {
			delete_option( 'mcwallet_show_all_enabled_wallets' );
		}

		if ( $_POST['ghostEnabled'] == 'true' ) {
			update_option( 'mcwallet_ghost_enabled', sanitize_text_field( 'true' ) );
		} else {
			delete_option( 'mcwallet_ghost_enabled' );
		}

    if ( $_POST['fkwDisabled'] == 'false' ) {
      update_option( 'mcwallet_fkw_disabled', sanitize_text_field( 'false' ) );
    } else {
      update_option( 'mcwallet_fkw_disabled', sanitize_text_field( 'true' ) );
    }

    if ( $_POST['phpxDisabled'] == 'false' ) {
      update_option( 'mcwallet_phpx_disabled', sanitize_text_field( 'false' ) );
    } else {
      update_option( 'mcwallet_phpx_disabled', sanitize_text_field( 'true' ) );
    }

		if ( $_POST['nextEnabled'] == 'true' ) {
			update_option( 'mcwallet_next_enabled', sanitize_text_field( 'true' ) );
		} else {
			delete_option( 'mcwallet_next_enabled' );
		}

		if ( $_POST['ishome'] == 'true' ) {
			update_option( 'mcwallet_is_home', sanitize_text_field( $_POST['ishome'] ) );
			$is_home = 'true';
		} else {
			delete_option( 'mcwallet_is_home' );
		}

		if ( $_POST['islogged'] == 'true' ) {
			update_option( 'mcwallet_is_logged', sanitize_text_field( $_POST['islogged'] ) );
			update_option( 'users_can_register', true );
			$is_logged = 'true';
		} else {
			delete_option( 'mcwallet_is_logged' );
			update_option( 'users_can_register', false );
		}

		if ( $_POST['isHowitworks'] == 'true' ) {
			update_option( 'show_howitworks', sanitize_text_field( $_POST['isHowitworks'] ) );
		} else {
			delete_option( 'show_howitworks' );
		}

		$result = esc_attr( mcwallet_page_url() );
		$status = 'success';

	}

	mcwallet_add_rewrite_rules();
	flush_rewrite_rules();

	/* clear cache */
	$cache_dir       = trailingslashit( wp_upload_dir()['basedir'] );
	$cache_dir_files = scandir( $cache_dir );
	$cache_file_mark = 'swap-wallet-app-';
	foreach( $cache_dir_files as $fkey => $file ) {
		$file_ext = explode( '.', $file );
		$file_ext = $file_ext[count($file_ext)-1];
		$file_subname = substr($file,0, strlen($cache_file_mark));
		if (($file_ext === 'js') and ($file_subname === $cache_file_mark)) {
			unlink($cache_dir.$file);
		}
	}
	/* dump result */

	$result_arr = array(
		'status'   => $status,
		'url'      => esc_attr( mcwallet_page_url() ),
		'slug'     => esc_attr( untrailingslashit( sanitize_title( $slug ) ) ),
		'thickbox' => esc_attr( mcwallet_thickbox_url() ),
		'ishome'   => $is_home,
		'islogged' => $is_logged,
		'strings'  => $replacements,
	);

	wp_send_json( $result_arr );

}
add_action( 'wp_ajax_mcwallet_update_options', 'mcwallet_update_options' );
