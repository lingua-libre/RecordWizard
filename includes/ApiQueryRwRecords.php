<?php
/**
 *
 * @license GPL2+
 * @file
 *
 * @author Antoine Lamielle
 */
namespace RecordWizard;

use ApiQuery;
use ApiBase;
use ApiQueryBase;
use Wikimedia\Rdbms\Database;
use MWException;

/**
 * This class implements action=query&list=rwrecords API,
 * listing all records made by a speaker in a given language.
 * @package RecordWizard
 */
class ApiQueryRwRecords extends ApiQueryBase {

	/**
	 * @param ApiQuery $query
	 * @param string $moduleName
	 */
	public function __construct( ApiQuery $query, $moduleName ) {
		parent::__construct( $query, $moduleName, 'rwr' );
	}

	public function execute() {
		// Parameter handling
		$params = $this->extractRequestParams();
		$speakerQid = $params['speaker'];
		$langQid = $params['language'];
		$limit = $params['limit'];
		$offset = $params['offset'];
		$sort = $params['sort'] === 'pageid' ? 'page_id' : 'term_text';

        // Check whether the user has the appropriate local permissions
        $this->user = $this->getUser();
        $this->checkPermissions();

		$result = $this->getResult($limit);

		// Do the search ; for more details about this sql request, see T212580
		$dbr = wfGetDB( DB_REPLICA );
		$res = $dbr->select(
			array( 'pagelinks', 'page', 'wb_terms' ),
			array( 'term_text' ),
			array(
				'term_type' => 'label',
				'pl_from_namespace' => 0,
				'pl_namespace' => 0,
				'pl_title' => $speakerQid,
				'pl_from IN (select pl_from from pagelinks WHERE pl_from_namespace = 0 AND pl_namespace = 0 AND pl_title = ' . $dbr->addQuotes($langQid) . ')',
			),
			__METHOD__,
			array( 'OFFSET' => $offset, 'LIMIT' => $limit + 1, 'ORDER BY' => $sort ),
			array(
				'page' => array( 'INNER JOIN', array( 'page_id = pl_from' ) ),
				'wb_terms' => array( 'INNER JOIN', array( 'page_title = term_full_entity_id' ) ),
			)
		);

		// Format the output
		$index = 0;
		$result->addValue( [ 'query' ], $this->getModuleName(), [] );
		foreach( $res as $row ) {
			$result->addValue( [ 'query', $this->getModuleName() ], null, $row->term_text );

			$index++;
			if( $index >= $limit ) {
				break;
			}
		}

		if ( $res->numRows() >= $limit ) {
			$this->setContinueEnumParameter( 'offset', $offset + $limit );
		}
	}

    protected function checkPermissions() {
		if ( !$this->user->isLoggedIn() ) {
		    $this->dieWithError( [ 'apierror-mustbeloggedin', $this->msg( 'action-upload' ) ] );
		}
        if ( $this->user->isBlocked() ) {
            $this->dieBlocked( $this->user->getBlock() );
        }
        if ( $this->user->isBlockedGlobally() ) {
            $this->dieBlocked( $this->user->getGlobalBlock() );
        }
    }

	protected function getAllowedParams() {
        return [
            'speaker' => [
                ApiBase::PARAM_TYPE => 'string',
                ApiBase::PARAM_REQUIRED => true,
            ],
            'language' => [
                ApiBase::PARAM_TYPE => 'string',
                ApiBase::PARAM_REQUIRED => true,
            ],
			'sort' => array(
				ApiBase::PARAM_DFLT => 'transcription',
				ApiBase::PARAM_TYPE => array(
					'transcription',
					'pageid'
				)
			),
            'limit' => [
                ApiBase::PARAM_DFLT => 10,
                ApiBase::PARAM_TYPE => 'limit',
                ApiBase::PARAM_MIN => 1,
                ApiBase::PARAM_MAX => 100000,
                ApiBase::PARAM_MAX2 => 100000,
            ],
			'offset' => [
				ApiBase::PARAM_DFLT => 0,
				ApiBase::PARAM_TYPE => 'integer',
				ApiBase::PARAM_HELP_MSG => 'api-help-param-continue',
			],
        ];
    }
}
