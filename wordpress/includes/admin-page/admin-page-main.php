<?php
/**
 * Main Admin Page
 * 
 * @package Multi Currency Wallet
 */


/**
 * Menu Page
 */
function mcwallet_menu_page() {
	$menu_page = add_menu_page(
		esc_html__( 'Multi Currency Wallet', 'multi-currency-wallet' ),
		esc_html__( 'MCWallet', 'multi-currency-wallet' ),
		'manage_options',
		'mcwallet',
		'mcwallet_page',
		'dashicons-swap-logo',
		81
	);
}
add_action( 'admin_menu', 'mcwallet_menu_page' );

/**
 * Widget Page
 */
function mcwallet_page() {

	$erc20tokens = get_option('mcwallet_tokens');

?>

<div class="wrap">
	<h2><?php echo get_admin_page_title(); ?></h2>
	<div class="notice mcwallet-notice hide-all"><p></p></div>

	<div class="mcwallet-welcome-panel">

		<?php if ( mcwallet_admin_page_tabs() ) { ?>

			<div class="welcome-panel-content">

				<h2 class="nav-tab-wrapper mcwallet-nav-tabs wp-clearfix">
					<?php
					$tab_index = 0;
					foreach( mcwallet_admin_page_tabs() as $slug => $title ) {
						$tab_class = 'nav-tab';
						if ( 0 === $tab_index ) {
							$tab_class .= ' nav-tab-active';
						}
						$tab_index++;
						?>
						<a href="#mcwallet-tab-<?php echo esc_attr( $slug ); ?>" class="<?php echo esc_attr( $tab_class ); ?>"><?php echo esc_html( $title ); ?></a>
					<?php } ?>
				</h2><!-- .nav-tab-wrapper -->

				<?php
				$tab_index = 0;
				foreach( mcwallet_admin_page_tabs() as $slug => $title ) {
					$tab_class = 'welcome-panel-column-container mcwallet-panel-tab mcwallet-form-options';
					if ( 0 === $tab_index ) {
						$tab_class .= ' panel-tab-active';
					}
					$tab_index++;
					?>
					<div class="<?php echo esc_attr( $tab_class ); ?>" id="mcwallet-tab-<?php echo esc_attr( $slug ); ?>">
						<?php
						$tab_template = MCWALLET_PATH . 'includes/admin-page/tabs/' . $slug . '.php';
						if ( file_exists( $tab_template ) ) {
							require $tab_template;
						} else {
							$content = '<p>' . esc_html__( 'Tab is empty.', 'multi-currency-wallet' ) . '</p>';
							echo apply_filters( 'mcwallet_admin_page_tab', $content, $slug );
						}
						?>
					</div><!-- .mcwallet-panel-tab -->
				<?php } ?>

				<?php mcwallet_info_bar_markup(); ?>

			</div><!-- .welcome-panel-content -->

		<?php } ?>

	</div><!-- .welcome-panel -->
</div>

	<?php
}

/**
 * Main Page Settings
 */
require MCWALLET_PATH . 'includes/admin-page/main-page-settings.php';
