<?php
/**
 * Functions
 * 
 * @package Multi Currency Wallet
 */

/**
 * Redefine logout
 */
if (!function_exists( 'wp_logout' ) ) {
	/**
	 * Log the current user out.
	 *
	 * @since 2.5.0
	 */
	function wp_logout() {
		$users_must_be_registered = (get_option( 'mcwallet_is_logged' ) == 'true');
		$save_userData = (get_option( 'mcwallet_remember_userwallet' ) == 'true');
		$is_adminPage = (strpos(strtolower($_SERVER['HTTP_REFERER']), '/wp-admin') !== false);

		if ($is_adminPage and $save_userData) {
			header('Location: '.mcwallet_page_url().'/#/exit');
			exit();
		} else {
			wp_destroy_current_session();
			wp_clear_auth_cookie();
			wp_set_current_user( 0 );

			do_action( 'wp_logout' );
		}
	}
}

/**
 * Default Page slug
 */
function mcwallet_default_slug(){
	return 'mcwallet';
}

/**
 * Page slug
 */
function mcwallet_page_slug(){
	$slug = mcwallet_default_slug();
	if( get_option('mcwallet_slug') ) {
		$slug = get_option('mcwallet_slug');
	}
	return esc_html( $slug );
}

/**
 * Wallet Page Url
 */
function mcwallet_page_url(){
	$page_url = home_url('/' . mcwallet_page_slug() . '/');
	return esc_url( trailingslashit( $page_url ) );
}

/**
 * Logo Url
 */
function mcwallet_logo_url(){
	$logo_url = MCWALLET_URL . 'assets/images/logo.svg';
	if ( get_option( 'mcwallet_logo' ) ) {
		$logo_url = get_option( 'mcwallet_logo' );
	}
	return esc_url( $logo_url );
}

/**
 * Dark Logo Url
 */
function mcwallet_dark_logo_url(){
	$logo_url = MCWALLET_URL . 'assets/images/logo.svg';
	if ( get_option( 'mcwallet_dark_logo' ) ) {
		$logo_url = get_option( 'mcwallet_dark_logo' );
	} elseif ( get_option( 'mcwallet_logo' ) ) {
		$logo_url = get_option( 'mcwallet_logo' );
	}
	return esc_url( $logo_url );
}

/**
 * Wallet Thickbox url
 */
function mcwallet_thickbox_url(){
	$mcwallet_url = add_query_arg( array(
		'KeepThis'  => 'true',
		'TB_iframe' => 'true',
		'width'     => '1000',
		'height'    => '650'
	), mcwallet_page_url() );
	return esc_url( $mcwallet_url );
}

/**
 * Widget template head
 */
function mcwallet_head(){
	do_action( 'mcwallet_head');
}

/**
 * Widget template body open
 */
function mcwallet_body_open(){
	do_action( 'mcwallet_body_open');
}

/**
 * Widget template footer
 */
function mcwallet_footer(){
	do_action( 'mcwallet_footer');
}

/**
 * Is widget
 */
function mcwallet_is(){
	if ( get_option( 'mcwallet_tokens' ) ) {
		return true;
	}
	return false;
}

/**
 * Check if a remote image file exists.
 */
function mcwallet_remote_image_file_exists( $url ) {
	$response = wp_remote_head( $url );
	return 200 === wp_remote_retrieve_response_code( $response );
}

/**
 * Get first token letter
 */
function mcwallet_token_letter( $token = '' ) {
	$letter = false;
	if ( $token ){
		$letter = strtoupper( $token[0] );
	}
	return $letter;
}

/**
 * Create a virtual permalink
 */
add_filter( 'query_vars', function( $vars ){
	$vars[] = 'mcwallet_page';
	return $vars;
} );

/**
 * Page template path
 */
function mcwallet_template_path(){
	$template = MCWALLET_PATH . '/template/template.php';
	return $template;
}

/**
 * Add rewrite rule
 */
function mcwallet_add_rewrite_rules() {
	$slug = 'mcwallet';
	if ( get_option('mcwallet_slug') ) {
		$slug = get_option('mcwallet_slug');
	}
	add_rewrite_rule( $slug . '/?$', 'index.php?mcwallet_page=1','top' );
}
add_action('init', 'mcwallet_add_rewrite_rules');

