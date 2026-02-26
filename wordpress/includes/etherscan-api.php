<?php
/**
 * Etherscan API Functions
 * 
 * @package Multi Currency Wallet
 */


/* Service Url Mainnet */
function mcwallet_service_url_mainnet(){
	$service_url_mainnet = ( get_option( 'mcwallet_use_testnet' ) === 'true' ) ? 'api-rinkeby.etherscan.io/api' : 'api.etherscan.io/api';
	return esc_url( $service_url_mainnet, 'https' );
}

/* Service Url Binance */
function mcwallet_service_url_binance(){
	$service_url_mainnet = ( get_option( 'mcwallet_use_testnet' ) === 'true' ) ? 'api-testnet.bscscan.com/api' : 'api.bscscan.com/api';
	return esc_url( $service_url_mainnet, 'https' );
}

/* Service Url Pligon */
function mcwallet_service_url_poligon(){
	// The polygon does not have a test api (more precisely, it does not work correctly) use the mainnet.
	$service_url_mainnet = ( get_option( 'mcwallet_use_testnet' ) === 'true' ) ? 'api.polygonscan.com/api' : 'api.polygonscan.com/api';
	return esc_url( $service_url_mainnet, 'https' );
}

/* Service Url Fantom */
function mcwallet_service_url_fantom(){
	$service_url_mainnet = ( get_option( 'mcwallet_use_testnet' ) === 'true' ) ? 'api-testnet.ftmscan.com/api' : 'api.ftmscan.com/api';
	return esc_url( $service_url_mainnet, 'https' );
}

/* Service Url Avalanche */
function mcwallet_service_url_avalanche(){
	$service_url_mainnet = ( get_option( 'mcwallet_use_testnet' ) === 'true' ) ? 'testnet.snowtrace.io/api' : 'api.snowtrace.io/api';
	return esc_url( $service_url_mainnet, 'https' );
}

/* Service Url Moonriver */
function mcwallet_service_url_moonriver(){
	$service_url_mainnet = ( get_option( 'mcwallet_use_testnet' ) === 'true' ) ? 'api-moonbase.moonscan.io/api' : 'api-moonriver.moonscan.io/api';
	return esc_url( $service_url_mainnet, 'https' );
}

/* Service Url Aurora */
function mcwallet_service_url_aurora(){
	$service_url_mainnet = ( get_option( 'mcwallet_use_testnet' ) === 'true' ) ? 'api-testnet.aurorascan.dev/api' : 'api.aurorascan.dev/api';
	return esc_url( $service_url_mainnet, 'https' );
}

/* Fokawa Url */
function mcwallet_service_url_fkw() {
  $service_url_mainnet = ( get_option( 'mcwallet_use_testnet' ) === 'true' ) ? '' : 'explorer.fokawa.com/api';
	return esc_url( $service_url_mainnet, 'https' );
}

function mcwallet_service_url_phpx() {
  $service_url_mainnet = ( get_option( 'mcwallet_use_testnet' ) === 'true' ) ? 'https://explorer.phpx.network/api' : 'https://explorer.phpx.network/api';
	return esc_url( $service_url_mainnet, 'https' );
}
/* Service Phi-v2 */
function mcwallet_service_url_phiv2() {
  return esc_url( 'https://phiscan.io/api', 'https' );
}

/* Service Api Token */
function mcwallet_service_api_token( $standart = 'erc20' ){
	$service_api_token = 'X88AP9B52SENYPTR31W5SGRK5EGJZD2BJC';
	if ( 'bep20' === $standart ) $service_api_token = 'WI4QEJSV19U3TF2H1DPQ2HR6712HW4MYKJ';
	if ( 'erc20matic' === $standart ) $service_api_token = '8S2R45ZWG94HI7YK9RCXSK4VCASJ4XVA15';
	if ( 'erc20ftm' === $standart ) $service_api_token = 'J39MXI2KQ7YWFR3JGYHPVYK1MIH132QSXP';
	if ( 'erc20avax' === $standart ) $service_api_token = 'BEDYVGMKPM4HXIVD16B1Z66D5R75D9AHNC';
	if ( 'erc20movr' === $standart ) $service_api_token = 'VHG8YAQMA78MAQKU7C73Z4UQ2A83S4IBGW';
	if ( 'erc20aurora' === $standart ) $service_api_token = 'J9ZZ9C6FI4YHJVISBI2VYRRJ1MTU3ID45Q';
  if ( 'phi20_v2' === $standart ) $service_api_token = '';
  if ( 'fkw20' === $standart ) $service_api_token = '';
  if ( 'phpx20' === $standart ) $service_api_token = '';
	return $service_api_token;
}

/* Get Signature */
function mcwallet_get_signature( $signature = 'name' ){
	$signature_code = '0x06fdde03';
	if ( 'symbol' === $signature ) {
		$signature_code = '0x95d89b41';
	} elseif ( 'decimals' === $signature ) {
		$signature_code = '0x313ce567';
	}
	return $signature_code;
}

/* Get Args Url */
function mcwallet_get_args_url( $standart = 'erc20' ){
	$args = array(
		'module' => 'proxy',
		'action' => 'eth_call',
		'data'   => mcwallet_get_signature(),
		'apikey' => mcwallet_service_api_token( $standart ),
	);
	return $args;
}

/* Get Remote Url */
function mcwallet_get_remote_url( $result = 'name', $address = '', $standart = 'erc20' ){
	$args = mcwallet_get_args_url($standart);
	if ( $address ) {
		$args['to'] = $address;
	}
	if ( $result ) {
		$result = mcwallet_get_signature( $result );
		$args['data'] = $result;
	}

	$url = '';
	if ( 'erc20' === $standart ) {
		$url = mcwallet_service_url_mainnet();
	}
	if ( 'bep20' === $standart ) {
		$url = mcwallet_service_url_binance();
	}
	if ( 'erc20matic' === $standart ) {
		$url = mcwallet_service_url_poligon();
	}
	if ( 'erc20ftm' === $standart ) {
		$url = mcwallet_service_url_fantom();
	}
	if ( 'erc20avax' === $standart ) {
		$url = mcwallet_service_url_avalanche();
	}
	if ( 'erc20movr' === $standart ) {
		$url = mcwallet_service_url_moonriver();
	}
	if ( 'erc20aurora' === $standart ) {
		$url = mcwallet_service_url_aurora();
	}
  if ( 'phi20_v2' === $standart) {
    $url = mcwallet_service_url_phiv2();
  }
  if ( 'fkw20' === $standart) {
    $url = mcwallet_service_url_fkw();
  }
  if ( 'phpx20' === $standart) {
    $url = mcwallet_service_url_phpx();
  }
	$swap_remote_url = add_query_arg(
		$args,
		$url
	);
	return $swap_remote_url;
}

/**
 * Is Address
 */
function mcwallet_is_address( $address = '', $standart = 'erc20' ){
  if (in_array($standart, MC_WALLET_USED_TOKEN_MODULE_STANDART)) {
    $url = false;
    switch ($standart) {
      case 'phi20_v2':
        $url = mcwallet_service_url_phiv2();
        break;
      case 'fkw20':
        $url = mcwallet_service_url_fkw();
        break;
      case 'phpx20':
        $url = mcwallet_service_url_phpx();
        break;
    }
    if ($url !== false) {
      $args = array(
        'module' => 'token',
        'action' => 'getToken',
        'contractaddress' => $address
      );

      $swap_remote_url = add_query_arg(
        $args,
        $url
      );

      $response = wp_remote_get( $swap_remote_url );

      if ( wp_remote_retrieve_response_code( $response ) === 200 ){
        $response_body = wp_remote_retrieve_body( $response );
        $body = json_decode( $response_body, true);

        if (isset($body['message']) and ($body['message'] === 'OK')) {
          return true;
        }
      }
    }
    return false;
  }
	$url = mcwallet_get_remote_url( 'name', $address, $standart );
  $response = wp_remote_get( $url );

	if ( wp_remote_retrieve_response_code( $response ) === 200 ){
		$response_body = wp_remote_retrieve_body( $response );
		$body = json_decode( $response_body );
		if ( isset( $body->result ) ) {
			if ( $body->result !== '0x' ) {
				return true;
			}
		}
	}

	return false;
}

/**
 * Get Remote Result
 */
function mcwallet_get_remote_result( $result = 'name', $address = '', $standart = 'erc20' ){
  if (in_array($standart, MC_WALLET_USED_TOKEN_MODULE_STANDART)) {
    $url = false;
    switch ($standart) {
      case 'phi20_v2':
        $url = mcwallet_service_url_phiv2();
        break;
      case 'fkw20':
        $url = mcwallet_service_url_fkw();
        break;
      case 'phpx20':
        $url = mcwallet_service_url_phpx();
        break;
    }
    if ($url !== false) {
      $args = array(
        'module' => 'token',
        'action' => 'getToken',
        'contractaddress' => $address
      );
      $swap_remote_url = add_query_arg(
        $args,
        $url
      );
      $response = wp_remote_get( $swap_remote_url );

      if ( wp_remote_retrieve_response_code( $response ) === 200 ){
        $response_body = wp_remote_retrieve_body( $response );
        $body = json_decode( $response_body, true);
        if (isset($body['message']) and ($body['message'] === 'OK') and isset($body['result'])) {
          switch($result) {
            case 'name':
              return $body['result']['name'];
            case 'decimals':
              return $body['result']['decimals'];
            case 'symbol':
              return $body['result']['symbol'];
          }
        }
      }
    }
    return false;
  }
	$url = mcwallet_get_remote_url( $result, $address, $standart );
	$response = wp_remote_get( $url );
	if ( wp_remote_retrieve_response_code( $response ) === 200 ){
		$response_body = wp_remote_retrieve_body( $response );
		$body = json_decode( $response_body );
		if ( isset( $body->result ) ) {
			return $body->result;
		}
	}
	return false;
}
