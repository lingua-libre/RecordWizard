<?php
/**
 * recordWizard SpecialPage for RecordWizard extension
 *
 * @file
 * @ingroup Extensions
 */
class SpecialRecordWizard extends SpecialPage {
	public function __construct() {
		parent::__construct( 'recordWizard' );
	}

	/**
	 * Show the page to the user
	 *
	 * @param string $sub The subpage string argument (if any).
	 */
	public function execute( $sub ) {
		$out = $this->getOutput();
		$out->setPageTitle( $this->msg( 'special-recordWizard-title' ) );
		$out->addHelpLink( 'How to become a MediaWiki hacker' );
		$out->addWikiMsg( 'special-recordWizard-intro' );
	}

	protected function getGroupName() {
		return 'media';
	}
}
