// Cabeçalho padrão dos programas do BatControl. Os nomes no código são em inglês para
// servirem a equipes de qualquer país; os comentários são traduzidos pelo idioma do app.
export const IMPORTS = `from pybricks.hubs import PrimeHub
from pybricks.pupdevices import Motor, ColorSensor
from pybricks.parameters import Port, Direction, Stop, Color
from pybricks.robotics import DriveBase
from pybricks.tools import wait, StopWatch`;

export const SETUP_BASE = `${IMPORTS}

hub = PrimeHub()
left_motor = Motor(Port.A, Direction.COUNTERCLOCKWISE)
right_motor = Motor(Port.B)
robot = DriveBase(left_motor, right_motor, wheel_diameter=56, axle_track=140)`;

export const SETUP_FULL = `${SETUP_BASE}
left_arm = Motor(Port.C)
right_arm = Motor(Port.D)
sensor = ColorSensor(Port.E)`;

export const program = (body: string, full = true) => `${full ? SETUP_FULL : SETUP_BASE}

${body.trim()}
`;

/** Posição de largada padrão: dentro da base 1, virado para a direita do tapete. */
export const START = { x: 120, y: 220, h: 0 };
/** Largada na base 2 (lado direito), virado para a esquerda. */
export const START2 = { x: 2242, y: 220, h: 180 };

/** Cabeçalho gerado para as portas e medidas configuradas na aba Robô. */
export function setupFor(cfg: { ports: Record<string, string>; wheelDiameter: number; axleTrack: number }) {
  const p = cfg.ports;
  return `${IMPORTS}

hub = PrimeHub()
left_motor = Motor(Port.${p.leftWheel}, Direction.COUNTERCLOCKWISE)
right_motor = Motor(Port.${p.rightWheel})
robot = DriveBase(left_motor, right_motor, wheel_diameter=${cfg.wheelDiameter}, axle_track=${cfg.axleTrack})
left_arm = Motor(Port.${p.leftArm})
right_arm = Motor(Port.${p.rightArm})
sensor = ColorSensor(Port.${p.color})`;
}
