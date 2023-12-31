#include <DHT.h>     
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <ArduinoJson.h>    

#define DHTTYPE DHT11
#define DHTPIN  13
DHT dht(DHTPIN, DHTTYPE);
#define RELAY_PIN 26
#define led  12
#define heat 25
#define FIREBASE_HOST "https://iot-g36-default-rtdb.firebaseio.com/" 
#define FIREBASE_AUTH "AIzaSyAaf9sSo_f3s8WW9Hidi2TuPHA5LaS0-2Q"   
#define WIFI_SSID "Virus wifi"   
#define WIFI_PASSWORD "16161616"

FirebaseAuth auth;
FirebaseConfig config;
FirebaseData firebaseData; 
float temperature, humidity, temp = 0, hum = 0;
int preValue = 0, preLed = 0;

void ketnoiwifi()
{
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("connecting ");

  while (WiFi.status() != WL_CONNECTED) 
  {
    Serial.print(".");
    delay(300);
  }

  Serial.println();
  Serial.print("connected ");
  Serial.println(WiFi.localIP());
}

void setup() 
{
  Serial.begin(9600);

  ketnoiwifi();

  config.api_key = FIREBASE_AUTH;
  config.database_url = FIREBASE_HOST;

  if (Firebase.signUp(&config, &auth, "", "")){
    Serial.println("ok");
  }
  else{
    Serial.printf("%s\n", config.signer.signupError.message.c_str());
  }

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  pinMode(DHTPIN, OUTPUT);
  pinMode(RELAY_PIN, OUTPUT);
  pinMode(led, OUTPUT);
  pinMode(heat, OUTPUT);

  dht.begin();
}

void sendSensor(float tempValue, float humValue) {
  Firebase.RTDB.setFloat(&firebaseData, "sensor/temperature", tempValue);
  Firebase.RTDB.setFloat(&firebaseData, "sensor/humidity", humValue);
}

int readSteam() {
  int value = 0;
  if (Firebase.RTDB.getInt(&firebaseData, "/steam/value")) {
    if (firebaseData.dataType() == "string") {
      String stringValue = firebaseData.stringData();
      value = stringValue.toInt();
      Serial.println("Steam status: " + String(value));
    } else {
      Serial.println("Data is not an integer.");
    }
  } else {
    Serial.println("Failed to get data from Firebase.");
  }

  return value;
}

int readBrightness() {
  int value = 0;
  if (Firebase.RTDB.getInt(&firebaseData, "/brightness/value")) {
      if (firebaseData.dataType() == "string") {
          String stringValue = firebaseData.stringData();
          value = stringValue.toInt();
          Serial.println("Brightness: " + String(value));
      } else {
          Serial.println("Data is not a string.");
      }
  } else {
      Serial.println("Failed to get data from Firebase.");
  }

  return value;
}

int readLed() {
  int value = 0;
  if (Firebase.RTDB.getInt(&firebaseData, "/alert/value")) {
      if (firebaseData.dataType() == "string") {
          String stringValue = firebaseData.stringData();
          value = stringValue.toInt();
          Serial.println("Alert: " + String(value));
      } else {
          Serial.println("Data is not a string.");
      }
  } else {
      Serial.println("Failed to get data from Firebase.");
  }

  return value;
}

void loop() 
{
  if (WiFi.status() != WL_CONNECTED) ketnoiwifi();

  delay(1000);
  humidity = dht.readHumidity();
  temperature = dht.readTemperature();

  if (isnan(humidity) || isnan(temperature)) {
    Serial.println(F("Failed to read from DHT sensor!"));
    return;
  }

  Serial.println("Humidity: " + String(humidity,2) + "%");
  Serial.println("Temperature: " + String(temperature,2) + "C");
  Serial.println("---");

  Serial.println(hum);
  Serial.println(temp);

  if (temperature != temp || humidity!= hum )
  {
    temp = temperature;
    hum = humidity;

    sendSensor(temp, hum);
  }

  int ledValue = readLed();
  if(ledValue != preLed && ledValue == 1) {
    digitalWrite(led, HIGH);
    digitalWrite(RELAY_PIN, HIGH);
    delay(500);
    digitalWrite(RELAY_PIN, LOW);

    preLed = ledValue;
  }
  else if(ledValue != preLed) {
    digitalWrite(led, LOW);
    digitalWrite(RELAY_PIN, HIGH);
    delay(500);
    digitalWrite(RELAY_PIN, LOW);

    preLed = ledValue;
  }

  int steamValue = readSteam();
  if(steamValue != preValue) {
    digitalWrite(RELAY_PIN, HIGH);
    delay(500);
    digitalWrite(RELAY_PIN, LOW);

    preValue = steamValue;
  }

  int brightness = readBrightness();
  if(brightness > 0) {
    analogWrite(heat, brightness);
  }
  else {
    analogWrite(heat, 0);
  }

}