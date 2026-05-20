def clean_placeholders(
    text,
    asset_details
):

    if not isinstance(text, str):
        return text

    if not asset_details:
        return text

    primary_asset = asset_details[0]

    hostname = (
        primary_asset["hostname"]
    )

    replacements = {

        "<intf>":
            "GigabitEthernet0/1",

        "<server>":
            "10.10.10.5",

        "{hostname}":
            hostname,

        "backup_{hostname}.cfg":
            f"backup_{hostname}.cfg"
    }

    for old, new in replacements.items():

        text = text.replace(
            old,
            new
        )

    return text


def recursively_clean(
    data,
    asset_details
):

    if isinstance(data, dict):

        cleaned = {}

        for key, value in data.items():

            cleaned[key] = recursively_clean(
                value,
                asset_details
            )

        return cleaned

    elif isinstance(data, list):

        return [
            recursively_clean(
                item,
                asset_details
            )
            for item in data
        ]

    elif isinstance(data, str):

        return clean_placeholders(
            data,
            asset_details
        )

    return data