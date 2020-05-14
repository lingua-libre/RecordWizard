'use strict';

/**
 * Object that represents the entire multi-step Record Wizard
 */
( function ( mw, rw, $ ) {

	$( function () {
		// create the main needed classes
		rw.requestQueue = new rw.RequestQueue();

		// setup all the vue components
		rw.vue.sidebar.$mount( '#mwe-rw-steps' );
		rw.vue.navigation.$mount( '#mwe-rw-navigation' );

		rw.vue.tutorial.$mount( '#mwe-rw-tutorial' );
		rw.vue.speaker.$mount( '#mwe-rw-speaker' );
		rw.vue.details.$mount( '#mwe-rw-details' );
		rw.vue.studio.$mount( '#mwe-rw-studio' );
		rw.vue.publish.$mount( '#mwe-rw-publish' );

		// Once everything is loaded, hide the spinner and show the main content
		$( '#mwe-rw-spinner' ).hide();
		$( '#mwe-rw-content' ).show();
	} );

}( mediaWiki, mediaWiki.recordWizard, jQuery ) );
