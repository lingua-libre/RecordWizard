'use strict';

( function ( mw, rw ) {
	/**
	 * @class StateStore
	 * @constructor
	 */
	var RecordStore = function () {
		this.data = {
			metadata: {
				language: rw.store.config.data.savedLanguage,
				license: rw.store.config.data.savedLicense,
				media: 'audio',
				speaker: {
					gender: '',
					languages: {},
					location: '',
					name: '',
					qid: '',
					main: false,
					new: false
				}
			},
			words: [],
			records: {},
			status: {},
			errors: {},
			checkboxes: {},
			statusCount: {
				up: 0,
				ready: 0,
				stashing: 0,
				stashed: 0,
				uploading: 0,
				uploaded: 0,
				finalizing: 0,
				done: 0,
				error: 0
			}
		};
		this.$api = new mw.Api();
	};

	RecordStore.prototype.setSpeaker = function ( speaker ) {
		this.data.metadata.speaker.gender = speaker.gender;
		Vue.set( this.data.metadata.speaker, 'languages', speaker.languages );
		this.data.metadata.speaker.location = speaker.location;
		this.data.metadata.speaker.name = speaker.name;
		this.data.metadata.speaker.qid = speaker.qid;
		this.data.metadata.speaker.main = speaker.main || false;
		this.data.metadata.speaker.new = speaker.new || speaker.qid === null;

		// if there are already some records done, remove them when changing speaker
		this.clearAllRecords();
	};

	RecordStore.prototype.setStatus = function ( word, status ) {
		// Set the status and update the counter accordingly
		if ( this.data.status[ word ] === undefined ) {
			Vue.set( this.data.status, word, status );
		} else {
			this.data.statusCount[ this.data.status[ word ] ]--;
			this.data.status[ word ] = status;
		}
		this.data.statusCount[ status ]++;
	};

	RecordStore.prototype.setError = function ( word, error ) {
		// Set the error and update the counter accordingly
		if ( this.data.errors[ word ] === undefined ) {
			Vue.set( this.data.errors, word, error );
		} else {
			if ( this.data.errors[ word ] !== false ) {
				this.data.statusCount.error--;
			}
			this.data.errors[ word ] = error;
		}

		if ( error !== false ) {
			this.data.statusCount.error++;
		}
	};

	RecordStore.prototype.countStatus = function ( status ) {
		var i,
			counter = 0;

		// Usefull? What about a direct read?
		if ( Array.isArray( status ) === false ) {
			return this.data.statusCount[ status ];
		}

		for ( i = 0; i < status.length; i++ ) {
			counter += this.data.statusCount[ status[ i ] ];
		}

		return counter;
	};

	RecordStore.prototype.clearRecord = function ( word ) {
		var i = this.data.words.indexOf( word );

		// Check if the word is in our list
		if ( i === -1 ) {
			return false;
		}

		// Update global counters
		this.data.statusCount[ this.data.status[ word ] ]--;
		if ( this.data.errors[ word ] !== false ) {
			this.data.statusCount.error--;
		}

		// Remove all mentions of this word
		Vue.delete( this.data.records, this.data.words[ i ] );
		Vue.delete( this.data.status, this.data.words[ i ] );
		Vue.delete( this.data.errors, this.data.words[ i ] );
		Vue.delete( this.data.checkboxes, this.data.words[ i ] );
		this.data.words.splice( i, 1 );

		return true;
	};

	RecordStore.prototype.clearAllRecords = function () {
		var i;

		// Empty global data arrays
		for ( i = 0; i < this.data.words.length; i++ ) {
			Vue.delete( this.data.records, this.data.words[ i ] );
			Vue.delete( this.data.status, this.data.words[ i ] );
			Vue.delete( this.data.errors, this.data.words[ i ] );
			Vue.delete( this.data.checkboxes, this.data.words[ i ] );
		}

		// Reset global counters
		for ( i in this.data.statusCount ) {
			this.data.statusCount[ i ] = 0;
		}

		// Empty the main word list
		this.data.words.splice( 0, this.data.words.length );
	};

	RecordStore.prototype.clearAllPublishedRecords = function () {
		var i,
			oldRecords = [];

		for ( i = 0; i < this.data.words.length; i++ ) {
			if ( this.data.status[ this.data.words[ i ] ] === 'done' ) {
				oldRecords.push( this.data.words[ i ] );
				this.clearRecord( this.data.words[ i ] );
				i--; // to avoid missing a word, as an item has been removed from the array
			} else {
				this.resetRecord( this.data.words[ i ] );
			}
		}

		return oldRecords;
	};

	RecordStore.prototype.resetRecord = function ( word ) {
		this.data.records[ word ].reset();
		this.setStatus( word, 'up' );
		this.setError( word, false );
		this.data.checkboxes[ word ] = true;
	};

	RecordStore.prototype.resetFaultyRecords = function () {
		var i;

		for ( i = 0; i < this.data.words.length; i++ ) {
			// Check if the word is not stashed yet
			if ( this.data.errors[ this.data.words[ i ] ] !== false ) {
				this.resetRecord( this.data.words[ i ] );
			}
		}
	};

	RecordStore.prototype.resetStashingRecords = function () {
		var i;

		for ( i = 0; i < this.data.words.length; i++ ) {
			// Check if the word is not stashed yet
			if ( this.data.status[ this.data.words[ i ] ] === 'stashing' ) {
				this.resetRecord( this.data.words[ i ] );
			}
		}
	};

	RecordStore.prototype.addWords = function ( words ) {
		var i, word, extra;

		// Allow to add a single word
		if ( Array.isArray( words ) === false ) {
			words = [ words ];
		}

		for ( i = 0; i < words.length; i++ ) {
			word = words[ i ];
			extra = {};

			// Separate extra informations about the word, if any
			if ( typeof word !== 'string' ) {
				extra = word;
				word = extra.text;
				delete extra.text;
			}

			// Trim the word
			word = word.replace( /\t/g, '' ).trim();

			// Check if the string is valid
			if ( word === '' ) {
				continue;
			}

			// Avoid duplicate words in the list
			if ( this.data.words.indexOf( word ) === -1 ) {
				// Create a Record instance for this word
				if ( this.data.records[ word ] === undefined ) {
					this.data.records[ word ] = new rw.Record( word );
					this.data.records[ word ].setLanguage( rw.store.config.data.languages[ this.data.metadata.language ] );
					this.data.records[ word ].setSpeaker( this.data.metadata.speaker );
					this.data.records[ word ].setLicense( this.data.metadata.license );

					this.setStatus( word, 'up' );
					this.setError( word, false );
					Vue.set( this.data.checkboxes, word, true );
				}
				this.data.records[ word ].setExtra( extra );

				// Add the word to the list
				this.data.words.push( word );
			}
		}
	};

	RecordStore.prototype.randomiseList = function () {
		var i, tmp, randomIndex;

		// Fisher-Yates shuffle
		for ( i = this.data.words.length - 1; i >= 0; i-- ) {
			randomIndex = Math.floor( Math.random() * ( i + 1 ) );

			tmp = this.data.words[ randomIndex ];
			Vue.set( this.data.words, randomIndex, this.data.words[ i ] );
			Vue.set( this.data.words, i, tmp );
		}
	};

	RecordStore.prototype.doStash = function ( word, blob ) {
		this.setStatus( word, 'ready' );
		this.setError( word, false );

		if ( blob !== undefined ) {
			this.data.records[ word ].setBlob(
				blob,
				( this.data.metadata.media === 'audio' ? 'wav' : 'webm' )
			);
		}

		this.setStatus( word, 'stashing' );
		rw.requestQueue.push( this.data.records[ word ].uploadToStash.bind( this.data.records[ word ], this.$api ) ).then(
			this.stashSuccess.bind( this, word ),
			this.requestError.bind( this, word, 'ready' )
		);
	};

	RecordStore.prototype.doPublish = function ( word ) {
		this.setStatus( word, 'uploading' );
		this.setError( word, false );

		rw.requestQueue.push( this.data.records[ word ].finishUpload.bind( this.data.records[ word ], this.$api ) ).then(
			this.doFinalize.bind( this, word ),
			this.requestError.bind( this, word, 'stashed' )
		);
	};

	RecordStore.prototype.doFinalize = function ( word ) {
		this.setStatus( word, 'finalizing' );
		this.setError( word, false );

		rw.requestQueue.force( this.data.records[ word ].saveWbItem.bind( this.data.records[ word ], this.$api ) ).then(
			this.publishSuccess.bind( this, word ),
			this.requestError.bind( this, word, 'uploaded' )
		);
	};

	RecordStore.prototype.stashSuccess = function ( word ) {
		this.setStatus( word, 'stashed' );
		this.data.checkboxes[ word ] = true;
	};

	RecordStore.prototype.publishSuccess = function ( word ) {
		this.setStatus( word, 'done' );
		this.data.checkboxes[ word ] = true;
	};

	RecordStore.prototype.requestError = function ( word, prevState, error, errorData ) {
		var errorText = error;

		if ( errorData !== undefined ) {
			// If the upload has been abort, it means another piece of code
			// is doing stuff right now, so don't mess-up with it
			if ( errorData.textStatus === 'abort' ) {
				return;
			}
			if ( errorData.error !== undefined && errorData.error.info !== undefined ) {
				errorText = errorData.error.info;
			}
		}

		this.setStatus( word, prevState );
		this.setError( word, errorText );
	};

	rw.store.record = new RecordStore();

}( mediaWiki, mediaWiki.recordWizard ) );
