( function ( mw, $, rw, OO ) {

	/**
	 * Represents the UI for the wizard's Confirm step.
	 *
	 * @class rw.ui.Confirm
	 * @extends rw.ui.Step
	 * @constructor
	 */
	rw.ui.Confirm = function() {
		var ui = this;

		rw.ui.Step.call(
			this,
			'confirm'
		);

		this.addPreviousButton();
		this.addNextButton();
	};

	OO.inheritClass( rw.ui.Confirm, rw.ui.Step );

	rw.ui.Confirm.prototype.load = function ( metadatas, records ) {
		rw.ui.Step.prototype.load.call( this, metadatas, records );

		this.$list = $( '<ul>' );

		this.recordItems = {};
		for( var word in this.records ) {
		    var $audio = $( '<audio>' )
		        .attr( 'src', this.records[ word ].getStashedFileUrl() )
		        .attr( 'controls', true );
		    this.recordItems[ word ] = $( '<li>' ).text( word ).prepend( $audio );
		    this.$list.append( this.recordItems[ word ] );
		}

        this.$container.prepend( this.$list );
	};

	rw.ui.Confirm.prototype.setItemState = function( word, state ) {
	    // TODO: use a correlation table to asociate state and HTML class
	    if ( state !== 'finalizing' ) {
	        $('html, body').animate( {
                scrollTop: this.recordItems[ word ].offset().top
            }, 400 );
	    }
	    this.recordItems[ word ].removeClass();
	    this.recordItems[ word ].addClass( 'mwe-recwiz-' + state );
	};

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );

