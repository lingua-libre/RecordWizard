( function ( mw, $, rw, OO ) {

	/**
	 * Represents the UI for the wizard's Details step.
	 *
	 * @class rw.ui.Details
	 * @extends rw.ui.Step
	 * @constructor
	 */
	rw.ui.Details = function() {
		var ui = this;

		rw.ui.Step.call(
			this,
			'details'
		);

		this.addPreviousButton();
		this.addNextButton();
	};

	OO.inheritClass( rw.ui.Details, rw.ui.Step );

	rw.ui.Details.prototype.load = function ( metadatas, records ) {
		rw.ui.Step.prototype.load.call( this, metadatas, records );

		this.locutorLabel = new OO.ui.LabelWidget( {
		    label: mw.config.get( 'wgUserName' )
		} );
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

        this.generators = {};
        this.generators.manual = new OO.ui.RadioOptionWidget( {
            data: 'manual',
            label: mw.message( 'mwe-recwiz-generator-manual' ).text()
        } );

        this.generators.nearby = new OO.ui.RadioOptionWidget( {
            data: 'nearby',
            label: mw.message( 'mwe-recwiz-generator-nearby' ).text()
        } );

        this.generatorsRadioSelector = new OO.ui.RadioSelectWidget( {
	        classes: [ 'mwe-recwiz-increment' ],
            items: [ this.generators.manual, this.generators.nearby ]
         } );

        this.generatorsRadioSelector.selectItem( this.generators.manual );

		this.locutorFieldset = new rw.layout.DropdownLayout( {
	        label: mw.message( 'mwe-recwiz-locutor' ).text(),
	        items: [
	            this.locutorLabel,
		        this.genderSelector,
		        this.spokenLanguagesSelector,
		        this.locationSelector,
	        ]
        } );
		this.paramFieldset = new rw.layout.DropdownLayout( {
	        label: mw.message( 'mwe-recwiz-param' ).text(),
	        items: [
		        this.languageSelector,
	        ]
        } );
		this.generatorFieldset = new rw.layout.DropdownLayout( {
	        label: mw.message( 'mwe-recwiz-generator' ).text(),
	        items: [
		        this.generatorsRadioSelector
	        ]
        } );


		this.$container
		    .prepend( this.generatorFieldset.$element )
		    .prepend( this.paramFieldset.$element )
		    .prepend( this.locutorFieldset.$element );
	};

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );

