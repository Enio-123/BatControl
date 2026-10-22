// Aba Aprender: parte do conteúdo que não muda com o idioma (assinaturas, parâmetros e exemplos).
// Os textos ficam em src/content/text/<idioma>.ts.
import { program } from './setup';

export type GroupId = 'start' | 'drive' | 'arms' | 'sensor' | 'hub' | 'time' | 'python';
export const GROUPS: GroupId[] = ['start', 'drive', 'arms', 'sensor', 'hub', 'time', 'python'];

export interface RefTopic {
  id: string;
  group: GroupId;
  signature?: string;
  /** Nomes dos parâmetros; unidade e descrição vêm do texto do idioma. */
  params?: string[];
  example: string;
  start?: { x: number; y: number; h: number };
}

export const TOPICS: RefTopic[] = [
  {
    id: 'structure',
    group: 'start',
    example: program(`# 3) Mission commands
robo.straight(300)
robo.turn(90)
hub.speaker.beep()`),
  },
  {
    id: 'motor',
    group: 'start',
    signature: 'Motor(port, positive_direction=Direction.CLOCKWISE, gears=None)',
    params: ['port', 'positive_direction', 'gears'],
    example: program(`anexo_left.run_angle(400, 90)`),
  },
  {
    id: 'drivebase',
    group: 'start',
    signature: 'DriveBase(left_motor, right_motor, wheel_diameter, axle_track)',
    params: ['left_motor', 'right_motor', 'wheel_diameter', 'axle_track'],
    example: program(`robo.straight(500)`),
  },
  {
    id: 'straight',
    group: 'drive',
    signature: 'robo.straight(distance, then=Stop.HOLD, wait=True)',
    params: ['distance', 'then', 'wait'],
    example: program(`robo.straight(400)   # 40 cm forward
robo.straight(-200)  # 20 cm backward`),
  },
  {
    id: 'turn',
    group: 'drive',
    signature: 'robo.turn(angle, then=Stop.HOLD, wait=True)',
    params: ['angle', 'then', 'wait'],
    example: program(`robo.turn(90)    # right
robo.turn(-90)   # left, back to where it was`),
  },
  {
    id: 'strafe',
    group: 'drive',
    example: program(`# "Go 300 mm to the left" with differential drive:
robo.turn(-90)
robo.straight(300)
robo.turn(90)`),
  },
  {
    id: 'curve',
    group: 'drive',
    signature: 'robo.curve(radius, angle, then=Stop.HOLD, wait=True)',
    params: ['radius', 'angle'],
    example: program(`robo.straight(300)
robo.curve(250, -90)   # wide curve to the left
robo.straight(200)`),
  },
  {
    id: 'settings',
    group: 'drive',
    signature: 'robo.settings(straight_speed, straight_acceleration, turn_rate, turn_acceleration)',
    params: ['straight_speed', 'straight_acceleration', 'turn_rate', 'turn_acceleration'],
    example: program(`print(robo.settings())
robo.settings(straight_speed=400)
robo.straight(600)   # faster
robo.settings(straight_speed=100)
robo.straight(-200)  # very slow`),
  },
  {
    id: 'drive',
    group: 'drive',
    signature: 'robo.drive(speed, turn_rate)  ·  robo.stop()',
    params: ['speed', 'turn_rate'],
    example: program(`robo.drive(200, 0)
wait(2000)       # drives for 2 seconds
robo.stop()`),
  },
  {
    id: 'distance',
    group: 'drive',
    signature: 'robo.distance()  ·  robo.angle()  ·  robo.reset()',
    example: program(`robo.reset()
robo.drive(250, 0)
while robo.distance() < 500:
    wait(10)
robo.stop()
print("distance:", robo.distance(), "mm")`),
  },
  {
    id: 'gyro',
    group: 'drive',
    signature: 'robo.use_gyro(True)',
    example: program(`robo.use_gyro(True)
robo.straight(500)
robo.turn(90)
print("heading:", hub.imu.heading())`),
  },
  {
    id: 'calibrate',
    group: 'drive',
    signature: 'wheel_diameter = 62.4 × measured / requested',
    example: program(`# Calibration test: drive 1000 mm and measure with a tape measure
robo.straight(1000)
wait(500)
# Then spin a full turn and check where the robot points
robo.turn(360)`),
  },
  {
    id: 'run-angle',
    group: 'arms',
    signature: 'motor.run_angle(speed, rotation_angle, then=Stop.HOLD, wait=True)',
    params: ['speed', 'rotation_angle', 'wait'],
    example: program(`anexo_left.run_angle(500, 180)     # half a turn
anexo_left.run_angle(500, -180)    # back
anexo_right.run_angle(300, 90, wait=False)
robo.straight(300)              # drives while the arm turns`),
  },
  {
    id: 'claw',
    group: 'arms',
    signature: 'anexo_left.run_angle(300, 90)  ·  anexo_left.run_angle(300, -90)',
    example: program(`anexo_left.run_angle(300, 90)    # open
robo.straight(500)
anexo_left.run_angle(300, -90)   # close (grab the piece)
robo.straight(-500)`),
  },
  {
    id: 'run-target',
    group: 'arms',
    signature: 'motor.run_target(speed, target_angle)  ·  motor.reset_angle(0)',
    params: ['speed', 'target_angle'],
    example: program(`anexo_left.reset_angle(0)
anexo_left.run_target(500, 120)   # goes to 120
anexo_left.run_target(500, 120)   # already there, does not move
anexo_left.run_target(500, 0)     # back to zero
print(anexo_left.angle())`),
  },
  {
    id: 'run-time',
    group: 'arms',
    signature: 'motor.run_time(speed, time)  ·  motor.run(speed)  ·  motor.stop()',
    params: ['speed', 'time'],
    example: program(`anexo_right.run_time(600, 1500)
anexo_left.run(300)
wait(1000)
anexo_left.stop()
print(anexo_left.angle())`),
  },
  {
    id: 'color',
    group: 'sensor',
    signature: 'sensor.color()',
    example: program(`robo.drive(200, 0)
while sensor.color() != Color.BLACK:
    wait(10)
robo.stop()
hub.speaker.beep()`),
  },
  {
    id: 'reflection',
    group: 'sensor',
    signature: 'sensor.reflection()',
    start: { x: 430, y: 580, h: 0 },
    example: program(`# Proportional line follower
target = 50
gain = 1.5
while robo.distance() < 1300:
    error = sensor.reflection() - target
    robo.drive(150, error * gain)
    wait(10)
robo.stop()`),
  },
  {
    id: 'pid',
    group: 'sensor',
    signature: 'turn = kp * error + ki * integral + kd * derivative',
    start: { x: 430, y: 580, h: 0 },
    example: program(`# PID line follower
target = 50
kp = 4
ki = 0
kd = 8
integral = 0
last_error = 0
while robo.distance() < 1300:
    error = sensor.reflection() - target
    integral = integral + error
    derivative = error - last_error
    robo.drive(350, kp * error + ki * integral + kd * derivative)
    last_error = error
    wait(10)
robo.stop()`),
  },
  {
    id: 'imu',
    group: 'hub',
    signature: 'hub.imu.heading()  ·  hub.imu.reset_heading(0)',
    example: program(`hub.imu.reset_heading(0)
robo.turn(90)
print("heading:", hub.imu.heading())`),
  },
  {
    id: 'hub-io',
    group: 'hub',
    signature: 'hub.light.on(Color.GREEN)  ·  hub.display.text("Hi")  ·  hub.speaker.beep()',
    example: program(`hub.light.on(Color.RED)
robo.straight(300)
hub.light.on(Color.GREEN)
hub.speaker.beep(800, 200)
hub.display.number(7)`),
  },
  {
    id: 'wait',
    group: 'time',
    signature: 'wait(time)',
    params: ['time'],
    example: program(`anexo_left.run(400)
wait(1500)
anexo_left.stop()`),
  },
  {
    id: 'stopwatch',
    group: 'time',
    signature: 'watch = StopWatch()  ·  watch.time()  ·  watch.reset()',
    example: program(`watch = StopWatch()
robo.drive(200, 0)
while watch.time() < 2000:
    wait(10)
robo.stop()
print(watch.time(), "ms")`),
  },
  {
    id: 'variables',
    group: 'python',
    example: program(`distance = 400
speed = 300
robo.settings(straight_speed=speed)
robo.straight(distance)
robo.straight(-distance)`),
  },
  {
    id: 'for',
    group: 'python',
    signature: 'for i in range(n):',
    start: { x: 600, y: 250, h: 0 },
    example: program(`# 300 mm square
for i in range(4):
    robo.straight(300)
    robo.turn(-90)`),
  },
  {
    id: 'while',
    group: 'python',
    signature: 'while condition:',
    example: program(`robo.drive(150, 0)
while sensor.color() != Color.BLACK:
    wait(10)
robo.stop()`),
  },
  {
    id: 'if',
    group: 'python',
    example: program(`color = sensor.color()
if color == Color.RED:
    robo.turn(90)
elif color == Color.BLUE:
    robo.turn(-90)
else:
    robo.straight(100)`),
  },
  {
    id: 'def',
    group: 'python',
    example: program(`def red_mission():
    robo.straight(800)
    anexo_left.run_angle(500, 90)
    robo.straight(-800)

def turn_and_drive(angle, distance):
    robo.turn(angle)
    robo.straight(distance)

red_mission()
turn_and_drive(-90, 300)`),
  },
];
