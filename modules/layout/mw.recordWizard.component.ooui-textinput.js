'use strict';

( function ( mw, $, rw, OO ) {

	Vue.component( 'ooui-textinput', {
		template: '<div></div>',
		props: {
			value: String,
			placeholder: String,
			disabled: { type: Boolean, default: false },
			inputId: String,
			label: String
		},
		mounted: function () {
			this.$input = new OO.ui.TextInputWidget( {
				$element: $( this.$el ),
				inputId: this.inputId,
				disabled: this.disabled,
				value: this.value,
				placeholder: this.placeholder,
				label: this.label
			} );
			this.$input.on( 'change', this.$emit.bind( this, 'input' ) );
			this.$input.on( 'enter', this.$emit.bind( this, 'enter' ) );
		},
		watch: {
			value: function () {
				this.$input.setValue( this.value );
			},
			disabled: function () {
				this.$input.setDisabled( this.disabled );
			}
		},
		beforeDestroy: function () {
			this.$input.off( 'change' );
			this.$input.off( 'enter' );
		}
	} );

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );
