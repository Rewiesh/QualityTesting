rm -rf Pods
rm -f Podfile.lock

rm -rf ~/Library/Developer/Xcode/DerivedData

pod cache clean --all

pod install

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