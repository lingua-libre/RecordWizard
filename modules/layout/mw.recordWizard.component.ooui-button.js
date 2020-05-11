'use strict';

( function ( mw, $, rw, OO ) {

	Vue.component( 'ooui-button', {
		template: '<div></div>',
		props: {
			flags: { type: String, default: '' },
			label: String,
			icon: String,
			framed: { type: Boolean, default: true },
			disabled: { type: Boolean, default: false },
			href: String,
			target: String
		},
		mounted: function () {
			var invisibleLabel = false;

			if ( this.label === undefined || this.label === '' ) {
				invisibleLabel = true;
			}

			this.$button = new OO.ui.ButtonWidget( {
				$element: $( this.$el ),
				label: this.label,
				invisibleLabel: invisibleLabel,
				flags: this.flags.split( ' ' ),
				icon: this.icon,
				framed: this.framed,
				href: this.href,
				target: this.target,
				disabled: this.disabled
			} );
			this.$button.on( 'click', this.$emit.bind( this, 'click' ) );
		},
		watch: {
			label: function () {
				this.$button.setLabel( this.label );
			},
			disabled: function () {
				this.$button.setDisabled( this.disabled );
			}
		},
		beforeDestroy: function () {
			this.$button.off( 'click' );
		}
	} );

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );
