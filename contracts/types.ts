/** Target service contracts. Types do not imply an online API exists. */
export type AgeBand = '5–6'|'7–9'|'10–12';
export type SkillId = 'comparison'|'pattern'|'sequence'|'cause'|'reflection';
export type Outcome = 'independent'|'supported'|'retry'|'observation'|'uncertain';
export interface EvidenceEvent {
  id:string; childId:string; projectId:string; taskId:string; skillId:SkillId;
  contentKey:string; context:string; attempt:number; hintUsed:boolean;
  outcome:Outcome; at:string; rubricVersion:string; retracted?:boolean;
}
export interface LearnerProfile {
  id:string; ageBand:AgeBand; interests:Array<'space'|'ocean'|'forest'>;
  support:'step'|'example'|'try'; experience:'new'|'drawing'|'stories'|'blocks';
  preferenceSource:'guardian_selected'; version:number;
}
export interface TeachingContext {
  childId:string; snapshotVersion:string; ageBand:AgeBand;
  verifiedPreferences:string[]; relevantProjects:string[];
  evidence:EvidenceEvent[]; uncertainties:string[]; budget:BudgetLimits;
}
export interface TeachingPlan {
  planId:string; childId:string; contextVersion:string; projectKind:string;
  targetSkillIds:SkillId[]; rationale:string; sourceEvidenceIds:string[];
  supportLevel:0|1|2|3|4; nextPrompt:string; childDecisionRequired:boolean;
  allowedActions:Array<'choose'|'hint'|'propose_patch'|'test'|'reflect'|'save'>;
  policyVersion:string;
}
export interface BudgetLimits {
  currency:'CNY'; maxRequestCost:number; remainingProjectCost:number;
  maxImageCandidates:number; maxRetries:number; maxAvatarSeconds:number;
}
export interface ImageBrief {
  subject:string; setting:string; palette:string; style:string;
  purpose:'character'|'scene'|'sticker'|'cover'|'project-asset';
  childDecisionIds:string[]; changeRequest?:string;
}
export interface MemoryClaim {
  id:string; childId:string; kind:'declaration'|'observation'|'hypothesis';
  text:string; sourceEvidenceIds:string[]; confidence:'low'|'moderate';
  expiresAt:string; status:'proposed'|'approved'|'retracted';
}
