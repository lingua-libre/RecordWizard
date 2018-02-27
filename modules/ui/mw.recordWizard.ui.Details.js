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
	    var ui = this;

		rw.ui.Step.prototype.load.call( this, metadatas, records );

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
        this.generators.manual = new rw.layout.RadioAccordeonLayout( {
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

        this.generators.nearby = new rw.layout.RadioAccordeonLayout( {
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

		this.locutorFieldset = new rw.layout.ButtonAccordeonLayout( {
	        label: mw.message( 'mwe-recwiz-locutor' ).text(),
	        stateValue: mw.config.get( 'wgUserName' ),
	        content: new OO.ui.FieldsetLayout( {
	            items: [
		            this.genderSelector,
		            this.spokenLanguagesSelector,
		            this.locationSelector,
	            ],
	        } ),
        } );
		this.paramFieldset = new rw.layout.ButtonAccordeonLayout( {
	        label: mw.message( 'mwe-recwiz-param' ).text(),
	        stateValue: 'French',
	        content: new OO.ui.FieldsetLayout( {
	            items: [
		            this.languageSelector,
	            ],
	        } ),
        } );
		this.generatorFieldset = new rw.layout.ButtonAccordeonLayout( {
	        label: mw.message( 'mwe-recwiz-generator' ).text(),
	        stateValue: 'Manual',
	        content: new OO.ui.FieldsetLayout( {
	            items: [
		            this.generators.manual,
		            this.generators.nearby
	            ],
	        } ),
        } );
        this.locutorFieldset.on( 'expand', function() {
            console.log( 'tty' );
            ui.paramFieldset.collapse();
            ui.generatorFieldset.collapse();
        } );
        this.paramFieldset.on( 'expand', function() {
            ui.locutorFieldset.collapse();
            ui.generatorFieldset.collapse();
        } );
        this.generatorFieldset.on( 'expand', function() {
            ui.locutorFieldset.collapse();
            ui.paramFieldset.collapse();
        } );

        this.generators.manual.on( 'expand', function() {
            ui.generators.nearby.collapse();
        } );
        this.generators.nearby.on( 'expand', function() {
            ui.generators.manual.collapse();
        } );

		this.$container
		    .prepend( this.generatorFieldset.$element )
		    .prepend( this.paramFieldset.$element )
		    .prepend( this.locutorFieldset.$element );
	};

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );

