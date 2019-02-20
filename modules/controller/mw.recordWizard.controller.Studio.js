'use strict';

( function ( mw, rw, $, OO ) {
	/**
	 * The Studio step.
	 *
	 * @class rw.controller.Studio
	 * @extends mw.recordWizard.controller.Step
	 * @constructor
	 * @param {mw.Api} api     API instance to perform requests
	 * @param {Object} config  RecordWizard config object.
	 */
	rw.controller.Studio = function ( api, config ) {
		rw.controller.Step.call(
			this,
			new rw.ui.Studio(),
			api,
			config
		);

		this.stepName = 'studio';
	};

	OO.inheritClass( rw.controller.Studio, rw.controller.Step );

	/**
	 * Depending of the language selected, load the AudioStudio (most of the
	 * time) or the VideoStudio (for sign languages).
	 *
	 * @inheritDoc
	 */
	rw.controller.Studio.prototype.load = function () {
		if ( rw.config.languages[ rw.metadatas.language ].mediaType === rw.config.items.mediaTypeAudio ) {
			$.extend( this, rw.controller.AudioStudio.prototype, { load: rw.controller.Studio.prototype.load } );
			rw.controller.AudioStudio.prototype.load.call( this );
			console.log( 'loading the audio studio' );
		} else {
			$.extend( this, rw.controller.VideoStudio.prototype, { load: rw.controller.Studio.prototype.load } );
			rw.controller.VideoStudio.prototype.load.call( this );
			console.log( 'loading the video studio' );
		}
	};

}( mediaWiki, mediaWiki.recordWizard, jQuery, OO ) );
