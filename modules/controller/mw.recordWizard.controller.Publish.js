( function ( mw, rw, $, OO ) {
	/**
	 * The Confirm step.
	 *
	 * @class
	 * @extends mw.recordWizard.controller.Step
	 * @param {mw.Api} api
	 * @param {Object} config RecordWizard config object.
	 */
	rw.controller.Publish = function( api, config ) {
		rw.controller.Step.call(
			this,
			new rw.ui.Publish(),
			api,
			config
		);

		this.stepName = 'publish';
	};

	OO.inheritClass( rw.controller.Publish, rw.controller.Step );

	rw.controller.Publish.prototype.load = function () {
		var controller = this;

		rw.controller.Step.prototype.load.call( this );

		for( var word in rw.records ) {
	        rw.records[ word ].on( 'state-change', this.switchState.bind( this ) );
		}

        this.ui.on( 'retry-click', function( word ) {
            for ( word in rw.records ) {
                if ( rw.records[ word ].hasFailed() ) {
                    controller.upload( word );
                }
            }
        } );
	};

	rw.controller.Publish.prototype.unload = function () {
		this.ui.off( 'retry-click' );
		for ( word in rw.records ) {
		    rw.records[ word ].off( 'state-change' );
		}

		rw.controller.Step.prototype.unload.call( this );
	};

	rw.controller.Publish.prototype.moveNext = function () {
		if ( rw.metadatas.statesCount.stashed === 0 ) {
			delete rw.metadatas.words;
			delete rw.metadatas.statesCount;
			rw.records = {};
			return rw.controller.Step.prototype.moveNext.call( this );
		}

		this.removeWaitingRecords();
		for( var word in rw.records ) {
			this.makeRequests( word );
		}
	};

	rw.controller.Publish.prototype.makeRequests = function( word ) {
		var process = new OO.ui.Process();

		process.next( this.upload.bind( this, word ) ) //upload file to commons
		process.next( this.saveWbItem.bind( this, word ) ) //save the formed item
		process.next( console.log.bind( this, 'Done :)' ) ); //TODO: do something cool

		process.execute();
	};

	rw.controller.Publish.prototype.upload = function( word ) {
		return rw.requestQueue.push( rw.records[ word ], 'finishUpload' );
	};

	rw.controller.Publish.prototype.saveWbItem = function( word ) {
		return rw.records[ word ].saveWbItem( this.api );
	};

}( mediaWiki, mediaWiki.recordWizard, jQuery, OO ) );

