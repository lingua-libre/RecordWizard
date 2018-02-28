( function ( mw, $, rw, OO ) {

	rw.ui.DetailsParam = function( metadatas ) {

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

		rw.layout.ButtonDropdownLayout.call( this, {
	        label: mw.message( 'mwe-recwiz-param' ).text(),
            content: this.content,
		} );

	};

	OO.inheritClass( rw.ui.DetailsParam, rw.layout.ButtonDropdownLayout );

	rw.ui.DetailsParam.prototype.collect = function() {
        return {};
	};

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );
