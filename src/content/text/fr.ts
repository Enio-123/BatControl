// Contenu pédagogique en français.
import type { ContentText } from './types';

export const TEXT: ContentText = {
  groups: {
    start: 'Premiers pas',
    drive: 'DriveBase (déplacement)',
    arms: 'Moteurs d’accessoires',
    sensor: 'Capteur de couleur',
    hub: 'Hub',
    time: 'Temps',
    python: 'Python pour robots',
  },

  topics: {
    structure: {
      title: 'Structure d’un programme',
      summary: 'Tout programme Pybricks a trois parties : importer ce dont on a besoin, créer les appareils (hub, moteurs, capteurs et le DriveBase) et écrire les commandes de la mission l’une sous l’autre. Le robot les exécute de haut en bas.',
      tips: [
        'Crée chaque appareil une seule fois, au début du programme.',
        'Les lignes qui commencent par # sont des commentaires : le robot les ignore, mais elles aident l’équipe à comprendre le code.',
        'Les noms left_motor, robo et sensor sont notre choix. Tu peux en utiliser d’autres, à condition de garder le même nom dans tout le programme.',
      ],
      mistakes: ['Oublier un import provoque une NameError : Python ne sait pas ce que sont DriveBase ou Port.'],
    },
    motor: {
      title: 'Motor() : créer un moteur',
      summary: 'Crée l’objet qui contrôle un moteur branché sur un port du hub (A à F). Sur le robot standard de BatControl, les roues sont sur les ports A et B et les accessoires sur les ports C et E.',
      params: [
        ['Port.A … Port.F', 'Port du hub où le câble du moteur est branché.'],
        ['Direction', 'Quel sens compte comme positif. Le moteur de la roue gauche est monté en miroir, donc on utilise COUNTERCLOCKWISE pour lui.'],
        ['liste', 'Engrenages entre le moteur et la sortie, par exemple [12, 36]. Facultatif.'],
      ],
      mistakes: [
        'Oublier Direction.COUNTERCLOCKWISE sur le moteur gauche fait tourner le robot sur place au lieu d’avancer tout droit. Essaie dans le simulateur.',
        'Utiliser un port sans moteur donne une OSError : vérifie le câble et le port.',
      ],
    },
    drivebase: {
      title: 'DriveBase() : réunir les roues',
      summary: 'Le DriveBase contrôle ensemble les deux moteurs des roues, pour que le robot avance en millimètres et tourne en degrés. Il doit connaître la taille des roues et la distance entre elles.',
      params: [
        ['Motor', 'Moteur de la roue gauche.'],
        ['Motor', 'Moteur de la roue droite.'],
        ['mm', 'Diamètre de la roue. Le robot BatLego utilise des roues de 62,4 mm (la petite roue du SPIKE Prime mesure 56 mm).'],
        ['mm', 'Distance entre les points où les deux roues touchent le sol.'],
      ],
      tips: [
        'Si le robot avance un peu plus ou un peu moins que demandé, ajuste wheel_diameter.',
        'Si le robot tourne un peu plus ou un peu moins, ajuste axle_track. Voir le sujet Étalonnage.',
      ],
    },
    straight: {
      title: 'straight() : avancer tout droit',
      summary: 'Avance en ligne droite sur la distance indiquée puis s’arrête. Un nombre positif va en avant, un nombre négatif en arrière.',
      params: [
        ['mm', 'Distance à parcourir. 100 mm = 10 cm.'],
        ['Stop', 'Que faire à la fin : Stop.HOLD (maintenir, par défaut), Stop.BRAKE ou Stop.COAST.'],
        ['True/False', 'Si True, le programme attend la fin avant la ligne suivante.'],
      ],
      tips: ['Mesure sur le tapis : la règle au bord du tapis du simulateur a un repère tous les 100 mm. Dans l’onglet Simuler, l’outil Règle mesure pour toi.'],
      mistakes: ['Penser en centimètres : straight(40) n’avance que de 4 cm.'],
    },
    turn: {
      title: 'turn() : tourner sur place',
      summary: 'Fait pivoter le robot sur place, une roue en avant et l’autre en arrière. Un angle positif tourne à droite (sens horaire) et un angle négatif à gauche.',
      params: [
        ['degrés', 'De combien tourner. 90 est un quart de tour, 180 un demi-tour.'],
        ['Stop', 'Comment s’arrêter à la fin.'],
        ['True/False', 'Attendre la fin avant de continuer.'],
      ],
      mistakes: ['Se tromper de signe : turn(90) va à droite, pas à gauche.'],
    },
    strafe: {
      title: 'Et le strafe (se déplacer de côté) ?',
      summary: 'Le DriveBase de Pybricks n’a pas de strafe. Un robot FLL typique a deux roues motrices fixes (entraînement différentiel) qui ne poussent qu’en avant et en arrière. Se déplacer de côté n’existe que sur des robots à roues omni ou mecanum. Pour atteindre un point sur le côté, tourne, avance et tourne à nouveau.',
      tips: ['Si tu écris robo.strafe(...), le simulateur affiche la même erreur que le hub : AttributeError.'],
    },
    curve: {
      title: 'curve() : avancer en arc',
      summary: 'Avance le long d’un arc, comme une voiture dans un virage. Le rayon dit si le virage est large ou serré et l’angle dit quelle part du cercle parcourir. Un angle positif tourne à droite.',
      params: [
        ['mm', 'Rayon du cercle. Positif avance, négatif recule.'],
        ['degrés', 'Quelle part du cercle parcourir. 90 est un quart de cercle.'],
      ],
      tips: ['Les courbes sont plus rapides que s’arrêter, tourner et avancer, mais plus difficiles à rendre précises. Utilise-les quand la mission demande une trajectoire fluide.'],
    },
    settings: {
      title: 'settings() : vitesse et accélération',
      summary: 'Change la vitesse et l’accélération utilisées par straight, turn et curve. Sans argument, renvoie les valeurs actuelles. Plus lent est généralement plus précis.',
      params: [
        ['mm/s', 'Vitesse d’avance.'],
        ['mm/s²', 'À quelle vitesse il accélère et freine.'],
        ['degrés/s', 'Vitesse de rotation.'],
        ['degrés/s²', 'Accélération de rotation.'],
      ],
      tips: ['Dans le simulateur, les valeurs par défaut sont estimées à partir du moteur SPIKE. Sur le vrai hub, elles peuvent varier un peu.'],
    },
    drive: {
      title: 'drive() et stop() : continuer à rouler',
      summary: 'drive() lance les roues et le programme passe tout de suite à la ligne suivante, le robot toujours en mouvement. Le robot ne s’arrête que quand tu appelles robo.stop(). C’est la base de « avance jusqu’à voir la ligne noire » et des suiveurs de ligne.',
      params: [
        ['mm/s', 'Vitesse vers l’avant (négative = en arrière).'],
        ['degrés/s', 'Combien il tourne en roulant. 0 = tout droit, positif = à droite.'],
      ],
      mistakes: ['Appeler drive() et oublier d’attendre (wait ou une boucle) : le programme se termine aussitôt et le robot ne bouge même pas.'],
    },
    distance: {
      title: 'distance(), angle() et reset()',
      summary: 'distance() dit combien de mm le robot a parcouru depuis le début (ou depuis le dernier reset). angle() dit de combien de degrés il a tourné. reset() remet les deux à zéro.',
      returns: 'Nombres entiers : mm et degrés.',
    },
    gyro: {
      title: 'use_gyro() : utiliser le gyroscope',
      summary: 'Fait que le DriveBase utilise le gyroscope du hub pour mesurer de combien tourne le robot, au lieu de compter seulement les tours de roue. Sur un vrai robot, les roues glissent un peu à chaque virage ; avec le gyroscope, le DriveBase s’en rend compte et corrige.',
      tips: [
        'Active le mode Réaliste dans l’onglet Simuler : les roues glissent comme sur un vrai robot et chaque essai est un peu différent. Compare avec et sans use_gyro(True).',
        'Laisse le hub immobile un instant avant de démarrer : le gyroscope s’étalonne tout seul pendant que le robot ne bouge pas.',
      ],
    },
    calibrate: {
      title: 'Étalonnage : wheel_diameter et axle_track',
      summary: 'Pneus usés, roues légèrement différentes et le tapis lui-même changent les mesures réelles. Étalonne ainsi : avance de 1000 mm et mesure avec un mètre ruban. Nouveau wheel_diameter = valeur actuelle × mesuré ÷ 1000. Puis tourne de 360° et regarde de combien le robot a vraiment tourné. Nouveau axle_track = valeur actuelle × 360 ÷ rotation réelle.',
      tips: [
        'Simuler › Robot a une calculatrice d’étalonnage qui fait ce calcul.',
        'Répète la mesure trois fois et utilise la moyenne : une seule mesure peut tromper.',
        'Étalonne sur le tapis de compétition dès que possible.',
      ],
      mistakes: ['Faire le calcul à l’envers : si le robot a avancé PLUS que demandé, wheel_diameter doit AUGMENTER (la roue est plus grande que ce que croit le programme).'],
    },
    'run-angle': {
      title: 'run_angle() : actionner un accessoire',
      summary: 'Fait tourner le moteur d’un nombre de degrés à partir de sa position. C’est la commande la plus courante pour lever et baisser les bras des accessoires. Dans le simulateur, les accessoires sont les deux engrenages sur le dessus du robot.',
      params: [
        ['degrés/s', 'Vitesse du moteur. Jusqu’à environ 1000.'],
        ['degrés', 'De combien tourner. 360 est un tour complet ; négatif tourne dans l’autre sens.'],
        ['True/False', 'Utilise wait=False pour que l’accessoire tourne pendant que le robot roule.'],
      ],
    },
    claw: {
      title: 'Exemple d’accessoire : pince',
      summary: 'La pince est un accessoire simple : un moteur fait tourner deux engrenages qui ouvrent et ferment les mâchoires ensemble. Dans le simulateur, ajoute la pince dans Simuler › Robot › Accessoires. Avec le moteur à 0° elle est fermée et à 90° complètement ouverte. La fermer avec une caisse entre les mâchoires attrape la caisse.',
      tips: [
        'Utilise run_target(300, 0) pour fermer : la pince revient toujours au même point, même si elle a commencé à moitié ouverte.',
        'Sur le vrai robot, fixe la pince sur une poutre solide : si elle bouge, elle rate la pièce.',
      ],
    },
    'run-target': {
      title: 'run_target() et reset_angle()',
      summary: 'run_target() amène le moteur à un angle exact, compté depuis zéro. La différence avec run_angle() : peu importe où était le moteur, il finit toujours au même endroit. reset_angle(0) définit la position actuelle comme zéro.',
      params: [
        ['degrés/s', 'Vitesse.'],
        ['degrés', 'Angle final.'],
      ],
    },
    'run-time': {
      title: 'run_time(), run() et stop()',
      summary: 'run_time() fait tourner le moteur pendant un temps en millisecondes. run() démarre le moteur et ne s’arrête pas tout seul tant que tu n’appelles pas stop(). angle() donne l’angle du moteur.',
      params: [
        ['degrés/s', 'Vitesse.'],
        ['ms', 'Durée de rotation. 1000 ms = 1 seconde.'],
      ],
    },
    color: {
      title: 'color() : quelle couleur est en dessous',
      summary: 'Lit la couleur du tapis sous le capteur et renvoie une couleur comme Color.BLACK, Color.WHITE, Color.RED, Color.BLUE, Color.GREEN ou Color.YELLOW. Dans le simulateur, le point rouge au sol montre où le capteur lit.',
      returns: 'Une couleur (Color.X). Compare avec ==.',
      mistakes: ['Comparer avec le texte "BLACK" : la bonne façon est Color.BLACK, sans guillemets.'],
    },
    reflection: {
      title: 'reflection() : combien de lumière revient',
      summary: 'Mesure combien de lumière le tapis renvoie, de 0 à 100. Le noir donne environ 7 et le blanc environ 96. Au bord de la ligne la valeur est entre les deux, et c’est ce qu’utilise un suiveur de ligne.',
      returns: 'Un nombre de 0 à 100.',
      tips: ['Commence lentement et règle le gain : trop élevé, le robot zigzague ; trop faible, il rate le virage.'],
    },
    pid: {
      title: 'Suiveur de ligne PID',
      summary: 'Le contrôle PID additionne trois corrections. P (proportionnel) tourne d’autant plus que l’erreur est grande. I (intégral) corrige une erreur qui reste toujours du même côté. D (dérivé) regarde à quelle vitesse l’erreur change et adoucit la correction avant de dépasser, ce qui supprime le zigzag. En FLL, P et D règlent presque tout.',
      tips: [
        'Règle dans cet ordre : commence avec kd = 0 et ki = 0, augmente kp jusqu’à ce que le robot suive le virage, puis augmente kd jusqu’à ce que le zigzag s’arrête.',
        'Change un seul nombre à la fois et note ce qui s’est passé.',
        'Plus de vitesse demande plus de kd.',
      ],
      mistakes: ['Oublier de mettre à jour last_error à la fin de la boucle : le dérivé est toujours faux.'],
    },
    imu: {
      title: 'hub.imu.heading() : où pointe le robot',
      summary: 'Le gyroscope du hub indique de combien de degrés le robot a tourné depuis le début. Tourner à droite augmente la valeur.',
      returns: 'Degrés.',
    },
    'hub-io': {
      title: 'Lumière, écran et son du hub',
      summary: 'Utilise la lumière du bouton, l’écran 5×5 et le haut-parleur pour montrer ce que fait le robot. Très utile pendant les tests : un bip t’indique qu’une étape est terminée.',
    },
    wait: {
      title: 'wait() : pause',
      summary: 'Met le programme en pause pendant un temps en millisecondes. Les moteurs qui tournaient continuent de tourner.',
      params: [['ms', '1000 ms = 1 seconde.']],
      tips: ['Dans les boucles, un wait(10) laisse du temps au hub et stabilise les lectures.'],
    },
    stopwatch: {
      title: 'StopWatch() : chronomètre',
      summary: 'Un chronomètre en millisecondes. Utile pour limiter la durée d’une étape. Un match FLL dure 2 min 30 s (150000 ms).',
    },
    variables: {
      title: 'Variables',
      summary: 'Une variable garde une valeur sous un nom. Ainsi tu changes un nombre à un seul endroit au lieu de le chercher dans tout le programme.',
    },
    for: {
      title: 'for : répéter un nombre de fois',
      summary: 'Répète le bloc indenté (4 espaces) n fois. range(4) compte 0, 1, 2, 3.',
      mistakes: ['Oublier les deux-points à la fin de la ligne du for, ou oublier d’indenter le bloc.'],
    },
    while: {
      title: 'while : répéter tant que c’est vrai',
      summary: 'Répète le bloc tant que la condition est vraie. Sert à « avance jusqu’à voir la ligne » ou « tourne jusqu’au bon cap ».',
    },
    if: {
      title: 'if, elif et else : décider',
      summary: 'Exécute un bloc seulement si la condition est vraie. Utilise elif pour tester une autre condition et else pour « sinon ».',
    },
    def: {
      title: 'def : créer tes propres fonctions',
      summary: 'Une fonction donne un nom à un groupe de commandes. En FLL, on a souvent une fonction par mission et on les appelle toutes à la suite. Ainsi tu peux tester chaque mission séparément et changer l’ordre sans rien réécrire.',
    },
  },

  units: {
    u1: { title: 'Découvre Pybricks', desc: 'Ce qu’est un programme et comment le robot apparaît dans le code.' },
    u2: { title: 'Avancer et tourner', desc: 'straight() et turn() : les deux commandes les plus utilisées en FLL.' },
    u3: { title: 'Courbes et vitesse', desc: 'curve() pour des trajectoires fluides et settings() pour régler le rythme.' },
    u4: { title: 'Accessoires', desc: 'Moteurs sur les ports C et E, qui actionnent les accessoires des missions.' },
    u5: { title: 'Capteur de couleur', desc: 'S’arrêter sur la ligne noire et suivre une ligne.' },
    u6: { title: 'Logique de programmation', desc: 'Répéter avec for, décider avec if et organiser les missions avec def.' },
    u7: { title: 'Mission complète', desc: 'Tout réunir dans une vraie sortie, dans le temps du match.' },
    u8: { title: 'Précision', desc: 'Gyroscope et étalonnage : le vrai robot n’est pas aussi parfait que sur le papier.' },
    u9: { title: 'Suiveur PID', desc: 'Suivre la ligne vite sans zigzaguer.' },
    u10: { title: 'Fonctions de mission', desc: 'Pousser et attraper des objets, chaque mission dans sa propre fonction.' },
    u11: { title: 'Débogage', desc: 'Lire les erreurs, enquêter avec print et réparer des programmes.' },
    u12: { title: 'Stratégie de compétition', desc: 'BASE 2, vitesse contre la montre et manches complètes.' },
  },

  lessons: {
    u1l1: {
      title: 'Premier programme',
      intro: 'Pybricks, c’est Python qui tourne dans le hub SPIKE Prime. Le robot exécute le programme de haut en bas, une ligne à la fois.\n\nPour se déplacer on utilise le DriveBase, qui dans ce cours s’appelle robot. La commande robo.straight(300) avance de 300 millimètres.',
      ex: [
        { prompt: 'Quel langage utilise-t-on pour écrire des programmes Pybricks ?', options: ['Python', 'Blocs Scratch', 'C++', 'JavaScript'], explain: 'Pybricks utilise MicroPython, une version de Python faite pour les petites cartes comme le hub.' },
        { prompt: 'Dans quelle unité straight() mesure-t-il la distance ?', options: ['Millimètres', 'Centimètres', 'Tours de roue', 'Secondes'], explain: 'Toutes les distances dans Pybricks sont en mm. 30 cm = 300 mm.' },
        { prompt: 'Complète pour que le robot avance de 300 mm.', explain: 'straight veut dire aller en ligne droite.' },
        { prompt: 'Fais avancer le robot de 300 mm.', hint: 'Utilise robo.straight(300) sous le commentaire.' },
      ],
    },
    u1l2: {
      title: 'Le robot dans le code',
      intro: 'Avant de dire au robot d’avancer, le programme doit savoir ce qui est branché sur chaque port. Sur le robot standard de BatControl :\n\nPort A : roue gauche. Port B : roue droite. Port C : accessoire gauche. Port D : capteur de couleur. Port E : accessoire droit.\n\nLe moteur gauche est monté en miroir, il reçoit donc Direction.COUNTERCLOCKWISE pour que « positif » veuille dire « en avant » sur les deux roues.',
      ex: [
        { prompt: 'Sur quels ports sont les moteurs des roues du robot standard ?', options: ['A et B', 'C et D', 'E et F', 'A et C'], explain: 'Roues sur A et B, accessoires sur C et E, capteur de couleur sur D.' },
        { prompt: 'Pourquoi le moteur gauche utilise-t-il Direction.COUNTERCLOCKWISE ?', options: ['Parce qu’il est monté en miroir par rapport au droit', 'Pour rendre le robot plus rapide', 'Parce que le hub n’accepte qu’un moteur normal', 'Pour se déplacer de côté'], explain: 'Les deux moteurs se font face. Sans inverser l’un d’eux, les roues tournent en sens opposés et le robot pivote sur place.' },
        { prompt: 'Les roues du robot BatLego font 62,4 mm de diamètre. Complète (avec un point : 62.4) :', explain: 'wheel_diameter est le diamètre de la roue en mm.' },
        { prompt: 'Mets les lignes dans le bon ordre (les imports sont déjà là).', explain: 'D’abord on crée les moteurs, puis le DriveBase qui les utilise, et seulement ensuite on donne des commandes.' },
        { prompt: 'Ce programme fait pivoter le robot sur place au lieu d’avancer de 400 mm. Exécute-le pour voir le problème et corrige la création des moteurs.', hint: 'Le moteur du port A a besoin de Direction.COUNTERCLOCKWISE.' },
      ],
    },
    u2l1: {
      title: 'Avancer tout droit',
      intro: 'straight(distance) avance en ligne droite puis s’arrête. Un nombre positif va en avant ; un nombre négatif, en arrière.\n\nSur le tapis du simulateur, le bord a une règle tous les 100 mm. Le départ est dans la BASE 1, avec le centre du robot à x = 120 mm.',
      ex: [
        { prompt: 'Que fait robo.straight(-200) ?', options: ['Recule de 200 mm', 'Avance de 200 mm', 'Tourne de 200 degrés', 'Donne une erreur, les nombres négatifs sont interdits'], explain: 'Une distance négative va en arrière.' },
        { prompt: 'Combien font 25 cm en millimètres ?', options: ['250', '25', '2500', '2,5'], explain: '1 cm = 10 mm, donc 25 cm = 250 mm.' },
        { prompt: 'Amène le robot dans la zone rouge. Son centre est à 800 mm devant le départ.', hint: 'Un seul robo.straight() avec la bonne distance suffit.' },
      ],
    },
    u2l2: {
      title: 'Tourner',
      intro: 'turn(angle) fait tourner le robot sur place. Positif tourne à droite (sens horaire), négatif à gauche.\n\nUn quart de tour fait 90 degrés et un demi-tour 180.',
      ex: [
        { prompt: 'De quel côté va le robot avec robo.turn(90) ?', options: ['À droite', 'À gauche', 'En avant', 'Ça dépend du port'], explain: 'Angle positif = sens horaire = droite.' },
        { prompt: 'Quelle commande fait faire demi-tour au robot ?', options: ['robo.turn(180)', 'robo.turn(90)', 'robo.turn(360)', 'robo.straight(-180)'], explain: 'Faire demi-tour, c’est 180 degrés. 360 est un tour complet et le robot finit tourné du même côté.' },
        { prompt: 'Complète pour faire un quart de tour à gauche.', explain: 'Gauche est négatif : -90.' },
        { prompt: 'Amène le robot dans la zone jaune. Mesures : avance de 800 mm, tourne à gauche et avance encore de 640 mm.', hint: 'straight(800), puis turn(-90), puis straight(640).' },
      ],
    },
    u2l3: {
      title: 'Le strafe existe-t-il ?',
      intro: 'Certains cherchent une commande strafe() pour se déplacer de côté. Le DriveBase de Pybricks n’en a pas : le robot a deux roues fixes qui ne poussent qu’en avant et en arrière (entraînement différentiel).\n\nPour atteindre un point sur le côté : tourne, avance et tourne à nouveau.',
      ex: [
        { prompt: 'Que se passe-t-il si le programme appelle robo.strafe(100) ?', options: ['Une erreur : le DriveBase n’a pas de strafe', 'Le robot se déplace de 100 mm sur le côté', 'Le robot tourne de 100 degrés', 'Le robot avance de 100 mm'], explain: 'Le hub affiche AttributeError, comme le simulateur. Se déplacer de côté n’existe qu’avec des roues omni ou mecanum.' },
        { prompt: 'Construis le trajet pour « aller 300 mm à gauche » et finir de nouveau tourné vers l’avant.', explain: 'Tourner, avancer et tourner à nouveau remplace le strafe.' },
        { prompt: 'Termine dans la zone jaune, mais tourné vers le côté droit du tapis, comme au départ.', hint: 'Reprends le trajet de la leçon précédente et ajoute un turn(90) à la fin.' },
      ],
    },
    u3l1: {
      title: 'Courbes',
      intro: 'curve(rayon, angle) avance le long d’un arc de cercle. Un grand rayon fait une courbe large, un petit rayon une courbe serrée. Un angle positif tourne à droite.\n\nUne courbe de rayon 300 et d’angle -90 déplace le robot de 300 mm en avant et de 300 mm à gauche.',
      ex: [
        { prompt: 'Laquelle de ces courbes est la plus serrée ?', options: ['robo.curve(100, 90)', 'robo.curve(400, 90)', 'robo.curve(800, 90)', 'Elles sont toutes pareilles'], explain: 'Plus le rayon est petit, plus la courbe est serrée.' },
        { prompt: 'Complète pour parcourir un quart de cercle à gauche avec un rayon de 300 mm.', explain: 'Gauche est négatif et un quart de cercle fait 90 degrés.' },
        { prompt: 'Atteins la zone jaune en utilisant un curve() sur le trajet, sans turn().', hint: 'Avance de 500 mm, fais curve(300, -90) et avance encore de 340 mm.' },
      ],
    },
    u3l2: {
      title: 'Vitesse',
      intro: 'robo.settings() change la vitesse de straight, turn et curve. Par exemple, robo.settings(straight_speed=400) avance à 400 mm/s.\n\nPlus vite fait gagner du temps de match ; plus lent est généralement plus précis.',
      ex: [
        { prompt: 'Dans quelle unité est straight_speed ?', options: ['mm/s', 'degrés/s', 'cm/s', 'tours par minute'], explain: 'La vitesse d’avance est en millimètres par seconde.' },
        { prompt: 'Complète pour avancer à 400 mm/s.', explain: 'straight_speed contrôle la vitesse en ligne droite.' },
        { prompt: 'Atteins la zone bleue (1400 mm devant) en moins de 6 secondes. À la vitesse par défaut, le robot n’y arrive pas.', hint: 'Mets robo.settings(straight_speed=400) avant le straight.' },
      ],
    },
    u4l1: {
      title: 'run_angle()',
      intro: 'Les accessoires sont actionnés par les moteurs des ports C et E. Dans le simulateur, ce sont les deux engrenages sur le dessus du robot.\n\nanexo_left.run_angle(500, 180) fait tourner l’accessoire gauche de 180 degrés à 500 degrés par seconde.',
      ex: [
        { prompt: 'Dans anexo_left.run_angle(500, 90), que représente 500 ?', options: ['La vitesse, en degrés par seconde', 'L’angle, en degrés', 'Le temps, en millisecondes', 'La puissance du moteur'], explain: 'La vitesse vient d’abord, puis l’angle.' },
        { prompt: 'Complète pour faire faire un tour complet à l’accessoire droit.', explain: 'Un tour complet fait 360 degrés.' },
        { prompt: 'Fais faire un demi-tour à l’accessoire gauche puis ramène-le à sa position de départ.', hint: 'Deux lignes : anexo_left.run_angle(500, 180) et anexo_left.run_angle(500, -180).' },
      ],
    },
    u4l2: {
      title: 'Accessoire et robot ensemble',
      intro: 'Par défaut, chaque commande attend d’avoir fini avant la ligne suivante. Avec wait=False, la commande démarre et le programme continue tout de suite.\n\nAinsi l’accessoire peut monter pendant que le robot roule, ce qui fait gagner de précieuses secondes de match.\n\nrun_target(vitesse, angle) amène le moteur à un angle exact, compté depuis zéro.',
      ex: [
        { prompt: 'Que fait wait=False dans anexo_right.run_angle(500, 90, wait=False) ?', options: ['Commence à tourner et le programme continue sans attendre', 'Ne fait pas tourner le moteur', 'Fait tourner le moteur sans fin', 'Attend 90 ms avant de tourner'], explain: 'Le moteur tourne en parallèle avec les lignes suivantes.' },
        { prompt: 'L’accessoire est à 30°. Où va-t-il avec run_target(500, 90) ?', options: ['À 90°', 'À 120°', 'À 60°', 'Il reste à 30°'], explain: 'run_target va à l’angle cible quelle que soit la position de départ. run_angle(500, 90) irait à 120°.' },
        { prompt: 'Va dans la zone rouge et, en même temps, fais tourner l’accessoire droit de 90°. Le tout en moins de 4,6 secondes.', hint: 'anexo_right.run_angle(500, 90, wait=False) puis robo.straight(800).' },
      ],
    },
    u5l1: {
      title: 'S’arrêter sur la ligne',
      intro: 'sensor.color() te donne la couleur du tapis sous le capteur : Color.BLACK, Color.WHITE, Color.RED...\n\nPour avancer jusqu’à une couleur : lance les roues avec robo.drive(vitesse, 0), attends dans une boucle while jusqu’à ce que la couleur apparaisse et appelle robo.stop().\n\nDans le simulateur, le point rouge au sol montre où le capteur lit.',
      ex: [
        { prompt: 'Quelle est la bonne façon de vérifier si le capteur voit du noir ?', options: ['sensor.color() == Color.BLACK', 'sensor.color() == "BLACK"', 'sensor.color = Color.BLACK', 'sensor.black()'], explain: 'Compare avec == et utilise la couleur de Pybricks (Color.BLACK), sans guillemets.' },
        { prompt: 'Complète pour avancer jusqu’à trouver la ligne noire.', explain: 'Tant que la couleur est différente (!=) du noir, continue d’avancer.' },
        { prompt: 'Avance jusqu’à la bande noire STOP et arrête-toi dessus. En chemin, le capteur traverse la zone rouge : le robot ne doit pas s’y arrêter.', hint: 'robo.drive(200, 0), puis while sensor.color() != Color.BLACK: wait(10), puis robo.stop().' },
      ],
    },
    u5l2: {
      title: 'Suiveur de ligne',
      intro: 'sensor.reflection() mesure de 0 à 100 combien de lumière revient : le noir donne environ 7 et le blanc environ 96. Au bord de la ligne, c’est entre les deux, vers 50.\n\nLe suiveur proportionnel calcule error = reflection() - 50 et fait tourner le robot proportionnellement à l’erreur : robo.drive(150, error * gain). Il roule le long du bord de la ligne en corrigeant en permanence.',
      ex: [
        { prompt: 'Le capteur est entièrement au-dessus du noir. Quelle valeur de reflection() est la plus probable ?', options: ['Environ 7', 'Environ 50', 'Environ 96', 'Exactement 100'], explain: 'Le noir renvoie peu de lumière.' },
        { prompt: 'Le robot zigzague beaucoup sur la ligne. Qu’est-ce qui aide en général ?', options: ['Baisser le gain', 'Augmenter le gain', 'Supprimer le wait(10)', 'Utiliser turn() au lieu de drive()'], explain: 'Un gain élevé exagère les corrections. Baisse-le petit à petit (et la vitesse aussi, si besoin).' },
        { prompt: 'Le robot démarre déjà avec le capteur au bord de la ligne. Complète le suiveur pour qu’il parcoure la partie droite et le virage jusqu’au bout de la ligne.', hint: 'Dans le while, remplace le commentaire par robo.drive(150, error * gain).' },
      ],
    },
    u6l1: {
      title: 'Boucles',
      intro: 'for i in range(4): répète le bloc indenté 4 fois. Le bloc, c’est tout ce qui est décalé de 4 espaces sous le for.\n\nN’oublie pas les deux-points à la fin de la ligne.',
      ex: [
        { prompt: 'Combien de fois le bloc de for i in range(3): s’exécute-t-il ?', options: ['3', '2', '4', 'Sans fin'], explain: 'range(3) compte 0, 1 et 2 : trois fois.' },
        { prompt: 'Complète pour répéter 4 fois.', explain: 'range(4) génère les nombres de 0 à 3.' },
        { prompt: 'Parcours un carré de 300 mm de côté avec for et termine là où tu as commencé. Le robot démarre hors de la base, avec de la place devant et à gauche.', hint: 'for i in range(4): et, à l’intérieur, robo.straight(300) et robo.turn(-90).' },
      ],
    },
    u6l2: {
      title: 'Fonctions',
      intro: 'def crée une fonction : un nom pour un groupe de commandes. En FLL, on a souvent une fonction par mission.\n\nLes fonctions peuvent recevoir des valeurs, comme def go_and_back(distance):. À l’intérieur, distance vaut ce qui a été passé lors de l’appel.',
      ex: [
        { prompt: 'Que se passe-t-il quand Python lit la ligne def mission(): ?', options: ['Il garde seulement la fonction ; elle s’exécute quand on appelle mission()', 'Il exécute la fonction tout de suite', 'Il donne une erreur si la fonction n’est jamais utilisée', 'Il répète la fonction sans fin'], explain: 'Définir n’est pas exécuter. Elle ne s’exécute que quand tu appelles mission().' },
        { prompt: 'Mets la fonction et l’appel dans le bon ordre.', explain: 'D’abord la définition avec son bloc indenté, puis l’appel en dehors du bloc.' },
        { prompt: 'Crée la fonction go_and_back(distance) et utilise-la pour visiter la zone rouge et revenir au départ.', hint: 'Dans la fonction : robo.straight(distance) et robo.straight(-distance). En dehors : go_and_back(800).' },
      ],
    },
    u7l1: {
      title: 'Sortir de la base',
      intro: 'Dans un match FLL, le robot sort de la base, accomplit des missions et revient. Tu as 2 minutes et 30 secondes pour toutes les sorties.\n\nCe défi ne donne pas les mesures : utilise la règle au bord du tapis. Le centre de la zone bleue est à x = 1600 mm et la zone verte à x = 2150, y = 860.',
      ex: [
        { prompt: 'Combien de temps dure un match FLL Challenge ?', options: ['2 min 30 s', '1 min', '5 min', '10 min'], explain: '150 secondes. C’est pour ça que chaque seconde gagnée compte.' },
        { prompt: 'Passe par la zone bleue, puis par la zone verte, et termine de nouveau dans la BASE 1.', hint: 'Une solution : settings plus rapides, straight(1480), turn(-49), straight(844) et revenir par le même chemin à l’envers.' },
      ],
    },
    u8l1: {
      title: 'Gyroscope',
      intro: 'Sur un vrai robot, les roues glissent un peu à chaque virage et une roue n’est jamais identique à l’autre. Une erreur de 2° à chaque virage devient une grosse erreur à la fin d’une sortie.\n\nrobo.use_gyro(True) fait que le DriveBase mesure la rotation avec le gyroscope du hub et corrige tout seul.\n\nDans ce défi, le simulateur est en mode réaliste : les roues glissent comme sur un vrai robot.',
      ex: [
        { prompt: 'Pourquoi le vrai robot rate-t-il ses virages même avec le bon programme ?', options: ['Les roues glissent et ne sont pas identiques', 'Python arrondit les nombres', 'Le hub ne tourne que par pas de 10 degrés', 'La batterie change l’angle demandé'], explain: 'Le DriveBase compte la rotation par les roues. Si elles glissent, le compte ne correspond pas à la rotation réelle.' },
        { prompt: 'Que mesure le gyroscope ?', options: ['De combien le robot a vraiment tourné', 'La couleur du tapis', 'La distance au mur', 'La vitesse des roues'], explain: 'Le gyroscope sent la rotation du hub lui-même, il ne dépend donc pas des roues.' },
        { prompt: 'Complète pour activer le gyroscope dans le DriveBase.', explain: 'use_gyro(True) l’active, use_gyro(False) le désactive.' },
        { prompt: 'Exécute le programme tel quel : après deux tours du carré, le robot ne revient pas au départ. Active le gyroscope pour qu’il revienne exactement.', hint: 'Ajoute robo.use_gyro(True) avant le for.' },
      ],
    },
    u8l2: {
      title: 'Étalonnage',
      intro: 'Le programme ne sait que ce que tu lui dis. Si la vraie roue est un peu plus grande que 62,4 mm, le robot avance plus que demandé.\n\nPour étalonner : avance de 1000 mm et mesure. Nouveau wheel_diameter = actuel × mesuré ÷ 1000.\n\nPour la rotation : tourne de 360° et regarde de combien il a tourné. Nouveau axle_track = actuel × 360 ÷ rotation réelle.',
      ex: [
        { prompt: 'Le robot devait avancer de 1000 mm mais a avancé de 980 mm. Que fais-tu de wheel_diameter ?', options: ['Le diminuer', 'L’augmenter', 'Le garder et changer axle_track', 'Inverser le signe'], explain: 'Il a moins avancé, donc la vraie roue est plus petite que ce que croit le programme : diminue-le (56 × 980 ÷ 1000 = 54,9).' },
        { prompt: 'J’ai demandé turn(360) et le robot n’a tourné que de 350°. Que fais-tu de axle_track ?', options: ['L’augmenter', 'Le diminuer', 'Le garder', 'Le mettre à zéro'], explain: 'Pour tourner plus, le DriveBase doit croire que les roues sont plus écartées : 140 × 360 ÷ 350 = 144.' },
        { prompt: 'Avec wheel_diameter=62.4, le robot a avancé de 1025 mm alors que j’ai demandé 1000 mm. Écris la nouvelle valeur (62,4 × 1025 ÷ 1000, arrondi) :', explain: '62,4 × 1,025 = 63,96, environ 64 mm.' },
      ],
    },
    u9l1: {
      title: 'P et D',
      intro: 'Pour suivre la ligne vite, le gain proportionnel (kp) doit être élevé, mais alors le robot dépasse et zigzague.\n\nLe terme D regarde de combien l’erreur a changé depuis la dernière lecture : derivative = error - last_error. Si l’erreur diminue vite, D adoucit la correction avant de dépasser.\n\nturn_rate = kp × error + kd × derivative',
      ex: [
        { prompt: 'À quoi sert le terme D (dérivé) ?', options: ['Adoucir la correction avant de dépasser', 'Avancer plus vite', 'Mesurer la couleur de la ligne', 'Arrêter le robot à la fin'], explain: 'D réagit à la vitesse à laquelle l’erreur change et amortit le zigzag.' },
        { prompt: 'Quel est l’ordre recommandé pour régler un PID en FLL ?', options: ['D’abord kp, puis kd, ki en dernier (si besoin)', 'D’abord ki, puis kp', 'Tous en même temps', 'D’abord kd, puis kp'], explain: 'kp fait suivre la ligne, kd supprime le zigzag et ki est rarement utile dans un suiveur de ligne.' },
        { prompt: 'À 400 mm/s, avec kp = 6 et sans D, le robot zigzague et sort de la ligne. Règle les gains pour qu’il atteigne le bout de la ligne en 4 secondes.', hint: 'Garde kp = 6 et mets kd = 8.' },
      ],
    },
    u10l1: {
      title: 'Pousser avec une fonction',
      intro: 'Beaucoup de missions FLL consistent à pousser un objet jusqu’à un endroit. Le pare-chocs du robot pousse ce qui est devant lui.\n\nMets chaque mission dans une fonction au nom clair, comme push_crate(). Ainsi tu peux tester une mission seule et construire le match en appelant les fonctions à la suite.',
      ex: [
        { prompt: 'Pourquoi mettre chaque mission dans sa propre fonction ?', options: ['Pour tester chacune seule et changer l’ordre facilement', 'Parce que Pybricks l’exige', 'Pour rendre le robot plus rapide', 'Pour économiser la batterie'], explain: 'Les fonctions gardent le programme organisé : tu changes une mission sans casser les autres.' },
        { prompt: 'Complète push_crate() pour pousser la caisse orange jusqu’à la zone bleue et revenir dans la BASE 1.', hint: 'Le centre de la caisse doit finir entre x = 1500 et 1700. Essaie robo.straight(1300) puis robo.straight(-1300).' },
      ],
    },
    u10l2: {
      title: 'Attraper avec la pince',
      intro: 'Dans ce défi, le robot a la pince sur le côté gauche (port C). Avec le moteur à 90° elle est ouverte et à 0° fermée.\n\nPour attraper : ouvre, arrive avec la caisse entre les mâchoires et ferme. Pour lâcher, ouvre à nouveau.\n\nLe centre de la pince est à 214 mm devant et 46 mm à gauche du centre du robot.',
      ex: [
        { prompt: 'Que se passe-t-il si la pince se ferme sans rien entre les mâchoires ?', options: ['Elle se ferme à vide et le robot continue sans la caisse', 'Le programme donne une erreur', 'Le robot s’arrête', 'La caisse vient vers la pince'], explain: 'La pince n’attrape que ce qui est entre les mâchoires quand elle se ferme.' },
        { prompt: 'Utilise open_claw() et close_claw() pour attraper la caisse bleue et l’amener dans la BASE 1.', hint: 'open_claw(), robo.straight(466), close_claw(), robo.straight(-466).' },
      ],
    },
    u1l3: {
      title: 'Erreurs et commentaires',
      intro: 'Les lignes qui commencent par # sont des commentaires : des notes pour l’équipe que le robot ignore.\n\nQuand quelque chose ne va pas, le programme s’arrête et affiche une erreur avec le numéro de ligne. Une commande mal écrite, comme robo.straigth(), donne AttributeError : la DriveBase n’a aucune commande de ce nom.',
      ex: [
        { prompt: 'Que fait le robot d’une ligne qui commence par # ?', options: ['Il l’ignore : c’est un commentaire', 'Il l’exécute deux fois', 'Il arrête le programme avec une erreur', 'Il bipe'], explain: 'Les commentaires expliquent le code aux personnes. Le robot les saute.' },
        { prompt: 'robo.straigth(300) donne une erreur. Pourquoi ?', options: ['Le nom de la commande est mal écrit', 'Le nombre est trop grand', 'Les parenthèses sont interdites', 'Le robot a d’abord besoin d’un commentaire'], explain: 'Le bon nom est straight. Python ne connaît que le nom exact.' },
        { prompt: 'Ce programme s’arrête avec une erreur. Lance-le, lis le message et corrige-le pour que le robot avance de 500 mm.', hint: 'Regarde comment straight est écrit.' },
      ],
    },
    u1l4: {
      title: 'Lumière et son',
      intro: 'Le hub a une lumière sur le bouton central et un haut-parleur. hub.light.on(Color.GREEN) allume la lumière en vert et hub.speaker.beep() fait un bip court.\n\nC’est utile pendant les tests : un bip indique qu’une étape est finie, et la lumière peut montrer sur quelle mission est le robot.',
      ex: [
        { prompt: 'Quelle commande fait biper le hub ?', options: ['hub.speaker.beep()', 'hub.light.beep()', 'robo.beep()', 'hub.display.beep()'], explain: 'Le son vient du haut-parleur : hub.speaker.' },
        { prompt: 'Complète pour allumer la lumière en vert.', explain: 'Les couleurs utilisent Color et le nom en majuscules.' },
        { prompt: 'Allume la lumière en vert, avance de 300 mm et bipe à la fin.', hint: 'hub.light.on(Color.GREEN), robo.straight(300), hub.speaker.beep().' },
      ],
    },
    u2l4: {
      title: 'Marche arrière',
      intro: 'Beaucoup de missions demandent seulement d’aller et revenir par le même chemin. Au lieu de faire demi-tour, recule avec une distance négative : robo.straight(-800) annule robo.straight(800).\n\nC’est plus rapide et le robot revient tourné du même côté.',
      ex: [
        { prompt: 'Le robot a fait robo.straight(800). Quelle commande le ramène au départ sans tourner ?', options: ['robo.straight(-800)', 'robo.turn(180)', 'robo.straight(800)', 'robo.turn(-800)'], explain: 'Une distance négative recule sur le même chemin.' },
        { prompt: 'Visite la zone rouge et reviens dans la BASE 1 sans tourner.', hint: 'robo.straight(800) et robo.straight(-800).' },
      ],
    },
    u2l5: {
      title: 'Demi-tour',
      intro: 'Faire demi-tour, c’est tourner d’un demi-tour : robo.turn(180) ou robo.turn(-180). Les deux finissent tournés dans le sens opposé ; ils tournent seulement dans des sens différents.\n\nAprès le demi-tour, les distances positives ramènent le robot d’où il vient.',
      ex: [
        { prompt: 'Complète pour que le robot fasse demi-tour.', explain: '180 ou -180 : un demi-tour d’un côté ou de l’autre.' },
        { prompt: 'Après robo.turn(180), que fait robo.straight(300) ?', options: ['Il avance de 300 mm vers l’endroit d’où il vient', 'Il recule de 300 mm', 'Il tourne encore de 300 degrés', 'Il avance de côté'], explain: 'Le robot regarde maintenant de l’autre côté, donc avancer le ramène vers le départ.' },
        { prompt: 'Va jusqu’à la zone rouge, fais demi-tour et reviens dans la BASE 1 en marche avant.', hint: 'straight(800), turn(180), straight(800).' },
      ],
    },
    u2l6: {
      title: 'Diagonales',
      intro: 'Le chemin le plus court est une ligne droite. Pour aller droit à un point, tourne vers lui et avance de la longueur de la diagonale.\n\nSi le point est à a mm devant et b mm sur le côté, la distance est √(a² + b²) (Pythagore). L’angle est atan(b ÷ a). L’outil Règle de Simuler fait ce calcul pour toi.',
      ex: [
        { prompt: 'Un point est à 600 mm devant et 800 mm à gauche. À quelle distance est-il en ligne droite ?', options: ['1000 mm', '1400 mm', '200 mm', '700 mm'], explain: '√(600² + 800²) = √1 000 000 = 1000 mm.' },
        { prompt: 'Pourquoi la diagonale est-elle souvent meilleure que « tout droit, tourner, tout droit » ?', options: ['Elle est plus courte et a moins de mouvements', 'Elle est toujours plus précise', 'Pybricks l’exige', 'Elle use moins la batterie du hub'], explain: 'Moins de mouvements et un chemin plus court font gagner du temps. Chaque virage ajoute aussi une petite erreur.' },
        { prompt: 'Atteins la zone jaune avec exactement un turn() et un straight(). Le centre de la zone est à 800 mm devant et 640 mm à gauche.', hint: 'Angle : atan(640 ÷ 800) = 38,7° à gauche. Distance : √(800² + 640²) = 1024 mm.' },
      ],
    },
    u3l3: {
      title: 'Virage en S',
      intro: 'Deux virages dans des sens opposés forment un S. robo.curve(300, -90) puis robo.curve(300, 90) amènent le robot 600 mm en avant et 600 mm à gauche, et il finit tourné du même côté qu’au départ.\n\nC’est une façon douce de changer de voie sans s’arrêter.',
      ex: [
        { prompt: 'Après robo.curve(300, -90) puis robo.curve(300, 90), de quel côté regarde le robot ?', options: ['Du même côté qu’au départ', 'À gauche', 'À droite', 'Vers l’arrière'], explain: 'Un virage tourne de 90° à gauche, l’autre de 90° à droite : ils s’annulent.' },
        { prompt: 'Atteins la zone jaune avec deux virages et finis tourné vers la droite, comme au départ.', hint: 'curve(300, -90), curve(300, 90) puis straight(200).' },
      ],
    },
    u3l4: {
      title: 'Vitesse de rotation',
      intro: 'settings() change aussi la vitesse de rotation avec turn_rate, en degrés par seconde. robo.settings(turn_rate=400) fait tourner turn() plus vite.\n\nLes rotations rapides font gagner du temps, mais sur le vrai robot elles glissent davantage. Teste sur le tapis.',
      ex: [
        { prompt: 'Quel réglage change la vitesse de turn() ?', options: ['turn_rate', 'straight_speed', 'axle_track', 'wheel_diameter'], explain: 'turn_rate est la vitesse de rotation en degrés par seconde.' },
        { prompt: 'Complète pour rendre les rotations plus rapides.', explain: 'turn_rate=400 veut dire 400 degrés par seconde.' },
        { prompt: 'Fais un tour complet (360°) en moins de 2 secondes. À la vitesse par défaut, il faut 2,5 s.', hint: 'Mets robo.settings(turn_rate=400) avant la rotation.' },
      ],
    },
    u4l3: {
      title: 'Angle exact',
      intro: 'run_angle() ajoute à partir de là où se trouve le moteur, donc les petites erreurs s’accumulent. run_target(vitesse, angle) va à un angle exact compté depuis zéro, peu importe où le moteur a commencé.\n\nreset_angle(0) définit la position actuelle comme nouveau zéro.',
      ex: [
        { prompt: 'Que fait anexo_left.reset_angle(0) ?', options: ['Elle définit la position actuelle comme zéro', 'Elle ramène le moteur à zéro', 'Elle arrête le moteur', 'Elle tourne de 0 degré'], explain: 'Rien ne bouge : seule la référence change.' },
        { prompt: 'L’accessoire est déjà allé à 105°. Fais-le finir exactement à 120°.', hint: 'anexo_left.run_target(500, 120).' },
      ],
    },
    u4l4: {
      title: 'Deux accessoires à la fois',
      intro: 'Si la première commande attend d’avoir fini, le second accessoire ne démarre qu’après. Avec wait=False sur la première, les deux bougent ensemble et tu gagnes du temps.',
      ex: [
        { prompt: 'Comment faire bouger deux accessoires en même temps ?', options: ['wait=False sur la première commande', 'wait=False sur les deux commandes', 'Les écrire sur la même ligne', 'C’est impossible avec Pybricks'], explain: 'La première démarre et le programme passe à la seconde. La seconde, sans wait=False, attend d’avoir fini.' },
        { prompt: 'Fais tourner les deux accessoires de 180° en moins de 0,8 seconde.', hint: 'anexo_left.run_angle(500, 180, wait=False) et anexo_right.run_angle(500, 180).' },
      ],
    },
    u5l3: {
      title: 'S’arrêter sur une couleur',
      intro: 'La même boucle qui s’arrête sur le noir marche pour n’importe quelle couleur : il suffit de changer la couleur dans la condition.\n\nLe capteur est devant le centre du robot et un peu à gauche, donc le robot s’arrête quand le capteur (et non le centre) atteint la couleur.',
      ex: [
        { prompt: 'Complète pour t’arrêter sur la zone rouge.', explain: 'Color.RED, c’est le rouge.' },
        { prompt: 'Le robot s’est arrêté avec le capteur sur le rouge, mais son centre est encore avant la zone. Pourquoi ?', options: ['Le capteur est devant le centre du robot', 'Le capteur est cassé', 'Le rouge n’est pas détecté', 'Le robot a reculé'], explain: 'Le capteur lit le sol devant le robot. Penses-y quand tu prévois où t’arrêter.' },
        { prompt: 'Avance jusqu’à ce que le capteur trouve la zone rouge et arrête-toi là.', hint: 'robo.drive(200, 0), while sensor.color() != Color.RED: wait(10), robo.stop().' },
      ],
    },
    u5l4: {
      title: 'S’arrêter avec la réflexion',
      intro: 'reflection() donne un nombre, donc tu peux choisir une limite. Le noir est vers 7 : tant que sensor.reflection() > 20, le robot n’est pas encore sur le noir.\n\nC’est utile quand les couleurs du tapis officiel ne sont pas exactement celles que color() connaît.',
      ex: [
        { prompt: 'Pour s’arrêter sur le noir avec reflection(), quelle condition fait continuer le robot ?', options: ['while sensor.reflection() > 20:', 'while sensor.reflection() < 20:', 'while sensor.reflection() == 100:', 'while sensor.color() > 20:'], explain: 'Tant que la valeur est haute (sol clair), on continue. Sur le noir, elle passe sous 20.' },
        { prompt: 'Arrête-toi sur la bande noire STOP avec sensor.reflection().', hint: 'robo.drive(200, 0), while sensor.reflection() > 20: wait(10), robo.stop().' },
      ],
    },
    u5l5: {
      title: 'Une couleur, puis une autre',
      intro: 'On peut attendre une chose puis une autre : une boucle while après l’autre. Le robot continue d’avancer tout le temps, car drive() ne s’arrête qu’avec stop().\n\nAinsi, le robot utilise une marque du tapis comme point de contrôle avant l’arrêt final.',
      ex: [
        { prompt: 'Remets le programme dans l’ordre : avancer, attendre le rouge, puis attendre le noir et s’arrêter.', explain: 'Les deux boucles s’exécutent l’une après l’autre pendant que le robot continue d’avancer.' },
        { prompt: 'Avance, attends d’abord la zone rouge, puis la bande noire STOP, et arrête-toi dessus.', hint: 'Deux boucles : while sensor.color() != Color.RED et while sensor.color() != Color.BLACK.' },
      ],
    },
    u6l3: {
      title: 'Répéter tant que',
      intro: 'while répète tant qu’une condition est vraie. Avec drive(), il arrête le robot au bon moment : robo.drive(200, 0), puis while robo.distance() < 600: wait(10), puis robo.stop().\n\ndistance() est mis à jour pendant que le robot avance.',
      ex: [
        { prompt: 'Quand while robo.distance() < 600: arrête-t-il de répéter ?', options: ['Quand le robot a avancé de 600 mm ou plus', 'Jamais', 'Après 600 répétitions', 'Tout de suite'], explain: 'La condition devient fausse à 600 mm et le programme continue.' },
        { prompt: 'Utilise drive() et une boucle while pour arrêter le robot après 600 mm.', hint: 'while robo.distance() < 600: et, dedans, wait(10).' },
      ],
    },
    u6l4: {
      title: 'Décider avec if',
      intro: 'if exécute un bloc seulement quand la condition est vraie ; else s’exécute quand elle est fausse. Le robot peut décider quoi faire selon le capteur.\n\nExemple : if sensor.color() == Color.RED: robo.turn(-90) else: robo.turn(90).',
      ex: [
        { prompt: 'Qu’affiche ce programme ?', options: ['A', 'B', 'A et B', 'Rien'], explain: '5 > 3 est vrai, donc seul le bloc du if s’exécute.' },
        { prompt: 'Après avoir avancé de 700 mm, si le capteur voit du rouge, tourne à gauche ; sinon, tourne à droite. Puis avance de 400 mm.', hint: 'if sensor.color() == Color.RED: robo.turn(-90), else: robo.turn(90).' },
      ],
    },
    u6l5: {
      title: 'Listes',
      intro: 'Une liste garde plusieurs valeurs dans l’ordre : moves = [800, 640]. moves[0] est la première, moves[1] la deuxième.\n\nfor parcourt chaque élément de la liste. Une liste de paires (distance, angle) décrit tout un trajet en une ligne.',
      ex: [
        { prompt: 'Avec moves = [800, 640], que vaut moves[1] ?', options: ['640', '800', '1440', 'Une erreur'], explain: 'On compte à partir de 0 : moves[0] vaut 800 et moves[1] vaut 640.' },
        { prompt: 'Complète pour parcourir chaque distance de la liste.', explain: 'for donne à distance chaque valeur de la liste, une à la fois.' },
        { prompt: 'Complète la boucle pour suivre la liste de mouvements et atteindre la zone jaune.', hint: 'Dans le for : robo.straight(distance) et robo.turn(angle).' },
      ],
    },
    u6l6: {
      title: 'Fonctions qui renvoient',
      intro: 'Une fonction peut calculer une valeur et la renvoyer avec return. def mm(cm): return cm * 10 transforme des centimètres en millimètres.\n\nL’appel mm(80) est remplacé par le résultat, 800.',
      ex: [
        { prompt: 'Complète pour que la fonction renvoie la valeur en millimètres.', explain: 'return renvoie le résultat à celui qui a appelé la fonction.' },
        { prompt: 'Qu’affiche ce programme ?', options: ['9', '8', '10', 'double(4) + 1'], explain: 'double(4) renvoie 8, plus 1 donne 9.' },
        { prompt: 'Utilise mm() pour avancer de 80 cm et atteindre la zone rouge.', hint: 'robo.straight(mm(80)).' },
      ],
    },
    u6l7: {
      title: 'Sortir d’une boucle avec break',
      intro: 'while True: répète à l’infini. break sort de la boucle tout de suite, donc tu décides dans la boucle quand t’arrêter.\n\nC’est utile quand il y a plusieurs raisons de s’arrêter.',
      ex: [
        { prompt: 'Qu’affiche ce programme ?', options: ['0, 1 et 2', '0, 1, 2 et 3', 'Seulement 3', 'Rien'], explain: 'Quand i vaut 3, break sort de la boucle avant le print.' },
        { prompt: 'Complète la boucle pour que le robot s’arrête sur la bande noire STOP avec break.', hint: 'if sensor.color() == Color.BLACK: break.' },
      ],
    },
    u7l2: {
      title: 'De base en base',
      intro: 'Le tapis d’entraînement a deux bases, une de chaque côté, comme les zones de lancement de la table FLL. La BASE 2 est à droite, à l’autre bout du tapis.\n\nTraverser tout le tapis prend du temps : utilise settings() pour aller plus vite.',
      ex: [
        { prompt: 'Combien de bases a le tapis d’entraînement de BatControl ?', options: ['Deux, une de chaque côté', 'Une', 'Quatre', 'Aucune'], explain: 'BASE 1 à gauche et BASE 2 à droite.' },
        { prompt: 'Traverse le tapis de la BASE 1 à la BASE 2 en moins de 6 secondes.', hint: 'robo.settings(straight_speed=400) et robo.straight(2000).' },
      ],
    },
    u7l3: {
      title: 'Accessoire en route',
      intro: 'Dans une vraie manche, l’accessoire bouge pendant que le robot roule. Lance l’accessoire avec wait=False puis avance : les deux se font en même temps.\n\nC’est comme ça que les bonnes équipes gagnent des secondes à chaque mission.',
      ex: [
        { prompt: 'Pourquoi bouger l’accessoire pendant que le robot roule ?', options: ['Pour gagner du temps de match', 'Pour rendre le robot plus précis', 'Parce que le hub l’exige', 'Pour économiser la batterie'], explain: 'Deux actions en même temps durent autant que la plus longue, pas la somme.' },
        { prompt: 'Va jusqu’à la zone rouge en ouvrant l’accessoire droit de 90° en route, referme-le à 0° au retour et finis dans la BASE 1, le tout en moins de 6 secondes.', hint: 'settings(straight_speed=400), anexo_right.run_angle(500, 90, wait=False), straight(800), anexo_right.run_angle(500, -90, wait=False), straight(-800).' },
      ],
    },
    u8l3: {
      title: 'Tourner avec le gyroscope',
      intro: 'hub.imu.heading() indique de combien de degrés le robot a tourné. Tourner à droite augmente la valeur.\n\nTu peux tourner avec drive(0, vitesse) et t’arrêter quand le heading atteint l’angle voulu. Le gyroscope mesure la vraie rotation, même si les roues glissent.',
      ex: [
        { prompt: 'Après avoir tourné de 90° à droite, qu’affiche hub.imu.heading() ?', options: ['90', '-90', '0', '180'], explain: 'Tourner à droite augmente le heading.' },
        { prompt: 'Complète la condition avec le gyroscope.', explain: 'heading() est relu à chaque répétition.' },
        { prompt: 'Le robot tourne déjà avec drive(0, 120). Arrête-le quand le heading atteint 90.', hint: 'while hub.imu.heading() < 90: wait(10).' },
      ],
    },
    u9l2: {
      title: 'Suivre pendant un temps',
      intro: 'StopWatch() est un chronomètre en millisecondes. watch.time() indique le temps écoulé depuis sa création.\n\nUn suiveur peut s’arrêter au temps plutôt qu’à la distance : while watch.time() < 3000 suit pendant 3 secondes.',
      ex: [
        { prompt: 'Que renvoie watch.time() ?', options: ['Les millisecondes depuis la création ou la remise à zéro du StopWatch', 'Des secondes', 'L’heure de la journée', 'Des minutes'], explain: 'Pybricks mesure toujours le temps en ms. 3000 ms = 3 s.' },
        { prompt: 'Change la boucle pour que le robot suive la ligne pendant 3 secondes puis s’arrête.', hint: 'while watch.time() < 3000:' },
      ],
    },
    u10l3: {
      title: 'Deux missions d’affilée',
      intro: 'Chaque mission dans sa propre fonction, appelées dans l’ordre. Chacune commence et finit dans la base, donc la suivante part toujours d’un endroit connu.\n\nPour atteindre la zone jaune sans toucher la caisse, monte d’abord puis va à droite.',
      ex: [
        { prompt: 'Pourquoi chaque fonction de mission doit-elle finir dans la base ?', options: ['Pour que la mission suivante parte d’un endroit connu', 'Parce que Python l’exige', 'Pour rendre le robot plus rapide', 'Pour redémarrer le hub'], explain: 'Si une mission finit à un endroit différent à chaque fois, toutes les mesures suivantes sont fausses.' },
        { prompt: 'Complète les deux fonctions : pousse la caisse jusqu’à la zone rouge, puis visite la zone jaune, et finis dans la BASE 1.', hint: 'push_crate : straight(620) et straight(-620). visit_yellow : turn(-90), straight(640), turn(90), straight(800) et le même chemin en sens inverse.' },
      ],
    },
    u10l4: {
      title: 'Livrer avec la pince',
      intro: 'Attraper, ce n’est que la moitié : le robot doit transporter la pièce et la lâcher au bon endroit. Ouvre, attrape, avance avec la caisse tenue, ouvre de nouveau et reviens.\n\nLe centre de la pince est à 214 mm devant le centre du robot.',
      ex: [
        { prompt: 'Le robot tient la caisse. Qu’est-ce qui la lui fait lâcher ?', options: ['Ouvrir la pince', 'Reculer', 'Tourner le robot', 'Arrêter le robot'], explain: 'La caisse reste dans la pince jusqu’à ce qu’elle s’ouvre.' },
        { prompt: 'Attrape la caisse bleue, dépose-la dans la zone rouge et reviens dans la BASE 1.', hint: 'open_claw(), straight(266), close_claw(), straight(340), open_claw(), straight(-606).' },
      ],
    },
    u11l1: {
      title: 'Erreurs de syntaxe',
      intro: 'SyntaxError veut dire que Python n’a pas compris comment une ligne est écrite : deux-points manquants, mauvaise indentation ou parenthèse non fermée.\n\nLe message indique la ligne. Regarde cette ligne et celle d’avant.',
      ex: [
        { prompt: 'SyntaxError sur une ligne avec for. Quelle est la cause la plus probable ?', options: ['Il manque les deux-points à la fin', 'Le nombre est faux', 'Le moteur est débranché', 'Le robot est trop lent'], explain: 'for, while, if et def finissent toujours par deux-points.' },
        { prompt: 'Ce programme devrait faire un carré de 300 mm et revenir au départ, mais il a deux erreurs. Corrige-les.', hint: 'Mets les deux-points après range(4) et indente robo.turn(-90) pour qu’il soit dans le for.' },
      ],
    },
    u11l2: {
      title: 'Enquêter avec print',
      intro: 'print() affiche des valeurs dans le panneau Sortie. C’est le moyen le plus simple de savoir ce que « pense » le robot : la distance parcourue, ce que lit le capteur, le heading.\n\nSur le vrai hub, print s’affiche dans le terminal de Pybricks Code.',
      ex: [
        { prompt: 'Qu’affiche ce programme ?', options: ['250', '0', '25', 'Une erreur'], explain: 'distance() compte les mm parcourus depuis le début.' },
        { prompt: 'Le robot avance jusqu’à la bande noire. Affiche la distance parcourue.', hint: 'print(robo.distance()) après robo.stop().' },
      ],
    },
    u11l3: {
      title: 'Répare la mission',
      intro: 'La plupart des bugs sont petits : un nombre en cm au lieu de mm, un signe inversé, une ligne dans le mauvais ordre.\n\nLance le programme, regarde où va le robot et compare avec ce que tu voulais.',
      ex: [
        { prompt: 'Le robot tourne à droite alors qu’il devrait tourner à gauche. Que changes-tu ?', options: ['Le signe de l’angle', 'La vitesse', 'Le port', 'Le diamètre de la roue'], explain: 'Positif tourne à droite, négatif à gauche.' },
        { prompt: 'Ce programme devrait atteindre la zone jaune mais il a deux bugs. Trouve-les et corrige-les.', hint: 'straight(80) devrait faire 800 mm, et la rotation devrait aller à gauche : turn(-90).' },
      ],
    },
    u11l4: {
      title: 'Mauvais port',
      intro: 'OSError à la création d’un appareil veut souvent dire que le programme utilise un port où rien n’est branché, ou où se trouve un autre appareil.\n\nSur le robot par défaut, le capteur de couleur est sur le port D.',
      ex: [
        { prompt: 'Le programme s’arrête avec OSError sur la ligne sensor = ColorSensor(Port.F). Que vérifies-tu ?', options: ['Sur quel port le capteur est vraiment branché', 'La taille de la roue', 'La vitesse du robot', 'Les commentaires'], explain: 'L’erreur dit que rien n’a été trouvé sur ce port.' },
        { prompt: 'Ce programme devrait s’arrêter sur la zone rouge mais s’arrête avec une erreur. Corrige-le.', hint: 'Le capteur de couleur est sur Port.D.' },
      ],
    },
    u12l1: {
      title: 'Partir de la BASE 2',
      intro: 'Sur la table FLL, certaines missions sont plus près de l’autre zone de lancement. Dans BatControl, la BASE 2 est à droite et le robot démarre tourné vers la gauche.\n\nLes commandes sont les mêmes : avancer, c’est aller là où le robot regarde.',
      ex: [
        { prompt: 'Le robot démarre dans la BASE 2 tourné vers la gauche. Quelle commande l’amène vers la zone bleue ?', options: ['robo.straight(640)', 'robo.straight(-640)', 'robo.turn(180)', 'robo.curve(640, 90)'], explain: 'Le robot regarde vers la gauche, vers la zone bleue, donc avancer est positif.' },
        { prompt: 'Depuis la BASE 2, visite la zone bleue et reviens dans la BASE 2.', hint: 'Le centre de la zone bleue est à 642 mm devant.' },
      ],
    },
    u12l2: {
      title: 'Contre la montre',
      intro: 'Dans un match, chaque seconde compte. Augmente straight_speed et straight_acceleration, mais attention : sur le vrai robot, trop vite peut faire glisser et perdre en précision.\n\nLa vitesse de roue maximale des moteurs SPIKE est d’environ 540 mm/s avec des roues de 62,4 mm.',
      ex: [
        { prompt: 'Quel changement aide le plus sur un long trajet en ligne droite ?', options: ['Augmenter straight_speed', 'Augmenter turn_rate', 'Diminuer axle_track', 'Ajouter wait(100)'], explain: 'En ligne droite, c’est la vitesse d’avance qui compte.' },
        { prompt: 'Visite la zone rouge et la zone bleue et reviens dans la BASE 1 en moins de 8 secondes.', hint: 'robo.settings(straight_speed=480, straight_acceleration=1500), straight(1480) et straight(-1480).' },
      ],
    },
    u12l3: {
      title: 'Manche complète',
      intro: 'Une manche complète enchaîne plusieurs missions et finit dans une base. Prépare d’abord : où est chaque objet, quel chemin évite les collisions et où finir.\n\nFinir dans la BASE 2 peut éviter le trajet de retour.',
      ex: [
        { prompt: 'Quelle est la meilleure première étape pour préparer une manche ?', options: ['Dessiner le trajet sur le tapis et le mesurer', 'Écrire le code au hasard et tester', 'Mettre la vitesse au maximum', 'N’utiliser que des virages'], explain: 'Avec le trajet mesuré (l’outil Règle aide), le code est juste plus vite.' },
        { prompt: 'Pousse la caisse jusqu’à la zone bleue, visite la zone verte et finis dans la BASE 2.', hint: 'straight(1300), turn(-41), straight(971), turn(126), straight(562).' },
      ],
    },
    u12l4: {
      title: 'Défi final',
      intro: 'Rassemble ce que tu as appris : suis la ligne jusqu’au bout et montre que tu es arrivé avec la lumière et un bip.\n\nBravo : après cette leçon, tu connais les principales commandes Pybricks utilisées en FLL.',
      ex: [
        { prompt: 'Quelle est la meilleure façon de savoir si une mission marche vraiment sur le vrai robot ?', options: ['La lancer plusieurs fois et voir si elle marche toujours', 'La lancer une fois', 'Regarder seulement le code', 'Tester seulement dans le simulateur'], explain: 'Une bonne mission marche à chaque fois, pas une seule.' },
        { prompt: 'Suis la ligne jusqu’au bout, puis allume la lumière en vert et bipe.', hint: 'while robo.distance() < 1300: suiveur avec kp ; puis robo.stop(), hub.light.on(Color.GREEN), hub.speaker.beep().' },
      ],
    },
  },

  comments: {
    '3) Mission commands': '3) Commandes de la mission',
    '40 cm forward': '40 cm en avant',
    '20 cm backward': '20 cm en arrière',
    right: 'droite',
    'left, back to where it was': 'gauche, revient où il était',
    '"Go 300 mm to the left" with differential drive:': '« Aller 300 mm à gauche » avec un entraînement différentiel :',
    'wide curve to the left': 'courbe large vers la gauche',
    faster: 'plus vite',
    'very slow': 'très lentement',
    'drives for 2 seconds': 'roule pendant 2 secondes',
    'Calibration test: drive 1000 mm and measure with a tape measure': 'Test d’étalonnage : avance de 1000 mm et mesure avec un mètre ruban',
    'Then spin a full turn and check where the robot points': 'Puis fais un tour complet et regarde où pointe le robot',
    'half a turn': 'demi-tour',
    back: 'retour',
    'drives while the arm turns': 'roule pendant que l’accessoire tourne',
    open: 'ouvre',
    'close (grab the piece)': 'ferme (attrape la pièce)',
    'goes to 120': 'va à 120',
    'already there, does not move': 'déjà là, ne bouge pas',
    'back to zero': 'retour à zéro',
    'Proportional line follower': 'Suiveur de ligne proportionnel',
    'PID line follower': 'Suiveur de ligne PID',
    '300 mm square': 'Carré de 300 mm',
    'Write your commands here': 'Écris tes commandes ici',
    'complete: drive at 150 mm/s turning error * gain': 'à compléter : roule à 150 mm/s en tournant de error * gain',
    'complete here': 'à compléter ici',
    'Two laps of a 300 mm square, back to the start': 'Deux tours d’un carré de 300 mm, retour au départ',
    'complete: push the crate into the blue zone and come back': 'à compléter : pousse la caisse dans la zone bleue et reviens',
    'complete: open, drive to the crate, close and bring it to the base': 'à compléter : ouvre, va jusqu’à la caisse, ferme et ramène-la à la base',
    'Leave the base, go to the red zone and come back': 'Sors de la base, va à la zone rouge et reviens',
    'Claws: 0 degrees = closed, 90 degrees = open': 'Pinces : 0° = fermée, 90° = ouverte',
    'Close both claws on the crates': 'Ferme les deux pinces sur les caisses',
    'Drive 500 mm forward': 'Avance de 500 mm',
    'Go to the yellow zone': 'Va jusqu’à la zone jaune',
    'turn around': 'demi-tour',
    'complete: drive 80 cm using mm()': 'à compléter : avance de 80 cm avec mm()',
    'complete: drive the distance, then turn the angle': 'à compléter : avance de la distance, puis tourne de l’angle',
    'complete: end exactly at 120 degrees': 'à compléter : finis exactement à 120 degrés',
    'complete: first wait for RED, then for BLACK': 'à compléter : attends d’abord le ROUGE, puis le NOIR',
    'complete: follow the line for 3 seconds (3000 ms)': 'à compléter : suis la ligne pendant 3 secondes (3000 ms)',
    'complete: follow the line to the end, then turn the light green and beep': 'à compléter : suis la ligne jusqu’au bout, puis allume en vert et bipe',
    'complete: go to the yellow zone and come back': 'à compléter : va jusqu’à la zone jaune et reviens',
    'complete: grab the crate, drop it in the red zone and return to the base': 'à compléter : attrape la caisse, dépose-la dans la zone rouge et reviens à la base',
    'complete: if the sensor sees RED turn left, otherwise turn right': 'à compléter : si le capteur voit du ROUGE tourne à gauche, sinon à droite',
    'complete: keep driving until 600 mm': 'à compléter : continue d’avancer jusqu’à 600 mm',
    'complete: leave the loop when the sensor sees BLACK': 'à compléter : sors de la boucle quand le capteur voit du NOIR',
    'complete: print how far the robot drove': 'à compléter : affiche la distance parcourue par le robot',
    'complete: push the crate into the red zone and come back': 'à compléter : pousse la caisse jusqu’à la zone rouge et reviens',
    'complete: wait until the heading reaches 90': 'à compléter : attends que le heading atteigne 90',
  },
};
