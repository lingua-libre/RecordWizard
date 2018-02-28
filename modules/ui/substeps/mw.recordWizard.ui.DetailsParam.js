( function ( mw, $, rw, OO ) {

	rw.ui.DetailsParam = function( config ) {

        this.languageSelector = new OO.ui.FieldLayout( new OO.ui.DropdownWidget( {
	        menu: {
		        items: [
			        new OO.ui.MenuOptionWidget( { data: 'English', label: 'English' } ),
			        new OO.ui.MenuOptionWidget( { data: 'French', label: 'French' } ),
			        new OO.ui.MenuOptionWidget( { data: 'Alemannic', label: 'Alemannic' } )
		        ]
	        },
	        $overlay: $( 'body' ),
            indicator: 'required',
        } ), {
	        align: 'left',
	        classes: [ 'mwe-recwiz-increment' ],
	        label: mw.message( 'mwe-recwiz-param-lang' ).text()
        } );

		this.content = new OO.ui.FieldsetLayout( {
            items: [
	            this.languageSelector,
            ],
        } );

		rw.layout.ButtonAccordionLayout.call( this, {
	        label: mw.message( 'mwe-recwiz-param' ).text(),
            content: this.content,
		} );

	};

	OO.inheritClass( rw.ui.DetailsParam, rw.layout.ButtonAccordionLayout );

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );
