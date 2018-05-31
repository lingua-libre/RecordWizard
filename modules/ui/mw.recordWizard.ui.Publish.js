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
		var word;
		rw.ui.Step.prototype.load.call( this );

		this.$list = $( '<ul>' );

		this.recordItems = {};
		this.removeButtons = [];
		for ( word in rw.records ) {
			// Do not display words that are not in the current list
			if ( rw.metadatas.words.indexOf( word ) === -1 ) {
				continue;
			}
			if ( rw.records[ word ].getState() !== 'stashed' ) {
				continue;
			}
			this.recordItems[ word ] = this.createPlayButton( word, rw.records[ word ].getStashedFileUrl() );
			this.$list.append( this.recordItems[ word ] );
		}

		this.$container.prepend( this.$list );
		this.showNextButton();
	};

	rw.ui.Publish.prototype.createPlayButton = function ( word, audioUrl ) {
		var ui = this,
			playButton = new OO.ui.ButtonWidget( {
				framed: false,
				icon: 'play',
				title: mw.msg( 'mwe-recwiz-publish-play' ),
				label: word
			} ),
			removeButton = new OO.ui.ButtonWidget( {
				flags: [ 'primary', 'destructive' ],
				icon: 'trash',
				label: mw.msg( 'mwe-recwiz-publish-removelabel' )
			} ),
			popupButton = new OO.ui.PopupButtonWidget( {
				indicator: 'clear',
				framed: false,
				popup: {
					head: true,
					$content: $( '<p>' )
						.text( mw.msg( 'mwe-recwiz-publish-areyousure' ) )
						.append( removeButton.$element ),
					padded: true,
					position: 'after',
					align: 'center'
				},
				title: mw.msg( 'mwe-recwiz-publish-remove' )
			} );

		playButton.on( 'click', function () {
			var audio = new Audio( audioUrl );
			audio.play();
		} );

		removeButton.on( 'click', function () {
			rw.records[ word ].reset();
			rw.metadatas.statesCount.stashed--;
			ui.recordItems[ word ].remove();

			// If there is no record left, don't allow to publish
			if ( rw.metadatas.statesCount.stashed === 0 ) {
				ui.nextButton.setDisabled( true );
			}
		} );

		this.removeButtons.push( popupButton );

		return $( '<li>' ).append( playButton.$element ).append( popupButton.$element );
	};

	rw.ui.Publish.prototype.disableRemoveButtons = function () {
		var i;

		for ( i = 0; i < this.removeButtons.length; i++ ) {
			this.removeButtons[ i ].setDisabled( true );
		}
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
			this.nextButton.setDisabled( false );
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
