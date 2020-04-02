'use strict';

( function ( mw, rw ) {
	/**
	* Common data and methods for all steps
	*/
	rw.vue.step = {
		data: {
			config: rw.store.config,
			state: rw.store.state.data,
		}
	};

}( mediaWiki, mediaWiki.recordWizard ) );
