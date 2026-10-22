// 中文教学内容（简体）。
import type { ContentText } from './types';

export const TEXT: ContentText = {
  groups: {
    start: '入门',
    drive: 'DriveBase（行驶）',
    arms: '附件电机',
    sensor: '颜色传感器',
    hub: '主机',
    time: '时间',
    python: '机器人 Python',
  },

  topics: {
    structure: {
      title: '程序的结构',
      summary: '每个 Pybricks 程序都有三部分：导入需要的内容，创建设备（主机、电机、传感器和 DriveBase），然后把任务指令一行一行写下来。机器人从上到下依次执行。',
      tips: [
        '每个设备只在程序开头创建一次。',
        '以 # 开头的行是注释：机器人会忽略它们，但它们能帮助队友看懂代码。',
        'left_motor、robo 和 sensor 这些名字是我们自己选的。你也可以用别的名字，只要整个程序里用同一个名字就行。',
      ],
      mistakes: ['忘记 import 会导致 NameError：Python 不知道 DriveBase 或 Port 是什么。'],
    },
    motor: {
      title: 'Motor()：创建电机',
      summary: '创建一个对象，用来控制插在主机某个端口（A 到 F）上的电机。在 BatControl 的标准机器人上，车轮在 A、B 端口，附件在 C、E 端口。',
      params: [
        ['Port.A … Port.F', '电机线插入的主机端口。'],
        ['Direction', '哪个方向算正方向。左轮电机是镜像安装的，所以要用 COUNTERCLOCKWISE。'],
        ['列表', '电机与输出轴之间的齿轮，例如 [12, 36]。可选。'],
      ],
      mistakes: [
        '左电机忘了加 Direction.COUNTERCLOCKWISE，机器人会原地打转而不是直行。可以在模拟器里试试。',
        '使用没有接电机的端口会出现 OSError：检查电线和端口。',
      ],
    },
    drivebase: {
      title: 'DriveBase()：组合两个车轮',
      summary: 'DriveBase 同时控制两个车轮电机，让机器人以毫米为单位行驶、以度为单位转向。它需要知道车轮大小和两轮之间的距离。',
      params: [
        ['Motor', '左轮电机。'],
        ['Motor', '右轮电机。'],
        ['mm', '车轮直径。BatLego 的机器人使用 62.4 mm 的车轮（SPIKE Prime 的小车轮是 56 mm）。'],
        ['mm', '两个车轮接触地面的点之间的距离。'],
      ],
      tips: [
        '如果机器人走得比要求的稍多或稍少，调整 wheel_diameter。',
        '如果机器人转得稍多或稍少，调整 axle_track。参见“校准”主题。',
      ],
    },
    straight: {
      title: 'straight()：直行',
      summary: '沿直线行驶指定距离后停下。正数向前，负数向后。',
      params: [
        ['mm', '行驶多远。100 mm = 10 cm。'],
        ['Stop', '结束时怎么做：Stop.HOLD（保持，默认）、Stop.BRAKE 或 Stop.COAST。'],
        ['True/False', '为 True 时，程序会等它完成后再执行下一行。'],
      ],
      tips: ['在场地上测量：模拟器场地边缘的标尺每 100 mm 有一个刻度。在“模拟”页中，测距尺工具可以帮你测量。'],
      mistakes: ['按厘米思考：straight(40) 只走 4 cm。'],
    },
    turn: {
      title: 'turn()：原地转向',
      summary: '让机器人原地转动，一个轮子向前，另一个向后。正角度向右转（顺时针），负角度向左转。',
      params: [
        ['度', '转多少。90 是四分之一圈，180 是半圈。'],
        ['Stop', '结束时如何停止。'],
        ['True/False', '是否等转完再继续。'],
      ],
      mistakes: ['把正负号弄反：turn(90) 是向右，不是向左。'],
    },
    strafe: {
      title: '那横移（strafe）呢？',
      summary: 'Pybricks 的 DriveBase 没有 strafe。典型的 FLL 机器人有两个固定的驱动轮（差速驱动），只能向前或向后推。只有装了全向轮或麦克纳姆轮的机器人才能横着走。要到达侧面的某个点：先转向，再行驶，然后转回来。',
      tips: ['如果你写 robo.strafe(...)，模拟器会显示和主机一样的错误：AttributeError。'],
    },
    curve: {
      title: 'curve()：沿弧线行驶',
      summary: '沿一段圆弧行驶，就像汽车转弯。半径决定弯道是宽还是急，角度决定走多少圆周。正角度向右弯。',
      params: [
        ['mm', '圆的半径。正数向前，负数向后。'],
        ['度', '走多少圆周。90 是四分之一圆。'],
      ],
      tips: ['走弧线比“停下、转向、再走”更快，但更难走得精确。任务需要平滑路线时再用它。'],
    },
    settings: {
      title: 'settings()：速度和加速度',
      summary: '修改 straight、turn 和 curve 使用的速度和加速度。不带参数时返回当前值。通常越慢越精确。',
      params: [
        ['mm/s', '直行速度。'],
        ['mm/s²', '加速和减速有多快。'],
        ['度/秒', '转向速度。'],
        ['度/秒²', '转向加速度。'],
      ],
      tips: ['模拟器中的默认值是根据 SPIKE 电机估算的。在真实主机上可能略有不同。'],
    },
    drive: {
      title: 'drive() 和 stop()：持续行驶',
      summary: 'drive() 启动车轮后，程序会立刻执行下一行，机器人仍在运动。只有调用 robo.stop() 时机器人才会停下。这是“一直走到看见黑线”和巡线程序的基础。',
      params: [
        ['mm/s', '前进速度（负数 = 后退）。'],
        ['度/秒', '行驶时转多少。0 = 直行，正数 = 向右。'],
      ],
      mistakes: ['调用 drive() 却忘了等待（wait 或循环）：程序马上结束，机器人根本不动。'],
    },
    distance: {
      title: 'distance()、angle() 和 reset()',
      summary: 'distance() 告诉你机器人从开始（或上次 reset 之后）走了多少 mm。angle() 告诉你转了多少度。reset() 把两者都归零。',
      returns: '整数：mm 和度。',
    },
    gyro: {
      title: 'use_gyro()：使用陀螺仪',
      summary: '让 DriveBase 用主机的陀螺仪来测量机器人转了多少，而不只是数车轮转了几圈。真实机器人每次转向时车轮都会轻微打滑；有了陀螺仪，DriveBase 会察觉并修正。',
      tips: [
        '在“模拟”页打开真实模式：车轮会像真实机器人一样打滑，每次运行结果都略有不同。比较一下用和不用 use_gyro(True) 的效果。',
        '启动前让主机静止片刻：机器人不动时陀螺仪会自动校准。',
      ],
    },
    calibrate: {
      title: '校准：wheel_diameter 和 axle_track',
      summary: '磨损的轮胎、略有差异的车轮以及场地本身都会改变实际尺寸。校准方法：行驶 1000 mm，用卷尺测量。新的 wheel_diameter = 当前值 × 实测值 ÷ 1000。然后转 360°，看机器人实际转了多少。新的 axle_track = 当前值 × 360 ÷ 实际转角。',
      tips: [
        '“模拟 › 机器人”里有校准计算器，可以帮你算。',
        '测量三次取平均值：只测一次可能不准。',
        '尽量在比赛场地上校准。',
      ],
      mistakes: ['算反了：如果机器人走得比要求的多，wheel_diameter 应该变大（车轮比程序以为的更大）。'],
    },
    'run-angle': {
      title: 'run_angle()：转动附件',
      summary: '让电机从当前位置转动指定的度数。这是抬起和放下附件臂最常用的指令。在模拟器中，附件是机器人顶部的两个齿轮。',
      params: [
        ['度/秒', '电机速度。最高约 1000。'],
        ['度', '转多少。360 是一整圈；负数向反方向转。'],
        ['True/False', '用 wait=False 让附件在机器人行驶时同时转动。'],
      ],
    },
    claw: {
      title: '附件示例：夹爪',
      summary: '夹爪是一种简单的附件：一个电机带动两个齿轮，让两片夹片同时张开和闭合。在模拟器中，可在“模拟 › 机器人 › 附件”中添加夹爪。电机在 0° 时夹爪闭合，在 90° 时完全张开。夹片之间有箱子时闭合，就会夹住箱子。',
      tips: [
        '用 run_target(300, 0) 来闭合：即使开始时半开，夹爪也总会回到同一位置。',
        '在真实机器人上，把夹爪装在牢固的梁上：如果晃动，夹爪就会夹不到零件。',
      ],
    },
    'run-target': {
      title: 'run_target() 和 reset_angle()',
      summary: 'run_target() 把电机转到一个精确的角度（从零算起）。它和 run_angle() 的区别是：无论电机原来在哪里，最后总停在同一位置。reset_angle(0) 把当前位置设为零。',
      params: [
        ['度/秒', '速度。'],
        ['度', '目标角度。'],
      ],
    },
    'run-time': {
      title: 'run_time()、run() 和 stop()',
      summary: 'run_time() 让电机转动一段时间（毫秒）。run() 启动电机，直到你调用 stop() 才会停。angle() 告诉你电机的角度。',
      params: [
        ['度/秒', '速度。'],
        ['ms', '转多久。1000 ms = 1 秒。'],
      ],
    },
    color: {
      title: 'color()：下面是什么颜色',
      summary: '读取传感器下方场地的颜色，返回 Color.BLACK、Color.WHITE、Color.RED、Color.BLUE、Color.GREEN 或 Color.YELLOW 等颜色。在模拟器中，地面上的红点表示传感器读取的位置。',
      returns: '一个颜色（Color.X）。用 == 比较。',
      mistakes: ['与文字 "BLACK" 比较：正确写法是 Color.BLACK，不加引号。'],
    },
    reflection: {
      title: 'reflection()：反射回来多少光',
      summary: '测量场地反射的光有多少，范围 0 到 100。黑色约为 7，白色约为 96。在线的边缘，数值介于两者之间，巡线程序用的就是这个值。',
      returns: '0 到 100 之间的数。',
      tips: ['先慢速开始，再调整增益：太高机器人会左右摇摆，太低会在弯道冲出去。'],
    },
    pid: {
      title: 'PID 巡线',
      summary: 'PID 控制把三种修正加在一起。P（比例）误差越大转得越多。I（积分）修正一直偏向同一侧的误差。D（微分）观察误差变化有多快，在冲过头之前减弱修正，从而消除摇摆。在 FLL 中，P 和 D 几乎能解决所有问题。',
      tips: [
        '按这个顺序调：先设 kd = 0、ki = 0，增大 kp 直到机器人能跟住弯道，再增大 kd 直到不再摇摆。',
        '一次只改一个数，并记下发生了什么。',
        '速度越快，需要的 kd 越大。',
      ],
      mistakes: ['忘记在循环末尾更新 last_error：微分项会一直算错。'],
    },
    imu: {
      title: 'hub.imu.heading()：机器人朝向哪里',
      summary: '主机的陀螺仪告诉你机器人从开始到现在转了多少度。向右转数值增大。',
      returns: '度。',
    },
    'hub-io': {
      title: '主机的灯、屏幕和声音',
      summary: '用按钮灯、5×5 屏幕和扬声器来显示机器人在做什么。测试时非常有用：一声“哔”就告诉你某一步完成了。',
    },
    wait: {
      title: 'wait()：暂停',
      summary: '让程序暂停一段时间（毫秒）。正在转动的电机会继续转动。',
      params: [['ms', '1000 ms = 1 秒。']],
      tips: ['在循环里加一个 wait(10)，可以给主机留出时间，让读数更稳定。'],
    },
    stopwatch: {
      title: 'StopWatch()：计时器',
      summary: '以毫秒计时的秒表。可用来限制某一步最多花多长时间。一场 FLL 比赛为 2 分 30 秒（150000 ms）。',
    },
    variables: {
      title: '变量',
      summary: '变量用一个名字保存一个值。这样你只需在一个地方改数字，而不用在整个程序里到处找。',
    },
    for: {
      title: 'for：重复固定次数',
      summary: '把缩进（4 个空格）的代码块重复 n 次。range(4) 依次数 0、1、2、3。',
      mistakes: ['忘记 for 行末尾的冒号，或者忘记缩进代码块。'],
    },
    while: {
      title: 'while：条件成立时重复',
      summary: '只要条件为真就重复执行代码块。用于“一直走到看见线”或“一直转到方向正确”。',
    },
    if: {
      title: 'if、elif 和 else：做判断',
      summary: '只有条件为真时才执行代码块。用 elif 检查另一个条件，用 else 表示“否则”。',
    },
    def: {
      title: 'def：编写自己的函数',
      summary: '函数给一组指令起一个名字。在 FLL 中，常见做法是每个任务一个函数，然后按顺序调用。这样你可以单独测试每个任务，也能随时调整顺序而不用重写。',
    },
  },

  units: {
    u1: { title: '认识 Pybricks', desc: '什么是程序，以及机器人在代码中如何出现。' },
    u2: { title: '直行与转向', desc: 'straight() 和 turn()：FLL 中最常用的两个指令。' },
    u3: { title: '弧线与速度', desc: '用 curve() 走平滑路线，用 settings() 控制节奏。' },
    u4: { title: '附件', desc: 'C、E 端口上的电机，用来驱动任务附件。' },
    u5: { title: '颜色传感器', desc: '停在黑线上，以及沿线行驶。' },
    u6: { title: '编程逻辑', desc: '用 for 重复，用 if 判断，用 def 组织任务。' },
    u7: { title: '完整任务', desc: '把所学的组合成一次真实的出发，在比赛时间内完成。' },
    u8: { title: '精度', desc: '陀螺仪与校准：真实机器人没有纸面上那么完美。' },
    u9: { title: 'PID 巡线', desc: '快速巡线而不左右摇摆。' },
    u10: { title: '任务函数', desc: '推动和抓取物体，每个任务都有自己的函数。' },
    u11: { title: '调试', desc: '读懂错误，用 print 排查，修好程序。' },
    u12: { title: '比赛策略', desc: '基地 2、与时间赛跑和完整的一轮。' },
  },

  lessons: {
    u1l1: {
      title: '第一个程序',
      intro: 'Pybricks 是运行在 SPIKE Prime 主机里的 Python。机器人从上到下逐行执行程序。\n\n行驶时我们使用 DriveBase，在本课程中它叫 robot。指令 robo.straight(300) 让机器人向前走 300 毫米。',
      ex: [
        { prompt: '我们用哪种语言编写 Pybricks 程序？', options: ['Python', 'Scratch 积木', 'C++', 'JavaScript'], explain: 'Pybricks 使用 MicroPython，这是专为主机这类小型电路板设计的 Python 版本。' },
        { prompt: 'straight() 用什么单位测量距离？', options: ['毫米', '厘米', '车轮圈数', '秒'], explain: 'Pybricks 中所有距离都以 mm 为单位。30 cm = 300 mm。' },
        { prompt: '补全代码，让机器人向前走 300 mm。', explain: 'straight 的意思是走直线。' },
        { prompt: '让机器人向前走 300 mm。', hint: '在注释下面写 robo.straight(300)。' },
      ],
    },
    u1l2: {
      title: '代码里的机器人',
      intro: '在让机器人行驶之前，程序需要知道每个端口上插着什么。在 BatControl 的标准机器人上：\n\nA 端口：左轮。B 端口：右轮。C 端口：左侧附件。D 端口：颜色传感器。E 端口：右侧附件。\n\n左电机是镜像安装的，所以要加 Direction.COUNTERCLOCKWISE，让两个轮子的“正方向”都表示“向前”。',
      ex: [
        { prompt: '标准机器人的车轮电机在哪些端口？', options: ['A 和 B', 'C 和 D', 'E 和 F', 'A 和 C'], explain: '车轮在 A 和 B，附件在 C 和 E，颜色传感器在 D。' },
        { prompt: '为什么左电机要用 Direction.COUNTERCLOCKWISE？', options: ['因为它和右电机是镜像安装的', '为了让机器人更快', '因为主机只接受一个普通电机', '为了横着走'], explain: '两个电机面对面安装。如果不把其中一个反向，两个轮子会朝相反方向转，机器人就会原地打转。' },
        { prompt: 'BatLego 机器人的车轮直径是 62.4 mm。补全：', explain: 'wheel_diameter 是以 mm 为单位的车轮直径。' },
        { prompt: '把这些行排成正确的顺序（import 已经写好了）。', explain: '先创建电机，再创建使用它们的 DriveBase，最后才下达指令。' },
        { prompt: '这个程序让机器人原地打转，而不是向前走 400 mm。运行它看看问题，然后修正电机的创建方式。', hint: 'A 端口的电机需要 Direction.COUNTERCLOCKWISE。' },
      ],
    },
    u2l1: {
      title: '直行',
      intro: 'straight(距离) 沿直线行驶后停下。正数向前，负数向后。\n\n模拟器场地的边缘每 100 mm 有一个刻度。起点在基地 1 内，机器人中心位于 x = 120 mm。',
      ex: [
        { prompt: 'robo.straight(-200) 会做什么？', options: ['后退 200 mm', '前进 200 mm', '转 200 度', '报错，不允许负数'], explain: '负的距离表示向后走。' },
        { prompt: '25 cm 等于多少毫米？', options: ['250', '25', '2500', '2.5'], explain: '1 cm = 10 mm，所以 25 cm = 250 mm。' },
        { prompt: '把机器人开到红色区域。它的中心在起点前方 800 mm。', hint: '一个距离正确的 robo.straight() 就够了。' },
      ],
    },
    u2l2: {
      title: '转向',
      intro: 'turn(角度) 让机器人原地转动。正数向右转（顺时针），负数向左转。\n\n四分之一圈是 90 度，半圈是 180 度。',
      ex: [
        { prompt: 'robo.turn(90) 会让机器人转向哪边？', options: ['右边', '左边', '前方', '取决于端口'], explain: '正角度 = 顺时针 = 向右。' },
        { prompt: '哪条指令能让机器人掉头？', options: ['robo.turn(180)', 'robo.turn(90)', 'robo.turn(360)', 'robo.straight(-180)'], explain: '掉头是 180 度。360 是转一整圈，机器人最后还是朝着原来的方向。' },
        { prompt: '补全代码，向左转四分之一圈。', explain: '向左是负数：-90。' },
        { prompt: '把机器人开到黄色区域。尺寸：前进 800 mm，向左转，再前进 640 mm。', hint: 'straight(800)，然后 turn(-90)，然后 straight(640)。' },
      ],
    },
    u2l3: {
      title: '有横移吗？',
      intro: '有人会找 strafe() 指令来横着走。Pybricks 的 DriveBase 没有这个指令：机器人有两个固定的轮子，只能向前或向后推（差速驱动）。\n\n要到达侧面的某个点：先转向，再行驶，然后转回来。',
      ex: [
        { prompt: '如果程序调用 robo.strafe(100) 会怎样？', options: ['报错：DriveBase 没有 strafe', '机器人横移 100 mm', '机器人转 100 度', '机器人前进 100 mm'], explain: '主机会显示 AttributeError，和模拟器一样。只有全向轮或麦克纳姆轮才能横着走。' },
        { prompt: '拼出“向左走 300 mm”并最终重新朝前的路线。', explain: '转向、行驶、再转回来，就能代替横移。' },
        { prompt: '停在黄色区域内，但要朝向场地右侧，和起点时一样。', hint: '用上一课的路线，最后加一个 turn(90)。' },
      ],
    },
    u3l1: {
      title: '弧线',
      intro: 'curve(半径, 角度) 沿圆弧行驶。半径大是缓弯，半径小是急弯。正角度向右弯。\n\n半径 300、角度 -90 的弧线会让机器人向前 300 mm、向左 300 mm。',
      ex: [
        { prompt: '下面哪条弧线最急？', options: ['robo.curve(100, 90)', 'robo.curve(400, 90)', 'robo.curve(800, 90)', '都一样'], explain: '半径越小，弯道越急。' },
        { prompt: '补全代码，以 300 mm 半径向左走四分之一圆。', explain: '向左是负数，四分之一圆是 90 度。' },
        { prompt: '在路上使用一次 curve()、不用 turn()，到达黄色区域。', hint: '前进 500 mm，执行 curve(300, -90)，再前进 340 mm。' },
      ],
    },
    u3l2: {
      title: '速度',
      intro: 'robo.settings() 修改 straight、turn 和 curve 的速度。例如 robo.settings(straight_speed=400) 以 400 mm/s 的速度行驶。\n\n更快能节省比赛时间，更慢通常更精确。',
      ex: [
        { prompt: 'straight_speed 的单位是什么？', options: ['mm/s', '度/秒', 'cm/s', '转/分钟'], explain: '直行速度的单位是毫米每秒。' },
        { prompt: '补全代码，以 400 mm/s 行驶。', explain: 'straight_speed 控制直行的速度。' },
        { prompt: '在 6 秒内到达蓝色区域（前方 1400 mm）。按默认速度，机器人来不及。', hint: '在 straight 之前加上 robo.settings(straight_speed=400)。' },
      ],
    },
    u4l1: {
      title: 'run_angle()',
      intro: '附件由 C、E 端口的电机驱动。在模拟器中，它们是机器人顶部的两个齿轮。\n\nanexo_left.run_angle(500, 180) 以每秒 500 度的速度把左侧附件转 180 度。',
      ex: [
        { prompt: '在 anexo_left.run_angle(500, 90) 中，500 是什么？', options: ['速度，单位是度/秒', '角度，单位是度', '时间，单位是毫秒', '电机功率'], explain: '先写速度，再写角度。' },
        { prompt: '补全代码，让右侧附件转一整圈。', explain: '一整圈是 360 度。' },
        { prompt: '把左侧附件转半圈，然后再转回起始位置。', hint: '两行：anexo_left.run_angle(500, 180) 和 anexo_left.run_angle(500, -180)。' },
      ],
    },
    u4l2: {
      title: '附件与机器人同时动',
      intro: '默认情况下，每条指令都要等完成后才执行下一行。加上 wait=False，指令开始后程序会立刻继续。\n\n这样附件可以在机器人行驶时抬起，节省宝贵的比赛时间。\n\nrun_target(速度, 角度) 把电机转到一个精确的角度（从零算起）。',
      ex: [
        { prompt: 'anexo_right.run_angle(500, 90, wait=False) 中的 wait=False 有什么作用？', options: ['开始转动，程序不等待直接继续', '不转动电机', '让电机一直转', '转动前等待 90 ms'], explain: '电机和后面的代码同时运行。' },
        { prompt: '附件在 30°。执行 run_target(500, 90) 后它会到哪里？', options: ['到 90°', '到 120°', '到 60°', '停在 30°'], explain: '不管原来在哪里，run_target 都会转到目标角度。run_angle(500, 90) 则会转到 120°。' },
        { prompt: '开到红色区域，同时把右侧附件转 90°。全部在 4.6 秒内完成。', hint: 'anexo_right.run_angle(500, 90, wait=False)，然后 robo.straight(800)。' },
      ],
    },
    u5l1: {
      title: '停在线上',
      intro: 'sensor.color() 告诉你传感器下方场地的颜色：Color.BLACK、Color.WHITE、Color.RED……\n\n要一直走到出现某种颜色：用 robo.drive(速度, 0) 启动车轮，在 while 循环里等待颜色出现，然后调用 robo.stop()。\n\n在模拟器中，地面上的红点表示传感器读取的位置。',
      ex: [
        { prompt: '判断传感器是否看到黑色的正确写法是？', options: ['sensor.color() == Color.BLACK', 'sensor.color() == "BLACK"', 'sensor.color = Color.BLACK', 'sensor.black()'], explain: '用 == 比较，并使用 Pybricks 的颜色（Color.BLACK），不加引号。' },
        { prompt: '补全代码，一直走到找到黑线。', explain: '只要颜色不等于（!=）黑色，就继续走。' },
        { prompt: '开到黑色的停止带并停在上面。途中传感器会经过红色区域：机器人不能停在那里。', hint: 'robo.drive(200, 0)，然后 while sensor.color() != Color.BLACK: wait(10)，然后 robo.stop()。' },
      ],
    },
    u5l2: {
      title: '巡线',
      intro: 'sensor.reflection() 测量反射回来的光，范围 0 到 100：黑色约为 7，白色约为 96。在线的边缘，数值介于两者之间，大约 50。\n\n比例巡线程序计算 error = reflection() - 50，并按误差比例转向：robo.drive(150, error * gain)。机器人沿着线的边缘行驶，不断修正。',
      ex: [
        { prompt: '传感器完全在黑色上方。reflection() 最可能是多少？', options: ['约 7', '约 50', '约 96', '正好 100'], explain: '黑色反射的光很少。' },
        { prompt: '机器人在线上左右摇摆得很厉害。通常怎么做有帮助？', options: ['降低增益', '提高增益', '去掉 wait(10)', '用 turn() 代替 drive()'], explain: '增益太高会让修正过度。逐步降低它（必要时也降低速度）。' },
        { prompt: '机器人开始时传感器已经在线的边缘。补全巡线程序，让它走完直线和弯道，直到线的尽头。', hint: '在 while 里，把注释换成 robo.drive(150, error * gain)。' },
      ],
    },
    u6l1: {
      title: '循环',
      intro: 'for i in range(4): 会把缩进的代码块重复 4 次。代码块就是 for 下面多缩进 4 个空格的所有内容。\n\n别忘了行末的冒号。',
      ex: [
        { prompt: 'for i in range(3): 的代码块会执行几次？', options: ['3', '2', '4', '无限次'], explain: 'range(3) 数 0、1、2：共三次。' },
        { prompt: '补全代码，重复 4 次。', explain: 'range(4) 生成 0 到 3。' },
        { prompt: '用 for 走一个边长 300 mm 的正方形，并回到出发点。机器人从基地外出发，前方和左侧都有空地。', hint: 'for i in range(4):，里面写 robo.straight(300) 和 robo.turn(-90)。' },
      ],
    },
    u6l2: {
      title: '函数',
      intro: 'def 用来创建函数：给一组指令起一个名字。在 FLL 中，常见做法是每个任务一个函数。\n\n函数可以接收值，例如 def go_and_back(distance):。在函数内部，distance 就是调用时传入的值。',
      ex: [
        { prompt: 'Python 读到 def mission(): 这一行时会发生什么？', options: ['只是保存函数；调用 mission() 时才执行', '立刻执行这个函数', '如果函数从未使用就报错', '无限重复这个函数'], explain: '定义不等于执行。只有调用 mission() 时才会执行。' },
        { prompt: '把函数和调用排成正确的顺序。', explain: '先写定义和它缩进的代码块，再在代码块外面调用。' },
        { prompt: '创建函数 go_and_back(distance)，用它去红色区域再回到起点。', hint: '函数内：robo.straight(distance) 和 robo.straight(-distance)。函数外：go_and_back(800)。' },
      ],
    },
    u7l1: {
      title: '离开基地',
      intro: '在 FLL 比赛中，机器人离开基地、完成任务再返回。所有出发加起来共有 2 分 30 秒。\n\n这个挑战不提供尺寸提示：请使用场地边缘的标尺。蓝色区域中心在 x = 1600 mm，绿色区域在 x = 2150、y = 860。',
      ex: [
        { prompt: '一场 FLL Challenge 比赛有多长？', options: ['2 分 30 秒', '1 分钟', '5 分钟', '10 分钟'], explain: '150 秒。所以每节省一秒都很重要。' },
        { prompt: '经过蓝色区域，再经过绿色区域，最后回到基地 1 内。', hint: '一种解法：更快的 settings，straight(1480)，turn(-49)，straight(844)，再沿原路反向返回。' },
      ],
    },
    u8l1: {
      title: '陀螺仪',
      intro: '在真实机器人上，每次转向车轮都会轻微打滑，而且两个轮子从来不会完全一样。每次转向误差 2°，到出发结束时就会变成很大的误差。\n\nrobo.use_gyro(True) 让 DriveBase 用主机的陀螺仪测量转向并自动修正。\n\n在这个挑战中，模拟器处于真实模式：车轮会像真实机器人一样打滑。',
      ex: [
        { prompt: '为什么程序正确，真实机器人还是转不准？', options: ['车轮会打滑，而且两轮不完全相同', 'Python 会把数字四舍五入', '主机只能以 10 度为单位转动', '电池会改变要求的角度'], explain: 'DriveBase 靠车轮计算转角。车轮打滑时，计算值就和实际转角不一致。' },
        { prompt: '陀螺仪测量的是什么？', options: ['机器人实际转了多少', '场地的颜色', '到墙的距离', '车轮的速度'], explain: '陀螺仪感知的是主机本身的旋转，所以不依赖车轮。' },
        { prompt: '补全代码，在 DriveBase 中启用陀螺仪。', explain: 'use_gyro(True) 启用，use_gyro(False) 关闭。' },
        { prompt: '直接运行程序：在正方形里绕两圈后，机器人回不到起点。启用陀螺仪，让它准确返回。', hint: '在 for 之前加上 robo.use_gyro(True)。' },
      ],
    },
    u8l2: {
      title: '校准',
      intro: '程序只知道你告诉它的东西。如果真实车轮比 62.4 mm 略大，机器人就会走得比要求的远。\n\n校准方法：行驶 1000 mm 并测量。新的 wheel_diameter = 当前值 × 实测值 ÷ 1000。\n\n转向校准：转 360°，看实际转了多少。新的 axle_track = 当前值 × 360 ÷ 实际转角。',
      ex: [
        { prompt: '机器人应该走 1000 mm，实际走了 980 mm。wheel_diameter 应该怎么改？', options: ['减小', '增大', '不变，改 axle_track', '改变正负号'], explain: '走少了，说明真实车轮比程序以为的小：减小它（56 × 980 ÷ 1000 = 54.9）。' },
        { prompt: '我要求 turn(360)，机器人只转了 350°。axle_track 应该怎么改？', options: ['增大', '减小', '不变', '设为零'], explain: '要转得更多，DriveBase 必须认为两轮距离更远：140 × 360 ÷ 350 = 144。' },
        { prompt: 'wheel_diameter=62.4 时，我要求走 1000 mm，机器人走了 1025 mm。填入新值（62.4 × 1025 ÷ 1000，取整）：', explain: '62.4 × 1.025 = 63.96，约 64 mm。' },
      ],
    },
    u9l1: {
      title: 'P 和 D',
      intro: '要快速巡线，比例增益（kp）必须很高，但这样机器人会冲过头并左右摇摆。\n\nD 项观察误差相比上次读数变化了多少：derivative = error - last_error。如果误差在快速减小，D 会在冲过头之前减弱修正。\n\nturn_rate = kp × error + kd × derivative',
      ex: [
        { prompt: 'D 项（微分）有什么用？', options: ['在冲过头之前减弱修正', '走得更快', '测量线的颜色', '在最后让机器人停下'], explain: 'D 对误差变化的快慢做出反应，抑制摇摆。' },
        { prompt: '在 FLL 中调 PID 的推荐顺序是？', options: ['先 kp，再 kd，最后 ki（如果需要）', '先 ki，再 kp', '同时调所有参数', '先 kd，再 kp'], explain: 'kp 让机器人跟线，kd 消除摇摆，巡线程序很少需要 ki。' },
        { prompt: '速度 400 mm/s、kp = 6 且没有 D 时，机器人左右摇摆并冲出线外。调整增益，让它在 4 秒内到达线的尽头。', hint: '保持 kp = 6，设置 kd = 8。' },
      ],
    },
    u10l1: {
      title: '用函数推动',
      intro: '很多 FLL 任务都是把一个物体推到某个位置。机器人的保险杠会推动前方的东西。\n\n把每个任务放进一个名字清楚的函数里，比如 push_crate()。这样你可以单独测试一个任务，再按顺序调用各个函数组成整场比赛。',
      ex: [
        { prompt: '为什么要把每个任务放进单独的函数？', options: ['可以单独测试每个任务，也方便调整顺序', '因为 Pybricks 要求这样做', '为了让机器人更快', '为了省电'], explain: '函数让程序井井有条：改一个任务不会弄坏其他任务。' },
        { prompt: '补全 push_crate()，把橙色箱子推到蓝色区域，然后回到基地 1。', hint: '箱子中心最后必须在 x = 1500 到 1700 之间。试试 robo.straight(1300)，然后 robo.straight(-1300)。' },
      ],
    },
    u10l2: {
      title: '用夹爪抓取',
      intro: '在这个挑战中，机器人左侧装有夹爪（C 端口）。电机在 90° 时夹爪张开，在 0° 时闭合。\n\n抓取方法：张开，让箱子位于两片夹片之间，然后闭合。要放下就再张开。\n\n夹爪中心在机器人中心前方 214 mm、左侧 46 mm 处。',
      ex: [
        { prompt: '如果夹爪闭合时中间什么都没有，会怎样？', options: ['空着闭合，机器人不带箱子继续前进', '程序报错', '机器人停下', '箱子会自己移到夹爪里'], explain: '夹爪只能抓住闭合时位于夹片之间的东西。' },
        { prompt: '用 open_claw() 和 close_claw() 抓住蓝色箱子，并把它带回基地 1 内。', hint: 'open_claw()，robo.straight(466)，close_claw()，robo.straight(-466)。' },
      ],
    },
    u1l3: {
      title: '错误和注释',
      intro: '以 # 开头的行是注释：写给队友看的说明，机器人会忽略它们。\n\n程序出错时会停下来，并显示错误和行号。命令拼错了，比如 robo.straigth()，会出现 AttributeError：DriveBase 没有这个名字的命令。',
      ex: [
        { prompt: '机器人怎么处理以 # 开头的行？', options: ['忽略它：这是注释', '执行两次', '报错并停止程序', '发出哔声'], explain: '注释是给人看的代码说明，机器人会跳过。' },
        { prompt: 'robo.straigth(300) 报错了。为什么？', options: ['命令名拼错了', '数字太大', '不允许用括号', '机器人需要先写注释'], explain: '正确的名字是 straight。Python 只认识准确的名字。' },
        { prompt: '这个程序会报错停止。运行它，读一读错误信息，然后修好它，让机器人前进 500 mm。', hint: '看看 straight 是怎么拼的。' },
      ],
    },
    u1l4: {
      title: '灯光和声音',
      intro: '主机的中间按钮上有一盏灯，还有一个扬声器。hub.light.on(Color.GREEN) 把灯变成绿色，hub.speaker.beep() 发出一声短哔。\n\n它们在测试时很有用：哔声表示一个步骤完成了，灯光可以显示机器人正在做哪个任务。',
      ex: [
        { prompt: '哪条命令让主机发出哔声？', options: ['hub.speaker.beep()', 'hub.light.beep()', 'robo.beep()', 'hub.display.beep()'], explain: '声音来自扬声器：hub.speaker。' },
        { prompt: '补全代码，让灯变成绿色。', explain: '颜色用 Color 加大写的名字。' },
        { prompt: '把灯变成绿色，前进 300 mm，最后发出哔声。', hint: 'hub.light.on(Color.GREEN)、robo.straight(300)、hub.speaker.beep()。' },
      ],
    },
    u2l4: {
      title: '倒车',
      intro: '很多任务只需要机器人沿同一条路去了再回来。不用掉头，直接用负数距离倒车：robo.straight(-800) 正好抵消 robo.straight(800)。\n\n这样更快，而且机器人回来时朝向不变。',
      ex: [
        { prompt: '机器人执行了 robo.straight(800)。哪条命令能不转向地把它带回起点？', options: ['robo.straight(-800)', 'robo.turn(180)', 'robo.straight(800)', 'robo.turn(-800)'], explain: '负数距离会沿同一条路倒退。' },
        { prompt: '到红色区域走一趟，再不转向地回到基地 1 内。', hint: 'robo.straight(800) 和 robo.straight(-800)。' },
      ],
    },
    u2l5: {
      title: '掉头',
      intro: '掉头就是转半圈：robo.turn(180) 或 robo.turn(-180)。两者最后都朝向相反方向，只是转的方向不同。\n\n掉头之后，正数距离会把机器人带回它来的地方。',
      ex: [
        { prompt: '补全代码，让机器人掉头。', explain: '180 或 -180：向任一边转半圈。' },
        { prompt: '执行 robo.turn(180) 之后，robo.straight(300) 会做什么？', options: ['朝来的方向往回前进 300 mm', '倒退 300 mm', '再转 300 度', '横着走'], explain: '机器人现在朝向另一边，所以向前就是回到起点的方向。' },
        { prompt: '开到红色区域，掉头，再向前开回基地 1 内。', hint: 'straight(800)、turn(180)、straight(800)。' },
      ],
    },
    u2l6: {
      title: '斜线',
      intro: '两点之间直线最短。要直接到达某个点，先转向它，再走斜线的距离。\n\n如果这个点在前方 a mm、侧面 b mm，距离就是 √(a² + b²)（勾股定理），角度是 atan(b ÷ a)。模拟页的测距尺工具会帮你算。',
      ex: [
        { prompt: '一个点在前方 600 mm、左边 800 mm。直线距离是多少？', options: ['1000 mm', '1400 mm', '200 mm', '700 mm'], explain: '√(600² + 800²) = √1000000 = 1000 mm。' },
        { prompt: '为什么斜线通常比“直走、转弯、直走”更好？', options: ['更短，动作也更少', '总是更准确', 'Pybricks 要求这样', '更省主机的电'], explain: '动作更少、路线更短可以节省时间。每次转弯也会带来一点误差。' },
        { prompt: '只用一个 turn() 和一个 straight() 到达黄色区域。区域中心在前方 800 mm、左边 640 mm。', hint: '角度：atan(640 ÷ 800) = 向左 38.7°。距离：√(800² + 640²) = 1024 mm。' },
      ],
    },
    u3l3: {
      title: 'S 形弯',
      intro: '两个方向相反的弯道组成一个 S。先 robo.curve(300, -90) 再 robo.curve(300, 90)，机器人会向前 600 mm、向左 600 mm，最后朝向和出发时一样。\n\n这是不停车就能平稳换道的方法。',
      ex: [
        { prompt: '执行 robo.curve(300, -90) 再执行 robo.curve(300, 90) 后，机器人朝向哪里？', options: ['和出发时一样', '左边', '右边', '后面'], explain: '一个弯向左转 90°，另一个向右转 90°：正好抵消。' },
        { prompt: '用两个弯道到达黄色区域，最后像出发时一样朝右。', hint: 'curve(300, -90)、curve(300, 90)，然后 straight(200)。' },
      ],
    },
    u3l4: {
      title: '转向速度',
      intro: 'settings() 也可以用 turn_rate 改变转向速度，单位是度每秒。robo.settings(turn_rate=400) 让 turn() 转得更快。\n\n快速转向能节省时间，但在真实机器人上更容易打滑。记得在场地上测试。',
      ex: [
        { prompt: '哪个设置决定 turn() 转得多快？', options: ['turn_rate', 'straight_speed', 'axle_track', 'wheel_diameter'], explain: 'turn_rate 是转向速度，单位是度每秒。' },
        { prompt: '补全代码，让转向更快。', explain: 'turn_rate=400 表示每秒 400 度。' },
        { prompt: '在 2 秒内转完整一圈（360°）。默认速度需要 2.5 秒。', hint: '在转向前加上 robo.settings(turn_rate=400)。' },
      ],
    },
    u4l3: {
      title: '精确角度',
      intro: 'run_angle() 是从电机当前位置开始累加的，所以小误差会越积越多。run_target(速度, 角度) 会转到从零算起的精确角度，不管电机从哪里开始。\n\nreset_angle(0) 把当前位置设为新的零点。',
      ex: [
        { prompt: 'anexo_left.reset_angle(0) 做什么？', options: ['把当前位置设为零', '把电机转回零', '停止电机', '转 0 度'], explain: '它不会让任何东西动，只是改变参考点。' },
        { prompt: '附件已经转到 105°。让它正好停在 120°。', hint: 'anexo_left.run_target(500, 120)。' },
      ],
    },
    u4l4: {
      title: '两个附件同时动',
      intro: '如果第一条命令要等到完成，第二个附件就只能之后才开始。在第一条命令里加 wait=False，两个附件就会一起动，节省时间。',
      ex: [
        { prompt: '怎样让两个附件同时动？', options: ['在第一条命令里加 wait=False', '两条命令都加 wait=False', '把两条写在同一行', 'Pybricks 做不到'], explain: '第一条开始后，程序马上执行第二条。第二条没有 wait=False，会等到完成。' },
        { prompt: '在 0.8 秒内把两个附件都转 180°。', hint: 'anexo_left.run_angle(500, 180, wait=False) 和 anexo_right.run_angle(500, 180)。' },
      ],
    },
    u5l3: {
      title: '在某种颜色上停下',
      intro: '在黑色上停下的循环同样适用于任何颜色：只要换掉条件里的颜色。\n\n传感器在机器人中心的前方偏左一点，所以是传感器（不是中心）到达颜色时机器人才停。',
      ex: [
        { prompt: '补全代码，在红色区域停下。', explain: 'Color.RED 就是红色。' },
        { prompt: '机器人停下时传感器在红色上，但机器人中心还没进区域。为什么？', options: ['传感器在机器人中心的前方', '传感器坏了', '红色检测不到', '机器人在倒车'], explain: '传感器读的是机器人前方的地面。规划停车位置时要记住这一点。' },
        { prompt: '一直前进，直到传感器找到红色区域，然后停在那里。', hint: 'robo.drive(200, 0)、while sensor.color() != Color.RED: wait(10)、robo.stop()。' },
      ],
    },
    u5l4: {
      title: '用反射值停下',
      intro: 'reflection() 给出一个数字，所以你可以自己选一个界限。黑色约为 7：只要 sensor.reflection() > 20，机器人就还没到黑色。\n\n当官方场地的颜色和 color() 认识的颜色不完全一样时，这很有用。',
      ex: [
        { prompt: '用 reflection() 在黑色上停下时，哪个条件让机器人继续前进？', options: ['while sensor.reflection() > 20:', 'while sensor.reflection() < 20:', 'while sensor.reflection() == 100:', 'while sensor.color() > 20:'], explain: '数值高（浅色地面）时继续前进。到了黑色会降到 20 以下。' },
        { prompt: '用 sensor.reflection() 停在黑色的停止带上。', hint: 'robo.drive(200, 0)、while sensor.reflection() > 20: wait(10)、robo.stop()。' },
      ],
    },
    u5l5: {
      title: '先一种颜色，再另一种',
      intro: '你可以先等一件事，再等另一件事：一个 while 循环接着另一个。机器人一直在前进，因为 drive() 只有 stop() 才会停。\n\n这样机器人可以把场地上的标记当作检查点，再到最后停下。',
      ex: [
        { prompt: '把程序排好顺序：前进，等红色，再等黑色然后停下。', explain: '两个循环先后执行，机器人一直在前进。' },
        { prompt: '前进，先等到红色区域，再等到黑色的停止带，并停在上面。', hint: '两个循环：while sensor.color() != Color.RED 和 while sensor.color() != Color.BLACK。' },
      ],
    },
    u6l3: {
      title: '当……时重复',
      intro: 'while 会在条件为真时一直重复。和 drive() 一起用，可以在正确的时刻让机器人停下：robo.drive(200, 0)，然后 while robo.distance() < 600: wait(10)，再 robo.stop()。\n\ndistance() 会在机器人行驶时不断更新。',
      ex: [
        { prompt: 'while robo.distance() < 600: 什么时候停止重复？', options: ['机器人走了 600 mm 或更多时', '永远不会', '重复 600 次之后', '立刻'], explain: '到 600 mm 时条件变为假，程序继续往下执行。' },
        { prompt: '用 drive() 和 while 循环，让机器人走 600 mm 后停下。', hint: 'while robo.distance() < 600:，里面写 wait(10)。' },
      ],
    },
    u6l4: {
      title: '用 if 做判断',
      intro: 'if 只在条件为真时执行一段代码；条件为假时执行 else。机器人可以根据传感器决定做什么。\n\n例如：if sensor.color() == Color.RED: robo.turn(-90) else: robo.turn(90)。',
      ex: [
        { prompt: '这个程序会输出什么？', options: ['A', 'B', 'A 和 B', '什么也不输出'], explain: '5 > 3 为真，所以只执行 if 的代码块。' },
        { prompt: '前进 700 mm 后，如果传感器看到红色就左转，否则右转。然后前进 400 mm。', hint: 'if sensor.color() == Color.RED: robo.turn(-90)，else: robo.turn(90)。' },
      ],
    },
    u6l5: {
      title: '列表',
      intro: '列表按顺序保存多个值：moves = [800, 640]。moves[0] 是第一个，moves[1] 是第二个。\n\nfor 会依次取出列表中的每一项。用 (距离, 角度) 组成的列表，一行就能描述整条路线。',
      ex: [
        { prompt: 'moves = [800, 640] 时，moves[1] 是多少？', options: ['640', '800', '1440', '出错'], explain: '从 0 开始数：moves[0] 是 800，moves[1] 是 640。' },
        { prompt: '补全代码，依次走完列表中的每个距离。', explain: 'for 每次把列表中的一个值交给 distance。' },
        { prompt: '补全循环，按照动作列表走到黄色区域。', hint: '在 for 里面：robo.straight(distance) 和 robo.turn(angle)。' },
      ],
    },
    u6l6: {
      title: '有返回值的函数',
      intro: '函数可以计算一个值，并用 return 把它返回。def mm(cm): return cm * 10 把厘米换算成毫米。\n\n调用 mm(80) 会被结果 800 替换。',
      ex: [
        { prompt: '补全代码，让函数返回以毫米为单位的值。', explain: 'return 把结果交还给调用函数的地方。' },
        { prompt: '这个程序会输出什么？', options: ['9', '8', '10', 'double(4) + 1'], explain: 'double(4) 返回 8，加 1 得 9。' },
        { prompt: '用 mm() 前进 80 cm，到达红色区域。', hint: 'robo.straight(mm(80))。' },
      ],
    },
    u6l7: {
      title: '用 break 跳出循环',
      intro: 'while True: 会一直重复下去。break 会立刻跳出循环，所以你可以在循环里面决定什么时候停。\n\n当停下的原因不止一个时，这很有用。',
      ex: [
        { prompt: '这个程序会输出什么？', options: ['0、1 和 2', '0、1、2 和 3', '只有 3', '什么也不输出'], explain: '当 i 等于 3 时，break 在 print 之前就跳出了循环。' },
        { prompt: '补全循环，用 break 让机器人停在黑色的停止带上。', hint: 'if sensor.color() == Color.BLACK: break。' },
      ],
    },
    u7l2: {
      title: '从一个基地到另一个基地',
      intro: '训练场地两边各有一个基地，就像 FLL 场地桌上的出发区。基地 2 在右边，场地的另一端。\n\n横穿整个场地需要时间：用 settings() 开得更快。',
      ex: [
        { prompt: 'BatControl 的训练场地有几个基地？', options: ['两个，每边一个', '一个', '四个', '没有'], explain: '基地 1 在左边，基地 2 在右边。' },
        { prompt: '在 6 秒内从基地 1 横穿场地到基地 2。', hint: 'robo.settings(straight_speed=400) 和 robo.straight(2000)。' },
      ],
    },
    u7l3: {
      title: '边走边动附件',
      intro: '在真正的比赛中，附件会在机器人行驶时一起动。先用 wait=False 启动附件，再前进：两件事同时发生。\n\n优秀的队伍就是这样在每个任务上节省几秒钟。',
      ex: [
        { prompt: '为什么要在机器人行驶时移动附件？', options: ['节省比赛时间', '让机器人更准确', '因为主机要求这样', '为了省电'], explain: '两个动作同时进行，用时取决于较长的那个，而不是两者之和。' },
        { prompt: '开往红色区域，途中把右侧附件打开 90°，返回时再关回 0°，最后停在基地 1，全部在 6 秒内完成。', hint: 'settings(straight_speed=400)、anexo_right.run_angle(500, 90, wait=False)、straight(800)、anexo_right.run_angle(500, -90, wait=False)、straight(-800)。' },
      ],
    },
    u8l3: {
      title: '用陀螺仪转向',
      intro: 'hub.imu.heading() 告诉你机器人转了多少度。向右转，数值会增加。\n\n你可以用 drive(0, 速度) 原地转，等 heading 到达想要的角度时停下。陀螺仪测量的是真实的转动，即使车轮打滑也一样。',
      ex: [
        { prompt: '向右转 90° 后，hub.imu.heading() 显示多少？', options: ['90', '-90', '0', '180'], explain: '向右转会让 heading 增加。' },
        { prompt: '用陀螺仪补全条件。', explain: '每次重复都会重新读取 heading()。' },
        { prompt: '机器人已经在用 drive(0, 120) 转动。当 heading 到达 90 时让它停下。', hint: 'while hub.imu.heading() < 90: wait(10)。' },
      ],
    },
    u9l2: {
      title: '按时间巡线',
      intro: 'StopWatch() 是一个以毫秒计时的秒表。watch.time() 表示从创建它到现在过了多久。\n\n巡线程序可以按时间而不是按距离停下：while watch.time() < 3000 会巡线 3 秒。',
      ex: [
        { prompt: 'watch.time() 返回什么？', options: ['从创建或重置 StopWatch 起经过的毫秒数', '秒数', '当前时刻', '分钟数'], explain: 'Pybricks 的时间单位总是 ms。3000 ms = 3 s。' },
        { prompt: '修改循环，让机器人巡线 3 秒后停下。', hint: 'while watch.time() < 3000:' },
      ],
    },
    u10l3: {
      title: '连续两个任务',
      intro: '每个任务写成一个函数，按顺序调用。每个任务都从基地出发、回到基地，这样下一个任务总是从已知的位置开始。\n\n要到黄色区域又不碰到箱子，先往上走，再往右走。',
      ex: [
        { prompt: '为什么每个任务函数都应该回到基地结束？', options: ['让下一个任务从已知位置开始', '因为 Python 要求这样', '让机器人更快', '为了重启主机'], explain: '如果任务每次结束的位置都不同，后面所有的测量都会出错。' },
        { prompt: '补全两个函数：把箱子推到红色区域，再去黄色区域，最后回到基地 1。', hint: 'push_crate：straight(620) 和 straight(-620)。visit_yellow：turn(-90)、straight(640)、turn(90)、straight(800)，再按相反顺序原路返回。' },
      ],
    },
    u10l4: {
      title: '用夹爪运送',
      intro: '抓住只是一半：机器人还要把物体运过去，放在正确的位置。张开、抓住、带着箱子前进、再张开，然后返回。\n\n夹爪中心在机器人中心前方 214 mm。',
      ex: [
        { prompt: '机器人正夹着箱子。怎样让它放开？', options: ['张开夹爪', '倒车', '转动机器人', '让机器人停下'], explain: '箱子会一直留在夹爪里，直到夹爪张开。' },
        { prompt: '抓住蓝色箱子，放到红色区域，然后回到基地 1。', hint: 'open_claw()、straight(266)、close_claw()、straight(340)、open_claw()、straight(-606)。' },
      ],
    },
    u11l1: {
      title: '语法错误',
      intro: 'SyntaxError 表示 Python 看不懂某一行的写法：少了冒号、缩进不对，或者括号没有闭合。\n\n错误信息会显示行号。检查这一行和它上面的一行。',
      ex: [
        { prompt: '在一行 for 上出现 SyntaxError。最可能的原因是什么？', options: ['行尾少了冒号', '数字错了', '电机没接好', '机器人太慢'], explain: 'for、while、if 和 def 的行尾都必须有冒号。' },
        { prompt: '这个程序应该走一个边长 300 mm 的正方形并回到起点，但有两个错误。把它们改正。', hint: '在 range(4) 后面加冒号，并把 robo.turn(-90) 缩进到 for 里面。' },
      ],
    },
    u11l2: {
      title: '用 print 排查',
      intro: 'print() 会在输出面板显示数值。这是了解机器人在“想”什么的最简单方法：走了多远、传感器读到什么、heading 是多少。\n\n在真实主机上，print 的内容会显示在 Pybricks Code 的终端里。',
      ex: [
        { prompt: '这个程序会输出什么？', options: ['250', '0', '25', '出错'], explain: 'distance() 记录从开始到现在走过的 mm。' },
        { prompt: '机器人开到黑色带。输出它走了多远。', hint: '在 robo.stop() 之后写 print(robo.distance())。' },
      ],
    },
    u11l3: {
      title: '修好任务',
      intro: '大多数 bug 都很小：用 cm 代替了 mm、正负号反了、某一行顺序不对。\n\n运行程序，看看机器人去了哪里，再和你想要的比较。',
      ex: [
        { prompt: '机器人本该左转却右转了。你要改什么？', options: ['角度的正负号', '速度', '端口', '轮子直径'], explain: '正数向右转，负数向左转。' },
        { prompt: '这个程序应该到达黄色区域，但有两个 bug。找出并改正它们。', hint: 'straight(80) 应该是 800 mm，转向应该向左：turn(-90)。' },
      ],
    },
    u11l4: {
      title: '端口错了',
      intro: '创建设备时出现 OSError，通常表示程序用的端口上没有接设备，或者接的是别的设备。\n\n在默认机器人上，颜色传感器接在 D 端口。',
      ex: [
        { prompt: '程序在 sensor = ColorSensor(Port.F) 这一行报 OSError 停下。你要检查什么？', options: ['传感器实际接在哪个端口', '轮子大小', '机器人速度', '注释'], explain: '这个错误说明那个端口上什么也没找到。' },
        { prompt: '这个程序应该停在红色区域，但报错停止了。修好它。', hint: '颜色传感器接在 Port.D。' },
      ],
    },
    u12l1: {
      title: '从基地 2 出发',
      intro: '在 FLL 场地桌上，有些任务离另一个出发区更近。在 BatControl 里，基地 2 在右边，机器人出发时朝左。\n\n命令完全一样：机器人朝向哪里，哪里就是前方。',
      ex: [
        { prompt: '机器人从基地 2 出发，朝左。哪条命令让它驶向蓝色区域？', options: ['robo.straight(640)', 'robo.straight(-640)', 'robo.turn(180)', 'robo.curve(640, 90)'], explain: '机器人朝左，正对蓝色区域，所以向前是正数。' },
        { prompt: '从基地 2 出发，去蓝色区域，再回到基地 2。', hint: '蓝色区域的中心在前方 642 mm。' },
      ],
    },
    u12l2: {
      title: '与时间赛跑',
      intro: '比赛中每一秒都很重要。提高 straight_speed 和 straight_acceleration，但要记住：在真实机器人上，太快可能打滑，精度会下降。\n\n使用 62.4 mm 车轮时，SPIKE 电机的最大轮速大约是 540 mm/s。',
      ex: [
        { prompt: '在一段很长的直线路线上，哪个改动最有帮助？', options: ['提高 straight_speed', '提高 turn_rate', '减小 axle_track', '加上 wait(100)'], explain: '直线路线上，关键是行驶速度。' },
        { prompt: '在 8 秒内经过红色区域和蓝色区域，再回到基地 1。', hint: 'robo.settings(straight_speed=480, straight_acceleration=1500)、straight(1480) 和 straight(-1480)。' },
      ],
    },
    u12l3: {
      title: '完整的一轮',
      intro: '完整的一轮会连起多个任务，并在某个基地结束。先做计划：每个物体在哪里、哪条路线不会撞到东西、最后停在哪里。\n\n在基地 2 结束可以省掉返回的路。',
      ex: [
        { prompt: '规划一轮比赛，最好的第一步是什么？', options: ['在场地上画出路线并测量', '随便写代码再测试', '把速度调到最大', '只用弯道'], explain: '路线量好了（测距尺工具能帮忙），代码就能更快写对。' },
        { prompt: '把箱子推到蓝色区域，再去绿色区域，最后停在基地 2。', hint: 'straight(1300)、turn(-41)、straight(971)、turn(126)、straight(562)。' },
      ],
    },
    u12l4: {
      title: '最终挑战',
      intro: '把学到的东西结合起来：沿线走到尽头，再用灯光和哔声表示已经到达。\n\n恭喜：学完这一课，你就掌握了 FLL 中常用的 Pybricks 主要命令。',
      ex: [
        { prompt: '要知道一个任务在真实机器人上是否真的可靠，最好的办法是什么？', options: ['运行多次，看看是否每次都成功', '运行一次', '只看代码', '只在模拟器里测试'], explain: '好的任务每次都能成功，而不是只成功一次。' },
        { prompt: '沿线走到尽头，然后把灯变成绿色并发出哔声。', hint: 'while robo.distance() < 1300: 用 kp 巡线；然后 robo.stop()、hub.light.on(Color.GREEN)、hub.speaker.beep()。' },
      ],
    },
  },

  comments: {
    '3) Mission commands': '3) 任务指令',
    '40 cm forward': '向前 40 cm',
    '20 cm backward': '向后 20 cm',
    right: '向右',
    'left, back to where it was': '向左，回到原来的方向',
    '"Go 300 mm to the left" with differential drive:': '用差速驱动“向左走 300 mm”：',
    'wide curve to the left': '向左的缓弯',
    faster: '更快',
    'very slow': '非常慢',
    'drives for 2 seconds': '行驶 2 秒',
    'Calibration test: drive 1000 mm and measure with a tape measure': '校准测试：行驶 1000 mm，用卷尺测量',
    'Then spin a full turn and check where the robot points': '然后转一整圈，看机器人朝向哪里',
    'half a turn': '转半圈',
    back: '转回来',
    'drives while the arm turns': '附件转动的同时行驶',
    open: '张开',
    'close (grab the piece)': '闭合（夹住零件）',
    'goes to 120': '转到 120',
    'already there, does not move': '已经在那里，不动',
    'back to zero': '回到零',
    'Proportional line follower': '比例巡线',
    'PID line follower': 'PID 巡线',
    '300 mm square': '300 mm 正方形',
    'Write your commands here': '在这里写你的指令',
    'complete: drive at 150 mm/s turning error * gain': '补全：以 150 mm/s 行驶，转向 error * gain',
    'complete here': '在这里补全',
    'Two laps of a 300 mm square, back to the start': '绕 300 mm 正方形两圈，回到起点',
    'complete: push the crate into the blue zone and come back': '补全：把箱子推到蓝色区域再返回',
    'complete: open, drive to the crate, close and bring it to the base': '补全：张开，开到箱子处，闭合，再带回基地',
    'Leave the base, go to the red zone and come back': '离开基地，开到红色区域再返回',
    'Claws: 0 degrees = closed, 90 degrees = open': '夹爪：0° = 闭合，90° = 张开',
    'Close both claws on the crates': '两个夹爪都夹住箱子',
    'Drive 500 mm forward': '前进 500 mm',
    'Go to the yellow zone': '开到黄色区域',
    'turn around': '掉头',
    'complete: drive 80 cm using mm()': '补全：用 mm() 前进 80 cm',
    'complete: drive the distance, then turn the angle': '补全：先走这段距离，再转这个角度',
    'complete: end exactly at 120 degrees': '补全：正好停在 120 度',
    'complete: first wait for RED, then for BLACK': '补全：先等红色，再等黑色',
    'complete: follow the line for 3 seconds (3000 ms)': '补全：巡线 3 秒（3000 ms）',
    'complete: follow the line to the end, then turn the light green and beep': '补全：沿线走到尽头，然后亮绿灯并发出哔声',
    'complete: go to the yellow zone and come back': '补全：去黄色区域再回来',
    'complete: grab the crate, drop it in the red zone and return to the base': '补全：抓住箱子，放到红色区域，再回到基地',
    'complete: if the sensor sees RED turn left, otherwise turn right': '补全：传感器看到红色就左转，否则右转',
    'complete: keep driving until 600 mm': '补全：一直前进到 600 mm',
    'complete: leave the loop when the sensor sees BLACK': '补全：传感器看到黑色时跳出循环',
    'complete: print how far the robot drove': '补全：输出机器人走了多远',
    'complete: push the crate into the red zone and come back': '补全：把箱子推到红色区域再回来',
    'complete: wait until the heading reaches 90': '补全：等到 heading 到达 90',
  },
};
