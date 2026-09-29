export type DailyQuestion = { difficulty: 'easy' | 'medium' | 'hard'; prompt: string; options: string[]; correct_answer: number; explanation: string };
export type DailyChronicle = { kind: 'fact' | 'story'; title: string; excerpt: string; body: string; media: string[] };

type Topic = { term: string; fact: string; insight: string; image: string };
const topics: Topic[] = [
  { term: 'winglets', fact: 'They reduce the swirling airflow at a wingtip called induced drag.', insight: 'Less induced drag can improve fuel efficiency, especially on long sectors.', image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=85' },
  { term: 'a pressurised cabin', fact: 'It keeps enough breathable air pressure inside the aircraft at high altitude.', insight: 'Cabin altitude is controlled for comfort and safety, not to match the aircraft’s exact altitude.', image: 'https://images.unsplash.com/photo-1529074963764-98f45c47344b?auto=format&fit=crop&w=1200&q=85' },
  { term: 'a flight data recorder', fact: 'It records aircraft parameters that investigators can use after an occurrence.', insight: 'Despite the nickname “black box”, recorders are usually bright orange to help recovery teams find them.', image: 'https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&w=1200&q=85' },
  { term: 'a runway number', fact: 'It is based on the runway’s magnetic direction, rounded to the nearest ten degrees.', insight: 'A runway marked 27 points roughly west, near 270 degrees magnetic.', image: 'https://images.unsplash.com/photo-1474302770737-173ee21bab63?auto=format&fit=crop&w=1200&q=85' },
  { term: 'a holding pattern', fact: 'It keeps aircraft safely sequenced while they wait for a landing or routing clearance.', insight: 'Pilots fly published turns and timing so air traffic control can predict each aircraft’s position.', image: 'https://images.unsplash.com/photo-1517479149777-5f3b1511d5ad?auto=format&fit=crop&w=1200&q=85' },
  { term: 'ETOPS', fact: 'It is the approval framework that allows certain twin-engine aircraft to fly routes far from diversion airports.', insight: 'The name began as “Extended-range Twin-engine Operational Performance Standards”; it is not a measure of engine reliability alone.', image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=85' },
  { term: 'a VOR', fact: 'It is a radio navigation aid that gives an aircraft a bearing from a ground station.', insight: 'VORs helped build the airways system long before satellite navigation became common.', image: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?auto=format&fit=crop&w=1200&q=85' },
  { term: 'a go-around', fact: 'It is a normal, safe decision to stop an approach and climb for another attempt.', insight: 'A go-around can be caused by weather, traffic, an unstable approach or a runway that is not clear.', image: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?auto=format&fit=crop&w=1200&q=85' },
  { term: 'aircraft de-icing', fact: 'It removes or prevents ice and snow contamination before takeoff.', insight: 'Even a small amount of ice can disrupt airflow over a wing, which is why crews treat it seriously.', image: 'https://images.unsplash.com/photo-1583500178690-f7b7e59db9c7?auto=format&fit=crop&w=1200&q=85' },
  { term: 'a PAPI', fact: 'It is a set of lights that helps pilots judge whether their approach path is too high or too low.', insight: 'Two red and two white lights generally indicate the correct glide path.', image: 'https://images.unsplash.com/photo-1544016768-982d1554f0b9?auto=format&fit=crop&w=1200&q=85' }
  ,{ term: 'a transponder', fact: 'It sends identification and altitude information to air traffic surveillance systems.', insight: 'Controllers use it to distinguish an aircraft’s radar target and maintain separation.', image: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?auto=format&fit=crop&w=1200&q=85' }
  ,{ term: 'a taxiway', fact: 'It is the paved route aircraft use to move between runways, gates and hangars.', insight: 'Its signs, lights and markings reduce the risk of runway incursions on busy airports.', image: 'https://images.unsplash.com/photo-1474302770737-173ee21bab63?auto=format&fit=crop&w=1200&q=85' }
  ,{ term: 'a NOTAM', fact: 'It gives pilots and operators time-critical information about conditions that could affect a flight.', insight: 'NOTAMs can cover runway closures, navigation outages, temporary restrictions and hazards.', image: 'https://images.unsplash.com/photo-1517479149777-5f3b1511d5ad?auto=format&fit=crop&w=1200&q=85' }
  ,{ term: 'a flight level', fact: 'It is a standard pressure-based altitude used to keep aircraft vertically separated.', insight: 'Above the transition altitude, pilots use flight levels rather than local altitude references.', image: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?auto=format&fit=crop&w=1200&q=85' }
  ,{ term: 'an ILS', fact: 'It is an instrument landing system that provides precise lateral and vertical approach guidance.', insight: 'It helps crews fly accurate approaches when visibility is limited.', image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=85' }
  ,{ term: 'wake turbulence', fact: 'It is disturbed air left behind an aircraft, strongest behind heavy aircraft at low speed.', insight: 'Air traffic control applies spacing rules so following aircraft avoid the strongest vortices.', image: 'https://images.unsplash.com/photo-1529074963764-98f45c47344b?auto=format&fit=crop&w=1200&q=85' }
  ,{ term: 'a cabin crew evacuation command', fact: 'It starts a trained emergency evacuation procedure using the safest available exits.', insight: 'Cabin crew continually assess smoke, fire, water and outside hazards before directing passengers.', image: 'https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&w=1200&q=85' }
  ,{ term: 'a runway excursion', fact: 'It describes an aircraft unintentionally leaving the runway surface during takeoff or landing.', insight: 'Weather, braking action, approach stability and runway condition are all closely evaluated to prevent it.', image: 'https://images.unsplash.com/photo-1474302770737-173ee21bab63?auto=format&fit=crop&w=1200&q=85' }
  ,{ term: 'a sterile cockpit', fact: 'It is the period when flight crew avoid non-essential conversation during critical phases of flight.', insight: 'It protects attention during taxi, takeoff, landing and other high-workload moments.', image: 'https://images.unsplash.com/photo-1517479149777-5f3b1511d5ad?auto=format&fit=crop&w=1200&q=85' }
  ,{ term: 'a checkride', fact: 'It is a practical evaluation of a pilot’s knowledge, judgment and flying skills.', insight: 'Checkrides help ensure training standards are applied consistently before new privileges are granted.', image: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?auto=format&fit=crop&w=1200&q=85' }
  ,{ term: 'a MEL', fact: 'It is a minimum equipment list that specifies when certain inoperative equipment may be deferred safely.', insight: 'A MEL does not mean an aircraft can fly with anything broken; it sets strict conditions and limits.', image: 'https://images.unsplash.com/photo-1544016768-982d1554f0b9?auto=format&fit=crop&w=1200&q=85' }
  ,{ term: 'a diversion', fact: 'It is a planned landing at an airport other than the original destination.', insight: 'Diversions are a normal safety decision for weather, medical events, technical issues or airport disruption.', image: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?auto=format&fit=crop&w=1200&q=85' }
  ,{ term: 'a rejected takeoff', fact: 'It is a decision to stop the aircraft on the runway before reaching the decision speed.', insight: 'Crews train repeatedly to recognise the few failures that require a high-speed stop.', image: 'https://images.unsplash.com/photo-1583500178690-f7b7e59db9c7?auto=format&fit=crop&w=1200&q=85' }
  ,{ term: 'a flight attendant safety demonstration', fact: 'It gives passengers the essential actions they may need during an unlikely emergency.', insight: 'The routine presentation covers seat belts, exits, flotation equipment and oxygen masks for a reason.', image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=85' }
  ,{ term: 'an alternate airport', fact: 'It is an airport selected in advance as a viable destination if the planned landing cannot be completed.', insight: 'Fuel planning always considers the possibility of flying on to an alternate.', image: 'https://images.unsplash.com/photo-1529074963764-98f45c47344b?auto=format&fit=crop&w=1200&q=85' }
  ,{ term: 'a windshear alert', fact: 'It warns of a rapid change in wind direction or speed that can affect aircraft performance.', insight: 'Crews use forecast information, onboard warnings and escape manoeuvres to manage windshear safely.', image: 'https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&w=1200&q=85' }
  ,{ term: 'a runway safety area', fact: 'It is a prepared area surrounding a runway intended to reduce damage if an aircraft leaves the pavement.', insight: 'It is one layer in a wider system designed to manage rare but serious runway events.', image: 'https://images.unsplash.com/photo-1474302770737-173ee21bab63?auto=format&fit=crop&w=1200&q=85' }
  ,{ term: 'a load sheet', fact: 'It documents aircraft weight, balance and loading information before departure.', insight: 'Correct weight and balance are essential for performance calculations and safe handling.', image: 'https://images.unsplash.com/photo-1517479149777-5f3b1511d5ad?auto=format&fit=crop&w=1200&q=85' }
  ,{ term: 'a mayday call', fact: 'It is the international distress call used when there is grave and imminent danger and immediate assistance is needed.', insight: 'Air traffic control gives priority, clears airspace and coordinates support when a crew declares Mayday.', image: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?auto=format&fit=crop&w=1200&q=85' }
];

function rotate<T>(items: T[], by: number) { const n = ((by % items.length) + items.length) % items.length; return [...items.slice(n), ...items.slice(0, n)]; }

function dailyQuestions(day: number): DailyQuestion[] {
  // Ten different topics each day. The starting point advances by ten so the
  // next day receives the next block rather than repeating yesterday's set.
  const start = (day * 10) % topics.length;
  return Array.from({ length: 10 }, (_, i) => {
    const topicIndex = (start + i) % topics.length;
    const topic = topics[topicIndex];
    const mode = Math.floor(day / Math.max(1, Math.floor(topics.length / 10))) % 2;
    const correct = mode === 0 ? topic.fact : topic.insight;
    const prompt = mode === 0
      ? `Which statement best describes ${topic.term}?`
      : `Why is ${topic.term} important in aviation?`;
    const distractors = [1, 2, 3].map(step => {
      const other = topics[(topicIndex + step * 7) % topics.length];
      return mode === 0 ? other.fact : other.insight;
    });
    const options = rotate([correct, ...distractors], day + i);
    const level: DailyQuestion['difficulty'] = i < 4 ? 'easy' : i < 8 ? 'medium' : 'hard';
    return {
      difficulty: level,
      prompt,
      options,
      correct_answer: options.indexOf(correct),
      explanation: `${topic.fact} ${topic.insight}`,
    };
  });
}

// Stories use historical events rather than invented "untold" narratives. The
// visual treatment is illustrative; the text names the investigation source so
// readers can distinguish the archival account from the photography.
const historicStories: DailyChronicle[] = [
  {
    kind: 'story',
    title: 'United 232: when a crew learned to steer with thrust',
    excerpt: 'In July 1989, a DC-10 lost all three hydraulic systems. The story is not a tale of a miracle—it is a lesson in preparation, teamwork and the limits engineers later worked to improve.',
    body: `On 19 July 1989, United Airlines Flight 232 was cruising over Iowa when its tail-mounted engine suffered an uncontained failure. Debris damaged all three hydraulic systems, leaving the crew without normal flight-control power. The National Transportation Safety Board documented how rapidly a technical failure became a problem of control, communication and time.\n\nThe crew discovered that small changes in engine thrust could influence the aircraft’s direction and pitch. A training check airman travelling as a passenger joined the cockpit team. Together, the pilots and cabin crew worked through an emergency no checklist could fully describe.\n\nAfter 44 minutes of improvised control, the aircraft reached Sioux Gateway Airport. The attempted landing ended in a crash. There were 296 people on board; 111 people died and 185 survived. Those numbers matter because every safety story begins with people, not machinery.\n\nThe investigation examined the engine fan disk failure, inspection practices, hydraulic-system vulnerability, cabin safety and emergency response. It did not reduce the event to a single heroic moment: it traced how design, manufacturing, maintenance, training and rescue preparedness interact.\n\nFlight 232 helped accelerate work on better inspection of critical engine parts and stronger protection for hydraulic systems. It also became a powerful example of crew resource management: useful expertise was welcomed, tasks were shared and communication remained active under extraordinary pressure.\n\nSource note: U.S. National Transportation Safety Board investigation DCA89MA063 and report AAR-90-06. This is a safety-focused historical account; visuals are illustrative.`,
    media: [
      'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1474302770737-173ee21bab63?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1540962351504-03099e0a754b?auto=format&fit=crop&w=1200&q=85',
    ],
  },
  {
    kind: 'story',
    title: 'The Gimli Glider: a unit conversion that changed a flight',
    excerpt: 'Air Canada Flight 143 ran out of fuel in 1983 after a chain of measurement and communication errors. Its safe landing showed why a system transition needs more than new equipment.',
    body: `On 23 July 1983, Air Canada Flight 143 departed Montréal for Edmonton in a Boeing 767. Canada was moving to metric fuel calculations, while parts of the working process still relied on habits built around imperial units. A conversion error meant the aircraft was dispatched with far less fuel than intended.\n\nAt cruise altitude both engines stopped after fuel exhaustion. The crew were suddenly flying a large jet with no engine thrust and limited electrical power. The aircraft became, in effect, a glider.\n\nThe pilots selected the former Royal Canadian Air Force base at Gimli, Manitoba, as their landing site. It was being used that day for a racing event, which made the arrival even more complicated. The crew brought the aircraft down safely; there were no fatalities.\n\nThe lasting lesson is not that one person made one mistake. The incident exposed how new systems, labels, calculations, training and cross-checks must all work together during a changeover. A correct-looking number can still be wrong if the unit behind it is misunderstood.\n\nThe event became a widely taught example of fuel planning, independent verification and disciplined communication. It also reminds aviation teams that a safe transition is a human process as much as a technical one.\n\nSource note: Transportation Safety Board of Canada investigation A83H0002. This is a safety-focused historical account; visuals are illustrative.`,
    media: [
      'https://images.unsplash.com/photo-1529074963764-98f45c47344b?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1544016768-982d1554f0b9?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1517479149777-5f3b1511d5ad?auto=format&fit=crop&w=1200&q=85',
    ],
  },
  {
    kind: 'story',
    title: 'British Airways 9: the night volcanic ash stopped four engines',
    excerpt: 'In 1982, a Boeing 747 encountered volcanic ash over Indonesia and lost power in all four engines. The recovery changed how aviation treats ash clouds.',
    body: `On 24 June 1982, British Airways Flight 9 was flying from Kuala Lumpur to Perth when it entered a cloud of volcanic ash from Mount Galunggung. At first, the crew saw an unusual glow around the aircraft. Then the engines began to fail.\n\nAll four engines stopped. The Boeing 747 descended without thrust while the crew worked methodically through restart procedures and navigated toward Jakarta. Volcanic ash is not like ordinary weather: its fine particles can melt inside a hot engine and then solidify on cooler turbine parts.\n\nAs the aircraft descended into denser air and out of the ash cloud, the crew managed to restart the engines. The 747 landed safely in Jakarta with everyone on board surviving.\n\nThe incident revealed an important gap: ash clouds can be difficult to see on weather radar, yet they can be extremely hazardous to aircraft engines, windscreens and sensors. It helped strengthen worldwide reporting, forecasting and avoidance procedures for volcanic ash.\n\nToday, volcanic ash advisory centres, satellite observations and route-planning tools give crews more information before they reach a hazard. But the core rule is unchanged: ash is a no-go environment for aircraft.\n\nSource note: UK Air Accidents Investigation Branch report EW/C1092. This is a safety-focused historical account; visuals are illustrative.`,
    media: [
      'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1493962853295-0fd70327578a?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=85',
    ],
  },
  {
    kind: 'story',
    title: 'Qantas 32: the value of systems thinking under pressure',
    excerpt: 'A 2010 uncontained engine failure on an A380 produced many cascading warnings. The crew’s response became a modern case study in managing complexity.',
    body: `On 4 November 2010, Qantas Flight 32 departed Singapore for Sydney in an Airbus A380. Shortly after departure, an uncontained failure in one engine caused damage to the aircraft and triggered a large number of system messages.\n\nThe flight crew had to separate urgent information from secondary warnings while maintaining a safe aircraft path. They held the aircraft near Singapore, coordinated with cabin crew and engineers, and worked through the abnormal situation step by step.\n\nThe aircraft returned safely to Singapore. Everyone on board survived. The event was serious, but its value for aviation training lies in the deliberate, structured way the team handled uncertainty.\n\nInvestigators examined the engine failure and its effects on systems, while the aviation community studied the crew’s workload management. The lesson was not that technology always makes a problem simple; it was that good design and good teamwork can make a complex problem manageable.\n\nModern cockpits present large amounts of information. Qantas 32 remains a reminder to prioritise, verify and avoid rushing to a conclusion when several systems are reporting at once.\n\nSource note: Australian Transport Safety Bureau investigation AO-2010-089. This is a safety-focused historical account; visuals are illustrative.`,
    media: [
      'https://images.unsplash.com/photo-1540962351504-03099e0a754b?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1529074963764-98f45c47344b?auto=format&fit=crop&w=1200&q=85',
    ],
  },
];

const storyLessons = [
  'Preparation matters, but teamwork and flexible use of every available resource can be just as important when an emergency falls outside the checklist.',
  'A number is only useful when its unit and assumptions are understood. Independent cross-checks are essential during technical and procedural change.',
  'Some hazards cannot be managed by flying through them. Good information, early reporting and disciplined avoidance are powerful safety tools.',
  'When many warnings arrive at once, prioritise aircraft control, verify what is known, share workload and resist rushing toward a single explanation.',
];

function historicStory(number: number): DailyChronicle {
  const index = (number - 1) % historicStories.length;
  const story = historicStories[index];
  return { ...story, body: `${story.body}\n\nLESSON\n${storyLessons[index]}` };
}

export function freeDailyContent(dayIndex: number) {
  // Runs indefinitely. Quiz content rotates automatically every day. A full
  // Chronicle is published only once every three days; there are no fact posts.
  const day = Math.max(0, dayIndex);
  const publishStory = day % 3 === 2;
  const storyNumber = Math.floor(day / 3) + 1;
  return {
    questions: dailyQuestions(day),
    chronicle: publishStory ? historicStory(storyNumber) : null,
    key: `auto-story-${storyNumber}`,
  };
}
