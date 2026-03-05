import { Node, Edge } from 'reactflow';

export const kougarNodes: Node[] = [
  {
    id: 'root',
    type: 'kougar',
    position: { x: 0, y: 0 },
    data: { label: 'Document Workflow by Project Stage', category: 'stage' },
  },

  // Main Stages
  {
    id: 'initiation',
    type: 'kougar',
    position: { x: 300, y: -350 },
    data: { label: 'Project Initiation & Quoting', category: 'stage' },
  },
  {
    id: 'award',
    type: 'kougar',
    position: { x: 300, y: -150 },
    data: { label: 'Project Award & Kick-off', category: 'stage' },
  },
  {
    id: 'design',
    type: 'kougar',
    position: { x: 300, y: 50 },
    data: { label: 'Design & Procurement', category: 'stage' },
  },
  {
    id: 'execution',
    type: 'kougar',
    position: { x: 300, y: 250 },
    data: { label: 'Execution & Installation', category: 'stage' },
  },
  {
    id: 'testing',
    type: 'kougar',
    position: { x: 300, y: 450 },
    data: { label: 'Testing, Commissioning & Handover', category: 'stage' },
  },
  {
    id: 'closure',
    type: 'kougar',
    position: { x: 300, y: 650 },
    data: { label: 'Financial Closure & Archiving', category: 'stage' },
  },

  // === Initiation Children ===
  { id: 'ci', type: 'kougar', position: { x: 700, y: -500 }, data: { label: 'Documents: Client Inquiry', category: 'document' }},
  { id: 'sr', type: 'kougar', position: { x: 700, y: -450 }, data: { label: 'Documents: Survey Report', category: 'document' }},
  { id: 'req', type: 'kougar', position: { x: 700, y: -400 }, data: { label: 'Documents: Requirements', category: 'document' }},
  { id: 'boq', type: 'kougar', position: { x: 700, y: -350 }, data: { label: 'Documents: Draft BoQ', category: 'document' }},
  { id: 'quote', type: 'kougar', position: { x: 700, y: -300 }, data: { label: 'Documents: Quote', category: 'document' }},
  { id: 'cq', type: 'kougar', position: { x: 700, y: -250 }, data: { label: 'Portal Action: Create Quote Record', category: 'action' }},
  { id: 'ud1', type: 'kougar', position: { x: 700, y: -200 }, data: { label: 'Portal Action: Upload Docs', category: 'action' }},
  { id: 'status1', type: 'kougar', position: { x: 700, y: -150 }, data: { label: 'Portal Action: Status Quotation', category: 'action' }},

  // === Award Children ===
  { id: 'contract', type: 'kougar', position: { x: 700, y: -50 }, data: { label: 'Documents: Signed Contract/LOA/Client PO', category: 'document' }},
  { id: 'bom', type: 'kougar', position: { x: 700, y: 0 }, data: { label: 'Documents: Final BoM', category: 'document' }},
  { id: 'plan', type: 'kougar', position: { x: 700, y: 50 }, data: { label: 'Documents: Project Plan', category: 'document' }},
  { id: 'convert', type: 'kougar', position: { x: 700, y: 100 }, data: { label: 'Portal Action: Convert to Active Project', category: 'action' }},
  { id: 'ud2', type: 'kougar', position: { x: 700, y: 150 }, data: { label: 'Portal Action: Upload Docs', category: 'action' }},
  { id: 'assign', type: 'kougar', position: { x: 700, y: 200 }, data: { label: 'Portal Action: Assign PM/Team', category: 'action' }},
  { id: 'status2', type: 'kougar', position: { x: 700, y: 250 }, data: { label: 'Portal Action: Status Planning', category: 'action' }},

  // === Add placeholders for remaining branches ===
  { id: 'design-doc', type: 'kougar', position: { x: 700, y: 350 }, data: { label: 'Design Docs (placeholder)', category: 'document' }},
  { id: 'exec-doc', type: 'kougar', position: { x: 700, y: 500 }, data: { label: 'Execution Docs (placeholder)', category: 'document' }},
  { id: 'test-doc', type: 'kougar', position: { x: 700, y: 650 }, data: { label: 'Testing Docs (placeholder)', category: 'document' }},
  { id: 'close-doc', type: 'kougar', position: { x: 700, y: 800 }, data: { label: 'Closure Docs (placeholder)', category: 'document' }},
];

export const kougarEdges: Edge[] = [
  { id: 'e-root-1', source: 'root', target: 'initiation' },
  { id: 'e-root-2', source: 'root', target: 'award' },
  { id: 'e-root-3', source: 'root', target: 'design' },
  { id: 'e-root-4', source: 'root', target: 'execution' },
  { id: 'e-root-5', source: 'root', target: 'testing' },
  { id: 'e-root-6', source: 'root', target: 'closure' },

  // Initiation
  { id: 'e-ci', source: 'initiation', target: 'ci' },
  { id: 'e-sr', source: 'initiation', target: 'sr' },
  { id: 'e-req', source: 'initiation', target: 'req' },
  { id: 'e-boq', source: 'initiation', target: 'boq' },
  { id: 'e-quote', source: 'initiation', target: 'quote' },
  { id: 'e-cq', source: 'initiation', target: 'cq' },
  { id: 'e-ud1', source: 'initiation', target: 'ud1' },
  { id: 'e-status1', source: 'initiation', target: 'status1' },

  // Award
  { id: 'e-contract', source: 'award', target: 'contract' },
  { id: 'e-bom', source: 'award', target: 'bom' },
  { id: 'e-plan', source: 'award', target: 'plan' },
  { id: 'e-convert', source: 'award', target: 'convert' },
  { id: 'e-ud2', source: 'award', target: 'ud2' },
  { id: 'e-assign', source: 'award', target: 'assign' },
  { id: 'e-status2', source: 'award', target: 'status2' },

  // Others (placeholders)
  { id: 'e-design', source: 'design', target: 'design-doc' },
  { id: 'e-exec', source: 'execution', target: 'exec-doc' },
  { id: 'e-test', source: 'testing', target: 'test-doc' },
  { id: 'e-close', source: 'closure', target: 'close-doc' },
];

export const parentChildMap: Record<string, string[]> = {
  root: ['initiation', 'award', 'design', 'execution', 'testing', 'closure'],
  initiation: ['ci', 'sr', 'req', 'boq', 'quote', 'cq', 'ud1', 'status1'],
  award: ['contract', 'bom', 'plan', 'convert', 'ud2', 'assign', 'status2'],
  design: ['design-doc'],
  execution: ['exec-doc'],
  testing: ['test-doc'],
  closure: ['close-doc'],
};
