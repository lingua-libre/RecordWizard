( function ( mw, $, rw, OO ) {

	rw.layout.LicenseSelectorWidget = function( config ) {
	    config = config || {};
	    config.classes = config.classes || []
	    config.classes.push( 'mwe-recwiz-licenseSelectorWidget' );

	    OO.ui.Widget.call( this, config );

		this.description = $( '<div>' );

        this.options = [];
        this.buildOptions( config.licenses );

		this.dropdown = new OO.ui.DropdownInputWidget( {
			options: this.options,
			dropdown: {
				$overlay: $( 'body' ),
				icon: 'logoCC',
			},
		} );

		this.$element.append( this.description ).append( this.dropdown.$element );
	};

	OO.inheritClass( rw.layout.LicenseSelectorWidget, OO.ui.Widget );

	rw.layout.LicenseSelectorWidget.prototype.buildOptions = function( node ) {
		if ( node.template !== undefined ) {
			node = [ node ];
		}
		if ( Array.isArray( node ) ) {
			for ( var i=0; i < node.length; i++ ) {
				this.options.push( { label: node[ i ].text, data: node[ i ].template } );
			}
		}
		else {
			for ( key in node ) {
				this.buildOptions( node[ key ] );
			}
		}
	};

	rw.layout.LicenseSelectorWidget.prototype.setDescription = function( description ) {
		this.description.text( description );
	};

	rw.layout.LicenseSelectorWidget.prototype.setValue = function( value ) {
		this.dropdown.setValue( value );
	};

	rw.layout.LicenseSelectorWidget.prototype.getValue = function() {
		return this.dropdown.getValue();
	};

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );

