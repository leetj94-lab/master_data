import {twinSeed} from './seed.js';
export const SITE='DEMO-PLANT-01';
export const CLASSES={UT:{label:'Centrifugal pump',unit:'m³/h',areas:['Pump hall'],min:1,max:500},CH:{label:'Water-cooled chiller',unit:'kW',areas:['Chiller bay'],min:1,max:2000},AH:{label:'Air handling unit',unit:'m³/h',areas:['Service deck'],min:1,max:50000},TK:{label:'Buffer tank',unit:'L',areas:['Chiller bay'],min:1,max:50000}};
export const STATUSES=['set-up','active','inactive','expired'];
const next={'set-up':['active','expired'],active:['inactive'],inactive:['active','expired'],expired:[]};
export const transitions=status=>next[status]||[];

export const PROFILES={
 UT:{id:'STD-UT-001',revision:1,title:'Pump management & maintenance',parameter:'Vibration upper limit',controlLimit:4.5,controlUnit:'mm/s',inspectionDays:14,serviceMonths:12,checklist:'Inspect seals, bearing condition, coupling alignment and connections.',acceptance:'No visible leakage; guard fitted; acceptance record approved.'},
 CH:{id:'STD-CH-001',revision:1,title:'Chiller management & maintenance',parameter:'Outlet temperature upper limit',controlLimit:10,controlUnit:'°C',inspectionDays:30,serviceMonths:12,checklist:'Inspect heat exchanger, water connections, refrigerant circuit and safety controls.',acceptance:'Pressure test, safety checks and commissioning acceptance complete.'},
 AH:{id:'STD-AH-001',revision:1,title:'Air handling management & maintenance',parameter:'Filter differential pressure limit',controlLimit:280,controlUnit:'Pa',inspectionDays:14,serviceMonths:6,checklist:'Inspect filters, belts, bearings, damper function and casing integrity.',acceptance:'Airflow balance and functional test accepted before activation.'},
 TK:{id:'STD-TK-001',revision:1,title:'Tank management & maintenance',parameter:'High-level setpoint limit',controlLimit:90,controlUnit:'%',inspectionDays:30,serviceMonths:24,checklist:'Inspect shell corrosion, supports, level indication, vents and connections.',acceptance:'Integrity inspection and level-instrument acceptance recorded.'}
};
export function equipmentInfo(cls){return {ownerTeam:'Utilities engineering',costCenter:'CC-4100',functionalLocation:'DEMO-PLANT-01 / UTILITY-01',installDate:'2024-06-01',warrantyUntil:'2027-06-01',ratedPowerKW:cls==='UT'?22:cls==='CH'?95:cls==='AH'?11:0,voltageV:cls==='TK'?0:400,designPressureBar:cls==='TK'?2:10,connectionDN:cls==='UT'?100:cls==='CH'?150:cls==='TK'?80:0,material:cls==='UT'?'Cast iron':'Stainless steel',designLifeYears:20,maintenanceStrategy:cls==='UT'?'Condition-based':'Time-based'};}

