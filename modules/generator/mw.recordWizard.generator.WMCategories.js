'use strict';

( function ( mw, $, rw, OO ) {

	rw.generator.WMCategory = function ( config ) {
		rw.generator.Generator.call( this, config );
	};

	OO.inheritClass( rw.generator.WMCategory, rw.generator.Generator );
	rw.generator.WMCategory.static.name = 'wmcategory';
	rw.generator.WMCategory.static.title = mw.message( 'mwe-recwiz-generator-wmcategory' ).text();

	rw.generator.WMCategory.prototype.initialize = function () {
		rw.generator.Generator.prototype.initialize.call( this );
	};

	rw.generator.WMCategory.prototype.getReadyProcess = function ( data ) {
		var generator = this,
			process = new OO.ui.Process();

		rw.generator.Generator.parent.prototype.getReadyProcess.call( this, data );

		if ( this.language.code === null ) {
			this.close();
		}

		this.projects = [];
		this.langCode = mw.recordWizard.config.languages[ mw.recordWizard.metadatas.language ].code;
		process.next( this.exists.bind(
			this,
			mw.msg( 'mwe-recwiz-wmcategory-wikipedia' ),
			rw.config.properties.wikipediaTitle,
			'https://' + this.langCode + '.wikipedia.org/w/api.php'
		) );
		process.next( this.exists.bind(
			this,
			mw.msg( 'mwe-recwiz-wmcategory-wiktionary' ),
			rw.config.properties.wiktionaryEntry,
			'https://' + this.langCode + '.wiktionary.org/w/api.php'
		) );
		process.next( function () {
			var i;
			if ( generator.projects.length === 0 ) {
				OO.ui.alert( mw.msg( 'mwe-recwiz-error-nowiki' ) );
				return false;
			}

			generator.source = new OO.ui.RadioSelectWidget( {} );
			for ( i = 0; i < generator.projects.length; i++ ) {
				generator.source.addItems( [ new OO.ui.RadioOptionWidget( {
					label: generator.projects[ i ].name,
					data: generator.projects[ i ]
				} ) ] );
			}
			generator.source.on( 'choose', generator.switchSource.bind( generator ) );

			generator.source.selectItemByLabel( generator.projects[ 0 ].name );
			generator.switchSource( generator.source.getFirstSelectableItem() );
		} );

		return process;
	};

	rw.generator.WMCategory.prototype.exists = function ( name, localProperty, apiUrl ) {
		var generator = this,
			deferred = $.Deferred(),
			api = new mw.ForeignApi( apiUrl, {
				anonymous: true,
				parameters: { origin: '*' },
				ajax: { timeout: 10000 }
			} );

		api.get( {
			action: 'query',
			format: 'json',
			meta: 'siteinfo',
			formatversion: '2',
			siprop: 'namespaces'
		} ).then( function ( data ) {
			generator.projects.push( {
				name: name,
				api: api,
				localProperty: localProperty,
				categoryName: data.query.namespaces[ '14' ].name
			} );
			deferred.resolve();
		} ).fail( function () {
			deferred.resolve();
		} );

		return deferred;
	};

	rw.generator.WMCategory.prototype.switchSource = function ( item ) {
		var selectedProject = item.getData();

		this.api = selectedProject.api;
		this.project = selectedProject.name;
		this.localProperty = selectedProject.localProperty;
		this.categoryName = selectedProject.categoryName;

		this.generateInterface();
	};

	rw.generator.WMCategory.prototype.generateInterface = function () {
		// TODO: don't regenerate the complete interface each times

		this.titleInput = new mw.widgets.TitleInputWidget( {
			$overlay: $( 'body' ),
			allowSuggestionsWhenEmpty: true,
			api: this.api,
			namespace: 14, // Category
			value: this.categoryName + ':'
		} );

		this.layout = new OO.ui.Widget( {
			classes: [ 'mwe-recwiz-wmcategory' ],
			content: [
				new OO.ui.FieldLayout(
					this.source, {
						align: 'top',
						label: mw.message( 'mwe-recwiz-wmcategory-source' ).text()
					}
				),
				new OO.ui.FieldLayout(
					this.titleInput, {
						align: 'top',
						label: mw.message( 'mwe-recwiz-wmcategory-title' ).text(),
						help: mw.message( 'mwe-recwiz-wmcategory-title-help' ).text()
					}
				)
			]
		} );

		this.content.$element.empty().append( this.layout.$element );

		this.titleInput.$input.focus();
	};

	rw.generator.WMCategory.prototype.fetch = function () {
		var generator = this,
			title = this.titleInput.getValue();

		this.deferred = $.Deferred();

		this.api.get( {
			action: 'query',
			format: 'json',
			formatversion: '2',
			generator: 'categorymembers',
			gcmnamespace: '0',
			gcmtitle: title,
			gcmtype: 'page',
			gcmlimit: 'max'
		} ).then( function ( data ) {
			var i, pages, element;

			if ( data.query === undefined ) {
				return generator.deferred.reject( new OO.ui.Error( mw.message( 'mwe-recwiz-error-pagemissing', title ).text() ) );
			}

			pages = data.query.pages;
			generator.list = [];
			for ( i = 0; i < pages.length; i++ ) {
				element = {};
				element.text = pages[ i ].title;
				element[ generator.localProperty ] = generator.langCode + ':' + pages[ i ].title;
				generator.list.push( element );
			}
			generator.deferred.resolve();
		} ).fail( function ( error ) {
			generator.deferred.reject( new OO.ui.Error( error ) );
		} );

		// We're not done yet, make the dialog closing process to wait the promise
		return this.deferred.promise();
	};

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );
