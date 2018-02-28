( function ( mw, $, rw, OO ) {

	rw.layout.AccordeonLayout = function( config ) {
	    OO.EventEmitter.call( this );
	    OO.ui.Widget.call( this, { classes: config.classes } );

	    this.label = config.label;
	    this.expanded = true;

		this.content = config.content;

		this.stateLabel = new OO.ui.LabelWidget( { label: config.stateValue || '' } );
		this.header = new OO.ui.HorizontalLayout( {
			items: [
			    this.stateLabel
			],
	    } );

	    this.$element
	        .append( this.header.$element )
	        .append( this.content.$element );
	};

	OO.mixinClass( rw.layout.AccordeonLayout, OO.EventEmitter );
	OO.inheritClass( rw.layout.AccordeonLayout, OO.ui.Widget );

	rw.layout.AccordeonLayout.prototype.collapse = function() {
        if ( this.expanded ) {
            this.content.$element.slideUp();
            this.expanded = false;
            this.emit( 'collapse' );
        }
	};

	rw.layout.AccordeonLayout.prototype.expand = function() {
        if ( ! this.expanded ) {
            this.content.$element.slideDown();
            this.expanded = true;
            this.emit( 'expand' );
        }
	};




	rw.layout.ButtonAccordeonLayout = function( config ) {
		rw.layout.AccordeonLayout.call( this, config );

        this.button = new OO.ui.ButtonWidget( {
	        framed: false,
	        flags: [ 'progressive' ],
	        icon: 'expand',
	        label: this.label
        } );
		this.header.addItems( [ this.button ], 0 );
        this.button.on( 'click', this.onClick.bind( this ) );

        this.on( 'expand', this.onExpand.bind( this ) );
        this.on( 'collapse', this.onCollapse.bind( this ) );
	};

	OO.inheritClass( rw.layout.ButtonAccordeonLayout, rw.layout.AccordeonLayout );

	rw.layout.ButtonAccordeonLayout.prototype.onClick = function() {
        if ( this.expanded ) {
            this.collapse();
        }
        else {
            this.expand();
        }
    };

	rw.layout.ButtonAccordeonLayout.prototype.onExpand = function() {
        this.button.setIcon( 'expand' );
    };

	rw.layout.ButtonAccordeonLayout.prototype.onCollapse = function() {
        this.button.setIcon( 'next' );
    };




	rw.layout.RadioAccordeonLayout = function( config ) {
		rw.layout.AccordeonLayout.call( this, config );

        this.radio = new OO.ui.RadioOptionWidget( {
            data: config.data,
            label: config.label
        } );
		this.radioSelect = new OO.ui.RadioSelectWidget( {
            items: [ this.radio ]
         } );

		this.header.addItems( [ this.radioSelect ], 0 );

        this.radioSelect.on( 'choose', this.expand.bind( this ) );

	    this.$element.prepend( this.header.$element );

        if ( config.collapsed ) {
	        this.collapse();
	    }

        this.on( 'collapse', this.onCollapse.bind( this ) );
	};

	OO.inheritClass( rw.layout.RadioAccordeonLayout, rw.layout.AccordeonLayout );

	rw.layout.RadioAccordeonLayout.prototype.onCollapse = function() {
        this.radioSelect.selectItem();
	};


}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );

