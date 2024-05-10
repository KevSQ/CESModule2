#ifndef CHARACTER_H
#define CHARACTER_H

#include <TFT_eSPI.h>
#include <Arduino.h>

class Character {
  private:
    TFT_eSPI& tft; // Reference to TFT object
    int posX;
    int posY;
    int radius;
    uint16_t color;

  public:
    Character(TFT_eSPI& tft, int x, int y, int r, uint16_t c);
    void draw();
    void moveTo(int x, int y);
    void moveBy(int dx, int dy);
};

#endif
