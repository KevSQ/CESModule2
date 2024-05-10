#include <Arduino.h>

#define JOYSTICK_X_PIN 27
#define JOYSTICK_Y_PIN 26
#define BUTTON_PIN 25
#define POTENTIOMETER_PIN 33

void setup() {
  Serial.begin(115200);
  
  pinMode(JOYSTICK_X_PIN, INPUT);
  pinMode(JOYSTICK_Y_PIN, INPUT);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(POTENTIOMETER_PIN, INPUT);
}

void loop() {
  // Read joystick position (X and Y axes)
  int joystickX = analogRead(JOYSTICK_X_PIN);
  int joystickY = analogRead(JOYSTICK_Y_PIN);
  
  // Read button state (assuming active LOW)
  int buttonState = digitalRead(BUTTON_PIN);

  // Read potentiometer value
  int potValue = analogRead(POTENTIOMETER_PIN);

  // Interpolate joystick values
  for (int i = 0; i < 10; i++) {
    float t = float(i) / 10.0; // Interpolation factor
    int interpolatedX = lerp(joystickX, analogRead(JOYSTICK_X_PIN), t);
    int interpolatedY = lerp(joystickY, analogRead(JOYSTICK_Y_PIN), t);

    // Send interpolated data over serial
    // Serial.println(interpolatedX);
    // Serial.print(',');
    // Serial.print(interpolatedY);
    // Serial.print(',');
    // Serial.print(buttonState);
    // Serial.print(',');
    // Serial.println(potValue);

    Serial.println(String(interpolatedX) + "," + String(interpolatedY) + "," + String(buttonState) + "," + String(potValue));

    delay(55); // Adjust delay for desired interpolation speed
  }
}

// Linear interpolation function
int lerp(int a, int b, float t) {
  return int(float(a) + t * (float(b) - float(a)));
}

