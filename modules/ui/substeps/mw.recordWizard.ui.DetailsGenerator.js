( function ( mw, $, rw, OO ) {

	rw.ui.DetailsGenerator = function( config ) {

        this.generators = {};
        this.generators.manual = new rw.layout.RadioAccordionLayout( {
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

        this.generators.nearby = new rw.layout.RadioAccordionLayout( {
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

		this.content = new OO.ui.FieldsetLayout( {
            items: [
	            this.generators.manual,
	            this.generators.nearby
            ],
        } );

		rw.layout.ButtonAccordionLayout.call( this, {
	        label: mw.message( 'mwe-recwiz-generator' ).text(),
	        stateValue: 'Manual',
            content: this.content
		} );

        this.generators.manual.on( 'expand', function() {
            ui.generators.nearby.collapse();
        } );
        this.generators.nearby.on( 'expand', function() {
            ui.generators.manual.collapse();
        } );
	};

	OO.inheritClass( rw.ui.DetailsGenerator, rw.layout.ButtonAccordionLayout );

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );
