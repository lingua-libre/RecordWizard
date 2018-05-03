'use strict';

/**
 *
 */
( function ( mw, rw, $ ) {

	rw.RequestQueue = function () {
		this.maxConcurentRequests = 3;
		this.queue = [];
		this.currentRequests = 0;
		this.api = new mw.Api();
	};

	rw.RequestQueue.prototype.push = function ( record, type ) {
		var deferred = $.Deferred();

		if ( record.isInQueue() ) {
			return false;
		}
		record.isInQueue( true );

		this.queue.push( { type: type, record: record, deferred: deferred } );

		if ( this.currentRequests < this.maxConcurentRequests ) {
			this.currentRequests++;
			this.next();
		}

		return deferred;
	};

	rw.RequestQueue.prototype.next = function () {
		var param;

		if ( this.queue.length > 0 ) {
			param = this.queue.shift();
			param.deferred.then( this.next.bind( this ) ).fail( this.next.bind( this ) );

			param.record[ param.type ]( this.api, param.deferred );
			param.record.isInQueue( false );
		} else {
			this.currentRequests--;
		}
	};

}( mediaWiki, mediaWiki.recordWizard, jQuery ) );
