/**
 * Widget Admin Scripts
 */
(function( $ ){
	"use strict";

	/**
	 * Tabs
	 */
	$('.mcwallet-nav-tabs > a').on( 'click', function(e) {
		e.preventDefault();
		window.location.hash = this.hash
		var tab = $(this).attr('href');
		// set active navigation tab
		$('.mcwallet-nav-tabs > a').removeClass('nav-tab-active');
		$(this).addClass('nav-tab-active');

		// set active tab from content
		setTimeout( function() {
			$('.mcwallet-panel-tab').removeClass('panel-tab-active');
			$(tab).addClass('panel-tab-active');
		}, 10 );
	});

	/**
	 * Init Tabs on load
	 */
	$( window).on( 'load', function() {
		var hash = window.location.hash;
		if ( hash ) {
			var tabElement = $( '.nav-tab[href=' + hash + ']');
			if ( tabElement.length ) {
				$('.mcwallet-nav-tabs > a').removeClass('nav-tab-active');
				$(tabElement).addClass('nav-tab-active');

				// set active tab from content
				setTimeout( function() {
					$('.mcwallet-panel-tab').removeClass('panel-tab-active');
					$(hash).addClass('panel-tab-active');
				}, 100 );
			}
		}
	});

	/**
	 * Notices
	 */
	var noticeEl = $('.mcwallet-notice');
	function mcwalletNotice( text, status ){
		noticeEl.find('p').text( text );
		noticeEl.addClass('notice-' + status ).fadeIn();
		setTimeout(function(){
			noticeEl.fadeOut(function(){
				noticeEl.removeClass('notice-' . status );
				noticeEl.removeClass('notice-success notice-error');
			});
		},6000);
	}

	mcwallet.showNotice = mcwalletNotice
	/**
	 * Spinner
	 */
	function mcwalletSpinner( button ){
		button.next('.spinner').toggleClass('is-active');
	}
	mcwallet.showSpinner = mcwalletSpinner

	/** 
	 * Add token
	 */
	$('.mcwallet-add-token').on('click',function(e){
		e.preventDefault();
    console.log('>>> click')
		var thisBtn = $(this);
		var thisForm = $(this).parents('form');
		var tokenAddress = thisForm.find('[name="address"]').val();
		var tokenName = thisForm.find('[name="name"]').val();
		var tokenStandard = thisForm.find('[name="standard"]').val();
		var tokenIcon = thisForm.find('[name="icon"]').val();
		var tokenRate = thisForm.find('[name="rate"]').val();
    var tokenPrice = thisForm.find('[name="price"]').val();
		var iconBg = thisForm.find('.mcwallet-icon-bg').val();
		var howDeposit = window.tinyMCE.get('howdeposit').getContent();
		var howWithdraw = window.tinyMCE.get('howwithdraw').getContent();
		var tokenOrder = thisForm.find('[name="order"]').val();
		mcwalletSpinner(thisBtn);

		if ( tokenAddress ){

			var data = {
				action: 'mcwallet_add_token',
				nonce: mcwallet.nonce,
				address: tokenAddress,
				name: tokenName,
				standard: tokenStandard,
				icon: tokenIcon,
				rate: tokenRate,
        price: tokenPrice,
				bg: iconBg,
				howdeposit: howDeposit,
				howwithdraw: howWithdraw,
				order: tokenOrder,
			};
console.log('>>> data', data)
			$.post( mcwallet.ajaxurl, data, function(response) {

				if( response.status == 'success') {
					var thisHtml = response.html;
					$('.wp-list-tokens tbody').find('.item-empty').remove();
					// If no tokens, add to tbody.
					$('.wp-list-tokens tbody').append( thisHtml );

					setTimeout(function(){
						$('.wp-list-tokens tbody').find('.item-fade').removeClass('item-fade');
						$(this).scrollTop(0);
					},10);
					setTimeout(function(){
						$('.wp-list-tokens tbody').find('.item-adding').removeClass('item-adding');
						
						//location.reload();
					},2000);
					
					mcwalletNotice( mcwallet.notices.success, 'success');
					thisForm.find('[type="text"]').val('');
					
					window.tinyMCE.get('howdeposit').setContent('');
					window.tinyMCE.get('howwithdraw').setContent('');
					
				}
				if ( response.status == 'false' ) {
					mcwalletNotice( mcwallet.notices.wrong, 'error');
				}
				if ( response.status == 'invalid' ) {
					mcwalletNotice( mcwallet.notices.invalid, 'error');
				}
				
				mcwalletSpinner(thisBtn);

			});
		} else {
			mcwalletNotice( mcwallet.notices.empty, 'error');
			mcwalletSpinner(thisBtn);
		}

	});

	/**
	 * Remove token
	 */
	$(document).on('click','.mcwallet-remove-token', function(e){
		e.preventDefault();
		var thisName = $(this).data('name');
		var thisItem = $(this).parents('.item');

		if ( thisName ){

			var data = {
				action: 'remove_token',
				nonce: mcwallet.nonce,
				name: thisName,
			};

			$.post( mcwallet.ajaxurl, data, function(response) {

				if( response == 'true') {
					thisItem.addClass('removing');
					thisItem.fadeOut( function(){
						thisItem.remove();
						mcwalletNotice( mcwallet.notices.removed, 'success');
						if( ! $('.wp-list-tokens tbody .item').length ) {
							$('.wp-list-tokens tbody ').html( '<tr class="item item-empty"><td colspan="8"><span>' + mcwallet.notices.noTokens + '</span></td></tr>' );
						}
					});
				}
				if ( response == 'false' ) {
					mcwalletNotice( mcwallet.notices.wrong, 'success');
				}

			});
		}
	});

  /**
   * INPUT[type="number"] on change fix min and max value
   */
  const inputNumberFix = (e) => {
    const $target = $(e.target)
    let min = $target.attr('min')
    let max = $target.attr('max')
    let def = $target.attr('default')
    let value = $target.val()

    if (min !== undefined) {
      try {
        min = parseFloat(min)
        if (value<min) $target.val(min)
      } catch (e) {}
    }
    if (max !== undefined) {
      try {
        max = parseFloat(max)
        if (value>max) $target.val(max)
      } catch (e) {}
    }
  }
  $('.mcwallet-form-options INPUT[type="number"]').on('change', inputNumberFix)
  $('.mcwallet-form-options INPUT[type="number"]').on('keyup', inputNumberFix)
	/**
	 * If user must be logged in - save user data
	 */
	$('.mcwallet-form-options [name="is_logged"]').on('change', function (e) {
    $('.mcwallet-form-options #mcwallet_must-logged-in-on')[0].style.display = 'none'
    $('.mcwallet-form-options #mcwallet-save_private_keys-on')[0].style.display = 'none'
    $('.mcwallet-form-options #mcwallet-save_private_keys-off')[0].style.display = 'none'
		if ($('.mcwallet-form-options [name="is_logged"]').is(':checked')) {
			$('.mcwallet-form-options [name="remeber_userwallet"]').prop('checked', true)
      $('.mcwallet-form-options #mcwallet-save_private_keys-on')[0].style.display = ''
		} else {
      if ($('.mcwallet-form-options [name="remeber_userwallet"]').is(':checked')) {
        $('.mcwallet-form-options #mcwallet-save_private_keys-off')[0].style.display = ''
      }
      $('.mcwallet-form-options [name="remeber_userwallet"]').prop('checked', false)
    }
	})
	$('.mcwallet-form-options [name="remeber_userwallet"]').on('change', function (e) {
    $('.mcwallet-form-options #mcwallet_must-logged-in-on')[0].style.display = 'none'
    $('.mcwallet-form-options #mcwallet-save_private_keys-on')[0].style.display = 'none'
    $('.mcwallet-form-options #mcwallet-save_private_keys-off')[0].style.display = 'none'
    if ($('.mcwallet-form-options [name="remeber_userwallet"]').is(':checked')) {
      if (!$('.mcwallet-form-options [name="is_logged"]').is(':checked')) {
        $('.mcwallet-form-options #mcwallet_must-logged-in-on')[0].style.display = ''
      }
      $('.mcwallet-form-options [name="is_logged"]').prop('checked', true)
      
      
    }
  })
	/**
	 * Update Options
	 */
	$('.mcwallet-update-options').on('click',function(e){
		e.preventDefault();
		var thisBtn       	 = $(this);
		var thisParent    	 = $('.mcwallet-form-options');
		var logoUrl       	 = thisParent.find( '[name="logo_url"]' ).val();
		var darkLogoUrl   	 = thisParent.find( '[name="dark_logo_url"]' ).val();
		var logoLink      	 = thisParent.find( '[name="logo_link"]' ).val();
		var pageTitle     	 = thisParent.find( '[name="mcwallet_page_title"]' ).val();
		var pageSlug      	 = thisParent.find( '[name="page_slug"]' ).val();
		var pageHome      	 = thisParent.find( '[name="is_home"]' );
		var pageAccess     	 = thisParent.find( '[name="is_logged"]' );
		var btcFee        	 = thisParent.find( '[name="btc_fee"]' ).val();
		var btcMin         	 = thisParent.find( '[name="btc_min"]' ).val();
		var btcFeeAddress  	 = thisParent.find( '[name="btc_fee_address"]' ).val();
		var ethFee         	 = thisParent.find( '[name="eth_fee"]' ).val();
		var ethMin         	 = thisParent.find( '[name="eth_min"]' ).val();
		var ethFeeAddress  	 = thisParent.find( '[name="eth_fee_address"]' ).val();
		var tokensFee      	 = thisParent.find( '[name="tokens_fee"]' ).val();
		var tokensMin      	 = thisParent.find( '[name="tokens_min"]' ).val();
		var zeroxFeePercent  = thisParent.find( '[name="zerox_fee_percent"]' ).val();
		var fiatCurrency   	 = thisParent.find( '[name="fiat_currency"]' ).val();
		var fiatGatewayUrl 	 = thisParent.find( '[name="fiat_gateway_url"]' ).val();
		var transakApiKey 	 = thisParent.find( '[name="transak_api_key"]' ).val();
		var zeroxApiKey 	   = thisParent.find( '[name="zerox_api_key"]' ).val();
		var showHowitworks 	 = thisParent.find( '[name="show_howitworks"]' );
		var codeHead       	 = thisParent.find( '[name="mcwallet_head_code"]' ).val();
		var codeBody       	 = thisParent.find( '[name="mcwallet_body_code"]' ).val();
		var codeFooter     	 = thisParent.find( '[name="mcwallet_footer_code"]' ).val();
		var statisticEnabled = thisParent.find( '[name="statistic_enabled"]' );
		var disableInternal  = thisParent.find( '[name="disable_internal"]' );
		var btcDisabled   	 = thisParent.find( '[name="btc_disabled"]' );
		var ethDisabled   	 = thisParent.find( '[name="eth_disabled"]' );
		var bnbDisabled   	 = thisParent.find( '[name="bnb_disabled"]' );
		var maticDisabled 	 = thisParent.find( '[name="matic_disabled"]' );
		var ftmDisabled  	 = thisParent.find( '[name="ftm_disabled"]' );
		var avaxDisabled  	 = thisParent.find( '[name="avax_disabled"]' );
		var movrDisabled  	 = thisParent.find( '[name="movr_disabled"]' );
		var oneDisabled  	 = thisParent.find( '[name="one_disabled"]' );
		var xdaiDisabled  	 = thisParent.find( '[name="xdai_disabled"]' );
		var arbitrumDisabled = thisParent.find( '[name="arbitrum_disabled"]' );
		var auroraDisabled = thisParent.find( '[name="aurora_disabled"]' );
		var phiDisabled = thisParent.find( '[name="phi_disabled"]' );
    var fkwDisabled = thisParent.find( '[name="fkw_disabled"]' );
    var phpxDisabled = thisParent.find( '[name="phpx_disabled"]' );
		var ameDisabled = thisParent.find( '[name="ame_disabled"]' );
		var ghostEnabled  	 = thisParent.find( '[name="ghost_enabled"]' );
		var nextEnabled  	 = thisParent.find( '[name="next_enabled"]' );
		var exchangeDisabled = thisParent.find( '[name="exchange_disabled"]' );
		var invoiceEnabled	 = thisParent.find( '[name="invoice_enabled"]' );
		var SO_addAllEnabledWalletsAfterRestoreOrCreateSeedPhrase = thisParent.find( '[name="show_all_enabled_wallets"]' );

		var string_splash_first_loading = thisParent.find( '[name="string_splash_first_loading"]' ).val();
		var string_splash_loading = thisParent.find( '[name="string_splash_loading"]' ).val();

		var rememberUserWallet = thisParent.find( '[name="remeber_userwallet"]' );

		var hideServiceLinks = thisParent.find( '[name="hide_service_links"]' );
		var selected_exchange_mode = thisParent.find( '[name="selected_exchange_mode"]' );
		var selected_quickswap_mode = thisParent.find( '[name="selected_quickswap_mode"]' );
		var default_language = thisParent.find('[name="default_language"]');
		var useTestnet = thisParent.find( '[name="use_testnet"]' );
    var mcwallet_enable_multitab = thisParent.find( '[name="mcwallet_enable_multitab"]' );
    
    // wallect connect
    var wc_projectid = thisParent.find('[name="mcwallet_wc_projectid"]' );
    var wc_disabled = thisParent.find('[name="mcwallet_wc_disabled"]' );
    
    var infura_api_key = thisParent.find('[name="mcwallet_infura_api_key"]')
		// click handler

		var strings = '';
		if ( $('.mcwallet-string-input').length ) {
			 strings = $('.mcwallet-string-input').serializeArray();
		}

		var ishome = 'false';
		var isLogged = 'false';
		var isHowitworks = 'false';

		selected_exchange_mode = selected_exchange_mode.val();
		selected_quickswap_mode = selected_quickswap_mode.val();
		default_language = default_language.val();
		statisticEnabled = statisticEnabled.is(':checked') ? 'true' : 'false';
		disableInternal = disableInternal.is(':checked') ? 'true' : 'false';
		SO_addAllEnabledWalletsAfterRestoreOrCreateSeedPhrase = SO_addAllEnabledWalletsAfterRestoreOrCreateSeedPhrase.is(':checked') ? 'true' : 'false';
		btcDisabled = btcDisabled.is(':checked') ? 'true' : 'false';
		ethDisabled = ethDisabled.is(':checked') ? 'true' : 'false';
		ghostEnabled = ghostEnabled.is(':checked') ? 'false' : 'true';
		nextEnabled = nextEnabled.is(':checked') ? 'false' : 'true';
		bnbDisabled = bnbDisabled.is(':checked') ? 'true' : 'false';
		maticDisabled = maticDisabled.is(':checked') ? 'true' : 'false';
		ftmDisabled = ftmDisabled.is(':checked') ? 'true' : 'false';
		avaxDisabled = avaxDisabled.is(':checked') ? 'true' : 'false';
		movrDisabled = movrDisabled.is(':checked') ? 'true' : 'false';
		oneDisabled = oneDisabled.is(':checked') ? 'true' : 'false';
		xdaiDisabled = xdaiDisabled.is(':checked') ? 'true' : 'false';
		arbitrumDisabled = arbitrumDisabled.is(':checked') ? 'true' : 'false';
		auroraDisabled = auroraDisabled.is(':checked') ? 'true' : 'false';
		phiDisabled = phiDisabled.is(':checked') ? 'true' : 'false';
		ameDisabled = ameDisabled.is(':checked') ? 'true' : 'false';

    fkwDisabled = fkwDisabled.is(':checked') ? 'true' : 'false';
    phpxDisabled = phpxDisabled.is(':checked') ? 'true' : 'false';


    mcwallet_enable_multitab = mcwallet_enable_multitab.is(':checked') ? 'true' : 'false';
    
		useTestnet = useTestnet.is(':checked') ? 'true' : 'false';

		exchangeDisabled = exchangeDisabled.is(':checked') ? 'true' : 'false';

		invoiceEnabled = invoiceEnabled.is(':checked') ? 'true' : 'false';

		rememberUserWallet = rememberUserWallet.is(':checked') ? 'true' : 'false';

		hideServiceLinks = hideServiceLinks.is(':checked') ? 'true' : 'false';

    wc_disabled = wc_disabled.is(':checked') ? 'true' : 'false';
    wc_projectid = wc_projectid.val();
    
    infura_api_key = infura_api_key.val();
    
		if ( pageHome.is(':checked') ) {
			ishome = 'true';
		}
		
		if ( pageAccess.is(':checked') ) {
			isLogged = 'true';
			// rememberUserWallet = 'true';
		}

		if (rememberUserWallet == 'true') isLogged = 'true';
		
		if ( showHowitworks.is(':checked') ) {
			isHowitworks = 'true';
		}

		var data = {
			action: 'mcwallet_update_options',
			string_splash_loading: string_splash_loading,
			string_splash_first_loading: string_splash_first_loading,
			nonce: mcwallet.nonce,
			url: logoUrl,
			darkLogoUrl: darkLogoUrl,
			logoLink: logoLink,
			pageTitle: pageTitle,
			slug: pageSlug,
			zeroxFeePercent: zeroxFeePercent,
			btcFee: btcFee,
			btcMin: btcMin,
			btcFeeAddress: btcFeeAddress,
			ethFee: ethFee,
			ethMin: ethMin,
			ethFeeAddress: ethFeeAddress,
			tokensFee: tokensFee,
			tokensMin: tokensMin,
			fiatCurrency: fiatCurrency,
			ishome: ishome,
			islogged: isLogged,
			codeHead: codeHead,
			codeBody: codeBody,
			codeFooter: codeFooter,
			fiatGatewayUrl: fiatGatewayUrl,
			transakApiKey: transakApiKey,
			zeroxApiKey: zeroxApiKey,
			isHowitworks: isHowitworks,
			strings: strings,
			statisticEnabled: statisticEnabled,
			disableInternal: disableInternal,
			ghostEnabled: ghostEnabled,
			nextEnabled: nextEnabled,
      fkwDisabled: fkwDisabled,
      phpxDisabled: phpxDisabled,
			exchangeDisabled: exchangeDisabled,
			useTestnet: useTestnet,
			selected_exchange_mode: selected_exchange_mode,
			selected_quickswap_mode: selected_quickswap_mode,
			default_language: default_language,
			invoiceEnabled: invoiceEnabled,
      mcwallet_enable_multitab: mcwallet_enable_multitab,
			SO_addAllEnabledWalletsAfterRestoreOrCreateSeedPhrase: SO_addAllEnabledWalletsAfterRestoreOrCreateSeedPhrase,

			rememberUserWallet: rememberUserWallet,

			hideServiceLinks: hideServiceLinks,

      wc_disabled: wc_disabled,
      wc_projectid: wc_projectid,
      
      infura_api_key: infura_api_key,
		};
		
		// Disabled chains
		var chainDisabledCheckboxes = thisParent.find('[data-option-target="disabled_wallet"]');
		chainDisabledCheckboxes.each((i, chainCheckbox) => {
			data[$(chainCheckbox).data('chain') + 'Disabled'] = $(chainCheckbox).is(':checked') ? 'true' : 'false';
		})

		mcwalletSpinner(thisBtn);

		$.post( mcwallet.ajaxurl, data, function(response) {

			if( response.status == 'success' ) {
				mcwalletNotice( mcwallet.notices.updated, 'success');
				$('.mcwallet-page-url').val( response.url );
				$('.mcwallet-page-slug').val( response.slug );
				$('.mcwallet-button-url').attr('href', response.url );
				$('.mcwallet-button-thickbox').attr('href', response.thickbox );
			}
			if ( response.status == 'false' ) {
				mcwalletNotice( mcwallet.notices.wrong, 'error');
			}
			mcwalletSpinner(thisBtn);
		});
		
	});

	/**
	 * Select/Upload icon
	 */
	$('body').on('click', '.mcwallet-load-icon', function(e){
		e.preventDefault();

		var button = $(this),
			custom_uploader = wp.media({
				title: mcwallet.uploader.title,
				library : {
					type : 'image'
				},
			button: {
				text: mcwallet.uploader.button
			},
			multiple: false
		}).on('select', function() {
			var attachment = custom_uploader.state().get('selection').first().toJSON();
			$('.mcwallet-input-icon').val( attachment.url );
		})
		.open();
	});

	/**
	 * Select/Upload logo
	 */
	$('body').on('click', '.mcwallet-load-logo', function(e){
		e.preventDefault();

		var button = $(this),
			custom_uploader = wp.media({
				title: mcwallet.uploader.title,
				library : {
					type : 'image'
				},
			button: {
				text: mcwallet.uploader.button
			},
			multiple: false
		}).on('select', function() {
			var attachment = custom_uploader.state().get('selection').first().toJSON();
			$('.mcwallet-input-logo').val( attachment.url );
		})
		.open();
	});
		
		/**
	 * Select/Upload dark logo
	 */
	$('body').on('click', '.mcwallet-load-dark-logo', function(e){
		e.preventDefault();

		var button = $(this),
			custom_uploader = wp.media({
				title: mcwallet.uploader.title,
				library : {
					type : 'image'
				},
			button: {
				text: mcwallet.uploader.button
			},
			multiple: false
		}).on('select', function() {
			var attachment = custom_uploader.state().get('selection').first().toJSON();
			$('.mcwallet-input-dark-logo').val( attachment.url );
		})
		.open();
	});
	
	/**
	 * Select/Upload Image
	 */
	$('body').on('click', '.mcwallet-load-image', function(e){
		e.preventDefault();
 
		var button = $(this),
			input = button.prev(),
			custom_uploader = wp.media({
				title: mcwallet.uploader.title,
				library : {
					type : 'image'
				},
			button: {
				text: mcwallet.uploader.button
			},
			multiple: false
		}).on('select', function() {
			var attachment = custom_uploader.state().get('selection').first().toJSON();
			input.val( attachment.url );
		})
		.open();
	});
	
	/**
	 * Add String
	 */
	$('body').on('click', '.mcwallet-add-string', function(e){
		e.preventDefault();
		
		if ( $('.mcwallet-strings-empty-row').length ) {
			$('.mcwallet-strings-empty-row').remove();
		}
		
		var count = $('.mcwallet-strings-row').length;
		
		var rowString = '<div class="mcwallet-strings-row">' +
							'<div class="mcwallet-string-col">' +
								'<input type="text" name="string_' + count + '" class="large-text mcwallet-string-input" value="">' + 
							'</div>' +
							'<div class="mcwallet-string-col">' +
								 '<input type="text" name="string_' + count + '" class="large-text mcwallet-string-input" value="">' + 
							'</div>' +
							'<div class="mcwallet-string-action">' +
								'<a href="#" class="button-link-delete mcwallet-remove-string"><span class="dashicons dashicons-trash"></span></a>' +
							'</div>' +
						'</div>';
		 count++;
		$('.mcwallet-strings-body').append( rowString );
	});
	
	/**
	 * Add String
	 */
	$('body').on('click', '.mcwallet-remove-string', function(e){
		e.preventDefault();
		if ( ! $('.mcwallet-strings-row').length ) {
			var emptyString = '<div class="mcwallet-strings-empty-row">no strings</div>';
			$('.mcwallet-strings-body').append( emptyString );
		}
		$(this).parents('.mcwallet-strings-row').remove();
	});
	
	
	/**
	 * Enable/Disable edit url
	 */
	$('#mcwallet_is_home').on( 'change', function(e) {
		var ishome = 'false';
		if ( $(this).is(':checked') ) {
			$('.mcwallet-page-slug').attr('disabled','true');
			$('.mcwallet-button-url').addClass('disabled');
		} else {
			$('.mcwallet-page-slug').removeAttr('disabled');
			$('.mcwallet-button-url').removeClass('disabled');
		}
	});

	/**
	 * Select Color
	 */
	$('.mcwallet-icon-bg').wpColorPicker();
	$('.mcwallet-color-picker').wpColorPicker();
	
	/**
	 * Timynce text template
	 */
	$('.insert-text-template').on('click', function(e){
		e.preventDefault();
		var thisEditor = $(this).data('editor-id');
		var thisText = $(this).data('text');
		window.tinyMCE.execCommand('mceFocus',false,thisEditor);
		setTimeout(function(){
			wp.media.editor.insert(thisText);
		}, 50);
	});

	/**
	 * Sortable
	 */
	 $('.wp-list-table tbody').sortable({
		axis: 'y',
		cursor: 'move',
		//cancel: '.item-address,.item-name',
		handle: '.item-count',
		placeholder: 'ui-state-highlight',
		update: function( event, ui ) {

			var tableItems = $('.wp-list-table tbody .item');
			var items = [];
			tableItems.each(function( index ) {
				items.push( $( this ).data('name')); 
			});

			var data = {
				action: 'reorder_token',
				nonce: mcwallet.nonce,
				items: items,
			};

			$.post( mcwallet.ajaxurl, data, function(response) {
				console.log(response);
			});

		}
	});

	/**
	 * Faq list
	 */
	const $beforeFaqHolder = $('#mcwallet-faq-before')
	const $afterFaqHolder  = $('#mcwallet-faq-after')

	$('#mcwallet-update-faq').on('click', function (e) {
		e.preventDefault()

		var $beforeFaqsRows = $beforeFaqHolder.find('tr.mcwallet-own-faq-row')
		var $afterFaqsRows = $afterFaqHolder.find('tr.mcwallet-own-faq-row')

		var ajaxData = {
			action: 'mcwallet_update_faqs',
			nonce: mcwallet.nonce,
			faqsBefore: [],
			faqsAfter: []
		}

		$beforeFaqsRows.each((i, rowholder) => {
			var title = $($(rowholder).find('input[data-mcwallet-target="mcwallet-faq-title"]')[0]).val()
			var content = $($(rowholder).find('textarea[data-mcwallet-target="mcwallet-faq-content"]')[0]).val()
			ajaxData.faqsBefore.push({
				title,
				content
			})
		});

		$afterFaqsRows.each((i, rowholder) => {
			var title = $($(rowholder).find('input[data-mcwallet-target="mcwallet-faq-title"]')[0]).val()
			var content = $($(rowholder).find('textarea[data-mcwallet-target="mcwallet-faq-content"]')[0]).val()
			ajaxData.faqsAfter.push({
				title,
				content
			})
		});

		var thisBtn = $(this)
		mcwallet.showSpinner(thisBtn)
		$.post( mcwallet.ajaxurl, ajaxData, function(response) {
			if( response.status == 'success' ) {
				mcwallet.showNotice( mcwallet.notices.updated, 'success')
			}
			if ( response.status == 'false' ) {
				mcwallet.showNotice( mcwallet.notices.wrong, 'error')
			}
			mcwallet.showSpinner(thisBtn)
		});
	});

	$('a[data-mcwallet-action="mcwallet_faq_add"]').on('click', function (e) {
		e.preventDefault();
		var title = $('input[data-mcwallet-role="mcwallet-addfaq-title"]').val();
		var content = $('textarea[data-mcwallet-role="mcwallet-addfaq-content"]').val();
		var $newRow = $('tbody[data-mcwallet-role="faq_template"] > tr').clone();
		$('input[data-mcwallet-role="mcwallet-addfaq-title"]').val('');
		$('textarea[data-mcwallet-role="mcwallet-addfaq-content"]').val('');
		$newRow.css({ opacity: 0 });
		$($newRow.find('input[data-mcwallet-target="mcwallet-faq-title"]')[0]).val(title);
		$($newRow.find('textarea[data-mcwallet-target="mcwallet-faq-content"]')[0]).val(content);
		$afterFaqHolder.append($newRow);
		$afterFaqHolder.find('tr[data-mcwallet-role="empty-row"]').addClass('-mc-hidden');
		$newRow.animate( { opacity: 1 }, 500);
	});

	$('table.mcwallet-faq-list').on('click', 'a[data-mcwallet-action="mcwallet_faq_move_up"]', function (e) {
		e.preventDefault();
		var faqHolder = $($(e.target).parents('tr')[0])
		var topHolder = $($(e.target).parents('tbody')[0])
		let faqPrev = $(faqHolder.prev('tr')[0])
		if (faqPrev.length && faqPrev.data('mcwallet-role') === 'empty-row') {
			faqPrev = $(faqPrev.prev('tr')[0])
		}
		if (faqPrev.length) {
			faqHolder
				.animate({
					opacity: 0
				},
				500,
				() => {
					faqHolder
						.insertBefore(faqPrev)
						.animate({ opacity: 1, duration: 500 })
				})
		} else {
			if (topHolder.data('mcwallet-role') === 'faq-after-holder') {
				faqHolder
					.animate({
						opacity: 0
					},
					500,
					() => {
						$beforeFaqHolder.find('tr[data-mcwallet-role="empty-row"]').addClass('-mc-hidden')
						$beforeFaqHolder.append(faqHolder)
						faqHolder.animate({ opacity: 1, duration: 500 })
						const afterFaqs = $afterFaqHolder.find('tr.mcwallet-own-faq-row')
						if (!afterFaqs.length) {
							$afterFaqHolder.find('tr[data-mcwallet-role="empty-row"]').removeClass('-mc-hidden')
						}
					})
			}
		}
	});

	$('table.mcwallet-faq-list').on('click', 'a[data-mcwallet-action="mcwallet_faq_move_down"]', function (e) {
		e.preventDefault();
		var faqHolder = $($(e.target).parents('tr')[0])
		var topHolder = $($(e.target).parents('tbody')[0])
		let faqNext = $(faqHolder.next('tr')[0])
		if (faqNext.length && faqNext.data('mcwallet-role') === 'empty-row') {
			faqNext = $(faqNext.next('tr')[0])
		}
		if (faqNext.length) {
			faqHolder
				.animate({
					opacity: 0
				},
				500,
				() => {
					faqHolder
						.insertAfter(faqNext)
						.animate({ opacity: 1, duration: 500 })
				})
		} else {
			if (topHolder.data('mcwallet-role') === 'faq-before-holder') {
				faqHolder
					.animate({
						opacity: 0
					},
					500,
					() => {
						$afterFaqHolder.find('tr[data-mcwallet-role="empty-row"]').addClass('-mc-hidden')
						$afterFaqHolder.prepend(faqHolder)
						faqHolder.animate({ opacity: 1, duration: 500 })
						const beforeFaqs = $beforeFaqHolder.find('tr.mcwallet-own-faq-row')
						if (!beforeFaqs.length) {
							$beforeFaqHolder.find('tr[data-mcwallet-role="empty-row"]').removeClass('-mc-hidden')
						}
					})
			}
		}
	});

	$('table.mcwallet-faq-list').on('click', 'a[data-mcwallet-action="mcwallet_faq_remove"]', function (e) {
		e.preventDefault();
		if (confirm(mcwallet.notices.confirmDelete)) {
			var faqHolder = $($(e.target).parents('tr')[0])
			var topHolder = $($(e.target).parents('tbody')[0])
			faqHolder.animate({
				opacity: 0
			},
			500,
			() => {
				faqHolder.remove()
				if(!topHolder.find('tr.mcwallet-own-faq-row').length) {
					topHolder.find('tr[data-mcwallet-role="empty-row"]').removeClass('-mc-hidden')
				}
			})
		}
	});

	/**
	 * Menu List
	 */
	var $beforeMenuHolder = $('#mcwallet-menu-before');
	var $afterMenuHolder = $('#mcwallet-menu-after');

	$('#mcwallet-update-menu').on('click', function (e) {
		e.preventDefault();

		var $beforemenusRows = $beforeMenuHolder.find('tr.mcwallet-own-menu-row');
		var $aftermenusRows = $afterMenuHolder.find('tr.mcwallet-own-menu-row');
		var ajaxData = {
			action: 'mcwallet_update_menus',
			nonce: mcwallet.nonce,
			menusBefore: [],
			menusAfter: []
		}
		$beforemenusRows.each((i, rowholder) => {
			var title = $($(rowholder).find('input[data-mcwallet-target="mcwallet-menu-title"]')[0]).val()
			var link = $($(rowholder).find('input[data-mcwallet-target="mcwallet-menu-link"]')[0]).val()
			var newwindow = $(rowholder).find('input[data-mcwallet-target="mcwallet-menu-newwindow"]')[0].checked
			ajaxData.menusBefore.push({
				title,
				link,
				newwindow
			});
		});

		$aftermenusRows.each((i, rowholder) => {
			var title = $($(rowholder).find('input[data-mcwallet-target="mcwallet-menu-title"]')[0]).val()
			var link = $($(rowholder).find('input[data-mcwallet-target="mcwallet-menu-link"]')[0]).val()
			var newwindow = $(rowholder).find('input[data-mcwallet-target="mcwallet-menu-newwindow"]')[0].checked
			ajaxData.menusAfter.push({
				title,
				link,
				newwindow
			});
		});

		var thisBtn = $(this);
		mcwallet.showSpinner(thisBtn);
		$.post( mcwallet.ajaxurl, ajaxData, function(response) {
			if( response.status == 'success' ) {
				mcwallet.showNotice( mcwallet.notices.updated, 'success')
			}
			if ( response.status == 'false' ) {
				mcwallet.showNotice( mcwallet.notices.wrong, 'error')
			}
			mcwallet.showSpinner(thisBtn);
		});
	});

	$('a[data-mcwallet-action="mcwallet_menu_add"]').on('click', function (e) {
		e.preventDefault();
		var title = $('input[data-mcwallet-role="mcwallet-addmenu-title"]').val();
		var link = $('input[data-mcwallet-role="mcwallet-addmenu-link"]').val();
		var newwindow = $('input[data-mcwallet-role="mcwallet-addmenu-newwindow"]')[0].checked;
		var $newRow = $('tbody[data-mcwallet-role="menu_template"] > tr').clone();
		$('input[data-mcwallet-role="mcwallet-addmenu-title"]').val('');
		$('input[data-mcwallet-role="mcwallet-addmenu-link"]').val('');
		$newRow.css({ opacity: 0 });
		$($newRow.find('input[data-mcwallet-target="mcwallet-menu-title"]')[0]).val(title);
		$($newRow.find('input[data-mcwallet-target="mcwallet-menu-link"]')[0]).val(link);
		$newRow.find('input[data-mcwallet-target="mcwallet-menu-newwindow"]')[0].checked = newwindow;
		$afterMenuHolder.append($newRow);
		$afterMenuHolder.find('tr[data-mcwallet-role="empty-row"]').addClass('-mc-hidden');
		$newRow.animate( { opacity: 1 }, 500);
	});

	$('table.mcwallet-menu-list').on('click', 'a[data-mcwallet-action="mcwallet_menu_move_up"]', function (e) {
		e.preventDefault();
		var menuHolder = $($(e.target).parents('tr')[0]);
		var topHolder = $($(e.target).parents('tbody')[0]);
		let menuPrev = $(menuHolder.prev('tr')[0]);
		if (menuPrev.length && menuPrev.data('mcwallet-role') === 'empty-row') {
			menuPrev = $(menuPrev.prev('tr')[0]);
		}
		if (menuPrev.length) {
			menuHolder
				.animate({
					opacity: 0
				},
				500,
				() => {
					menuHolder
						.insertBefore(menuPrev)
						.animate({ opacity: 1, duration: 500 })
				})
		} else {
			if (topHolder.data('mcwallet-role') === 'menu-after-holder') {
				menuHolder
					.animate({
						opacity: 0
					},
					500,
					() => {
						$beforeMenuHolder.find('tr[data-mcwallet-role="empty-row"]').addClass('-mc-hidden');
						$beforeMenuHolder.append(menuHolder);
						menuHolder.animate({ opacity: 1, duration: 500 });
						const aftermenus = $afterMenuHolder.find('tr.mcwallet-own-menu-row');
						if (!aftermenus.length) {
							$afterMenuHolder.find('tr[data-mcwallet-role="empty-row"]').removeClass('-mc-hidden');
						}
					})
			}
		}
	});

	$('table.mcwallet-menu-list').on('click', 'a[data-mcwallet-action="mcwallet_menu_move_down"]', function (e) {
		e.preventDefault();
		var menuHolder = $($(e.target).parents('tr')[0]);
		var topHolder = $($(e.target).parents('tbody')[0]);
		let menuNext = $(menuHolder.next('tr')[0])
		if (menuNext.length && menuNext.data('mcwallet-role') === 'empty-row') {
			menuNext = $(menuNext.next('tr')[0])
		}
		if (menuNext.length) {
			menuHolder
				.animate({
					opacity: 0
				},
				500,
				() => {
					menuHolder
						.insertAfter(menuNext)
						.animate({ opacity: 1, duration: 500 })
				})
		} else {
			if (topHolder.data('mcwallet-role') === 'menu-before-holder') {
				menuHolder
					.animate({
						opacity: 0
					},
					500,
					() => {
						$afterMenuHolder.find('tr[data-mcwallet-role="empty-row"]').addClass('-mc-hidden')
						$afterMenuHolder.prepend(menuHolder)
						menuHolder.animate({ opacity: 1, duration: 500 })
						const beforemenus = $beforeMenuHolder.find('tr.mcwallet-own-menu-row')
						if (!beforemenus.length) {
							$beforeMenuHolder.find('tr[data-mcwallet-role="empty-row"]').removeClass('-mc-hidden')
						}
					})
			}
		}
	});

	$('table.mcwallet-menu-list').on('click', 'a[data-mcwallet-action="mcwallet_menu_remove"]', function (e) {
		e.preventDefault();
		if (confirm(mcwallet.notices.confirmDelete)) {
			var menuHolder = $($(e.target).parents('tr')[0])
			var topHolder = $($(e.target).parents('tbody')[0])
			menuHolder.animate({
				opacity: 0
			},
			500,
			() => {
				menuHolder.remove()
				if(!topHolder.find('tr.mcwallet-own-menu-row').length) {
					topHolder.find('tr[data-mcwallet-role="empty-row"]').removeClass('-mc-hidden')
				}
			})
		}
	});

})( jQuery );
