rm -rf Pods
rm -f Podfile.lock

rm -rf ~/Library/Developer/Xcode/DerivedData

pod cache clean --all
rm .xcode.env.local
pod install

rm ~/Library/MobileDevice/Provisioning\ Profiles/64c9a4cb-80b4-480b-9e0d-74e306af0ced.mobileprovision
rm ~/Library/Developer/Xcode/UserData/ProvisioningProfiles/64c9a4cb-80b4-480b-9e0d-74e306af0ced.mobileprovision
rm -rf ~/Library/Developer/Xcode/DerivedData
grep -r "64c9a4cb-80b4-480b-9e0d-74e306af0ced" ~/QualityTesting/ios/
Dear Support,

The issue has been resolved.

I fixed it by running the following steps:
Navigated to the ios directory
Removed the .xcode.env.local file
Ran pod install
It appears that Xcode was using a different Node.js version, which caused the error.

Thank you for your support.

Kind regards,
Rewiesh Ramcharan