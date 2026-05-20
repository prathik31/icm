def build_topology_summary(
    asset_details
):

    summaries = []

    for asset in asset_details:

        summary = f"""
Asset:
{asset['hostname']}

Type:
{asset['asset_type']}

Vendor:
{asset['vendor']}

Model:
{asset['model']}

Criticality:
{asset['criticality']}

Region:
{asset['region']}

Connected Assets:
{asset['connected_asset_count']}

Redundancy Peer:
{asset['redundancy_peer']}
"""

        summaries.append(
            summary.strip()
        )

    return "\n\n".join(summaries)


def build_vendor_guidance(
    asset_details
):

    guidance = []

    for asset in asset_details:

        vendor = (
            asset["vendor"]
            .lower()
        )

        model = asset["model"]

        os_version = (
            asset["os_version"]
        )

        if "cisco" in vendor:

            guidance.append(f"""
Cisco IOS-XE Operational Guidance

Device Model:
{model}

OS Version:
{os_version}

Firmware Upgrade Examples:
- install add file flash:cat9k_iosxe.17.09.04.SPA.bin activate commit
- verify /md5 flash:cat9k_iosxe.17.09.04.SPA.bin
- show install summary
- show version | include IOS-XE

Validation Commands:
- show bgp summary
- show mpls ldp neighbor
- show platform
- show processes cpu sorted

Rollback Examples:
- install rollback to committed
- install remove inactive
""")

        elif "juniper" in vendor:

            guidance.append(f"""
JunOS Operational Guidance

Device Model:
{model}

OS Version:
{os_version}

Firmware Upgrade Examples:
- request system software add /var/tmp/junos.tgz reboot
- request system snapshot slice alternate
- show system software

Validation Commands:
- show route summary
- show bgp summary
- show chassis routing-engine

Rollback Examples:
- request system software rollback
- rollback 1
""")

        elif "nokia" in vendor:

            guidance.append(f"""
Nokia SR OS Operational Guidance

Device Model:
{model}

OS Version:
{os_version}

Firmware Upgrade Examples:
- admin software upgrade
- admin rollback save

Validation Commands:
- show router bgp summary
- show service service-using
- show redundancy synchronization

Rollback Examples:
- admin rollback revert
""")

    return "\n".join(guidance)
