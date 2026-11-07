// The skill map: every skill the game teaches, what it depends on, and the NSW outcome it serves.
// Outcome codes are from the NESA Mathematics K–10 Syllabus (2022). "stage" says where the content sits:
// S2 = Years 3–4 (taught first if the placement check finds it missing), S3A = Stage 3 Part A,
// S3B = Stage 3 Part B. The Department's Stage 3 "Year A" plan (the target) takes all of Part A
// plus some of Part B, marked yearA: true.
// kind: 'facts' skills are tracked fact by fact and practised in sprints; 'skill' skills are methods,
// taught with worked examples and practised untimed.
// methods: the ways a sum can be worked (engine/methods.js), the first taught first; once the skill is learned a
// second is shown beside it and she chooses (decided 17 October 2026; research 4.1 to 4.3).
// outsideNesa: a skill no NESA content point names, kept as the game's own choice, not the syllabus's, with no outcome
// of its own and the nearest one in `nearest` (plans/2026-10-25-nesa-audit.md, NSW Mathematics K–10 Syllabus (2022),
// checked 25 October 2026).
// outsideNesaKeys: the same for one kind of problem (its key) in a skill whose other kinds are its outcome's content; the
// skill keeps its outcome for those.
// strategy: a facts skill's opening line, said and shown before its first new fact (js/runner.js intro): the ways its own
// tables are worked by, in one sentence of at most 17 words as said, so the screen stays a sentence or two (tests/short.test.js).
// school: the way the syllabus asks her to record with, kept in her warm-ups if she chooses another (engine/methods.js
// reviewMethod): MA3-MR-01, "Record the product of multiplying by a one-digit number using a formal algorithm" and
// "Use a multiplication algorithm with understanding" (NESA Mathematics K–10 (2022), Stage 3, read 10 October 2026:
// https://curriculum.nsw.edu.au/learning-areas/mathematics/mathematics-k-10-2022/content/stage-3/fafab309e2).

export const PATHS = {
  W: 'Whole numbers',
  D: 'Decimals, fractions and percentages',
  E: 'Equals and unknowns',
  P: 'Word problems',
  M: 'Measurement, data and chance',
};

// a fact from one she knows: the three release 1 taught, in its order, then five lots and the rest for 6s to 9s; then
// the ways NESA names that stage 4 added (teaching audit change 7), after them so a fact they fit keeps its first way:
// doubling, tens, half of × 10 (which leads on 5 × 3 to 5 × 9, engine/methods.js methodsFor), one more lot, near
// squares, turn-arounds; and a division fact's two, the family first
const FACT_METHODS = ['ten-take', 'double', 'ten-plus', 'five-plus', 'double-it', 'tens', 'half-ten', 'one-more', 'near-square', 'turn',
  'family', 'halve'];

