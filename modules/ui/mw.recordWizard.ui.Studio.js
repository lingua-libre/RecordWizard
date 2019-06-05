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
	 * Depending of the language selected, load the AudioStudio (most of the
	 * time) or the VideoStudio (for sign languages).
	 *
	 * @inheritDoc
	 */
	rw.ui.Studio.prototype.load = function () {
		if ( rw.config.languages[ rw.metadatas.language ].mediaType === rw.config.items.mediaTypeAudio ) {
			$.extend( this, rw.ui.AudioStudio.prototype, { load: rw.ui.Studio.prototype.load } );
			rw.ui.AudioStudio.prototype.load.call( this );
		} else {
			$.extend( this, rw.ui.VideoStudio.prototype, { load: rw.ui.Studio.prototype.load } );
			rw.ui.VideoStudio.prototype.load.call( this );
		}
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
