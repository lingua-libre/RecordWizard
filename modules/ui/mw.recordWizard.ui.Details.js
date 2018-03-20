( function ( mw, $, rw, OO ) {

	/**
	 * Represents the UI for the wizard's Details step.
	 *
	 * @class rw.ui.Details
	 * @extends rw.ui.Step
	 * @constructor
	 */
	rw.ui.Details = function() {
		var ui = this;

		rw.ui.Step.call(
			this,
			'details'
		);

		this.addPreviousButton();
		this.addNextButton();
	};

	OO.inheritClass( rw.ui.Details, rw.ui.Step );

	rw.ui.Details.prototype.load = function () {
	    var ui = this;

		rw.ui.Step.prototype.load.call( this );

		// Language selector
        this.languageSelector = new OO.ui.DropdownInputWidget( {
	        options: [
				{ data: 'a', label: 'First' },
				{ data: 'b', label: 'Second'},
				{ data: 'c', label: 'Third' }
			],
        } );

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
                    label: mw.message( 'mwe-recwiz-details-randomise' ).text(),
                } ),
                new OO.ui.FieldLayout( this.wordList, {
                    align: 'top',
                    label: mw.message( 'mwe-recwiz-details-wordlist' ).text(),
                } ),
                this.generatorButtons,
            ],
            classes: [ 'mwe-recwiz-increment' ],
        } );

        // Populate
        if ( rw.metadatas.words !== undefined ) {
        	for ( var i=0; i < rw.metadatas.words.length; i++ ) {
            	this.addWord( rw.metadatas.words[ i ] );
        	}
        }

		//Manage events
		this.wordList.on( 'change', function() {
			ui.emit( 'wordlist-change' );
		} );
		this.wordList.on( 'add', function( item, index ) {
			ui.emit( 'wordlist-add', item.getData(), index );
		} );

		this.$container.prepend( this.layout.$element );
	};

	rw.ui.Details.prototype.addGeneratorButton = function( generator ) {
		var ui = this,
        	button = new OO.ui.ButtonWidget( { label: generator.label, icon: 'add' } );

        button.on( 'click', function() {
            ui.windowManager.openWindow( generator );
        } );

        this.windowManager.addWindows( [ generator ] );

        this.generatorButtons.addItems( [ button ] );
	};

	rw.ui.Details.prototype.addWord = function( word ) {
		return this.wordList.addTag( word );
	};

	rw.ui.Details.prototype.countWords = function() {
		return this.wordList.getItemCount();
	};

	rw.ui.Details.prototype.collect = function() {
		//TODO collect language
	    rw.metadatas.words = this.wordList.getValue();
	    rw.metadatas.randomise = this.randomSwitch.getValue();
	};

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );

