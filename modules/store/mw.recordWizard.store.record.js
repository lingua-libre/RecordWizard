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
				locutor: {
					gender: '',
					languages: {},
					location: '',
					name: '',
					qid: '',
					main: false,
					new: false,
				},
			},
			words: [],
			records: {},
			status: {},
			errors: {},
		};
	};

	RecordStore.prototype.setLocutor = function ( locutor ) {
		this.data.metadata.locutor.gender = locutor.gender;
		Vue.set( this.data.metadata.locutor, 'languages', locutor.languages );
		this.data.metadata.locutor.location = locutor.location;
		this.data.metadata.locutor.name = locutor.name;
		this.data.metadata.locutor.qid = locutor.qid;
		this.data.metadata.locutor.main = locutor.main || false;
		this.data.metadata.locutor.new = locutor.new || locutor.qid === null;

		// if there are already some records done, remove them when changing locutor
		this.clearAllRecords();
	};

	RecordStore.prototype.clearRecord = function ( word ) {
		var i = this.data.words.indexOf( word );

		// Check if the word is in our list
		if ( i === -1 ) {
			return false;
		}

		// Remove all mentions of this word
		Vue.delete( this.data.records, this.data.words[ i ] );
		Vue.delete( this.data.status, this.data.words[ i ] );
		Vue.delete( this.data.errors, this.data.words[ i ] );
		this.data.words.splice( i, 1 );

		return true;
	};

	RecordStore.prototype.clearAllRecords = function () {
		var i;

		for ( i = 0; i < this.data.words.length; i++ ) {
			Vue.delete( this.data.records, this.data.words[ i ] );
			Vue.delete( this.data.status, this.data.words[ i ] );
			Vue.delete( this.data.errors, this.data.words[ i ] );
		}

		this.data.words.splice( 0, this.data.words.length );
	};

	RecordStore.prototype.randomiseList = function() {
		var i, tmp, randomIndex;

		// Fisher-Yates shuffle
		for ( i = this.data.words.length - 1; i >= 0; i-- ) {
			randomIndex = Math.floor( Math.random() * ( i + 1 ) );

			tmp = this.data.words[ randomIndex ];
			Vue.set( this.data.words, randomIndex, this.data.words[ i ] );
			Vue.set( this.data.words,  i, tmp );
		}
	};

	RecordStore.prototype.addWords = function( words ) {
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

			// Avoid duplicate words in the list
			if ( this.data.words.indexOf( word ) === -1 ) {
				// Create a Record instance for this word
				if ( this.data.records[ word ] === undefined ) {
					this.data.records[ word ] = new rw.Record( word );
					this.data.records[ word ].setLanguage( rw.store.config.data.languages[ this.data.metadata.language ] );
					this.data.records[ word ].setLocutor( this.data.metadata.locutor );
					this.data.records[ word ].setLicense( this.data.metadata.license );

					Vue.set( this.data.status, word, 'up' );
					Vue.set( this.data.errors, word, false );
				}
				this.data.records[ word ].setExtra( extra );

				// Add the word to the list
				this.data.words.push( word );
			}
		}
	};


	rw.store.record = new RecordStore();

}( mediaWiki, mediaWiki.recordWizard ) );
