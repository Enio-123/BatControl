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
robot.straight(300)
robot.turn(90)
hub.speaker.beep()`),
  },
  {
    id: 'motor',
    group: 'start',
    signature: 'Motor(port, positive_direction=Direction.CLOCKWISE, gears=None)',
    params: ['port', 'positive_direction', 'gears'],
    example: program(`left_arm.run_angle(400, 90)`),
  },
  {
    id: 'drivebase',
    group: 'start',
    signature: 'DriveBase(left_motor, right_motor, wheel_diameter, axle_track)',
    params: ['left_motor', 'right_motor', 'wheel_diameter', 'axle_track'],
    example: program(`robot.straight(500)`),
  },
  {
    id: 'straight',
    group: 'drive',
    signature: 'robot.straight(distance, then=Stop.HOLD, wait=True)',
    params: ['distance', 'then', 'wait'],
    example: program(`robot.straight(400)   # 40 cm forward
robot.straight(-200)  # 20 cm backward`),
  },
  {
    id: 'turn',
    group: 'drive',
    signature: 'robot.turn(angle, then=Stop.HOLD, wait=True)',
    params: ['angle', 'then', 'wait'],
    example: program(`robot.turn(90)    # right
robot.turn(-90)   # left, back to where it was`),
  },
  {
    id: 'strafe',
    group: 'drive',
    example: program(`# "Go 300 mm to the left" with differential drive:
robot.turn(-90)
robot.straight(300)
robot.turn(90)`),
  },
  {
    id: 'curve',
    group: 'drive',
    signature: 'robot.curve(radius, angle, then=Stop.HOLD, wait=True)',
    params: ['radius', 'angle'],
    example: program(`robot.straight(300)
robot.curve(250, -90)   # wide curve to the left
robot.straight(200)`),
  },
  {
    id: 'settings',
    group: 'drive',
    signature: 'robot.settings(straight_speed, straight_acceleration, turn_rate, turn_acceleration)',
    params: ['straight_speed', 'straight_acceleration', 'turn_rate', 'turn_acceleration'],
    example: program(`print(robot.settings())
robot.settings(straight_speed=400)
robot.straight(600)   # faster
robot.settings(straight_speed=100)
robot.straight(-200)  # very slow`),
  },
  {
    id: 'drive',
    group: 'drive',
    signature: 'robot.drive(speed, turn_rate)  ·  robot.stop()',
    params: ['speed', 'turn_rate'],
    example: program(`robot.drive(200, 0)
wait(2000)       # drives for 2 seconds
robot.stop()`),
  },
  {
    id: 'distance',
    group: 'drive',
    signature: 'robot.distance()  ·  robot.angle()  ·  robot.reset()',
    example: program(`robot.reset()
robot.drive(250, 0)
while robot.distance() < 500:
    wait(10)
robot.stop()
print("distance:", robot.distance(), "mm")`),
  },
  {
    id: 'gyro',
    group: 'drive',
    signature: 'robot.use_gyro(True)',
    example: program(`robot.use_gyro(True)
robot.straight(500)
robot.turn(90)
print("heading:", hub.imu.heading())`),
  },
  {
    id: 'calibrate',
    group: 'drive',
    signature: 'wheel_diameter = 62.4 × measured / requested',
    example: program(`# Calibration test: drive 1000 mm and measure with a tape measure
robot.straight(1000)
wait(500)
# Then spin a full turn and check where the robot points
robot.turn(360)`),
  },
  {
    id: 'run-angle',
    group: 'arms',
    signature: 'motor.run_angle(speed, rotation_angle, then=Stop.HOLD, wait=True)',
    params: ['speed', 'rotation_angle', 'wait'],
    example: program(`left_arm.run_angle(500, 180)     # half a turn
left_arm.run_angle(500, -180)    # back
right_arm.run_angle(300, 90, wait=False)
robot.straight(300)              # drives while the arm turns`),
  },
  {
    id: 'claw',
    group: 'arms',
    signature: 'left_arm.run_angle(300, 90)  ·  left_arm.run_angle(300, -90)',
    example: program(`left_arm.run_angle(300, 90)    # open
robot.straight(500)
left_arm.run_angle(300, -90)   # close (grab the piece)
robot.straight(-500)`),
  },
  {
    id: 'run-target',
    group: 'arms',
    signature: 'motor.run_target(speed, target_angle)  ·  motor.reset_angle(0)',
    params: ['speed', 'target_angle'],
    example: program(`left_arm.reset_angle(0)
left_arm.run_target(500, 120)   # goes to 120
left_arm.run_target(500, 120)   # already there, does not move
left_arm.run_target(500, 0)     # back to zero
print(left_arm.angle())`),
  },
  {
    id: 'run-time',
    group: 'arms',
    signature: 'motor.run_time(speed, time)  ·  motor.run(speed)  ·  motor.stop()',
    params: ['speed', 'time'],
    example: program(`right_arm.run_time(600, 1500)
left_arm.run(300)
wait(1000)
left_arm.stop()
print(left_arm.angle())`),
  },
  {
    id: 'color',
    group: 'sensor',
    signature: 'sensor.color()',
    example: program(`robot.drive(200, 0)
while sensor.color() != Color.BLACK:
    wait(10)
robot.stop()
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
while robot.distance() < 1300:
    error = sensor.reflection() - target
    robot.drive(150, error * gain)
    wait(10)
robot.stop()`),
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
while robot.distance() < 1300:
    error = sensor.reflection() - target
    integral = integral + error
    derivative = error - last_error
    robot.drive(350, kp * error + ki * integral + kd * derivative)
    last_error = error
    wait(10)
robot.stop()`),
  },
  {
    id: 'imu',
    group: 'hub',
    signature: 'hub.imu.heading()  ·  hub.imu.reset_heading(0)',
    example: program(`hub.imu.reset_heading(0)
robot.turn(90)
print("heading:", hub.imu.heading())`),
  },
  {
    id: 'hub-io',
    group: 'hub',
    signature: 'hub.light.on(Color.GREEN)  ·  hub.display.text("Hi")  ·  hub.speaker.beep()',
    example: program(`hub.light.on(Color.RED)
robot.straight(300)
hub.light.on(Color.GREEN)
hub.speaker.beep(800, 200)
hub.display.number(7)`),
  },
  {
    id: 'wait',
    group: 'time',
    signature: 'wait(time)',
    params: ['time'],
    example: program(`left_arm.run(400)
wait(1500)
left_arm.stop()`),
  },
  {
    id: 'stopwatch',
    group: 'time',
    signature: 'watch = StopWatch()  ·  watch.time()  ·  watch.reset()',
    example: program(`watch = StopWatch()
robot.drive(200, 0)
while watch.time() < 2000:
    wait(10)
robot.stop()
print(watch.time(), "ms")`),
  },
  {
    id: 'variables',
    group: 'python',
    example: program(`distance = 400
speed = 300
robot.settings(straight_speed=speed)
robot.straight(distance)
robot.straight(-distance)`),
  },
  {
    id: 'for',
    group: 'python',
    signature: 'for i in range(n):',
    start: { x: 600, y: 250, h: 0 },
    example: program(`# 300 mm square
for i in range(4):
    robot.straight(300)
    robot.turn(-90)`),
  },
  {
    id: 'while',
    group: 'python',
    signature: 'while condition:',
    example: program(`robot.drive(150, 0)
while sensor.color() != Color.BLACK:
    wait(10)
robot.stop()`),
  },
  {
    id: 'if',
    group: 'python',
    example: program(`color = sensor.color()
if color == Color.RED:
    robot.turn(90)
elif color == Color.BLUE:
    robot.turn(-90)
else:
    robot.straight(100)`),
  },
  {
    id: 'def',
    group: 'python',
    example: program(`def red_mission():
    robot.straight(800)
    left_arm.run_angle(500, 90)
    robot.straight(-800)

def turn_and_drive(angle, distance):
    robot.turn(angle)
    robot.straight(distance)

red_mission()
turn_and_drive(-90, 300)`),
  },
];
