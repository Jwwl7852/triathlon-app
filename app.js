const STORAGE_KEY = 'jl_triathlon_plan_v6_sub12';
const START_DATE = new Date('2026-08-19T00:00:00');
const END_DATE = new Date('2027-08-22T00:00:00');
const RACES = {
  marathon: '2027-05-09',
  koege: '2027-06-13',
  ironman: '2027-08-22'
};
const SUB12_TARGET = {swim:90, t1:8, bike:360, t2:7, run:255};
const SUB12_TOTAL_MIN = 720;
const defaultEquipment = [
  {name:'Specialized racercykel', type:'Cykel'},
  {name:'Pronghorn tricykel', type:'Cykel'},
  {name:'Løbesko 1', type:'Løbesko'},
  {name:'Løbesko 2', type:'Løbesko'},
  {name:'Løbesko 3', type:'Løbesko'},
  {name:'Svømmehal', type:'Svømning'},
  {name:'Åbent vand', type:'Svømning'},
  {name:'Træningscenter', type:'Styrke'},
  {name:'Hometrainer', type:'Cykel'}
];
const defaultGoals = [
  {id:'goal_ironman_sub12', name:'IRONMAN Copenhagen sub-12', type:'raceTime', discipline:'Alle', race:'ironman', start:'2026-08-17', end:'2027-08-22', target:720, unit:'time'},
  {id:'goal_marathon_0500', name:'Copenhagen Marathon under 5:00', type:'raceTime', discipline:'Løb', race:'marathon', start:'2026-08-17', end:'2027-05-09', target:300, unit:'time'},
  {id:'goal_swim_1500', name:'Kunne svømme 1.500 m pr. morgenpasas', type:'distance', discipline:'Svøm', race:'', start:'2026-08-17', end:'2026-11-30', target:1.5, unit:'km'}
];

const PERSONAL_SWIM_DRILLS = [
  {name:'Svømmeøvelse 1', url:'https://youtu.be/0RTQMmqEO_8'},
  {name:'Svømmeøvelse 2', url:'https://youtu.be/2dOLafP5MJo'},
  {name:'Svømmeøvelse 3', url:'https://youtu.be/jhuE_TwbFZI'},
  {name:'Svømmeøvelse 4', url:'https://youtu.be/_I6O_EIAopk'},
  {name:'Svømmeøvelse 5', url:'https://youtu.be/ppvfskIik_U'},
  {name:'Svømmeøvelse 6', url:'https://youtu.be/_IcOz16mYNQ'},
  {name:'Svømmeøvelse 7', url:'https://youtu.be/5mx1VSnCvMo'}
];

const PERSONAL_STRENGTH_EXERCISES = [
  {name:'Træk til brystkassen', sets:'3 x 4', note:'Tungt men kontrolleret. Vælg vægt hvor du kunne tage ca. 6-7 reps.', url:'https://maxer.dk/videoer/pulldown-traek-til-bryst'},
  {name:'Benpres', sets:'3 x 4', note:'Tungt men kontrolleret. Vælg vægt hvor du kunne tage ca. 6-7 reps.', url:'https://maxer.dk/videoer/underkropstraening-benpres'},
  {name:'Rows', sets:'3 x 4', note:'Stabil ryg og kontrolleret træk.', url:'https://maxer.dk/videoer/rows'},
  {name:'Rumænsk dødløft', sets:'3 x 4', note:'Fokus på hoftehængsel, baglår og god teknik.', url:'https://maxer.dk/videoer/rumaensk-doedloeft'},
  {name:'Russian twist', sets:'3 x 10-16', note:'Core/rotation. Roligt og kontrolleret.', url:'https://www.youtube.com/watch?v=xMdlyHcOHDA'}
];

const MAINTENANCE_STRENGTH_WORKOUT = {
  title:'Vedligeholdelse | 1.0',
  warmup:{name:'Warm up', exercise:'Stationary bike / crosstrainer / romaskine', time:'10:00', note:'Kan springes over, hvis du har løb som opvarmning.'},
  blocks:[
    {title:'Teknik / opvarmning', note:'Nem vægt og fuld kontrol. Ikke presse for at gøre det hårdt.', exercises:[
      {name:'Depth Jump', sets:'4 x 7', kg:'kropsvægt', note:'Hurtig afvikling og så lidt kontakttid med jorden som muligt.'},
      {name:'DB Bulgarian Split Squat – venstre', sets:'4 x 8', kg:'2,3 kg', note:'Omregnet fra 5 lb.'},
      {name:'DB Bulgarian Split Squat – højre', sets:'4 x 8', kg:'2,3 kg', note:'Omregnet fra 5 lb.'},
      {name:'Deadlift', sets:'10 reps @ 13,6 kg + 2 x 3 reps @ 22,7 kg', kg:'13,6 / 22,7 kg', note:'Ikke tungere end at du nemt kunne løfte den 5-6 gange.'}
    ]},
    {title:'Superset', note:'Ingen pause mellem øvelserne. 1 min pause efter hver omgang. Det er OK at pulsen kommer op.', exercises:[
      {name:'KB Swing Change Hands', sets:'4 x 12', kg:'2,3 kg', note:'6 swings med hver hånd, skift hånd i hvert swing. Omregnet fra 5 lb.'},
      {name:'KB Figure Eight', sets:'4 x 10', kg:'2,3 kg', note:'Samlet 10 ottetaller. Omregnet fra 5 lb.'},
      {name:'KB Push Press', sets:'1 x 8 @ 3,6 kg + 3 x 8 @ 2,3 kg', kg:'3,6 / 2,3 kg', note:'Omregnet fra 8 lb og 5 lb.'}
    ]}
  ]
};

function swimDrillTextForWeek(w){
  const a = PERSONAL_SWIM_DRILLS[(w-1) % PERSONAL_SWIM_DRILLS.length];
  const b = PERSONAL_SWIM_DRILLS[w % PERSONAL_SWIM_DRILLS.length];
  const c = PERSONAL_SWIM_DRILLS[(w+1) % PERSONAL_SWIM_DRILLS.length];
  return `Teknik: ${a.name} ${a.url} · ${b.name} ${b.url} · ${c.name} ${c.url}`;
}

function strengthWorkoutText(){
  const main = MAINTENANCE_STRENGTH_WORKOUT.blocks
    .flatMap(b => b.exercises.map(e => `${e.name}: ${e.sets} @ ${e.kg} (${e.note})`))
    .join(' | ');
  const support = PERSONAL_STRENGTH_EXERCISES.map(e => `${e.name}: ${e.sets}`).join(' | ');
  return `${MAINTENANCE_STRENGTH_WORKOUT.title}: ${main} | Ekstra/alternativ støtte: ${support}`;
}

let state = loadState();

function iso(d){
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}
function dkDate(s){ return new Date(s+'T00:00:00').toLocaleDateString('da-DK',{day:'2-digit',month:'2-digit',year:'numeric'}); }
function dayName(s){ return ['Søndag','Mandag','Tirsdag','Onsdag','Torsdag','Fredag','Lørdag'][new Date(s+'T00:00:00').getDay()]; }
function weekNo(s){ return Math.floor((new Date(s+'T00:00:00') - START_DATE)/(7*86400000))+1; }
function monthKey(s){ return s.slice(0,7); }
function todayIso(){ const d=new Date(); d.setMinutes(d.getMinutes()-d.getTimezoneOffset()); return d.toISOString().slice(0,10); }
function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function loadState(){
  const saved = localStorage.getItem(STORAGE_KEY);
  if(saved){
    try{
      const parsed = JSON.parse(saved);
      if(!parsed.equipment) parsed.equipment = defaultEquipment;
      if(!parsed.workouts) parsed.workouts = generatePlan();
      if(!parsed.goals) parsed.goals = defaultGoals;
      return parsed;
    } catch(e){}
  }
  return {equipment: defaultEquipment, workouts: generatePlan(), goals: defaultGoals};
}
function resetGeneratedKeepActual(){
  const actual = new Map(state.workouts.map(w=>[w.id, {actualMinutes:w.actualMinutes, actualKm:w.actualKm, status:w.status, rpe:w.rpe, equipment:w.equipment, notes:w.notes}]));
  state.workouts = generatePlan().map(w=> ({...w, ...(actual.get(w.id)||{})}));
  save(); renderAll();
}

function resetImportedAndActual(){
  const ok = confirm('Vil du nulstille alle importerede/faktiske træningsdata? Planen og udstyrslisten bevares, men importerede ekstra pas fjernes, og faktisk tid/km/status/RPE/noter ryddes.');
  if(!ok) return;
  const equipment = state.equipment && state.equipment.length ? state.equipment : defaultEquipment;
  state = {equipment, workouts: generatePlan(), goals: state.goals || defaultGoals};
  save();
  renderAll();
  alert('Importerede og faktiske træningsdata er nulstillet. Selve planen er bevaret.');
}

function runDistanceForWeek(w){
  // Personliggjort efter dine tidligere succesuger: løb/gang-opstart, rolig progression og lettere uge hver 4. uge.
  // Dette er ugens hovedløb onsdag, fordi søndag er fast cykeldag og lørdag holdes fri.
  let km;
  if(w <= 6) km = 4.0 + (w-1)*0.45;                 // 4,0 → ca. 6,3 km
  else if(w <= 12) km = 6.5 + (w-6)*0.55;            // ca. 6,5 → 9,8 km
  else if(w <= 20) km = 10 + (w-12)*0.75;            // ca. 10 → 16 km
  else if(w <= 30) km = 16 + (w-20)*1.1;             // ca. 16 → 27 km
  else if(w <= 35) km = 27 + (w-30)*0.8;             // peak 28-31 km
  else if(w <= 38) km = [24,18,12][w-36] || 22;      // marathon taper
  else if(w <= 42) km = 5 + (w-38)*1.5;              // restitution/build til Køge
  else if(w <= 50) km = 10 + (w-42)*0.75;            // Ironman-vedligehold, ikke marathonjagt
  else km = 15 - (w-50)*2.0;                         // Ironman taper
  if(w % 4 === 0) km *= 0.72;                        // deload som i dine gamle uger
  return Math.max(3, Math.round(km*10)/10);
}

function easyRunKmForWeek(w){
  let km = 3.0 + Math.min(4.5, w*0.13);
  if(w % 4 === 0) km *= 0.75;
  return Math.round(km*10)/10;
}

function runWalkTextForWeek(w){
  if(w <= 2) return 'Løb/gang: 10×2 min roligt løb / 1 min gang';
  if(w <= 5) return 'Løb/gang: 7×3 min roligt løb / 1 min gang';
  if(w <= 8) return 'Løb/gang: 5×5 min roligt løb / 1 min gang';
  if(w <= 12) return 'Roligt løb med korte gangpauser efter behov';
  return 'Roligt sammenhængende løb; gå korte pauser hvis teknikken falder';
}

function longBikeForWeek(w){
  // Søndag er din faste lange cykeldag. Før marathon er den moderat; efter marathon bliver den Ironman-specifik.
  let km;
  if(w <= 8) km = 45 + w*3;
  else if(w <= 20) km = 70 + (w-8)*2.5;
  else if(w <= 38) km = 95 + (w-20)*1.5;             // holder cyklen ved lige mens løb prioriteres
  else if(w <= 42) km = 55 + (w-38)*10;              // efter marathon mod Køge
  else if(w <= 50) km = 95 + (w-42)*8;               // Ironman-specifik build
  else km = 140 - (w-50)*20;                         // taper
  if(w % 4 === 0) km *= .70;
  return Math.max(35, Math.round(km));
}

function bikeQualityTitleForWeek(w){
  if(w <= 4) return 'Rolig cykling med høj kadence';
  if(w <= 8) return 'Cykel teknik: 6×1 min høj kadence';
  if(w <= 16) return 'Hård cykling: 6×3 min kontrolleret';
  if(w <= 28) return 'Hård cykling: 5×5 min sweet spot';
  if(w <= 38) return 'Cykel kvalitet: 4×7 min tempo';
  if(w <= 50) return 'Ironman cykel: 3×12 min stabilt tryk';
  return 'Let cykling / taper';
}

function bikeQualityIntensityForWeek(w, date){
  const indoor = isIndoorBikeSeason(date) ? 'Hometrainer · ' : '';
  if(w <= 4) return indoor + 'Z2 + 6×20 sek høj kadence / RPE 3-4';
  if(w <= 8) return indoor + 'Teknik/kadence, ingen pres / RPE 4-5';
  if(w <= 16) return indoor + '6×3 min hårdt, 2 min let / RPE 6-7';
  if(w <= 28) return indoor + '5×5 min sweet spot, kontrolleret / RPE 6-7';
  if(w <= 38) return indoor + '4×7 min tempo, ikke max / RPE 6-7';
  if(w <= 50) return indoor + '3×12 min racekontrol / RPE 5-6';
  return indoor + 'Let taper / RPE 2-3';
}

function minutesFromRunKm(km){ return Math.round(km*7.2); }
function minutesFromBikeKm(km){ return Math.round(km*2.2); }
function isBefore(date, target){ return new Date(date+'T00:00:00') < new Date(target+'T00:00:00'); }
function swimKmForWeek(w){
  // Fra 700 m til 1.500 m, inspireret af dine tidligere succesuger med 1.000-1.600 m teknikpas.
  const progression = [0.7,0.8,0.8,0.9,1.0,1.0,1.1,1.0,1.2,1.3,1.4,1.2,1.5];
  let km = w <= progression.length ? progression[w-1] : 1.5;
  if(w > 13 && w % 4 === 0) km = Math.max(1.1, km - 0.2);
  return Math.round(km*10)/10;
}

function swimTitleForDay(dow, swimKm){
  if(dow===1) return `Svøm teknik + rolig opstart ${Math.round(swimKm*1000)} m`;
  if(dow===3) return `Svøm udholdenhed ${Math.round(swimKm*1000)} m`;
  return `Svøm flow/teknik ${Math.round(swimKm*1000)} m`;
}
function swimIntensityForDay(dow){
  if(dow===1) return 'Morgen · balance, vejrtrækning, rotation · RPE 3';
  if(dow===3) return 'Morgen · rolig udholdenhed + catch · RPE 3-4';
  return 'Morgen · teknik + god afslutning · RPE 3-4';
}

function isIndoorBikeSeason(date){
  return date >= '2026-10-01' && date <= '2027-03-24';
}
function bikeEquipmentForDate(date, preferTri=false){
  if(isIndoorBikeSeason(date)) return 'Hometrainer';
  return preferTri ? 'Pronghorn tricykel' : 'Specialized racercykel';
}
function weekdayBikeMinutes(w, date, quality=false){
  if(isIndoorBikeSeason(date)) return quality ? Math.min(90, 55 + Math.floor(w/5)*5) : Math.min(75, 45 + Math.floor(w/8)*5);
  return quality ? Math.min(95, 55 + Math.floor(w/6)*5) : 70;
}
function weekdayBikeKm(date, minutes){
  return isIndoorBikeSeason(date) ? Math.round(minutes/2.2) : Math.round(minutes/2.4);
}


function generatePlan(){
  const list=[];
  const add=(date,disc,title,intensity,minutes,km,equipment='')=>{
    const id = `${date}_${disc}_${title}`.replaceAll(' ','_').replaceAll(':','').replaceAll('/','_');
    list.push({id,date,day:dayName(date),week:weekNo(date),discipline:disc,title,intensity,planMinutes:minutes,planKm:km,actualMinutes:'',actualKm:'',status:'Planlagt',rpe:'',equipment,notes:''});
  };
  for(let d=new Date(START_DATE); d<=END_DATE; d.setDate(d.getDate()+1)){
    const date=iso(d), dow=d.getDay(), w=weekNo(date);
    if(date===RACES.marathon){ add(date,'Race','Copenhagen Marathon','Kontrolleret løb/gang hvis nødvendigt / RPE 5-6',285,42.2,'Løbesko 1'); continue; }
    if(date===RACES.koege){ add(date,'Race','Køge Jernmand 1/2 Ironman','Kontrolleret test mod Ironman / RPE 5-7',365,113,'Pronghorn tricykel'); continue; }
    if(date===RACES.ironman){ add(date,'Race','IRONMAN Copenhagen','A-mål sub-12 · kontrolleret pacing / RPE 5-7',715,226,'Pronghorn tricykel'); continue; }

    const daysToMar = (new Date(RACES.marathon)-d)/86400000;
    const daysAfterMar = (d-new Date(RACES.marathon))/86400000;
    const daysToKoege = (new Date(RACES.koege)-d)/86400000;
    const daysAfterKoege = (d-new Date(RACES.koege))/86400000;
    const daysToIM = (new Date(RACES.ironman)-d)/86400000;
    const taper = (daysToMar>0&&daysToMar<=14)||(daysToKoege>0&&daysToKoege<=10)||(daysToIM>0&&daysToIM<=18);
    const recovery = (daysAfterMar>0&&daysAfterMar<=7)||(daysAfterKoege>0&&daysAfterKoege<=7);

    if(recovery && (dow===1||dow===2)){
      add(date,'Restitution','Gåtur/mobilitet','Meget let / RPE 1-2',30,0,'');
      continue;
    }

    // Fast svømning mandag/onsdag/fredag morgen. Starter 700 m og bygger til 1.500 m.
    if([1,3,5].includes(dow)){
      let swimKm = swimKmForWeek(w);
      if(taper) swimKm = Math.max(0.7, Math.round(swimKm*0.7*10)/10);
      const swimMin = Math.round(swimKm * 25); // ca. 25 min pr. km inkl. pauser/teknik
      add(date,'Svøm', swimTitleForDay(dow, swimKm), swimIntensityForDay(dow), swimMin, swimKm, 'Svømmehal');
    }

    // Fredag eftermiddag og lørdag holdes fri. Styrke lægges mandag efter arbejde.
    if(dow===1 && !taper && !recovery){
      add(date,'Styrke','Core + styrke: ben, hofter, stabilitet','Efter arbejde · 10 min core + kontrolleret styrke / RPE 6-7',45,0,'Træningscenter');
    }
    if(dow===4 && w>6 && !taper && !recovery){
      add(date,'Styrke','Kort core/stabilitet','15-20 min let core efter cykling · ikke tungt / RPE 4-5',20,0,'Træningscenter');
    }

    // Cykling tirsdag, torsdag og søndag. Fra oktober til ca. 24. marts er det hometrainer.
    if([2,4].includes(dow)){
      const quality = dow===4;
      const bikeMin = weekdayBikeMinutes(w, date, quality);
      const bikeKm = weekdayBikeKm(date, bikeMin);
      const bikeTitle = quality ? bikeQualityTitleForWeek(w) : (isIndoorBikeSeason(date) ? 'Hometrainer rolig base' : 'Rolig cykling');
      const bikeIntensity = quality ? bikeQualityIntensityForWeek(w, date) : (isIndoorBikeSeason(date) ? 'Hometrainer Z2 / RPE 3-4' : 'Ude Z2 / RPE 3-4');
      add(date,'Cykling',bikeTitle,bikeIntensity,bikeMin,bikeKm,bikeEquipmentForDate(date));
    }

    // Tre løbepas pr. uge uden lørdag: kort tirsdag, hovedpas onsdag, kort/rolig torsdag.
    if(dow===2 && w>1 && !taper && !recovery){
      const km = easyRunKmForWeek(w);
      add(date,'Løb','Løbeteknik + kort løb/gang','8-10 min teknikdrills + ' + runWalkTextForWeek(w) + ' · RPE 3-4',minutesFromRunKm(km)+10,km,'Løbesko 1');
    }
    if(dow===3 && !taper && !recovery){
      let mainRun = isBefore(date, RACES.marathon) ? runDistanceForWeek(w) : Math.max(6, Math.round(runDistanceForWeek(w)*0.55*10)/10);
      add(date,'Løb', isBefore(date, RACES.marathon)?'Ugens hovedløb / lang løb/gang':'Roligt vedligeholdelsesløb','Z1-Z2 · ' + runWalkTextForWeek(w) + ' · RPE 3-5',minutesFromRunKm(mainRun),mainRun,'Løbesko 2');
    }
    if(dow===4 && w>5 && !taper && !recovery){
      const km = Math.min(8, Math.round((3.5 + w*0.09)*10)/10);
      add(date,'Løb','Let løb + 4 korte strides','Kun hvis benene er friske efter cykel. Roligt snakketempo / RPE 3-4',minutesFromRunKm(km)+8,km,'Løbesko 3');
    }

    // Søndag er fast cykeldag. Før marathon holdes den moderat, efter marathon bliver den nøgle-langtur/brick.
    if(dow===0){
      const preferTri = !isBefore(date, RACES.koege);
      let bikeKm, bikeMin, title;
      if(isBefore(date, RACES.marathon)){
        bikeMin = isIndoorBikeSeason(date) ? Math.min(110, 70 + Math.floor(w/8)*10) : Math.min(150, 75 + Math.floor(w/6)*10);
        bikeKm = isIndoorBikeSeason(date) ? Math.round(bikeMin/2.2) : Math.round(bikeMin/2.2);
        title = isIndoorBikeSeason(date) ? 'Søndag hometrainer rolig' : 'Søndagscykling rolig';
      } else {
        bikeKm = longBikeForWeek(w);
        if(taper) bikeKm = Math.max(35, Math.round(bikeKm*.55));
        if(recovery) bikeKm = 35;
        bikeMin = minutesFromBikeKm(bikeKm);
        title = isIndoorBikeSeason(date) ? 'Lang hometrainer' : 'Lang cykeltur';
      }
      add(date,'Cykling',title, isIndoorBikeSeason(date)?'Indendørs Z2 / RPE 3-5':'Z2 / RPE 3-5', bikeMin, bikeKm, bikeEquipmentForDate(date, preferTri));
      if(!isBefore(date, RACES.marathon) && !taper && !recovery){
        add(date,'Løb','Brick-løb efter lang cykel','Meget roligt / RPE 3-4',20,3,'Løbesko 3');
      }
    }
  }
  return list;
}



// --- Pulsdata helpers ---
function avgNumbers(nums){
  const vals = nums.map(Number).filter(v=>Number.isFinite(v) && v>0);
  return vals.length ? Math.round(vals.reduce((a,b)=>a+b,0)/vals.length) : '';
}
function maxNumbers(nums){
  const vals = nums.map(Number).filter(v=>Number.isFinite(v) && v>0);
  return vals.length ? Math.round(Math.max(...vals)) : '';
}
function workoutHrText(w){
  const parts=[];
  if(w.avgHr) parts.push(`gns. puls ${w.avgHr}`);
  if(w.maxHr) parts.push(`maks ${w.maxHr}`);
  return parts.length ? parts.join(' · ') : '';
}
function activityHrNote(activity){
  const parts=[];
  if(activity.avgHr) parts.push(`gns. puls ${activity.avgHr}`);
  if(activity.maxHr) parts.push(`maks puls ${activity.maxHr}`);
  return parts.length ? ' · ' + parts.join(' · ') : '';
}
function xmlAllLocal(node, localName){
  if(!node) return [];
  return Array.from(node.getElementsByTagName('*')).filter(el => (el.localName || el.tagName).toLowerCase() === localName.toLowerCase());
}

function minToTime(min){
  const m=Math.round(Number(min)||0); const h=Math.floor(m/60); const r=String(m%60).padStart(2,'0'); return `${h}:${r}`;
}
function avgPaceMinutesPerKm(rows){
  const min=sum(rows,'actualMinutes'), km=sum(rows,'actualKm');
  return km>0 && min>0 ? min/km : null;
}
function calculateSub12Forecast(){
  const completed=state.workouts.filter(w=>(w.status==='Gennemført'||w.status==='Delvist gennemført') && Number(w.actualMinutes)>0);
  const swimRows=completed.filter(w=>w.discipline==='Svøm' && Number(w.actualKm)>0);
  const bikeRows=completed.filter(w=>w.discipline==='Cykling' && Number(w.actualKm)>0);
  const runRows=completed.filter(w=>w.discipline==='Løb' && Number(w.actualKm)>0);
  const swimPace=avgPaceMinutesPerKm(swimRows);
  const bikePace=avgPaceMinutesPerKm(bikeRows);
  const runPace=avgPaceMinutesPerKm(runRows);
  const swim = swimPace ? swimPace*3.8 : SUB12_TARGET.swim;
  const bike = bikePace ? bikePace*180 : SUB12_TARGET.bike;
  // Ironman-løbet er langsommere end almindelige træningsløb. Derfor lægges der 8% på nuværende faktiske løbepace.
  const run = runPace ? runPace*42.2*1.08 : SUB12_TARGET.run;
  const total = swim + SUB12_TARGET.t1 + bike + SUB12_TARGET.t2 + run;
  const actualSessions=swimRows.length+bikeRows.length+runRows.length;
  let status='Afventer';
  if(actualSessions<6) status='Mangler data';
  else if(total<=SUB12_TOTAL_MIN) status='På vej';
  else if(total<=750) status='Tæt på';
  else status='Bagud';
  return {swim,bike,run,t1:SUB12_TARGET.t1,t2:SUB12_TARGET.t2,total,status,actualSessions,swimRows:swimRows.length,bikeRows:bikeRows.length,runRows:runRows.length};
}
function calculateGoalForecasts(){
  const completed=state.workouts.filter(w=>(w.status==='Gennemført'||w.status==='Delvist gennemført') && Number(w.actualMinutes)>0);
  const swimRows=completed.filter(w=>w.discipline==='Svøm' && Number(w.actualKm)>0);
  const bikeRows=completed.filter(w=>w.discipline==='Cykling' && Number(w.actualKm)>0);
  const runRows=completed.filter(w=>w.discipline==='Løb' && Number(w.actualKm)>0);
  const swimPace=avgPaceMinutesPerKm(swimRows);
  const bikePace=avgPaceMinutesPerKm(bikeRows);
  const runPace=avgPaceMinutesPerKm(runRows);

  const marathon = runPace ? runPace*42.2*1.03 : 270; // default ca. 4:30
  const koegeSwim = swimPace ? swimPace*1.9 : 42;
  const koegeBike = bikePace ? bikePace*90 : 175;
  const koegeRun = runPace ? runPace*21.1*1.05 : 130;
  const koege = koegeSwim + 6 + koegeBike + 4 + koegeRun;

  const iron = calculateSub12Forecast();
  return { marathon, koege, ironman: iron.total, ironStatus: iron.status, runRows: runRows.length, bikeRows: bikeRows.length, swimRows: swimRows.length };
}

function renderGoalForecasts(){
  const g = calculateGoalForecasts();
  const set = (id, value, title='') => {
    const el = document.getElementById(id);
    if(!el) return;
    el.textContent = minToTime(value);
    if(title) el.title = title;
  };
  set('marathonGoalTime', g.marathon, g.runRows ? 'Forventet sluttid ud fra dine løbedata' : 'Foreløbig standardprognose – mangler løbedata');
  set('koegeGoalTime', g.koege, (g.swimRows || g.bikeRows || g.runRows) ? 'Forventet sluttid ud fra dine træningsdata' : 'Foreløbig standardprognose – mangler data');
  set('ironmanGoalTime', g.ironman, 'Forventet sluttid for IRONMAN Copenhagen');
}

function renderSub12Forecast(p){
  const diff=Math.round(p.total-SUB12_TOTAL_MIN);
  const diffTxt = diff<=0 ? `${Math.abs(diff)} min under 12:00` : `${diff} min over 12:00`;
  return `<div class="sub12-card status-${p.status.replaceAll(' ','-')}">
    <div class="sub12-header"><div><span class="eyebrow-dark">IRONMAN mål</span><h3>Sub-12 prognose</h3></div><strong>${minToTime(p.total)}</strong></div>
    <p class="hint">Foreløbig vurdering: <strong>${p.status}</strong> · ${diffTxt}. Prognosen bliver mere præcis, når du har importeret eller indtastet flere faktiske pas.</p>
    <div class="split-grid">
      <div><span>Svøm</span><strong>${minToTime(p.swim)}</strong><small>Mål ca. 1:30</small></div>
      <div><span>T1</span><strong>${minToTime(p.t1)}</strong><small>Roligt skift</small></div>
      <div><span>Cykel</span><strong>${minToTime(p.bike)}</strong><small>Mål ca. 6:00</small></div>
      <div><span>T2</span><strong>${minToTime(p.t2)}</strong><small>Kontrolleret</small></div>
      <div><span>Løb</span><strong>${minToTime(p.run)}</strong><small>Mål ca. 4:15</small></div>
    </div>
    <p class="hint">Datagrundlag: ${p.actualSessions} faktiske svøm/cykel/løb-pas (${p.swimRows} svøm, ${p.bikeRows} cykel, ${p.runRows} løb).</p>
  </div>`;
}


const TECHNIQUE_LIBRARY = {
  core: [
    {name:'Front plank', dose:'2 x 20-45 sek.', why:'Anti-ekstension og stabilitet i kropsstammen.', video:'https://www.youtube.com/results?search_query=ACE+Fitness+front+plank+exercise'},
    {name:'Side plank', dose:'2 x 20-40 sek. pr. side', why:'Sidekæde, hofter og anti-rotation.', video:'https://www.youtube.com/results?search_query=ACE+Fitness+side+plank+exercise'},
    {name:'Dead bug', dose:'2 x 8-12 pr. side', why:'Kontrol af lænd og bækken under bevægelse.', video:'https://www.youtube.com/results?search_query=dead+bug+exercise+proper+form'},
    {name:'Bird dog', dose:'2 x 8-12 pr. side', why:'Ryg, hofter og diagonal stabilitet.', video:'https://www.nasm.org/resource-center/exercise-library/bird-dog'},
    {name:'Glute bridge', dose:'2 x 10-15', why:'Baller/hofter – vigtig for løb og cykling.', video:'https://www.youtube.com/results?search_query=glute+bridge+proper+form'},
    {name:'Pallof press', dose:'2 x 10-12 pr. side', why:'Anti-rotation og stabil overkrop.', video:'https://www.youtube.com/results?search_query=Pallof+press+proper+form'},
    {name:'Hollow hold', dose:'2 x 15-30 sek.', why:'Kropsspænding og kontrol.', video:'https://www.youtube.com/results?search_query=hollow+hold+proper+form'},
    {name:'Mountain climber rolig', dose:'2 x 20-30 sek.', why:'Core + hoftearbejde uden tung belastning.', video:'https://www.youtube.com/results?search_query=mountain+climber+proper+form'},
    {name:'Copenhagen side plank let', dose:'2 x 10-20 sek. pr. side', why:'Adduktorer/lyske – nyttig for løbere.', video:'https://www.youtube.com/results?search_query=Copenhagen+side+plank+beginner'},
    {name:'Farmer carry', dose:'2 x 30-45 sek.', why:'Stabilitet, greb og kropsholdning.', video:'https://www.youtube.com/results?search_query=farmer+carry+proper+form'}
  ],
  run: [
    {name:'A-skips', dose:'2 x 20-30 m', why:'Knedriv, rytme og fodisæt.', video:'https://www.youtube.com/results?search_query=A+skip+running+drill+proper+form'},
    {name:'High knees', dose:'2 x 20-30 m', why:'Kadence og aktivt knæløft.', video:'https://www.youtube.com/results?search_query=high+knees+running+drill+proper+form'},
    {name:'Butt kicks', dose:'2 x 20-30 m', why:'Hælopspark og afslappet bagkæde.', video:'https://www.youtube.com/results?search_query=butt+kicks+running+drill+proper+form'},
    {name:'Ankling / hurtige fødder', dose:'2 x 20 m', why:'Fodstyrke, kontakt og hurtig afvikling.', video:'https://www.youtube.com/results?search_query=ankling+running+drill'},
    {name:'Straight-leg bounds', dose:'2 x 20 m', why:'Stivhed i ankel/sene og hofteekstension.', video:'https://www.youtube.com/results?search_query=straight+leg+bounds+running+drill'},
    {name:'Carioca / grapevine', dose:'2 x 20 m pr. side', why:'Hoftekoordination og rotation.', video:'https://www.youtube.com/results?search_query=carioca+running+drill'},
    {name:'Strides', dose:'4 x 15-20 sek.', why:'Let fart og teknik uden hårdt intervalpres.', video:'https://www.youtube.com/results?search_query=running+strides+proper+form'}
  ],
  swim: [
    {name:'Svømmeøvelse 1', dose:'Roteres ind i morgenpas', why:'Din egen svømmeteknik-video.', video:'https://youtu.be/0RTQMmqEO_8'},
    {name:'Svømmeøvelse 2', dose:'Roteres ind i morgenpas', why:'Din egen svømmeteknik-video.', video:'https://youtu.be/2dOLafP5MJo'},
    {name:'Svømmeøvelse 3', dose:'Roteres ind i morgenpas', why:'Din egen svømmeteknik-video.', video:'https://youtu.be/jhuE_TwbFZI'},
    {name:'Svømmeøvelse 4', dose:'Roteres ind i morgenpas', why:'Din egen svømmeteknik-video.', video:'https://youtu.be/_I6O_EIAopk'},
    {name:'Svømmeøvelse 5', dose:'Roteres ind i morgenpas', why:'Din egen svømmeteknik-video.', video:'https://youtu.be/ppvfskIik_U'},
    {name:'Svømmeøvelse 6', dose:'Roteres ind i morgenpas', why:'Din egen svømmeteknik-video.', video:'https://youtu.be/_IcOz16mYNQ'},
    {name:'Svømmeøvelse 7', dose:'Roteres ind i morgenpas', why:'Din egen svømmeteknik-video.', video:'https://youtu.be/5mx1VSnCvMo'}
  ]
};

function renderTechnique(){
  const make = arr => arr.map(x=>`<div class="tech-item"><div><strong>${x.name}</strong><p>${x.why}</p><small>${x.dose}</small></div><a href="${x.video}" target="_blank" rel="noopener">Se video</a></div>`).join('');
  const core = document.getElementById('coreTechniqueList');
  const run = document.getElementById('runTechniqueList');
  const swim = document.getElementById('swimTechniqueList');
  const strength = document.getElementById('maintenanceStrengthList');
  if(core) core.innerHTML = make(TECHNIQUE_LIBRARY.core);
  if(run) run.innerHTML = make(TECHNIQUE_LIBRARY.run);
  if(swim) swim.innerHTML = make(TECHNIQUE_LIBRARY.swim);
  if(strength){
    strength.innerHTML = `<div class="tech-item"><div><strong>${MAINTENANCE_STRENGTH_WORKOUT.title}</strong><p><strong>Opvarmning:</strong> ${MAINTENANCE_STRENGTH_WORKOUT.warmup.time} ${MAINTENANCE_STRENGTH_WORKOUT.warmup.exercise}. ${MAINTENANCE_STRENGTH_WORKOUT.warmup.note}</p><small>Alle vægte er omregnet fra lb til kg og afrundet til én decimal.</small></div></div>` +
      MAINTENANCE_STRENGTH_WORKOUT.blocks.map(block => `<div class="tech-item"><div><strong>${block.title}</strong><p>${block.note}</p>${block.exercises.map(e=>`<p><strong>${e.name}</strong><br>${e.sets} · ${e.kg}<br><small>${e.note}</small></p>`).join('')}</div></div>`).join('');
  }
}



function timeStringToMinutes(v){
  if(typeof v === 'number') return v;
  const s=String(v||'').trim();
  if(!s) return 0;
  if(s.includes(':')){ const [h,m]=s.split(':').map(Number); return (h||0)*60+(m||0); }
  return Number(s)*60 || 0;
}
function goalTypeLabel(type){
  if(type==='distance') return 'Distance';
  if(type==='DistanceTime') return 'Distance på tid';
  if(type==='hours') return 'Træningstid';
  if(type==='sessions') return 'Antal pas';
  if(type==='raceTime') return 'Race-sluttid';
  return type || '';
}
function goalUnitLabel(g){ if(g.type==='raceTime') return ''; if(g.type==='distance') return 'km'; if(g.type==='hours') return 'timer'; if(g.type==='sessions') return 'pas'; return g.unit||''; }
function formatGoalValue(g, value){
  if(g.type==='raceTime') return minToTime(value);
  if(g.type==='hours') return Number(value||0).toFixed(1)+' timer';
  if(g.type==='distance') return Number(value||0).toFixed(1)+' km';
  if(g.type==='sessions') return Math.round(Number(value)||0)+' pas';
  return String(value);
}
function rowsForGoal(g){
  return state.workouts.filter(w=>{
    if(g.start && w.date < g.start) return false;
    if(g.end && w.date > g.end) return false;
    if(g.discipline && g.discipline !== 'Alle' && w.discipline !== g.discipline) return false;
    return w.status==='Gennemført' || w.status==='Delvist gennemført';
  });
}
function evaluateGoal(g){
  let actual=0, target=Number(g.target)||0, status='Mangler data', pct=0, actualDisplay='', targetDisplay='';
  if(g.type==='DistanceTime'){
    const targetKm = Number(String(g.distanceKm || 0).replace(',','.')) || 0;
    const targetMin = Number(String(g.target || 0).replace(',','.')) || 0;
    const rows = rowsForGoal({...g, type:'distance'}).filter(w => Number(w.actualKm) >= targetKm && Number(w.actualMinutes)>0);
    let best = null;
    rows.forEach(w=>{
      const km = Number(w.actualKm)||0;
      const min = Number(w.actualMinutes)||0;
      if(km>0 && min>0){
        const adjusted = min * (targetKm / km);
        if(!best || adjusted < best.minutes) best = {minutes: adjusted, workout:w};
      }
    });
    target = targetMin;
    actual = best ? best.minutes : 0;
    pct = actual && target ? Math.min(120, (target/actual)*100) : 0;
    if(!actual) status='Mangler data';
    else if(actual <= target) status='Opfyldt';
    else if(actual <= target*1.10) status='Tæt på';
    else status='Bagud';
    actualDisplay = actual ? `${minToTime(actual)} for ${targetKm} km` : 'Ingen data';
    targetDisplay = `${targetKm} km under ${minToTime(targetMin)}`;
  } else if(g.type==='raceTime'){
    const forecasts=calculateGoalForecasts();
    actual = forecasts[g.race || 'ironman'] || 0;
    pct = actual && target ? Math.min(120, (target/actual)*100) : 0;
    if(!actual) status='Mangler data';
    else if(actual <= target) status='Opfyldt';
    else if(actual <= target*1.05) status='Tæt på';
    else status='Bagud';
    actualDisplay = minToTime(actual);
    targetDisplay = minToTime(target);
  } else {
    const rows=rowsForGoal(g);
    if(g.type==='distance') actual=sum(rows,'actualKm');
    if(g.type==='hours') actual=sum(rows,'actualMinutes')/60;
    if(g.type==='sessions') actual=rows.length;
    pct = target ? Math.min(120, (actual/target)*100) : 0;
    if(actual<=0) status='Mangler data';
    else if(actual>=target) status='Opfyldt';
    else if(actual>=target*.85) status='Tæt på';
    else status='På vej';
    actualDisplay = formatGoalValue(g, actual);
    targetDisplay = formatGoalValue(g, target);
  }
  return {actual,target,pct,status,actualDisplay,targetDisplay};
}
function renderGoals(){
  if(!state.goals) state.goals=defaultGoals;
  const tbody=document.querySelector('#goalsTable tbody');
  if(!tbody) return;
  tbody.innerHTML = state.goals.map(g=>{
    const e=evaluateGoal(g);
    const period = g.type==='raceTime'
      ? (g.race==='marathon'?'Copenhagen Marathon':g.race==='koege'?'Køge Jernmand':'IRONMAN Copenhagen')
      : `${g.start?dkDate(g.start):'Start'} → ${g.end?dkDate(g.end):'Nu'}`;
    const pct = Math.round(e.pct || 0);
    const pctBar = Math.min(100, Math.max(0, e.pct || 0));
    return `<tr>
      <td class="goal-name-cell"><strong>${g.name}</strong><br><small>${g.discipline||'Alle'}</small></td>
      <td>${goalTypeLabel(g.type)}</td>
      <td>${period}</td>
      <td><span class="goal-status ${e.status.replaceAll(' ','-')}">${e.status}</span></td>
      <td>${e.actualDisplay || formatGoalValue(g,e.actual)}</td>
      <td>${e.targetDisplay || formatGoalValue(g,e.target)}</td>
      <td class="goal-progress-cell"><div class="progress-wrap"><div class="progress-bar" style="width:${pctBar}%"></div></div><small>${pct}%</small></td>
      <td class="goal-actions"><button class="secondary mini" onclick="editGoal('${g.id}')">Redigér</button> <button class="danger mini" onclick="deleteGoal('${g.id}')">Slet</button></td>
    </tr>`;
  }).join('');
}
function drawGoalsChart(){ return; }
function clearGoalForm(){
  const f=id=>document.getElementById(id);
  if(!f('goalId')) return;
  f('goalId').value='';
  f('goalName').value='';
  f('goalType').value='distance';
  f('goalDiscipline').value='Alle';
  f('goalRace').value='ironman';
  f('goalStart').value=todayIso();
  f('goalEnd').value='';
  if(f('goalDistanceKm')) f('goalDistanceKm').value='';
  f('goalTarget').value='';
  f('goalUnit').value='km';
  updateGoalUnitFromType();
}
function saveGoal(e){
  e.preventDefault();
  const f=id=>document.getElementById(id);
  if(!state.goals) state.goals=[];
  const type=f('goalType').value;
  const unit=f('goalUnit').value;
  let targetRaw = f('goalTarget').value;
  let target = Number(String(targetRaw).replace(',','.')) || 0;
  if((type==='raceTime' && unit==='time') || String(targetRaw).includes(':')) target=timeStringToMinutes(targetRaw);
  const goal={
    id:f('goalId').value || `goal_${Date.now()}`,
    name:f('goalName').value.trim(),
    type,
    discipline:f('goalDiscipline').value,
    race:f('goalRace').value,
    start:f('goalStart').value,
    end:f('goalEnd').value,
    target,
    unit
  };
  if(type==='DistanceTime'){
    goal.distanceKm = Number(String(f('goalDistanceKm')?.value || 0).replace(',','.')) || 0;
    goal.unit = 'min';
    goal.discipline = f('goalDiscipline').value || 'Løb';
  }
  const idx=state.goals.findIndex(g=>g.id===goal.id);
  if(idx>=0) state.goals[idx]=goal; else state.goals.push(goal);
  save(); clearGoalForm(); renderAll();
}
window.editGoal=(id)=>{
  const g=(state.goals||[]).find(x=>x.id===id); if(!g) return;
  const f=id=>document.getElementById(id);
  f('goalId').value=g.id;
  f('goalName').value=g.name;
  f('goalType').value=g.type;
  f('goalDiscipline').value=g.discipline||'Alle';
  f('goalRace').value=g.race||'ironman';
  f('goalStart').value=g.start||'';
  f('goalEnd').value=g.end||'';
  if(f('goalDistanceKm')) f('goalDistanceKm').value=g.distanceKm||'';
  f('goalUnit').value=g.unit||'km';
  f('goalTarget').value=(g.type==='raceTime')?minToTime(g.target):g.target;
  updateGoalUnitFromType();
  document.querySelector('[data-tab="goals"]').click();
};
window.deleteGoal=(id)=>{
  const g=(state.goals||[]).find(x=>x.id===id); if(!g) return;
  if(!confirm(`Vil du slette målet “${g.name}”?`)) return;
  state.goals=state.goals.filter(x=>x.id!==id); save(); renderAll();
};
function updateGoalUnitFromType(){
  const type=document.getElementById('goalType')?.value;
  const unit=document.getElementById('goalUnit');
  const raceField=document.querySelector('.race-field');
  const dtField=document.querySelector('.distance-time-field');
  const targetLabel=document.getElementById('goalTargetLabel');
  const targetInput=document.getElementById('goalTarget');
  if(!unit) return;

  if(raceField) raceField.style.display = type==='raceTime' ? '' : 'none';
  if(dtField) dtField.style.display = type==='DistanceTime' ? '' : 'none';

  if(type==='distance'){
    unit.value='km';
    if(targetLabel) targetLabel.firstChild.textContent='Måldistance ';
    if(targetInput) targetInput.placeholder='Fx 100';
  }
  if(type==='hours'){
    unit.value='hours';
    if(targetLabel) targetLabel.firstChild.textContent='Måltimer ';
    if(targetInput) targetInput.placeholder='Fx 10';
  }
  if(type==='sessions'){
    unit.value='sessions';
    if(targetLabel) targetLabel.firstChild.textContent='Antal pas ';
    if(targetInput) targetInput.placeholder='Fx 20';
  }
  if(type==='raceTime'){
    unit.value='time';
    if(targetLabel) targetLabel.firstChild.textContent='Måltid ';
    if(targetInput) targetInput.placeholder='Fx 12:00 eller 720';
  }
  if(type==='DistanceTime'){
    unit.value='min';
    if(targetLabel) targetLabel.firstChild.textContent='Måltid ';
    if(targetInput) targetInput.placeholder='Fx 30';
    const disc=document.getElementById('goalDiscipline');
    if(disc && disc.value==='Alle') disc.value='Løb';
  }
}

function renderAll(){ renderTabs(); renderDashboard(); renderGoalForecasts(); renderProgram(); renderMonthly(); renderGoals(); renderEquipment(); renderTechnique(); fillEquipmentSelects();  setupPrintWeek(); }
function renderTabs(){ document.querySelectorAll('.tab').forEach(btn=>btn.onclick=()=>{document.querySelectorAll('.tab,.panel').forEach(x=>x.classList.remove('active'));btn.classList.add('active');document.getElementById(btn.dataset.tab).classList.add('active');}); }
function sum(arr, field){ return arr.reduce((a,b)=>a+(Number(b[field])||0),0); }

function round1(v){ return Math.round((Number(v)||0)*10)/10; }
function parseNum(v){ return Number(String(v ?? '').replace(',', '.')) || 0; }
function ensureBasePlanValues(){
  state.workouts.forEach(w=>{
    if(w.basePlanMinutes === undefined || w.basePlanMinutes === null || w.basePlanMinutes === '') w.basePlanMinutes = parseNum(w.planMinutes);
    if(w.basePlanKm === undefined || w.basePlanKm === null || w.basePlanKm === '') w.basePlanKm = parseNum(w.planKm);
  });
}
function recentCompletionForDiscipline(discipline, days=21){
  const from = addDaysIso(todayIso(), -days);
  const rows = state.workouts.filter(w=>w.discipline===discipline && w.date>=from && w.date<todayIso() && (parseNum(w.basePlanMinutes ?? w.planMinutes)>0 || parseNum(w.basePlanKm ?? w.planKm)>0));
  const plannedMin = rows.reduce((a,w)=>a + parseNum(w.basePlanMinutes ?? w.planMinutes), 0);
  const actualMin = rows.reduce((a,w)=>a + parseNum(w.actualMinutes), 0);
  const plannedKm = rows.reduce((a,w)=>a + parseNum(w.basePlanKm ?? w.planKm), 0);
  const actualKm = rows.reduce((a,w)=>a + parseNum(w.actualKm), 0);
  const missed = rows.filter(w=>['Sprunget over','Skadet/syg'].includes(w.status)).length;
  const partial = rows.filter(w=>w.status==='Delvist gennemført').length;
  const completion = plannedMin > 0 ? actualMin / plannedMin : (plannedKm > 0 ? actualKm / plannedKm : 1);
  let factor = 1;
  if(rows.length){
    if(completion < 0.40 || missed >= 3) factor = 0.75;
    else if(completion < 0.60 || missed >= 2) factor = 0.85;
    else if(completion < 0.80 || missed >= 1 || partial >= 2) factor = 0.92;
    else if(completion > 1.05 && missed === 0) factor = 1.03;
  }
  return {rows:rows.length, completion, completionPct:Math.round(completion*100), missed, partial, factor};
}
function autoRecalculateFuturePlan(source='auto'){
  ensureBasePlanValues();
  const today = todayIso();
  const until = addDaysIso(today, 14);
  const factors = {
    'Løb': recentCompletionForDiscipline('Løb', 21),
    'Cykling': recentCompletionForDiscipline('Cykling', 21),
    'Svøm': recentCompletionForDiscipline('Svøm', 21)
  };
  const minMinutes = {'Løb':20,'Cykling':40,'Svøm':15};
  const minKm = {'Løb':3,'Cykling':15,'Svøm':0.5};
  let changed = 0;
  const touched = new Set();
  state.workouts.forEach(w=>{
    if(w.date < today || w.date > until) return;
    if(!['Løb','Cykling','Svøm'].includes(w.discipline)) return;
    if(w.status && w.status !== 'Planlagt') return;
    const baseMin = parseNum(w.basePlanMinutes ?? w.planMinutes);
    const baseKm = parseNum(w.basePlanKm ?? w.planKm);
    if(baseMin <= 0 && baseKm <= 0) return;
    const f = factors[w.discipline]?.factor || 1;
    const newMin = baseMin ? Math.max(minMinutes[w.discipline], Math.round(baseMin * f)) : 0;
    const newKm = baseKm ? Math.max(minKm[w.discipline], round1(baseKm * f)) : 0;
    const prevMin = parseNum(w.planMinutes);
    const prevKm = parseNum(w.planKm);
    let changedThis = false;
    if(baseMin && prevMin !== newMin){ w.planMinutes = newMin; changedThis = true; }
    if(baseKm && prevKm !== newKm){ w.planKm = newKm; changedThis = true; }
    if(changedThis){
      const info = factors[w.discipline];
      const msg = `Autojusteret ${today} (${source}): ${w.discipline} ${Math.round(f*100)}% på baggrund af seneste 21 dages gennemførsel (${info.completionPct}%).`;
      if(!String(w.notes||'').includes('Autojusteret')){
        w.notes = w.notes ? `${w.notes} | ${msg}` : msg;
      } else {
        w.notes = String(w.notes).replace(/Autojusteret[^|\n]*/g, msg);
      }
      changed++;
      touched.add(w.discipline);
    }
  });
  state.autoPlan = { lastRunAt:new Date().toISOString(), source, factors };
  save();
  return {
    changed,
    touched:[...touched],
    factors,
    message: changed ? `Plan autojusteret for næste 14 dage (${[...touched].join(', ')}).` : 'Ingen automatisk planjustering nødvendig lige nu.'
  };
}

function renderDashboard(){
  const w=state.workouts, done=w.filter(x=>x.status==='Gennemført'||x.status==='Delvist gennemført');
  const planH=sum(w,'planMinutes')/60, actualH=sum(w,'actualMinutes')/60;
  const prog = calculateSub12Forecast();
  document.getElementById('topStats').innerHTML = [
    ['Planlagte timer', planH.toFixed(1)], ['Faktiske timer', actualH.toFixed(1)], ['Gennemført', planH?Math.round(actualH/planH*100)+'%':'0%'], ['Sub-12 status', prog.status]
  ].map(([l,v])=>`<div class="stat"><div class="label">${l}</div><div class="value">${v}</div></div>`).join('');
  const sub12Box=document.getElementById('sub12Forecast');
  if(sub12Box){ sub12Box.innerHTML = renderSub12Forecast(prog); }
  const upcoming=w.filter(x=>x.date>=todayIso()).slice(0,24);
  document.getElementById('upcomingList').innerHTML=upcoming.map(x=>{
    const hasActual = Number(x.actualMinutes)>0 || Number(x.actualKm)>0;
    const mainLine = hasActual
      ? `Faktisk: ${x.actualMinutes||0} min · ${x.actualKm||0} km${workoutHrText(x) ? ' · '+workoutHrText(x) : ''}`
      : `Plan: ${x.planMinutes} min · ${x.planKm} km`;
    const subLine = hasActual && (Number(x.planMinutes)>0 || Number(x.planKm)>0)
      ? `<br><small>Plan: ${x.planMinutes} min · ${x.planKm} km</small>`
      : '';
    return `<div class="workout-item"><div>${dkDate(x.date)}<br><small>${x.day}</small></div><div><strong>${x.title}</strong><br><small>${x.intensity} · ${mainLine}</small>${subLine}</div><span class="badge ${x.discipline}">${x.discipline}</span></div>`;
  }).join('');
  drawChart();
}
function drawChart(){
  const c=document.getElementById('disciplineChart'), ctx=c.getContext('2d'); ctx.clearRect(0,0,c.width,c.height);
  const data=['Svøm','Cykling','Løb'].map(d=>({d,km:sum(state.workouts.filter(x=>x.discipline===d),'planKm')}));
  const max=Math.max(...data.map(x=>x.km));
  ctx.font='18px system-ui'; ctx.fillText('Planlagt distance pr. disciplin',20,30);
  data.forEach((x,i)=>{const y=80+i*80, bar=(x.km/max)*560; ctx.fillRect(150,y,bar,38); ctx.fillText(x.d,20,y+26); ctx.fillText(x.km.toFixed(0)+' km',160+bar,y+26);});
}
function renderProgram(){
  const from=document.getElementById('fromDate').value || '1900-01-01';
  const to=document.getElementById('toDate').value || '2999-12-31';
  const disc=document.getElementById('disciplineFilter').value;
  const rows=state.workouts.filter(x=>x.date>=from && x.date<=to && (disc==='Alle'||x.discipline===disc));
  document.querySelector('#programTable tbody').innerHTML = rows.map(x=>`<tr data-id="${x.id}" class="${statusClass(x.status)} ${x.date===todayIso()?'today':''}"><td>${dkDate(x.date)}</td><td>${x.day}</td><td>${x.week}</td><td>${x.discipline}</td><td>${x.title}</td><td>${x.intensity}</td><td>${x.planMinutes}</td><td>${x.planKm}</td><td>${x.actualMinutes||''}</td><td>${x.actualKm||''}</td><td>${x.avgHr||''}</td><td>${x.maxHr||''}</td><td>${x.status}</td><td>${x.rpe||''}</td><td>${x.equipment||''}</td><td>${x.notes||''}</td></tr>`).join('');
  document.querySelectorAll('#programTable tbody tr').forEach(tr=>tr.onclick=()=>openEdit(tr.dataset.id));
}
function statusClass(s){ if(s==='Gennemført')return 'status-Gennemført'; if(s==='Delvist gennemført')return 'status-Delvist'; if(s==='Sprunget over')return 'status-Sprunget'; if(s==='Skadet/syg')return 'status-Skadet'; return ''; }
function renderMonthly(){
  const map={}; state.workouts.forEach(w=>{const m=monthKey(w.date); map[m]??=[]; map[m].push(w);});
  document.querySelector('#monthlyTable tbody').innerHTML = Object.keys(map).sort().map(m=>{
    const a=map[m], ph=sum(a,'planMinutes')/60, ah=sum(a,'actualMinutes')/60, pct=ph?ah/ph:0;
    const swim=sum(a.filter(x=>x.discipline==='Svøm'),'actualKm'), bike=sum(a.filter(x=>x.discipline==='Cykling'),'actualKm'), run=sum(a.filter(x=>x.discipline==='Løb'),'actualKm');
    let status='Afventer data', sug='Indtast faktisk træning den 15. i måneden.';
    if(ah>0){ if(pct<.75){status='For lav belastning'; sug='Gentag eller reducer næste blok, især løb.';} else if(pct>1.15){status='For høj belastning'; sug='Hold øje med restitution og ømhed.';} else {status='OK'; sug='Fortsæt planlagt progression.';} }
    return `<tr><td>${m}</td><td>${ph.toFixed(1)}</td><td>${ah.toFixed(1)}</td><td>${Math.round(pct*100)}%</td><td>${swim.toFixed(1)}</td><td>${bike.toFixed(1)}</td><td>${run.toFixed(1)}</td><td>${status}</td><td>${sug}</td></tr>`;
  }).join('');
}
function renderEquipment(){
  const tbody=document.querySelector('#equipmentTable tbody');
  if(!tbody) return;
  tbody.innerHTML='';
  state.equipment.forEach((eq,idx)=>{
    const related=state.workouts.filter(w=>w.equipment===eq.name);
    const tr=document.createElement('tr');
    tr.innerHTML=`<td>${eq.name}</td><td>${eq.type}</td><td>${related.length}</td><td>${sum(related,'actualKm').toFixed(1)}</td><td>${(sum(related,'actualMinutes')/60).toFixed(1)}</td>
    <td class="equipment-actions">
      <button class="secondary mini" onclick="openEquipmentEdit(${idx})">Rediger</button>
      <button class="danger mini" onclick="deleteEquipment('${eq.name.replaceAll("'","\\'")}')">Slet</button>
    </td>`;
    tbody.appendChild(tr);
  });
}
function fillEquipmentSelects(){
  const options='<option value=""></option>'+state.equipment.map(e=>`<option>${e.name}</option>`).join('');
  const sel=document.getElementById('equipmentSelect');
  if(sel) sel.innerHTML=options;
  const manualSel=document.getElementById('manualEquipmentSelect');
  if(manualSel) manualSel.innerHTML=options;
}


function openManualWorkout(){
  fillEquipmentSelects();
  document.getElementById('manualDate').value = todayIso();
  document.getElementById('manualDiscipline').value = 'Løb';
  document.getElementById('manualTitle').value = '';
  document.getElementById('manualIntensity').value = 'Roligt / RPE 3-4';
  document.getElementById('manualActualMinutes').value = '';
  document.getElementById('manualActualKm').value = '';
  document.getElementById('manualStatus').value = 'Gennemført';
  document.getElementById('manualRpe').value = '';
  const mah=document.getElementById('manualAvgHr'); if(mah) mah.value='';
  const mmh=document.getElementById('manualMaxHr'); if(mmh) mmh.value='';
  document.getElementById('manualEquipmentSelect').value = '';
  document.getElementById('manualNotes').value = '';
  document.getElementById('manualWorkoutDialog').showModal();
}

function saveManualWorkout(e){
  e.preventDefault();
  const date = document.getElementById('manualDate').value;
  const discipline = document.getElementById('manualDiscipline').value;
  const title = document.getElementById('manualTitle').value.trim() || 'Manuel træning';
  if(!date){ alert('Vælg en dato.'); return; }
  const id = `${date}_${discipline}_manuel_${Date.now()}`;
  state.workouts.push({
    id,
    date,
    day: dayName(date),
    week: weekNo(date),
    discipline,
    title,
    intensity: document.getElementById('manualIntensity').value.trim() || 'Manuelt indtastet',
    planMinutes: 0,
    planKm: 0,
    actualMinutes: document.getElementById('manualActualMinutes').value,
    actualKm: document.getElementById('manualActualKm').value,
    avgHr: document.getElementById('manualAvgHr') ? document.getElementById('manualAvgHr').value : '',
    maxHr: document.getElementById('manualMaxHr') ? document.getElementById('manualMaxHr').value : '',
    status: document.getElementById('manualStatus').value,
    rpe: document.getElementById('manualRpe').value,
    equipment: document.getElementById('manualEquipmentSelect').value,
    notes: document.getElementById('manualNotes').value ? 'Manuelt oprettet: '+document.getElementById('manualNotes').value : 'Manuelt oprettet'
  });
  state.workouts.sort((a,b)=>a.date.localeCompare(b.date) || String(a.discipline).localeCompare(String(b.discipline)) || String(a.title).localeCompare(String(b.title)));
  const adj = autoRecalculateFuturePlan('manuel træning');
  document.getElementById('manualWorkoutDialog').close();
  renderAll();
  alert('Manuel træning gemt. ' + adj.message);
}

function openEdit(id){
  const w=state.workouts.find(x=>x.id===id); if(!w)return;
  fillEquipmentSelects();
  document.getElementById('editId').value=id;
  document.getElementById('editTitle').textContent=`${dkDate(w.date)} · ${w.title}`;
  document.getElementById('actualMinutes').value=w.actualMinutes||'';
  document.getElementById('actualKm').value=w.actualKm||'';
  document.getElementById('statusInput').value=w.status||'Planlagt';
  document.getElementById('rpeInput').value=w.rpe||'';
  const avgEl=document.getElementById('avgHrInput'); if(avgEl) avgEl.value=w.avgHr||'';
  const maxEl=document.getElementById('maxHrInput'); if(maxEl) maxEl.value=w.maxHr||'';
  document.getElementById('equipmentSelect').value=w.equipment||'';
  document.getElementById('notesInput').value=w.notes||'';
  document.getElementById('editDialog').showModal();
}
document.getElementById('saveWorkoutBtn').onclick=(e)=>{e.preventDefault(); const id=document.getElementById('editId').value; const w=state.workouts.find(x=>x.id===id); if(!w)return; w.actualMinutes=document.getElementById('actualMinutes').value; w.actualKm=document.getElementById('actualKm').value; w.status=document.getElementById('statusInput').value; w.rpe=document.getElementById('rpeInput').value; if(document.getElementById('avgHrInput')) w.avgHr=document.getElementById('avgHrInput').value; if(document.getElementById('maxHrInput')) w.maxHr=document.getElementById('maxHrInput').value; w.equipment=document.getElementById('equipmentSelect').value; w.notes=document.getElementById('notesInput').value; const adj = autoRecalculateFuturePlan('redigeret træning'); document.getElementById('editDialog').close(); renderAll(); if(adj.changed){ alert(adj.message); }};
const deleteWorkoutBtn=document.getElementById('deleteWorkoutBtn');
if(deleteWorkoutBtn){ deleteWorkoutBtn.onclick=()=>{ const id=document.getElementById('editId').value; const w=state.workouts.find(x=>x.id===id); if(!w) return; const ok=confirm(`Vil du slette denne træning?\n\n${dkDate(w.date)} · ${w.discipline} · ${w.title}\n\nDette sletter kun denne ene træning.`); if(!ok) return; state.workouts=state.workouts.filter(x=>x.id!==id); save(); document.getElementById('editDialog').close(); renderAll(); }; }
document.getElementById('equipmentForm').onsubmit=(e)=>{e.preventDefault(); const name=document.getElementById('equipmentName').value.trim(); if(!name)return; state.equipment.push({name,type:document.getElementById('equipmentType').value}); document.getElementById('equipmentName').value=''; save(); renderAll();};
window.deleteEquipment=(name)=>{ state.equipment=state.equipment.filter(e=>e.name!==name); save(); renderAll(); };
['fromDate','toDate','disciplineFilter'].forEach(id=>document.getElementById(id).onchange=renderProgram);
const goalForm=document.getElementById('goalForm');
if(goalForm){ goalForm.onsubmit=saveGoal; }
const clearGoalFormBtn=document.getElementById('clearGoalFormBtn');
if(clearGoalFormBtn){ clearGoalFormBtn.onclick=clearGoalForm; }
const goalType=document.getElementById('goalType');
if(goalType){ goalType.onchange=updateGoalUnitFromType; }

document.getElementById('clearFiltersBtn').onclick=()=>{document.getElementById('fromDate').value='';document.getElementById('toDate').value='';document.getElementById('disciplineFilter').value='Alle';renderProgram();};
const backupMenuBtn=document.getElementById('backupMenuBtn');
if(backupMenuBtn){ backupMenuBtn.onclick=()=>document.getElementById('backupDialog').showModal(); }
document.getElementById('exportJsonBtn').onclick=()=>{download('triathlon-backup.json', JSON.stringify(state,null,2), 'application/json'); const d=document.getElementById('backupDialog'); if(d && d.open) d.close();};
document.getElementById('exportCsvBtn').onclick=()=>download('triathlon-program.csv', toCsv(state.workouts), 'text/csv;charset=utf-8');
document.getElementById('importJsonInput').onchange=(e)=>{const file=e.target.files[0]; if(!file)return; const r=new FileReader(); r.onload=()=>{try{state=JSON.parse(r.result); save(); renderAll(); const d=document.getElementById('backupDialog'); if(d && d.open) d.close(); alert('Backup importeret');}catch(err){alert('Kunne ikke læse filen');} finally { e.target.value=''; }}; r.readAsText(file);};

const manualWorkoutBtn=document.getElementById('manualWorkoutBtn');
if(manualWorkoutBtn){ manualWorkoutBtn.onclick=openManualWorkout; }
const saveManualWorkoutBtn=document.getElementById('saveManualWorkoutBtn');
if(saveManualWorkoutBtn){ saveManualWorkoutBtn.onclick=saveManualWorkout; }

function download(name,content,type){const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([content],{type})); a.download=name; a.click(); URL.revokeObjectURL(a.href);}
function toCsv(rows){const headers=['date','day','week','discipline','title','intensity','planMinutes','planKm','actualMinutes','actualKm','avgHr','maxHr','status','rpe','equipment','notes']; return headers.join(';')+'\n'+rows.map(r=>headers.map(h=>`"${String(r[h]??'').replaceAll('"','""')}"`).join(';')).join('\n');}
renderAll();


// --- AI update / recalculation handoff ---
function getSummaryForAi(fromDate){
  const past = state.workouts.filter(w => w.date < fromDate);
  const future = state.workouts.filter(w => w.date >= fromDate);
  const plannedPastH = sum(past,'planMinutes')/60;
  const actualPastH = sum(past,'actualMinutes')/60;
  const byDisc = ['Svøm','Cykling','Løb','Styrke','Race','Restitution'].map(d=>{
    const rows=past.filter(w=>w.discipline===d);
    return {
      discipline:d,
      plannedHours: +(sum(rows,'planMinutes')/60).toFixed(1),
      actualHours: +(sum(rows,'actualMinutes')/60).toFixed(1),
      plannedKm: +sum(rows,'planKm').toFixed(1),
      actualKm: +sum(rows,'actualKm').toFixed(1),
      missed: rows.filter(w=>w.status==='Sprunget over').length,
      partial: rows.filter(w=>w.status==='Delvist gennemført').length,
      sick: rows.filter(w=>w.status==='Skadet/syg').length
    };
  });
  const missedOrProblem = past.filter(w => ['Sprunget over','Skadet/syg','Delvist gennemført'].includes(w.status)).slice(-40);
  return {
    generatedAt: new Date().toISOString(),
    recalculateFrom: fromDate,
    races: {
      copenhagenMarathon:'2027-05-09',
      koegeJernmand:'2027-06-13',
      ironmanCopenhagen:'2027-08-22'
    },
    constraints: {
      goal:'A-mål: IRONMAN Copenhagen under 12 timer. B-mål: 12:00-12:30. C-mål: gennemføre sikkert og uden skade.',
      swim:'Mandag/onsdag/fredag morgen. Starter ved 700 m og bygger til maks 1,5 km pr. pas',
      bike:'Cykling tirsdag, torsdag og søndag. Fra oktober til ca. midt/slut marts køres cykling på hometrainer',
      weekend:'Fredag eftermiddag og lørdag fri. Søndag er fast cykeldag. Løbets hovedpas ligger onsdag.',
      run:'Starter næsten fra scratch, men kan løbe ca. 5 km med lidt gang',
      strength:'Styrke i træningscenter'
    },
    completion: {
      plannedPastHours:+plannedPastH.toFixed(1),
      actualPastHours:+actualPastH.toFixed(1),
      completionPct: plannedPastH ? Math.round(actualPastH/plannedPastH*100) : 0
    },
    byDiscipline: byDisc,
    recentIssues: missedOrProblem.map(w=>({date:w.date, week:w.week, discipline:w.discipline, title:w.title, planMinutes:w.planMinutes, planKm:w.planKm, actualMinutes:w.actualMinutes, actualKm:w.actualKm, status:w.status, rpe:w.rpe, avgHr:w.avgHr, maxHr:w.maxHr, notes:w.notes})) ,
    customGoals: (state.goals||[]).map(g=>({...g, evaluation:evaluateGoal(g)})),
    futurePreview: future.slice(0,60).map(w=>({date:w.date, week:w.week, discipline:w.discipline, title:w.title, planMinutes:w.planMinutes, planKm:w.planKm, intensity:w.intensity}))
  };
}
function buildAiPrompt(){
  const from = document.getElementById('recalcFromDate').value || todayIso();
  const extra = document.getElementById('aiExtraMessage').value.trim();
  const summary = getSummaryForAi(from);
  return `Jeg bruger min triathlon-app og vil have dig til at genberegne resten af træningsplanen fra ${from}.

Mine mål er:
1. Copenhagen Marathon den 9. maj 2027
2. Køge Jernmand 1/2 Ironman den 13. juni 2027
3. IRONMAN Copenhagen den 22. august 2027

Vigtige faste rammer:
- A-målet er IRONMAN Copenhagen under 12 timer. B-mål 12:00-12:30. C-mål gennemføre sikkert og uden skade.
- Svøm mandag/onsdag/fredag morgen. Starter ved 700 m og bygger til maks. 1,5 km pr. pas.
- Cykling tirsdag, torsdag og søndag.
- Fra oktober til ca. midt/slut marts er cykling hometrainer indendørs.
- Fredag eftermiddag og lørdag er fri/restitution.
- Søndag er fast cykeldag. Løbets hovedpas ligger onsdag.
- Jeg starter næsten fra scratch, men kan løbe ca. 5 km med lidt gang.
- FTP er 186 W.

${extra ? 'Min ekstra besked: '+extra+'\n\n' : ''}Jeg vedhæfter/indsætter en opdateringspakke fra appen med planlagt og faktisk træning. Gennemgå den og lav en justeret plan fra ${from}, så progressionen stadig er sikker, især for løb. Bevar samme struktur og lav konkrete ændringer til de kommende uger.

Kort opsummering fra appen:
${JSON.stringify(summary,null,2)}`;
}
function openAiUpdate(){
  document.getElementById('recalcFromDate').value = todayIso();
  document.getElementById('aiPromptOutput').value = buildAiPrompt();
  document.getElementById('aiUpdateDialog').showModal();
}
function downloadAiPackage(){
  const from = document.getElementById('recalcFromDate').value || todayIso();
  const pack = {summary:getSummaryForAi(from), fullState:state};
  download(`triathlon-ai-update-${from}.json`, JSON.stringify(pack,null,2), 'application/json');
}
const aiBtn=document.getElementById('aiUpdateBtn');
if(aiBtn){ aiBtn.onclick=openAiUpdate; }
const buildAi=document.getElementById('buildAiPromptBtn');
if(buildAi){ buildAi.onclick=()=>{document.getElementById('aiPromptOutput').value=buildAiPrompt();}; }
const copyAi=document.getElementById('copyAiPromptBtn');
if(copyAi){ copyAi.onclick=async()=>{document.getElementById('aiPromptOutput').value=buildAiPrompt(); try{await navigator.clipboard.writeText(document.getElementById('aiPromptOutput').value); alert('Prompt kopieret');}catch(e){document.getElementById('aiPromptOutput').select(); document.execCommand('copy'); alert('Prompt kopieret');}}; }
const dlAi=document.getElementById('downloadAiPackageBtn');
if(dlAi){ dlAi.onclick=downloadAiPackage; }
const openCg=document.getElementById('openChatGptBtn');
if(openCg){ openCg.onclick=()=>{window.open('https://chatgpt.com/','_blank');}; }

// --- FIT import ---
let pendingFitImport = null;
const FIT_EPOCH_MS = Date.UTC(1989,11,31,0,0,0);
const BASE_TYPE_INFO = {
  0x00:{name:'enum', size:1, read:(dv,o)=>dv.getUint8(o)},
  0x01:{name:'sint8', size:1, read:(dv,o)=>dv.getInt8(o)},
  0x02:{name:'uint8', size:1, read:(dv,o)=>dv.getUint8(o)},
  0x83:{name:'sint16', size:2, read:(dv,o,l)=>dv.getInt16(o,l)},
  0x84:{name:'uint16', size:2, read:(dv,o,l)=>dv.getUint16(o,l)},
  0x85:{name:'sint32', size:4, read:(dv,o,l)=>dv.getInt32(o,l)},
  0x86:{name:'uint32', size:4, read:(dv,o,l)=>dv.getUint32(o,l)},
  0x07:{name:'string', size:1, read:null},
  0x88:{name:'float32', size:4, read:(dv,o,l)=>dv.getFloat32(o,l)},
  0x89:{name:'float64', size:8, read:(dv,o,l)=>dv.getFloat64(o,l)},
  0x0A:{name:'uint8z', size:1, read:(dv,o)=>dv.getUint8(o)},
  0x8B:{name:'uint16z', size:2, read:(dv,o,l)=>dv.getUint16(o,l)},
  0x8C:{name:'uint32z', size:4, read:(dv,o,l)=>dv.getUint32(o,l)},
  0x0D:{name:'byte', size:1, read:(dv,o)=>dv.getUint8(o)},
  0x8E:{name:'sint64', size:8, read:null},
  0x8F:{name:'uint64', size:8, read:null},
  0x90:{name:'uint64z', size:8, read:null}
};
function fitTimestampToIso(seconds){
  if(!Number.isFinite(seconds) || seconds<=0) return '';
  return new Date(FIT_EPOCH_MS + seconds*1000).toISOString().slice(0,10);
}
function fitSportToDiscipline(sport){
  const n = Number(sport);
  if(n===1) return 'Løb';
  if(n===2) return 'Cykling';
  if(n===5) return 'Svøm';
  return 'Andet';
}
function readFitFieldValue(dv, offset, size, baseType, littleEndian){
  const info = BASE_TYPE_INFO[baseType];
  if(!info) return null;
  if(info.name==='string'){
    let s='';
    for(let i=0;i<size;i++){ const c=dv.getUint8(offset+i); if(c===0) break; s+=String.fromCharCode(c); }
    return s;
  }
  if(!info.read){ return null; }
  if(size===info.size) return info.read(dv, offset, littleEndian);
  const count = Math.floor(size/info.size);
  const arr=[];
  for(let i=0;i<count;i++) arr.push(info.read(dv, offset+i*info.size, littleEndian));
  return arr.length===1 ? arr[0] : arr;
}
function parseFitArrayBuffer(buffer){
  const dv = new DataView(buffer);
  const headerSize = dv.getUint8(0);
  if(headerSize < 12) throw new Error('Ugyldig FIT-header');
  const dataSize = dv.getUint32(4, true);
  const proto = String.fromCharCode(dv.getUint8(8),dv.getUint8(9),dv.getUint8(10),dv.getUint8(11));
  if(proto !== '.FIT') throw new Error('Filen ligner ikke en FIT-fil');
  const end = Math.min(headerSize + dataSize, buffer.byteLength);
  const defs = {};
  const sessions=[];
  const laps=[];
  const records=[];
  const activities=[];
  let lastTimestamp = null;
  let pos = headerSize;
  while(pos < end){
    const header = dv.getUint8(pos++);
    if(header & 0x80){
      const local = (header >> 5) & 0x03;
      const timeOffset = header & 0x1F;
      const def = defs[local];
      if(!def) continue;
      const item = {global:def.global, fields:{}};
      if(lastTimestamp !== null){ lastTimestamp = (lastTimestamp & ~0x1F) + timeOffset; item.fields[253]=lastTimestamp; }
      for(const f of def.fields){ item.fields[f.num]=readFitFieldValue(dv,pos,f.size,f.base,def.le); pos += f.size; }
      collectFitMessage(item, sessions, laps, records, activities);
      continue;
    }
    const local = header & 0x0F;
    const isDefinition = (header & 0x40) !== 0;
    if(isDefinition){
      pos++; // reserved
      const arch = dv.getUint8(pos++);
      const le = arch === 0;
      const global = dv.getUint16(pos, le); pos += 2;
      const nFields = dv.getUint8(pos++);
      const fields=[];
      for(let i=0;i<nFields;i++){
        const num=dv.getUint8(pos++), size=dv.getUint8(pos++), base=dv.getUint8(pos++);
        fields.push({num,size,base});
      }
      defs[local] = {global, le, fields};
    } else {
      const def = defs[local];
      if(!def) throw new Error('FIT-data uden definition');
      const item = {global:def.global, fields:{}};
      for(const f of def.fields){ item.fields[f.num]=readFitFieldValue(dv,pos,f.size,f.base,def.le); pos += f.size; }
      if(item.fields[253]) lastTimestamp = Number(item.fields[253]);
      collectFitMessage(item, sessions, laps, records, activities);
    }
  }
  return summarizeFit(sessions,laps,records,activities);
}
function collectFitMessage(msg, sessions, laps, records, activities){
  if(msg.global===18) sessions.push(msg.fields);
  else if(msg.global===19) laps.push(msg.fields);
  else if(msg.global===20) records.push(msg.fields);
  else if(msg.global===34) activities.push(msg.fields);
}
function firstNumeric(rows, field){
  for(const r of rows){ const v=r[field]; if(typeof v==='number' && Number.isFinite(v) && v>0) return v; }
  return null;
}
function maxTimestamp(rows){
  let m=null; rows.forEach(r=>{ const v=Number(r[253]); if(Number.isFinite(v) && (!m || v>m)) m=v; }); return m;
}
function summarizeFit(sessions,laps,records,activities){
  const src = sessions.length ? sessions : laps;
  const timestamp = firstNumeric(sessions,253) || firstNumeric(activities,253) || maxTimestamp(records) || maxTimestamp(laps);
  const sport = firstNumeric(sessions,5) ?? firstNumeric(laps,5);
  let totalTimer = firstNumeric(src,7); // total_timer_time, seconds * 1000
  let totalElapsed = firstNumeric(src,8);
  let totalDistance = firstNumeric(src,9); // meters * 100
  let avgHr = firstNumeric(src,16) || firstNumeric(src,13);
  let maxHr = firstNumeric(src,17) || firstNumeric(src,14);
  const recordHrs = records.map(r=>Number(r[3])).filter(v=>Number.isFinite(v) && v>0);
  if(!avgHr && recordHrs.length) avgHr = avgNumbers(recordHrs);
  if(!maxHr && recordHrs.length) maxHr = maxNumbers(recordHrs);
  if(!totalDistance && records.length){
    const dist = records.map(r=>Number(r[5])).filter(v=>Number.isFinite(v));
    if(dist.length) totalDistance = Math.max(...dist);
  }
  if(!totalTimer && records.length){
    const times = records.map(r=>Number(r[253])).filter(v=>Number.isFinite(v));
    if(times.length>1) totalTimer = (Math.max(...times)-Math.min(...times))*1000;
  }
  const minutes = totalTimer ? Math.round((totalTimer/1000)/60) : (totalElapsed ? Math.round((totalElapsed/1000)/60) : 0);
  const km = totalDistance ? Math.round((totalDistance/100000)*100)/100 : 0;
  const date = fitTimestampToIso(timestamp) || todayIso();
  const discipline = fitSportToDiscipline(sport);
  return {date, discipline, minutes, km, avgHr: avgHr||'', maxHr: maxHr||'', sportRaw:sport, sessions:sessions.length, laps:laps.length, records:records.length};
}
function findBestWorkoutForFit(fit){
  const sameDate = state.workouts.filter(w=>w.date===fit.date);
  const sameDisc = sameDate.filter(w=>w.discipline===fit.discipline || (w.discipline==='Race' && ['Løb','Cykling','Svøm'].includes(fit.discipline)));
  const candidates = sameDisc.length ? sameDisc : sameDate;
  if(!candidates.length) return null;
  return candidates.find(w=>w.status==='Planlagt') || candidates[0];
}
function showFitImportResult(fit){
  const match = findBestWorkoutForFit(fit);
  pendingFitImport = {fit, matchId: match ? match.id : null};
  const html = `
    <table><tbody>
      <tr><th>Dato</th><td>${fit.date}</td></tr>
      <tr><th>Disciplin</th><td>${fit.discipline}${fit.sportRaw!==null && fit.sportRaw!==undefined ? ` <span class="hint">(sport ${fit.sportRaw})</span>`:''}</td></tr>
      <tr><th>Tid</th><td>${fit.minutes ? fit.minutes+' min' : 'Ikke fundet'}</td></tr>
      <tr><th>Distance</th><td>${fit.km ? fit.km.toFixed(2)+' km' : 'Ikke fundet'}</td></tr>
      <tr><th>Gns. puls</th><td>${fit.avgHr || 'Ikke fundet'}</td></tr>
      <tr><th>Maks puls</th><td>${fit.maxHr || 'Ikke fundet'}</td></tr>
      <tr><th>Match i planen</th><td>${match ? `${dkDate(match.date)} · ${match.discipline} · ${match.title}` : 'Ingen træning på samme dato. Appen opretter et importeret pas.'}</td></tr>
    </tbody></table>
    <p class="hint">FIT-læsning: ${fit.sessions} session(s), ${fit.laps} lap(s), ${fit.records} record(s).</p>`;
  document.getElementById('fitImportResult').innerHTML = html;
  document.getElementById('fitImportDialog').showModal();
}
function applyFitImport(){
  if(!pendingFitImport) return;
  const {fit, matchId} = pendingFitImport;
  if(matchId){
    const w = state.workouts.find(x=>x.id===matchId);
    if(w){
      if(fit.minutes) w.actualMinutes = fit.minutes;
      if(fit.km) w.actualKm = fit.km;
      if(fit.avgHr) w.avgHr = fit.avgHr;
      if(fit.maxHr) w.maxHr = fit.maxHr;
      w.status = 'Gennemført';
      w.notes = `${w.notes ? w.notes+'\n' : ''}Importeret fra FIT-fil${activityHrNote(fit)}`;
    }
  } else {
    const id = `${fit.date}_${fit.discipline}_FIT_import_${Date.now()}`;
    state.workouts.push({id,date:fit.date,day:dayName(fit.date),week:weekNo(fit.date),discipline:fit.discipline,title:'Importeret FIT-træning',intensity:'Importeret',planMinutes:0,planKm:0,actualMinutes:fit.minutes||'',actualKm:fit.km||'',avgHr:fit.avgHr||'',maxHr:fit.maxHr||'',status:'Gennemført',rpe:'',equipment:'',notes:`Importeret fra FIT-fil${activityHrNote(fit)}`});
    state.workouts.sort((a,b)=>a.date.localeCompare(b.date));
  }
  const adj = autoRecalculateFuturePlan('FIT-import');
  renderAll();
  document.getElementById('fitImportDialog').close();
  alert('FIT-træningen er lagt ind i planen. ' + adj.message);
}
const fitInput = document.getElementById('fitFileInput');
if(fitInput){
  fitInput.onchange = (e)=>{
    const file = e.target.files && e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ()=>{
      try{ showGenericImportResult(parseFitArrayBuffer(reader.result), 'FIT-fil'); }
      catch(err){ alert('Kunne ikke læse FIT-filen: '+err.message); }
      fitInput.value='';
    };
    reader.readAsArrayBuffer(file);
  };
}
const applyFitBtn = document.getElementById('applyFitImportBtn');
if(applyFitBtn){ applyFitBtn.onclick = applyActivityImport; }


// --- TCX/GPX + fælles import af aktivitetsfiler ---
let pendingActivityImport = null;

function xmlText(node, tag){
  if(!node) return '';
  const el = node.getElementsByTagName(tag)[0];
  return el ? (el.textContent || '').trim() : '';
}
function xmlAll(node, tag){ return Array.from(node.getElementsByTagName(tag)); }
function parseXml(text){
  const doc = new DOMParser().parseFromString(text, 'application/xml');
  const err = doc.getElementsByTagName('parsererror')[0];
  if(err) throw new Error('XML-filen kunne ikke læses');
  return doc;
}
function isoFromAnyDateTime(v){
  if(!v) return '';
  const d = new Date(v);
  if(Number.isNaN(d.getTime())) return parseDateValue(v);
  return d.toISOString().slice(0,10);
}
function mapActivityDiscipline(raw, fallbackName=''){
  const s = `${raw||''} ${fallbackName||''}`.toLowerCase();
  if(s.includes('swim') || s.includes('svøm')) return 'Svøm';
  if(s.includes('bike') || s.includes('biking') || s.includes('cycle') || s.includes('cycling') || s.includes('ride') || s.includes('cykel') || s.includes('hometrainer')) return 'Cykling';
  if(s.includes('run') || s.includes('running') || s.includes('løb')) return 'Løb';
  return raw ? mapCsvDiscipline(raw) : 'Løb';
}
function tcxHrStats(doc){
  const vals = [];
  xmlAll(doc, 'HeartRateBpm').forEach(hr=>{
    const v = Number(xmlText(hr, 'Value'));
    if(Number.isFinite(v) && v>0) vals.push(v);
  });
  return {avgHr: avgNumbers(vals), maxHr: maxNumbers(vals)};
}
function tcxAvgHr(doc){
  return tcxHrStats(doc).avgHr;
}
function parseTcxText(text, fileName=''){
  const doc = parseXml(text);
  const activity = doc.getElementsByTagName('Activity')[0];
  const sport = activity ? activity.getAttribute('Sport') : '';
  const discipline = mapActivityDiscipline(sport, fileName);
  const laps = xmlAll(doc, 'Lap');
  const trackpoints = xmlAll(doc, 'Trackpoint');
  let seconds = 0;
  let meters = 0;
  laps.forEach(l=>{
    const sec = Number(xmlText(l, 'TotalTimeSeconds'));
    const dist = Number(xmlText(l, 'DistanceMeters'));
    if(Number.isFinite(sec)) seconds += sec;
    if(Number.isFinite(dist)) meters += dist;
  });
  if(!meters && trackpoints.length){
    const dists = trackpoints.map(tp=>Number(xmlText(tp,'DistanceMeters'))).filter(v=>Number.isFinite(v));
    if(dists.length) meters = Math.max(...dists);
  }
  const times = trackpoints.map(tp=>xmlText(tp,'Time')).filter(Boolean);
  if(!seconds && times.length>1){
    const first = new Date(times[0]).getTime();
    const last = new Date(times[times.length-1]).getTime();
    if(Number.isFinite(first) && Number.isFinite(last) && last>first) seconds = (last-first)/1000;
  }
  const idTime = xmlText(activity || doc, 'Id') || times[0] || '';
  const date = isoFromAnyDateTime(idTime) || todayIso();
  const hr = tcxHrStats(doc);
  return {
    date,
    discipline,
    minutes: seconds ? Math.round(seconds/60) : 0,
    km: meters ? Math.round((meters/1000)*100)/100 : 0,
    avgHr: hr.avgHr,
    maxHr: hr.maxHr,
    source:'TCX',
    details:`${laps.length} lap(s), ${trackpoints.length} trackpoint(s)${hr.avgHr ? ', pulsdata fundet' : ''}`
  };
}
function haversineKm(a,b){
  const R=6371;
  const toRad=x=>x*Math.PI/180;
  const dLat=toRad(b.lat-a.lat), dLon=toRad(b.lon-a.lon);
  const lat1=toRad(a.lat), lat2=toRad(b.lat);
  const h=Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2;
  return 2*R*Math.asin(Math.sqrt(h));
}
function parseGpxText(text, fileName=''){
  const doc = parseXml(text);
  const name = xmlText(doc, 'name') || fileName;
  const discipline = mapActivityDiscipline('', `${name} ${fileName}`);
  const pts = xmlAll(doc, 'trkpt').map(p=>({
    lat:Number(p.getAttribute('lat')),
    lon:Number(p.getAttribute('lon')),
    time:xmlText(p,'time')
  })).filter(p=>Number.isFinite(p.lat)&&Number.isFinite(p.lon));
  let km=0;
  for(let i=1;i<pts.length;i++) km += haversineKm(pts[i-1], pts[i]);
  const times = pts.map(p=>p.time).filter(Boolean);
  let seconds=0;
  if(times.length>1){
    const first=new Date(times[0]).getTime(), last=new Date(times[times.length-1]).getTime();
    if(Number.isFinite(first)&&Number.isFinite(last)&&last>first) seconds=(last-first)/1000;
  }
  const date = isoFromAnyDateTime(times[0]) || todayIso();
  const hrs=[];
  xmlAllLocal(doc, 'hr').forEach(h=>{const v=Number(h.textContent); if(Number.isFinite(v)&&v>0) hrs.push(v);});
  const avgHr = avgNumbers(hrs);
  const maxHr = maxNumbers(hrs);
  return {
    date,
    discipline,
    minutes: seconds ? Math.round(seconds/60) : 0,
    km: km ? Math.round(km*100)/100 : 0,
    avgHr,
    maxHr,
    source:'GPX',
    details:`${pts.length} punkter${hrs.length ? ', pulsdata fundet' : ''}`
  };
}
function findBestWorkoutForActivity(activity){
  const sameDate = state.workouts.filter(w=>w.date===activity.date);
  const sameDisc = sameDate.filter(w=>w.discipline===activity.discipline || (w.discipline==='Race' && ['Løb','Cykling','Svøm'].includes(activity.discipline)));
  const candidates = sameDisc.length ? sameDisc : sameDate;
  if(!candidates.length) return null;
  return candidates.find(w=>w.status==='Planlagt') || candidates[0];
}
function showGenericImportResult(activity, sourceName){
  const match = findBestWorkoutForActivity(activity);
  pendingActivityImport = {activity, sourceName, matchId: match ? match.id : null};
  pendingFitImport = null;
  const title = document.getElementById('importDialogTitle');
  if(title) title.textContent = `${sourceName}-import`;
  const html = `
    <table><tbody>
      <tr><th>Kilde</th><td>${sourceName}</td></tr>
      <tr><th>Dato</th><td>${activity.date}</td></tr>
      <tr><th>Disciplin</th><td>${activity.discipline}</td></tr>
      <tr><th>Tid</th><td>${activity.minutes ? activity.minutes+' min' : 'Ikke fundet'}</td></tr>
      <tr><th>Distance</th><td>${activity.km ? Number(activity.km).toFixed(2)+' km' : 'Ikke fundet'}</td></tr>
      <tr><th>Gns. puls</th><td>${activity.avgHr || 'Ikke fundet'}</td></tr>
      <tr><th>Maks puls</th><td>${activity.maxHr || 'Ikke fundet'}</td></tr>
      <tr><th>Match i planen</th><td>${match ? `${dkDate(match.date)} · ${match.discipline} · ${match.title}` : 'Ingen træning på samme dato. Appen opretter et importeret pas.'}</td></tr>
    </tbody></table>
    <p class="hint">${activity.details || ''}${sourceName==='GPX-fil' ? ' GPX indeholder ofte ikke sportstype, så appen gætter ud fra filnavn/titel og bruger ellers Løb.' : ''}</p>`;
  document.getElementById('fitImportResult').innerHTML = html;
  document.getElementById('fitImportDialog').showModal();
}
function applyActivityImport(){
  if(!pendingActivityImport){ return applyFitImport(); }
  const {activity, sourceName, matchId} = pendingActivityImport;
  if(matchId){
    const w = state.workouts.find(x=>x.id===matchId);
    if(w){
      if(activity.minutes) w.actualMinutes = activity.minutes;
      if(activity.km) w.actualKm = activity.km;
      if(activity.avgHr) w.avgHr = activity.avgHr;
      if(activity.maxHr) w.maxHr = activity.maxHr;
      w.status = 'Gennemført';
      w.notes = `${w.notes ? w.notes+'\n' : ''}Importeret fra ${sourceName}${activityHrNote(activity)}`;
    }
  } else {
    const id = `${activity.date}_${activity.discipline}_${activity.source||sourceName}_import_${Date.now()}`;
    state.workouts.push({id,date:activity.date,day:dayName(activity.date),week:weekNo(activity.date),discipline:activity.discipline,title:`Importeret ${sourceName}`,intensity:'Importeret',planMinutes:0,planKm:0,actualMinutes:activity.minutes||'',actualKm:activity.km||'',avgHr:activity.avgHr||'',maxHr:activity.maxHr||'',status:'Gennemført',rpe:'',equipment:'',notes:`Importeret fra ${sourceName}${activityHrNote(activity)}`});
    state.workouts.sort((a,b)=>a.date.localeCompare(b.date) || String(a.discipline).localeCompare(String(b.discipline)));
  }
  const adj = autoRecalculateFuturePlan(sourceName);
  renderAll();
  pendingActivityImport = null;
  document.getElementById('fitImportDialog').close();
  alert(`${sourceName} er lagt ind i planen. ${adj.message}`);
}
const tcxInput = document.getElementById('tcxFileInput');
if(tcxInput){
  tcxInput.onchange = (e)=>{
    const file = e.target.files && e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ()=>{
      try{ showGenericImportResult(parseTcxText(reader.result, file.name), 'TCX-fil'); }
      catch(err){ alert('Kunne ikke læse TCX-filen: '+err.message); }
      tcxInput.value='';
    };
    reader.readAsText(file);
  };
}
const gpxInput = document.getElementById('gpxFileInput');
if(gpxInput){
  gpxInput.onchange = (e)=>{
    const file = e.target.files && e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ()=>{
      try{ showGenericImportResult(parseGpxText(reader.result, file.name), 'GPX-fil'); }
      catch(err){ alert('Kunne ikke læse GPX-filen: '+err.message); }
      gpxInput.value='';
    };
    reader.readAsText(file);
  };
}


// --- CSV import ---
function splitCsvLine(line, sep){
  const out=[]; let cur=''; let quoted=false;
  for(let i=0;i<line.length;i++){
    const ch=line[i];
    if(ch==='"'){
      if(quoted && line[i+1]==='"'){ cur+='"'; i++; }
      else quoted=!quoted;
    } else if(ch===sep && !quoted){ out.push(cur); cur=''; }
    else cur+=ch;
  }
  out.push(cur); return out;
}
function parseCsvText(text){
  text = text.replace(/^\uFEFF/, '').replace(/\r\n/g,'\n').replace(/\r/g,'\n').trim();
  if(!text) return [];
  const first = text.split('\n')[0] || '';
  const sep = (first.match(/;/g)||[]).length > (first.match(/,/g)||[]).length ? ';' : ',';
  const lines = text.split('\n').filter(l=>l.trim().length);
  const headers = splitCsvLine(lines.shift(), sep).map(h=>h.trim());
  return lines.map(line=>{
    const vals = splitCsvLine(line, sep);
    const obj={}; headers.forEach((h,i)=>obj[h]= (vals[i] || '').trim());
    return obj;
  });
}
function normKey(k){ return String(k||'').toLowerCase().replace(/[æ]/g,'ae').replace(/[ø]/g,'oe').replace(/[å]/g,'aa').replace(/[^a-z0-9]/g,''); }
function getField(row, names){
  const map = {}; Object.keys(row).forEach(k=>map[normKey(k)] = row[k]);
  for(const n of names){ const v = map[normKey(n)]; if(v!==undefined && v!=='') return v; }
  return '';
}
function parseDateValue(v){
  if(!v) return '';
  v = String(v).trim();
  const isoMatch = v.match(/(\d{4})[-/\.](\d{1,2})[-/\.](\d{1,2})/);
  if(isoMatch) return `${isoMatch[1]}-${isoMatch[2].padStart(2,'0')}-${isoMatch[3].padStart(2,'0')}`;
  const dkMatch = v.match(/(\d{1,2})[-/\.](\d{1,2})[-/\.](\d{2,4})/);
  if(dkMatch){ let y=dkMatch[3]; if(y.length===2) y='20'+y; return `${y}-${dkMatch[2].padStart(2,'0')}-${dkMatch[1].padStart(2,'0')}`; }
  const d = new Date(v); if(!isNaN(d)) return iso(d);
  return '';
}
function parseMinutesValue(v){
  if(v===undefined || v===null || v==='') return '';
  v = String(v).trim().replace(',', '.');
  const hhmmss = v.match(/^(\d+):(\d{1,2})(?::(\d{1,2}))?$/);
  if(hhmmss){ const h=Number(hhmmss[1]), m=Number(hhmmss[2]), sec=Number(hhmmss[3]||0); return Math.round(h*60 + m + sec/60); }
  const n = Number(v.replace(/[^0-9.\-]/g,''));
  if(!Number.isFinite(n)) return '';
  // Appens CSV-eksport bruger minutter. Nogle platforme kan bruge sekunder; meget store tal tolkes derfor som sekunder.
  return n > 600 ? Math.round(n/60) : Math.round(n);
}
function parseKmValue(v){
  if(v===undefined || v===null || v==='') return '';
  const s = String(v).trim().replace(',', '.');
  const n = Number(s.replace(/[^0-9.\-]/g,''));
  if(!Number.isFinite(n)) return '';
  // Hvis tallet ligner meter fra en eksport, konverteres det til km.
  return n > 300 ? Math.round((n/1000)*100)/100 : Math.round(n*100)/100;
}
function mapCsvDiscipline(v){
  const s = String(v||'').toLowerCase();
  if(s.includes('swim') || s.includes('svøm')) return 'Svøm';
  if(s.includes('bike') || s.includes('cycle') || s.includes('cycling') || s.includes('cykel') || s.includes('hometrainer')) return 'Cykling';
  if(s.includes('run') || s.includes('løb') || s.includes('running')) return 'Løb';
  if(s.includes('strength') || s.includes('styrke')) return 'Styrke';
  if(s.includes('race')) return 'Race';
  return v || '';
}
function findBestWorkoutForCsv(item){
  const sameDate = state.workouts.filter(w=>w.date===item.date);
  if(!sameDate.length) return null;
  let candidates = item.discipline ? sameDate.filter(w=>w.discipline===item.discipline || (w.discipline==='Race' && ['Løb','Cykling','Svøm'].includes(item.discipline))) : sameDate;
  if(!candidates.length) candidates = sameDate;
  if(item.title){
    const t = item.title.toLowerCase();
    const exact = candidates.find(w=>String(w.title).toLowerCase()===t);
    if(exact) return exact;
  }
  return candidates.find(w=>w.status==='Planlagt') || candidates[0];
}
function importCsvRows(rows){
  let updated=0, created=0, skipped=0;
  rows.forEach(row=>{
    const date = parseDateValue(getField(row, ['Dato','Date','Activity Date','Start Time','Start date','Start']));
    if(!date){ skipped++; return; }
    const disciplineRaw = getField(row, ['Disciplin','Sport','Activity Type','Type','Workout Type','Aktivitet']);
    const discipline = mapCsvDiscipline(disciplineRaw);
    const item = {
      date,
      discipline,
      title: getField(row, ['Plan','Title','Workout','Name','Activity Name','Træning']),
      actualMinutes: parseMinutesValue(getField(row, ['Faktisk tid','Actual Minutes','Minutes','Duration','Time','Elapsed Time','Moving Time','Tid'])),
      actualKm: parseKmValue(getField(row, ['Faktisk km','Actual Km','Distance','Distance km','Km','Distance (km)','Distance (m)'])),
      avgHr: getField(row, ['Gns. puls','Avg HR','Average HR','Average Heart Rate','Avg Heart Rate','Puls','Gennemsnitspuls']),
      maxHr: getField(row, ['Maks puls','Max HR','Maximum HR','Max Heart Rate','Maximum Heart Rate']),
      status: getField(row, ['Status']) || 'Gennemført',
      rpe: getField(row, ['RPE','Effort']),
      equipment: getField(row, ['Udstyr','Udstyr/sted','Equipment','Gear']),
      notes: getField(row, ['Noter','Notes','Description','Kommentar'])
    };
    const match = findBestWorkoutForCsv(item);
    if(match){
      if(item.actualMinutes !== '') match.actualMinutes = item.actualMinutes;
      if(item.actualKm !== '') match.actualKm = item.actualKm;
      if(item.avgHr) match.avgHr = item.avgHr;
      if(item.maxHr) match.maxHr = item.maxHr;
      match.status = item.status || 'Gennemført';
      if(item.rpe) match.rpe = item.rpe;
      if(item.equipment) match.equipment = item.equipment;
      match.notes = `${match.notes ? match.notes+'\n' : ''}Importeret fra CSV${item.notes ? ': '+item.notes : ''}`;
      updated++;
    } else {
      const id = `${date}_${discipline||'Andet'}_CSV_import_${Date.now()}_${created}`;
      state.workouts.push({id,date,day:dayName(date),week:weekNo(date),discipline:discipline||'Andet',title:item.title||'Importeret CSV-træning',intensity:'Importeret',planMinutes:0,planKm:0,actualMinutes:item.actualMinutes,actualKm:item.actualKm,avgHr:item.avgHr||'',maxHr:item.maxHr||'',status:item.status||'Gennemført',rpe:item.rpe||'',equipment:item.equipment||'',notes:`Importeret fra CSV${item.notes ? ': '+item.notes : ''}`});
      created++;
    }
  });
  state.workouts.sort((a,b)=>a.date.localeCompare(b.date) || String(a.discipline).localeCompare(String(b.discipline)));
  const __csvAdj = autoRecalculateFuturePlan('CSV-import');
  renderAll();
  alert(`CSV importeret. Opdateret: ${updated}. Oprettet: ${created}. Sprunget over: ${skipped}. ${__csvAdj.message}`);
}

// --- Coach-udvidelse ---
function coachEnsureState(){ if(!state.coach) state.coach={wellness:[],lastBackupDate:''}; if(!Array.isArray(state.coach.wellness)) state.coach.wellness=[]; }
function coachNum(v){ if(v===undefined||v===null||v==='') return 0; return Number(String(v).replace(',','.'))||0; }
function coachIsoAdd(dateStr,days){ const d=new Date(dateStr+'T00:00:00'); d.setDate(d.getDate()+days); return iso(d); }
function coachRecentWorkouts(days=14){ const from=coachIsoAdd(todayIso(),-days); return state.workouts.filter(w=>w.date>=from&&w.date<=todayIso()); }
function coachUpcomingWorkouts(days=14){ const to=coachIsoAdd(todayIso(),days); return state.workouts.filter(w=>w.date>=todayIso()&&w.date<=to).sort((a,b)=>a.date.localeCompare(b.date)); }
function coachLatestWellness(){ coachEnsureState(); const rows=[...state.coach.wellness].sort((a,b)=>String(a.date).localeCompare(String(b.date))); return rows.length?rows[rows.length-1]:null; }
function coachReadiness(){ coachEnsureState(); const recent=coachRecentWorkouts(10), last7=coachRecentWorkouts(7); let score=78; const notes=[]; const highRpe=recent.filter(w=>coachNum(w.rpe)>=8).length; const missed=last7.filter(w=>['Sprunget over','Skadet/syg'].includes(w.status)).length; const partialHard=recent.filter(w=>w.status==='Delvist gennemført'&&['For hårdt','Træthed','Smerte/skade','Sygdom'].includes(w.reason)).length; const painWorkouts=recent.filter(w=>coachNum(w.pain)>=3).length; const wellness=coachLatestWellness(); if(highRpe){score-=highRpe*6;notes.push(`${highRpe} pas med høj RPE`)} if(missed){score-=missed*8;notes.push(`${missed} missede/skadesmarkerede pas`)} if(partialHard){score-=partialHard*10;notes.push(`${partialHard} afbrudte pas pga belastning`)} if(painWorkouts){score-=painWorkouts*8;notes.push('smerte/skade på træning')} if(wellness){ if(coachNum(wellness.fatigue)>=7){score-=14;notes.push('høj træthed')} if(coachNum(wellness.pain)>=3){score-=18;notes.push('smerte/skade i dagsform')} if(coachNum(wellness.sleep)>0&&coachNum(wellness.sleep)<6){score-=10;notes.push('lav søvn')} if(coachNum(wellness.energy)>0&&coachNum(wellness.energy)<=4){score-=10;notes.push('lav energi')} } score=Math.max(15,Math.min(100,Math.round(score))); let level='Grøn'; if(score<70) level='Gul'; if(score<50) level='Rød'; return {score,level,notes}; }
function coachWorkoutABC(w){ const min=coachNum(w.planMinutes), km=coachNum(w.planKm), disc=w.discipline; let bMin=Math.round(min*.65), cMin=Math.round(min*.35), bKm=Math.round(km*.65*10)/10, cKm=Math.round(km*.35*10)/10; if(disc==='Cykling'){bMin=Math.max(25,bMin);cMin=Math.max(20,cMin)} if(disc==='Løb'){bMin=Math.max(15,bMin);cMin=Math.max(10,cMin)} if(disc==='Svøm'){bMin=Math.max(15,bMin);cMin=Math.max(10,cMin)} if(disc==='Styrke'){bMin=Math.max(20,bMin);cMin=Math.max(10,cMin)} return {a:`${min||0} min${km?` · ${km} km`:''}`,b:`${bMin||0} min${km?` · ${bKm} km`:''}`,c:`${cMin||0} min${km?` · ${cKm} km`:''}`}; }
function coachRecommendationForWorkout(w,readiness){ if(w.status==='Gennemført'||w.status==='Delvist gennemført') return 'Allerede registreret'; if(readiness.level==='Rød') return 'Plan C eller restitution'; if(readiness.level==='Gul') return ['Løb','Cykling'].includes(w.discipline)?'Plan B':'Plan A/B efter følelse'; const recentHard=coachRecentWorkouts(7).some(x=>x.discipline===w.discipline&&x.status==='Delvist gennemført'&&['For hårdt','Træthed'].includes(x.reason)); return recentHard?'Plan B':'Plan A'; }
function renderCoach(){ coachEnsureState(); if(!document.getElementById('coach')) return; const readiness=coachReadiness(), upcoming=coachUpcomingWorkouts(14), todayW=upcoming.find(w=>w.date===todayIso())||upcoming[0]; const decision=document.getElementById('coachTodayDecision'); if(decision){ let text='Ingen træning planlagt i dag.', cls='green'; if(todayW){ const rec=coachRecommendationForWorkout(todayW,readiness); text=`${rec}: ${todayW.discipline} · ${todayW.title}`; if(String(rec).includes('Plan B')) cls='yellow'; if(String(rec).includes('Plan C')||String(rec).includes('restitution')) cls='red'; } decision.className=`coach-decision-box ${cls}`; decision.innerHTML=`<strong>${text}</strong><p>${readiness.notes.length?readiness.notes.join(' · '):'Ingen store advarsler i seneste data.'}</p>`; } const scoreBox=document.getElementById('readinessScoreBox'); if(scoreBox) scoreBox.innerHTML=`<div class="readiness-circle ${readiness.level}">${readiness.score}</div><div><strong>Klarhed: ${readiness.level}</strong><p>${readiness.level==='Grøn'?'Du kan som udgangspunkt følge planen.':readiness.level==='Gul'?'Reducer ved løb/cykling og hold RPE nede.':'Vælg minimumspas eller restitution, især ved løb.'}</p></div>`; const tbody=document.querySelector('#abcPlanTable tbody'); if(tbody) tbody.innerHTML=upcoming.slice(0,18).map(w=>{const abc=coachWorkoutABC(w), rec=coachRecommendationForWorkout(w,readiness); return `<tr><td>${dkDate(w.date)}<br><small>${w.day||''}</small></td><td><strong>${w.discipline}</strong><br><small>${w.title}</small></td><td>${abc.a}</td><td>${abc.b}</td><td>${abc.c}</td><td><span class="coach-rec">${rec}</span></td></tr>`}).join(''); renderWeeklyCoachComment(); renderCoachWarnings(); renderCoachStatusPackage(); renderBackupReminder(); bindCoachControls(); }
function renderWeeklyCoachComment(){ const box=document.getElementById('weeklyCoachComment'); if(!box) return; const recent=coachRecentWorkouts(7), done=recent.filter(w=>['Gennemført','Delvist gennemført'].includes(w.status)); const planned=sum(recent,'planMinutes'), actual=sum(recent,'actualMinutes'), completion=planned?Math.round(actual/planned*100):0; const runKm=sum(done.filter(w=>w.discipline==='Løb'),'actualKm'), bikeMin=sum(done.filter(w=>w.discipline==='Cykling'),'actualMinutes'), swimKm=sum(done.filter(w=>w.discipline==='Svøm'),'actualKm'); const partial=recent.filter(w=>w.status==='Delvist gennemført'||w.status==='Sprunget over'); let advice='Hold rolig kontinuitet og undgå at jagte tempo.'; if(completion<50) advice='Planen har været for tung eller hverdagen for presset. Brug Plan B/C mere aktivt.'; if(partial.some(w=>w.reason==='For hårdt')) advice='Der er tegn på for høj belastning. Sænk især cykelwatt/løbevarighed.'; if(partial.some(w=>w.reason==='Smerte/skade')) advice='Smerte/skade er vigtigste signal. Reducér løb og erstat med rolig cykel/gang.'; box.innerHTML=`<p><strong>Seneste 7 dage:</strong> ${done.length} gennemførte/delvise pas · ${actual||0}/${planned||0} min (${completion}%).</p><p>Løb: ${runKm.toFixed(1)} km · Cykling: ${bikeMin} min · Svøm: ${swimKm.toFixed(1)} km.</p><p><strong>Anbefaling:</strong> ${advice}</p>`; }
function renderCoachWarnings(){ const box=document.getElementById('coachWarnings'); if(!box) return; const r=coachReadiness(), recent=coachRecentWorkouts(14), warnings=[]; const planned=sum(recent,'planMinutes'), actual=sum(recent,'actualMinutes'); if(planned&&actual/planned<.55) warnings.push('Lav gennemførsel de seneste 14 dage – planen bør reduceres.'); if(recent.some(w=>w.reason==='For hårdt')) warnings.push('Mindst ét pas er markeret “For hårdt” – næste tilsvarende pas bør være Plan B/C.'); if(recent.some(w=>coachNum(w.pain)>=3)) warnings.push('Smerte/skade er registreret – løb bør justeres ned.'); if(r.level==='Rød') warnings.push('Klarhed er rød – vælg restitution eller minimumspas.'); if(!warnings.length) warnings.push('Ingen alvorlige advarsler lige nu.'); box.innerHTML=warnings.map(w=>`<div class="coach-warning">${w}</div>`).join(''); }
function renderCoachStatusPackage(){ const ta=document.getElementById('coachStatusPackage'); if(!ta) return; const recent=coachRecentWorkouts(14), future=coachUpcomingWorkouts(14), readiness=coachReadiness(), weight=state.weightData||null; const lines=['TRIATHLON STATUSPAKKE',`Dato: ${todayIso()}`,`Klarhed: ${readiness.score}/100 (${readiness.level})`,`Noter: ${readiness.notes.join('; ')||'Ingen store advarsler'}`,'','Seneste 14 dage:',`Planlagt: ${sum(recent,'planMinutes')} min`,`Faktisk: ${sum(recent,'actualMinutes')} min`,`Løb faktisk: ${sum(recent.filter(w=>w.discipline==='Løb'),'actualKm').toFixed(1)} km`,`Cykel faktisk: ${sum(recent.filter(w=>w.discipline==='Cykling'),'actualMinutes')} min`,`Svøm faktisk: ${sum(recent.filter(w=>w.discipline==='Svøm'),'actualKm').toFixed(1)} km`,'','Problem-/advarselspas:',...recent.filter(w=>w.status!=='Planlagt'&&(w.status!=='Gennemført'||w.reason||coachNum(w.rpe)>=8||coachNum(w.pain)>=3)).map(w=>`- ${w.date} ${w.discipline}: ${w.status}, ${w.actualMinutes||0} min, ${w.actualKm||0} km, RPE ${w.rpe||'-'}, årsag ${w.reason||'-'}, smerte ${w.pain||'-'}`),'','Vægt:',weight?`Start ${weight.start||'-'} kg, mål ${weight.target||'-'} kg, måldato ${weight.targetDate||'-'}, log ${weight.log?weight.log.length:0} målinger`:'Ingen vægtdata','','Næste 14 dage:',...future.map(w=>`- ${w.date} ${w.discipline}: ${w.title}, ${w.planMinutes||0} min, ${w.planKm||0} km, ${w.intensity||''}`),'','Opgave til ChatGPT: Vurdér planen og foreslå konkrete justeringer for næste 14 dage.']; ta.value=lines.join('\n'); }
function renderBackupReminder(){ coachEnsureState(); const box=document.getElementById('backupReminderBox'); if(!box) return; const last=state.coach.lastBackupDate||''; let txt='Du har ikke markeret backup endnu. Brug Backup-knappen og eksportér en JSON-backup.', cls='yellow'; if(last){const days=Math.round((new Date(todayIso()+'T00:00:00')-new Date(last+'T00:00:00'))/(24*3600*1000)); if(days<=14){txt=`Sidste backup markeret ${dkDate(last)} (${days} dage siden).`;cls='green'} else {txt=`Sidste backup er ${days} dage siden. Eksportér en ny backup.`;cls='red'}} box.className=`backup-reminder-box ${cls}`; box.innerHTML=`<strong>${txt}</strong>`; }
function bindCoachControls(){ const form=document.getElementById('wellnessForm'); if(form&&!form.dataset.bound){ form.dataset.bound='1'; const d=document.getElementById('wellnessDate'); if(d&&!d.value)d.value=todayIso(); form.addEventListener('submit',e=>{e.preventDefault(); coachEnsureState(); const date=document.getElementById('wellnessDate').value||todayIso(); const row={id:`well_${Date.now()}`,date,energy:document.getElementById('wellnessEnergy').value,fatigue:document.getElementById('wellnessFatigue').value,pain:document.getElementById('wellnessPain').value,sleep:document.getElementById('wellnessSleep').value,note:document.getElementById('wellnessNote').value}; const ex=state.coach.wellness.find(x=>x.date===date); if(ex) Object.assign(ex,row); else state.coach.wellness.push(row); save(); document.getElementById('wellnessStatus').textContent='Dagsform gemt.'; renderCoach();}); } const refresh=document.getElementById('refreshCoachPackageBtn'); if(refresh&&!refresh.dataset.bound){refresh.dataset.bound='1';refresh.addEventListener('click',renderCoachStatusPackage)} const copy=document.getElementById('copyCoachPackageBtn'); if(copy&&!copy.dataset.bound){copy.dataset.bound='1';copy.addEventListener('click',async()=>{const ta=document.getElementById('coachStatusPackage'); ta.select(); try{await navigator.clipboard.writeText(ta.value); document.getElementById('copyCoachStatus').textContent='Kopieret.'}catch(e){document.getElementById('copyCoachStatus').textContent='Marker teksten og kopier manuelt med Ctrl+C.'}})} const backup=document.getElementById('markBackupBtn'); if(backup&&!backup.dataset.bound){backup.dataset.bound='1';backup.addEventListener('click',()=>{coachEnsureState(); state.coach.lastBackupDate=todayIso(); save(); renderBackupReminder();})} }
function patchEditDialogCoachFields(){ const oldOpen=window.openEdit; if(typeof oldOpen==='function'&&!window.__coachOpenEditPatched){ window.__coachOpenEditPatched=true; window.openEdit=function(id){ oldOpen(id); const w=state.workouts.find(x=>x.id===id); if(!w)return; const r=document.getElementById('reasonInput'); if(r)r.value=w.reason||''; const p=document.getElementById('painInput'); if(p)p.value=w.pain||''; const f=document.getElementById('fatigueInput'); if(f)f.value=w.fatigue||''; }; } }
function patchSaveWorkoutCoachFields(){ const saveBtn=document.getElementById('saveWorkoutBtn'); if(saveBtn&&!saveBtn.dataset.coachBound){ saveBtn.dataset.coachBound='1'; saveBtn.addEventListener('click',()=>{ const id=document.getElementById('editId')?.value; const w=state.workouts.find(x=>x.id===id); if(!w)return; const r=document.getElementById('reasonInput'); if(r)w.reason=r.value||''; const p=document.getElementById('painInput'); if(p)w.pain=p.value||''; const f=document.getElementById('fatigueInput'); if(f)w.fatigue=f.value||''; save(); },true); } }
const __renderAllBeforeCoach=renderAll;
renderAll=function(){ __renderAllBeforeCoach(); coachEnsureState(); patchEditDialogCoachFields(); patchSaveWorkoutCoachFields(); renderCoach(); };



// --- Redigerbart udstyr/sted ---
function openEquipmentEdit(index){
  const eq = state.equipment[index];
  if(!eq) return;
  document.getElementById('equipmentEditOriginal').value = eq.name;
  document.getElementById('equipmentEditName').value = eq.name;
  document.getElementById('equipmentEditType').value = eq.type || 'Andet';
  document.getElementById('equipmentDialog').showModal();
}
function saveEquipmentEdit(){
  const original = document.getElementById('equipmentEditOriginal').value;
  const newName = (document.getElementById('equipmentEditName').value || '').trim();
  const newType = document.getElementById('equipmentEditType').value || 'Andet';
  if(!original || !newName){
    alert('Udstyr skal have et navn.');
    return;
  }

  const duplicate = state.equipment.some(e => e.name === newName && e.name !== original);
  if(duplicate){
    alert('Der findes allerede udstyr/sted med det navn.');
    return;
  }

  const eq = state.equipment.find(e => e.name === original);
  if(!eq){
    alert('Kunne ikke finde udstyret.');
    return;
  }

  eq.name = newName;
  eq.type = newType;

  // Bevar data: opdater alle træninger, som brugte det gamle navn.
  state.workouts.forEach(w => {
    if(w.equipment === original) w.equipment = newName;
  });

  save();
  document.getElementById('equipmentDialog').close();
  renderAll();
}
function bindEquipmentEditDialog(){
  const saveBtn=document.getElementById('saveEquipmentEditBtn');
  if(saveBtn && !saveBtn.dataset.bound){
    saveBtn.dataset.bound='1';
    saveBtn.addEventListener('click', saveEquipmentEdit);
  }
  const cancelBtn=document.getElementById('cancelEquipmentEditBtn');
  if(cancelBtn && !cancelBtn.dataset.bound){
    cancelBtn.dataset.bound='1';
    cancelBtn.addEventListener('click', ()=>document.getElementById('equipmentDialog').close());
  }
}
const __renderAllBeforeEquipmentEdit = renderAll;
renderAll = function(){
  __renderAllBeforeEquipmentEdit();
  bindEquipmentEditDialog();
};



// --- Strava lokal integration ---
const STRAVA_SERVER_URL = '';

function stravaLog(msg){
  const box=document.getElementById('stravaLogBox');
  const line=`[${new Date().toLocaleTimeString()}] ${msg}`;
  if(box) box.textContent = line + '\n' + (box.textContent || '');
}
function setStravaStatus(msg, kind=''){
  const box=document.getElementById('stravaStatusBox');
  if(box){
    box.className = 'strava-status-box ' + kind;
    box.textContent = msg;
  }
}
async function stravaFetch(path, options={}){
  const res = await fetch(STRAVA_SERVER_URL + path, {
    ...options,
    headers: {'Content-Type':'application/json', ...(options.headers||{})}
  });
  if(!res.ok){
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  return await res.json();
}
async function checkStravaStatus(){
  try{
    setStravaStatus('Tjekker lokal Strava-server...');
    const data=await stravaFetch('/api/strava/status');
    if(data.connected){
      setStravaStatus(`Forbundet til Strava. Athlete: ${data.athleteName || data.athleteId || 'ukendt'}`, 'ok');
    } else {
      setStravaStatus('Serveren kører, men Strava er ikke forbundet endnu.', 'warn');
    }
    stravaLog(JSON.stringify(data,null,2));
  }catch(e){
    setStravaStatus('Kan ikke forbinde til lokal server på http://localhost:8787. Start strava-server først.', 'bad');
    stravaLog(e.message);
  }
}
async function syncStrava(){
  try{
    setStravaStatus('Synkroniserer Strava-data...');
    const data=await stravaFetch('/api/strava/sync', {method:'POST', body:JSON.stringify({days:365})});
    setStravaStatus(`Synk færdig: ${data.count || 0} aktiviteter gemt lokalt.`, 'ok');
    stravaLog(JSON.stringify(data,null,2));
    await loadStravaActivities();
  }catch(e){
    setStravaStatus('Synk fejlede. Se teknisk log.', 'bad');
    stravaLog(e.message);
  }
}
async function loadStravaActivities(){
  try{
    const data=await stravaFetch('/api/strava/activities?limit=300');
    renderStravaActivities(data.activities || []);
    return data.activities || [];
  }catch(e){
    stravaLog(e.message);
    return [];
  }
}
function stravaTypeToDiscipline(type){
  const t=String(type||'').toLowerCase();
  if(t.includes('run')) return 'Løb';
  if(t.includes('ride') || t.includes('bike') || t.includes('cycling') || t.includes('virtualride')) return 'Cykling';
  if(t.includes('swim')) return 'Svøm';
  if(t.includes('walk') || t.includes('hike')) return 'Løb';
  return 'Andet';
}
function stravaDateOnly(a){
  const raw=a.start_date_local || a.start_date || a.startDate || '';
  return String(raw).slice(0,10);
}
function stravaKm(a){
  return Math.round(((a.distance || a.distanceMeters || 0)/1000)*100)/100;
}
function stravaMinutes(a){
  return Math.round((a.moving_time || a.movingTimeSeconds || a.elapsed_time || a.elapsedTimeSeconds || 0)/60);
}
function findMatchingWorkoutForStrava(a){
  const date=stravaDateOnly(a);
  const discipline=stravaTypeToDiscipline(a.sport_type || a.type);
  return state.workouts.find(w=>w.date===date && w.discipline===discipline);
}
function renderStravaActivities(activities){
  const tbody=document.querySelector('#stravaActivityTable tbody');
  if(!tbody) return;
  tbody.innerHTML = activities.slice(0,80).map(a=>{
    const date=stravaDateOnly(a);
    const km=stravaKm(a);
    const min=stravaMinutes(a);
    const match=findMatchingWorkoutForStrava(a);
    const hr=[a.average_heartrate || a.averageHeartRate, a.max_heartrate || a.maxHeartRate].filter(Boolean).join(' / ');
    const watts=a.average_watts || a.weighted_average_watts || a.averageWatts || '';
    return `<tr data-strava-id="${a.id || ''}" class="activity-row-clickable" title="Klik for detaljer, kort og grafer">
      <td>${date ? dkDate(date) : ''}</td>
      <td>${stravaTypeToDiscipline(a.sport_type || a.type)}</td>
      <td>${a.name || ''}</td>
      <td>${km} km</td>
      <td>${min} min</td>
      <td>${hr || '-'}</td>
      <td>${watts || '-'}</td>
      <td>${match ? match.title : 'Ny aktivitet'}</td>
    </tr>`;
  }).join('');
}
async function importStravaToApp(){
  try{
    const activities=await loadStravaActivities();
    let matched=0, created=0;
    activities.forEach(a=>{
      const date=stravaDateOnly(a);
      if(!date) return;
      const discipline=stravaTypeToDiscipline(a.sport_type || a.type);
      if(discipline==='Andet') return;

      const km=stravaKm(a);
      const min=stravaMinutes(a);
      let w=findMatchingWorkoutForStrava(a);
      if(w){
        matched++;
      } else {
        created++;
        const id=`strava_${a.id || Date.now()}_${discipline}`;
        w={id,date,day:dayName(date),week:weekNo(date),discipline,title:a.name || 'Strava aktivitet',intensity:'Importeret fra Strava',planMinutes:'',planKm:'',actualMinutes:'',actualKm:'',avgHr:'',maxHr:'',status:'Planlagt',rpe:'',equipment:'',notes:''};
        state.workouts.push(w);
      }

      w.actualMinutes = min || w.actualMinutes || '';
      w.actualKm = km || w.actualKm || '';
      w.avgHr = a.average_heartrate || a.averageHeartRate || w.avgHr || '';
      w.maxHr = a.max_heartrate || a.maxHeartRate || w.maxHr || '';
      w.status = 'Gennemført';
      w.notes = `${w.notes ? w.notes + ' | ' : ''}Strava ID: ${a.id || ''}. ${a.name || ''}`;
      w.stravaId = a.id || '';
      w.stravaType = a.sport_type || a.type || '';
      w.stravaRawSummary = {
        id:a.id, name:a.name, type:a.type, sport_type:a.sport_type, start_date:a.start_date, start_date_local:a.start_date_local,
        distance:a.distance, moving_time:a.moving_time, elapsed_time:a.elapsed_time, total_elevation_gain:a.total_elevation_gain,
        average_heartrate:a.average_heartrate, max_heartrate:a.max_heartrate, average_watts:a.average_watts,
        weighted_average_watts:a.weighted_average_watts, average_cadence:a.average_cadence
      };
    });

    state.workouts.sort((a,b)=>a.date.localeCompare(b.date) || String(a.discipline).localeCompare(String(b.discipline)));
    save();
    const adj = autoRecalculateFuturePlan('Strava-import');
    renderAll();
    await loadStravaActivities();
    setStravaStatus(`Import færdig: ${matched} matchet, ${created} nye aktiviteter. ${adj.message}`, 'ok');
  }catch(e){
    setStravaStatus('Import fejlede. Se teknisk log.', 'bad');
    stravaLog(e.message);
  }
}
function bindStravaControls(){
  const connect=document.getElementById('stravaConnectBtn');
  if(connect && !connect.dataset.bound){
    connect.dataset.bound='1';
    connect.addEventListener('click', ()=>{ window.open(STRAVA_SERVER_URL + '/api/strava/connect', '_blank'); });
  }
  const status=document.getElementById('stravaStatusBtn');
  if(status && !status.dataset.bound){
    status.dataset.bound='1';
    status.addEventListener('click', checkStravaStatus);
  }
  const sync=document.getElementById('stravaSyncBtn');
  if(sync && !sync.dataset.bound){
    sync.dataset.bound='1';
    sync.addEventListener('click', syncStrava);
  }
  const importBtn=document.getElementById('stravaImportBtn');
  if(importBtn && !importBtn.dataset.bound){
    importBtn.dataset.bound='1';
    importBtn.addEventListener('click', importStravaToApp);
  }
}
const __renderAllBeforeStrava = renderAll;
renderAll = function(){
  __renderAllBeforeStrava();
  bindStravaControls();
};



renderAll();
const csvInput = document.getElementById('csvFileInput');
if(csvInput){
  csvInput.onchange = (e)=>{
    const file = e.target.files && e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ()=>{
      try{ importCsvRows(parseCsvText(reader.result)); }
      catch(err){ alert('Kunne ikke læse CSV-filen: '+err.message); }
      csvInput.value='';
    };
    reader.readAsText(file);
  };
}


// --- Samlet importknap: FIT / CSV / TCX / GPX ---
function importActivityFile(file){
  if(!file) return;
  const name = file.name || '';
  const ext = name.split('.').pop().toLowerCase();
  const reader = new FileReader();

  if(ext === 'fit'){
    reader.onload = ()=>{
      try{ showGenericImportResult(parseFitArrayBuffer(reader.result), 'FIT-fil'); }
      catch(err){ alert('Kunne ikke læse FIT-filen: '+err.message); }
      activityInput.value='';
    };
    reader.readAsArrayBuffer(file);
    return;
  }

  reader.onload = ()=>{
    try{
      if(ext === 'tcx') showGenericImportResult(parseTcxText(reader.result, name), 'TCX-fil');
      else if(ext === 'gpx') showGenericImportResult(parseGpxText(reader.result, name), 'GPX-fil');
      else if(ext === 'csv') importCsvRows(parseCsvText(reader.result));
      else alert('Ukendt filtype. Vælg en .fit, .csv, .tcx eller .gpx fil.');
    }catch(err){
      alert('Kunne ikke læse filen: '+err.message);
    }
    activityInput.value='';
  };
  reader.readAsText(file);
}
const activityInput = document.getElementById('activityFileInput');
if(activityInput){
  activityInput.onchange = (e)=>{
    const file = e.target.files && e.target.files[0];
    importActivityFile(file);
  };
}


// --- Målfix: distance på tid + bedre måloverblik ---
function parseGoalNumber(v){
  if(v === undefined || v === null) return 0;
  return Number(String(v).replace(',', '.')) || 0;
}
function goalRowsInRange(goal){
  const from = goal.from || goal.fromDate || '1900-01-01';
  const to = goal.to || goal.toDate || '2999-12-31';
  const disc = goal.discipline || 'Alle';
  return state.workouts.filter(w =>
    w.date >= from &&
    w.date <= to &&
    (disc === 'Alle' || w.discipline === disc) &&
    (w.status === 'Gennemført' || w.status === 'Delvist gennemført')
  );
}
function bestDistanceTimeForGoal(goal){
  const rows = goalRowsInRange(goal);
  const targetKm = parseGoalNumber(goal.distanceKm || goal.distance || goal.targetDistance || goal.targetKm || goal.value || goal.target);
  if(!targetKm) return null;
  const candidates = rows
    .filter(w => Number(w.actualKm) >= targetKm && Number(w.actualMinutes) > 0)
    .map(w => ({
      minutes: Number(w.actualMinutes) * (targetKm / Number(w.actualKm)),
      date: w.date,
      title: w.title,
      km: Number(w.actualKm),
      sourceMinutes: Number(w.actualMinutes)
    }))
    .sort((a,b) => a.minutes - b.minutes);
  return candidates[0] || null;
}
function calcGoalProgress(goal){
  const type = goal.type || goal.goalType || goal.metric || 'Distance';
  const unit = goal.unit || goal.unitTime || '';
  const target = parseGoalNumber(goal.target || goal.targetValue || goal.value);

  // Ny måltype: fx 5 km under 30 min.
  if(type === 'DistanceTime'){
    const targetKm = parseGoalNumber(goal.distanceKm || goal.distance || goal.targetDistance || goal.targetKm);
    const targetMin = parseGoalNumber(goal.targetMinutes || goal.timeMinutes || goal.target || goal.targetValue || goal.value);
    const best = bestDistanceTimeForGoal({...goal, target:targetKm});
    if(!best){
      return {pct:0, status:'Mangler data', current:'Ingen match', detail:`Mål: ${targetKm} km under ${minToTime(targetMin)}`};
    }
    const pct = targetMin ? Math.min(1, targetMin / best.minutes) : 0;
    const ok = best.minutes <= targetMin;
    return {
      pct,
      status: ok ? 'Opfyldt' : 'Bagud',
      current: `${minToTime(best.minutes)}`,
      detail: `${targetKm} km · mål ${minToTime(targetMin)} · bedste ${minToTime(best.minutes)}`
    };
  }

  // Sluttidsmål for race/prognose: lavere tid er bedre.
  if(type === 'Sluttid' || type === 'FinishTime' || type === 'RaceTime'){
    let current = 0;
    const race = goal.race || goal.raceName || '';
    if(String(race).includes('Marathon')) current = calculateGoalForecasts().marathon;
    else if(String(race).includes('Køge')) current = calculateGoalForecasts().koege;
    else current = calculateSub12Forecast().total;
    const targetMin = target;
    const pct = current && targetMin ? Math.min(1, targetMin / current) : 0;
    return {
      pct,
      status: current <= targetMin ? 'Opfyldt' : (pct >= 0.9 ? 'Tæt på' : 'Bagud'),
      current: minToTime(current),
      detail: `Mål ${minToTime(targetMin)} · prognose ${minToTime(current)}`
    };
  }

  const rows = goalRowsInRange(goal);
  let actual = 0;
  if(type === 'Antal' || type === 'Count' || unit === 'pas') actual = rows.length;
  else if(unit === 'timer' || type === 'Tid' || type === 'Hours') actual = rows.reduce((a,w)=>a+(Number(w.actualMinutes)||0),0)/60;
  else actual = rows.reduce((a,w)=>a+(Number(w.actualKm)||0),0);

  const pct = target ? Math.min(1, actual / target) : 0;
  return {
    pct,
    status: pct >= 1 ? 'Opfyldt' : (pct >= 0.85 ? 'Tæt på' : (actual > 0 ? 'På vej' : 'Mangler data')),
    current: `${actual.toFixed(unit === 'timer' ? 1 : 1)} ${unit || 'km'}`,
    detail: `${actual.toFixed(unit === 'timer' ? 1 : 1)} / ${target} ${unit || 'km'}`
  };
}

function renderGoalsFixed(){ return; }

function ensureDistanceTimeFields(){ return; }

function patchGoalSave(){ return; }

// Hook into existing render
const __oldRenderAllForGoals = renderAll;
renderAll = function(){
  __oldRenderAllForGoals();
  ensureDistanceTimeFields();
  patchGoalSave();
  renderGoalsFixed();
};

// Bind pæn målformular
setTimeout(() => {
  const gt=document.getElementById('goalType');
  if(gt && !gt.dataset.goalTypeChangeBound){
    gt.dataset.goalTypeChangeBound='1';
    gt.addEventListener('change', updateGoalUnitFromType);
    updateGoalUnitFromType();
  }
}, 0);


// --- Print ugeprogram ---
function startOfWeekMonday(dateStr){
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return iso(d);
}
function addDaysIso(dateStr, days){
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return iso(d);
}
function weekRangeForWeekNo(week){
  const start = new Date(START_DATE);
  start.setDate(start.getDate() + (Number(week)-1)*7);
  const monday = startOfWeekMonday(iso(start));
  return {start:monday, end:addDaysIso(monday,6)};
}
function uniqueTrainingWeeks(){
  const weeks = [...new Set(state.workouts.map(w=>Number(w.week)).filter(Boolean))].sort((a,b)=>a-b);
  return weeks;
}
function populatePrintWeekSelect(){
  const sel = document.getElementById('printWeekSelect');
  if(!sel) return;
  const current = sel.value;
  sel.innerHTML = uniqueTrainingWeeks().map(w=>{
    const r = weekRangeForWeekNo(w);
    return `<option value="${w}">Uge ${w} · ${dkDate(r.start)} - ${dkDate(r.end)}</option>`;
  }).join('');
  if(current && [...sel.options].some(o=>o.value===current)) sel.value = current;
  else {
    const todayWeek = weekNo(todayIso());
    if([...sel.options].some(o=>Number(o.value)===todayWeek)) sel.value = String(todayWeek);
  }
}
function renderPrintWeek(){
  const sel = document.getElementById('printWeekSelect');
  const area = document.getElementById('printWeekArea');
  if(!sel || !area) return;
  const week = Number(sel.value || weekNo(todayIso()));
  const range = weekRangeForWeekNo(week);
  const rows = state.workouts
    .filter(w => w.date >= range.start && w.date <= range.end)
    .sort((a,b)=>a.date.localeCompare(b.date) || String(a.discipline).localeCompare(String(b.discipline)));

  const title = document.getElementById('printWeekTitle');
  const subtitle = document.getElementById('printWeekSubtitle');
  const summary = document.getElementById('printWeekSummary');
  const daysBox = document.getElementById('printWeekDays');

  if(title) title.textContent = `Træningsuge ${week}`;
  if(subtitle) subtitle.textContent = `${dkDate(range.start)} - ${dkDate(range.end)} · Marathon → Køge Jernmand → IRONMAN Copenhagen`;

  const planMinutes = sum(rows,'planMinutes');
  const swimKm = sum(rows.filter(w=>w.discipline==='Svøm'),'planKm');
  const bikeKm = sum(rows.filter(w=>w.discipline==='Cykling'),'planKm');
  const runKm = sum(rows.filter(w=>w.discipline==='Løb'),'planKm');

  if(summary){
    summary.innerHTML = `
      <div><strong>${minToTime(planMinutes)}</strong><span>Planlagt tid</span></div>
      <div><strong>${swimKm.toFixed(1)} km</strong><span>Svøm</span></div>
      <div><strong>${bikeKm.toFixed(0)} km</strong><span>Cykel</span></div>
      <div><strong>${runKm.toFixed(1)} km</strong><span>Løb</span></div>`;
  }

  const days = [];
  for(let i=0;i<7;i++){
    const date = addDaysIso(range.start, i);
    const dayRows = rows.filter(w=>w.date===date);
    days.push(`<div class="print-day">
      <div class="print-day-head"><strong>${dayName(date)}</strong><span>${dkDate(date)}</span></div>
      ${dayRows.length ? dayRows.map(w=>`
        <div class="print-workout print-${w.discipline}">
          <div class="print-workout-main">
            <span class="print-discipline">${w.discipline}</span>
            <strong>${w.title}</strong>
            <p>${w.intensity || ''}</p>
            ${w.equipment ? `<small>Udstyr/sted: ${w.equipment}</small>` : ''}
          </div>
          <div class="print-workout-numbers">
            <div><strong>${w.planMinutes || 0}</strong><span>min</span></div>
            <div><strong>${w.planKm || 0}</strong><span>km</span></div>
          </div>
          <div class="print-handwrite">
            <div>Faktisk tid: ______</div>
            <div>Faktisk km: ______</div>
            <div>RPE: ______</div>
            <div>Puls: ______</div>
            <div>Status: __________</div>
          </div>
          <div class="print-notes">Noter: ________________________________________________________________</div>
        </div>`).join('') : `<div class="print-rest">Fri / restitution</div>`}
    </div>`);
  }
  if(daysBox) daysBox.innerHTML = days.join('');
}
function goToCurrentPrintWeek(){
  const sel = document.getElementById('printWeekSelect');
  if(!sel) return;
  const tw = weekNo(todayIso());
  if([...sel.options].some(o=>Number(o.value)===tw)) sel.value = String(tw);
  renderPrintWeek();
}
function setupPrintWeek(){
  populatePrintWeekSelect();
  renderPrintWeek();
  const sel = document.getElementById('printWeekSelect');
  const btn = document.getElementById('printWeekBtn');
  const currentBtn = document.getElementById('printCurrentWeekBtn');
  if(sel && !sel.dataset.bound){ sel.dataset.bound='1'; sel.addEventListener('change', renderPrintWeek); }
  if(btn && !btn.dataset.bound){ btn.dataset.bound='1'; btn.addEventListener('click', ()=>{ renderPrintWeek(); window.print(); }); }
  if(currentBtn && !currentBtn.dataset.bound){ currentBtn.dataset.bound='1'; currentBtn.addEventListener('click', goToCurrentPrintWeek); }
}

