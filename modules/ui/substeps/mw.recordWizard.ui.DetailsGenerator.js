( function ( mw, $, rw, OO ) {

	rw.ui.DetailsGenerator = function( config ) {

        this.generators = {};
        this.generators.manual = new rw.layout.RadioDropdownLayout( {
            data: 'manual',
            label: mw.message( 'mwe-recwiz-generator-manual' ).text(),
            collapsed: true,
	        classes: [ 'mwe-recwiz-increment' ],
            content: new OO.ui.MultilineTextInputWidget( {
	            rows: 10,
	            autosize: true,
	            value: ''
            } )
        } );

        this.generators.nearby = new rw.layout.RadioDropdownLayout( {
            data: 'nearby',
            label: mw.message( 'mwe-recwiz-generator-nearby' ).text(),
            collapsed: true,
	        classes: [ 'mwe-recwiz-increment' ],
            content: new OO.ui.MultilineTextInputWidget( {
	            rows: 8,
	            autosize: true,
	            value: ''
            } ).setDisabled( true )
        } );

		this.content = new rw.layout.AccordionLayout( {
            items: [
	            this.generators.manual,
	            this.generators.nearby
            ],
        } );

		rw.layout.ButtonDropdownLayout.call( this, {
	        label: mw.message( 'mwe-recwiz-generator' ).text(),
	        stateValue: 'Manual',
            content: this.content
		} );

	};

	OO.inheritClass( rw.ui.DetailsGenerator, rw.layout.ButtonDropdownLayout );

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );
