#!/usr/bin/env bash

mkdir -p lib/lingua-recorder ;
cp -v node_modules/lingua-recorder/src/*.js lib/lingua-recorder/ ;

echo "mediaWiki.recordWizard.libs.AudioRecord = AudioRecord;" >> lib/lingua-recorder/AudioRecord.js ;
echo "mediaWiki.recordWizard.libs.LinguaRecorder = LinguaRecorder;" >> lib/lingua-recorder/LinguaRecorder.js ;

cp -v node_modules/vue/dist/vue.min.js lib/ ;
