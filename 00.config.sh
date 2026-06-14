## Closure Compiler Maven Repo URLs
CC_BASE_URL="https://repo1.maven.org/maven2/com/google/javascript/closure-compiler"
CC_META_URL="${CC_BASE_URL}/maven-metadata.xml"

## Function to Verify MD5 of a local JAR against Maven Central's published checksum
## if md5sum does not match, jar is removed to be downloaded again.
verify_md5() {
    _jar="$1"
    _url="$2"
    if ! command -v md5sum >/dev/null 2>&1; then
        echo "WARNING: md5sum not found — skipping integrity check."
        return 0
    fi
    _expected=$(curl -fsSL --max-time 15 "${_url}.md5")
    if [ -z "${_expected}" ]; then
        echo "WARNING: Could not fetch MD5 from Maven Central — skipping integrity check."
        return 0
    fi
    _actual=$(md5sum "${_jar}" | cut -d' ' -f1)
    if [ "${_actual}" != "${_expected}" ]; then
        echo "ERROR: MD5 mismatch for ${_jar}"
        echo "       Expected: ${_expected}"
        echo "       Got:      ${_actual}"
		rm -f "${_jar}"
        return 1
    fi
    echo "===> MD5 OK (${_actual})"
    return 0
}

## Check if a closure-compiler JAR already exists locally
CC_JAR=$(ls closure-compiler-*.jar 2>/dev/null | head -n 1)

if [ -n "${CC_JAR}" ]; then
	# JAR found — extract version from filename and verify against Maven Central
    CC_VERSION="${CC_JAR#closure-compiler-}"
    CC_VERSION="${CC_VERSION%.jar}"
    CC_URL="${CC_BASE_URL}/${CC_VERSION}/${CC_JAR}"
    echo "===> Found local ${CC_JAR} — verifying integrity..."
    if ! verify_md5 "${CC_JAR}" "${CC_URL}"; then
        echo "===> Local JAR failed integrity check. Re-downloading..."
        CC_JAR=""
    fi
fi

if [ -z "${CC_JAR}" ]; then
    # JAR not found — resolve latest version and download
    echo "===> Resolving latest Closure Compiler version..."
    CC_VERSION=$(curl -fsSL --max-time 15 "${CC_META_URL}" | sed -n 's|.*<release>\(.*\)</release>.*|\1|p')
    if [ -z "${CC_VERSION}" ]; then
        echo "ERROR: Could not resolve Closure Compiler version from Maven Central."
        echo "       Check your internet connection or manually place the JAR in this directory."
        exit 1
    fi
    CC_JAR="closure-compiler-${CC_VERSION}.jar"
    CC_URL="${CC_BASE_URL}/${CC_VERSION}/${CC_JAR}"
    echo "===> Downloading Closure Compiler ${CC_VERSION}..."
    if ! curl -fSL --max-time 120 -o "${CC_JAR}" "${CC_URL}"; then
        rm -f "${CC_JAR}"
        echo "ERROR: Failed to download Closure Compiler ${CC_VERSION} from:"
        echo "       ${CC_URL}"
        echo "       Check your internet connection and try again."
        exit 1
    fi
    echo "===> Downloaded ${CC_JAR}"
    if ! verify_md5 "${CC_JAR}" "${CC_URL}"; then
        echo "ERROR: Downloaded JAR failed integrity check."
        exit 1
    fi
fi

COMPILER="java -jar ${CC_JAR}"

EXT_NAME=WV
EXT_FILE_NAME="WME_Validator.user.js"

SRC_DIR="."
DST_DIR="build"
TMP_DIR="build/tmp"
