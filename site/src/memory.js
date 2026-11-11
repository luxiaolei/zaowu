import {SKILLS, PROJECTS, THEMES, AGE_BANDS, SUPPORTS} from './catalog.js';
export const EVIDENCE_VERSION = 'local-rubric/1';
const DAY = 86400000;
const unique = xs => [...new Set(xs)];
export const newId = prefix => `${prefix}_${globalThis.crypto.randomUUID()}`;
export function createProfile({ageBand = '7–9', interests = ['space'], support = 'step', experience = 'new'} = {}) {
  if (!AGE_BANDS.includes(ageBand) || !Object.hasOwn(SUPPORTS, support)) throw new Error('不支持的年龄或提示设置');
  const selected = unique(interests).filter(x => Object.hasOwn(THEMES, x)).slice(0, 3);
  return {id: newId('child'), ageBand, interests: selected.length ? selected : ['space'], support,
    experience: ['new','drawing','stories','blocks'].includes(experience) ? experience : 'new',
    createdAt: new Date().toISOString(), preferenceSource: 'guardian_selected', version: 1};
}
export function validateEvidence(e, childId) {
  return !!e && typeof e.id === 'string' && e.id.length < 100 && e.childId === childId &&
    typeof e.projectId === 'string' && typeof e.taskId === 'string' &&
    Object.hasOwn(SKILLS, e.skillId) && ['independent','supported','retry','observation','uncertain'].includes(e.outcome) &&
    Number.isInteger(e.attempt) && e.attempt >= 1 && e.attempt <= 100 &&
    typeof e.hintUsed === 'boolean' && typeof e.contentKey === 'string' &&
    typeof e.context === 'string' && Number.isFinite(Date.parse(e.at)) &&
    e.rubricVersion === EVIDENCE_VERSION;
}
export function appendEvidence(entries, event, childId) {
  if (!validateEvidence(event, childId)) throw new Error('学习证据格式无效或不属于当前孩子');
  // Network retries / double clicks must not inflate evidence.
  if (entries.some(e => e.id === event.id)) return entries;
  return [...entries, event].slice(-500);
}
export function activeEvidence(entries, childId, now = Date.now()) {
  return entries.filter(e => validateEvidence(e, childId) && !e.retracted &&
    Date.parse(e.at) <= now + 60000 && now - Date.parse(e.at) <= 90 * DAY);
}
export function skillSummary(entries, childId, skillId, now = Date.now()) {
  const all = activeEvidence(entries, childId, now).filter(e => e.skillId === skillId);
  const scored = all.filter(e => ['independent','supported','retry'].includes(e.outcome));
  const groups = new Map();
  for (const e of scored) {
    const key = `${e.projectId}:${e.taskId}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(e);
  }
  const firsts = [...groups.values()].map(es => es.sort((a,b) => a.attempt-b.attempt)[0]);
  const successes = firsts.filter(e => e.outcome === 'independent' && !e.hintUsed);
  const supported = firsts.filter(e => e.outcome === 'supported' || e.hintUsed);
  const retries = firsts.filter(e => e.outcome === 'retry');
  const contexts = unique(successes.map(e => e.context));
  const distinctContent = unique(successes.map(e => e.contentKey));
  const latest = all.length ? Math.max(...all.map(e => Date.parse(e.at))) : null;
  let status = 'unknown', label = '还在认识你';
  if (firsts.length) { status = 'exploring'; label = '正在探索'; }
  // A single mistake, repeated guesses, or a late correct retry is NOT a deficit diagnosis.
  if (unique(retries.map(e => e.contentKey)).length >= 2) { status = 'support'; label = '下次多给一点支架'; }
  if (successes.length >= 3 && distinctContent.length >= 3 && contexts.length >= 2) {
    status = 'progress'; label = '不同情境中都有进展';
  }
  if (latest !== null && now-latest > 30*DAY) { status='revisit'; label='隔一段时间再试试'; }
  return {skillId, status, label, confidence: firsts.length < 3 ? 'low' : 'moderate',
    opportunities: firsts.length, independent: successes.length, supported: supported.length,
    initialRetries: retries.length, contexts: contexts.length, latest,
    evidenceIds: all.map(e => e.id), disclaimer: '规则摘要，不是能力诊断或标准化测评'};
}
export function learnerSnapshot(profile, entries, projects = [], now = Date.now()) {
  const active = activeEvidence(entries, profile.id, now);
  return {profile, skills: Object.keys(SKILLS).map(id => skillSummary(active, profile.id, id, now)),
    recentProjects: projects.filter(p => p.childId === profile.id && p.completed).slice(-3),
    evidenceCount: active.length};
}
export function recommend(profile, entries, projects = [], now = Date.now()) {
  const snapshot = learnerSnapshot(profile, entries, projects, now);
  const candidates = PROJECTS.map(project => {
    const skills = snapshot.skills.filter(s => project.skills.includes(s.skillId));
    const gap = skills.find(s => s.status === 'support');
    const due = skills.find(s => s.status === 'revisit');
    const completed = snapshot.recentProjects.some(p => p.kind === project.id);
    const relatedExperience = {drawing:'garden',stories:'story',blocks:'sky'}[profile.experience] === project.id;
    const last = snapshot.recentProjects.at(-1)?.kind === project.id;
    const score = (gap?6:0)+(due?4:0)+(!completed?2:0)+(relatedExperience?1:0)-(last?1:0);
    const theme = profile.interests[0] || 'space';
    return {project, score, theme, support: gap ? 'example' : profile.support,
      reason: gap ? `在不同小任务里，${SKILLS[gap.skillId].name}还需要更多支架；先用小例子再试一次。` :
        due ? `${SKILLS[due.skillId].name}已有一段时间没练习，换个情境回顾。` :
          relatedExperience ? '从家长选择的已有经验出发，再尝试一个新变化。' :
            completed ? '试一个不同情境，看看能不能迁移。' : '先做一个短项目，认识你的想法与做法。',
      evidenceIds: gap?.evidenceIds || due?.evidenceIds || [],
      // Not a diagnosis, IQ score, or fixed learning-style classification.
      policyVersion: 'teaching-policy/1'};
  });
  return candidates.sort((a,b) => b.score-a.score);
}
export function retractEvidence(entries, id) {
  return entries.map(e => e.id === id ? {...e, retracted: true, retractedAt: new Date().toISOString(),
    retractionReason: 'guardian_correction'} : e);
}
