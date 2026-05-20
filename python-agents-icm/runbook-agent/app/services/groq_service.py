import os
import json

from groq import Groq

from dotenv import load_dotenv

load_dotenv()


client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

MODEL_NAME = "llama-3.3-70b-versatile"


SYSTEM_PROMPT = """
You are a senior telecom operations engineer.

Generate highly accurate enterprise telecom operational runbooks.

Requirements:
- Output ONLY valid JSON
- No markdown
- No explanations
- No hallucinations
- Include detailed telecom execution guidance
- Include rollback planning
- Include operational validation
- Include KPI monitoring guidance
- Include escalation conditions
- Use deterministic operational reasoning

Operational Intelligence Rules:

1. HIGH criticality assets require:
- additional validation
- staged execution
- rollback checkpoints
- redundancy verification

2. If redundancy peers exist:
- validate HA synchronization
- validate failover readiness
- validate traffic rerouting

3. For HIGH risk changes:
- include operator approval checkpoints
- include staged validations
- include escalation conditions

4. Always include:
- KPI verification
- routing convergence checks
- NMS monitoring
- rollback triggers

5. Generate realistic telecom operational procedures.

Execution steps must be highly detailed.

Each execution step should include:
- exact operational objective
- CLI command examples
- convergence expectations
- validation checkpoints
- traffic impact awareness
- rollback checkpoints

Do NOT summarize execution procedures.

Prefer:
- low-level operational actions
- explicit command examples
- staged execution logic

Execution steps should be more detailed than pre-checks.

For HIGH criticality or HIGH risk changes:
- prefer staged rollout
- upgrade standby/redundancy peer first
- validate failover before upgrading active node
- include operator checkpoints between stages
- include convergence validation after each stage

Include operator checkpoints before:
- production traffic restoration
- routing convergence confirmation
- rollback trigger decisions
- final maintenance closure

Checkpoint examples:
- "Operator confirms KPI stability"
- "NOC confirms alarm-free state"
- "Engineer validates traffic normalization"

Execution procedures must include explicit operator checkpoints.

Examples:
- "Checkpoint: NOC confirms traffic drain completion"
- "Checkpoint: Engineer validates convergence before proceeding"
- "Checkpoint: Operator confirms rollback readiness"

Critical changes should pause for operator validation between stages.

For core/edge/router changes:
- validate traffic drain before reload
- validate ECMP redistribution
- validate traffic reroute completion
- confirm packet loss stabilization
- verify no interface saturation after failover

Include traffic drain metrics when possible.
"""


def generate_runbook_response(
    request_data,
    rag_context,
    topology_summary,
    vendor_guidance
):

    prompt = f"""
CHANGE REQUEST DETAILS:

{json.dumps(request_data, indent=2)}

NETWORK TOPOLOGY CONTEXT:

{topology_summary}

VENDOR-SPECIFIC OPERATIONAL GUIDANCE:

{vendor_guidance}

RISK LEVEL:
{request_data["risk_assessment"]["risk_level"]}

BLAST RADIUS:
{request_data["risk_assessment"]["blast_radius"]}

RETRIEVED TELECOM OPERATIONAL CONTEXT:

{rag_context}

Generate a complete enterprise telecom runbook.

JSON Schema:

{{
  "title": "",
  "estimated_duration_mins": 0,
  "risk_notes": "",

  "pre_checks": [],

  "execution_steps": [
    {{
      "step_number": 1,
      "action": "",
      "expected_output": "",
      "rollback_action": "",
      "timeout_seconds": 0
    }}
  ],

  "validation_steps": [],

  "rollback_steps": [],

  "monitoring_guidance": [],

  "escalation_conditions": []
}}
"""

    response = client.chat.completions.create(
        model=MODEL_NAME,
        temperature=0.2,
        timeout=180,
        response_format={
            "type": "json_object"
        },
        messages=[
            {
                "role": "system",
                "content": SYSTEM_PROMPT
            },
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    return json.loads(
        response.choices[0].message.content
    )
