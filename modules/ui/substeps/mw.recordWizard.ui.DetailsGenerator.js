( function ( mw, $, rw, OO ) {

	rw.ui.DetailsGenerator = function( metadatas ) {

        this.generators = {};
        this.radioDropdowns = {};

		this.accordion = new rw.layout.AccordionLayout();

        for ( className in rw.generator ) {
            var name = rw.generator[ className ].static.name;

            if ( name !== '__generic__' ) {
                this.generators[ name ] = new rw.generator[ className ]();

                this.radioDropdowns[ name ] = new rw.layout.RadioDropdownLayout( {
                    data: name,
                    label: this.generators[ name ].label,
                    name: 'mwe-recwiz-generators',
                    collapsed: true,
                    classes: [ 'mwe-recwiz-increment' ],
                    $content: this.generators[ name ].$element
                } );
                this.accordion.addDropdowns( [ this.radioDropdowns[ name ] ] );
            }
        }

        if ( metadatas.generator !== undefined ) {
            this.radioDropdowns[ metadatas.generator.name ].expand();
            this.generators[ metadatas.generator.name ].preload( metadatas );
        }

        this.accordion.on( 'change', this.onChange.bind( this ) );


		rw.layout.ButtonDropdownLayout.call( this, {
	        label: mw.message( 'mwe-recwiz-generator' ).text(),
	        stateValue: '',
            $content: this.accordion.$element
		} );

	};

	OO.inheritClass( rw.ui.DetailsGenerator, rw.layout.ButtonDropdownLayout );

	rw.ui.DetailsGenerator.prototype.onChange = function( dropdown ) {
        var name = dropdown.getData();
        this.setStateValue( this.generators[ name ].label );
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
