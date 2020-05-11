'use strict';

( function ( mw, $, rw, OO ) {

	Vue.component( 'ooui-popup', {
		template: '<div><span class="ooui-popup-trigger" href="#" @click.prevent.stop="toggle"><slot name="trigger"></slot></span><div class="ooui-popup-content"><slot name="content"></slot></div></div>',
		props: {
			value: { type: Boolean, default: false },
			width: { type: Number, default: 300 },
			align: { type: String, default: 'backwards' },
			label: { type: String, default: '' },
			head: { type: Boolean, default: false },
			autoClose: { type: Boolean, default: true },
			anchor: { type: Boolean, default: true }
		},
		mounted: function () {
			this.$popup = new OO.ui.PopupWidget( {
				$content: $( this.$el ).children( '.ooui-popup-content' ),
				padded: true,
				width: this.width,
				$floatableContainer: $( this.$el ).children( '.ooui-popup-trigger' ),
				$autoCloseIgnore: $( this.$el ).children( '.ooui-popup-trigger' ),
				align: this.align,
				autoClose: this.autoClose,
				head: this.head || this.label !== '',
				label: this.label,
				anchor: this.anchor
			} );
			$( this.$el ).append( this.$popup.$element );
			this.$popup.on( 'toggle', this.onToggle.bind( this ) );

			if ( this.value === true ) {
				this.$popup.toggle( true );
			}
		},
		watch: {
			value: function () {
				this.$popup.toggle( this.value );
			}
		},
		beforeDestroy: function () {
			this.$popup.off( 'toggle' );
		},
		methods: {
			toggle: function () {
				this.$popup.toggle();
			},
			onToggle: function ( visible ) {
				this.$emit( 'input', visible );
			}
		}
	} );

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );
