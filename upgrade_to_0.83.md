PS C:\Users\rramcharan\Documents\Q Projecten\Prd\QualityTesting> node -v
v22.17.1
PS C:\Users\rramcharan\Documents\Q Projecten\Prd\QualityTesting> npm -v
10.2.5


---
macos
NY467-I:QualityTesting user276223$ ruby -v
ruby 4.0.0 (2025-12-25 revision 553f1675f3) +PRISM [arm64-darwin24]
NY467-I:QualityTesting user276223$ pod --version
1.16.2
NY467-I:QualityTesting user276223$ xcodebuild -version
Xcode 26.2
Build version 17C52
NY467-I:QualityTesting user276223$ 


Gluestack-UI Migration Plan
Overview
Dit plan beschrijft de volledige migratie van native-base naar gluestack-ui om React Native 0.83 compatibiliteit te bereiken.

Root Cause
De BackHandler.removeEventListener error komt van native-base's Modal en Overlay componenten. Deze gebruiken de oude RN API die verwijderd is in 0.83.

Inventaris: Bestanden met native-base
📁 Screens (16 bestanden)
Bestand	Componenten	Modal?	Prioriteit
Login.js
Box, VStack, Input, Button, Text, Icon, Center, Spinner, FormControl, Modal	✅	🔴 Hoog
Clients.js
Box, VStack, HStack, Text, Icon, Center, ScrollView, Modal, Pressable	✅	🔴 Hoog
Audits.js
Box, VStack, HStack, Text, Icon, Center, ScrollView, Button	❌	🟡 Medium
AuditDetails/index.js
Box, VStack, Text, ScrollView, Center, Spinner, Button, HStack, Modal, Icon	✅	🔴 Hoog
AuditFormsList.js
Box, VStack, HStack, Text, Icon, Center, ScrollView	❌	🟡 Medium
AuditPersonList.js
Box, VStack, HStack, Text, Icon, Center, Modal, Input, Button	✅	🔴 Hoog
AuditForm/index.js
Box, VStack, HStack, Text, Icon, Center, ScrollView, Button	❌	🟡 Medium
AuditErrorList/index.js
Box, VStack, HStack, Text, Icon, Center, ScrollView	❌	🟡 Medium
AuditErrorForm/index.js
Box, VStack, HStack, Text, Icon, Modal, Select, TextArea	✅	🔴 Hoog
AuditResumeForm/index.js
Box, VStack, HStack, Text, Icon, Center, ScrollView, Select	❌	🟡 Medium
Settings.js
Box, VStack, HStack, Text, Icon, Center, ScrollView, Switch	❌	🟢 Laag
StatisticsDashboard.js
Box, VStack, HStack, Text, Icon, Center, ScrollView, Progress	❌	🟢 Laag
FailedUploads.js
Box, VStack, HStack, Text, Icon, Center, Modal, Button	✅	🔴 Hoog
SplashScreen.js
Box, Text, Image, Spinner, VStack	❌	🟢 Laag
Help.js
Box, HStack, Button	❌	🟢 Laag
AppFooter.js
Box, HStack, Icon, Pressable, Text	❌	🟢 Laag
📁 Components (10 bestanden)
Bestand	Componenten	Modal?
ConfirmDialog.js
AlertDialog, Button, Text, HStack, Center, Icon, VStack	✅ AlertDialog
Card.js
Box	❌
CardHeader.js
HStack, Center, Icon, Text	❌
EmptyState.js
Center, Text, Icon, Button, VStack	❌
FotoPreview.js
Box, Center, Icon, Text, HStack, Pressable, VStack	❌
LoadingState.js
Center, Spinner, Text, VStack, Box, HStack, Skeleton	❌
OfflineBanner.js
Box, HStack, Text, Icon, Pressable	❌
RefreshControl.js
useColorModeValue, useTheme	❌
SkeletonLoader.js
Box, VStack, HStack, Skeleton	❌
AuditProgressBar.js
Box, HStack, VStack, Text, Progress, Icon, Center	❌
📁 AuditDetails/components (5 bestanden)
Bestand	Modal?
Modals.js
✅
UploadProgressModal.js
✅
AuditInfoSection.js	❌
CategoriesSection.js	❌
KpiSection.js	❌
SignatureSection.js	❌
📁 AuditErrorForm/components (6 bestanden)
Bestand	Modal?
ImagePickerModal.js
✅
ErrorCounter.js
✅
ElementPicker.js	❌
ErrorTypePicker.js	❌
LogBookSection.js	❌
TechnicalAspectsSection.js	❌
📁 Services & Other (4 bestanden)
Bestand	Componenten
FdisQuality.js
useColorModeValue, useTheme
FdisTheme.js
extendTheme
Util.js
Toast, Icon, Box, HStack, Text
ToastService.js
Toast
Component Mapping: native-base → gluestack-ui
native-base	gluestack-ui	Notes
Box	Box	Directe mapping
VStack	VStack	Directe mapping
HStack	HStack	Directe mapping
Text	Text	Directe mapping
Button	Button + ButtonText	Tekst apart
Icon	Icon	Andere props
Center	Center	Directe mapping
Spinner	Spinner	Directe mapping
Input	Input + InputField	Andere structuur
Select
Select
 + SelectTrigger + ...	Complexer
