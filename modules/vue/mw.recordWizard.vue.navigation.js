'use strict';

( function ( mw, rw, OO ) {
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
				var process = rw.vue[ this.state.step ].canMovePrev();

				/* If the function returns a boolean */
				if ( process === true ) {
					return rw.store.state.movePrev();
				} else if ( process === false ) {
					return;
				}

				/* If it returns a $.Deferred */
				rw.store.state.freeze();
				process.then( rw.store.state.movePrev.bind( rw.store.state ) );
				process.then(
					rw.store.state.unfreeze.bind( rw.store.state ),
					rw.store.state.unfreeze.bind( rw.store.state )
				);
			},
			next: function() {
				var process = rw.vue[ this.state.step ].canMoveNext();

				/* If the function returns a boolean */
				if ( process === true ) {
					return rw.store.state.moveNext();
				} else if ( process === false ) {
					return;
				}

				/* If it returns an OO.ui.Process object */
				rw.store.state.freeze();
				process.then( rw.store.state.moveNext.bind( rw.store.state ) );
				process.then(
					function() {
						console.log( 'succèss' );
						rw.store.state.unfreeze.bind( rw.store.state )
					}.bind( this ),
					function() {
						console.log( 'error' );
						rw.store.state.unfreeze.bind( rw.store.state )
					}.bind( this )
				);
			},
		}
	} );

}( mediaWiki, mediaWiki.recordWizard, OO ) );
