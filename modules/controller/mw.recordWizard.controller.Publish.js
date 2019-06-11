'use strict';

( function ( mw, rw, $, OO ) {
	/**
	 * The Confirm step.
	 *
	 * @class rw.controller.Publish
	 * @extends mw.recordWizard.controller.Step
	 * @constructor
	 * @param {mw.Api} api     API instance to perform requests
	 * @param {Object} config  RecordWizard config object.
	 */
	rw.controller.Publish = function ( api, config ) {
		rw.controller.Step.call(
			this,
			new rw.ui.Publish(),
			api,
			config
		);

		this.stepName = 'publish';
	};

	OO.inheritClass( rw.controller.Publish, rw.controller.Step );

	/**
	 * @inheritDoc
	 */
	rw.controller.Publish.prototype.load = function () {
		var word,
			controller = this;

		rw.controller.Step.prototype.load.call( this );

		for ( word in rw.records ) {
			rw.records[ word ].on( 'state-change', this.switchState.bind( this ) );
		}

		this.ui.on( 'retry-click', this.moveNext.bind( this ) );
	};

	/**
	 * @inheritDoc
	 */
	rw.controller.Publish.prototype.unload = function () {
		var word;

		this.ui.off( 'retry-click' );
		for ( word in rw.records ) {
			rw.records[ word ].off( 'state-change' );
		}

		rw.controller.Step.prototype.unload.call( this );
	};

	/**
	 * @inheritDoc
	 */
	rw.controller.Publish.prototype.moveNext = function () {
		var word, process;

		// Cleanup and restart the process when
		if ( rw.metadatas.statesCount.stashed + rw.metadatas.statesCount.error === 0 ) {
			delete rw.metadatas.words;
			delete rw.metadatas.statesCount;
			rw.records = {};
			return rw.controller.Step.prototype.moveNext.call( this );
		}

		this.removeWaitingRecords();
		this.ui.onPublish();
		for ( word in rw.records ) {
			// Only start publishing the records that are not already published
			if ( [ 'stashed', 'error' ].indexOf( rw.records[ word ].getState() ) === -1 ) {
				continue;
			}
			// Only start publishing the records that are in the current list
			if ( rw.metadatas.words.indexOf( word ) === -1 ) {
				rw.metadatas.statesCount.stashed--;
				continue;
			}

			// Make requests
			process = new OO.ui.Process();

			process.next( this.upload.bind( this, word ) ); // upload file to commons
			process.next( this.saveWbItem.bind( this, word ) ); // save the formed item
			// TODO: do something cool once it's done --> process.next(  );

			process.execute();
		}
	};

	/**
	 * @inheritDoc
	 */
	rw.controller.Publish.prototype.upload = function ( word ) {
		return rw.requestQueue.push( rw.records[ word ], 'finishUpload' );
	};

	rw.controller.Publish.prototype.saveWbItem = function ( word ) {
		return rw.records[ word ].saveWbItem( this.api );
	};

}( mediaWiki, mediaWiki.recordWizard, jQuery, OO ) );
