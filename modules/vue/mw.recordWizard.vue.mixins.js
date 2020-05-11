'use strict';

( function ( mw, rw ) {
	/**
	 * Common data and methods for all steps
	 */
	rw.vue.step = {
		data: {
			config: rw.store.config.data,
			state: rw.store.state.data
		},
		created: function () {
			this.$api = new mw.Api();
		},
		methods: {
			canMovePrev: function () {
				return true;
			},
			canMoveNext: function () {
				return true;
			}
		}
	};

	rw.vue.list = {
		data: {
			autoScroll: true,
			selected: 0,
			selectedArray: [],
			words: rw.store.record.data.words
		},
		created: function () {},
		watch: {
			selected: function () {
				var list, itemNode, container;

				if ( this.autoScroll === true ) {
					list = $( this.$el ).find( '.mwe-rw-list' );
					itemNode = list.children().eq( this.selected );
					container = list.parent();

					container.stop().animate( {
						scrollTop: itemNode.offset().top - container.offset().top + container.scrollTop() - ( itemNode.innerHeight() - itemNode.height() )
					} );
				}
			}
		},
		methods: {
			initSelection: function () {
				var i;

				// We use an array to dynamically store the selected class
				// for performance reason (it is way quicker to replace a specific
				// value in an array than re-render the complete list each time
				this.selectedArray.splice( 0, this.selectedArray.length );
				for ( i = 0; i < this.words.length; i++ ) {
					this.selectedArray.push( false );
				}

				// Select first selectable word
				for ( i = 0; i < this.words.length; i++ ) {
					if ( this.isSelectable( this.words[ i ] ) === true ) {
						this.selectWord( i );
						break;
					}
				}
			},
			selectWord: function ( index ) {
				var data = this.beforeSelectionChange();

				this.selectedArray[ this.selected ] = false;
				this.selected = index;
				this.selectedArray[ index ] = ' mwe-rw-selected';

				this.afterSelectionChange( data );

				return true;
			},
			moveBackward: function () {
				var i;

				for ( i = this.selected - 1; i >= 0; i-- ) {
					if ( this.isSelectable( this.words[ i ] ) === true ) {
						this.selectWord( i );
						return true;
					}
				}

				return false;
			},
			moveForward: function () {
				var i;

				for ( i = this.selected + 1; i < this.words.length; i++ ) {
					if ( this.isSelectable( this.words[ i ] ) === true ) {
						this.selectWord( i );
						return true;
					}
				}

				return false;
			},
			isSelectable: function () {
				return true;
			},
			beforeSelectionChange: function () {
				return true;
			},
			afterSelectionChange: function () {
				return true;
			}
		}
	};

}( mediaWiki, mediaWiki.recordWizard ) );
