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
			records: {}
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

			// Extract extra informations about the word, if any
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
				}
				this.data.records[ word ].setExtra( extra );

				// Add the word to the list
				this.data.words.push( word );
			}
		}
	};


	rw.store.record = new RecordStore();

}( mediaWiki, mediaWiki.recordWizard ) );
