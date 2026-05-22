/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Rocket, Users, BookOpen, Skull, Zap, Swords } from 'lucide-react';

export interface Scene {
  id: string;
  label: string;
  icon: any;
  bgImage: string;
}

export const SCENES_CONFIG: Scene[] = [
  { id: 'hero', label: 'Welcome', icon: Rocket, bgImage: '/src/assets/images/vice_city_collage_hero_1779187868741.png' },
  { id: 'characters', label: 'Characters', icon: Users, bgImage: '/src/assets/images/vice_city_mansion_backdrop_1779174174494.png' },
  { id: 'gangs', label: 'Gangs', icon: Swords, bgImage: '/src/assets/images/biker_gang_downtown_vice_city_1779176783800.png' },
  { id: 'story', label: 'Story', icon: BookOpen, bgImage: '/src/assets/images/vice_city_skyline_hero_1779174128801.png' },
  { id: 'missions', label: 'Missions', icon: Skull, bgImage: '/src/assets/images/vice_city_car_chase_action_1779174191686.png' },
  { id: 'cheats', label: 'Cheats', icon: Zap, bgImage: '/src/assets/images/vercetti_gang_action_1779176687234.png' },
];

export interface Relationship {
  targetId: string;
  type: 'Ally' | 'Enemy' | 'Employer' | 'Traitor' | 'Rival';
  label: string;
}

export interface Character {
  id: string;
  name: string;
  role: string;
  description: string;
  image?: string;
  type: 'Protagonist' | 'Antagonist' | 'Ally' | 'Neutral';
  relationships?: Relationship[];
  status?: string;
  threat?: string;
  lastSeen?: string;
}

export interface Mission {
  id: string;
  number: string;
  title: string;
  giver: string;
  description: string;
  strategy: string;
  tip: string;
  image?: string;
  rewards?: string[];
}

export interface Act {
  id: number;
  title: string;
  description: string;
}

export interface Cheat {
  effect: string;
  pc: string;
  ps2: string;
}

export interface Gang {
  id: string;
  name: string;
  leader: string;
  territory: string;
  description: string;
  members: string[];
  image?: string;
  color: string;
  hexColor: string;
  territoryPath: string; // SVG Path data (0-500 coordinate space)
}

