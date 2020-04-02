<?php

class I18nTemplateParser extends TemplateParser {

	/**
	 * Compile the Mustache code into PHP code using LightnCandy
	 * This is a derivate from the original compile method of TemplateParser
	 * @param string $code Mustache code
	 * @return string PHP code (with '<?php')
	 * @throws RuntimeException
	 */
	protected function compile( $code ) {
		if ( !class_exists( 'LightnCandy' ) ) {
			throw new RuntimeException( 'LightnCandy class not defined' );
		}
		return LightnCandy::compile(
			$code,
			[
				'flags' => $this->compileFlags,
				'basedir' => $this->templateDir,
				'fileext' => '.mustache',
				'helpers' => array(
					'_' => function( $msg ) {
						return wfMessage( ...$msg )->plain();
					},
					'__' => function( $msg ) {
						return wfMessage( ...$msg )->parse();
					},
				),
			]
		);
	}
}



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
		global $wgRecordWizardConfig, $wgWBRepoSettings;

		$out = $this->getOutput();
		$out->enableOOUI();
		$user = $this->getUser();
		$config = $wgRecordWizardConfig;
		if ( !( $this->isUploadAllowed() && $this->isUserUploadAllowed( $user ) ) ) {
			return;
		}

		$qids = [];
		$dbr = wfGetDB( DB_REPLICA );

		$res = $dbr->select(
			array( 'page', 'pagelinks' ),
			array( 'page_title' ),
			array(
				'pl_from_namespace = ' . $wgWBRepoSettings['entityNamespaces']['item'],
				'pl_namespace = ' . $wgWBRepoSettings['entityNamespaces']['item'],
				'pl_title' => $wgRecordWizardConfig['items']['language'],
				'page_content_model' => 'wikibase-item',
			),
			__METHOD__,
			array(),
			array(
				'pagelinks' => array( 'INNER JOIN', array( 'pl_from=page_id' ) )
			)
		);

		foreach( $res as $row ) {
			$qids[] = $row->page_title;
		}

		$titles = [];
		foreach( $qids as $qid ) {
			$titles[] = \Title::makeTitle( $wgWBRepoSettings['entityNamespaces']['item'], $qid );
		}

		$wbRepo = Wikibase\Repo\WikibaseRepo::getDefaultInstance();
		$entityIdLookup = $wbRepo->getEntityIdLookup();
		$entityRevisionLookup = $wbRepo->getEntityRevisionLookup();
		$languageFallbackChain = $wbRepo->getLanguageFallbackChainFactory()->newFromLanguage( $wbRepo->getUserLanguage() );

		$entities = $entityIdLookup->getEntityIds( $titles );
		$langCodeProperty = $entityIdLookup->getEntityIdForTitle( \Title::makeTitle( $wgWBRepoSettings['entityNamespaces']['property'], $wgRecordWizardConfig['properties']['langCode'] ) );
		$iso3Property = $entityIdLookup->getEntityIdForTitle( \Title::makeTitle( $wgWBRepoSettings['entityNamespaces']['property'], $wgRecordWizardConfig['properties']['iso3'] ) );
		$wikidataIdProperty = $entityIdLookup->getEntityIdForTitle( \Title::makeTitle( $wgWBRepoSettings['entityNamespaces']['property'], $wgRecordWizardConfig['properties']['wikidataId'] ) );
		$mediaTypeProperty = $entityIdLookup->getEntityIdForTitle( \Title::makeTitle( $wgWBRepoSettings['entityNamespaces']['property'], $wgRecordWizardConfig['properties']['mediaType'] ) );

		$config[ 'languages' ] = array();
		foreach ( $entities as $id => $itemId ) {
			//TODO: Perfs: do only one DB request instead of N
			$item = $entityRevisionLookup->getEntityRevision( $itemId )->getEntity();

			$labels = $item->getLabels()->toTextArray();
			$label = $languageFallbackChain->extractPreferredValueOrAny( $labels )[ 'value' ];

			$langCodes = $this->getPropertyValues( $item, $langCodeProperty );
			$langCode = (count($langCodes) > 0 ? $langCodes[ 0 ][ 'value' ] : null);

			$iso3s = $this->getPropertyValues( $item, $iso3Property );
			$iso3 = (count($iso3s) > 0 ? $iso3s[ 0 ][ 'value' ] : null);

			$wikidataIds = $this->getPropertyValues( $item, $wikidataIdProperty );
			$wikidataId = (count($wikidataIds) > 0 ? $wikidataIds[ 0 ][ 'value' ] : null);

			$mediaTypes = $this->getPropertyValues( $item, $mediaTypeProperty );
			$mediaType = (count($mediaTypes) > 0 ? $mediaTypes[ 0 ][ 'value' ] : $wgRecordWizardConfig['items']['mediaTypeAudio']);

			$qid = (string) $itemId;
			$config[ 'languages' ][ $qid ] = array();
			$config[ 'languages' ][ $qid ][ 'code' ] = $langCode;
			$config[ 'languages' ][ $qid ][ 'iso3' ] = $iso3;
			$config[ 'languages' ][ $qid ][ 'mediaType' ] = (string) $mediaType;
			$config[ 'languages' ][ $qid ][ 'wikidataId' ] = $wikidataId;
			$config[ 'languages' ][ $qid ][ 'qid' ] = (string) $qid;
			$config[ 'languages' ][ $qid ][ 'localname' ] = $label;
		}

		// Get speakers
		$locutorId = null;
		$otherLocutorIds = [];
		$userConfigWikiPage = WikiPage::factory( Title::makeTitleSafe( NS_USER, $user->getName() . '/RecordWizard.json' ) );
		if ( $userConfigWikiPage->exists() ) {
			$revision = $userConfigWikiPage->getRevision();
			$content = $revision->getContent( Revision::RAW );
			$text = JsonContentHandler::getContentText( $content );
			$userConfig = json_decode($text, true);
			if ( $userConfig != null ) {
				if ( array_key_exists( 'locutor', $userConfig ) ) {
					$locutorId = $userConfig[ 'locutor' ];
				}
				if ( array_key_exists( 'otherLocutors', $userConfig ) ) {
					$otherLocutorIds = $userConfig[ 'otherLocutors' ];
				}
				if ( array_key_exists( 'license', $userConfig ) ) {
					$config[ 'savedLicense' ] = $userConfig[ 'license' ];
				}
			}
		}

		$config[ 'locutor' ] = $this->getLocutor( $locutorId, $entityIdLookup, $entityRevisionLookup );
		$config[ 'locutor' ][ 'main' ] = true;
		if ( $config[ 'locutor' ][ 'name' ] == null ) {
			$config[ 'locutor' ][ 'name' ] = $user->getName();
		}
		$config[ 'otherLocutors' ] = [];
		foreach( $otherLocutorIds as $qid ) {
			$config[ 'otherLocutors' ][ $qid ] = $this->getLocutor( $qid, $entityIdLookup, $entityRevisionLookup );
		}

		$licensesMessage = $this->msg( 'licenses' );
		while( $licensesMessage->plain() == '-' && $licensesMessage->getLanguage()->getCode() != 'en' ) {
			$fallbackLanguage = $licensesMessage->getLanguage()->getFallbackLanguages()[ 0 ];
			$licensesMessage->inLanguage( $fallbackLanguage );
		}
		if ( $licensesMessage->plain() != '-' ) {
			$licenses = new Licenses( [ 'fieldname' => 'licenses', 'licenses' => $licensesMessage->plain() ] );
			$config[ 'licenses' ] = json_decode( json_encode( $licenses->getLicenses() ), true );
		}
		else {
			//Fallback license, in case [[Mediawiki:Licenses]] is empty
			//TODO: make this configurable
			$config[ 'licenses' ] = array(
				'text' => 'cc-by-sa 4.0',
				'template' => 'cc-by-sa-4.0'
			);
		}

		$config[ 'savedLanguage' ] = $user->getOption( 'recwiz-lang' );

		$out->addJsConfigVars( [ 'RecordWizardConfig' => $config ] );
		$out->addModuleStyles( 'ext.recordWizard.styles' );
		$out->addModules( 'ext.recordWizard' );
		$out->setPageTitle( $this->msg( 'special-recordWizard-title' ) );
		$out->addWikiMsg( 'special-recordWizard-intro' );
		$out->addHTML( $this->getWizardHtml() );
	}

	protected function getGroupName() {
		return 'media';
	}

	private function getLocutor( $locutorId, $entityIdLookup, $entityRevisionLookup ) {
		global $wgRecordWizardConfig, $wgWBRepoSettings;
		$locutor = array(
			'name' => null,
			'gender' => null,
			'location' => null,
			'languages' => null,
			'qid' => null,
		);

		if ( $locutorId != null ) {
			$itemId = $entityIdLookup->getEntityIdForTitle( \Title::makeTitle( $wgWBRepoSettings['entityNamespaces']['item'], $locutorId ) );
			$revision = $entityRevisionLookup->getEntityRevision( $itemId );
			if ( $revision !== null ) {
				$item = $revision->getEntity();

				$instanceOfPropertyId = $entityIdLookup->getEntityIdForTitle( \Title::makeTitle( $wgWBRepoSettings['entityNamespaces']['property'], $wgRecordWizardConfig['properties']['instanceOf'] ) );
				$instanceOf = $this->getPropertyValues( $item, $instanceOfPropertyId );
				if ( count( $instanceOf ) > 0 && $instanceOf[ 0 ][ 'value' ] == $wgRecordWizardConfig['items']['locutor'] ) {
					$labels = $item->getLabels()->getIterator();
					if ( $labels->valid() ) {
						$locutor['name'] = $labels->current()->getText();
					}

					$genderPropertyId = $entityIdLookup->getEntityIdForTitle( \Title::makeTitle( $wgWBRepoSettings['entityNamespaces']['property'], $wgRecordWizardConfig['properties']['gender'] ) );
					$gender = $this->getPropertyValues( $item, $genderPropertyId );
					if ( count( $gender ) > 0 ) {
						$locutor['gender'] = $gender[ 0 ][ 'value' ];
					}

					$locationPropertyId = $entityIdLookup->getEntityIdForTitle( \Title::makeTitle( $wgWBRepoSettings['entityNamespaces']['property'], $wgRecordWizardConfig['properties']['residencePlace'] ) );
					$location = $this->getPropertyValues( $item, $locationPropertyId );
					if ( count( $location ) > 0 ) {
						$locutor['location'] = $location[ 0 ][ 'value' ];
					}

					$spokenLanguagesPropertyId = $entityIdLookup->getEntityIdForTitle( \Title::makeTitle( $wgWBRepoSettings['entityNamespaces']['property'], $wgRecordWizardConfig['properties']['spokenLanguages'] ) );
					$languages = $this->getPropertyValues( $item, $spokenLanguagesPropertyId );
					$locutor['languages'] = array();
					foreach ( $languages as $language ) {
						$langId = $language[ 'value' ];
						$locutor['languages'][ $langId ] = array(
							'qid' => $langId
						);
						$languageLevelProperty = $wgRecordWizardConfig[ 'properties' ][ 'languageLevel' ];
						if ( isset( $language[ 'qualifiers' ][ $languageLevelProperty ] ) ) {
							$locutor[ 'languages' ][ $langId ][ 'languageLevel' ] = $language[ 'qualifiers' ][ $languageLevelProperty ];
						}
					}

					$locutor['qid'] = (string) $itemId;
				}
			}
		}

		return $locutor;
	}

	private function getPropertyValues( $item, $propertyId ) {
		$statements = $item->getStatements()->getByPropertyId( $propertyId )->toArray();
		$elements = array();
		foreach ( $statements as $statement ) {
			$snak = $statement->getMainSnak();
			$value = $this->getSnakValue( $snak );
			if ( $value != null ) {
				$element = array(
					'value' => $value
				);
				$qualifiers = $statement->getQualifiers();
				if ( ! $qualifiers->isEmpty() ) {
					$element['qualifiers'] = array();
					$iterator = $qualifiers->getIterator();
					while ( $iterator->valid() ) {
						$qualifierSnak = $iterator->current();
						$qualifierValue = $this->getsnakValue( $qualifierSnak );
						if ( $qualifierValue != null ) {
							$element['qualifiers'][ (string) $qualifierSnak->getPropertyId() ] = $qualifierValue;
						}
						$iterator->next();
					}
				}
				$elements[] = $element;
			}
		}
		return $elements;
	}

	private function getsnakValue( $snak ) {
		$value = null;
		if ( $snak->getType() == 'value' ) {
			$dataValue = $snak->getDataValue();
			switch ( $dataValue->getType() ) {
				case 'wikibase-entityid':
					$value = (string) $dataValue->getEntityId();
					break;

				default:
					$value = $dataValue->getValue();
					break;
			}
		}
		return $value;
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

		$templateParser = new I18nTemplateParser(  __DIR__ . '/templates', true );
		return $templateParser->processTemplate(
		    'recordwizard',
		    [
		        'wgExtensionAssetsPath' => $wgExtensionAssetsPath,
				'tutorial' => [
					'testButton' => new OOUI\ButtonWidget( [ 'infusable' => true, 'id' => 'mwe-rwt-testbutton', 'label' => wfMessage( 'mwe-recwiz-tutorial-mictester-start' )->plain(), 'classes' => [ 'active' ] ] )
				],
				'locutor' => [
					//'warning' => new OOUI\MessageWidget( [ 'infusable' => true, 'type' => 'warning', 'label' => wfMessage( 'mwe-recwiz-locutor-warning' )->plain() ] ),
					'profile' => new OOUI\DropdownInputWidget( [ 'infusable' => true, 'id' => 'mwe-rwl-profile', 'inputId' => 'mwe-rwl-profile-input' ] ),
					'name' => new OOUI\TextInputWidget( [ 'infusable' => true, 'id' => 'mwe-rwl-name', 'inputId' => 'mwe-rwl-name-input' ] ),
				],
				'details' => [
					'wordInput' => new OOUI\TextInputWidget( [ 'infusable' => true, 'id' => 'mwe-rwd-word', 'inputId' => 'mwe-rwd-word-input', 'placeholder' => wfMessage( 'mwe-recwiz-details-placeholder' )->plain() ] ),
					'wordButton' => new OOUI\ButtonWidget( [ 'infusable' => true, 'id' => 'mwe-rwd-add', 'invisibleLabel' => true, 'icon' => 'add', 'flags' => [ 'primary', 'progressive' ] ] ),
					'clearButton' => new OOUI\ButtonWidget( [ 'infusable' => true, 'id' => 'mwe-rwd-clear', 'label' => wfMessage( 'mwe-recwiz-details-clear' )->plain(), 'flags' => [ 'destructive' ] ] ),
					'deduplicateButton' => new OOUI\ButtonWidget( [ 'infusable' => true, 'id' => 'mwe-rwd-deduplicate', 'label' => wfMessage( 'mwe-recwiz-details-deduplicate' )->plain() ] ),
					'lang' => new OOUI\DropdownInputWidget( [ 'infusable' => true, 'id' => 'mwe-rwd-lang', 'inputId' => 'mwe-rwd-lang-input' ] ),
					'gen1' => new OOUI\ButtonWidget( [ 'infusable' => true, 'id' => 'mwe-rwd-generator-list', 'label' => wfMessage( 'mwe-recwiz-generator-list' )->plain(), 'icon' => 'll-list' ] ),
					'gen2' => new OOUI\ButtonWidget( [ 'infusable' => true, 'id' => 'mwe-rwd-generator-nearby', 'label' => wfMessage( 'mwe-recwiz-generator-nearby' )->plain(), 'icon' => 'll-nearby' ] ),
					'gen3' => new OOUI\ButtonWidget( [ 'infusable' => true, 'id' => 'mwe-rwd-generator-wmcategory', 'label' => wfMessage( 'mwe-recwiz-generator-wmcategory' )->plain(), 'icon' => 'll-wmcategory' ] ),
				],
				'studio' => [
					'skip' => new OOUI\ButtonWidget( [ 'infusable' => true, 'id' => 'mwe-rws-skip', 'label' => wfMessage( 'mwe-recwiz-studio-skip' )->plain(), 'icon' => 'next', 'framed' => false ] ),
					'record' => new OOUI\ButtonWidget( [ 'infusable' => true, 'id' => 'mwe-rws-record', 'invisibleLabel' => true, 'icon' => 'll-record', 'flags' => [ 'primary', 'progressive' ] ] ),
				],
				'publish' => [
					'progress' => new OOUI\ProgressBarWidget( [ 'id' => 'mwe-rwp-progress', 'progress' => 33 ] ),
					'prev' => new OOUI\ButtonWidget( [ 'infusable' => true, 'id' => 'mwe-rwp-prev', 'invisibleLabel' => true, 'icon' => 'previous', 'framed' => false ] ),
					'next' => new OOUI\ButtonWidget( [ 'infusable' => true, 'id' => 'mwe-rwp-next', 'invisibleLabel' => true, 'icon' => 'next', 'framed' => false ] ),
					'cb1' => new OOUI\CheckboxInputWidget( [ 'infusable' => true, 'id' => 'mwe-rwp-cb1', 'inputId' => 'mwe-rwp-cb1-input', 'selected' => true ] ),
					'cb2' => new OOUI\CheckboxInputWidget( [ 'infusable' => true, 'id' => 'mwe-rwp-cb2', 'inputId' => 'mwe-rwp-cb2-input', 'selected' => true ] ),
					'cb3' => new OOUI\CheckboxInputWidget( [ 'infusable' => true, 'id' => 'mwe-rwp-cb3', 'inputId' => 'mwe-rwp-cb3-input', 'selected' => true ] ),
					'cb4' => new OOUI\CheckboxInputWidget( [ 'infusable' => true, 'id' => 'mwe-rwp-cb4', 'inputId' => 'mwe-rwp-cb4-input', 'selected' => true ] ),
				]
		    ]
		);
	}
}
