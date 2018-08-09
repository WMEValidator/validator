#!/bin/sh

echo "===> Formatting ${EXT_FILE_NAME}..."

clang-format \
	-style='{BasedOnStyle: Google, UseTab: Always, TabWidth: 4, ColumnLimit: 110}' \
	"${DST_DIR}/${EXT_FILE_NAME}" > "${DST_DIR}/${EXT_FILE_NAME}.fmt" \
	&& mv -f "${DST_DIR}/${EXT_FILE_NAME}.fmt" "${DST_DIR}/${EXT_FILE_NAME}"
