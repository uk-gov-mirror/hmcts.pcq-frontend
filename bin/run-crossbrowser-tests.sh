#!/bin/bash
set -ex

# Setup required for Saucelabs environment variables. TEST_URL should be set by CNP
export E2E_FRONTEND_URL=${TEST_URL}
export IGNORE_SESSION_VALIDATION=true

EXIT_STATUS=0
BROWSER_GROUP=windows11_edge yarn test-crossbrowser-e2e || EXIT_STATUS=$?
BROWSER_GROUP=windows11_chrome yarn test-crossbrowser-e2e || EXIT_STATUS=$?
BROWSER_GROUP=macos_10_15_chrome yarn test-crossbrowser-e2e || EXIT_STATUS=$?
BROWSER_GROUP=ios_safari_18 yarn test-crossbrowser-e2e || EXIT_STATUS=$?
BROWSER_GROUP=macos_10_15_safari yarn test-crossbrowser-e2e || EXIT_STATUS=$?
BROWSER_GROUP=android_15_chrome_mobile yarn test-crossbrowser-e2e || EXIT_STATUS=$?
echo EXIT_STATUS: $EXIT_STATUS
exit $EXIT_STATUS
