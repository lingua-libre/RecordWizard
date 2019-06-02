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
		this.wikiLabels = {
			wiki: { label: 'Wikipedia', property: rw.config.properties.wikipediaTitle },
			wiktionary: { label: 'Wiktionary', property: rw.config.properties.wiktionaryEntry }
			// wikibooks: { label: 'Wikibooks', property: '' },
			// wikinews: { label: 'Wikinews', property: '' },
			// wikiquote: { label: 'Wikiquote', property: '' },
			// wikisource: { label: 'Wikisource', property: '' },
			// wikiversity: { label: 'Wikiversity', property: '' },
			// wikivoyage: { label: 'Wikivoyage', property: '' }
		};
		this.siteMatrix = {};
		this.metaApi = new mw.ForeignApi( 'https://meta.wikimedia.org/w/api.php', {
			anonymous: true,
			parameters: { origin: '*' },
			ajax: { timeout: 10000 }
		} );
		this.limit = new OO.ui.NumberInputWidget( { min: 1, max: 2000, value: 200, step: 100, pageStep: 500, isInteger: true } );
	};

	rw.generator.WMCategory.prototype.getReadyProcess = function ( data ) {
		var process = rw.generator.Generator.prototype.getReadyProcess.call( this, data ),
			lang = rw.config.languages[ rw.metadatas.language ].code;

		// Don't run this every time the generator is opened
		if ( this.WMLangCode !== lang ) {
			this.WMLangCode = lang;
			process.next( this.getSiteMatrix.bind( this ) );
			process.next( this.createSourceDropdowns.bind( this ) );
		}

		return process;
	};

	/**
	 * Get the height of the window body.
	 * Used by the ProcessDialog to set an accurate height to the dialog.
	 *
	 * @return {number} Height in px the dialog should be.
	 */
	rw.generator.WMCategory.prototype.getBodyHeight = function () {
		return 320;
	};

	rw.generator.WMCategory.prototype.getSiteMatrix = function () {
		var langKey, lang, siteKey, site,
			generator = this;

		return this.metaApi.get( {
			action: 'sitematrix',
			format: 'json',
			formatversion: 2,
			smtype: 'language'
		} ).then( function ( data ) {
			for ( langKey in data.sitematrix ) {
				if ( langKey === 'count' ) {
					continue;
				}
				lang = data.sitematrix[ langKey ];

				generator.siteMatrix[ lang.code ] = {};
				for ( siteKey = 0; siteKey < lang.site.length; siteKey++ ) {
					site = lang.site[ siteKey ];
					if ( site.private === true && site.closed === true && site.fishbowl === true ) {
						continue;
					}
					if ( generator.wikiLabels[ site.code ] === undefined ) {
						continue;
					}

					generator.siteMatrix[ lang.code ][ site.code ] = site.url;

					if ( lang.code === mw.config.get( 'wgUserLanguage' ) ) {
						generator.wikiLabels[ site.code ].label = site.sitename;
					}
				}
			}
		} );
	};

	rw.generator.WMCategory.prototype.createSourceDropdowns = function () {
		this.projectDropdown = new OO.ui.DropdownInputWidget( {
			classes: [ 'mwe-recwiz-generator-wmcategory-projectdropdown' ]
		} );
		this.projectDropdown.on( 'change', this.switchSource.bind( this ) );

		this.langDropdown = new OO.ui.DropdownInputWidget( {
			classes: [ 'mwe-recwiz-generator-wmcategory-langdropdown' ],
			options: Object.keys( this.siteMatrix ).map( function ( key ) { return { data: key }; } )
		} );
		this.langDropdown.on( 'change', this.switchProjects.bind( this ) );
		this.langDropdown.setValue( this.WMLangCode in this.siteMatrix ? this.WMLangCode : 'en' );
	};

	rw.generator.WMCategory.prototype.switchProjects = function ( selectedLang ) {
		var selectedProject,
			generator = this;

		this.projectDropdown.setOptions( Object.keys( this.siteMatrix[ selectedLang ] ).map( function ( key ) {
			return { label: generator.wikiLabels[ key ].label, data: key };
		} ) );

		selectedProject = this.projectDropdown.getValue();

		this.projectDropdown.setValue( selectedProject );
		this.switchSource( selectedProject );
	};

	rw.generator.WMCategory.prototype.switchSource = function ( selectedProject ) {
		var selectedLang = this.langDropdown.getValue(),
			apiUrl = this.siteMatrix[ selectedLang ][ selectedProject ] + '/w/api.php';

		this.api = new mw.ForeignApi( apiUrl, {
			anonymous: true,
			parameters: { origin: '*' },
			ajax: { timeout: 10000 }
		} );
		this.project = this.wikiLabels[ selectedProject ].label;
		this.localProperty = this.wikiLabels[ selectedProject ].property;
		// TODO: this.categoryName = selectedProject.categoryName;

		this.generateInterface();
	};

	rw.generator.WMCategory.prototype.generateInterface = function () {
		// TODO: don't regenerate the complete interface each times

		this.titleInput = new mw.widgets.TitleInputWidget( {
			$overlay: $( 'body' ),
			allowSuggestionsWhenEmpty: true,
			api: this.api,
			namespace: 14 // Category
			// value: this.categoryName + ':'
		} );
		this.deduplicate = new OO.ui.ToggleSwitchWidget( {
			value: this.params.deduplicate || true
		} );

		this.layout = new OO.ui.Widget( {
			classes: [ 'mwe-recwiz-wmcategory' ],
			content: [
				new OO.ui.FieldLayout(
					new OO.ui.Widget( {
						content: [
							new OO.ui.HorizontalLayout( {
								classes: [ 'mwe-recwiz-generator-wmcategory-source' ],
								items: [
									this.langDropdown,
									this.projectDropdown
								]
							} )
						]
					} ), {
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
				),
				new OO.ui.FieldLayout(
					this.limit, {
						align: 'left',
						label: mw.message( 'mwe-recwiz-wmcategory-limit' ).text(),
						help: mw.message( 'mwe-recwiz-wmcategory-limit-help' ).text()
					}
				),
				new OO.ui.FieldLayout(
					this.deduplicate, {
						align: 'left',
						label: mw.message( 'mwe-recwiz-wmcategory-deduplicate' ).text()
					}
				)
			]
		} );

		this.content.$element.empty().append( this.layout.$element );

		this.titleInput.$input.focus();
	};

	rw.generator.WMCategory.prototype.fetch = function () {
		var title = this.titleInput.getValue(),
			deduplicate = this.deduplicate.getValue(),
			limit = parseInt( this.limit.getValue() ) || 200;

		this.params.deduplicate = deduplicate;
		this.deferred = $.Deferred();
		this.list = [];

		if ( limit > 2000 ) {
			limit = 2000;
		} else if ( limit < 1 ) {
			limit = 1;
		}

		this.recursiveFetch( {
			action: 'query',
			format: 'json',
			formatversion: '2',
			prop: 'pageterms',
			wbptterms: 'label',
			generator: 'categorymembers',
			gcmnamespace: '0',
			gcmtitle: title,
			gcmtype: 'page',
			gcmlimit: 'max'
		}, limit );

		// We're not done yet, make the dialog closing process to wait the promise
		return this.deferred.promise();
	};

	rw.generator.WMCategory.prototype.recursiveFetch = function ( payload, limit ) {
		var generator = this;

		this.api.get( payload ).then( function ( data ) {
			var i, pages, element;

			if ( data.query === undefined ) {
				return generator.deferred.reject( new OO.ui.Error( mw.message( 'mwe-recwiz-error-pagemissing' ).text() ) );
			}

			pages = data.query.pages;
			for ( i = 0; i < pages.length; i++ ) {
				element = {};

				if ( pages[ i ].terms !== undefined ) {
					element.text = pages[ i ].terms.label[ 0 ];
				} else {
					element.text = pages[ i ].title;
				}

				if ( generator.params.deduplicate && generator.isAlreadyRecorded( element.text ) ) {
					continue;
				}

				element[ generator.localProperty ] = generator.langDropdown.getValue() + ':' + pages[ i ].title;
				if ( generator.list.push( element ) >= limit ) {
					break;
				}
			}

			if ( data.continue !== undefined && generator.list.length < limit ) {
				payload.gcmcontinue = data.continue.gcmcontinue;
				generator.recursiveFetch( payload, limit );
			} else {
				generator.deferred.resolve();
			}
		} ).fail( function ( error ) {
			generator.deferred.reject( new OO.ui.Error( error ) );
		} );

		// We're not done yet, make the dialog closing process to wait the promise
		return this.deferred.promise();
	};

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );
