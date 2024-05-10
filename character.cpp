#include "character.h"

Character::Character(TFT_eSPI& tft, int x, int y, int r, uint16_t c)
  : tft(tft), posX(x), posY(y), radius(r), color(c) {}

void Character::draw() {
  tft.fillCircle(posX, posY, radius, color);
}

void Character::moveTo(int x, int y) {
  posX = x;
  posY = y;
}

void Character::moveBy(int dx, int dy) {
  posX += dx;
  posY += dy;
}