export const initialStandard={version:1,pumpMax:500,requireSpecification:true,profiles:PROFILES,effectiveAt:'2026-10-01T00:00:00.000Z',reason:'Initial equipment identity and lifecycle standard'};
export function initialState(){return {schemaVersion:'2.0.0',siteId:SITE,standard:{...initialStandard},documentCatalog:[...twinSeed.assets.map(a=>({id:`SPEC-${a.id}-C`,status:'Approved'})),{id:'SPEC-CWP160-D',status:'Approved'}],revisions:[{...initialStandard,actor:'Standards administrator'}],assets:twinSeed.assets.map((a,i)=>({id:a.id,name:a.name,model:a.model,...equipmentInfo(a.id.split('-')[1]),assetClass:a.id.split('-')[1],siteId:SITE,area:CLASSES[a.id.split('-')[1]].areas[0],capacity:parseFloat(a.flow.replaceAll(',','')),unit:CLASSES[a.id.split('-')[1]].unit,manufacturer:['Aster Industries','Nord Engineering','Aster Industries'][i%3],serial:`DEMO-${2020+i}-00${i+1}`,specificationRef:`SPEC-${a.id}-C`,criticality:i<3?'Critical':'Standard',status:['active','active','active','active','inactive','active','expired','set-up'][i],registeredStandard:1,commissionedAt:i===7?'':'2024-06-12',acceptanceRef:i===7?'':`ACC-${a.id}`,openWork:i===0?1:0,retirementReason:i===6?'Sample unit replaced at design-life review.':'',twinMapped:true})),audit:[{id:'AUD-SEED',at:'2026-10-01T09:00:00.000Z',actor:'Standards administrator',action:'Standard published',target:'STD-EQP · v1',detail:'Initial standard approved; 8 synthetic equipment records established.'}]};}
export const clean=s=>String(s??'').trim();
export function validateAsset(input,state,excludeId=null){
 const errors=[];const add=(field,message)=>errors.push({field,message});
 const type=CLASSES[input.assetClass];
 if(!type)add('assetClass','Choose an approved equipment classification.');
 if(input.siteId!==SITE)add('siteId','Only approved site DEMO-PLANT-01 is permitted.');
 if(clean(input.name).length<3||clean(input.name).length>80)add('name','Equipment name must contain 3–80 characters.');
 if(!type?.areas.includes(input.area))add('area','Location must belong to the selected classification.');
 if(!clean(input.manufacturer))add('manufacturer','Manufacturer is mandatory.');
 if(!clean(input.model))add('model','Model is mandatory.');
 if(!clean(input.serial))add('serial','Serial number is mandatory.');
 if(clean(input.serial)&&state.assets.some(a=>a.id!==excludeId&&a.manufacturer.toLowerCase()===clean(input.manufacturer).toLowerCase()&&a.serial.toLowerCase()===clean(input.serial).toLowerCase()))add('serial','Manufacturer + serial number already exists, including expired equipment.');
 const max=input.assetClass==='UT'?state.standard.pumpMax:type?.max;
 if(!Number.isFinite(Number(input.capacity))||clean(input.capacity)===''||Number(input.capacity)<type?.min||Number(input.capacity)>max)add('capacity',`Capacity must be ${type?.min??1}–${max??'approved maximum'} ${type?.unit??''}.`);
 if(input.unit!==type?.unit)add('unit',`Use the standard unit ${type?.unit??'for the classification'}.`);
 if(!['Critical','Standard'].includes(input.criticality))add('criticality','Choose an approved criticality code.');
 if(state.standard.requireSpecification&&!clean(input.specificationRef))add('specificationRef','An approved specification reference is mandatory.');
 if(clean(input.specificationRef)&&!state.documentCatalog.some(d=>d.id===clean(input.specificationRef)&&d.status==='Approved'))add('specificationRef','Choose an existing approved specification; free-text or unapproved references are blocked.');
 for(const key of ['ownerTeam','functionalLocation'])if(!clean(input[key]))add(key,'An accountable owner and functional location are required.');
 if(!/^CC-\d{4}$/.test(input.costCenter||''))add('costCenter','Use the controlled cost-center format CC-0000.');
 if(!['Cast iron','Carbon steel','Stainless steel'].includes(input.material))add('material','Choose an approved construction material.');
 for(const [key,min,max]of [['ratedPowerKW',0,10000],['designPressureBar',0,25],['connectionDN',0,2000],['designLifeYears',1,50]])if(clean(input[key])===''||!Number.isFinite(Number(input[key]))||Number(input[key])<min||Number(input[key])>max)add(key,`Approved range: ${min}–${max}.`);
 if(!(input.assetClass==='TK'?[0]:[230,400,440]).includes(Number(input.voltageV))||clean(input.voltageV)==='')add('voltageV','Use approved voltage 0, 230, 400 or 440 V.');
 if(!['Condition-based','Time-based'].includes(input.maintenanceStrategy))add('maintenanceStrategy','Select an approved maintenance strategy.');
 if(input.installDate&&!validDate(input.installDate))add('installDate','Use a valid installation date.');
 if(input.warrantyUntil&&!validDate(input.warrantyUntil))add('warrantyUntil','Use a valid warranty date.');
 if(excludeId&&Number(input.registeredStandard||0)<Number(state.standard.profiles[input.assetClass]?.revision||1))add('standardReview','Revalidate against the revised management / maintenance standard.');
 return errors;
}
function event(state,actor,action,target,detail,now){return {...state,audit:[{id:`AUD-${now.getTime()}-${state.audit.length}`,at:now.toISOString(),actor,action,target,detail},...state.audit]};}
function requireRole(role){if(!['Operator','Admin'].includes(role))throw Error('Unknown demo role.');}
export function registerAsset(state,input,role,now=new Date()){
 requireRole(role);const errors=validateAsset(input,state);if(errors.length)throw Error(errors.map(e=>e.message).join(' '));
 const n=Math.max(0,...state.assets.filter(a=>a.assetClass===input.assetClass).map(a=>Number(a.id.split('-')[2])))+1;
 const id=`EQ-${input.assetClass}-${String(n).padStart(5,'0')}`;
 const a={id,name:clean(input.name),siteId:SITE,assetClass:input.assetClass,area:input.area,manufacturer:clean(input.manufacturer),model:clean(input.model),serial:clean(input.serial),capacity:Number(input.capacity),unit:input.unit,criticality:input.criticality,specificationRef:clean(input.specificationRef),status:'set-up',registeredStandard:state.standard.version,commissionedAt:'',acceptanceRef:'',openWork:0,retirementReason:'',twinMapped:false,...Object.fromEntries(Object.keys(equipmentInfo(input.assetClass)).map(k=>[k,typeof equipmentInfo(input.assetClass)[k]==='number'?Number(input[k]):clean(input[k])]))};
 return event({...state,assets:[a,...state.assets]},role,'Equipment registered',id,`Validated against STD-EQP v${state.standard.version}; immutable ID allocated.`,now);
}
export function reviseAsset(state,id,changes,reason,role,now=new Date()){
 requireRole(role);const a=state.assets.find(a=>a.id===id);if(!a||a.status==='expired')throw Error('Expired or unknown equipment cannot be edited.');
 if(clean(reason).length<10)throw Error('Provide a change reason of at least 10 characters.');
 // Identity/class/location linkage is fixed in this demo; editable master attributes are explicit.
 const permitted=['name','manufacturer','model','serial','capacity','unit','specificationRef','criticality',...Object.keys(equipmentInfo(a.assetClass))];
 const updated={...a};for(const k of permitted)if(k in changes)updated[k]=(k==='capacity'||typeof equipmentInfo(a.assetClass)[k]==='number')?Number(changes[k]):clean(changes[k]);
 updated.registeredStandard=state.standard.version;
 const errors=validateAsset(updated,state,id);if(errors.length)throw Error(errors.map(e=>e.message).join(' '));
 updated.registeredStandard=state.standard.version;
 return event({...state,assets:state.assets.map(x=>x.id===id?updated:x)},role,'Master data revised',id,`${clean(reason)} · ${permitted.filter(k=>String(a[k])!==String(updated[k])).map(k=>`${k}: ${a[k]} → ${updated[k]}`).join('; ')||'Revalidated without attribute changes'}`,now);
}
export function publishStandard(state,draft,role,now=new Date()){
 if(role!=='Admin')throw Error('Only the demo Admin can publish standards.');
 const pumpMax=Number(draft.pumpMax);if(!Number.isFinite(pumpMax)||pumpMax<1||pumpMax>5000)throw Error('Pump limit must be between 1 and 5,000 m³/h.');
 if(typeof draft.requireSpecification!=='boolean')throw Error('Invalid specification rule.');
 if(clean(draft.reason).length<10)throw Error('Provide a publication reason of at least 10 characters.');
 const cls=draft.assetClass||'UT';if(!CLASSES[cls])throw Error('Choose an approved classification.');
 const profile={...state.standard.profiles[cls]};
 for(const [k,min,max]of [['inspectionDays',1,365],['serviceMonths',1,120],['controlLimit',0.1,({UT:50,CH:40,AH:2000,TK:100})[cls]]]){const n=Number(draft[k]??profile[k]);if(!Number.isFinite(n)||n<min||n>max||(k!=='controlLimit'&&!Number.isInteger(n)))throw Error(`Invalid ${k}: approved range ${min}–${max}.`);profile[k]=n;}
 if(draft.checklist!==undefined){if(clean(draft.checklist).length<10)throw Error('A maintenance checklist is required.');profile.checklist=clean(draft.checklist);}
 const version=state.standard.version+1;profile.revision=version;
 const profiles=structuredClone(state.standard.profiles);profiles[cls]=profile;
 if(pumpMax!==state.standard.pumpMax)profiles.UT.revision=version;
 if(draft.requireSpecification!==state.standard.requireSpecification)for(const p of Object.values(profiles))p.revision=version;
 const standard={version,pumpMax,requireSpecification:draft.requireSpecification,profiles,effectiveAt:now.toISOString(),reason:clean(draft.reason)};
 return event({...state,standard,revisions:[{...standard,actor:'Admin'},...state.revisions]},role,'Standard published',`STD-EQP · v${standard.version}`,standard.reason,now);
}
function validDate(value){if(!/^\d{4}-\d{2}-\d{2}$/.test(value||''))return false;const d=new Date(value+'T00:00:00Z');return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===value;}
export function transitionAsset(state,id,target,details,role,now=new Date()){
 requireRole(role);if(role!=='Admin')throw Error('Lifecycle approval requires the demo Admin.');
 const a=state.assets.find(x=>x.id===id);if(!a||!transitions(a.status).includes(target))throw Error('This lifecycle transition is not permitted.');
 if(clean(details.reason).length<10)throw Error('Provide an approval reason of at least 10 characters.');
 if(target==='active'&&validateAsset(a,state,a.id).length)throw Error('Resolve current-standard violations before changing lifecycle state.');
 if(target==='active'&&(!validDate(details.commissionedAt||a.commissionedAt)||!clean(details.acceptanceRef||a.acceptanceRef)))throw Error('Activation requires a valid commissioning date and acceptance reference.');
 if(target==='expired'&&a.openWork>0)throw Error('Retirement blocked: linked work remains open.');
 const updated={...a,status:target,...(target==='active'?{commissionedAt:details.commissionedAt||a.commissionedAt,acceptanceRef:clean(details.acceptanceRef||a.acceptanceRef)}:{}),...(target==='expired'?{retirementReason:clean(details.reason)}:{})};
 return event({...state,assets:state.assets.map(x=>x.id===id?updated:x)},role,'Lifecycle approved',id,`${a.status} → ${target} · ${clean(details.reason)}`,now);
}
export function previewImpact(state,draft){const simulated=publishStandard(state,{...draft,reason:clean(draft.reason)||'Draft standard impact preview'},'Admin');return state.assets.filter(a=>a.status!=='expired'&&validateAsset(a,simulated,a.id).length);}
export function exportSnapshot(state,now=new Date()){
 return {schemaVersion:'2.0.0',source:'master_data',siteId:SITE,synthetic:true,exportedAt:now.toISOString(),standard:state.standard,assets:state.assets.map(a=>({...a,conformance:validateAsset(a,state,a.id).length?'Review required':'Conforming'}))};
}
export const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function loadState(storage){try{const s=JSON.parse(storage.getItem('asset-standard-v2'));if(s?.schemaVersion==='2.0.0'&&s.siteId===SITE&&Array.isArray(s.assets)&&s.assets.length&&s.assets.every(a=>a&&typeof a.id==='string'&&CLASSES[a.assetClass]&&STATUSES.includes(a.status)&&typeof a.manufacturer==='string'&&typeof a.serial==='string')&&new Set(s.assets.map(a=>a.id)).size===s.assets.length&&s.standard?.profiles&&Object.keys(CLASSES).every(k=>s.standard.profiles[k])&&Array.isArray(s.documentCatalog)&&s.documentCatalog.every(d=>d&&typeof d.id==='string')&&Array.isArray(s.audit)&&Array.isArray(s.revisions)&&Number.isFinite(s.standard?.pumpMax)&&Number.isInteger(s.standard.version)&&typeof s.standard.requireSpecification==='boolean')return s;}catch{}return initialState();}
export function saveState(storage,state){try{storage.setItem('asset-standard-v2',JSON.stringify(state));return true;}catch{return false;}}
