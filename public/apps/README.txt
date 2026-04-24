Instructions for deploying apps:
1. Build the React Native Mobile APK. You can do this by running `eas build -p android --profile preview` inside the `mobile` folder. Once finished, rename the output file to `app-mobile.apk` and place it in this folder.
2. Build the Android TV APK. Go to the `tv` folder, run `./gradlew assembleRelease` or `./gradlew assembleDebug`, then locate the `.apk` file generated in `tv/app/build/outputs/apk/xyz/`. Rename it to `app-tv.apk` and place it here.
3. Once placed, users will be able to download them via the website interface.
