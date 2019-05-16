'use strict';

( function ( mw, $, rw, OO ) {

	rw.generator.List = function ( config ) {
		rw.generator.Generator.call( this, config );
	};

	OO.inheritClass( rw.generator.List, rw.generator.Generator );
	rw.generator.List.static.name = 'list';
	rw.generator.List.static.title = mw.message( 'mwe-recwiz-generator-list' ).text();

	rw.generator.List.prototype.initialize = function () {
		this.api = new mw.Api( {
			ajax: { timeout: 10000 }
		} );

		this.titleInput = new mw.widgets.TitleInputWidget( {
			$overlay: $( 'body' ),
			allowSuggestionsWhenEmpty: true,
			api: this.api,
			namespace: rw.config.listNamespace
		} );
		this.deduplicate = new OO.ui.ToggleSwitchWidget();

		this.layout = new OO.ui.Widget( {
			classes: [ 'mwe-recwiz-list' ],
			content: [
				new OO.ui.FieldLayout(
					this.titleInput, {
						align: 'top',
						label: mw.message( 'mwe-recwiz-list-title' ).text(),
						help: mw.message( 'mwe-recwiz-list-title-help' ).text()
					}
				),
				new OO.ui.FieldLayout(
					this.deduplicate, {
						align: 'left',
						label: mw.message( 'mwe-recwiz-list-deduplicate' ).text()
					}
				)
			]
		} );

		this.content.$element.append( this.layout.$element );

		rw.generator.Generator.prototype.initialize.call( this );

		this.on( 'open', this.onOpen.bind( this ) );
	};

	rw.generator.List.prototype.onOpen = function () {
		if ( this.params.title !== undefined || this.language.iso3 !== null ) {
			this.titleInput.setValue( this.params.title || this.language.iso3 + '/' );
		}
		this.deduplicate.setValue( this.params.deduplicate || true );
		this.titleInput.$input.focus();
	};

	rw.generator.List.prototype.fetch = function () {
		var generator = this,
			title = this.titleInput.getValue(),
			namespace = mw.config.get( 'wgFormattedNamespaces' )[ mw.recordWizard.config.listNamespace ] + ':',
			deduplicate = this.deduplicate.getValue();

		if ( title.lastIndexOf( namespace, 0 ) !== 0 ) {
			title = namespace + title;
		}

		this.params.title = title;
		this.params.deduplicate = deduplicate;
		this.deferred = $.Deferred();

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
				return generator.deferred.reject( new OO.ui.Error( mw.message( 'mwe-recwiz-error-pagemissing', title ).text() ) );
			}
			content = page.revisions[ 0 ].content;
			generator.list = content.split( '\n' );
			for ( i = 0; i < generator.list.length; i++ ) {
				generator.list[ i ] = generator.list[ i ].replace( /^[*#]/, '' ).trim();
				if ( deduplicate === true && generator.isAlreadyRecorded( generator.list[ i ] ) ) {
					generator.list.splice( i, 1 );
					i--; // Necessary as we've just removed an item of the list we're exploring
				}
			}
			generator.deferred.resolve();
		} )
			.fail( function ( error ) {
				generator.deferred.reject( new OO.ui.Error( error ) );
			} );

		// We're not done yet, make the dialog closing process to wait the promise
		return this.deferred.promise();
	};

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );
