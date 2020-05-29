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
		global $wgRecordWizardConfig;

		// Parameter handling
		$params = $this->extractRequestParams();
		$speakerQid = $params['speaker'];
		$langQid = $params['language'];
		$limit = $params['limit'];
		$offset = $params['offset'];
		$sort = $params['sort'] === 'pageid' ? 'page_id' : 'term_text';
		$dir = $params['dir'] === 'ascending' ? 'ASC' : 'DESC';
		$format = $params['format'];

		$result = $this->getResult($limit);

		// Do the search ; for more details about this sql request, see T212580
		$dbr = wfGetDB( DB_REPLICA );

		$where = array(
			'term_type' => 'label',
			'pl_from_namespace' => 0,
			'pl_namespace' => 0,
			'pl_title' => $wgRecordWizardConfig['items']['record'],
		);
		if ( $speakerQid !== NULL ) {
			$where[] = 'pl_from IN (select pl_from from pagelinks WHERE pl_from_namespace = 0 AND pl_namespace = 0 AND pl_title = ' . $dbr->addQuotes($speakerQid) . ')';
		}
		if ( $langQid !== NULL ) {
			$where[] = 'pl_from IN (select pl_from from pagelinks WHERE pl_from_namespace = 0 AND pl_namespace = 0 AND pl_title = ' . $dbr->addQuotes($langQid) . ')';
		}

		$res = $dbr->select(
			array( 'pagelinks', 'page', 'wb_terms' ),
			array( 'term_text', 'term_full_entity_id' ),
			$where,
			__METHOD__,
			array( 'OFFSET' => $offset, 'LIMIT' => $limit + 1, 'ORDER BY' => $sort . ' ' . $dir ),
			array(
				'page' => array( 'INNER JOIN', array( 'page_id = pl_from' ) ),
				'wb_terms' => array( 'INNER JOIN', array( 'page_title = term_full_entity_id' ) ),
			)
		);

		// Format the output
		$index = 0;
		$result->addValue( [ 'query' ], $this->getModuleName(), [] );
		foreach( $res as $row ) {
			if ( $format === 'transcription' ) {
				$result->addValue( [ 'query', $this->getModuleName() ], null, $row->term_text );
			} else {
				$result->addValue( [ 'query', $this->getModuleName() ], null, $row->term_full_entity_id );
			}

			$index++;
			if( $index >= $limit ) {
				break;
			}
		}

		if ( $res->numRows() >= $limit ) {
			$this->setContinueEnumParameter( 'offset', $offset + $limit );
		}
	}

	protected function getAllowedParams() {
        return [
            'speaker' => [
                ApiBase::PARAM_TYPE => 'string',
            ],
            'language' => [
                ApiBase::PARAM_TYPE => 'string',
            ],
			'sort' => array(
				ApiBase::PARAM_DFLT => 'transcription',
				ApiBase::PARAM_TYPE => array(
					'transcription',
					'pageid'
				)
			),
			'dir' => array(
				ApiBase::PARAM_DFLT => 'ascending',
				ApiBase::PARAM_TYPE => array(
					'ascending',
					'descending'
				)
			),
			'format' => array(
				ApiBase::PARAM_DFLT => 'transcription',
				ApiBase::PARAM_TYPE => array(
					'transcription',
					'qid'
				)
			),
            'limit' => [
                ApiBase::PARAM_DFLT => 10,
                ApiBase::PARAM_TYPE => 'limit',
                ApiBase::PARAM_MIN => 1,
                ApiBase::PARAM_MAX =>  10000,
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
