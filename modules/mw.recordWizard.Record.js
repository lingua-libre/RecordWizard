'use strict';

// TODO: cleaner state managment
( function ( mw, rw, $ ) {

	rw.Record = function ( word ) {
		OO.EventEmitter.call( this );

		this.file = null;
		this.filename = null;
		this.filekey = null;
		this.imageInfo = null;
		this.wbItem = null;
		this.word = word;
		this.extra = {};

		this.inQueue = false;
		this.error = false;
		this.state = 'up';
	};

	OO.mixinClass( rw.Record, OO.EventEmitter );

	rw.Record.prototype.getWord = function () {
		return this.word;
	};

	rw.Record.prototype.getBlob = function () {
		return this.file;
	};

	rw.Record.prototype.getState = function () {
		return this.state;
	};

	rw.Record.prototype.setExtra = function ( extra ) {
		this.extra = extra;
	};

	// up				object created
	// ready			audio record available
	// stashing			stash request is pending
	// stashed			record is stashed
	// uploading		upload 2 commons request is pending
	// uploaded			record is uploaded on commons
	// finalizing		WB item creation request is pending
	// done				all has finished
	rw.Record.prototype.setState = function ( newState ) {
		this.emit( 'state-change', this.getWord(), newState, this.state );
		this.state = newState;
	};

	rw.Record.prototype.hasData = function () {
		if ( this.state === 'up' || this.state === 'done' ) {
			return false;
		}
		return true;
	};

	rw.Record.prototype.getStashedFileUrl = function () {
		if ( this.filekey !== null ) {
			return mw.util.getUrl( 'Special:UploadStash/file/' + this.filekey );
		}
		return null;
	};

	rw.Record.prototype.getFilename = function () {
		return 'LL' +
			'-' + rw.metadatas.locutor.name +
			( mw.config.get( 'wgUserName' ) !== rw.metadatas.locutor.name ? ' (' + mw.config.get( 'wgUserName' ) + ')' : '' ) +
			'-' + rw.config.languages[ rw.metadatas.language ].code +
			'-' + this.word + '.wav';
	};

	rw.Record.prototype.getText = function () {
		var date = new Date(),
			gender = '';
		switch ( rw.metadatas.locutor.gender ) {
			case rw.config.items.genderMale:
				gender = 'male';
				break;
			case rw.config.items.genderFemale:
				gender = 'female';
				break;
			case rw.config.items.genderOther:
				gender = 'other';
				break;
		}
		return '{{Lingua Libre record' +
			'\n | locutor	   = ' + rw.metadatas.locutor.name +
			'\n | locutorId	 = ' + rw.metadatas.locutor.qid +
			'\n | locutorGender = ' + gender +
			'\n | author		= [[User:' + mw.config.get( 'wgUserName' ) + '|]]' +
			'\n | language	  = ' + rw.config.languages[ rw.metadatas.language ].localname +
			'\n | languageCode  = ' + rw.config.languages[ rw.metadatas.language ].code +
			'\n | transcription = ' + this.word +
			'\n | date		  = ' + date.getFullYear() + '-' + ( date.getMonth() + 1 ) + '-' + date.getDate() +
			'\n | permission	= {{' + rw.metadatas.license + '}}' +
			'\n}}';
	};

	rw.Record.prototype.getFilekey = function () {
		return this.filekey;
	};

	rw.Record.prototype.setFilekey = function ( filekey ) {
		this.filekey = filekey;
		this.file = null;
		this.setState( 'stashed' );
	};

	rw.Record.prototype.uploaded = function ( imageinfo ) {
		this.imageInfo = imageinfo;
		this.filekey = null;
		this.setState( 'uploaded' );
	};

	rw.Record.prototype.setError = function ( error ) {
		this.error = error;
		this.setState( 'error' );
	};

	rw.Record.prototype.hasFailed = function () {
		if ( this.state === 'error' ) {
			return true;
		}
		return false;
	};

	rw.Record.prototype.setBlob = function ( audioBlob ) {
		// Only allow re-recording an audio when it's not already uploaded
		if ( [ 'up', 'ready', 'stashing', 'stashed' ].indexOf( this.state ) > -1 ) {
			this.setState( 'ready' );
			this.filekey = null;
			this.error = false;

			this.file = audioBlob;

			return true;
		}
		return false;
	};

	rw.Record.prototype.isInQueue = function ( inQueue ) {
		if ( inQueue !== undefined ) {
			this.inQueue = inQueue;
		}
		return this.inQueue;
	};

	rw.Record.prototype.remove = function () {
		// TODO: abort request if uploading
		// this.offStateChange();
		this.file = null;
	};

	rw.Record.prototype.uploadToStash = function ( api, deferred ) {
		var record = this;
		if ( this.state === 'ready' || this.state === 'error' ) {
			this.setState( 'stashing' );

			api.upload( this.file, {
				stash: true,
				filename: this.getFilename()
			} ).then( function ( result ) {
				record.setFilekey( result.upload.filekey );
				deferred.resolve( result );
			} ).fail( function ( errorCode, result ) {
				deferred.reject( errorCode, result );
				record.setError( errorCode );
			} );
		}
	};

	rw.Record.prototype.finishUpload = function ( api, deferred ) {
		var record = this;

		if ( this.state === 'error' && this.imageInfo !== null ) {
			deferred.resolve();
		}

		this.setState( 'uploading' );

		// TODO: switch from upload to upload-to-commons, if available
		// use the config to detect it
		api.postWithToken( 'csrf', {
			action: 'upload-to-commons',
			format: 'json',
			filekey: this.getFilekey(),
			filename: this.getFilename(),
			text: this.getText(),
			removeafterupload: true,
			ignorewarnings: true // TODO: manage warnings
		} ).then( function ( result ) {
			record.uploaded( result[ 'upload-to-commons' ].oauth.upload.imageinfo );
			deferred.resolve();
		} ).fail( function ( code, result ) {
			record.setError( code );
			deferred.reject( code, result );
		} );
	};

	rw.Record.prototype.saveWbItem = function ( api ) {
		var record = this;

		this.setState( 'finalizing' );

		this.wbItem = new mw.recordWizard.wikibase.Item();
		this.fillWbItem();

		return this.wbItem.createOrUpdate( api, true ).then( function () {
			record.setState( 'done' );
		} ).fail( function ( code ) {
			record.setError( code );
		} );
	};

	rw.Record.prototype.fillWbItem = function () {
		var propertyId,
			today = new Date();
		today.setUTCHours( 0, 0, 0, 0 );
		today = today.toISOString().slice( 0, -5 ) + 'Z';

		// TODO: manage other languages
		this.wbItem.labels = { en: this.word };
		// TODO: add language information
		this.wbItem.descriptions = { en: 'audio record from ' + rw.metadatas.locutor.name + ' (' + mw.config.get( 'wgUserName' ) + ')' };

		this.wbItem.addOrReplaceStatements( new mw.recordWizard.wikibase.Statement( rw.config.properties.instanceOf ).setType( 'wikibase-item' ).setValue( rw.config.items.record ), true ); // InstanceOf
		this.wbItem.addOrReplaceStatements( new mw.recordWizard.wikibase.Statement( rw.config.properties.subclassOf ).setType( 'wikibase-item' ).setValue( rw.config.items.word ), true ); // SubclassOf
		// item.addOrReplaceStatements( new mw.recordWizard.wikibase.Statement( rw.config.properties.audioRecord ).setType( 'commonsMedia' ).setValue( this.getFilename() ), true ); //Audio file
		this.wbItem.addOrReplaceStatements( new mw.recordWizard.wikibase.Statement( rw.config.properties.spokenLanguages ).setType( 'wikibase-item' ).setValue( rw.metadatas.language ), true ); // Language
		this.wbItem.addOrReplaceStatements( new mw.recordWizard.wikibase.Statement( rw.config.properties.locutor ).setType( 'wikibase-item' ).setValue( rw.metadatas.locutor.qid ), true ); // Locutor
		this.wbItem.addOrReplaceStatements( new mw.recordWizard.wikibase.Statement( rw.config.properties.date ).setType( 'time' ).setValue( { time: today } ), true ); // Date
		this.wbItem.addOrReplaceStatements( new mw.recordWizard.wikibase.Statement( rw.config.properties.transcription ).setType( 'monolingualtext' ).setValue( { language: 'fr', text: this.word } ), true ); // Transcription
		for ( propertyId in this.extra ) {
			this.wbItem.addOrReplaceStatements( new mw.recordWizard.wikibase.Statement( propertyId ).setType( 'string' ).setValue( this.extra[ propertyId ] ), true );
		}
	};

}( mediaWiki, mediaWiki.recordWizard, jQuery ) );
