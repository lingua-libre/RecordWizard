#!/usr/bin/env bash

cp -v node_modules/lingua-recorder/src/*.js lib/lingua-recorder/

for f in lib/lingua-recorder/*.js ; do
    filename=$(basename "$f") ;
    echo "mediaWiki.recordWizard.libs.${filename%.*} = ${filename%.*};" >> $f ;
done
