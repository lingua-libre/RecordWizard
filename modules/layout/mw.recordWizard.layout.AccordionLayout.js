( function ( mw, $, rw, OO ) {

	rw.layout.AccordionLayout = function( config ) {
	    var classes = config.classes || []
	    classes.push( 'mwe-recwiz-accordionLayout' );
	    OO.ui.Widget.call( this, { classes: classes } );

        this.dropdowns = [];
        if ( config.items !== undefined ) {
	        this.addDropdowns( config.items );
	    }


	};

	OO.inheritClass( rw.layout.AccordionLayout, OO.ui.Widget );

    rw.layout.AccordionLayout.prototype.addDropdowns = function( dropdowns ) {
        if( ! Array.isArray( dropdowns ) ) {
            dropdowns = [ dropdowns ];
        }

        for ( var i=0; i < dropdowns.length; i++ ) {
            this.dropdowns.push( dropdowns[ i ] );
            this.$element.append( dropdowns[ i ].$element );
            dropdowns[ i ].on( 'expand', this.onExpand.bind( this ) );
        }
    };

    rw.layout.AccordionLayout.prototype.onExpand = function( dropdown ) {
        for ( var i=0; i < this.dropdowns.length; i++ ) {
            if ( this.dropdowns[ i ] !== dropdown ) {
                this.dropdowns[ i ].collapse();
            }
        }
    };

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );

