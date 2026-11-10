import 'package:android_id/android_id.dart';
import 'package:flutter/material.dart';
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
    final id = await const AndroidId().getId() ?? 'unknown';
    c = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFF0F1220))
      ..setNavigationDelegate(NavigationDelegate(onPageFinished: (_) {
        c.runJavaScript(
            "window.DEVICE_ID='$id';window.dispatchEvent(new Event('deviceready'));");
      }))
      ..loadFlutterAsset('assets/www/index.html');
    setState(() => ready = true);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F1220),
      body: SafeArea(
        child: ready
            ? WebViewWidget(controller: c)
            : const Center(child: CircularProgressIndicator()),
      ),
    );
  }
}
