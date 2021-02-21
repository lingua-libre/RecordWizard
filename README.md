# Record Wizard
The RecordWizard is a [MediaWiki](https://mediawiki.org) extension allowing mass recording of clean, well cut, well named pronunciation files.

It was created to run [Lingua Libre](https://lingualibre.org) and their development is therefore strongly correlated, but the extension was made to be usable on another MediaWiki instance.

## Getting Started
### Prerequisites
For the RecordWizard to work, a running installation of MediaWiki 1.30+ is required, with the following extensions installed:
- [Wikibase Repository](https://www.mediawiki.org/wiki/Extension:Wikibase_Repository)
- [OAuthAuthentication](https://www.mediawiki.org/wiki/Extension:OAuthAuthentication) (in case of issues with recent versions of MediaWiki, try installing [this patched version](https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/extensions/OAuthAuthentication/+/refs/changes/30/251930/25) of this extension)
- [Upload2Commons](https://github.com/lingua-libre/Upload2Commons)

**(optional)** This extension integrates best with the [BlueLL](https://github.com/lingua-libre/BlueLL) skin.

You will also have to use [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm), be sure to have it up and running.

### Installing
- Download and place the file(s) in a directory called RecordWizard in your `extensions/` folder.
- Install additional libraries by running `npm install` in this folder
- Add the following code at the bottom of your LocalSettings.php:
`wfLoadExtension( 'RecordWizard' );`

#### Configuration parameters
The RecordWizard requires the creation of some properties and items in you local Wikibase repository installation. Once done, add the following code (completed with propery and item ids) at the bottom of your LocalSettings.php. Property types are indicated in comments.

```
$wgRecordWizardConfig['properties'] = array(
	'langCode'          => 'P...', //external-id
	'iso3'              => 'P...', //external-id
	'gender'            => 'P...', //wikibase-item
	'spokenLanguages'   => 'P...', //wikibase-item
	'instanceOf'        => 'P...', //wikibase-item
	'linkedUser'        => 'P...', //external-id
	'subclassOf'        => 'P...', //wikibase-item
	'audioRecord'       => 'P...', //commonsMedia
	'speaker'           => 'P...', //wikibase-item
	'date'              => 'P...', //time
	'transcription'     => 'P...', //string
	'wikidataId'        => 'P...', //external-id
	'languageLevel'     => 'P...', //wikibase-item
	'residencePlace'    => 'P...', //external-id
	'learningPlace'     => 'P...', //external-id
	'qualifier'         => 'P...', //string
	'wikipediaTitle'    => 'P...', //external-id
	'wiktionaryEntry'   => 'P...', //external-id
	'mediaType'         => 'P...', //wikibase-item
	'wikivoyageTitle'   => 'P...'  //external-id
);

$wgRecordWizardConfig['items'] = array(
	'genderMale'        => 'Q...',
	'genderFemale'      => 'Q...',
	'genderOther'       => 'Q...',
	'language'          => 'Q...',
	'speaker'           => 'Q...',
	'record'            => 'Q...',
	'word'              => 'Q...',
	'langLevelNative'   => 'Q...',
	'langLevelGood'     => 'Q...',
	'langLevelAverage'  => 'Q...',
	'langLevelBeginner' => 'Q...',
	'mediaTypeAudio'    => 'Q...',
	'mediaTypeVideo'    => 'Q...'
);
```

You also have to define a namespace that can be used for list-managment (it can be an existing one or a specialy created one).
```
$wgRecordWizardConfig['listNamespace'] = 142; // replace 142 with the actual id of your list-namespace
```

## FAQ
- **How can I translate this extension to my language?**
  - Translations are managed on [TranslateWiki](https://translatewiki.net/w/i.php?title=Special:Translate&group=mwgithub-recordwizard).

## Contributing
First, please read MediaWiki's [code of conduct](https://www.mediawiki.org/wiki/Code_of_Conduct), which also applies here.

To find out your way through the code, here is a diagram showing the structure of the extension and the main interactions between it's components.
<img src="doc/diagram.svg"/>

## Authors
- **Antoine Lamielle** - *architect and main developper of Lingua Libre* - [0x010C](https://github.com/0x010C)

See also the list of [contributors](https://github.com/lingua-libre/RecordWizard/contributors) who participated in this project.

## License

This project is licensed under the GPL v2.0 License - see the [LICENSE](LICENSE) file for details

## Acknowledgments
- Development of this extension was originally funded by a grant of the Wikimedia Foundation (January -> July 2018)
- Development was in a second time sponsored by Wikimédia France (Mars -> May 2020)
