import {newId} from './memory.js';
import {projectById} from './catalog.js';
export function createProject(profile, kind, theme, support = profile.support, runIndex = 0) {
  if (!projectById(kind)) throw new Error('未知项目');
  return {id: newId('project'), childId: profile.id, kind, theme, support, ageBand: profile.ageBand,
    stage: 0, choice: null, palette: 'warm', variant: runIndex % 6, decisions: [],
    attempts: {}, hints: {}, solved: {}, reflection: null, completed: false,
    startedAt: new Date().toISOString()};
}
export function taskFor(project, transfer = false) {
  const advanced = project.ageBand === '10–12';
  const young = project.ageBand === '5–6';
  const variation = project.variant % 3;
  if (project.kind === 'sky') {
    const target = (young ? 3 : advanced ? 8 : 5) + variation + (transfer?2:0);
    const capacity = (advanced ? 3 : 2);
    const answer = Math.ceil(target/capacity);
    return {id: transfer?'transfer':'main', skillId:'comparison', answer,
      contentKey: `comparison:${target}:${capacity}`, context: transfer?'rescue':'delivery',
      title: transfer?'换个任务：救援站的包裹多了！':'怎样刚好带走所有包裹？',
      prompt: `有 ${target} 个包裹。每个小气球可以带 ${capacity} 个包裹。最少需要几个气球？`,
      options: [answer-1,answer,answer+1].map(n => ({value:n,label:`${n} 个气球`})),
      target, capacity, hint: `把 ${target} 个包裹每 ${capacity} 个圈成一组。最后没满的一组，也要一个气球。`,
      explanation:`${answer} 个气球可以带 ${answer*capacity} 个包裹，足够带走 ${target} 个；少一个就不够了。`};
  }
  if (project.kind === 'garden') {
    const base = advanced ? (variation%2 ? ['🌷','🌷','🌼']:['🌷','🌼','🌼']) :
      young ? ['🌷','🌼'] : (variation%2 ? ['🌷','🌼','🌼']:['🌷','🌼']);
    const unit = transfer ? base.map(x => x === '🌷'?'🌙':'⭐') : base;
    const pattern = [...unit,...unit];
    const remove = advanced ? pattern.length-2 : pattern.length-1;
    const answer = pattern[remove];
    pattern[remove]='？';
    return {id:transfer?'transfer':'main',skillId:'pattern',answer,
      contentKey:`pattern:${unit.join('')}:${remove}`,context:transfer?'night-sky':'flowerbed',
      title:transfer?'把花园节奏搬到夜空':'哪一朵花接得上节奏？',
      prompt:`${pattern.join('　')}`,options:[...new Set(unit)].map(v=>({value:v,label:v})),
      hint:`试着找出重复的一组：${unit.join(' → ')}。然后从头指着读一遍。`,
      explanation:`重复的一组是 ${unit.join(' → ')}，这个位置需要 ${answer}。`};
  }
  if (transfer) return {id:'transfer',skillId:'cause',answer:'bridge',contentKey:'cause:bridge:rain',context:'rainy-river',
    title:'换个场景：下雨后的小河',prompt:'小河涨水，小伙伴不能直接走过去。哪个办法能帮助大家过河？',
    options:[{value:'bridge',label:'用长木板搭一座小桥'},{value:'paint',label:'给背包装一个好看的贴纸'},{value:'wait',label:'把地图转个方向'}],
    hint:'想一想：什么东西能连接小河两边？这里只是故事，现实中不要独自靠近河流。',
    explanation:'桥连接了小河两边，所以小伙伴可以过河。现实中的河流需要大人照看。'};
  const variants=[
    {prompt:'小伙伴想给种子浇水，怎样安排事情才连贯？',options:[{value:'ordered',label:'发现干土 → 找水 → 浇水'},{value:'mixed',label:'浇水 → 找水 → 发现干土'},{value:'backwards',label:'找水 → 浇水 → 第一次发现干土'}],hint:'先发现需要，再准备材料，最后行动。',explanation:'先看见干土，才知道需要水；拿到水，才能给种子浇水。'},
    {prompt:'小伙伴要送生日卡片，怎样安排事情才连贯？',options:[{value:'ordered',label:'想到祝福 → 做卡片 → 送给朋友'},{value:'mixed',label:'送卡片 → 做卡片 → 想到祝福'},{value:'backwards',label:'做卡片 → 送卡片 → 第一次想到祝福'}],hint:'先有一个想法，再把它做出来，最后交给朋友。',explanation:'祝福给了卡片内容；做好的卡片，才可以送出去。'}
  ];
  return {id:'main',skillId:'sequence',answer:'ordered',contentKey:`sequence:${project.variant%2}`,context:project.variant%2?'birthday':'garden-care',
    title:'帮故事找到先后顺序',...variants[project.variant%2]};
}
export function checkAnswer(task, answer) { return task.options.some(o=>o.value===answer) && answer===task.answer; }
export function canFinish(project) {
  return !!project.choice && project.solved.main === true && project.solved.transfer === true &&
    !!project.reflection && project.decisions.length >= 3;
}
export function nextStage(project) {
  if (project.stage===0 && !project.choice) return false;
  if (project.stage===2 && !project.solved.main) return false;
  if (project.stage===3 && !project.solved.transfer) return false;
  if (project.stage===4 && !project.reflection) return false;
  project.stage=Math.min(5,project.stage+1); return true;
}
