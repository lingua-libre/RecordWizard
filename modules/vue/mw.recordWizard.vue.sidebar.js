'use strict';

( function ( mw, rw ) {
	/**
	 * The Sidebar vue
	 */
	rw.vue.sidebar = new Vue( {
		/* Data */
		data: {
			state: rw.store.state.data
		}
	} );

}( mediaWiki, mediaWiki.recordWizard ) );
