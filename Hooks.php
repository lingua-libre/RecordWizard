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

}
