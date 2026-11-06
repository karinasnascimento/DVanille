import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:dvanille_app/main.dart';

void main() {
  testWidgets("D'Vanille app inicia na tela de login", (WidgetTester tester) async {
    await tester.pumpWidget(const DVanilleApp());
    await tester.pumpAndSettle();

    expect(find.text("Bem-vinda à D'Vanille"), findsOneWidget);
    expect(find.widgetWithText(ElevatedButton, 'ENTRAR'), findsOneWidget);
  });
}
