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
			label: rw.config.locutor.name
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

		// Name
        this.nameSelector = new OO.ui.TextInputWidget();

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
        this.locationSelector = new OO.ui.TextInputWidget();

        // License
        this.licenseSelector = new rw.layout.LicenseSelectorWidget( { licenses: rw.config.licenses } );

		// Layout
        this.$content = $( '<div>' )
            .append( new OO.ui.FieldLayout( this.profilePicker, {
			    align: 'left',
			    label: mw.message( 'mwe-recwiz-locutor-profile' ).text(),
		    } ).$element )
            .append( new OO.ui.FieldLayout( this.nameSelector, {
			    align: 'left',
			    classes: [ 'mwe-recwiz-increment' ],
			    label: mw.message( 'mwe-recwiz-locutor-name' ).text(),
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
		    } ).$element )
	        .append( new OO.ui.FieldLayout( this.licenseSelector, {
			    align: 'left',
			    classes: [ 'mwe-recwiz-increment' ],
			    label: mw.message( 'mwe-recwiz-locutor-license' ).text()
		    } ).$element );
		this.$container.prepend( this.$content );

		// Events
		this.profilePicker.getMenu().on( 'choose', function( item ) {
			ui.emit( 'profile-change', item.getData() );
		} )
		this.nameSelector.on( 'change', function( value ) {
			ui.licenseSelector.setDescription( mw.msg( 'mwe-recwiz-locutor-licensecontent', value ) );
		} )

		// Preload
		this.profilePicker.getMenu().selectItemByData( rw.metadatas.locutor.qid || rw.config.locutor.qid || '*' );
		if ( rw.metadatas.locutor.qid !== undefined ) {
			this.populateProfile( rw.metadatas.locutor );
		}
		else {
			this.populateProfile( rw.config.locutor );
		}
		this.licenseSelector.setValue( rw.metadatas.license || rw.config.savedLicense );
	};

	rw.ui.Locutor.prototype.populateProfile = function( locutor ) {
		this.nameSelector.setValue( locutor.name );
		this.nameSelector.setDisabled( locutor.main === true );
		this.genderSelector.selectItemByData( locutor.gender );
		this.spokenLanguagesSelector.setItemsFromData( locutor.languages );
		this.locationSelector.setValue( locutor.location );
	};

	rw.ui.Locutor.prototype.collect = function() {
	    var genderItem = this.genderSelector.getSelectedItem();

		rw.metadatas.locutor = {};
		rw.metadatas.license = this.licenseSelector.getValue();

		rw.metadatas.locutor.qid = this.profilePicker.getMenu().getSelectedItem().getData();
		rw.metadatas.locutor.name = this.nameSelector.getValue();
		rw.metadatas.locutor.gender = ( genderItem === null ? null : genderItem.getData() );
		rw.metadatas.locutor.languages = this.spokenLanguagesSelector.getItemsData();
		rw.metadatas.locutor.location = this.locationSelector.getValue();

		rw.metadatas.locutor.main = false;
		if ( rw.metadatas.locutor.qid === '*' || rw.metadatas.locutor.qid === rw.config.locutor.qid ) {
			rw.metadatas.locutor.main = true;
		}

		rw.metadatas.locutor.new = false;
		if ( rw.metadatas.locutor.qid[ 0 ] !== 'Q' ) {
			rw.metadatas.locutor.new = true;
			rw.metadatas.locutor.qid = null;
		}

	    return rw.metadatas.locutor;
	};

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );

