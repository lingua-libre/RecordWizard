'use strict';

( function ( mw, rw ) {
	rw.store.config = Object.freeze( mw.config.get( 'RecordWizardConfig' ) );

}( mediaWiki, mediaWiki.recordWizard ) );
