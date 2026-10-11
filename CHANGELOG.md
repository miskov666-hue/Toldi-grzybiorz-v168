# CHANGELOG — TOŁDI GRZYBIORZ

## V167 — Borowik Szatański w walce z Belzebubem
- Na czas walki usuwane są zwykłe grzyby; pojawia się dokładnie 6 specjalnych Borowików Szatańskich rozsianych po arenie.
- Zebranie Borowika aktywuje czerwoną aurę wokół Tołdiego i przyznaje 5 strzałów.
- Każdy trafiony Belzebub otrzymuje 30 obrażeń; po wykorzystaniu 5 strzałów aura wygasa i trzeba znaleźć kolejnego Borowika.
- Dodano osobny wygląd Borowika i ognistych pocisków oraz licznik amunicji na przycisku ATAK.

## V166 — poprawka ekranu śmierci UFO 1

- Przy stanie `death` na UFO 1 i UFO 2 renderowana jest nadal arena kosmiczna, zamiast wracać do renderowania lasu.
- Zaktualizowano numer wersji i parametry cache-busting do V166.

## V165 — naprawa ekranu śmierci UFO 1 i UFO 2
- Podczas odliczania po śmierci na obu poziomach UFO renderowana jest nadal arena kosmiczna, zamiast przechodzić do nieprawidłowego/ciemnego ekranu.
- Zachowano zmiany V164: brak animacji leżenia i korekta położenia lasera.

## V164 — poprawka animacji Tołdiego i położenia lasera
- Całkowicie wyłączono sprite animacji leżenia/śmierci; Tołdi zawsze rysowany jest w pozycji stojącej.
- Po kontynuacji zerowane są akcje i wektory ruchu, aby animacja nie zapętlała się po odrodzeniu.
- Pistolet laserowy przesunięto wyżej i bardziej w prawo, bliżej ręki postaci.

## V163 — poprawka lasera i śmierci na UFO 2/3
- Podniesiono laserowy pistolet do wysokości ręki Tołdiego na poziomach UFO 2 i UFO 3.
- Podczas ekranu śmierci w UFO 2 pozostaje widoczna arena kosmiczna.
- W trybach UFO 2/3 nie jest używany sprite leżącego Tołdiego; po kontynuacji postać pozostaje na nogach.

## V162 — poprawka walki Króla w debugowaniu
- W walce uruchamianej z menu debugowania strażnik i dzik są natychmiast usuwani.
- Ręcznie tworzony boss otrzymuje prawidłowy licznik salw; pierwsza salwa następuje po 2,5 s, a kolejne co 5 s.
- Wyczyściłem stare pociski przy starcie testu bossa.

# CHANGELOG — TOŁDI GRZYBIORZ

## V161 — Król Prawdziwków: pogoń i grzybowe pociski
- Król aktywnie ściga Tołdiego po mapie i ignoruje drzewa, gałęzie oraz pozostałe przeszkody lądowe; woda pozostaje przeszkodą, a mosty umożliwiają przeprawę.
- Na czas walki z Królem Prawdziwków strażnik i dzik znikają.
- Król strzela z berła dwoma grzybowymi pociskami w jednej salwie, z pięciosekundową przerwą między salwami.
- Zachowano pozostałe zasady poziomu i mechanikę walki.


## V160
- Podczas rozpoczęcia walki z Belzebubem usuwana jest losowo połowa drzew kolizyjnych i połowa dekoracyjnych, aby łatwiej poruszać się po arenie.
- Zmiana dotyczy wyłącznie walki z Belzebubem; reszta poziomów i mechanik pozostaje bez zmian.

## V160 — Przyciski tylko w menu głównym
- Naprawiono widoczność przycisków USTAWIENIA i TWÓRCY: są ukrywane na wszystkich ekranach podmenu, w tym na liście scenek przerywnikowych i podglądzie scenek.
- Powrót z podmenu odbywa się istniejącymi przyciskami WRÓĆ.

# CHANGELOG — TOŁDI GRZYBIORZ

## V157 — ryby w rzece, bez mgły (2026-10-10)
- Całkowicie wyłączono renderowanie mgły.
- Dodano trzy dekoracyjne ryby w rzece; co jakiś czas jedna wyskakuje nad wodę i tworzy mały rozprysk.
- Ryby nie wpływają na kolizje, gracza ani przeciwników.
- Paralaksa pozostaje wyłączona.

## V156 — naprawa mgły
- Wersja zastąpiona przez V157 zgodnie z opinią gracza.


## V158 — sterowanie ukryte w podmenu
- Ukryto joystick, przycisk ataku, pauzy i pomijania intro po wejściu do Ustawień lub Twórców.
- Przyciski WRÓĆ pozostają jedyną drogą powrotu z tych podmenu; sterowanie nie przechwytuje już dotyku w tle.
- Nie zmieniono mechaniki rozgrywki.


## V168 — Prawdziwe zakończenie po Belzebubie
- Po pokonaniu Belzebuba wyświetla się nowy pionowy komiks końcowy przez 30 sekund.
- Przycisk POMIŃ kończy komiks natychmiast; po upływie czasu lub pominięciu następuje powrót do menu głównego.
- Komiks dodany do listy scenek w menu debugowania.
