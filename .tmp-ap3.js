const fs=require('fs');const {PNG}=require('pngjs');
const p=PNG.sync.read(fs.readFileSync('assets/stitch-designs/admin-projects.png'));
const px=(x,y)=>{const i=(p.width*y+x)<<2;return [p.data[i],p.data[i+1],p.data[i+2]];};
const hex=c=>'#'+c.map(v=>v.toString(16).padStart(2,'0')).join('');
const lum=c=>0.299*c[0]+0.587*c[1]+0.114*c[2];
const X0=0,W=275,S=390/W;
const dx=x=>((x-X0)*S).toFixed(1), dy=y=>(y*S).toFixed(1);

// find exact header height (where background changes from navy to filter-bg)
console.log('=== header exact bounds ===');
for(let y=0;y<80;y++){
  const c=hex(px(5,y));
  if(c!==hex(px(5,Math.max(0,y-1))))console.log(' y',dy(y),c);
}

// add button bounds
console.log('\n=== add button x scan at header mid y=20 ===');
let prev=null,st=0,out=[];
for(let x=X0;x<X0+W;x++){const h=hex(px(x,20));if(h!==prev){if(prev&&x-st>=2)out.push(`${dx(st)}-${dx(x-1)} w${((x-st)*S).toFixed(1)}:${h}`);prev=h;st=x;}}
out.forEach(o=>console.log(' '+o));

// filter bar height
console.log('\n=== filter bar col x=5 ===');
prev=null;
for(let y=44;y<110;y++){const h=hex(px(5,y));if(h!==prev){console.log(' y',dy(y),h);prev=h;}}

// card 1 complete vertical extent
console.log('\n=== card1 col x=20 ===');
prev=null;st=0;
for(let y=120;y<240;y++){const h=hex(px(20,y));if(h!==prev){if(prev&&y-st>=2)console.log(` ${dy(st)}-${dy(y-1)} h${((y-st)*S).toFixed(1)} ${prev}`);prev=h;st=y;}}

// card left border (status color strip)
console.log('\n=== card left border strip, y=150 x scan ===');
prev=null;
for(let x=0;x<25;x++){const h=hex(px(x,150));if(h!==prev){console.log(' x',dx(x),h);prev=h;}}

// progress bar row detail
console.log('\n=== progress bar colors y=176 ===');
prev=null;st=0;out=[];
for(let x=X0;x<X0+W;x++){const h=hex(px(x,176));if(h!==prev){if(prev&&x-st>=2)out.push(`${dx(st)}-${dx(x-1)}:${h}`);prev=h;st=x;}}
out.forEach(o=>console.log(' '+o));

// "View Details" link row  
console.log('\n=== footer row y=192 ===');
prev=null;st=0;out=[];
for(let x=X0;x<X0+W;x++){const h=hex(px(x,192));if(h!==prev){if(prev&&x-st>=2)out.push(`${dx(st)}-${dx(x-1)}:${h}`);prev=h;st=x;}}
out.forEach(o=>console.log(' '+o));

// text bands via dark-pixel rows
console.log('\n=== dark text rows ===');
for(let y=0;y<p.height;y++){let n=0;for(let x=X0;x<X0+W;x++)if(lum(px(x,y))<150)n++;if(n>5)console.log(' y',dy(y),'n='+n);}
