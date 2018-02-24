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
	    if ( record.isInQueue() ) {
	        return false;
	    }
	    record.isInQueue( true );

        this.queue.push( { 'type': type, 'record': record } );

        if ( this.currentRequests < this.maxConcurentRequests ) {
            this.currentRequests++;
            this.next();
        }

        return true;
	};

    rw.RequestQueue.prototype.next = function() {
        if ( this.queue.length > 0 ) {
            var param = this.queue.shift(),
	            deferred = $.Deferred();
	        deferred.then( this.next.bind(this) ).fail( this.next.bind(this) );

            param.record[param.type]( this.api, deferred );
	        param.record.isInQueue( false );
        }
        else {
            this.currentRequests--;
        }
    };

}( mediaWiki, mediaWiki.recordWizard, jQuery ) );

