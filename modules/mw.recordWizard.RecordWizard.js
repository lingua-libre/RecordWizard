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
	rw.RecordWizard = function () {
		rw.vue.sidebar.$mount( '#mwe-rw-steps' );
		rw.vue.navigation.$mount( '#mwe-rw-navigation' );

		rw.vue.tutorial.$mount( '#mwe-rw-tutorial' );
		rw.vue.locutor.$mount( '#mwe-rw-locutor' );
		rw.vue.details.$mount( '#mwe-rw-details' );
		rw.vue.studio.$mount( '#mwe-rw-studio' );
		rw.vue.publish.$mount( '#mwe-rw-publish' );

		$( '#mwe-rw-spinner' ).hide();
		$( '#mwe-rw-content' ).show();
	};

	$( function () {
		// show page.
		rw.requestQueue = new rw.RequestQueue();
		rw.recordWizard = new rw.RecordWizard();
	} );

}( mediaWiki, mediaWiki.recordWizard, jQuery ) );
