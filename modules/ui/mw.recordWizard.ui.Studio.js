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

		// Depending of the language selected, load the AudioStudio (most of the
		// time) or the VideoStudio (for sign languages).
		if ( rw.config.languages[ rw.metadatas.language ].mediaType === rw.config.items.mediaTypeAudio ) {
			$.extend( this, rw.ui.AudioStudio.prototype, { load: rw.ui.Studio.prototype.load } );
			rw.ui.AudioStudio.prototype.load.call( this );
		} else {
			$.extend( this, rw.ui.VideoStudio.prototype, { load: rw.ui.Studio.prototype.load } );
			rw.ui.VideoStudio.prototype.load.call( this );
		}

		this.isRecording = false;
		this.generateUI();
		this.showNextButton();
		this.updateCounter();

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
		this.$studioButton.click( function () {
			console.log('buttonclick-before');
			this.emit( 'studiobutton-click' );
				console.log('buttonclickafter');
		}.bind( this ) );

		this.$list.click( function ( event ) {
			var word;
			if ( event.target.nodeName === 'LI' ) {
				word = $( event.target ).attr( 'data' );
				this.emit( 'item-click', word );
			}
			if ( event.target.nodeName === 'SPAN' ) {
				word = $( event.target ).parent().attr( 'data' );
				this.emit( 'item-click', word );
			}
		}.bind( this ) );
		$( document ).keydown( function ( event ) {
			switch ( event.which ) {
				case 32: // space
					if ( event.target.nodeName === 'INPUT' || event.target.nodeName === 'BUTTON' ) {
						return;
					}
					this.emit( 'studiobutton-click' );
					break;

				case 37: // left
					this.emit( 'previous-item-click' );
					break;

				case 39: // right
					this.emit( 'next-item-click' );
					break;

				case 46: // del
				case 8: // backspace
					this.emit( 'delete-record' );
					break;

				default: return;
			}
			event.preventDefault();
		}.bind( this ) );

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
	};

	/**
	 * Event handler called when an audio record has just ended.
	 *
	 * @private
	 */
	rw.ui.Studio.prototype.onStop = function () {
		this.$head.removeClass( 'studio-rec' );
		console.log( 'studio stop' );
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

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );
