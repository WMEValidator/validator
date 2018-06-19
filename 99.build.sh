#!/bin/sh

if [ -z "${SRC_DIR}" ]; then
	echo "No config found"
	exit 1
fi

mkdir -p "${TMP_DIR}"

LOC_FILE="${TMP_DIR}/gen-i18n.js"
rm -f "${LOC_FILE}"

## Generate localization file
cat "${SRC_DIR}/meta/i18n-begin.js" > "${LOC_FILE}"
printf "Localizations:"
for FILE in $(ls -r ${SRC_DIR}/i18n/*.js); do
	CODE="${FILE##*/}"
	CODE="${CODE%%.js}"
	if [ "${CODE}" = "default" ]; then
		CODE="EN"
	fi
	printf " ${CODE}"
	echo "\"${CODE}\": {" >> "${LOC_FILE}"
	echo "\".codeISO\": \"${CODE}\"," >> "${LOC_FILE}"
	cat "${FILE}" >> "${LOC_FILE}"
	echo "}, // ${CODE}" >> "${LOC_FILE}"
done
echo
cat "${SRC_DIR}/meta/i18n-end.js" >> "${LOC_FILE}"

java -jar "${COMPILER}" \
	--language_in ECMASCRIPT5 \
	--js "${SRC_DIR}/src/release.js" \
	--js "${LOC_FILE}" \
	--js "${SRC_DIR}/src/helpers.js" \
	--js "${SRC_DIR}/src/data.js" \
	--js "${SRC_DIR}/src/basic.js" \
	--js "${SRC_DIR}/src/report.js" \
	--js "${SRC_DIR}/src/validate.js" \
	--js "${SRC_DIR}/src/login.js" \
	--js "${SRC_DIR}/src/other.js" \
	--js "${SRC_DIR}/src/lib/i18n.js" \
	--js "${SRC_DIR}/src/lib/audio.js" \
	--js "${SRC_DIR}/src/lib/thui.js" \
	--externs "${SRC_DIR}/meta/wme-externs.js" \
	--externs "${SRC_DIR}/meta/jquery-1.9.js" \
	--js_output_file "${TMP_DIR}/gen-${EXT_NAME}-compiled.js" \
	--use_types_for_optimization \
	--warning_level=VERBOSE \
	--jscomp_warning=checkTypes \
	--jscomp_warning=missingProperties \
	--jscomp_off es5Strict \
	${EXTRA_PARAMS}

if [ $? != 0 ]; then
	read -p "Stop on error. Press enter to exit..."
	exit 1
fi

mkdir -p "${DST_DIR}"
cat "${SRC_DIR}/meta/meta-begin.js" \
	"${TMP_DIR}/gen-${EXT_NAME}-compiled.js" \
	"${SRC_DIR}/meta/meta-end.js" \
	> "${DST_DIR}/${EXT_FILE_NAME}.user.js"
