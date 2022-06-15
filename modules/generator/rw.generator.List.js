'use strict';

( function ( mw, $, rw, OO ) {

	var ListGenerator = function ( config ) {
		rw.store.generator.generic.call( this, config );
	};

	OO.inheritClass( ListGenerator, rw.store.generator.generic );
	ListGenerator.static.name = 'list';
	ListGenerator.static.title = mw.msg( 'mwe-recwiz-generator-list' );

	ListGenerator.prototype.initialize = function () {
		this.api = new mw.Api( {
			ajax: { timeout: 10000 }
		} );

		this.titleInput = new mw.widgets.TitleInputWidget( {
			$overlay: $( 'body' ),
			allowSuggestionsWhenEmpty: true,
			api: this.api,
			namespace: rw.store.config.data.listNamespace
		} );
		this.deduplicate = new OO.ui.ToggleSwitchWidget();

		this.layout = new OO.ui.Widget( {
			classes: [ 'mwe-recwiz-list' ],
			content: [
				new OO.ui.FieldLayout(
					this.titleInput, {
						align: 'top',
						label: mw.msg( 'mwe-recwiz-list-title' ),
						help: mw.msg( 'mwe-recwiz-list-title-help' )
					}
				),
				new OO.ui.FieldLayout(
					this.deduplicate, {
						align: 'left',
						label: mw.msg( 'mwe-recwiz-list-deduplicate' )
					}
				)
			]
		} );

		this.content.$element.append( this.layout.$element );

		rw.store.generator.generic.prototype.initialize.call( this );

		this.on( 'open', this.onOpen.bind( this ) );
	};

	ListGenerator.prototype.onOpen = function () {
		if ( this.params.title !== undefined || this.language.iso3 !== null ) {
			this.titleInput.setValue( this.params.title || this.language.iso3 + '/' );
		}
		this.deduplicate.setValue( this.params.deduplicate || true );
		this.titleInput.$input.focus();
	};

	ListGenerator.prototype.fetch = function () {
		var title = this.titleInput.getValue(),
			namespace = mw.config.get( 'wgFormattedNamespaces' )[ rw.store.config.data.listNamespace ] + ':',
			deduplicate = this.deduplicate.getValue();

		if ( !title ) {
			return new OO.ui.Error( mw.msg( 'mwe-recwiz-list-error-nopage' ) );
		}

		if ( title.lastIndexOf( namespace, 0 ) !== 0 ) {
			title = namespace + title;
		}

		this.params.title = title;
		this.params.deduplicate = deduplicate;
		this.deferred = $.Deferred();
		
		// Query target list's content
		this.api.get( {
			action: 'query',
			format: 'json',
			prop: 'revisions',
			titles: title,
			redirects: 1,
			formatversion: '2',
			rvprop: 'content',
			rvlimit: '1'
		} ).then( function ( data ) {
			var i, content,
				page = data.query.pages[ 0 ];

			if ( page.missing === true ) {
				return this.deferred.reject( new OO.ui.Error( mw.msg( 'mwe-recwiz-error-pagemissing', title ) ) );
			}
			// Has list's content, process-clean it
			content = page.revisions[ 0 ].content;
			this.list = content.split( '\n' );
			for ( i = 0; i < this.list.length; i++ ) {
				this.list[ i ] = this.list[ i ].replace( /^[*#]/, '' ).trim();
				// HERE, could add processing to support…
				// - dictionary input, ex: 'red → rouge' into 'rouge' to the RW
				// - metadata input, ex: 'rouge [pos:adjective,ipa:/ɹuːʒ/]' into 'rouge' to the RW,
				// to proper recording and passing the metadata into the audio's Qid page's data.
				if ( deduplicate === true && this.isAlreadyRecorded( this.list[ i ] ) ) {
					this.list.splice( i, 1 );
					i--; // Necessary as we've just removed an item of the list we're exploring
				}
			}
			this.deferred.resolve();
		}.bind( this ), function ( error ) {
			this.deferred.reject( new OO.ui.Error( error ) );
		}.bind( this ) );

		// We're not done yet, make the dialog closing process to wait the promise
		return this.deferred.promise();
	};

	rw.store.generator.register( 'list', ListGenerator.static.title, 'll-list', new ListGenerator() );

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );
