#!/bin/sh

. ./00.config.sh

EXT_FILE_NAME="${EXT_FILE_NAME%.user.js}.gf.js"
EXTRA_PARAMS="--compilation_level WHITESPACE_ONLY"


. ./99.build.sh
. ./98.format.sh

echo "===> Done."
