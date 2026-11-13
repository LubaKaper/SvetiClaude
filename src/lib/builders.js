/**
 * Problem builders: turn a handful of numbers plus a game-flavoured story into
 * a complete quest (answer, three escalating hints, worked solution).
 *
 * The math lives here, so every game pack gets correct answers and consistent
 * pedagogy for free; packs only choose numbers and tell the story.
 */

/** Human-friendly number for story text (1,200 instead of 1200). */
export const n = (v) => Number(v).toLocaleString('en-US')

/** Trim float noise without forcing decimals (12.5 stays 12.5, 12 stays 12). */
const tidy = (v) => Math.round(v * 100) / 100

/** Signed term for LaTeX, e.g. term(-3) -> "- 3", term(3) -> "+ 3". */
const term = (v) => (v < 0 ? `- ${Math.abs(v)}` : `+ ${v}`)

/**
 * One- and two-step linear equations.
 *   sign = 1  ->  a·x + b = c   (something grows by `a` each time)
 *   sign = -1 ->  b − a·x = c   (something drains by `a` each time)
 */
function linear({ a, b = 0, x, sign = 1, thing, story, ask, unit }) {
  const c = sign === 1 ? a * x + b : b - a * x
  const equation =
    sign === 1 ? (b ? `${a}x + ${b} = ${c}` : `${a}x = ${c}`) : `${b} - ${a}x = ${c}`

  const steps = [`Let $x$ be the number of ${thing}.`, `Write the equation: $${equation}$`]
  if (sign === 1) {
    if (b) steps.push(`Subtract ${b} from both sides: $${a}x = ${c - b}$`)
    steps.push(`Divide both sides by ${a}: $x = ${x}$`)
  } else {
    steps.push(`Subtract ${b} from both sides: $-${a}x = ${c - b}$`)
    steps.push(`Divide both sides by $-${a}$: $x = ${x}$`)
  }

  return {
    story,
    ask,
    unit,
    answer: x,
    equation,
    hints: [
      `Call the unknown $x$ — the number of ${thing}. What happens to the total every time $x$ goes up by 1?`,
      `The equation is $${equation}$. What would you undo first?`,
      sign === 1
        ? `You should reach $${a}x = ${c - b}$. One more step: divide by ${a}.`
        : `You should reach $-${a}x = ${c - b}$. One more step: divide by $-${a}$.`,
    ],
    steps,
  }
}

/**
 * Percent problems.
 *   of     -> p% of whole
 *   off/up -> whole decreased / increased by p%
 *   what   -> part is what percent of whole
 *   change -> percent change going from `from` to `to` (answered as a size)
 */
function percent({ kind, p, whole, part, from, to, story, ask, unit }) {
  if (kind === 'of') {
    const answer = tidy((p * whole) / 100)
    return {
      story, ask, unit, answer,
      equation: `${p}\\% \\times ${whole}`,
      hints: [
        `"Percent" means "out of 100". How do you write ${p}% as a decimal?`,
        `$${p}\\% = ${p / 100}$. "Of" means multiply.`,
        `Work out $${p / 100} \\times ${whole}$.`,
      ],
      steps: [
        `Turn the percent into a decimal: $${p}\\% = \\frac{${p}}{100} = ${p / 100}$`,
        `"Of" means multiply: $${p / 100} \\times ${whole} = ${answer}$`,
      ],
    }
  }

  if (kind === 'off' || kind === 'up') {
    const delta = tidy((p * whole) / 100)
    const answer = tidy(kind === 'off' ? whole - delta : whole + delta)
    const op = kind === 'off' ? '-' : '+'
    const verb = kind === 'off' ? 'Subtract' : 'Add'
    return {
      story, ask, unit, answer,
      equation: `${whole} ${op} ${p}\\% \\times ${whole}`,
      hints: [
        `Start by finding ${p}% of ${n(whole)}. That's how much it changes by.`,
        `$${p}\\%$ of ${whole} is $${p / 100} \\times ${whole} = ${delta}$.`,
        `${verb} that ${delta} ${kind === 'off' ? 'from' : 'to'} the original ${whole}.`,
      ],
      steps: [
        `Find the change: $${p}\\% \\times ${whole} = ${p / 100} \\times ${whole} = ${delta}$`,
        `${verb} it ${kind === 'off' ? 'from' : 'to'} the original: $${whole} ${op} ${delta} = ${answer}$`,
        `Shortcut: multiply by $${tidy(1 + (kind === 'off' ? -p : p) / 100)}$ in one step.`,
      ],
    }
  }

  if (kind === 'what') {
    const answer = tidy((part / whole) * 100)
    return {
      story, ask, unit: '%', answer,
      equation: `\\frac{${part}}{${whole}} \\times 100`,
      hints: [
        `A percent is a fraction out of 100. Which number is the part and which is the whole?`,
        `Write the fraction $\\frac{${part}}{${whole}}$ and turn it into a decimal.`,
        `$\\frac{${part}}{${whole}} = ${tidy(part / whole)}$. Multiply by 100 to get the percent.`,
      ],
      steps: [
        `Write part over whole: $\\frac{${part}}{${whole}} = ${tidy(part / whole)}$`,
        `Multiply by 100: $${tidy(part / whole)} \\times 100 = ${answer}\\%$`,
      ],
    }
  }

  // kind === 'change'
  const diff = Math.abs(to - from)
  const answer = tidy((diff / from) * 100)
  return {
    story, ask, unit: '%', answer,
    equation: `\\frac{${diff}}{${from}} \\times 100`,
    hints: [
      `Percent change compares the size of the change to where you started. How big is the change?`,
      `The change is $${Math.max(from, to)} - ${Math.min(from, to)} = ${diff}$. Divide by the starting value, ${from}.`,
      `$\\frac{${diff}}{${from}} = ${tidy(diff / from)}$. Multiply by 100.`,
    ],
    steps: [
      `Find the change: $${Math.max(from, to)} - ${Math.min(from, to)} = ${diff}$`,
      `Divide by the starting value: $\\frac{${diff}}{${from}} = ${tidy(diff / from)}$`,
      `Multiply by 100: $${answer}\\%$`,
    ],
  }
}

/** Proportion: `a` of A goes with `b` of B, so `c` of A goes with x of B. */
function ratio({ a, b, c, story, ask, unit }) {
  const answer = tidy((b * c) / a)
  return {
    story, ask, unit, answer,
    equation: `\\frac{${a}}{${b}} = \\frac{${c}}{x}`,
    hints: [
      `The two quantities stay in the same ratio. Write the ratio you know as a fraction.`,
      `Set up the proportion $\\frac{${a}}{${b}} = \\frac{${c}}{x}$.`,
      `Cross-multiply: $${a} \\cdot x = ${b} \\cdot ${c} = ${b * c}$. Now divide by ${a}.`,
    ],
    steps: [
      `Set up the proportion: $\\frac{${a}}{${b}} = \\frac{${c}}{x}$`,
      `Cross-multiply: $${a} \\cdot x = ${b} \\cdot ${c} = ${b * c}$`,
      `Divide both sides by ${a}: $x = ${answer}$`,
    ],
  }
}

/**
 * Linear functions.
 *   eval  -> y = m·x + b, find y for a given x
 *   slope -> find the rate of change from two points
 */
function fn({ kind = 'eval', m, b = 0, x, x1, y1, x2, y2, story, ask, unit }) {
  if (kind === 'slope') {
    const answer = tidy((y2 - y1) / (x2 - x1))
    return {
      story, ask, unit, answer,
      equation: `m = \\frac{${y2} - ${y1}}{${x2} - ${x1}}`,
      hints: [
        `The rate of change (slope) is "change in output ÷ change in input".`,
        `The output changed by $${y2} - ${y1} = ${y2 - y1}$ while the input changed by $${x2} - ${x1} = ${x2 - x1}$.`,
        `Divide: $\\frac{${y2 - y1}}{${x2 - x1}}$.`,
      ],
      steps: [
        `Slope is rise over run: $m = \\frac{y_2 - y_1}{x_2 - x_1}$`,
        `Substitute the two points: $m = \\frac{${y2} - ${y1}}{${x2} - ${x1}} = \\frac{${y2 - y1}}{${x2 - x1}}$`,
        `Simplify: $m = ${answer}$`,
      ],
    }
  }

  const answer = m * x + b
  const rule = b ? `y = ${m}x ${term(b)}` : `y = ${m}x`
  return {
    story, ask, unit, answer,
    equation: rule,
    hints: [
      `This is a linear pattern: a starting amount plus the same change every time. Which number is the start and which is the rate?`,
      `The rule is $${rule}$, where $x$ counts how many times it happens.`,
      `Substitute $x = ${x}$: $${m} \\cdot ${x} ${b ? term(b) : ''}$.`,
    ],
    steps: [
      `Spot the rate (${m} each time)${b ? ` and the starting value (${b})` : ''}: $${rule}$`,
      `Substitute $x = ${x}$: $y = ${m} \\cdot ${x} ${b ? term(b) : ''}$`,
      `Calculate: $y = ${answer}$`,
    ],
  }
}

/**
 * Two-item system:  x + y = total count,  p·x + q·y = total value.
 * The quest asks for x; the worked solution finds both.
 */
function system({ x, y, p, q, itemX, itemY, story, ask, unit }) {
  const N = x + y
  const T = p * x + q * y
  return {
    story, ask, unit,
    answer: x,
    also: `and ${y} ${itemY}`,
    equation: `x + y = ${N},\\; ${p}x + ${q}y = ${T}`,
    hints: [
      `Two unknowns need two equations. Let $x$ = ${itemX} and $y$ = ${itemY}. One equation counts them; the other adds up their values.`,
      `The equations are $x + y = ${N}$ and $${p}x + ${q}y = ${T}$. Rewrite the first as $y = ${N} - x$.`,
      `Substitute: $${p}x + ${q}(${N} - x) = ${T}$, which simplifies to $${p - q}x = ${T - q * N}$.`,
    ],
    steps: [
      `Let $x$ = ${itemX} and $y$ = ${itemY}.`,
      `Count equation: $x + y = ${N}$. Value equation: $${p}x + ${q}y = ${T}$`,
      `From the first: $y = ${N} - x$. Substitute: $${p}x + ${q}(${N} - x) = ${T}$`,
      `Expand and collect: $${p - q}x ${term(q * N)} = ${T}$, so $${p - q}x = ${T - q * N}$`,
      `Divide: $x = ${x}$, and then $y = ${N} - ${x} = ${y}$`,
    ],
  }
}

export const Q = { linear, percent, ratio, fn, system }
