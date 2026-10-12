import {
  User,
  IncidentReport,
  CanonicalIncident,
  Observation,
  Claim,
  EvidenceItem,
  EvidenceRelation,
  VerificationDecision,
  EvidenceGap,
  Intervention,
  OutcomeMeasurement,
  CommunityAction,
  AuditEvent
} from './types.js';
import { DatabaseSchema } from './db.js';

export function seedInitialData(): DatabaseSchema {
  const users: User[] = [
    {
      id: 'usr-resident-priya',
      displayName: 'Priya Sharma',
      email: 'priya.sharma@greenfield.demo',
      role: 'resident',
      createdAt: '2026-01-01T08:00:00Z',
      status: 'active'
    },
    {
      id: 'usr-resident-marcus',
      displayName: 'Marcus Chen',
      email: 'marcus.chen@greenfield.demo',
      role: 'resident',
      createdAt: '2026-01-03T10:30:00Z',
      status: 'active'
    },
    {
      id: 'usr-verifier-elena',
      displayName: 'Elena Rostova',
      email: 'elena.rostova@proofmesh.demo',
      role: 'verifier',
      createdAt: '2025-11-15T09:00:00Z',
      status: 'active'
    },
    {
      id: 'usr-coordinator-tariq',
      displayName: 'Tariq Al-Mansoor',
      email: 'tariq.mansoor@civictwin.demo',
      role: 'coordinator',
      createdAt: '2025-10-10T08:00:00Z',
      status: 'active'
    },
    {
      id: 'usr-admin-aris',
      displayName: 'Dr. Aris Thorne',
      email: 'aris.thorne@civictwin.demo',
      role: 'admin',
      createdAt: '2025-09-01T08:00:00Z',
      status: 'active'
    }
  ];

  const incidents: CanonicalIncident[] = [
    {
      id: 'inc-elm-waterlog',
      title: 'Recurring Elm Street Low-Lying Culvert Waterlogging',
      category: 'waterlogging',
      canonicalLocation: {
        lat: 12.9716,
        lng: 77.5946,
        address: 'Elm St & 4th Cross Rd, Greenfield Ward',
        landmark: 'Near St. Jude Community Health Clinic',
        neighborhood: 'Greenfield Ward'
      },
      firstObservedAt: '2026-01-08T07:15:00Z',
      lastObservedAt: '2026-02-04T16:20:00Z',
      currentAssessment: 'Severe recurring waterlogging (up to 40cm water depth) across multiple rain events. A previous municipal suction clearing provided temporary surface relief on Jan 12, but waterlogging returned on Feb 2. Chronic culvert sediment buildup and intake trash clogging strongly suspected.',
      recurrenceCount: 4,
      resolvedCount: 1,
      status: 'recurring',
      riskLevel: 'high',
      criticalityScore: 88,
      distressSentimentScore: 82,
      priorityRank: 'critical_emergency',
      urgencyRationale: 'Compound priority driven by 4x recurrence, medical clinic access obstruction, and severe resident distress sentiment (82/100).',
      tags: ['flooding', 'drainage-choke', 'critical-access', 'clinic-road'],
      reportIds: ['rep-elm-001', 'rep-elm-002', 'rep-elm-003', 'rep-elm-004'],
      accountability: {
        department: 'Stormwater Drains & Municipal Culvert Maintenance (SWD)',
        assignedOfficer: {
          id: 'cust-murthy-swd',
          name: 'Er. K. Murthy',
          title: 'Junior Ward Engineer (Subordinate Field Operations)',
          department: 'Stormwater Drainage Division',
          level: 'subordinate_field_officer',
          contactEmail: 'k.murthy.swd@greenfieldward.gov.in',
          contactPhone: '+91 98450 22319'
        },
        supervisoryAuthority: {
          id: 'cust-sundaram-comm',
          name: 'Dr. Nandini Sundaram, IAS',
          title: 'Chief Municipal Commissioner & Public Safety Ombudsman',
          department: 'Municipal Corporation Executive Directorate',
          level: 'chief_commissioner',
          contactEmail: 'commissioner@greenfieldward.gov.in',
          contactPhone: '+91 94480 00100'
        },
        assignedAt: '2026-01-08T08:00:00Z',
        slaHours: 48,
        slaDeadline: '2026-01-10T08:00:00Z',
        slaStatus: 'escalated_to_superior',
        lastOfficerUpdate: 'Surface suction performed on Jan 12. No subterranean culvert inspection executed.',
        inactionDays: 6,
        escalationHistory: [
          {
            id: 'esc-elm-001',
            incidentId: 'inc-elm-waterlog',
            escalatedAt: '2026-02-03T10:00:00Z',
            escalatedBy: 'usr-verifier-elena',
            escalatedByName: 'Elena Rostova (Community Verifier)',
            fromOfficial: {
              id: 'cust-murthy-swd',
              name: 'Er. K. Murthy',
              title: 'Junior Ward Engineer (Subordinate Field Operations)',
              department: 'Stormwater Drainage Division',
              level: 'subordinate_field_officer',
              contactEmail: 'k.murthy.swd@greenfieldward.gov.in',
              contactPhone: '+91 98450 22319'
            },
            toOfficial: {
              id: 'cust-sundaram-comm',
              name: 'Dr. Nandini Sundaram, IAS',
              title: 'Chief Municipal Commissioner & Public Safety Ombudsman',
              department: 'Municipal Corporation Executive Directorate',
              level: 'chief_commissioner',
              contactEmail: 'commissioner@greenfieldward.gov.in',
              contactPhone: '+91 94480 00100'
            },
            reason: 'Subordinate Officer Murthy performed temporary surface suction on Jan 12 without inspecting underground brick culvert collapse. Waterlogging reoccurred 4x, blocking emergency clinic entrance. Officer unresponsive to repeated community notifications.',
            daysUnresponsive: 6,
            slaBreachedHours: 144,
            evidencePacketSummary: '4 verified timestamped resident photo claims, St. Jude clinic ambulance log, and missing robotic CCTV crawler inspection evidence packet attached.',
            status: 'urgent_override_dispatched',
            supervisoryActionNotes: 'COMMISSIONER NOTICE CMD-44: Executive override ordered. Department of Public Works directed to deploy robotic crawler camera and high-velocity suction within 48h. Disciplinary review opened on subordinate maintenance record.'
          }
        ]
      },
      createdAt: '2026-01-08T07:30:00Z',
      updatedAt: '2026-02-04T17:00:00Z'
    },
    {
      id: 'inc-oak-potholes',
      title: 'Oak Avenue Arterial Pothole Cluster & Base Course Erosion',
      category: 'potholes',
      canonicalLocation: {
        lat: 12.9752,
        lng: 77.5982,
        address: 'Oak Ave (between 7th & 9th Ave), Greenfield Ward',
        landmark: 'Opposite Metro Pillar 142',
        neighborhood: 'Greenfield Ward'
      },
      firstObservedAt: '2025-12-14T09:00:00Z',
      lastObservedAt: '2026-01-28T11:45:00Z',
      currentAssessment: 'Successive asphalt failures forming a 25-meter chain of deep potholes (up to 14cm depth). Cold-mix surface patches repeatedly dislodge following precipitation and heavy overnight freight transit.',
      recurrenceCount: 3,
      resolvedCount: 0,
      status: 'under_intervention',
      riskLevel: 'medium',
      criticalityScore: 64,
      distressSentimentScore: 55,
      priorityRank: 'elevated',
      urgencyRationale: 'Routine-to-elevated priority driven by 3x recurrence with moderate commuter distress (55/100).',
      tags: ['road-hazard', 'two-wheeler-risk', 'freight-route'],
      reportIds: ['rep-oak-001', 'rep-oak-002'],
      accountability: {
        department: 'Roads & Infrastructure Engineering Department (PWD)',
        assignedOfficer: {
          id: 'cust-sharma-pwd',
          name: 'Er. A. Sharma',
          title: 'Road Maintenance Supervisor (Ward Roads Unit)',
          department: 'Public Works Department',
          level: 'subordinate_field_officer',
          contactEmail: 'a.sharma.pwd@greenfieldward.gov.in',
          contactPhone: '+91 98450 33412'
        },
        supervisoryAuthority: {
          id: 'cust-sundaram-comm',
          name: 'Dr. Nandini Sundaram, IAS',
          title: 'Chief Municipal Commissioner & Public Safety Ombudsman',
          department: 'Municipal Corporation Executive Directorate',
          level: 'chief_commissioner',
          contactEmail: 'commissioner@greenfieldward.gov.in',
          contactPhone: '+91 94480 00100'
        },
        assignedAt: '2025-12-14T10:00:00Z',
        slaHours: 72,
        slaDeadline: '2025-12-17T10:00:00Z',
        slaStatus: 'within_sla',
        lastOfficerUpdate: 'Cold-mix asphalt patch scheduled for milling and hot-mix resurfacing.',
        inactionDays: 1,
        escalationHistory: []
      },
      createdAt: '2025-12-14T09:30:00Z',
      updatedAt: '2026-01-28T14:00:00Z'
    },
    {
      id: 'inc-market-waste',
      title: 'Market Square North Storm Drain Waste Accumulation',
      category: 'waste_accumulation',
      canonicalLocation: {
        lat: 12.9688,
        lng: 77.6011,
        address: 'North Commercial Alley, Market Square, Greenfield Ward',
        landmark: 'Wholesale Produce Dock Gate 3',
        neighborhood: 'Greenfield Ward'
      },
      firstObservedAt: '2026-01-02T18:00:00Z',
      lastObservedAt: '2026-02-05T08:30:00Z',
      currentAssessment: 'Nightly accumulation of commercial vegetable crates and unsegregated wet waste overflowing onto storm drainage grates, attracting pests and exacerbating surface runoff blockages.',
      recurrenceCount: 5,
      resolvedCount: 2,
      status: 'active',
      riskLevel: 'high',
      criticalityScore: 74,
      distressSentimentScore: 65,
      priorityRank: 'urgent',
      urgencyRationale: 'Urgent priority driven by 5x chronic recurrence and sanitary drain obstruction.',
      tags: ['sanitation', 'storm-grate-blockage', 'commercial-waste'],
      reportIds: ['rep-mkt-001', 'rep-mkt-002'],
      accountability: {
        department: 'Solid Waste Management & Public Health Division',
        assignedOfficer: {
          id: 'cust-naik-swm',
          name: 'Inspector Sunil Naik',
          title: 'Health & Sanitary Inspector (Zone 2)',
          department: 'Public Health & Sanitation',
          level: 'subordinate_field_officer',
          contactEmail: 's.naik.health@greenfieldward.gov.in',
          contactPhone: '+91 98450 44521'
        },
        supervisoryAuthority: {
          id: 'cust-sundaram-comm',
          name: 'Dr. Nandini Sundaram, IAS',
          title: 'Chief Municipal Commissioner & Public Safety Ombudsman',
          department: 'Municipal Corporation Executive Directorate',
          level: 'chief_commissioner',
          contactEmail: 'commissioner@greenfieldward.gov.in',
          contactPhone: '+91 94480 00100'
        },
        assignedAt: '2026-01-03T09:00:00Z',
        slaHours: 24,
        slaDeadline: '2026-01-04T09:00:00Z',
        slaStatus: 'within_sla',
        lastOfficerUpdate: 'Commercial dump warning notices posted at Wholesale Produce Dock Gate 3.',
        inactionDays: 0,
        escalationHistory: []
      },
      createdAt: '2026-01-02T18:30:00Z',
      updatedAt: '2026-02-05T09:00:00Z'
    },
    {
      id: 'inc-live-cable',
      title: 'Severed High-Voltage Transformer Cable Sparking in School Crosswalk Puddle',
      category: 'utility_disruption',
      canonicalLocation: {
        lat: 12.9734,
        lng: 77.5962,
        address: 'Maple St & 2nd Ave, Greenfield Ward',
        landmark: 'Outside Greenfield Elementary School Gate',
        neighborhood: 'Greenfield Ward'
      },
      firstObservedAt: '2026-02-06T14:10:00Z',
      lastObservedAt: '2026-02-06T14:10:00Z',
      currentAssessment: 'HIGH EMERGENCY LIFE-SAFETY HAZARD: Severe storm gust snapped overhead conduit. Energized 440V distribution cable is actively sparking into standing rainwater across the primary elementary school pedestrian crosswalk. Extreme electrocution risk.',
      recurrenceCount: 1, // Non-recurring / isolated episode!
      resolvedCount: 0,
      status: 'active',
      riskLevel: 'critical',
      criticalityScore: 96,
      distressSentimentScore: 96,
      priorityRank: 'critical_emergency',
      urgencyRationale: 'Critical emergency life-safety hazard: high-voltage arcing over school crosswalk with extreme resident distress/panic sentiment (96/100) escalates this isolated incident to top priority ahead of recurring potholes.',
      tags: ['live-wire', 'electrocution-hazard', 'school-safety', 'critical-emergency'],
      reportIds: ['rep-cable-001'],
      accountability: {
        department: 'Greenfield Metropolitan Electricity Distribution Utility (GMEDU)',
        assignedOfficer: {
          id: 'cust-verma-power',
          name: 'Er. Rajesh Verma',
          title: 'Subordinate Field Electrical Engineer (Division 4)',
          department: 'Grid Operations & Feeder Maintenance',
          level: 'subordinate_field_officer',
          contactEmail: 'r.verma.grid@greenfieldpower.gov.in',
          contactPhone: '+91 98450 77112'
        },
        supervisoryAuthority: {
          id: 'cust-sundaram-comm',
          name: 'Dr. Nandini Sundaram, IAS',
          title: 'Chief Municipal Commissioner & Public Safety Ombudsman',
          department: 'Municipal Corporation Executive Directorate',
          level: 'chief_commissioner',
          contactEmail: 'commissioner@greenfieldward.gov.in',
          contactPhone: '+91 94480 00100'
        },
        assignedAt: '2026-02-06T14:15:00Z',
        slaHours: 4, // 4-hour emergency SLA
        slaDeadline: '2026-02-06T18:15:00Z',
        slaStatus: 'sla_breached', // SLA breached: subordinate failed to acknowledge or dispatch emergency isolation crew!
        lastOfficerUpdate: 'Ticket dispatched automatically. Zero field verification or crew acknowledgment recorded.',
        inactionDays: 2,
        escalationHistory: []
      },
      createdAt: '2026-02-06T14:15:00Z',
      updatedAt: '2026-02-06T14:15:00Z'
    }
  ];

  const reports: IncidentReport[] = [
    {
      id: 'rep-elm-001',
      submittedBy: 'usr-resident-priya',
      submitterName: 'Priya Sharma',
      submitterRole: 'resident',
      title: 'Severe waterlogging blocking Elm St clinic entrance',
      description: 'Water has pooled over 40cm deep outside St. Jude clinic following morning rain. Ambulances and patients cannot navigate the junction. The street drain looks completely filled with black silt and leaves.',
      category: 'waterlogging',
      reportedLocation: {
        lat: 12.9716,
        lng: 77.5946,
        address: 'Elm St & 4th Cross Rd',
        landmark: 'St. Jude Community Health Clinic'
      },
      observedAt: '2026-01-08T07:15:00Z',
      submittedAt: '2026-01-08T07:30:00Z',
      severity: 'high',
      mediaReferences: ['/demo-assets/elm_waterlog_jan8.jpg'],
      impactDescription: 'Emergency access to clinic impeded, pedestrians walking through knee-deep murky water.',
      moderationStatus: 'approved',
      aiProcessingStatus: 'completed',
      aiExtraction: {
        category: 'waterlogging',
        visibleConditions: ['Standing murky water ~40cm depth', 'Submerged road curb', 'Drain inlet choked with silt/debris'],
        landmarks: ['St. Jude Community Health Clinic', 'Elm St 4th Cross'],
        temporalReferences: ['Morning rain event Jan 8, 2026'],
        potentialImpacts: ['Clinic vehicular access blocked', 'Waterborne pathogen exposure risk'],
        statedCauses: ['Clogged street drain with black silt'],
        candidateClaims: [
          'Elm St culvert cannot discharge surface runoff during rain',
          'Drain inlet is physically blocked by debris'
        ],
        missingInfo: ['Underground culvert silt level', 'Upstream catch basin status'],
        confidence: 0.94
      },
      matchedIncidentId: 'inc-elm-waterlog',
      matchingRationale: 'Direct match on canonical coordinates, street name, and recurring flooding condition at clinic junction.'
    },
    {
      id: 'rep-elm-002',
      submittedBy: 'usr-resident-marcus',
      submitterName: 'Marcus Chen',
      submitterRole: 'resident',
      title: 'Commuter bus stalled in Elm St flooding',
      description: 'Route 42 bus broke down in the middle of Elm St due to water in the exhaust. Water level is still rising even after rain stopped 2 hours ago. Silt is oozing from the stormwater grate.',
      category: 'waterlogging',
      reportedLocation: {
        lat: 12.9718,
        lng: 77.5949,
        address: 'Elm St opposite Bank of Greenfield',
        landmark: 'Bank of Greenfield ATM'
      },
      observedAt: '2026-01-09T08:45:00Z',
      submittedAt: '2026-01-09T09:10:00Z',
      severity: 'critical',
      mediaReferences: ['/demo-assets/elm_bus_jan9.jpg'],
      impactDescription: 'Major traffic paralysis across Ward 14; public transit disruption.',
      moderationStatus: 'approved',
      aiProcessingStatus: 'completed',
      aiExtraction: {
        category: 'waterlogging',
        visibleConditions: ['Stalled public transit vehicle', 'Standing water continuing 2 hrs post-rain', 'Silt reverse discharge from grate'],
        landmarks: ['Bank of Greenfield ATM', 'Elm St'],
        temporalReferences: ['Jan 9, 2026 morning'],
        potentialImpacts: ['Transit standstill', 'Hydraulic backpressure in storm line'],
        statedCauses: ['Stormwater grate overflow'],
        candidateClaims: ['Storm line suffers hydraulic backflow during sustained rain'],
        missingInfo: ['Outfall elevation condition', 'Downstream canal water level'],
        confidence: 0.92
      },
      matchedIncidentId: 'inc-elm-waterlog',
      matchingRationale: 'Located 35m from primary incident coordinates; same temporal episode and hydraulic pathology.'
    },
    {
      id: 'rep-elm-003',
      submittedBy: 'usr-verifier-elena',
      submitterName: 'Elena Rostova',
      submitterRole: 'verifier',
      title: 'Municipal suction truck deployed - surface dry',
      description: 'Municipal Sanitation Truck #12 completed suction clearing at 11:00 AM on Jan 12. Surface standing water has completely receded. Road open to traffic.',
      category: 'drainage',
      reportedLocation: {
        lat: 12.9716,
        lng: 77.5946,
        address: 'Elm St & 4th Cross Rd',
        landmark: 'St. Jude Community Health Clinic'
      },
      observedAt: '2026-01-12T11:30:00Z',
      submittedAt: '2026-01-12T12:00:00Z',
      severity: 'low',
      mediaReferences: ['/demo-assets/elm_receded_jan12.jpg'],
      impactDescription: 'Normal traffic restored; clinic access clear.',
      moderationStatus: 'approved',
      aiProcessingStatus: 'completed',
      aiExtraction: {
        category: 'drainage',
        visibleConditions: ['Dry asphalt surface', 'Municipal suction vehicle on site', 'Surface water absent'],
        landmarks: ['St. Jude Clinic'],
        temporalReferences: ['Jan 12, 2026 mid-day'],
        potentialImpacts: ['Immediate hazard resolved'],
        statedCauses: ['Emergency suction pumping completed'],
        candidateClaims: ['Water receded following surface suction'],
        missingInfo: ['Sub-surface conduit silt volume removed vs remaining'],
        confidence: 0.96
      },
      matchedIncidentId: 'inc-elm-waterlog',
      matchingRationale: 'Official follow-up verification observation on the same culvert junction.'
    },
    {
      id: 'rep-elm-004',
      submittedBy: 'usr-resident-priya',
      submitterName: 'Priya Sharma',
      submitterRole: 'resident',
      title: 'Waterlogging returned on Elm St after light drizzle',
      description: 'It only rained for 25 minutes (18mm gauge) and the water is already 35cm deep again! The municipal clearing 3 weeks ago did not fix the underground problem. Water is not draining at all.',
      category: 'waterlogging',
      reportedLocation: {
        lat: 12.9716,
        lng: 77.5946,
        address: 'Elm St & 4th Cross Rd',
        landmark: 'St. Jude Community Health Clinic'
      },
      observedAt: '2026-02-02T15:10:00Z',
      submittedAt: '2026-02-02T15:40:00Z',
      severity: 'high',
      mediaReferences: ['/demo-assets/elm_recur_feb2.jpg'],
      impactDescription: 'Clinic access once again flooded; proof of recurrence.',
      moderationStatus: 'approved',
      aiProcessingStatus: 'completed',
      aiExtraction: {
        category: 'waterlogging',
        visibleConditions: ['35cm deep standing water after minimal rain (18mm)', 'Failed infiltration', 'Water level stationary'],
        landmarks: ['St. Jude Clinic'],
        temporalReferences: ['Feb 2, 2026 afternoon'],
        potentialImpacts: ['Recurring disruption', 'Refutation of durable resolution'],
        statedCauses: ['Underground culvert obstruction unresolved'],
        candidateClaims: ['Jan 12 repair was cosmetic/temporary; chronic sub-surface obstruction persists'],
        missingInfo: ['Rainfall intensity curve', 'Internal pipe camera inspection'],
        confidence: 0.95
      },
      matchedIncidentId: 'inc-elm-waterlog',
      matchingRationale: 'Direct temporal recurrence at canonical coordinates confirming cyclical failure.'
    },
    {
      id: 'rep-oak-001',
      submittedBy: 'usr-resident-marcus',
      submitterName: 'Marcus Chen',
      submitterRole: 'resident',
      title: 'Deep trench pothole damaging wheels on Oak Ave',
      description: 'Three cars suffered rim damage this morning alone. The asphalt has buckled right under Metro Pillar 142. Depth is roughly 14cm.',
      category: 'potholes',
      reportedLocation: {
        lat: 12.9752,
        lng: 77.5982,
        address: 'Oak Ave Metro Pillar 142'
      },
      observedAt: '2026-01-20T08:00:00Z',
      submittedAt: '2026-01-20T08:30:00Z',
      severity: 'medium',
      mediaReferences: ['/demo-assets/oak_pothole.jpg'],
      moderationStatus: 'approved',
      aiProcessingStatus: 'completed',
      aiExtraction: {
        category: 'potholes',
        visibleConditions: ['14cm deep crater with sharp asphalt edges', 'Sub-base aggregate exposed'],
        landmarks: ['Metro Pillar 142'],
        temporalReferences: ['Jan 20, 2026'],
        potentialImpacts: ['Wheel fracture', 'Motorcycle skid risk'],
        statedCauses: ['Sub-base failure under heavy traffic'],
        candidateClaims: ['Oak Ave base course has eroded beneath wearing layer'],
        missingInfo: ['Axle weight logs for corridor'],
        confidence: 0.91
      },
      matchedIncidentId: 'inc-oak-potholes'
    },
    {
      id: 'rep-mkt-001',
      submittedBy: 'usr-resident-priya',
      submitterName: 'Priya Sharma',
      submitterRole: 'resident',
      title: 'Vegetable waste dumped directly into storm grate',
      description: 'North alley vendors are dumping rotten cabbages and wooden crates over the storm water inlet. Rotten smell and swarm of flies.',
      category: 'waste_accumulation',
      reportedLocation: {
        lat: 12.9688,
        lng: 77.6011,
        address: 'North Commercial Alley, Market Square'
      },
      observedAt: '2026-02-01T19:30:00Z',
      submittedAt: '2026-02-01T20:00:00Z',
      severity: 'medium',
      mediaReferences: ['/demo-assets/market_waste.jpg'],
      moderationStatus: 'approved',
      aiProcessingStatus: 'completed',
      aiExtraction: {
        category: 'waste_accumulation',
        visibleConditions: ['Decomposing vegetable refuse covering storm grate', 'Rotten debris obstructing drainage flow'],
        landmarks: ['Market Square North Alley'],
        temporalReferences: ['Feb 1, 2026 evening'],
        potentialImpacts: ['Storm line bio-clogging', 'Public health rodent attractor'],
        statedCauses: ['Night commercial dumping'],
        candidateClaims: ['Commercial night dumping directly blocks storm grate'],
        missingInfo: ['Waste pickup schedule synchronization'],
        confidence: 0.93,
        sentiment: {
          sentiment: 'concerned',
          distressScore: 65,
          urgencyScore: 70,
          keyDistressFactors: ['Public health sanitation hazard', 'Decomposing vegetable odor']
        }
      },
      matchedIncidentId: 'inc-market-waste'
    },
    {
      id: 'rep-cable-001',
      submittedBy: 'usr-resident-marcus',
      submitterName: 'Marcus Chen',
      submitterRole: 'resident',
      title: 'EMERGENCY: Live high-voltage wire sparking into school crosswalk water puddle',
      description: 'Loud electrical buzzing and visible sparks exploding into the puddle outside Greenfield Elementary! Children are leaving classes right now. Severe electrocution danger if anyone steps in the water puddle!',
      category: 'utility_disruption',
      reportedLocation: {
        lat: 12.9734,
        lng: 77.5962,
        address: 'Maple St & 2nd Ave',
        landmark: 'Outside Greenfield Elementary School Gate'
      },
      observedAt: '2026-02-06T14:10:00Z',
      submittedAt: '2026-02-06T14:12:00Z',
      severity: 'critical',
      mediaReferences: ['/demo-assets/live_wire.jpg'],
      impactDescription: 'Imminent life-safety danger for school children and crossing pedestrians.',
      moderationStatus: 'approved',
      aiProcessingStatus: 'completed',
      aiExtraction: {
        category: 'utility_disruption',
        visibleConditions: ['Severed 440V overhead conduit', 'Continuous electrical arcing into standing water pool', 'Sparks jumping onto sidewalk'],
        landmarks: ['Greenfield Elementary School Gate', 'Maple St Crosswalk'],
        temporalReferences: ['Feb 6, 2026 afternoon dismissal time'],
        potentialImpacts: ['Fatal electrocution risk', 'Pedestrian panic'],
        statedCauses: ['Storm wind gust severed transformer drop-line'],
        candidateClaims: ['Live electrical conductor is actively energizing sidewalk floodwater puddle'],
        missingInfo: ['Power utility grid feeder isolation confirmation'],
        confidence: 0.98,
        sentiment: {
          sentiment: 'critical_panic',
          distressScore: 98,
          urgencyScore: 99,
          keyDistressFactors: ['Life-safety electrocution emergency', 'Children actively present', 'Water conduction hazard']
        }
      },
      matchedIncidentId: 'inc-live-cable'
    }
  ];

  const observations: Observation[] = [
    {
      id: 'obs-elm-001',
      incidentId: 'inc-elm-waterlog',
      reportId: 'rep-elm-001',
      observedAt: '2026-01-08T07:15:00Z',
      condition: 'Severe flood pool 42cm deep; clinic entrance cut off; dark stagnant water.',
      sourceType: 'resident_report',
      location: { lat: 12.9716, lng: 77.5946, address: 'Elm St & 4th Cross' },
      verificationStatus: 'verified',
      mediaReference: '/demo-assets/elm_waterlog_jan8.jpg',
      submittedBy: 'usr-resident-priya',
      notes: 'Corroborated by geotagged photo metadata and local rainfall log of 32mm.'
    },
    {
      id: 'obs-elm-002',
      incidentId: 'inc-elm-waterlog',
      reportId: 'rep-elm-002',
      observedAt: '2026-01-09T08:45:00Z',
      condition: 'Transit vehicle hydro-locked; water depth 45cm; persistent level despite rain stopping.',
      sourceType: 'resident_report',
      location: { lat: 12.9718, lng: 77.5949, address: 'Elm St & Bank of Greenfield' },
      verificationStatus: 'verified',
      mediaReference: '/demo-assets/elm_bus_jan9.jpg',
      submittedBy: 'usr-resident-marcus',
      notes: 'Indicates high hydraulic resistance downstream.'
    },
    {
      id: 'obs-elm-003',
      incidentId: 'inc-elm-waterlog',
      reportId: 'rep-elm-003',
      observedAt: '2026-01-12T11:30:00Z',
      condition: 'Surface dry following suction vehicle operation; storm grate intake visible.',
      sourceType: 'verifier_inspection',
      location: { lat: 12.9716, lng: 77.5946, address: 'Elm St & 4th Cross' },
      verificationStatus: 'verified',
      mediaReference: '/demo-assets/elm_receded_jan12.jpg',
      submittedBy: 'usr-verifier-elena',
      notes: 'Surface clear, but verifier noted intake sump remains 70% filled with compacted gravel/silt.'
    },
    {
      id: 'obs-elm-004',
      incidentId: 'inc-elm-waterlog',
      reportId: 'rep-elm-004',
      observedAt: '2026-02-02T15:10:00Z',
      condition: 'Flood pool re-established at 35cm depth after only 18mm rain.',
      sourceType: 'resident_report',
      location: { lat: 12.9716, lng: 77.5946, address: 'Elm St & 4th Cross' },
      verificationStatus: 'verified',
      mediaReference: '/demo-assets/elm_recur_feb2.jpg',
      submittedBy: 'usr-resident-priya',
      notes: 'Decisively invalidates claim of durable resolution.'
    },
    {
      id: 'obs-elm-005',
      incidentId: 'inc-elm-waterlog',
      observedAt: '2026-02-04T10:00:00Z',
      condition: 'Municipal Engineer Field Note: "Culvert line gradient is adequate; issue is excessive upstream illegal pavement runoff."',
      sourceType: 'official_record',
      location: { lat: 12.9716, lng: 77.5946, address: 'Elm St & 4th Cross' },
      verificationStatus: 'disputed',
      submittedBy: 'Municipal Dispatch Memo #MD-881',
      notes: 'Official claim disputes local silt obstruction; asserts regional catchment runoff as sole cause.'
    },
    {
      id: 'obs-cable-001',
      incidentId: 'inc-live-cable',
      reportId: 'rep-cable-001',
      observedAt: '2026-02-06T14:10:00Z',
      condition: 'Live 440V transformer conduit snapped and sparking violently into school sidewalk flood puddle.',
      sourceType: 'resident_report',
      location: { lat: 12.9734, lng: 77.5962, address: 'Maple St & 2nd Ave' },
      verificationStatus: 'verified',
      mediaReference: '/demo-assets/live_wire.jpg',
      submittedBy: 'usr-resident-marcus',
      notes: 'Corroborated by high urgency acoustic crackle telemetry and rapid volunteer site check.'
    }
  ];

  const claims: Claim[] = [
    {
      id: 'clm-elm-silt',
      incidentId: 'inc-elm-waterlog',
      claimText: 'The 200m underground culvert conduit along Elm St has severe silt and gravel choke exceeding 60% of cross-sectional area.',
      normalizedClaim: 'Culvert conduit experiences >60% cross-sectional sediment obstruction',
      claimType: 'cause',
      temporalScope: { startDate: '2026-01-08T00:00:00Z', isOngoing: true },
      status: 'supported',
      confidence: 0.88,
      supportingEvidenceIds: ['evi-elm-verifier-probe', 'evi-elm-acoustic-sensor', 'evi-elm-recur-photo'],
      contradictoryEvidenceIds: ['evi-elm-muni-memo'],
      createdAt: '2026-01-10T14:00:00Z',
      updatedAt: '2026-02-03T09:00:00Z'
    },
    {
      id: 'clm-elm-resolved',
      incidentId: 'inc-elm-waterlog',
      claimText: 'Elm St waterlogging issue was permanently resolved by the Jan 12 municipal emergency suction deployment.',
      normalizedClaim: 'Municipal suction on Jan 12 permanently restored normal drainage flow',
      claimType: 'resolution',
      temporalScope: { startDate: '2026-01-12T00:00:00Z', endDate: '2026-02-02T00:00:00Z', isOngoing: false },
      status: 'disputed',
      confidence: 0.15,
      supportingEvidenceIds: ['evi-elm-muni-workorder'],
      contradictoryEvidenceIds: ['evi-elm-recur-photo', 'evi-elm-resident-log-feb2'],
      createdAt: '2026-01-13T10:00:00Z',
      updatedAt: '2026-02-02T16:00:00Z'
    },
    {
      id: 'clm-elm-upstream-cause',
      incidentId: 'inc-elm-waterlog',
      claimText: 'Primary flood driver is newly paved commercial parking upstream with 0% permeable surface diverting runoff directly to Elm St.',
      normalizedClaim: 'Upstream commercial impervious surface surge overwhelms culvert capacity',
      claimType: 'cause',
      temporalScope: { startDate: '2025-11-01T00:00:00Z', isOngoing: true },
      status: 'pending_review',
      confidence: 0.62,
      supportingEvidenceIds: ['evi-elm-satellite-paving'],
      contradictoryEvidenceIds: [],
      createdAt: '2026-02-04T11:00:00Z',
      updatedAt: '2026-02-04T11:00:00Z'
    },
    {
      id: 'clm-oak-base-failure',
      incidentId: 'inc-oak-potholes',
      claimText: 'Pothole chain on Oak Ave is caused by water penetration dissolving the granular base course rather than top asphalt wear.',
      normalizedClaim: 'Sub-base gravel erosion underneath asphalt causes structural cavity collapse',
      claimType: 'cause',
      temporalScope: { startDate: '2025-12-14T00:00:00Z', isOngoing: true },
      status: 'supported',
      confidence: 0.91,
      supportingEvidenceIds: ['evi-oak-core-sample', 'evi-oak-depth-gauge'],
      contradictoryEvidenceIds: [],
      createdAt: '2026-01-22T10:00:00Z',
      updatedAt: '2026-01-28T15:00:00Z'
    },
    {
      id: 'clm-market-dumping',
      incidentId: 'inc-market-waste',
      claimText: 'Commercial wholesale produce vendors dump non-biodegradable packing crates over the drain inlet nightly between 10 PM and 4 AM.',
      normalizedClaim: 'Wholesale market night dumping causes mechanical blockage of storm intake',
      claimType: 'condition',
      temporalScope: { startDate: '2026-01-02T00:00:00Z', isOngoing: true },
      status: 'supported',
      confidence: 0.95,
      supportingEvidenceIds: ['evi-mkt-night-photo', 'evi-mkt-vendor-audit'],
      contradictoryEvidenceIds: [],
      createdAt: '2026-01-15T09:00:00Z',
      updatedAt: '2026-02-03T10:00:00Z'
    }
  ];

  const evidence: EvidenceItem[] = [
    {
      id: 'evi-elm-verifier-probe',
      evidenceType: 'human_verification_note',
      description: 'Physical sediment probe measurements at Elm St culvert manhole MH-4: compacted gravel and organic silt depth measured at 68cm within a 100cm culvert diameter.',
      sourceReference: 'ProofMesh Verifier Field Report #VR-2026-041',
      sourceCategory: 'verifier',
      observedAt: '2026-01-10T11:00:00Z',
      collectedAt: '2026-01-10T12:30:00Z',
      location: { lat: 12.9716, lng: 77.5946, address: 'MH-4, Elm St & 4th Cross' },
      associatedClaimIds: ['clm-elm-silt'],
      verificationStatus: 'verified',
      reviewerNotes: 'Calibrated depth probe used; photographic scale verified by Community Verifier Elena Rostova.',
      submittedBy: 'usr-verifier-elena',
      provenance: {
        origin: 'On-site physical probe calibration',
        authenticated: true,
        hash: 'sha256-e91b8f4119d288a',
        captureMethod: 'Telescopic graduated probe'
      }
    },
    {
      id: 'evi-elm-acoustic-sensor',
      evidenceType: 'environmental_measurement',
      description: 'Ultrasonic flow sensor acoustic reflection log indicates liquid velocity drops to <0.12 m/s under 20mm rainfall, indicating downstream hydraulic choke.',
      sourceReference: 'Greenfield Ward Smart Drainage Pilot Sensor S-088',
      sourceCategory: 'sensor',
      observedAt: '2026-01-09T08:00:00Z',
      collectedAt: '2026-01-09T08:15:00Z',
      location: { lat: 12.9717, lng: 77.5947 },
      associatedClaimIds: ['clm-elm-silt'],
      verificationStatus: 'verified',
      reviewerNotes: 'Raw telemetry logged via municipal open IoT gateway.',
      submittedBy: 'Sensor S-088 Gateway',
      provenance: {
        origin: 'Smart IoT Gateway Greenfield Ward',
        authenticated: true,
        hash: 'sha256-sensor-8812cfa'
      }
    },
    {
      id: 'evi-elm-muni-workorder',
      evidenceType: 'official_public_data',
      description: 'Municipal Sanitation Work Order #MW-4091: "Suction Truck #12 completed 4 loads of surface extraction at Elm St culvert on Jan 12. Problem declared cleared."',
      sourceReference: 'Municipal Public Portal Dispatch Log #MW-4091',
      sourceCategory: 'official',
      observedAt: '2026-01-12T11:00:00Z',
      collectedAt: '2026-01-12T14:00:00Z',
      associatedClaimIds: ['clm-elm-resolved'],
      verificationStatus: 'deprecated',
      reviewerNotes: 'Public record authentic, but subsequent physical observations show clearing was surface-only and ephemeral.',
      submittedBy: 'Municipal Portal Open Feed',
      provenance: {
        origin: 'Ward 14 Public Works Dispatch Portal',
        authenticated: true
      }
    },
    {
      id: 'evi-elm-recur-photo',
      evidenceType: 'photograph',
      description: 'Geotagged high-resolution photograph showing 35cm standing water in front of St. Jude Clinic on Feb 2, 2026 at 15:15 UTC.',
      sourceReference: 'Resident Upload EXIF Tag #EX-20260202-099',
      sourceCategory: 'community',
      mediaReference: '/demo-assets/elm_recur_feb2.jpg',
      observedAt: '2026-02-02T15:15:00Z',
      collectedAt: '2026-02-02T15:40:00Z',
      location: { lat: 12.9716, lng: 77.5946 },
      associatedClaimIds: ['clm-elm-resolved', 'clm-elm-silt'],
      verificationStatus: 'verified',
      reviewerNotes: 'EXIF timestamp and GPS verified; water gauge visible against clinic steps.',
      submittedBy: 'usr-resident-priya',
      provenance: {
        origin: 'Smartphone Camera EXIF Authenticated',
        authenticated: true,
        hash: 'sha256-photo-feb2-priya'
      }
    },
    {
      id: 'evi-elm-resident-log-feb2',
      evidenceType: 'resident_observation',
      description: 'Observation log by Priya Sharma: Water flooded sidewalk within 25 mins of light drizzle, lasting 4.5 hours.',
      sourceReference: 'Incident Report rep-elm-004',
      sourceCategory: 'community',
      observedAt: '2026-02-02T15:10:00Z',
      collectedAt: '2026-02-02T15:40:00Z',
      associatedClaimIds: ['clm-elm-resolved'],
      verificationStatus: 'verified',
      submittedBy: 'usr-resident-priya',
      provenance: { origin: 'CivicTwin Mobile Web Form', authenticated: true }
    },
    {
      id: 'evi-elm-muni-memo',
      evidenceType: 'public_document',
      description: 'Engineering Division Internal Memo #MD-881 claiming the culvert gradient is adequate according to 2018 blueprints.',
      sourceReference: 'Public Information Request Reply #RTI-2026-88',
      sourceCategory: 'official',
      observedAt: '2026-02-04T10:00:00Z',
      collectedAt: '2026-02-04T10:30:00Z',
      associatedClaimIds: ['clm-elm-silt'],
      verificationStatus: 'disputed',
      reviewerNotes: 'Relies on 8-year-old construction drawings; contradicts empirical sediment measurements at MH-4.',
      submittedBy: 'Elena Rostova (via RTI Portal)',
      provenance: { origin: 'Municipal Engineering Dept Memo', authenticated: true }
    },
    {
      id: 'evi-elm-satellite-paving',
      evidenceType: 'official_public_data',
      description: 'Earth Observation Sentinel-2 normalized difference water & impervious surface index showing 14,000 sq ft upstream asphalt paving completed Nov 2025.',
      sourceReference: 'Sentinel-2 Urban Impervious Layer Q4-2025',
      sourceCategory: 'official',
      observedAt: '2025-11-20T00:00:00Z',
      collectedAt: '2026-02-04T11:00:00Z',
      associatedClaimIds: ['clm-elm-upstream-cause'],
      verificationStatus: 'unverified',
      reviewerNotes: 'Correlated in space, but runoff coefficient modeling is needed before asserting direct causation.',
      submittedBy: 'usr-verifier-elena',
      provenance: { origin: 'Copernicus Sentinel-2 Open Data', authenticated: true }
    },
    {
      id: 'evi-oak-core-sample',
      evidenceType: 'human_verification_note',
      description: 'Sub-base soil core extraction showing voids and water-saturated clay fines 12cm below asphalt surface.',
      sourceReference: 'Pavement Audit P-142',
      sourceCategory: 'verifier',
      observedAt: '2026-01-22T09:30:00Z',
      collectedAt: '2026-01-22T10:00:00Z',
      associatedClaimIds: ['clm-oak-base-failure'],
      verificationStatus: 'verified',
      submittedBy: 'usr-verifier-elena',
      provenance: { origin: 'Mechanical Core Sampler', authenticated: true }
    },
    {
      id: 'evi-oak-depth-gauge',
      evidenceType: 'resident_observation',
      description: 'Laser depth gauge measure: pothole depth at Metro Pillar 142 is 14.2cm with 45cm diameter.',
      sourceReference: 'Marcus Chen Verification Observation',
      sourceCategory: 'community',
      observedAt: '2026-01-20T08:00:00Z',
      collectedAt: '2026-01-20T08:30:00Z',
      associatedClaimIds: ['clm-oak-base-failure'],
      verificationStatus: 'verified',
      submittedBy: 'usr-resident-marcus',
      provenance: { origin: 'Digital Gauge Calibration', authenticated: true }
    },
    {
      id: 'evi-mkt-night-photo',
      evidenceType: 'photograph',
      description: 'Time-stamped night photograph (Feb 1, 23:42) showing uncrushed vegetable wooden pallets blocking the storm drain grating.',
      sourceReference: 'Community Night Audit Batch 4',
      sourceCategory: 'community',
      observedAt: '2026-02-01T23:42:00Z',
      collectedAt: '2026-02-02T06:00:00Z',
      associatedClaimIds: ['clm-market-dumping'],
      verificationStatus: 'verified',
      submittedBy: 'usr-resident-priya',
      provenance: { origin: 'Direct Photo Upload', authenticated: true }
    },
    {
      id: 'evi-mkt-vendor-audit',
      evidenceType: 'ngo_record',
      description: 'Market Committee survey: 18 out of 22 wholesale fruit stalls lack designated organic dumpster access within 100m.',
      sourceReference: 'Greenfield Ward Merchants Alliance Survey 2026-01',
      sourceCategory: 'community',
      observedAt: '2026-01-14T15:00:00Z',
      collectedAt: '2026-01-15T09:00:00Z',
      associatedClaimIds: ['clm-market-dumping'],
      verificationStatus: 'verified',
      submittedBy: 'usr-coordinator-tariq',
      provenance: { origin: 'Merchant Alliance Signed Registry', authenticated: true }
    }
  ];

  const relations: EvidenceRelation[] = [
    // Incident to Claims
    {
      id: 'rel-001',
      sourceEntityType: 'claim',
      sourceEntityId: 'clm-elm-silt',
      relationType: 'ADDRESSES',
      targetEntityType: 'incident',
      targetEntityId: 'inc-elm-waterlog',
      rationale: 'Identifies chronic silt obstruction as the mechanical cause of waterlogging.',
      createdAt: '2026-01-10T14:00:00Z'
    },
    {
      id: 'rel-002',
      sourceEntityType: 'claim',
      sourceEntityId: 'clm-elm-resolved',
      relationType: 'ADDRESSES',
      targetEntityType: 'incident',
      targetEntityId: 'inc-elm-waterlog',
      rationale: 'Asserts the waterlogging was permanently resolved by municipal clearing.',
      createdAt: '2026-01-13T10:00:00Z'
    },
    {
      id: 'rel-003',
      sourceEntityType: 'claim',
      sourceEntityId: 'clm-elm-upstream-cause',
      relationType: 'ADDRESSES',
      targetEntityType: 'incident',
      targetEntityId: 'inc-elm-waterlog',
      rationale: 'Hypothesizes upstream commercial runoff volume surge.',
      createdAt: '2026-02-04T11:00:00Z'
    },
    // Evidence supporting / contradicting claims
    {
      id: 'rel-004',
      sourceEntityType: 'evidence',
      sourceEntityId: 'evi-elm-verifier-probe',
      relationType: 'SUPPORTS',
      targetEntityType: 'claim',
      targetEntityId: 'clm-elm-silt',
      rationale: 'Direct physical probe proves 68% depth filled with silt and gravel at manhole MH-4.',
      createdAt: '2026-01-10T14:05:00Z'
    },
    {
      id: 'rel-005',
      sourceEntityType: 'evidence',
      sourceEntityId: 'evi-elm-acoustic-sensor',
      relationType: 'SUPPORTS',
      targetEntityType: 'claim',
      targetEntityId: 'clm-elm-silt',
      rationale: 'Sensor shows near-zero water velocity in culvert during rainfall, confirming downstream blockage.',
      createdAt: '2026-01-10T14:10:00Z'
    },
    {
      id: 'rel-006',
      sourceEntityType: 'evidence',
      sourceEntityId: 'evi-elm-muni-memo',
      relationType: 'CONTRADICTS',
      targetEntityType: 'claim',
      targetEntityId: 'clm-elm-silt',
      rationale: 'Municipal memo claims culvert gradient is adequate and not choked.',
      createdAt: '2026-02-04T10:35:00Z'
    },
    {
      id: 'rel-007',
      sourceEntityType: 'evidence',
      sourceEntityId: 'evi-elm-muni-workorder',
      relationType: 'SUPPORTS',
      targetEntityType: 'claim',
      targetEntityId: 'clm-elm-resolved',
      rationale: 'Official municipal work order claims suction clearing concluded successfully.',
      createdAt: '2026-01-13T10:05:00Z'
    },
    {
      id: 'rel-008',
      sourceEntityType: 'evidence',
      sourceEntityId: 'evi-elm-recur-photo',
      relationType: 'CONTRADICTS',
      targetEntityType: 'claim',
      targetEntityId: 'clm-elm-resolved',
      rationale: 'Photograph demonstrates 35cm flood water on Feb 2, disproving durable resolution.',
      createdAt: '2026-02-02T16:05:00Z'
    },
    {
      id: 'rel-009',
      sourceEntityType: 'evidence',
      sourceEntityId: 'evi-elm-recur-photo',
      relationType: 'SUPERSEDES',
      targetEntityType: 'evidence',
      targetEntityId: 'evi-elm-muni-workorder',
      rationale: 'Feb 2 physical condition supersedes Jan 12 municipal clearing claim.',
      createdAt: '2026-02-02T16:10:00Z'
    },
    {
      id: 'rel-010',
      sourceEntityType: 'evidence',
      sourceEntityId: 'evi-elm-satellite-paving',
      relationType: 'SUPPORTS',
      targetEntityType: 'claim',
      targetEntityId: 'clm-elm-upstream-cause',
      rationale: 'Satellite multispectral index confirms 14,000 sq ft impervious surface added.',
      createdAt: '2026-02-04T11:05:00Z'
    },
    // Oak Ave relations
    {
      id: 'rel-011',
      sourceEntityType: 'evidence',
      sourceEntityId: 'evi-oak-core-sample',
      relationType: 'SUPPORTS',
      targetEntityType: 'claim',
      targetEntityId: 'clm-oak-base-failure',
      rationale: 'Soil core proves subterranean base layer erosion rather than surface wear.',
      createdAt: '2026-01-22T10:05:00Z'
    },
    // Market Square relations
    {
      id: 'rel-012',
      sourceEntityType: 'evidence',
      sourceEntityId: 'evi-mkt-night-photo',
      relationType: 'SUPPORTS',
      targetEntityType: 'claim',
      targetEntityId: 'clm-market-dumping',
      rationale: 'Visual proof of wooden crates and refuse placed on top of storm grate at night.',
      createdAt: '2026-02-02T06:10:00Z'
    }
  ];

  const verificationDecisions: VerificationDecision[] = [
    {
      id: 'vd-001',
      claimId: 'clm-elm-silt',
      reviewerId: 'usr-verifier-elena',
      reviewerName: 'Elena Rostova',
      previousStatus: 'pending_review',
      decision: 'supported',
      rationale: 'Direct physical probe measurements at MH-4 (68% silt height) corroborated by ultrasonic telemetry velocity data. Sufficient evidence to confirm severe siltation.',
      evidenceReviewed: ['evi-elm-verifier-probe', 'evi-elm-acoustic-sensor'],
      createdAt: '2026-01-10T14:30:00Z'
    },
    {
      id: 'vd-002',
      claimId: 'clm-elm-resolved',
      reviewerId: 'usr-verifier-elena',
      reviewerName: 'Elena Rostova',
      previousStatus: 'supported',
      decision: 'disputed',
      rationale: 'Status transitioned from temporarily supported to DISPUTED. Fresh geotagged evidence on Feb 2 reveals immediate 35cm flood recurrence under minor precipitation, demonstrating the Jan 12 municipal action failed to resolve subsurface capacity.',
      evidenceReviewed: ['evi-elm-recur-photo', 'evi-elm-resident-log-feb2'],
      createdAt: '2026-02-02T16:20:00Z'
    }
  ];

  const evidenceGaps: EvidenceGap[] = [
    {
      id: 'gap-elm-cctv',
      incidentId: 'inc-elm-waterlog',
      description: 'Lack of internal closed-circuit camera (CCTV) inspection of the 200m underground culvert between MH-4 and Outfall Canal.',
      importance: 'high',
      relatedClaimIds: ['clm-elm-silt', 'clm-elm-upstream-cause'],
      recommendedAction: 'Deploy a compact crawler pipe inspection camera to verify if there is structural collapse or merely removable silt.',
      suggestedRole: 'verifier',
      blocksConclusion: true,
      status: 'open',
      createdAt: '2026-02-03T10:00:00Z'
    },
    {
      id: 'gap-elm-intake-hydraulics',
      incidentId: 'inc-elm-waterlog',
      description: 'No verified flow rate data during peak precipitation to measure whether intake grate aperture is throttling inflow.',
      importance: 'medium',
      relatedClaimIds: ['clm-elm-silt'],
      recommendedAction: 'Place calibrated water level logger at both intake and discharge ends during next rain event.',
      suggestedRole: 'coordinator',
      blocksConclusion: false,
      status: 'open',
      createdAt: '2026-02-03T11:00:00Z'
    },
    {
      id: 'gap-oak-freight-weights',
      incidentId: 'inc-oak-potholes',
      description: 'Absence of actual axle-weight telemetry for nocturnal commercial freight vehicles traversing Oak Ave.',
      importance: 'medium',
      relatedClaimIds: ['clm-oak-base-failure'],
      recommendedAction: 'Conduct a 48-hour automated traffic classification & weigh-in-motion survey near Pillar 142.',
      suggestedRole: 'coordinator',
      blocksConclusion: false,
      status: 'open',
      createdAt: '2026-01-25T09:00:00Z'
    },
    {
      id: 'gap-market-waste-schedule',
      incidentId: 'inc-market-waste',
      description: 'No empirical verification of municipal commercial waste collection arrival times vs market closing hours.',
      importance: 'high',
      relatedClaimIds: ['clm-market-dumping'],
      recommendedAction: 'Log truck arrival GPS coordinates for 7 consecutive days to assess schedule misalignment.',
      suggestedRole: 'resident',
      blocksConclusion: true,
      status: 'open',
      createdAt: '2026-02-03T08:00:00Z'
    }
  ];

  const interventions: Intervention[] = [
    {
      id: 'int-elm-bioswale',
      incidentId: 'inc-elm-waterlog',
      title: 'Construct 45m Bio-retention Swale & Upstream Trash Rack at Elm St',
      description: 'Install a permeable bio-retention swale with native wetland vegetation along the clinic perimeter verge, coupled with a mechanical coarse-debris trash rack to intercept silt and leaf litter before it enters the culvert.',
      assumptions: [
        'Ward public works department permits 1.2m road verge excavation',
        'Subsoil infiltration rate >= 15 mm/hr based on nearby test bores',
        'Community volunteers maintain trash rack clearance twice weekly'
      ],
      estimatedCost: 12500,
      expectedOutcome: 'Reduce peak surface flood duration from 4.8 hours to under 45 minutes; capture 80% of suspended solids prior to culvert entry.',
      expectedEffectiveness: 75,
      implementationWeeks: 3,
      affectedLocations: ['Elm St 4th Cross', 'St. Jude Health Clinic access', 'Corner of 5th Ave'],
      evidenceReferences: ['evi-elm-verifier-probe', 'evi-elm-recur-photo'],
      status: 'approved',
      createdBy: 'usr-coordinator-tariq',
      createdAt: '2026-02-03T14:00:00Z',
      evaluationPlan: {
        metric: 'Surface Flood Duration Post-Rain (>20mm)',
        baselineValue: 4.8,
        targetValue: 0.75,
        unit: 'hours',
        measurementMethod: 'Time-lapse camera and verifier water gauge log',
        evaluationWindowDays: 45
      }
    },
    {
      id: 'int-elm-suction-contract',
      incidentId: 'inc-elm-waterlog',
      title: 'Contract Bi-Weekly High-Pressure Jetting & Vacuum Clearing',
      description: 'Retain private vacuum and hydro-jetting contractor on scheduled bi-weekly rotation to scour underground culvert.',
      assumptions: [
        'Contractor can access manholes without peak-hour traffic diversion',
        'Underground pipe has no structural wall collapse'
      ],
      estimatedCost: 8400,
      expectedOutcome: 'Maintains open conduit flow; prevents sediment consolidation.',
      expectedEffectiveness: 48,
      implementationWeeks: 1,
      affectedLocations: ['Elm St Culvert Line'],
      evidenceReferences: ['evi-elm-verifier-probe'],
      status: 'proposed',
      createdBy: 'usr-coordinator-tariq',
      createdAt: '2026-02-04T09:00:00Z',
      evaluationPlan: {
        metric: 'Sediment Depth at MH-4',
        baselineValue: 68,
        targetValue: 15,
        unit: 'cm',
        measurementMethod: 'Bi-weekly graduated probe measurement',
        evaluationWindowDays: 60
      }
    },
    {
      id: 'int-market-smart-bins',
      incidentId: 'inc-market-waste',
      title: 'Install 4 Solar-Compacting Bins & Coordinate Midnight Market Pickup',
      description: 'Place 4 high-capacity commercial solar compactors at North Commercial Alley and adjust municipal collection to 23:30 to match market packing hours.',
      assumptions: [
        'Market merchants commit to disposing organic refuse inside compactors',
        'Sanitation agency adjusts route schedule by 90 minutes'
      ],
      estimatedCost: 6800,
      expectedOutcome: 'Eliminate refuse dumping over storm grate; prevent bio-clogging.',
      expectedEffectiveness: 88,
      implementationWeeks: 2,
      affectedLocations: ['Market Square North Alley'],
      evidenceReferences: ['evi-mkt-night-photo', 'evi-mkt-vendor-audit'],
      status: 'active',
      createdBy: 'usr-coordinator-tariq',
      createdAt: '2026-02-02T11:00:00Z',
      evaluationPlan: {
        metric: 'Litter Count on Storm Grate',
        baselineValue: 34,
        targetValue: 2,
        unit: 'items/night',
        measurementMethod: 'Nightly photo audit by volunteer team',
        evaluationWindowDays: 30
      }
    }
  ];

  const outcomeMeasurements: OutcomeMeasurement[] = [
    {
      id: 'out-elm-001',
      interventionId: 'int-elm-bioswale',
      metric: 'Surface Flood Duration Post-Rain (>20mm)',
      baselineValue: 4.8,
      observedValue: 1.2,
      unit: 'hours',
      measurementMethod: 'Time-lapse photography & verifier site inspection during rain event on Feb 10, 2026',
      measuredAt: '2026-02-10T18:00:00Z',
      evidenceReferences: ['evi-elm-recur-photo'],
      limitations: 'Rainfall event was 22mm over 40 minutes. Follow-up observation shows dramatic 75% reduction in stagnation time. Note: Ambient temperature was 3°C warmer than baseline, which may have contributed slightly to surface evaporation.',
      correlationVsCausationNote: 'Observed reduction in flood duration strongly correlates with the bio-retention swale installation, but external climatic variations and soil saturation states prior to the storm cannot be entirely decoupled without multi-season instrumentation.',
      conclusion: 'target_met'
    },
    {
      id: 'out-market-001',
      interventionId: 'int-market-smart-bins',
      metric: 'Litter Count on Storm Grate',
      baselineValue: 34,
      observedValue: 6,
      unit: 'items/night',
      measurementMethod: 'Audit photograph taken at 01:00 AM after market closing',
      measuredAt: '2026-02-07T01:30:00Z',
      evidenceReferences: ['evi-mkt-night-photo'],
      limitations: 'Audit conducted over a 3-day sample. Some incidental plastic packaging remained, but bulky organic obstruction was completely absent.',
      correlationVsCausationNote: 'Correlates with the availability of midnight compactor bins and the arrival of the rescheduled municipal truck.',
      conclusion: 'target_met'
    }
  ];

  const communityActions: CommunityAction[] = [
    {
      id: 'act-001',
      incidentId: 'inc-elm-waterlog',
      gapId: 'gap-elm-cctv',
      title: 'Coordinate 30-Minute Crawler Pipe Inspection at Elm St MH-4',
      description: 'Liaise with drainage camera service to lower robotic camera through MH-4 to inspect 200m underground pipe for fractures or collapsed brickwork.',
      assignedTo: 'usr-verifier-elena',
      assignedToName: 'Elena Rostova',
      assignedRole: 'verifier',
      deadline: '2026-02-15T18:00:00Z',
      status: 'in_progress',
      priority: 'high',
      createdAt: '2026-02-03T10:30:00Z',
      updatedAt: '2026-02-04T09:00:00Z'
    },
    {
      id: 'act-002',
      incidentId: 'inc-elm-waterlog',
      interventionId: 'int-elm-bioswale',
      title: 'Community Bio-Swale Planting & Soil Prep Day',
      description: 'Mobilize 12 local volunteers to excavate 45m trench along clinic verge and plant water-absorbing reeds and coarse gravel filter beds.',
      assignedTo: 'usr-coordinator-tariq',
      assignedToName: 'Tariq Al-Mansoor',
      assignedRole: 'coordinator',
      deadline: '2026-02-18T12:00:00Z',
      status: 'todo',
      priority: 'high',
      createdAt: '2026-02-03T14:30:00Z',
      updatedAt: '2026-02-03T14:30:00Z'
    },
    {
      id: 'act-003',
      incidentId: 'inc-market-waste',
      interventionId: 'int-market-smart-bins',
      title: 'Distribute Multilingual Signage & Merchant Compactor Keys',
      description: 'Hand out compactor access badges and instructional guides to all 22 wholesale vendors in Market Square.',
      assignedTo: 'usr-resident-marcus',
      assignedToName: 'Marcus Chen',
      assignedRole: 'resident',
      deadline: '2026-02-12T17:00:00Z',
      status: 'completed',
      priority: 'medium',
      createdAt: '2026-02-02T12:00:00Z',
      updatedAt: '2026-02-06T15:00:00Z'
    }
  ];

  const auditEvents: AuditEvent[] = [
    {
      id: 'aud-001',
      actorId: 'usr-verifier-elena',
      actorName: 'Elena Rostova',
      actorRole: 'verifier',
      action: 'CLAIM_VERIFIED',
      entityType: 'Claim',
      entityId: 'clm-elm-silt',
      timestamp: '2026-01-10T14:30:00Z',
      metadata: { decision: 'supported', rationale: 'Physical probe depth 68% verified at MH-4.' }
    },
    {
      id: 'aud-002',
      actorId: 'usr-verifier-elena',
      actorName: 'Elena Rostova',
      actorRole: 'verifier',
      action: 'CLAIM_STATUS_CHANGED',
      entityType: 'Claim',
      entityId: 'clm-elm-resolved',
      timestamp: '2026-02-02T16:20:00Z',
      metadata: { from: 'supported', to: 'disputed', reason: 'Recurrent flooding photographed on Feb 2.' }
    },
    {
      id: 'aud-003',
      actorId: 'usr-coordinator-tariq',
      actorName: 'Tariq Al-Mansoor',
      actorRole: 'coordinator',
      action: 'INTERVENTION_APPROVED',
      entityType: 'Intervention',
      entityId: 'int-elm-bioswale',
      timestamp: '2026-02-03T14:00:00Z',
      metadata: { estimatedCost: 12500, expectedEffectiveness: 75 }
    },
    {
      id: 'aud-004',
      actorId: 'usr-admin-aris',
      actorName: 'Dr. Aris Thorne',
      actorRole: 'admin',
      action: 'DEMO_DATASET_INITIALIZED',
      entityType: 'System',
      entityId: 'greenfield-ward',
      timestamp: '2026-02-01T08:00:00Z',
      metadata: { neighborhood: 'Greenfield Ward', synthetic: true }
    }
  ];

  return {
    users,
    incidents,
    reports,
    observations,
    claims,
    evidence,
    relations,
    verificationDecisions,
    evidenceGaps,
    interventions,
    outcomeMeasurements,
    communityActions,
    auditEvents
  };
}
