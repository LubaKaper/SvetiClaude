/**
 * Game packs: everything Sveti knows about a game.
 *
 *   facts     -> real mechanics and numbers, fed to the AI so examples are
 *                faithful to the game instead of vaguely "gamer flavoured"
 *   starters  -> suggested chat openers (algebra)
 *   writing   -> suggested chat openers (English)
 *   scenarios -> one quest generator per algebra topic. Each receives a random
 *                helper `r` and returns a finished problem via the builders.
 *
 * Sveti is an independent study tool and is not affiliated with any of the
 * games referenced here. Names are used only to describe the games.
 */
import { Q, n } from '../lib/builders.js'

export const MAX_GAMES = 3

export const GAMES = [
  {
    id: 'minecraft',
    name: 'Minecraft',
    emoji: '⛏️',
    tint: '#5fbf4a',
    genre: 'Sandbox survival',
    aliases: ['mc'],
    facts: [
      'A full stack is 64 items.',
      '1 log crafts into 4 planks; 2 planks craft into 4 sticks.',
      '9 ingots craft into 1 block (iron, gold, etc.), and back again.',
      '1 piece of coal smelts 8 items in a furnace.',
      'A sword needs 2 diamonds, a pickaxe 3; a full set of diamond armor needs 24.',
      'Travelling 1 block in the Nether equals 8 blocks in the Overworld.',
      'Villagers trade items for emeralds. The player has 20 health points (10 hearts).',
      'A full day-night cycle lasts 20 real minutes. Max enchanting (level 30) needs 15 bookshelves.',
    ],
    starters: [
      'Explain ratios using crafting recipes',
      'What is slope? Use a staircase I could build',
      'Show me how to solve 3x + 12 = 48 with emerald trading',
    ],
    writing: [
      'Help me build a thesis: is Survival or Creative mode better?',
      'Help me describe my best base using vivid sensory details',
    ],
    // Words for the English drills: a plural item, a place (with its preposition),
    // plural creatures/opponents, and two arguable thesis statements.
    lex: {
      items: "diamonds",
      at: "in the Nether",
      mobs: "creepers",
      claims: [
        "Minecraft's Survival mode teaches planning because every night punishes players who did not prepare",
        "Creative mode is the better place to learn building because unlimited blocks let players experiment without fear of losing progress",
      ],
    },
    scenarios: {
      linear: (r) => {
        const a = r.by(r.int(2, 5), r.int(4, 9), r.int(7, 15))
        const b = r.by(0, r.int(5, 30), r.int(12, 60))
        const x = r.by(r.int(3, 9), r.int(5, 12), r.int(8, 20))
        const c = a * x + b
        return Q.linear({
          a, b, x, thing: 'trading trips', unit: 'trips',
          story: `Every trip through your villager trading hall earns you **${a} emeralds**. ${b ? `You already have **${b} emeralds** in your ender chest.` : 'Your ender chest is empty right now.'} The librarian's Mending book setup will cost **${n(c)} emeralds** in total.`,
          ask: 'How many trading trips do you need?',
        })
      },
      percent: (r) => {
        const stacks = r.by(r.int(1, 3), r.int(2, 6), r.int(4, 12))
        const p = r.by(r.pick([25, 50]), r.pick([25, 75]), r.pick([12.5, 37.5, 75]))
        return Q.percent({
          kind: 'of', p, whole: stacks * 64, unit: 'blocks',
          story: `After a long mining session you dump **${stacks} full ${stacks === 1 ? 'stack' : 'stacks'}** of blocks into a chest (a stack is 64). You notice **${p}%** of them are just cobblestone.`,
          ask: 'How many blocks of cobblestone are in the chest?',
        })
      },
      ratio: (r) => {
        const c = 8 * r.by(r.int(10, 40), r.int(40, 120), r.int(120, 400))
        return Q.ratio({
          a: 8, b: 1, c, unit: 'blocks',
          story: `Travelling **1 block** in the Nether moves you **8 blocks** in the Overworld. Your friend's base is **${n(c)} blocks** away in the Overworld, and you're building a Nether highway to reach it.`,
          ask: 'How many blocks long does the Nether highway need to be?',
        })
      },
      fn: (r) => {
        const m = r.by(r.int(6, 12), r.int(12, 32), r.int(24, 64))
        const b = r.by(r.int(10, 30), r.int(20, 80), r.int(64, 192))
        const x = r.by(r.int(3, 6), r.int(5, 10), r.int(8, 15))
        return Q.fn({
          m, b, x, unit: 'sugar cane',
          story: `Your automatic sugar cane farm drops **${m} sugar cane** into its chest every Minecraft day. The chest already had **${b}** in it when you switched the farm on.`,
          ask: `How much sugar cane is in the chest after ${x} days?`,
        })
      },
      system: (r) => {
        const x = r.by(r.int(2, 4), r.int(3, 7), r.int(5, 12))
        const y = r.by(r.int(2, 4), r.int(3, 7), r.int(5, 12))
        return Q.system({
          x, y, p: 3, q: 2, itemX: 'pickaxes', itemY: 'swords', unit: 'pickaxes',
          story: `You're gearing up your whole server. A diamond pickaxe uses **3 diamonds** and a diamond sword uses **2**. You crafted **${x + y} tools** in total and used exactly **${3 * x + 2 * y} diamonds**.`,
          ask: 'How many pickaxes did you craft?',
        })
      },
    },
  },

  {
    id: 'fortnite',
    name: 'Fortnite',
    emoji: '🪂',
    tint: '#9d6bff',
    genre: 'Battle royale',
    aliases: ['fn', 'fort'],
    facts: [
      'A classic Battle Royale match starts with 100 players.',
      'Players have up to 100 health and 100 shield.',
      'A Small Shield Potion gives 25 shield (only up to 50); a big Shield Potion gives 50.',
      'A Med Kit restores health to 100; a bandage heals 15 (up to 75).',
      'Fully built walls have 150 HP (wood), 300 HP (stone/brick) and 500 HP (metal).',
      'The storm circle shrinks in stages and damages players outside it every second.',
      'V-Bucks are the currency for the Item Shop and Battle Pass.',
    ],
    starters: [
      'Explain percentages using shield and health',
      'Teach me linear equations with storm damage',
      'How do ratios work? Use harvesting materials',
    ],
    writing: [
      'Help me argue: is building or zero-build the better mode?',
      'Help me write a tense story about the final storm circle',
    ],
    lex: {
      items: "shield potions",
      at: "in the storm",
      mobs: "opponents",
      claims: [
        "Zero Build is the better mode for new players because it rewards aim and positioning instead of building speed",
        "Landing away from crowded spots is the smarter strategy because surviving the early game matters more than early eliminations",
      ],
    },
    scenarios: {
      linear: (r) => {
        const a = r.by(r.pick([1, 2]), r.pick([2, 5]), r.pick([5, 8]))
        const x = r.by(r.int(5, 20), r.int(6, 15), r.int(4, 12))
        const b = r.by(100, r.int(120, 200), r.int(130, 200))
        const c = b - a * x
        return Q.linear({
          a, b, x, sign: -1, thing: 'seconds in the storm', unit: 'seconds',
          story: `You're caught outside the circle with **${b} total HP** (health + shield). The storm is ticking for **${a} damage every second**. You'll reach the safe zone with **${c} HP** left.`,
          ask: 'How many seconds were you in the storm?',
        })
      },
      percent: (r) => {
        const whole = r.by(r.pick([800, 1200]), r.pick([1200, 1500, 2000]), r.pick([1500, 2000, 2800]))
        const p = r.by(r.pick([25, 50]), r.pick([20, 30, 40]), r.pick([15, 35, 45]))
        return Q.percent({
          kind: 'off', p, whole, unit: 'V-Bucks',
          story: `A skin you've wanted for ages is back in the Item Shop for **${n(whole)} V-Bucks**. Because you already own part of its bundle, you get **${p}% off**.`,
          ask: 'How many V-Bucks will you actually pay?',
        })
      },
      ratio: (r) => {
        const a = r.by(r.pick([2, 4]), r.pick([3, 5]), r.pick([6, 8]))
        const per = r.by(r.pick([10, 20]), r.pick([15, 25]), r.pick([12, 18]))
        const b = a * per
        const c = a * r.by(r.int(3, 6), r.int(4, 9), r.int(6, 14))
        return Q.ratio({
          a, b, c, unit: 'wood',
          story: `While farming a forest you notice **${a} trees** give you **${b} wood**. You have time to chop **${c} trees** before the circle closes.`,
          ask: 'How much wood will you have at that rate?',
        })
      },
      fn: (r) => {
        const m = r.by(r.pick([20, 30]), r.pick([25, 35, 45]), r.pick([35, 45, 55]))
        const b = r.by(r.pick([50, 100]), r.int(60, 180), r.int(110, 290))
        const x = r.by(r.int(3, 6), r.int(5, 9), r.int(8, 14))
        return Q.fn({
          m, b, x, unit: 'wood',
          story: `You land with nothing, grab **${b} wood** from a chest, and then harvest pallets on the way to the circle. Each pallet gives **${m} wood**.`,
          ask: `How much wood do you have after ${x} pallets?`,
        })
      },
      system: (r) => {
        const x = r.by(r.int(1, 3), r.int(2, 6), r.int(4, 10))
        const y = r.by(r.int(2, 4), r.int(3, 7), r.int(5, 12))
        return Q.system({
          x, y, p: 500, q: 150, itemX: 'metal walls', itemY: 'wood walls', unit: 'metal walls',
          story: `In a build fight you throw up **${x + y} walls** — some metal (**500 HP** each when fully built) and some wood (**150 HP** each). Together your walls have **${n(500 * x + 150 * y)} HP**.`,
          ask: 'How many of the walls are metal?',
        })
      },
    },
  },

  {
    id: 'roblox',
    name: 'Roblox',
    emoji: '🧱',
    tint: '#ff5a5f',
    genre: 'Game platform',
    aliases: ['rblx'],
    facts: [
      'Robux is the platform currency.',
      'Creators keep 70% of a game pass sale; Roblox takes a 30% marketplace fee.',
      'Roblox Premium pays a monthly Robux stipend (450, 1,000 or 2,200 depending on tier).',
      'An "obby" is an obstacle-course game made of numbered stages with checkpoints.',
      'Tycoon games use droppers that earn cash at a steady rate to buy upgrades.',
      'Experiences are built in Roblox Studio and scripted in Luau.',
    ],
    starters: [
      'Explain percentages using the 30% marketplace fee',
      'Teach me linear functions with a tycoon dropper',
      'How do I solve for x? Use saving up Robux',
    ],
    writing: [
      'Help me write a persuasive pitch for a game I want to build',
      'Help me outline a review of my favorite experience',
    ],
    lex: {
      items: "game passes",
      at: "in the obby",
      mobs: "other players",
      claims: [
        "Roblox turns players into creators because anyone can publish a game that others actually play",
        "Obbies are the best games for beginners because checkpoints let players fail without starting over",
      ],
    },
    scenarios: {
      linear: (r) => {
        const a = r.by(450, r.pick([450, 1000]), r.pick([450, 1000, 2200]))
        const b = r.by(0, r.int(1, 8) * 50, r.int(3, 30) * 25)
        const x = r.by(r.int(2, 5), r.int(3, 8), r.int(4, 12))
        return Q.linear({
          a, b, x, thing: 'months', unit: 'months',
          story: `Your Premium membership pays **${n(a)} Robux** each month, and you ${b ? `have **${n(b)} Robux** saved already` : 'are starting from zero'}. The limited item you want costs **${n(a * x + b)} Robux**.`,
          ask: 'How many months of stipend will it take?',
        })
      },
      percent: (r) => {
        const whole = r.by(r.pick([100, 200, 500]), r.pick([150, 250, 750]), r.pick([150, 350, 1250]))
        return Q.percent({
          kind: 'of', p: 70, whole, unit: 'Robux',
          story: `You publish a game pass for **${n(whole)} Robux**. Roblox takes a 30% marketplace fee, so you keep **70%** of every sale.`,
          ask: 'How many Robux do you earn from one sale?',
        })
      },
      ratio: (r) => {
        const a = r.by(r.pick([5, 10]), r.pick([4, 6, 8]), r.pick([6, 8, 12]))
        const b = a * r.by(r.pick([1, 2]), r.pick([2, 3]), r.pick([1.5, 2.5]))
        const c = a * r.by(r.int(3, 6), r.int(5, 10), r.int(8, 16))
        return Q.ratio({
          a, b, c, unit: 'minutes',
          story: `You're speedrunning a mega obby. So far you've cleared **${a} stages** in **${b} minutes**. The obby has **${c} stages**.`,
          ask: 'At that pace, how many minutes will the whole obby take?',
        })
      },
      fn: (r) => {
        const m = r.by(r.pick([5, 10]), r.pick([15, 25, 40]), r.pick([35, 60, 75]))
        const b = r.by(r.pick([50, 100]), r.int(2, 9) * 50, r.int(5, 30) * 25)
        const x = r.by(r.pick([10, 20, 30]), r.pick([30, 45, 60]), r.pick([90, 120, 150]))
        return Q.fn({
          m, b, x, unit: 'cash',
          story: `In your tycoon, the droppers earn **$${m} cash every second**. You've got **$${n(b)}** sitting in the collector when you step away from the keyboard.`,
          ask: `How much cash is there after ${x} seconds?`,
        })
      },
      system: (r) => {
        const p = r.by(100, r.pick([150, 200]), r.pick([250, 400]))
        const q = r.by(25, r.pick([50, 75]), r.pick([75, 125]))
        const x = r.by(r.int(2, 5), r.int(3, 9), r.int(6, 15))
        const y = r.by(r.int(3, 6), r.int(4, 12), r.int(8, 20))
        return Q.system({
          x, y, p, q, itemX: 'VIP passes', itemY: 'Speed passes', unit: 'VIP passes',
          story: `Your game sells a **VIP pass for ${p} Robux** and a **Speed pass for ${q} Robux**. Today you sold **${x + y} passes** for a total of **${n(p * x + q * y)} Robux** (before fees).`,
          ask: 'How many VIP passes did you sell?',
        })
      },
    },
  },

  {
    id: 'pokemon',
    name: 'Pokémon',
    emoji: '⚡',
    tint: '#ffcb05',
    genre: 'Monster-collecting RPG',
    aliases: ['pokemon', 'pokémon go', 'pokemon go', 'poke'],
    facts: [
      'A party holds up to 6 Pokémon, each with up to 4 moves. The level cap is 100.',
      'Super-effective moves deal 2× damage; not-very-effective moves deal 0.5×.',
      'STAB: a move that matches the user\'s type deals 1.5× damage.',
      'A Potion restores 20 HP. In most games a Poké Ball costs 200 Pokédollars and a Great Ball 600.',
      'There are 18 types. Eevee has 8 different evolutions.',
      'Shiny Pokémon are rare alternate-colour variants.',
    ],
    starters: [
      'Explain multiplying decimals with type effectiveness',
      'Teach me two-step equations with a Poké Mart trip',
      'What is a ratio? Use my team\'s types',
    ],
    writing: [
      'Help me argue which starter is the best choice',
      'Help me write a character sketch of a rival trainer',
    ],
    lex: {
      items: "Poké Balls",
      at: "in the tall grass",
      mobs: "wild Pokémon",
      claims: [
        "A balanced team beats a team of favorites because type matchups decide most battles",
        "The starter choice matters less than players think because any team can be rebuilt by the third gym",
      ],
    },
    scenarios: {
      linear: (r) => {
        const b = r.by(0, r.pick([300, 600]), r.pick([700, 1500, 2100]))
        const x = r.by(r.int(3, 9), r.int(5, 15), r.int(12, 30))
        return Q.linear({
          a: 200, b, x, thing: 'Poké Balls', unit: 'Poké Balls',
          story: `You walk into the Poké Mart with **₽${n(200 * x + b)}**. ${b ? `You spend **₽${n(b)}** on healing items first, then` : 'You'} put everything that's left into Poké Balls at **₽200** each.`,
          ask: 'How many Poké Balls can you buy?',
        })
      },
      percent: (r) => {
        const whole = r.by(r.pick([40, 60, 80]), r.pick([80, 120, 160, 200]), r.pick([160, 240, 320]))
        const p = r.by(r.pick([25, 50]), r.pick([15, 35, 75]), r.pick([12.5, 37.5, 62.5]))
        return Q.percent({
          kind: 'of', p, whole, unit: 'HP',
          story: `Mid-battle, your Snorlax is hanging on. Its max HP is **${whole}** and the health bar shows **${p}%** remaining.`,
          ask: 'How many HP does Snorlax have left?',
        })
      },
      ratio: (r) => {
        const c = 20 * r.by(r.int(2, 5), r.int(4, 9), r.int(7, 16))
        return Q.ratio({
          a: 20, b: 1, c, unit: 'Potions',
          story: `A Potion restores **20 HP**. After a rough gym battle, your team is missing a combined **${c} HP** and the Pokémon Center is a long walk away.`,
          ask: 'How many Potions do you need to heal everyone fully?',
        })
      },
      fn: (r) => {
        const m = r.by(r.int(2, 4), r.int(3, 6), r.int(4, 8))
        const b = r.by(5, r.int(8, 16), r.int(12, 28))
        const x = r.by(r.int(2, 4), r.int(3, 6), r.int(5, 8))
        return Q.fn({
          m, b, x, unit: 'level',
          story: `Your starter is **level ${b}** when you leave the first town. Training on every route, it gains about **${m} levels per gym badge**.`,
          ask: `What level is it after ${x} badges?`,
        })
      },
      system: (r) => {
        const x = r.by(r.int(1, 3), r.int(2, 6), r.int(4, 10))
        const y = r.by(r.int(2, 5), r.int(4, 10), r.int(6, 18))
        return Q.system({
          x, y, p: 600, q: 200, itemX: 'Great Balls', itemY: 'Poké Balls', unit: 'Great Balls',
          story: `Before heading into tall grass you stock up: **Great Balls at ₽600** and **Poké Balls at ₽200**. You leave with **${x + y} balls** and a receipt for **₽${n(600 * x + 200 * y)}**.`,
          ask: 'How many Great Balls did you buy?',
        })
      },
    },
  },

  {
    id: 'zelda',
    name: 'The Legend of Zelda',
    emoji: '🗡️',
    tint: '#2fbf8f',
    genre: 'Open-world adventure',
    aliases: ['zelda', 'botw', 'totk', 'breath of the wild', 'tears of the kingdom'],
    facts: [
      'Rupees are the currency: green = 1, blue = 5, red = 20, purple = 50, silver = 100, gold = 300.',
      'In Breath of the Wild, Link starts with 3 hearts.',
      '4 Spirit Orbs (one per shrine) trade for 1 Heart Container or 1 Stamina Vessel.',
      'Breath of the Wild has 120 shrines and 900 Korok seeds; Tears of the Kingdom has 152 shrines.',
      'Gems sell for rupees: amber 30, opal 60, ruby 210, diamond 500.',
      'Weapons break after enough hits; cooking combines up to 5 ingredients.',
    ],
    starters: [
      'Explain percentages using Korok seeds',
      'Teach me division with Spirit Orbs and hearts',
      'How do systems of equations work? Use rupee colors',
    ],
    writing: [
      'Help me analyze the theme of courage in the story',
      'Help me describe Hyrule so a reader can picture it',
    ],
    lex: {
      items: "rupees",
      at: "in Hyrule",
      mobs: "Bokoblins",
      claims: [
        "Breath of the Wild makes exploring rewarding because curiosity is almost always repaid with a discovery",
        "Breakable weapons improve the game because they push players to try tools they would otherwise ignore",
      ],
    },
    scenarios: {
      linear: (r) => {
        const x = r.by(r.int(2, 6), r.int(5, 12), r.int(10, 27))
        const b = r.by(0, r.int(1, 3), r.int(1, 3))
        return Q.linear({
          a: 4, b, x, thing: 'upgrades', unit: 'upgrades',
          story: `Every Heart Container or Stamina Vessel costs **4 Spirit Orbs**, and each shrine gives one orb. You've cleared **${4 * x + b} shrines** so far${b ? ` and still have **${b} ${b === 1 ? 'orb' : 'orbs'}** unspent` : ' and spent every orb'}.`,
          ask: 'How many upgrades have you bought?',
        })
      },
      percent: (r) => {
        const pct = r.by(r.pick([10, 20, 25, 50]), r.pick([15, 35, 45, 60]), r.pick([8, 17, 32, 73]))
        return Q.percent({
          kind: 'what', part: 9 * pct, whole: 900, unit: '%',
          story: `Hestu wants all **900 Korok seeds** in Breath of the Wild. After weeks of climbing every suspicious rock, you've found **${9 * pct}**.`,
          ask: 'What percent of the Korok seeds have you found?',
        })
      },
      ratio: (r) => {
        const [name, value] = r.by(r.pick([['blue', 5], ['red', 20]]), r.pick([['red', 20], ['purple', 50]]), r.pick([['purple', 50], ['gold', 300]]))
        const c = value * r.by(r.int(3, 9), r.int(6, 14), r.int(7, 24))
        return Q.ratio({
          a: value, b: 1, c, unit: `${name} rupees`,
          story: `A **${name} rupee** is worth **${value} rupees**. The armor you want in Hateno Village costs **${n(c)} rupees**.`,
          ask: `How many ${name} rupees would pay for it exactly?`,
        })
      },
      fn: (r) => {
        const [gem, m] = r.by(['amber', 30], r.pick([['amber', 30], ['opal', 60]]), r.pick([['opal', 60], ['ruby', 210]]))
        const b = r.by(r.int(2, 9) * 10, r.int(5, 40) * 5, r.int(20, 180) * 5)
        const x = r.by(r.int(3, 6), r.int(5, 10), r.int(8, 15))
        return Q.fn({
          m, b, x, unit: 'rupees',
          story: `You have **${n(b)} rupees** in your wallet and a pouch full of ore. A merchant buys **${gem}** for **${m} rupees** apiece.`,
          ask: `How many rupees will you have after selling ${x} pieces of ${gem}?`,
        })
      },
      system: (r) => {
        const x = r.by(r.int(1, 4), r.int(3, 8), r.int(5, 14))
        const y = r.by(r.int(2, 5), r.int(4, 10), r.int(6, 18))
        return Q.system({
          x, y, p: 20, q: 5, itemX: 'red rupees', itemY: 'blue rupees', unit: 'red rupees',
          story: `You smash every pot in a ruin and scoop up **${x + y} rupees** — a mix of red (worth **20**) and blue (worth **5**). Your wallet goes up by **${n(20 * x + 5 * y)}**.`,
          ask: 'How many red rupees did you pick up?',
        })
      },
    },
  },

  {
    id: 'mariokart',
    name: 'Mario Kart',
    emoji: '🏁',
    tint: '#ff4d4d',
    genre: 'Kart racing',
    aliases: ['mario kart 8', 'mk8', 'mario'],
    facts: [
      'In Mario Kart 8 Deluxe a race has 12 racers and usually 3 laps; a Grand Prix is 4 races.',
      'Grand Prix points: 1st = 15, 2nd = 12, 3rd = 10, 4th = 9, then one fewer per place down to 1.',
      'You can hold up to 10 coins; each coin slightly raises top speed.',
      'Engine classes are 50cc, 100cc, 150cc and 200cc — higher is faster.',
      'A Mushroom gives a short speed boost; the Blue Shell targets whoever is in 1st.',
    ],
    starters: [
      'Explain averages using my lap times',
      'Teach me linear equations with Grand Prix points',
      'What is rate of change? Use speed on a track',
    ],
    writing: [
      'Help me argue whether the Blue Shell is fair',
      'Help me write a play-by-play of a photo-finish race',
    ],
    lex: {
      items: "coins",
      at: "on Rainbow Road",
      mobs: "other racers",
      claims: [
        "The Blue Shell keeps races exciting because no lead is ever completely safe",
        "Lighter characters suit beginners because quick acceleration forgives the crashes new players make",
      ],
    },
    scenarios: {
      linear: (r) => {
        const b = r.by(0, r.pick([9, 10, 12]), r.pick([19, 21, 22, 27]))
        const x = r.by(r.int(2, 4), r.int(2, 3), r.int(2, 6))
        return Q.linear({
          a: 15, b, x, thing: 'wins', unit: 'wins',
          story: `A 1st-place finish is worth **15 points**. ${b ? `You've banked **${b} points** from earlier races that you didn't win.` : "The tournament has just started and you have no points yet."} Your rival's final score is going to be **${15 * x + b} points**.`,
          ask: 'How many race wins do you need to tie them?',
        })
      },
      percent: (r) => {
        const from = r.by(r.pick([40, 50]), r.pick([40, 60, 80]), r.pick([120, 160]))
        const p = r.by(r.pick([10, 20]), r.pick([5, 15]), r.pick([2.5, 7.5, 12.5]))
        const to = from - (from * p) / 100
        return Q.percent({
          kind: 'change', from, to, unit: '%',
          story: `Your first lap of the track took **${from} seconds**. After learning the shortcut and nailing your drifts, you get it down to **${to} seconds**.`,
          ask: 'By what percent did your lap time drop?',
        })
      },
      ratio: (r) => {
        const b = r.by(r.pick([90, 120]), r.pick([105, 135, 150]), r.pick([96, 114, 141]))
        const c = r.by(r.pick([6, 9]), r.pick([5, 7]), r.pick([7, 8, 10]))
        return Q.ratio({
          a: 3, b, c, unit: 'seconds',
          story: `A standard **3-lap** race on this track takes you **${b} seconds**. Your friends set up a custom endurance race of **${c} laps**.`,
          ask: 'At the same pace, how many seconds will the endurance race take?',
        })
      },
      fn: (r) => {
        const m = r.by(r.pick([10, 12]), r.pick([9, 12, 15]), r.pick([7, 8, 13]))
        const x1 = r.by(1, r.int(1, 2), r.int(2, 3))
        const x2 = x1 + r.by(2, r.int(2, 3), r.int(3, 5))
        const b = r.by(0, r.int(3, 9), r.int(5, 14))
        return Q.fn({
          kind: 'slope', x1, y1: m * x1 + b, x2, y2: m * x2 + b, unit: 'points per race',
          story: `You're remarkably consistent in online races. After **${x1} ${x1 === 1 ? 'race' : 'races'}** you had **${m * x1 + b} points**, and after **${x2} races** you had **${m * x2 + b} points**.`,
          ask: 'How many points are you earning per race?',
        })
      },
      system: (r) => {
        const x = r.by(r.int(1, 3), r.int(2, 5), r.int(4, 9))
        const y = r.by(r.int(2, 3), r.int(2, 6), r.int(4, 11))
        return Q.system({
          x, y, p: 15, q: 12, itemX: '1st-place finishes', itemY: '2nd-place finishes', unit: 'wins',
          story: `Over **${x + y} races** you never finished lower than 2nd. With **15 points** for 1st and **12** for 2nd, you scored **${15 * x + 12 * y} points**.`,
          ask: 'How many races did you win?',
        })
      },
    },
  },

  {
    id: 'rocketleague',
    name: 'Rocket League',
    emoji: '🚗',
    tint: '#3d9bff',
    genre: 'Car soccer',
    aliases: ['rl'],
    facts: [
      'Boost runs from 0 to 100. You spawn with 33 boost.',
      'A small boost pad gives 12 boost; a big boost pad fills you to 100.',
      'A standard match lasts 5 minutes; Standard mode is 3v3.',
      'Scoreboard points: goal = 100, assist = 50, save = 50.',
      'Hitting supersonic speed lets you demolish opponents.',
    ],
    starters: [
      'Explain two-step equations using boost pads',
      'Teach me percentages with shooting accuracy',
      'What is a linear function? Use scoreboard points',
    ],
    writing: [
      'Help me explain a mechanic to a beginner in clear steps',
      'Help me write a persuasive case for good teamwork over solo plays',
    ],
    lex: {
      items: "boost pads",
      at: "in the arena",
      mobs: "opponents",
      claims: [
        "Rotation matters more than mechanics because a team out of position cannot defend its goal",
        "Free play is the fastest way to improve because it lets players repeat one skill hundreds of times",
      ],
    },
    scenarios: {
      linear: (r) => {
        const x = r.by(r.int(1, 3), r.int(2, 4), r.int(3, 5))
        return Q.linear({
          a: 12, b: 33, x, thing: 'small boost pads', unit: 'pads',
          story: `You spawn with **33 boost**. On the way to the ball you roll over small pads worth **12 boost** each, and arrive with **${33 + 12 * x} boost**.`,
          ask: 'How many small pads did you collect?',
        })
      },
      percent: (r) => {
        const whole = r.by(r.pick([10, 20]), r.pick([20, 25, 40]), r.pick([16, 32, 80]))
        const pct = r.by(r.pick([20, 30, 50]), r.pick([20, 40, 60]), r.pick([25, 37.5, 62.5]))
        const part = (whole * pct) / 100
        return Q.percent({
          kind: 'what', part, whole, unit: '%',
          story: `Your post-session stats show **${whole} shots** on goal and **${part} goals**.`,
          ask: 'What was your shooting percentage?',
        })
      },
      ratio: (r) => {
        const a = r.by(r.pick([2, 4]), r.pick([2, 4, 6]), r.pick([4, 8]))
        const b = a * r.by(r.pick([2, 3]), r.pick([1.5, 2.5]), r.pick([1.25, 1.75, 2.25]))
        const c = a * r.by(r.int(3, 5), r.int(4, 8), r.int(5, 12))
        return Q.ratio({
          a, b, c, unit: 'goals',
          story: `Across your last **${a} matches** your team scored **${b} goals**. A tournament run would be **${c} matches**.`,
          ask: 'At that rate, how many goals would your team score in the tournament?',
        })
      },
      fn: (r) => {
        const saves = r.by(r.int(1, 3), r.int(2, 5), r.int(3, 7))
        const x = r.by(r.int(1, 3), r.int(2, 4), r.int(3, 6))
        return Q.fn({
          m: 100, b: 50 * saves, x, unit: 'points',
          story: `You've made **${saves} ${saves === 1 ? 'save' : 'saves'}** this match, giving you **${50 * saves} points** on the scoreboard. Every goal you score adds **100 points**.`,
          ask: `What's your score after ${x} ${x === 1 ? 'goal' : 'goals'}?`,
        })
      },
      system: (r) => {
        const x = r.by(r.int(1, 3), r.int(2, 4), r.int(3, 7))
        const y = r.by(r.int(2, 4), r.int(2, 6), r.int(4, 9))
        return Q.system({
          x, y, p: 100, q: 50, itemX: 'goals', itemY: 'saves', unit: 'goals',
          story: `You had a monster game: **${x + y} goals and saves** combined. Goals are **100 points**, saves are **50**, and those plays earned you **${n(100 * x + 50 * y)} points**.`,
          ask: 'How many goals did you score?',
        })
      },
    },
  },

  {
    id: 'stardew',
    name: 'Stardew Valley',
    emoji: '🌾',
    tint: '#f2a03d',
    genre: 'Farming sim',
    aliases: ['stardew', 'sdv'],
    facts: [
      'Each season is 28 days; there are 4 seasons in a year.',
      'Parsnip seeds cost 20g, take 4 days and sell for 35g.',
      'Potato seeds cost 50g, take 6 days and sell for 80g.',
      'Cauliflower seeds cost 80g, take 12 days and sell for 175g.',
      'Silver-quality crops sell for 25% more, gold-quality for 50% more.',
      'A basic Sprinkler waters 4 tiles, a Quality Sprinkler 8, an Iridium Sprinkler 24.',
      'You start the game with 500g and 15 parsnip seeds.',
    ],
    starters: [
      'Explain profit and percent using crop prices',
      'Teach me linear functions with daily farm income',
      'How do systems of equations work? Use buying seeds',
    ],
    writing: [
      'Help me describe a season on the farm with strong imagery',
      'Help me compare two villagers in a short essay',
    ],
    lex: {
      items: "parsnips",
      at: "in Pelican Town",
      mobs: "villagers",
      claims: [
        "Stardew Valley is relaxing because it lets players set their own goals and their own pace",
        "The first spring is the hardest season because players have little energy, money, or tools",
      ],
    },
    scenarios: {
      linear: (r) => {
        const b = r.by(0, r.int(2, 10) * 20, r.int(10, 50) * 15)
        const x = r.by(r.int(4, 10), r.int(10, 24), r.int(20, 60))
        return Q.linear({
          a: 35, b, x, thing: 'parsnips', unit: 'parsnips',
          story: `It's your first spring. Parsnips sell for **35g** each and you ${b ? `already have **${n(b)}g**` : 'have spent all your gold on seeds'}. You're saving for an upgrade that costs **${n(35 * x + b)}g**.`,
          ask: 'How many parsnips do you need to sell?',
        })
      },
      percent: (r) => {
        const [crop, whole, p, quality] = r.by(
          r.pick([['potato', 80, 25, 'silver'], ['potato', 80, 50, 'gold']]),
          r.pick([['pumpkin', 320, 25, 'silver'], ['melon', 250, 50, 'gold']]),
          r.pick([['pumpkin', 320, 50, 'gold'], ['starfruit', 750, 50, 'gold']]),
        )
        return Q.percent({
          kind: 'up', p, whole, unit: 'g',
          story: `A regular **${crop}** sells for **${whole}g**. Thanks to fertilizer, you harvest a **${quality}-quality** one, which sells for **${p}% more**.`,
          ask: `How much does the ${quality}-quality ${crop} sell for?`,
        })
      },
      ratio: (r) => {
        const [name, a] = r.by(['Quality Sprinkler', 8], r.pick([['Sprinkler', 4], ['Quality Sprinkler', 8]]), ['Iridium Sprinkler', 24])
        const c = a * r.by(r.int(2, 6), r.int(5, 12), r.int(4, 15))
        return Q.ratio({
          a, b: 1, c, unit: 'sprinklers',
          story: `One **${name}** waters **${a} tiles**. You've tilled a field of **${c} tiles** and never want to touch the watering can again.`,
          ask: 'How many sprinklers do you need?',
        })
      },
      fn: (r) => {
        const m = r.by(r.int(3, 9) * 20, r.int(8, 25) * 20, r.int(20, 60) * 25)
        const x = r.by(r.int(3, 7), r.int(7, 14), r.int(14, 28))
        return Q.fn({
          m, b: 500, x, unit: 'g',
          story: `You start with the classic **500g**. Once the farm is running, you clear a steady **${n(m)}g of profit every day**.`,
          ask: `How much gold will you have after ${x} days?`,
        })
      },
      system: (r) => {
        const x = r.by(r.int(2, 6), r.int(5, 15), r.int(10, 30))
        const y = r.by(r.int(3, 8), r.int(6, 20), r.int(12, 40))
        return Q.system({
          x, y, p: 50, q: 20, itemX: 'potato seeds', itemY: 'parsnip seeds', unit: 'potato seeds',
          story: `At Pierre's you buy **potato seeds (50g)** and **parsnip seeds (20g)**. You walk out with **${x + y} seed packets** and **${n(50 * x + 20 * y)}g** less in your pocket.`,
          ask: 'How many potato seeds did you buy?',
        })
      },
    },
  },

  {
    id: 'genshin',
    name: 'Genshin Impact',
    emoji: '✨',
    tint: '#6fd3e8',
    genre: 'Open-world action RPG',
    aliases: ['genshin'],
    facts: [
      '1 Wish costs 160 Primogems; a 10-pull costs 1,600.',
      'A 5-star is guaranteed within 90 Wishes on a character banner; a 4-star within every 10.',
      'Daily Commissions give 60 Primogems per day in total.',
      'Blessing of the Welkin Moon gives 90 Primogems per day.',
      'Original Resin regenerates 1 per 8 minutes. Domains and Ley Lines cost 20 Resin; normal bosses cost 40.',
      'A party has 4 characters; there are 7 elements that combine in Elemental Reactions.',
    ],
    starters: [
      'Explain linear equations using Primogems and Wishes',
      'Teach me rates with Resin regeneration',
      'What does probability mean for a banner?',
    ],
    writing: [
      'Help me analyze how a character changes over their story quest',
      'Help me describe a region of Teyvat with strong imagery',
    ],
    lex: {
      items: "Primogems",
      at: "in Teyvat",
      mobs: "Hilichurls",
      claims: [
        "Elemental Reactions make team building strategic because the right pair of elements beats raw power",
        "Exploration is the most rewarding part of the game because the world hides a reward behind nearly every landmark",
      ],
    },
    scenarios: {
      linear: (r) => {
        const wishes = r.by(r.int(1, 3), r.int(3, 8), r.int(8, 20))
        const x = r.by(r.int(2, 6), r.int(5, 15), r.int(12, 40))
        const c = 160 * wishes
        // Keep the "already saved" amount consistent with the wish target.
        const days = Math.min(x, Math.floor(c / 60))
        const b = c - 60 * days
        return Q.linear({
          a: 60, b, x: days, thing: 'days', unit: 'days',
          story: `You need **${n(c)} Primogems** for **${wishes} ${wishes === 1 ? 'Wish' : 'Wishes'}**. You have **${n(b)}** right now, and Daily Commissions give you **60 Primogems a day**.`,
          ask: 'How many days of commissions until you can afford them?',
        })
      },
      percent: (r) => {
        const pct = r.by(r.pick([10, 50]), r.pick([20, 30, 60, 70]), r.pick([40, 80, 90]))
        const part = (90 * pct) / 100
        return Q.percent({
          kind: 'what', part, whole: 90, unit: '%',
          story: `A 5-star is guaranteed within **90 Wishes**. Your wish history says you've made **${part}** since your last one.`,
          ask: 'What percent of the way to the guarantee are you?',
        })
      },
      ratio: (r) => {
        const c = r.by(r.pick([20, 40]), r.pick([60, 80, 120]), r.pick([140, 160, 200]))
        return Q.ratio({
          a: 1, b: 8, c, unit: 'minutes',
          story: `Original Resin comes back at **1 Resin every 8 minutes**. You've just spent it all, and you want **${c} Resin** for tonight's domain runs.`,
          ask: 'How many minutes will that take to regenerate?',
        })
      },
      fn: (r) => {
        const b = r.by(r.int(1, 5) * 100, r.int(2, 20) * 80, r.int(10, 60) * 40)
        const x = r.by(r.int(3, 7), r.int(7, 15), r.int(15, 30))
        return Q.fn({
          m: 90, b, x, unit: 'Primogems',
          story: `You have **${n(b)} Primogems** and an active Blessing of the Welkin Moon, which gives **90 Primogems every day** you log in.`,
          ask: `How many Primogems will you have after ${x} days (from Welkin alone)?`,
        })
      },
      system: (r) => {
        const x = r.by(r.int(1, 2), r.int(1, 3), r.int(2, 5))
        const y = r.by(r.int(2, 3), r.int(2, 5), r.int(3, 7))
        return Q.system({
          x, y, p: 40, q: 20, itemX: 'boss fights', itemY: 'domain runs', unit: 'boss fights',
          story: `You burn through your Resin in one session: bosses cost **40 Resin** and domains cost **20**. You claimed **${x + y} rewards** and spent **${40 * x + 20 * y} Resin**.`,
          ask: 'How many of those were boss fights?',
        })
      },
    },
  },

  {
    id: 'valorant',
    name: 'Valorant',
    emoji: '🎯',
    tint: '#ff4655',
    genre: 'Tactical shooter',
    aliases: ['val', 'valo'],
    facts: [
      'Matches are 5v5; the first team to win 13 rounds wins.',
      'Vandal and Phantom cost 2,900 credits; Spectre 1,600; Sheriff 800; Operator 4,700.',
      'Light Shields cost 400 credits, Heavy Shields 1,000.',
      'A kill earns 200 credits; winning a round earns 3,000. Credits cap at 9,000.',
      'Everyone starts a half with 800 credits.',
      'The Spike detonates 45 seconds after it is planted; a full defuse takes 7 seconds.',
    ],
    starters: [
      'Explain linear equations using the credit economy',
      'Teach me percentages with headshot rate',
      'Use buying loadouts to explain systems of equations',
    ],
    writing: [
      'Help me argue which agent role matters most to a team',
      'Help me write clear callouts — concise, precise language',
    ],
    lex: {
      items: "credits",
      at: "at the bomb site",
      mobs: "opponents",
      claims: [
        "Economy management wins matches because a team that buys together fights together",
        "Communication beats raw aim because five players sharing information can trap a stronger opponent",
      ],
    },
    scenarios: {
      linear: (r) => {
        const [gear, c] = r.by(['a Sheriff', 800], r.pick([['a Spectre', 1600], ['a Vandal', 2900]]), r.pick([['a Vandal with Heavy Shields', 3900], ['an Operator', 4700]]))
        const x = r.by(r.int(1, 2), r.int(2, 4), r.int(3, 6))
        return Q.linear({
          a: 200, b: c - 200 * x, x, thing: 'kills', unit: 'kills',
          story: `You want **${gear}** next round, which costs **${n(c)} credits**. You have **${n(c - 200 * x)} credits** banked, and every kill this round pays **200**.`,
          ask: 'How many kills do you need to afford it?',
        })
      },
      percent: (r) => {
        const whole = r.by(r.pick([20, 50]), r.pick([40, 60, 80]), r.pick([32, 48, 160]))
        const pct = r.by(r.pick([10, 20, 30]), r.pick([15, 25, 35]), r.pick([12.5, 18.75, 37.5]))
        const part = (whole * pct) / 100
        return Q.percent({
          kind: 'what', part, whole, unit: '%',
          story: `Your match summary says **${whole}** of your bullets hit an enemy, and **${part}** of those hits were headshots.`,
          ask: 'What was your headshot percentage?',
        })
      },
      ratio: (r) => {
        const a = r.by(r.pick([4, 5]), r.pick([6, 8]), r.pick([8, 12]))
        const b = a * r.by(r.pick([1, 2]), r.pick([0.5, 1.5]), r.pick([0.75, 1.25]))
        const c = a * r.by(r.int(2, 4), r.int(2, 3), r.int(2, 3))
        return Q.ratio({
          a, b, c, unit: 'kills',
          story: `Through the first **${a} rounds** you have **${b} kills**. This match looks like it'll go **${c} rounds**.`,
          ask: 'If you keep up that pace, how many kills will you finish with?',
        })
      },
      fn: (r) => {
        const b = r.by(800, r.int(4, 14) * 100, r.int(9, 29) * 50)
        const x = r.by(r.int(1, 2), r.int(2, 3), r.int(2, 4))
        return Q.fn({
          m: 3000, b, x, unit: 'credits',
          story: `Your team decides to save. You have **${n(b)} credits**, and every round you win pays **3,000 credits** (ignore the 9,000 cap for this one).`,
          ask: `If you spend nothing, how many credits would you have after winning ${x} ${x === 1 ? 'round' : 'rounds'}?`,
        })
      },
      system: (r) => {
        const x = r.by(r.int(1, 2), r.int(1, 3), r.int(2, 3))
        const y = 2
        return Q.system({
          x, y, p: 2900, q: 1600, itemX: 'Vandals', itemY: 'Spectres', unit: 'Vandals',
          story: `It's a team buy. Players pick either a **Vandal (2,900)** or a **Spectre (1,600)**. Your team buys **${x + y} guns** for **${n(2900 * x + 1600 * y)} credits** in total.`,
          ask: 'How many Vandals did the team buy?',
        })
      },
    },
  },
]

