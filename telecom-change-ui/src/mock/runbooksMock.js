export const runbooks = [
  {
    crId: '258e6000',
    title: 'MySQL Cluster Maintenance Runbook',
    generatedBy: 'llama-3.3-70b-versatile',
    status: 'APPROVED',
    riskLevel: 'LOW',
    blastRadius: 'MINIMAL',
    durationMinutes: 120,
    metrics: {
      executionSteps: 4,
      preChecks: 3,
      rollbackSteps: 2,
      monitoringRules: 2,
    },
    aiNotes:
      'LOW risk with MINIMAL blast radius; however, additional redundancy is recommended to avoid single-node failures.',
    sections: {
      preChecks: [
        {
          id: 1,
          title: 'Verify MySQL cluster status',
          command: 'mysql -u root -e "SHOW STATUS LIKE \'wsrep_cluster_size\'"',
          expected: 'wsrep_cluster_size | 2',
          timeout: '30s',
        },
        {
          id: 2,
          title: 'Check disk space',
          command: 'df -h /var/lib/mysql',
          expected: 'Available > 5GB',
          timeout: '15s',
        },
      ],
      executionSteps: [
        {
          id: 1,
          title: 'Pause MySQL replication',
          command: 'STOP SLAVE;',
          expected: 'Replication paused',
          rollback: 'START SLAVE;',
          timeout: '60s',
        },
        {
          id: 2,
          title: 'Apply schema migration',
          command: 'mysql -u root < /tmp/migration.sql',
          expected: 'Migration applied without errors',
          rollback: 'Apply rollback.sql',
          timeout: '300s',
        },
      ],
      validationSteps: [
        {
          id: 1,
          title: 'Confirm cluster health',
          command: 'mysql -u root -e "SHOW STATUS LIKE \'wsrep_local_state_comment\'"',
          expected: 'Synced',
        },
      ],
      rollbackSteps: [
        {
          id: 1,
          title: 'Resume replication',
          command: 'START SLAVE;',
          expected: 'Replication resumed',
        },
      ],
      monitoring: [
        {
          id: 1,
          title: 'Monitor cluster size',
          frequency: '5m',
        },
      ],
      escalation: [
        {
          id: 1,
          condition: 'Replication errors detected',
          action: 'Notify DBA team and escalate to on-call',
        },
      ],
    },
  },
]
