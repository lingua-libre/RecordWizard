<?php
/**
 * recordWizard SpecialPage for RecordWizard extension
 *
 * @file
 * @ingroup Extensions
 */
class SpecialRecordWizard extends SpecialPage {
	public function __construct() {
		parent::__construct( 'RecordWizard', 'upload' );
	}

	/**
	 * Show the page to the user
	 *
	 * @param string $sub The subpage string argument (if any).
	 */
	public function execute( $sub ) {
		$out = $this->getOutput();
		if ( !$this->userCanExecute( $this->getUser() ) or $this->getUser()->isBlocked() ) {
			$this->displayRestrictionError();
			return;
		}

		$out->addModules( 'ext.recwiz' );
		$out->setPageTitle( $this->msg( 'special-recordWizard-title' ) );
		$out->addHelpLink( 'Yolo' );
		$out->addWikiMsg( 'special-recordWizard-intro' );
	}

	protected function getGroupName() {
		return 'media';
	}
}
