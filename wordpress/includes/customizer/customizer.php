<?php
/**
 * Multi Currency Wallet Customizer
 */

/**
 * Register Controls
 */
function mcwallet_customize_register( $wp_customize ) {

	$wp_customize->add_panel( 'mcwallet_design', array(
		'title'       => esc_html__( 'MCWallet Design', 'multi-currency-wallet' ),
		'description' => '',
		'priority'    => 130,
	) );

	$wp_customize->add_section( 'mcwallet_scheme', array(
		'title'       => esc_html__( 'Site Color Scheme', 'multi-currency-wallet' ),
		'description' => '',
		'panel'       => 'mcwallet_design',
	) );

	$wp_customize->add_section( 'mcwallet_scheme_light', array(
		'title'       => esc_html__( 'Light Scheme', 'multi-currency-wallet' ),
		'description' => '',
		'panel'       => 'mcwallet_design',
	) );

	$wp_customize->add_section( 'mcwallet_scheme_dark', array(
		'title'       => esc_html__( 'Dark Scheme', 'multi-currency-wallet' ),
		'description' => '',
		'panel'       => 'mcwallet_design',
	) );

	$wp_customize->add_section( 'mcwallet_scheme_all', array(
		'title'       => esc_html__( 'Global settings', 'multi-currency-wallet' ),
		'description' => '',
		'panel'       => 'mcwallet_design',
	) );

	$wp_customize->add_setting( 'color_scheme', array(
		'default'           => 'light',
		'transport'         => 'postMessage',
		'sanitize_callback' => 'sanitize_text_field',
	) );

	$wp_customize->add_control( 'color_scheme', array(
		'type'    => 'radio',
		'section' => 'mcwallet_scheme',
		'label'   => esc_html__( 'Select Color Scheme', 'multi-currency-wallet' ),
		'choices' => array(
			'light'      => esc_html__( 'Light', 'multi-currency-wallet' ),
			'dark'       => esc_html__( 'Dark', 'multi-currency-wallet' ),
			'only_light' => esc_html__( 'Only light', 'multi-currency-wallet' ),
			'only_dark'  => esc_html__( 'Only dark', 'multi-currency-wallet' ),
		),
	) );

	$wp_customize->add_setting( 'button_border_radius', array(
		'default'           => '0',
		'transport'         => 'postMessage',
		'sanitize_callback' => 'sanitize_text_field',
	) );

	$wp_customize->add_control( 'button_border_radius', array(
		'type'    => 'number',
		'section' => 'mcwallet_scheme_all',
		'label'   => esc_html__( 'Button border radius (rem)', 'multi-currency-wallet' ),
	) );

	$wp_customize->add_setting( 'main_component_border_radius', array(
		'default'           => '0',
		'transport'         => 'postMessage',
		'sanitize_callback' => 'sanitize_text_field',
	) );

	$wp_customize->add_control( 'main_component_border_radius', array(
		'type'    => 'number',
		'section' => 'mcwallet_scheme_all',
		'label'   => esc_html__( 'Main component border radius (rem)', 'multi-currency-wallet' ),
	) );

	foreach( mcwallet_default_colors() as $name => $scheme ) {

		$wp_customize->add_setting( 'color_' . $name,
			array(
				'default'           => $scheme['default'],
				'type'              => 'theme_mod',
				'transport'         => 'postMessage',
				'sanitize_callback' => 'sanitize_text_field',
			)
		);

		$wp_customize->add_control( new WP_Customize_Color_Control(
			$wp_customize,
			'color_' . $name,
			array(
				'label'      => $scheme['label'],
				'settings'   => 'color_' . $name,
				'section'    => 'mcwallet_scheme_light',
			)
		) );

		$wp_customize->add_setting( 'color_' . $name . '_dark',
			array(
				'default'           => $scheme['dark'],
				'type'              => 'theme_mod',
				'transport'         => 'postMessage',
				'sanitize_callback' => 'sanitize_text_field',
			)
		);

		$wp_customize->add_control( new WP_Customize_Color_Control(
			$wp_customize,
			'color_' . $name . '_dark',
			array(
				'label'    => $scheme['label'],
				'settings' => 'color_' . $name . '_dark',
				'section'  => 'mcwallet_scheme_dark',
			 ) 
		) );

	}
}
add_action( 'customize_register', 'mcwallet_customize_register' );

/**
 * Binds JS handlers to make Theme Customizer preview reload changes asynchronously.
 */
function mcwallet_customize_preview_init() {

	wp_enqueue_script( 'mcwallet-customizer', MCWALLET_URL . 'assets/js/customizer.js', array( 'jquery', 'customize-preview', 'customize-selective-refresh' ), MCWALLET_VER . '-' . MCWALLET_BUILD_VER, true );

}
add_action( 'customize_preview_init', 'mcwallet_customize_preview_init' );
