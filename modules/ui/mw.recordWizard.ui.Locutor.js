( function ( mw, $, rw, OO ) {

	/**
	 * Represents the UI for the wizard's Locutor step.
	 *
	 * @class rw.ui.Locutor
	 * @extends rw.ui.Step
	 * @constructor
	 */
	rw.ui.Locutor = function() {
		var ui = this;

		rw.ui.Step.call(
			this,
			'locutor'
		);

		this.addPreviousButton();
		this.addNextButton();
	};

	OO.inheritClass( rw.ui.Locutor, rw.ui.Step );

	rw.ui.Locutor.prototype.load = function () {
	    var ui = this;

		rw.ui.Step.prototype.load.call( this );

		// Profile picker
		var items = [];
		items.push( new OO.ui.MenuSectionOptionWidget( { label: mw.message( 'mwe-recwiz-locutor-profilemain' ).text() } ) );
		items.push( new OO.ui.MenuOptionWidget( {
			data: rw.config.locutor.qid || '*',
			label: rw.config.locutor.name || mw.config.get( 'wgUserName' )
		} ) );
		items.push( new OO.ui.MenuSectionOptionWidget( { label: mw.message( 'mwe-recwiz-locutor-profileother' ).text() } ) );
		for ( var qid in rw.config.otherLocutors ) {
			items.push( new OO.ui.MenuOptionWidget( {
				data: qid,
				label: rw.config.otherLocutors[ qid ].name,
			} ) );
		}
		items.push( new OO.ui.MenuOptionWidget( { data: '+', label: $( '<i>' ).text( mw.message( 'mwe-recwiz-locutor-profilenew' ).text() ) } ) );
		this.profilePicker = new OO.ui.DropdownWidget( {
			label: 'Select one',
			menu: {
				items: items
			}
		} );

		// Gender
		this.genderSelector = new OO.ui.ButtonSelectWidget( {
	        items: [
		        new OO.ui.ButtonOptionWidget( { data: rw.config.items['genderMale'], label: mw.message( 'mwe-recwiz-gender-male' ).text() } ),
		        new OO.ui.ButtonOptionWidget( { data: rw.config.items['genderFemale'], label: mw.message( 'mwe-recwiz-gender-female' ).text() } ),
		        new OO.ui.ButtonOptionWidget( { data: rw.config.items['genderOther'], label: mw.message( 'mwe-recwiz-gender-other' ).text() } )
	        ]
        } );

		// Spoken languages
		var languages = [];
		for ( code in rw.config.languages ) {
			languages.push( new OO.ui.MenuOptionWidget( {
				data: rw.config.languages[ code ].qid,
				label: rw.config.languages[ code ].localname
			} ) );
		}
		languages.sort( function( a, b ) { return a.getLabel() > b.getLabel(); } );
        this.spokenLanguagesSelector = new OO.ui.CapsuleMultiselectWidget( {
	        menu: { items: languages },
            indicator: 'required',
        } );

		// Location
        this.locationSelector = new OO.ui.TextInputWidget( {
	        name: 'location',
        } );

		// Layout
        this.$content = $( '<div>' )
            .append( new OO.ui.FieldLayout( this.profilePicker, {
			    align: 'left',
			    label: mw.message( 'mwe-recwiz-locutor-profile' ).text(),
		    } ).$element )
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
		this.$container.prepend( this.$content );

		// Preload
		this.profilePicker.getMenu().selectItemByData( rw.metadatas.locutor.qid || rw.config.locutor.qid || '*' );
		if ( rw.metadatas.locutor !== undefined ) {
			this.populateProfile( rw.metadatas.locutor );
		}
		else {
			this.populateProfile( rw.config.locutor );
		}

		// Events
		this.profilePicker.getMenu().on( 'choose', function( item ) {
			ui.emit( 'profile-change', item.getData() );
		} )
	};

	rw.ui.Locutor.prototype.populateProfile = function( locutor ) {
		this.genderSelector.selectItemByData( locutor.gender );
		this.spokenLanguagesSelector.setItemsFromData( locutor.languages );
		this.locationSelector.setValue( locutor.location );
	};

	rw.ui.Locutor.prototype.collect = function() {
	    var genderItem = this.genderSelector.getSelectedItem();

		rw.metadatas.locutor.gender = ( genderItem === null ? null : genderItem.getData() );
		rw.metadatas.locutor.languages = this.spokenLanguagesSelector.getItemsData();
		rw.metadatas.locutor.location = this.locationSelector.getValue();

	    return rw.metadatas.locutor;
	};

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );

