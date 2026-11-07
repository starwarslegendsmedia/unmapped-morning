// The people, places and things the word problems are about: everyday settings a Stage 3 student
// knows. Plain words, easy to read, whole dollars only (the decimal stories have their own settings, at the end), and
// nothing scary, sad or about bodies or weight. There are no digits in any of this: every number in a story is one the
// problem uses, and tests/algebra-words.test.js checks that.
// In the templates, {name} {name2} {name3} are people and the other {braces} are numbers, and the [brackets] mark the
// doing-words, the words that say what happens ("shares", "equally", "each", "left"): the game marks them on the screen
// for her, and later she finds them herself (research 2.5: highlighting the important words in a word problem helped
// girls her age with attention difficulties, Kercood and others 2012; chosen with the research, not a NESA outcome).
// Every template marks its own (tests/stage4-wordproblems.test.js).

// First names from many backgrounds; no real people and no characters from books, films or games.
export const NAMES = [
  'Ana', 'Priya', 'Mia', 'Kai', 'Nina', 'Liam', 'Aisha', 'Hamish', 'Mei', 'Jack', 'Lucia', 'Tane',
  'Olivia', 'Noah', 'Amara', 'Ravi', 'Sienna', 'Ethan', 'Leilani', 'Omar', 'Isla', 'Hugo', 'Yuki',
  'Matteo', 'Chloe', 'Arjun', 'Grace', 'Tom', 'Fatima', 'Lachlan', 'Sofia', 'Duc', 'Ruby', 'Nikita',
  'Jasper', 'Hana', 'Felix', 'Amelia', 'Kofi', 'Leila', 'Sami', 'Ivy', 'Ming', 'Charlotte', 'Rohan',
  'Jarrah', 'Kirra', 'Elena', 'Tariq', 'Poppy', 'Minh', 'Ayesha', 'Finn', 'Talia', 'Wiremu', 'Esther',
];

// Things one person has, for Change, Combine and Compare.
//   things: plural noun; money: the amounts are whole dollars; max: a believable size, for normal numbers;
//   easy: false where an easy problem's totals to 100 are too small to believe (a zoo with 42 visitors), so it is left out of them;
//   gain / lose: what makes the amount go up or down, as [past, present]: "Ana found 38 more shells",
//   "How many shells did Ana find?"; these, and did below, are the doing-words of the stories made from them
export const COLLECTIONS = [
  { things: 'shells', max: 400, gain: ['found', 'find'], lose: ['gave away', 'give away'] },
  { things: 'stickers', max: 900, gain: ['was given', 'get'], lose: ['gave away', 'give away'] },
  { things: 'beads', max: 900, gain: ['bought', 'buy'], lose: ['used', 'use'] },
  { things: 'photos', max: 2000, gain: ['took', 'take'], lose: ['deleted', 'delete'] },
  { things: 'reading points', max: 3000, gain: ['earned', 'earn'], lose: ['spent', 'spend'] },
  { things: 'trading cards', max: 600, gain: ['was given', 'get'], lose: ['gave away', 'give away'] },
  { things: 'dollars', money: true, max: 900, gain: ['earned', 'earn'], lose: ['spent', 'spend'] },
];

// Places and groups, for Change, and for Combine and Compare across two times.
//   who: the subject ({name} for a person); intro: an opening sentence, if it needs one;
//   gain / lose as above (left out where that kind of Change would not make sense);
//   did: what happens each time, [past, present]; when: the two times, "On Saturday the zoo had ..."
export const PLACES = [
  { who: 'The library', things: 'books', max: 5000, easy: false, gain: ['bought', 'buy'], lose: ['gave away', 'give away'], did: ['lent', 'lend'], when: ['in May', 'in June'] },
  { who: 'The canteen', things: 'icy poles', max: 600, gain: ['bought', 'buy'], lose: ['sold', 'sell'], did: ['sold', 'sell'], when: ['on Monday', 'on Tuesday'] },
  { who: 'The sausage sizzle', things: 'sausages', max: 800, gain: ['cooked', 'cook'], lose: ['sold', 'sell'], did: ['sold', 'sell'], when: ['in the morning', 'in the afternoon'] },
  { who: 'The farm', things: 'eggs', max: 900, gain: ['collected', 'collect'], lose: ['sold', 'sell'], did: ['collected', 'collect'], when: ['last week', 'this week'] },
  { who: 'The zoo', things: 'visitors', max: 9000, easy: false, did: ['had', 'have'], when: ['on Saturday', 'on Sunday'] },
  { who: 'The town fete', things: 'dollars', money: true, max: 5000, easy: false, did: ['raised', 'raise'], when: ['on Saturday', 'on Sunday'] },
  { who: 'The cricket team', things: 'runs', max: 900, easy: false, did: ['scored', 'score'], when: ['last season', 'this season'] },
  { who: 'The netball team', things: 'goals', max: 600, did: ['scored', 'score'], when: ['last season', 'this season'] },
  { who: "{name}'s family", intro: "{name}'s family went on a road trip.", things: 'kilometres', max: 900, did: ['drove', 'drive'], when: ['on Monday', 'on Tuesday'] },
  { who: '{name}', intro: '{name} went on a long bushwalk.', things: 'steps', max: 9000, easy: false, did: ['walked', 'walk'], when: ['before lunch', 'after lunch'] },
];

// A whole made of two kinds of thing, for Combine: "On a farm there are 345 sheep and 128 cows."
export const WHOLES = [
  { at: 'on a farm', whole: 'animals', parts: ['sheep', 'cows', 'goats', 'alpacas'], max: 2000 },
  { at: 'in the town library', whole: 'books', parts: ['fiction books', 'non-fiction books'], max: 5000, easy: false },
  { at: 'at the sausage sizzle', whole: 'sausages', parts: ['beef sausages', 'vegetarian sausages'], max: 600 },
  { at: 'at the cricket match', whole: 'people', parts: ['adults', 'children'], max: 9000, easy: false },
  { at: 'at the beach', whole: 'people', parts: ['swimmers', 'surfers'], max: 900 },
  { at: 'at the sports club', whole: 'members', parts: ['girls', 'boys'], max: 1500, easy: false },
  { at: 'in the canteen freezer', whole: 'frozen treats', parts: ['icy poles', 'frozen yoghurts'], max: 400 },
  { at: 'in the aviary at the zoo', whole: 'birds', parts: ['parrots', 'cockatoos', 'finches'], max: 300 },
];

// Equal groups. find: which number is unknown, the total, the size of each group, or the number of
// groups; round: when there is a remainder, whether it needs one more group ('up') or is not enough for
// one ('down'). item: the things in the groups; group / groups: the group word; each and count: ranges
// for the size of each group and the number of groups.
export const EQUAL_GROUPS = [
  { find: 'total', item: 'sausages', group: 'pack', groups: 'packs', each: [5, 12], count: [3, 20],
    text: 'Sausages come in [packs of] {each}. The P&C [buys] {count} packs for the sausage sizzle. How many sausages is that?' },
  { find: 'total', money: true, group: 'ticket', groups: 'tickets', each: [5, 20], count: [3, 30],
    text: "Tickets to the zoo [cost] ${each} [each]. {name}'s class [needs] {count} tickets. How much do the tickets cost [altogether]?" },
  { find: 'total', item: 'balls', group: 'over', groups: 'overs', each: [6, 6], count: [3, 20],
    text: 'There are {each} balls [in an over] of cricket. How many balls are [bowled] in {count} overs?' },
  { find: 'total', money: true, group: 'week', groups: 'weeks', each: [2, 15], count: [3, 20],
    text: '{name} [saves] ${each} of pocket money [every week]. How much has {name} [saved] after {count} weeks?' },
  { find: 'total', item: 'carrots', group: 'capybara', groups: 'capybaras', each: [2, 9], count: [3, 12],
    text: 'The zookeeper [gives each] capybara {each} carrots. There are {count} capybaras. How many carrots does the zookeeper [need]?' },
  { find: 'each', item: 'lettuce leaves', group: 'turtle', groups: 'turtles', each: [2, 12], count: [2, 9],
    text: 'The zookeeper [shares] {total} lettuce leaves [equally] among {count} turtles. How many lettuce leaves does [each] turtle get?' },
  { find: 'each', item: 'stickers', group: 'friend', groups: 'friends', each: [3, 30], count: [2, 8],
    text: '{name} [shares] {total} stickers [equally] among {count} friends. How many stickers does [each] friend get?' },
  { find: 'each', item: 'books', group: 'shelf', groups: 'shelves', each: [10, 60], count: [2, 9],
    text: 'The library [puts] {total} new books [equally] on {count} shelves. How many books go on [each] shelf?' },
  { find: 'each', money: true, group: 'team', groups: 'teams', each: [10, 90], count: [2, 9],
    text: 'The netball club [shares] ${total} [equally] between {count} teams. How much money does [each] team get?' },
  { find: 'groups', item: 'cupcakes', group: 'box', groups: 'boxes', each: [4, 9], count: [3, 15],
    text: '{name} [packs] {total} cupcakes for the fundraiser into [boxes of] {each}. How many boxes does {name} [fill]?' },
  { find: 'groups', item: 'strawberries', group: 'punnet', groups: 'punnets', each: [5, 9], count: [3, 12],
    text: 'At the farm, {name} [picks] {total} strawberries and [puts] {each} [in each] punnet. How many punnets does {name} [fill]?' },
  { find: 'groups', round: 'up', item: 'students', group: 'minibus', groups: 'minibuses', each: [7, 9], count: [2, 6],
    text: '{total} students are going on an excursion to the zoo. [Each] minibus [seats] {each} students. How many minibuses are [needed]?' },
  { find: 'groups', round: 'up', item: 'kids', group: 'car', groups: 'cars', each: [3, 5], count: [2, 8],
    text: '{total} kids are going to the beach. [Each] car can [take] {each} kids. How many cars are [needed]?' },
  { find: 'groups', round: 'up', item: 'pages', group: 'night', groups: 'nights', each: [5, 9], count: [3, 15],
    text: '{name} [reads] {each} pages [each night]. How many nights will it [take] {name} to read a book with {total} pages?' },
  { find: 'groups', round: 'up', money: true, group: 'week', groups: 'weeks', each: [3, 9], count: [3, 12],
    text: '{name} [saves] ${each} [each week] to buy a new netball that [costs] ${total}. How many weeks will it [take]?' },
  { find: 'groups', round: 'up', item: 'people', group: 'table', groups: 'tables', each: [6, 9], count: [3, 15],
    text: '[Each] table at the fundraiser dinner [seats] {each} people. How many tables are [needed] for {total} people?' },
  { find: 'groups', round: 'down', item: 'muffins', group: 'box', groups: 'boxes', each: [4, 9], count: [3, 15],
    text: 'The canteen [packs] {total} muffins into [boxes of] {each}. How many [full] boxes can it make?' },
  { find: 'groups', round: 'down', item: 'girls', group: 'team', groups: 'teams', each: [7, 7], count: [2, 8],
    text: '{total} girls come to netball training. The coach [makes teams of] {each}. How many [full] teams can the coach make?' },
  { find: 'groups', round: 'down', item: 'eggs', group: 'carton', groups: 'cartons', each: [6, 6], count: [3, 20],
    text: 'The farm collected {total} eggs today. [Each] carton [fits] {each} eggs. How many [full] cartons can it fill?' },
  { find: 'groups', round: 'down', money: true, group: 'ticket', groups: 'tickets', each: [5, 9], count: [2, 6],
    text: '{name} has ${total} to [spend] at the movies. Tickets [cost] ${each} [each]. How many tickets can {name} [buy]?' },
  { find: 'groups', round: 'down', item: 'balls', group: 'over', groups: 'overs', each: [6, 6], count: [3, 20],
    text: 'A bowler [bowls] {total} balls. There are {each} balls [in an over]. How many [full] overs is that?' },
];

