'use strict';

( function ( mw, $, rw, OO ) {

	/**
	 * Represents the UI for the wizard's Confirm step.
	 *
	 * @class rw.ui.Publish
	 * @extends rw.ui.Step
	 * @constructor
	 */
	rw.ui.Publish = function () {
		rw.ui.Step.call(
			this,
			'publish'
		);

		this.addPreviousButton();
		this.addNextButton();
	};

	OO.inheritClass( rw.ui.Publish, rw.ui.Step );

	/**
	 * @inheritDoc
	 */
	rw.ui.Publish.prototype.load = function () {
		var word, $audio;
		rw.ui.Step.prototype.load.call( this );

		this.$list = $( '<ul>' );

		this.recordItems = {};
		for ( word in rw.records ) {
			// Do not display words that are not in the current list
			if ( rw.metadatas.words.indexOf( word ) === -1 ) {
				continue;
			}
			if ( rw.records[ word ].getState() !== 'stashed' ) {
				continue;
			}
			$audio = this.createPlayButton( word, rw.records[ word ].getStashedFileUrl() );
			this.recordItems[ word ] = $( '<li>' ).append( $audio );
			this.$list.append( this.recordItems[ word ] );
		}

		this.$container.prepend( this.$list );
		this.showNextButton();
	};

	rw.ui.Publish.prototype.createPlayButton = function ( text, audioUrl ) {
		var button = new OO.ui.ButtonWidget( {
			framed: false,
			icon: 'play',
			title: 'play',
			label: text
		} );
		button.on( 'click', function () {
			var audio = new Audio( audioUrl );
			audio.play();
		} );

		return button.$element;
	};

	rw.ui.Publish.prototype.setItemState = function ( word, state ) {
		// TODO: use a correlation table to asociate state and HTML class
		if ( [ 'done', 'error' ].indexOf( state ) > -1 ) {
			$( 'html, body' ).stop( true );
			$( 'html, body' ).animate( {
				scrollTop: this.recordItems[ word ].offset().top - 50
			} );
		}
		this.recordItems[ word ].removeClass();
		this.recordItems[ word ].addClass( 'mwe-recwiz-' + state );
		this.showNextButton();
	};

	rw.ui.Publish.prototype.showNextButton = function () {
		if ( rw.metadatas.statesCount.uploading + rw.metadatas.statesCount.uploaded + rw.metadatas.statesCount.finalizing > 0 ) {
			// Some uploads are pending
			this.previousButton.setDisabled( true );
			this.retryButton.toggle( false );
			this.nextButton.setDisabled( true );
			this.stateLabel.toggle( true );
			this.stateLabel.setLabel( mw.message( 'mwe-recwiz-pendinguplads' ).text() );
		} else if ( rw.metadatas.statesCount.error > 0 ) {
			// All uploads are finished, but some has failed
			this.retryButton.toggle( true );

			if ( rw.metadatas.statesCount.done > 0 ) {
				this.stateLabel.setLabel( mw.message( 'mwe-recwiz-somefailed' ).text() );
			} else {
				this.stateLabel.setLabel( mw.message( 'mwe-recwiz-allfailed' ).text() );
			}
		} else if ( rw.metadatas.statesCount.stashed > 0 ) {
			// At the begigging, before the publish button has been ever clicked
			this.previousButton.setDisabled( false );
			this.nextButton.setLabel( mw.message( 'mwe-recwiz-publish' ).text() );
		} else {
			// At the end, all upload has succeded
			this.nextButton.setDisabled( false );
			this.stateLabel.toggle( false );
			this.nextButton.setLabel( mw.message( 'mwe-recwiz-restart' ).text() );
			this.stateLabel.setLabel( mw.message( 'mwe-recwiz-allsucceeded' ).text() );
		}

	};

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );
