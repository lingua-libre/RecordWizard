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
   		 	errors: rw.store.record.data.errors,
		},

		/* Computed */
		computed: {
			prevDisabled: function() {
				if ( this.state.isFrozen === true ) {
					return true;
				}
			},
			nextDisabled: function() {
				var word;

				if ( this.state.isFrozen === true ) {
					return true;
				}

				if ( this.state.step !== 'studio' ) {
					// set enabled by default
					return false;
				} else {
					for( word in this.status ) {
						if ( this.status[ word ] === 'stashed' ) {
							// We've found a record, so allow the user to continue
							return false;
						}
					}

					// no record has been made yet, so disable the next button
					return true;
				}
			},
			showRetry: function() {
				var word;

				if ( this.state.step === 'studio' ) {
					for( word in this.errors ) {
						if ( this.errors[ word ] !== false ) {
							// We've found a record in error, so allow to retry
							return true;
						}
					}
				}

				return false;
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

				/* If it returns a $.Deferred */
				rw.store.state.freeze();
				process.then( rw.store.state.moveNext.bind( rw.store.state ) );
				process.then(
					rw.store.state.unfreeze.bind( rw.store.state ),
					rw.store.state.unfreeze.bind( rw.store.state )
				);
			},
			retry: function() {
				var word;

				if ( this.state.step === 'studio' ) {
					for( word in this.errors ) {
						if ( this.errors[ word ] !== false ) {
							// Retry to stash the record
							rw.store.record.doStash( word );
						}
					}
				}
			},
		}
	} );

}( mediaWiki, mediaWiki.recordWizard, OO ) );
