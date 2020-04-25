'use strict';

( function ( mw, rw, OO ) {
	/**
	* The Navigation vue
	*/
	rw.vue.navigation = new Vue( {
		/* Data */
		data: {
			state: rw.store.state.data,
   		 	status: rw.store.record.data.status,
		},

		/* Computed */
		computed: {
			nextDisabled: function() {
				var word;

				if ( this.state.step !== 'studio' ) {
					// set enabled by default
					return false;
				} else {
					for( word in this.status ) {
						if ( this.status[ word ] !== 'up' && this.status[ word ] !== 'ready' ) {
							// We've found a record, so allow the user to continue
							return false;
						}
					}

					// no record has been made yet, so disable the next button
					return true;
				}
			},
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
