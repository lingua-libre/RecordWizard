'use strict';

( function ( mw, rw ) {
	var ConfigStore = function() {
		this.data = mw.config.get( 'RecordWizardConfig' );
		this.data.pastRecords = {};

		this.$api = new mw.Api();
	}

	ConfigStore.prototype.fetchPastRecords = function ( langQid, speakerQid, deferred, offset, pastRecords ) {
		deferred = deferred || $.Deferred();
		offset = offset || 0;
		pastRecords = pastRecords || [];

		if ( this.data.pastRecords[ langQid ] !== undefined ) {
			deferred.resolve( this.data.pastRecords[ langQid ] );
		} else {
			this.$api.get( {
				action: 'query',
				format: 'json',
				list: 'rwrecords',
				rwrspeaker: speakerQid,
				rwrlanguage: langQid,
				rwrlimit: 'max',
				rwroffset: offset
			} ).then( function ( result ) {
				pastRecords = result.query.rwrecords.concat( pastRecords );

				if ( result.continue !== undefined ) {
					this.getPastRecords( langQid, speakerQid, deferred, result.continue.rwroffset, pastRecords );
				} else {
					this.data.pastRecords[ langQid ] = pastRecords;
					deferred.resolve( pastRecords );
				}
			}.bind( this ), function () {
				this.data.pastRecords[ langQid ] = [];
				deferred.reject();
			}.bind( this ) );
		}

		return deferred.promise();
	};

	rw.store.config = new ConfigStore();

}( mediaWiki, mediaWiki.recordWizard ) );
