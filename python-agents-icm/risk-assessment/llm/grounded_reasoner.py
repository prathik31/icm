from llm.client import (
    generate_llm_response
)


class GroundedReasoner:

    # =====================================================
    # SYSTEM PROMPT
    # =====================================================
    def build_system_prompt(self):

        return """

You are an expert telecom operational
risk intelligence analyst.

You analyze:
- telecom infrastructure changes
- operational dependencies
- historical outages
- rollback risk
- blast radius propagation
- infrastructure instability

STRICT RULES:

- NEVER hallucinate facts
- ONLY use provided evidence
- NEVER invent outages
- NEVER exaggerate risk
- ONLY reason from grounding evidence
- Recommendations must be operationally realistic
- Focus on enterprise CAB decision support

You must produce:
- executive-grade reasoning
- technically grounded explanations
- operationally actionable recommendations

"""

    # =====================================================
    # USER PROMPT
    # =====================================================
    def build_user_prompt(

        self,
        prediction
    ):

        topology = prediction[
            "topology_intelligence"
        ]

        historical = prediction[
            "historical_intelligence"
        ]

        similarity = prediction[
            "similarity_intelligence"
        ]

        evidence = prediction[
            "grounding_evidence"
        ]

        indicators = prediction[
            "risk_indicators"
        ]

        similar_changes = similarity[
            "top_similar_changes"
        ]

        return f"""

# PREDICTED RISK

Risk Score:
{prediction["risk_score"]}

Risk Level:
{prediction["risk_level"]}

Blast Radius:
{prediction["blast_radius"]}

Confidence:
{prediction["confidence"]}

# TOPOLOGY INTELLIGENCE

Topology Centrality:
{topology["topology_centrality_score"]}

Dependency Density:
{topology["dependency_density"]}

Infrastructure Blast Factor:
{topology["infra_blast_factor"]}

Core Infrastructure Ratio:
{topology["core_infra_ratio"]}

Redundancy Coverage:
{topology["redundancy_coverage_ratio"]}

# HISTORICAL INTELLIGENCE

Historical Failure Rate:
{historical["historical_failure_rate"]}

Outage Correlation:
{historical["outage_correlation"]}

Operational Instability:
{historical["execution_variance"]}

Expected Service Impact:
{historical["service_impact_expectation"]}

# RISK INDICATORS

{indicators}

# GROUNDING EVIDENCE

Similar Changes Analyzed:
{evidence["similar_changes_analyzed"]}

Similar Changes With Outages:
{evidence["similar_changes_with_outages"]}

Similar Changes With Rollbacks:
{evidence["similar_changes_with_rollbacks"]}

Similar Changes Failed:
{evidence["similar_changes_failed"]}

# HISTORICAL PRECEDENTS

{similar_changes}

====================================================

Generate STRICT JSON ONLY.

Schema:

{{
  "executive_summary": "...",
  "technical_analysis": "...",
  "blast_radius_analysis": "...",
  "historical_pattern_analysis": "...",
  "recommendations": [
    "...",
    "..."
  ],
  "cab_guidance": "..."
}}

DO NOT return markdown.
DO NOT explain outside JSON.
"""

    # =====================================================
    # GENERATE REASONING
    # =====================================================
    def generate_reasoning(

        self,
        prediction
    ):

        system_prompt = (
            self.build_system_prompt()
        )

        user_prompt = (
            self.build_user_prompt(
                prediction
            )
        )

        response = generate_llm_response(

            system_prompt,

            user_prompt
        )

        return response
