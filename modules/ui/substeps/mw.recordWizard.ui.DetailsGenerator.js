( function ( mw, $, rw, OO ) {

	rw.ui.DetailsGenerator = function( config ) {

        this.generators = {};
        this.radioDropdowns = [];

        for ( className in rw.generator ) {
            var name = rw.generator[ className ].static.name;
            console.log( name );
            if ( name !== '__generic__' ) {
                this.generators[ name ] = new rw.generator[ className ]();

                var radioDropdown = new rw.layout.RadioDropdownLayout( {
                    data: name,
                    label: this.generators[ name ].label,
                    collapsed: true,
                    classes: [ 'mwe-recwiz-increment' ],
                    content: this.generators[ name ].$element
                } );
                this.radioDropdowns.push( radioDropdown );
            }
        }

		this.accordion = new rw.layout.AccordionLayout( {
            items: this.radioDropdowns,
        } );

		rw.layout.ButtonDropdownLayout.call( this, {
	        label: mw.message( 'mwe-recwiz-generator' ).text(),
	        stateValue: 'Manual',
            content: this.accordion
		} );

	};

	OO.inheritClass( rw.ui.DetailsGenerator, rw.layout.ButtonDropdownLayout );

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
