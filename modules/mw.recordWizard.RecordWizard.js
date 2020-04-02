'use strict';

/**
 * Object that represents the entire multi-step Record Wizard
 */
( function ( mw, rw, $ ) {

	/**
	 * Represent the entire RecordWizard multi-step process.
	 *
	 * @class rw.RecordWizard
	 * @constructor
	 * @param  {Object} config Configuration options
	 */
	rw.RecordWizard = function ( config ) {

		// Shortcut for local references
		rw.config = config;
		this.steps = {};
		this.api = new mw.Api();

		this.createInterface();
	};

	/**
	 * Load the first step.
	 */
	rw.RecordWizard.prototype.createInterface = function () {
		this.initialiseSteps();
		$( '#mwe-rw-spinner' ).hide();
	};

	/**
	 * Initialise each steps of the process.
	 */
	rw.RecordWizard.prototype.initialiseSteps = function () {
		rw.vue.tutorial.$mount( '#mwe-rw-tutorial' );
		rw.vue.locutor.$mount( '#mwe-rw-locutor' );
		rw.vue.details.$mount( '#mwe-rw-details' );
		rw.vue.studio.$mount( '#mwe-rw-studio' );
		rw.vue.publish.$mount( '#mwe-rw-publish' );
	};

	$( function () {
		// show page.
		rw.requestQueue = new rw.RequestQueue();
		rw.recordWizard = new rw.RecordWizard( mw.config.get( 'RecordWizardConfig' ) );
	} );

}( mediaWiki, mediaWiki.recordWizard, jQuery ) );