Modal	Modal + ModalBackdrop + ...	Prioriteit!
AlertDialog	AlertDialog + ...	Prioriteit
Pressable	Pressable	Directe mapping
ScrollView	React Native ScrollView	Gebruik RN native
Image
React Native 
Image
Gebruik RN native
Progress
Progress
 + ProgressFilledTrack	Andere structuur
Skeleton	Skeleton	Directe mapping
Toast	useToast()	Hook-based
useColorModeValue	useColorMode()	Andere API
useTheme	useToken()	Andere API
Gefaseerde Aanpak
Fase 1: Modal Componenten (Blokkerend) 🔴
Doel: Fix de BackHandler error door alle Modals te migreren

app/screens/AuditDetails/components/Modals.js
app/screens/AuditDetails/components/UploadProgressModal.js
app/screens/AuditErrorForm/components/ImagePickerModal.js
app/screens/AuditErrorForm/components/ErrorCounter.js
 (bevat Modal)
app/components/ConfirmDialog.js
 (AlertDialog)
app/screens/Clients.js
 (RenderModal)
app/screens/AuditPersonList.js
 (RenderClientModal)
app/screens/FailedUploads.js
 (renderHelpModal)
app/screens/Login.js
 (als er Modal is)
app/screens/AuditDetails/index.js
 (RemarkModal2)
Fase 2: Core Componenten 🟡
Doel: Basis UI componenten migreren

app/components/Card.js
app/components/CardHeader.js
app/components/EmptyState.js
app/components/LoadingState.js
Fase 3: Screen-by-Screen 🟢
Doel: Volledige screens migreren

SplashScreen.js
 (eenvoudig)
Settings.js
StatisticsDashboard.js
Audits.js
Clients.js
 (rest)
etc.
Fase 4: Theme & Utilities
FdisTheme.js
 → gluestack config
ToastService.js
 → useToast hook
Util.js
Fase 5: Cleanup
Verwijder native-base dependency
Verwijder NativeBaseProvider uit 
App.js
Geschatte Tijd
Fase	Bestanden	Geschatte Tijd
Fase 1	10	4-6 uur
Fase 2	4	1-2 uur
Fase 3	12	4-6 uur
Fase 4	3	1-2 uur
Fase 5	2	30 min
Totaal	~44	~12-16 uur
Volgende Stap
IMPORTANT

Start met Fase 1 — de Modal componenten. Dit lost de BackHandler error op zodat de app kan starten.

Wil je dat ik begin met het migreren van het eerste Modal bestand?