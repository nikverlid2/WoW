
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
 platform:{label:'Платформа',options:[{name:'Rack 2U · 8 отсеков LFF',desc:'437 × 647 × 89 мм · 16 DIMM · 3 вентилятора 80 мм',price:65000}]},
 cpu:{label:'Процессоры',options:[{name:'16 ядер / 32 потока',desc:'Серверный CPU · 180 Вт',cores:16,w:180,price:95000},{name:'32 ядра / 64 потока',desc:'Серверный CPU · 240 Вт',cores:32,w:240,price:175000},{name:'48 ядер / 96 потоков',desc:'Серверный CPU · 300 Вт',cores:48,w:300,price:295000}]},
 memory:{label:'Оперативная память',options:[{name:'32 ГБ DDR5 ECC RDIMM',desc:'Один модуль · коррекция ошибок',gb:32,price:16000},{name:'64 ГБ DDR5 ECC RDIMM',desc:'Один модуль · коррекция ошибок',gb:64,price:31000},{name:'128 ГБ DDR5 ECC RDIMM',desc:'Один модуль · коррекция ошибок',gb:128,price:67000}]},
 drive:{label:'Накопители',options:[{name:'SSD 960 ГБ SATA',desc:'2.5″ в адаптере 3.5″ · модельный ресурс 1 DWPD',tb:.96,w:7,price:18000},{name:'SSD 1.92 ТБ SATA',desc:'2.5″ в адаптере 3.5″ · модельный ресурс 1 DWPD',tb:1.92,w:9,price:34000},{name:'SSD 3.84 ТБ SATA',desc:'2.5″ в адаптере 3.5″ · модельный ресурс 1 DWPD',tb:3.84,w:11,price:65000}]},
 raid:{label:'Дисковый массив',options:[{name:'RAID 0',desc:'Объединение ёмкости · без отказоустойчивости',level:0,min:2,price:0},{name:'RAID 1',desc:'Зеркало из двух дисков',level:1,min:2,price:18000},{name:'RAID 5',desc:'Один диск используется под избыточность',level:5,min:3,price:24000},{name:'RAID 6',desc:'Два диска используются под избыточность',level:6,min:4,price:29000},{name:'RAID 10',desc:'Чередование и зеркала · чётное число дисков',level:10,min:4,price:29000}]},
 network:{label:'Сетевой адаптер',options:[{name:'2 × 1 GbE',desc:'Два медных порта RJ45',speed:1,w:6,price:6000},{name:'2 × 10 GbE',desc:'Два порта SFP+ · модули отдельно',speed:10,w:15,price:24000},{name:'2 × 25 GbE',desc:'Два порта SFP28 · модули отдельно',speed:25,w:22,price:48000}]},
 psu:{label:'Блоки питания',options:[{name:'2 × 800 Вт',desc:'Резервирование 1+1 · доступно 800 Вт при отказе',w:800,price:38000},{name:'2 × 1200 Вт',desc:'Резервирование 1+1 · доступно 1200 Вт при отказе',w:1200,price:56000},{name:'2 × 1600 Вт',desc:'Резервирование 1+1 · доступно 1600 Вт при отказе',w:1600,price:79000}]}
};

