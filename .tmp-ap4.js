const fs=require('fs');const {PNG}=require('pngjs');
const p=PNG.sync.read(fs.readFileSync('assets/stitch-designs/admin-projects.png'));
const px=(x,y)=>{const i=(p.width*y+x)<<2;return [p.data[i],p.data[i+1],p.data[i+2]];};
const hex=c=>'#'+c.map(v=>v.toString(16).padStart(2,'0')).join('');
const lum=c=>0.299*c[0]+0.587*c[1]+0.114*c[2];
const S=390/275;
const dy=y=>(y*S).toFixed(1);

// Find where navy header actually starts — scan center column for navy (#1a3c5e family: R<60,G<80,B>60)
function isNavy(c){return c[0]<80&&c[1]<90&&c[2]>60&&c[2]-c[0]>30;}
function isAccent(c){return c[0]>200&&c[1]>130&&c[2]<60;}
console.log('=== navy pixels in center column x=137 ===');
for(let y=0;y<120;y++){const c=px(137,y);if(isNavy(c))console.log(' y',dy(y),hex(c));}

console.log('\n=== accent/amber region in filter bar: y scan x=340 ===');
for(let y=44;y<120;y++){const c=px(340,y);const h=hex(c);if(h!==hex(px(340,y-1)))console.log(' y',dy(y),h);}

console.log('\n=== filter tab heights: where does white/surface appear x=50 ===');
let prev=null;
for(let y=44;y<115;y++){const h=hex(px(50,y));if(h!==prev){console.log(' y',dy(y),h);prev=h;}}

console.log('\n=== card1 precise vertical: x=100 ===');
prev=null;
for(let y=120;y<250;y++){const h=hex(px(100,y));if(h!==prev){console.log(' y',dy(y),h);prev=h;}}

console.log('\n=== card left status border: x=22 col for first card ===');
prev=null;
for(let y=140;y<230;y++){const h=hex(px(22,y));if(h!==prev){console.log(' y',dy(y),h);prev=h;}}

// sample the meta chip color precisely  
console.log('\n=== meta chip color samples ===');
console.log('chip center ~(45,160):',hex(px(45,160)));
console.log('chip center ~(48,162):',hex(px(48,162)));
console.log('chip center ~(50,161):',hex(px(50,161)));
console.log('badge area ~(300,157):',hex(px(300,157)));
console.log('badge area ~(310,160):',hex(px(310,160)));
console.log('badge area ~(320,158):',hex(px(320,158)));
