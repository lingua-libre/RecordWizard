( function ( mw, $, rw, OO ) {

	rw.ui.DetailsLocutor = function( metadatas ) {

		this.genderSelector = new OO.ui.FieldLayout( new OO.ui.ButtonSelectWidget( {
	        items: [
		        new OO.ui.ButtonOptionWidget( { label: mw.message( 'mwe-recwiz-gender-male' ).text() } ),
		        new OO.ui.ButtonOptionWidget( { label: mw.message( 'mwe-recwiz-gender-female' ).text() } ),
		        new OO.ui.ButtonOptionWidget( { label: mw.message( 'mwe-recwiz-gender-other' ).text() } )
	        ]
        } ), {
	        align: 'left',
	        classes: [ 'mwe-recwiz-increment' ],
	        label: mw.message( 'mwe-recwiz-locutor-gender' ).text(),
        } );

        this.spokenLanguagesSelector = new OO.ui.FieldLayout( new OO.ui.CapsuleMultiselectWidget( {
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
	        label: mw.message( 'mwe-recwiz-locutor-languages' ).text()
        } );

        this.locationSelector = new OO.ui.FieldLayout( new OO.ui.TextInputWidget( {
	        name: 'location',
        } ), {
	        align: 'left',
	        classes: [ 'mwe-recwiz-increment' ],
	        label: mw.message( 'mwe-recwiz-locutor-location' ).text()
        } );

        this.$content = $( '<div>' )
            .append( this.genderSelector.$element )
	        .append( this.spokenLanguagesSelector.$element )
	        .append( this.locationSelector.$element );


		rw.layout.ButtonDropdownLayout.call( this, {
	        label: mw.message( 'mwe-recwiz-locutor' ).text(),
	        stateValue: mw.config.get( 'wgUserName' ),
            $content: this.$content,
		} );

	};

	OO.inheritClass( rw.ui.DetailsLocutor, rw.layout.ButtonDropdownLayout );

	rw.ui.DetailsLocutor.prototype.collect = function() {
	    return {};
	};

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );
