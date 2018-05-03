'use strict';

( function ( mw, rw, $ ) {

	/**
	 * Manage API requests, temporize them in a first-in-first-out pattern.
	 *
	 * @class rw.RequestQueue
	 * @constructor
	 */
	rw.RequestQueue = function () {
		this.maxConcurentRequests = 3;
		this.queue = [];
		this.currentRequests = 0;
		this.api = new mw.Api();
	};

	/**
	 * Add a request to the queue.
	 *
	 * If some slots are available, start directly the request.
	 *
	 * @param  {rw.Record} record  Context object to request on
	 * @param  {string} type       Method name to call on the given object
	 * @return {$.Deferred}        A promise, resolved when we're done
	 */
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

	/**
	 * Start the next request in the queue.
	 *
	 * @private
	 */
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
