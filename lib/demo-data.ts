import { Application, Evidence } from './types';

export const seedApps: Application[] = [
  { id:1, school:'Northbridge University', program:'Computer Science — Early Action', deadline:'Aug 31, 2026', requirements:[
    {id:1,name:'Academic transcript',status:'done',category:'Document'}, {id:2,name:'Personal statement',status:'review',category:'Essay'}, {id:3,name:'Recommendation letter',status:'missing',category:'Recommendation'}, {id:4,name:'Passport photo',status:'done',category:'Document'}, {id:5,name:'Application fee',status:'missing',category:'Payment'}
  ]},
  { id:2, school:'Future Leaders Foundation', program:'Global Scholarship 2026', deadline:'Sep 05, 2026', requirements:[
    {id:1,name:'Academic transcript',status:'done',category:'Document'}, {id:2,name:'Leadership essay',status:'missing',category:'Essay'}, {id:3,name:'Achievement evidence',status:'done',category:'Evidence'}, {id:4,name:'Recommendation letter',status:'missing',category:'Recommendation'}
  ]},
  { id:3, school:'LaunchLab Fellowship', program:'Student Builder Track', deadline:'Sep 12, 2026', requirements:[
    {id:1,name:'Project demo',status:'done',category:'Project'}, {id:2,name:'Founder statement',status:'done',category:'Essay'}, {id:3,name:'CV',status:'done',category:'Document'}, {id:4,name:'Interview availability',status:'review',category:'Interview'}
  ]}
];

export const seedEvidence: Evidence[] = [
  {id:1,title:'Competitive Futsal',org:'8+ years of competitive play',category:'Leadership',tags:['discipline','teamwork','sport'],description:'Long-term competitive team sport experience demonstrating consistency and teamwork.'},
  {id:2,title:'Tournament Management',org:'Managed competitive futsal events',category:'Leadership',tags:['operations','leadership','events'],description:'Coordinated competitive tournaments, teams, schedules and event operations.'},
  {id:3,title:'STEM Exhibition',org:'School STEM delegation',category:'STEM',tags:['innovation','technology','teamwork'],description:'Built and presented a project as part of a school STEM delegation.'},
  {id:4,title:'Harvard CS Coursework',org:'Computer science coursework',category:'Technology',tags:['cs','programming','learning'],description:'Completed structured computer science study with programming fundamentals.'}
];