/**
 * Add rewrite rule
 */
function mcwallet_default_token() {
	$token = array(
		'usdt'        => array(
			'name'        => 'TetherUSD',
			'symbol'      => 'usdt',
			'address'     => '0xdac17f958d2ee523a2206206994597c13d831ec7',
			'decimals'    => '6',
			'icon'        => '',
			'rate'        => '',
			'bg'          => '',
			'howdeposit'  => '',
			'howwithdraw' => '',
			'standard'    => 'erc20',
			'order'       => 1,
		),
		'wmatic'      => array(
			'name'        => 'WrappedMatic',
			'symbol'      => 'wmatic',
			'address'     => '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
			'decimals'    => '18',
			'icon'        => '',
			'rate'        => '',
			'bg'          => '',
			'howdeposit'  => '',
			'howwithdraw' => '',
			'standard'    => 'erc20matic',
			'order'       => 2,
		)
	);
	return $token;
}

/**
 * Add rewrite rule
 */
function mcwallet_add_default_token() {
	if ( false !== get_option( 'mcwallet_tokens' ) ) {
		return;
	}
	$token = mcwallet_default_token();
	update_option( 'mcwallet_tokens', $token );
}

/**
 * Include template
 */
function mcwallet_include_template( $template ) {
	if ( get_query_var( 'mcwallet_page' ) ) {
		$template = mcwallet_template_path();
	}
	return $template;
}
add_filter( 'template_include', 'mcwallet_include_template');

/**
 * Custom template for front page
 */
if ( get_option( 'mcwallet_is_home' ) ) {
	function mcwallet_page_template( $page_template ) {
		if ( is_front_page() || is_home() ) {
			$page_template = mcwallet_template_path();
		}
		return $page_template;
	}
	add_filter( 'template_include', 'mcwallet_page_template' );
}

/**
 * Add favicon
 */
function mcwallet_wp_site_icon() {
	wp_site_icon();
}
add_action( 'mcwallet_head', 'mcwallet_wp_site_icon' );

/**
 * Disable admin use info
 */
function mcwallet_show_admin_use() {
	return false;
}

/**
 * Update plugin db version
 */
function mcwallet_update_version() {
	update_option( 'mcwallet_version', MCWALLET_VER );
}

/**
 * Get logo redirect link
 */
function mcwallet_get_logo_redirect_link() {
	$logo_redirect_link = esc_attr( get_option('mcwallet_logo_link', get_home_url( '/' ) ) );
	return $logo_redirect_link;
}

/**
 * Set default colors
 */
function mcwallet_default_colors() {
	$colors = array(
		'text' => array(
			'default' => '#000000',
			'dark'    => '#ffffff',
			'label'   => esc_html__( 'Text Color', 'multi-currency-wallet' ),
		),
		'background' => array(
			'default' => '#f7f7f7',
			'dark'    => '#222427',
			'label'   => esc_html__( 'Site Background', 'multi-currency-wallet' ),
		),
		'brand' => array(
			'default' => '#6144e5',
			'dark'    => '#6144e5',
			'label'   => esc_html__( 'Brand Color', 'multi-currency-wallet' ),
		),
		'brand_hover' => array(
			'default' => '#7371ff',
			'dark'    => '#7371ff',
			'label'   => esc_html__( 'Brand Color Hover', 'multi-currency-wallet' ),
		),
		'brand_background' => array(
			'default' => '#6144e51a',
			'dark'    => '#6144e51a',
			'label'   => esc_html__( 'Brand Background', 'multi-currency-wallet' ),
		),
	);
	return apply_filters( 'mcwallet_default_colors', $colors );
}

/**
 * Get default color
 */
function mcwallet_get_default_color( $name = null, $scheme = 'default' ) {
	$colors = mcwallet_get_default_colors();
	$color  = '';
	if ( isset( $colors[ $name ][ $scheme ] ) ) {
		$color = $colors[ $name ][ $scheme ];
	}
	return $color;
}

/**
 * Get colors
 */
