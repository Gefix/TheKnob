# The Knob with LED indicators and RF Transmitter v 1.0

![TheKnob_bb](./doc/TheKnob_bb.png)

## Description

A wireless knob that can transmit up to 10 meters the rotation direction and how many steps the handle has rotated (by sending one radio pulse per 4 motor steps). No battery, near instant reaction times and no programming required - pure analog and boolean logic circuitry. It takes < 10ms from the time the motor shaft starts rotating to the time the LED lights and the first FM signal pulse begins transmission.

## Mechanical components

1x Stepper Motor with large number of steps per revolution - the 28BYJ-48 used here requires **2048** steps for one full revolution.

1x Shaft handle for easier rotation by hand - 6cm long. The 28BYJ-48 has a 5mm diameter shaft with 1mm cuts on opposing sides. The handle 3D printed according to these specifications.

## Electrical components

All wires are from a 350-piece breadboard jumper set except the four wires connecting the breadboard to the motor. They are flexible M-M jumper wires.

The four-phase full bridge rectifier (D1-9) serves as the power source. While the motor shaft is rotating there will be enough current produced to power an LED as well as send a wireless signal carrying the direction of rotation and speed information.

Two 470µF (C3-4) capacitors stabilize the circuit voltage.

The four 6xNOT and six 4xNAND gates drive the digital boolean logic for detecting the direction of rotation, diverting power to the corresponding LED and generating the signal to be sent via the wireless transmitter. They are the all of the HC or High-speed CMOS family. This allows them to operate under very low Vcc (2-6V recommended operating conditions).

The RF module used is the TWS-BS-3 434MHz hobby transmitter able to work under very low supply voltages (rated at 1.5-12V).

One long wire (12.6cm - the longest from the 350-piece set) serves as the antenna for the transmitter.

Two 330Ω resistors limit the current to each of the LEDs.

The two 47µF capacitors near the LEDs absorb the current from single-pulse false positives when starting or stopping the rotation. When the stepper motor is halted or started in the middle of a 4-step cycle, the wrong direction can be detected for a duration of one cycle.

## Digital Logic

![TheKnob_bb](./doc/TheKnob_logic.svg)

Built using CircuitVerse. The logic diagram is an almost exact copy of the physical version. The CW 25% and CCW 75% duty cycles are AND-ed using  U3 and U9 to generate the signal for RF transmitter. The CW 25%'s NAND is in U9, and there is no NOT afterwards since we are feeding it into a NAND gate that merges the two signals anyway. U3 is only used for inverting the CCW 75% duty cycle, before going into the merging gate on the U9.

## Source code

None needed.

# The Knob receiver

Coming soon.