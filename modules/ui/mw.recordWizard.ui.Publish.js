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
		var i, word;
		rw.ui.Step.prototype.load.call( this );

		this.recordItems = {};
		this.currentWord = null;

		// Create the media player
		this.previousMediaButton = new OO.ui.ButtonWidget( { icon: 'previous', framed: false } );
		this.nextMediaButton = new OO.ui.ButtonWidget( { icon: 'next', framed: false } );
		this.$audioPlayer = $( '<audio controls="" preload="auto">' ).hide();
		this.$videoPlayer = $( '<video controls="" preload="auto" height="400"></video>' ).hide();
		this.$placeholder = $( '<i>' ).text( mw.message( 'mwe-recwiz-publish-nomedia' ).text() );
		this.$wordLabel = $( '<h4>' );
		this.removeButton = new OO.ui.ButtonWidget( {
			flags: [ 'primary', 'destructive' ],
			icon: 'trash',
			label: mw.msg( 'mwe-recwiz-publish-removelabel' )
		} );
		this.popupButton = new OO.ui.PopupButtonWidget( {
			indicator: 'clear',
			framed: false,
			popup: {
				head: true,
				$content: $( '<p>' )
					.text( mw.msg( 'mwe-recwiz-publish-areyousure' ) )
					.append( this.removeButton.$element ),
				padded: true,
				position: 'below',
				align: 'forwards'
			},
			title: mw.msg( 'mwe-recwiz-publish-remove' ),
			classes: [ 'mwe-recwiz-publish-removewidget' ]
		} );
		this.$centralElement = $( '<div>' ).append( this.$audioPlayer, this.$videoPlayer, $( '<div>' ).append( this.$wordLabel, this.popupButton.$element ) ).hide();
		this.$mediaPlayer = $( '<div>' )
			.addClass( 'mwe-recwiz-mediaplayer' )
			.append( this.previousMediaButton.$element, this.$placeholder, this.$centralElement, this.nextMediaButton.$element );

		// Fill the record list
		this.$list = $( '<ul>' );
		for ( i = 0; i < rw.metadatas.words.length; i++ ) {
			word = rw.metadatas.words[ i ];

			// Ignore words that have not been recorded
			if ( rw.records[ word ].getState() !== 'stashed' ) {
				continue;
			}
			this.recordItems[ word ] = this.createPlayButton( word );
			this.$list.append( this.recordItems[ word ] );

			// Load the first record into the media player
			if ( this.currentWord === null ) {
				this.switchRecord( word );
			}
		}
		this.listPanel = new OO.ui.PanelLayout( {
			expanded: false,
			framed: true,
			padded: true,
			scrollable: true,
			$content: this.$list,
			classes: [ 'mwe-recwiz-publish-listpanel' ]
		} );

		// Add everything into the view
		this.$container.prepend( this.$mediaPlayer, this.listPanel.$element );

		// Create a custom button to be redirected on Commons at the end
		this.commonsFileListButton = new OO.ui.ButtonWidget( {
			label: mw.msg( 'mwe-recwiz-publish-commonsfilelist' ),
			framed: false,
			flags: [ 'progressive' ],
			icon: 'logoWikimediaCommons',
			href: 'https://commons.wikimedia.org/wiki/Special:ListFiles/' + mw.config.get( 'wgUserName' ),
			target: '_blank'
		} );
		this.commonsFileListButton.$element.insertBefore( this.nextButton.$element );

		// Manage events
		this.removeButton.on( 'click', this.removeRecord.bind( this ) );

		this.showNextButton();
	};

	/**
	 * @inheritDoc
	 */
	rw.ui.Publish.prototype.unload = function () {
		rw.ui.Step.prototype.unload.call( this );
		this.commonsFileListButton.$element.detach();
	};

	rw.ui.Publish.prototype.createPlayButton = function ( word ) {
		var playButton = new OO.ui.ButtonWidget( {
			framed: false,
			icon: 'play',
			title: mw.msg( 'mwe-recwiz-publish-play' ),
			label: word
		} );

		playButton.on( 'click', this.switchRecord.bind( this, word ) );

		return $( '<li>' ).append( playButton.$element );
	};

	// Called when the publish process starts
	// aka when the user click on the "Publish" button
	rw.ui.Publish.prototype.onPublish = function () {
		this.removeButton.setDisabled( true );
	};

	rw.ui.Publish.prototype.switchRecord = function ( word ) {
		var i, tmpWord;

		this.currentWord = word;
		this.$wordLabel.text( word );

		this.$placeholder.hide();
		this.$centralElement.show();
		if ( rw.records[ word ].isVideo() === true ) {
			this.$audioPlayer.hide();
			this.$audioPlayer[ 0 ].pause();

			this.$videoPlayer.attr( 'src', rw.records[ word ].getMediaUrl() );
			this.$videoPlayer.show();
			this.$videoPlayer[ 0 ].play();
		} else {
			this.$videoPlayer.hide();
			this.$videoPlayer[ 0 ].pause();

			this.$audioPlayer.attr( 'src', rw.records[ word ].getMediaUrl() );
			this.$audioPlayer.show();
			this.$audioPlayer[ 0 ].play();
		}

		// Configure the previous media button
		this.previousMediaButton.off( 'click' );
		this.previousMediaButton.setDisabled( true );
		for ( i = rw.metadatas.words.indexOf( word ) - 1; i >= 0; i-- ) {
			tmpWord = rw.metadatas.words[ i ];

			if ( [ 'up', 'ready', 'stashing' ].indexOf( rw.records[ tmpWord ].getState() ) === -1 ) {
				this.previousMediaButton.on( 'click', this.switchRecord.bind( this, tmpWord ) );
				this.previousMediaButton.setDisabled( false );
				break;
			}
		}

		// Configure the next media button
		this.nextMediaButton.off( 'click' );
		this.nextMediaButton.setDisabled( true );
		for ( i = rw.metadatas.words.indexOf( word ) + 1; i < rw.metadatas.words.length; i++ ) {
			tmpWord = rw.metadatas.words[ i ];

			if ( [ 'up', 'ready', 'stashing' ].indexOf( rw.records[ tmpWord ].getState() ) === -1 ) {
				this.nextMediaButton.on( 'click', this.switchRecord.bind( this, tmpWord ) );
				this.nextMediaButton.setDisabled( false );
				break;
			}
		}
	};

	rw.ui.Publish.prototype.removeRecord = function () {
		rw.records[ this.currentWord ].reset();
		rw.metadatas.statesCount.stashed--;
		this.recordItems[ this.currentWord ].remove();
		this.currentWord = null;

		// If there is no record left, don't allow to publish
		if ( rw.metadatas.statesCount.stashed === 0 ) {
			this.nextButton.setDisabled( true );
		}

		this.$centralElement.hide();
		this.$placeholder.show();
		this.previousMediaButton.setDisabled( true );
		this.nextMediaButton.setDisabled( true );
	};

	rw.ui.Publish.prototype.setItemState = function ( word, state ) {
		if ( !( word in this.recordItems ) ) {
			return;
		}
		// TODO: use a correlation table to asociate state and HTML class
		if ( [ 'done', 'error' ].indexOf( state ) > -1 ) {
			this.listPanel.$element.stop( true );
			this.listPanel.$element.animate( {
				scrollTop: this.listPanel.$element.scrollTop() + this.recordItems[ word ].position().top
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
			this.nextButton.setIcon( 'upload' );

			this.commonsFileListButton.toggle( false );
		} else {
			// At the end, all upload has succeded
			this.nextButton.setDisabled( false );
			this.nextButton.setLabel( mw.message( 'mwe-recwiz-restart' ).text() );
			this.nextButton.setIcon();
			this.stateLabel.toggle( false );

			this.commonsFileListButton.toggle( true );
		}

	};

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );
