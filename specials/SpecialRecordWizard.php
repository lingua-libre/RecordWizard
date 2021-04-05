<?php

class I18nTemplateParser extends TemplateParser {

	/**
	 * Compile the Mustache template into PHP code using LightnCandy.
	 *
	 * This is a derivate from the original compile method of TemplateParser
	 *
	 * The compilation step generates both PHP code and metadata, which is also returned in the
	 * result. An example result looks as follows:
	 *
	 *  ```php
	 *  [
	 *    'phpCode' => '...',
	 *    'files' => [
	 *      '/path/to/template.mustache',
	 *      '/path/to/partial1.mustache',
	 *      '/path/to/partial2.mustache',
	 *    'filesHash' => '...'
	 *  ]
	 *  ```
	 *
	 * The `files` entry is a list of the files read during the compilation of the template. Each
	 * entry is the fully-qualified filename, i.e. it includes path information.
	 *
	 * The `filesHash` entry can be used to determine whether the template has changed since it was
	 * last compiled without compiling the template again. Currently, the `filesHash` entry is
	 * generated with FileContentsHasher::getFileContentsHash.
	 *
	 * @param string $templateName The name of the template
	 * @return array An associative array containing the PHP code and metadata about its compilation
	 * @throws Exception Thrown by LightnCandy if it could not compile the Mustache code
	 * @throws RuntimeException If LightnCandy could not compile the Mustache code but did not throw
	 *  an exception. This exception is indicative of a bug in LightnCandy
	 * @suppress PhanTypeMismatchArgument
	 */
	protected function compile( $templateName ) {
		$filename = $this->getTemplateFilename( $templateName );

		if ( !file_exists( $filename ) ) {
			throw new RuntimeException( "Could not find template `{$templateName}` at {$filename}" );
		}

		$files = [ $filename ];
		$contents = file_get_contents( $filename );
		$compiled = LightnCandy\LightnCandy::compile(
			$contents,
			[
				'flags' => $this->compileFlags,
				'basedir' => $this->templateDir,
				'fileext' => '.mustache',
				'helpers' => array(
					'_' => function( $msg ) {
						return wfMessage( $msg )->plain();
					},
					'__' => function( $msg ) {
						return wfMessage( $msg )->parse();
					},
				),
				'partialresolver' => function ( $cx, $partialName ) use ( $templateName, &$files ) {
					$filename = "{$this->templateDir}/{$partialName}.mustache";
					if ( !file_exists( $filename ) ) {
						throw new RuntimeException( sprintf(
							'Could not compile template `%s`: Could not find partial `%s` at %s',
							$templateName,
							$partialName,
							$filename
						) );
					}

					$fileContents = file_get_contents( $filename );

					if ( $fileContents === false ) {
						throw new RuntimeException( sprintf(
							'Could not compile template `%s`: Could not find partial `%s` at %s',
							$templateName,
							$partialName,
							$filename
						) );
					}

					$files[] = $filename;

					return $fileContents;
				}
			]
		);
		if ( !$compiled ) {
			// This shouldn't happen because LightnCandy::FLAG_ERROR_EXCEPTION is set
			// Errors should throw exceptions instead of returning false
			// Check anyway for paranoia
			throw new RuntimeException( "Could not compile template `{$filename}`" );
		}

		return [
			'phpCode' => $compiled,
			'files' => $files,
			'filesHash' => FileContentsHasher::getFileContentsHash( $files ),
		];
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
		$speakerId = null;
		$otherSpeakerIds = [];
		$userConfigWikiPage = WikiPage::factory( Title::makeTitleSafe( NS_USER, $user->getName() . '/RecordWizard.json' ) );
		if ( $userConfigWikiPage->exists() ) {
			$revision = $userConfigWikiPage->getRevision();
			$content = $revision->getContent( Revision::RAW );
			$text = JsonContentHandler::getContentText( $content );
			$userConfig = json_decode($text, true);
			if ( $userConfig != null ) {
				if ( array_key_exists( 'speaker', $userConfig ) ) {
					$speakerId = $userConfig[ 'speaker' ];
				} elseif ( array_key_exists( 'locutor', $userConfig ) ) {
					// Support old syntax for backward compatibility
					$speakerId = $userConfig[ 'locutor' ];
				}

				if ( array_key_exists( 'otherSpeakers', $userConfig ) ) {
					$otherSpeakerIds = $userConfig[ 'otherSpeakers' ];
				} elseif ( array_key_exists( 'otherLocutors', $userConfig ) ) {
					// Support old syntax for backward compatibility
					$otherSpeakerIds = $userConfig[ 'otherLocutors' ];
				}

				if ( array_key_exists( 'license', $userConfig ) ) {
					$config[ 'savedLicense' ] = $userConfig[ 'license' ];
				}
			}
		}

		$config[ 'speaker' ] = $this->getSpeaker( $speakerId, $entityIdLookup, $entityRevisionLookup );
		$config[ 'speaker' ][ 'main' ] = true;
		if ( $config[ 'speaker' ][ 'name' ] == null ) {
			$config[ 'speaker' ][ 'name' ] = $user->getName();
		}
		$config[ 'otherSpeakers' ] = [];
		foreach( $otherSpeakerIds as $qid ) {
			$config[ 'otherSpeakers' ][ $qid ] = $this->getSpeaker( $qid, $entityIdLookup, $entityRevisionLookup );
		}

		$licensesMessage = $this->msg( 'licenses' );
		$fallbackLanguages = $licensesMessage->getLanguage()->getFallbackLanguages();
		$i = 0;
		while( $licensesMessage->plain() == '-' && $i < count( $fallbackLanguages ) ) {
			$fallbackLanguage = $fallbackLanguages[$i++];
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

	private function getSpeaker( $speakerId, $entityIdLookup, $entityRevisionLookup ) {
		global $wgRecordWizardConfig, $wgWBRepoSettings;
		$speaker = array(
			'name' => null,
			'gender' => null,
			'location' => null,
			'languages' => null,
			'qid' => null,
		);

		if ( $speakerId != null ) {
			$itemId = $entityIdLookup->getEntityIdForTitle( \Title::makeTitle( $wgWBRepoSettings['entityNamespaces']['item'], $speakerId ) );
			$revision = $entityRevisionLookup->getEntityRevision( $itemId );
			if ( $revision !== null ) {
				$item = $revision->getEntity();

				$instanceOfPropertyId = $entityIdLookup->getEntityIdForTitle( \Title::makeTitle( $wgWBRepoSettings['entityNamespaces']['property'], $wgRecordWizardConfig['properties']['instanceOf'] ) );
				$instanceOf = $this->getPropertyValues( $item, $instanceOfPropertyId );
				if ( count( $instanceOf ) > 0 && $instanceOf[ 0 ][ 'value' ] == $wgRecordWizardConfig['items']['speaker'] ) {
					$labels = $item->getLabels()->getIterator();
					if ( $labels->valid() ) {
						$speaker['name'] = $labels->current()->getText();
					}

					$genderPropertyId = $entityIdLookup->getEntityIdForTitle( \Title::makeTitle( $wgWBRepoSettings['entityNamespaces']['property'], $wgRecordWizardConfig['properties']['gender'] ) );
					$gender = $this->getPropertyValues( $item, $genderPropertyId );
					if ( count( $gender ) > 0 ) {
						$speaker['gender'] = $gender[ 0 ][ 'value' ];
					}

					$locationPropertyId = $entityIdLookup->getEntityIdForTitle( \Title::makeTitle( $wgWBRepoSettings['entityNamespaces']['property'], $wgRecordWizardConfig['properties']['residencePlace'] ) );
					$location = $this->getPropertyValues( $item, $locationPropertyId );
					if ( count( $location ) > 0 ) {
						$speaker['location'] = $location[ 0 ][ 'value' ];
					}

					$spokenLanguagesPropertyId = $entityIdLookup->getEntityIdForTitle( \Title::makeTitle( $wgWBRepoSettings['entityNamespaces']['property'], $wgRecordWizardConfig['properties']['spokenLanguages'] ) );
					$languages = $this->getPropertyValues( $item, $spokenLanguagesPropertyId );
					$speaker['languages'] = array();
					foreach ( $languages as $language ) {
						$langId = $language[ 'value' ];
						$speaker['languages'][ $langId ] = array(
							'qid' => $langId
						);
						$languageLevelProperty = $wgRecordWizardConfig[ 'properties' ][ 'languageLevel' ];
						if ( isset( $language[ 'qualifiers' ][ $languageLevelProperty ] ) ) {
							$speaker[ 'languages' ][ $langId ][ 'languageLevel' ] = $language[ 'qualifiers' ][ $languageLevelProperty ];
						}
						$languageLocationProperty = $wgRecordWizardConfig[ 'properties' ][ 'learningPlace' ];
						if ( isset( $language[ 'qualifiers' ][ $languageLocationProperty ] ) ) {
							$speaker[ 'languages' ][ $langId ][ 'location' ] = $language[ 'qualifiers' ][ $languageLocationProperty ];
						}
					}

					$speaker['qid'] = (string) $itemId;
				}
			}
		}

		return $speaker;
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
		    [ 'wgExtensionAssetsPath' => $wgExtensionAssetsPath, ]
		);
	}
}
