export interface Ability {
    id: string;
    name: string;
    type: 'attack' | 'defense';
    defenseType?: 'dodge' | 'block' | 'reflect';
    value: number;
    description: string;
  }
  
  export interface Character {
    id: string;
    name: string;
    specialty: string;
    baseHealth: number;
    abilities: Ability[];
  }
  
  export const CHARACTERS: Character[] = [
    {
      id: 'donald-pump',
      name: 'Donald Pump',
      specialty: 'Offensive Powerhouse',
      baseHealth: 200,
      abilities: [
        // 4 Attacks
        {
          id: 'dp-heavy-strike',
          name: 'Heavy Strike',
          type: 'attack',
          value: 40,
          description: 'Unleash a devastating power blow'
        },
        {
          id: 'dp-rage-punch',
          name: 'Rage Punch',
          type: 'attack',
          value: 35,
          description: 'Channeled anger increases punch power'
        },
        {
          id: 'dp-lightning-combo',
          name: 'Lightning Combo',
          type: 'attack',
          value: 30,
          description: 'Rapid successive strikes'
        },
        {
          id: 'dp-crushing-blow',
          name: 'Crushing Blow',
          type: 'attack',
          value: 25,
          description: 'Powerful strike that breaks through defenses'
        },
        // 2 Defenses
        {
          id: 'dp-power-block',
          name: 'Power Block',
          type: 'defense',
          defenseType: 'block',
          value: 20,
          description: 'Solid defensive stance that completely blocks the attack'
        },
        {
          id: 'dp-momentum-dodge',
          name: 'Momentum Dodge',
          type: 'defense',
          defenseType: 'dodge',
          value: 25,
          description: 'Nimbly evade the attack while maintaining offensive readiness'
        }
      ]
    },
    {
      id: 'abraham-lickin',
      name: 'Abraham Lickin',
      specialty: 'Balanced Strategist',
      baseHealth: 200,
      abilities: [
        // 4 Attacks
        {
          id: 'al-precision-strike',
          name: 'Precision Strike',
          type: 'attack',
          value: 25,
          description: 'Calculated strike targeting weak points'
        },
        {
          id: 'al-tactical-blow',
          name: 'Tactical Blow',
          type: 'attack',
          value: 30,
          description: 'Strategic attack with measured force'
        },
        {
          id: 'al-opportunistic-hit',
          name: 'Opportunistic Hit',
          type: 'attack',
          value: 20,
          description: 'Exploit opponent\'s momentary weakness'
        },
        {
          id: 'al-critical-strike',
          name: 'Critical Strike',
          type: 'attack',
          value: 35,
          description: 'Precisely aimed attack for maximum impact'
        },
        // 2 Defenses
        {
          id: 'al-reflect-strike',
          name: 'Reflect Strike',
          type: 'defense',
          defenseType: 'reflect',
          value: 20,
          description: 'Redirect a portion of the incoming attack back to the opponent'
        },
        {
          id: 'al-calculated-dodge',
          name: 'Calculated Dodge',
          type: 'defense',
          defenseType: 'dodge',
          value: 25,
          description: 'Precise evasive maneuver that maintains offensive positioning'
        }
      ]
    },
    {
      id: 'king-barkles',
      name: 'King Barkles III',
      specialty: 'Royal Defender',
      baseHealth: 200,
      abilities: [
        // 4 Attacks
        {
          id: 'kb-royal-smash',
          name: 'Royal Smash',
          type: 'attack',
          value: 20,
          description: 'Powerful but controlled royal strike'
        },
        {
          id: 'kb-regal-punch',
          name: 'Regal Punch',
          type: 'attack',
          value: 25,
          description: 'Disciplined and precise attack'
        },
        {
          id: 'kb-defensive-strike',
          name: 'Defensive Strike',
          type: 'attack',
          value: 15,
          description: 'Attack that maintains defensive positioning'
        },
        {
          id: 'kb-royal-assault',
          name: 'Royal Assault',
          type: 'attack',
          value: 30,
          description: 'Coordinated and powerful attack sequence'
        },
        // 2 Defenses
        {
          id: 'kb-royal-guard',
          name: 'Royal Guard',
          type: 'defense',
          defenseType: 'block',
          value: 30,
          description: 'Impenetrable defensive stance that completely blocks the attack'
        },
        {
          id: 'kb-royal-reflect',
          name: 'Royal Reflect',
          type: 'defense',
          defenseType: 'reflect',
          value: 35,
          description: 'Precisely redirect the opponent\'s attack with royal precision'
        }
      ]
    },
    {
      id: 'vladimir-muffin',
      name: 'Vladimir Muffin',
      specialty: 'Tactical Disruptor',
      baseHealth: 200,
      abilities: [
        // 4 Attacks
        {
          id: 'vm-chaos-strike',
          name: 'Chaos Strike',
          type: 'attack',
          value: 35,
          description: 'Unpredictable and disorienting attack'
        },
        {
          id: 'vm-tactical-blow',
          name: 'Tactical Blow',
          type: 'attack',
          value: 25,
          description: 'Strategically placed strike'
        },
        {
          id: 'vm-mind-game-hit',
          name: 'Mind Game Hit',
          type: 'attack',
          value: 30,
          description: 'Attack that throws opponent off balance'
        },
        {
          id: 'vm-precision-strike',
          name: 'Precision Strike',
          type: 'attack',
          value: 20,
          description: 'Calculated strike with surgical precision'
        },
        // 2 Defenses
        {
          id: 'vm-tactical-block',
          name: 'Tactical Block',
          type: 'defense',
          defenseType: 'block',
          value: 20,
          description: 'Strategic block that neutralizes the opponent\'s attack'
        },
        {
          id: 'vm-counter-dodge',
          name: 'Counter Dodge',
          type: 'defense',
          defenseType: 'dodge',
          value: 25,
          description: 'Evasive maneuver that sets up a counter-attack'
        }
      ]
    }
  ];