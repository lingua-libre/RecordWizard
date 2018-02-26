( function ( mw, $, rw, OO ) {

	rw.layout.DropdownLayout = function( config ) {
	    var layout = this;

	    this.label = config.label;
	    if ( config.label !== undefined ) {
	        delete config.label;
	    }

		this.$header = new OO.ui.ButtonWidget( {
	        framed: false,
	        flags: [
		        'progressive'
	        ],
	        icon: 'expand',
	        label: this.label
        } );

		this.$fieldset = new OO.ui.FieldsetLayout( config );
        this.$header.on( 'click', function( event ) {
            console.log( this );
            if ( layout.$fieldset.$element.hasClass( 'mw-collapsed' ) ) {
                layout.$header.setIcon( 'expand' );
            }
            else {
                layout.$header.setIcon( 'next' );
            }
        } );
        this.$fieldset.$element.makeCollapsible( { $customTogglers: this.$header.$button, plainMode: true } );

	    this.$element = $( '<div>' ).append( this.$header.$element ).append( this.$fieldset.$element );

	};

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );

