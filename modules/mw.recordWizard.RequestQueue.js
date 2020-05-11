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
		this.api = new mw.Api( {
			ajax: {
				timeout: 18000
			}
		} );
	};

	/**
	 * Add a request to the queue.
	 *
	 * If some slots are available, start directly the request.
	 *
	 * @param  {Function} callback Method to execute
	 * @return {$.Deferred}        A promise, resolved when we're done
	 */
	rw.RequestQueue.prototype.push = function ( callback ) {
		var deferred = $.Deferred();

		this.queue.push( {
			deferred: deferred,
			callback: callback
		} );

		if ( this.currentRequests < this.maxConcurentRequests ) {
			this.currentRequests++;
			this.next();
		}

		return deferred.promise();
	};

	/**
	 * Add a request to the queue, but put it on the top of it
	 *
	 * @param  {Function} callback Method to execute
	 * @return {$.Deferred}        A promise, resolved when we're done
	 */
	rw.RequestQueue.prototype.force = function ( callback ) {
		var deferred = $.Deferred();

		this.queue.unshift( {
			deferred: deferred,
			callback: callback
		} );

		if ( this.currentRequests < this.maxConcurentRequests ) {
			this.currentRequests++;
			this.next();
		}

		return deferred.promise();
	};

	/**
	 * Start the next request in the queue.
	 *
	 * @private
	 */
	rw.RequestQueue.prototype.next = function () {
		var param, value;

		if ( this.queue.length > 0 ) {
			param = this.queue.shift();
			value = param.callback();

			value.then(
				param.deferred.resolve.bind( param.deferred ),
				param.deferred.reject.bind( param.deferred )
			);
			value.then(
				this.next.bind( this ),
				this.next.bind( this )
			);
			value.then(
				console.log.bind( console, '[RequestQueue] Resolve' ),
				console.log.bind( console, '[RequestQueue] Reject' )
			);
		} else {
			this.currentRequests--;
		}
	};

	/**
	 * Remove every pending request from the queue
	 *
	 * @private
	 */
	rw.RequestQueue.prototype.clearQueue = function () {
		this.queue.length = 0;
	};

}( mediaWiki, mediaWiki.recordWizard, jQuery ) );
