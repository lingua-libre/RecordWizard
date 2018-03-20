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

		this.generators = {};

        if ( rw.metadatas.generator === undefined ) {
            rw.metadatas.generator = {};
        }

        this.windowManager = new OO.ui.WindowManager();
        $( 'body' ).append( this.windowManager.$element );

        this.wordList = new rw.layout.WordSelectorWidget( {
	        placeholder: mw.message( 'mwe-recwiz-generator-addwords' ).text(),
	        allowArbitrary: true,
	        inputPosition: 'outline' //TODO: maybe inline ?
        } );
        if ( rw.metadatas.words !== undefined ) {
            this.addWords( rw.metadatas.words );
        }

        this.generatorButtons = new OO.ui.ButtonGroupWidget();
        for ( className in rw.generator ) {
            this.setupGenerator( className );
        }

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

		this.wordList.on( 'change', this.onWordListUpdate.bind( this ) );
		this.wordList.on( 'add', this.onWordListAdd.bind( this ) );

		this.$container.prepend( this.layout.$element ).prepend( this.languageSelector.$element );
	};

	rw.ui.Details.prototype.setupGenerator = function( className ) {
        var ui = this,
            name = rw.generator[ className ].static.name;

        if ( name === '__generic__' ) {
        	return;
        }

        this.generators[ name ] = new rw.generator[ className ]( {
            callback: this.addWords.bind( this ),
        } );
        this.windowManager.addWindows( [ this.generators[ name ] ] );

        var button = new OO.ui.ButtonWidget( { label: this.generators[ name ].label, icon: 'add' } );
        button.on( 'click', function() {
            console.log( name );
            ui.windowManager.openWindow( ui.generators[ name ] );
        } );

        this.generatorButtons.addItems( [ button ] );
	};

	rw.ui.Details.prototype.addWords = function( list ) {
	    if ( list.length > 0 ) {
	        for ( var i=0; i < list.length; i++ ) {
	        	var word = list[ i ],
	        		extra = {};
	        	if ( typeof list[ i ] !== 'string' ) {
	            	word = list[ i ].text;
	            	delete list[ i ].text;
	            	extra = list[ i ];
	           	}
	           	//TODO: Move this somehow to a controller
	           	this.wordList.addTag( word );
	           	rw.records[ word ].setExtra( extra );
	        }
	    }
	};

	rw.ui.Details.prototype.onWordListAdd = function( item, index ) {
	    //TODO: Move this somehow to a controller
	    word = item.getData();
       	if ( rw.records[ word ] === undefined ) {
       		rw.records[ word ] = new rw.Record( word, rw.metadatas );
       	}
	};

	rw.ui.Details.prototype.onWordListUpdate = function() {
		var nbWords = this.wordList.getItemCount();
		//TODO: find a place to display word count
		if ( nbWords === 0 ) {
	    	//mw.message( 'mwe-recwiz-generator-noword' ).text();
	  	}
	  	else {
	    	//mw.message( 'mwe-recwiz-generator-wordcount', nbWords ).text();
	  	}
	};

	rw.ui.Details.prototype.collect = function() {
		//TODO collect language
	    rw.metadatas.words = this.wordList.getValue();
	};

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );

