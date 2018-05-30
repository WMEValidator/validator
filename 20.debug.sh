#!/bin/sh

. ./00.config.sh

EXTRA_PARAMS="--define DEF_DEBUG=true \
	--compilation_level SIMPLE_OPTIMIZATIONS \
	--formatting PRETTY_PRINT"

. ./99.build.sh
