( function ( mw, $, rw, OO ) {

	/**
	 * Represents the UI for the wizard's Confirm step.
	 *
	 * @class rw.ui.Publish
	 * @extends rw.ui.Step
	 * @constructor
	 */
	rw.ui.Publish = function() {
		var ui = this;

		rw.ui.Step.call(
			this,
			'publish'
		);

		this.addPreviousButton();
		this.addNextButton();
	};

	OO.inheritClass( rw.ui.Publish, rw.ui.Step );

	rw.ui.Publish.prototype.load = function ( metadatas, records ) {
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

	rw.ui.Publish.prototype.setItemState = function( word, state ) {
	    // TODO: use a correlation table to asociate state and HTML class
	    if ( state !== 'finalizing' ) {
	        $('html, body').animate( {
                scrollTop: this.recordItems[ word ].offset().top - 50
            }, 400 );
	    }
	    this.recordItems[ word ].removeClass();
	    this.recordItems[ word ].addClass( 'mwe-recwiz-' + state );
	    this.showNextButton();
	};

	rw.ui.Publish.prototype.showNextButton = function() {
        console.log( this.metadatas.statesCount );
	    if ( this.metadatas.statesCount.finalizing > 0 ) {
	        this.previousButton.setDisabled( true );
	        this.retryButton.toggle( false );
            this.nextButton.setDisabled( true );
            this.stateLabel.toggle( true );
	        this.stateLabel.setLabel( mw.message( 'mwe-recwiz-pendinguplads' ).text() );
	    }
        else if ( this.metadatas.statesCount.error > 0 ) {
	        this.retryButton.toggle( true );

	        if ( this.metadatas.statesCount.uploaded > 0 ) {
                this.stateLabel.setLabel( mw.message( 'mwe-recwiz-somefailed' ).text() );
	        }
	        else {
                this.stateLabel.setLabel( mw.message( 'mwe-recwiz-allfailed' ).text() );
	        }
	    }
        else if ( this.metadatas.statesCount.stashed > 0 ) {
	        this.stateLabel.setLabel( mw.message( 'mwe-recwiz-allsucceeded' ).text() );
	    }
	    else {
            this.nextButton.setDisabled( false );
            this.stateLabel.toggle( false );
	    }

	};

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );

