( function ( mw, $, rw, OO ) {

	rw.layout.WordSelectorWidget = function( config ) {
	    config = config || {};
	    config.classes = config.classes || []
	    config.classes.push( 'mwe-recwiz-wordSelectorWidget' );
	    config.maxHeight = config.maxHeight || 250;
	    config.minHeight = config.minHeight || 150;

	    OO.ui.TagMultiselectWidget.call( this, config );

	    this.$handle.css( 'max-height', config.maxHeight  );
	    this.$handle.css( 'min-height', config.minHeight );
	    this.$handle.css( 'overflow-y', 'auto' );

        this.on( 'add', this.onAdd.bind( this ) )
	};

	OO.inheritClass( rw.layout.WordSelectorWidget, OO.ui.TagMultiselectWidget );

    rw.layout.WordSelectorWidget.prototype.onAdd = function( item, index ) {
        var height = this.$handle[ 0 ].scrollHeight;
        this.$handle.scrollTop( height );
    };


	/**
	 * Search widget fetching propositions from wikidata
	 *
	 * @class
	 * @extends OO.ui.TextInputWidget
	 * @mixins OO.ui.mixin.LookupElement
	 *
	 * @constructor
	 * @param {Object} config Configuration options
	 */
	rw.layout.WikidataSearchWidget = function DemoNumberLookupTextInputWidget( config ) {
		// Parent constructor
		OO.ui.TextInputWidget.call( this, config );
		// Mixin constructors
		OO.ui.mixin.LookupElement.call( this, config );
	};

	OO.inheritClass( rw.layout.WikidataSearchWidget, OO.ui.TextInputWidget );
	OO.mixinClass( rw.layout.WikidataSearchWidget, OO.ui.mixin.LookupElement );


	rw.layout.WikidataSearchWidget.prototype.getLookupRequest = function () {
		var wikidataApi = new mw.ForeignApi( 'https://www.wikidata.org/w/api.php', { anonymous: true } ),
			value = this.getValue(),
			deferred = $.Deferred();

		wikidataApi.get( {
			action: "wbsearchentities",
			format: "json",
			search: value,
			language: mw.config.get( 'wgUserLanguage' ),
			limit: "7",
			origin: '*',
		} ).then( function( data ) {
			var results = [];
			for ( var i=0; i < data.search.length; i++ ) {
				result = data.search[ i ];
				results.push( {
					label: result.label,
					data: result.id,
					url: result.url,
					description: result.description,
				} );
			}
			deferred.resolve( results );
		} );

		return deferred.promise( { abort: function () {} } );
	};

	rw.layout.WikidataSearchWidget.prototype.getLookupCacheDataFromResponse = function ( response ) {
		return response || [];
	};

	rw.layout.WikidataSearchWidget.prototype.getLookupMenuOptionsFromData = function ( data ) {
		var items = [];

		for ( var i = 0; i < data.length; i++ ) {
			items.push( new rw.layout.WikidataOptionWidget( data[ i ] ) );
		}

		return items;
	};





	/**
	 * Creates a WikidataOptionWidget object.
	 *
	 * @class
	 * @extends OO.ui.MenuOptionWidget
	 *
	 * @constructor
	 * @param {Object} config Configuration options
	 * @cfg {string} label Label to display
	 * @cfg {string} data qid of the item
	 * @cfg {string} url URL of item's page
	 * @cfg {string} [description] Item description
	 */
	rw.layout.WikidataOptionWidget = function( config ) {
		// Config initialization
		config = $.extend( {
			label: config.data,
			autoFitLabel: false,
			$label: $( '<a>' )
		}, config );

		// Parent constructor
		mw.widgets.TitleOptionWidget.parent.call( this, config );

		// Initialization
		this.$label.attr( 'href', config.url );
		this.$element.addClass( '' ); //TODO
		this.$label.attr( 'tabindex', '-1' );
		this.$label.attr( 'title', config.data );

		// Allow opening the link in new tab, but not regular navigation.
		this.$label.on( 'click', function ( e ) {
			// Don't interfere with special clicks (e.g. to open in new tab)
			if ( !( e.which !== 1 || e.altKey || e.ctrlKey || e.shiftKey || e.metaKey ) ) {
				e.preventDefault();
			}
		} );

		if ( config.description ) {
			this.$element.append(
				$( '<small>' )
					.addClass( 'mw-widget-titleOptionWidget-description' )
					.text( config.description )
					.attr( 'title', config.description )
			);
		}
	};

	/* Setup */
	OO.inheritClass( rw.layout.WikidataOptionWidget, OO.ui.MenuOptionWidget );

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );

