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

	rw.ui.Studio.prototype.load = function () {
	    var ui = this;
		rw.ui.Step.prototype.load.call( this );

	    this.isRecording = false;
        this.generateUI();
        this.showNextButton();
        this.updateCounter();
        this.amplitudeGraph = new rw.ui.AmplitudeGraph();

        for ( word in rw.records ) {
            this.setItemState( word, rw.records[ word ].getState() );
        }

        this.$wordInput.keypress( function( e ) {
            if ( e.which === 13 && ui.$wordInput.val().trim() !== '' ) {
                ui.emit( 'wordinput-validate', ui.$wordInput.val().trim() );
                ui.$wordInput.val( '' );
            }
        } );
	};

	rw.ui.Studio.prototype.unload = function() {
	    $( document ).off( 'keydown' );
	    rw.ui.Step.prototype.unload.call( this );
	};

	rw.ui.Studio.prototype.generateUI = function() {
	    this.$studio = $( '<div>' ).addClass( 'studio' )

        this.$studioButton = $( '<button>' ).addClass( 'studio-rbutton-inner' );
        this.$head = $( '<div>' ).addClass( 'studio-head' )
            .append( $( '<div>' ).addClass( 'studio-rbutton' ).append( this.$studioButton ) );

		this.$list = $( '<ul>' ).addClass( 'studio-wordlist' );
		this.recordItems = {};
		for( var i=0; i < rw.metadatas.words.length; i++ ) {
		    this.recordItems[ rw.metadatas.words[ i ] ] = $( '<li>' ).text( rw.metadatas.words[ i ] );
		    this.$list.append( this.recordItems[ rw.metadatas.words[ i ] ] );
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
        $( document ).keydown( function( event ) {
            switch( event.which ) {
                case 32: // space
                    if ( event.target.nodeName === 'INPUT' || event.target.nodeName === 'BUTTON' ) {
                        return;
                    }
                    ui.emit( 'studiobutton-click' );
                    break;

                case 37: // left
                    ui.emit( 'previous-item-click' );
                    break;

                case 39: // right
                    ui.emit( 'next-item-click' );
                    break;

                default: return;
            }
            event.preventDefault();
        } );

        this.$head.addClass( 'studio-ready' );
	};

	rw.ui.Studio.prototype.onStart = function() {
	    this.$head.addClass( 'studio-rec' );
	    this.amplitudeGraph.start();
	};

	rw.ui.Studio.prototype.onRecord = function( samples ) {
        var amplitudeMax = 0;
        for ( var i=0; i < samples.length; i++ ) {
            var amplitude = Math.abs( samples[ i ] );
            if ( amplitude > amplitudeMax ) {
                amplitudeMax = amplitude;
            }
        }

        this.amplitudeGraph.push( amplitudeMax );
    };

	rw.ui.Studio.prototype.onStop = function() {
	    this.$head.removeClass( 'studio-rec' );
	    this.amplitudeGraph.stop();
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

        this.amplitudeGraph.setContainer( this.recordItems[ word ] );

		this.$list.stop( true );
		this.$list.animate( {
		    scrollTop: this.recordItems[ word ].offset().top - this.$list.offset().top + this.$list.scrollTop() - ( this.recordItems[ word ].innerHeight() - this.recordItems[ word ].height() )
		} ) ;
	};

	rw.ui.Studio.prototype.setItemState = function( word, state, prevState ) {
	    // TODO: use a correlation table to asociate state and HTML class
	    if ( this.recordItems[ word ] !== undefined ) {
	        this.recordItems[ word ].removeClass( 'mwe-recwiz-word-stashing' );
	        this.recordItems[ word ].removeClass( 'mwe-recwiz-word-stashed' );
	        this.recordItems[ word ].removeClass( 'mwe-recwiz-word-error' );
	        this.recordItems[ word ].addClass( 'mwe-recwiz-word-'+state );
	    }
	    this.showNextButton();
	    this.updateCounter()
	};

	rw.ui.Studio.prototype.addWord = function( word ) {
        this.recordItems[ word ] = $( '<li>' ).text( word );
        this.$wordInput.before( this.recordItems[ word ] );
	};

	rw.ui.Studio.prototype.showNextButton = function() {
	    console.log( rw.metadatas.statesCount );
	    if ( Object.keys( rw.records ).length === 0 ) {
	        this.nextButton.toggle( false );
	        this.stateLabel.toggle( false );
	        this.retryButton.toggle( false );
			return;
	    }

        this.stateLabel.toggle( true );
        if ( rw.metadatas.statesCount.stashed > 0 ) {
	        // all ok
	        this.retryButton.toggle( false );
	        this.nextButton.toggle( true );
	        this.stateLabel.setLabel( mw.message( 'mwe-recwiz-allsucceeded' ).text() );
	        this.nextButton.setLabel( mw.message( 'mwe-recwiz-continue' ).text() );
	    }
        if ( rw.metadatas.statesCount.error > 0 ) {
	        this.retryButton.toggle( true );

	        if ( rw.metadatas.statesCount.stashed > 0 ) {
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

	    if ( rw.metadatas.statesCount.stashing > 0 ) {
	        this.stateLabel.setLabel( mw.message( 'mwe-recwiz-pendinguplads' ).text() );
	    }

	};

	rw.ui.Studio.prototype.updateCounter = function() {
	    var count = rw.metadatas.statesCount;
	    var total = count.stashed + count.stashing + count.error;
        if ( total > 0 ) {
	        this.$recordCounter.text( mw.message( 'mwe-recwiz-upload-count', count.stashed, total ).text() );
	        this.$recordCounter.show();
	    }
	};





    rw.ui.AmplitudeGraph = function() {
        this.$container = null;
        this.amplitudes = [];
        this.nbMaxAmplitudeBars = 0;
	    this.isRecording = false;
        this.$canvas = $( '<canvas>' ).addClass( 'mwe-recwiz-wordcanvas' )[ 0 ];
        this.ctx = this.$canvas.getContext('2d');
        this.ctx.save();
	};

    rw.ui.AmplitudeGraph.prototype.stop = function() {
	    this.isRecording = false;

	    this.amplitudes = [];
        this.ctx.clearRect( 0, 0, this.$canvas.width, this.$canvas.height );
    };

    rw.ui.AmplitudeGraph.prototype.start = function() {
	    this.isRecording = true;

        requestAnimationFrame( this.draw.bind( this ) );
    };

    rw.ui.AmplitudeGraph.prototype.draw = function() {
        if ( ! this.isRecording ) {
            return;
        }

        // Flip the graph if we're using a rtl language
        if ( this.$container.css( 'direction' ) === 'rtl' ) {
            this.ctx.resetTransform();
            this.ctx.transform(-1, 0, 0, 1, this.$canvas.width, 0);
        }

        // Clear the current content of the canvas
        this.ctx.clearRect(0, 0, this.$canvas.width, this.$canvas.height);

        // Draw the amplitude chart
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        for (var i = 0; i < this.amplitudes.length; i++){
            var height = Math.ceil( this.amplitudes[ i ] * this.$canvas.height )
            this.ctx.fillRect(i * 5, this.$canvas.height - height, 5, height );
	    }

        // Ask the browser to callback this function at its next refresh
        requestAnimationFrame( this.draw.bind( this ) );
    };

    rw.ui.AmplitudeGraph.prototype.setContainer = function( container ) {
	    this.amplitudes = [];
        this.ctx.clearRect( 0, 0, this.$canvas.width, this.$canvas.height );

        this.$container = container;

        this.$canvas.width = this.$container.outerWidth();
        this.$canvas.height = this.$container.outerHeight();
        this.$container.prepend( this.$canvas );
        this.nbMaxAmplitudeBars = Math.floor( this.$canvas.width / 5 );

	    this.amplitudes = [];
        this.ctx.clearRect( 0, 0, this.$canvas.width, this.$canvas.height );
    };

    rw.ui.AmplitudeGraph.prototype.push = function( amplitude ) {
        this.amplitudes.push( amplitude );

        if ( this.amplitudes.length > this.nbMaxAmplitudeBars ) {
            this.amplitudes.shift();
        }
    };


}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );

