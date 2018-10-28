'use strict';

( function ( mw, $, rw, OO ) {

	/**
	 * Represents the UI for the wizard's Studio step.
	 *
	 * @class rw.ui.Studio
	 * @extends rw.ui.Step
	 * @constructor
	 */
	rw.ui.Studio = function () {
		rw.ui.Step.call(
			this,
			'studio'
		);

		this.addPreviousButton();
		this.addNextButton();
	};

	OO.inheritClass( rw.ui.Studio, rw.ui.Step );

	/**
	 * @inheritDoc
	 */
	rw.ui.Studio.prototype.load = function () {
		var word;
		rw.ui.Step.prototype.load.call( this );

		this.isRecording = false;
		this.generateUI();
		this.showNextButton();
		this.updateCounter();
		this.amplitudeGraph = new rw.ui.AmplitudeGraph();

		for ( word in rw.records ) {
			this.setItemState( word, rw.records[ word ].getState() );
		}
	};

	/**
	 * @inheritDoc
	 */
	rw.ui.Studio.prototype.unload = function () {
		$( document ).off( 'keydown' );
		rw.ui.Step.prototype.unload.call( this );
	};

	/**
	 * Build all the needed HTML nodes and add them to the DOM.
	 */
	rw.ui.Studio.prototype.generateUI = function () {
		var i, record;

		this.$studio = $( '<div>' ).addClass( 'studio' );

		this.$studioButton = $( '<button>' ).addClass( 'studio-rbutton-inner' );
		this.$head = $( '<div>' ).addClass( 'studio-head' )
			.append( $( '<div>' ).addClass( 'studio-rbutton' ).append( this.$studioButton ) );

		this.$list = $( '<ul>' ).addClass( 'studio-wordlist' );
		this.recordItems = {};
		for ( i = 0; i < rw.metadatas.words.length; i++ ) {
			record = rw.records[ rw.metadatas.words[ i ] ];

			this.recordItems[ rw.metadatas.words[ i ] ] = $( '<li>' )
				.text( record.getTranscription() )
				.attr( 'data', rw.metadatas.words[ i ] );
			if ( record.getQualifier() !== null ) {
				this.recordItems[ rw.metadatas.words[ i ] ].append( $( '<span>' )
					.text( record.getQualifier() )
					.addClass( 'mwe-recwiz-qualifier' )
				);
			}

			this.$list.append( this.recordItems[ rw.metadatas.words[ i ] ] );
		}
		this.$studio.append( this.$head ).append( this.$list );
		this.$container.prepend( this.$studio );

		this.$recordCounter = $( '<div>' ).addClass( 'mwe-recwiz-record-count mwe-recwiz-right' ).hide();
		this.$container.append( this.$recordCounter );
	};

	/**
	 * Event handler called when an audio record has just ended.
	 *
	 * @private
	 */
	rw.ui.Studio.prototype.onReady = function () {
		var word,
			ui = this;

		this.$studioButton.click( function () {
			ui.emit( 'studiobutton-click' );
		} );

		this.$list.click( function ( event ) {
			if ( event.target.nodeName === 'LI' ) {
				word = $( event.target ).attr( 'data' );
				ui.emit( 'item-click', word );
			}
			if ( event.target.nodeName === 'SPAN' ) {
				word = $( event.target ).parent().attr( 'data' );
				ui.emit( 'item-click', word );
			}
		} );
		$( document ).keydown( function ( event ) {
			switch ( event.which ) {
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

				case 46: // del
				case 8: // backspace
					ui.emit( 'delete-record' );
					break;

				default: return;
			}
			event.preventDefault();
		} );

		this.$head.addClass( 'studio-ready' );
	};

	/**
	 * Event handler called when an audio record has just started.
	 *
	 * @private
	 * @param  {string} word textual transcription, must match an existing
	 *                       listed record object
	 */
	rw.ui.Studio.prototype.onStart = function ( word ) {
		this.$head.addClass( 'studio-rec' );
		this.recordItems[ word ].removeClass( 'mwe-recwiz-word-error' );
		this.amplitudeGraph.start();
	};

	/**
	 * Event handler called each ~100ms when a record is performed
	 *
	 * @private
	 * @param  {Float32Array} samples Sound samples of the audio recorded since
	 *                                last call
	 */
	rw.ui.Studio.prototype.onRecord = function ( samples ) {
		var i, amplitude,
			amplitudeMax = 0;
		for ( i = 0; i < samples.length; i++ ) {
			amplitude = Math.abs( samples[ i ] );
			if ( amplitude > amplitudeMax ) {
				amplitudeMax = amplitude;
			}
		}

		this.amplitudeGraph.push( amplitudeMax );
	};

	/**
	 * Event handler called when an audio record has just ended.
	 *
	 * @private
	 */
	rw.ui.Studio.prototype.onStop = function () {
		this.$head.removeClass( 'studio-rec' );
		this.amplitudeGraph.stop();
	};

	/**
	 * Event handler called when an audio record got saturated.
	 *
	 * @private
	 * @param  {string} word textual transcription, must match an existing
	 *                       listed record object
	 */
	rw.ui.Studio.prototype.onSaturate = function ( word ) {
		this.recordItems[ word ].addClass( 'mwe-recwiz-word-error' );
	};

	/**
	 * Change the selected item in the word list
	 *
	 * @param  {string} word textual transcription, must match an existing
	 *                       listed record object
	 */
	rw.ui.Studio.prototype.setSelectedItem = function ( word ) {
		$( '.studio-wordlist-selected' ).removeClass( 'studio-wordlist-selected' );
		if ( this.recordItems[ word ] !== undefined ) {
			this.recordItems[ word ].addClass( 'studio-wordlist-selected' );
		}

		this.amplitudeGraph.setContainer( this.recordItems[ word ] );

		this.$list.stop( true );
		this.$list.animate( {
			scrollTop: this.recordItems[ word ].offset().top - this.$list.offset().top + this.$list.scrollTop() - ( this.recordItems[ word ].innerHeight() - this.recordItems[ word ].height() )
		} );
	};

	/**
	 * Change the state of a specific word
	 *
	 * @param  {string} word      textual transcription, must match an existing
	 *                            listed record object
	 * @param  {string} state     new state to switch the word to
	 * @param  {string} prevState previous state of the word
	 */
	rw.ui.Studio.prototype.setItemState = function ( word, state, prevState ) {
		// TODO: use a correlation table to asociate state and HTML class
		if ( this.recordItems[ word ] !== undefined ) {
			this.recordItems[ word ].removeClass( 'mwe-recwiz-word-stashing' );
			this.recordItems[ word ].removeClass( 'mwe-recwiz-word-stashed' );
			this.recordItems[ word ].removeClass( 'mwe-recwiz-word-error' );
			this.recordItems[ word ].addClass( 'mwe-recwiz-word-' + state );
		}
		this.showNextButton();
		this.updateCounter();
	};

	/**
	 * Display the next button, with labels and actions depending of the
	 * current state.
	 */
	rw.ui.Studio.prototype.showNextButton = function () {
		var count = rw.metadatas.statesCount,
			total = count.stashed + count.stashing + count.error;

		if ( total === 0 ) {
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
			} else {
				// none ok
				this.nextButton.toggle( false );
				this.stateLabel.setLabel( mw.message( 'mwe-recwiz-allfailed' ).text() );
			}
		}

		if ( rw.metadatas.statesCount.stashing > 0 ) {
			this.stateLabel.setLabel( mw.message( 'mwe-recwiz-pendinguplads' ).text() );
		}

	};

	/**
	 * Update the upload count display on the bottom of tyhe page.
	 */
	rw.ui.Studio.prototype.updateCounter = function () {
		var count = rw.metadatas.statesCount,
			total = count.stashed + count.stashing + count.error;
		if ( total > 0 ) {
			this.$recordCounter.text( mw.message( 'mwe-recwiz-studio-uploadcount', count.stashed, total ).text() );
			this.$recordCounter.show();
		} else {
			this.$recordCounter.hide();
		}
	};

	/**
	 * Small animated vertical bar graph showing the amplitude of a sound stream.
	 *
	 * @class rw.ui.AmplitudeGraph
	 * @constructor
	 */
	rw.ui.AmplitudeGraph = function () {
		this.$container = null;
		this.amplitudes = [];
		this.nbMaxAmplitudeBars = 0;
		this.isRecording = false;
		this.$canvas = $( '<canvas>' ).addClass( 'mwe-recwiz-wordcanvas' )[ 0 ];
		this.ctx = this.$canvas.getContext( '2d' );
		this.ctx.save();
	};

	/**
	 * Start to animate the amplitude graph.
	 */
	rw.ui.AmplitudeGraph.prototype.start = function () {
		this.isRecording = true;

		requestAnimationFrame( this.draw.bind( this ) );
	};

	/**
	 * Stop the animation loop and clear the graph.
	 */
	rw.ui.AmplitudeGraph.prototype.stop = function () {
		this.isRecording = false;

		this.amplitudes = [];
		this.ctx.clearRect( 0, 0, this.$canvas.width, this.$canvas.height );
	};

	/**
	 * Main animation loop of the AmplitudeGraph
	 *
	 * @private
	 */
	rw.ui.AmplitudeGraph.prototype.draw = function () {
		var i, height;

		if ( !this.isRecording ) {
			return;
		}

		// Flip the graph if we're using a rtl language
		if ( this.$container.css( 'direction' ) === 'rtl' ) {
			this.ctx.resetTransform();
			this.ctx.transform( -1, 0, 0, 1, this.$canvas.width, 0 );
		}

		// Clear the current content of the canvas
		this.ctx.clearRect( 0, 0, this.$canvas.width, this.$canvas.height );

		// Draw the amplitude chart
		this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
		for ( i = 0; i < this.amplitudes.length; i++ ) {
			height = Math.ceil( this.amplitudes[ i ] * this.$canvas.height );
			this.ctx.fillRect( i * 5, this.$canvas.height - height, 5, height );
		}

		// Ask the browser to callback this function at its next refresh
		requestAnimationFrame( this.draw.bind( this ) );
	};

	/**
	 * Set or change the container in which the graph is displayed.
	 *
	 * @param  {JQuery} container node of the container to use
	 */
	rw.ui.AmplitudeGraph.prototype.setContainer = function ( container ) {
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

	/**
	 * Add a new value to display on the graph.
	 *
	 * @param  {number} amplitude Max amplitude mesured in the last timeframe
	 */
	rw.ui.AmplitudeGraph.prototype.push = function ( amplitude ) {
		this.amplitudes.push( amplitude );

		if ( this.amplitudes.length > this.nbMaxAmplitudeBars ) {
			this.amplitudes.shift();
		}
	};

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );
