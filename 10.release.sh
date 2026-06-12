#!/bin/sh -e

. ./00.config.sh

#EXTRA_PARAMS="--compilation_level ADVANCED_OPTIMIZATIONS"
EXTRA_PARAMS="--compilation_level WHITESPACE_ONLY"


. ./99.build.sh

echo "===> Done."
