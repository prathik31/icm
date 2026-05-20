from groq import Groq

from config.settings import (
    settings
)

client = Groq(

    api_key=settings.GROQ_API_KEY
)


def generate_llm_response(

    system_prompt,
    user_prompt
):

    response = client.chat.completions.create(

        model="llama-3.3-70b-versatile",

        messages=[

            {
                "role": "system",
                "content": system_prompt
            },

            {
                "role": "user",
                "content": user_prompt
            }
        ],

        temperature=0.2
    )

    return (
        response
        .choices[0]
        .message
        .content
    )