const partHints={platform:'Корпус с материнской платой, охлаждением и восемью фронтальными отсеками. Компоновка основана на сервере Supermicro 2U.',cpu:'Два сокета. В двухпроцессорной сборке устанавливаются одинаковые CPU. Радиаторы входят в модельную платформу.',memory:'16 слотов DDR5 ECC RDIMM: по 8 на процессор. Модули на модели распределяются между установленными CPU.',drive:'SSD 2.5″ устанавливаются в адаптеры фронтальных корзин 3.5″. Все диски массива одинаковой ёмкости.',raid:'Полезная ёмкость зависит от RAID. Проверка учитывает минимум дисков и чётность для RAID 10.',network:'Двухпортовый адаптер в слоте PCIe. Для SFP+ и SFP28 трансиверы согласовываются отдельно.',psu:'Два сменных модуля. При резервировании 1+1 всю нагрузку должен выдерживать один блок питания.'};
function specTags(k,o){const tags=k==='cpu'?[o.cores+' ядер',o.w+' Вт','2 сокета']:k==='memory'?[o.gb+' ГБ','DDR5','ECC RDIMM']:k==='drive'?[o.tb+' ТБ','SATA','2.5″ + адаптер']:k==='psu'?[o.w+' Вт','2 модуля','Резерв 1+1']:k==='network'?[o.speed+' Гбит/с','2 порта','PCIe']:k==='platform'?['2U','16 DIMM','8 LFF']:['От '+o.min+' дисков','RAID '+o.level];return '<span class="spec-tags">'+tags.map(t=>'<span>'+t+'</span>').join('')+'</span>'}
function thumb(k){
const gradient='<defs><linearGradient id="metal-'+k+'" x2="1" y2="1"><stop stop-color="#f1f2f1"/><stop offset=".45" stop-color="#b8c0c4"/><stop offset="1" stop-color="#e0e4e4"/></linearGradient></defs>';
const metal='url(#metal-'+k+')';let drawing='';
if(k==='cpu')drawing='<path fill="#294e46" d="M28 12h57l8 12v58l-9 8H24L16 78V23z"/><path fill="'+metal+'" stroke="#899393" d="M30 18h48l8 12v47l-8 6H30l-8-9V29z"/><path fill="#eef0e9" d="M30 29h46v40H30z"/><text x="53" y="48" text-anchor="middle" font-size="10" fill="#53605b">SERVER</text><text x="53" y="61" text-anchor="middle" font-size="8" fill="#53605b">PROCESSOR</text>';
else if(k==='memory')drawing='<path fill="#24513c" d="M6 35h94v29H6z"/><path fill="#c5af6a" d="M9 64h36v5H9zm42 0h46v5H51z"/>'+Array.from({length:8},(_,i)=>'<rect fill="#242a2b" x="'+(10+i*11)+'" y="39" width="8" height="18" rx="1"/>').join('')+'<rect x="43" y="41" width="18" height="12" fill="#e8e8dc"/>';
else if(k==='drive')drawing='<path fill="#929ca0" d="M21 15h67v72H21z"/><path fill="'+metal+'" stroke="#738085" d="M17 11h67v72H17z"/><rect fill="#f6f6ee" x="24" y="22" width="53" height="40"/><text x="50" y="38" text-anchor="middle" font-size="12" fill="#343c3e">SSD</text><text x="50" y="51" text-anchor="middle" font-size="7" fill="#697377">ENTERPRISE SATA</text><path fill="#262c2d" d="M24 74h43v9H24z"/><path stroke="#bca462" stroke-width="3" d="M27 77h32"/>';
else if(k==='psu')drawing='<path fill="#a7b0b3" d="m20 41 51-27 25 13-53 28z"/><path fill="#cdd2d4" d="m43 55 53-28v23L43 81z"/><path fill="#343d40" d="m20 41 23 14v26L20 67z"/><path stroke="#69767a" stroke-width="2" d="m24 49 14 8m-14-2 14 8m-14-2 14 8"/><path fill="#f0efe3" d="m44 38 27-14 16 7-27 15z"/>';
else if(k==='network'||k==='raid')drawing='<path fill="#31654a" d="M13 32h79v39H13z"/><path fill="#b3bdbe" d="M6 26h10v54H6z"/><rect fill="'+metal+'" x="40" y="38" width="30" height="25"/>'+Array.from({length:7},(_,i)=>'<path stroke="#6b7779" d="M'+(43+i*4)+' 38v25"/>').join('')+'<path fill="#c4ab62" d="M29 71h46v6H29z"/>';
else drawing='<path fill="#d0d5d7" d="m10 50 32-27 59 13-35 30z"/><path fill="#a3aeb2" d="m66 66 35-30v19L66 85z"/><path fill="#29343a" d="m10 50 56 16v19L10 69z"/>'+Array.from({length:4},(_,i)=>'<path stroke="#728088" stroke-width="2" d="m'+(14+i*13)+' '+(56+i*3.7)+' 9 2.6m-9 3 9 2.6"/>').join('');
return '<svg class="part-thumb" viewBox="0 0 108 100" aria-hidden="true">'+gradient+drawing+'</svg>';
}

const defaults={platform:0,cpu:0,memory:0,drive:1,raid:1,network:0,psu:0,cpuCount:1,ramCount:4,driveCount:2};
let state={...defaults},selectedKey=null,model=null;
try{const saved=JSON.parse(localStorage.getItem('klamas-server-v1'));if(saved&&typeof saved==='object'){for(const k of Object.keys(parts))if(Number.isInteger(saved[k])&&parts[k].options[saved[k]])state[k]=saved[k];for(const [k,allowed] of [['cpuCount',[1,2]],['ramCount',[2,4,6,8,12,16]],['driveCount',[2,3,4,5,6,7,8]]])if(allowed.includes(saved[k]))state[k]=saved[k]}}catch{}
const option=k=>parts[k].options[state[k]],qty=k=>k==='cpu'?state.cpuCount:k==='memory'?state.ramCount:k==='drive'?state.driveCount:1;
function calculate(){
const cpu=option('cpu'),ram=option('memory'),drive=option('drive'),raid=option('raid'),n=state.driveCount;
const issues=[];
if(n<raid.min)issues.push(raid.name+': нужно минимум '+raid.min+' диска.');
if(raid.level===1&&n!==2)issues.push('RAID 1 в этой платформе использует ровно 2 диска.');
if(raid.level===10&&n%2)issues.push('Для RAID 10 нужно чётное число дисков.');
if(state.ramCount<state.cpuCount*2)issues.push('Установите минимум 2 модуля памяти на каждый процессор.');
if(state.ramCount>state.cpuCount*8)issues.push('На каждый процессор доступно 8 слотов DIMM. Добавьте второй CPU или уменьшите число модулей.');
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
$('server-components').innerHTML=Object.keys(parts).map(k=>'<button class="row" data-part="'+k+'">'+thumb(k)+'<span><small>'+parts[k].label+'</small><strong>'+option(k).name+(qty(k)>1?' × '+qty(k):'')+'</strong></span><span class="cost">'+money(option(k).price*qty(k))+'<span>Выбрать →</span></span></button>').join('');
$('server-total').textContent=money(c.total);$('build-count').textContent=state.cpuCount+' CPU · '+state.ramCount+' DIMM · '+state.driveCount+' SSD';$('slot-map').innerHTML=Array.from({length:8},(_,i)=>'<span class="'+(i<state.driveCount?'occupied':'')+'" title="Отсек '+(i+1)+(i<state.driveCount?': SSD':': свободен')+'">'+(i+1)+'</span>').join('');
$('server-specs').innerHTML=[['Ядер',c.cores],['Память',c.ram+' ГБ'],['Полезная ёмкость',c.usable===null?'—':c.usable.toLocaleString('ru-RU')+' ТБ'],['Нагрузка, оценка',c.load+' Вт']].map(x=>'<div><small>'+x[0]+'</small><b>'+x[1]+'</b></div>').join('');
$('server-checks').className='checks'+(c.issues.length?' bad':'');
$('server-checks').innerHTML='<b>'+(c.issues.length?'Требует изменений':'Совместимо в рамках модельной платформы')+'</b>'+c.issues.map(x=>'<p>• '+x+'</p>').join('')+'<p>Питание 1+1: рекомендуем от '+c.recommended+' Вт на каждый БП.</p>'+(option('raid').level===0?'<p>RAID 0 не защищает данные при отказе диска.</p>':'<p>RAID не заменяет резервное копирование.</p>');
$('save-server').disabled=!!c.issues.length;$('download-server').disabled=!!c.issues.length;
if(model)model.rebuild();
}
function picker(k){
selectedKey=k;if(model){model.focus(k);if(k!=='platform'&&k!=='raid')$('inspect-part').value=k;}
$('picker-title').textContent=parts[k].label;$('picker-count').textContent=parts[k].options.length+' варианта';$('picker-context').textContent=partHints[k];
$('server-choices').innerHTML=parts[k].options.map((o,i)=>'<button class="choice '+(state[k]===i?'selected':'')+'" data-choice="'+i+'" aria-pressed="'+(state[k]===i)+'">'+thumb(k)+'<span class="choice-text"><h3>'+o.name+'</h3><p>'+o.desc+'</p>'+specTags(k,o)+'</span><span class="choice-price"><b>'+money(o.price)+'</b><em>'+(state[k]===i?'Выбрано ✓':'Выбрать')+'</em></span></button>').join('');
const counts=k==='cpu'?['cpuCount',[1,2],'Количество процессоров']:k==='memory'?['ramCount',[2,4,6,8,12,16],'Количество модулей']:k==='drive'?['driveCount',[2,3,4,5,6,7,8],'Количество дисков']:null;
$('server-quantity').innerHTML=counts?'<label class="field">'+counts[2]+'<select id="part-count" data-count="'+counts[0]+'">'+counts[1].map(n=>'<option '+(state[counts[0]]===n?'selected':'')+'>'+n+'</option>').join('')+'</select></label>':'';
if(!$('server-picker').open)$('server-picker').showModal();
}
document.addEventListener('click',e=>{
const b=e.target.closest('button');if(!b)return;
if(b.dataset.part)picker(b.dataset.part);
if(b.dataset.choice!==undefined){state[selectedKey]=+b.dataset.choice;render();picker(selectedKey)}
if(b.dataset.preset){
document.querySelectorAll('[data-preset]').forEach(n=>n.setAttribute('aria-pressed',n===b));
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
 const {createServerScene}=await import('./server-scene.js?v=7');
 model=await createServerScene({host:$('server-scene'),getState:()=>({...state,cpuCores:option('cpu').cores,cpuW:option('cpu').w,driveTB:option('drive').tb,ramGB:option('memory').gb,psuW:option('psu').w})});
 model.focus('cpu');$('inspect-part').value='cpu';$('server-loading').hidden=true;
 $('cover').onclick=()=>{const open=model.cover();$('cover').setAttribute('aria-pressed',open);$('cover').textContent=open?'Без крышки':'С крышкой';$('explode').setAttribute('aria-pressed','false');$('inspect').setAttribute('aria-pressed','false')};
 $('explode').onclick=()=>{const value=model.explode();$('explode').setAttribute('aria-pressed',value);$('cover').setAttribute('aria-pressed','true');$('cover').textContent='Без крышки';$('inspect').setAttribute('aria-pressed','false')};
 for(const id of ['front','top','rear','reset-view'])$(id).onclick=()=>{model.setView(id);if(id==='reset-view')$('inspect').setAttribute('aria-pressed','false')};
 $('zoom-in').onclick=()=>model.zoom(-1);$('zoom-out').onclick=()=>model.zoom(1);
 $('inspect').onclick=()=>{const active=$('inspect').getAttribute('aria-pressed')!=='true';$('inspect').setAttribute('aria-pressed',model.detail(active));if(active){$('cover').setAttribute('aria-pressed','true');$('cover').textContent='Без крышки';}};
 $('inspect-part').onchange=e=>{model.focus(e.target.value);$('inspect').setAttribute('aria-pressed',model.detail(true));$('cover').setAttribute('aria-pressed','true');$('cover').textContent='Без крышки';};
 $('full-scene').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('visual-panel').requestFullscreen()}catch{$('server-status').textContent='Полноэкранный режим недоступен в этом браузере.'}};
}catch(err){$('server-loading').innerHTML='Не удалось загрузить модель.<button class="tool" id="retry-3d">Повторить</button>';$('retry-3d').onclick=()=>location.reload();console.error(err)}
}
start3D();
})();
