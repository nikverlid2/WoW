/* Source-backed catalogue. Prices/stock intentionally null until supplied by Klamas.
   Sources checked 2026-10-04. Geometry is reconstructed, not manufacturer CAD. */
(function(root){
'use strict';
const platformSource='https://www.supermicro.com/en/products/system/mainstream/2u/sys-621p-trt';
const boardSource='https://www.supermicro.com/en/products/motherboard/x13dei-t';
const memorySource='https://www.kingston.com/en/memory/search/model/106848/supermicro-mainstream-superserver-sys-621p-trt-super-x13dei-t';
const ssdSource='https://www.kingston.com/en/ssd/dc600m-data-center-solid-state-drive';
const raidSource='https://www.supermicro.com/en/products/accessories/addon/aoc-s3908l-h8ir_s3916l-h16ir.php';
const ramImage=n=>'https://media.kingston.com/kingston/product/DDR5_ECC_Registered_DIMM_x80_'+(n===16?'1R_x8':n===32?'2R_x8':'2R_x4')+'_1-tn.png';
const parts={
platform:{label:'Серверная платформа',fixed:true,options:[{id:'SYS-621P-TRT',name:'Supermicro SYS-621P-TRT',brand:'Supermicro',desc:'Корпус CSE-825BTS-R1K23LPP1 + плата X13DEI-T',tags:['2U · 437 × 647 × 89 мм','2 × LGA4677','8 × LFF'],source:platformSource,image:'https://www.supermicro.com/files_SYS/images/System/SYS-621P-TRT_main.jpg'}]},
cpu:{label:'Процессоры',required:true,options:[
{id:'4410Y',name:'Intel Xeon Silver 4410Y',brand:'Intel',desc:'12 ядер / 24 потока · 2,0–3,9 ГГц · 30 МБ',cores:12,threads:24,w:150,mt:4000,carrier:'E1B',tags:['LGA4677','150 Вт','77,5 × 56,5 мм'],source:'https://www.intel.com/content/www/us/en/products/sku/232376/intel-xeon-silver-4410y-processor-30m-cache-2-00-ghz/specifications.html'},
{id:'5418Y',name:'Intel Xeon Gold 5418Y',brand:'Intel',desc:'24 ядра / 48 потоков · 2,0–3,8 ГГц · 45 МБ',cores:24,threads:48,w:185,mt:4400,carrier:'E1B',tags:['LGA4677','185 Вт','77,5 × 56,5 мм'],source:'https://www.intel.com/content/www/us/en/products/sku/232379/intel-xeon-gold-5418y-processor-45m-cache-2-00-ghz/specifications.html'},
{id:'6430',name:'Intel Xeon Gold 6430',brand:'Intel',desc:'32 ядра / 64 потока · 2,1–3,4 ГГц · 60 МБ',cores:32,threads:64,w:270,mt:4400,carrier:'E1A',tags:['LGA4677','270 Вт','77,5 × 56,5 мм'],source:'https://www.intel.com/content/www/us/en/products/sku/231737/intel-xeon-gold-6430-processor-60m-cache-2-10-ghz/specifications.html'}]},
memory:{label:'Оперативная память',required:true,options:[16,32,64].map(gb=>({id:gb===16?'KSM56R46BS8-16HA':gb===32?'KSM56R46BD8-32HA':'KSM56R46BD4-64HA',name:'Kingston Server Premier '+gb+' ГБ',brand:'Kingston',desc:'DDR5-5600 ECC Registered · 1,1 В · '+(gb===16?'1Rx8':gb===32?'2Rx8':'2Rx4'),gb,mt:5600,chips:gb===16?10:gb===32?20:40,tags:['ECC RDIMM','288 контактов','133,35 × 31,25 мм'],image:ramImage(gb),source:memorySource,evidence:'Есть в подборщике Kingston для SYS-621P-TRT'}))},
drive:{label:'Накопители',required:true,options:[...[.96,1.92,3.84].map(tb=>({id:'SEDC600M/'+Math.round(tb*1000)+'G',name:'Kingston DC600M '+(tb<1?'960 ГБ':String(tb).replace('.',',')+' ТБ'),brand:'Kingston',kind:'SSD',desc:'SATA 6 Гбит/с · 3D TLC · защита от потери питания',tb,w:3.6,form:'2.5',dims:[69.9,100,7],tags:['SSD 2.5″','1 DWPD / 5 лет','PLP'],source:ssdSource,evidence:'Проверены SATA и габариты; QVL накопителя уточняется'})),{id:'ST8000NM017B',name:'Seagate Exos 7E10 8 ТБ',brand:'Seagate',kind:'HDD',desc:'SATA 6 Гбит/с · 7200 об/мин · CMR · 512e/4Kn',tb:8,w:12,form:'3.5',dims:[101.85,147,26.11],tags:['HDD 3.5″','7200 об/мин','CMR'],source:'https://www.seagate.com/support/internal-hard-drives/enterprise-hard-drives/exos-7e10/',evidence:'Проверены SATA и габариты; QVL накопителя уточняется'}]},
controller:{label:'Контроллер накопителей',options:[{id:'C741',name:'Intel C741 · встроенный SATA',brand:'Intel',included:true,desc:'8 каналов SATA · RAID средствами Intel / ОС',levels:['none',0,1,5,10],w:0,tags:['В составе платы','SATA 6 Гбит/с','Без отдельной PCIe-платы'],source:boardSource},{id:'AOC-S3908L-H8IR-16DD-O',name:'Supermicro AOC-S3908L-H8IR-16DD-O',brand:'Supermicro',desc:'Broadcom SAS3908 · 8 портов · 8 ГБ кеша',levels:['none',0,1,5,6,10],w:14,tags:['PCIe 4.0 ×8','SAS 12G / SATA 6G','Low Profile · 167,64 × 68,83 мм'],source:raidSource,image:'https://www.supermicro.com/a_images/products/Accessories/AOC-S3908L-H8iR.png',evidence:'Опция в перечне Supermicro для SYS-621P-TRT'}]},
network:{label:'Сеть',options:[{id:'BCM57416',name:'Broadcom BCM57416 · встроенный',brand:'Broadcom',included:true,desc:'2 × 10GBASE-T RJ45 + отдельный порт управления IPMI',speed:10,w:0,tags:['В составе платы','2 × RJ45','10 Гбит/с'],source:boardSource},{id:'AOC-S25G-i2S',name:'Supermicro AOC-S25G-i2S',brand:'Supermicro',desc:'Intel XXV710 · 2 × 25GbE SFP28; встроенные 10GbE остаются',speed:25,w:7.2,tags:['PCIe 3.0 ×8','154,9 × 68,6 мм','SFP28'],source:'https://www.supermicro.com/manuals/other/AOC-S25G-i2S.pdf',evidence:'Совместимость подтверждена Supermicro FAQ 42144'}]},
psu:{label:'Питание платформы',fixed:true,options:[{id:'PWS-1K23A-1R',name:'Supermicro PWS-1K23A-1R × 2',brand:'Supermicro',included:true,desc:'Штатные горячезаменяемые БП · резервирование 1+1',w:1200,tags:['2 × 1200 Вт','80 PLUS Titanium','76 × 40 × 336 мм'],source:'https://www.supermicro.com/en/support/faqs/faq.php?faq=44824'}]}
};
const blank=()=>({version:2,platform:0,cpu:null,memory:null,drive:null,controller:0,network:0,psu:0,cpuCount:1,ramCount:4,driveCount:2,raid:'none'});
const defaults=()=>({...blank(),cpu:0,memory:1,drive:1,raid:1});
const get=(s,k)=>parts[k].options[s[k]]||null;
function validate(s){
const cpu=get(s,'cpu'),ram=get(s,'memory'),drive=get(s,'drive'),ctrl=get(s,'controller'),n=drive?s.driveCount:0,issues=[],notes=[];
for(const k of ['cpu','memory','drive'])if(!get(s,k))issues.push('Выберите '+parts[k].label.toLowerCase()+'.');
if(ram&&!cpu)issues.push('Для установки памяти сначала выберите процессор.');
if(cpu&&ram&&(s.ramCount>s.cpuCount*8||s.ramCount%s.cpuCount!==0))issues.push('Память должна быть поровну распределена между CPU; доступно 8 DIMM на процессор.');
const supportedCounts=s.cpuCount===1?[1,2,4,6,8]:[2,4,8,12,16];
if(ram&&!supportedCounts.includes(s.ramCount))issues.push('Выберите поддерживаемое заполнение DIMM: '+supportedCounts.join(', ')+'.');
if(!ctrl.levels.includes(s.raid))issues.push('RAID '+s.raid+' требует отдельного контроллера AOC-S3908L-H8IR.');
if(s.raid!== 'none'&&drive){if(n<({0:2,1:2,5:3,6:4,10:4}[s.raid]||1))issues.push('Для RAID '+s.raid+' недостаточно накопителей.');if(s.raid===1&&n!==2)issues.push('В одном зеркале RAID 1 должны быть два накопителя.');if(s.raid===10&&n%2)issues.push('Для RAID 10 требуется чётное число накопителей.');}
const load=Math.ceil((cpu?.w||0)*(cpu?s.cpuCount:0)+(ram?s.ramCount*12:0)+(drive?.w||0)*n+get(s,'network').w+ctrl.w+140);
if(Math.ceil(load*1.25)>1200)issues.push('Запас питания 1+1 меньше 25% по расчётной нагрузке.');
const mt=cpu&&ram?Math.min(cpu.mt,ram.mt):0;
if(mt&&mt<ram.mt)notes.push('Память '+ram.mt+' MT/s будет работать до '+mt+' MT/s: ограничение '+cpu.name+'.');
if(cpu&&ram&&s.ramCount<s.cpuCount*8)notes.push('Для полной загрузки 8 каналов памяти нужно 8 модулей на каждый CPU.');
if(drive)notes.push('Накопитель: интерфейс и размер подходят. Вендорскую квалификацию диска и прошивку нужно подтвердить перед поставкой.');
if(s.controller===1)notes.push('Для RAID-карты нужны согласованные кабели к backplane. CacheVault BTR-CVPM05 — отдельная опция; без него не включайте незащищённый write-back.');
if(s.network===1)notes.push('Для SFP28 отдельно подбираются трансиверы или DAC-кабели.');
const raidBad=issues.some(x=>x.includes('RAID'));const usable=!drive||raidBad?null:drive.tb*(s.raid==='none'||s.raid===0?n:s.raid===1?1:s.raid===5?n-1:s.raid===6?n-2:n/2);
const accessories=[];
if(drive?.form==='2.5')accessories.push({id:'MCP-220-00043-0N',name:'Корзина-переходник 3.5″ → 2.5″',qty:n,source:platformSource});
if(cpu)accessories.push({id:cpu.carrier==='E1B'?'SKT-1424L-001B-FXC':'SKT-1333L-0000-FXC',name:'Держатель процессора '+cpu.carrier,qty:s.cpuCount,source:platformSource});
return{issues,notes,load,usable,mt,accessories,cores:(cpu?.cores||0)*(cpu?s.cpuCount:0),threads:(cpu?.threads||0)*(cpu?s.cpuCount:0),ram:(ram?.gb||0)*(ram?s.ramCount:0),filled:['cpu','memory','drive'].filter(k=>get(s,k)).length};
}
function sanitize(raw){const s=blank();if(!raw||raw.version!==2)return s;for(const k of Object.keys(parts)){const i=raw[k];if(i===null&&parts[k].required)s[k]=null;else if(Number.isInteger(i)&&parts[k].options[i])s[k]=i;}for(const [k,nums] of [['cpuCount',[1,2]],['ramCount',[1,2,4,6,8,12,16]],['driveCount',[1,2,3,4,5,6,7,8]]])if(nums.includes(raw[k]))s[k]=raw[k];if(['none',0,1,5,6,10].includes(raw.raid))s.raid=raw.raid;return s;}
const api={parts,blank,defaults,get,validate,sanitize};if(typeof module!=='undefined')module.exports=api;else root.ServerCatalog=api;
})(typeof window!=='undefined'?window:this);