function mcwallet_get_colors() {
	$default_colors = mcwallet_default_colors();

	$colors = $default_colors;

	foreach ( $default_colors as $name => $value ) {
		if ( get_theme_mod( 'color_' . $name ) ) {
			$colors[ $name ]['default'] = get_theme_mod( 'color_' . $name );
		}
		if ( get_theme_mod( 'color_' . $name . '_dark' ) ) {
			$colors[ $name ]['dark'] = get_theme_mod( 'color_' . $name . '_dark' );
		}
	}

	return $colors;
}

/**
 * Get color
 */
function mcwallet_get_color( $name = null, $scheme = 'default', $default = '' ) {
	if ( ! $name ) {
		return;
	}
	$color  = '';
	$colors = mcwallet_get_colors();
	if ( isset( $colors[ $name ][ $scheme ] ) ) {
		$color = $colors[ $name ][ $scheme ];
		if ( $default && ! $color ) {
			$color = $default;
		}
	}
	return $color;
}

/**
 * Inline scheme colors style
 */
function mcwallet_inline_scheme_colors(){
	?>
:root,
[data-scheme="default"] {
	--color: <?php echo esc_html( mcwallet_get_color( 'text' ) ); ?>;
	--color-page-background: <?php echo esc_html( mcwallet_get_color( 'background' ) ); ?>;
	--color-brand: <?php echo esc_html( mcwallet_get_color( 'brand' ) ); ?>;
	--color-brand-hover: <?php echo esc_html( mcwallet_get_color( 'brand_hover' ) ); ?>;
	--color-brand-background: <?php echo esc_html( mcwallet_get_color( 'brand_background' ) ); ?>;
}
[data-scheme="dark"],
.darkTheme {
	--color: <?php echo esc_html( mcwallet_get_color( 'text', 'dark' ) ); ?>;
	--color-page-background: <?php echo esc_html( mcwallet_get_color( 'background', 'dark' ) ); ?>;
	--color-brand: <?php echo esc_html( mcwallet_get_color( 'brand', 'dark' ) ); ?>;
	--color-brand-hover: <?php echo esc_html( mcwallet_get_color( 'brand_hover', 'dark' ) ); ?>;
	--color-brand-background: <?php echo esc_html( mcwallet_get_color( 'brand_background', 'dark' ) ); ?>;
}
:root,
[data-scheme="default"],
[data-scheme="dark"] {
  --button-border-radius: <?php echo esc_attr( get_theme_mod( 'button_border_radius', '0' ) ); ?>rem;
  --main-component-border-radius: <?php echo esc_attr( get_theme_mod( 'main_component_border_radius', '0' ) ); ?>rem;
}
<?php
}

function mcwallet_scheme_attr() {
	$scheme       = 'default';
	$color_scheme = get_theme_mod( 'color_scheme', 'light' );
	if ( 'dark' === $color_scheme || 'only_dark' === $color_scheme ) {
		$scheme = 'dark';
	}
	echo 'data-scheme="' . esc_attr( $scheme ) . '"';
}

/**
 * Hex To String
 *
 * @link http://www.jonasjohn.de/snippets/php/hex-string.htm
 */
function mcwallet_hex_to_string( $hex, $standart) { 
  if (in_array($standart, MC_WALLET_USED_TOKEN_MODULE_STANDART)) return $hex;
	$string = '';
	$arr = explode("\n", trim( chunk_split( $hex, 2 ) ) );
	foreach( $arr as $h) {
		$string .= chr( hexdec( $h ) ); 
	}
	$string = preg_replace('/[^A-Za-z0-9]/', '', $string);
	return $string; 
}

/**
 * Convert Hex to Number
 *
 * @link http://php.net/manual/ru/function.hexdec.php#97172
 */
function mcwallet_hex_to_number( $hex, $standart ) {
  if (in_array($standart, MC_WALLET_USED_TOKEN_MODULE_STANDART)) return $hex;
	$hex = preg_replace( '/[^0-9A-Fa-f]/', '', $hex );
	$dec = hexdec( $hex );
	$max = pow(2, 4 * (strlen($hex) + (strlen($hex) % 2)));
	$_dec = $max - $dec;
	return $dec > $_dec ? -$_dec : $dec;
}

/**
 * Supported Chains
 * 
 * List of supported networks, used to create "Disable network" options.
 */
