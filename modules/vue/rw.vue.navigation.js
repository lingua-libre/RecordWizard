'use strict';

( function ( mw, rw, OO ) {
	/**
	 * The Navigation vue
	 */
	rw.vue.navigation = new Vue( {
		/* Data */
		data: {
			state: rw.store.state.data,
			words: rw.store.record.data.words,
			status: rw.store.record.data.status,
			errors: rw.store.record.data.errors,
			statusCount: rw.store.record.data.statusCount
		},

		/* Computed */
		computed: {
			prevDisabled: function () {
				if ( this.state.isFrozen === true ) {
					return true;
				}
			},
			nextDisabled: function () {
				if ( this.state.isFrozen === true ) {
					return true;
				}

				if ( this.state.step === 'details' ) {
					return this.words.length === 0;
				} else if ( this.state.step === 'studio' ) {
					return this.statusCount.stashed === 0;
				}

				// By default, enable the button
				return false;
			},
			showRetry: function () {
				if ( this.state.step === 'studio' || this.state.step === 'publish' ) {
					return this.statusCount.error > 0;
				}

				return false;
			},
			fileListUrl: function () {
				return 'https://commons.wikimedia.org/wiki/Special:ListFiles/' + mw.config.get( 'wgUserName' );
			}
		},

		/* Methods */
		methods: {
			cancel: function () {
				OO.ui.confirm( mw.msg( 'mwe-recwiz-prevent-close' ) ).done( function ( confirmed ) {
					if ( confirmed ) {
						window.location.reload(); // or should we go back to the main page?
					}
				} );
			},
			prev: function () {
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
			next: function () {
				var process = rw.vue[ this.state.step ].canMoveNext();

				/* If the function returns a boolean */
				if ( process === undefined || process === null || process === false ) {
					return;
				} else if ( process === true ) {
					return rw.store.state.moveNext();
				}

				/* If it returns a $.Deferred */
				rw.store.state.freeze();
				process.then( rw.store.state.moveNext.bind( rw.store.state ) );
				process.then(
					rw.store.state.unfreeze.bind( rw.store.state ),
					rw.store.state.unfreeze.bind( rw.store.state )
				);
			},
			retry: function () {
				var word;

				for ( word in this.errors ) {
					if ( this.errors[ word ] !== false ) {
						switch ( rw.store.record.data.status[ word ] ) {
							case 'ready':
								rw.store.record.doStash( word );
								break;
							case 'stashed':
								rw.store.record.doPublish( word );
								break;
							case 'uploaded':
								rw.store.record.doFinalize( word );
								break;
						}
					}
				}
			},
			hasPendingRequests: function () {
				return rw.store.record.countStatus( [ 'stashing', 'uploading', 'finalizing' ] ) > 0;
			},
			openFileList: function () {
				window.open( this.fileListUrl, '_blank' );
			}
		}
	} );

}( mediaWiki, mediaWiki.recordWizard, OO ) );
