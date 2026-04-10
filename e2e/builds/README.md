# Mobile build artifacts

`wdio.conf.ts` expects these files (paths are relative to the repo root):

- **Android:** `e2e/builds/Android.apk` (or update the path in `wdio.conf.ts` to match your APK)
- **iOS:** `e2e/builds/IOSApp.app/` (simulator `.app` bundle)

Copy your team’s debug APK and iOS simulator build here locally. These binaries are **not** committed to Git because of size and licensing; store them in internal artifact storage or CI secrets if needed.
