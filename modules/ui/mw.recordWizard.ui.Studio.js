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

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );
