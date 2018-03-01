( function ( mw, $, rw, OO ) {

	rw.ui.DetailsGenerator = function( metadatas ) {

        this.generators = {};
        if ( metadatas.generator === undefined ) {
            metadatas.generator = {};
        }

        this.textarea = new OO.ui.MultilineTextInputWidget( { //TODO: maybe use a multi capsule widget instead?
            rows: 10,
            autosize: true,
            value: ''
        } );

        this.generatorButtons = new OO.ui.ButtonGroupWidget();

        for ( className in rw.generator ) {
            var name = rw.generator[ className ].static.name;

            if ( name !== '__generic__' ) {
                this.generators[ name ] = new rw.generator[ className ]( metadatas, this.textarea );

                var button = new OO.ui.ButtonWidget( { label: this.generators[ name ].label, icon: 'add' } );
                button.on( 'click', this.generators[ name ].load.bind( this.generators[ name ] ) );

                this.generatorButtons.addItems( [ button ] );
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

	rw.ui.DetailsGenerator.prototype.onChange = function( dropdown ) {
        var name = dropdown.getData();
        this.setStateValue( this.generators[ name ].label );
        //TODO: inform the generator that it has been (de)selected
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
