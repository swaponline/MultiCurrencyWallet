/**
 * Widget Admin Scripts
 */
( function( $ ) {

	// Colors toggle
	var colors = [
		'background',
		'text',
		'brand',
		'brand_hover',
		'brand_background',
	];

	colors.forEach( function( name, index ) {

		for ( let i = 0; i < 2; i++) {
			var scheme = '';
			var control = name;
			if ( i == 1 ) {
				control = name + '_dark';
			}

			wp.customize(
				'color_' + control,
				function ( value ) {
					value.bind(
						function ( new_value, old_value ) {

							var cssVariable = '--color-' + name;
							if ( control == 'text' || control == 'text_dark' ) {
								cssVariable = '--color';
							}
							if ( control == 'background' || control == 'background_dark' ) {
								cssVariable = '--color-page-background';
							}

							cssVariable = cssVariable.replace( '_', '-');

							var elem = document.getElementById( 'mcwallet-inline-styles' );

							// Get old style
							var oldCssText = elem.sheet.cssRules[i].style.cssText;

							// Replace old to new style
							var newCssText = oldCssText.replace( cssVariable + ': ' + old_value, cssVariable + ': ' + new_value );

							// Add new style
							elem.sheet.cssRules[i].style.cssText = newCssText;

							console.log(elem.sheet.cssRules[i].style.cssText);
						}
					);
				}
			);
		}
	});

	// button border radius
	wp.customize(
		'button_border_radius',
		function ( value ) {
			value.bind(
				function ( new_value, old_value ) {
					cssVariable = '--button-border-radius';
					var elem = document.getElementById( 'mcwallet-inline-styles' );
					var oldCssText = elem.sheet.cssRules[2].style.cssText;
					var newCssText = oldCssText.replace( cssVariable + ': ' + old_value + 'rem', cssVariable + ': ' + new_value + 'rem' );
					elem.sheet.cssRules[2].style.cssText = newCssText;
				}
			);
		}
	);

	// main container radius
	wp.customize(
		'main_component_border_radius',
		function ( value ) {
			value.bind(
				function ( new_value, old_value ) {
					cssVariable = '--main-component-border-radius';
					var elem = document.getElementById( 'mcwallet-inline-styles' );
					var oldCssText = elem.sheet.cssRules[2].style.cssText;
					var newCssText = oldCssText.replace( cssVariable + ': ' + old_value + 'rem', cssVariable + ': ' + new_value + 'rem' );
					elem.sheet.cssRules[2].style.cssText = newCssText;
				}
			);
		}
	);

	// Scheme Switch
	wp.customize(
		'color_scheme',
		function ( value ) {
			value.bind(
				function ( new_value, old_value ) {
					if ( new_value == 'dark' ||  new_value == 'only_dark' ) {
						$('body').attr('data-scheme','dark');
					} else {
						$('body').attr('data-scheme','default');
					}
				}
			);
		}
	);

})( jQuery );
