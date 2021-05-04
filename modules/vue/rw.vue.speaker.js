'use strict';

( function ( mw, rw, OO ) {
	/**
	 * The Speaker step.
	 */
	rw.vue.speaker = new Vue( {
		mixins: [ rw.vue.step ],

		/* Data */
		data: {
			profiles: [],
			metadata: rw.store.record.data.metadata,
			genderOptions: [
				{
					data: rw.store.config.data.items.genderMale,
					label: mw.msg( 'mwe-recwiz-gender-male' )
				},
				{
					data: rw.store.config.data.items.genderFemale,
					label: mw.msg( 'mwe-recwiz-gender-female' )
				},
				{
					data: rw.store.config.data.items.genderOther,
					label: mw.msg( 'mwe-recwiz-gender-other' )
				}
			],
			availableLanguages: [],
			availableLicenses: []
		},

		/* Hooks */
		created: function () {
			var qid, code;

			/* Fill profiles */
			this.profiles.push( {
				optgroup: mw.msg( 'mwe-recwiz-speaker-profilemain' )
			} );
			this.profiles.push( {
				data: this.config.speaker.qid || '*',
				label: this.config.speaker.name
			} );
			this.profiles.push( {
				optgroup: mw.msg( 'mwe-recwiz-speaker-profileother' )
			} );
			for ( qid in this.config.otherSpeakers ) {
				this.profiles.push( {
					data: qid,
					label: this.config.otherSpeakers[ qid ].name
				} );
			}
			this.profiles.push( {
				data: '+',
				label: mw.msg( 'mwe-recwiz-speaker-profilenew' )
			} );

			/* Fill all fields with the default speaker datas */
			rw.store.record.setSpeaker( this.config.speaker );

			/* Set available languages */
			for ( code in this.config.languages ) {
				this.availableLanguages.push( {
					data: this.config.languages[ code ].qid,
					label: this.config.languages[ code ].localname
				} );
			}

			/* Set available licenses from data comming from [[Special:Licenses]] */
			this.buildLicenses( this.config.licenses );
		},

		/* Methods */
		watch: {
			'metadata.speaker.qid': function () {
				if ( this.metadata.speaker.qid === this.config.speaker.qid || this.metadata.speaker.qid === '*' ) {
					rw.store.record.setSpeaker( this.config.speaker );
				} else if ( this.metadata.speaker.qid[ 0 ] === 'Q' ) {
					rw.store.record.setSpeaker( this.config.otherSpeakers[ this.metadata.speaker.qid ] );
				} else {
					rw.store.record.setSpeaker( {
						qid: '+',
						new: true
					} );
				}
			},
			'metadata.speaker.name': function () {
				var i;

				if ( this.metadata.speaker.new === true ) {
					return;
				}

				for ( i = 0; i < this.profiles.length; i++ ) {
					if ( this.profiles[ i ].data === this.metadata.speaker.qid ) {
						this.profiles[ i ].label = this.metadata.speaker.name;
					}
				}
			}
		},
		computed: {
			licenseText: function () {
				return mw.msg( 'mwe-recwiz-speaker-licensecontent', this.metadata.speaker.name );
			}
		},
		methods: {
			buildLicenses: function ( node ) {
				var i, key;

				if ( node.template !== undefined ) {
					node = [ node ];
				}
				if ( Array.isArray( node ) ) {
					for ( i = 0; i < node.length; i++ ) {
						this.availableLicenses.push( {
							label: node[ i ].text,
							data: node[ i ].template
						} );
					}
				} else {
					for ( key in node ) {
						this.buildLicenses( node[ key ] );
					}
				}
			},
			canMoveNext: function () {
				var qid, deferred,
					process = new OO.ui.Process();

				/* Validate the datas */
				if ( this.metadata.speaker.name === '' ) {
					OO.ui.alert( mw.msg( 'mwe-recwiz-error-noname' ) );
					return false;
				}
				if ( this.metadata.speaker.name === this.config.speaker.name && this.metadata.speaker.main !== true ) {
					OO.ui.alert( mw.msg( 'mwe-recwiz-error-duplicatename', this.metadata.speaker.name ) );
					return false;
				}
				for ( qid in this.config.otherSpeakers ) {
					if ( this.metadata.speaker.name === this.config.otherSpeakers[ qid ].name && this.metadata.speaker.qid !== qid ) {
						OO.ui.alert( mw.msg( 'mwe-recwiz-error-duplicatename', this.metadata.speaker.name ) );
						return false;
					}
				}
				if ( Object.keys( this.metadata.speaker.languages || {} ).length === 0 ) {
					OO.ui.alert( mw.msg( 'mwe-recwiz-error-nolanguages' ) );
					return false;
				}

				/* Create or update the speaker item in the wikibase */
				this.$wbItem = new mw.recordWizard.wikibase.Item();

				if ( this.metadata.speaker.new === false ) {
					process.next( this.getExistingWbItem, this ); // get the existing item
				}

				process.next( this.fillWbItem, this ); // save the formed item
				process.next( this.createOrUpdateWbItem, this ); // save the formed item
				process.next( this.saveOptions, this ); // save options

				deferred = process.execute();
				deferred.fail( function ( code, data ) {
					console.error( '[RecordWizard]', code, data );
					OO.ui.alert( mw.msg( 'mwe-recwiz-error-network' ) );
				} );

				return deferred;
			},

			/**
			 * Get the Wikibase Item of the selected speaker through the API.
			 *
			 * @return {$.Deferred}  A promise, resolved when we're done
			 */
			getExistingWbItem: function () {
				return this.$wbItem.setId( this.metadata.speaker.qid ).getFromApi( this.$api );
			},

			/**
			 * Fill the Wikibase item of the speaker with the values given by the UI.
			 */
			fillWbItem: function () {
				var qid,
					name = this.metadata.speaker.name,
					gender = this.metadata.speaker.gender,
					location = this.metadata.speaker.location,
					languages = this.metadata.speaker.languages,
					instanceOfStatement = new mw.recordWizard.wikibase.Statement( this.config.properties.instanceOf ).setType( 'wikibase-item' ).setValue( this.config.items.speaker ),
					userStatement = new mw.recordWizard.wikibase.Statement( this.config.properties.linkedUser ).setType( 'external-id' ).setValue( mw.config.get( 'wgUserName' ) ).setRank( 2 ),
					locationStatement = new mw.recordWizard.wikibase.Statement( this.config.properties.residencePlace ),
					genderStatement = new mw.recordWizard.wikibase.Statement( this.config.properties.gender ),
					languageStatements = [];

				this.$wbItem.labels = {
					en: name
				};
				this.$wbItem.descriptions = {
					en: 'speaker of the user "' + mw.config.get( 'wgUserName' ) + '"'
				};

				locationStatement.setType( location === '' ? 'somevalue' : 'external-id' ).setValue( location );
				genderStatement.setType( gender === null ? 'somevalue' : 'wikibase-item' ).setValue( gender );

				this.$wbItem.addOrReplaceStatements( instanceOfStatement, true );
				this.$wbItem.addOrReplaceStatements( userStatement, true );
				this.$wbItem.addOrReplaceStatements( locationStatement, true );
				this.$wbItem.addOrReplaceStatements( genderStatement, true );

				for ( qid in languages ) {
					languageStatements.push( new mw.recordWizard.wikibase.Statement( this.config.properties.spokenLanguages )
						.setType( 'wikibase-item' )
						.setValue( qid )
						.addQualifier( new mw.recordWizard.wikibase.Snak(
							this.config.properties.languageLevel,
							'wikibase-item',
							languages[ qid ].languageLevel
						) )
						.addQualifier( new mw.recordWizard.wikibase.Snak(
							this.config.properties.learningPlace,
							'external-id',
							languages[ qid ].location
						) )
					);
				}
				this.$wbItem.addOrReplaceStatements( languageStatements, true );
			},

			/**
			 * Save the Wikibase item (update it if it already exists, create it if not)
			 *
			 * @return {$.Deferred}  A promise, resolved when we're done
			 */
			createOrUpdateWbItem: function () {
				return this.$wbItem.createOrUpdate( this.$api ).then( this.updateConfig.bind( this ) );
			},

			/**
			 * Update the global config with the new informations we got on the speaker.
			 *
			 * @param {Object} data Information returned by the wikibase API
			 */
			updateConfig: function ( data ) {
				/* Update the config */
				if ( this.metadata.speaker.main === true ) {
					this.metadata.speaker.new = false;
					this.config.speaker = $.extend( true, {}, this.metadata.speaker, {
						qid: data.entity.id
					} );
				} else {
					/* Update available profiles */
					if ( this.metadata.speaker.new === true ) {
						this.profiles.splice( this.profiles.length - 1, 0, {
							data: data.entity.id,
							label: this.metadata.speaker.name
						} );
					}

					this.metadata.speaker.new = false;
					this.config.otherSpeakers[ data.entity.id ] = $.extend( true, {}, this.metadata.speaker, {
						qid: data.entity.id
					} );
				}
				this.metadata.speaker.qid = data.entity.id;
			},

			/**
			 * Save some options in a personal subpage.
			 *
			 * This includes the main speaker Qid, all the secondary speakers Qid, and
			 * the preferred license. This will allow to preload those data at the next
			 * use of the RecordWizard.
			 *
			 * @return {$.Deferred}  A promise, resolved when we're done
			 */
			saveOptions: function () {
				var userConfig = {
					speaker: this.config.speaker.qid,
					otherSpeakers: Object.keys( this.config.otherSpeakers ),
					license: this.metadata.license
				};
				return this.$api.postWithToken( 'csrf', {
					action: 'edit',
					format: 'json',
					title: 'User:' + mw.config.get( 'wgUserName' ) + '/RecordWizard.json',
					text: JSON.stringify( userConfig ),
					summary: 'personal config update',
					recreate: 1
				} ).fail( function () {
					// TODO: manage errors
				} );
			}
		}
	} );

}( mediaWiki, mediaWiki.recordWizard, OO ) );
