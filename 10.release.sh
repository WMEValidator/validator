#!/bin/sh -e

. ./00.config.sh

EXTRA_PARAMS="--compilation_level ADVANCED_OPTIMIZATIONS"


. ./99.build.sh

echo "===> Done."
