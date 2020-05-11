'use strict';

( function ( mw, $, rw, OO ) {

	Vue.component( 'ooui-simpledialog', {
		template: '<div><span class="ooui-dialog-trigger" href="#" @click.prevent.stop="open"><slot name="trigger"></slot></span><div class="ooui-dialog-content"><slot name="content"></slot></div></div>',
		props: {
			name: { type: String, default: '' },
			size: { type: String, default: 'medium' }
		},
		mounted: function () {
			this.$id = Date.now();
			this.$dialog = this.dialogFactory( this.name + 'sd' + this.$id, this.size, $( this.$el ).children( '.ooui-dialog-content' ) );
		},
		beforeDestroy: function () {},
		methods: {
			open: function () {
				this.$dialog.open();
			},
			dialogFactory: function ( title, size, content ) {
				var dialog, windowManager,
					SimpleDialog = function ( config ) {
						SimpleDialog.super.call( this, config );
					};

				OO.inheritClass( SimpleDialog, OO.ui.Dialog );
				SimpleDialog.static.title = title;
				SimpleDialog.static.name = title;

				SimpleDialog.prototype.initialize = function () {
					SimpleDialog.super.prototype.initialize.apply( this, arguments );
					this.content = new OO.ui.PanelLayout( {
						padded: true,
						expanded: false
					} );
					this.closeButton = new OO.ui.ButtonWidget( {
						framed: false,
						icon: 'close',
						classes: [ 'ooui-dialog-closebutton' ]
					} );
					this.closeButton.on( 'click', this.close.bind( this ) );
					this.content.$element.append( this.closeButton.$element ).append( content );
					this.$body.append( this.content.$element );
				};
				SimpleDialog.prototype.getBodyHeight = function () {
					return this.content.$element.outerHeight( true );
				};

				// Instanciate our new dialog class
				dialog = new SimpleDialog( {
					size: size
				} );
				// Create a dedicated window manager for it
				windowManager = new OO.ui.WindowManager();
				$( document.body ).append( windowManager.$element );
				windowManager.addWindows( [ dialog ] );

				// Modify the Window so that a click outside the modal closes it
				windowManager.getWindow( title ).then( function ( window ) {
					window.$element.on( 'click', function ( e ) {
						if ( e.target === this ) {
							dialog.close();
						}
					} );
				} );

				return dialog;
			}
		}
	} );

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );
