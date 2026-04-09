%%{init: {'theme': 'base'}}%%
flowchart TD
    A[Artifact Movement / Unauthorized Access] --> B[Ultrasonic / Motion Sensor Detects]
    A --> D[DHT11 Monitors Temperature & Humidity]

    B --> E[ESP8266]
    D --> E

    E --> F{Theft Suspicion Confirmed?}

    F -- No --> G[Continue Monitoring]

    F -- Yes --> H[LED Alert Turns ON]
    F -- Yes --> I[Buzzer Alarm Activated]
    F -- Yes --> J[Servo Rotates Camera Towards Artifact]

    E --> K[ESP8266 Sends Alert Data to Server]
    K --> L[Website Dashboard Updates]

    L --> M[Security Personnel Notified on Phone]