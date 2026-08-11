const fs=require('fs');const {PNG}=require('pngjs');
const p=PNG.sync.read(fs.readFileSync('assets/stitch-designs/admin-projects.png'));
const px=(x,y)=>{const i=(p.width*y+x)<<2;return [p.data[i],p.data[i+1],p.data[i+2]];};
const hex=c=>'#'+c.map(v=>v.toString(16).padStart(2,'0')).join('');
const lum=c=>0.299*c[0]+0.587*c[1]+0.114*c[2];
console.log('png',p.width,'x',p.height);
// find viewport: scan left edge for device frame
let X0=0;for(let x=0;x<20;x++){if(lum(px(x,Math.floor(p.height/2)))<200&&lum(px(x+1,Math.floor(p.height/2)))>200){X0=x+1;break;}}
let X1=p.width-1;for(let x=p.width-1;x>p.width-20;x--){if(lum(px(x,Math.floor(p.height/2)))<200&&lum(px(x-1,Math.floor(p.height/2)))>200){X1=x-1;break;}}
const W=X1-X0+1, S=390/W;
console.log('viewport x',X0,'-',X1,'W',W,'scale',S.toFixed(4));
const dx=x=>((x-X0)*S).toFixed(1), dy=y=>(y*S).toFixed(1);
// column scan for structure
console.log('\n=== column scan x=140 ===');
let prev=null,st=0;
for(let y=0;y<p.height;y++){
  const h=hex(px(140,y));
  if(h!==prev){if(prev&&y-st>=3)console.log(` ${dy(st)}-${dy(y-1)} h${((y-st)*S).toFixed(1)} ${prev}`);prev=h;st=y;}
}
