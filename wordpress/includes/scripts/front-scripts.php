<?php
/**
 * Front Scripts
 * 
 * @package Envato API Functions
 */

/**
 * Enqueue Scripts
 */
function mcwallet_enqueue_scripts() {
	$use_testnet = (get_option( 'mcwallet_use_testnet' ) === 'true');
	/* Register styles */
	wp_register_style( 'mcwallet-bootstrap', MCWALLET_URL . 'assets/css/bootstrap.min.css', false, '4.3.1' );
	wp_register_style( 'fontawesome', MCWALLET_URL . 'assets/css/fontawesome.min.css', false, '5.7.21-' . MCWALLET_VER );
	wp_register_style( 'swiper', MCWALLET_URL . 'assets/css/swiper.min.css', false, '4.5.1' );
	wp_register_style( 'mcwallet-style', MCWALLET_URL . 'assets/css/style.css', false, MCWALLET_VER . '-' . MCWALLET_BUILD_VER );
	/* Google Fonts */
	wp_register_style( 'mcwallet-google-fonts', mcwallet_fonts_url(), array(), MCWALLET_VER . '-' . MCWALLET_BUILD_VER );
	if ($use_testnet) {
		wp_register_style( 'mcwallet-app', MCWALLET_URL . 'vendors/swap/testnet/app.css', false, MCWALLET_VER . '-' . MCWALLET_BUILD_VER );
	} else {
		wp_register_style( 'mcwallet-app', MCWALLET_URL . 'vendors/swap/app.css', false, MCWALLET_VER . '-' . MCWALLET_BUILD_VER );
	}
	/* Register Scripts */
	wp_register_script( 'swiper', MCWALLET_URL . 'assets/js/swiper.min.js', array(), '4.5.1', true );
	if ($use_testnet) {
		wp_register_script( 'mcwallet-vendor', MCWALLET_URL . 'vendors/swap/testnet/vendor.js', array( 'react-dom', 'swiper' ), MCWALLET_VER . '-' . MCWALLET_BUILD_VER, true );
	} else {
		wp_register_script( 'mcwallet-vendor', MCWALLET_URL . 'vendors/swap/vendor.js', array( 'react-dom', 'swiper' ), MCWALLET_VER . '-' . MCWALLET_BUILD_VER, true );
	}

	$app_js_url = MCWALLET_URL . 'vendors/swap/app.js';
	if ($use_testnet) {
		$app_js_url = MCWALLET_URL . 'vendors/swap/testnet/app.js';
	}
	if (get_option( 'mcwallet_strings' )) {
		$app_js_url = MCWALLET_URL . 'includes/scripts/load-app.php';
	}

	wp_register_script( 'mcwallet-app', $app_js_url, array( 'mcwallet-vendor' ), MCWALLET_VER . '-' . MCWALLET_BUILD_VER . '-' . (($use_testnet) ? 'testnet' : 'mainnet'), true );

	wp_add_inline_script( 'mcwallet-vendor', mcwallet_inline_build_script(), 'before' );
	wp_add_inline_script( 'mcwallet-vendor', mcwallet_inline_script(), 'before' );

	/* Translatable string */
	wp_localize_script('mcwallet-vendor', 'mcwallet',
		array(
			'ajaxurl' => admin_url( 'admin-ajax.php' ),
			'nonce'   => wp_create_nonce( 'mcwallet-nonce' ),
		)
	);

}
add_action( 'wp_enqueue_scripts', 'mcwallet_enqueue_scripts' );

/**
 * Widget Page Print Styles
 */
function mcwallet_print_head_styles() {
	echo mcwallet_head_meta();
	wp_print_styles( 'mcwallet-bootstrap' );
	wp_print_styles( 'fontawesome' );
	wp_print_styles( 'swiper' );
	wp_print_styles( 'mcwallet-style' );
	wp_print_styles( 'mcwallet-google-fonts' );
	wp_print_styles( 'mcwallet-app' );
	echo '<script>' . "\n";
	echo '  var isWidgetBuild = "true";' . "\n";
	echo '</script>' . "\n";
	?>

<style id="mcwallet-inline-styles">
<?php mcwallet_inline_scheme_colors(); ?>
</style>
	<?php
}
add_action( 'mcwallet_head', 'mcwallet_print_head_styles' );

/**
 * Page Print Scripts
 */
function mcwallet_print_scripts_widget_footer() {
	wp_print_scripts( 'mcwallet-app' );
	wp_print_scripts( 'mcwallet-customizer' );
}
add_action( 'mcwallet_footer', 'mcwallet_print_scripts_widget_footer' );

/**
 * Swap Head Metas
 */
function mcwallet_head_meta() {
	$meta  = '<meta name="viewport" content="width=device-width, initial-scale=1" />' . "\n";
	// Disable google translate.
	$meta .= '<meta name="google" content="notranslate" />' . "\n";
	$meta .= '<meta name="mobile-web-app-capable" content="yes">' . "\n";
	$meta .= '<meta name="theme-color" content="#fff">' . "\n";
	$meta .= '<meta name="application-name" content="swap.online">' . "\n";
	return $meta;
}

/**
 * Inline scripts
 */
function mcwallet_inline_build_script() {

	ob_start();
	?>
	const getNavigatorLanguage = () => {
		if (navigator.languages && navigator.languages.length) {
			return navigator.languages[0];
		} else {
			return navigator.userLanguage || navigator.language || navigator.browserLanguage || "en";
		}
	};

	var localStorageIsOk = true;
	try {
		var testLocalStorage = window.localStorage;
	} catch (e) {
		localStorageIsOk = false
		document.getElementById("onFailLocalStorageLink").href = window.location.href;
		document.getElementById("onFailLocalStorageMessage").classList.remove("d-none");
		var sendErrorFeedback = function () {
			var msg = "localStorage error: agent("+navigator.userAgent+")";
					msg+= ", location("+window.location.href+")";

			var url = "https://noxon.wpmix.net/counter.php?msg="+encodeURI(msg);

			window.jQuery.ajax({
				type: "POST",
				url: url
			});
		};
		if (!window.jQuery) {
			// inject jQuery for send request to counter for feedback
			var jsScriptTag = document.createElement("SCRIPT");
				jsScriptTag.src = "<?php echo esc_url( includes_url() . 'js/jquery/jquery.min.js' ); ?>";
				console.log("jsScriptTag", jsScriptTag);
			document.getElementsByTagName("BODY")[0].appendChild(jsScriptTag);
			var waitJQLoad = function (onLoaded) {
				if (window.jQuery) {
					onLoaded();
				} else {
					window.setTimeout( function () {
						waitJQLoad(onLoaded);
					}, 100);
				};
			};
			waitJQLoad(sendErrorFeedback);
		} else {
			sendErrorFeedback();
		};
	};

	function setCookie(name, value, options) {
		options = options || {};
		var expires = options.expires;
		if (typeof expires == "number" && expires) {
			var d = new Date();
			d.setTime(d.getTime() + expires * 1000);
			expires = options.expires = d;
		}
		if (expires && expires.toUTCString) {
			options.expires = expires.toUTCString();
		}

		value = encodeURIComponent(value);
		var updatedCookie = name + "=" + value;

		for (var propName in options) {
			updatedCookie += "; " + propName;
			var propValue = options[propName];
			if (propValue !== true) {
				updatedCookie += "=" + propValue;
			}
		}
		document.cookie = updatedCookie;
	}

	function getCookie(cname) {
		var name = cname + "=";
		var ca = document.cookie.split(";");
		for (var i = 0; i < ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) == " ") {
				c = c.substring(1);
			}
			if (c.indexOf(name) == 0) {
				return c.substring(name.length, c.length);
			}
		}
		return "";
	}

	var advice = document.getElementById("beforeJSTip");

	const wrapper = document.getElementById("wrapper_element");

	document.body.setAttribute("data-scheme", "default");

	const default_theme = "<?php echo esc_attr( get_theme_mod( 'color_scheme','light' ) ); ?>";
	const isDark = localStorage.getItem('isDark')
	const isLight = localStorage.getItem('isLight')
	const isSystemDark = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
	if (!isDark && !isLight && (default_theme !== 'only_dark') && (default_theme !== 'only_light') && isSystemDark) {
		document.body.setAttribute("data-scheme", "dark");
		wrapper.classList.add("dark");
		window.localStorage.setItem("isDark", "true");
		window.localStorage.removeItem("isLight");
	} else {
		if ( isDark || default_theme === "only_dark") {
			document.body.setAttribute("data-scheme", "dark");
			wrapper.classList.add("dark");
			window.localStorage.setItem("isDark", "true");
			window.localStorage.removeItem("isLight");
		} else {
			if (window.localStorage.getItem("isLight")) {
				wrapper.classList.remove("dark");
				window.localStorage.removeItem("isDark");
				window.localStorage.setItem("isLight", "true");
			}
		}
		if ( isDark === null && isLight === null && default_theme === "dark") {
			wrapper.classList.add("dark");
			window.localStorage.setItem("isDark", "true");
		}
		if (default_theme === "only_light") {
			document.body.setAttribute("data-scheme", "default");
			wrapper.classList.remove("dark");
			window.localStorage.removeItem("isDark");
			window.localStorage.removeItem("isLight");
		}
	}

	let lang = getCookie("mylang");
	const defaultLanguage = "<?php echo esc_attr( get_option( 'default_language', 'en' ) ); ?>";

	if (!lang) {
		lang = defaultLanguage;
		setCookie("mylang", defaultLanguage);
	}

	const locale = lang.toLowerCase();
	const locationName = lang.toUpperCase();

	advice.innerText = "<?php echo esc_attr( get_option( 'string_splash_loading', __( 'Loading...', 'multi-currency-wallet' ) ) ); ?>";

	var information = document.getElementById("usersInform");

	if (localStorage.length === 0) {
		information.innerText = "<?php echo esc_attr( get_option( 'string_splash_first_loading', __( 'Please wait while the application is loading, it may take one minute...', 'multi-currency-wallet' ) ) ); ?>";
	}
	<?php
	$script = ob_get_clean();

	return $script;
}

function mcwallet_fix_name($name, $used_names) {
  while(in_array($name, $used_names)) {
    $name = $name."*";
  }
  return $name;
}

/**
 * Inline scripts
 */
function mcwallet_inline_script() {

	$script = '';

	$tokens = get_option( 'mcwallet_tokens' );

	if ( false !== $tokens && empty( $tokens ) ) {
		$tokens = mcwallet_default_token();
	}

	if ( $tokens ) {
		$script = "window.widgetEvmLikeTokens = [" . "\n";
		$i      = 0;
		$count  = count( $tokens );

		// Sort tokens by order from subarray.
		uasort( $tokens, function( $a, $b ) {
			if ( isset( $a['order'] ) ) {
				return $a['order'] <=> $b['order'];
			}
		});

    $used_names = array();

		foreach ( $tokens as $name => $token ) {
			$i++;
			$separator = '';
			if ( $count != $i ) {
				$separator = ',';
			}
      $standard = 'erc20';
			if ( isset( $token['standard'] ) ) {
				$standard = $token['standard'];
        if ($token['standard'] === 'phi20_v2') $standard = 'phi20';
        if ($token['standard'] === 'phi20') $standard = 'phi20_v1';
			}
      
      if (!isset($used_names[$standard])) $used_names[$standard] = array();
			$name     = strtolower( $token['symbol'] ); //strtolower( $name );
      $name     = mcwallet_fix_name($name, $used_names[$standard]);
      $used_names[$standard][] = $name;

			
			$address  = $token['address'];
			$decimals = $token['decimals'];
			$fullname = $token['name'];
			$symbol   = strtolower( $token['symbol'] );
			$icon     = $token['icon'];
			$rate     = '';
			if ( isset( $token['rate'] ) ) {
				$rate = $token['rate'];
			}
      $price    = '';
      if ( isset( $token['price'] ) ) {
        $price = $token['price'];
      }
			$icon_bg = '';
			if ( isset( $token['bg'] ) ) {
				$icon_bg = $token['bg'];
			}
			$how_deposit = '';
			if ( isset( $token['howdeposit'] ) ) {
				$how_deposit = $token['howdeposit'];
			}
			$how_withdraw = '';
			if ( isset( $token['howwithdraw'] ) ) {
				$how_withdraw = $token['howwithdraw'];
			}
			$order = '';
			if ( isset( $token['order'] ) ) {
				$order = $token['order'];
			};
			$script .= "{
				name: '". $name ."',
				symbol: '". $symbol ."',
				standard: '" . $standard . "',
				address: '" . $address . "',
				decimals: " . $decimals . ",
				fullName: '" . $fullname . "',
				icon: '" . $icon . "',
				customExchangeRate: '" . $rate . "',
        customFiatPrice: '" . $price . "',
				iconBgColor: '" . $icon_bg . "',
				howToDeposit: '" . wp_specialchars_decode( $how_deposit ) . "',
				howToWithdraw: '" . wp_specialchars_decode( $how_withdraw ) . "',
				order: '" . intval( $order ) . "',
			}" . $separator . "\n";
		}
		$script .= "]\n\n";

	}

	$default_fiat = 'USD';
	if ( get_option( 'fiat_currency' ) ) {
		$default_fiat = get_option( 'fiat_currency' );
	}

	$is_user_loggedin = 'false';
	if ( is_user_logged_in() && get_option( 'mcwallet_is_logged' ) == 'true' ) {
		$is_user_loggedin = 'true';
	}

	$show_howitworks = 0;
	if ( get_option( 'show_howitworks' ) ) {
		$show_howitworks = 1;
	}

	$window_arr = array(
		'prerenderReady'               => 'false',
		'CUSTOM_LOGO'                  => 'false',
		'LOGO_REDIRECT_LINK'           => mcwallet_get_logo_redirect_link(),
		'logoUrl'                      => mcwallet_logo_url(),
		'darkLogoUrl'                  => mcwallet_dark_logo_url(),
		'publicUrl'                    => MCWALLET_URL . 'vendors/swap/',
		'chunkURL'                     => MCWALLET_URL . 'vendors/swap/',
		'defaultWindowTitle'           => get_option( 'mcwallet_page_title', esc_html__( 'Hot Wallet with p2p exchange', 'multi-currency-wallet' ) ),
		'DEFAULT_FIAT'                 => $default_fiat,
		'isUserRegisteredAndLoggedIn'  => $is_user_loggedin,
		'buyViaCreditCardLink'         => get_option( 'fiat_gateway_url', 'https://itez.swaponline.io/?DEFAULT_FIAT={DEFAULT_FIAT}&locale={locale}&btcaddress={btcaddress}' ),
		'transakApiKey'                => get_option( 'transak_api_key', '' ),
		'zeroxApiKey'                  => get_option( 'zerox_api_key', '' ),
		'logoutUrl'                    => wp_logout_url( mcwallet_page_url() ),
		'showHowItWorksOnExchangePage' => $show_howitworks,
		'widgetName'                   => get_bloginfo(),
		'STATISTICS_ENABLED'           => get_option( 'mcwallet_enable_stats', 'false' ),
		'EXCHANGE_DISABLED'            => get_option( 'mcwallet_exchange_disabled', 'false' ),
		'SO_disableInternalWallet'     => get_option( 'mcwallet_disable_internal', 'false' ),
		'CUR_GHOST_DISABLED'           => (get_option( 'mcwallet_ghost_enabled') == 'true') ? 'false' : 'true',
		'CUR_NEXT_DISABLED'            => (get_option( 'mcwallet_next_enabled') == 'true') ? 'false' : 'true',
    'CUR_FKW_DISABLED'             => (get_option( 'mcwallet_fkw_disabled', 'true') == 'true') ? 'true' : 'false',
		'hideServiceLinks'             => get_option( 'mcwallet_hide_service_links', 'false'),
		'invoiceEnabled'               => get_option( 'mcwallet_invoice_enabled', 'false'),
		'exchangeMode'                 => get_option( 'selected_exchange_mode', 'only_quick' ),
		'quickswapMode'                => get_option( 'selected_quickswap_mode', 'aggregator' ),
		'defaultLanguage'              => get_option( 'default_language', 'en' ),
		'WPSO_selected_theme'          => get_theme_mod( 'color_scheme', 'light' ),
		'zeroxFeePercent'              => get_option( 'zerox_fee_percent', '' ),
		'pluginVersion'                => MCWALLET_VER,
		'SO_addAllEnabledWalletsAfterRestoreOrCreateSeedPhrase' => get_option( 'mcwallet_show_all_enabled_wallets', 'false'),
    'SO_AllowMultiTab'             => get_option( 'mcwallet_enable_multitab', 'false')
	);

  if (get_option('wc_projectid', '') !== '') {
    $window_arr['SO_WalletConnectProjectId'] = get_option('wc_projectid');
  }
  if (get_option('wc_disabled', 'false') === 'true') {
    $window_arr['SO_WalletConnectDisabled'] = 'true';
  }
  
  if (get_option('infura_api_key', '') !== '') {
    $window_arr['SO_INFURA_API_KEY'] = get_option('infura_api_key');
  }
	// Disabled chains
	$supported_chains = mcwallet_supperted_chains();
	foreach ($supported_chains as $chain=>$chain_title) {
		$window_arr["CUR_" . strtoupper($chain) . "_DISABLED"] = get_option( "mcwallet_{$chain}_disabled", 'false' );
	}

	if ( get_current_user_id() ) {
		$window_arr['setItemPlugin'] = "saveUserData";
		$window_arr['WPuserUid'] = esc_html(get_current_user_id());
		$window_arr['userDataPluginApi']  = admin_url( 'admin-ajax.php' ).'?action=mcwallet_update_user_meta';

		// Need to generate a unique hash from user data
		// You can't just pass userId, it's not safe
		// In addition to userId, we pass its hash to the backend, by which we check,
		// Whether this was really sent by the user or the attacker, by the usual selection of userId
		$userData = get_userdata(get_current_user_id())->data;
		$userHashString = get_current_user_id().':'.$userData->user_login.':'.$userData->user_registered.':'.$userData->user_pass.':'.NONCE_SALT;
		$user_uniqhash = md5($userHashString);

		$window_arr['WPuserHash'] = esc_html($user_uniqhash);
		if ((get_option( 'mcwallet_remember_userwallet' ) == 'true') && (get_option( 'mcwallet_is_logged' ) == 'true')) {
			$window_arr['backupPlugin'] = 'backupUserData';
			$window_arr['backupUrl']    = admin_url( 'admin-ajax.php' ).'?action=mcwallet_backup_userwallet';
			$window_arr['restoreUrl']   = admin_url( 'admin-ajax.php' ).'?action=mcwallet_restore_userwallet';
		}
	}

	$window_arr = apply_filters( 'mcwallet_window_variables', $window_arr );

	foreach ( $window_arr as $var => $value ) {
		if ( $value != 'true' && $value != 'false' && $value != '1' && 'false' && $value != '0' ) {
			$value = '\'' . $value . '\'';
		}
		$script .= 'window.' . $var . ' = ' . $value . ';' . "\n";
	}
	$script .= "\n";

	$fees = array();

	if ( get_option( 'btc_fee' ) ) {
		$fees['btc']['fee'] = get_option( 'btc_fee' );
	}
	if ( get_option( 'btc_min' ) ) {
		$fees['btc']['min'] = get_option( 'btc_min' );
	}
	if ( get_option( 'btc_fee_address' ) ) {
		$fees['btc']['address'] = get_option( 'btc_fee_address' );
	}
	if ( get_option( 'eth_fee' ) ) {
		$fees['eth']['fee'] = get_option( 'eth_fee' );
		$fees['bnb']['fee'] = get_option( 'eth_fee' );
		$fees['matic']['fee'] = get_option( 'eth_fee' );
		$fees['ftm']['fee'] = get_option( 'eth_fee' );
		$fees['avax']['fee'] = get_option( 'eth_fee' );
		$fees['movr']['fee'] = get_option( 'eth_fee' );
		$fees['one']['fee'] = get_option( 'eth_fee' );
		$fees['xdai']['fee'] = get_option( 'eth_fee' );
		$fees['arbeth']['fee'] = get_option( 'eth_fee' );
		$fees['aureth']['fee'] = get_option( 'eth_fee' );
		$fees['phi']['fee'] = get_option( 'eth_fee' );
		$fees['ame']['fee'] = get_option( 'eth_fee' );
    $fees['phpx']['fee'] = get_option( 'eth_fee' );
	}
	if ( get_option( 'eth_min' ) ) {
		$fees['eth']['min'] = get_option( 'eth_min' );
		$fees['bnb']['min'] = get_option( 'eth_min' );
		$fees['matic']['min'] = get_option( 'eth_min' );
		$fees['ftm']['min'] = get_option( 'eth_min' );
		$fees['avax']['min'] = get_option( 'eth_min' );
		$fees['movr']['min'] = get_option( 'eth_min' );
		$fees['one']['min'] = get_option( 'eth_min' );
		$fees['xdai']['min'] = get_option( 'eth_min' );
		$fees['arbeth']['min'] = get_option( 'eth_min' );
		$fees['aureth']['min'] = get_option( 'eth_min' );
		$fees['phi']['min'] = get_option( 'eth_min' );
		$fees['ame']['min'] = get_option( 'eth_min' );
    $fees['phpx']['min'] = get_option( 'eth_min' );
	}
	if ( get_option( 'tokens_fee' ) ) {
		$fees['erc20']['fee'] = get_option( 'tokens_fee' );
		$fees['bep20']['fee'] = get_option( 'tokens_fee' );
		$fees['erc20matic']['fee'] = get_option( 'tokens_fee' );
		$fees['erc20ftm']['fee'] = get_option( 'tokens_fee' );
		$fees['erc20avax']['fee'] = get_option( 'tokens_fee' );
		$fees['erc20movr']['fee'] = get_option( 'tokens_fee' );
		$fees['erc20one']['fee'] = get_option( 'tokens_fee' );
		$fees['erc20xdai']['fee'] = get_option( 'tokens_fee' );
		$fees['erc20aurora']['fee'] = get_option( 'tokens_fee' );
		$fees['phi20']['fee'] = get_option( 'tokens_fee' );
		$fees['erc20ame']['fee'] = get_option( 'tokens_fee' );
    $fees['phpx20']['fee'] = get_option( 'tokens_fee' );
	}
	if ( get_option( 'tokens_min' ) ) {
		$fees['erc20']['min'] = get_option( 'tokens_min' );
		$fees['bep20']['min'] = get_option( 'tokens_min' );
		$fees['erc20matic']['min'] = get_option( 'tokens_min' );
		$fees['erc20ftm']['min'] = get_option( 'tokens_min' );
		$fees['erc20avax']['min'] = get_option( 'tokens_min' );
		$fees['erc20movr']['min'] = get_option( 'tokens_min' );
		$fees['erc20one']['min'] = get_option( 'tokens_min' );
		$fees['erc20xdai']['min'] = get_option( 'tokens_min' );
		$fees['erc20aurora']['min'] = get_option( 'tokens_min' );
		$fees['phi20']['min'] = get_option( 'tokens_min' );
		$fees['erc20ame']['min'] = get_option( 'tokens_min' );
    $fees['phpx20']['min'] = get_option( 'tokens_min' );
	}
	if ( get_option( 'eth_fee_address' ) ) {
		$fees['eth']['address'] = get_option( 'eth_fee_address' );
		$fees['bnb']['address'] = get_option( 'eth_fee_address' );
		$fees['matic']['address'] = get_option( 'eth_fee_address' );
		$fees['ftm']['address'] = get_option( 'eth_fee_address' );
		$fees['avax']['address'] = get_option( 'eth_fee_address' );
		$fees['movr']['address'] = get_option( 'eth_fee_address' );
		$fees['one']['address'] = get_option( 'eth_fee_address' );
		$fees['xdai']['address'] = get_option( 'eth_fee_address' );
		$fees['arbeth']['address'] = get_option( 'eth_fee_address' );
		$fees['aureth']['address'] = get_option( 'eth_fee_address' );
		$fees['phi']['address'] = get_option( 'eth_fee_address' );
		$fees['ame']['address'] = get_option( 'eth_fee_address' );
		$fees['erc20']['address'] = get_option( 'eth_fee_address' );
		$fees['bep20']['address'] = get_option( 'eth_fee_address' );
		$fees['erc20matic']['address'] = get_option( 'eth_fee_address' );
		$fees['erc20ftm']['address'] = get_option( 'eth_fee_address' );
		$fees['erc20avax']['address'] = get_option( 'eth_fee_address' );
		$fees['erc20movr']['address'] = get_option( 'eth_fee_address' );
		$fees['erc20one']['address'] = get_option( 'eth_fee_address' );
		$fees['erc20xdai']['address'] = get_option( 'eth_fee_address' );
		$fees['erc20aurora']['address'] = get_option( 'eth_fee_address' );
		$fees['phi20']['address'] = get_option( 'eth_fee_address' );
		$fees['erc20ame']['address'] = get_option( 'eth_fee_address' );
    $fees['phpx20']['address'] = get_option( 'eth_fee_address' );
	}

	$script .= 'window.widgetERC20Comisions = ' . wp_json_encode( $fees, JSON_PRETTY_PRINT ) . ';' . "\n\n";

	// faqs
	$own_before_faqs = get_option( 'mcwallet_own_before_faqs' , array() );
	$own_after_faqs = get_option( 'mcwallet_own_after_faqs', array() );

	$script .= 'window.SO_FaqBeforeTabs = ' . wp_json_encode( $own_before_faqs , JSON_PRETTY_PRINT ) . ';' . "\n\n";
	$script .= 'window.SO_FaqAfterTabs = ' . wp_json_encode( $own_after_faqs , JSON_PRETTY_PRINT ) . ';' . "\n\n";

	// menu items
	$own_before_menus = get_option( 'mcwallet_own_before_menus' , array() );
	$own_after_menus = get_option( 'mcwallet_own_after_menus', array() );

	$script .= 'window.SO_MenuItemsBefore = ' . wp_json_encode( $own_before_menus , JSON_PRETTY_PRINT ) . ';' . "\n\n";
	$script .= 'window.SO_MenuItemsAfter = ' . wp_json_encode( $own_after_menus , JSON_PRETTY_PRINT ) . ';' . "\n\n";

	$args = array(
		'post_type'      => 'mcwallet_banner',
		'posts_per_page' => -1,
		'order'          => 'ASC',
	);

	$query = new WP_Query( $args );

	$banners_js = '""';
	if ( $query->have_posts() ) :
		$banners_js = '[';
		while ( $query->have_posts() ) : $query->the_post();
			$banner_bg = '';
			if ( get_post_meta( get_the_ID(), 'banner_color', true ) ) {
				$banner_bg = get_post_meta( get_the_ID(), 'banner_color', true );
				$banner_bg = ltrim( $banner_bg, '#' );
			}
			if ( get_post_meta( get_the_ID(), 'banner_image', true ) ) {
				$banner_bg = get_post_meta( get_the_ID(), 'banner_image', true );
			}
			$banner_arr = array(
				wp_json_encode( get_the_title() ),
				wp_json_encode( get_the_title() ),
				wp_json_encode( get_post_meta( get_the_ID(), 'banner_text', true ) ),
				wp_json_encode( $banner_bg ),
				wp_json_encode( get_post_meta( get_the_ID(), 'banner_url', true ) ),
				wp_json_encode( get_post_meta( get_the_ID(), 'banner_icon', true ) ),
			);
			$banners_js .= '[' . implode( ',', $banner_arr ) . '],';

		endwhile;
		$banners_js = rtrim( $banners_js, ',' );
		$banners_js .= ']';

	endif;
	wp_reset_postdata();

	$script .= 'window.bannersOnMainPage = ' . $banners_js . ';' . "\n\n";

	return $script;
}

/**
 * Register Google fonts.
 */
function mcwallet_fonts_url() {

	$fonts_url = '';
	$subsets   = 'latin,cyrillic';
	$fonts     = array();

	$fonts[] = 'Roboto:400,500,700,900';
	$fonts[] = 'Roboto Mono';

	if ( $fonts ) {
		$fonts_url = add_query_arg( array(
			'family'  => implode( rawurlencode( '|' ), $fonts ),
			'display' => 'swap',
			'subset'  => rawurlencode( $subsets ),
		),
		'https://fonts.googleapis.com/css' );
	}

	return esc_url_raw( $fonts_url );
}

/**
 * Remove all styles and scripts.
 */
function mcwallet_remove_all_styles_and_scripts() {
	/**
	 * Remove all styles.
	 */
	function mcwallet_remove_all_styles() {
		global $wp_styles;
		$wp_styles->queue = array();
	}
	add_action( 'wp_print_styles', 'mcwallet_remove_all_styles' );

	/**
	 * Remove all scripts.
	 */
	function mcwallet_remove_all_scripts() {
		global $wp_scripts;
		$wp_scripts->queue = array();
	}
	add_action( 'wp_print_scripts', 'mcwallet_remove_all_scripts' );
}
add_action( 'mcwallet_before_template', 'mcwallet_remove_all_styles_and_scripts' );

/**
 * Remove WordPress Admin Bar CSS.
 */
function mcwallet_remove_admin_bar_bump_cb() {
	remove_action('wp_head', '_admin_bar_bump_cb');
}
add_action( 'mcwallet_before_template', 'mcwallet_remove_admin_bar_bump_cb' );
