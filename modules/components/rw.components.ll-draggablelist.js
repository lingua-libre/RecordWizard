'use strict';

( function ( mw, $, rw ) {

	Vue.component( 'll-draggablelist', {
		template: '<ul></ul>',
		props: {
			value: { type: Array, default: function () { return []; } }
		},
		mounted: function () {
			this.$list = new rw.widgets.DraggableGroupWidget( {
				$element: $( this.$el ),
				items: []
			} );

			this.$itemStore = {};
			this.$shouldRefill = true;
			this.fillList();
			this.$list.on( 'reorder', this.onOrderChange.bind( this ) );
		},
		watch: {
			value: function () {
				// Prevent refill when changes came from this component (for better perfs)
				if ( this.$shouldRefill === true ) {
					this.fillList();
				} else {
					this.$shouldRefill = true;
				}
			}
		},
		methods: {
			fillList: function () {
				var i, label,
					items = [];

				for ( i = 0; i < this.value.length; i++ ) {
					label = this.value[ i ];
					if ( this.$itemStore[ label ] === undefined ) {
						this.$itemStore[ label ] = new rw.widgets.DraggableItemWidget( {
							label: label
						} );
						this.$itemStore[ label ].on( 'remove', this.onRemoveItem.bind( this, label ) );
					}
					items.push( this.$itemStore[ label ] );
				}

				this.$list.clearItems();
				this.$list.addItems( items );
			},
			onOrderChange: function ( item, newIndex ) {
				var label = item.getLabel(),
					oldIndex = this.value.indexOf( label );

				/* Update order in the v-model value */
				this.$shouldRefill = false;
				this.value.splice( newIndex, 0, this.value.splice( oldIndex, 1 )[ 0 ] );
				this.$emit( 'input', this.value );
			},
			onRemoveItem: function ( label ) {
				this.$shouldRefill = false;

				/* Remove the item from the widget */
				this.$list.removeItems( [ this.$itemStore[ label ] ] );
				delete this.$itemStore[ label ];

				/* Remove the item from the v-model value */
				this.$emit( 'delete', label );
			}
		},
		beforeDestroy: function () {
			this.$list.off( 'reorder' );
		}
	} );

}( mediaWiki, jQuery, mediaWiki.recordWizard ) );