export const CHARACTERS: Character[] = [
  {
    id: 'tommy',
    name: 'Tommy Vercetti',
    role: 'Protagonist',
    type: 'Protagonist',
    status: 'ACTIVE',
    threat: 'EXTREME',
    lastSeen: 'Vercetti Estate',
    description: 'A Forelli Family hitman released after 15 years. Sent to Vice City to oversee a drug deal that goes wrong. Cold, calculated, and ruthlessly ambitious.',
    image: '/src/assets/images/tommy_vercetti_iconic_pose_1779176400464.png',
    relationships: [
      { targetId: 'sonny', type: 'Enemy', label: 'Former Boss / Target' },
      { targetId: 'ken', type: 'Ally', label: 'Legal Advisor' },
      { targetId: 'lance', type: 'Traitor', label: 'Former Partner' },
      { targetId: 'diaz', type: 'Enemy', label: 'Rival/Target' }
    ]
  },
  {
    id: 'sonny',
    name: 'Sonny Forelli',
    role: 'Main Antagonist',
    type: 'Antagonist',
    status: 'KIA',
    threat: 'CRITICAL',
    lastSeen: 'Vercetti Estate (Staircase)',
    description: 'Boss of the Forelli Family in Liberty City. The true villain behind the lost drug money — wants Vice City\'s trade for himself.',
    image: '/src/assets/images/sonny_forelli_portrait_1779175321345.png',
    relationships: [
      { targetId: 'tommy', type: 'Enemy', label: 'The Butcher' },
      { targetId: 'lance', type: 'Ally', label: 'Informant' }
    ]
  },
  {
    id: 'ken',
    name: 'Ken Rosenberg',
    role: 'Lawyer / Ally',
    type: 'Ally',
    status: 'ACTIVE',
    threat: 'LOW',
    lastSeen: 'Vercetti Headquarters',
    description: 'Tommy\'s nervous, cocaine-addicted lawyer. Arranges introductions to local crime figures. Comedic but loyal.',
    image: '/src/assets/images/ken_rosenberg_portrait_1779175282615.png',
    relationships: [
      { targetId: 'tommy', type: 'Ally', label: 'The Boss' }
    ]
  },
  {
    id: 'lance',
    name: 'Lance Vance',
    role: 'Ally / Traitor',
    type: 'Ally',
    status: 'ELIMINATED',
    threat: 'HIGH',
    lastSeen: 'Vercetti Estate (Rooftop)',
    description: 'Partners with Tommy to take down Diaz. Later betrays Tommy by siding with Sonny Forelli.',
    image: '/src/assets/images/lance_vance_portrait_1779175302170.png',
    relationships: [
      { targetId: 'tommy', type: 'Traitor', label: 'The Betrayed' },
      { targetId: 'sonny', type: 'Ally', label: 'The New Deal' }
    ]
  },
  {
    id: 'diaz',
    name: 'Ricardo Diaz',
    role: 'Drug Kingpin',
    type: 'Antagonist',
    status: 'KIA',
    threat: 'LETHAL',
    lastSeen: 'Starfish Island Mansion',
    description: 'Most powerful drug baron in Vice City. Orchestrated the docks ambush to steal the Forelli cocaine.',
    image: '/src/assets/images/ricardo_diaz_portrait_1779175340214.png',
    relationships: [
      { targetId: 'tommy', type: 'Enemy', label: 'Threat to Empire' },
      { targetId: 'cortez', type: 'Rival', label: 'Uneasy Neighbor' }
    ]
  },
  {
    id: 'cortez',
    name: 'Colonel Juan Cortez',
    role: 'Military Contact',
    type: 'Ally',
    status: 'EVADED',
    threat: 'MODERATE',
    lastSeen: 'International Waters',
    description: 'Charming South American colonel who throws lavish yacht parties. Helps Tommy meet power brokers.',
    image: '/src/assets/images/juan_cortez_portrait_1779175359905.png',
    relationships: [
      { targetId: 'tommy', type: 'Ally', label: 'Valued Associate' },
      { targetId: 'mercedes', type: 'Ally', label: 'Daughter' },
      { targetId: 'diaz', type: 'Rival', label: 'Dangerous Neighbor' }
    ]
  },
  {
    id: 'avery',
    name: 'Avery Carrington',
    role: 'Property Developer',
    type: 'Ally',
    description: 'Texas real estate mogul. Teaches Tommy the value of owning assets over just working for others.',
    image: '/src/assets/images/avery_carrington_portrait_1779175387789.png',
    relationships: [
      { targetId: 'tommy', type: 'Employer', label: 'Mentor / Client' }
    ]
  },
  {
    id: 'umberto',
    name: 'Umberto Robina',
    role: 'Cuban Gang Leader',
    type: 'Ally',
    description: 'Proud, macho leader of the Cubans. Tests Tommy\'s courage before offering work.',
    image: '/src/assets/images/umberto_robina_portrait_1779175408912.png',
    relationships: [
      { targetId: 'tommy', type: 'Ally', label: 'Hermanos' },
      { targetId: 'poulet', type: 'Enemy', label: 'Gang War' }
    ]
  },
  {
    id: 'mercedes',
    name: 'Mercedes Cortez',
    role: 'Socialite / Contact',
    type: 'Ally',
    description: 'The Colonel\'s rebellious daughter. Spends her time at the Malibu Club and provides Tommy with valuable connections.',
    image: '/src/assets/images/mercedes_cortez_portrait_1779176092091.png',
    relationships: [
      { targetId: 'cortez', type: 'Ally', label: 'Father' },
      { targetId: 'tommy', type: 'Ally', label: 'Romantic Interest?' }
    ]
  },
  {
    id: 'kent',
    name: 'Kent Paul',
    role: 'Music Manager / Informant',
    type: 'Ally',
    description: 'A young British "face" in the Vice City music scene. Always knows what\'s happening on the streets and in the clubs.',
    image: '/src/assets/images/kent_paul_portrait_1779176129901.png',
    relationships: [
      { targetId: 'tommy', type: 'Ally', label: 'Primary Intel' },
      { targetId: 'mitch', type: 'Ally', label: 'Associate' }
    ]
  },
  {
    id: 'candy',
    name: 'Candy Suxxx',
    role: 'Adult Film Star',
    type: 'Neutral',
    description: 'A prominent adult film star used by Tommy to help build his film studio business in Vice Point.',
    image: '/src/assets/images/candy_suxxx_portrait_1779176180280.png',
    relationships: [
      { targetId: 'tommy', type: 'Employer', label: 'Studio Talent' }
    ]
  },
  {
    id: 'phil',
    name: 'Phil Cassidy',
    role: 'Arms Dealer / Gun Nut',
    type: 'Ally',
    description: 'A one-armed (eventually) military enthusiast and gun runner. Helps Tommy during several major heists.',
    image: '/src/assets/images/phil_cassidy_portrait_1779176145967.png',
    relationships: [
      { targetId: 'tommy', type: 'Ally', label: 'Weapon Supplier' }
    ]
  },
  {
    id: 'mitch',
    name: 'Mitch Baker',
    role: 'Biker Gang Leader',
    type: 'Ally',
    description: 'Leader of the Big Mitch Baker biker gang. A Vietnam vet who respects only strength and loyalty.',
    image: '/src/assets/images/mitch_baker_portrait_1779176164220.png',
    relationships: [
      { targetId: 'tommy', type: 'Ally', label: 'Muscle / Respect' },
      { targetId: 'kent', type: 'Ally', label: 'Associate' }
    ]
  },
  {
    id: 'poulet',
    name: 'Auntie Poulet',
    role: 'Haitian Matriarch',
    type: 'Ally',
    description: 'The mysterious leader of the Haitians. Uses mind-altering powders to force Tommy into doing her dirty work.',
    image: '/src/assets/images/auntie_poulet_portrait_1779176110930.png',
    relationships: [
      { targetId: 'tommy', type: 'Ally', label: 'Voodoo Influence' },
      { targetId: 'umberto', type: 'Enemy', label: 'Gang War' }
    ]
  },
];

export const ACTS: Act[] = [
  {
    id: 1,
    title: 'The Harwood Butcher in Paradise',
    description: 'Tommy Vercetti, fresh from a 15-year prison stint for a massacre in Harwood, is sent to Vice City by Sonny Forelli to establish a southern foothold. The welcoming party is a dockside ambush that leaves Tommy’s associates dead and the Forelli money stolen. Stranded and under Sonny’s mounting pressure, Tommy navigates the glamorous yacht parties of Colonel Cortez, using his neurotic lawyer Ken Rosenberg to meet the city’s elite while hunting for the thief who robbed him.',
  },
  {
    id: 2,
    title: 'The Unholy Alliance',
    description: 'While tracking the shipment, Tommy forms a volatile partnership with Lance Vance, who lost his brother in the same ambush. Together, they infiltrate the inner circle of the city\'s most dangerous man: Ricardo Diaz. Tommy balances high-stakes property sabotage for Avery Carrington with brutal wet-work for Cortez, steadily realizing that the traditional mob hierarchy of Liberty City has no power here. Every job is a step closer to identifying the betrayal at the heart of the Vice City underworld.',
  },
  {
    id: 3,
    title: 'Coup d\'État on Starfish Island',
    description: 'The narrative reaches a boiling point when Tommy and Lance discover that Diaz himself orchestrated the ambush to eliminate the competition. In a daring raid on Diaz\'s heavily fortified mansion, Tommy executes the kingpin in his own study. This marks a radical transition—Tommy refuses to return the reclaimed assets to the Forelli family, instead claiming Diaz’s mansion, his business contacts, and the title of Vice City’s newest Drug Lord. The Vercetti Crime Family is born.',
  },
  {
    id: 4,
    title: 'The Ownership Class',
    description: 'Transitioning from a hitman to a mogul, Tommy systematically buys out the city’s infrastructure. From the high-end Malibu Club to the Interglobal Film Studio and the Boatyard, Tommy builds an iron-clad economic empire. He secures the loyalty of the Cuban street gangs and the heavy-hitting Biker outlaws, providing him with a private army. However, this massive success begins to poison his relationship with Lance, who feels relegated to a second-tier "errand boy" in Tommy’s shadows.',
  },
  {
    id: 5,
    title: 'The Counterfeit Gamble',
    description: 'With Sonny Forelli preparing to visit "his" southern assets, Tommy acquires a Print Works to produce state-of-the-art counterfeit bills. He plans to pay Sonny in fake currency, effectively declaring independence from the Liberty City mob. This act is defined by a tense cold war; Sonny sends enforcers to tax Tommy\'s businesses, and Tommy responds with lethal force. The tension between Tommy’s loyalty to his past and his ambition for a solo future reaches a breaking point.',
  },
  {
    id: 6,
    title: 'Keep Your Friends Close',
    description: 'The finale brings Sonny Forelli to Tommy’s doorstep at the Vercetti Estate. In a devastating twist, Lance Vance betrays Tommy, siding with Sonny and citing his lack of respect as the motive. Sonny reveals the Harwood massacre was a 15-year setup to remove Tommy from power. In the resulting bloodbath, Tommy guns down his former partner on the roof and executes Sonny in the mansion’s hall. Tommy survives as the undisputed, yet lonely, king of a neon empire, finally free of the Forelli legacy.',
  },
];

export const MISSIONS: Mission[] = [
  {
    id: 'party',
    number: '001',
    title: 'The Party',
    giver: 'Ken Rosenberg',
    description: 'Change into party clothes and meet Colonel Cortez on his yacht.',
    strategy: 'No combat. Just drive and watch the cutscenes.',
    tip: 'Grab a fast car like an Infernus for the drive.',
    image: '/src/assets/images/the_party_custom_art_1779188644164.png',
    rewards: ['$100', 'Casual Suit Unlocked', 'Colonel Cortez Recognition'],
  },
  {
    id: 'back-alley',
    number: '002',
    title: 'Back Alley Brawl',
    giver: 'Ken Rosenberg',
    description: 'Find Kent Paul to get info on a chef, then kill the chef and take his phone.',
    strategy: 'Beat the chef in the alley. Escape the 2-star wanted level.',
    tip: 'Lure the chef away from witnesses. Use a fast car for the escape.',
    image: '/src/assets/images/back_alley_brawl_custom_art_1779188663399.png',
    rewards: ['$200', 'Mobile Phone Access', 'Kent Paul Intel Network'],
  },
  {
    id: 'guardian-angels',
    number: '005',
    title: 'Guardian Angels',
    giver: 'Colonel Cortez',
    description: 'Protect Ricardo Diaz during a drug deal with the Cubans.',
    strategy: 'Take a vantage point. Shoot all incoming Haitians. Chase the flyer on a Sanchez.',
    tip: 'The Ruger is your best friend here. Don’t let Diaz’s Admiral take too much damage.',
    image: '/src/assets/images/guardian_angels_mission_art_1779188555934.png',
    rewards: ['$1000', 'Diaz Connection', 'Assault Rifle Unlocked'],
  },
  {
    id: 'demolition-man',
    number: '007',
    title: 'Demolition Man',
    giver: 'Avery Carrington',
    description: 'Use an RC helicopter to plant bombs in a rival construction site.',
    strategy: 'Fly carefully. Start with the highest floor and work your way down.',
    tip: 'Kill the guards with the blades first to clear your path.',
    image: '/src/assets/images/demolition_man_mission_art_1779188579754.png',
    rewards: ['$1000', 'New Property Available', 'Avery’s Favor'],
  },
  {
    id: 'rub-out',
    number: '009',
    title: 'Rub Out',
    giver: 'Tommy & Lance',
    description: 'Storm Diaz\'s mansion and eliminate him.',
    strategy: 'Heavy combat. Enter from the back, clear guards floor by floor.',
    tip: 'Max out your armor and health. Use the Micro-SMG for close quarters.',
    image: '/src/assets/images/rub_out_custom_art_1779188680159.png',
    rewards: ['$50,000', 'Vercetti Estate Ownership', 'Diaz Empire Assets'],
  },
  {
    id: 'g-spotlight',
    number: '014',
    title: 'G-Spotlight',
    giver: 'Interglobal Studios',
    description: 'Jump a motorcycle across rooftops to adjust searchlights.',
    strategy: 'Maintain speed. Use the unique jumps to reach elevated platforms.',
    tip: 'The PCJ-600 is required. Don’t fall into the street or you lose time.',
    image: '/src/assets/images/g_spotlight_mission_art_1779188618228.png',
    rewards: ['$8000', 'Studio Asset Revenue', 'Stunt Mastery'],
  },
  {
    id: 'the-job',
    number: '015',
    title: 'The Job',
    giver: 'Malibu Club',
    description: 'Rob El Banco Corrupto Grande with a hand-picked crew.',
    strategy: 'Execute the plan. Open the vault, defend against SWAT, escape to the spray shop.',
    tip: 'Keep your crew alive for better efficiency. The M4 is essential for the escape.',
    image: '/src/assets/images/the_job_bank_heist_art_1779188600198.png',
    rewards: ['$50,000', 'Asset Completion', 'SWAT Outfits Unlocked'],
  },
  {
    id: 'keep-friends',
    number: '017',
    title: 'Keep Your Friends Close',
    giver: 'Vercetti Estate',
    description: 'Defend your estate against Sonny Forelli and his army.',
    strategy: 'Massive shootout. Kill Lance on the roof, then Sonny in the hall.',
    tip: 'Stay mobile. Use the M4 and explosives. Watch your back at all times.',
    image: '/src/assets/images/keep_friends_close_custom_art_1779188697007.png',
    rewards: ['$300,000', 'Undisputed King Status', 'Forelli Family Eradicated'],
  },
];

export const CHEATS: Record<string, Cheat[]> = {
  'Player / Weapons': [
    { effect: 'Full Health', pc: 'ASPIRINE', ps2: 'R1, R2, L1, ○, ←, ↓, →, ↑, ←, ↓, →, ↑' },
    { effect: 'Full Armor', pc: 'PRECIOUSPROTECTION', ps2: 'R1, R2, L1, X, ←, ↓, →, ↑, ←, ↓, →, ↑' },
    { effect: 'Clear Wanted', pc: 'LEAVEMEALONE', ps2: '○, ○, ○, △, △, △, ○, ○, ○, △, △, △' },
    { effect: 'Weapon Set 1', pc: 'THUGSTOOLS', ps2: 'R1, R2, L1, R2, ←, ↓, →, ↑, ←, ↓, →, ↑' },
    { effect: 'Weapon Set 2', pc: 'PROFESSIONALTOOLS', ps2: 'R1, R2, L1, R2, ←, ↓, →, ↑, ←, ↓, ↓, ←' },
    { effect: 'Weapon Set 3', pc: 'NUTTERTOOLS', ps2: 'R1, R2, L1, R2, ←, ↓, →, ↑, ←, ↓, ↓, ↓' },
  ],
  'Vehicles': [
    { effect: 'Spawn Tank', pc: 'PANZER', ps2: '○, ○, L1, ○, ○, ○, L1, L2, R1, △, ○, △' },
    { effect: 'Spawn Limo', pc: 'ROCKANDROLLCAR', ps2: 'R2, ↑, L2, ←, ←, R1, L1, ○, →' },
    { effect: 'Cars on Water', pc: 'SEAWAYS', ps2: '→, R2, ○, R1, L2, □, R1, R2' },
    { effect: 'Flying Cars', pc: 'COMEFLYWITHME', ps2: '○, ↓, □, ○, ↓, △, ○, △, ←' },
    { effect: 'Blow Up Cars', pc: 'BIGBANG', ps2: 'R2, L2, R1, L1, L2, R2, □, △, ○, △, L2, L1' },
  ],
};

