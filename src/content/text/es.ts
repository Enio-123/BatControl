// Contenido didáctico en español.
import type { ContentText } from './types';

export const TEXT: ContentText = {
  groups: {
    start: 'Primeros pasos',
    drive: 'DriveBase (desplazamiento)',
    arms: 'Motores de accesorios',
    sensor: 'Sensor de color',
    hub: 'Hub',
    time: 'Tiempo',
    python: 'Python para robots',
  },

  topics: {
    structure: {
      title: 'Estructura de un programa',
      summary: 'Todo programa Pybricks tiene tres partes: importar lo que necesitas, crear los dispositivos (hub, motores, sensores y el DriveBase) y escribir los comandos de la misión uno debajo del otro. El robot los ejecuta de arriba hacia abajo.',
      tips: [
        'Crea cada dispositivo una sola vez, al inicio del programa.',
        'Las líneas que empiezan con # son comentarios: el robot las ignora, pero ayudan al equipo a entender el código.',
        'Los nombres left_motor, robot y sensor los elegimos nosotros. Puedes usar otros, siempre que uses el mismo nombre en todo el programa.',
      ],
      mistakes: ['Olvidar un import provoca NameError: Python no sabe qué es DriveBase o Port.'],
    },
    motor: {
      title: 'Motor(): crear un motor',
      summary: 'Crea el objeto que controla un motor conectado a un puerto del hub (A a F). En el robot estándar de BatControl, las ruedas están en los puertos A y B y los accesorios en los puertos C y D.',
      params: [
        ['Port.A … Port.F', 'Puerto del hub donde está conectado el cable del motor.'],
        ['Direction', 'Qué sentido cuenta como positivo. El motor de la rueda izquierda está montado en espejo, por eso usamos COUNTERCLOCKWISE en él.'],
        ['lista', 'Engranajes entre el motor y la salida, por ejemplo [12, 36]. Opcional.'],
      ],
      mistakes: [
        'Olvidar Direction.COUNTERCLOCKWISE en el motor izquierdo hace que el robot gire sobre sí mismo en lugar de avanzar recto. Pruébalo en el simulador.',
        'Usar un puerto sin motor da OSError: revisa el cable y el puerto.',
      ],
    },
    drivebase: {
      title: 'DriveBase(): unir las ruedas',
      summary: 'El DriveBase controla juntos los dos motores de las ruedas, así el robot avanza en milímetros y gira en grados. Necesita saber el tamaño de la rueda y la distancia entre las ruedas.',
      params: [
        ['Motor', 'Motor de la rueda izquierda.'],
        ['Motor', 'Motor de la rueda derecha.'],
        ['mm', 'Diámetro de la rueda. La rueda del SPIKE Prime mide 56 mm.'],
        ['mm', 'Distancia entre los puntos donde las dos ruedas tocan el suelo.'],
      ],
      tips: [
        'Si el robot avanza un poco más o menos de lo pedido, ajusta wheel_diameter.',
        'Si el robot gira un poco más o menos, ajusta axle_track. Mira el tema Calibración.',
      ],
    },
    straight: {
      title: 'straight(): avanzar recto',
      summary: 'Avanza en línea recta la distancia indicada y se detiene. Un número positivo va hacia adelante y uno negativo hacia atrás.',
      params: [
        ['mm', 'Cuánto avanzar. 100 mm = 10 cm.'],
        ['Stop', 'Qué hacer al final: Stop.HOLD (mantener, por defecto), Stop.BRAKE o Stop.COAST.'],
        ['True/False', 'Si es True, el programa espera a que termine antes de la siguiente línea.'],
      ],
      tips: ['Mide en el tapete: la regla del borde del tapete del simulador tiene una marca cada 100 mm. En la pestaña Simular, la herramienta Regla mide por ti.'],
      mistakes: ['Pensar en centímetros: straight(40) solo avanza 4 cm.'],
    },
    turn: {
      title: 'turn(): girar en el sitio',
      summary: 'Gira el robot sobre sí mismo, una rueda hacia adelante y la otra hacia atrás. Un ángulo positivo gira a la derecha (sentido horario) y uno negativo a la izquierda.',
      params: [
        ['grados', 'Cuánto girar. 90 es un cuarto de vuelta, 180 es media vuelta.'],
        ['Stop', 'Cómo detenerse al final.'],
        ['True/False', 'Esperar a que termine antes de continuar.'],
      ],
      mistakes: ['Confundir el signo: turn(90) va a la derecha, no a la izquierda.'],
    },
    strafe: {
      title: '¿Y el strafe (moverse de lado)?',
      summary: 'El DriveBase de Pybricks no tiene strafe. Un robot típico de FLL tiene dos ruedas motrices fijas (tracción diferencial) que solo empujan hacia adelante y hacia atrás. Moverse de lado solo existe en robots con ruedas omni o mecanum. Para llegar a un punto lateral, gira, avanza y vuelve a girar.',
      tips: ['Si escribes robot.strafe(...), el simulador muestra el mismo error que mostraría el hub: AttributeError.'],
    },
    curve: {
      title: 'curve(): avanzar en arco',
      summary: 'Avanza siguiendo un arco, como un coche tomando una curva. El radio dice si la curva es abierta o cerrada y el ángulo dice qué parte del círculo recorrer. Un ángulo positivo curva a la derecha.',
      params: [
        ['mm', 'Radio del círculo. Positivo avanza, negativo retrocede.'],
        ['grados', 'Qué parte del círculo recorrer. 90 es un cuarto de círculo.'],
      ],
      tips: ['Las curvas son más rápidas que parar, girar y avanzar, pero es más difícil que salgan exactas. Úsalas cuando la misión necesite una trayectoria suave.'],
    },
    settings: {
      title: 'settings(): velocidad y aceleración',
      summary: 'Cambia la velocidad y la aceleración que usan straight, turn y curve. Sin argumentos devuelve los valores actuales. Más despacio suele ser más preciso.',
      params: [
        ['mm/s', 'Velocidad de avance.'],
        ['mm/s²', 'Qué tan rápido acelera y frena.'],
        ['grados/s', 'Velocidad de giro.'],
        ['grados/s²', 'Aceleración de giro.'],
      ],
      tips: ['En el simulador, los valores por defecto se estiman a partir del motor SPIKE. En el hub real pueden variar un poco.'],
    },
    drive: {
      title: 'drive() y stop(): seguir avanzando',
      summary: 'drive() pone en marcha las ruedas y el programa pasa enseguida a la siguiente línea, con el robot todavía en movimiento. El robot solo se detiene cuando llamas a robot.stop(). Es la base de "avanza hasta ver la línea negra" y de los seguidores de línea.',
      params: [
        ['mm/s', 'Velocidad hacia adelante (negativa = hacia atrás).'],
        ['grados/s', 'Cuánto gira mientras avanza. 0 = recto, positivo = derecha.'],
      ],
      mistakes: ['Llamar a drive() y olvidar esperar (wait o un bucle): el programa termina enseguida y el robot ni se mueve.'],
    },
    distance: {
      title: 'distance(), angle() y reset()',
      summary: 'distance() dice cuántos mm ha recorrido el robot desde el inicio (o desde el último reset). angle() dice cuántos grados ha girado. reset() pone los dos a cero.',
      returns: 'Números enteros: mm y grados.',
    },
    gyro: {
      title: 'use_gyro(): usar el giroscopio',
      summary: 'Hace que el DriveBase use el giroscopio del hub para medir cuánto gira el robot, en lugar de contar solo las vueltas de las ruedas. En un robot real las ruedas patinan un poco en cada giro; con el giroscopio el DriveBase lo nota y corrige.',
      tips: [
        'Activa el modo Realista en la pestaña Simular: las ruedas patinan como en un robot real y cada ejecución sale un poco distinta. Compara con y sin use_gyro(True).',
        'Deja el hub quieto un momento antes de empezar: el giroscopio se calibra solo mientras el robot no se mueve.',
      ],
    },
    calibrate: {
      title: 'Calibración: wheel_diameter y axle_track',
      summary: 'Neumáticos gastados, ruedas un poco distintas y el propio tapete cambian las medidas reales. Calibra así: avanza 1000 mm y mide con una cinta métrica. Nuevo wheel_diameter = valor actual × medido ÷ 1000. Después gira 360° y mira cuánto giró realmente el robot. Nuevo axle_track = valor actual × 360 ÷ giro real.',
      tips: [
        'Simular › Robot tiene una calculadora de calibración que hace esta cuenta.',
        'Repite la medición tres veces y usa la media: una sola medición puede engañar.',
        'Calibra en el tapete de la competición siempre que puedas.',
      ],
      mistakes: ['Hacer la cuenta al revés: si el robot avanzó MÁS de lo pedido, wheel_diameter debe AUMENTAR (la rueda es más grande de lo que cree el programa).'],
    },
    'run-angle': {
      title: 'run_angle(): mover un accesorio',
      summary: 'Gira el motor un número de grados desde donde está. Es el comando más común para subir y bajar los brazos de los accesorios. En el simulador, los accesorios son los dos engranajes encima del robot.',
      params: [
        ['grados/s', 'Velocidad del motor. Hasta unos 1000.'],
        ['grados', 'Cuánto girar. 360 es una vuelta completa; negativo gira al otro lado.'],
        ['True/False', 'Usa wait=False para que el accesorio gire mientras el robot avanza.'],
      ],
    },
    claw: {
      title: 'Ejemplo de accesorio: garra',
      summary: 'La garra de pinza es un accesorio sencillo: un motor gira dos engranajes que abren y cierran las mandíbulas a la vez. En el simulador, añade la garra en Simular › Robot › Accesorios. Con el motor en 0° está cerrada y en 90° totalmente abierta. Al cerrarla con una caja entre las mandíbulas, agarra la caja.',
      tips: [
        'Usa run_target(300, 0) para cerrar: la garra siempre vuelve al mismo punto, aunque haya empezado medio abierta.',
        'En el robot real, monta la garra sobre una viga firme: si se tambalea, la pinza no atrapa la pieza.',
      ],
    },
    'run-target': {
      title: 'run_target() y reset_angle()',
      summary: 'run_target() lleva el motor a un ángulo exacto, contado desde cero. Se diferencia de run_angle() en que, esté donde esté el motor, siempre termina en el mismo lugar. reset_angle(0) define la posición actual como cero.',
      params: [
        ['grados/s', 'Velocidad.'],
        ['grados', 'Ángulo final.'],
      ],
    },
    'run-time': {
      title: 'run_time(), run() y stop()',
      summary: 'run_time() gira el motor durante un tiempo en milisegundos. run() arranca el motor y no se detiene solo hasta que llames a stop(). angle() te dice el ángulo del motor.',
      params: [
        ['grados/s', 'Velocidad.'],
        ['ms', 'Cuánto tiempo girar. 1000 ms = 1 segundo.'],
      ],
    },
    color: {
      title: 'color(): qué color hay debajo',
      summary: 'Lee el color del tapete debajo del sensor y devuelve un color como Color.BLACK, Color.WHITE, Color.RED, Color.BLUE, Color.GREEN o Color.YELLOW. En el simulador, el punto rojo en el suelo muestra dónde lee el sensor.',
      returns: 'Un color (Color.X). Compara con ==.',
      mistakes: ['Comparar con el texto "BLACK": lo correcto es Color.BLACK, sin comillas.'],
    },
    reflection: {
      title: 'reflection(): cuánta luz vuelve',
      summary: 'Mide cuánta luz refleja el tapete, de 0 a 100. El negro da alrededor de 7 y el blanco alrededor de 96. En el borde de la línea el valor queda en medio, y eso es lo que usa un seguidor de línea.',
      returns: 'Un número de 0 a 100.',
      tips: ['Empieza despacio y ajusta la ganancia: demasiado alta hace que el robot zigzaguee, demasiado baja hace que se salga en la curva.'],
    },
    pid: {
      title: 'Seguidor de línea PID',
      summary: 'El control PID suma tres correcciones. P (proporcional) gira más cuanto mayor es el error. I (integral) corrige un error que siempre se queda del mismo lado. D (derivativa) mira qué tan rápido cambia el error y suaviza la corrección antes de pasarse, lo que elimina el zigzag. En FLL, P y D resuelven casi todo.',
      tips: [
        'Ajusta en este orden: empieza con kd = 0 y ki = 0, sube kp hasta que el robot siga la curva y luego sube kd hasta que pare el zigzag.',
        'Cambia un número a la vez y anota lo que pasó.',
        'Más velocidad necesita más kd.',
      ],
      mistakes: ['Olvidar actualizar last_error al final del bucle: la derivativa sale siempre mal.'],
    },
    imu: {
      title: 'hub.imu.heading(): hacia dónde apunta el robot',
      summary: 'El giroscopio del hub dice cuántos grados ha girado el robot desde el inicio. Girar a la derecha aumenta el valor.',
      returns: 'Grados.',
    },
    'hub-io': {
      title: 'Luz, pantalla y sonido del hub',
      summary: 'Usa la luz del botón, la pantalla de 5×5 y el altavoz para mostrar lo que hace el robot. Ayuda mucho en las pruebas: un pitido te avisa de que una etapa terminó.',
    },
    wait: {
      title: 'wait(): pausa',
      summary: 'Pausa el programa durante un tiempo en milisegundos. Los motores que estaban girando siguen girando.',
      params: [['ms', '1000 ms = 1 segundo.']],
      tips: ['Dentro de los bucles, un wait(10) da tiempo al hub y mantiene estables las lecturas.'],
    },
    stopwatch: {
      title: 'StopWatch(): cronómetro',
      summary: 'Un cronómetro en milisegundos. Sirve para limitar cuánto puede durar una etapa. Una partida de FLL dura 2 min 30 s (150000 ms).',
    },
    variables: {
      title: 'Variables',
      summary: 'Una variable guarda un valor con un nombre. Así cambias un número en un solo lugar en vez de buscarlo por todo el programa.',
    },
    for: {
      title: 'for: repetir un número de veces',
      summary: 'Repite el bloque con sangría (4 espacios) n veces. range(4) cuenta 0, 1, 2, 3.',
      mistakes: ['Olvidar los dos puntos al final de la línea del for, u olvidar la sangría del bloque.'],
    },
    while: {
      title: 'while: repetir mientras sea verdad',
      summary: 'Repite el bloque mientras la condición sea verdadera. Se usa para "avanza hasta ver la línea" o "gira hasta que el rumbo sea correcto".',
    },
    if: {
      title: 'if, elif y else: decidir',
      summary: 'Ejecuta un bloque solo si la condición es verdadera. Usa elif para probar otra condición y else para "si no".',
    },
    def: {
      title: 'def: crear tus propias funciones',
      summary: 'Una función da nombre a un grupo de comandos. En FLL es común tener una función por misión y llamarlas todas en secuencia. Así puedes probar cada misión por separado y cambiar el orden sin reescribir nada.',
    },
  },

  units: {
    u1: { title: 'Conoce Pybricks', desc: 'Qué es un programa y cómo aparece el robot en el código.' },
    u2: { title: 'Avanzar y girar', desc: 'straight() y turn(): los dos comandos más usados en FLL.' },
    u3: { title: 'Curvas y velocidad', desc: 'curve() para trayectorias suaves y settings() para marcar el ritmo.' },
    u4: { title: 'Accesorios', desc: 'Motores en los puertos C y D, que mueven los accesorios de las misiones.' },
    u5: { title: 'Sensor de color', desc: 'Parar en la línea negra y seguir una línea.' },
    u6: { title: 'Lógica de programación', desc: 'Repetir con for, decidir con if y organizar misiones con def.' },
    u7: { title: 'Misión completa', desc: 'Junta todo en una salida real, dentro del tiempo de la partida.' },
    u8: { title: 'Precisión', desc: 'Giroscopio y calibración: el robot real no es tan perfecto como en el papel.' },
    u9: { title: 'Seguidor PID', desc: 'Sigue la línea rápido sin zigzaguear.' },
    u10: { title: 'Funciones de misión', desc: 'Empujar y agarrar objetos, cada misión en su propia función.' },
    u11: { title: 'Depuración', desc: 'Leer errores, investigar con print y arreglar programas.' },
    u12: { title: 'Estrategia de competición', desc: 'BASE 2, velocidad contra el reloj y rondas completas.' },
  },

  lessons: {
    u1l1: {
      title: 'Primer programa',
      intro: 'Pybricks es Python funcionando dentro del hub SPIKE Prime. El robot ejecuta el programa de arriba hacia abajo, una línea a la vez.\n\nPara desplazarnos usamos el DriveBase, que en este curso se llama robot. El comando robot.straight(300) avanza 300 milímetros hacia adelante.',
      ex: [
        { prompt: '¿Qué lenguaje usamos para escribir programas Pybricks?', options: ['Python', 'Bloques de Scratch', 'C++', 'JavaScript'], explain: 'Pybricks usa MicroPython, una versión de Python hecha para placas pequeñas como el hub.' },
        { prompt: '¿En qué unidad mide straight() la distancia?', options: ['Milímetros', 'Centímetros', 'Vueltas de rueda', 'Segundos'], explain: 'Todas las distancias en Pybricks están en mm. 30 cm = 300 mm.' },
        { prompt: 'Completa para que el robot avance 300 mm hacia adelante.', explain: 'straight significa ir en línea recta.' },
        { prompt: 'Haz que el robot avance 300 mm hacia adelante.', hint: 'Usa robot.straight(300) debajo del comentario.' },
      ],
    },
    u1l2: {
      title: 'El robot en el código',
      intro: 'Antes de mandar al robot que avance, el programa necesita saber qué hay conectado en cada puerto. En el robot estándar de BatControl:\n\nPuerto A: rueda izquierda. Puerto B: rueda derecha. Puertos C y D: motores de accesorios. Puerto E: sensor de color.\n\nEl motor izquierdo está montado en espejo, así que recibe Direction.COUNTERCLOCKWISE para que "positivo" signifique "adelante" en las dos ruedas.',
      ex: [
        { prompt: '¿En qué puertos están los motores de las ruedas del robot estándar?', options: ['A y B', 'C y D', 'E y F', 'A y C'], explain: 'Ruedas en A y B, accesorios en C y D, sensor de color en E.' },
        { prompt: '¿Por qué el motor izquierdo usa Direction.COUNTERCLOCKWISE?', options: ['Porque está montado en espejo respecto al derecho', 'Para que el robot sea más rápido', 'Porque el hub solo acepta un motor normal', 'Para moverse de lado'], explain: 'Los dos motores están enfrentados. Sin invertir uno de ellos, las ruedas giran en sentidos opuestos y el robot gira sobre sí mismo.' },
        { prompt: 'La rueda del SPIKE Prime tiene 56 mm de diámetro. Completa:', explain: 'wheel_diameter es el diámetro de la rueda en mm.' },
        { prompt: 'Pon las líneas en el orden correcto (los imports ya están).', explain: 'Primero creamos los motores, luego el DriveBase que los usa, y solo después damos comandos.' },
        { prompt: 'Este programa hace que el robot gire sobre sí mismo en lugar de avanzar 400 mm. Ejecútalo para ver el problema y corrige cómo se crean los motores.', hint: 'El motor del puerto A necesita Direction.COUNTERCLOCKWISE.' },
      ],
    },
    u2l1: {
      title: 'Avanzar recto',
      intro: 'straight(distancia) avanza en línea recta y se detiene. Un número positivo va hacia adelante; uno negativo, hacia atrás.\n\nEn el tapete del simulador, el borde tiene una regla cada 100 mm. La salida está dentro de la BASE 1, con el centro del robot en x = 120 mm.',
      ex: [
        { prompt: '¿Qué hace robot.straight(-200)?', options: ['Retrocede 200 mm', 'Avanza 200 mm', 'Gira 200 grados', 'Da error, no se permiten números negativos'], explain: 'Una distancia negativa va hacia atrás.' },
        { prompt: '¿Cuánto son 25 cm en milímetros?', options: ['250', '25', '2500', '2.5'], explain: '1 cm = 10 mm, así que 25 cm = 250 mm.' },
        { prompt: 'Lleva el robot a la zona roja. Su centro está 800 mm delante de la salida.', hint: 'Basta un solo robot.straight() con la distancia correcta.' },
      ],
    },
    u2l2: {
      title: 'Girar',
      intro: 'turn(ángulo) gira el robot sobre sí mismo. Positivo gira a la derecha (sentido horario), negativo a la izquierda.\n\nUn cuarto de vuelta son 90 grados y media vuelta son 180.',
      ex: [
        { prompt: '¿Hacia dónde va el robot con robot.turn(90)?', options: ['Derecha', 'Izquierda', 'Adelante', 'Depende del puerto'], explain: 'Ángulo positivo = sentido horario = derecha.' },
        { prompt: '¿Qué comando hace que el robot dé media vuelta?', options: ['robot.turn(180)', 'robot.turn(90)', 'robot.turn(360)', 'robot.straight(-180)'], explain: 'Dar media vuelta son 180 grados. 360 es una vuelta completa y el robot termina mirando al mismo lado.' },
        { prompt: 'Completa para dar un cuarto de vuelta a la izquierda.', explain: 'Izquierda es negativo: -90.' },
        { prompt: 'Lleva el robot a la zona amarilla. Medidas: avanza 800 mm, gira a la izquierda y avanza otros 640 mm.', hint: 'straight(800), luego turn(-90), luego straight(640).' },
      ],
    },
    u2l3: {
      title: '¿Existe el strafe?',
      intro: 'Hay quien busca un comando strafe() para moverse de lado. El DriveBase de Pybricks no lo tiene: el robot tiene dos ruedas fijas que solo empujan hacia adelante y hacia atrás (tracción diferencial).\n\nPara llegar a un punto lateral: gira, avanza y vuelve a girar.',
      ex: [
        { prompt: '¿Qué pasa si el programa llama a robot.strafe(100)?', options: ['Un error: el DriveBase no tiene strafe', 'El robot se mueve 100 mm de lado', 'El robot gira 100 grados', 'El robot avanza 100 mm'], explain: 'El hub muestra AttributeError, igual que el simulador. Moverse de lado solo existe con ruedas omni o mecanum.' },
        { prompt: 'Arma el camino para "ir 300 mm a la izquierda" y terminar mirando otra vez hacia adelante.', explain: 'Girar, avanzar y volver a girar sustituye al strafe.' },
        { prompt: 'Termina dentro de la zona amarilla, pero mirando hacia el lado derecho del tapete, como en la salida.', hint: 'Usa el camino de la lección anterior y añade un turn(90) al final.' },
      ],
    },
    u3l1: {
      title: 'Curvas',
      intro: 'curve(radio, ángulo) avanza siguiendo un arco de círculo. Un radio grande hace una curva abierta; un radio pequeño, una curva cerrada. Un ángulo positivo curva a la derecha.\n\nUna curva de radio 300 y ángulo -90 lleva el robot 300 mm hacia adelante y 300 mm a la izquierda.',
      ex: [
        { prompt: '¿Cuál de estas curvas es la más cerrada?', options: ['robot.curve(100, 90)', 'robot.curve(400, 90)', 'robot.curve(800, 90)', 'Todas son iguales'], explain: 'Cuanto menor es el radio, más cerrada es la curva.' },
        { prompt: 'Completa para recorrer un cuarto de círculo a la izquierda con radio de 300 mm.', explain: 'Izquierda es negativo y un cuarto de círculo son 90 grados.' },
        { prompt: 'Llega a la zona amarilla usando un curve() en el camino, sin turn().', hint: 'Avanza 500 mm, haz curve(300, -90) y avanza otros 340 mm.' },
      ],
    },
    u3l2: {
      title: 'Velocidad',
      intro: 'robot.settings() cambia la velocidad de straight, turn y curve. Por ejemplo, robot.settings(straight_speed=400) avanza a 400 mm/s.\n\nMás rápido ahorra tiempo de partida; más despacio suele ser más preciso.',
      ex: [
        { prompt: '¿En qué unidad está straight_speed?', options: ['mm/s', 'grados/s', 'cm/s', 'revoluciones por minuto'], explain: 'La velocidad de avance está en milímetros por segundo.' },
        { prompt: 'Completa para avanzar a 400 mm/s.', explain: 'straight_speed controla la velocidad en línea recta.' },
        { prompt: 'Llega a la zona azul (1400 mm adelante) en menos de 6 segundos. A la velocidad por defecto el robot no llega a tiempo.', hint: 'Pon robot.settings(straight_speed=400) antes del straight.' },
      ],
    },
    u4l1: {
      title: 'run_angle()',
      intro: 'Los accesorios se mueven con los motores de los puertos C y D. En el simulador son los dos engranajes encima del robot.\n\nleft_arm.run_angle(500, 180) gira el accesorio izquierdo 180 grados a 500 grados por segundo.',
      ex: [
        { prompt: 'En left_arm.run_angle(500, 90), ¿qué es el 500?', options: ['La velocidad, en grados por segundo', 'El ángulo, en grados', 'El tiempo, en milisegundos', 'La potencia del motor'], explain: 'Primero va la velocidad y después el ángulo.' },
        { prompt: 'Completa para girar el accesorio derecho una vuelta completa.', explain: 'Una vuelta completa son 360 grados.' },
        { prompt: 'Gira el accesorio izquierdo media vuelta y después devuélvelo a la posición inicial.', hint: 'Dos líneas: left_arm.run_angle(500, 180) y left_arm.run_angle(500, -180).' },
      ],
    },
    u4l2: {
      title: 'Accesorio y robot a la vez',
      intro: 'Por defecto, cada comando espera a terminar antes de la siguiente línea. Con wait=False el comando empieza y el programa sigue enseguida.\n\nAsí el accesorio puede subir mientras el robot avanza, ahorrando segundos valiosos de la partida.\n\nrun_target(velocidad, ángulo) lleva el motor a un ángulo exacto, contado desde cero.',
      ex: [
        { prompt: '¿Qué hace wait=False en right_arm.run_angle(500, 90, wait=False)?', options: ['Empieza a girar y el programa sigue sin esperar', 'No gira el motor', 'Gira el motor para siempre', 'Espera 90 ms antes de girar'], explain: 'El motor gira en paralelo con las líneas siguientes.' },
        { prompt: 'El accesorio está en 30°. ¿A dónde va con run_target(500, 90)?', options: ['A 90°', 'A 120°', 'A 60°', 'Se queda en 30°'], explain: 'run_target va al ángulo objetivo esté donde esté. run_angle(500, 90) iría a 120°.' },
        { prompt: 'Ve a la zona roja y, al mismo tiempo, gira el accesorio derecho 90°. Todo en menos de 4,6 segundos.', hint: 'right_arm.run_angle(500, 90, wait=False) y después robot.straight(800).' },
      ],
    },
    u5l1: {
      title: 'Parar en la línea',
      intro: 'sensor.color() te dice el color del tapete debajo del sensor: Color.BLACK, Color.WHITE, Color.RED...\n\nPara avanzar hasta que aparezca un color: arranca las ruedas con robot.drive(velocidad, 0), espera en un bucle while hasta que aparezca el color y llama a robot.stop().\n\nEn el simulador, el punto rojo en el suelo muestra dónde lee el sensor.',
      ex: [
        { prompt: '¿Cuál es la forma correcta de comprobar si el sensor ve negro?', options: ['sensor.color() == Color.BLACK', 'sensor.color() == "BLACK"', 'sensor.color = Color.BLACK', 'sensor.black()'], explain: 'Compara con == y usa el color de Pybricks (Color.BLACK), sin comillas.' },
        { prompt: 'Completa para avanzar hasta encontrar la línea negra.', explain: 'Mientras el color sea distinto (!=) de negro, sigue avanzando.' },
        { prompt: 'Avanza hasta la franja negra de PARADA y detente sobre ella. En el camino el sensor cruza la zona roja: el robot no debe parar ahí.', hint: 'robot.drive(200, 0), luego while sensor.color() != Color.BLACK: wait(10), luego robot.stop().' },
      ],
    },
    u5l2: {
      title: 'Seguidor de línea',
      intro: 'sensor.reflection() mide de 0 a 100 cuánta luz vuelve: el negro da alrededor de 7 y el blanco alrededor de 96. En el borde de la línea queda en medio, cerca de 50.\n\nEl seguidor proporcional calcula error = reflection() - 50 y gira el robot en proporción al error: robot.drive(150, error * gain). Avanza por el borde de la línea, corrigiendo todo el tiempo.',
      ex: [
        { prompt: 'El sensor está totalmente sobre el negro. ¿Qué valor de reflection() es más probable?', options: ['Alrededor de 7', 'Alrededor de 50', 'Alrededor de 96', 'Exactamente 100'], explain: 'El negro refleja poca luz.' },
        { prompt: 'El robot zigzaguea mucho sobre la línea. ¿Qué suele ayudar?', options: ['Bajar la ganancia', 'Subir la ganancia', 'Quitar el wait(10)', 'Usar turn() en lugar de drive()'], explain: 'Una ganancia alta exagera las correcciones. Bájala poco a poco (y la velocidad también, si hace falta).' },
        { prompt: 'El robot ya empieza con el sensor en el borde de la línea. Completa el seguidor de línea para que recorra la recta y la curva hasta el final de la línea.', hint: 'Dentro del while, cambia el comentario por robot.drive(150, error * gain).' },
      ],
    },
    u6l1: {
      title: 'Repeticiones',
      intro: 'for i in range(4): repite el bloque con sangría 4 veces. El bloque es todo lo que está 4 espacios más adentro debajo del for.\n\nNo olvides los dos puntos al final de la línea.',
      ex: [
        { prompt: '¿Cuántas veces se ejecuta el bloque de for i in range(3):?', options: ['3', '2', '4', 'Para siempre'], explain: 'range(3) cuenta 0, 1 y 2: tres veces.' },
        { prompt: 'Completa para repetir 4 veces.', explain: 'range(4) genera los números del 0 al 3.' },
        { prompt: 'Recorre un cuadrado de 300 mm de lado usando for y termina donde empezaste. El robot empieza fuera de la base, con espacio libre delante y a la izquierda.', hint: 'for i in range(4): y, dentro, robot.straight(300) y robot.turn(-90).' },
      ],
    },
    u6l2: {
      title: 'Funciones',
      intro: 'def crea una función: un nombre para un grupo de comandos. En FLL es común tener una función por misión.\n\nLas funciones pueden recibir valores, como def go_and_back(distance):. Dentro de ella, distance vale lo que se pasó en la llamada.',
      ex: [
        { prompt: '¿Qué pasa cuando Python lee la línea def mission():?', options: ['Solo guarda la función; se ejecuta cuando se llama con mission()', 'Ejecuta la función enseguida', 'Da error si la función nunca se usa', 'Repite la función para siempre'], explain: 'Definir no es ejecutar. Solo se ejecuta cuando llamas a mission().' },
        { prompt: 'Pon la función y la llamada en el orden correcto.', explain: 'Primero la definición con su bloque con sangría, después la llamada fuera del bloque.' },
        { prompt: 'Crea la función go_and_back(distance) y úsala para visitar la zona roja y volver a la salida.', hint: 'Dentro de la función: robot.straight(distance) y robot.straight(-distance). Fuera: go_and_back(800).' },
      ],
    },
    u7l1: {
      title: 'Saliendo de la base',
      intro: 'En una partida de FLL el robot sale de la base, cumple misiones y vuelve. Tienes 2 minutos y 30 segundos para todas las salidas.\n\nEste desafío no da pistas de medidas: usa la regla del borde del tapete. El centro de la zona azul está en x = 1600 mm y la zona verde en x = 2150, y = 860.',
      ex: [
        { prompt: '¿Cuánto dura una partida de FLL Challenge?', options: ['2 min 30 s', '1 min', '5 min', '10 min'], explain: '150 segundos. Por eso cuenta cada segundo ahorrado.' },
        { prompt: 'Pasa por la zona azul, luego por la zona verde, y termina de nuevo dentro de la BASE 1.', hint: 'Una solución: settings más rápidos, straight(1480), turn(-49), straight(844) y volver por el mismo camino al revés.' },
      ],
    },
    u8l1: {
      title: 'Giroscopio',
      intro: 'En un robot real las ruedas patinan un poco en cada giro y una rueda nunca es idéntica a la otra. Un error de 2° en cada giro se convierte en un error grande al final de una salida.\n\nrobot.use_gyro(True) hace que el DriveBase mida el giro con el giroscopio del hub y corrija solo.\n\nEn este desafío el simulador está en modo realista: las ruedas patinan como en un robot real.',
      ex: [
        { prompt: '¿Por qué el robot real falla los giros incluso con el programa correcto?', options: ['Las ruedas patinan y no son idénticas', 'Python redondea los números', 'El hub solo gira de 10 en 10 grados', 'La batería cambia el ángulo pedido'], explain: 'El DriveBase cuenta el giro por las ruedas. Si patinan, la cuenta no coincide con el giro real.' },
        { prompt: '¿Qué mide el giroscopio?', options: ['Cuánto giró realmente el robot', 'El color del tapete', 'La distancia a la pared', 'La velocidad de las ruedas'], explain: 'El giroscopio siente la rotación del propio hub, así que no depende de las ruedas.' },
        { prompt: 'Completa para activar el giroscopio en el DriveBase.', explain: 'use_gyro(True) lo activa, use_gyro(False) lo desactiva.' },
        { prompt: 'Ejecuta el programa tal como está: después de dos vueltas al cuadrado el robot no vuelve a la salida. Activa el giroscopio para que vuelva exacto.', hint: 'Añade robot.use_gyro(True) antes del for.' },
      ],
    },
    u8l2: {
      title: 'Calibración',
      intro: 'El programa solo sabe lo que tú le dices. Si la rueda real es un poco mayor que 56 mm, el robot avanza más de lo pedido.\n\nPara calibrar: avanza 1000 mm y mide. Nuevo wheel_diameter = actual × medido ÷ 1000.\n\nPara el giro: gira 360° y mira cuánto giró. Nuevo axle_track = actual × 360 ÷ giro real.',
      ex: [
        { prompt: 'El robot debía avanzar 1000 mm pero avanzó 980 mm. ¿Qué haces con wheel_diameter?', options: ['Disminuirlo', 'Aumentarlo', 'Mantenerlo y cambiar axle_track', 'Cambiarle el signo'], explain: 'Avanzó menos, así que la rueda real es más pequeña de lo que cree el programa: disminúyelo (56 × 980 ÷ 1000 = 54,9).' },
        { prompt: 'Pedí turn(360) y el robot solo giró 350°. ¿Qué haces con axle_track?', options: ['Aumentarlo', 'Disminuirlo', 'Mantenerlo', 'Ponerlo a cero'], explain: 'Para girar más, el DriveBase debe creer que las ruedas están más separadas: 140 × 360 ÷ 350 = 144.' },
        { prompt: 'Con wheel_diameter=56 el robot avanzó 1025 mm cuando pedí 1000 mm. Escribe el nuevo valor (56 × 1025 ÷ 1000):', explain: '56 × 1,025 = 57,4 mm.' },
      ],
    },
    u9l1: {
      title: 'P y D',
      intro: 'Para seguir la línea rápido, la ganancia proporcional (kp) tiene que ser alta, pero entonces el robot se pasa y zigzaguea.\n\nEl término D mira cuánto cambió el error desde la última lectura: derivative = error - last_error. Si el error está bajando rápido, D suaviza la corrección antes de pasarse.\n\nturn_rate = kp × error + kd × derivative',
      ex: [
        { prompt: '¿Para qué sirve el término D (derivativa)?', options: ['Suavizar la corrección antes de pasarse', 'Avanzar más rápido', 'Medir el color de la línea', 'Detener el robot al final'], explain: 'D reacciona a la rapidez con la que cambia el error y amortigua el zigzag.' },
        { prompt: '¿Cuál es el orden recomendado para ajustar un PID en FLL?', options: ['Primero kp, luego kd, ki al final (si hace falta)', 'Primero ki, luego kp', 'Todos a la vez', 'Primero kd, luego kp'], explain: 'kp hace que siga la línea, kd quita el zigzag y ki casi nunca hace falta en un seguidor de línea.' },
        { prompt: 'A 400 mm/s, con kp = 6 y sin D, el robot zigzaguea y se sale de la línea. Ajusta las ganancias para que llegue al final de la línea en 4 segundos.', hint: 'Mantén kp = 6 y pon kd = 8.' },
      ],
    },
    u10l1: {
      title: 'Empujar con una función',
      intro: 'Muchas misiones de FLL consisten en empujar un objeto hasta un lugar. El parachoques del robot empuja lo que tenga delante.\n\nPon cada misión en una función con un nombre claro, como push_crate(). Así puedes probar una misión sola y montar la partida llamando a las funciones en secuencia.',
      ex: [
        { prompt: '¿Por qué poner cada misión en su propia función?', options: ['Para probar cada una sola y cambiar el orden fácilmente', 'Porque Pybricks lo exige', 'Para que el robot sea más rápido', 'Para ahorrar batería'], explain: 'Las funciones mantienen el programa ordenado: cambias una misión sin romper las demás.' },
        { prompt: 'Completa push_crate() para empujar la caja naranja hasta la zona azul y volver a la BASE 1.', hint: 'El centro de la caja debe terminar entre x = 1500 y 1700. Prueba robot.straight(1300) y luego robot.straight(-1300).' },
      ],
    },
    u10l2: {
      title: 'Agarrar con la garra',
      intro: 'En este desafío el robot tiene la garra en el lado izquierdo (puerto C). Con el motor en 90° está abierta y en 0° cerrada.\n\nPara agarrar: abre, llega con la caja entre las mandíbulas y cierra. Para soltar, abre otra vez.\n\nEl centro de la garra está 214 mm por delante y 46 mm a la izquierda del centro del robot.',
      ex: [
        { prompt: '¿Qué pasa si la garra se cierra sin nada entre las mandíbulas?', options: ['Se cierra vacía y el robot sigue sin la caja', 'El programa da error', 'El robot se detiene', 'La caja va hacia la garra'], explain: 'La garra solo agarra lo que está entre las mandíbulas cuando se cierra.' },
        { prompt: 'Usa open_claw() y close_claw() para agarrar la caja azul y llevarla dentro de la BASE 1.', hint: 'open_claw(), robot.straight(466), close_claw(), robot.straight(-466).' },
      ],
    },
    u1l3: {
      title: 'Errores y comentarios',
      intro: 'Las líneas que empiezan con # son comentarios: notas para el equipo que el robot ignora.\n\nCuando algo está mal, el programa se detiene y muestra un error con el número de línea. Un comando mal escrito, como robot.straigth(), da AttributeError: la DriveBase no tiene ningún comando con ese nombre.',
      ex: [
        { prompt: '¿Qué hace el robot con una línea que empieza con #?', options: ['La ignora: es un comentario', 'La ejecuta dos veces', 'Detiene el programa con un error', 'Pita'], explain: 'Los comentarios explican el código a las personas. El robot se los salta.' },
        { prompt: 'robot.straigth(300) da error. ¿Por qué?', options: ['El nombre del comando está mal escrito', 'El número es demasiado grande', 'No se permiten paréntesis', 'El robot necesita antes un comentario'], explain: 'El nombre correcto es straight. Python solo reconoce el nombre exacto.' },
        { prompt: 'Este programa se detiene con un error. Ejecútalo, lee el mensaje y arréglalo para que el robot avance 500 mm.', hint: 'Mira cómo está escrito straight.' },
      ],
    },
    u1l4: {
      title: 'Luz y sonido',
      intro: 'El hub tiene una luz en el botón central y un altavoz. hub.light.on(Color.GREEN) pone la luz verde y hub.speaker.beep() hace un pitido corto.\n\nAyudan en las pruebas: un pitido avisa que un paso terminó y la luz puede mostrar en qué misión está el robot.',
      ex: [
        { prompt: '¿Qué comando hace pitar al hub?', options: ['hub.speaker.beep()', 'hub.light.beep()', 'robot.beep()', 'hub.display.beep()'], explain: 'El sonido sale del altavoz: hub.speaker.' },
        { prompt: 'Completa para poner la luz verde.', explain: 'Los colores usan Color y el nombre en mayúsculas.' },
        { prompt: 'Pon la luz verde, avanza 300 mm y pita al final.', hint: 'hub.light.on(Color.GREEN), robot.straight(300), hub.speaker.beep().' },
      ],
    },
    u2l4: {
      title: 'Marcha atrás',
      intro: 'Muchas misiones solo necesitan que el robot vaya y vuelva por el mismo camino. En lugar de dar media vuelta, retrocede con una distancia negativa: robot.straight(-800) deshace robot.straight(800).\n\nEs más rápido y el robot vuelve mirando hacia el mismo lado.',
      ex: [
        { prompt: 'El robot hizo robot.straight(800). ¿Qué comando lo devuelve a la salida sin girar?', options: ['robot.straight(-800)', 'robot.turn(180)', 'robot.straight(800)', 'robot.turn(-800)'], explain: 'Una distancia negativa retrocede por el mismo camino.' },
        { prompt: 'Visita la zona roja y vuelve dentro de la BASE 1 sin girar.', hint: 'robot.straight(800) y robot.straight(-800).' },
      ],
    },
    u2l5: {
      title: 'Media vuelta',
      intro: 'Dar media vuelta es girar media vuelta: robot.turn(180) o robot.turn(-180). Los dos terminan mirando hacia el lado opuesto; solo giran en sentidos distintos.\n\nDespués de la media vuelta, las distancias positivas llevan al robot de regreso a donde vino.',
      ex: [
        { prompt: 'Completa para que el robot dé media vuelta.', explain: '180 o -180: media vuelta hacia cualquier lado.' },
        { prompt: 'Después de robot.turn(180), ¿qué hace robot.straight(300)?', options: ['Avanza 300 mm de regreso hacia donde vino', 'Retrocede 300 mm', 'Gira otros 300 grados', 'Avanza de lado'], explain: 'Ahora el robot mira hacia el otro lado, así que adelante es de regreso a la salida.' },
        { prompt: 'Ve a la zona roja, da media vuelta y vuelve dentro de la BASE 1 avanzando hacia adelante.', hint: 'straight(800), turn(180), straight(800).' },
      ],
    },
    u2l6: {
      title: 'Diagonales',
      intro: 'El camino más corto es una línea recta. Para ir directo a un punto, gira hacia él y avanza la distancia de la diagonal.\n\nSi el punto está a mm adelante y b mm hacia un lado, la distancia es √(a² + b²) (Pitágoras). El ángulo es atan(b ÷ a). La herramienta Regla de Simular hace esta cuenta por ti.',
      ex: [
        { prompt: 'Un punto está 600 mm adelante y 800 mm a la izquierda. ¿A qué distancia está en línea recta?', options: ['1000 mm', '1400 mm', '200 mm', '700 mm'], explain: '√(600² + 800²) = √1 000 000 = 1000 mm.' },
        { prompt: '¿Por qué la diagonal suele ser mejor que "recto, girar, recto"?', options: ['Es más corta y tiene menos movimientos', 'Siempre es más precisa', 'Pybricks lo exige', 'Gasta menos batería del hub'], explain: 'Menos movimientos y un camino más corto ahorran tiempo. Cada giro además suma un pequeño error.' },
        { prompt: 'Llega a la zona amarilla con exactamente un turn() y un straight(). El centro de la zona está 800 mm adelante y 640 mm a la izquierda.', hint: 'Ángulo: atan(640 ÷ 800) = 38,7° a la izquierda. Distancia: √(800² + 640²) = 1024 mm.' },
      ],
    },
    u3l3: {
      title: 'Curva en S',
      intro: 'Dos curvas en sentidos opuestos forman una S. robot.curve(300, -90) seguido de robot.curve(300, 90) lleva al robot 600 mm hacia adelante y 600 mm a la izquierda, y termina mirando hacia el mismo lado que en la salida.\n\nEs una forma suave de cambiar de carril sin detenerse.',
      ex: [
        { prompt: 'Después de robot.curve(300, -90) y robot.curve(300, 90), ¿hacia dónde mira el robot?', options: ['Hacia el mismo lado que en la salida', 'A la izquierda', 'A la derecha', 'Hacia atrás'], explain: 'Una curva gira 90° a la izquierda y la otra 90° a la derecha: se anulan.' },
        { prompt: 'Llega a la zona amarilla con dos curvas y termina mirando a la derecha, como en la salida.', hint: 'curve(300, -90), curve(300, 90) y luego straight(200).' },
      ],
    },
    u3l4: {
      title: 'Velocidad de giro',
      intro: 'settings() también cambia la velocidad de giro con turn_rate, en grados por segundo. robot.settings(turn_rate=400) hace que turn() gire más rápido.\n\nLos giros rápidos ahorran tiempo, pero en el robot real patinan más. Prueba en el tapete.',
      ex: [
        { prompt: '¿Qué ajuste cambia lo rápido que gira turn()?', options: ['turn_rate', 'straight_speed', 'axle_track', 'wheel_diameter'], explain: 'turn_rate es la velocidad de giro en grados por segundo.' },
        { prompt: 'Completa para que los giros sean más rápidos.', explain: 'turn_rate=400 significa 400 grados por segundo.' },
        { prompt: 'Gira una vuelta completa (360°) en menos de 2 segundos. A la velocidad por defecto tarda 2,5 s.', hint: 'Pon robot.settings(turn_rate=400) antes del giro.' },
      ],
    },
    u4l3: {
      title: 'Ángulo exacto',
      intro: 'run_angle() suma desde donde esté el motor, así que los pequeños errores se acumulan. run_target(velocidad, ángulo) va a un ángulo exacto contado desde cero, sin importar dónde empezó el motor.\n\nreset_angle(0) fija la posición actual como el nuevo cero.',
      ex: [
        { prompt: '¿Qué hace left_arm.reset_angle(0)?', options: ['Fija la posición actual como cero', 'Gira el motor de vuelta a cero', 'Detiene el motor', 'Gira 0 grados'], explain: 'No mueve nada: solo cambia la referencia.' },
        { prompt: 'El accesorio ya se movió a 105°. Haz que termine exactamente en 120°.', hint: 'left_arm.run_target(500, 120).' },
      ],
    },
    u4l4: {
      title: 'Dos accesorios a la vez',
      intro: 'Si el primer comando espera a terminar, el segundo accesorio empieza solo después. Con wait=False en el primero, los dos se mueven juntos y ahorras tiempo.',
      ex: [
        { prompt: '¿Cómo mueves dos accesorios al mismo tiempo?', options: ['wait=False en el primer comando', 'wait=False en los dos comandos', 'Escribir los dos en la misma línea', 'No se puede en Pybricks'], explain: 'El primero empieza y el programa pasa al segundo. El segundo, sin wait=False, espera a terminar.' },
        { prompt: 'Gira los dos accesorios 180° en menos de 0,8 segundos.', hint: 'left_arm.run_angle(500, 180, wait=False) y right_arm.run_angle(500, 180).' },
      ],
    },
    u5l3: {
      title: 'Parar en un color',
      intro: 'El mismo bucle que para en el negro sirve para cualquier color: solo cambia el color en la condición.\n\nEl sensor está delante del centro del robot y un poco a la izquierda, así que el robot se detiene cuando el sensor (no el centro) llega al color.',
      ex: [
        { prompt: 'Completa para parar en la zona roja.', explain: 'Color.RED es rojo.' },
        { prompt: 'El robot se detuvo con el sensor en el rojo, pero el centro del robot aún está antes de la zona. ¿Por qué?', options: ['El sensor está delante del centro del robot', 'El sensor está roto', 'El rojo no se detecta', 'El robot retrocedió'], explain: 'El sensor lee el suelo delante del robot. Tenlo en cuenta al planear dónde parar.' },
        { prompt: 'Avanza hasta que el sensor encuentre la zona roja y detente ahí.', hint: 'robot.drive(200, 0), while sensor.color() != Color.RED: wait(10), robot.stop().' },
      ],
    },
    u5l4: {
      title: 'Parar con la reflexión',
      intro: 'reflection() da un número, así que puedes elegir un límite. El negro está alrededor de 7: mientras sensor.reflection() > 20, el robot todavía no llegó al negro.\n\nEsto es útil cuando los colores del tapete oficial no son exactamente los que conoce color().',
      ex: [
        { prompt: 'Para parar en el negro usando reflection(), ¿qué condición mantiene al robot avanzando?', options: ['while sensor.reflection() > 20:', 'while sensor.reflection() < 20:', 'while sensor.reflection() == 100:', 'while sensor.color() > 20:'], explain: 'Mientras el valor es alto (suelo claro), sigue avanzando. En el negro baja de 20.' },
        { prompt: 'Detente en la franja negra de PARADA usando sensor.reflection().', hint: 'robot.drive(200, 0), while sensor.reflection() > 20: wait(10), robot.stop().' },
      ],
    },
    u5l5: {
      title: 'Un color y luego otro',
      intro: 'Puedes esperar una cosa y después otra: un bucle while detrás de otro. El robot sigue avanzando todo el tiempo, porque drive() solo se detiene con stop().\n\nAsí el robot usa una marca del tapete como punto de control antes de la parada final.',
      ex: [
        { prompt: 'Ordena el programa: avanzar, esperar el rojo, luego esperar el negro y parar.', explain: 'Los dos bucles se ejecutan uno tras otro mientras el robot sigue avanzando.' },
        { prompt: 'Avanza, espera primero la zona roja, luego la franja negra de PARADA, y detente sobre ella.', hint: 'Dos bucles: while sensor.color() != Color.RED y while sensor.color() != Color.BLACK.' },
      ],
    },
    u6l3: {
      title: 'Repetir mientras',
      intro: 'while repite mientras una condición sea verdadera. Junto con drive() detiene al robot en el momento justo: robot.drive(200, 0), luego while robot.distance() < 600: wait(10), luego robot.stop().\n\ndistance() se actualiza mientras el robot avanza.',
      ex: [
        { prompt: '¿Cuándo deja de repetir while robot.distance() < 600:?', options: ['Cuando el robot avanzó 600 mm o más', 'Nunca', 'Después de 600 repeticiones', 'Enseguida'], explain: 'La condición se vuelve falsa a los 600 mm y el programa sigue.' },
        { prompt: 'Usa drive() y un bucle while para detener al robot después de 600 mm.', hint: 'while robot.distance() < 600: y, dentro, wait(10).' },
      ],
    },
    u6l4: {
      title: 'Decidir con if',
      intro: 'if ejecuta un bloque solo cuando la condición es verdadera; else se ejecuta cuando es falsa. El robot puede decidir qué hacer según el sensor.\n\nEjemplo: if sensor.color() == Color.RED: robot.turn(-90) else: robot.turn(90).',
      ex: [
        { prompt: '¿Qué imprime este programa?', options: ['A', 'B', 'A y B', 'Nada'], explain: '5 > 3 es verdadero, así que solo se ejecuta el bloque del if.' },
        { prompt: 'Después de avanzar 700 mm, si el sensor ve rojo, gira a la izquierda; si no, gira a la derecha. Luego avanza 400 mm.', hint: 'if sensor.color() == Color.RED: robot.turn(-90), else: robot.turn(90).' },
      ],
    },
    u6l5: {
      title: 'Listas',
      intro: 'Una lista guarda varios valores en orden: moves = [800, 640]. moves[0] es el primero, moves[1] el segundo.\n\nfor recorre cada elemento de la lista. Una lista de pares (distancia, ángulo) describe un camino entero en una línea.',
      ex: [
        { prompt: 'Con moves = [800, 640], ¿cuánto vale moves[1]?', options: ['640', '800', '1440', 'Un error'], explain: 'Se cuenta desde 0: moves[0] es 800 y moves[1] es 640.' },
        { prompt: 'Completa para avanzar cada distancia de la lista.', explain: 'for le da a distance cada valor de la lista, uno a la vez.' },
        { prompt: 'Completa el bucle para seguir la lista de movimientos y llegar a la zona amarilla.', hint: 'Dentro del for: robot.straight(distance) y robot.turn(angle).' },
      ],
    },
    u6l6: {
      title: 'Funciones que devuelven',
      intro: 'Una función puede calcular un valor y devolverlo con return. def mm(cm): return cm * 10 convierte centímetros en milímetros.\n\nLa llamada mm(80) se reemplaza por el resultado, 800.',
      ex: [
        { prompt: 'Completa para que la función devuelva el valor en milímetros.', explain: 'return envía el resultado a quien llamó la función.' },
        { prompt: '¿Qué imprime este programa?', options: ['9', '8', '10', 'double(4) + 1'], explain: 'double(4) devuelve 8, más 1 da 9.' },
        { prompt: 'Usa mm() para avanzar 80 cm y llegar a la zona roja.', hint: 'robot.straight(mm(80)).' },
      ],
    },
    u6l7: {
      title: 'Salir de un bucle con break',
      intro: 'while True: repite para siempre. break sale del bucle al instante, así decides dentro del bucle cuándo parar.\n\nEs útil cuando hay varios motivos para parar.',
      ex: [
        { prompt: '¿Qué imprime este programa?', options: ['0, 1 y 2', '0, 1, 2 y 3', 'Solo 3', 'Nada'], explain: 'Cuando i vale 3, break sale del bucle antes del print.' },
        { prompt: 'Completa el bucle para que el robot se detenga en la franja negra de PARADA usando break.', hint: 'if sensor.color() == Color.BLACK: break.' },
      ],
    },
    u7l2: {
      title: 'De base a base',
      intro: 'El tapete de entrenamiento tiene dos bases, una a cada lado, como las zonas de lanzamiento de la mesa FLL. La BASE 2 está a la derecha, en el otro extremo del tapete.\n\nCruzar todo el tapete lleva tiempo: usa settings() para ir más rápido.',
      ex: [
        { prompt: '¿Cuántas bases tiene el tapete de entrenamiento de BatControl?', options: ['Dos, una a cada lado', 'Una', 'Cuatro', 'Ninguna'], explain: 'BASE 1 a la izquierda y BASE 2 a la derecha.' },
        { prompt: 'Cruza el tapete de la BASE 1 a la BASE 2 en menos de 6 segundos.', hint: 'robot.settings(straight_speed=400) y robot.straight(2000).' },
      ],
    },
    u7l3: {
      title: 'Accesorio en marcha',
      intro: 'En una ronda real, el accesorio se mueve mientras el robot avanza. Arranca el accesorio con wait=False y luego avanza: las dos cosas pasan a la vez.\n\nAsí los buenos equipos ahorran segundos en cada misión.',
      ex: [
        { prompt: '¿Por qué mover el accesorio mientras el robot avanza?', options: ['Para ahorrar tiempo de partida', 'Para que el robot sea más preciso', 'Porque el hub lo exige', 'Para ahorrar batería'], explain: 'Dos acciones a la vez tardan lo que la más larga, no la suma.' },
        { prompt: 'Ve a la zona roja abriendo el accesorio derecho 90° en el camino, ciérralo de nuevo a 0° al volver y termina en la BASE 1, todo en menos de 6 segundos.', hint: 'settings(straight_speed=400), right_arm.run_angle(500, 90, wait=False), straight(800), right_arm.run_angle(500, -90, wait=False), straight(-800).' },
      ],
    },
    u8l3: {
      title: 'Girar con el giroscopio',
      intro: 'hub.imu.heading() dice cuántos grados ha girado el robot. Girar a la derecha aumenta el valor.\n\nPuedes girar con drive(0, velocidad) y parar cuando el heading llegue al ángulo que quieres. El giroscopio mide el giro real, aunque las ruedas patinen.',
      ex: [
        { prompt: 'Después de girar 90° a la derecha, ¿qué muestra hub.imu.heading()?', options: ['90', '-90', '0', '180'], explain: 'Girar a la derecha aumenta el heading.' },
        { prompt: 'Completa la condición con el giroscopio.', explain: 'heading() se vuelve a leer en cada repetición.' },
        { prompt: 'El robot ya está girando con drive(0, 120). Detenlo cuando el heading llegue a 90.', hint: 'while hub.imu.heading() < 90: wait(10).' },
      ],
    },
    u9l2: {
      title: 'Seguir durante un tiempo',
      intro: 'StopWatch() es un cronómetro en milisegundos. watch.time() dice cuánto tiempo pasó desde que se creó.\n\nUn seguidor puede parar por tiempo en lugar de distancia: while watch.time() < 3000 sigue durante 3 segundos.',
      ex: [
        { prompt: '¿Qué devuelve watch.time()?', options: ['Milisegundos desde que se creó o reinició el StopWatch', 'Segundos', 'La hora del día', 'Minutos'], explain: 'Pybricks siempre mide el tiempo en ms. 3000 ms = 3 s.' },
        { prompt: 'Cambia el bucle para que el robot siga la línea durante 3 segundos y se detenga.', hint: 'while watch.time() < 3000:' },
      ],
    },
    u10l3: {
      title: 'Dos misiones seguidas',
      intro: 'Cada misión en su propia función, llamadas en orden. Cada una empieza y termina en la base, así la siguiente siempre parte de un lugar conocido.\n\nPara llegar a la zona amarilla sin chocar con la caja, sube primero y luego ve a la derecha.',
      ex: [
        { prompt: '¿Por qué cada función de misión debe terminar de vuelta en la base?', options: ['Para que la siguiente misión empiece en un lugar conocido', 'Porque Python lo exige', 'Para que el robot sea más rápido', 'Para reiniciar el hub'], explain: 'Si una misión termina en un lugar distinto cada vez, todas las medidas siguientes fallan.' },
        { prompt: 'Completa las dos funciones: empuja la caja hasta la zona roja, luego visita la zona amarilla y termina en la BASE 1.', hint: 'push_crate: straight(620) y straight(-620). visit_yellow: turn(-90), straight(640), turn(90), straight(800) y el mismo camino de vuelta al revés.' },
      ],
    },
    u10l4: {
      title: 'Entregar con la garra',
      intro: 'Agarrar es solo la mitad: el robot tiene que llevar la pieza y soltarla en el lugar correcto. Abre, agarra, avanza con la caja sujeta, abre otra vez y vuelve.\n\nEl centro de la garra está 214 mm delante del centro del robot.',
      ex: [
        { prompt: 'El robot sujeta la caja. ¿Qué hace que la suelte?', options: ['Abrir la garra', 'Retroceder', 'Girar el robot', 'Detener el robot'], explain: 'La caja sigue en la garra hasta que se abre.' },
        { prompt: 'Agarra la caja azul, suéltala en la zona roja y vuelve a la BASE 1.', hint: 'open_claw(), straight(266), close_claw(), straight(340), open_claw(), straight(-606).' },
      ],
    },
    u11l1: {
      title: 'Errores de sintaxis',
      intro: 'SyntaxError significa que Python no entendió cómo está escrita una línea: faltan dos puntos, la sangría está mal o un paréntesis quedó abierto.\n\nEl mensaje muestra la línea. Mira esa línea y la anterior.',
      ex: [
        { prompt: 'SyntaxError en una línea con for. ¿Cuál es la causa más probable?', options: ['Faltan los dos puntos al final', 'El número está mal', 'El motor está desconectado', 'El robot es demasiado lento'], explain: 'for, while, if y def siempre terminan con dos puntos.' },
        { prompt: 'Este programa debería recorrer un cuadrado de 300 mm y volver a la salida, pero tiene dos errores. Arréglalos.', hint: 'Pon los dos puntos después de range(4) y sangra robot.turn(-90) para que quede dentro del for.' },
      ],
    },
    u11l2: {
      title: 'Investigar con print',
      intro: 'print() muestra valores en el panel Salida. Es la forma más fácil de saber qué "piensa" el robot: cuánto avanzó, qué lee el sensor, cuál es el heading.\n\nEn el hub real, print aparece en la terminal de Pybricks Code.',
      ex: [
        { prompt: '¿Qué imprime este programa?', options: ['250', '0', '25', 'Un error'], explain: 'distance() cuenta los mm recorridos desde el inicio.' },
        { prompt: 'El robot avanza hasta la franja negra. Imprime cuánto avanzó.', hint: 'print(robot.distance()) después de robot.stop().' },
      ],
    },
    u11l3: {
      title: 'Arregla la misión',
      intro: 'La mayoría de los fallos son pequeños: un número en cm en lugar de mm, un signo al revés, una línea fuera de orden.\n\nEjecuta el programa, mira adónde va el robot y compáralo con lo que querías.',
      ex: [
        { prompt: 'El robot gira a la derecha cuando debería girar a la izquierda. ¿Qué cambias?', options: ['El signo del ángulo', 'La velocidad', 'El puerto', 'El diámetro de la rueda'], explain: 'Positivo gira a la derecha, negativo a la izquierda.' },
        { prompt: 'Este programa debería llegar a la zona amarilla, pero tiene dos fallos. Encuéntralos y arréglalos.', hint: 'straight(80) debería ser 800 mm, y el giro debería ser a la izquierda: turn(-90).' },
      ],
    },
    u11l4: {
      title: 'Puerto equivocado',
      intro: 'OSError al crear un dispositivo suele significar que el programa usa un puerto sin nada conectado, o con el dispositivo equivocado.\n\nEn el robot por defecto, el sensor de color está en el puerto E.',
      ex: [
        { prompt: 'El programa se detiene con OSError en la línea sensor = ColorSensor(Port.F). ¿Qué revisas?', options: ['En qué puerto está conectado de verdad el sensor', 'El tamaño de la rueda', 'La velocidad del robot', 'Los comentarios'], explain: 'El error dice que no se encontró nada en ese puerto.' },
        { prompt: 'Este programa debería parar en la zona roja, pero se detiene con un error. Arréglalo.', hint: 'El sensor de color está en Port.E.' },
      ],
    },
    u12l1: {
      title: 'Salir de la BASE 2',
      intro: 'En la mesa FLL, algunas misiones están más cerca de la otra zona de lanzamiento. En BatControl, la BASE 2 está a la derecha y el robot empieza mirando a la izquierda.\n\nLos comandos son los mismos: adelante es hacia donde mira el robot.',
      ex: [
        { prompt: 'El robot empieza en la BASE 2 mirando a la izquierda. ¿Qué comando lo lleva hacia la zona azul?', options: ['robot.straight(640)', 'robot.straight(-640)', 'robot.turn(180)', 'robot.curve(640, 90)'], explain: 'El robot mira a la izquierda, hacia la zona azul, así que adelante es positivo.' },
        { prompt: 'Desde la BASE 2, visita la zona azul y vuelve a la BASE 2.', hint: 'El centro de la zona azul está 642 mm adelante.' },
      ],
    },
    u12l2: {
      title: 'Contra el reloj',
      intro: 'En una partida cada segundo cuenta. Sube straight_speed y straight_acceleration, pero recuerda: en el robot real, demasiado rápido puede patinar y perder precisión.\n\nLa velocidad máxima de rueda de los motores SPIKE ronda los 490 mm/s.',
      ex: [
        { prompt: '¿Qué cambio ayuda más en un camino largo y recto?', options: ['Subir straight_speed', 'Subir turn_rate', 'Bajar axle_track', 'Añadir wait(100)'], explain: 'En un camino recto, lo que importa es la velocidad de avance.' },
        { prompt: 'Visita la zona roja y la zona azul y vuelve a la BASE 1 en menos de 8 segundos.', hint: 'robot.settings(straight_speed=480, straight_acceleration=1500), straight(1480) y straight(-1480).' },
      ],
    },
    u12l3: {
      title: 'Ronda completa',
      intro: 'Una ronda completa junta varias misiones y termina en una base. Planea primero: dónde está cada objeto, qué camino evita chocar y dónde terminar.\n\nTerminar en la BASE 2 puede ahorrar el regreso.',
      ex: [
        { prompt: '¿Cuál es el mejor primer paso para planear una ronda?', options: ['Dibujar el camino en el tapete y medirlo', 'Escribir el código al azar y probar', 'Poner la velocidad al máximo', 'Usar solo curvas'], explain: 'Con el camino medido (la herramienta Regla ayuda), el código sale bien antes.' },
        { prompt: 'Empuja la caja hasta la zona azul, visita la zona verde y termina en la BASE 2.', hint: 'straight(1300), turn(-41), straight(971), turn(126), straight(562).' },
      ],
    },
    u12l4: {
      title: 'Desafío final',
      intro: 'Junta lo que aprendiste: sigue la línea hasta el final y muestra que llegaste con la luz y un pitido.\n\nEnhorabuena: después de esta lección conoces los principales comandos de Pybricks que se usan en la FLL.',
      ex: [
        { prompt: '¿Cuál es la mejor forma de saber si una misión funciona de verdad en el robot real?', options: ['Ejecutarla varias veces y ver si siempre funciona', 'Ejecutarla una vez', 'Solo mirar el código', 'Probar solo en el simulador'], explain: 'Una buena misión funciona todas las veces, no solo una.' },
        { prompt: 'Sigue la línea hasta el final, luego pon la luz verde y pita.', hint: 'while robot.distance() < 1300: seguidor con kp; luego robot.stop(), hub.light.on(Color.GREEN), hub.speaker.beep().' },
      ],
    },
  },

  comments: {
    '3) Mission commands': '3) Comandos de la misión',
    '40 cm forward': '40 cm hacia adelante',
    '20 cm backward': '20 cm hacia atrás',
    right: 'derecha',
    'left, back to where it was': 'izquierda, vuelve a donde estaba',
    '"Go 300 mm to the left" with differential drive:': '"Ir 300 mm a la izquierda" con tracción diferencial:',
    'wide curve to the left': 'curva abierta a la izquierda',
    faster: 'más rápido',
    'very slow': 'muy despacio',
    'drives for 2 seconds': 'avanza durante 2 segundos',
    'Calibration test: drive 1000 mm and measure with a tape measure': 'Prueba de calibración: avanza 1000 mm y mide con una cinta métrica',
    'Then spin a full turn and check where the robot points': 'Después gira una vuelta completa y mira hacia dónde apunta el robot',
    'half a turn': 'media vuelta',
    back: 'vuelve',
    'drives while the arm turns': 'avanza mientras el accesorio gira',
    open: 'abre',
    'close (grab the piece)': 'cierra (agarra la pieza)',
    'goes to 120': 'va a 120',
    'already there, does not move': 'ya está ahí, no se mueve',
    'back to zero': 'vuelve a cero',
    'Proportional line follower': 'Seguidor de línea proporcional',
    'PID line follower': 'Seguidor de línea PID',
    '300 mm square': 'Cuadrado de 300 mm',
    'Write your commands here': 'Escribe tus comandos aquí',
    'complete: drive at 150 mm/s turning error * gain': 'completa: avanza a 150 mm/s girando error * gain',
    'complete here': 'completa aquí',
    'Two laps of a 300 mm square, back to the start': 'Dos vueltas a un cuadrado de 300 mm, de vuelta a la salida',
    'complete: push the crate into the blue zone and come back': 'completa: empuja la caja hasta la zona azul y vuelve',
    'complete: open, drive to the crate, close and bring it to the base': 'completa: abre, ve hasta la caja, cierra y llévala a la base',
    'Leave the base, go to the red zone and come back': 'Sal de la base, ve a la zona roja y vuelve',
    'Claws: 0 degrees = closed, 90 degrees = open': 'Garras: 0° = cerrada, 90° = abierta',
    'Close both claws on the crates': 'Cierra las dos garras sobre las cajas',
    'Drive 500 mm forward': 'Avanza 500 mm',
    'Go to the yellow zone': 'Ve a la zona amarilla',
    'turn around': 'media vuelta',
    'complete: drive 80 cm using mm()': 'completa: avanza 80 cm usando mm()',
    'complete: drive the distance, then turn the angle': 'completa: avanza la distancia y luego gira el ángulo',
    'complete: end exactly at 120 degrees': 'completa: termina exactamente en 120 grados',
    'complete: first wait for RED, then for BLACK': 'completa: espera primero el ROJO y luego el NEGRO',
    'complete: follow the line for 3 seconds (3000 ms)': 'completa: sigue la línea durante 3 segundos (3000 ms)',
    'complete: follow the line to the end, then turn the light green and beep': 'completa: sigue la línea hasta el final, luego pon la luz verde y pita',
    'complete: go to the yellow zone and come back': 'completa: ve a la zona amarilla y vuelve',
    'complete: grab the crate, drop it in the red zone and return to the base': 'completa: agarra la caja, suéltala en la zona roja y vuelve a la base',
    'complete: if the sensor sees RED turn left, otherwise turn right': 'completa: si el sensor ve ROJO gira a la izquierda, si no gira a la derecha',
    'complete: keep driving until 600 mm': 'completa: sigue avanzando hasta 600 mm',
    'complete: leave the loop when the sensor sees BLACK': 'completa: sal del bucle cuando el sensor vea NEGRO',
    'complete: print how far the robot drove': 'completa: imprime cuánto avanzó el robot',
    'complete: push the crate into the red zone and come back': 'completa: empuja la caja hasta la zona roja y vuelve',
    'complete: wait until the heading reaches 90': 'completa: espera hasta que el heading llegue a 90',
  },
};
