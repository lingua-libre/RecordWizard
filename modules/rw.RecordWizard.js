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

		// Prevent the window from being closed as long as we have data
		mw.confirmCloseWindow( {
			message: mw.message( 'mwe-recwiz-prevent-close' ).text(),
			test: rw.store.record.hasData.bind( rw.store.record )
		} );
	} );

}( mediaWiki, mediaWiki.recordWizard, jQuery ) );
