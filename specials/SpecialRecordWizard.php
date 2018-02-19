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
		if ( !( $this->isUploadAllowed() && $this->isUserUploadAllowed( $this->getUser() ) ) ) {
			return;
		}

		$out->addModuleStyles( 'ext.recordWizard.styles' );
		$out->addModules( 'ext.recordWizard' );
		$out->setPageTitle( $this->msg( 'special-recordWizard-title' ) );
		$out->addHelpLink( 'Yolo' );
		$out->addWikiMsg( 'special-recordWizard-intro' );
		$out->addHTML( $this->getWizardHtml() );
	}

	protected function getGroupName() {
		return 'media';
	}

	/**
	 * Check if anyone can upload (or if other sitewide config prevents this)
	 * Side effect: will print error page to wgOut if cannot upload.
	 * @return boolean -- true if can upload
	 */
	private function isUploadAllowed() {
		// Check uploading enabled
		if ( !UploadBase::isEnabled() ) {
			$this->getOutput()->showErrorPage( 'uploaddisabled', 'uploaddisabledtext' );
			return false;
		}
		// XXX does wgEnableAPI affect all uploads too?
		// Check whether we actually want to allow changing stuff
		if ( wfReadOnly() ) {
			$this->getOutput()->readOnlyPage();
			return false;
		}
		// we got all the way here, so it must be okay to upload
		return true;
	}

	/**
	 * Check if the user can upload
	 * Side effect: will print error page to wgOut if cannot upload.
	 * @param User $user
	 * @throws PermissionsError
	 * @throws UserBlockedError
	 * @return boolean -- true if can upload
	 */
	private function isUserUploadAllowed( User $user ) {
		// Check permissions
		$permissionRequired = UploadBase::isAllowed( $user );
		if ( $permissionRequired !== true ) {
			throw new PermissionsError( $permissionRequired );
		}
		// Check blocks
		if ( $user->isBlocked() ) {
			throw new UserBlockedError( $user->getBlock() );
		}
		// Global blocks
		if ( $user->isBlockedGlobally() ) {
			throw new UserBlockedError( $user->getGlobalBlock() );
		}

		// we got all the way here, so it must be okay to upload
		return true;
	}

	protected function getWizardHtml() {
		global $wgExtensionAssetsPath;

		return '<div id="mwe-recwiz">

		            <ul class="mwe-recwiz-steps">
                    </ul>

                    <div id="mwe-recwiz-content">
                    </div>

		        </div>';
	}
}
