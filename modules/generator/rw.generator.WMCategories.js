'use strict';

( function ( mw, $, rw, OO ) {

	var WMCategoryGenerator = function ( config ) {
		rw.store.generator.generic.call( this, config );
	};

	OO.inheritClass( WMCategoryGenerator, rw.store.generator.generic );
	WMCategoryGenerator.static.name = 'wmcategory';
	WMCategoryGenerator.static.title = mw.msg( 'mwe-recwiz-generator-wmcategory' );

	WMCategoryGenerator.prototype.initialize = function () {
		rw.store.generator.generic.prototype.initialize.call( this );
		this.wikiLabels = {
			wiki: {
				label: 'Wikipedia',
				property: rw.store.config.data.properties.wikipediaTitle
			},
			wiktionary: {
				label: 'Wiktionary',
				property: rw.store.config.data.properties.wiktionaryEntry
			}
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
			parameters: {
				origin: '*'
			},
			ajax: {
				timeout: 10000
			}
		} );
		this.limit = new OO.ui.NumberInputWidget( {
			min: 1,
			max: 2000,
			value: 200,
			step: 100,
			pageStep: 500,
			isInteger: true
		} );
	};

	WMCategoryGenerator.prototype.getReadyProcess = function ( data ) {
		var process = rw.store.generator.generic.prototype.getReadyProcess.call( this, data ),
			lang = rw.store.config.data.languages[ rw.store.record.data.metadata.language ].code;

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
	WMCategoryGenerator.prototype.getBodyHeight = function () {
		return 320;
	};

	WMCategoryGenerator.prototype.getSiteMatrix = function () {
		var langKey, lang, siteKey, site;

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

				this.siteMatrix[ lang.code ] = {};
				for ( siteKey = 0; siteKey < lang.site.length; siteKey++ ) {
					site = lang.site[ siteKey ];
					if ( site.private === true && site.closed === true && site.fishbowl === true ) {
						continue;
					}
					if ( this.wikiLabels[ site.code ] === undefined ) {
						continue;
					}

					this.siteMatrix[ lang.code ][ site.code ] = site.url;

					if ( lang.code === mw.config.get( 'wgUserLanguage' ) ) {
						this.wikiLabels[ site.code ].label = site.sitename;
					}
				}
			}
		}.bind( this ) );
	};

	WMCategoryGenerator.prototype.createSourceDropdowns = function () {
		this.projectDropdown = new OO.ui.DropdownInputWidget( {
			classes: [ 'mwe-recwiz-generator-wmcategory-projectdropdown' ]
		} );
		this.projectDropdown.on( 'change', this.switchSource.bind( this ) );

		this.langDropdown = new OO.ui.DropdownInputWidget( {
			classes: [ 'mwe-recwiz-generator-wmcategory-langdropdown' ],
			options: Object.keys( this.siteMatrix ).map( function ( key ) {
				return {
					data: key
				};
			} )
		} );
		this.langDropdown.on( 'change', this.switchProjects.bind( this ) );
		this.langDropdown.setValue( this.WMLangCode in this.siteMatrix ? this.WMLangCode : 'en' );
	};

	WMCategoryGenerator.prototype.switchProjects = function ( selectedLang ) {
		var selectedProject;

		this.projectDropdown.setOptions( Object.keys( this.siteMatrix[ selectedLang ] ).map( function ( key ) {
			return {
				label: this.wikiLabels[ key ].label,
				data: key
			};
		}.bind( this ) ) );

		selectedProject = this.projectDropdown.getValue();

		this.projectDropdown.setValue( selectedProject );
		this.switchSource( selectedProject );
	};

	WMCategoryGenerator.prototype.switchSource = function ( selectedProject ) {
		var selectedLang = this.langDropdown.getValue(),
			apiUrl = this.siteMatrix[ selectedLang ][ selectedProject ] + '/w/api.php';

		this.api = new mw.ForeignApi( apiUrl, {
			anonymous: true,
			parameters: {
				origin: '*'
			},
			ajax: {
				timeout: 10000
			}
		} );
		this.project = this.wikiLabels[ selectedProject ].label;
		this.localProperty = this.wikiLabels[ selectedProject ].property;
		// TODO: this.categoryName = selectedProject.categoryName;

		this.generateInterface();
	};

	WMCategoryGenerator.prototype.generateInterface = function () {
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
						label: mw.msg( 'mwe-recwiz-wmcategory-source' )
					}
				),
				new OO.ui.FieldLayout(
					this.titleInput, {
						align: 'top',
						label: mw.msg( 'mwe-recwiz-wmcategory-title' ),
						help: mw.msg( 'mwe-recwiz-wmcategory-title-help' )
					}
				),
				new OO.ui.FieldLayout(
					this.limit, {
						align: 'left',
						label: mw.msg( 'mwe-recwiz-wmcategory-limit' ),
						help: mw.msg( 'mwe-recwiz-wmcategory-limit-help' )
					}
				),
				new OO.ui.FieldLayout(
					this.deduplicate, {
						align: 'left',
						label: mw.msg( 'mwe-recwiz-wmcategory-deduplicate' )
					}
				)
			]
		} );

		this.content.$element.empty().append( this.layout.$element );

		this.titleInput.$input.focus();
	};

	WMCategoryGenerator.prototype.fetch = function () {
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
		// For query details, see https://www.mediawiki.org/wiki/API:Categorymembers
		// Practice on your wiki's [[Special:ApiSandbox]], with settings as the pairs below:
		this.recursiveFetch( {
			action: 'query',
			format: 'json',
			formatversion: '2',
			prop: 'pageterms',
			wbptterms: 'label',
			generator: 'categorymembers', // or list:'categorymembers'
			gcmnamespace: '0', // or cmnamespace:'0|14'
			gcmtitle: title, // or cmtitle: title
			gcmtype: 'page', // or cmtypes: 'page|subcat'
			gcmlimit: 'max' // or cmlimit: 'max'
		}, limit );

		// We're not done yet, make the dialog closing process to wait the promise
		return this.deferred.promise();
	};

	WMCategoryGenerator.prototype.recursiveFetch = function ( payload, limit ) {
		this.api.get( payload ).then( function ( data ) {
			var i, pages, element;

			if ( data.query === undefined ) {
				return this.deferred.reject( new OO.ui.Error( mw.msg( 'mwe-recwiz-error-pagemissing' ) ) );
			}

			pages = data.query.pages;
			for ( i = 0; i < pages.length; i++ ) {
				element = {};

				if ( pages[ i ].terms !== undefined ) {
					element.text = pages[ i ].terms.label[ 0 ];
				} else {
					element.text = pages[ i ].title;
				}

				if ( this.params.deduplicate && this.isAlreadyRecorded( element.text ) ) {
					continue;
				}

				element[ this.localProperty ] = this.langDropdown.getValue() + ':' + pages[ i ].title;
				if ( this.list.push( element ) >= limit ) {
					break;
				}
			}

			if ( data.continue !== undefined && this.list.length < limit ) {
				payload.gcmcontinue = data.continue.gcmcontinue;
				this.recursiveFetch( payload, limit );
			} else {
				this.deferred.resolve();
			}
		}.bind( this ), function ( error ) {
			this.deferred.reject( new OO.ui.Error( error ) );
		}.bind( this ) );

		// We're not done yet, make the dialog closing process to wait the promise
		return this.deferred.promise();
	};

	rw.store.generator.register( 'wmcategory', WMCategoryGenerator.static.title, 'll-wmcategory', new WMCategoryGenerator() );

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );
