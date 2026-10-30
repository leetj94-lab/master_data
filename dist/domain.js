import {twinSeed} from './seed.js';
export const SITE='DEMO-PLANT-01';
export const CLASSES={UT:{label:'Centrifugal pump',unit:'m³/h',areas:['Pump hall'],min:1,max:500},CH:{label:'Water-cooled chiller',unit:'kW',areas:['Chiller bay'],min:1,max:2000},AH:{label:'Air handling unit',unit:'m³/h',areas:['Service deck'],min:1,max:50000},TK:{label:'Buffer tank',unit:'L',areas:['Chiller bay'],min:1,max:50000}};
export const STATUSES=['Registered','Commissioned','Operating','Suspended','Retired'];
const next={Registered:['Commissioned'],Commissioned:['Operating'],Operating:['Suspended'],Suspended:['Operating','Retired'],Retired:[]};
export const transitions=status=>next[status]||[];
export const initialStandard={version:1,pumpMax:500,requireSpecification:true,effectiveAt:'2026-10-01T00:00:00.000Z',reason:'Initial equipment identity and lifecycle standard'};
export function initialState(){return {schemaVersion:'1.0.0',siteId:SITE,standard:{...initialStandard},documentCatalog:[...twinSeed.assets.map(a=>({id:`SPEC-${a.id}-C`,status:'Approved'})),{id:'SPEC-CWP160-D',status:'Approved'}],revisions:[{...initialStandard,actor:'Standards administrator'}],assets:twinSeed.assets.map((a,i)=>({id:a.id,name:a.name,model:a.model,assetClass:a.id.split('-')[1],siteId:SITE,area:CLASSES[a.id.split('-')[1]].areas[0],capacity:parseFloat(a.flow.replaceAll(',','')),unit:CLASSES[a.id.split('-')[1]].unit,manufacturer:['Aster Industries','Nord Engineering','Aster Industries'][i%3],serial:`DEMO-${2020+i}-00${i+1}`,specificationRef:`SPEC-${a.id}-C`,criticality:i<3?'Critical':'Standard',status:'Operating',registeredStandard:1,commissionedAt:'2024-06-12',acceptanceRef:`ACC-${a.id}`,openWork:i===0?1:0,retirementReason:'',twinMapped:true})),audit:[{id:'AUD-SEED',at:'2026-10-01T09:00:00.000Z',actor:'Standards administrator',action:'Standard published',target:'STD-EQP · v1',detail:'Initial standard approved; 8 synthetic equipment records established.'}]};}
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
 if(clean(input.serial)&&state.assets.some(a=>a.id!==excludeId&&a.manufacturer.toLowerCase()===clean(input.manufacturer).toLowerCase()&&a.serial.toLowerCase()===clean(input.serial).toLowerCase()))add('serial','Manufacturer + serial number already exists, including retired equipment.');
 const max=input.assetClass==='UT'?state.standard.pumpMax:type?.max;
 if(!Number.isFinite(Number(input.capacity))||clean(input.capacity)===''||Number(input.capacity)<type?.min||Number(input.capacity)>max)add('capacity',`Capacity must be ${type?.min??1}–${max??'approved maximum'} ${type?.unit??''}.`);
 if(input.unit!==type?.unit)add('unit',`Use the standard unit ${type?.unit??'for the classification'}.`);
 if(!['Critical','Standard'].includes(input.criticality))add('criticality','Choose an approved criticality code.');
 if(state.standard.requireSpecification&&!clean(input.specificationRef))add('specificationRef','An approved specification reference is mandatory.');
 if(clean(input.specificationRef)&&!state.documentCatalog.some(d=>d.id===clean(input.specificationRef)&&d.status==='Approved'))add('specificationRef','Choose an existing approved specification; free-text or unapproved references are blocked.');
 return errors;
}
function event(state,actor,action,target,detail,now){return {...state,audit:[{id:`AUD-${now.getTime()}-${state.audit.length}`,at:now.toISOString(),actor,action,target,detail},...state.audit]};}
function requireRole(role){if(!['Operator','Admin'].includes(role))throw Error('Unknown demo role.');}
export function registerAsset(state,input,role,now=new Date()){
 requireRole(role);const errors=validateAsset(input,state);if(errors.length)throw Error(errors.map(e=>e.message).join(' '));
 const n=Math.max(0,...state.assets.filter(a=>a.assetClass===input.assetClass).map(a=>Number(a.id.split('-')[2])))+1;
 const id=`EQ-${input.assetClass}-${String(n).padStart(5,'0')}`;
 const a={id,name:clean(input.name),siteId:SITE,assetClass:input.assetClass,area:input.area,manufacturer:clean(input.manufacturer),model:clean(input.model),serial:clean(input.serial),capacity:Number(input.capacity),unit:input.unit,criticality:input.criticality,specificationRef:clean(input.specificationRef),status:'Registered',registeredStandard:state.standard.version,commissionedAt:'',acceptanceRef:'',openWork:0,retirementReason:'',twinMapped:false};
 return event({...state,assets:[a,...state.assets]},role,'Equipment registered',id,`Validated against STD-EQP v${state.standard.version}; immutable ID allocated.`,now);
}
export function reviseAsset(state,id,changes,reason,role,now=new Date()){
 requireRole(role);const a=state.assets.find(a=>a.id===id);if(!a||a.status==='Retired')throw Error('Retired or unknown equipment cannot be edited.');
 if(clean(reason).length<10)throw Error('Provide a change reason of at least 10 characters.');
 // Identity/class/location linkage is fixed in this demo; editable master attributes are explicit.
 const permitted=['name','manufacturer','model','serial','capacity','unit','specificationRef','criticality'];
 const updated={...a};for(const k of permitted)if(k in changes)updated[k]=k==='capacity'?Number(changes[k]):clean(changes[k]);
 const errors=validateAsset(updated,state,id);if(errors.length)throw Error(errors.map(e=>e.message).join(' '));
 updated.registeredStandard=state.standard.version;
 return event({...state,assets:state.assets.map(x=>x.id===id?updated:x)},role,'Master data revised',id,`${clean(reason)} · ${permitted.filter(k=>String(a[k])!==String(updated[k])).map(k=>`${k}: ${a[k]} → ${updated[k]}`).join('; ')||'Revalidated without attribute changes'}`,now);
}
export function publishStandard(state,draft,role,now=new Date()){
 if(role!=='Admin')throw Error('Only the demo Admin can publish standards.');
 const pumpMax=Number(draft.pumpMax);if(!Number.isFinite(pumpMax)||pumpMax<1||pumpMax>5000)throw Error('Pump limit must be between 1 and 5,000 m³/h.');
 if(typeof draft.requireSpecification!=='boolean')throw Error('Invalid specification rule.');
 if(clean(draft.reason).length<10)throw Error('Provide a publication reason of at least 10 characters.');
 const standard={version:state.standard.version+1,pumpMax,requireSpecification:draft.requireSpecification,effectiveAt:now.toISOString(),reason:clean(draft.reason)};
 return event({...state,standard,revisions:[{...standard,actor:'Admin'},...state.revisions]},role,'Standard published',`STD-EQP · v${standard.version}`,standard.reason,now);
}
function validDate(value){if(!/^\d{4}-\d{2}-\d{2}$/.test(value||''))return false;const d=new Date(value+'T00:00:00Z');return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===value;}
export function transitionAsset(state,id,target,details,role,now=new Date()){
 requireRole(role);if(role!=='Admin')throw Error('Lifecycle approval requires the demo Admin.');
 const a=state.assets.find(x=>x.id===id);if(!a||!transitions(a.status).includes(target))throw Error('This lifecycle transition is not permitted.');
 if(clean(details.reason).length<10)throw Error('Provide an approval reason of at least 10 characters.');
 if(['Commissioned','Operating'].includes(target)&&validateAsset(a,state,a.id).length)throw Error('Resolve current-standard violations before changing lifecycle state.');
 if(target==='Commissioned'&&(!validDate(details.commissionedAt)||!clean(details.acceptanceRef)))throw Error('Commissioning date and acceptance reference are mandatory.');
 if(target==='Operating'&&!clean(a.acceptanceRef))throw Error('An acceptance reference is required before operation.');
 if(target==='Retired'&&a.openWork>0)throw Error('Retirement blocked: linked work remains open.');
 const updated={...a,status:target,...(target==='Commissioned'?{commissionedAt:details.commissionedAt,acceptanceRef:clean(details.acceptanceRef)}:{}),...(target==='Retired'?{retirementReason:clean(details.reason)}:{})};
 return event({...state,assets:state.assets.map(x=>x.id===id?updated:x)},role,'Lifecycle approved',id,`${a.status} → ${target} · ${clean(details.reason)}`,now);
}
export function previewImpact(state,draft){const simulated={...state,standard:{...state.standard,pumpMax:Number(draft.pumpMax),requireSpecification:draft.requireSpecification}};return state.assets.filter(a=>a.status!=='Retired'&&validateAsset(a,simulated,a.id).length);}
export function exportSnapshot(state,now=new Date()){
 return {schemaVersion:'1.0.0',source:'master_data',siteId:SITE,synthetic:true,exportedAt:now.toISOString(),standard:state.standard,assets:state.assets.map(a=>({...a,conformance:validateAsset(a,state,a.id).length?'Review required':'Conforming'}))};
}
export const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function loadState(storage){try{const s=JSON.parse(storage.getItem('asset-standard-v1'));if(s?.schemaVersion==='1.0.0'&&s.siteId===SITE&&Array.isArray(s.assets)&&s.assets.length&&s.assets.every(a=>a&&typeof a.id==='string'&&CLASSES[a.assetClass]&&STATUSES.includes(a.status)&&typeof a.manufacturer==='string'&&typeof a.serial==='string')&&new Set(s.assets.map(a=>a.id)).size===s.assets.length&&Array.isArray(s.documentCatalog)&&s.documentCatalog.every(d=>d&&typeof d.id==='string')&&Array.isArray(s.audit)&&Array.isArray(s.revisions)&&Number.isFinite(s.standard?.pumpMax)&&Number.isInteger(s.standard.version)&&typeof s.standard.requireSpecification==='boolean')return s;}catch{}return initialState();}
export function saveState(storage,state){try{storage.setItem('asset-standard-v1',JSON.stringify(state));return true;}catch{return false;}}
