'use strict';

( function ( mw, $, rw, OO ) {

	Vue.component( 'ooui-checkbox', {
		template: '<span></span>',
		props: {
			value: { type: Boolean, default: false },
			disabled: { type: Boolean, default: false },
			inputId: String
		},
		mounted: function () {
			this.$input = new OO.ui.CheckboxInputWidget( {
				$element: $( this.$el ),
				inputId: this.inputId,
				disabled: this.disabled,
				selected: this.value
			} );
			this.$input.on( 'change', this.$emit.bind( this, 'input' ) );
		},
		watch: {
			value: function () {
				this.$input.setSelected( this.value );
			},
			disabled: function () {
				this.$input.setDisabled( this.disabled );
			}
		},
		beforeDestroy: function () {
			this.$input.off( 'change' );
		}
	} );

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );
