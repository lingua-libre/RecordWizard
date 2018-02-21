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

	rw.RequestQueue.prototype.push = function( record, type ) {
	    var deferred = $.Deferred();
	    deferred.then( this.next.bind(this) ).fail( this.next.bind(this) );

        this.queue.push( { 'type': type, 'record': record, 'deferred': deferred } );

        if ( this.currentRequests < this.maxConcurentRequests ) {
            this.currentRequests++;
            this.next();
        }

        return deferred.promise();
	};

    rw.RequestQueue.prototype.next = function() {
        if ( this.queue.length > 0 ) {
            var param = this.queue.shift();

            param.record[param.type]( this.api, param.deferred );
        }
        else {
            this.currentRequests--;
        }
    };

}( mediaWiki, mediaWiki.recordWizard, jQuery ) );

