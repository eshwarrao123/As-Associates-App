const fs=require('fs');const {PNG}=require('pngjs');
const p=PNG.sync.read(fs.readFileSync('assets/stitch-designs/admin-projects.png'));
const px=(x,y)=>{const i=(p.width*y+x)<<2;return [p.data[i],p.data[i+1],p.data[i+2]];};
const hex=c=>'#'+c.map(v=>v.toString(16).padStart(2,'0')).join('');
const lum=c=>0.299*c[0]+0.587*c[1]+0.114*c[2];
const X0=0,W=275,S=390/W;
const dx=x=>((x-X0)*S).toFixed(1), dy=y=>(y*S).toFixed(1);
function rowRuns(y,label){
  let out=[],pv=null,st=0;
  for(let x=X0;x<X0+W;x++){const h=hex(px(x,y));if(h!==pv){if(pv&&x-st>=2)out.push(`${dx(st)}-${dx(x-1)} w${((x-st)*S).toFixed(1)}:${pv}`);pv=h;st=x;}}
  out.push(`${dx(st)}-390 :${pv}`);
  console.log(`\n[${label}] y=${y} dy=${dy(y)}`); out.forEach(o=>console.log('  '+o));
}
function colRuns(x,y0,y1,label){
  let out=[],pv=null,st=0;
  for(let y=y0;y<=y1;y++){const h=hex(px(x,y));if(h!==pv){if(pv&&y-st>=2)out.push(`${dy(st)}-${dy(y-1)} h${((y-st)*S).toFixed(1)}:${pv}`);pv=h;st=y;}}
  console.log(`\n[${label} x=${dx(x)}]`); out.forEach(o=>console.log('  '+o));
}
// header bar
rowRuns(20,'header mid');
rowRuns(38,'header title row');
// find header bottom
for(let y=30;y<80;y++){if(hex(px(5,y))!==hex(px(5,y+1))){console.log('\nheader bottom y',dy(y+1),hex(px(5,y)),'->', hex(px(5,y+1)));break;}}
// filter bar
rowRuns(58,'filter bar');
rowRuns(68,'filter text row');
// first card
rowRuns(145,'card1 name row');
rowRuns(160,'card1 meta row');
rowRuns(175,'card1 progress row');
rowRuns(190,'card1 footer row');
// card borders
colRuns(12,130,230,'card1 left col');
