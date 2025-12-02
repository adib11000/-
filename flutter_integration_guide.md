# تحويل تطبيق الويب إلى تطبيق أندرويد (APK) باستخدام Flutter

بما أنك طلبت ملفات لبناء APK، اليك الطريقة الصحيحة لدمج كود الويب (React) الذي قمت بإنشائه داخل مشروع Flutter باستخدام `webview_flutter`.

## الخطوة 1: تجهيز مشروع Flutter

1. قم بإنشاء مشروع جديد:
```bash
flutter create speech_to_text_app
cd speech_to_text_app
```

2. افتح ملف `pubspec.yaml` وأضف المكاتب التالية (لإدارة الويب فيو والأذونات):
```yaml
dependencies:
  flutter:
    sdk: flutter
  webview_flutter: ^4.4.2
  permission_handler: ^11.0.1
  webview_flutter_android: ^3.13.0
```

## الخطوة 2: إعداد أذونات الأندرويد

افتح ملف `android/app/src/main/AndroidManifest.xml` وأضف الأذونات التالية للميكروفون والإنترنت:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android" package="com.example.speech_to_text_app">
    <uses-permission android:name="android.permission.INTERNET"/>
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
    
    <application
        android:label="محول الصوت"
        android:icon="@mipmap/ic_launcher"
        android:usesCleartextTraffic="true"> <!-- مهم للسيرفر المحلي -->
       ...
    </application>
</manifest>
```

## الخطوة 3: كود Dart الرئيسي

استبدل محتوى `lib/main.dart` بالكود التالي. هذا الكود يقوم بإنشاء متصفح داخلي يعرض تطبيق الويب الخاص بك، ويطلب إذن الميكروفون من الهاتف.

**ملاحظة:** يجب عليك رفع تطبيق React الذي قمت ببنائه (باستخدام `npm run build`) على سيرفر (مثلاً Vercel أو Netlify) ووضع الرابط في الأسفل، أو تشغيله محلياً.

```dart
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:permission_handler/permission_handler.dart';
// Import for Android features
import 'package:webview_flutter_android/webview_flutter_android.dart';

void main() {
  runApp(const MaterialApp(home: SpeechWebView()));
}

class SpeechWebView extends StatefulWidget {
  const SpeechWebView({super.key});

  @override
  State<SpeechWebView> createState() => _SpeechWebViewState();
}

class _SpeechWebViewState extends State<SpeechWebView> {
  late final WebViewController controller;

  @override
  void initState() {
    super.initState();
    _requestPermissions();

    // إعدادات الويب فيو المخصصة للأندرويد لدعم الميكروفون
    late final PlatformWebViewControllerCreationParams params;
    if (WebViewPlatform.instance is WebKitWebViewPlatform) {
      params = WebKitWebViewPlatformCreationParams(
        allowsInlineMediaPlayback: true,
        mediaTypesRequiringUserAction: const <PlaybackTier>{},
      );
    } else {
      params = const PlatformWebViewControllerCreationParams();
    }

    final WebViewController controller =
        WebViewController.fromPlatformCreationParams(params);

    controller
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0x00000000))
      ..setNavigationDelegate(
        NavigationDelegate(
          onProgress: (int progress) {
            // Loading bar logic here
          },
          onPageStarted: (String url) {},
          onPageFinished: (String url) {},
          onWebResourceError: (WebResourceError error) {},
        ),
      )
      // ضع رابط تطبيقك هنا بعد رفعه
      ..loadRequest(Uri.parse('https://YOUR-DEPLOYED-REACT-APP-URL.com'));

    // تفعيل الميكروفون خصيصاً للأندرويد
    if (controller.platform is AndroidWebViewController) {
      AndroidWebViewController.enableDebugging(true);
      (controller.platform as AndroidWebViewController)
          .setMediaPlaybackRequiresUserGesture(false);
    }

    this.controller = controller;
  }

  Future<void> _requestPermissions() async {
    // طلب إذن الميكروفون من نظام الأندرويد عند فتح التطبيق
    await Permission.microphone.request();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // نخفي الـ AppBar لأن تطبيق الويب لديه Header خاص به
      body: SafeArea(
        child: WebViewWidget(controller: controller),
      ),
    );
  }
}
```

## الخطوة 4: بناء ملف APK

بعد إعداد الملفات، قم بتشغيل الأمر التالي في التيرمينال لإنتاج ملف APK:

```bash
flutter build apk --release
```

سجد الملف في: `build/app/outputs/flutter-apk/app-release.apk`
