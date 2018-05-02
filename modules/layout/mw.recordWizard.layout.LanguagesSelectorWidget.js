'use strict';

( function ( mw, $, rw, OO ) {

	rw.layout.LanguagesSelectorWidget = function( config ) {
	    config = config || {};
	    config.classes = config.classes || []
	    config.classes.push( 'mwe-recwiz-languagesSelectorWidget' );

	    OO.ui.CapsuleMultiselectWidget.call( this, config );

	    this.languages = {};

	    if ( config.value !== undefined ) {
	    	this.setValue( config.value );
	    }

	    // Dialog box
        this.windowManager = new OO.ui.WindowManager();
        this.dialog = new rw.layout.LanguagesSelectorWidget.Dialog()
        $( 'body' ).append( this.windowManager.$element );
        this.windowManager.addWindows( [ this.dialog ] );


	    // Events
	    this.on( 'add', this.onAdd.bind( this ) );
	    this.on( 'remove', this.onRemove.bind( this ) );
	};

	OO.inheritClass( rw.layout.LanguagesSelectorWidget, OO.ui.CapsuleMultiselectWidget );

	rw.layout.LanguagesSelectorWidget.prototype.setValue = function( languages ) {
		this.languages = languages || {};

		var selectedDatas = [];
		for ( var lang in this.languages ) {
			selectedDatas.push( lang );
		}

		this.setItemsFromData( selectedDatas );
	};

	rw.layout.LanguagesSelectorWidget.prototype.getValue = function() {
		return this.languages;
	};

	rw.layout.LanguagesSelectorWidget.prototype.onAdd = function( item ) {
		var lang = item.getData();

		// To avoid data overwriting after a setValue call
		if ( this.languages[ lang ] === undefined ) {
			this.languages[ lang ] = {
				qid: lang
			};

		    this.windowManager.openWindow( this.dialog, { label: item.getLabel(), callback: this.onQualifierSelected.bind( this, lang ) } );
		}
	};

	rw.layout.LanguagesSelectorWidget.prototype.onQualifierSelected = function( lang, qualifiers ) {
		$.extend( this.languages[ lang ], qualifiers );
	};

	rw.layout.LanguagesSelectorWidget.prototype.onRemove = function( item ) {
		var lang = item.getData();
		delete this.languages[ lang ];
	};





	rw.layout.LanguagesSelectorWidget.Dialog = function( config ) {
		config = config || {};
	    config.size = config.size || 'medium';
	    rw.layout.LanguagesSelectorWidget.Dialog.parent.call( this, config );

	    this.size = config.size;
        this.content = new OO.ui.PanelLayout( { padded: true, expanded: false } );
	};
    OO.inheritClass( rw.layout.LanguagesSelectorWidget.Dialog, OO.ui.ProcessDialog );

	rw.layout.LanguagesSelectorWidget.Dialog.static.name = 'languageselector';
	rw.layout.LanguagesSelectorWidget.Dialog.static.title = mw.message( 'mwe-recwiz-locutor-languagedialog' ).text();
	rw.layout.LanguagesSelectorWidget.Dialog.static.actions = [
        { action: 'save', label: 'Done', flags: [ 'primary', 'progressive' ] },
        { action: 'cancel', label: 'Cancel', flags: [ 'safe', 'back' ] }
    ];


	rw.layout.LanguagesSelectorWidget.Dialog.prototype.initialize = function () {
	    rw.layout.LanguagesSelectorWidget.Dialog.parent.prototype.initialize.apply( this, arguments );

		//TODO: get from config
		var options = [
			 { label: 'native', data: 'Q36' },
			 { label: 'good level', data: 'Q35' },
			 { label: 'average level', data: 'Q34' },
			 { label: 'beginner', data: 'Q33' },
		];
		this.levelDropdown = new OO.ui.DropdownInputWidget( {
			options: options,
			dropdown: {
				$overlay: $( 'body' ),
			},
		} );
		this.levelFieldset = new OO.ui.FieldLayout( this.levelDropdown, {
		    align: 'left',
	    } );

		this.locationInput = new rw.layout.WikidataSearchWidget( {
			$overlay: $( 'body' )
		} );
		this.locationFieldset = new OO.ui.FieldLayout( this.locationInput, {
		    align: 'left',
	    } );

		this.content.$element.append( this.levelFieldset.$element ).append( this.locationFieldset.$element );

        this.$body.append( this.content.$element );

        this.setSize( this.size );
        this.updateSize();
    };
    rw.layout.LanguagesSelectorWidget.Dialog.prototype.getSetupProcess = function ( data ) {
    	this.callback = data.callback;
    	this.levelFieldset.setLabel( mw.message( 'mwe-recwiz-locutor-languagelevel', data.label ).text() );
    	this.locationFieldset.setLabel( mw.message( 'mwe-recwiz-locutor-languagelocation', data.label ).text() );

		return rw.layout.LanguagesSelectorWidget.Dialog.parent.prototype.getSetupProcess.call( this, data );
    };
    rw.layout.LanguagesSelectorWidget.Dialog.prototype.getActionProcess = function ( action ) {
	    if ( action === 'save' ) {
		    var level = this.levelDropdown.getValue();
		    var location = this.locationInput.getData();
		    this.callback( { languageLevel: level, location: location } );

		    this.close();
	    }
	    else if ( action === 'cancel' ) {
		    this.close();
	    }
	    return rw.layout.LanguagesSelectorWidget.Dialog.parent.prototype.getActionProcess.call( this, action );
    };
    rw.layout.LanguagesSelectorWidget.Dialog.prototype.getBodyHeight = function () {
    	return this.content.$element.outerHeight( true );
    };

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );

