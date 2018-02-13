/**
 * Object that represents the entire multi-step Record Wizard
 */
( function ( mw, rw, $ ) {

	rw.RecordWizard = function ( config ) {
		// making a sort of global for now
		rw.config = config;
		// Shortcut for local references
		this.config = config;

        var fileQueue = [];

        window.um = new rw.UploadManager();
        window.wls = new rw.libs.WordListStudio( { $element: $( '#wordliststudio' ) }, function( audioRecord, $word ) {
            $word.addClass( 'studio-wordlist-waiting' );
            var record = new rw.Record( audioRecord.getBlob(), $word.text() );
            fileQueue.push( record );
            window.um.uploadToStash( record ).then( function( result ) {
                $word.removeClass( 'studio-wordlist-waiting' );
                $word.addClass( 'studio-wordlist-success' );
            } ).fail( function() {
                $word.removeClass( 'studio-wordlist-waiting' );
                $word.addClass( 'studio-wordlist-error' );
            } );
        } );

        $( '.studio-wordlist input' ).keypress( function( e ) {
            if ( ( e.which === 13 ) && $( '.studio-wordlist input' ).val().trim() !== '' ) {
                $( '.studio-wordlist input' ).before( $( '<li>' ).text( $( '.studio-wordlist input' ).val().trim() ) );
                $( '.studio-wordlist input' ).val( '' );
                wordListStudio.setWordsEvents();

                $( '.studio-wordlist' ).animate( { scrollTop: $( '.studio-wordlist' ).prop( 'scrollHeight' ) - $( '.studio-wordlist' ).height() }, 100 );
            }
        } );

        mw.loader.using( 'oojs-ui', function() {
            button = new OO.ui.ButtonWidget( {
	            label: 'Upload to commons',
	            flags: [ 'primary', 'progressive' ]
            } );
            $( '#mw-content-text' ).append('<br>').append( button.$element );
            button.on( 'click', function() {
                while( fileQueue.length > 0 ) {
                    var record = fileQueue.pop();

                    if ( record.state === 'stashed' ) {
                        window.um.finishUpload( record );
                    }
                };
            } );
        } );
	};


	$( function () {
	    // show page.
	    new rw.RecordWizard( mw.config.get( 'RecordWizardConfig' ) );
    } );


}( mediaWiki, mediaWiki.recordWizard, jQuery ) );

