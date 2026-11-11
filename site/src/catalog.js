/** All activities are authored; external model outputs never execute as code. */
export const AGE_BANDS = ['5–6', '7–9', '10–12'];
export const THEMES = {
  space: {name: '太空', icon: '🪐', scene: '星球', hero: '小宇航员'},
  ocean: {name: '海洋', icon: '🐳', scene: '海岛', hero: '小鲸鱼'},
  forest: {name: '森林', icon: '🌿', scene: '森林', hero: '小狐狸'}
};
export const SKILLS = {
  comparison: {name: '比较数量', description: '比较两个数量，再判断是否足够。', prereqs: []},
  pattern: {name: '发现重复规律', description: '找到重复的一组，而不是只猜下一个。', prereqs: []},
  sequence: {name: '安排先后顺序', description: '把目标、行动和结果排成能理解的顺序。', prereqs: []},
  cause: {name: '解释原因', description: '用发生过的事情解释一个结果。', prereqs: ['sequence']},
  reflection: {name: '回顾并修改', description: '说出自己的选择，并愿意修改一次。', prereqs: []}
};
export const PROJECTS = [
  {id: 'sky', name: '天空运输队', icon: '🎈', tag: '数量 × 小实验', duration: '8–12 分钟',
   desc: '搭一艘小飞艇，让物资安全到达。', skills: ['comparison', 'reflection'], color: 'peach'},
  {id: 'garden', name: '会跳舞的花园', icon: '🌼', tag: '规律 × 动画', duration: '8–12 分钟',
   desc: '发现花朵的节奏，把它变成一段动画。', skills: ['pattern', 'reflection'], color: 'mint'},
  {id: 'story', name: '小小故事导演', icon: '📖', tag: '顺序 × 表达', duration: '8–12 分钟',
   desc: '给故事一个目标、一个办法和一个结局。', skills: ['sequence', 'cause', 'reflection'], color: 'lilac'}
];
export const SUPPORTS = {
  step: '一次说一步', example: '先看一个小例子', try: '让我先试一试'
};
export const STAGES = ['选想法', '做一做', '试一试', '换个情境', '说一说', '保存作品'];
export function projectById(id) { return PROJECTS.find(p => p.id === id); }
