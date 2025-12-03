#!/bin/bash
set -e

APP_NAME="TeeTime Cloud" # <- change if needed

cd ios

# Clean & install pods fresh
rm -rf Pods Podfile.lock
pod install --repo-update

cd ..
rm -rf build

# Archive
xcodebuild \
  -workspace ios/$APP_NAME.xcworkspace \
  -scheme $APP_NAME \
  -configuration Release \
  -sdk iphoneos \
  -archivePath build/$APP_NAME.xcarchive \
  archive

# Export IPA
xcodebuild \
  -exportArchive \
  -archivePath build/$APP_NAME.xcarchive \
  -exportOptionsPlist ios/ExportOptions.plist \
  -exportPath build/

echo "🎉 Done! IPA at: build/$APP_NAME.ipa"
