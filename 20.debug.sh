#!/bin/sh

. ./00.config.sh

EXT_FILE_NAME="${EXT_FILE_NAME%.user.js}.debug.js"
EXTRA_PARAMS="--define DEF_DEBUG=true --compilation_level BUNDLE"


. ./99.build.sh
. ./98.format.sh

echo "===> Done."
