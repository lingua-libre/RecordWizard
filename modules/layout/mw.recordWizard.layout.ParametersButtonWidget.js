'use strict';

( function ( mw, $, rw, OO ) {

	rw.layout.ParametersButtonWidget = function ( config ) {
		var widgetName;

		config = config || {};
		config.classes = config.classes || [];
		config.classes.push( 'mwe-recwiz-parametersButtonWidget' );

		rw.layout.ParametersButtonWidget.parent.call( this, config );

		this.label = config.label;
		this.groups = config.groups;
		this.parameterWidgets = {};

		// Widget initialisation
		this.generateUI();

		// Attach events handlers to each individual widgets
		for ( widgetName in this.parameterWidgets ) {
			this.parameterWidgets[ widgetName ].on( 'change', this.onChange.bind( this, widgetName ) );
			this.parameterWidgets[ widgetName ].on( 'choose', this.onChange.bind( this, widgetName ) );
		}

		// Populate widgets with the user's value if found in the local storage
		for ( widgetName in this.parameterWidgets ) {
			this.loadSavedValue( widgetName );
		}
	};

	OO.inheritClass( rw.layout.ParametersButtonWidget, OO.ui.Widget );

	rw.layout.ParametersButtonWidget.prototype.generateUI = function () {
		var i, j, k, container, group, widget, groupContainer, layout, options;

		container = $( '<div>' );
		for ( i = 0; i < this.groups.length; i++ ) {
			group = this.groups[ i ];
			// TODO: create groups
			groupContainer = $( '<div>' ).addClass( 'mwe-recwiz-parametersButtonWidget-group' );
			groupContainer.append( new OO.ui.LabelWidget( { label: group.label } ).$element );
			for ( j = 0; j < group.widgets.length; j++ ) {
				widget = group.widgets[ j ];
				switch ( widget.type ) {
					case 'bool':
						this.parameterWidgets[ widget.name ] = new OO.ui.CheckboxInputWidget( {
							selected: widget.value
						} );
						layout = new OO.ui.FieldLayout(
							this.parameterWidgets[ widget.name ], {
								align: 'right',
								label: widget.label,
								help: widget.help
							}
						);
						break;
					case 'number':
						this.parameterWidgets[ widget.name ] = new OO.ui.NumberInputWidget( {
							input: { value: widget.value },
							min: widget.min,
							max: widget.max
						} );
						layout = new OO.ui.FieldLayout(
							this.parameterWidgets[ widget.name ], {
								align: 'top',
								label: widget.label,
								help: widget.help
							}
						);
						break;
					case 'select':
						options = [];
						for ( k = 0; k < widget.options.length; k++ ) {
							options.push( new OO.ui.ButtonOptionWidget( {
								data: widget.options[ k ],
								label: String( widget.options[ k ] )
							} ) );
						}
						this.parameterWidgets[ widget.name ] = new OO.ui.ButtonSelectWidget( { items: options } );
						this.parameterWidgets[ widget.name ].selectItemByData( widget.value );
						layout = new OO.ui.FieldLayout(
							this.parameterWidgets[ widget.name ], {
								align: 'top',
								label: widget.label,
								help: widget.help
							}
						);
						break;
					default:
						layout = null;
				}
				groupContainer.append( layout.$element );
			}
			container.append( groupContainer );
		}
		this.button = new OO.ui.PopupButtonWidget( {
			icon: 'settings',
			indicator: 'down',
			label: this.label,
			$overlay: this.$overlay,
			popup: {
				width: 300,
				padded: false,
				anchor: false,
				align: 'backwards',
				$autoCloseIgnore: this.$overlay,
				classes: [ 'mwe-recwiz-parametersButtonWidget-popup' ],
				$content: container
			}
		} );
		this.$element.append( this.button.$element );
	};

	rw.layout.ParametersButtonWidget.prototype.loadSavedValue = function ( key ) {
		var value;

		if ( this.parameterWidgets[ key ] === undefined ) {
			return undefined;
		}

		value = mw.storage.get( 'mwe-recwiz-' + key );
		if ( value === false || value === null ) {
			return false;
		}
		value = JSON.parse( value )

		if ( this.parameterWidgets[ key ] instanceof OO.ui.CheckboxInputWidget ) {
			return this.parameterWidgets[ key ].setSelected( value.v );
		} else if ( this.parameterWidgets[ key ] instanceof OO.ui.NumberInputWidget ) {
			return this.parameterWidgets[ key ].setValue( value.v );
		} else if ( this.parameterWidgets[ key ] instanceof OO.ui.ButtonSelectWidget ) {
			return this.parameterWidgets[ key ].selectItemByData( value.v );
		}

		return null;
	};

	rw.layout.ParametersButtonWidget.prototype.getValue = function ( key ) {
		if ( this.parameterWidgets[ key ] === undefined ) {
			return undefined;
		}

		if ( this.parameterWidgets[ key ] instanceof OO.ui.CheckboxInputWidget ) {
			return this.parameterWidgets[ key ].isSelected();
		} else if ( this.parameterWidgets[ key ] instanceof OO.ui.NumberInputWidget ) {
			return this.parameterWidgets[ key ].getValue();
		} else if ( this.parameterWidgets[ key ] instanceof OO.ui.ButtonSelectWidget ) {
			return this.parameterWidgets[ key ].findSelectedItem().getData();
		}

		return null;
	};

	rw.layout.ParametersButtonWidget.prototype.onChange = function ( key, value ) {
		console.info( '[onChange] ', key, value );
		if ( this.parameterWidgets[ key ] === undefined ) {
			return undefined;
		}

		if ( this.parameterWidgets[ key ] instanceof OO.ui.ButtonSelectWidget ) {
			value = value.getData();
		}

		mw.storage.set( 'mwe-recwiz-' + key, JSON.stringify( { v: value } ) );

		return null;
	};

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );
