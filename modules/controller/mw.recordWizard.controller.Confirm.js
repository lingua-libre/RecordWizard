( function ( mw, rw, $, OO ) {
	/**
	 * The Confirm step.
	 *
	 * @class
	 * @extends mw.recordWizard.controller.Step
	 * @param {mw.Api} api
	 * @param {Object} config RecordWizard config object.
	 */
	rw.controller.Confirm = function( api, config ) {
		rw.controller.Step.call(
			this,
			new rw.ui.Confirm(),
			api,
			config
		);

		this.stepName = 'confirm';
	};

	OO.inheritClass( rw.controller.Confirm, rw.controller.Step );

	rw.controller.Confirm.prototype.load = function ( metadatas, records ) {
		var controller = this;

		rw.controller.Step.prototype.load.call( this, metadatas, records );

		for( var word in this.records ) {
	        this.records[ word ].on( 'state-change', this.switchState.bind( this ) );
		}

        this.ui.on( 'retry', function( word ) {
            for ( word in controller.records ) {
                if ( controller.records[ word ].hasFailed() ) {
                    controller.upload( word );
                }
            }
        } );
	};

	rw.controller.Confirm.prototype.unload = function ( metadatas, records ) {
		rw.controller.Step.prototype.unload.call( this );
		for ( word in this.records ) {
		    this.records[ word ].off( 'state-change' );
		}
	};

	rw.controller.Confirm.prototype.upload = function( word ) {
	    rw.requestQueue.push( this.records[ word ], 'finishUpload' );
	};

	rw.controller.Confirm.prototype.moveNext = function () {
		for( var word in this.records ) {
		    this.upload( word );
		}
	};

	rw.controller.Confirm.prototype.movePrevious = function () {
		// XXX do stuff

		rw.controller.Step.prototype.movePrevious.call( this );
	};

}( mediaWiki, mediaWiki.recordWizard, jQuery, OO ) );