// Two-step problems, one form per pair of structures (the sentence that solves each form is in
// engine/items/wordproblems.js). things: the answer's unit; e and s: ranges for the size of each group
// and for the single amount, and max: the biggest amount, where the default would not be believable.
// bar: the names in its bar model, a bar for each step, as she reads them under the parts (people as {name}): a, b and c
// the amounts; groups the equal groups; taken, more, diff, start, mid and left the parts the story names.
export const MULTISTEP = [
  // (a + b) ÷ g: Combine, then Equal groups
  { form: 'combine-share', things: 'beads', bar: { a: '{name}', b: '{name2}', groups: 'bracelets' },
    text: '{name} has {a} beads and {name2} has {b} beads. They [put them together] and make {g} bracelets with [the same number] of beads [on each]. How many beads go on [each] bracelet?' },
  { form: 'combine-share', things: 'strawberries', bar: { a: '{name}', b: '{name2}', groups: 'bags' },
    text: '{name} [picked] {a} strawberries at the farm and {name2} [picked] {b}. They [shared] them [equally] into {g} bags. How many strawberries went in [each] bag?' },
  { form: 'combine-share', money: true, bar: { a: 'sizzle', b: 'cake stall', groups: 'classes' },
    text: 'The P&C [raised] ${a} at the sausage sizzle and ${b} at the cake stall. The money is [shared equally] between {g} classes. How much money does [each] class get?' },
  // g × e − s: Equal groups, then Change
  { form: 'groups-change', things: 'sausages', e: [6, 12], bar: { groups: 'packs', taken: 'sold', left: 'left' },
    text: 'The P&C [bought] {g} [packs of] {e} sausages for the sausage sizzle. It [sold] {s} sausages. How many sausages were [left]?' },
  { form: 'groups-change', things: 'muffins', e: [4, 12], bar: { groups: 'trays', taken: 'sold', left: 'left' },
    text: 'The canteen [baked] {g} [trays of] {e} muffins. It [sold] {s} muffins at lunch. How many muffins were [left]?' },
  // t − g × e: Equal groups, then Change
  { form: 'change-groups', money: true, e: [5, 15], bar: { start: 'had', groups: 'tickets', left: 'left' },
    text: '{name} had ${t}. {name} [bought] {g} zoo tickets at ${e} [each]. How much money did {name} have [left]?' },
  { form: 'change-groups', things: 'stickers', e: [3, 10], bar: { start: 'had', groups: 'friends', left: 'left' },
    text: '{name} had {t} stickers and [gave] {e} stickers [to each] of {g} friends. How many stickers did {name} have [left]?' },
  // g × e + s: Equal groups, then Combine
  { form: 'groups-combine', things: 'sheep', e: [10, 60], s: [10, 90], bar: { groups: 'paddocks', more: 'yards' },
    text: 'A farm has {g} paddocks with {e} sheep [in each], and {s} sheep in the yards. How many sheep are on the farm [altogether]?' },
  { form: 'groups-combine', money: true, e: [5, 15], s: [5, 30], bar: { groups: 'tickets', more: 'toy' },
    text: '{name} [bought] {g} zoo tickets at ${e} [each] and a capybara toy for ${s}. How much did {name} [spend altogether]?' },
  // a + (a ± d): Compare, then Combine
  { form: 'compare-combine', dir: 'more', things: 'shells', bar: { a: '{name}', b: '{name2}', diff: 'more' },
    text: '{name} [found] {a} shells at the beach. {name2} [found] {d} [more] shells [than] {name}. How many shells did they find [altogether]?' },
  { form: 'compare-combine', dir: 'fewer', things: 'goals', bar: { a: '{name}', b: '{name2}', diff: 'fewer' },
    text: '{name} [scored] {a} goals in netball this season. {name2} [scored] {d} [fewer] goals [than] {name}. How many goals did they score [altogether]?' },
  // c − (a + b): Combine, then Compare
  { form: 'combine-compare', things: 'runs', bar: { a: '{name}', b: '{name2}', c: '{name3}', diff: 'more' },
    text: '{name} [made] {a} runs and {name2} [made] {b} runs. {name3} [made] {c} runs. How many [more] runs did {name3} make [than] {name} and {name2} [together]?' },
  { form: 'combine-compare', things: 'books', max: 60, bar: { a: '{name}', b: '{name2}', c: '{name3}', diff: 'more' },
    text: 'In the reading challenge, {name} read {a} books and {name2} read {b} books. {name3} read {c} books. How many [more] books did {name3} read [than] {name} and {name2} [together]?' },
  // a − b − c or a + b − c: Change, then Change
  { form: 'change-change', ops: '−−', things: 'icy poles', bar: { start: 'had', b: 'Monday', mid: 'after', c: 'Tuesday', left: 'left' },
    text: 'The canteen had {a} icy poles. It [sold] {b} on Monday and {c} on Tuesday. How many icy poles were [left]?' },
  { form: 'change-change', ops: '+−', money: true, bar: { start: 'had', b: 'earned', mid: 'after', c: 'spent', left: 'left' },
    text: '{name} had ${a}. {name} [earned] ${b} doing jobs at home, then [spent] ${c} at the town fete. How much money did {name} have [then]?' },
];

// The doing-words of the Change, Combine and Compare stories, which engine/items/wordproblems.js builds from the settings
// above (their own verbs, gain, lose and did, are doing-words too): the time words of a Change, the whole of a Combine,
// the comparing words of a Compare.
export const DOING = {
  change: ['more', 'now', 'at the start'],
  combine: ['altogether', 'the rest'],
  compare: ['more', 'fewer', 'less', 'than'],
};

// ---- Word problems with decimals (wp-decimals; plans/2026-10-25-stage-6-plan.md, D7). The settings are chosen for this
// game, not a syllabus requirement. ----

// The kinds of amount, each written to its own places and kept inside the sizes the plan sets: money to the cent up to
// $99.99, lengths in metres to 2 places under 100 m, race times in seconds to 2 places from 25 to 40 seconds, masses of
// food or parcels in kilograms to 3 places under 10 kg. So a whole part is 0 to 9 when an amount has 3 places and 0 to 99
// otherwise, the sizes adding and subtracting decimals keeps to (D6).
//   places: every amount written with them ("$6.30", "2.375 kg"); unit: the answer's, written after an amount ('$' before
//   it); inWords: the unit in words, as the answer's last step names it ("So the answer is ☐ kilograms.", as the
//   whole-number stories write theirs); lo and top: the least and the most a story's amounts can be, in whole units, top
//   itself never reached
export const DECIMAL_KINDS = {
  money: { places: 2, unit: '$', top: 100 },
  length: { places: 2, unit: 'm', inWords: 'metres', top: 100 },
  time: { places: 2, unit: 'seconds', inWords: 'seconds', lo: 25, top: 40 },
  mass: { places: 3, unit: 'kg', inWords: 'kilograms', top: 10 },
};

// The settings of the decimal stories, each with its believable sizes inside its kind's.
//   kind: one of DECIMAL_KINDS; noun: what its amounts are of, a word each of its stories says ("How much ribbon ...");
//   size: [least, most] of its amounts in whole units, most never reached; easy: false where amounts under 1 are not
//   believable (a race, a long jump, a bag of flour), left out of easy problems as above (their amounts are all under 1:
//   coins, a short piece of ribbon); gain / lose: what makes the amount go up or down, [past, present], for a Change and for the change in a
//   two-step story. A setting with a noun and no lines of its own is about people who have some: its stories are built
//   in engine/items/wordproblems.js. lines: a setting's own sentences, for Combine (whole, part and their questions) or
//   Compare (has, more, fewer and their questions); {name}, {P}, {Q} and {K} are people ({P} the one with more), {thing}
//   and {other} its two things, and {A}, {C}, {D}, {X} and {Y} its amounts. The [brackets] mark the doing-words, as above.
export const DECIMALS = [
  { kind: 'money', noun: 'money', size: [1, 100], gain: ['earned', 'earn'], lose: ['spent', 'spend'] },
  { kind: 'length', noun: 'ribbon', size: [1, 10], gain: ['bought', 'buy'], lose: ['used', 'use'] },
  { kind: 'length', noun: 'rope', size: [5, 60], easy: false, gain: ['bought', 'buy'], lose: ['cut off', 'cut off'] },
  { kind: 'mass', noun: 'flour', size: [1, 10], easy: false, gain: ['bought', 'buy'], lose: ['used', 'use'] },
  { kind: 'money', noun: 'shop', size: [2, 60], easy: false, things: [['book', 'pen'], ['hat', 'ball'], ['kite', 'torch'], ['puzzle', 'card']],
    lines: {
      whole: '{name} [bought] a {thing} for {X} and a {other} for {Y} at the shop.', askWhole: 'How much did {name} [spend] [altogether]?',
      part: '{name} [spent] {C} [altogether] at the shop, on a {thing} and a {other}. The {thing} cost {X}.', askPart: 'How much did the {other} [cost]?',
      labels: ['{thing}', '{other}'],
    } },
  { kind: 'mass', noun: 'parcel', size: [1, 10], easy: false,
    lines: {
      whole: '{name} [posted] a parcel of {X} and a parcel of {Y}.', askWhole: 'How many kilograms did {name} [post] [altogether]?',
      part: '{name} [posted] two parcels, {C} [altogether]. One parcel was {X}.', askPart: 'How many kilograms was the other parcel?',
      labels: ['one parcel', 'the other'],
    } },
  { kind: 'length', noun: 'jump', size: [2, 7], easy: false,
    lines: {
      has: '{K} [jumped] {A} in the long jump.', more: '{P} [jumped] {D} [further] [than] {Q}.', fewer: '{Q} [jumped] {D} [less] [than] {P}.',
      ask: 'How far did {K} [jump]?', askMore: 'How much [further] did {P} [jump] [than] {Q}?', askFewer: 'How much [less] did {Q} [jump] [than] {P}?',
    } },
  { kind: 'time', noun: 'race', size: [25, 40], easy: false,
    lines: {
      has: '{K} [ran] the race in {A}.', more: '{P} [took] {D} [longer] [than] {Q}.', fewer: '{Q} was {D} [faster] [than] {P}.',
      ask: "What was {K}'s time?", askMore: 'How much [longer] did {P} [take] [than] {Q}?', askFewer: 'How much [faster] was {Q} [than] {P}?',
    } },
];
