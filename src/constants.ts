import { EnemyType, TowerType, Wave } from './types';

export const CELL_SIZE = 40;
export const GRID_WIDTH = 20; // 800px
export const GRID_HEIGHT = 15; // 600px

// Path coordinates in grid cells
export const PATH_CELLS = [
  { x: -1, y: 2 },
  { x: 3, y: 2 },
  { x: 3, y: 6 },
  { x: 8, y: 6 },
  { x: 8, y: 3 },
  { x: 14, y: 3 },
  { x: 14, y: 9 },
  { x: 5, y: 9 },
  { x: 5, y: 13 },
  { x: 17, y: 13 },
  { x: 17, y: 7 },
  { x: 20, y: 7 },
];

export const PATH_PIXELS = PATH_CELLS.map(p => ({
  x: p.x * CELL_SIZE + CELL_SIZE / 2,
  y: p.y * CELL_SIZE + CELL_SIZE / 2,
}));

export const SCENERY = [
  { x: 1, y: 10, type: 'pool', radius: 60, color: '#991b1b' }, // Lava pool
  { x: 11, y: 12, type: 'pool', radius: 45, color: '#991b1b' },
  { x: 18, y: 2, type: 'pool', radius: 50, color: '#991b1b' },
  { x: 6, y: 1, type: 'column' },
  { x: 11, y: 5, type: 'column' },
  { x: 2, y: 7, type: 'rock' },
  { x: 16, y: 10, type: 'rock' },
  { x: 9, y: 8, type: 'column' },
  { x: 13, y: 1, type: 'rock' },
  { x: 18, y: 11, type: 'column' },
  { x: 1, y: 4, type: 'rock' },
];

export const ENEMY_STATS: Record<EnemyType, { hp: number; speed: number; reward: number; color: string; radius: number }> = {
  comum: { hp: 50, speed: 1.5, reward: 10, color: '#e2e8f0', radius: 18 }, // Pale soul
  rapida: { hp: 25, speed: 3, reward: 15, color: '#fde047', radius: 14 }, // Yellow spark
  tanque: { hp: 150, speed: 0.8, reward: 25, color: '#b45309', radius: 24 }, // Bronze armored
  especial: { hp: 60, speed: 1.8, reward: 30, color: '#a855f7', radius: 18 }, // Purple elite
};

export const TOWER_STATS: Record<TowerType, { name: string; desc: string; cost: number[]; damage: number[]; range: number[]; fireRate: number[]; color: string }> = {
  caronte: {
    name: 'Caronte Cansado',
    desc: 'Programa de Mobilidade Social do Estige. Bate com o remo.',
    cost: [50, 75, 120],
    damage: [20, 35, 60],
    range: [80, 90, 100],
    fireRate: [60, 55, 50], // frames
    color: '#0f766e', // Styx Teal
  },
  medusa: {
    name: 'Medusa Aposentada',
    desc: 'Instituto de Olhar Crítico. Desacelera inimigos.',
    cost: [80, 110, 160],
    damage: [5, 10, 15],
    range: [120, 140, 160],
    fireRate: [40, 35, 30],
    color: '#4d7c0f', // Petrified Green
  },
  cerbero: {
    name: 'Cérbero Filhote',
    desc: 'ONG Guardiões do Amanhã. Ataques rápidos, dano baixo.',
    cost: [60, 90, 140],
    damage: [8, 15, 25],
    range: [100, 110, 120],
    fireRate: [20, 15, 10],
    color: '#b91c1c', // Hellfire Red
  },
  sisifo: {
    name: 'Sísifo Automatizado',
    desc: 'Fundação de Esforço Sustentável. Dano em área.',
    cost: [100, 150, 220],
    damage: [30, 50, 80],
    range: [100, 120, 140],
    fireRate: [90, 80, 70],
    color: '#b45309', // Bronze/Gold
  },
};

export const WAVES: Wave[] = [
  { id: 1, enemies: [{ type: 'comum', count: 10, interval: 60 }] },
  { id: 2, enemies: [{ type: 'comum', count: 15, interval: 50 }] },
  { id: 3, enemies: [{ type: 'comum', count: 10, interval: 40 }, { type: 'rapida', count: 5, interval: 40 }] },
  { id: 4, enemies: [{ type: 'comum', count: 15, interval: 40 }, { type: 'tanque', count: 2, interval: 100 }] },
  { id: 5, enemies: [{ type: 'rapida', count: 15, interval: 30 }] },
  { id: 6, enemies: [{ type: 'tanque', count: 5, interval: 80 }, { type: 'comum', count: 10, interval: 40 }] },
  { id: 7, enemies: [{ type: 'especial', count: 5, interval: 60 }, { type: 'rapida', count: 10, interval: 30 }] },
  { id: 8, enemies: [{ type: 'comum', count: 20, interval: 30 }, { type: 'tanque', count: 5, interval: 60 }] },
  { id: 9, enemies: [{ type: 'rapida', count: 20, interval: 20 }] },
  { id: 10, enemies: [{ type: 'tanque', count: 10, interval: 60 }, { type: 'especial', count: 5, interval: 50 }] },
  { id: 11, enemies: [{ type: 'comum', count: 30, interval: 20 }] },
  { id: 12, enemies: [{ type: 'especial', count: 15, interval: 40 }] },
  { id: 13, enemies: [{ type: 'tanque', count: 15, interval: 50 }, { type: 'rapida', count: 15, interval: 20 }] },
  { id: 14, enemies: [{ type: 'comum', count: 40, interval: 15 }] },
  { id: 15, enemies: [{ type: 'tanque', count: 20, interval: 40 }, { type: 'especial', count: 10, interval: 30 }, { type: 'rapida', count: 20, interval: 15 }] },
];

export const ZEUS_QUOTES = [
  "Nós construímos o Olimpo com sacrifício. O sacrifício era dos outros, mas o Olimpo é meu.",
  "FPR não é egoísmo. É estratégia. Rico sabe usar recurso. Pobre gasta. São fatos.",
  "Posso fazer uma doação simbólica. Zero óbolos também é um símbolo. Um símbolo de responsabilidade fiscal.",
  "O Hades apresentou uma planilha. Planilha é coisa de contador. Contador é detalhe. Eu penso estratégico.",
  "Já contribuí o suficiente. Dei meu nome de família para o grupo. Isso tem valor incalculável. Literalmente — não está no balanço.",
  "Hades reclama muito. Se o submundo não funciona, é gestão. Gestão é responsabilidade dele. O orçamento é responsabilidade minha. Que é diferente.",
];

export const CORPORATE_MESSAGES = [
  // HERA (Compliance e Burocracia)
  { sender: "Hera (Compliance)", text: "Recebi sua solicitação de upgrade. Precisarei de um Formulário de Justificativa de Investimento Infernal." },
  { sender: "Hera (Compliance)", text: "Isso não está previsto no Manual Operacional do Submundo, edição revisada de 847 a.C. Vou abrir um ticket." },
  { sender: "Hera (Compliance)", text: "A fuga de almas requer o preenchimento do formulário F-104 ANTES da tentativa de recaptura. Siga o processo." },
  { sender: "Hera (Compliance)", text: "A auditoria surpresa no Tártaro foi reagendada devido a um conflito com meu cruzeiro corporativo." },
  { sender: "Hera (Compliance)", text: "Anotado. Sua reclamação sobre falta de verba foi anexada ao processo que será analisado na 2ª quinzena de 2099." },

  // PROTEU (Comercial e Roubo de Crédito)
  { sender: "Proteu (Comercial)", text: "Hades é um executor brilhante. Executor é quem faz. Eu sou quem direciona. São funções complementares." },
  { sender: "Proteu (Comercial)", text: "Zeus, sua visão para este projeto foi o que tornou tudo possível. Eu apenas coordenei a execução do Hades." },
  { sender: "Proteu (Comercial)", text: "Os números do Submundo estão ótimos este trimestre. Fico feliz em ter liderado essa virada de mindset." },
  { sender: "Proteu (Comercial)", text: "Eu não assumiria o crédito sozinho. Foi um esforço do grupo. Eu apenas sintetizei e dei o rosto." },
  { sender: "Proteu (Comercial)", text: "Hades me mandou um memorando com objeções. Arquivei. O bom líder protege a equipe das próprias inseguranças." },

  // POSEIDON (Infraestrutura e Passivo-Agressividade)
  { sender: "Poseidon (Infraestrutura)", text: "A torre foi entregue dentro do espírito do contrato. A letra é uma interpretação. Toda letra é." },
  { sender: "Poseidon (Infraestrutura)", text: "Eu sou uma ilha cercada por idiotas." },
  { sender: "Poseidon (Infraestrutura)", text: "O subempreiteiro era o mais competitivo disponível. Competitivo em preço. Os outros aspectos são subjetivos." },
  { sender: "Poseidon (Infraestrutura)", text: "O vazamento no Rio Estige não é um defeito. É uma 'funcionalidade de irrigação passiva'." },
  { sender: "Poseidon (Infraestrutura)", text: "Se vocês queriam pedras que não esfarelam, deveriam ter especificado isso na licitação." },
  { sender: "Poseidon (Infraestrutura)", text: "A culpa não é da minha empreiteira se as almas gregas ficaram mais pesadas nos últimos milênios." },

  // APOLO (Marketing e "Spin" Corporativo)
  { sender: "Apolo (Marketing)", text: "Não é uma falha de contenção. É uma jornada de autodescoberta interrompida prematuramente. Vou preparar um press release." },
  { sender: "Apolo (Marketing)", text: "Transformamos a 'Crise de Fugas' na 'Semana do Portão Aberto'. O engajamento nas preces subiu 40%!" },
  { sender: "Apolo (Marketing)", text: "Precisamos de uma logo mais amigável para o Cérbero. Três cabeças assustam os stakeholders." },
  { sender: "Apolo (Marketing)", text: "As almas não estão 'fugindo do tormento', elas estão 'buscando recolocação no plano terreno'." },

  // AFRODITE (RH e Ameaças Veladas)
  { sender: "Afrodite (RH)", text: "Esse conflito entre Zeus e Hades não é novo. Eu estava lá. Não vou comentar. Mas estava lá." },
  { sender: "Afrodite (RH)", text: "Lembrete amigável: O RH sabe quem está usando a conta premium de néctar na sala de descanso." },
  { sender: "Afrodite (RH)", text: "A tentativa de 'Dinâmica de Grupo' no Tártaro resultou em 40 mutilações. Consideramos um sucesso parcial." },
  { sender: "Afrodite (RH)", text: "Estamos implementando o 'Casual Friday' no Submundo. Almas torturadas podem usar roupas leves." },

  // HERMES (Logística, o único que trabalha)
  { sender: "Hermes (Logística)", text: "Já passei o recado de Zeus para Hades, e de Hades para Zeus. Nenhum vai responder. Já documentei tudo." },
  { sender: "Hermes (Logística)", text: "Aviso de atraso: Sua remessa de pedras para a Torre de Sísifo foi extraviada. Já documentei a perda." },
  { sender: "Hermes (Logística)", text: "Entreguei o memorando urgente de Hades para Zeus. Zeus usou como porta-copos. Está em ata." },
  { sender: "Hermes (Logística)", text: "Mais uma fuga no setor 4. Redigindo relatório de incidente #4.892. Minha tendinite está piorando." },

  // ZEUS (Chairman e FPR)
  { sender: "Zeus (CEO)", text: "O sucesso da contenção de ontem é prova da nossa excelente estratégia de delegação de riscos." },
  { sender: "Zeus (CEO)", text: "Cortamos os fundos do Submundo para incentivar a inovação disruptiva. De nada, Hades." },
  { sender: "Zeus (CEO)", text: "FPR não é egoísmo. É estratégia. Rico sabe usar recurso. Pobre gasta. São fatos." },
  
  // HADES (O gerente exausto)
  { sender: "Hades (Operações)", text: "Para constar em ata: eu avisei que a Torre de Sísifo precisava de manutenção há três séculos." },
  { sender: "Hades (Operações)", text: "O orçamento da segurança foi cortado de novo. Pelo visto, conter os mortos agora é 'trabalho voluntário'." },
  { sender: "Hades (Operações)", text: "Se mais um herói de Atenas for mandado para cá com 'status VIP', eu mesmo o jogo no Tártaro." }
];