from pathlib import Path

import pandas as pd


DATA_PATH = Path(__file__).resolve().parents[2] / "data" / "network_inventory.csv"


inventory_df = pd.read_csv(DATA_PATH)


def _as_python(value):

    return value.item() if hasattr(value, "item") else value


def get_asset_details(asset_ids):

    results = []

    for asset_id in asset_ids:

        matched = inventory_df[
            inventory_df["asset_id"] == asset_id
        ]

        if matched.empty:
            continue

        row = matched.iloc[0]

        results.append({
            "asset_id": _as_python(row["asset_id"]),
            "hostname": _as_python(row["hostname"]),
            "asset_type": _as_python(row["asset_type"]),
            "vendor": _as_python(row["vendor"]),
            "model": _as_python(row["model"]),
            "os_version": _as_python(row["os_version"]),
            "region": _as_python(row["region"]),
            "criticality": _as_python(row["criticality_level"]),
            "redundancy_peer": _as_python(row["redundancy_peer_id"]),
            "connected_asset_count": _as_python(row["connected_asset_count"])
        })

    return results