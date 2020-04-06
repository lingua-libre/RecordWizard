'use strict';

( function ( mw, rw, OO ) {
	/**
	* Common data and methods for all steps
	*/
	rw.vue.step = {
		data: {
			config: rw.store.config,
			state: rw.store.state.data,
		},
		created: function() {
			this.$api = new mw.Api();
		},
		methods: {
			canMovePrev: function() {
				return true;
			},
			canMoveNext: function() {
				return true;
			},
		}
	};

}( mediaWiki, mediaWiki.recordWizard, OO ) );
