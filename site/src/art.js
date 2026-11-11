/** Procedural, original SVG artwork. This is not a generative AI provider. */
export const PALETTES={warm:['#fff3de','#ff9d77','#7758b5'],cool:['#e6f6ff','#75bfcb','#5f68ad'],forest:['#edf5df','#8db67d','#df9f65']};
export const escapeXML=s=>String(s).replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]));
export function artwork({theme='space',palette='warm',subject='friend',variant=0,title='我的小小世界',kind='art'}={}) {
  const [bg,accent,ink]=PALETTES[palette]||PALETTES.warm;
  const v=Number.isInteger(variant)?Math.abs(variant)%12:0;
  const safeTitle=escapeXML(String(title).slice(0,40));
  let scenery='';
  if(theme==='space') {
    scenery=Array.from({length:18},(_,i)=>`<circle cx="${30+(i*83+v*17)%740}" cy="${25+(i*47)%290}" r="${i%3+2}" fill="${ink}" opacity=".28"/>`).join('')+
    `<circle cx="620" cy="145" r="67" fill="${accent}"/><ellipse cx="620" cy="145" rx="100" ry="18" fill="none" stroke="${ink}" stroke-width="9" transform="rotate(-24 620 145)"/>`;
  }else if(theme==='ocean'){
    scenery=`<path d="M0 270 Q100 215 200 270 T400 270 T600 270 T800 270 V500 H0Z" fill="#80c4cf"/><path d="M0 320 Q100 270 200 320 T400 320 T600 320 T800 320 V500 H0Z" fill="#5797be" opacity=".5"/><circle cx="660" cy="110" r="46" fill="#ffd787"/>`;
  }else{
    scenery=`<circle cx="660" cy="100" r="45" fill="#ffcf82"/><path d="M0 350 Q170 210 350 350 T800 330 V500 H0Z" fill="#a7c99c"/>`+
      [100,630,710].map((x,i)=>`<path d="M${x} 100 l-55 170 h110Z" fill="${i%2?'#759d79':'#91b384'}"/><rect x="${x-7}" y="265" width="14" height="75" rx="4" fill="#af8e6f"/>`).join('');
  }
  const hero=subject==='house'?`<path d="M280 265 L400 165 L520 265" fill="${accent}"/><rect x="300" y="260" width="200" height="125" rx="14" fill="#fffdf6"/><rect x="375" y="310" width="50" height="75" rx="9" fill="${ink}"/><circle cx="345" cy="295" r="15" fill="${accent}"/>`:
   subject==='flower'?`<g transform="translate(400 255)">${Array.from({length:6},(_,i)=>`<ellipse cx="0" cy="-58" rx="32" ry="55" fill="${accent}" transform="rotate(${i*60})"/>`).join('')}<circle r="42" fill="#ffe2a3"/><path d="M-13 -3 Q-6 -12 0 -3 M10 -3 Q17 -12 24 -3" fill="none" stroke="${ink}" stroke-width="5"/><path d="M-10 15 Q5 30 20 15" fill="none" stroke="${ink}" stroke-width="5"/></g>`:
   `<g transform="translate(${385+v%3*12} 275)"><rect x="-76" y="-75" width="152" height="148" rx="53" fill="${ink}"/><rect x="-61" y="-61" width="122" height="90" rx="36" fill="#fffdf6"/><circle cx="-24" cy="-20" r="8" fill="${ink}"/><circle cx="24" cy="-20" r="8" fill="${ink}"/><path d="M-13 3 Q0 19 13 3" fill="none" stroke="${ink}" stroke-width="5" stroke-linecap="round"/><path d="M-72 18 L-100 38 M72 18 L102 0" stroke="${ink}" stroke-width="22" stroke-linecap="round"/><path d="M-32 65 L-40 99 M32 65 L40 99" stroke="${ink}" stroke-width="24" stroke-linecap="round"/><path d="M0 -75 V-100" stroke="${ink}" stroke-width="8"/><circle cy="-104" r="12" fill="${accent}"/></g>`;
  const extras=kind==='sky'?`<path d="M325 260L280 140 M470 260L530 140" stroke="${ink}" stroke-width="3"/><ellipse cx="275" cy="100" rx="40" ry="53" fill="${accent}"/><ellipse cx="535" cy="100" rx="40" ry="53" fill="#8fc5b4"/>`:'';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" role="img" aria-label="${safeTitle}"><rect width="800" height="500" rx="28" fill="${bg}"/>${scenery}<ellipse cx="400" cy="397" rx="140" ry="15" fill="${ink}" opacity=".08"/>${hero}${extras}<rect x="180" y="431" width="440" height="45" rx="22" fill="#ffffff" opacity=".82"/><text x="400" y="461" font-family="system-ui,sans-serif" font-size="20" text-anchor="middle" fill="${ink}">${safeTitle}</text></svg>`;
}
