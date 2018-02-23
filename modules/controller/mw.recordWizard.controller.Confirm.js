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

        this.ui.on( 'retry', function( word ) {
            for ( word in controller.records ) {
                if ( controller.records[ word ].hasFailed() ) {
                    controller.upload( word );
                }
            }
        } );
	};

	rw.controller.Confirm.prototype.upload = function( word ) {
		var controller = this;

        this.switchState( word, 'finalizing' );
	    rw.requestQueue.push( this.records[ word ], 'finishUpload' )
        .then( function() {
            controller.switchState( word, 'uploaded' );
            if ( rw.requestQueue.currentRequests === 0 ) {
                if ( controller.metadatas.statesCount.error === 0 ) {
	                rw.controller.Step.prototype.moveNext.call( controller );
	            }
            }
        } )
        .fail( function() {
            controller.switchState( word, 'error' );
        } );
	};

    rw.controller.Confirm.prototype.switchState = function( word, state ) {
        if ( state !== 'finalizing' ) {
            this.metadatas.statesCount.finalizing--;
        }
        else {
            if( this.records[ word ] !== undefined ) {
                this.metadatas.statesCount[ this.records[ word ].getState() ]--;
            }
        }
        this.metadatas.statesCount[ state ]++;
        this.ui.setItemState( word, state );
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

