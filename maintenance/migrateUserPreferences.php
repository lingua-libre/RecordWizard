<?php

$basePath = getenv( 'MW_INSTALL_PATH' ) !== false ? getenv( 'MW_INSTALL_PATH' ) : __DIR__ . '/../../..';
require_once $basePath . '/maintenance/Maintenance.php';

class MigrateUserPreferences extends Maintenance {
	public function __construct() {
		parent::__construct();

		$this->addDescription( 'Migrate the user configuration related to the Record Wizard from the old format (in the preferences) to the new one (in a dedicated personal json subpage). You may want to run the cleanupPreferences.php script right after this one.' );
		$this->requireExtension( 'RecordWizard' );
	}

	public function execute() {
		// list all users
		$dbr = wfGetDB( DB_SLAVE );
		$id_list = $dbr->select( 'user', 'user_id' );
		foreach( $id_list as $user_data ) {
			// get the config from the preferences
			$user = User::newFromId( $user_data->user_id );

			$speaker = $user->getOption( 'recwiz-speaker' );
			$otherSpeakers = $user->getOption( 'recwiz-otherSpeakers' );
			$otherSpeakers = $otherSpeakers == "" ? [] : explode( ',', $otherSpeakers );
			$license = $user->getOption( 'recwiz-license' );

			// format the config into a valid json
			$jsonConfig = json_encode(
				[
					"speaker" => $speaker,
					"otherSpeakers" => $otherSpeakers,
					"license" => $license
				]
			);

			// make an edit to create the personal subpage with the json
			$ucWikiPage = WikiPage::factory( Title::makeTitleSafe( NS_USER, $user->getName() . '/RecordWizard.json' ) );
			$ucWikiPage->doEditContent( new JsonContent( $jsonConfig ), "RecordWizard personal configuration migration", EDIT_INTERNAL, false );
		}
	}
}

$maintClass = MigrateUserPreferences::class;

require_once RUN_MAINTENANCE_IF_MAIN;
