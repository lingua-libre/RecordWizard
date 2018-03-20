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

        this.languageSelector = new OO.ui.FieldLayout( new OO.ui.DropdownWidget( {
	        menu: {
		        items: [
			        new OO.ui.MenuOptionWidget( { data: 'English', label: 'English' } ),
			        new OO.ui.MenuOptionWidget( { data: 'French', label: 'French' } ),
			        new OO.ui.MenuOptionWidget( { data: 'Alemannic', label: 'Alemannic' } )
		        ]
	        },
	        //$overlay: ,
        } ), {
	        align: 'left',
	        classes: [ 'mwe-recwiz-increment' ],
	        label: mw.message( 'mwe-recwiz-param-lang' ).text()
        } );

        this.wordList = new rw.layout.WordSelectorWidget( {
	        placeholder: mw.message( 'mwe-recwiz-generator-addwords' ).text(),
	        allowArbitrary: true,
	        inputPosition: 'outline' //TODO: maybe inline ?
        } );

        this.windowManager = new OO.ui.WindowManager();
        $( 'body' ).append( this.windowManager.$element );
        this.generatorButtons = new OO.ui.ButtonGroupWidget();

        this.layout = new OO.ui.Widget( {
            content: [
                new OO.ui.FieldLayout( this.wordList, {
                    align: 'top',
                    label: mw.message( 'mwe-recwiz-generator-wordlist' ).text(),
                } ),
                this.generatorButtons
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

		this.$container.prepend( this.layout.$element ).prepend( this.languageSelector.$element );
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
	};

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );

