'use strict';

( function ( mw, $, rw, OO ) {

	Vue.component( 'ooui-buttonselect', {
		template: '<div></div>',
		props: {
			options: { type: Array, default: function () { return []; } },
			value: String,
			disabled: { type: Boolean, default: false },
			inputId: String
		},
		data: function () {
			return {
				opt: JSON.parse( JSON.stringify( this.options ) )
			};
		},
		mounted: function () {
			this.$items = [];

			this.$select = new OO.ui.ButtonSelectWidget( {
				$element: $( this.$el ),
				inputId: this.inputId,
				disabled: this.disabled,
				items: []
			} );
			this.setItems();
			this.$select.on( 'select', this.onChange.bind( this ) );
		},
		methods: {
			setItems: function () {
				var i;
				this.$select.removeItems( this.$items );

				this.$items = [];
				for ( i = 0; i < this.opt.length; i++ ) {
					this.$items.push( new OO.ui.ButtonOptionWidget( this.opt[ i ] ) );
				}

				this.$select.addItems( this.$items );
				this.$select.selectItemByData( this.value );
			},
			onChange: function ( item ) {
				var value = null;

				if ( item !== null ) {
					value = item.getData();
				}

				this.$emit( 'input', value );
			}
		},
		watch: {
			value: function () {
				this.$select.selectItemByData( this.value );
			},
			disabled: function () {
				this.$select.setDisabled( this.disabled );
			}
		},
		beforeDestroy: function () {
			this.$select.off( 'select' );
		}
	} );

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );
