export type QuizQuestion = { id:string; difficulty:'Easy'|'Medium'|'Hard'; question:string; options:string[]; answer:number; explanation:string };
export const todayQuiz: QuizQuestion[] = [
 {id:'q1',difficulty:'Easy',question:'What is the name of the force that lifts an aircraft?',options:['Thrust','Lift','Drag','Gravity'],answer:1,explanation:'Lift is generated when airflow over a wing creates a pressure difference.'},
 {id:'q2',difficulty:'Medium',question:'Which altitude system uses 29.92 inHg / 1013.25 hPa as its standard setting?',options:['Transition altitude','Flight level','QFE','Field elevation'],answer:1,explanation:'Above the transition altitude, pilots use standard pressure and report flight levels.'},
 {id:'q3',difficulty:'Hard',question:'What does ETOPS primarily govern?',options:['Engine overhaul intervals','Twin-engine diversion planning','Air traffic sequencing','Cabin safety checks'],answer:1,explanation:'ETOPS sets standards for how far twin-engine aircraft may operate from a suitable diversion airport.'}
];
export const chronicles = [
 {id:'c1',type:'Fact',title:'Why windows are oval',excerpt:'The curve is not just beautiful—it prevents dangerous stress concentration at altitude.',date:'Today',image:'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=900&q=80',likes:842},
 {id:'c2',type:'Story',title:'The flight that changed the cockpit forever',excerpt:'A quiet 1952 lesson became a turning point in aviation engineering.',date:'Yesterday',image:'https://images.unsplash.com/photo-1529074963764-98f45c47344b?auto=format&fit=crop&w=900&q=80',likes:1219}
];
export const news = [
 {id:'n1',headline:'New regional route links two Himalayan gateways',summary:'The service adds year-round connectivity with a focus on shorter journey times and local tourism.',source:'Aviation Week',published:'Aug 29, 2026 · 10:30 IST',image:'https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&w=900&q=80',tag:'ROUTES'},
 {id:'n2',headline:'Engine maker completes sustainable fuel endurance test',summary:'The programme marks another data point in the push toward lower-carbon long-haul flying.',source:'FlightGlobal',published:'Aug 29, 2026 · 08:10 IST',image:'https://images.unsplash.com/photo-1559628372-1e566cb28be6?auto=format&fit=crop&w=900&q=80',tag:'SUSTAINABILITY'}
];
export const leaderboard = [{name:'Aarav Sharma',score:30,streak:12},{name:'Maya Das',score:30,streak:8},{name:'Rohan K.',score:25,streak:17},{name:'Anika Bose',score:25,streak:5},{name:'SkyWatcher',score:20,streak:3}];
