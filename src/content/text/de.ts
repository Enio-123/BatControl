// Lerninhalte auf Deutsch.
import type { ContentText } from './types';

export const TEXT: ContentText = {
  groups: {
    start: 'Erste Schritte',
    drive: 'DriveBase (Fahren)',
    arms: 'Aufsatzmotoren',
    sensor: 'Farbsensor',
    hub: 'Hub',
    time: 'Zeit',
    python: 'Python für Roboter',
  },

  topics: {
    structure: {
      title: 'Aufbau eines Programms',
      summary: 'Jedes Pybricks-Programm hat drei Teile: importieren, was du brauchst, die Geräte anlegen (Hub, Motoren, Sensoren und die DriveBase) und die Befehle der Mission untereinander schreiben. Der Roboter führt sie von oben nach unten aus.',
      tips: [
        'Lege jedes Gerät nur einmal an, am Anfang des Programms.',
        'Zeilen, die mit # beginnen, sind Kommentare: Der Roboter ignoriert sie, aber sie helfen dem Team, den Code zu verstehen.',
        'Die Namen left_motor, robot und sensor haben wir ausgewählt. Du kannst andere verwenden, solange du im ganzen Programm denselben Namen benutzt.',
      ],
      mistakes: ['Ein vergessener Import führt zu einem NameError: Python weiß nicht, was DriveBase oder Port ist.'],
    },
    motor: {
      title: 'Motor(): einen Motor anlegen',
      summary: 'Erzeugt das Objekt, das einen Motor an einem Port des Hubs (A bis F) steuert. Beim Standardroboter von BatControl sind die Räder an den Ports A und B und die Aufsätze an den Ports C und D.',
      params: [
        ['Port.A … Port.F', 'Port des Hubs, an dem das Motorkabel steckt.'],
        ['Direction', 'Welche Drehrichtung als positiv gilt. Der linke Radmotor ist spiegelverkehrt eingebaut, deshalb verwenden wir bei ihm COUNTERCLOCKWISE.'],
        ['Liste', 'Zahnräder zwischen Motor und Abtrieb, z. B. [12, 36]. Optional.'],
      ],
      mistakes: [
        'Ohne Direction.COUNTERCLOCKWISE am linken Motor dreht sich der Roboter auf der Stelle, statt geradeaus zu fahren. Probier es im Simulator aus.',
        'Ein Port ohne Motor ergibt einen OSError: Prüfe Kabel und Port.',
      ],
    },
    drivebase: {
      title: 'DriveBase(): die Räder verbinden',
      summary: 'Die DriveBase steuert beide Radmotoren gemeinsam, sodass der Roboter in Millimetern fährt und in Grad dreht. Sie muss die Radgröße und den Abstand zwischen den Rädern kennen.',
      params: [
        ['Motor', 'Motor des linken Rads.'],
        ['Motor', 'Motor des rechten Rads.'],
        ['mm', 'Raddurchmesser. Das SPIKE-Prime-Rad hat 56 mm.'],
        ['mm', 'Abstand zwischen den Punkten, an denen die beiden Räder den Boden berühren.'],
      ],
      tips: [
        'Fährt der Roboter etwas mehr oder weniger als verlangt, passe wheel_diameter an.',
        'Dreht der Roboter etwas mehr oder weniger, passe axle_track an. Siehe das Thema Kalibrierung.',
      ],
    },
    straight: {
      title: 'straight(): geradeaus fahren',
      summary: 'Fährt die angegebene Strecke geradeaus und hält an. Eine positive Zahl fährt vorwärts, eine negative rückwärts.',
      params: [
        ['mm', 'Wie weit gefahren wird. 100 mm = 10 cm.'],
        ['Stop', 'Was am Ende passiert: Stop.HOLD (halten, Standard), Stop.BRAKE oder Stop.COAST.'],
        ['True/False', 'Bei True wartet das Programm bis zum Ende, bevor die nächste Zeile kommt.'],
      ],
      tips: ['Miss auf der Matte: Das Lineal am Rand der Simulatormatte hat alle 100 mm eine Markierung. Im Tab Simulieren misst das Werkzeug Lineal für dich.'],
      mistakes: ['In Zentimetern denken: straight(40) fährt nur 4 cm.'],
    },
    turn: {
      title: 'turn(): auf der Stelle drehen',
      summary: 'Dreht den Roboter auf der Stelle, ein Rad vorwärts und das andere rückwärts. Ein positiver Winkel dreht nach rechts (im Uhrzeigersinn), ein negativer nach links.',
      params: [
        ['Grad', 'Wie weit gedreht wird. 90 ist eine Vierteldrehung, 180 eine halbe Drehung.'],
        ['Stop', 'Wie am Ende angehalten wird.'],
        ['True/False', 'Warten, bis die Drehung fertig ist, bevor es weitergeht.'],
      ],
      mistakes: ['Das Vorzeichen verwechseln: turn(90) dreht nach rechts, nicht nach links.'],
    },
    strafe: {
      title: 'Und Strafe (seitwärts fahren)?',
      summary: 'Die DriveBase von Pybricks hat kein Strafe. Ein typischer FLL-Roboter hat zwei feste Antriebsräder (Differentialantrieb), die nur vorwärts und rückwärts schieben. Seitwärts fahren gibt es nur bei Robotern mit Omni- oder Mecanum-Rädern. Um einen Punkt seitlich zu erreichen: drehen, fahren und zurückdrehen.',
      tips: ['Wenn du robot.strafe(...) schreibst, zeigt der Simulator denselben Fehler wie der Hub: AttributeError.'],
    },
    curve: {
      title: 'curve(): im Bogen fahren',
      summary: 'Fährt einen Bogen, wie ein Auto in einer Kurve. Der Radius bestimmt, ob die Kurve weit oder eng ist, und der Winkel, wie viel vom Kreis gefahren wird. Ein positiver Winkel fährt eine Rechtskurve.',
      params: [
        ['mm', 'Kreisradius. Positiv fährt vorwärts, negativ rückwärts.'],
        ['Grad', 'Wie viel vom Kreis gefahren wird. 90 ist ein Viertelkreis.'],
      ],
      tips: ['Kurven sind schneller als anhalten, drehen und fahren, aber schwerer genau hinzubekommen. Nutze sie, wenn die Mission einen fließenden Weg braucht.'],
    },
    settings: {
      title: 'settings(): Geschwindigkeit und Beschleunigung',
      summary: 'Ändert die Geschwindigkeit und Beschleunigung von straight, turn und curve. Ohne Argumente gibt es die aktuellen Werte zurück. Langsamer ist meistens genauer.',
      params: [
        ['mm/s', 'Fahrgeschwindigkeit.'],
        ['mm/s²', 'Wie schnell beschleunigt und gebremst wird.'],
        ['Grad/s', 'Drehgeschwindigkeit.'],
        ['Grad/s²', 'Drehbeschleunigung.'],
      ],
      tips: ['Im Simulator sind die Standardwerte aus dem SPIKE-Motor geschätzt. Auf dem echten Hub können sie leicht abweichen.'],
    },
    drive: {
      title: 'drive() und stop(): weiterfahren',
      summary: 'drive() startet die Räder und das Programm geht sofort zur nächsten Zeile, während der Roboter noch fährt. Der Roboter hält erst an, wenn du robot.stop() aufrufst. Das ist die Grundlage für „fahr, bis du die schwarze Linie siehst“ und für Linienfolger.',
      params: [
        ['mm/s', 'Vorwärtsgeschwindigkeit (negativ = rückwärts).'],
        ['Grad/s', 'Wie stark er beim Fahren dreht. 0 = geradeaus, positiv = rechts.'],
      ],
      mistakes: ['drive() aufrufen und das Warten vergessen (wait oder eine Schleife): Das Programm endet sofort und der Roboter bewegt sich nicht einmal.'],
    },
    distance: {
      title: 'distance(), angle() und reset()',
      summary: 'distance() sagt, wie viele mm der Roboter seit dem Start (oder seit dem letzten reset) gefahren ist. angle() sagt, wie viele Grad er sich gedreht hat. reset() setzt beides auf null.',
      returns: 'Ganze Zahlen: mm und Grad.',
    },
    gyro: {
      title: 'use_gyro(): das Gyroskop nutzen',
      summary: 'Lässt die DriveBase mit dem Gyroskop des Hubs messen, wie weit sich der Roboter dreht, statt nur die Radumdrehungen zu zählen. Bei einem echten Roboter rutschen die Räder bei jeder Drehung ein wenig; mit dem Gyroskop merkt die DriveBase das und korrigiert.',
      tips: [
        'Schalte im Tab Simulieren den realistischen Modus ein: Die Räder rutschen wie bei einem echten Roboter, und jeder Lauf ist etwas anders. Vergleiche mit und ohne use_gyro(True).',
        'Lass den Hub vor dem Start kurz ruhig liegen: Das Gyroskop kalibriert sich selbst, solange der Roboter sich nicht bewegt.',
      ],
    },
    calibrate: {
      title: 'Kalibrierung: wheel_diameter und axle_track',
      summary: 'Abgenutzte Reifen, leicht unterschiedliche Räder und die Matte selbst verändern die echten Maße. So kalibrierst du: 1000 mm fahren und mit einem Maßband messen. Neuer wheel_diameter = aktueller Wert × gemessen ÷ 1000. Dann 360° drehen und schauen, wie weit sich der Roboter wirklich gedreht hat. Neuer axle_track = aktueller Wert × 360 ÷ echte Drehung.',
      tips: [
        'Simulieren › Roboter hat einen Kalibrierungsrechner, der diese Rechnung übernimmt.',
        'Wiederhole die Messung dreimal und nimm den Durchschnitt: Eine einzelne Messung kann täuschen.',
        'Kalibriere wenn möglich auf der Wettbewerbsmatte.',
      ],
      mistakes: ['Andersherum rechnen: Ist der Roboter MEHR als verlangt gefahren, muss wheel_diameter GRÖSSER werden (das Rad ist größer, als das Programm denkt).'],
    },
    'run-angle': {
      title: 'run_angle(): einen Aufsatz bewegen',
      summary: 'Dreht den Motor um eine Anzahl Grad von seiner aktuellen Position aus. Das ist der häufigste Befehl, um Aufsatzarme zu heben und zu senken. Im Simulator sind die Aufsätze die beiden Zahnräder oben auf dem Roboter.',
      params: [
        ['Grad/s', 'Motorgeschwindigkeit. Bis etwa 1000.'],
        ['Grad', 'Wie weit gedreht wird. 360 ist eine volle Umdrehung; negativ dreht andersherum.'],
        ['True/False', 'Mit wait=False dreht sich der Aufsatz, während der Roboter fährt.'],
      ],
    },
    claw: {
      title: 'Aufsatzbeispiel: Greifer',
      summary: 'Der Zangengreifer ist ein einfacher Aufsatz: Ein Motor dreht zwei Zahnräder, die die Backen gemeinsam öffnen und schließen. Im Simulator fügst du den Greifer unter Simulieren › Roboter › Aufsätze hinzu. Bei 0° ist er geschlossen, bei 90° ganz offen. Schließt er sich mit einer Kiste zwischen den Backen, packt er die Kiste.',
      tips: [
        'Verwende run_target(300, 0) zum Schließen: Der Greifer kehrt immer zum selben Punkt zurück, auch wenn er halb offen gestartet ist.',
        'Montiere den Greifer am echten Roboter an einem stabilen Balken: Wackelt er, verfehlt die Zange das Teil.',
      ],
    },
    'run-target': {
      title: 'run_target() und reset_angle()',
      summary: 'run_target() fährt den Motor auf einen genauen Winkel, gezählt ab null. Der Unterschied zu run_angle(): Egal wo der Motor stand, er endet immer an derselben Stelle. reset_angle(0) setzt die aktuelle Position als null.',
      params: [
        ['Grad/s', 'Geschwindigkeit.'],
        ['Grad', 'Zielwinkel.'],
      ],
    },
    'run-time': {
      title: 'run_time(), run() und stop()',
      summary: 'run_time() dreht den Motor eine Zeit lang in Millisekunden. run() startet den Motor und hält erst an, wenn du stop() aufrufst. angle() nennt dir den Motorwinkel.',
      params: [
        ['Grad/s', 'Geschwindigkeit.'],
        ['ms', 'Wie lange gedreht wird. 1000 ms = 1 Sekunde.'],
      ],
    },
    color: {
      title: 'color(): welche Farbe darunter ist',
      summary: 'Liest die Farbe der Matte unter dem Sensor und gibt eine Farbe wie Color.BLACK, Color.WHITE, Color.RED, Color.BLUE, Color.GREEN oder Color.YELLOW zurück. Im Simulator zeigt der rote Punkt auf dem Boden, wo der Sensor misst.',
      returns: 'Eine Farbe (Color.X). Vergleiche mit ==.',
      mistakes: ['Mit dem Text "BLACK" vergleichen: Richtig ist Color.BLACK, ohne Anführungszeichen.'],
    },
    reflection: {
      title: 'reflection(): wie viel Licht zurückkommt',
      summary: 'Misst, wie viel Licht die Matte zurückwirft, von 0 bis 100. Schwarz liegt bei etwa 7, Weiß bei etwa 96. Am Rand der Linie liegt der Wert dazwischen, und genau das nutzt ein Linienfolger.',
      returns: 'Eine Zahl von 0 bis 100.',
      tips: ['Fang langsam an und stimme den Verstärkungsfaktor ab: zu hoch, und der Roboter fährt Zickzack; zu niedrig, und er verpasst die Kurve.'],
    },
    pid: {
      title: 'PID-Linienfolger',
      summary: 'Die PID-Regelung addiert drei Korrekturen. P (proportional) lenkt umso stärker, je größer der Fehler ist. I (integral) behebt einen Fehler, der immer auf derselben Seite bleibt. D (differenziell) schaut, wie schnell sich der Fehler ändert, und dämpft die Korrektur vor dem Überschwingen, was das Zickzack beseitigt. In der FLL lösen P und D fast alles.',
      tips: [
        'Stimme in dieser Reihenfolge ab: Beginne mit kd = 0 und ki = 0, erhöhe kp, bis der Roboter der Kurve folgt, dann erhöhe kd, bis das Zickzack aufhört.',
        'Ändere immer nur eine Zahl und notiere, was passiert ist.',
        'Mehr Geschwindigkeit braucht mehr kd.',
      ],
      mistakes: ['Vergessen, last_error am Ende der Schleife zu aktualisieren: Dann ist der D-Anteil immer falsch.'],
    },
    imu: {
      title: 'hub.imu.heading(): wohin der Roboter zeigt',
      summary: 'Das Gyroskop des Hubs sagt, um wie viele Grad sich der Roboter seit dem Start gedreht hat. Rechtsdrehen erhöht den Wert.',
      returns: 'Grad.',
    },
    'hub-io': {
      title: 'Licht, Anzeige und Ton des Hubs',
      summary: 'Nutze das Tastenlicht, die 5×5-Anzeige und den Lautsprecher, um zu zeigen, was der Roboter gerade tut. Beim Testen hilft das sehr: Ein Piepton sagt dir, dass ein Schritt fertig ist.',
    },
    wait: {
      title: 'wait(): Pause',
      summary: 'Hält das Programm für eine Zeit in Millisekunden an. Motoren, die liefen, laufen weiter.',
      params: [['ms', '1000 ms = 1 Sekunde.']],
      tips: ['In Schleifen gibt ein wait(10) dem Hub Zeit und hält die Messwerte stabil.'],
    },
    stopwatch: {
      title: 'StopWatch(): Stoppuhr',
      summary: 'Eine Stoppuhr in Millisekunden. Nützlich, um zu begrenzen, wie lange ein Schritt dauern darf. Ein FLL-Match dauert 2 min 30 s (150000 ms).',
    },
    variables: {
      title: 'Variablen',
      summary: 'Eine Variable speichert einen Wert unter einem Namen. So änderst du eine Zahl an einer Stelle, statt sie im ganzen Programm zu suchen.',
    },
    for: {
      title: 'for: eine bestimmte Anzahl wiederholen',
      summary: 'Wiederholt den eingerückten Block (4 Leerzeichen) n-mal. range(4) zählt 0, 1, 2, 3.',
      mistakes: ['Den Doppelpunkt am Ende der for-Zeile vergessen oder den Block nicht einrücken.'],
    },
    while: {
      title: 'while: wiederholen, solange es wahr ist',
      summary: 'Wiederholt den Block, solange die Bedingung wahr ist. Wird für „fahr, bis du die Linie siehst“ oder „dreh, bis die Richtung stimmt“ verwendet.',
    },
    if: {
      title: 'if, elif und else: entscheiden',
      summary: 'Führt einen Block nur aus, wenn die Bedingung wahr ist. Mit elif prüfst du eine weitere Bedingung und mit else „sonst“.',
    },
    def: {
      title: 'def: eigene Funktionen schreiben',
      summary: 'Eine Funktion gibt einer Gruppe von Befehlen einen Namen. In der FLL hat man oft eine Funktion pro Mission und ruft sie nacheinander auf. So kannst du jede Mission einzeln testen und die Reihenfolge ändern, ohne etwas neu zu schreiben.',
    },
  },

  units: {
    u1: { title: 'Pybricks kennenlernen', desc: 'Was ein Programm ist und wie der Roboter im Code auftaucht.' },
    u2: { title: 'Fahren und drehen', desc: 'straight() und turn(): die beiden meistgenutzten Befehle in der FLL.' },
    u3: { title: 'Kurven und Tempo', desc: 'curve() für fließende Wege und settings() für das Tempo.' },
    u4: { title: 'Aufsätze', desc: 'Motoren an den Ports C und D, die die Missionsaufsätze bewegen.' },
    u5: { title: 'Farbsensor', desc: 'An der schwarzen Linie anhalten und einer Linie folgen.' },
    u6: { title: 'Programmierlogik', desc: 'Mit for wiederholen, mit if entscheiden und Missionen mit def ordnen.' },
    u7: { title: 'Ganze Mission', desc: 'Alles in einem echten Lauf zusammenbringen, innerhalb der Matchzeit.' },
    u8: { title: 'Präzision', desc: 'Gyroskop und Kalibrierung: Der echte Roboter ist nicht so perfekt wie auf dem Papier.' },
    u9: { title: 'PID-Folger', desc: 'Der Linie schnell folgen, ohne Zickzack.' },
    u10: { title: 'Missionsfunktionen', desc: 'Objekte schieben und greifen, jede Mission in ihrer eigenen Funktion.' },
    u11: { title: 'Fehlersuche', desc: 'Fehler lesen, mit print nachforschen und Programme reparieren.' },
    u12: { title: 'Wettbewerbsstrategie', desc: 'BASIS 2, Tempo gegen die Uhr und komplette Durchläufe.' },
  },

  lessons: {
    u1l1: {
      title: 'Erstes Programm',
      intro: 'Pybricks ist Python, das im SPIKE-Prime-Hub läuft. Der Roboter führt das Programm von oben nach unten aus, Zeile für Zeile.\n\nZum Fahren nutzen wir die DriveBase, die in diesem Kurs robot heißt. Der Befehl robot.straight(300) fährt 300 Millimeter vorwärts.',
      ex: [
        { prompt: 'In welcher Sprache schreiben wir Pybricks-Programme?', options: ['Python', 'Scratch-Blöcke', 'C++', 'JavaScript'], explain: 'Pybricks nutzt MicroPython, eine Python-Version für kleine Platinen wie den Hub.' },
        { prompt: 'In welcher Einheit misst straight() die Strecke?', options: ['Millimeter', 'Zentimeter', 'Radumdrehungen', 'Sekunden'], explain: 'Alle Strecken in Pybricks sind in mm. 30 cm = 300 mm.' },
        { prompt: 'Ergänze, damit der Roboter 300 mm vorwärts fährt.', explain: 'straight bedeutet geradeaus fahren.' },
        { prompt: 'Lass den Roboter 300 mm vorwärts fahren.', hint: 'Verwende robot.straight(300) unter dem Kommentar.' },
      ],
    },
    u1l2: {
      title: 'Der Roboter im Code',
      intro: 'Bevor der Roboter fahren kann, muss das Programm wissen, was an jedem Port steckt. Beim Standardroboter von BatControl:\n\nPort A: linkes Rad. Port B: rechtes Rad. Ports C und D: Aufsatzmotoren. Port E: Farbsensor.\n\nDer linke Motor ist spiegelverkehrt eingebaut, deshalb bekommt er Direction.COUNTERCLOCKWISE, damit „positiv“ bei beiden Rädern „vorwärts“ bedeutet.',
      ex: [
        { prompt: 'An welchen Ports sind die Radmotoren des Standardroboters?', options: ['A und B', 'C und D', 'E und F', 'A und C'], explain: 'Räder an A und B, Aufsätze an C und D, Farbsensor an E.' },
        { prompt: 'Warum verwendet der linke Motor Direction.COUNTERCLOCKWISE?', options: ['Weil er gegenüber dem rechten spiegelverkehrt eingebaut ist', 'Damit der Roboter schneller wird', 'Weil der Hub nur einen normalen Motor akzeptiert', 'Um seitwärts zu fahren'], explain: 'Die beiden Motoren zeigen zueinander. Ohne einen davon umzukehren, drehen sich die Räder gegeneinander und der Roboter dreht auf der Stelle.' },
        { prompt: 'Das SPIKE-Prime-Rad hat 56 mm Durchmesser. Ergänze:', explain: 'wheel_diameter ist der Raddurchmesser in mm.' },
        { prompt: 'Bring die Zeilen in die richtige Reihenfolge (die Imports sind schon da).', explain: 'Zuerst legen wir die Motoren an, dann die DriveBase, die sie benutzt, und erst danach geben wir Befehle.' },
        { prompt: 'Dieses Programm lässt den Roboter auf der Stelle drehen, statt 400 mm zu fahren. Führe es aus, um das Problem zu sehen, und korrigiere, wie die Motoren angelegt werden.', hint: 'Der Motor an Port A braucht Direction.COUNTERCLOCKWISE.' },
      ],
    },
    u2l1: {
      title: 'Geradeaus fahren',
      intro: 'straight(Strecke) fährt geradeaus und hält an. Eine positive Zahl fährt vorwärts, eine negative rückwärts.\n\nAuf der Simulatormatte hat der Rand alle 100 mm eine Linealmarke. Der Start liegt in BASIS 1, mit der Robotermitte bei x = 120 mm.',
      ex: [
        { prompt: 'Was macht robot.straight(-200)?', options: ['Fährt 200 mm rückwärts', 'Fährt 200 mm vorwärts', 'Dreht sich um 200 Grad', 'Fehler, negative Zahlen sind nicht erlaubt'], explain: 'Eine negative Strecke fährt rückwärts.' },
        { prompt: 'Wie viel sind 25 cm in Millimetern?', options: ['250', '25', '2500', '2,5'], explain: '1 cm = 10 mm, also 25 cm = 250 mm.' },
        { prompt: 'Bring den Roboter in die rote Zone. Ihre Mitte liegt 800 mm vor dem Start.', hint: 'Ein einziges robot.straight() mit der richtigen Strecke reicht.' },
      ],
    },
    u2l2: {
      title: 'Drehen',
      intro: 'turn(Winkel) dreht den Roboter auf der Stelle. Positiv dreht nach rechts (im Uhrzeigersinn), negativ nach links.\n\nEine Vierteldrehung sind 90 Grad, eine halbe Drehung 180.',
      ex: [
        { prompt: 'Wohin dreht der Roboter bei robot.turn(90)?', options: ['Nach rechts', 'Nach links', 'Nach vorn', 'Hängt vom Port ab'], explain: 'Positiver Winkel = Uhrzeigersinn = rechts.' },
        { prompt: 'Mit welchem Befehl wendet der Roboter?', options: ['robot.turn(180)', 'robot.turn(90)', 'robot.turn(360)', 'robot.straight(-180)'], explain: 'Wenden sind 180 Grad. 360 ist eine volle Drehung, danach zeigt der Roboter wieder in dieselbe Richtung.' },
        { prompt: 'Ergänze für eine Vierteldrehung nach links.', explain: 'Links ist negativ: -90.' },
        { prompt: 'Bring den Roboter in die gelbe Zone. Maße: 800 mm fahren, nach links drehen und weitere 640 mm fahren.', hint: 'straight(800), dann turn(-90), dann straight(640).' },
      ],
    },
    u2l3: {
      title: 'Gibt es Strafe?',
      intro: 'Manche suchen einen Befehl strafe(), um seitwärts zu fahren. Die DriveBase von Pybricks hat keinen: Der Roboter hat zwei feste Räder, die nur vorwärts und rückwärts schieben (Differentialantrieb).\n\nUm einen Punkt seitlich zu erreichen: drehen, fahren und zurückdrehen.',
      ex: [
        { prompt: 'Was passiert, wenn das Programm robot.strafe(100) aufruft?', options: ['Ein Fehler: Die DriveBase hat kein Strafe', 'Der Roboter fährt 100 mm seitwärts', 'Der Roboter dreht sich um 100 Grad', 'Der Roboter fährt 100 mm vorwärts'], explain: 'Der Hub zeigt AttributeError, genau wie der Simulator. Seitwärts fahren gibt es nur mit Omni- oder Mecanum-Rädern.' },
        { prompt: 'Baue den Weg, um „300 mm nach links“ zu fahren und danach wieder nach vorn zu zeigen.', explain: 'Drehen, fahren und zurückdrehen ersetzt Strafe.' },
        { prompt: 'Ende in der gelben Zone, aber mit Blick zur rechten Seite der Matte, wie am Start.', hint: 'Nimm den Weg aus der vorherigen Lektion und füge am Ende ein turn(90) hinzu.' },
      ],
    },
    u3l1: {
      title: 'Kurven',
      intro: 'curve(Radius, Winkel) fährt einen Kreisbogen. Ein großer Radius ergibt eine weite Kurve, ein kleiner eine enge. Ein positiver Winkel fährt nach rechts.\n\nEine Kurve mit Radius 300 und Winkel -90 bringt den Roboter 300 mm nach vorn und 300 mm nach links.',
      ex: [
        { prompt: 'Welche dieser Kurven ist am engsten?', options: ['robot.curve(100, 90)', 'robot.curve(400, 90)', 'robot.curve(800, 90)', 'Alle sind gleich'], explain: 'Je kleiner der Radius, desto enger die Kurve.' },
        { prompt: 'Ergänze, um einen Viertelkreis nach links mit 300 mm Radius zu fahren.', explain: 'Links ist negativ, und ein Viertelkreis sind 90 Grad.' },
        { prompt: 'Erreiche die gelbe Zone mit einem curve() unterwegs, ohne turn().', hint: '500 mm fahren, curve(300, -90) und weitere 340 mm fahren.' },
      ],
    },
    u3l2: {
      title: 'Geschwindigkeit',
      intro: 'robot.settings() ändert die Geschwindigkeit von straight, turn und curve. Zum Beispiel fährt robot.settings(straight_speed=400) mit 400 mm/s.\n\nSchneller spart Matchzeit, langsamer ist meist genauer.',
      ex: [
        { prompt: 'In welcher Einheit ist straight_speed?', options: ['mm/s', 'Grad/s', 'cm/s', 'Umdrehungen pro Minute'], explain: 'Die Fahrgeschwindigkeit ist in Millimetern pro Sekunde.' },
        { prompt: 'Ergänze, um mit 400 mm/s zu fahren.', explain: 'straight_speed steuert die Geschwindigkeit beim Geradeausfahren.' },
        { prompt: 'Erreiche die blaue Zone (1400 mm voraus) in weniger als 6 Sekunden. Mit der Standardgeschwindigkeit schafft es der Roboter nicht.', hint: 'Setze robot.settings(straight_speed=400) vor das straight.' },
      ],
    },
    u4l1: {
      title: 'run_angle()',
      intro: 'Aufsätze werden von den Motoren an den Ports C und D bewegt. Im Simulator sind das die beiden Zahnräder oben auf dem Roboter.\n\nleft_arm.run_angle(500, 180) dreht den linken Aufsatz um 180 Grad mit 500 Grad pro Sekunde.',
      ex: [
        { prompt: 'Was ist die 500 in left_arm.run_angle(500, 90)?', options: ['Die Geschwindigkeit in Grad pro Sekunde', 'Der Winkel in Grad', 'Die Zeit in Millisekunden', 'Die Motorleistung'], explain: 'Zuerst kommt die Geschwindigkeit, dann der Winkel.' },
        { prompt: 'Ergänze, damit sich der rechte Aufsatz einmal ganz dreht.', explain: 'Eine volle Umdrehung sind 360 Grad.' },
        { prompt: 'Dreh den linken Aufsatz eine halbe Umdrehung und bring ihn dann in die Ausgangsposition zurück.', hint: 'Zwei Zeilen: left_arm.run_angle(500, 180) und left_arm.run_angle(500, -180).' },
      ],
    },
    u4l2: {
      title: 'Aufsatz und Roboter gleichzeitig',
      intro: 'Standardmäßig wartet jeder Befehl, bis er fertig ist, bevor die nächste Zeile kommt. Mit wait=False startet der Befehl und das Programm geht sofort weiter.\n\nSo kann sich der Aufsatz heben, während der Roboter fährt, und du sparst wertvolle Sekunden im Match.\n\nrun_target(Geschwindigkeit, Winkel) fährt den Motor auf einen genauen Winkel, gezählt ab null.',
      ex: [
        { prompt: 'Was bewirkt wait=False in right_arm.run_angle(500, 90, wait=False)?', options: ['Beginnt zu drehen und das Programm läuft weiter, ohne zu warten', 'Dreht den Motor nicht', 'Dreht den Motor endlos', 'Wartet 90 ms vor dem Drehen'], explain: 'Der Motor dreht parallel zu den nächsten Zeilen.' },
        { prompt: 'Der Aufsatz steht bei 30°. Wohin fährt er mit run_target(500, 90)?', options: ['Auf 90°', 'Auf 120°', 'Auf 60°', 'Er bleibt bei 30°'], explain: 'run_target fährt auf den Zielwinkel, egal wo er vorher stand. run_angle(500, 90) würde auf 120° fahren.' },
        { prompt: 'Fahr in die rote Zone und dreh gleichzeitig den rechten Aufsatz um 90°. Alles in weniger als 4,6 Sekunden.', hint: 'right_arm.run_angle(500, 90, wait=False) und danach robot.straight(800).' },
      ],
    },
    u5l1: {
      title: 'An der Linie anhalten',
      intro: 'sensor.color() sagt dir die Farbe der Matte unter dem Sensor: Color.BLACK, Color.WHITE, Color.RED...\n\nUm zu fahren, bis eine Farbe erscheint: Starte die Räder mit robot.drive(Geschwindigkeit, 0), warte in einer while-Schleife, bis die Farbe auftaucht, und rufe robot.stop() auf.\n\nIm Simulator zeigt der rote Punkt auf dem Boden, wo der Sensor misst.',
      ex: [
        { prompt: 'Wie prüfst du richtig, ob der Sensor Schwarz sieht?', options: ['sensor.color() == Color.BLACK', 'sensor.color() == "BLACK"', 'sensor.color = Color.BLACK', 'sensor.black()'], explain: 'Vergleiche mit == und verwende die Pybricks-Farbe (Color.BLACK), ohne Anführungszeichen.' },
        { prompt: 'Ergänze, um zu fahren, bis die schwarze Linie gefunden ist.', explain: 'Solange die Farbe ungleich (!=) Schwarz ist, weiterfahren.' },
        { prompt: 'Fahr bis zum schwarzen STOPP-Streifen und halte darauf an. Unterwegs überquert der Sensor die rote Zone: Dort darf der Roboter nicht anhalten.', hint: 'robot.drive(200, 0), dann while sensor.color() != Color.BLACK: wait(10), dann robot.stop().' },
      ],
    },
    u5l2: {
      title: 'Linienfolger',
      intro: 'sensor.reflection() misst von 0 bis 100, wie viel Licht zurückkommt: Schwarz liegt bei etwa 7, Weiß bei etwa 96. Am Rand der Linie liegt der Wert dazwischen, um 50.\n\nDer Proportionalfolger berechnet error = reflection() - 50 und lenkt den Roboter proportional zum Fehler: robot.drive(150, error * gain). Er fährt am Rand der Linie entlang und korrigiert ständig.',
      ex: [
        { prompt: 'Der Sensor ist ganz über Schwarz. Welcher reflection()-Wert ist am wahrscheinlichsten?', options: ['Etwa 7', 'Etwa 50', 'Etwa 96', 'Genau 100'], explain: 'Schwarz wirft wenig Licht zurück.' },
        { prompt: 'Der Roboter fährt starken Zickzack über die Linie. Was hilft meistens?', options: ['Den Verstärkungsfaktor senken', 'Den Verstärkungsfaktor erhöhen', 'Das wait(10) entfernen', 'turn() statt drive() verwenden'], explain: 'Ein hoher Verstärkungsfaktor übertreibt die Korrekturen. Senke ihn schrittweise (und bei Bedarf auch die Geschwindigkeit).' },
        { prompt: 'Der Roboter startet schon mit dem Sensor am Rand der Linie. Ergänze den Linienfolger, damit er die Gerade und die Kurve bis zum Ende der Linie fährt.', hint: 'Ersetze in der while-Schleife den Kommentar durch robot.drive(150, error * gain).' },
      ],
    },
    u6l1: {
      title: 'Schleifen',
      intro: 'for i in range(4): wiederholt den eingerückten Block 4-mal. Der Block ist alles, was unter dem for um 4 Leerzeichen weiter eingerückt ist.\n\nVergiss den Doppelpunkt am Ende der Zeile nicht.',
      ex: [
        { prompt: 'Wie oft wird der Block von for i in range(3): ausgeführt?', options: ['3', '2', '4', 'Endlos'], explain: 'range(3) zählt 0, 1 und 2: dreimal.' },
        { prompt: 'Ergänze, um 4-mal zu wiederholen.', explain: 'range(4) erzeugt die Zahlen 0 bis 3.' },
        { prompt: 'Fahr mit for ein Quadrat mit 300 mm Seitenlänge und ende dort, wo du gestartet bist. Der Roboter startet außerhalb der Basis, mit freiem Platz vorn und links.', hint: 'for i in range(4): und darin robot.straight(300) und robot.turn(-90).' },
      ],
    },
    u6l2: {
      title: 'Funktionen',
      intro: 'def legt eine Funktion an: einen Namen für eine Gruppe von Befehlen. In der FLL hat man oft eine Funktion pro Mission.\n\nFunktionen können Werte bekommen, etwa def go_and_back(distance):. Darin hat distance den Wert, der beim Aufruf übergeben wurde.',
      ex: [
        { prompt: 'Was passiert, wenn Python die Zeile def mission(): liest?', options: ['Es speichert die Funktion nur; sie läuft, wenn mission() aufgerufen wird', 'Es führt die Funktion sofort aus', 'Es gibt einen Fehler, wenn die Funktion nie benutzt wird', 'Es wiederholt die Funktion endlos'], explain: 'Definieren ist nicht ausführen. Sie läuft erst, wenn du mission() aufrufst.' },
        { prompt: 'Bring die Funktion und den Aufruf in die richtige Reihenfolge.', explain: 'Zuerst die Definition mit ihrem eingerückten Block, dann der Aufruf außerhalb des Blocks.' },
        { prompt: 'Schreib die Funktion go_and_back(distance) und nutze sie, um die rote Zone zu besuchen und zum Start zurückzukehren.', hint: 'In der Funktion: robot.straight(distance) und robot.straight(-distance). Außerhalb: go_and_back(800).' },
      ],
    },
    u7l1: {
      title: 'Raus aus der Basis',
      intro: 'In einem FLL-Match verlässt der Roboter die Basis, erfüllt Missionen und kommt zurück. Du hast 2 Minuten und 30 Sekunden für alle Läufe.\n\nDiese Aufgabe gibt keine Maße vor: Nutze das Lineal am Mattenrand. Die Mitte der blauen Zone liegt bei x = 1600 mm und die grüne Zone bei x = 2150, y = 860.',
      ex: [
        { prompt: 'Wie lange dauert ein FLL-Challenge-Match?', options: ['2 min 30 s', '1 min', '5 min', '10 min'], explain: '150 Sekunden. Deshalb zählt jede gesparte Sekunde.' },
        { prompt: 'Fahr durch die blaue Zone, dann durch die grüne Zone und ende wieder in BASIS 1.', hint: 'Eine Lösung: schnellere settings, straight(1480), turn(-49), straight(844) und denselben Weg rückwärts zurück.' },
      ],
    },
    u8l1: {
      title: 'Gyroskop',
      intro: 'Bei einem echten Roboter rutschen die Räder bei jeder Drehung ein wenig, und kein Rad gleicht genau dem anderen. 2° Fehler pro Drehung werden am Ende eines Laufs zu einem großen Fehler.\n\nrobot.use_gyro(True) lässt die DriveBase die Drehung mit dem Gyroskop des Hubs messen und selbst korrigieren.\n\nIn dieser Aufgabe ist der Simulator im realistischen Modus: Die Räder rutschen wie bei einem echten Roboter.',
      ex: [
        { prompt: 'Warum verfehlt der echte Roboter seine Drehungen trotz richtigem Programm?', options: ['Die Räder rutschen und sind nicht identisch', 'Python rundet die Zahlen', 'Der Hub dreht nur in 10-Grad-Schritten', 'Der Akku ändert den verlangten Winkel'], explain: 'Die DriveBase zählt die Drehung über die Räder. Rutschen sie, passt die Zählung nicht zur echten Drehung.' },
        { prompt: 'Was misst das Gyroskop?', options: ['Wie weit sich der Roboter wirklich gedreht hat', 'Die Farbe der Matte', 'Den Abstand zur Wand', 'Die Radgeschwindigkeit'], explain: 'Das Gyroskop spürt die Drehung des Hubs selbst und hängt deshalb nicht von den Rädern ab.' },
        { prompt: 'Ergänze, um das Gyroskop in der DriveBase einzuschalten.', explain: 'use_gyro(True) schaltet es ein, use_gyro(False) aus.' },
        { prompt: 'Führe das Programm unverändert aus: Nach zwei Runden im Quadrat kommt der Roboter nicht zum Start zurück. Schalte das Gyroskop ein, damit er genau zurückkommt.', hint: 'Füge robot.use_gyro(True) vor dem for ein.' },
      ],
    },
    u8l2: {
      title: 'Kalibrierung',
      intro: 'Das Programm weiß nur, was du ihm sagst. Ist das echte Rad etwas größer als 56 mm, fährt der Roboter weiter als verlangt.\n\nZum Kalibrieren: 1000 mm fahren und messen. Neuer wheel_diameter = aktuell × gemessen ÷ 1000.\n\nFür die Drehung: 360° drehen und schauen, wie weit er sich gedreht hat. Neuer axle_track = aktuell × 360 ÷ echte Drehung.',
      ex: [
        { prompt: 'Der Roboter sollte 1000 mm fahren, fuhr aber 980 mm. Was machst du mit wheel_diameter?', options: ['Verkleinern', 'Vergrößern', 'Beibehalten und axle_track ändern', 'Das Vorzeichen umkehren'], explain: 'Er fuhr weniger, also ist das echte Rad kleiner, als das Programm denkt: verkleinern (56 × 980 ÷ 1000 = 54,9).' },
        { prompt: 'Ich habe turn(360) verlangt und der Roboter drehte nur 350°. Was machst du mit axle_track?', options: ['Vergrößern', 'Verkleinern', 'Beibehalten', 'Auf null setzen'], explain: 'Damit er weiter dreht, muss die DriveBase glauben, dass die Räder weiter auseinander sind: 140 × 360 ÷ 350 = 144.' },
        { prompt: 'Mit wheel_diameter=56 fuhr der Roboter 1025 mm, als ich 1000 mm verlangt habe. Trag den neuen Wert ein (56 × 1025 ÷ 1000):', explain: '56 × 1,025 = 57,4 mm.' },
      ],
    },
    u9l1: {
      title: 'P und D',
      intro: 'Um der Linie schnell zu folgen, muss der Proportionalfaktor (kp) hoch sein, aber dann schießt der Roboter über und fährt Zickzack.\n\nDer D-Anteil schaut, wie stark sich der Fehler seit der letzten Messung geändert hat: derivative = error - last_error. Wird der Fehler schnell kleiner, dämpft D die Korrektur, bevor der Roboter überschießt.\n\nturn_rate = kp × error + kd × derivative',
      ex: [
        { prompt: 'Wofür ist der D-Anteil (differenziell) da?', options: ['Die Korrektur vor dem Überschießen dämpfen', 'Schneller fahren', 'Die Linienfarbe messen', 'Den Roboter am Ende anhalten'], explain: 'D reagiert darauf, wie schnell sich der Fehler ändert, und dämpft das Zickzack.' },
        { prompt: 'In welcher Reihenfolge stimmt man einen PID in der FLL am besten ab?', options: ['Zuerst kp, dann kd, ki zuletzt (falls nötig)', 'Zuerst ki, dann kp', 'Alle auf einmal', 'Zuerst kd, dann kp'], explain: 'kp sorgt fürs Folgen, kd entfernt das Zickzack, und ki braucht man bei einem Linienfolger selten.' },
        { prompt: 'Bei 400 mm/s, mit kp = 6 und ohne D, fährt der Roboter Zickzack und verliert die Linie. Stimme die Faktoren so ab, dass er das Ende der Linie innerhalb von 4 Sekunden erreicht.', hint: 'Behalte kp = 6 und setze kd = 8.' },
      ],
    },
    u10l1: {
      title: 'Schieben mit einer Funktion',
      intro: 'Viele FLL-Missionen bestehen darin, ein Objekt an eine Stelle zu schieben. Die Stoßstange des Roboters schiebt, was vor ihr liegt.\n\nPack jede Mission in eine Funktion mit klarem Namen, etwa push_crate(). So kannst du eine Mission einzeln testen und das Match aufbauen, indem du die Funktionen nacheinander aufrufst.',
      ex: [
        { prompt: 'Warum kommt jede Mission in ihre eigene Funktion?', options: ['Um jede einzeln zu testen und die Reihenfolge leicht zu ändern', 'Weil Pybricks es verlangt', 'Damit der Roboter schneller wird', 'Um Akku zu sparen'], explain: 'Funktionen halten das Programm ordentlich: Du änderst eine Mission, ohne die anderen kaputt zu machen.' },
        { prompt: 'Ergänze push_crate(), um die orange Kiste in die blaue Zone zu schieben und zu BASIS 1 zurückzukehren.', hint: 'Die Kistenmitte muss zwischen x = 1500 und 1700 landen. Probier robot.straight(1300) und dann robot.straight(-1300).' },
      ],
    },
    u10l2: {
      title: 'Greifen mit dem Greifer',
      intro: 'In dieser Aufgabe hat der Roboter den Greifer auf der linken Seite (Port C). Bei 90° ist er offen, bei 0° geschlossen.\n\nZum Greifen: öffnen, mit der Kiste zwischen den Backen ankommen und schließen. Zum Loslassen wieder öffnen.\n\nDie Mitte des Greifers liegt 214 mm vor und 46 mm links von der Robotermitte.',
      ex: [
        { prompt: 'Was passiert, wenn der Greifer sich ohne etwas zwischen den Backen schließt?', options: ['Er schließt leer und der Roboter fährt ohne Kiste weiter', 'Das Programm gibt einen Fehler', 'Der Roboter hält an', 'Die Kiste kommt zum Greifer'], explain: 'Der Greifer packt nur, was beim Schließen zwischen den Backen ist.' },
        { prompt: 'Nutze open_claw() und close_claw(), um die blaue Kiste zu greifen und in BASIS 1 zu bringen.', hint: 'open_claw(), robot.straight(466), close_claw(), robot.straight(-466).' },
      ],
    },
    u1l3: {
      title: 'Fehler und Kommentare',
      intro: 'Zeilen, die mit # beginnen, sind Kommentare: Notizen für das Team, die der Roboter ignoriert.\n\nWenn etwas falsch ist, hält das Programm an und zeigt einen Fehler mit der Zeilennummer. Ein falsch geschriebener Befehl wie robot.straigth() ergibt AttributeError: Die DriveBase hat keinen Befehl mit diesem Namen.',
      ex: [
        { prompt: 'Was macht der Roboter mit einer Zeile, die mit # beginnt?', options: ['Er ignoriert sie: Es ist ein Kommentar', 'Er führt sie zweimal aus', 'Er stoppt das Programm mit einem Fehler', 'Er piept'], explain: 'Kommentare erklären den Code für Menschen. Der Roboter überspringt sie.' },
        { prompt: 'robot.straigth(300) ergibt einen Fehler. Warum?', options: ['Der Befehlsname ist falsch geschrieben', 'Die Zahl ist zu groß', 'Klammern sind nicht erlaubt', 'Der Roboter braucht zuerst einen Kommentar'], explain: 'Der richtige Name ist straight. Python kennt nur den genauen Namen.' },
        { prompt: 'Dieses Programm stoppt mit einem Fehler. Starte es, lies die Meldung und repariere es, damit der Roboter 500 mm fährt.', hint: 'Schau, wie straight geschrieben ist.' },
      ],
    },
    u1l4: {
      title: 'Licht und Ton',
      intro: 'Der Hub hat ein Licht am mittleren Knopf und einen Lautsprecher. hub.light.on(Color.GREEN) schaltet das Licht auf Grün und hub.speaker.beep() macht einen kurzen Piepton.\n\nDas hilft beim Testen: Ein Piepton zeigt, dass ein Schritt fertig ist, und das Licht kann zeigen, bei welcher Mission der Roboter ist.',
      ex: [
        { prompt: 'Welcher Befehl lässt den Hub piepen?', options: ['hub.speaker.beep()', 'hub.light.beep()', 'robot.beep()', 'hub.display.beep()'], explain: 'Der Ton kommt aus dem Lautsprecher: hub.speaker.' },
        { prompt: 'Ergänze, damit das Licht grün wird.', explain: 'Farben nutzen Color und den Namen in Großbuchstaben.' },
        { prompt: 'Schalte das Licht auf Grün, fahr 300 mm und piepe am Ende.', hint: 'hub.light.on(Color.GREEN), robot.straight(300), hub.speaker.beep().' },
      ],
    },
    u2l4: {
      title: 'Rückwärts fahren',
      intro: 'Viele Missionen verlangen nur, dass der Roboter auf demselben Weg hin und zurück fährt. Statt umzudrehen, fahr mit einer negativen Strecke rückwärts: robot.straight(-800) macht robot.straight(800) rückgängig.\n\nDas ist schneller, und der Roboter kommt in derselben Ausrichtung zurück.',
      ex: [
        { prompt: 'Der Roboter ist robot.straight(800) gefahren. Welcher Befehl bringt ihn ohne Drehen zum Start zurück?', options: ['robot.straight(-800)', 'robot.turn(180)', 'robot.straight(800)', 'robot.turn(-800)'], explain: 'Eine negative Strecke fährt auf demselben Weg rückwärts.' },
        { prompt: 'Besuche die rote Zone und komm ohne Drehen zurück in BASIS 1.', hint: 'robot.straight(800) und robot.straight(-800).' },
      ],
    },
    u2l5: {
      title: 'Umdrehen',
      intro: 'Umdrehen ist eine halbe Drehung: robot.turn(180) oder robot.turn(-180). Beide enden in der entgegengesetzten Richtung; sie drehen sich nur andersherum.\n\nNach dem Umdrehen bringen positive Strecken den Roboter dorthin zurück, wo er herkam.',
      ex: [
        { prompt: 'Ergänze, damit der Roboter umdreht.', explain: '180 oder -180: eine halbe Drehung zu einer der beiden Seiten.' },
        { prompt: 'Was macht robot.straight(300) nach robot.turn(180)?', options: ['Fährt 300 mm zurück in Richtung Herkunft', 'Fährt 300 mm rückwärts', 'Dreht weitere 300 Grad', 'Fährt seitwärts'], explain: 'Der Roboter schaut jetzt in die andere Richtung, also führt vorwärts zurück zum Start.' },
        { prompt: 'Fahr zur roten Zone, dreh um und komm vorwärts fahrend zurück in BASIS 1.', hint: 'straight(800), turn(180), straight(800).' },
      ],
    },
    u2l6: {
      title: 'Diagonalen',
      intro: 'Der kürzeste Weg ist eine gerade Linie. Um direkt zu einem Punkt zu fahren, dreh dich zu ihm und fahr die Länge der Diagonale.\n\nLiegt der Punkt a mm voraus und b mm zur Seite, ist die Strecke √(a² + b²) (Pythagoras). Der Winkel ist atan(b ÷ a). Das Lineal-Werkzeug unter Simulieren rechnet das für dich.',
      ex: [
        { prompt: 'Ein Punkt liegt 600 mm voraus und 800 mm links. Wie weit ist er in gerader Linie entfernt?', options: ['1000 mm', '1400 mm', '200 mm', '700 mm'], explain: '√(600² + 800²) = √1.000.000 = 1000 mm.' },
        { prompt: 'Warum ist die Diagonale meist besser als „geradeaus, drehen, geradeaus“?', options: ['Sie ist kürzer und hat weniger Bewegungen', 'Sie ist immer genauer', 'Pybricks verlangt es', 'Sie verbraucht weniger Akku am Hub'], explain: 'Weniger Bewegungen und ein kürzerer Weg sparen Zeit. Jede Drehung bringt außerdem einen kleinen Fehler.' },
        { prompt: 'Erreiche die gelbe Zone mit genau einem turn() und einem straight(). Die Mitte der Zone liegt 800 mm voraus und 640 mm links.', hint: 'Winkel: atan(640 ÷ 800) = 38,7° nach links. Strecke: √(800² + 640²) = 1024 mm.' },
      ],
    },
    u3l3: {
      title: 'S-Kurve',
      intro: 'Zwei Kurven in entgegengesetzte Richtungen ergeben ein S. robot.curve(300, -90) und danach robot.curve(300, 90) bringen den Roboter 600 mm nach vorn und 600 mm nach links, und er schaut am Ende in dieselbe Richtung wie am Start.\n\nSo wechselt man sanft die Spur, ohne anzuhalten.',
      ex: [
        { prompt: 'Wohin schaut der Roboter nach robot.curve(300, -90) und dann robot.curve(300, 90)?', options: ['In dieselbe Richtung wie am Start', 'Nach links', 'Nach rechts', 'Nach hinten'], explain: 'Eine Kurve dreht 90° nach links, die andere 90° nach rechts: Sie heben sich auf.' },
        { prompt: 'Erreiche die gelbe Zone mit zwei Kurven und schau am Ende nach rechts, wie am Start.', hint: 'curve(300, -90), curve(300, 90) und dann straight(200).' },
      ],
    },
    u3l4: {
      title: 'Drehgeschwindigkeit',
      intro: 'settings() ändert mit turn_rate auch die Drehgeschwindigkeit, in Grad pro Sekunde. robot.settings(turn_rate=400) lässt turn() schneller drehen.\n\nSchnelle Drehungen sparen Zeit, aber am echten Roboter rutschen sie mehr. Teste auf der Matte.',
      ex: [
        { prompt: 'Welche Einstellung ändert, wie schnell turn() dreht?', options: ['turn_rate', 'straight_speed', 'axle_track', 'wheel_diameter'], explain: 'turn_rate ist die Drehgeschwindigkeit in Grad pro Sekunde.' },
        { prompt: 'Ergänze, damit die Drehungen schneller werden.', explain: 'turn_rate=400 bedeutet 400 Grad pro Sekunde.' },
        { prompt: 'Dreh eine volle Umdrehung (360°) in weniger als 2 Sekunden. Mit der Standardgeschwindigkeit dauert es 2,5 s.', hint: 'Setz robot.settings(turn_rate=400) vor die Drehung.' },
      ],
    },
    u4l3: {
      title: 'Genauer Winkel',
      intro: 'run_angle() zählt von dort weiter, wo der Motor gerade steht, deshalb summieren sich kleine Fehler. run_target(Geschwindigkeit, Winkel) fährt auf einen genauen Winkel, gezählt ab null, egal wo der Motor angefangen hat.\n\nreset_angle(0) legt die aktuelle Position als neue Null fest.',
      ex: [
        { prompt: 'Was macht left_arm.reset_angle(0)?', options: ['Legt die aktuelle Position als Null fest', 'Dreht den Motor zurück auf null', 'Stoppt den Motor', 'Dreht um 0 Grad'], explain: 'Es bewegt nichts: Es ändert nur den Bezugspunkt.' },
        { prompt: 'Der Aufsatz steht schon bei 105°. Lass ihn genau bei 120° enden.', hint: 'left_arm.run_target(500, 120).' },
      ],
    },
    u4l4: {
      title: 'Zwei Aufsätze gleichzeitig',
      intro: 'Wenn der erste Befehl wartet, bis er fertig ist, startet der zweite Aufsatz erst danach. Mit wait=False beim ersten bewegen sich beide zusammen und du sparst Zeit.',
      ex: [
        { prompt: 'Wie bewegst du zwei Aufsätze gleichzeitig?', options: ['wait=False beim ersten Befehl', 'wait=False bei beiden Befehlen', 'Beide in dieselbe Zeile schreiben', 'Das geht in Pybricks nicht'], explain: 'Der erste startet und das Programm geht zum zweiten. Der zweite wartet ohne wait=False, bis er fertig ist.' },
        { prompt: 'Dreh beide Aufsätze in weniger als 0,8 Sekunden um 180°.', hint: 'left_arm.run_angle(500, 180, wait=False) und right_arm.run_angle(500, 180).' },
      ],
    },
    u5l3: {
      title: 'Auf einer Farbe anhalten',
      intro: 'Dieselbe Schleife, die auf Schwarz anhält, funktioniert für jede Farbe: Ändere einfach die Farbe in der Bedingung.\n\nDer Sensor sitzt vor der Robotermitte und etwas links, deshalb hält der Roboter, wenn der Sensor (nicht die Mitte) die Farbe erreicht.',
      ex: [
        { prompt: 'Ergänze, um auf der roten Zone anzuhalten.', explain: 'Color.RED ist Rot.' },
        { prompt: 'Der Roboter hat mit dem Sensor auf Rot angehalten, aber seine Mitte ist noch vor der Zone. Warum?', options: ['Der Sensor sitzt vor der Robotermitte', 'Der Sensor ist kaputt', 'Rot wird nicht erkannt', 'Der Roboter ist rückwärts gefahren'], explain: 'Der Sensor liest den Boden vor dem Roboter. Denk daran, wenn du planst, wo er anhalten soll.' },
        { prompt: 'Fahr, bis der Sensor die rote Zone findet, und halte dort an.', hint: 'robot.drive(200, 0), while sensor.color() != Color.RED: wait(10), robot.stop().' },
      ],
    },
    u5l4: {
      title: 'Mit der Reflexion anhalten',
      intro: 'reflection() liefert eine Zahl, also kannst du eine Grenze wählen. Schwarz liegt bei etwa 7: Solange sensor.reflection() > 20 ist, ist der Roboter noch nicht auf Schwarz.\n\nDas hilft, wenn die Farben auf der offiziellen Matte nicht genau die sind, die color() kennt.',
      ex: [
        { prompt: 'Welche Bedingung lässt den Roboter weiterfahren, wenn er mit reflection() auf Schwarz anhalten soll?', options: ['while sensor.reflection() > 20:', 'while sensor.reflection() < 20:', 'while sensor.reflection() == 100:', 'while sensor.color() > 20:'], explain: 'Solange der Wert hoch ist (heller Boden), weiterfahren. Auf Schwarz fällt er unter 20.' },
        { prompt: 'Halte mit sensor.reflection() auf dem schwarzen STOPP-Streifen an.', hint: 'robot.drive(200, 0), while sensor.reflection() > 20: wait(10), robot.stop().' },
      ],
    },
    u5l5: {
      title: 'Erst eine Farbe, dann eine andere',
      intro: 'Du kannst auf eine Sache warten und danach auf eine andere: eine while-Schleife nach der anderen. Der Roboter fährt die ganze Zeit weiter, denn drive() hört erst mit stop() auf.\n\nSo nutzt der Roboter eine Markierung auf der Matte als Kontrollpunkt vor dem letzten Halt.',
      ex: [
        { prompt: 'Bring das Programm in die richtige Reihenfolge: fahren, auf Rot warten, dann auf Schwarz warten und anhalten.', explain: 'Die beiden Schleifen laufen nacheinander, während der Roboter weiterfährt.' },
        { prompt: 'Fahr los, warte zuerst auf die rote Zone, dann auf den schwarzen STOPP-Streifen, und halte darauf an.', hint: 'Zwei Schleifen: while sensor.color() != Color.RED und while sensor.color() != Color.BLACK.' },
      ],
    },
    u6l3: {
      title: 'Wiederholen, solange',
      intro: 'while wiederholt, solange eine Bedingung wahr ist. Zusammen mit drive() hält es den Roboter im richtigen Moment an: robot.drive(200, 0), dann while robot.distance() < 600: wait(10), dann robot.stop().\n\ndistance() wird aktualisiert, während der Roboter fährt.',
      ex: [
        { prompt: 'Wann hört while robot.distance() < 600: auf zu wiederholen?', options: ['Wenn der Roboter 600 mm oder mehr gefahren ist', 'Nie', 'Nach 600 Wiederholungen', 'Sofort'], explain: 'Bei 600 mm wird die Bedingung falsch und das Programm geht weiter.' },
        { prompt: 'Nutze drive() und eine while-Schleife, um den Roboter nach 600 mm anzuhalten.', hint: 'while robot.distance() < 600: und darin wait(10).' },
      ],
    },
    u6l4: {
      title: 'Entscheiden mit if',
      intro: 'if führt einen Block nur aus, wenn die Bedingung wahr ist; else läuft, wenn sie falsch ist. Der Roboter kann je nach Sensor entscheiden, was er tut.\n\nBeispiel: if sensor.color() == Color.RED: robot.turn(-90) else: robot.turn(90).',
      ex: [
        { prompt: 'Was gibt dieses Programm aus?', options: ['A', 'B', 'A und B', 'Nichts'], explain: '5 > 3 ist wahr, also läuft nur der if-Block.' },
        { prompt: 'Fahr 700 mm. Sieht der Sensor Rot, dreh nach links, sonst nach rechts. Fahr dann 400 mm.', hint: 'if sensor.color() == Color.RED: robot.turn(-90), else: robot.turn(90).' },
      ],
    },
    u6l5: {
      title: 'Listen',
      intro: 'Eine Liste speichert mehrere Werte in einer Reihenfolge: moves = [800, 640]. moves[0] ist der erste, moves[1] der zweite.\n\nfor geht jedes Element der Liste durch. Eine Liste von Paaren (Strecke, Winkel) beschreibt einen ganzen Weg in einer Zeile.',
      ex: [
        { prompt: 'Was ist moves[1] bei moves = [800, 640]?', options: ['640', '800', '1440', 'Ein Fehler'], explain: 'Gezählt wird ab 0: moves[0] ist 800 und moves[1] ist 640.' },
        { prompt: 'Ergänze, um jede Strecke der Liste zu fahren.', explain: 'for gibt distance nacheinander jeden Wert der Liste.' },
        { prompt: 'Ergänze die Schleife, um der Liste der Bewegungen zu folgen und die gelbe Zone zu erreichen.', hint: 'In der for-Schleife: robot.straight(distance) und robot.turn(angle).' },
      ],
    },
    u6l6: {
      title: 'Funktionen mit Rückgabewert',
      intro: 'Eine Funktion kann einen Wert berechnen und mit return zurückgeben. def mm(cm): return cm * 10 rechnet Zentimeter in Millimeter um.\n\nDer Aufruf mm(80) wird durch das Ergebnis ersetzt, 800.',
      ex: [
        { prompt: 'Ergänze, damit die Funktion den Wert in Millimetern zurückgibt.', explain: 'return schickt das Ergebnis an den, der die Funktion aufgerufen hat.' },
        { prompt: 'Was gibt dieses Programm aus?', options: ['9', '8', '10', 'double(4) + 1'], explain: 'double(4) gibt 8 zurück, plus 1 ergibt 9.' },
        { prompt: 'Nutze mm(), um 80 cm zu fahren und die rote Zone zu erreichen.', hint: 'robot.straight(mm(80)).' },
      ],
    },
    u6l7: {
      title: 'Mit break aus der Schleife',
      intro: 'while True: wiederholt endlos. break verlässt die Schleife sofort, so entscheidest du innerhalb der Schleife, wann Schluss ist.\n\nDas ist nützlich, wenn es mehrere Gründe zum Anhalten gibt.',
      ex: [
        { prompt: 'Was gibt dieses Programm aus?', options: ['0, 1 und 2', '0, 1, 2 und 3', 'Nur 3', 'Nichts'], explain: 'Wenn i 3 ist, verlässt break die Schleife vor dem print.' },
        { prompt: 'Ergänze die Schleife, damit der Roboter mit break auf dem schwarzen STOPP-Streifen anhält.', hint: 'if sensor.color() == Color.BLACK: break.' },
      ],
    },
    u7l2: {
      title: 'Von Basis zu Basis',
      intro: 'Die Trainingsmatte hat zwei Basen, eine auf jeder Seite, wie die Startbereiche am FLL-Tisch. BASIS 2 liegt rechts, am anderen Ende der Matte.\n\nDie ganze Matte zu überqueren dauert: Nutze settings(), um schneller zu fahren.',
      ex: [
        { prompt: 'Wie viele Basen hat die BatControl-Trainingsmatte?', options: ['Zwei, eine auf jeder Seite', 'Eine', 'Vier', 'Keine'], explain: 'BASIS 1 links und BASIS 2 rechts.' },
        { prompt: 'Überquere die Matte von BASIS 1 nach BASIS 2 in weniger als 6 Sekunden.', hint: 'robot.settings(straight_speed=400) und robot.straight(2000).' },
      ],
    },
    u7l3: {
      title: 'Aufsatz unterwegs',
      intro: 'In einem echten Durchlauf bewegt sich der Aufsatz, während der Roboter fährt. Starte den Aufsatz mit wait=False und fahr dann: Beides passiert gleichzeitig.\n\nSo sparen gute Teams bei jeder Mission Sekunden.',
      ex: [
        { prompt: 'Warum den Aufsatz bewegen, während der Roboter fährt?', options: ['Um Matchzeit zu sparen', 'Damit der Roboter genauer wird', 'Weil der Hub es verlangt', 'Um Akku zu sparen'], explain: 'Zwei Aktionen gleichzeitig dauern so lange wie die längere, nicht die Summe.' },
        { prompt: 'Fahr zur roten Zone und öffne unterwegs den rechten Aufsatz um 90°, schließ ihn auf dem Rückweg wieder auf 0° und ende in BASIS 1, alles in weniger als 6 Sekunden.', hint: 'settings(straight_speed=400), right_arm.run_angle(500, 90, wait=False), straight(800), right_arm.run_angle(500, -90, wait=False), straight(-800).' },
      ],
    },
    u8l3: {
      title: 'Mit dem Gyro drehen',
      intro: 'hub.imu.heading() sagt, um wie viele Grad sich der Roboter gedreht hat. Eine Rechtsdrehung erhöht den Wert.\n\nDu kannst mit drive(0, Geschwindigkeit) drehen und anhalten, wenn das Heading den gewünschten Winkel erreicht. Der Gyro misst die echte Drehung, auch wenn die Räder rutschen.',
      ex: [
        { prompt: 'Was zeigt hub.imu.heading() nach einer Drehung um 90° nach rechts?', options: ['90', '-90', '0', '180'], explain: 'Eine Rechtsdrehung erhöht das Heading.' },
        { prompt: 'Ergänze die Bedingung mit dem Gyro.', explain: 'heading() wird bei jeder Wiederholung neu gelesen.' },
        { prompt: 'Der Roboter dreht sich schon mit drive(0, 120). Halte ihn an, wenn das Heading 90 erreicht.', hint: 'while hub.imu.heading() < 90: wait(10).' },
      ],
    },
    u9l2: {
      title: 'Eine Zeit lang folgen',
      intro: 'StopWatch() ist eine Stoppuhr in Millisekunden. watch.time() sagt, wie viel Zeit seit ihrem Anlegen vergangen ist.\n\nEin Linienfolger kann nach Zeit statt nach Strecke anhalten: while watch.time() < 3000 folgt 3 Sekunden lang.',
      ex: [
        { prompt: 'Was gibt watch.time() zurück?', options: ['Millisekunden seit dem Anlegen oder Zurücksetzen der StopWatch', 'Sekunden', 'Die Uhrzeit', 'Minuten'], explain: 'Pybricks misst Zeit immer in ms. 3000 ms = 3 s.' },
        { prompt: 'Ändere die Schleife, damit der Roboter 3 Sekunden der Linie folgt und anhält.', hint: 'while watch.time() < 3000:' },
      ],
    },
    u10l3: {
      title: 'Zwei Missionen hintereinander',
      intro: 'Jede Mission in ihrer eigenen Funktion, der Reihe nach aufgerufen. Jede beginnt und endet in der Basis, damit die nächste immer an einem bekannten Ort startet.\n\nUm die gelbe Zone zu erreichen, ohne die Kiste anzustoßen, fahr erst nach oben und dann nach rechts.',
      ex: [
        { prompt: 'Warum sollte jede Missionsfunktion wieder in der Basis enden?', options: ['Damit die nächste Mission an einem bekannten Ort startet', 'Weil Python es verlangt', 'Damit der Roboter schneller wird', 'Um den Hub neu zu starten'], explain: 'Endet eine Mission jedes Mal woanders, stimmen alle folgenden Maße nicht.' },
        { prompt: 'Ergänze beide Funktionen: Schieb die Kiste in die rote Zone, besuche dann die gelbe Zone und ende in BASIS 1.', hint: 'push_crate: straight(620) und straight(-620). visit_yellow: turn(-90), straight(640), turn(90), straight(800) und denselben Weg rückwärts zurück.' },
      ],
    },
    u10l4: {
      title: 'Mit dem Greifer abliefern',
      intro: 'Greifen ist nur die Hälfte: Der Roboter muss das Teil transportieren und an der richtigen Stelle loslassen. Öffnen, greifen, mit der Kiste fahren, wieder öffnen und zurückkommen.\n\nDie Mitte des Greifers liegt 214 mm vor der Robotermitte.',
      ex: [
        { prompt: 'Der Roboter hält die Kiste. Was lässt sie los?', options: ['Den Greifer öffnen', 'Rückwärts fahren', 'Den Roboter drehen', 'Den Roboter anhalten'], explain: 'Die Kiste bleibt im Greifer, bis er sich öffnet.' },
        { prompt: 'Greif die blaue Kiste, setz sie in der roten Zone ab und kehr zu BASIS 1 zurück.', hint: 'open_claw(), straight(266), close_claw(), straight(340), open_claw(), straight(-606).' },
      ],
    },
    u11l1: {
      title: 'Syntaxfehler',
      intro: 'SyntaxError bedeutet, dass Python nicht verstanden hat, wie eine Zeile geschrieben ist: ein fehlender Doppelpunkt, falsche Einrückung oder eine offene Klammer.\n\nDie Meldung zeigt die Zeile. Schau dir diese Zeile und die davor an.',
      ex: [
        { prompt: 'SyntaxError in einer Zeile mit for. Was ist die wahrscheinlichste Ursache?', options: ['Der Doppelpunkt am Ende fehlt', 'Die Zahl ist falsch', 'Der Motor ist nicht angeschlossen', 'Der Roboter ist zu langsam'], explain: 'for, while, if und def enden immer mit einem Doppelpunkt.' },
        { prompt: 'Dieses Programm soll ein Quadrat mit 300 mm fahren und zum Start zurückkehren, hat aber zwei Fehler. Repariere sie.', hint: 'Setz den Doppelpunkt nach range(4) und rück robot.turn(-90) ein, damit es in der for-Schleife steht.' },
      ],
    },
    u11l2: {
      title: 'Mit print nachforschen',
      intro: 'print() zeigt Werte im Ausgabe-Bereich. So findest du am einfachsten heraus, was der Roboter „denkt“: wie weit er gefahren ist, was der Sensor misst, wie das Heading ist.\n\nAm echten Hub erscheint print im Terminal von Pybricks Code.',
      ex: [
        { prompt: 'Was gibt dieses Programm aus?', options: ['250', '0', '25', 'Ein Fehler'], explain: 'distance() zählt die gefahrenen mm seit dem Start.' },
        { prompt: 'Der Roboter fährt bis zum schwarzen Streifen. Gib aus, wie weit er gefahren ist.', hint: 'print(robot.distance()) nach robot.stop().' },
      ],
    },
    u11l3: {
      title: 'Repariere die Mission',
      intro: 'Die meisten Fehler sind klein: eine Zahl in cm statt mm, ein falsches Vorzeichen, eine Zeile an der falschen Stelle.\n\nStarte das Programm, schau, wohin der Roboter fährt, und vergleiche es mit dem, was du wolltest.',
      ex: [
        { prompt: 'Der Roboter dreht nach rechts, sollte aber nach links drehen. Was änderst du?', options: ['Das Vorzeichen des Winkels', 'Die Geschwindigkeit', 'Den Port', 'Den Raddurchmesser'], explain: 'Positiv dreht nach rechts, negativ nach links.' },
        { prompt: 'Dieses Programm soll die gelbe Zone erreichen, hat aber zwei Fehler. Finde und repariere sie.', hint: 'straight(80) sollte 800 mm sein, und die Drehung sollte nach links gehen: turn(-90).' },
      ],
    },
    u11l4: {
      title: 'Falscher Port',
      intro: 'OSError beim Anlegen eines Geräts bedeutet meist, dass das Programm einen Port ohne angeschlossenes Gerät nutzt oder dort ein anderes Gerät steckt.\n\nBeim Standardroboter steckt der Farbsensor an Port E.',
      ex: [
        { prompt: 'Das Programm stoppt mit OSError in der Zeile sensor = ColorSensor(Port.F). Was prüfst du?', options: ['An welchem Port der Sensor wirklich steckt', 'Die Radgröße', 'Die Robotergeschwindigkeit', 'Die Kommentare'], explain: 'Der Fehler sagt, dass an diesem Port nichts gefunden wurde.' },
        { prompt: 'Dieses Programm soll auf der roten Zone anhalten, stoppt aber mit einem Fehler. Repariere es.', hint: 'Der Farbsensor steckt an Port.E.' },
      ],
    },
    u12l1: {
      title: 'Start aus BASIS 2',
      intro: 'Am FLL-Tisch liegen manche Missionen näher am anderen Startbereich. In BatControl liegt BASIS 2 rechts, und der Roboter startet mit Blick nach links.\n\nDie Befehle sind dieselben: Vorwärts ist dort, wohin der Roboter schaut.',
      ex: [
        { prompt: 'Der Roboter startet in BASIS 2 mit Blick nach links. Welcher Befehl fährt ihn zur blauen Zone?', options: ['robot.straight(640)', 'robot.straight(-640)', 'robot.turn(180)', 'robot.curve(640, 90)'], explain: 'Der Roboter schaut nach links, zur blauen Zone, also ist vorwärts positiv.' },
        { prompt: 'Besuche von BASIS 2 aus die blaue Zone und kehr zu BASIS 2 zurück.', hint: 'Die Mitte der blauen Zone liegt 642 mm voraus.' },
      ],
    },
    u12l2: {
      title: 'Gegen die Uhr',
      intro: 'Im Match zählt jede Sekunde. Erhöhe straight_speed und straight_acceleration, aber denk daran: Am echten Roboter kann zu schnell rutschen und Genauigkeit kosten.\n\nDie maximale Radgeschwindigkeit der SPIKE-Motoren liegt bei etwa 490 mm/s.',
      ex: [
        { prompt: 'Welche Änderung hilft auf einem langen, geraden Weg am meisten?', options: ['straight_speed erhöhen', 'turn_rate erhöhen', 'axle_track verringern', 'wait(100) einfügen'], explain: 'Auf einem geraden Weg zählt die Fahrgeschwindigkeit.' },
        { prompt: 'Besuche die rote und die blaue Zone und komm in weniger als 8 Sekunden zurück in BASIS 1.', hint: 'robot.settings(straight_speed=480, straight_acceleration=1500), straight(1480) und straight(-1480).' },
      ],
    },
    u12l3: {
      title: 'Kompletter Durchlauf',
      intro: 'Ein kompletter Durchlauf verbindet mehrere Missionen und endet in einer Basis. Plane zuerst: wo jedes Objekt liegt, welcher Weg Zusammenstöße vermeidet und wo du endest.\n\nIn BASIS 2 zu enden kann den Rückweg sparen.',
      ex: [
        { prompt: 'Was ist der beste erste Schritt, um einen Durchlauf zu planen?', options: ['Den Weg auf der Matte einzeichnen und messen', 'Den Code auf gut Glück schreiben und testen', 'Die Geschwindigkeit auf Maximum stellen', 'Nur Kurven verwenden'], explain: 'Mit gemessenem Weg (das Lineal hilft) stimmt der Code schneller.' },
        { prompt: 'Schieb die Kiste in die blaue Zone, besuche die grüne Zone und ende in BASIS 2.', hint: 'straight(1300), turn(-41), straight(971), turn(126), straight(562).' },
      ],
    },
    u12l4: {
      title: 'Abschlussaufgabe',
      intro: 'Kombiniere, was du gelernt hast: Folge der Linie bis zum Ende und zeig mit Licht und Piepton, dass du angekommen bist.\n\nGlückwunsch: Nach dieser Lektion kennst du die wichtigsten Pybricks-Befehle, die in der FLL verwendet werden.',
      ex: [
        { prompt: 'Wie findest du am besten heraus, ob eine Mission am echten Roboter wirklich funktioniert?', options: ['Sie mehrmals laufen lassen und schauen, ob sie immer klappt', 'Sie einmal laufen lassen', 'Nur den Code anschauen', 'Nur im Simulator testen'], explain: 'Eine gute Mission klappt jedes Mal, nicht nur einmal.' },
        { prompt: 'Folge der Linie bis zum Ende, schalte dann das Licht auf Grün und piepe.', hint: 'while robot.distance() < 1300: Linienfolger mit kp; dann robot.stop(), hub.light.on(Color.GREEN), hub.speaker.beep().' },
      ],
    },
  },

  comments: {
    '3) Mission commands': '3) Befehle der Mission',
    '40 cm forward': '40 cm vorwärts',
    '20 cm backward': '20 cm rückwärts',
    right: 'rechts',
    'left, back to where it was': 'links, zurück in die Ausgangslage',
    '"Go 300 mm to the left" with differential drive:': '„300 mm nach links“ mit Differentialantrieb:',
    'wide curve to the left': 'weite Linkskurve',
    faster: 'schneller',
    'very slow': 'sehr langsam',
    'drives for 2 seconds': 'fährt 2 Sekunden lang',
    'Calibration test: drive 1000 mm and measure with a tape measure': 'Kalibriertest: 1000 mm fahren und mit dem Maßband messen',
    'Then spin a full turn and check where the robot points': 'Dann eine volle Drehung machen und prüfen, wohin der Roboter zeigt',
    'half a turn': 'halbe Umdrehung',
    back: 'zurück',
    'drives while the arm turns': 'fährt, während sich der Aufsatz dreht',
    open: 'öffnen',
    'close (grab the piece)': 'schließen (Teil greifen)',
    'goes to 120': 'fährt auf 120',
    'already there, does not move': 'schon dort, bewegt sich nicht',
    'back to zero': 'zurück auf null',
    'Proportional line follower': 'Proportionaler Linienfolger',
    'PID line follower': 'PID-Linienfolger',
    '300 mm square': 'Quadrat mit 300 mm',
    'Write your commands here': 'Schreib deine Befehle hier',
    'complete: drive at 150 mm/s turning error * gain': 'ergänzen: mit 150 mm/s fahren und um error * gain lenken',
    'complete here': 'hier ergänzen',
    'Two laps of a 300 mm square, back to the start': 'Zwei Runden in einem 300-mm-Quadrat, zurück zum Start',
    'complete: push the crate into the blue zone and come back': 'ergänzen: Kiste in die blaue Zone schieben und zurückkommen',
    'complete: open, drive to the crate, close and bring it to the base': 'ergänzen: öffnen, zur Kiste fahren, schließen und zur Basis bringen',
    'Leave the base, go to the red zone and come back': 'Basis verlassen, zur roten Zone fahren und zurückkommen',
    'Claws: 0 degrees = closed, 90 degrees = open': 'Greifer: 0° = geschlossen, 90° = offen',
    'Close both claws on the crates': 'Beide Greifer an den Kisten schließen',
    'Drive 500 mm forward': '500 mm vorwärts fahren',
    'Go to the yellow zone': 'Zur gelben Zone fahren',
    'turn around': 'umdrehen',
    'complete: drive 80 cm using mm()': 'ergänzen: mit mm() 80 cm fahren',
    'complete: drive the distance, then turn the angle': 'ergänzen: die Strecke fahren, dann um den Winkel drehen',
    'complete: end exactly at 120 degrees': 'ergänzen: genau bei 120 Grad enden',
    'complete: first wait for RED, then for BLACK': 'ergänzen: erst auf ROT warten, dann auf SCHWARZ',
    'complete: follow the line for 3 seconds (3000 ms)': 'ergänzen: 3 Sekunden (3000 ms) der Linie folgen',
    'complete: follow the line to the end, then turn the light green and beep': 'ergänzen: der Linie bis zum Ende folgen, dann Licht grün und piepen',
    'complete: go to the yellow zone and come back': 'ergänzen: zur gelben Zone fahren und zurückkommen',
    'complete: grab the crate, drop it in the red zone and return to the base': 'ergänzen: Kiste greifen, in der roten Zone absetzen und zur Basis zurück',
    'complete: if the sensor sees RED turn left, otherwise turn right': 'ergänzen: sieht der Sensor ROT, links drehen, sonst rechts',
    'complete: keep driving until 600 mm': 'ergänzen: weiterfahren bis 600 mm',
    'complete: leave the loop when the sensor sees BLACK': 'ergänzen: die Schleife verlassen, wenn der Sensor SCHWARZ sieht',
    'complete: print how far the robot drove': 'ergänzen: ausgeben, wie weit der Roboter gefahren ist',
    'complete: push the crate into the red zone and come back': 'ergänzen: Kiste in die rote Zone schieben und zurückkommen',
    'complete: wait until the heading reaches 90': 'ergänzen: warten, bis das Heading 90 erreicht',
  },
};
