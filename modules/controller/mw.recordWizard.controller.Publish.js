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

	rw.controller.Publish.prototype.upload = function( word ) {
	    rw.requestQueue.push( rw.records[ word ], 'finishUpload' );
	};

	rw.controller.Publish.prototype.moveNext = function () {
		this.removeWaitingRecords();
		for( var word in rw.records ) {
		    this.upload( word );
		}
	};

	rw.controller.Publish.prototype.movePrevious = function () {
		// XXX do stuff

		rw.controller.Step.prototype.movePrevious.call( this );
	};

}( mediaWiki, mediaWiki.recordWizard, jQuery, OO ) );