export const GANGS: Gang[] = [
  {
    id: 'vercetti',
    name: 'Vercetti Gang',
    leader: 'Tommy Vercetti',
    territory: 'Starfish Island, Vercetti Estate',
    description: 'The most powerful organization in Vice City by the end of 1986. Formed from the ashes of the Diaz empire.',
    members: ['Lance Vance', 'Ken Rosenberg', 'Street Soldiers'],
    image: '/src/assets/images/vercetti_gang_action_1779176687234.png',
    color: 'bg-cyan',
    hexColor: '#22d3ee',
    territoryPath: 'M230,220 L310,220 L310,300 L230,300 Z',
  },
  {
    id: 'cubans',
    name: 'Los Cabrones (Cubans)',
    leader: 'Umberto Robina',
    territory: 'Little Havana',
    description: 'Hardworking and fiercely loyal. Engaged in a brutal turf war with the Haitians.',
    members: ['Alberto Robina', 'Cafe Robina Enforcers'],
    image: '/src/assets/images/cuban_gang_little_havana_1779176708940.png',
    color: 'bg-yellow',
    hexColor: '#facc15',
    territoryPath: 'M60,320 L180,320 L180,450 L60,450 Z',
  },
  {
    id: 'haitians',
    name: 'Haitian Gang',
    leader: 'Auntie Poulet',
    territory: 'Little Haiti',
    description: 'A secretive gang known for their voodoo influence and involvement in the drug trade.',
    members: ['Haitian Thugs', 'Voodoo Specialists'],
    image: '/src/assets/images/haitian_gang_little_haiti_v2_1779176765397.png',
    color: 'bg-purple-600',
    hexColor: '#9333ea',
    territoryPath: 'M60,200 L180,200 L180,310 L60,310 Z',
  },
  {
    id: 'bikers',
    name: 'Vice City Bikers',
    leader: 'Mitch Baker',
    territory: 'Downtown (The Greasy Chopper)',
    description: 'Lawless motorcycle enthusiasts who value strength and brotherhood above all else.',
    members: ['Big Mitch Baker', 'Biker Outlaws'],
    image: '/src/assets/images/biker_gang_downtown_vice_city_1779176783800.png',
    color: 'bg-red-600',
    hexColor: '#dc2626',
    territoryPath: 'M60,50 L180,50 L180,180 L60,180 Z',
  },
  {
    id: 'forelli',
    name: 'Forelli Crime Family',
    leader: 'Sonny Forelli',
    territory: 'Liberty City / Vice City Presence',
    description: 'The primary powerhouse from Liberty City seeking to expand their dominance into the south.',
    members: ['Sonny Forelli', 'Forelli Hitmen'],
    image: '/src/assets/images/forelli_gang_meeting_1779176800000_png_1779177080048.png',
    color: 'bg-pink',
    hexColor: '#ec4899',
    territoryPath: 'M350,400 A20,20 0 1,1 350,440 A20,20 0 1,1 350,400', // Just a marker point at the docks
  },
];
