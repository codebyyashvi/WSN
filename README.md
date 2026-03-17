# WSN
```mermaid
%%{init: {'theme': 'base'}}%%
flowchart TD
    A[Intruder Enters Farm] --> B[Ultrasonic Sensor Detects]
    A --> D[DHT11 Monitors Environment]

    B --> E[ESP8266]
    C --> E
    D --> E

    E --> F{Intruder Confirmed?}

    F -- No --> G[Continue Monitoring]

    F -- Yes --> H[LED Turns ON]
    F -- Yes --> I[Buzzer Activated]
    F -- Yes --> J[Servo Rotates Camera/Direction]

    E --> K[ESP8266 Sends Data to Server]
    K --> L[Website Dashboard Updates]

    L --> M[User Views Intruder on Phone]
