// Teaching content in English. Comments in code are already in English, so no translations are needed.
import type { ContentText } from './types';

export const TEXT: ContentText = {
  groups: {
    start: 'Getting started',
    drive: 'DriveBase (driving)',
    arms: 'Attachment motors',
    sensor: 'Color sensor',
    hub: 'Hub',
    time: 'Time',
    python: 'Python for robots',
  },

  topics: {
    structure: {
      title: 'Structure of a program',
      summary: 'Every Pybricks program has three parts: import what you need, create the devices (hub, motors, sensors and the DriveBase), and write the mission commands one below the other. The robot runs them from top to bottom.',
      tips: [
        'Create each device only once, at the start of the program.',
        'Lines starting with # are comments: the robot ignores them, but they help the team understand the code.',
        'The names left_motor, robot and sensor are our choice. You can use others, as long as you use the same name throughout the program.',
      ],
      mistakes: ['Forgetting an import causes a NameError: Python does not know what DriveBase or Port is.'],
    },
    motor: {
      title: 'Motor(): create a motor',
      summary: 'Creates the object that controls a motor plugged into a hub port (A to F). On the default BatControl robot the wheels are on ports A and B and the attachments on ports C and D.',
      params: [
        ['Port.A … Port.F', 'Hub port where the motor cable is plugged in.'],
        ['Direction', 'Which way counts as positive. The left wheel motor is mounted mirrored, so we use COUNTERCLOCKWISE on it.'],
        ['list', 'Gears between the motor and the output, e.g. [12, 36]. Optional.'],
      ],
      mistakes: [
        'Forgetting Direction.COUNTERCLOCKWISE on the left motor makes the robot spin in place instead of driving straight. Try it in the simulator.',
        'Using a port with no motor gives OSError: check the cable and the port.',
      ],
    },
    drivebase: {
      title: 'DriveBase(): combine the wheels',
      summary: 'The DriveBase controls both wheel motors together, so the robot drives in millimeters and turns in degrees. It needs to know the wheel size and the distance between the wheels.',
      params: [
        ['Motor', 'Left wheel motor.'],
        ['Motor', 'Right wheel motor.'],
        ['mm', 'Wheel diameter. The SPIKE Prime wheel is 56 mm.'],
        ['mm', 'Distance between the points where the two wheels touch the ground.'],
      ],
      tips: [
        'If the robot drives a bit more or less than requested, adjust wheel_diameter.',
        'If the robot turns a bit more or less, adjust axle_track. See the Calibration topic.',
      ],
    },
    straight: {
      title: 'straight(): drive straight',
      summary: 'Drives in a straight line for the given distance and stops. A positive number goes forward, a negative one goes backward.',
      params: [
        ['mm', 'How far to drive. 100 mm = 10 cm.'],
        ['Stop', 'What to do at the end: Stop.HOLD (hold, default), Stop.BRAKE or Stop.COAST.'],
        ['True/False', 'If True, the program waits until it finishes before the next line.'],
      ],
      tips: ['Measure on the mat: the ruler along the edge of the simulator mat has a mark every 100 mm. In the Simulate tab, the Ruler tool measures for you.'],
      mistakes: ['Thinking in centimeters: straight(40) only drives 4 cm.'],
    },
    turn: {
      title: 'turn(): turn in place',
      summary: 'Spins the robot in place, one wheel forward and the other backward. A positive angle turns right (clockwise) and a negative one turns left.',
      params: [
        ['degrees', 'How much to turn. 90 is a quarter turn, 180 is half a turn.'],
        ['Stop', 'How to stop at the end.'],
        ['True/False', 'Wait until it finishes before moving on.'],
      ],
      mistakes: ['Mixing up the sign: turn(90) goes right, not left.'],
    },
    strafe: {
      title: 'What about strafe (driving sideways)?',
      summary: 'The Pybricks DriveBase has no strafe. A typical FLL robot has two fixed drive wheels (differential drive) that only push forward and backward. Driving sideways only exists on robots with omni or mecanum wheels. To reach a point to the side, turn, drive and turn back.',
      tips: ['If you write robot.strafe(...), the simulator shows the same error the hub would: AttributeError.'],
    },
    curve: {
      title: 'curve(): drive along an arc',
      summary: 'Drives along an arc, like a car taking a bend. The radius says whether the curve is wide or tight and the angle says how much of the circle to drive. A positive angle curves to the right.',
      params: [
        ['mm', 'Circle radius. Positive drives forward, negative drives backward.'],
        ['degrees', 'How much of the circle to drive. 90 is a quarter circle.'],
      ],
      tips: ['Curves are faster than stopping, turning and driving, but they are harder to get exactly right. Use them when the mission needs a smooth path.'],
    },
    settings: {
      title: 'settings(): speed and acceleration',
      summary: 'Changes the speed and acceleration used by straight, turn and curve. With no arguments it returns the current values. Slower is usually more accurate.',
      params: [
        ['mm/s', 'Driving speed.'],
        ['mm/s²', 'How quickly it speeds up and slows down.'],
        ['deg/s', 'Turning speed.'],
        ['deg/s²', 'Turning acceleration.'],
      ],
      tips: ['In the simulator the default values are estimated from the SPIKE motor. On the real hub they may differ a little.'],
    },
    drive: {
      title: 'drive() and stop(): keep driving',
      summary: 'drive() starts the wheels and the program moves on to the next line right away, with the robot still moving. The robot only stops when you call robot.stop(). This is the basis for "drive until you see the black line" and for line followers.',
      params: [
        ['mm/s', 'Forward speed (negative = backward).'],
        ['deg/s', 'How much it turns while driving. 0 = straight, positive = right.'],
      ],
      mistakes: ['Calling drive() and forgetting to wait (wait or a loop): the program ends immediately and the robot does not even move.'],
    },
    distance: {
      title: 'distance(), angle() and reset()',
      summary: 'distance() says how many mm the robot has driven since the start (or since the last reset). angle() says how many degrees it has turned. reset() sets both to zero.',
      returns: 'Integers: mm and degrees.',
    },
    gyro: {
      title: 'use_gyro(): use the gyro',
      summary: 'Makes the DriveBase use the hub gyro to measure how much the robot turns, instead of only counting wheel rotations. On a real robot the wheels slip a little on every turn; with the gyro the DriveBase notices and corrects.',
      tips: [
        'Turn on Realistic mode in the Simulate tab: the wheels slip like on a real robot, and every run comes out slightly different. Compare with and without use_gyro(True).',
        'Keep the hub still for a moment before starting: the gyro calibrates itself while the robot is not moving.',
      ],
    },
    calibrate: {
      title: 'Calibration: wheel_diameter and axle_track',
      summary: 'Worn tires, slightly different wheels and the mat all change the real measurements. Calibrate like this: drive 1000 mm and measure with a tape measure. New wheel_diameter = current value × measured ÷ 1000. Then turn 360° and see how far the robot really turned. New axle_track = current value × 360 ÷ real turn.',
      tips: [
        'Simulate › Robot has a calibration calculator that does this math.',
        'Repeat the measurement three times and use the average: a single measurement can be misleading.',
        'Calibrate on the competition mat whenever you can.',
      ],
      mistakes: ['Getting the math backwards: if the robot drove MORE than requested, wheel_diameter must INCREASE (the wheel is bigger than the program thinks).'],
    },
    'run-angle': {
      title: 'run_angle(): turn an attachment',
      summary: 'Turns the motor by a number of degrees from where it is. It is the most common command for raising and lowering attachment arms. In the simulator, the attachments are the two gears on top of the robot.',
      params: [
        ['deg/s', 'Motor speed. Up to about 1000.'],
        ['degrees', 'How much to turn. 360 is a full turn; negative turns the other way.'],
        ['True/False', 'Use wait=False so the attachment turns while the robot drives.'],
      ],
    },
    claw: {
      title: 'Attachment example: claw',
      summary: 'The pincer claw is a simple attachment: one motor turns two gears that open and close the jaws together. In the simulator, add the claw in Simulate › Robot › Attachments. With the motor at 0° it is closed and at 90° it is fully open. Closing it with a crate between the jaws grabs the crate.',
      tips: [
        'Use run_target(300, 0) to close: the claw always returns to the same point, even if it started half open.',
        'On the real robot, mount the claw on a solid beam: if it wobbles, the pincer misses the piece.',
      ],
    },
    'run-target': {
      title: 'run_target() and reset_angle()',
      summary: 'run_target() moves the motor to an exact angle, counted from zero. It differs from run_angle(): no matter where the motor was, it always ends in the same place. reset_angle(0) sets the current position as zero.',
      params: [
        ['deg/s', 'Speed.'],
        ['degrees', 'Final angle.'],
      ],
    },
    'run-time': {
      title: 'run_time(), run() and stop()',
      summary: 'run_time() turns the motor for a time in milliseconds. run() starts the motor and does not stop on its own until you call stop(). angle() tells you the motor angle.',
      params: [
        ['deg/s', 'Speed.'],
        ['ms', 'How long to turn. 1000 ms = 1 second.'],
      ],
    },
    color: {
      title: 'color(): which color is below',
      summary: 'Reads the color of the mat below the sensor and returns a color such as Color.BLACK, Color.WHITE, Color.RED, Color.BLUE, Color.GREEN or Color.YELLOW. In the simulator, the red dot on the floor shows where the sensor reads.',
      returns: 'A color (Color.X). Compare with ==.',
      mistakes: ['Comparing with the text "BLACK": the right way is Color.BLACK, without quotes.'],
    },
    reflection: {
      title: 'reflection(): how much light comes back',
      summary: 'Measures how much light the mat reflects, from 0 to 100. Black is around 7 and white around 96. On the edge of the line the value is in between, and that is what a line follower uses.',
      returns: 'A number from 0 to 100.',
      tips: ['Start slow and tune the gain: too high makes the robot zigzag, too low makes it miss the curve.'],
    },
    pid: {
      title: 'PID line follower',
      summary: 'PID control adds up three corrections. P (proportional) turns more the bigger the error. I (integral) fixes an error that always stays on the same side. D (derivative) looks at how fast the error is changing and eases off the correction before overshooting, which removes the zigzag. In FLL, P and D solve almost everything.',
      tips: [
        'Tune in this order: start with kd = 0 and ki = 0, raise kp until the robot follows the curve, then raise kd until the zigzag stops.',
        'Change one number at a time and write down what happened.',
        'More speed needs more kd.',
      ],
      mistakes: ['Forgetting to update last_error at the end of the loop: the derivative is always wrong.'],
    },
    imu: {
      title: 'hub.imu.heading(): where the robot points',
      summary: 'The hub gyro tells how many degrees the robot has turned since the start. Turning right increases the value.',
      returns: 'Degrees.',
    },
    'hub-io': {
      title: 'Hub light, display and sound',
      summary: 'Use the button light, the 5×5 display and the speaker to show what the robot is doing. It helps a lot when testing: a beep tells you a step has finished.',
    },
    wait: {
      title: 'wait(): pause',
      summary: 'Pauses the program for a time in milliseconds. Motors that were running keep running.',
      params: [['ms', '1000 ms = 1 second.']],
      tips: ['Inside loops, a wait(10) gives the hub time and keeps readings stable.'],
    },
    stopwatch: {
      title: 'StopWatch(): timer',
      summary: 'A stopwatch in milliseconds. Useful to limit how long a step can take. An FLL match lasts 2 min 30 s (150000 ms).',
    },
    variables: {
      title: 'Variables',
      summary: 'A variable stores a value under a name. That way you change a number in one place instead of hunting through the whole program.',
    },
    for: {
      title: 'for: repeat a number of times',
      summary: 'Repeats the indented block (4 spaces) n times. range(4) counts 0, 1, 2, 3.',
      mistakes: ['Forgetting the colon at the end of the for line, or forgetting to indent the block.'],
    },
    while: {
      title: 'while: repeat while true',
      summary: 'Repeats the block while the condition is true. Used for "drive until you see the line" or "turn until the heading is right".',
    },
    if: {
      title: 'if, elif and else: decide',
      summary: 'Runs a block only if the condition is true. Use elif to test another condition and else for "otherwise".',
    },
    def: {
      title: 'def: create your own functions',
      summary: 'A function gives a name to a group of commands. In FLL it is common to have one function per mission and call them all in sequence. That way you can test each mission on its own and change the order without rewriting anything.',
    },
  },

  units: {
    u1: { title: 'Meet Pybricks', desc: 'What a program is and how the robot shows up in code.' },
    u2: { title: 'Drive and turn', desc: 'straight() and turn(): the two most used commands in FLL.' },
    u3: { title: 'Curves and speed', desc: 'curve() for smooth paths and settings() to set the pace.' },
    u4: { title: 'Attachments', desc: 'Motors on ports C and D, which move the mission attachments.' },
    u5: { title: 'Color sensor', desc: 'Stop on the black line and follow a line.' },
    u6: { title: 'Programming logic', desc: 'Repeat with for, decide with if and organize missions with def.' },
    u7: { title: 'Full mission', desc: 'Put it all together in a real run, within match time.' },
    u8: { title: 'Precision', desc: 'Gyro and calibration: the real robot is not as perfect as on paper.' },
    u9: { title: 'PID follower', desc: 'Follow the line fast without zigzagging.' },
    u10: { title: 'Mission functions', desc: 'Push and grab objects, each mission in its own function.' },
    u11: { title: 'Debugging', desc: 'Read errors, investigate with print and fix programs.' },
    u12: { title: 'Competition strategy', desc: 'BASE 2, speed against the clock and full runs.' },
  },

  lessons: {
    u1l1: {
      title: 'First program',
      intro: 'Pybricks is Python running inside the SPIKE Prime hub. The robot runs the program from top to bottom, one line at a time.\n\nTo drive we use the DriveBase, which in this course is called robot. The command robot.straight(300) drives 300 millimeters forward.',
      ex: [
        { prompt: 'Which language do we use to write Pybricks programs?', options: ['Python', 'Scratch blocks', 'C++', 'JavaScript'], explain: 'Pybricks uses MicroPython, a version of Python made for small boards like the hub.' },
        { prompt: 'In which unit does straight() measure distance?', options: ['Millimeters', 'Centimeters', 'Wheel rotations', 'Seconds'], explain: 'Every distance in Pybricks is in mm. 30 cm = 300 mm.' },
        { prompt: 'Complete so the robot drives 300 mm forward.', explain: 'straight means going in a straight line.' },
        { prompt: 'Make the robot drive 300 mm forward.', hint: 'Use robot.straight(300) below the comment.' },
      ],
    },
    u1l2: {
      title: 'The robot in code',
      intro: 'Before telling the robot to drive, the program needs to know what is plugged into each port. On the default BatControl robot:\n\nPort A: left wheel. Port B: right wheel. Ports C and D: attachment motors. Port E: color sensor.\n\nThe left motor is mounted mirrored, so it gets Direction.COUNTERCLOCKWISE so that "positive" means "forward" on both wheels.',
      ex: [
        { prompt: 'Which ports are the wheel motors of the default robot on?', options: ['A and B', 'C and D', 'E and F', 'A and C'], explain: 'Wheels on A and B, attachments on C and D, color sensor on E.' },
        { prompt: 'Why does the left motor use Direction.COUNTERCLOCKWISE?', options: ['Because it is mounted mirrored compared to the right one', 'To make the robot faster', 'Because the hub only accepts one normal motor', 'To drive sideways'], explain: 'The two motors face each other. Without reversing one of them, the wheels spin in opposite directions and the robot turns in place.' },
        { prompt: 'The SPIKE Prime wheel is 56 mm in diameter. Complete:', explain: 'wheel_diameter is the wheel diameter in mm.' },
        { prompt: 'Put the lines in the right order (the imports are already there).', explain: 'First we create the motors, then the DriveBase that uses them, and only then give commands.' },
        { prompt: 'This program makes the robot spin in place instead of driving 400 mm. Run it to see the problem and fix how the motors are created.', hint: 'The motor on port A needs Direction.COUNTERCLOCKWISE.' },
      ],
    },
    u2l1: {
      title: 'Driving straight',
      intro: 'straight(distance) drives in a straight line and stops. A positive number goes forward; a negative one goes backward.\n\nOn the simulator mat, the edge has a ruler every 100 mm. The start is inside BASE 1, with the center of the robot at x = 120 mm.',
      ex: [
        { prompt: 'What does robot.straight(-200) do?', options: ['Drives 200 mm backward', 'Drives 200 mm forward', 'Turns 200 degrees', 'Gives an error, negative numbers are not allowed'], explain: 'A negative distance drives backward.' },
        { prompt: 'How much is 25 cm in millimeters?', options: ['250', '25', '2500', '2.5'], explain: '1 cm = 10 mm, so 25 cm = 250 mm.' },
        { prompt: 'Take the robot to the red zone. Its center is 800 mm in front of the start.', hint: 'A single robot.straight() with the right distance does it.' },
      ],
    },
    u2l2: {
      title: 'Turning',
      intro: 'turn(angle) turns the robot in place. Positive turns right (clockwise), negative turns left.\n\nA quarter turn is 90 degrees and half a turn is 180.',
      ex: [
        { prompt: 'Which way does the robot go with robot.turn(90)?', options: ['Right', 'Left', 'Forward', 'It depends on the port'], explain: 'Positive angle = clockwise = right.' },
        { prompt: 'Which command makes the robot turn around?', options: ['robot.turn(180)', 'robot.turn(90)', 'robot.turn(360)', 'robot.straight(-180)'], explain: 'Turning around is 180 degrees. 360 is a full turn, and the robot ends up facing the same way.' },
        { prompt: 'Complete to make a quarter turn to the left.', explain: 'Left is negative: -90.' },
        { prompt: 'Take the robot to the yellow zone. Measurements: drive 800 mm, turn left and drive another 640 mm.', hint: 'straight(800), then turn(-90), then straight(640).' },
      ],
    },
    u2l3: {
      title: 'Is there strafe?',
      intro: 'Some people look for a strafe() command to drive sideways. The Pybricks DriveBase does not have one: the robot has two fixed wheels that only push forward and backward (differential drive).\n\nTo reach a point to the side: turn, drive and turn back.',
      ex: [
        { prompt: 'What happens if the program calls robot.strafe(100)?', options: ['An error: the DriveBase has no strafe', 'The robot drives 100 mm sideways', 'The robot turns 100 degrees', 'The robot drives 100 mm forward'], explain: 'The hub shows AttributeError, just like the simulator. Driving sideways only exists with omni or mecanum wheels.' },
        { prompt: 'Build the path to "go 300 mm to the left" and end up facing forward again.', explain: 'Turn, drive and turn back replaces strafe.' },
        { prompt: 'Finish inside the yellow zone, but facing the right side of the mat, like at the start.', hint: 'Use the path from the previous lesson and add a turn(90) at the end.' },
      ],
    },
    u3l1: {
      title: 'Curves',
      intro: 'curve(radius, angle) drives along a circular arc. A large radius makes a wide curve, a small radius a tight one. A positive angle curves right.\n\nA curve with radius 300 and angle -90 moves the robot 300 mm forward and 300 mm to the left.',
      ex: [
        { prompt: 'Which of these curves is the tightest?', options: ['robot.curve(100, 90)', 'robot.curve(400, 90)', 'robot.curve(800, 90)', 'They are all the same'], explain: 'The smaller the radius, the tighter the curve.' },
        { prompt: 'Complete to drive a quarter circle to the left with a 300 mm radius.', explain: 'Left is negative and a quarter circle is 90 degrees.' },
        { prompt: 'Reach the yellow zone using a curve() on the way, without turn().', hint: 'Drive 500 mm, do curve(300, -90) and drive another 340 mm.' },
      ],
    },
    u3l2: {
      title: 'Speed',
      intro: 'robot.settings() changes the speed of straight, turn and curve. For example, robot.settings(straight_speed=400) drives at 400 mm/s.\n\nFaster saves match time, slower is usually more accurate.',
      ex: [
        { prompt: 'Which unit is straight_speed in?', options: ['mm/s', 'deg/s', 'cm/s', 'revolutions per minute'], explain: 'Driving speed is in millimeters per second.' },
        { prompt: 'Complete to drive at 400 mm/s.', explain: 'straight_speed controls the speed in a straight line.' },
        { prompt: 'Reach the blue zone (1400 mm ahead) in under 6 seconds. At the default speed the robot cannot make it.', hint: 'Put robot.settings(straight_speed=400) before straight.' },
      ],
    },
    u4l1: {
      title: 'run_angle()',
      intro: 'Attachments are moved by the motors on ports C and D. In the simulator they are the two gears on top of the robot.\n\nleft_arm.run_angle(500, 180) turns the left attachment 180 degrees at 500 degrees per second.',
      ex: [
        { prompt: 'In left_arm.run_angle(500, 90), what is the 500?', options: ['The speed, in degrees per second', 'The angle, in degrees', 'The time, in milliseconds', 'The motor power'], explain: 'Speed comes first, then the angle.' },
        { prompt: 'Complete to turn the right attachment one full turn.', explain: 'A full turn is 360 degrees.' },
        { prompt: 'Turn the left attachment half a turn and then bring it back to the starting position.', hint: 'Two lines: left_arm.run_angle(500, 180) and left_arm.run_angle(500, -180).' },
      ],
    },
    u4l2: {
      title: 'Attachment and robot together',
      intro: 'By default each command waits until it is done before the next line. With wait=False the command starts and the program moves on right away.\n\nThat way the attachment can rise while the robot drives, saving precious match seconds.\n\nrun_target(speed, angle) moves the motor to an exact angle, counted from zero.',
      ex: [
        { prompt: 'What does wait=False do in right_arm.run_angle(500, 90, wait=False)?', options: ['Starts turning and the program continues without waiting', 'Does not turn the motor', 'Turns the motor forever', 'Waits 90 ms before turning'], explain: 'The motor turns in parallel with the next lines.' },
        { prompt: 'The attachment is at 30°. Where does it go with run_target(500, 90)?', options: ['To 90°', 'To 120°', 'To 60°', 'It stays at 30°'], explain: 'run_target goes to the target angle no matter where it was. run_angle(500, 90) would go to 120°.' },
        { prompt: 'Go to the red zone and, at the same time, turn the right attachment 90°. All in under 4.6 seconds.', hint: 'right_arm.run_angle(500, 90, wait=False) and then robot.straight(800).' },
      ],
    },
    u5l1: {
      title: 'Stop on the line',
      intro: 'sensor.color() tells you the color of the mat below the sensor: Color.BLACK, Color.WHITE, Color.RED...\n\nTo drive until a color shows up: start the wheels with robot.drive(speed, 0), wait in a while loop until the color appears and call robot.stop().\n\nIn the simulator, the red dot on the floor shows where the sensor reads.',
      ex: [
        { prompt: 'What is the right way to check whether the sensor sees black?', options: ['sensor.color() == Color.BLACK', 'sensor.color() == "BLACK"', 'sensor.color = Color.BLACK', 'sensor.black()'], explain: 'Compare with == and use the Pybricks color (Color.BLACK), without quotes.' },
        { prompt: 'Complete to drive until the black line is found.', explain: 'While the color is different (!=) from black, keep driving.' },
        { prompt: 'Drive to the black STOP strip and stop on it. On the way the sensor crosses the red zone: the robot must not stop there.', hint: 'robot.drive(200, 0), then while sensor.color() != Color.BLACK: wait(10), then robot.stop().' },
      ],
    },
    u5l2: {
      title: 'Line follower',
      intro: 'sensor.reflection() measures from 0 to 100 how much light comes back: black is around 7 and white around 96. On the edge of the line it is in between, around 50.\n\nThe proportional follower computes error = reflection() - 50 and turns the robot in proportion to the error: robot.drive(150, error * gain). It drives along the edge of the line, correcting all the time.',
      ex: [
        { prompt: 'The sensor is fully over black. Which reflection() value is most likely?', options: ['Around 7', 'Around 50', 'Around 96', 'Exactly 100'], explain: 'Black reflects little light.' },
        { prompt: 'The robot zigzags a lot over the line. What usually helps?', options: ['Lower the gain', 'Raise the gain', 'Remove the wait(10)', 'Use turn() instead of drive()'], explain: 'A high gain exaggerates the corrections. Lower it gradually (and the speed too, if needed).' },
        { prompt: 'The robot already starts with the sensor on the edge of the line. Complete the line follower so it drives the straight part and the curve to the end of the line.', hint: 'Inside the while loop, replace the comment with robot.drive(150, error * gain).' },
      ],
    },
    u6l1: {
      title: 'Loops',
      intro: 'for i in range(4): repeats the indented block 4 times. The block is everything indented 4 extra spaces below the for.\n\nDo not forget the colon at the end of the line.',
      ex: [
        { prompt: 'How many times does the block of for i in range(3): run?', options: ['3', '2', '4', 'Forever'], explain: 'range(3) counts 0, 1 and 2: three times.' },
        { prompt: 'Complete to repeat 4 times.', explain: 'range(4) generates the numbers 0 to 3.' },
        { prompt: 'Drive a square with 300 mm sides using for, and finish where you started. The robot starts outside the base, with free space ahead and to the left.', hint: 'for i in range(4): and, inside, robot.straight(300) and robot.turn(-90).' },
      ],
    },
    u6l2: {
      title: 'Functions',
      intro: 'def creates a function: a name for a group of commands. In FLL it is common to have one function per mission.\n\nFunctions can receive values, like def go_and_back(distance):. Inside it, distance holds whatever was passed in the call.',
      ex: [
        { prompt: 'What happens when Python reads the line def mission():?', options: ['It only stores the function; it runs when called with mission()', 'It runs the function right away', 'It gives an error if the function is never used', 'It repeats the function forever'], explain: 'Defining is not running. It only runs when you call mission().' },
        { prompt: 'Put the function and the call in the right order.', explain: 'First the definition with its indented block, then the call outside the block.' },
        { prompt: 'Create the function go_and_back(distance) and use it to visit the red zone and return to the start.', hint: 'Inside the function: robot.straight(distance) and robot.straight(-distance). Outside: go_and_back(800).' },
      ],
    },
    u7l1: {
      title: 'Leaving the base',
      intro: 'In an FLL match the robot leaves the base, completes missions and comes back. You have 2 minutes and 30 seconds for all runs.\n\nThis challenge has no measurement hints: use the ruler on the edge of the mat. The center of the blue zone is at x = 1600 mm and the green zone at x = 2150, y = 860.',
      ex: [
        { prompt: 'How long is an FLL Challenge match?', options: ['2 min 30 s', '1 min', '5 min', '10 min'], explain: '150 seconds. That is why every second saved counts.' },
        { prompt: 'Pass through the blue zone, then the green zone, and finish back inside BASE 1.', hint: 'One solution: faster settings, straight(1480), turn(-49), straight(844) and come back the same way in reverse.' },
      ],
    },
    u8l1: {
      title: 'Gyro',
      intro: 'On a real robot the wheels slip a little on every turn and one wheel is never identical to the other. A 2° error on each turn becomes a big error by the end of a run.\n\nrobot.use_gyro(True) makes the DriveBase measure turning with the hub gyro and correct by itself.\n\nIn this challenge the simulator is in realistic mode: the wheels slip like on a real robot.',
      ex: [
        { prompt: 'Why does the real robot miss its turns even with the right program?', options: ['The wheels slip and are not identical', 'Python rounds the numbers', 'The hub only turns in steps of 10 degrees', 'The battery changes the requested angle'], explain: 'The DriveBase counts turning by the wheels. If they slip, the count does not match the real turn.' },
        { prompt: 'What does the gyro measure?', options: ['How much the robot really turned', 'The mat color', 'The distance to the wall', 'The wheel speed'], explain: 'The gyro senses the rotation of the hub itself, so it does not depend on the wheels.' },
        { prompt: 'Complete to turn on the gyro in the DriveBase.', explain: 'use_gyro(True) turns it on, use_gyro(False) turns it off.' },
        { prompt: 'Run the program as it is: after two laps of the square the robot does not return to the start. Turn on the gyro so it comes back exactly.', hint: 'Add robot.use_gyro(True) before the for.' },
      ],
    },
    u8l2: {
      title: 'Calibration',
      intro: 'The program only knows what you tell it. If the real wheel is slightly larger than 56 mm, the robot drives further than requested.\n\nTo calibrate: drive 1000 mm and measure. New wheel_diameter = current × measured ÷ 1000.\n\nFor turning: turn 360° and see how much it turned. New axle_track = current × 360 ÷ real turn.',
      ex: [
        { prompt: 'The robot should drive 1000 mm but drove 980 mm. What do you do with wheel_diameter?', options: ['Decrease it', 'Increase it', 'Keep it and change axle_track', 'Flip the sign'], explain: 'It drove less, so the real wheel is smaller than the program thinks: decrease it (56 × 980 ÷ 1000 = 54.9).' },
        { prompt: 'I asked for turn(360) and the robot only turned 350°. What do you do with axle_track?', options: ['Increase it', 'Decrease it', 'Keep it', 'Set it to zero'], explain: 'To turn more, the DriveBase must believe the wheels are further apart: 140 × 360 ÷ 350 = 144.' },
        { prompt: 'With wheel_diameter=56 the robot drove 1025 mm when I asked for 1000 mm. Fill in the new value (56 × 1025 ÷ 1000):', explain: '56 × 1.025 = 57.4 mm.' },
      ],
    },
    u9l1: {
      title: 'P and D',
      intro: 'To follow the line fast the proportional gain (kp) must be high, but then the robot overshoots and zigzags.\n\nThe D term looks at how much the error changed since the last reading: derivative = error - last_error. If the error is shrinking fast, D eases off the correction before overshooting.\n\nturn_rate = kp × error + kd × derivative',
      ex: [
        { prompt: 'What is the D (derivative) term for?', options: ['Easing off the correction before overshooting', 'Driving faster', 'Measuring the line color', 'Stopping the robot at the end'], explain: 'D reacts to how fast the error changes and damps the zigzag.' },
        { prompt: 'What is the recommended order to tune a PID in FLL?', options: ['First kp, then kd, ki last (if needed)', 'First ki, then kp', 'All at once', 'First kd, then kp'], explain: 'kp makes it follow, kd removes the zigzag and ki is rarely needed in a line follower.' },
        { prompt: 'At 400 mm/s, with kp = 6 and no D, the robot zigzags off the line. Tune the gains so it reaches the end of the line within 4 seconds.', hint: 'Keep kp = 6 and set kd = 8.' },
      ],
    },
    u10l1: {
      title: 'Push with a function',
      intro: 'Many FLL missions are about pushing an object to a place. The robot bumper pushes whatever is in front of it.\n\nPut each mission in a function with a clear name, like push_crate(). That way you can test one mission on its own and build the match by calling the functions in sequence.',
      ex: [
        { prompt: 'Why put each mission in its own function?', options: ['To test each one alone and change the order easily', 'Because Pybricks requires it', 'To make the robot faster', 'To save battery'], explain: 'Functions keep the program organized: you change one mission without breaking the others.' },
        { prompt: 'Complete push_crate() to push the orange crate into the blue zone and come back to BASE 1.', hint: 'The crate center must end between x = 1500 and 1700. Try robot.straight(1300) and then robot.straight(-1300).' },
      ],
    },
    u10l2: {
      title: 'Grab with the claw',
      intro: 'In this challenge the robot has the claw on the left side (port C). With the motor at 90° it is open and at 0° closed.\n\nTo grab: open, arrive with the crate between the jaws and close. To release, open again.\n\nThe center of the claw is 214 mm ahead and 46 mm to the left of the robot center.',
      ex: [
        { prompt: 'What happens if the claw closes with nothing between the jaws?', options: ['It closes empty and the robot moves on without the crate', 'The program gives an error', 'The robot stops', 'The crate comes to the claw'], explain: 'The claw only grabs what is between the jaws when it closes.' },
        { prompt: 'Use open_claw() and close_claw() to grab the blue crate and bring it inside BASE 1.', hint: 'open_claw(), robot.straight(466), close_claw(), robot.straight(-466).' },
      ],
    },
    u1l3: {
      title: 'Errors and comments',
      intro: 'Lines that start with # are comments: notes for the team that the robot ignores.\n\nWhen something is wrong, the program stops and shows an error with the line number. A misspelled command, such as robot.straigth(), gives AttributeError: the DriveBase has no command with that name.',
      ex: [
        { prompt: 'What does the robot do with a line that starts with #?', options: ['Ignores it: it is a comment', 'Runs it twice', 'Stops the program with an error', 'Beeps'], explain: 'Comments explain the code to people. The robot skips them.' },
        { prompt: 'robot.straigth(300) gives an error. Why?', options: ['The command name is misspelled', 'The number is too big', 'Parentheses are not allowed', 'The robot needs a comment first'], explain: 'The right name is straight. Python only knows the exact name.' },
        { prompt: 'This program stops with an error. Run it, read the message and fix it so the robot drives 500 mm.', hint: 'Look at how straight is written.' },
      ],
    },
    u1l4: {
      title: 'Light and sound',
      intro: 'The hub has a light on the center button and a speaker. hub.light.on(Color.GREEN) turns the light green and hub.speaker.beep() makes a short beep.\n\nThey help in testing: a beep tells you a step has finished, and the light can show which mission the robot is on.',
      ex: [
        { prompt: 'Which command makes the hub beep?', options: ['hub.speaker.beep()', 'hub.light.beep()', 'robot.beep()', 'hub.display.beep()'], explain: 'The sound comes from the speaker: hub.speaker.' },
        { prompt: 'Complete to turn the light green.', explain: 'Colors use Color and the name in capitals.' },
        { prompt: 'Turn the light green, drive 300 mm and beep at the end.', hint: 'hub.light.on(Color.GREEN), robot.straight(300), hub.speaker.beep().' },
      ],
    },
    u2l4: {
      title: 'Backing up',
      intro: 'Many missions only need the robot to go and come back the same way. Instead of turning around, drive backward with a negative distance: robot.straight(-800) undoes robot.straight(800).\n\nIt is faster and the robot returns facing the same way.',
      ex: [
        { prompt: 'The robot drove robot.straight(800). Which command brings it back to the start without turning?', options: ['robot.straight(-800)', 'robot.turn(180)', 'robot.straight(800)', 'robot.turn(-800)'], explain: 'A negative distance drives backward over the same path.' },
        { prompt: 'Visit the red zone and come back into BASE 1 without turning.', hint: 'robot.straight(800) and robot.straight(-800).' },
      ],
    },
    u2l5: {
      title: 'Turning around',
      intro: 'Turning around is a half turn: robot.turn(180) or robot.turn(-180). Both end facing the opposite way; they only spin in different directions.\n\nAfter turning around, positive distances drive back toward where the robot came from.',
      ex: [
        { prompt: 'Complete so the robot turns around.', explain: '180 or -180: half a turn to either side.' },
        { prompt: 'After robot.turn(180), what does robot.straight(300) do?', options: ['Drives 300 mm back toward where it came from', 'Drives 300 mm backward', 'Turns another 300 degrees', 'Drives sideways'], explain: 'The robot now faces the other way, so forward is back toward the start.' },
        { prompt: 'Go to the red zone, turn around and come back into BASE 1 driving forward.', hint: 'straight(800), turn(180), straight(800).' },
      ],
    },
    u2l6: {
      title: 'Diagonals',
      intro: 'The shortest path is a straight line. To go straight to a point, turn toward it and drive the diagonal distance.\n\nIf the point is a mm ahead and b mm to the side, the distance is √(a² + b²) (Pythagoras). The angle is atan(b ÷ a). The Ruler tool in Simulate does this math for you.',
      ex: [
        { prompt: 'A point is 600 mm ahead and 800 mm to the left. How far is it in a straight line?', options: ['1000 mm', '1400 mm', '200 mm', '700 mm'], explain: '√(600² + 800²) = √1,000,000 = 1000 mm.' },
        { prompt: 'Why is the diagonal usually better than "straight, turn, straight"?', options: ['It is shorter and has fewer movements', 'It is always more accurate', 'Pybricks requires it', 'It uses less battery on the hub'], explain: 'Fewer movements and a shorter path save time. Each turn also adds a small error.' },
        { prompt: 'Reach the yellow zone with exactly one turn() and one straight(). The center of the zone is 800 mm ahead and 640 mm to the left.', hint: 'Angle: atan(640 ÷ 800) = 38.7° to the left. Distance: √(800² + 640²) = 1024 mm.' },
      ],
    },
    u3l3: {
      title: 'S-curve',
      intro: 'Two curves in opposite directions make an S. robot.curve(300, -90) followed by robot.curve(300, 90) moves the robot 600 mm forward and 600 mm to the left, and it ends facing the same way as at the start.\n\nIt is a smooth way to change lanes without stopping.',
      ex: [
        { prompt: 'After robot.curve(300, -90) and then robot.curve(300, 90), which way does the robot face?', options: ['The same way as at the start', 'Left', 'Right', 'Backward'], explain: 'One curve turns 90° left and the other 90° right: they cancel out.' },
        { prompt: 'Reach the yellow zone with two curves and end facing right, like at the start.', hint: 'curve(300, -90), curve(300, 90) and then straight(200).' },
      ],
    },
    u3l4: {
      title: 'Turning speed',
      intro: 'settings() also changes the turning speed with turn_rate, in degrees per second. robot.settings(turn_rate=400) makes turn() spin faster.\n\nFast turns save time, but on the real robot they slip more. Test on the mat.',
      ex: [
        { prompt: 'Which setting changes how fast turn() spins?', options: ['turn_rate', 'straight_speed', 'axle_track', 'wheel_diameter'], explain: 'turn_rate is the turning speed in degrees per second.' },
        { prompt: 'Complete to make turns faster.', explain: 'turn_rate=400 means 400 degrees per second.' },
        { prompt: 'Spin a full turn (360°) in under 2 seconds. At the default speed it takes 2.5 s.', hint: 'Put robot.settings(turn_rate=400) before the turn.' },
      ],
    },
    u4l3: {
      title: 'Exact angle',
      intro: 'run_angle() adds to wherever the motor is, so small errors pile up. run_target(speed, angle) goes to an exact angle counted from zero, no matter where the motor started.\n\nreset_angle(0) sets the current position as the new zero.',
      ex: [
        { prompt: 'What does left_arm.reset_angle(0) do?', options: ['Sets the current position as zero', 'Turns the motor back to zero', 'Stops the motor', 'Turns 0 degrees'], explain: 'It does not move anything: it only changes the reference.' },
        { prompt: 'The attachment has already moved to 105°. Make it end at exactly 120°.', hint: 'left_arm.run_target(500, 120).' },
      ],
    },
    u4l4: {
      title: 'Two attachments at once',
      intro: 'If the first command waits until it finishes, the second attachment only starts afterward. With wait=False on the first one, both move together and you save time.',
      ex: [
        { prompt: 'How do you move two attachments at the same time?', options: ['wait=False on the first command', 'wait=False on both commands', 'Write both on the same line', 'It is not possible in Pybricks'], explain: 'The first one starts and the program goes on to the second. The second, without wait=False, waits until it finishes.' },
        { prompt: 'Turn both attachments 180° in under 0.8 seconds.', hint: 'left_arm.run_angle(500, 180, wait=False) and right_arm.run_angle(500, 180).' },
      ],
    },
    u5l3: {
      title: 'Stop on a color',
      intro: 'The same loop that stops on black works for any color: just change the color in the condition.\n\nThe sensor is in front of the robot center and slightly to the left, so the robot stops when the sensor (not the center) reaches the color.',
      ex: [
        { prompt: 'Complete to stop on the red zone.', explain: 'Color.RED is red.' },
        { prompt: 'The robot stopped with the sensor on red, but the robot center is still before the zone. Why?', options: ['The sensor is in front of the robot center', 'The sensor is broken', 'Red is not detected', 'The robot drove backward'], explain: 'The sensor reads the floor in front of the robot. Keep that in mind when planning where to stop.' },
        { prompt: 'Drive until the sensor finds the red zone and stop there.', hint: 'robot.drive(200, 0), while sensor.color() != Color.RED: wait(10), robot.stop().' },
      ],
    },
    u5l4: {
      title: 'Stop with reflection',
      intro: 'reflection() gives a number, so you can choose a limit. Black is around 7: while sensor.reflection() > 20, the robot is not on black yet.\n\nThis is useful when the colors on the official mat are not exactly the ones color() knows.',
      ex: [
        { prompt: 'To stop on black using reflection(), which condition keeps the robot driving?', options: ['while sensor.reflection() > 20:', 'while sensor.reflection() < 20:', 'while sensor.reflection() == 100:', 'while sensor.color() > 20:'], explain: 'While the value is high (light floor), keep driving. It drops below 20 on black.' },
        { prompt: 'Stop on the black STOP strip using sensor.reflection().', hint: 'robot.drive(200, 0), while sensor.reflection() > 20: wait(10), robot.stop().' },
      ],
    },
    u5l5: {
      title: 'One color, then another',
      intro: 'You can wait for one thing and then for another: one while loop after the other. The robot keeps driving the whole time, because drive() only stops with stop().\n\nThat way the robot can use a mark on the mat as a checkpoint before the final stop.',
      ex: [
        { prompt: 'Put the program in order: drive, wait for red, then wait for black and stop.', explain: 'The two loops run one after the other while the robot keeps driving.' },
        { prompt: 'Drive, first wait for the red zone, then for the black STOP strip, and stop on it.', hint: 'Two loops: while sensor.color() != Color.RED and while sensor.color() != Color.BLACK.' },
      ],
    },
    u6l3: {
      title: 'Repeat while',
      intro: 'while repeats while a condition is true. Together with drive() it stops the robot at the right moment: robot.drive(200, 0), then while robot.distance() < 600: wait(10), then robot.stop().\n\ndistance() is updated while the robot drives.',
      ex: [
        { prompt: 'When does while robot.distance() < 600: stop repeating?', options: ['When the robot has driven 600 mm or more', 'Never', 'After 600 repeats', 'Right away'], explain: 'The condition becomes false at 600 mm and the program moves on.' },
        { prompt: 'Use drive() and a while loop to stop the robot after 600 mm.', hint: 'while robot.distance() < 600: and, inside, wait(10).' },
      ],
    },
    u6l4: {
      title: 'Decide with if',
      intro: 'if runs a block only when the condition is true; else runs when it is false. The robot can decide what to do based on the sensor.\n\nExample: if sensor.color() == Color.RED: robot.turn(-90) else: robot.turn(90).',
      ex: [
        { prompt: 'What does this program print?', options: ['A', 'B', 'A and B', 'Nothing'], explain: '5 > 3 is true, so only the if block runs.' },
        { prompt: 'After driving 700 mm, if the sensor sees red, turn left; otherwise, turn right. Then drive 400 mm.', hint: 'if sensor.color() == Color.RED: robot.turn(-90), else: robot.turn(90).' },
      ],
    },
    u6l5: {
      title: 'Lists',
      intro: 'A list keeps several values in order: moves = [800, 640]. moves[0] is the first one, moves[1] the second.\n\nfor goes through each item of the list. A list of pairs (distance, angle) describes a whole path in one line.',
      ex: [
        { prompt: 'With moves = [800, 640], what is moves[1]?', options: ['640', '800', '1440', 'An error'], explain: 'Counting starts at 0: moves[0] is 800 and moves[1] is 640.' },
        { prompt: 'Complete to drive each distance of the list.', explain: 'for gives each value of the list to distance, one at a time.' },
        { prompt: 'Complete the loop to follow the list of moves and reach the yellow zone.', hint: 'Inside the for: robot.straight(distance) and robot.turn(angle).' },
      ],
    },
    u6l6: {
      title: 'Functions that return',
      intro: 'A function can calculate a value and give it back with return. def mm(cm): return cm * 10 turns centimeters into millimeters.\n\nThe call mm(80) is replaced by the result, 800.',
      ex: [
        { prompt: 'Complete so the function gives back the value in millimeters.', explain: 'return sends the result back to whoever called the function.' },
        { prompt: 'What does this program print?', options: ['9', '8', '10', 'double(4) + 1'], explain: 'double(4) returns 8, plus 1 gives 9.' },
        { prompt: 'Use mm() to drive 80 cm and reach the red zone.', hint: 'robot.straight(mm(80)).' },
      ],
    },
    u6l7: {
      title: 'Leave a loop with break',
      intro: 'while True: repeats forever. break leaves the loop at once, so you can decide inside the loop when to stop.\n\nIt is useful when there are several reasons to stop.',
      ex: [
        { prompt: 'What does this program print?', options: ['0, 1 and 2', '0, 1, 2 and 3', 'Only 3', 'Nothing'], explain: 'When i is 3, break leaves the loop before the print.' },
        { prompt: 'Complete the loop so the robot stops on the black STOP strip using break.', hint: 'if sensor.color() == Color.BLACK: break.' },
      ],
    },
    u7l2: {
      title: 'Base to base',
      intro: 'The training mat has two bases, one on each side, like the launch areas on the FLL table. BASE 2 is on the right, at the other end of the mat.\n\nCrossing the whole mat takes time: use settings() to go faster.',
      ex: [
        { prompt: 'How many bases does the BatControl training mat have?', options: ['Two, one on each side', 'One', 'Four', 'None'], explain: 'BASE 1 on the left and BASE 2 on the right.' },
        { prompt: 'Cross the mat from BASE 1 to BASE 2 in under 6 seconds.', hint: 'robot.settings(straight_speed=400) and robot.straight(2000).' },
      ],
    },
    u7l3: {
      title: 'Attachment on the way',
      intro: 'In a real run, the attachment moves while the robot drives. Start the attachment with wait=False and then drive: both happen together.\n\nThat is how good teams save seconds on every mission.',
      ex: [
        { prompt: 'Why move the attachment while the robot drives?', options: ['To save match time', 'To make the robot more accurate', 'Because the hub requires it', 'To save battery'], explain: 'Two actions at once take the time of the longest one, not the sum.' },
        { prompt: 'Go to the red zone opening the right attachment 90° on the way, close it back to 0° on the way home and end in BASE 1, all in under 6 seconds.', hint: 'settings(straight_speed=400), right_arm.run_angle(500, 90, wait=False), straight(800), right_arm.run_angle(500, -90, wait=False), straight(-800).' },
      ],
    },
    u8l3: {
      title: 'Turn by the gyro',
      intro: 'hub.imu.heading() tells how many degrees the robot has turned. Turning right increases the value.\n\nYou can turn with drive(0, speed) and stop when the heading reaches the angle you want. The gyro measures the real turn, even if the wheels slip.',
      ex: [
        { prompt: 'After turning 90° to the right, what does hub.imu.heading() show?', options: ['90', '-90', '0', '180'], explain: 'Turning right increases the heading.' },
        { prompt: 'Complete the condition with the gyro.', explain: 'heading() is read again on every repeat.' },
        { prompt: 'The robot is already turning with drive(0, 120). Stop it when the heading reaches 90.', hint: 'while hub.imu.heading() < 90: wait(10).' },
      ],
    },
    u9l2: {
      title: 'Follow for a time',
      intro: 'StopWatch() is a timer in milliseconds. watch.time() says how long it has been since it was created.\n\nA follower can stop by time instead of distance: while watch.time() < 3000 follows for 3 seconds.',
      ex: [
        { prompt: 'What does watch.time() return?', options: ['Milliseconds since the StopWatch was created or reset', 'Seconds', 'The time of day', 'Minutes'], explain: 'Pybricks always measures time in ms. 3000 ms = 3 s.' },
        { prompt: 'Change the loop so the robot follows the line for 3 seconds and stops.', hint: 'while watch.time() < 3000:' },
      ],
    },
    u10l3: {
      title: 'Two missions in a row',
      intro: 'Each mission in its own function, called in order. Each one starts and ends in the base, so the next one always starts from a known place.\n\nTo reach the yellow zone without bumping the crate, go up first and then right.',
      ex: [
        { prompt: 'Why should each mission function end back in the base?', options: ['So the next mission starts from a known place', 'Because Python requires it', 'To make the robot faster', 'To reset the hub'], explain: 'If a mission ends somewhere different each time, all the next measurements are wrong.' },
        { prompt: 'Complete both functions: push the crate into the red zone, then visit the yellow zone, and end in BASE 1.', hint: 'push_crate: straight(620) and straight(-620). visit_yellow: turn(-90), straight(640), turn(90), straight(800) and the same way back in reverse.' },
      ],
    },
    u10l4: {
      title: 'Deliver with the claw',
      intro: 'Grabbing is only half of it: the robot has to carry the piece and release it in the right place. Open, grab, drive with the crate held, open again and come back.\n\nThe claw center is 214 mm in front of the robot center.',
      ex: [
        { prompt: 'The robot is holding the crate. What makes it release the crate?', options: ['Opening the claw', 'Driving backward', 'Turning the robot', 'Stopping the robot'], explain: 'The crate stays in the claw until it opens.' },
        { prompt: 'Grab the blue crate, drop it in the red zone and return to BASE 1.', hint: 'open_claw(), straight(266), close_claw(), straight(340), open_claw(), straight(-606).' },
      ],
    },
    u11l1: {
      title: 'Syntax errors',
      intro: 'SyntaxError means Python could not understand how a line is written: a missing colon, wrong indentation, or an unclosed parenthesis.\n\nThe message shows the line. Look at that line and the one before it.',
      ex: [
        { prompt: 'SyntaxError on a for line. What is the most likely cause?', options: ['The colon at the end is missing', 'The number is wrong', 'The motor is unplugged', 'The robot is too slow'], explain: 'for, while, if and def always end with a colon.' },
        { prompt: 'This program should drive a 300 mm square and return to the start, but it has two mistakes. Fix them.', hint: 'Put the colon after range(4) and indent robot.turn(-90) so it is inside the for.' },
      ],
    },
    u11l2: {
      title: 'Investigate with print',
      intro: 'print() shows values in the Output panel. It is the easiest way to find out what the robot is "thinking": how far it drove, what the sensor reads, what the heading is.\n\nOn the real hub, print shows up in the Pybricks Code terminal.',
      ex: [
        { prompt: 'What does this program print?', options: ['250', '0', '25', 'An error'], explain: 'distance() counts the mm driven since the start.' },
        { prompt: 'The robot drives to the black strip. Print how far it drove.', hint: 'print(robot.distance()) after robot.stop().' },
      ],
    },
    u11l3: {
      title: 'Fix the mission',
      intro: 'Most bugs are small: a number in cm instead of mm, a sign the other way, a line out of order.\n\nRun the program, watch where the robot goes and compare it with what you wanted.',
      ex: [
        { prompt: 'The robot turns right when it should turn left. What do you change?', options: ['The sign of the angle', 'The speed', 'The port', 'The wheel diameter'], explain: 'Positive turns right, negative turns left.' },
        { prompt: 'This program should reach the yellow zone but has two bugs. Find and fix them.', hint: 'straight(80) should be 800 mm, and the turn should go left: turn(-90).' },
      ],
    },
    u11l4: {
      title: 'Wrong port',
      intro: 'OSError when creating a device usually means the program uses a port with nothing plugged in, or the wrong device on it.\n\nOn the default robot the color sensor is on port E.',
      ex: [
        { prompt: 'The program stops with OSError on the line sensor = ColorSensor(Port.F). What do you check?', options: ['Which port the sensor is really plugged into', 'The wheel size', 'The robot speed', 'The comments'], explain: 'The error says nothing was found on that port.' },
        { prompt: 'This program should stop on the red zone but stops with an error. Fix it.', hint: 'The color sensor is on Port.E.' },
      ],
    },
    u12l1: {
      title: 'Start from BASE 2',
      intro: 'On the FLL table, some missions are closer to the other launch area. In BatControl, BASE 2 is on the right and the robot starts facing left.\n\nThe commands are the same: forward is wherever the robot is facing.',
      ex: [
        { prompt: 'The robot starts in BASE 2 facing left. Which command drives it toward the blue zone?', options: ['robot.straight(640)', 'robot.straight(-640)', 'robot.turn(180)', 'robot.curve(640, 90)'], explain: 'The robot faces left, toward the blue zone, so forward is positive.' },
        { prompt: 'From BASE 2, visit the blue zone and return to BASE 2.', hint: 'The blue zone center is 642 mm ahead.' },
      ],
    },
    u12l2: {
      title: 'Against the clock',
      intro: 'In a match every second counts. Raise straight_speed and straight_acceleration, but remember: on the real robot, too fast can slip and lose accuracy.\n\nThe maximum wheel speed of the SPIKE motors is around 490 mm/s.',
      ex: [
        { prompt: 'Which change helps the most on a long, straight path?', options: ['Raise straight_speed', 'Raise turn_rate', 'Lower axle_track', 'Add wait(100)'], explain: 'On a straight path, driving speed is what matters.' },
        { prompt: 'Visit the red zone and the blue zone and come back to BASE 1 in under 8 seconds.', hint: 'robot.settings(straight_speed=480, straight_acceleration=1500), straight(1480) and straight(-1480).' },
      ],
    },
    u12l3: {
      title: 'Full run',
      intro: 'A full run combines several missions and ends in a base. Plan first: where each object is, which path avoids bumping into things, and where to finish.\n\nEnding in BASE 2 can save the way back.',
      ex: [
        { prompt: 'What is the best first step to plan a run?', options: ['Draw the path on the mat and measure it', 'Write the code at random and test', 'Raise the speed to the maximum', 'Use only curves'], explain: 'With the path measured (the Ruler tool helps), the code comes out right sooner.' },
        { prompt: 'Push the crate into the blue zone, visit the green zone and finish in BASE 2.', hint: 'straight(1300), turn(-41), straight(971), turn(126), straight(562).' },
      ],
    },
    u12l4: {
      title: 'Final challenge',
      intro: 'Put together what you learned: follow the line to the end, show that you arrived with the light and a beep.\n\nCongratulations: after this lesson you know the main Pybricks commands used in FLL.',
      ex: [
        { prompt: 'Which is the best way to know whether a mission really worked on the real robot?', options: ['Run it several times and see whether it always works', 'Run it once', 'Only look at the code', 'Test in the simulator only'], explain: 'A good mission works every time, not only once.' },
        { prompt: 'Follow the line to the end, then turn the light green and beep.', hint: 'while robot.distance() < 1300: follower with kp; then robot.stop(), hub.light.on(Color.GREEN), hub.speaker.beep().' },
      ],
    },
  },

  comments: {},
};
