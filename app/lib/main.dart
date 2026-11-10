import 'dart:convert';
import 'package:android_id/android_id.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:image_picker/image_picker.dart';
import 'package:webview_flutter/webview_flutter.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const MaterialApp(debugShowCheckedModeBanner: false, home: Shell()));
}

class Shell extends StatefulWidget {
  const Shell({super.key});
  @override
  State<Shell> createState() => _ShellState();
}

class _ShellState extends State<Shell> {
  late WebViewController c;
  bool ready = false;

  @override
  void initState() {
    super.initState();
    _init();
  }

  Future<void> _init() async {
    final id = await AndroidId().getId() ?? 'unknown';
    c = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFF0F1220))
      ..addJavaScriptChannel('Native', onMessageReceived: (m) async {
        if (m.message == 'pick') {
          final f = await ImagePicker().pickImage(
              source: ImageSource.gallery, maxWidth: 1280, imageQuality: 70);
          if (f == null) return;
          final b64 = base64Encode(await f.readAsBytes());
          c.runJavaScript("window.onPicked('$b64')");
        }
      })
      ..setNavigationDelegate(NavigationDelegate(onPageFinished: (_) {
        c.runJavaScript(
            "window.DEVICE_ID='$id';window.dispatchEvent(new Event('deviceready'));");
      }))
      ..loadFlutterAsset('assets/www/index.html');
    setState(() => ready = true);
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) async {
        if (didPop || !ready) return;
        final r = await c.runJavaScriptReturningResult(
            'window.goBack?(window.goBack()?"1":"0"):"0"');
        if (!r.toString().contains('1')) SystemNavigator.pop();
      },
      child: Scaffold(
        backgroundColor: const Color(0xFF0F1220),
        body: SafeArea(
          child: ready
              ? WebViewWidget(controller: c)
              : const Center(child: CircularProgressIndicator()),
        ),
      ),
    );
  }
}
