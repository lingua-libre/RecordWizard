'use strict';

( function ( mw, $, rw, OO ) {

	/**
	 * Represents the UI for the wizard's Details step.
	 *
	 * @class rw.ui.Details
	 * @extends rw.ui.Step
	 * @constructor
	 */
	rw.ui.Details = function () {
		rw.ui.Step.call(
			this,
			'details'
		);

		this.addPreviousButton();
		this.addNextButton();
	};

	OO.inheritClass( rw.ui.Details, rw.ui.Step );

	/**
	 * @inheritDoc
	 */
	rw.ui.Details.prototype.load = function () {
		var qid, i,
			ui = this,
			options = [];

		rw.ui.Step.prototype.load.call( this );

		// Language selector
		for ( qid in rw.metadatas.locutor.languages ) {
			options.push( { label: rw.config.languages[ qid ].localname, data: qid } );
		}
		this.languageSelector = new OO.ui.DropdownInputWidget( { options: options } );

		// Word list
		this.wordList = new rw.layout.WordSelectorWidget( {
			placeholder: mw.message( 'mwe-recwiz-details-addwords' ).text(),
			allowArbitrary: true,
			inputPosition: 'outline'
		} );

		// Generators
		this.windowManager = new OO.ui.WindowManager();
		$( 'body' ).append( this.windowManager.$element );
		this.generatorButtons = new OO.ui.ButtonGroupWidget();

		// Clear button
		this.clearButton = new OO.ui.ButtonWidget( {
			label: mw.msg( 'mwe-recwiz-details-clear' ),
			icon: 'subtract',
			flags: [ 'destructive' ],
			framed: false,
			classes: [ 'mwe-recwiz-right' ]
		} );

		// deduplicate button
		this.deduplicateButton = new OO.ui.ButtonWidget( {
			label: mw.msg( 'mwe-recwiz-details-deduplicate' ),
			icon: 'checkAll',
			flags: [ 'constructive' ],
			framed: false,
			classes: [ 'mwe-recwiz-right' ]
		} );

		// Randomisation
		this.randomSwitch = new OO.ui.ToggleSwitchWidget( { value: rw.metadatas.randomise } );

		// Layout
		this.layout = new OO.ui.Widget( {
			content: [
				new OO.ui.FieldLayout( this.languageSelector, {
					align: 'left',
					label: mw.message( 'mwe-recwiz-details-lang' ).text()
				} ),
				new OO.ui.FieldLayout( this.randomSwitch, {
					align: 'left',
					label: mw.message( 'mwe-recwiz-details-randomise' ).text()
				} ),
				new OO.ui.FieldLayout( this.wordList, {
					align: 'top',
					label: mw.message( 'mwe-recwiz-details-wordlist' ).text()
				} ),
				this.clearButton,
				this.deduplicateButton,
				new OO.ui.FieldLayout( this.generatorButtons, {
					align: 'left',
					label: mw.message( 'mwe-recwiz-details-generators' ).text(),
					classes: [ 'mwe-recwiz-clear' ]
				} )
			],
			classes: [ 'mwe-recwiz-increment' ]
		} );

		// Populate
		if ( rw.metadatas.words !== undefined ) {
			for ( i = 0; i < rw.metadatas.words.length; i++ ) {
				this.addWord( rw.metadatas.words[ i ] );
			}
		}
		this.languageSelector.setValue( rw.metadatas.language || rw.config.savedLanguage );

		// Manage events
		this.languageSelector.on( 'change', this.emit.bind( this, 'language-change' ) );
		this.wordList.on( 'change', function () {
			ui.emit( 'wordlist-change' );
		} );
		this.wordList.on( 'add', function ( item, index ) {
			ui.emit( 'wordlist-add', item.getData(), index );
		} );
		this.clearButton.on( 'click', this.clearWords.bind( this ) );
		this.deduplicateButton.on( 'click', this.emit.bind( this, 'deduplicate' ) );

		this.$container.prepend( this.layout.$element );
	};

	/**
	 * Add a button to open the given generator
	 *
	 * @param  {rw.generator.Generator} generator Generator to add to the UI
	 */
	rw.ui.Details.prototype.addGeneratorButton = function ( generator ) {
		var ui = this,
			button = new OO.ui.ButtonWidget( { label: generator.label, icon: 'add' } );

		button.on( 'click', function () {
			ui.collect();
			ui.windowManager.openWindow( generator );
		} );

		this.windowManager.addWindows( [ generator ] );

		this.generatorButtons.addItems( [ button ] );
	};

	/**
	 * Add a word to the list
	 *
	 * @param  {string} word textual transcription, must match an existing
	 *                       listed record object
	 * @return {type}        Whether the item was added successfully
	 */
	rw.ui.Details.prototype.addWord = function ( word ) {
		return this.wordList.addTag( word );
	};

	rw.ui.Details.prototype.countWords = function () {
		return this.wordList.getItemCount();
	};

	rw.ui.Details.prototype.clearWords = function () {
		this.wordList.clearItems();
	};

	rw.ui.Details.prototype.removeWord = function ( word ) {
		console.log( 'removeWord', word );
		this.wordList.removeTagByData( word );
	};

	rw.ui.Details.prototype.collect = function () {
		rw.metadatas.language = this.languageSelector.getValue();
		rw.metadatas.words = this.wordList.getValue();
		rw.metadatas.randomise = this.randomSwitch.getValue();
	};

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );
