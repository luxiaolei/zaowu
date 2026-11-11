import {readdir,readFile} from 'node:fs/promises';
import {join} from 'node:path';
import assert from 'node:assert/strict';
const html=await readFile('site/index.html','utf8');
assert.ok(html.includes('Content-Security-Policy'));
assert.ok(html.includes("connect-src 'self'"));
assert.equal(/<script[^>]+src=["']https?:/i.test(html),false);
for(const file of await readdir('site/src')){
 const s=await readFile(join('site/src',file),'utf8');
 assert.equal(/getUserMedia|SpeechRecognition|fetch\s*\(/.test(s),false,`${file}: trial must not capture or upload`);
 assert.equal(/\b(sk-[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{20,})\b/.test(s),false,`${file}: probable secret`);
}
for(const f of ['README.md','LICENSE','SECURITY.md','docs/PRD.md','docs/LEARNER_MODEL.md','docs/TEACHING_DESIGN.md','docs/ARCHITECTURE.md','docs/IMAGE_PIPELINE.md','docs/ROADMAP.md','docs/TEST_PLAN.md','docs/PRIVACY.md','docs/COST_MODEL.md'])assert.ok((await readFile(f,'utf8')).length>100,f);
console.log('Static safety and document checks passed. Not a security certification.');
