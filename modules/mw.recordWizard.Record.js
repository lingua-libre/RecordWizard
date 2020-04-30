'use strict';

/**
 * * "up"           object created
 * * "ready"        audio record available
 * * "stashing"     stash request is pending
 * * "stashed"      record is stashed
 * * "uploading"    upload 2 commons request is pending
 * * "uploaded"     record is uploaded on commons
 * * "finalizing"   WB item creation request is pending
 * * "done"         all has finished
 */

( function ( mw, rw, $ ) {

	/**
	 * Constructor for objects representing records.
	 *
	 * Records are first created without any sounds, just with it's textual
	 * transcription. It will then follow many steps and perform the needed API
	 * requests to see the audio record uploaded and sorted.
	 *
	 * @class rw.Record
	 * @mixins OO.EventEmitter
	 * @constructor
	 * @param  {string} word Textual transcription of the Record
	 */
	rw.Record = function ( word ) {
		var decomposedWord;

		OO.EventEmitter.call( this );

		this.file = null;
		this.fileExtension = 'wav';
		this.stashkey = null;
		this.imageInfo = null;
		this.wbItem = null;

        this.language = null;
        this.locutor = null;
        this.license = "";

		this.word = word;
		this.extra = {};
		this.date = null;

		decomposedWord = this.word.match( /^(.+) \((.+)\)$/m );
		if ( decomposedWord === null ) {
			this.transcription = this.word;
			this.qualifier = null;
		} else {
			this.transcription = decomposedWord[ 1 ];
			this.qualifier = decomposedWord[ 2 ];
		}
	};

	OO.mixinClass( rw.Record, OO.EventEmitter );

	/**
	 * Get the full textual identifier of the record.
	 *
	 * @return {string}  Textual identifier of the record
	 */
	rw.Record.prototype.getWord = function () {
		return this.word;
	};

	/**
	 * Get the textual transcription of the record.
	 *
	 * @return {string}  Textual transcription of the record
	 */
	rw.Record.prototype.getTranscription = function () {
		return this.transcription;
	};

	/**
	 * Get the qualifier of the recorded word (if any).
	 *
	 * @return {string|null}  Qualifier of the record
	 */
	rw.Record.prototype.getQualifier = function () {
		return this.qualifier;
	};

	/**
	 * Get a WAVE-encoded blob containing the audio record.
	 *
	 * @return {Blob|null}  WAVE-encoded audio record.
	 */
	rw.Record.prototype.getBlob = function () {
		return this.file;
	};

	/**
	 * Add extra wikibase statements.
	 *
	 * @param  {Object} extra Wikibase statements, in the format
	 *                        "PropertyId": "value".
	 */
	rw.Record.prototype.setExtra = function ( extra ) {
		this.extra = extra;
	};

	/**
	 * Verify if the Record object has data.
	 *
	 * It is usefull to check if the current window can be closed safely or not.
	 *
	 * @return {boolean}  Whether the Record object has some data
	 */
	rw.Record.prototype.hasData = function () {
		if ( this.file !== null || this.stashkey !== null ) {
			return true;
		}
		return false;
	};

	/**
	 * Get the url of the stashed file as indicated by MediaWiki
	 * or the uploaded file if already on Commons.
	 *
	 * @return {string|null}  Url of the stashed file
	 */
	rw.Record.prototype.getMediaUrl = function () {
		if ( this.stashkey !== null ) {
			return mw.util.getUrl( 'Special:UploadStash/file/' + this.stashkey );
		} else if ( this.imageInfo !== null ) {
			return this.imageInfo.url;
		}
		return '';
	};

	/**
	 * Generate a filename for this record based on the curent metadatas.
	 *
	 * The format looks like 'LL-Username (locutor)-lang-transcription.wav'.
	 * All illegal characters are replaced by a dash, see for reference:
	 * https://www.mediawiki.org/wiki/Manual:$wgIllegalFileChars
	 *
	 * @return {string}  Name to give to this record
	 */
	rw.Record.prototype.getFilename = function () {
		var illegalChars = /[#<>[\]|{}:/\\]/g,
			filename = 'LL' +
				'-' + this.language.wikidataId +
				( this.language.iso3 !== null ? ' (' + this.language.iso3 + ')' : '' ) +
				'-' + this.locutor.name +
				( mw.config.get( 'wgUserName' ) !== this.locutor.name ? ' (' + mw.config.get( 'wgUserName' ) + ')' : '' ) +
				'-' + this.word + '.' + this.fileExtension;

		return filename.replace( illegalChars, '-' );
	};

	/**
	 * Generate the wikitext for the description of the record
	 * on Wikimedia Commons.
	 *
	 * @return {string}  Description of the record
	 */
	rw.Record.prototype.getText = function () {
		var gender = '';
		switch ( this.locutor.gender ) {
			case rw.store.config.data.items.genderMale:
				gender = 'male';
				break;
			case rw.store.config.data.items.genderFemale:
				gender = 'female';
				break;
			case rw.store.config.data.items.genderOther:
				gender = 'other';
				break;
		}
		return '== {{int:filedesc}} ==' +
			'\n{{Lingua Libre record' +
			'\n | locutor       = ' + this.locutor.name +
			'\n | locutorId     = ' + this.locutor.qid +
			'\n | locutorGender = ' + gender +
			'\n | author        = [[User:' + mw.config.get( 'wgUserName' ) + '|]]' +
			'\n | languageId    = ' + this.language.wikidataId +
			'\n | transcription = ' + this.transcription +
			'\n | qualifier     = ' + ( this.qualifier !== null ? this.qualifier : '' ) +
			'\n | date          = ' + this.date.getFullYear() + '-' + ( ( '0' + ( this.date.getMonth() + 1 ) ).slice( -2 ) ) + '-' + ( '0' + this.date.getDate() ).slice( -2 ) +
			'\n}}' +
			'\n\n== {{int:license-header}} ==' +
			'\n{{' + this.license + '}}';
	};

	/**
	 * Get the internal file key of the record file.
	 *
	 * This is only set after a file was stashed.
	 *
	 * @return {string|null}  File key of the record
	 */
	rw.Record.prototype.getStashkey = function () {
		return this.stashkey;
	};

	/**
	 * Set the locutor object of this record.
	 *
	 * @param  {Object} locutor Information about the locutor of this record
	 */
	rw.Record.prototype.setLocutor = function ( locutor ) {
		this.locutor = locutor;

        return this;
	};

	/**
	 * Set the language object of this record.
	 *
	 * @param  {Object} locutor Information about the language of this record
	 */
	rw.Record.prototype.setLanguage = function ( language ) {
		this.language = language;

        return this;
	};

	/**
	 * Set the license of this record.
	 *
	 * @param  {String} license Text indicationg the license of the record
	 */
	rw.Record.prototype.setLicense = function ( license ) {
		this.license = license;

        return this;
	};

	/**
	 * Set the internal stashkey of this record.
	 *
	 * This method is called when the file has been successfully stashed.
	 *
	 * @private
	 * @param  {string} stashkey Stashkey of this record file
	 */
	rw.Record.prototype.setStashkey = function ( stashkey ) {
		this.stashkey = stashkey;
		this.file = null;
	};

	/**
	 * Check whether the record is a video or not.
	 *
	 * @return {boolean}  true means the media is a video
	 */
	rw.Record.prototype.isVideo = function () {
		if ( this.fileExtension === 'webm' ) {
			return true;
		}
		return false;
	};

	/**
	 * Add an audio file to this record.
	 *
	 * @param  {Blob} audioBlob WAVE-encoded Blob containing the audio file
	 * @param  {string} extension file extension
	 * @return {boolean}        Whether the audio file has been set correctly
	 */
	rw.Record.prototype.setBlob = function ( audioBlob, extension ) {
		this.reset();

		this.file = audioBlob;
		this.fileExtension = extension;
		this.date = new Date();

		return true;
	};

	/**
	 * Clear locally the audio record file.
	 */
	rw.Record.prototype.remove = function () {
		this.file = null;
        this.cancelPendingRequests();
	};

	/**
	 * Reset the object
	 */
	rw.Record.prototype.reset = function () {
		this.file = null;
		this.stashkey = null;
		this.imageInfo = null;

		// Cancel any pending request
		this.cancelPendingRequests();
	};

	/**
	 * Cancel any pending request
	 */
	rw.Record.prototype.cancelPendingRequests = function () {
        if ( this.deferred !== undefined ) {
            // We can have either a promise returned by mw.Api, which implements
            // an abort method, or a plain deferred on which we can safely use
            // the reject method.
            if ( this.deferred.abort !== undefined ) {
                this.deferred.abort( 'cancel' );
            } else {
                this.deferred.reject( 'cancel' );
            }

            this.deferred = undefined;
        }
	};

	/**
	 * Upload the audio file to the upload stash.
	 *
	 * @param  {mw.Api} api          Api object to use for the request
	 */
	rw.Record.prototype.uploadToStash = function ( api ) {
		if ( this.file !== null && this.deferred === undefined ) {
			this.deferred = api.upload( this.file, {
				stash: true,
				filename: this.getFilename()
			} );

			this.deferred.then(
                function ( result ) {
                    console.log( 'uploadstash Result', result )
    				this.setStashkey( result.upload.filekey );
                    this.deferred = undefined;
    			}.bind( this ),
                function ( error ) {
                    console.log( 'uploadstash Error', error );
                    this.deferred = undefined;
    			}.bind( this )
             );
		} else {
    		this.deferred = $.Deferred();
			this.deferred.reject( 'can not upload' );
		}

		return this.deferred;
	};

	/**
	 * Push the audio file from the upload stash to Wikimedia Commons.
	 *
	 * @param  {mw.Api} api          Api object to use for the request
	 * @param  {$.Deferred} deferred A promise, to resolv when we're done
	 */
	rw.Record.prototype.finishUpload = function ( api ) {
		if ( this.stashkey !== null ) {
			this.deferred = api.postWithToken( 'csrf', {
				action: 'upload-to-commons',
				format: 'json',
				filekey: this.getStashkey(),
				filename: this.getFilename(),
				text: this.getText(),
				ignorewarnings: true // TODO: manage warnings !important
			} );

			this.deferred.then( function ( result ) {
				this.imageInfo = result[ 'upload-to-commons' ].oauth.upload.imageinfo;
				this.stashkey = null;
			}.bind( this ) );
		} else {
    		this.deferred = $.Deferred();
			this.deferred.reject();
		}

		return this.deferred;
	};

	/**
	 * Create a Wikibase item for our record on our local repository.
	 *
	 * @param  {mw.Api} api  Api object to use for the request
	 * @return {$.Deferred}  A promise, resolved when we're done
	 */
	rw.Record.prototype.saveWbItem = function ( api ) {
		this.wbItem = new rw.wikibase.Item();
		this.fillWbItem();

        // TODO : save the returned deferred in this.deferred
		return this.wbItem.createOrUpdate( api, true );
	};

	/**
	 * Fill the record's wikibase item with all known metadatas on it.
	 */
	rw.Record.prototype.fillWbItem = function () {
		var propertyId,  date;

		this.date.setUTCHours( 0, 0, 0, 0 );
		date = this.date.toISOString().slice( 0, -5 ) + 'Z';

		this.wbItem.labels = { en: this.word };

		this.wbItem.descriptions = { en: 'audio record - ' + ( this.language.iso3 !== null ? this.language.iso3 : this.language.wikidataId ) + ' - ' + this.locutor.name + ' (' + mw.config.get( 'wgUserName' ) + ')' };

		this.wbItem.addOrReplaceStatements( new rw.wikibase.Statement( rw.store.config.data.properties.instanceOf ).setType( 'wikibase-item' ).setValue( rw.store.config.data.items.record ), true ); // InstanceOf
		this.wbItem.addOrReplaceStatements( new rw.wikibase.Statement( rw.store.config.data.properties.subclassOf ).setType( 'wikibase-item' ).setValue( rw.store.config.data.items.word ), true ); // SubclassOf
		if ( mw.Debug === undefined ) { // Disable media on the dev environment
			this.wbItem.addOrReplaceStatements( new rw.wikibase.Statement( rw.store.config.data.properties.audioRecord ).setType( 'commonsMedia' ).setValue( this.getFilename() ), true ); // Audio file
		}
		this.wbItem.addOrReplaceStatements( new rw.wikibase.Statement( rw.store.config.data.properties.spokenLanguages ).setType( 'wikibase-item' ).setValue( this.language.qid ), true ); // Language
		this.wbItem.addOrReplaceStatements( new rw.wikibase.Statement( rw.store.config.data.properties.locutor ).setType( 'wikibase-item' ).setValue( this.locutor.qid ), true ); // Locutor
		this.wbItem.addOrReplaceStatements( new rw.wikibase.Statement( rw.store.config.data.properties.date ).setType( 'time' ).setValue( { time: date } ), true ); // Date
		this.wbItem.addOrReplaceStatements( new rw.wikibase.Statement( rw.store.config.data.properties.transcription ).setType( 'string' ).setValue( this.transcription ), true ); // Transcription
		if ( this.qualifier !== null ) {
			this.wbItem.addOrReplaceStatements( new rw.wikibase.Statement( rw.store.config.data.properties.qualifier ).setType( 'string' ).setValue( this.qualifier ), true ); // Qualifier
		}

		for ( propertyId in this.extra ) {
			this.wbItem.addOrReplaceStatements( new rw.wikibase.Statement( propertyId ).setType( 'string' ).setValue( this.extra[ propertyId ] ), true );
		}
	};

}( mediaWiki, mediaWiki.recordWizard, jQuery ) );