function mcwallet_supperted_chains() {
	$supperted_chains = array(
		'btc'      => 'BTC',
		'eth'      => 'ETH',
		'bnb'      => 'BNB',
		'matic'    => 'MATIC',
		'ftm'      => 'FTM',
		'avax'     => 'AVAX',
		'movr'     => 'MOVR',
		'one'      => 'ONE',
		'arbitrum' => 'ARBITRUM',
		'aurora'   => 'AURORA',
		'phi'      => 'PHI',
    'phi_v2'   => 'PHI-V2',
		'ame'      => 'AME',
		'xdai'     => 'XDAI',
    'phpx'     => 'PHPX'
	);
	return apply_filters( 'mcwallet_supperted_chains', $supperted_chains );
}

/**
 * Get valutes
 */ 
function mcwallet_get_valutes() {

	$valutes = array(
		'USD' => esc_html__( 'US dollar', 'multi-currency-wallet' ),
		'EUR' => esc_html__( 'Euro', 'multi-currency-wallet' ),
		'JPY' => esc_html__( 'Japanese', 'multi-currency-wallet' ),
		'GBP' => esc_html__( 'Pound sterling', 'multi-currency-wallet' ),
		''    => '──────────',
		'AED' => esc_html__( 'United Arab Emirates dirham', 'multi-currency-wallet' ),
		'AFN' => esc_html__( 'Afghan afghani', 'multi-currency-wallet' ),
		'ALL' => esc_html__( 'Albanian lek', 'multi-currency-wallet' ),
		'AMD' => esc_html__( 'Armenian dram', 'multi-currency-wallet' ),
		'ANG' => esc_html__( 'Netherlands Antillean guilder', 'multi-currency-wallet' ),
		'AOA' => esc_html__( 'Angolan kwanza', 'multi-currency-wallet' ),
		'ARS' => esc_html__( 'Argentine peso', 'multi-currency-wallet' ),
		'AUD' => esc_html__( 'Australian dollar', 'multi-currency-wallet' ),
		'AWG' => esc_html__( 'Aruban florin', 'multi-currency-wallet' ),
		'AZN' => esc_html__( 'Azerbaijani manat', 'multi-currency-wallet' ),
		'BAM' => esc_html__( 'Bosnia and Herzegovina convertible mark', 'multi-currency-wallet' ),
		'BBD' => esc_html__( 'Barbadian dollar', 'multi-currency-wallet' ),
		'BDT' => esc_html__( 'Bangladeshi taka', 'multi-currency-wallet' ),
		'BGN' => esc_html__( 'Bulgarian lev', 'multi-currency-wallet' ),
		'BHD' => esc_html__( 'Bahraini dinar', 'multi-currency-wallet' ),
		'BIF' => esc_html__( 'Burundian franc', 'multi-currency-wallet' ),
		'BMD' => esc_html__( 'Bermudian dollar', 'multi-currency-wallet' ),
		'BND' => esc_html__( 'Brunei dollar', 'multi-currency-wallet' ),
		'BOB' => esc_html__( 'Bolivian boliviano', 'multi-currency-wallet' ),
		'BRL' => esc_html__( 'Brazilian real', 'multi-currency-wallet' ),
		'BSD' => esc_html__( 'Bahamian dollar', 'multi-currency-wallet' ),
		'BTN' => esc_html__( 'Bhutanese ngultrum', 'multi-currency-wallet' ),
		'BWP' => esc_html__( 'Botswana pula', 'multi-currency-wallet' ),
		'BYN' => esc_html__( 'Belarusian ruble', 'multi-currency-wallet' ),
		'BZD' => esc_html__( 'Belize dollar', 'multi-currency-wallet' ),
		'CAD' => esc_html__( 'Canadian dollar', 'multi-currency-wallet' ),
		'CDF' => esc_html__( 'Congolese franc', 'multi-currency-wallet' ),
		'CHF' => esc_html__( 'Swiss franc', 'multi-currency-wallet' ),
		'CLP' => esc_html__( 'Chilean peso', 'multi-currency-wallet' ),
		'CNY' => esc_html__( 'Chinese yuan', 'multi-currency-wallet' ),
		'COP' => esc_html__( 'Colombian peso', 'multi-currency-wallet' ),
		'CRC' => esc_html__( 'Costa Rican colón', 'multi-currency-wallet' ),
		'CUC' => esc_html__( 'Cuban convertible peso', 'multi-currency-wallet' ),
		'CUP' => esc_html__( 'Cuban peso', 'multi-currency-wallet' ),
		'CVE' => esc_html__( 'Cape Verdean escudo', 'multi-currency-wallet' ),
		'CZK' => esc_html__( 'Czech koruna', 'multi-currency-wallet' ),
		'DJF' => esc_html__( 'Djiboutian franc', 'multi-currency-wallet' ),
		'DKK' => esc_html__( 'Danish krone', 'multi-currency-wallet' ),
		'DOP' => esc_html__( 'Dominican peso', 'multi-currency-wallet' ),
		'DZD' => esc_html__( 'Algerian dinar', 'multi-currency-wallet' ),
		'EGP' => esc_html__( 'Egyptian pound', 'multi-currency-wallet' ),
		'ERN' => esc_html__( 'Eritrean nakfa', 'multi-currency-wallet' ),
		'ETB' => esc_html__( 'Ethiopian birr', 'multi-currency-wallet' ),
		'EUR' => esc_html__( 'EURO', 'multi-currency-wallet' ),
		'FJD' => esc_html__( 'Fijian dollar', 'multi-currency-wallet' ),
		'FKP' => esc_html__( 'Falkland Islands pound', 'multi-currency-wallet' ),
		'GBP' => esc_html__( 'British pound', 'multi-currency-wallet' ),
		'GEL' => esc_html__( 'Georgian lari', 'multi-currency-wallet' ),
		'GGP' => esc_html__( 'Guernsey pound', 'multi-currency-wallet' ),
		'GHS' => esc_html__( 'Ghanaian cedi', 'multi-currency-wallet' ),
		'GIP' => esc_html__( 'Gibraltar pound', 'multi-currency-wallet' ),
		'GMD' => esc_html__( 'Gambian dalasi', 'multi-currency-wallet' ),
		'GNF' => esc_html__( 'Guinean franc', 'multi-currency-wallet' ),
		'GTQ' => esc_html__( 'Guatemalan quetzal', 'multi-currency-wallet' ),
		'GYD' => esc_html__( 'Guyanese dollar', 'multi-currency-wallet' ),
		'HKD' => esc_html__( 'Hong Kong dollar', 'multi-currency-wallet' ),
		'HNL' => esc_html__( 'Honduran lempira', 'multi-currency-wallet' ),
		'HKD' => esc_html__( 'Hong Kong dollar', 'multi-currency-wallet' ),
		'HRK' => esc_html__( 'Croatian kuna', 'multi-currency-wallet' ),
		'HTG' => esc_html__( 'Haitian gourde', 'multi-currency-wallet' ),
		'HUF' => esc_html__( 'Hungarian forint', 'multi-currency-wallet' ),
		'IDR' => esc_html__( 'Indonesian rupiah', 'multi-currency-wallet' ),
		'ILS' => esc_html__( 'Israeli new shekel', 'multi-currency-wallet' ),
		'IMP' => esc_html__( 'Manx pound', 'multi-currency-wallet' ),
		'INR' => esc_html__( 'Indian rupee', 'multi-currency-wallet' ),
		'IQD' => esc_html__( 'Iraqi dinar', 'multi-currency-wallet' ),
		'IRR' => esc_html__( 'Iranian rial', 'multi-currency-wallet' ),
		'ISK' => esc_html__( 'Icelandic króna', 'multi-currency-wallet' ),
		'JEP' => esc_html__( 'Jersey pound', 'multi-currency-wallet' ),
		'JMD' => esc_html__( 'Jamaican dollar', 'multi-currency-wallet' ),
		'JOD' => esc_html__( 'Jordanian dinar', 'multi-currency-wallet' ),
		'JPY' => esc_html__( 'Japanese yen', 'multi-currency-wallet' ),
		'KES' => esc_html__( 'Kenyan shilling', 'multi-currency-wallet' ),
		'KGS' => esc_html__( 'Kyrgyzstani som', 'multi-currency-wallet' ),
		'KHR' => esc_html__( 'Cambodian riel', 'multi-currency-wallet' ),
		'KID' => esc_html__( 'Kiribati dollar', 'multi-currency-wallet' ),
		'KMF' => esc_html__( 'Comorian franc', 'multi-currency-wallet' ),
		'KPW' => esc_html__( 'North Korean won', 'multi-currency-wallet' ),
		'KRW' => esc_html__( 'South Korean won', 'multi-currency-wallet' ),
		'KWD' => esc_html__( 'Kuwaiti dinar', 'multi-currency-wallet' ),
		'KYD' => esc_html__( 'Cayman Islands dollar', 'multi-currency-wallet' ),
		'KZT' => esc_html__( 'Kazakhstani tenge', 'multi-currency-wallet' ),
		'LAK' => esc_html__( 'Lao kip', 'multi-currency-wallet' ),
		'LBP' => esc_html__( 'Lebanese pound', 'multi-currency-wallet' ),
		'LKR' => esc_html__( 'Sri Lankan rupee', 'multi-currency-wallet' ),
		'LRD' => esc_html__( 'Liberian dollar', 'multi-currency-wallet' ),
		'LSL' => esc_html__( 'Lesotho loti', 'multi-currency-wallet' ),
		'LYD' => esc_html__( 'Libyan dinar', 'multi-currency-wallet' ),
		'MAD' => esc_html__( 'Moroccan dirham', 'multi-currency-wallet' ),
		'MDL' => esc_html__( 'Moldovan leu', 'multi-currency-wallet' ),
		'MGA' => esc_html__( 'Malagasy ariary', 'multi-currency-wallet' ),
		'MKD' => esc_html__( 'Macedonian denar', 'multi-currency-wallet' ),
		'MMK' => esc_html__( 'Burmese kyat', 'multi-currency-wallet' ),
		'MNT' => esc_html__( 'Mongolian tögrög', 'multi-currency-wallet' ),
		'MOP' => esc_html__( 'Macanese pataca', 'multi-currency-wallet' ),
		'MRU' => esc_html__( 'Mauritanian ouguiya', 'multi-currency-wallet' ),
		'MUR' => esc_html__( 'Mauritian rupee', 'multi-currency-wallet' ),
		'MVR' => esc_html__( 'Maldivian rufiyaa', 'multi-currency-wallet' ),
		'MWK' => esc_html__( 'Malawian kwacha', 'multi-currency-wallet' ),
		'MXN' => esc_html__( 'Mexican peso', 'multi-currency-wallet' ),
		'MYR' => esc_html__( 'Malaysian ringgit', 'multi-currency-wallet' ),
		'MZN' => esc_html__( 'Mozambican metical', 'multi-currency-wallet' ),
		'NAD' => esc_html__( 'Namibian dollar', 'multi-currency-wallet' ),
		'NGN' => esc_html__( 'Nigerian naira', 'multi-currency-wallet' ),
		'NIO' => esc_html__( 'Nicaraguan córdoba', 'multi-currency-wallet' ),
		'NOK' => esc_html__( 'Norwegian krone', 'multi-currency-wallet' ),
		'NPR' => esc_html__( 'Nepalese rupee', 'multi-currency-wallet' ),
		'NZD' => esc_html__( 'New Zealand dollar', 'multi-currency-wallet' ),
		'OMR' => esc_html__( 'Omani rial', 'multi-currency-wallet' ),
		'PAB' => esc_html__( 'Panamanian balboa', 'multi-currency-wallet' ),
		'PEN' => esc_html__( 'Peruvian sol', 'multi-currency-wallet' ),
		'PGK' => esc_html__( 'Papua New Guinean kina', 'multi-currency-wallet' ),
		'PHP' => esc_html__( 'Philippine peso', 'multi-currency-wallet' ),
		'PKR' => esc_html__( 'Pakistani rupee', 'multi-currency-wallet' ),
		'PLN' => esc_html__( 'Polish złoty', 'multi-currency-wallet' ),
		'PRB' => esc_html__( 'Transnistrian ruble', 'multi-currency-wallet' ),
		'PYG' => esc_html__( 'Paraguayan guaraní', 'multi-currency-wallet' ),
		'QAR' => esc_html__( 'Qatari riyal', 'multi-currency-wallet' ),
		'RON' => esc_html__( 'Romanian leu', 'multi-currency-wallet' ),
		'RON' => esc_html__( 'Romanian leu', 'multi-currency-wallet' ),
		'RSD' => esc_html__( 'Serbian dinar', 'multi-currency-wallet' ),
		'RUB' => esc_html__( 'Russian ruble', 'multi-currency-wallet' ),
		'RWF' => esc_html__( 'Rwandan franc', 'multi-currency-wallet' ),
		'SAR' => esc_html__( 'Saudi riyal', 'multi-currency-wallet' ),
		'SEK' => esc_html__( 'Swedish krona', 'multi-currency-wallet' ),
		'SGD' => esc_html__( 'Singapore dollar', 'multi-currency-wallet' ),
		'SHP' => esc_html__( 'Saint Helena pound', 'multi-currency-wallet' ),
		'SLL' => esc_html__( 'Sierra Leonean leone', 'multi-currency-wallet' ),
		'SLS' => esc_html__( 'Somaliland shilling', 'multi-currency-wallet' ),
		'SOS' => esc_html__( 'Somali shilling', 'multi-currency-wallet' ),
		'SRD' => esc_html__( 'Surinamese dollar', 'multi-currency-wallet' ),
		'SSP' => esc_html__( 'South Sudanese pound', 'multi-currency-wallet' ),
		'STN' => esc_html__( 'São Tomé and Príncipe dobra', 'multi-currency-wallet' ),
		'SYP' => esc_html__( 'Syrian pound', 'multi-currency-wallet' ),
		'SZL' => esc_html__( 'Swazi lilangeni', 'multi-currency-wallet' ),
		'THB' => esc_html__( 'Thai baht', 'multi-currency-wallet' ),
		'TJS' => esc_html__( 'Tajikistani somoni', 'multi-currency-wallet' ),
		'TMT' => esc_html__( 'Turkmenistan manat', 'multi-currency-wallet' ),
		'TND' => esc_html__( 'Tunisian dinar', 'multi-currency-wallet' ),
		'TOP' => esc_html__( 'Tongan paʻanga', 'multi-currency-wallet' ),
		'TRY' => esc_html__( 'Turkish lira', 'multi-currency-wallet' ),
		'TTD' => esc_html__( 'Trinidad and Tobago dollar', 'multi-currency-wallet' ),
		'TVD' => esc_html__( 'Tuvaluan dollar', 'multi-currency-wallet' ),
		'TWD' => esc_html__( 'New Taiwan dollar', 'multi-currency-wallet' ),
		'TZS' => esc_html__( 'Tanzanian shilling', 'multi-currency-wallet' ),
		'UAH' => esc_html__( 'Ukrainian hryvnia', 'multi-currency-wallet' ),
		'UGX' => esc_html__( 'Ugandan shilling', 'multi-currency-wallet' ),
		'USD' => esc_html__( 'United States dollar', 'multi-currency-wallet' ),
		'UYU' => esc_html__( 'Uruguayan peso', 'multi-currency-wallet' ),
		'UZS' => esc_html__( 'Uzbekistani soʻm', 'multi-currency-wallet' ),
		'VES' => esc_html__( 'Venezuelan bolívar soberano', 'multi-currency-wallet' ),
		'VND' => esc_html__( 'Vietnamese đồng', 'multi-currency-wallet' ),
		'VUV' => esc_html__( 'Vanuatu vatu', 'multi-currency-wallet' ),
		'WST' => esc_html__( 'Samoan tālā', 'multi-currency-wallet' ),
		'XAF' => esc_html__( 'Central African CFA franc', 'multi-currency-wallet' ),
		'XCD' => esc_html__( 'Eastern Caribbean dollar', 'multi-currency-wallet' ),
		'XOF' => esc_html__( 'West African CFA franc', 'multi-currency-wallet' ),
		'XPF' => esc_html__( 'CFP franc', 'multi-currency-wallet' ),
		'ZAR' => esc_html__( 'South African rand', 'multi-currency-wallet' ),
		'ZMW' => esc_html__( 'Zambian kwacha', 'multi-currency-wallet' ),
		'ZWB' => esc_html__( 'Zimbabwean bonds', 'multi-currency-wallet' ),
	);

	return $valutes;
}