/**
 * Fallback pack for games that aren't in the catalogue (and for players who
 * haven't picked a game). Stories stay generic; the AI tutor supplies the real
 * references in chat from its own knowledge of the game.
 */
export function genericPack(name = '') {
  const game = name || 'your favorite game'
  return {
    id: name ? `custom:${name.toLowerCase()}` : 'generic',
    name: name || 'Any game',
    emoji: '🎮',
    tint: '#ffc53d',
    genre: name ? 'Your pick' : 'Classic arcade',
    custom: true,
    facts: [],
    starters: [
      `Explain ratios using ${game}`,
      `Teach me linear equations with an example from ${game}`,
      `How do percentages show up in ${game}?`,
    ],
    writing: [
      `Help me write a persuasive review of ${game}`,
      `Help me describe the world of ${game} with strong imagery`,
    ],
    lex: {
      items: 'coins',
      at: 'in the final level',
      mobs: 'enemies',
      claims: [
        `${name || 'This game'} rewards patience because its hardest challenges can only be beaten by learning from failure`,
        `${name || 'This game'} is worth replaying because each run teaches something the last one did not`,
      ],
    },
    scenarios: {
      linear: (r) => {
        const a = r.by(r.int(2, 9), r.int(5, 20), r.int(12, 45))
        const b = r.by(0, r.int(10, 60), r.int(40, 300))
        const x = r.by(r.int(3, 9), r.int(5, 14), r.int(8, 25))
        return Q.linear({
          a, b, x, thing: 'quests', unit: 'quests',
          story: `In ${game}, every quest you finish pays **${a} coins**. ${b ? `You have **${b} coins** saved.` : 'Your wallet is empty.'} The gear you want costs **${n(a * x + b)} coins**.`,
          ask: 'How many quests do you need to complete?',
        })
      },
      percent: (r) => {
        const whole = r.by(r.pick([100, 200, 400]), r.pick([250, 600, 800]), r.pick([1200, 1600, 2400]))
        const p = r.by(r.pick([10, 25, 50]), r.pick([15, 30, 40]), r.pick([12.5, 35, 65]))
        return Q.percent({
          kind: 'off', p, whole, unit: 'coins',
          story: `The shop in ${game} is running a sale. An upgrade that normally costs **${n(whole)} coins** is **${p}% off**.`,
          ask: 'What is the sale price?',
        })
      },
      ratio: (r) => {
        const a = r.by(r.pick([2, 5]), r.pick([3, 4, 6]), r.pick([6, 8, 12]))
        const b = a * r.by(r.pick([10, 20]), r.pick([15, 25]), r.pick([12.5, 17.5]))
        const c = a * r.by(r.int(3, 6), r.int(4, 10), r.int(6, 16))
        return Q.ratio({
          a, b, c, unit: 'XP',
          story: `In ${game}, clearing **${a} levels** earned you **${n(b)} XP**. There are **${c} levels** in this world.`,
          ask: 'At that rate, how much XP will the whole world give you?',
        })
      },
      fn: (r) => {
        const m = r.by(r.int(5, 15), r.int(15, 60), r.int(60, 250))
        const b = r.by(r.int(2, 10) * 10, r.int(5, 40) * 10, r.int(20, 120) * 25)
        const x = r.by(r.int(3, 6), r.int(5, 12), r.int(10, 24))
        return Q.fn({
          m, b, x, unit: 'points',
          story: `You begin a run of ${game} with a bonus of **${n(b)} points**, and every enemy you defeat adds **${m} points**.`,
          ask: `What's your score after defeating ${x} enemies?`,
        })
      },
      system: (r) => {
        const p = r.by(10, r.pick([25, 50]), r.pick([75, 120]))
        const q = r.by(5, r.pick([10, 20]), r.pick([30, 45]))
        const x = r.by(r.int(2, 5), r.int(3, 9), r.int(6, 15))
        const y = r.by(r.int(2, 6), r.int(4, 11), r.int(8, 20))
        return Q.system({
          x, y, p, q, itemX: 'rare items', itemY: 'common items', unit: 'rare items',
          story: `In ${game} you sell loot: rare items go for **${p} coins** and common items for **${q} coins**. You sold **${x + y} items** for **${n(p * x + q * y)} coins**.`,
          ask: 'How many rare items did you sell?',
        })
      },
    },
  }
}

const norm = (s) => String(s || '').trim().toLowerCase().replace(/\s+/g, ' ')

/** Tidy a player-typed game name: single line, no markup, max 40 chars. */
export function cleanGameName(name) {
  return String(name || '')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/[<>{}[\]`*_#|\\]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 40)
}

/** Catalogue pack for a name/id/alias, or null if it isn't a known game. */
export function findGame(name) {
  const key = norm(name)
  if (!key) return null
  return (
    GAMES.find((g) => g.id === key || norm(g.name) === key || g.aliases.includes(key)) || null
  )
}

/** Any stored preference (catalogue name or free text) -> a usable pack. */
export function resolveGame(name) {
  return findGame(name) || genericPack(cleanGameName(name))
}

/** Normalise a list of preferences: known games get canonical names, no dupes. */
export function normalizeGamePrefs(list) {
  const out = []
  for (const raw of Array.isArray(list) ? list : []) {
    const known = findGame(raw)
    const name = known ? known.name : cleanGameName(raw)
    if (name && !out.some((x) => norm(x) === norm(name))) out.push(name)
  }
  return out.slice(0, MAX_GAMES)
}
