import SSD1331
import time
from sys import stdin

# ######################
# For RPI3
# SSD1331_PIN_CS  = 8
# SSD1331_PIN_DC  = 23
# SSD1331_PIN_RST = 24
# For RPI2
SSD1331_PIN_CS  = 23
SSD1331_PIN_DC  = 24
SSD1331_PIN_RST = 25
# #####################

DISPLAY_MAX_X = 95
DISPLAY_MAX_Y = 63

GAUGE_MIN = 0
GAUGE_MAX = 511

GAUGE_LINE_RES = (GAUGE_MAX - GAUGE_MIN) / (DISPLAY_MAX_X + 1.0)

if __name__ == '__main__':
    currentX = 0

    device = SSD1331.SSD1331(SSD1331_PIN_DC, SSD1331_PIN_RST, SSD1331_PIN_CS)
    try:
        device.EnableDisplay(True)
        device.Clear()
        time.sleep(0.2)
        while True:
            newValue = int(stdin.readline())
            newValue = max(GAUGE_MIN, min(newValue, GAUGE_MAX))

            newX = int(newValue // GAUGE_LINE_RES)

            if newValue < GAUGE_MAX:
                alpha = int(255 * (newValue - newX * GAUGE_LINE_RES) / (GAUGE_LINE_RES))
                alpha = min(alpha, 255)
            else:
                alpha = 255

            while currentX < newX:
                device.DrawLine(currentX, 0, currentX, DISPLAY_MAX_Y, SSD1331.COLOR_BLUE)
                currentX += 1

            while currentX > newX:
                device.DrawLine(currentX, 0, currentX, DISPLAY_MAX_Y, SSD1331.COLOR_BLACK)
                currentX -= 1

            device.DrawLine(currentX, 0, currentX, DISPLAY_MAX_Y, SSD1331.Color656(0, 0, alpha))
    finally:
        device.EnableDisplay(False)
        device.Remove()