'use strict';

( function ( mw, $, rw, OO ) {

	Vue.component( 'ooui-numberinput', {
		template: '<div></div>',
		props: {
			value: Number,
			placeholder: String,
			disabled: { type: Boolean, default: false },
			inputId: String,
			label: String,
			min: Number,
			max: Number,
			step: Number,
			percentage: { type: Boolean, default: false }
		},
		mounted: function () {
			this.$input = new OO.ui.NumberInputWidget( {
				$element: $( this.$el ),
				inputId: this.inputId,
				disabled: this.disabled,
				value: ( this.percentage === true ? this.safePercent() : this.value ),
				placeholder: this.placeholder,
				label: this.label,
				min: this.min,
				max: this.max,
				step: this.step
			} );
			this.$input.on( 'change', this.onChange.bind( this ) );
		},
		watch: {
			value: function () {
				this.$input.setValue( this.percentage === true ? this.safePercent() : this.value );
			},
			disabled: function () {
				this.$button.setDisabled( this.disabled );
			}
		},
		beforeDestroy: function () {
			this.$input.off( 'change' );
		},
		methods: {
			onChange: function ( value ) {
				value = parseFloat( value );
				if ( this.percentage === true ) {
					value /= 100;
				}
				// Remove unnecessary digits (thanks js for being so bad at float number handling)
				value = parseFloat( value.toPrecision( 7 ) );
				this.$emit( 'input', value );
			},
			safePercent: function () {
				return parseFloat( ( this.value * 100 ).toPrecision( 7 ) );
			}
		}
	} );

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );
