#include <DHT.h>     
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <ArduinoJson.h>    

#define DHTTYPE DHT11
#define DHTPIN  13
DHT dht(DHTPIN, DHTTYPE);
#define RELAY_PIN 26
#define steam 18
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
  pinMode(steam, OUTPUT);

  dht.begin();
}

String generateRandomKey() {
  String characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_";
  String key = "";

  for (int i = 0; i < 20; i++) {
    key += characters[random(0, characters.length())];
  }

  return key;
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

void alertAndSteam(float tempValue, float humValue) {
  if (tempValue >= 30 || humValue >= 70) {
    digitalWrite(led, HIGH);
    digitalWrite(steam, HIGH);
  }
  else {
    digitalWrite(led, LOW);
    digitalWrite(steam, LOW);
  }
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

  alertAndSteam(temperature, humidity);

  Serial.println(hum);
  Serial.println(temp);

  if (temperature != temp || humidity!= hum )
  {
    temp = temperature;
    hum = humidity;

    sendSensor(temp, hum);
  }

  int steamValue = readSteam();
  if(steamValue == 1) {
    digitalWrite(steam, HIGH);
  }
  else {
    digitalWrite(steam, LOW);
  }

  int brightness = readBrightness();
  Serial.println(brightness);
  if(brightness > 0) {
    analogWrite(heat, brightness);
    digitalWrite(RELAY_PIN, HIGH);
  }
  else {
    analogWrite(heat, 0);
    digitalWrite(RELAY_PIN, LOW);
  }

}