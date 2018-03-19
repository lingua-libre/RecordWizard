( function ( mw, $, rw, OO ) {

	rw.ui.DetailsLocutor = function() {
		var languages = [];
		for ( code in rw.config.languages ) {
			languages.push( new OO.ui.MenuOptionWidget( {
				data: rw.config.languages[ code ].qid,
				label: rw.config.languages[ code ].localname
			} ) );
		}
		languages.sort( function( a, b ) { return a.getLabel() > b.getLabel(); } );

		this.genderSelector = new OO.ui.ButtonSelectWidget( {
	        items: [
		        new OO.ui.ButtonOptionWidget( { data: rw.config.items['genderMale'], label: mw.message( 'mwe-recwiz-gender-male' ).text() } ),
		        new OO.ui.ButtonOptionWidget( { data: rw.config.items['genderFemale'], label: mw.message( 'mwe-recwiz-gender-female' ).text() } ),
		        new OO.ui.ButtonOptionWidget( { data: rw.config.items['genderOther'], label: mw.message( 'mwe-recwiz-gender-other' ).text() } )
	        ]
        } );

        this.spokenLanguagesSelector = new OO.ui.CapsuleMultiselectWidget( {
	        menu: { items: languages },
	        //$overlay: ,
            indicator: 'required',
        } );

        this.locationSelector = new OO.ui.TextInputWidget( {
	        name: 'location',
        } );

        this.$content = $( '<div>' )
            .append( new OO.ui.FieldLayout( this.genderSelector, {
			    align: 'left',
			    classes: [ 'mwe-recwiz-increment' ],
			    label: mw.message( 'mwe-recwiz-locutor-gender' ).text(),
		    } ).$element )
	        .append( new OO.ui.FieldLayout( this.spokenLanguagesSelector, {
			    align: 'left',
			    classes: [ 'mwe-recwiz-increment' ],
			    label: mw.message( 'mwe-recwiz-locutor-languages' ).text()
		    } ).$element )
	        .append( new OO.ui.FieldLayout( this.locationSelector, {
			    align: 'left',
			    classes: [ 'mwe-recwiz-increment' ],
			    label: mw.message( 'mwe-recwiz-locutor-location' ).text()
		    } ).$element );

		// Populate
		if ( rw.metadatas.locutor !== undefined ) {
			this.genderSelector.selectItemByData( rw.metadatas.locutor.gender );
			this.spokenLanguagesSelector.setItemsFromData( rw.metadatas.locutor.languages );
			this.locationSelector.setValue( rw.metadatas.locutor.location );
		}


		rw.layout.ButtonDropdownLayout.call( this, {
	        label: mw.message( 'mwe-recwiz-locutor' ).text(),
	        stateValue: mw.config.get( 'wgUserName' ),
            $content: this.$content,
		} );

	};

	OO.inheritClass( rw.ui.DetailsLocutor, rw.layout.ButtonDropdownLayout );

	rw.ui.DetailsLocutor.prototype.collect = function() {
		var genderItem = this.genderSelector.getSelectedItem();

		rw.metadatas.locutor['gender'] = ( genderItem === null ? null : genderItem.getData() );
		rw.metadatas.locutor['languages'] = this.spokenLanguagesSelector.getItemsData();
		rw.metadatas.locutor['location'] = this.locationSelector.getValue();

	    return rw.metadatas.locutor;
	};

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );
