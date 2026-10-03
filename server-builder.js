
(()=>{
'use strict';
const $=id=>document.getElementById(id),money=n=>new Intl.NumberFormat('ru-RU').format(n)+' ₽';
const icons={
 platform:'<rect x="5" y="10" width="54" height="38" rx="4"/><path d="M10 18h42M10 27h42M10 37h30"/><circle cx="50" cy="39" r="2"/>',
 cpu:'<rect x="14" y="14" width="36" height="36" rx="3"/><rect x="22" y="22" width="20" height="20"/><path d="M20 6v8m12-8v8m12-8v8M20 50v8m12-8v8m12-8v8M6 20h8M6 32h8M6 44h8m36-24h8m-8 12h8m-8 12h8"/>',
 memory:'<path d="M5 21h54v23H5zM9 44v6m7-6v6m7-6v6m7-6v6m7-6v6m7-6v6m7-6v6"/><path d="M11 27h8v11h-8zm16 0h8v11h-8zm16 0h8v11h-8z"/>',
 drive:'<rect x="13" y="7" width="38" height="49" rx="4"/><circle cx="32" cy="29" r="12"/><path d="m32 29 12 16M20 50h17"/>',
 raid:'<rect x="9" y="8" width="46" height="14" rx="3"/><rect x="9" y="26" width="46" height="14" rx="3"/><rect x="9" y="44" width="46" height="14" rx="3"/><path d="M16 15h26M16 33h26M16 51h26"/>',
 network:'<rect x="7" y="15" width="48" height="28" rx="2"/><path d="M13 21h13v14H13zm25 0h13v14H38zM10 49h41M6 8v45"/>',
 psu:'<path d="M9 9h40l7 8v35H9z"/><circle cx="31" cy="29" r="14"/><circle cx="31" cy="29" r="5"/><path d="M31 15v9m0 10v9M17 29h9m10 0h9"/>'
};
function icon(k){return '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">'+icons[k]+'</svg>'}
const parts={
 platform:{label:'Платформа',options:[{name:'Rack 2U · 8 × 2.5″',desc:'2 процессорных места · 8 DIMM · 6 вентиляторов',price:65000}]},
 cpu:{label:'Процессоры',options:[{name:'16 ядер / 32 потока',desc:'Серверный CPU · 180 Вт',cores:16,w:180,price:95000},{name:'32 ядра / 64 потока',desc:'Серверный CPU · 240 Вт',cores:32,w:240,price:175000},{name:'64 ядра / 128 потоков',desc:'Серверный CPU · 320 Вт',cores:64,w:320,price:295000}]},
 memory:{label:'Оперативная память',options:[{name:'32 ГБ DDR5 ECC RDIMM',desc:'Один модуль · коррекция ошибок',gb:32,price:16000},{name:'64 ГБ DDR5 ECC RDIMM',desc:'Один модуль · коррекция ошибок',gb:64,price:31000},{name:'128 ГБ DDR5 ECC RDIMM',desc:'Один модуль · коррекция ошибок',gb:128,price:67000}]},
 drive:{label:'Накопители',options:[{name:'SSD 960 ГБ SATA',desc:'2.5″ · модельный ресурс 1 DWPD',tb:.96,w:7,price:18000},{name:'SSD 1.92 ТБ SATA',desc:'2.5″ · модельный ресурс 1 DWPD',tb:1.92,w:9,price:34000},{name:'SSD 3.84 ТБ SATA',desc:'2.5″ · модельный ресурс 1 DWPD',tb:3.84,w:11,price:65000}]},
 raid:{label:'Дисковый массив',options:[{name:'RAID 0',desc:'Объединение ёмкости · без отказоустойчивости',level:0,min:2,price:0},{name:'RAID 1',desc:'Зеркало из двух дисков',level:1,min:2,price:18000},{name:'RAID 5',desc:'Один диск используется под избыточность',level:5,min:3,price:24000},{name:'RAID 6',desc:'Два диска используются под избыточность',level:6,min:4,price:29000},{name:'RAID 10',desc:'Чередование и зеркала · чётное число дисков',level:10,min:4,price:29000}]},
 network:{label:'Сетевой адаптер',options:[{name:'2 × 1 GbE',desc:'Два медных порта RJ45',speed:1,w:6,price:6000},{name:'2 × 10 GbE',desc:'Два порта SFP+ · модули отдельно',speed:10,w:15,price:24000},{name:'2 × 25 GbE',desc:'Два порта SFP28 · модули отдельно',speed:25,w:22,price:48000}]},
 psu:{label:'Блоки питания',options:[{name:'2 × 800 Вт',desc:'Резервирование 1+1 · доступно 800 Вт при отказе',w:800,price:38000},{name:'2 × 1200 Вт',desc:'Резервирование 1+1 · доступно 1200 Вт при отказе',w:1200,price:56000},{name:'2 × 1600 Вт',desc:'Резервирование 1+1 · доступно 1600 Вт при отказе',w:1600,price:79000}]}
};
const defaults={platform:0,cpu:0,memory:0,drive:1,raid:1,network:0,psu:0,cpuCount:1,ramCount:4,driveCount:2};
let state={...defaults},selectedKey=null,model=null;
try{const saved=JSON.parse(localStorage.getItem('klamas-server-v1'));if(saved&&typeof saved==='object'){for(const k of Object.keys(parts))if(Number.isInteger(saved[k])&&parts[k].options[saved[k]])state[k]=saved[k];for(const [k,allowed] of [['cpuCount',[1,2]],['ramCount',[2,4,6,8]],['driveCount',[2,3,4,5,6,7,8]]])if(allowed.includes(saved[k]))state[k]=saved[k]}}catch{}
const option=k=>parts[k].options[state[k]],qty=k=>k==='cpu'?state.cpuCount:k==='memory'?state.ramCount:k==='drive'?state.driveCount:1;
function calculate(){
const cpu=option('cpu'),ram=option('memory'),drive=option('drive'),raid=option('raid'),n=state.driveCount;
const issues=[];
if(n<raid.min)issues.push(raid.name+': нужно минимум '+raid.min+' диска.');
if(raid.level===1&&n!==2)issues.push('RAID 1 в этой платформе использует ровно 2 диска.');
if(raid.level===10&&n%2)issues.push('Для RAID 10 нужно чётное число дисков.');
if(state.ramCount<state.cpuCount*2)issues.push('Установите минимум 2 модуля памяти на каждый процессор.');
const load=cpu.w*state.cpuCount+state.ramCount*12+drive.w*n+option('network').w+110;
const recommended=Math.ceil(load*1.25/10)*10;
if(recommended>option('psu').w)issues.push('Для резерва 1+1 выберите блоки питания не менее '+recommended+' Вт каждый.');
const diskValid=n>=raid.min&&!(raid.level===1&&n!==2)&&!(raid.level===10&&n%2);
const usable=diskValid?drive.tb*(raid.level===0?n:raid.level===1?1:raid.level===5?n-1:raid.level===6?n-2:n/2):null;
const total=Object.keys(parts).reduce((s,k)=>s+option(k).price*qty(k),0);
return {issues,load,recommended,usable,total,cores:cpu.cores*state.cpuCount,ram:ram.gb*state.ramCount};
}
function render(){
const c=calculate();
$('server-components').innerHTML=Object.keys(parts).map(k=>'<button class="row" data-part="'+k+'">'+icon(k)+'<span><small>'+parts[k].label+'</small><strong>'+option(k).name+(qty(k)>1?' × '+qty(k):'')+'</strong></span><span class="cost">'+money(option(k).price*qty(k))+'<span>Выбрать →</span></span></button>').join('');
$('server-total').textContent=money(c.total);
$('server-specs').innerHTML=[['Ядер',c.cores],['Память',c.ram+' ГБ'],['Полезная ёмкость',c.usable===null?'—':c.usable.toLocaleString('ru-RU')+' ТБ'],['Нагрузка, оценка',c.load+' Вт']].map(x=>'<div><small>'+x[0]+'</small><b>'+x[1]+'</b></div>').join('');
$('server-checks').className='checks'+(c.issues.length?' bad':'');
$('server-checks').innerHTML='<b>'+(c.issues.length?'Требует изменений':'Совместимо в рамках модельной платформы')+'</b>'+c.issues.map(x=>'<p>• '+x+'</p>').join('')+'<p>Питание 1+1: рекомендуем от '+c.recommended+' Вт на каждый БП.</p>'+(option('raid').level===0?'<p>RAID 0 не защищает данные при отказе диска.</p>':'<p>RAID не заменяет резервное копирование.</p>');
$('save-server').disabled=!!c.issues.length;$('download-server').disabled=!!c.issues.length;
if(model)model.rebuild();
}
function picker(k){
selectedKey=k;$('picker-title').textContent=parts[k].label;
$('server-choices').innerHTML=parts[k].options.map((o,i)=>'<button class="choice '+(state[k]===i?'selected':'')+'" data-choice="'+i+'" aria-pressed="'+(state[k]===i)+'">'+icon(k)+'<h3>'+o.name+'</h3><p>'+o.desc+'</p><b>'+money(o.price)+'</b></button>').join('');
const counts=k==='cpu'?['cpuCount',[1,2],'Количество процессоров']:k==='memory'?['ramCount',[2,4,6,8],'Количество модулей']:k==='drive'?['driveCount',[2,3,4,5,6,7,8],'Количество дисков']:null;
$('server-quantity').innerHTML=counts?'<label class="field">'+counts[2]+'<select id="part-count" data-count="'+counts[0]+'">'+counts[1].map(n=>'<option '+(state[counts[0]]===n?'selected':'')+'>'+n+'</option>').join('')+'</select></label>':'';
if(!$('server-picker').open)$('server-picker').showModal();
}
document.addEventListener('click',e=>{
const b=e.target.closest('button');if(!b)return;
if(b.dataset.part)picker(b.dataset.part);
if(b.dataset.choice!==undefined){state[selectedKey]=+b.dataset.choice;render();picker(selectedKey)}
if(b.dataset.preset){
state={...defaults,...(b.dataset.preset==='vm'?{cpu:1,cpuCount:2,memory:1,ramCount:8,driveCount:4,raid:4,network:1,psu:1}:b.dataset.preset==='storage'?{drive:2,driveCount:8,raid:3,network:1}:{} )};
render();$('server-status').textContent='Конфигурация изменена. Нажмите «Сохранить», чтобы запомнить её.';
}
});
$('server-quantity').addEventListener('change',e=>{if(e.target.dataset.count){state[e.target.dataset.count]=+e.target.value;render()}});
$('picker-close').onclick=()=>$('server-picker').close();
$('server-picker').addEventListener('click',e=>{if(e.target===$('server-picker')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close()}});
$('save-server').onclick=()=>{try{localStorage.setItem('klamas-server-v1',JSON.stringify(state));$('server-status').textContent='Сборка сохранена на этом устройстве.'}catch{$('server-status').textContent='Браузер не разрешил сохранение. Скачайте спецификацию.'}};
$('download-server').onclick=()=>{
const c=calculate();if(c.issues.length)return;
const lines=['КЛАМАС — КОНФИГУРАЦИЯ СЕРВЕРА','Демонстрационные компоненты и цены. Не счёт и не предложение поставки.','',...Object.keys(parts).map(k=>parts[k].label+': '+option(k).name+' × '+qty(k)+' — '+money(option(k).price*qty(k))),'','Ядер: '+c.cores,'ОЗУ: '+c.ram+' ГБ','Полезная ёмкость: '+c.usable+' ТБ (до форматирования)','Расчётная нагрузка: '+c.load+' Вт','Рекомендуемая мощность каждого БП: '+c.recommended+' Вт','Итого: '+money(c.total),'','Для заказа согласуйте точные артикулы, совместимость и стоимость с менеджером.'];
const url=URL.createObjectURL(new Blob(['\ufeff'+lines.join('\n')],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='Klamas-server.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
};
render();
async function start3D(){
try{
const T=await import('https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js');
const host=$('server-scene'),renderer=new T.WebGLRenderer({antialias:true,alpha:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
host.prepend(renderer.domElement);renderer.domElement.tabIndex=0;renderer.domElement.setAttribute('aria-label','3D-сервер: вращение стрелками, масштаб клавишами плюс и минус');
const scene=new T.Scene(),camera=new T.PerspectiveCamera(38,1,.1,100);
scene.add(new T.HemisphereLight(0xeaf5ff,0x6f7f86,3));
const key=new T.DirectionalLight(0xffffff,4);key.position.set(-5,10,7);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-8,right:8,top:8,bottom:-8});key.shadow.bias=-.0006;scene.add(key);
const fill=new T.DirectionalLight(0xa3c5e0,2);fill.position.set(6,4,-6);scene.add(fill);
const floor=new T.Mesh(new T.PlaneGeometry(100,100),new T.ShadowMaterial({opacity:.16}));floor.rotation.x=-Math.PI/2;floor.position.y=-.16;floor.receiveShadow=true;scene.add(floor);
let root=new T.Group();scene.add(root);
const mat={
 metal:new T.MeshStandardMaterial({color:0x8799a3,metalness:.65,roughness:.42}),
 dark:new T.MeshStandardMaterial({color:0x263139,metalness:.45,roughness:.46}),
 black:new T.MeshStandardMaterial({color:0x121a1e,roughness:.65}),
 board:new T.MeshStandardMaterial({color:0x1c6459,metalness:.2,roughness:.55}),
 gold:new T.MeshStandardMaterial({color:0xc3a566,metalness:.75,roughness:.3}),
 silver:new T.MeshStandardMaterial({color:0xb8c6ce,metalness:.75,roughness:.3}),
 orange:new T.MeshStandardMaterial({color:0xef683b,roughness:.4}),
 led:new T.MeshStandardMaterial({color:0x48f4bf,emissive:0x20a873,emissiveIntensity:.6}),
 trace:new T.MeshStandardMaterial({color:0x548879,metalness:.4,roughness:.6})
};
function box(parent,w,h,d,x,y,z,m){const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
function cyl(parent,r,h,x,y,z,m){const o=new T.Mesh(new T.CylinderGeometry(r,r,h,16),m);o.position.set(x,y,z);o.castShadow=true;parent.add(o);return o}
function screw(parent,x,y,z){cyl(parent,.033,.015,x,y,z,mat.silver);box(parent,.039,.005,.007,x,y+.01,z,mat.black)}
function label(parent,text,w,h,x,y,z,flat=false){
 const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#27333a';ctx.fillRect(0,0,512,128);ctx.fillStyle='#dce8ed';ctx.font='bold 42px Arial';ctx.textAlign='center';ctx.fillText(text,256,80);
 const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;const o=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:texture}));o.position.set(x,y,z);if(flat)o.rotation.x=-Math.PI/2;parent.add(o);return o;
}
let coverOpen=true,exploded=false,coverMesh;
const hot=[];
for(const [k,title,pos] of [['cpu','Выбрать процессоры',[-.8,.8,-.45]],['memory','Выбрать память',[1.65,.55,-.4]],['drive','Выбрать накопители',[-.55,.7,2.9]],['psu','Выбрать блоки питания',[1.5,.7,-2.75]],['network','Выбрать сетевой адаптер',[-1.6,.4,-2.6]]]){
 const b=document.createElement('button');b.className='hotspot';b.textContent='+';b.title=title;b.setAttribute('aria-label',title);b.dataset.part=k;host.append(b);hot.push({b,k,pos:new T.Vector3(...pos)});
}
function disposeModel(){
root.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material?.map){o.material.map.dispose();o.material.dispose()}});
scene.remove(root);root=new T.Group();scene.add(root);
}
function rebuild(){
disposeModel();const lift=exploded?1.15:0;
box(root,4.4,.1,6.6,0,0,0,mat.metal);
for(const x of [-2.19,2.19]){box(root,.09,.86,6.6,x,.43,0,mat.metal);box(root,.2,.08,6.7,x,.92,0,mat.silver);for(let z=-3;z<=3;z+=.75)screw(root,x,.97,z)}
box(root,4.3,.88,.09,0,.45,-3.27,mat.metal);
for(const x of [-2.38,2.38]){box(root,.36,.87,.13,x,.45,3.26,mat.dark);for(const y of [.18,.73]){const hole=cyl(root,.06,.02,x,y,3.34,mat.black);hole.rotation.x=Math.PI/2}}
box(root,4.3,.86,.15,0,.45,3.23,mat.dark);
box(root,4,.07,4.4,0,.13,-.86,mat.board);
// Etched traces, connector pins and board chips.
for(let i=0;i<22;i++){box(root,.012,.007,1.35,-1.94+i*.18,.17,-1.35,mat.trace);box(root,.55,.007,.01,-1.45+i*.14,.18,-2.8+i*.13,mat.trace)}
for(let i=0;i<12;i++){box(root,.22,.075,.27,-1.65+(i%6)*.56,.22,-2.1+Math.floor(i/6)*.46,mat.black)}
for(const x of [-1.88,1.88])for(const z of [-2.8,.8])screw(root,x,.19,z);
// CPU sockets and finned heatsinks; second socket visible when unpopulated.
for(let i=0;i<2;i++){
const x=i===0?-.85:.65,z=-.5;
box(root,1.03,.05,1.2,x,.23,z,mat.black);box(root,.91,.025,1.05,x,.27,z,mat.silver);
if(i<state.cpuCount){
const g=new T.Group();g.position.y=lift;root.add(g);
box(g,.84,.06,.95,x,.32,z,mat.silver);
box(g,.96,.07,1.12,x,.39,z,mat.silver);
for(let n=0;n<23;n++)box(g,.024,.35,1.08,x-.44+n*.04,.60,z,mat.silver);
for(const dx of [-.43,.43])for(const dz of [-.48,.48])screw(g,x+dx,.8,z+dz);
label(g,'CPU '+(i+1),.73,.18,x,.795,z,true);
}
}
// Eight DIMM slots and individual memory modules with chips.
for(let i=0;i<8;i++){
const x=[-1.75,-1.50,-.12,.12,1.37,1.62,1.86,2.02][i],z=-.42;
box(root,.065,.10,1.32,x,.24,z,mat.black);
for(const end of [-1,1])box(root,.10,.14,.09,x,.3,z+end*.67,mat.silver);
if(i<state.ramCount){
const g=new T.Group();g.position.y=lift*.75;root.add(g);box(g,.045,.31,1.24,x,.44,z,mat.board);box(g,.05,.045,1.17,x,.30,z,mat.gold);
for(let n=0;n<6;n++)for(const side of [-1,1])box(g,.025,.17,.14,x+side*.033,.46,z-.49+n*.195,mat.black);
}
}
// Six fan housings and five pitched blades per fan.
for(let i=0;i<6;i++){
const x=-1.75+i*.7,z=1.14;
const g=new T.Group();g.position.set(x,.49,z);g.position.y+=lift*.28;root.add(g);
box(g,.61,.70,.37,0,0,0,mat.black);
const ring=new T.Mesh(new T.TorusGeometry(.244,.024,8,24),mat.metal);ring.position.z=.205;g.add(ring);
for(let n=0;n<5;n++){const blade=box(g,.085,.22,.027,0,0,.22,mat.dark);const a=n*Math.PI*2/5;blade.position.x=Math.sin(a)*.12;blade.position.y=Math.cos(a)*.12;blade.rotation.z=-a+.3}
const hub=cyl(g,.065,.06,0,0,.25,mat.silver);hub.rotation.x=Math.PI/2;
box(g,.15,.045,.15,0,.385,0,mat.orange);
}
// Eight front hot-swap caddies, populated according to count.
for(let i=0;i<8;i++){
const x=-1.57+(i%4)*1.05,y=.25+Math.floor(i/4)*.4;
const g=new T.Group();g.position.set(x,y,exploded?.85:0);root.add(g);
box(g,.99,.35,1.34,0,0,2.56,mat.dark);
box(g,.95,.31,.05,0,0,3.29,mat.black);
for(let n=0;n<8;n++)box(g,.045,.20,.01,-.40+n*.095,0,3.325,mat.metal);
box(g,.66,.04,.055,0,-.1,3.36,mat.silver);box(g,.07,.21,.07,.405,0,3.36,i<state.driveCount?mat.orange:mat.dark);
if(i<state.driveCount){box(g,.79,.18,1.12,0,.015,2.52,mat.silver);label(g,'SSD '+(i+1),.48,.17,0,.111,2.55,true);box(g,.025,.05,.02,-.42,.08,3.345,mat.led)}
}
// Redundant PSUs and rear ports.
for(let i=0;i<2;i++){
const x=.87+i*.83;const g=new T.Group();g.position.y=lift*.45;root.add(g);
box(g,.74,.57,1.13,x,.45,-2.65,mat.silver);box(g,.70,.52,.055,x,.45,-3.23,mat.dark);
for(let n=0;n<6;n++)box(g,.035,.25,.018,x-.25+n*.08,.47,-3.27,mat.black);
box(g,.3,.13,.06,x,.3,-3.29,mat.black);label(g,'PSU '+(i+1),.56,.19,x,.745,-2.6,true);
}
box(root,1.5,.23,.055,-1.12,.38,-3.32,mat.dark);
for(let i=0;i<4;i++)box(root,.21,.11,.025,-1.65+i*.33,.39,-3.36,i<2?mat.black:mat.silver);
const nic=new T.Group();nic.position.y=lift*.4;root.add(nic);box(nic,.08,.34,.95,-1.52,.42,-2.63,mat.board);box(nic,.11,.16,.3,-1.51,.45,-2.7,mat.black);
// Front power button and badge.
label(root,'KLAMAS / RACK 2U',1.55,.13,0,.92,3.32);
coverMesh=box(root,4.23,.055,6.48,0,coverOpen?2.4:.97,0,mat.metal);coverMesh.visible=!coverOpen||exploded;
if(exploded)coverMesh.position.y=3;
draw();
}
let theta=.65,phi=.89,distance=11.7,needs=true;
function cameraUpdate(){camera.position.set(Math.sin(theta)*Math.sin(phi)*distance,Math.cos(phi)*distance+1,Math.cos(theta)*Math.sin(phi)*distance);camera.lookAt(0,exploded?.8:.25,0);camera.updateMatrixWorld()}
function draw(){
cameraUpdate();renderer.render(scene,camera);
const w=host.clientWidth,h=host.clientHeight;
for(const item of hot){
const p=item.pos.clone();if(exploded)p.y+=item.k==='cpu'?1.15:item.k==='memory'?.86:.4;
p.project(camera);item.b.style.left=(p.x*.5+.5)*w+'px';item.b.style.top=(-p.y*.5+.5)*h+'px';
item.b.hidden=!coverOpen||p.z>1||Math.abs(p.x)>.93||Math.abs(p.y)>.88;
}needs=false;
}
function resize(){const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();draw()}
new ResizeObserver(resize).observe(host);
const pointers=new Map();let pinch=0;
renderer.domElement.addEventListener('pointerdown',e=>{pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});renderer.domElement.setPointerCapture(e.pointerId);pinch=0});
renderer.domElement.addEventListener('pointermove',e=>{
if(!pointers.has(e.pointerId))return;const prev=pointers.get(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
if(pointers.size===1){theta-=(e.clientX-prev.x)*.008;phi=Math.max(.12,Math.min(1.48,phi+(e.clientY-prev.y)*.008))}
else{const [a,b]=[...pointers.values()],d=Math.hypot(a.x-b.x,a.y-b.y);if(pinch)distance=Math.max(7,Math.min(19,distance*pinch/d));pinch=d}draw();
});
for(const event of ['pointerup','pointercancel','lostpointercapture'])renderer.domElement.addEventListener(event,e=>{pointers.delete(e.pointerId);pinch=0});
renderer.domElement.addEventListener('wheel',e=>{e.preventDefault();distance=Math.max(7,Math.min(19,distance+e.deltaY*.01));draw()},{passive:false});
renderer.domElement.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','='].includes(e.key)){e.preventDefault();theta+=e.key==='ArrowLeft'?-.1:e.key==='ArrowRight'?.1:0;phi=Math.max(.12,Math.min(1.48,phi+(e.key==='ArrowUp'?-.1:e.key==='ArrowDown'?.1:0)));distance=Math.max(7,Math.min(19,distance+(e.key==='-'?.5:['+','='].includes(e.key)?-.5:0)));draw()}});
$('cover').onclick=()=>{coverOpen=!coverOpen;$('cover').setAttribute('aria-pressed',coverOpen);$('cover').textContent=coverOpen?'Без крышки':'С крышкой';rebuild()};
$('explode').onclick=()=>{exploded=!exploded;if(exploded){coverOpen=true;$('cover').textContent='Без крышки';$('cover').setAttribute('aria-pressed','true')}$('explode').setAttribute('aria-pressed',exploded);rebuild()};
$('front').onclick=()=>{theta=0;phi=1.40;draw()};$('top').onclick=()=>{phi=.12;theta=0;draw()};$('reset-view').onclick=()=>{theta=.65;phi=.89;distance=11.7;draw()};
renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();$('server-loading').hidden=false;$('server-loading').textContent='3D-контекст потерян. Обновите страницу; сохранённая сборка останется.'});
model={rebuild};$('server-loading').hidden=true;rebuild();resize();
}catch(err){$('server-loading').innerHTML='Не удалось открыть 3D. Проверьте доступ к сети и поддержку WebGL в браузере.<br>Выбор компонентов и расчёт доступны справа.<button class="tool" id="retry-3d">Повторить загрузку 3D</button>';$('retry-3d').onclick=()=>location.reload();console.error('Server 3D:',err)}
}
start3D();
})();
