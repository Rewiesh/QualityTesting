rm -rf Pods
rm -f Podfile.lock

rm -rf ~/Library/Developer/Xcode/DerivedData

pod cache clean --all

pod install
