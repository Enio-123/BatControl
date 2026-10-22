// Conteúdo didático em português (Brasil).
import type { ContentText } from './types';

export const TEXT: ContentText = {
  groups: {
    start: 'Começo',
    drive: 'DriveBase (andar)',
    arms: 'Motores de anexo',
    sensor: 'Sensor de cor',
    hub: 'Hub',
    time: 'Tempo',
    python: 'Python para robôs',
  },

  topics: {
    structure: {
      title: 'Estrutura de um programa',
      summary: 'Todo programa Pybricks tem três partes: importar o que vai usar, criar os dispositivos (hub, motores, sensores e a DriveBase) e escrever os comandos da missão, um embaixo do outro. O robô executa de cima para baixo.',
      tips: [
        'Crie cada dispositivo uma única vez, no começo do programa.',
        'Linhas que começam com # são comentários: o robô ignora, mas ajudam a equipe a entender o código.',
        'Os nomes left_motor, robot e sensor são escolhas nossas. Você pode usar outros, desde que use o mesmo nome em todo o programa.',
      ],
      mistakes: ['Esquecer um import gera NameError: o Python não sabe o que é DriveBase ou Port.'],
    },
    motor: {
      title: 'Motor(): criar um motor',
      summary: 'Cria o objeto que controla um motor ligado a uma porta do hub (A a F). No robô padrão do BatControl, as rodas estão nas portas A e B e os anexos nas portas C e E.',
      params: [
        ['Port.A … Port.F', 'Porta do hub onde o cabo do motor está ligado.'],
        ['Direction', 'Sentido que conta como positivo. O motor da roda esquerda fica espelhado, por isso usamos COUNTERCLOCKWISE nele.'],
        ['lista', 'Engrenagens entre o motor e a saída, ex.: [12, 36]. Opcional.'],
      ],
      mistakes: [
        'Esquecer Direction.COUNTERCLOCKWISE no motor esquerdo faz o robô girar no lugar em vez de andar reto. Teste no simulador para ver.',
        'Usar uma porta sem motor dá OSError: confira o cabo e a porta.',
      ],
    },
    drivebase: {
      title: 'DriveBase(): juntar as rodas',
      summary: 'A DriveBase controla os dois motores das rodas juntos, para o robô andar em milímetros e girar em graus. Ela precisa saber o tamanho da roda e a distância entre as rodas.',
      params: [
        ['Motor', 'Motor da roda esquerda.'],
        ['Motor', 'Motor da roda direita.'],
        ['mm', 'Diâmetro da roda. O robô da BatLego usa rodas de 62,4 mm (a roda pequena do SPIKE Prime tem 56 mm).'],
        ['mm', 'Distância entre os pontos onde as duas rodas tocam o chão.'],
      ],
      tips: [
        'Se o robô anda um pouco a mais ou a menos que o pedido, ajuste wheel_diameter.',
        'Se o robô gira um pouco a mais ou a menos, ajuste axle_track. Veja o tópico Calibração.',
      ],
    },
    straight: {
      title: 'straight(): andar reto',
      summary: 'Anda em linha reta pela distância pedida e para. Número positivo vai para frente, negativo vai para trás.',
      params: [
        ['mm', 'Quanto andar. 100 mm = 10 cm.'],
        ['Stop', 'O que fazer ao chegar: Stop.HOLD (segura, padrão), Stop.BRAKE ou Stop.COAST.'],
        ['True/False', 'Se True, o programa espera terminar antes da próxima linha.'],
      ],
      tips: ['Meça no tapete: a régua na borda do tapete do simulador marca a cada 100 mm. Na aba Simular, a ferramenta Régua mede para você.'],
      mistakes: ['Pensar em centímetros: straight(40) anda só 4 cm.'],
    },
    turn: {
      title: 'turn(): girar no lugar',
      summary: 'Gira o robô no próprio lugar, uma roda para frente e a outra para trás. Ângulo positivo gira para a direita (sentido horário) e negativo para a esquerda.',
      params: [
        ['graus', 'Quanto girar. 90 é um quarto de volta, 180 é meia volta.'],
        ['Stop', 'Como parar no fim.'],
        ['True/False', 'Esperar terminar antes de seguir.'],
      ],
      mistakes: ['Trocar o sinal: turn(90) vai para a direita, não para a esquerda.'],
    },
    strafe: {
      title: 'E o strafe (andar de lado)?',
      summary: 'A DriveBase do Pybricks não tem strafe. Um robô de FLL comum tem duas rodas de tração fixas (tração diferencial), e elas só empurram para frente e para trás. Andar de lado só existe em robôs com rodas omni ou mecanum. Para chegar a um ponto ao lado, gire, ande e gire de volta.',
      tips: ['Se você escrever robot.strafe(...), o simulador mostra o mesmo erro que o hub mostraria: AttributeError.'],
    },
    curve: {
      title: 'curve(): fazer uma curva',
      summary: 'Anda em arco, como um carro fazendo uma curva. O raio diz se a curva é aberta ou fechada e o ângulo diz quanto do círculo percorrer. Ângulo positivo curva para a direita.',
      params: [
        ['mm', 'Raio do círculo. Positivo anda para frente, negativo anda de ré.'],
        ['graus', 'Quanto do círculo percorrer. 90 é um quarto de círculo.'],
      ],
      tips: ['Curvas são mais rápidas que parar, girar e andar, mas são mais difíceis de acertar. Use quando a missão pede caminho suave.'],
    },
    settings: {
      title: 'settings(): velocidade e aceleração',
      summary: 'Muda a velocidade e a aceleração usadas por straight, turn e curve. Sem argumentos, retorna os valores atuais. Mais devagar costuma ser mais preciso.',
      params: [
        ['mm/s', 'Velocidade andando reto.'],
        ['mm/s²', 'Quão rápido ganha e perde velocidade.'],
        ['graus/s', 'Velocidade de giro.'],
        ['graus/s²', 'Aceleração do giro.'],
      ],
      tips: ['No simulador os valores padrão são aproximados a partir do motor do SPIKE. No hub real eles podem ser um pouco diferentes.'],
    },
    drive: {
      title: 'drive() e stop(): andar sem parar',
      summary: 'drive() liga as rodas e o programa segue na hora para a próxima linha, com o robô ainda andando. O robô só para quando você chamar robot.stop(). É a base para "andar até ver a linha preta" e para seguidor de linha.',
      params: [
        ['mm/s', 'Velocidade para frente (negativa = ré).'],
        ['graus/s', 'Quanto vai virando enquanto anda. 0 = reto, positivo = direita.'],
      ],
      mistakes: ['Chamar drive() e esquecer de esperar (wait ou um loop): o programa termina na hora e o robô nem sai do lugar.'],
    },
    distance: {
      title: 'distance(), angle() e reset()',
      summary: 'distance() diz quantos mm o robô andou desde o início (ou desde o último reset). angle() diz quantos graus ele girou. reset() zera os dois.',
      returns: 'Números inteiros: mm e graus.',
    },
    gyro: {
      title: 'use_gyro(): usar o giroscópio',
      summary: 'Faz a DriveBase usar o giroscópio do hub para medir o giro do robô, em vez de só contar quanto as rodas giraram. No robô real as rodas escorregam um pouco em cada giro; com o giroscópio a DriveBase percebe e corrige.',
      tips: [
        'Ligue o Modo realista na aba Simular: as rodas passam a escorregar como no robô de verdade, e cada rodada sai um pouco diferente. Compare com e sem use_gyro(True).',
        'Deixe o hub parado por um instante antes de começar: o giroscópio se calibra quando o robô está imóvel.',
      ],
    },
    calibrate: {
      title: 'Calibração: wheel_diameter e axle_track',
      summary: 'Pneus gastos, rodas um pouco diferentes e o tapete mudam as medidas reais. Calibre assim: mande andar 1000 mm e meça com uma trena. Novo wheel_diameter = valor atual × medido ÷ 1000. Depois mande girar 360° e veja quanto o robô girou de verdade. Novo axle_track = valor atual × 360 ÷ giro real.',
      tips: [
        'A aba Simular › Robô tem uma calculadora de calibração que faz essa conta.',
        'Repita a medida três vezes e use a média: uma medida só pode enganar.',
        'Calibre no tapete da competição sempre que puder.',
      ],
      mistakes: ['Inverter a conta: se o robô andou MAIS que o pedido, o wheel_diameter precisa AUMENTAR (a roda é maior do que o programa pensa).'],
    },
    'run-angle': {
      title: 'run_angle(): girar um anexo',
      summary: 'Gira o motor um certo número de graus a partir de onde ele está. É o comando mais usado para levantar e baixar braços de anexo. No simulador, os anexos aparecem como as duas engrenagens em cima do robô.',
      params: [
        ['graus/s', 'Velocidade do motor. Até cerca de 1000.'],
        ['graus', 'Quanto girar. 360 é uma volta inteira; negativo gira ao contrário.'],
        ['True/False', 'Use wait=False para o anexo girar enquanto o robô anda.'],
      ],
    },
    claw: {
      title: 'Exemplo de anexo: garra',
      summary: 'A garra de pinça é um anexo simples: um motor gira duas engrenagens que abrem e fecham as mandíbulas ao mesmo tempo. No simulador, ligue a garra em Simular › Robô › Anexos. Com o motor em 0° ela fica fechada e em 90° fica toda aberta. Ao fechar com uma caixa entre as mandíbulas, ela pega a caixa.',
      tips: [
        'Use run_target(300, 0) para fechar: assim a garra sempre volta ao mesmo ponto, mesmo se começou meio aberta.',
        'No robô real, prenda a garra em uma viga firme: se ela balançar, a pinça erra a peça.',
      ],
    },
    'run-target': {
      title: 'run_target() e reset_angle()',
      summary: 'run_target() leva o motor até um ângulo exato, contado a partir do zero. É diferente de run_angle(): não importa onde o motor estava, ele termina sempre no mesmo lugar. reset_angle(0) define a posição atual como zero.',
      params: [
        ['graus/s', 'Velocidade.'],
        ['graus', 'Ângulo final desejado.'],
      ],
    },
    'run-time': {
      title: 'run_time(), run() e stop()',
      summary: 'run_time() gira o motor por um tempo em milissegundos. run() liga o motor e não para sozinho, até você chamar stop(). angle() diz em que ângulo o motor está.',
      params: [
        ['graus/s', 'Velocidade.'],
        ['ms', 'Tempo girando. 1000 ms = 1 segundo.'],
      ],
    },
    color: {
      title: 'color(): qual cor está embaixo',
      summary: 'Lê a cor do tapete embaixo do sensor e retorna uma cor como Color.BLACK, Color.WHITE, Color.RED, Color.BLUE, Color.GREEN ou Color.YELLOW. No simulador, o ponto vermelho no chão mostra onde o sensor está lendo.',
      returns: 'Uma cor (Color.X). Compare com ==.',
      mistakes: ['Comparar com o texto "BLACK": o certo é Color.BLACK, sem aspas.'],
    },
    reflection: {
      title: 'reflection(): quanta luz volta',
      summary: 'Mede quanta luz o tapete reflete, de 0 a 100. Preto fica perto de 7 e branco perto de 96. Na borda da linha o valor fica no meio, e é isso que o seguidor de linha usa.',
      returns: 'Número de 0 a 100.',
      tips: ['Comece com velocidade baixa e ajuste o ganho: muito alto faz o robô zigue-zaguear, muito baixo faz ele perder a curva.'],
    },
    pid: {
      title: 'Seguidor de linha PID',
      summary: 'O controle PID soma três correções. P (proporcional) vira mais quanto maior o erro. I (integral) corrige um erro que fica sempre para o mesmo lado. D (derivativo) olha quão rápido o erro muda e freia a correção antes de passar do ponto, o que tira o zigue-zague. Na FLL, P e D já resolvem quase tudo.',
      tips: [
        'Ajuste nesta ordem: comece com kd = 0 e ki = 0, suba kp até o robô seguir a curva, depois suba kd até parar o zigue-zague.',
        'Mexa um número de cada vez e anote o que aconteceu.',
        'Mais velocidade pede mais kd.',
      ],
      mistakes: ['Esquecer de atualizar last_error no fim do loop: a derivada fica sempre errada.'],
    },
    imu: {
      title: 'hub.imu.heading(): para onde o robô aponta',
      summary: 'O giroscópio do hub diz quantos graus o robô girou desde o começo. Girar para a direita aumenta o valor.',
      returns: 'Graus.',
    },
    'hub-io': {
      title: 'Luz, tela e som do hub',
      summary: 'Use a luz do botão, a tela de 5×5 e o alto-falante para mostrar o que o robô está fazendo. Ajuda muito na hora de testar: um bip diz que uma etapa terminou.',
    },
    wait: {
      title: 'wait(): esperar',
      summary: 'Pausa o programa por um tempo em milissegundos. Os motores que estavam ligados continuam ligados.',
      params: [['ms', '1000 ms = 1 segundo.']],
      tips: ['Dentro de loops, um wait(10) dá tempo para o hub e deixa as leituras estáveis.'],
    },
    stopwatch: {
      title: 'StopWatch(): cronômetro',
      summary: 'Um cronômetro em milissegundos. Útil para limitar quanto tempo uma etapa pode durar. Uma partida da FLL dura 2 min 30 s (150000 ms).',
    },
    variables: {
      title: 'Variáveis',
      summary: 'Uma variável guarda um valor com um nome. Assim você muda um número em um lugar só, em vez de caçar no programa inteiro.',
    },
    for: {
      title: 'for: repetir um número de vezes',
      summary: 'Repete o bloco indentado (com 4 espaços) n vezes. range(4) conta 0, 1, 2, 3.',
      mistakes: ['Esquecer os dois-pontos no fim da linha do for, ou esquecer de indentar o bloco.'],
    },
    while: {
      title: 'while: repetir enquanto for verdade',
      summary: 'Repete o bloco enquanto a condição for verdadeira. Usado para "andar até ver a linha" ou "girar até o rumo certo".',
    },
    if: {
      title: 'if, elif e else: decidir',
      summary: 'Executa um bloco só se a condição for verdadeira. Use elif para testar outra condição e else para "senão".',
    },
    def: {
      title: 'def: criar suas funções',
      summary: 'Uma função dá nome a um conjunto de comandos. Na FLL é comum ter uma função por missão e chamar todas em sequência. Assim dá para testar cada missão sozinha e trocar a ordem sem reescrever nada.',
    },
  },

  units: {
    u1: { title: 'Conhecendo o Pybricks', desc: 'O que é um programa e como o robô aparece no código.' },
    u2: { title: 'Andar e girar', desc: 'straight() e turn(): os dois comandos que mais aparecem na FLL.' },
    u3: { title: 'Curvas e velocidade', desc: 'curve() para caminhos suaves e settings() para ajustar o ritmo.' },
    u4: { title: 'Anexos', desc: 'Motores das portas C e E, que movem os anexos das missões.' },
    u5: { title: 'Sensor de cor', desc: 'Parar na linha preta e seguir uma linha.' },
    u6: { title: 'Lógica de programação', desc: 'Repetir com for, decidir com if e organizar missões com def.' },
    u7: { title: 'Missão completa', desc: 'Junte tudo numa saída de verdade, dentro do tempo da partida.' },
    u8: { title: 'Precisão', desc: 'Giroscópio e calibração: o robô real não é perfeito como no papel.' },
    u9: { title: 'Seguidor PID', desc: 'Seguir a linha rápido sem zigue-zague.' },
    u10: { title: 'Funções de missão', desc: 'Empurrar e pegar objetos, cada missão na sua função.' },
    u11: { title: 'Depuração', desc: 'Ler erros, investigar com print e consertar programas.' },
    u12: { title: 'Estratégia de competição', desc: 'BASE 2, velocidade contra o relógio e rodadas completas.' },
  },

  lessons: {
    u1l1: {
      title: 'Primeiro programa',
      intro: 'O Pybricks é Python rodando dentro do hub do SPIKE Prime. O robô executa o programa de cima para baixo, uma linha por vez.\n\nPara andar usamos a DriveBase, que neste curso se chama robot. O comando robot.straight(300) anda 300 milímetros para frente.',
      ex: [
        { prompt: 'Em que linguagem escrevemos programas no Pybricks?', options: ['Python', 'Blocos do Scratch', 'C++', 'JavaScript'], explain: 'O Pybricks usa MicroPython, uma versão de Python feita para placas pequenas como o hub.' },
        { prompt: 'Em que unidade o straight() mede a distância?', options: ['Milímetros', 'Centímetros', 'Rotações da roda', 'Segundos'], explain: 'Tudo que é distância no Pybricks é em mm. 30 cm = 300 mm.' },
        { prompt: 'Complete para o robô andar 300 mm para frente.', explain: 'straight quer dizer "reto" em inglês.' },
        { prompt: 'Faça o robô andar 300 mm para frente.', hint: 'Use robot.straight(300) embaixo do comentário.' },
      ],
    },
    u1l2: {
      title: 'O robô no código',
      intro: 'Antes de mandar o robô andar, o programa precisa saber o que está ligado em cada porta. No robô padrão do BatControl:\n\nPorta A: roda esquerda. Porta B: roda direita. Porta C: anexo esquerdo. Porta D: sensor de cor. Porta E: anexo direito.\n\nO motor da esquerda é montado espelhado, então ele recebe Direction.COUNTERCLOCKWISE para que "positivo" seja "para frente" nas duas rodas.',
      ex: [
        { prompt: 'Em que portas estão os motores das rodas do robô padrão?', options: ['A e B', 'C e D', 'E e F', 'A e C'], explain: 'Rodas em A e B, anexos em C e E, sensor de cor em D.' },
        { prompt: 'Por que o motor esquerdo usa Direction.COUNTERCLOCKWISE?', options: ['Porque ele é montado espelhado em relação ao direito', 'Para o robô andar mais rápido', 'Porque o hub só aceita um motor normal', 'Para o robô andar de lado'], explain: 'Os dois motores ficam virados um para o outro. Sem inverter um deles, as rodas giram em sentidos opostos e o robô gira no lugar.' },
        { prompt: 'As rodas do robô da BatLego têm 62,4 mm de diâmetro. Complete (use ponto: 62.4):', explain: 'wheel_diameter é o diâmetro da roda em mm.' },
        { prompt: 'Coloque as linhas na ordem certa (os imports já estão prontos).', explain: 'Primeiro criamos os motores, depois a DriveBase que usa os motores, e só então damos comandos.' },
        { prompt: 'Este programa faz o robô girar no lugar em vez de andar 400 mm. Rode para ver o problema e conserte a criação dos motores.', hint: 'O motor da porta A precisa de Direction.COUNTERCLOCKWISE.' },
      ],
    },
    u2l1: {
      title: 'Andando reto',
      intro: 'straight(distancia) anda em linha reta e para. Número positivo vai para frente; negativo vai de ré.\n\nNo tapete do simulador, a borda tem uma régua a cada 100 mm. A largada fica dentro da BASE 1, com o centro do robô em x = 120 mm.',
      ex: [
        { prompt: 'O que faz robot.straight(-200)?', options: ['Anda 200 mm de ré', 'Anda 200 mm para frente', 'Gira 200 graus', 'Dá erro, número negativo não pode'], explain: 'Distância negativa anda para trás.' },
        { prompt: 'Quanto é 25 cm em milímetros?', options: ['250', '25', '2500', '2,5'], explain: '1 cm = 10 mm, então 25 cm = 250 mm.' },
        { prompt: 'Leve o robô até a zona vermelha. O centro dela fica 800 mm à frente da largada.', hint: 'Um único robot.straight() com a distância certa resolve.' },
      ],
    },
    u2l2: {
      title: 'Girando',
      intro: 'turn(angulo) gira o robô no lugar. Positivo gira para a direita (sentido horário), negativo para a esquerda.\n\nUm quarto de volta é 90 graus e meia volta é 180.',
      ex: [
        { prompt: 'Para que lado o robô vai com robot.turn(90)?', options: ['Direita', 'Esquerda', 'Para frente', 'Depende da porta'], explain: 'Ângulo positivo = sentido horário = direita.' },
        { prompt: 'Qual comando faz o robô dar meia-volta?', options: ['robot.turn(180)', 'robot.turn(90)', 'robot.turn(360)', 'robot.straight(-180)'], explain: 'Meia volta é 180 graus. 360 é a volta inteira, e o robô termina virado para o mesmo lado.' },
        { prompt: 'Complete para girar um quarto de volta para a esquerda.', explain: 'Esquerda é negativo: -90.' },
        { prompt: 'Leve o robô até a zona amarela. Dica de medidas: ande 800 mm, gire para a esquerda e ande mais 640 mm.', hint: 'straight(800), depois turn(-90), depois straight(640).' },
      ],
    },
    u2l3: {
      title: 'Existe strafe?',
      intro: 'Algumas pessoas procuram um comando strafe() para andar de lado. A DriveBase do Pybricks não tem: o robô tem duas rodas fixas que só empurram para frente e para trás (tração diferencial).\n\nPara chegar num ponto ao lado: gire, ande e gire de volta.',
      ex: [
        { prompt: 'O que acontece se o programa chamar robot.strafe(100)?', options: ['Dá erro: a DriveBase não tem strafe', 'O robô anda 100 mm de lado', 'O robô gira 100 graus', 'O robô anda 100 mm para frente'], explain: 'O hub mostra AttributeError, igual ao simulador. Andar de lado só existe com rodas omni ou mecanum.' },
        { prompt: 'Monte o caminho para "ir 300 mm para a esquerda" e terminar virado para a frente de novo.', explain: 'Girar, andar e girar de volta substitui o strafe.' },
        { prompt: 'Termine dentro da zona amarela, mas virado para a direita do tapete, como na largada.', hint: 'Use o caminho da lição anterior e acrescente um turn(90) no final.' },
      ],
    },
    u3l1: {
      title: 'Curvas',
      intro: 'curve(raio, angulo) anda num arco de círculo. Raio grande faz curva aberta, raio pequeno faz curva fechada. Ângulo positivo curva para a direita.\n\nUma curva de raio 300 e ângulo -90 desloca o robô 300 mm para frente e 300 mm para a esquerda.',
      ex: [
        { prompt: 'Qual destas curvas é mais fechada?', options: ['robot.curve(100, 90)', 'robot.curve(400, 90)', 'robot.curve(800, 90)', 'Todas são iguais'], explain: 'Quanto menor o raio, mais fechada a curva.' },
        { prompt: 'Complete para fazer um quarto de círculo para a esquerda com raio 300 mm.', explain: 'Esquerda é negativo e um quarto de círculo é 90 graus.' },
        { prompt: 'Chegue na zona amarela usando uma curve() no caminho, sem usar turn().', hint: 'Ande 500 mm, faça curve(300, -90) e ande mais 340 mm.' },
      ],
    },
    u3l2: {
      title: 'Velocidade',
      intro: 'robot.settings() muda a velocidade de straight, turn e curve. Por exemplo, robot.settings(straight_speed=400) anda a 400 mm/s.\n\nMais rápido economiza tempo da partida, mais devagar costuma ser mais preciso.',
      ex: [
        { prompt: 'Em que unidade fica straight_speed?', options: ['mm/s', 'graus/s', 'cm/s', 'rotações por minuto'], explain: 'Velocidade de deslocamento é em milímetros por segundo.' },
        { prompt: 'Complete para andar a 400 mm/s.', explain: 'straight_speed controla a velocidade em linha reta.' },
        { prompt: 'Chegue na zona azul (1400 mm à frente) em menos de 6 segundos. Na velocidade padrão o robô não consegue.', hint: 'Coloque robot.settings(straight_speed=400) antes do straight.' },
      ],
    },
    u4l1: {
      title: 'run_angle()',
      intro: 'Os anexos são movidos pelos motores das portas C e E. No simulador, eles são as duas engrenagens em cima do robô.\n\nleft_arm.run_angle(500, 180) gira o anexo esquerdo 180 graus a 500 graus por segundo.',
      ex: [
        { prompt: 'Em left_arm.run_angle(500, 90), o que é o 500?', options: ['A velocidade, em graus por segundo', 'O ângulo, em graus', 'O tempo, em milissegundos', 'A força do motor'], explain: 'Primeiro vem a velocidade, depois o ângulo.' },
        { prompt: 'Complete para girar o anexo direito uma volta inteira.', explain: 'Uma volta inteira tem 360 graus.' },
        { prompt: 'Gire o anexo esquerdo meia volta e depois traga de volta para a posição inicial.', hint: 'Duas linhas: left_arm.run_angle(500, 180) e left_arm.run_angle(500, -180).' },
      ],
    },
    u4l2: {
      title: 'Anexo e robô juntos',
      intro: 'Por padrão, cada comando espera terminar antes da próxima linha. Com wait=False o comando começa e o programa segue na hora.\n\nAssim o anexo pode subir enquanto o robô anda, economizando segundos preciosos da partida.\n\nrun_target(velocidade, angulo) leva o motor até um ângulo exato, contado a partir do zero.',
      ex: [
        { prompt: 'O que wait=False faz em right_arm.run_angle(500, 90, wait=False)?', options: ['Começa a girar e o programa segue sem esperar', 'Não gira o motor', 'Gira o motor sem parar', 'Espera 90 ms antes de girar'], explain: 'O motor gira em paralelo com as próximas linhas.' },
        { prompt: 'O anexo está em 30°. Para onde ele vai com run_target(500, 90)?', options: ['Para 90°', 'Para 120°', 'Para 60°', 'Fica em 30°'], explain: 'run_target vai para o ângulo alvo, não importa onde estava. run_angle(500, 90) é que iria para 120°.' },
        { prompt: 'Vá até a zona vermelha e, ao mesmo tempo, gire o anexo direito 90°. Tudo em menos de 4,6 segundos.', hint: 'right_arm.run_angle(500, 90, wait=False) e depois robot.straight(800).' },
      ],
    },
    u5l1: {
      title: 'Parar na linha',
      intro: 'sensor.color() diz a cor do tapete embaixo do sensor: Color.BLACK, Color.WHITE, Color.RED...\n\nPara andar até achar uma cor: ligue as rodas com robot.drive(velocidade, 0), espere num while até a cor aparecer e chame robot.stop().\n\nNo simulador, o ponto vermelho no chão mostra onde o sensor lê.',
      ex: [
        { prompt: 'Qual a forma certa de testar se o sensor vê preto?', options: ['sensor.color() == Color.BLACK', 'sensor.color() == "BLACK"', 'sensor.color = Color.BLACK', 'sensor.black()'], explain: 'Compare com == e use a cor do Pybricks (Color.BLACK), sem aspas.' },
        { prompt: 'Complete para andar até achar a linha preta.', explain: 'Enquanto a cor for diferente (!=) de preto, continua andando.' },
        { prompt: 'Ande até a faixa preta de PARADA e pare em cima dela. No caminho o sensor passa pela zona vermelha: o robô não pode parar lá.', hint: 'robot.drive(200, 0), depois while sensor.color() != Color.BLACK: wait(10), depois robot.stop().' },
      ],
    },
    u5l2: {
      title: 'Seguidor de linha',
      intro: 'sensor.reflection() mede de 0 a 100 quanta luz volta: preto fica perto de 7 e branco perto de 96. Na borda da linha fica no meio, perto de 50.\n\nO seguidor proporcional calcula error = reflection() - 50 e vira o robô proporcional ao erro: robot.drive(150, error * gain). Ele anda na borda da linha, corrigindo o tempo todo.',
      ex: [
        { prompt: 'O sensor está todo em cima do preto. Qual valor de reflection() é mais provável?', options: ['Perto de 7', 'Perto de 50', 'Perto de 96', 'Exatamente 100'], explain: 'Preto reflete pouca luz.' },
        { prompt: 'O robô zigue-zagueia muito em cima da linha. O que costuma ajudar?', options: ['Diminuir o ganho', 'Aumentar o ganho', 'Tirar o wait(10)', 'Usar turn() no lugar de drive()'], explain: 'Ganho alto exagera as correções. Diminua aos poucos (e a velocidade também, se precisar).' },
        { prompt: 'O robô já começa com o sensor na borda da linha. Complete o seguidor de linha para ele percorrer a reta e a curva até chegar ao fim da linha.', hint: 'Dentro do while, troque o comentário por robot.drive(150, error * gain).' },
      ],
    },
    u6l1: {
      title: 'Repetições',
      intro: 'for i in range(4): repete o bloco indentado 4 vezes. O bloco é tudo que está com 4 espaços a mais embaixo do for.\n\nNão esqueça os dois-pontos no fim da linha.',
      ex: [
        { prompt: 'Quantas vezes o bloco de for i in range(3): é executado?', options: ['3', '2', '4', 'Infinitas'], explain: 'range(3) conta 0, 1 e 2: três vezes.' },
        { prompt: 'Complete para repetir 4 vezes.', explain: 'range(4) gera os números de 0 a 3.' },
        { prompt: 'Faça um quadrado de 300 mm de lado usando for, e termine no mesmo lugar da largada. O robô começa fora da base, com espaço livre à frente e à esquerda.', hint: 'for i in range(4): e, dentro, robot.straight(300) e robot.turn(-90).' },
      ],
    },
    u6l2: {
      title: 'Funções',
      intro: 'def cria uma função: um nome para um conjunto de comandos. Na FLL é comum ter uma função para cada missão.\n\nFunções podem receber valores, como def go_and_back(distance):. Dentro dela, distance vale o que foi passado na chamada.',
      ex: [
        { prompt: 'O que acontece quando o Python lê a linha def mission():?', options: ['Ele só guarda a função; ela roda quando for chamada com mission()', 'Ele executa a função na hora', 'Ele dá erro se a função não for usada', 'Ele repete a função para sempre'], explain: 'Definir não é executar. Só roda quando você chama mission().' },
        { prompt: 'Monte a função e a chamada na ordem certa.', explain: 'Primeiro a definição com o bloco indentado, depois a chamada fora do bloco.' },
        { prompt: 'Crie a função go_and_back(distance) e use-a para visitar a zona vermelha e voltar para a largada.', hint: 'Dentro da função: robot.straight(distance) e robot.straight(-distance). Fora: go_and_back(800).' },
      ],
    },
    u7l1: {
      title: 'Saída da base',
      intro: 'Numa partida da FLL o robô sai da base, cumpre missões e volta. Você tem 2 minutos e 30 segundos para todas as saídas.\n\nNeste desafio não há dica de medidas: use a régua da borda do tapete. O centro da zona azul fica em x = 1600 mm e o da zona verde em x = 2150, y = 860.',
      ex: [
        { prompt: 'Quanto tempo dura uma partida da FLL Challenge?', options: ['2 min 30 s', '1 min', '5 min', '10 min'], explain: '150 segundos. Por isso cada segundo economizado conta.' },
        { prompt: 'Passe pela zona azul, depois pela zona verde, e termine de volta dentro da BASE 1.', hint: 'Uma solução: settings mais rápido, straight(1480), turn(-49), straight(844) e volte pelo mesmo caminho de ré.' },
      ],
    },
    u8l1: {
      title: 'Giroscópio',
      intro: 'No robô de verdade as rodas escorregam um pouco em cada giro e uma roda nunca é idêntica à outra. Um erro de 2° em cada giro vira um erro grande no fim de uma saída.\n\nrobot.use_gyro(True) faz a DriveBase medir o giro com o giroscópio do hub e corrigir sozinha.\n\nNeste desafio o simulador está no modo realista: as rodas escorregam como no robô real.',
      ex: [
        { prompt: 'Por que o robô real erra os giros mesmo com o programa certo?', options: ['As rodas escorregam e não são idênticas', 'O Python arredonda os números', 'O hub só gira de 10 em 10 graus', 'A bateria muda o ângulo pedido'], explain: 'A DriveBase conta o giro pelas rodas. Se elas escorregam, a conta não bate com o giro de verdade.' },
        { prompt: 'O que o giroscópio mede?', options: ['Quanto o robô girou de verdade', 'A cor do tapete', 'A distância até a parede', 'A velocidade das rodas'], explain: 'O giroscópio sente a rotação do próprio hub, então não depende das rodas.' },
        { prompt: 'Complete para ligar o giroscópio na DriveBase.', explain: 'use_gyro(True) liga, use_gyro(False) desliga.' },
        { prompt: 'Rode o programa como está: depois de duas voltas no quadrado o robô não volta ao ponto de partida. Ligue o giroscópio para ele voltar certinho.', hint: 'Acrescente robot.use_gyro(True) antes do for.' },
      ],
    },
    u8l2: {
      title: 'Calibração',
      intro: 'O programa só sabe o que você diz para ele. Se a roda real for um pouco maior que 62,4 mm, o robô anda mais do que o pedido.\n\nPara calibrar: mande andar 1000 mm e meça. Novo wheel_diameter = atual × medido ÷ 1000.\n\nPara o giro: mande girar 360° e veja quanto girou. Novo axle_track = atual × 360 ÷ giro real.',
      ex: [
        { prompt: 'O robô deveria andar 1000 mm e andou 980 mm. O que fazer com wheel_diameter?', options: ['Diminuir', 'Aumentar', 'Deixar igual e mudar axle_track', 'Trocar o sinal'], explain: 'Andou menos, então a roda real é menor que o programa pensa: diminua (56 × 980 ÷ 1000 = 54,9).' },
        { prompt: 'Pedi turn(360) e o robô girou só 350°. O que fazer com axle_track?', options: ['Aumentar', 'Diminuir', 'Deixar igual', 'Zerar'], explain: 'Para girar mais, a DriveBase precisa achar que as rodas estão mais longe uma da outra: 140 × 360 ÷ 350 = 144.' },
        { prompt: 'Com wheel_diameter=62.4 o robô andou 1025 mm quando pedi 1000 mm. Complete com o novo valor (62,4 × 1025 ÷ 1000, arredondado):', explain: '62,4 × 1,025 = 63,96, mais ou menos 64 mm.' },
      ],
    },
    u9l1: {
      title: 'P e D',
      intro: 'Para seguir a linha rápido o ganho proporcional (kp) precisa ser alto, mas aí o robô passa do ponto e zigue-zagueia.\n\nO termo D olha quanto o erro mudou desde a última leitura: derivative = error - last_error. Se o erro está diminuindo rápido, o D segura a correção antes de passar do ponto.\n\nturn_rate = kp × error + kd × derivative',
      ex: [
        { prompt: 'Para que serve o termo D (derivativo)?', options: ['Frear a correção antes de passar do ponto', 'Andar mais rápido', 'Medir a cor da linha', 'Fazer o robô parar no fim'], explain: 'O D reage à velocidade da mudança do erro e amortece o zigue-zague.' },
        { prompt: 'Qual é a ordem recomendada para ajustar um PID na FLL?', options: ['Primeiro kp, depois kd, ki por último (se precisar)', 'Primeiro ki, depois kp', 'Todos ao mesmo tempo', 'Primeiro kd, depois kp'], explain: 'kp faz seguir, kd tira o zigue-zague e ki quase nunca é necessário num seguidor de linha.' },
        { prompt: 'A 400 mm/s, com kp = 6 e sem D, o robô zigue-zagueia e sai da linha. Ajuste os ganhos para ele chegar ao fim da linha em até 4 segundos.', hint: 'Deixe kp = 6 e coloque kd = 8.' },
      ],
    },
    u10l1: {
      title: 'Empurrar com função',
      intro: 'Muitas missões da FLL são empurrar um objeto até um lugar. O para-choque do robô empurra o que estiver na frente.\n\nOrganize cada missão numa função com nome claro, como push_crate(). Assim dá para testar uma missão sozinha e montar a partida chamando as funções em sequência.',
      ex: [
        { prompt: 'Por que separar cada missão numa função?', options: ['Para testar cada uma sozinha e trocar a ordem fácil', 'Porque o Pybricks exige', 'Para o robô andar mais rápido', 'Para economizar bateria'], explain: 'Funções deixam o programa organizado: muda uma missão sem quebrar as outras.' },
        { prompt: 'Complete a função push_crate() para empurrar a caixa laranja até a zona azul e voltar para a BASE 1.', hint: 'A caixa precisa terminar com o centro entre x = 1500 e 1700. Tente robot.straight(1300) e depois robot.straight(-1300).' },
      ],
    },
    u10l2: {
      title: 'Pegar com a garra',
      intro: 'Neste desafio o robô tem a garra no lado esquerdo (porta C). Com o motor em 90° ela está aberta e em 0° fechada.\n\nPara pegar: abra, chegue com a caixa entre as mandíbulas e feche. Para soltar, abra de novo.\n\nO centro da garra fica 214 mm à frente e 46 mm à esquerda do centro do robô.',
      ex: [
        { prompt: 'O que acontece se a garra fechar sem nada entre as mandíbulas?', options: ['Ela fecha vazia e o robô segue sem a caixa', 'O programa dá erro', 'O robô para', 'A caixa vem até a garra'], explain: 'A garra só pega o que estiver entre as mandíbulas na hora de fechar.' },
        { prompt: 'Use open_claw() e close_claw() para pegar a caixa azul e trazê-la para dentro da BASE 1.', hint: 'open_claw(), robot.straight(466), close_claw(), robot.straight(-466).' },
      ],
    },
    u1l3: {
      title: 'Erros e comentários',
      intro: 'Linhas que começam com # são comentários: anotações para a equipe que o robô ignora.\n\nQuando algo está errado, o programa para e mostra um erro com o número da linha. Um comando escrito errado, como robot.straigth(), dá AttributeError: a DriveBase não tem comando com esse nome.',
      ex: [
        { prompt: 'O que o robô faz com uma linha que começa com #?', options: ['Ignora: é um comentário', 'Executa duas vezes', 'Para o programa com erro', 'Apita'], explain: 'Comentários explicam o código para as pessoas. O robô pula essas linhas.' },
        { prompt: 'robot.straigth(300) dá erro. Por quê?', options: ['O nome do comando está escrito errado', 'O número é grande demais', 'Parênteses não são permitidos', 'O robô precisa de um comentário antes'], explain: 'O nome certo é straight. O Python só reconhece o nome exato.' },
        { prompt: 'Este programa para com erro. Rode, leia a mensagem e conserte para o robô andar 500 mm.', hint: 'Veja como straight está escrito.' },
      ],
    },
    u1l4: {
      title: 'Luz e som',
      intro: 'O hub tem uma luz no botão central e um alto-falante. hub.light.on(Color.GREEN) deixa a luz verde e hub.speaker.beep() faz um bipe curto.\n\nIsso ajuda nos testes: um bipe avisa que uma etapa terminou, e a luz pode mostrar em qual missão o robô está.',
      ex: [
        { prompt: 'Qual comando faz o hub apitar?', options: ['hub.speaker.beep()', 'hub.light.beep()', 'robot.beep()', 'hub.display.beep()'], explain: 'O som sai do alto-falante: hub.speaker.' },
        { prompt: 'Complete para deixar a luz verde.', explain: 'As cores usam Color e o nome em maiúsculas.' },
        { prompt: 'Deixe a luz verde, ande 300 mm e apite no final.', hint: 'hub.light.on(Color.GREEN), robot.straight(300), hub.speaker.beep().' },
      ],
    },
    u2l4: {
      title: 'Andar de ré',
      intro: 'Muitas missões só precisam que o robô vá e volte pelo mesmo caminho. Em vez de dar meia-volta, ande de ré com uma distância negativa: robot.straight(-800) desfaz robot.straight(800).\n\nÉ mais rápido e o robô volta virado para o mesmo lado.',
      ex: [
        { prompt: 'O robô andou robot.straight(800). Qual comando traz ele de volta à largada sem girar?', options: ['robot.straight(-800)', 'robot.turn(180)', 'robot.straight(800)', 'robot.turn(-800)'], explain: 'Uma distância negativa anda de ré pelo mesmo caminho.' },
        { prompt: 'Visite a zona vermelha e volte para dentro da BASE 1 sem girar.', hint: 'robot.straight(800) e robot.straight(-800).' },
      ],
    },
    u2l5: {
      title: 'Meia-volta',
      intro: 'Dar meia-volta é girar meia volta: robot.turn(180) ou robot.turn(-180). Os dois terminam virados para o lado oposto; só giram em sentidos diferentes.\n\nDepois da meia-volta, distâncias positivas levam o robô de volta para onde ele veio.',
      ex: [
        { prompt: 'Complete para o robô dar meia-volta.', explain: '180 ou -180: meia volta para qualquer lado.' },
        { prompt: 'Depois de robot.turn(180), o que robot.straight(300) faz?', options: ['Anda 300 mm de volta para onde veio', 'Anda 300 mm de ré', 'Gira mais 300 graus', 'Anda de lado'], explain: 'O robô agora está virado para o outro lado, então para frente é de volta para a largada.' },
        { prompt: 'Vá até a zona vermelha, dê meia-volta e volte para dentro da BASE 1 andando para frente.', hint: 'straight(800), turn(180), straight(800).' },
      ],
    },
    u2l6: {
      title: 'Diagonais',
      intro: 'O caminho mais curto é uma linha reta. Para ir direto a um ponto, gire na direção dele e ande a distância da diagonal.\n\nSe o ponto está a mm à frente e b mm para o lado, a distância é √(a² + b²) (Pitágoras). O ângulo é atan(b ÷ a). A ferramenta Régua da aba Simular faz essa conta para você.',
      ex: [
        { prompt: 'Um ponto está 600 mm à frente e 800 mm à esquerda. Qual a distância em linha reta?', options: ['1000 mm', '1400 mm', '200 mm', '700 mm'], explain: '√(600² + 800²) = √1.000.000 = 1000 mm.' },
        { prompt: 'Por que a diagonal costuma ser melhor que "reto, gira, reto"?', options: ['É mais curta e tem menos movimentos', 'É sempre mais precisa', 'O Pybricks exige', 'Gasta menos bateria do hub'], explain: 'Menos movimentos e um caminho mais curto economizam tempo. Cada giro também soma um pequeno erro.' },
        { prompt: 'Chegue à zona amarela com exatamente um turn() e um straight(). O centro da zona está 800 mm à frente e 640 mm à esquerda.', hint: 'Ângulo: atan(640 ÷ 800) = 38,7° para a esquerda. Distância: √(800² + 640²) = 1024 mm.' },
      ],
    },
    u3l3: {
      title: 'Curva em S',
      intro: 'Duas curvas em sentidos opostos formam um S. robot.curve(300, -90) seguido de robot.curve(300, 90) leva o robô 600 mm para frente e 600 mm para a esquerda, e ele termina virado para o mesmo lado da largada.\n\nÉ um jeito suave de trocar de faixa sem parar.',
      ex: [
        { prompt: 'Depois de robot.curve(300, -90) e robot.curve(300, 90), para onde o robô está virado?', options: ['Para o mesmo lado da largada', 'Para a esquerda', 'Para a direita', 'Para trás'], explain: 'Uma curva gira 90° para a esquerda e a outra 90° para a direita: uma anula a outra.' },
        { prompt: 'Chegue à zona amarela com duas curvas e termine virado para a direita, como na largada.', hint: 'curve(300, -90), curve(300, 90) e depois straight(200).' },
      ],
    },
    u3l4: {
      title: 'Velocidade de giro',
      intro: 'settings() também muda a velocidade de giro com turn_rate, em graus por segundo. robot.settings(turn_rate=400) faz o turn() girar mais rápido.\n\nGiros rápidos economizam tempo, mas no robô de verdade escorregam mais. Teste no tapete.',
      ex: [
        { prompt: 'Qual configuração muda a velocidade do turn()?', options: ['turn_rate', 'straight_speed', 'axle_track', 'wheel_diameter'], explain: 'turn_rate é a velocidade de giro em graus por segundo.' },
        { prompt: 'Complete para os giros ficarem mais rápidos.', explain: 'turn_rate=400 quer dizer 400 graus por segundo.' },
        { prompt: 'Gire uma volta inteira (360°) em menos de 2 segundos. Na velocidade padrão leva 2,5 s.', hint: 'Coloque robot.settings(turn_rate=400) antes do giro.' },
      ],
    },
    u4l3: {
      title: 'Ângulo exato',
      intro: 'run_angle() soma a partir de onde o motor está, então pequenos erros vão se acumulando. run_target(velocidade, ângulo) vai para um ângulo exato contado a partir do zero, não importa onde o motor começou.\n\nreset_angle(0) define a posição atual como o novo zero.',
      ex: [
        { prompt: 'O que left_arm.reset_angle(0) faz?', options: ['Define a posição atual como zero', 'Gira o motor de volta para o zero', 'Para o motor', 'Gira 0 graus'], explain: 'Não mexe nada: só muda a referência.' },
        { prompt: 'O anexo já foi para 105°. Faça ele terminar exatamente em 120°.', hint: 'left_arm.run_target(500, 120).' },
      ],
    },
    u4l4: {
      title: 'Dois anexos ao mesmo tempo',
      intro: 'Se o primeiro comando espera terminar, o segundo anexo só começa depois. Com wait=False no primeiro, os dois se mexem juntos e você economiza tempo.',
      ex: [
        { prompt: 'Como mexer dois anexos ao mesmo tempo?', options: ['wait=False no primeiro comando', 'wait=False nos dois comandos', 'Escrever os dois na mesma linha', 'Não dá no Pybricks'], explain: 'O primeiro começa e o programa segue para o segundo. O segundo, sem wait=False, espera terminar.' },
        { prompt: 'Gire os dois anexos 180° em menos de 0,8 segundo.', hint: 'left_arm.run_angle(500, 180, wait=False) e right_arm.run_angle(500, 180).' },
      ],
    },
    u5l3: {
      title: 'Parar numa cor',
      intro: 'O mesmo laço que para no preto funciona para qualquer cor: é só trocar a cor na condição.\n\nO sensor fica à frente do centro do robô e um pouco para a esquerda, então o robô para quando o sensor (e não o centro) chega na cor.',
      ex: [
        { prompt: 'Complete para parar na zona vermelha.', explain: 'Color.RED é vermelho.' },
        { prompt: 'O robô parou com o sensor no vermelho, mas o centro do robô ainda está antes da zona. Por quê?', options: ['O sensor fica à frente do centro do robô', 'O sensor está quebrado', 'Vermelho não é detectado', 'O robô andou de ré'], explain: 'O sensor lê o chão à frente do robô. Lembre disso ao planejar onde parar.' },
        { prompt: 'Ande até o sensor encontrar a zona vermelha e pare ali.', hint: 'robot.drive(200, 0), while sensor.color() != Color.RED: wait(10), robot.stop().' },
      ],
    },
    u5l4: {
      title: 'Parar pela reflexão',
      intro: 'reflection() dá um número, então você escolhe um limite. O preto fica perto de 7: enquanto sensor.reflection() > 20, o robô ainda não chegou no preto.\n\nIsso é útil quando as cores do tapete oficial não são exatamente as que o color() conhece.',
      ex: [
        { prompt: 'Para parar no preto usando reflection(), qual condição mantém o robô andando?', options: ['while sensor.reflection() > 20:', 'while sensor.reflection() < 20:', 'while sensor.reflection() == 100:', 'while sensor.color() > 20:'], explain: 'Enquanto o valor é alto (chão claro), continue andando. No preto ele cai para menos de 20.' },
        { prompt: 'Pare na faixa preta de PARADA usando sensor.reflection().', hint: 'robot.drive(200, 0), while sensor.reflection() > 20: wait(10), robot.stop().' },
      ],
    },
    u5l5: {
      title: 'Uma cor, depois outra',
      intro: 'Dá para esperar uma coisa e depois outra: um laço while depois do outro. O robô continua andando o tempo todo, porque o drive() só para com stop().\n\nAssim o robô usa uma marca do tapete como ponto de controle antes da parada final.',
      ex: [
        { prompt: 'Coloque o programa em ordem: andar, esperar o vermelho, depois esperar o preto e parar.', explain: 'Os dois laços rodam um depois do outro enquanto o robô continua andando.' },
        { prompt: 'Ande, espere primeiro a zona vermelha, depois a faixa preta de PARADA, e pare em cima dela.', hint: 'Dois laços: while sensor.color() != Color.RED e while sensor.color() != Color.BLACK.' },
      ],
    },
    u6l3: {
      title: 'Repetir enquanto',
      intro: 'while repete enquanto uma condição é verdadeira. Junto com drive() ele para o robô na hora certa: robot.drive(200, 0), depois while robot.distance() < 600: wait(10), depois robot.stop().\n\ndistance() é atualizado enquanto o robô anda.',
      ex: [
        { prompt: 'Quando while robot.distance() < 600: para de repetir?', options: ['Quando o robô andou 600 mm ou mais', 'Nunca', 'Depois de 600 repetições', 'Na hora'], explain: 'A condição fica falsa em 600 mm e o programa segue.' },
        { prompt: 'Use drive() e um laço while para parar o robô depois de 600 mm.', hint: 'while robot.distance() < 600: e, dentro, wait(10).' },
      ],
    },
    u6l4: {
      title: 'Decidir com if',
      intro: 'if executa um bloco só quando a condição é verdadeira; else executa quando ela é falsa. O robô pode decidir o que fazer de acordo com o sensor.\n\nExemplo: if sensor.color() == Color.RED: robot.turn(-90) else: robot.turn(90).',
      ex: [
        { prompt: 'O que este programa imprime?', options: ['A', 'B', 'A e B', 'Nada'], explain: '5 > 3 é verdadeiro, então só o bloco do if roda.' },
        { prompt: 'Depois de andar 700 mm, se o sensor vir vermelho, vire à esquerda; senão, vire à direita. Depois ande 400 mm.', hint: 'if sensor.color() == Color.RED: robot.turn(-90), else: robot.turn(90).' },
      ],
    },
    u6l5: {
      title: 'Listas',
      intro: 'Uma lista guarda vários valores em ordem: moves = [800, 640]. moves[0] é o primeiro, moves[1] o segundo.\n\nfor passa por cada item da lista. Uma lista de pares (distância, ângulo) descreve um caminho inteiro numa linha.',
      ex: [
        { prompt: 'Com moves = [800, 640], quanto vale moves[1]?', options: ['640', '800', '1440', 'Um erro'], explain: 'A contagem começa em 0: moves[0] é 800 e moves[1] é 640.' },
        { prompt: 'Complete para andar cada distância da lista.', explain: 'for entrega cada valor da lista para distance, um de cada vez.' },
        { prompt: 'Complete o laço para seguir a lista de movimentos e chegar à zona amarela.', hint: 'Dentro do for: robot.straight(distance) e robot.turn(angle).' },
      ],
    },
    u6l6: {
      title: 'Funções que devolvem',
      intro: 'Uma função pode calcular um valor e devolver com return. def mm(cm): return cm * 10 transforma centímetros em milímetros.\n\nA chamada mm(80) é trocada pelo resultado, 800.',
      ex: [
        { prompt: 'Complete para a função devolver o valor em milímetros.', explain: 'return manda o resultado de volta para quem chamou a função.' },
        { prompt: 'O que este programa imprime?', options: ['9', '8', '10', 'double(4) + 1'], explain: 'double(4) devolve 8, mais 1 dá 9.' },
        { prompt: 'Use mm() para andar 80 cm e chegar à zona vermelha.', hint: 'robot.straight(mm(80)).' },
      ],
    },
    u6l7: {
      title: 'Sair do laço com break',
      intro: 'while True: repete para sempre. break sai do laço na hora, então você decide dentro do laço quando parar.\n\nÉ útil quando existem vários motivos para parar.',
      ex: [
        { prompt: 'O que este programa imprime?', options: ['0, 1 e 2', '0, 1, 2 e 3', 'Só 3', 'Nada'], explain: 'Quando i vale 3, o break sai do laço antes do print.' },
        { prompt: 'Complete o laço para o robô parar na faixa preta de PARADA usando break.', hint: 'if sensor.color() == Color.BLACK: break.' },
      ],
    },
    u7l2: {
      title: 'De base a base',
      intro: 'O tapete de treino tem duas bases, uma de cada lado, como as áreas de lançamento da mesa da FLL. A BASE 2 fica à direita, na outra ponta do tapete.\n\nAtravessar o tapete inteiro leva tempo: use settings() para ir mais rápido.',
      ex: [
        { prompt: 'Quantas bases tem o tapete de treino do BatControl?', options: ['Duas, uma de cada lado', 'Uma', 'Quatro', 'Nenhuma'], explain: 'BASE 1 à esquerda e BASE 2 à direita.' },
        { prompt: 'Atravesse o tapete da BASE 1 até a BASE 2 em menos de 6 segundos.', hint: 'robot.settings(straight_speed=400) e robot.straight(2000).' },
      ],
    },
    u7l3: {
      title: 'Anexo no caminho',
      intro: 'Numa rodada de verdade, o anexo se mexe enquanto o robô anda. Comece o anexo com wait=False e depois ande: as duas coisas acontecem juntas.\n\nÉ assim que as boas equipes economizam segundos em cada missão.',
      ex: [
        { prompt: 'Por que mexer o anexo enquanto o robô anda?', options: ['Para economizar tempo da partida', 'Para o robô ficar mais preciso', 'Porque o hub exige', 'Para economizar bateria'], explain: 'Duas ações juntas levam o tempo da mais longa, não a soma.' },
        { prompt: 'Vá até a zona vermelha abrindo o anexo direito 90° no caminho, feche de volta para 0° na volta e termine na BASE 1, tudo em menos de 6 segundos.', hint: 'settings(straight_speed=400), right_arm.run_angle(500, 90, wait=False), straight(800), right_arm.run_angle(500, -90, wait=False), straight(-800).' },
      ],
    },
    u8l3: {
      title: 'Girar pelo giroscópio',
      intro: 'hub.imu.heading() diz quantos graus o robô girou. Girar para a direita aumenta o valor.\n\nVocê pode girar com drive(0, velocidade) e parar quando o heading chegar no ângulo que você quer. O giroscópio mede o giro real, mesmo se as rodas escorregarem.',
      ex: [
        { prompt: 'Depois de girar 90° para a direita, o que hub.imu.heading() mostra?', options: ['90', '-90', '0', '180'], explain: 'Girar para a direita aumenta o heading.' },
        { prompt: 'Complete a condição com o giroscópio.', explain: 'heading() é lido de novo a cada repetição.' },
        { prompt: 'O robô já está girando com drive(0, 120). Pare quando o heading chegar a 90.', hint: 'while hub.imu.heading() < 90: wait(10).' },
      ],
    },
    u9l2: {
      title: 'Seguir por um tempo',
      intro: 'StopWatch() é um cronômetro em milissegundos. watch.time() diz quanto tempo passou desde que ele foi criado.\n\nUm seguidor pode parar pelo tempo em vez da distância: while watch.time() < 3000 segue por 3 segundos.',
      ex: [
        { prompt: 'O que watch.time() devolve?', options: ['Milissegundos desde que o StopWatch foi criado ou zerado', 'Segundos', 'A hora do dia', 'Minutos'], explain: 'O Pybricks sempre mede tempo em ms. 3000 ms = 3 s.' },
        { prompt: 'Mude o laço para o robô seguir a linha por 3 segundos e parar.', hint: 'while watch.time() < 3000:' },
      ],
    },
    u10l3: {
      title: 'Duas missões seguidas',
      intro: 'Cada missão na sua função, chamadas em ordem. Cada uma começa e termina na base, então a próxima sempre começa de um lugar conhecido.\n\nPara chegar à zona amarela sem bater na caixa, suba primeiro e depois vá para a direita.',
      ex: [
        { prompt: 'Por que cada função de missão deve terminar de volta na base?', options: ['Para a próxima missão começar de um lugar conhecido', 'Porque o Python exige', 'Para o robô ficar mais rápido', 'Para reiniciar o hub'], explain: 'Se uma missão termina num lugar diferente a cada vez, todas as medidas seguintes ficam erradas.' },
        { prompt: 'Complete as duas funções: empurre a caixa até a zona vermelha, depois visite a zona amarela, e termine na BASE 1.', hint: 'push_crate: straight(620) e straight(-620). visit_yellow: turn(-90), straight(640), turn(90), straight(800) e o mesmo caminho de volta ao contrário.' },
      ],
    },
    u10l4: {
      title: 'Entregar com a garra',
      intro: 'Pegar é só metade: o robô precisa levar a peça e soltar no lugar certo. Abra, pegue, ande com a caixa presa, abra de novo e volte.\n\nO centro da garra fica 214 mm à frente do centro do robô.',
      ex: [
        { prompt: 'O robô está segurando a caixa. O que faz ele soltar?', options: ['Abrir a garra', 'Andar de ré', 'Girar o robô', 'Parar o robô'], explain: 'A caixa fica na garra até ela abrir.' },
        { prompt: 'Pegue a caixa azul, solte na zona vermelha e volte para a BASE 1.', hint: 'open_claw(), straight(266), close_claw(), straight(340), open_claw(), straight(-606).' },
      ],
    },
    u11l1: {
      title: 'Erros de sintaxe',
      intro: 'SyntaxError quer dizer que o Python não entendeu como uma linha foi escrita: faltou dois-pontos, a indentação está errada ou um parêntese ficou aberto.\n\nA mensagem mostra a linha. Olhe essa linha e a de cima.',
      ex: [
        { prompt: 'SyntaxError numa linha com for. Qual a causa mais provável?', options: ['Faltam os dois-pontos no final', 'O número está errado', 'O motor está desligado', 'O robô está devagar demais'], explain: 'for, while, if e def sempre terminam com dois-pontos.' },
        { prompt: 'Este programa deveria fazer um quadrado de 300 mm e voltar à largada, mas tem dois erros. Conserte.', hint: 'Coloque os dois-pontos depois de range(4) e indente robot.turn(-90) para ficar dentro do for.' },
      ],
    },
    u11l2: {
      title: 'Investigar com print',
      intro: 'print() mostra valores no painel Saída. É o jeito mais fácil de descobrir o que o robô está "pensando": quanto andou, o que o sensor lê, qual é o heading.\n\nNo hub de verdade, o print aparece no terminal do Pybricks Code.',
      ex: [
        { prompt: 'O que este programa imprime?', options: ['250', '0', '25', 'Um erro'], explain: 'distance() conta os mm andados desde o começo.' },
        { prompt: 'O robô anda até a faixa preta. Imprima quanto ele andou.', hint: 'print(robot.distance()) depois de robot.stop().' },
      ],
    },
    u11l3: {
      title: 'Conserte a missão',
      intro: 'A maioria dos bugs é pequena: um número em cm em vez de mm, um sinal trocado, uma linha fora de ordem.\n\nRode o programa, veja para onde o robô vai e compare com o que você queria.',
      ex: [
        { prompt: 'O robô vira para a direita quando deveria virar para a esquerda. O que você muda?', options: ['O sinal do ângulo', 'A velocidade', 'A porta', 'O diâmetro da roda'], explain: 'Positivo vira para a direita, negativo para a esquerda.' },
        { prompt: 'Este programa deveria chegar à zona amarela, mas tem dois bugs. Encontre e conserte.', hint: 'straight(80) deveria ser 800 mm, e o giro deveria ser para a esquerda: turn(-90).' },
      ],
    },
    u11l4: {
      title: 'Porta errada',
      intro: 'OSError ao criar um dispositivo normalmente quer dizer que o programa usa uma porta sem nada ligado, ou com o dispositivo errado.\n\nNo robô padrão, o sensor de cor fica na porta D.',
      ex: [
        { prompt: 'O programa para com OSError na linha sensor = ColorSensor(Port.F). O que você confere?', options: ['Em qual porta o sensor está ligado de verdade', 'O tamanho da roda', 'A velocidade do robô', 'Os comentários'], explain: 'O erro diz que nada foi encontrado naquela porta.' },
        { prompt: 'Este programa deveria parar na zona vermelha, mas para com erro. Conserte.', hint: 'O sensor de cor está na Port.D.' },
      ],
    },
    u12l1: {
      title: 'Largar da BASE 2',
      intro: 'Na mesa da FLL, algumas missões ficam mais perto da outra área de lançamento. No BatControl, a BASE 2 fica à direita e o robô começa virado para a esquerda.\n\nOs comandos são os mesmos: para frente é para onde o robô está virado.',
      ex: [
        { prompt: 'O robô começa na BASE 2 virado para a esquerda. Qual comando leva ele em direção à zona azul?', options: ['robot.straight(640)', 'robot.straight(-640)', 'robot.turn(180)', 'robot.curve(640, 90)'], explain: 'O robô está virado para a esquerda, na direção da zona azul, então para frente é positivo.' },
        { prompt: 'Saindo da BASE 2, visite a zona azul e volte para a BASE 2.', hint: 'O centro da zona azul está 642 mm à frente.' },
      ],
    },
    u12l2: {
      title: 'Contra o relógio',
      intro: 'Numa partida cada segundo conta. Aumente straight_speed e straight_acceleration, mas lembre: no robô de verdade, rápido demais pode escorregar e perder precisão.\n\nA velocidade máxima de roda dos motores SPIKE fica perto de 540 mm/s com rodas de 62,4 mm.',
      ex: [
        { prompt: 'Qual mudança ajuda mais num caminho longo e reto?', options: ['Aumentar straight_speed', 'Aumentar turn_rate', 'Diminuir axle_track', 'Colocar wait(100)'], explain: 'Num caminho reto, o que importa é a velocidade de andar.' },
        { prompt: 'Visite a zona vermelha e a zona azul e volte para a BASE 1 em menos de 8 segundos.', hint: 'robot.settings(straight_speed=480, straight_acceleration=1500), straight(1480) e straight(-1480).' },
      ],
    },
    u12l3: {
      title: 'Rodada completa',
      intro: 'Uma rodada completa junta várias missões e termina numa base. Planeje antes: onde está cada objeto, qual caminho evita bater em coisas e onde terminar.\n\nTerminar na BASE 2 pode economizar a volta.',
      ex: [
        { prompt: 'Qual o melhor primeiro passo para planejar uma rodada?', options: ['Desenhar o caminho no tapete e medir', 'Escrever o código no chute e testar', 'Colocar a velocidade no máximo', 'Usar só curvas'], explain: 'Com o caminho medido (a ferramenta Régua ajuda), o código sai certo mais rápido.' },
        { prompt: 'Empurre a caixa até a zona azul, visite a zona verde e termine na BASE 2.', hint: 'straight(1300), turn(-41), straight(971), turn(126), straight(562).' },
      ],
    },
    u12l4: {
      title: 'Desafio final',
      intro: 'Junte o que você aprendeu: siga a linha até o fim e mostre que chegou com a luz e um bipe.\n\nParabéns: depois desta lição você conhece os principais comandos do Pybricks usados na FLL.',
      ex: [
        { prompt: 'Qual o melhor jeito de saber se uma missão funciona mesmo no robô de verdade?', options: ['Rodar várias vezes e ver se sempre dá certo', 'Rodar uma vez', 'Só olhar o código', 'Testar só no simulador'], explain: 'Uma boa missão funciona todas as vezes, não só uma.' },
        { prompt: 'Siga a linha até o fim, depois deixe a luz verde e apite.', hint: 'while robot.distance() < 1300: seguidor com kp; depois robot.stop(), hub.light.on(Color.GREEN), hub.speaker.beep().' },
      ],
    },
  },

  comments: {
    '3) Mission commands': '3) Comandos da missão',
    '40 cm forward': '40 cm para frente',
    '20 cm backward': '20 cm de ré',
    right: 'direita',
    'left, back to where it was': 'esquerda, volta para onde estava',
    '"Go 300 mm to the left" with differential drive:': '"Ir 300 mm para a esquerda" com tração diferencial:',
    'wide curve to the left': 'curva aberta para a esquerda',
    faster: 'mais rápido',
    'very slow': 'bem devagar',
    'drives for 2 seconds': 'anda por 2 segundos',
    'Calibration test: drive 1000 mm and measure with a tape measure': 'Teste de calibração: ande 1000 mm e meça com uma trena',
    'Then spin a full turn and check where the robot points': 'Depois gire uma volta inteira e veja para onde o robô aponta',
    'half a turn': 'meia volta',
    back: 'volta',
    'drives while the arm turns': 'anda enquanto o anexo gira',
    open: 'abre',
    'close (grab the piece)': 'fecha (pega a peça)',
    'goes to 120': 'vai para 120',
    'already there, does not move': 'já está lá, não mexe',
    'back to zero': 'volta para o zero',
    'Proportional line follower': 'Seguidor de linha proporcional',
    'PID line follower': 'Seguidor de linha PID',
    '300 mm square': 'Quadrado de 300 mm',
    'Write your commands here': 'Escreva seus comandos aqui',
    'complete: drive at 150 mm/s turning error * gain': 'complete: ande a 150 mm/s virando error * gain',
    'complete here': 'complete aqui',
    'Two laps of a 300 mm square, back to the start': 'Duas voltas num quadrado de 300 mm, de volta à largada',
    'complete: push the crate into the blue zone and come back': 'complete: empurre a caixa até a zona azul e volte',
    'complete: open, drive to the crate, close and bring it to the base': 'complete: abra, vá até a caixa, feche e traga para a base',
    'Leave the base, go to the red zone and come back': 'Saia da base, vá até a zona vermelha e volte',
    'Claws: 0 degrees = closed, 90 degrees = open': 'Garras: 0° = fechada, 90° = aberta',
    'Close both claws on the crates': 'Fecha as duas garras nas caixas',
    'Drive 500 mm forward': 'Ande 500 mm para frente',
    'Go to the yellow zone': 'Vá até a zona amarela',
    'turn around': 'meia-volta',
    'complete: drive 80 cm using mm()': 'complete: ande 80 cm usando mm()',
    'complete: drive the distance, then turn the angle': 'complete: ande a distância, depois gire o ângulo',
    'complete: end exactly at 120 degrees': 'complete: termine exatamente em 120 graus',
    'complete: first wait for RED, then for BLACK': 'complete: espere primeiro o VERMELHO, depois o PRETO',
    'complete: follow the line for 3 seconds (3000 ms)': 'complete: siga a linha por 3 segundos (3000 ms)',
    'complete: follow the line to the end, then turn the light green and beep': 'complete: siga a linha até o fim, depois deixe a luz verde e apite',
    'complete: go to the yellow zone and come back': 'complete: vá até a zona amarela e volte',
    'complete: grab the crate, drop it in the red zone and return to the base': 'complete: pegue a caixa, solte na zona vermelha e volte para a base',
    'complete: if the sensor sees RED turn left, otherwise turn right': 'complete: se o sensor vir VERMELHO vire à esquerda, senão vire à direita',
    'complete: keep driving until 600 mm': 'complete: continue andando até 600 mm',
    'complete: leave the loop when the sensor sees BLACK': 'complete: saia do laço quando o sensor vir PRETO',
    'complete: print how far the robot drove': 'complete: imprima quanto o robô andou',
    'complete: push the crate into the red zone and come back': 'complete: empurre a caixa até a zona vermelha e volte',
    'complete: wait until the heading reaches 90': 'complete: espere o heading chegar a 90',
  },
};
