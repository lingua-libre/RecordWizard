( function ( mw, $, rw, OO ) {

	/**
	 * Represents the UI for the wizard's Studio step.
	 *
	 * @class rw.ui.Studio
	 * @extends rw.ui.Step
	 * @constructor
	 */
	rw.ui.Studio = function() {
		rw.ui.Step.call(
			this,
			'studio'
		);

		this.addPreviousButton();
		this.addNextButton();
	};

	OO.inheritClass( rw.ui.Studio, rw.ui.Step );

	rw.ui.Studio.prototype.load = function ( metadatas, records ) {
	    var ui = this;
		rw.ui.Step.prototype.load.call( this, metadatas, records );

        this.generateUI();

        for ( word in this.records ) {
            this.setItemState( word, this.records[ word ].getState() );
        }

        this.$wordInput.keypress( function( e ) {
            if ( e.which === 13 && ui.$wordInput.val().trim() !== '' ) {
                ui.emit( 'wordinput-validate', ui.$wordInput.val().trim() );
                ui.$wordInput.val( '' );
            }
        } );
        this.showNextButton();
        this.updateCounter();
	};

	rw.ui.Studio.prototype.generateUI = function() {
	    this.$studio = $( '<div>' ).addClass( 'studio' )

        this.$studioButton = $( '<button>' ).addClass( 'studio-rbutton-inner' );
        this.$head = $( '<div>' ).addClass( 'studio-head' )
            .append( $( '<div>' ).addClass( 'studio-rbutton' ).append( this.$studioButton ) )
            .append( $( '<canvas>' ).addClass( 'studio-canvas' ).attr( 'height', '150' ) );

		this.$list = $( '<ul>' ).addClass( 'studio-wordlist' );
		this.recordItems = {};
		for( var i=0; i < this.metadatas.words.length; i++ ) {
		    this.recordItems[ this.metadatas.words[ i ] ] = $( '<li>' ).text( this.metadatas.words[ i ] );
		    this.$list.append( this.recordItems[ this.metadatas.words[ i ] ] );
		}
		this.$wordInput = $( '<input>' ).attr( 'placeholder', mw.message( 'mwe-recwiz-studio-input-placeholder' ).text() );

        this.$studio.append( this.$head ).append( this.$list.append( this.$wordInput ) );
        this.$container.prepend( this.$studio );

        this.$recordCounter = $( '<div>' ).addClass( 'mwe-recwiz-record-count' ).hide();
        this.$container.append( this.$recordCounter );
	};

	rw.ui.Studio.prototype.onReady = function() {
	    var ui = this;

        this.$studioButton.click( function() {
            ui.emit( 'studiobutton-click' );
        } );

		this.$list.click( function( event ) {
		    if ( event.target.nodeName === 'LI' ) {
		        var word = $( event.target ).text();
		        ui.emit( 'item-click', word );
		    }
		} );

        this.$head.addClass( 'studio-ready' );
	};

	rw.ui.Studio.prototype.onStart = function() {
	    this.$head.addClass( 'studio-rec' );
	};

	rw.ui.Studio.prototype.onRecord = function() {

	};

	rw.ui.Studio.prototype.onStop = function() {
	    this.$head.removeClass( 'studio-rec' );
	    this.showNextButton();
	};

	rw.ui.Studio.prototype.onCancel = function() {

	};

	rw.ui.Studio.prototype.onSaturate = function() {

	};

	rw.ui.Studio.prototype.setSelectedItem = function( word ) {
	    $( '.studio-wordlist-selected' ).removeClass( 'studio-wordlist-selected' );
	    if ( this.recordItems[ word ] !== undefined ) {
	        this.recordItems[ word ].addClass( 'studio-wordlist-selected' );
	    }
	};

	rw.ui.Studio.prototype.setItemState = function( word, state, prevState ) {
	    // TODO: use a correlation table to asociate state and HTML class
	    if ( this.recordItems[ word ] !== undefined ) {
	        this.recordItems[ word ].removeClass();
	        this.recordItems[ word ].addClass( 'mwe-recwiz-word-'+state );
	    }
	    this.showNextButton();
	};

	rw.ui.Studio.prototype.addWord = function( word ) {
        this.recordItems[ word ] = $( '<li>' ).text( word );
        this.$wordInput.before( this.recordItems[ word ] );
	};

	rw.ui.Studio.prototype.showNextButton = function() {
	    if ( Object.keys( this.records ).length === 0 ) {
	        this.nextButton.toggle( false );
			return;
	    }

        this.stateLabel.toggle( true );
        if ( this.metadatas.statesCount.stashed > 0 ) {
	        // all ok
	        this.retryButton.toggle( false );
	        this.nextButton.toggle( true );
	        this.stateLabel.setLabel( mw.message( 'mwe-recwiz-allsucceeded' ).text() );
	        this.nextButton.setLabel( mw.message( 'mwe-recwiz-continue' ).text() );
	    }
        if ( this.metadatas.statesCount.error > 0 ) {
	        this.retryButton.toggle( true );

	        if ( this.metadatas.statesCount.stashed > 0 ) {
	            // some ok
                this.stateLabel.setLabel( mw.message( 'mwe-recwiz-somefailed' ).text() );
	            this.nextButton.setLabel( mw.message( 'mwe-recwiz-continueanyway' ).text() );
	        }
	        else {
	            // none ok
	            this.nextButton.toggle( false );
                this.stateLabel.setLabel( mw.message( 'mwe-recwiz-allfailed' ).text() );
	        }
	    }

	    if ( this.metadatas.statesCount.uploading > 0 ) {
	        this.stateLabel.setLabel( mw.message( 'mwe-recwiz-pendinguplads' ).text() );
	    }

	};

	rw.ui.Studio.prototype.updateCounter = function() {
	    var count = this.metadatas.statesCount;
	    var total = count.stashed + count.uploading + count.error;
        if ( total > 0 ) {
	        this.$recordCounter.text( mw.message( 'mwe-recwiz-upload-count', count.stashed, total ).text() );
	        this.$recordCounter.show();
	    }
	};

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );

