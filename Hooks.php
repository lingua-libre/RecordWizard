<?php
/**
 * RecordWizard extension hooks
 *
 * @file
 * @ingroup Extensions
 * @license GPL-2.0+
 */
class RecordWizardHooks {
	/**
	 * Conditionally register the unit testing module for the ext.recordWizard module
	 * only if that module is loaded
	 *
	 * @param array $testModules The array of registered test modules
	 * @param ResourceLoader $resourceLoader The reference to the resource loader
	 * @return true
	 */
	public static function onResourceLoaderTestModules( array &$testModules, ResourceLoader &$resourceLoader ) {
		$testModules['qunit']['ext.recordWizard.tests'] = [
			'scripts' => [
				'tests/RecordWizard.test.js'
			],
			'dependencies' => [
				'ext.recordWizard'
			],
			'localBasePath' => __DIR__,
			'remoteExtPath' => 'RecordWizard',
		];
		return true;
	}

	public static function onGetPreferences( $user, &$preferences ) {
		$preferences['recwiz-lang'] = array(
			'type' => 'api',
			'section' => 'recwiz/param',
		);

		return true;
	}

	public static function onUploadStashFile( $uploadBase, $user, $props, &$error ) {
		global $wgFFmpegLocation;
		$tempPath = $uploadBase->getTempPath();

		// MediaRecorder produce WebM files with a lot of missing metadatas (see T312554)
		// FFmpeg is used here to fix thoses files during upload, before they reach the stash
		if(isset($props["mime"]) && $props["mime"] == "video/webm") {
			$metadata = unserialize($props["metadata"]);
			if(isset($metadata["error"])) { // if the getID3 library detected an error
				shell_exec("{$wgFFmpegLocation} -i {$tempPath} -c copy {$tempPath}-ffmpeg.webm");
				rename("{$tempPath}-ffmpeg.webm", "{$tempPath}");
				wfDebugLog( 'recordwizard', "Webm file '{$uploadBase->getTitle()}' from user '{$user->getName()}' fixed during stashing using ffmpeg." );
			}
		}
	}

}
