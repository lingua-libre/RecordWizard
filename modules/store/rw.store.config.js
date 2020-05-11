'use strict';

( function ( mw, rw ) {
	var ConfigStore = function () {
		this.data = mw.config.get( 'RecordWizardConfig' );
		this.data.pastRecords = {};

		this.$api = new mw.Api();
	};

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
				pastRecords.push.apply( pastRecords, result.query.rwrecords );

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

	/**
	 * Add manually some words in the past records list
	 */
	ConfigStore.prototype.pushPastRecords = function ( langQid, speakerQid, pastRecords ) {
		if ( this.data.pastRecords[ langQid ] === undefined ) {
			this.data.pastRecords[ langQid ] = [];
		}

		this.data.pastRecords[ langQid ].push.apply( this.data.pastRecords[ langQid ], pastRecords );
	};

	rw.store.config = new ConfigStore();

}( mediaWiki, mediaWiki.recordWizard ) );
