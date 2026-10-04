(()=>{
'use strict';
const $=id=>document.getElementById(id),C=window.ServerCatalog,{parts}=C,esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function thumb(k,o){
if(o?.image)return '<img class="part-thumb" src="'+o.image+'" alt="'+esc(o.name)+'" loading="lazy" referrerpolicy="no-referrer">';
if(k==='controller')k='raid';
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
let state=C.blank(),model=null,selectedKey='cpu',lastState=null;
try{state=C.sanitize(JSON.parse(localStorage.getItem('klamas-server-v2')))}catch{}
try{if(location.hash.startsWith('#build='))state=C.sanitize(JSON.parse(decodeURIComponent(location.hash.slice(7))))}catch{}
const option=k=>C.get(state,k),qty=k=>!option(k)?0:k==='cpu'?state.cpuCount:k==='memory'?state.ramCount:k==='drive'?state.driveCount:1;
const sceneKey=k=>k==='controller'?'raid':k;
const hints={platform:'Одна проверяемая платформа. Материнская плата, корпус, охлаждение, два блока питания и встроенная сеть входят в её состав.',cpu:'Оба сокета LGA4677 используют одинаковую модель CPU. При двух процессорах модули памяти распределяются между ними поровну.',memory:'Эти артикулы указаны в подборщике Kingston для SYS-621P-TRT. Реальная частота ограничивается выбранным Xeon.',drive:'Один массив из одинаковых накопителей. SATA SSD 2.5″ автоматически добавляет нужные корзины-переходники; HDD 3.5″ устанавливается напрямую.',controller:'Контроллер — физическое устройство. Уровень RAID выбирается отдельно после накопителей; RAID 6 требует дополнительной платы.',network:'Встроенные два порта 10GbE есть в любой сборке. Плата 25GbE добавляет ещё два порта SFP28.',psu:'Модель блока питания определяется платформой: два PWS-1K23A-1R, резервирование 1+1.'};
function tags(o){return '<div class="spec-tags">'+o.tags.map(t=>'<span>'+esc(t)+'</span>').join('')+'</div>'}
function status(t){$('server-status').textContent=t}
function selectedInfo(k){const o=option(k);if(!o)return '<strong>Выберите компонент</strong><span>Пока не установлен</span>';return '<strong>'+esc(o.name)+(qty(k)>1?' × '+qty(k):'')+'</strong><code>'+esc(o.id)+'</code>'}
function render(){
 const c=C.validate(state);
 $('server-components').innerHTML=Object.keys(parts).map((k,i)=>{const o=option(k);return '<article class="component-row '+(!o?'empty':'')+'"><button class="row" data-part="'+k+'"><span class="row-visual">'+(o?thumb(k,o):'<span class="add-part">+</span>')+'</span><span><small>'+String(i+1).padStart(2,'0')+' / '+parts[k].label+'</small>'+selectedInfo(k)+'</span><span class="row-action">'+(parts[k].fixed?'Состав ↗':o?'Заменить':'Выбрать →')+'</span></button>'+(o&&!parts[k].fixed?'<div class="row-controls"><span>'+esc(o.included?'В составе платформы':o.tags.slice(0,2).join(' · '))+'</span><button data-preview="'+k+'" '+(o.included?'disabled':'')+'>В 3D ↗</button>'+(parts[k].required?'<button data-remove="'+k+'" aria-label="Убрать '+parts[k].label+'">×</button>':'')+'</div>':'')+'</article>'}).join('');
 $('build-progress').innerHTML='<span>'+c.filled+' из 3 обязательных разделов</span><progress max="3" value="'+c.filled+'"></progress>';
 $('build-count').textContent=(option('cpu')?state.cpuCount:0)+' CPU · '+(option('memory')?state.ramCount:0)+' DIMM · '+(option('drive')?state.driveCount:0)+' дисков';
 $('slot-map').innerHTML=Array.from({length:8},(_,i)=>'<span class="'+(option('drive')&&i<state.driveCount?'occupied':'')+'" title="Отсек '+(i+1)+'">'+(i+1)+'</span>').join('');
 $('server-specs').innerHTML=[['Ядер / потоков',c.cores+' / '+c.threads],['Память',c.ram+' ГБ'],['Ёмкость массива',c.usable===null?'—':c.usable.toLocaleString('ru-RU')+' ТБ'],['Память, до',c.mt?c.mt+' MT/s':'—']].map(x=>'<div><small>'+x[0]+'</small><b>'+x[1]+'</b></div>').join('');
 $('server-checks').className='checks'+(c.issues.length?' bad':'');$('server-checks').innerHTML='<b>'+(c.issues.length?'Сборка требует изменений':'Основные параметры согласованы')+'</b>'+c.issues.map(x=>'<p>'+esc(x)+'</p>').join('')+'<p>Расчётная нагрузка: '+c.load+' Вт. В резерве 1+1 доступно 1200 Вт.</p>';
 $('compat-notes').innerHTML=c.notes.map(x=>'<li>'+esc(x)+'</li>').join('');
 $('accessories').innerHTML=c.accessories.length?c.accessories.map(x=>'<div><span>'+esc(x.name)+'<code>'+x.id+'</code></span><b>× '+x.qty+'</b></div>').join(''):'<p>Здесь появятся держатели CPU и переходники для выбранных деталей.</p>';
 $('server-total').textContent='Цена по запросу';$('download-server').disabled=!!c.issues.length;
 const ctrl=option('controller');$('raid-level').innerHTML=['none',0,1,5,6,10].map(r=>{const why=!ctrl.levels.includes(r)?'нужна RAID-плата':option('drive')&&((r===1&&state.driveCount!==2)||(r===10&&(state.driveCount<4||state.driveCount%2))||(r===5&&state.driveCount<3)||(r===6&&state.driveCount<4)||(r===0&&state.driveCount<2))?'не подходит число дисков':'';return '<option value="'+r+'" '+(r===state.raid?'selected':'')+' '+(why?'disabled':'')+'>'+(r==='none'?'Без RAID · отдельные диски':'RAID '+r)+(why?' — '+why:'')+'</option>'}).join('');
 $('raid-note').textContent=state.raid==='none'?'Показана суммарная ёмкость отдельных дисков.':state.raid===0?'Максимальная ёмкость; отказ одного диска разрушает массив.':'Полезная ёмкость указана до форматирования. RAID не заменяет резервную копию.';
 if(model){model.rebuild();refreshInspect()}
}
function counts(k){return k==='cpu'?['cpuCount',[1,2],'Процессоров']:k==='memory'?['ramCount',state.cpuCount===1?[1,2,4,6,8]:[2,4,8,12,16],'Модулей']:k==='drive'?['driveCount',[1,2,3,4,5,6,7,8],'Накопителей']:null}
function choices(){
 const query=$('part-search').value.trim().toLowerCase(),brand=$('part-brand').value,type=$('part-type').value;
 let list=parts[selectedKey].options.map((o,i)=>({o,i})).filter(({o})=>(!query||(o.name+' '+o.id+' '+o.desc).toLowerCase().includes(query))&&(!brand||o.brand===brand)&&(!type||o.kind===type));
 $('picker-count').textContent=list.length+' позиций';
 $('server-choices').innerHTML=list.map(({o,i})=>'<article class="choice '+(state[selectedKey]===i?'selected':'')+'">'+thumb(selectedKey,o)+'<div class="choice-text"><span class="maker">'+o.brand+'</span><h3>'+esc(o.name)+'</h3><code>'+esc(o.id)+'</code><p>'+esc(o.desc)+'</p>'+tags(o)+'<a class="source-link" href="'+o.source+'" target="_blank" rel="noopener">Документация производителя ↗</a>'+(o.evidence?'<p class="evidence">'+esc(o.evidence)+'</p>':'')+'</div><div class="choice-price"><span>'+(o.included?'В составе платформы':'Цена по запросу')+'</span><button class="select-choice" data-choice="'+i+'">'+(state[selectedKey]===i?'Выбрано ✓':'Установить')+'</button>'+(!o.included?'<button class="preview-choice" data-see="'+i+'">Рассмотреть в 3D</button>':'')+'</div></article>').join('')||'<p class="no-results">Ничего не найдено. Измените запрос или фильтры.</p>';
}
function picker(k){
 selectedKey=k;if(model)model.focus(sceneKey(k));$('picker-title').textContent=parts[k].label;$('picker-context').textContent=hints[k];$('part-search').value='';
 $('part-brand').innerHTML='<option value="">Все производители</option>'+[...new Set(parts[k].options.map(x=>x.brand))].map(x=>'<option>'+x+'</option>').join('');$('part-type').hidden=k!=='drive';$('part-type').value='';
 const ct=counts(k);$('server-quantity').innerHTML=ct?'<label class="field">'+ct[2]+'<select id="part-count" data-count="'+ct[0]+'">'+ct[1].map(n=>'<option '+(state[ct[0]]===n?'selected':'')+'>'+n+'</option>').join('')+'</select><span>'+(k==='cpu'?'Одинаковая модель в обоих сокетах':k==='memory'?'Равномерно между установленными CPU':'Один массив из одинаковых моделей')+'</span></label>':'';
 choices();if(!$('server-picker').open)$('server-picker').showModal();
}
function change(fn,message){lastState={...state};fn();document.querySelectorAll('[data-preset]').forEach(n=>n.setAttribute('aria-pressed','false'));render();status(message);$('undo-change').hidden=false;}
function install(i){change(()=>{state[selectedKey]=i;if(selectedKey==='cpu'){const allowed=counts('memory')[1];if(!allowed.includes(state.ramCount))state.ramCount=allowed.find(x=>x>=state.ramCount)||allowed.at(-1)}},'Установлен '+parts[selectedKey].options[i].name+'.');choices();}
function refreshInspect(){const k=$('inspect-part').value,key=k==='raid'?'controller':k,o=parts[key]?option(key):null;$('inspected-product').innerHTML=o?'<span>'+esc(o.name)+'</span><code>'+esc(o.id)+'</code><a href="'+o.source+'" target="_blank" rel="noopener">Характеристики ↗</a>':'<span>'+(key==='board'?'Supermicro X13DEI-T':key==='cooling'?'Охлаждение платформы':'Деталь не установлена')+'</span>'}
function inspect(k){const key=sceneKey(k);$('inspect-part').value=key;if(model){model.focus(key);$('inspect').setAttribute('aria-pressed',model.detail(true));$('cover').setAttribute('aria-pressed','true');$('cover').textContent='Без крышки'}refreshInspect();$('visual-panel').scrollIntoView({behavior:'smooth',block:'start'})}
$('part-search').oninput=choices;$('part-brand').onchange=choices;$('part-type').onchange=choices;
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
 if(b.dataset.part)picker(b.dataset.part);
 if(b.dataset.choice!==undefined)install(+b.dataset.choice);
 if(b.dataset.see!==undefined){install(+b.dataset.see);$('server-picker').close();inspect(selectedKey)}
 if(b.dataset.preview)inspect(b.dataset.preview);
 if(b.dataset.remove)change(()=>state[b.dataset.remove]=null,'Компонент убран из сборки.');
 if(b.dataset.preset){change(()=>{state=b.dataset.preset==='empty'?C.blank():{...C.defaults(),...(b.dataset.preset==='vm'?{cpu:1,cpuCount:2,memory:2,ramCount:16,driveCount:4,controller:1,network:1,raid:10}:b.dataset.preset==='storage'?{drive:3,driveCount:8,controller:1,raid:6}:{})}},b.dataset.preset==='empty'?'Платформа готова. Выберите процессор, память и накопители.':'Готовая конфигурация загружена.');b.setAttribute('aria-pressed','true')}
});
$('server-quantity').addEventListener('change',e=>{const k=e.target.dataset.count;if(!k)return;change(()=>{state[k]=+e.target.value;if(k==='cpuCount'){const allowed=counts('memory')[1];if(!allowed.includes(state.ramCount))state.ramCount=allowed.find(x=>x>=state.ramCount)||allowed.at(-1)}},'Количество изменено. Проверки совместимости обновлены.');});
$('raid-level').onchange=e=>change(()=>state.raid=e.target.value==='none'?'none':+e.target.value,'Уровень RAID изменён.');
$('undo-change').onclick=()=>{if(lastState){const previous={...state};state=lastState;lastState=previous;render();status('Последнее изменение отменено.')}};
$('picker-close').onclick=()=>$('server-picker').close();
$('save-server').onclick=()=>{try{localStorage.setItem('klamas-server-v2',JSON.stringify(state));status('Сборка сохранена на этом устройстве.')}catch{status('Сохранение недоступно. Используйте ссылку на сборку.')}};
$('share-server').onclick=async()=>{const url=new URL(location.href);url.hash='build='+encodeURIComponent(JSON.stringify(state));try{await navigator.clipboard.writeText(url.href);status('Ссылка на эту комплектацию скопирована.')}catch{$('share-url').hidden=false;$('share-url').value=url.href;$('share-url').select();status('Скопируйте ссылку из поля.')}};
$('download-server').onclick=()=>{const c=C.validate(state);if(c.issues.length)return;const lines=['КЛАМАС — СПЕЦИФИКАЦИЯ СЕРВЕРА',...Object.keys(parts).filter(k=>option(k)).map(k=>parts[k].label+': '+option(k).name+' | '+option(k).id+' | '+qty(k)+' шт.'),'',...c.accessories.map(a=>a.name+' | '+a.id+' | '+a.qty+' шт.'),'','RAID: '+state.raid,'Ядра / потоки: '+c.cores+' / '+c.threads,'Память: '+c.ram+' ГБ, до '+c.mt+' MT/s','Полезная ёмкость: '+c.usable+' ТБ','Оценка нагрузки: '+c.load+' Вт','',...c.notes,'','Цена и наличие: по запросу. Нужны подтверждение QVL накопителей, кабельного комплекта, BIOS и стоимости поставки.','','Источники:',...Object.keys(parts).filter(k=>option(k)).map(k=>option(k).id+': '+option(k).source)];const url=URL.createObjectURL(new Blob(['\ufeff'+lines.join('\n')],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='Klamas-SYS-621P-TRT.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
render();
(async()=>{try{
 const {createServerScene}=await import('./server-scene.js?v=8');
 model=await createServerScene({host:$('server-scene'),getState:()=>({...state,cpuCount:option('cpu')?state.cpuCount:0,ramCount:option('memory')?state.ramCount:0,driveCount:option('drive')?state.driveCount:0,cpuCores:option('cpu')?.cores||0,cpuW:option('cpu')?.w||0,cpuName:option('cpu')?.id||'',driveTB:option('drive')?.tb||0,driveKind:option('drive')?.kind||'SSD',driveName:option('drive')?.id||'',ramGB:option('memory')?.gb||0,ramChips:option('memory')?.chips||0,ramName:option('memory')?.id||'',psuW:1200,networkName:option('network').id,controllerName:option('controller').id})});
 model.focus('cpu');$('server-loading').hidden=true;refreshInspect();
 $('cover').onclick=()=>{const open=model.cover();$('cover').setAttribute('aria-pressed',open);$('cover').textContent=open?'Без крышки':'С крышкой';$('explode').setAttribute('aria-pressed','false');$('inspect').setAttribute('aria-pressed','false')};
 $('explode').onclick=()=>{const on=model.explode();$('explode').setAttribute('aria-pressed',on);$('cover').setAttribute('aria-pressed','true');$('cover').textContent='Без крышки';$('inspect').setAttribute('aria-pressed','false')};
 for(const id of ['front','top','rear','reset-view'])$(id).onclick=()=>{model.setView(id);if(id==='reset-view')$('inspect').setAttribute('aria-pressed','false')};
 $('zoom-in').onclick=()=>model.zoom(-1);$('zoom-out').onclick=()=>model.zoom(1);
 $('inspect').onclick=()=>{model.focus($('inspect-part').value);$('inspect').setAttribute('aria-pressed',model.detail($('inspect').getAttribute('aria-pressed')!=='true'));refreshInspect()};
 $('inspect-part').onchange=()=>inspect($('inspect-part').value);
 $('full-scene').onclick=async()=>{if($('visual-panel').classList.contains('expanded-view')){$('visual-panel').classList.remove('expanded-view');return}try{if(document.fullscreenElement)await document.exitFullscreen();else await $('visual-panel').requestFullscreen()}catch{$('visual-panel').classList.add('expanded-view')}};
 document.addEventListener('keydown',e=>{if(e.key==='Escape')$('visual-panel').classList.remove('expanded-view')});
}catch(e){$('server-loading').innerHTML='Модель не загрузилась. Подбор комплектующих доступен.<button class="tool" onclick="location.reload()">Повторить</button>';console.error(e)}})();
})();
