'use strict';

( function ( mw, rw, $, OO ) {
	/**
	 * The Details step.
	 *
	 * @class rw.controller.Details
	 * @extends mw.recordWizard.controller.Step
	 * @constructor
	 * @param {mw.Api} api     API instance to perform requests
	 * @param {Object} config  RecordWizard config object
	 */
	rw.controller.Details = function ( api, config ) {
		rw.controller.Step.call(
			this,
			new rw.ui.Details(),
			api,
			config
		);

		this.stepName = 'details';
	};

	OO.inheritClass( rw.controller.Details, rw.controller.Step );

	/**
	 * @inheritDoc
	 */
	rw.controller.Details.prototype.load = function () {
		var className;
		rw.controller.Step.prototype.load.call( this );

		this.generators = {};

		if ( rw.metadatas.generator === undefined ) {
			rw.metadatas.generator = {};
		}
		for ( className in rw.generator ) {
			this.setupGenerator( className );
		}

		this.ui.on( 'wordlist-add', this.onWordListAdd.bind( this ) );
		this.ui.on( 'wordlist-change', this.onWordListChange.bind( this ) );
	};

	/**
	 * @inheritDoc
	 */
	rw.controller.Details.prototype.moveNext = function () {
		var i, randomIndex, tmp;

		this.ui.collect();

		// Randomise word list if asked to
		if ( rw.metadatas.randomise === true ) {
			// Fisher-Yates shuffle
			for ( i = rw.metadatas.words.length - 1; i >= 0; i-- ) {
				randomIndex = Math.floor( Math.random() * ( i + 1 ) );

				tmp = rw.metadatas.words[ randomIndex ];
				rw.metadatas.words[ randomIndex ] = rw.metadatas.words[ i ];
				rw.metadatas.words[ i ] = tmp;
			}
		}

		if ( rw.metadatas.words.length === 0 ) {
			OO.ui.alert( mw.msg( 'mwe-recwiz-error-emptylist' ) );
			return;
		}

		this.api.saveOptions( {
			'recwiz-lang': rw.metadatas.language
		} );
		rw.controller.Step.prototype.moveNext.call( this );
	};

	/**
	 * Instanciate and load the given generator
	 *
	 * @param  {string} className Name of the generator's class, as it can be
	 *                          accessed in the rw.generator namespace
	 */
	rw.controller.Details.prototype.setupGenerator = function ( className ) {
		var name = rw.generator[ className ].static.name;

		if ( name === '__generic__' ) {
			return;
		}

		this.generators[ name ] = new rw.generator[ className ]( {
			callback: this.addWords.bind( this )
		} );

		this.ui.addGeneratorButton( this.generators[ name ] );
	};

	/**
	 * Add words to our global word list.
	 *
	 * @param  {Array} list list of word strings and/or objects containing the
	 *                      word and extra metadata
	 */
	rw.controller.Details.prototype.addWords = function ( list ) {
		var i, word, extra;
		for ( i = 0; i < list.length; i++ ) {
			word = list[ i ];
			extra = {};
			if ( typeof list[ i ] !== 'string' ) {
				word = list[ i ].text;
				delete list[ i ].text;
				extra = list[ i ];
			}

			word = word.replace( /\t/g, '' ).trim();
			this.ui.addWord( word );
			rw.records[ word ].setExtra( extra );
		}
	};

	/**
	 * Event handler, called when a word is added to the list, regardless of
	 * the method used.
	 *
	 * @private
	 * @param  {string} word  textual transcription of the word added
	 * @param  {number} index position of the new word in the list
	 */
	rw.controller.Details.prototype.onWordListAdd = function ( word, index ) {
		word = word.replace( /\t/g, '' ).trim();
		if ( rw.records[ word ] === undefined ) {
			rw.records[ word ] = new rw.Record( word );
		}
	};

	/**
	 * Event handler called when a change happen in the word list.
	 */
	rw.controller.Details.prototype.onWordListChange = function () {
		var nbWords = this.ui.countWords();
		// TODO: find a place to display word count
		if ( nbWords === 0 ) {
			// mw.message( 'mwe-recwiz-details-noword' ).text();
		} else {
			// mw.message( 'mwe-recwiz-details-wordcount', nbWords ).text();
		}
	};

}( mediaWiki, mediaWiki.recordWizard, jQuery, OO ) );
