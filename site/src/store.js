import {AGE_BANDS, THEMES, SUPPORTS, projectById} from './catalog.js';
import {validateEvidence} from './memory.js';
export const STORAGE_KEY='zaowu:trial:v1';
export const emptyState=()=>({schemaVersion:1,profile:null,consent:null,evidence:[],projects:[],art:[],updatedAt:null});
export function sanitizeState(value) {
  const d=emptyState();
  if(!value || value.schemaVersion!==1 || !value.profile) return d;
  const p=value.profile;
  if(typeof p.id!=='string'||!AGE_BANDS.includes(p.ageBand)||!Array.isArray(p.interests)||
    !p.interests.length||!p.interests.every(x=>Object.hasOwn(THEMES,x))||!Object.hasOwn(SUPPORTS,p.support)) return d;
  if(!value.consent || value.consent.version!=='trial-consent/1') return d;
  d.profile={id:p.id,ageBand:p.ageBand,interests:p.interests.slice(0,3),support:p.support,
    experience:['new','drawing','stories','blocks'].includes(p.experience)?p.experience:'new',
    createdAt:p.createdAt,preferenceSource:'guardian_selected',version:1};
  d.consent={version:'trial-consent/1',at:value.consent.at};
  d.evidence=(Array.isArray(value.evidence)?value.evidence:[]).filter(e=>validateEvidence(e,p.id)).slice(-500);
  d.projects=(Array.isArray(value.projects)?value.projects:[]).filter(x=>x.childId===p.id&&projectById(x.kind)&&
    Object.hasOwn(THEMES,x.theme)&&Number.isInteger(x.stage)&&x.stage>=0&&x.stage<=5&&
    Array.isArray(x.decisions)&&x.attempts&&x.solved&&x.hints&&
    ['warm','cool','forest'].includes(x.palette)&&[null,'friend','house','flower'].includes(x.choice)&&
    AGE_BANDS.includes(x.ageBand)&&Object.hasOwn(SUPPORTS,x.support)&&
    Number.isInteger(x.variant)&&typeof x.completed==='boolean').slice(-40);
  d.art=(Array.isArray(value.art)?value.art:[]).filter(x=>x.childId===p.id&&Object.hasOwn(THEMES,x.theme)&&
    ['friend','house','flower'].includes(x.subject)&&['warm','cool','forest'].includes(x.palette)).slice(-30);
  d.updatedAt=value.updatedAt;return d;
}
export function loadState(storage=globalThis.localStorage) {
  try { return sanitizeState(JSON.parse(storage.getItem(STORAGE_KEY)||'null')); }
  catch { return emptyState(); }
}
export function saveState(state,storage=globalThis.localStorage) {
  state.updatedAt=new Date().toISOString();
  // Raw evidence expires after 90 days; it is not invisibly retained in a vector store.
  const cutoff=Date.now()-90*86400000;
  state.evidence=state.evidence.filter(e=>Date.parse(e.at)>=cutoff).slice(-500);
  try { storage.setItem(STORAGE_KEY,JSON.stringify(state)); return true; }
  catch { return false; }
}
export function clearState(storage=globalThis.localStorage){storage.removeItem(STORAGE_KEY);return emptyState();}
