import json

from kafka import KafkaConsumer


consumer = KafkaConsumer(

    "risk-assessments-dlq",

    bootstrap_servers="localhost:9092",

    auto_offset_reset="latest",

    group_id="dlq-group",

    value_deserializer=lambda x:
        json.loads(x.decode("utf-8"))
)

print(
    "\nDLQ Listener Started..."
)

for message in consumer:

    print(
        "\nFAILED EVENT DETECTED\n"
    )

    print(
        json.dumps(
            message.value,
            indent=2
        )
    )