export const SKILLS = [
  // ---- Whole numbers: multiplication and division facts, as fact families (IES 2021 p. 52 order) ----
  { id: 'facts-0-1', path: 'W', stage: 'S2', kind: 'facts', sprint: true, prereqs: [], methods: FACT_METHODS,
    title: '× and ÷ with 0 and 1', outcomes: ['MA2-MR-01'], tables: [0, 1],
    strategy: '× 0 is no groups or empty groups; × 1 is one group or one in each.' },
  { id: 'facts-2-5-10', path: 'W', stage: 'S2', kind: 'facts', sprint: true, prereqs: ['facts-0-1'], methods: FACT_METHODS,
    title: 'Fact families for 2, 5 and 10', outcomes: ['MA2-MR-01'], tables: [2, 5, 10],
    strategy: '× 2 is double, × 10 makes tens, and × 5 is half of × 10.' },
  { id: 'facts-3-4', path: 'W', stage: 'S2', kind: 'facts', sprint: true, prereqs: ['facts-2-5-10'], methods: FACT_METHODS,
    title: 'Fact families for 3 and 4', outcomes: ['MA2-MR-01'], tables: [3, 4],
    strategy: '× 4 is double × 2, and × 3 is × 2 and one more lot.' },
  { id: 'facts-6-8', path: 'W', stage: 'S2', kind: 'facts', sprint: true, prereqs: ['facts-3-4'], methods: FACT_METHODS,
    title: 'Fact families for 6 and 8', outcomes: ['MA2-MR-01'], tables: [6, 8],
    strategy: '× 6 is double × 3; × 8 is double × 4.' },
  { id: 'facts-9-7', path: 'W', stage: 'S2', kind: 'facts', sprint: true, prereqs: ['facts-6-8'], methods: FACT_METHODS,
    title: 'Fact families for 9 and 7', outcomes: ['MA2-MR-01'], tables: [9, 7],
    strategy: '× 9 is ten lots, take one lot; × 7 is five lots plus two lots.' },
  { id: 'facts-11-12', path: 'W', stage: 'S3A', kind: 'facts', sprint: true, prereqs: ['facts-9-7'], methods: FACT_METHODS,
    title: 'Fact families for 11 and 12', outcomes: [], nearest: ['MA3-MR-01'], tables: [11, 12],
    outsideNesa: 'Outside NESA, chosen for this game in the plan approved on 10 October 2026, not a syllabus requirement: no Stage 2 or Stage 3 content point names the 11 and 12 tables (Stage 2 stops at 10 × 10); MA3-MR-01 is the nearest outcome, not its source.',
    strategy: '× 11 is × 10 plus × 1, and × 12 is × 10 plus × 2.' },

  // ---- Whole numbers: place value ----
  { id: 'pv-10k', path: 'W', stage: 'S2', kind: 'skill', prereqs: [],
    title: 'Numbers to hundreds of thousands', outcomes: ['MA2-RN-01'], methods: ['learned', 'pv-values', 'pv-chart', 'pv-halfway'] },
  { id: 'pv-millions', path: 'W', stage: 'S3A', kind: 'skill', prereqs: ['pv-10k'],
    title: 'Place value to millions; compare, order and round', outcomes: ['MA3-RN-01'], methods: ['learned', 'pv-values', 'pv-chart', 'pv-halfway'] },
  // pv-x10: whole numbers "10, 100 or 1000 times as large" are Stage 2's MA2-RN-01
  // (https://curriculum.nsw.edu.au/learning-areas/mathematics/mathematics-k-10-2022/content/stage-2/fa1dbb9271), and "multiply
  // one-digit numbers by 10, 100, 1000" MA3-MR-01 (.../stage-3/fafab309e2); no Stage 3 whole-number point of MA3-RN-01 has
  // it (plans/2026-10-25-nesa-audit.md change 7, NSW Mathematics K–10 Syllabus (2022), checked 25 October 2026)
  { id: 'pv-x10', path: 'W', stage: 'S3A', kind: 'skill', sprint: true, prereqs: ['pv-millions', 'facts-2-5-10'],
    title: '× and ÷ by 10, 100 and 1000', outcomes: ['MA2-RN-01', 'MA3-MR-01'], methods: ['learned', 'pv-rename'] },

  // ---- Whole numbers: adding and subtracting ----
  // Partitioning first: MA2-AR-01, "Apply known mental strategies that
  // use partitioning to add and subtract", and
  // Stage 2, "Partition, rearrange and regroup numbers to at least 1000 to solve additive problems"; then the written
  // method beside it, "Use an algorithm with understanding to record addition and subtraction calculations, where
  // efficient, involving 3-digit numbers"; and counting up, "addition for subtraction" (MA3-AR-01) on an "empty number line"
  // (https://curriculum.nsw.edu.au/learning-areas/mathematics/mathematics-k-10-2022/content/stage-2/fa361e2379,
  // .../stage-2/fa62ff3cf3 and .../stage-3/faf843e1ab, read 10 October 2026). Then, for subtracting, taking away in parts,
  // rounding and adjusting, and shifting both numbers: partitioning "such as bridging the decades", "the compensation
  // strategy", "the levelling and constant difference strategies" (MA2-AR-01) and "levelling... using constant
  // difference, and bridging" (MA3-AR-01; teaching audit change 9).
  { id: 'addsub-written', path: 'W', stage: 'S2', kind: 'skill', prereqs: ['pv-10k'],
    title: 'Adding and subtracting with regrouping', outcomes: ['MA2-AR-01', 'MA3-AR-01'], methods: ['split', 'column', 'count-up', 'take-parts', 'compensate', 'level'], school: 'column',
    lookalikes: ['addsub-multi'] },
  { id: 'addsub-multi', path: 'W', stage: 'S3A', kind: 'skill', prereqs: ['addsub-written', 'pv-millions'],
    title: 'Adding and subtracting bigger numbers, and checking by estimating', outcomes: ['MA3-AR-01'], methods: ['learned', 'place-parts', 'count-up-big'],
    lookalikes: ['addsub-written'] },

  // ---- Whole numbers: multiplying ----
  // mult-tens and mult-1digit take every one-digit factor at the usual level (6 × 500, 7 × 384), so both come after the
  // 9s and 7s; mult-tens goes to multiples of 1000 (plans/2026-10-25-nesa-audit.md rows 12 and 13).
  { id: 'mult-tens', path: 'W', stage: 'S2', kind: 'skill', sprint: true, prereqs: ['facts-9-7', 'pv-10k'],
    title: 'Multiplying by multiples of 10, 100 and 1000', outcomes: ['MA2-MR-01', 'MA3-MR-01'], methods: ['learned', 'halve-bigger', 'double-smaller'] },
  // The area model first, MA3-MR-01 "Use informal written strategies such as the area model to solve
  // multiplication and division problems" (.../stage-3/fafab309e2), then the written method beside it.
  { id: 'mult-1digit', path: 'W', stage: 'S3A', kind: 'skill', prereqs: ['mult-tens', 'addsub-written', 'facts-9-7'],
    title: 'Multiplying by a one-digit number', outcomes: ['MA3-MR-01'], methods: ['area', 'written', 'partition'], school: 'written',
    lookalikes: ['mult-2digit', 'div-chunk'] },
  // mult-2digit can also be split by place value, the second number's tens and ones (47 × 23 as 47 × 20 + 47 × 3):
  // "Select and apply mental and written strategies to multiply 2- and 3-digit numbers by 2-digit numbers", with "the
  // distributive property with partial products" (MA3-MR-01, .../stage-3/fafab309e2 l.58, l.55; teaching audit change 18).
  { id: 'mult-2digit', path: 'W', stage: 'S3A', kind: 'skill', prereqs: ['mult-1digit', 'facts-9-7'],
    title: 'Multiplying by a two-digit number', outcomes: ['MA3-MR-01'], methods: ['area', 'written', 'partition'], school: 'written',
    lookalikes: ['mult-1digit'] },
  // factors: four kinds are MA3-MR-01's "Determine factors for a given whole number" (is-factor, count-factors), "Determine
  // whether a number is prime, composite or neither (0 or 1)" (prime) and "Use knowledge of multiples to partition as
  // appropriate and divide" (next-multiple) (Stage 3 MR-A, l.46, l.47, l.76,
  // https://curriculum.nsw.edu.au/learning-areas/mathematics/mathematics-k-10-2022/content/stage-3/fafab309e2; NSW Mathematics
  // K–10 Syllabus (2022), 16 June 2026 amendments, checked 25 October 2026); the fifth, common-factor, is not
  // (plans/2026-10-25-nesa-audit.md row 15).
  { id: 'factors', path: 'W', stage: 'S3A', kind: 'skill', prereqs: ['facts-9-7'],
    title: 'Factors, multiples and prime numbers', outcomes: ['MA3-MR-01'], methods: ['learned', 'known-multiple', 'remainder-gap'],
    outsideNesaKeys: {
      'common-factor': 'Outside NESA, chosen for this game, not a syllabus requirement: no Stage 3 content point of MA3-MR-01 names a common factor of two numbers (it asks for the factors of one number); where it comes in Stage 4 was not checked. The skill\'s other four kinds are MA3-MR-01\'s.',
    } },

  // ---- Whole numbers: dividing (IES 2021 Example 1.1: equal groups, then chunking with known facts) ----
  { id: 'div-remainder', path: 'W', stage: 'S3A', kind: 'skill', prereqs: ['facts-6-8'],
    title: 'Dividing with remainders', outcomes: ['MA3-MR-01'], methods: ['biggest', 'split-multiples', 'area-div'],
    lookalikes: ['div-chunk'] },
  { id: 'div-chunk', path: 'W', stage: 'S3A', kind: 'skill', prereqs: ['div-remainder', 'mult-tens', 'addsub-written'],
    title: 'Dividing bigger numbers in chunks', outcomes: ['MA3-MR-01'], methods: ['chunking', 'split-multiples', 'area-div'],
    lookalikes: ['div-short', 'mult-1digit'] },
  { id: 'div-short', path: 'W', stage: 'S3A', kind: 'skill', prereqs: ['div-chunk', 'facts-9-7'],
    title: 'Short division: three or four digits by one digit', outcomes: ['MA3-MR-01'], methods: ['short', 'chunking', 'split-multiples', 'area-div'],
    lookalikes: ['div-chunk', 'mult-1digit'] },
  { id: 'estimate', path: 'W', stage: 'S3A', kind: 'skill', prereqs: ['pv-millions', 'mult-tens'],
    title: 'Estimating to check an answer', outcomes: ['MA3-MR-01', 'MA3-AR-01'], methods: ['learned', 'est-bounds', 'est-compatible'] },

  // ---- Equals and unknowns (McNeil et al. 2015; Knuth et al. 2006) ----
  // Each worked first as release 1 did (both sides, undo it, work backwards), with a second way where it fits (teaching
  // audit change 18): spotting the link between the two sides, "Use number relation principles to solve related problems"
  // (MA2-AR-01) and "Use the equals sign to record equivalent number relationships involving multiplication" (Stage 2
  // Multiplicative relations B); counting on for a missing part, "the complement principle" (MA2-AR-01); guess, check and
  // improve, "considering whether it can be improved" (Stage 2 Additive relations B). Brackets and tables have a second way
  // where one fits (plans/2026-10-25-two-ways-plan.md).
  // eq-same's fill-in sentences (7 + 5 = 4 + ☐) are MA2-AR-02's too, "Find the missing number in an equivalent number
  // sentence involving operations of addition or subtraction on both sides of the equals sign" (Stage 2 Additive
  // relations B, l.59, .../stage-2/fa62ff3cf3; plans/2026-10-25-nesa-audit.md change 7, checked 25 October 2026).
  { id: 'eq-same', path: 'E', stage: 'S2', kind: 'skill', prereqs: [],
    title: '"=" means "the same as"', outcomes: ['MA2-AR-01', 'MA2-AR-02'], methods: ['both-sides', 'relation'] },
  { id: 'eq-missing-add', path: 'E', stage: 'S2', kind: 'skill', prereqs: ['eq-same'],
    title: 'Missing numbers with + and −', outcomes: ['MA2-AR-02'], methods: ['undo', 'count-on', 'relation'],
    lookalikes: ['eq-missing-mult'] },
  // eq-missing-mult takes every table to 10 × 10 (MA2-MR-02, 28 = ☐ × 7) and Stage 3 sizes (125 ÷ 5 = ☐), so it comes
  // after the 9s and 7s (plans/2026-10-25-nesa-audit.md change 4).
  { id: 'eq-missing-mult', path: 'E', stage: 'S3B', yearA: true, kind: 'skill', prereqs: ['eq-missing-add', 'facts-9-7'],
    title: 'Missing numbers with × and ÷, using inverse operations', outcomes: ['MA2-MR-02', 'MA3-MR-02'], methods: ['undo', 'relation'],
    lookalikes: ['eq-missing-add'] },
  { id: 'eq-multi-op', path: 'E', stage: 'S3B', yearA: true, kind: 'skill', prereqs: ['eq-missing-mult', 'facts-6-8'],
    title: 'Number sentences with more than one operation', outcomes: ['MA3-MR-02'], methods: ['backwards', 'guess-check'] },
  { id: 'eq-order-ops', path: 'E', stage: 'S3B', kind: 'skill', prereqs: ['eq-multi-op'],
    title: 'Brackets and the order of operations', outcomes: ['MA3-MR-02'], methods: ['learned', 'share'], school: 'learned' },
  { id: 'eq-patterns', path: 'E', stage: 'S3B', kind: 'skill', prereqs: ['eq-missing-mult'],
    title: 'Finding the rule in a table of values', outcomes: ['MA3-MR-02'], methods: ['learned', 'jump-rows', 'divide-row'], school: 'learned' },

  // ---- Word problems, by structure (IES 2021 Rec. 5) ----
  { id: 'wp-change-combine', path: 'P', stage: 'S3A', kind: 'skill', prereqs: ['addsub-written'],
    title: 'Word problems: change and combine', outcomes: ['MA3-AR-01'], methods: ['learned', 'number-line'],
    lookalikes: ['wp-compare'] },
  { id: 'wp-compare', path: 'P', stage: 'S3A', kind: 'skill', prereqs: ['wp-change-combine'],
    title: 'Word problems: compare', outcomes: ['MA3-AR-01'], methods: ['learned', 'number-line'],
    lookalikes: ['wp-change-combine'] },
  { id: 'wp-equal-groups', path: 'P', stage: 'S3A', kind: 'skill', prereqs: ['div-remainder', 'mult-1digit'],
    title: 'Word problems: equal groups', outcomes: ['MA3-MR-01'], methods: ['learned', 'build-up'],
    lookalikes: ['wp-compare'] },
  // wp-multistep writes its number sentence with brackets where the order needs them, MA3-MR-02's "Investigate the order
  // of operations using real-life contexts" (Stage 3 Multiplicative relations B, l.70, .../stage-3/fa1ff4d43b; NESA audit
  // change 7).
  { id: 'wp-multistep', path: 'P', stage: 'S3A', kind: 'skill', prereqs: ['wp-compare', 'wp-equal-groups'],
    title: 'Word problems with more than one step', outcomes: ['MA3-AR-01', 'MA3-MR-01', 'MA3-MR-02'], methods: ['learned', 'regroup'] },

  // ---- Decimals (stage 6, plans/2026-10-25-stage-6-plan.md): release 2, reached since it was approved on 27 October (step 7). NSW Mathematics
  // K–10 Syllabus (2022), 16 June 2026 amendments; content points from the saved pages of 10 October 2026, checked live
  // 25 October 2026: MA2-RN-02 Stage 2 Representing numbers using place value B (stage-2/fa1dbb9271, l.57-74); MA3-RN-02
  // Stage 3 Represents numbers A (stage-3/fa87632ef7, l.57-70); MA3-AR-01 Stage 3 Additive relations B (stage-3/fa2ebf6217,
  // l.41, l.44-48). The Department's Stage 3 Year A plan has all three (sample scope and sequence, Year A, Term 1 Unit 1
  // and Additive relations B).
  { id: 'dec-hundredths', path: 'D', stage: 'S2', kind: 'skill', release: 2, prereqs: ['pv-10k'],
    title: 'Tenths and hundredths', outcomes: ['MA2-RN-02'], methods: ['dec-chart', 'dec-fraction'] },
  { id: 'dec-thousandths', path: 'D', stage: 'S3A', kind: 'skill', release: 2, prereqs: ['dec-hundredths', 'pv-millions'],
    title: 'Decimals to 3 places', outcomes: ['MA3-RN-02'], methods: ['dec-chart', 'dec-fraction'] },
  { id: 'dec-compare', path: 'D', stage: 'S3A', kind: 'skill', release: 2, prereqs: ['dec-thousandths'],
    title: 'Comparing and ordering decimals', outcomes: ['MA3-RN-02'], methods: ['dec-places', 'dec-zeros', 'dec-line'],
    lookalikes: ['pv-millions'] },
  { id: 'dec-numberline', path: 'D', stage: 'S3A', kind: 'skill', release: 2, prereqs: ['dec-compare'],
    title: 'Decimals on a number line', outcomes: ['MA3-RN-02'], methods: ['dec-ticks', 'dec-zoom'] },
  { id: 'dec-x10', path: 'D', stage: 'S3A', kind: 'skill', release: 2, prereqs: ['dec-thousandths', 'pv-x10'],
    title: 'Decimals 10 and 100 times as large, a tenth and a hundredth', outcomes: ['MA3-RN-02'],
    methods: ['dec-move', 'dec-count'], lookalikes: ['pv-x10'] },
  { id: 'dec-addsub', path: 'D', stage: 'S3B', yearA: true, kind: 'skill', release: 2, prereqs: ['dec-thousandths', 'addsub-written'],
    title: 'Adding and subtracting decimals', outcomes: ['MA3-AR-01'], methods: ['dec-column', 'dec-split', 'dec-count-up'],
    school: 'dec-column', lookalikes: ['addsub-written'] },
  { id: 'wp-decimals', path: 'P', stage: 'S3B', yearA: true, kind: 'skill', release: 2, prereqs: ['dec-addsub', 'wp-compare'],
    title: 'Word problems with decimals', outcomes: ['MA3-AR-01'], methods: ['dec-column', 'dec-split', 'dec-count-up'],
    lookalikes: ['wp-change-combine', 'wp-compare'] },

  // ---- Fractions (stage 6 strand 2, plans/2026-10-25-stage-6-plan.md "Strand 2: fractions"): release 3, reached since
  // it was approved on 28 October (step 2.7). NSW Mathematics K–10 Syllabus (2022), 16 June 2026 amendments; content
  // points from the saved pages of 10 October 2026, checked live 26 October 2026: MA2-PF-01 Stage 2 Partitioned
  // fractions A and B (stage-2/fab1a01bf6 l.37-47, stage-2/fabf1cf43b l.37-48); MA3-RQF-01 and MA3-RQF-02 Stage 3
  // Representing quantity fractions A and B (stage-3/fac8227f10 l.42-57, stage-3/fa1618803c l.42-67), each content
  // point under the outcome the NESA audit gives it (plans/2026-10-25-nesa-audit.md l.192-193). Part B is the
  // Department's Year B (no yearA).
  { id: 'frac-parts', path: 'D', stage: 'S2', kind: 'skill', release: 3, prereqs: ['facts-2-5-10'],
    title: 'Fractions of a whole', outcomes: ['MA2-PF-01'], methods: ['frac-strip', 'frac-line'] },
  { id: 'frac-unit-compare', path: 'D', stage: 'S3A', kind: 'skill', release: 3, prereqs: ['frac-parts'],
    title: 'Comparing unit fractions', outcomes: ['MA3-RQF-01'], methods: ['frac-line', 'frac-pieces', 'frac-half'],
    lookalikes: ['dec-compare'] },
  { id: 'frac-addsub-same', path: 'D', stage: 'S3A', kind: 'skill', release: 3, prereqs: ['frac-parts'],
    title: 'Adding and subtracting fractions with the same denominator', outcomes: ['MA3-RQF-01'],
    methods: ['frac-count', 'frac-line', 'frac-strip'], lookalikes: ['frac-addsub-related'] },
  { id: 'frac-equivalent', path: 'D', stage: 'S3B', kind: 'skill', release: 3, prereqs: ['frac-unit-compare', 'facts-6-8'],
    title: 'Equivalent fractions', outcomes: ['MA3-RQF-01'], methods: ['frac-rename', 'frac-line', 'frac-strip'],
    lookalikes: ['frac-unit-compare'] },
  { id: 'frac-addsub-related', path: 'D', stage: 'S3B', kind: 'skill', release: 3, prereqs: ['frac-equivalent', 'frac-addsub-same'],
    title: 'Adding and subtracting fractions with related denominators', outcomes: ['MA3-RQF-01'],
    methods: ['frac-rename', 'frac-line', 'frac-strip'], school: 'frac-rename', lookalikes: ['frac-addsub-same'] },
  { id: 'frac-of', path: 'D', stage: 'S3B', kind: 'skill', release: 3, prereqs: ['frac-parts', 'div-remainder', 'dec-hundredths'],
    title: 'Fractions of amounts, and a fraction as a division', outcomes: ['MA3-RQF-02', 'MA3-RQF-01'],
    methods: ['frac-tape', 'frac-divide', 'frac-halve'], school: 'frac-tape', lookalikes: ['div-remainder'] },

  // ---- Percentages (stage 6 strand 3, plans/2026-10-25-stage-6-plan.md "Strand 3: percentages"): release 4, reached
  // since 29 October (step 3.7, on the word to push on with the plan). NSW Mathematics K–10 Syllabus (2022), 16 June 2026 amendments;
  // content points from the saved page of 10 October 2026, checked live 28 October 2026: MA3-RN-03 Stage 3 Represents
  // numbers B (stage-3/fa0a18f458 l.52-63), its Examples and teaching advice read live (Examples fa0a18f458). The
  // Department's Year A has percentages.
  { id: 'pct-benchmarks', path: 'D', stage: 'S3B', yearA: true, kind: 'skill', release: 4, prereqs: ['dec-hundredths', 'frac-parts'],
    title: 'Percentages as fractions and decimals', outcomes: ['MA3-RN-03'], methods: ['pct-hundred', 'pct-line'],
    lookalikes: ['dec-hundredths'] },
  { id: 'pct-of', path: 'D', stage: 'S3B', yearA: true, kind: 'skill', release: 4, prereqs: ['pct-benchmarks', 'frac-of'],
    title: 'Percentages of amounts', outcomes: ['MA3-RN-03'], methods: ['pct-fraction', 'pct-tens', 'pct-halve'],
    lookalikes: ['frac-of'] },
  { id: 'pct-discount', path: 'D', stage: 'S3B', yearA: true, kind: 'skill', release: 4, prereqs: ['pct-of', 'dec-addsub'],
    title: 'Discounts and sale prices', outcomes: ['MA3-RN-03'], methods: ['pct-fraction', 'pct-halve'],
    lookalikes: ['pct-of'] },

  // ---- Measurement (stage 6 strand 4, plans/2026-10-25-stage-6-plan.md "Strand 4: measurement"): release 5, reached
  // from 31 October (step 4.9). NSW Mathematics K–10 Syllabus (2022), 16 June 2026 amendments; content points from the pages
  // read live 28 October 2026 and saved 28 October 2026, checked live 28 October 2026: MA3-GM-02 Stage 3 Geometric
  // measure A and B (stage-3/fa35c41b81 l.43-77, stage-3/fae314fde1 l.37-73); MA3-2DS-02 and MA3-2DS-03 Stage 3
  // Two-dimensional spatial structure A and B (stage-3/fad7c142c4 l.51-79, stage-3/fa0dfe5fec l.39-73); MA3-3DS-02 Stage 3
  // Three-dimensional spatial structure A and B (stage-3/fa51e61164 l.48-72, stage-3/fa89ed4224 l.32-66); MA3-NSM-01 Stage 3
  // Non-spatial measure A and B (stage-3/fa7e80b308 l.24-48, stage-3/faebab48ca l.24-32). Part A, the Department's Year A,
  // is meas-area and each other skill's easy level. A scale read from a picture stands in for a real device: chosen for this
  // game, not a syllabus requirement. groups: the ways that share a kind of problem, one set to a key, so a second way is
  // offered only beside one that works the same problem (engine/methods.js groupWays, compareOffer).
  { id: 'meas-length', path: 'M', stage: 'S3B', kind: 'skill', release: 5, prereqs: ['dec-x10', 'dec-addsub'],
    title: 'Lengths, perimeters and changing units', outcomes: ['MA3-GM-02'],
    methods: ['scale-space', 'scale-small', 'unit-place', 'unit-split', 'per-add', 'per-pairs'], lookalikes: ['dec-x10'],
    groups: [['scale-space', 'scale-small'], ['unit-place', 'unit-split'], ['per-add', 'per-pairs']] },
  { id: 'meas-area', path: 'M', stage: 'S3A', kind: 'skill', release: 5, prereqs: ['meas-length', 'mult-1digit'],
    title: 'Areas of rectangles, and hectares', outcomes: ['MA3-2DS-02'],
    methods: ['area-rows', 'area-words', 'unit-place', 'unit-split'], lookalikes: ['mult-1digit'],
    groups: [['area-rows', 'area-words'], ['unit-place', 'unit-split']] },
  { id: 'meas-area-shapes', path: 'M', stage: 'S3B', kind: 'skill', release: 5, prereqs: ['meas-area'],
    title: 'Areas of L-shapes, parallelograms and triangles', outcomes: ['MA3-2DS-03'],
    methods: ['area-split', 'area-take', 'area-move', 'area-words', 'area-double'], lookalikes: ['meas-area'],
    groups: [['area-split', 'area-take'], ['area-move', 'area-words'], ['area-double', 'area-words']] },
  { id: 'meas-volume', path: 'M', stage: 'S3B', kind: 'skill', release: 5, prereqs: ['meas-area'],
    title: 'Volume and capacity', outcomes: ['MA3-3DS-02'],
    methods: ['vol-layers', 'vol-front', 'unit-place', 'unit-split', 'scale-space', 'scale-small'], lookalikes: ['meas-area'],
    groups: [['vol-layers', 'vol-front'], ['unit-place', 'unit-split'], ['scale-space', 'scale-small']] },
  { id: 'meas-mass', path: 'M', stage: 'S3B', kind: 'skill', release: 5, prereqs: ['meas-length'],
    title: 'Mass in grams, kilograms and tonnes', outcomes: ['MA3-NSM-01'],
    methods: ['scale-space', 'scale-small', 'unit-place', 'unit-split'], lookalikes: ['meas-length'],
    groups: [['scale-space', 'scale-small'], ['unit-place', 'unit-split']] },

  // ---- Angles and position (stage 6 strand 4b, plans/2026-10-25-stage-6-plan.md "Strand 4b: angles and position"):
  // release 6, reached since it was approved on 1 November 2026 (step 4b.5). NSW Mathematics K–10 Syllabus (2022), 16 June 2026 amendments;
  // content points from the pages read live 28 October 2026 and saved 28 October 2026, checked live 30 October 2026:
  // MA3-GM-03 Stage 3 Geometric measure A and B (stage-3/fa35c41b81 l.93-105, stage-3/fae314fde1 l.97-125); MA3-GM-01
  // Stage 3 Geometric measure A (stage-3/fa35c41b81 l.25-41). Part A, the Department's Year A, is meas-position and the
  // easy level of meas-angles. The first quadrant only: negative numbers are outside stage 6. groups: the ways that
  // share a kind of problem, one set to a key (engine/methods.js groupWays, compareOffer).
  { id: 'meas-angles', path: 'M', stage: 'S3B', kind: 'skill', release: 6, prereqs: ['addsub-written', 'eq-missing-add'],
    title: 'Angles in a right angle, on a line and at a point', outcomes: ['MA3-GM-03'],
    methods: ['angle-take', 'angle-count'], lookalikes: ['eq-missing-add'], groups: [['angle-take', 'angle-count']] },
  { id: 'meas-position', path: 'M', stage: 'S3A', kind: 'skill', release: 6, prereqs: ['pv-10k'],
    title: 'Points on a grid, across then up', outcomes: ['MA3-GM-01'],
    methods: ['across-up', 'to-axes'], groups: [['across-up', 'to-axes']] },
];

export const BY_ID = Object.fromEntries(SKILLS.map((s) => [s.id, s]));

// The skills and paths she can meet at a release (js/app.js RELEASE: 2 since its approval on 27 October, stage 6 plan
// step 7; 3 since its approval on 28 October, step 2.7; 4 since 29 October, step 3.7, on the word to push on with the plan;
// 5 from 31 October, step 4.9; 6 since its approval on 1 November, step 4b.5). A skill above it is built and checked but
// shown on no screen, not in the home screen's total and not on her map, until it is approved; release 6, the angles and
// position skills, is the top reached, and no skill is built above it.
export const inRelease = (release) => SKILLS.filter((s) => (s.release ?? 1) <= release);
export function pathsIn(release) {
  const skills = inRelease(release);
  return Object.entries(PATHS).filter(([p]) => skills.some((s) => s.path === p));
}

// Every skill below this one (its prerequisites, and theirs).
export function ancestors(id, seen = new Set()) {
  for (const p of BY_ID[id].prereqs) {
    if (!seen.has(p)) {
      seen.add(p);
      ancestors(p, seen);
    }
  }
  return seen;
}

// Every skill that depends on this one, directly or not.
export function descendants(id) {
  const out = new Set();
  let grew = true;
  while (grew) {
    grew = false;
    for (const s of SKILLS) {
      if (out.has(s.id)) continue;
      if (s.prereqs.some((p) => p === id || out.has(p))) {
        out.add(s.id);
        grew = true;
      }
    }
  }
  return out;
}

// Skills in an order where every skill comes after its prerequisites.
export function topoOrder(ids = SKILLS.map((s) => s.id)) {
  const want = new Set(ids);
  const done = new Set();
  const out = [];
  const visit = (id) => {
    if (done.has(id)) return;
    done.add(id);
    for (const p of BY_ID[id].prereqs) visit(p);
    if (want.has(id)) out.push(id);
  };
  ids.forEach(visit);
  return out;
}
