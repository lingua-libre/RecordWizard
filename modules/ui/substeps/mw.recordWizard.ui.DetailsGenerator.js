( function ( mw, $, rw, OO ) {

	rw.ui.DetailsGenerator = function() {
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
            if ( rw.generator[ className ].static.name !== '__generic__' ) {
                this.setupGenerator( className );
            }
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

		rw.layout.ButtonDropdownLayout.call( this, {
	        label: mw.message( 'mwe-recwiz-generator' ).text(),
	        stateValue: '',
            $content: this.layout.$element
		} );

		this.wordList.on( 'change', this.onWordListUpdate.bind( this ) );
		this.wordList.on( 'add', this.onWordListAdd.bind( this ) );
	};

	OO.inheritClass( rw.ui.DetailsGenerator, rw.layout.ButtonDropdownLayout );

	rw.ui.DetailsGenerator.prototype.setupGenerator = function( className ) {
        var ui = this,
            name = rw.generator[ className ].static.name;

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

	rw.ui.DetailsGenerator.prototype.addWords = function( list ) {
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

	rw.ui.DetailsGenerator.prototype.onWordListAdd = function( item, index ) {
	    //TODO: Move this somehow to a controller
	    word = item.getData();
       	if ( rw.records[ word ] === undefined ) {
       		rw.records[ word ] = new rw.Record( word, rw.metadatas );
       	}
	};

	rw.ui.DetailsGenerator.prototype.onWordListUpdate = function() {
		var nbWords = this.wordList.getItemCount();
		if ( nbWords === 0 ) {
	    	this.setStateValue( mw.message( 'mwe-recwiz-generator-noword' ).text() );
	  	}
	  	else {
	    	this.setStateValue( mw.message( 'mwe-recwiz-generator-wordcount', nbWords ).text() );
	  	}
	};

	rw.ui.DetailsGenerator.prototype.collect = function() {
	    rw.metadatas.words = this.wordList.getValue();
	};

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );
