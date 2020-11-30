copy platforms\android\app\build\outputs\apk\release\app-release-unsigned.apk .
copy app-release-unsigned.apk app-release-signed.apk
jarsigner -keystore release-key.keystore app-release-signed.apk crosst-app
