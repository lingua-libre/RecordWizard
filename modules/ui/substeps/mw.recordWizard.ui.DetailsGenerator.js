( function ( mw, $, rw, OO ) {

	rw.ui.DetailsGenerator = function( metadatas ) {
        this.metadatas = metadatas;
        this.generators = {};

        if ( this.metadatas.generator === undefined ) {
            this.metadatas.generator = {};
        }

        this.windowManager = new OO.ui.WindowManager();
        $( 'body' ).append( this.windowManager.$element );

        this.textarea = new OO.ui.MultilineTextInputWidget( { //TODO: maybe use a multi capsule widget instead?
            rows: 10,
            autosize: true,
            value: ''
        } );

        this.generatorButtons = new OO.ui.ButtonGroupWidget();

        for ( className in rw.generator ) {
            if ( rw.generator[ className ].static.name !== '__generic__' ) {
                this.setupGenerator( className );
            }
        }

        this.layout = new OO.ui.Widget( {
            content: [
                new OO.ui.FieldLayout( this.textarea, {
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

	};

	OO.inheritClass( rw.ui.DetailsGenerator, rw.layout.ButtonDropdownLayout );

	rw.ui.DetailsGenerator.prototype.setupGenerator = function( className ) {
        var ui = this,
            name = rw.generator[ className ].static.name;

        this.generators[ name ] = new rw.generator[ className ]( {
            metadatas: this.metadatas,
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

	rw.ui.DetailsGenerator.prototype.onChange = function( dropdown ) {
        var name = dropdown.getData();
        this.setStateValue( this.generators[ name ].label );
        //TODO: inform the generator that it has been (de)selected
	};

	rw.ui.DetailsGenerator.prototype.addWords = function( list ) {
	    if ( list.length > 0 ) {
	        this.textarea.setValue( this.textarea.getValue() + '\n' + list.join( '\n' ) );
	    }
	};

	rw.ui.DetailsGenerator.prototype.collect = function() {
	    var selectedRadio = this.accordion.getSelected();
	    if ( selectedRadio === null ) {
	        return {};
	    }

	    return {
	        words: this.generators[ selectedRadio.getData() ].getList(),
	        generator: this.generators[ selectedRadio.getData() ].getParams(),
	    };
	};

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );
