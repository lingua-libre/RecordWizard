'use strict';

( function ( mw, rw ) {
	/**
	* The Navigation vue
	*/
	rw.vue.navigation = new Vue( {
		/* Data */
		data: {
			state: rw.store.state.data,
		},

		/* Methods */
		methods: {
			cancel: function() {
				/* TODO */
			},
			prev: function() {
				/* TODO */
				rw.store.state.movePrev();
			},
			next: function() {
				/* TODO */
				rw.store.state.moveNext();
			},
		}
	} );

}( mediaWiki, mediaWiki.recordWizard ) );
