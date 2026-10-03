import {createSoftwareRenderer} from './server-renderer.js?v=5';

export async function createServerScene({host,getState,onPart,onReady}) {
 const T=await import('https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js');
 let renderer;try{renderer=new T.WebGLRenderer({antialias:true,alpha:true})}catch{renderer=createSoftwareRenderer(T)}
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
 host.prepend(renderer.domElement);const canvas=renderer.domElement;canvas.tabIndex=0;canvas.setAttribute('aria-label','Объёмная модель сервера. Стрелки — вращение, плюс и минус — масштаб.');
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(34,1,.1,100);
 scene.add(new T.HemisphereLight(0xf6f8ff,0x6b7075,2.3));
 const key=new T.DirectionalLight(0xfffaf0,3.5);key.position.set(-4,9,6);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-7,right:7,top:7,bottom:-7});key.shadow.bias=-.0003;key.shadow.normalBias=.015;scene.add(key);
 const rim=new T.DirectionalLight(0xe1eaff,2.2);rim.position.set(5,5,-5);scene.add(rim);
 const floor=new T.Mesh(new T.PlaneGeometry(30,30),new T.ShadowMaterial({opacity:.15}));floor.rotation.x=-Math.PI/2;floor.position.y=-.06;floor.receiveShadow=true;scene.add(floor);
 // Soft studio reflections give metal readable edges, even without an HDR download.
 if(!renderer.isSoftware){const env=new T.Scene();env.background=new T.Color(0xb3bcc5);for(const [x,y,z,w,h] of [[-5,5,2,5,7],[5,4,-4,3,8],[0,7,0,8,4]]){const panel=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:0xffffff,side:T.DoubleSide}));panel.position.set(x,y,z);panel.lookAt(0,0,0);env.add(panel)}const pm=new T.PMREMGenerator(renderer);scene.environment=pm.fromScene(env,.08).texture;pm.dispose();env.traverse(o=>{o.geometry?.dispose();o.material?.dispose()});}
 const make=(color,metalness=0,roughness=.5)=>new T.MeshStandardMaterial({color,metalness,roughness});
 const m={steel:make(0xc0c5c8,.65,.38),edge:make(0xe1e4e5,.7,.3),dark:make(0x24292d,.25,.52),black:make(0x101517,.05,.7),pcb:make(0x19503b,.12,.67),blue:make(0x177fb1,.1,.5),gold:make(0xc9b47a,.65,.35),copper:make(0xb07b49,.65,.35),orange:make(0xf07138,.1,.4),red:make(0x9b263e,.1,.5),white:make(0xf5f3e9,0,.75),trace:make(0x376c4a,.2,.7),led:new T.MeshBasicMaterial({color:0x72d69d}),yellow:make(0xd3ad3b),wire:make(0x292724)};
 let root=new T.Group();scene.add(root);let groups={},inspectItems={},coverOpen=true,exploded=false,focused=null,detail=false,theta=.38,phi=.92,distance=12.7,target=new T.Vector3(0,.25,0),frame=0;
 const dynamicMaterials=new Set();
 function group(key){const g=new T.Group();g.userData.part=key;root.add(g);(groups[key]??=[]).push(g);return g}
 function box(p,w,h,d,x,y,z,mat=m.steel){const o=new T.Mesh(new T.BoxGeometry(w,h,d),mat);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;p.add(o);return o}
 function roundBox(p,w,h,d,x,y,z,mat,r=.025){
   r=Math.min(r,w/4,h/4,d/4);const s=new T.Shape(),a=-w/2+r,b=-h/2+r;
   s.moveTo(a,-h/2);s.lineTo(-a,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,b);s.lineTo(w/2,-b);s.quadraticCurveTo(w/2,h/2,-a,h/2);s.lineTo(a,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,-b);s.lineTo(-w/2,b);s.quadraticCurveTo(-w/2,-h/2,a,-h/2);
   const geo=new T.ExtrudeGeometry(s,{depth:d-2*r,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:r*.45,bevelThickness:r,curveSegments:3});geo.translate(0,0,-d/2+r);const o=new T.Mesh(geo,mat);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;p.add(o);return o;
 }
 function cyl(p,r,h,x,y,z,mat=m.edge,n=12){const o=new T.Mesh(new T.CylinderGeometry(r,r,h,n),mat);o.position.set(x,y,z);o.castShadow=true;p.add(o);return o}
 function ring(p,r,t,x,y,z,mat=m.steel){const o=new T.Mesh(new T.TorusGeometry(r,t,5,28),mat);o.position.set(x,y,z);p.add(o);return o}
 function screw(p,x,y,z){cyl(p,.024,.012,x,y,z,m.edge);box(p,.029,.003,.006,x,y+.008,z,m.dark);box(p,.006,.003,.029,x,y+.009,z,m.dark)}
 function tube(p,points,r,mat){const path=new T.CatmullRomCurve3(points.map(a=>new T.Vector3(...a)));const o=new T.Mesh(new T.TubeGeometry(path,18,r,6,false),mat);o.castShadow=true;p.add(o);return o}
 function label(p,text,w,h,x,y,z,flat=true,dark=false){
   const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle=dark?'#242a2e':'#e4e5dc';ctx.fillRect(0,0,512,128);ctx.fillStyle=dark?'#e9eded':'#26302a';ctx.font='600 26px Arial';ctx.fillText(text,20,40);ctx.font='14px monospace';ctx.fillText('KLAMAS • SYSTEM COMPONENT',20,66);
   for(let i=0;i<60;i++){ctx.fillRect(20+i*4,85,1+(i%3===0?1:0),24)}ctx.font='12px monospace';ctx.fillText('2U / SERVICE',315,102);
   const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;const mat=new T.MeshBasicMaterial({map:tex});dynamicMaterials.add(mat);const o=new T.Mesh(new T.PlaneGeometry(w,h),mat);o.position.set(x,y,z);if(flat)o.rotation.x=-Math.PI/2;p.add(o);return o;
 }
 function pcbSurface(p,w,d,x,y,z){
   box(p,w,.025,d,x,y,z,m.pcb);
   const c=document.createElement('canvas');c.width=1024;c.height=1024;const g=c.getContext('2d');g.fillStyle='#245840';g.fillRect(0,0,1024,1024);
   let seed=84;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
   for(let i=0;i<360;i++){const x0=rnd()*1024,y0=rnd()*1024,l=20+rnd()*160;g.strokeStyle=i%3?'#37684a':'#4f7955';g.lineWidth=1;g.beginPath();g.moveTo(x0,y0);g.lineTo(x0+l*.3,y0);g.lineTo(x0+l*.55,y0+l*.25);g.lineTo(x0+l,y0+l*.25);g.stroke();g.fillStyle='#bea771';g.fillRect(x0-1,y0-1,2,2)}
   g.fillStyle='#c7ceb9';g.font='16px monospace';g.fillText('KLAMAS SERVER BOARD · DUAL SOCKET',30,50);g.font='11px monospace';for(let i=0;i<40;i++)g.fillText('R'+(100+i)+'   C'+(180+i),rnd()*950,rnd()*1000);
   const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;const mat=new T.MeshStandardMaterial({map:tex,roughness:.7,metalness:.05});dynamicMaterials.add(mat);const o=new T.Mesh(new T.PlaneGeometry(w,d),mat);o.rotation.x=-Math.PI/2;o.position.set(x,y+.013,z);p.add(o);
 }
 function build(){
   root.traverse(o=>o.geometry?.dispose());for(const mat of dynamicMaterials){mat.map?.dispose();mat.dispose()}dynamicMaterials.clear();scene.remove(root);root=new T.Group();scene.add(root);groups={};inspectItems={};
   const s=getState(),lift=exploded?1:0;
   const item=(key,g)=>{(inspectItems[key]??=[]).push(g);return g};
   // Scale: one unit = 100 mm. Reference envelope: 437 W × 647 D × 89 H.
   const chassis=group('platform');box(chassis,4.37,.035,6.47,0,0,0);
   for(const x of [-2.165,2.165]){box(chassis,.035,.84,6.47,x,.438,0);box(chassis,.08,.025,6.43,x,.87,0,m.edge);box(chassis,.055,.10,5.9,x+(x>0?.045:-.045),.35,-.1,m.dark);for(let z=-2.9;z<3;z+=.72)screw(chassis,x,.886,z);for(let z=-2.7;z<2.6;z+=.45){const h=cyl(chassis,.033,.002,x+(x>0?.019:-.019),.6,z,m.dark);h.rotation.z=Math.PI/2;}}
   box(chassis,4.31,.10,.035,0,.08,-3.22);box(chassis,4.31,.05,.035,0,.866,-3.22,m.edge);
   for(const x of [-2.14,-.31,1.26,2.14])box(chassis,.04,.76,.035,x,.46,-3.22,m.edge);
   // Six open, slotted PCIe brackets, readable from both sides.
   for(let i=0;i<6;i++){
     const x=-1.97+i*.30;
     for(const dx of [-.112,.112])box(chassis,.035,.68,.035,x+dx,.48,-3.23,m.edge);
     for(let j=0;j<8;j++)box(chassis,.24,.025,.035,x,.18+j*.086,-3.23,m.edge);
     box(chassis,.11,.06,.08,x,.84,-3.23,m.edge);
   }
   // I/O shield: serial, four USB sockets, management LAN, dual LAN and VGA.
   box(chassis,1.52,.27,.027,.47,.245,-3.23,m.steel);
   for(let row=0;row<4;row++)box(chassis,1.52,.023,.025,.47,.45+row*.097,-3.23,m.edge);
   for(let col=0;col<15;col++)box(chassis,.021,.36,.025,-.22+col*.099,.60,-3.23,m.edge);
   for(let i=0;i<2;i++)for(let j=0;j<2;j++){const x=.12+i*.18,y=.23+j*.09;box(chassis,.14,.067,.04,x,y,-3.26,m.edge);box(chassis,.11,.040,.005,x,y,-3.283,m.black);box(chassis,.075,.009,.006,x,y-.006,-3.288,m.blue)}
   for(const x of [.51,.73]){box(chassis,.18,.16,.11,x,.244,-3.27,m.edge);box(chassis,.13,.10,.005,x,.244,-3.328,m.black);box(chassis,.032,.021,.007,x-.049,.31,-3.331,m.led)}
   roundBox(chassis,.26,.103,.045,1.04,.23,-3.28,m.blue,.013);for(let i=0;i<5;i++){const pin=cyl(chassis,.005,.007,.945+i*.043,.23,-3.309,m.dark,6);pin.rotation.x=Math.PI/2}
   roundBox(chassis,.25,.102,.045,-.11,.23,-3.28,m.dark,.013);
   for(const x of [-2.31,2.31]){roundBox(chassis,.25,.83,.085,x,.43,3.20,m.steel);for(const y of [.20,.66]){const h=cyl(chassis,.047,.015,x,y,3.25,m.black);h.rotation.x=Math.PI/2}tube(chassis,[[x,.22,3.29],[x,.22,3.46],[x,.67,3.46],[x,.67,3.29]],.043,m.edge)}
   // Drive cage and real 3.5-inch caddies with 2.5-inch SSD adapters.
   const drives=group('drive');box(drives,4.22,.75,.03,0,.4,1.56,m.pcb);box(drives,4.25,.025,1.5,0,.76,2.40);
   for(let i=0;i<8;i++){
     const x=-1.57+(i%4)*1.047,y=.19+Math.floor(i/4)*.31;const g=new T.Group();g.position.set(x,y,exploded?1.05:0);drives.add(g);item('drive',g);
     box(g,1,.255,1.52,0,0,2.41,m.dark);box(g,.94,.018,1.40,0,-.10,2.43,m.edge);
     for(const side of [-1,1])box(g,.025,.22,1.36,side*.475,.015,2.45);
     if(i<s.driveCount){roundBox(g,.70,.07,1.00,0,-.025,2.5,m.edge,.012);label(g,'SATA SSD / '+s.driveTB+' TB',.56,.28,0,.013,2.46);for(const dx of [-.3,.3])screw(g,dx,.02,2.12)}
     roundBox(g,.98,.27,.10,0,0,3.21,m.black,.014);
     for(let row=0;row<3;row++)for(let col=0;col<14;col++)box(g,.026,.033,.005,-.43+col*.052,-.07+row*.06,3.263,m.steel);
     // Raised curved handle, a latch and status light, not a painted rectangle.
     tube(g,[[-.40,-.07,3.27],[-.30,-.045,3.315],[.20,-.045,3.315],[.35,-.07,3.27]],.020,m.dark);roundBox(g,.085,.13,.035,.405,0,3.28,i<s.driveCount?m.red:m.dark,.01);
     box(g,.018,.056,.011,-.448,.063,3.279,i<s.driveCount?m.led:m.dark);
   }
   box(chassis,4.22,.095,.10,0,.80,3.21,m.dark);
   for(let i=0;i<48;i++)box(chassis,.038,.031,.005,-2.01+i*.085,.8,3.264,m.steel);
   // Front cage shield with punched ventilation and control panel.
   box(chassis,4.24,.022,1.46,0,.876,2.45,m.steel);
   for(let i=0;i<50;i++)box(chassis,.025,.003,.08,-2.06+i*.084,.889,3.08,m.dark);
   for(const x of [-1.8,0,1.8])screw(chassis,x,.891,2.2);
   roundBox(chassis,.57,.11,.014,1.50,.8,3.28,m.black,.01);for(let i=0;i<4;i++)box(chassis,.028,.026,.004,1.33+i*.09,.8,3.291,i?m.led:m.blue);
   label(chassis,'KLAMAS / 2U',.63,.105,-1.30,.80,3.279,false,true);
   // X13-style motherboard: CPUs arranged along airflow; four DIMMs per bank.
   const board=group('board');pcbSurface(board,3.15,3.32,-.50,.11,-1.49);
   for(const x of [-1.98,1.0])for(const z of [-3.03,-1.45,.04]){cyl(board,.039,.035,x,.14,z,m.gold);screw(board,x,.16,z)}
   for(let i=0;i<6;i++){const x=-1.92+i*.28;box(board,.07,.08,1.03,x,.18,-2.53,i%2?m.black:m.blue);box(board,.021,.02,.93,x,.224,-2.53,m.dark)}
   // BMC, chipset, controllers, capacitors and VRM arrays follow functional zones.
   for(let i=0;i<14;i++){const x=-1.90+(i%4)*.255,z=-1.66+Math.floor(i/4)*.42;box(board,.16,.045,.21,x,.15,z,m.black);for(const side of [-1,1])for(let n=0;n<5;n++)box(board,.022,.012,.016,x+side*.09,.14,z-.07+n*.034,m.edge)}
   for(let i=0;i<44;i++){const x=-1.97+(i%11)*.275,z=-.05-Math.floor(i/11)*.115;box(board,.055,.04,.065,x,.155,z,m.dark);cyl(board,.018,.06,x+.065,.17,z,m.edge,8)}
   for(let i=0;i<18;i++){const x=-1.28+(i%6)*.31,z=-1.35+Math.floor(i/6)*.17;box(board,.042,.03,.08,x,.15,z,m.white)}
   box(board,.33,.055,.39,-1.22,.18,-1.52,m.edge);for(let i=0;i<10;i++)box(board,.017,.1,.38,-1.36+i*.032,.23,-1.52,m.steel);
   for(let i=0;i<2;i++){box(board,.20,.05,.80,-1.90+i*.29,.16,-.81,m.dark);box(board,.16,.025,.70,-1.90+i*.29,.198,-.81,m.pcb)}
   const cpus=group('cpu'),memory=group('memory');
   for(let i=0;i<2;i++){
     const x=.19,z=i?-2.29:-.67;
     roundBox(board,.78,.036,.95,x,.164,z,m.dark,.012);box(board,.71,.025,.88,x,.19,z,m.edge);
     if(i<s.cpuCount){
       const g=new T.Group();g.position.y=lift*.92;cpus.add(g);item('cpu',g);
       box(g,.53,.036,.69,x,.228,z,m.pcb);roundBox(g,.47,.022,.61,x,.258,z,m.edge,.02);
       const sink=new T.Group();sink.position.y=lift*.40;g.add(sink);
       box(sink,.80,.055,.96,x,.30,z,m.copper);box(sink,.86,.045,1.00,x,.35,z,m.edge);
       const finHeight=s.cpuW>240?.40:.32;
       for(let n=0;n<36;n++)box(sink,.012,finHeight,.96,x-.403+n*.023,.38+finHeight/2,z,m.steel);
       for(const dx of [-.37,.37])for(const dz of [-.42,.42]){cyl(sink,.036,.13,x+dx,.64,z+dz,m.dark);screw(sink,x+dx,.714,z+dz)}
       label(sink,'CPU '+(i+1)+' / '+s.cpuCores+' CORES',.66,.27,x,.385+finHeight,z);
     }else{box(board,.67,.055,.84,x,.24,z,m.black);label(board,'CPU 2 / EMPTY',.53,.22,x,.270,z)}
     const perCPU=Math.floor(s.ramCount/s.cpuCount)+(i<s.ramCount%s.cpuCount?1:0);
     for(let j=0;j<8;j++){
       const side=j%2===0?-1:1,bank=Math.floor(j/2),mx=x+side*(.51+bank*.115);
       box(board,.057,.065,1.38,mx,.18,z,m.blue);box(board,.019,.011,1.28,mx,.218,z,m.dark);
       for(const end of [-1,1])roundBox(board,.065,.09,.075,mx,.224,z+end*.69,m.white,.006);
       if(i<s.cpuCount&&j<perCPU){
         const g=new T.Group();g.position.y=lift*.8;memory.add(g);item('memory',g);box(g,.027,.30,1.33,mx,.355,z,m.pcb);
         for(let pin=0;pin<28;pin++)for(const face of [-1,1])box(g,.002,.036,.026,mx+face*.014,.222,z-.59+pin*.043,m.gold);
         for(let n=0;n<8;n++)for(const face of [-1,1])box(g,.022,.14,.10,mx+face*.022,.363,z-.54+n*.15,m.black);
         box(g,.009,.1,.34,mx+.036,.39,z,m.white);
       }
     }
   }
   // Three 80 mm fan modules in a removable metal wall.
   const cooling=group('cooling');cooling.position.y=lift*.3;
   box(cooling,3.38,.06,.56,-.43,.066,.65,m.steel);
   for(let i=0;i<3;i++){
     const x=-1.62+i*1.05,y=.47,z=.68;const g=new T.Group();g.position.set(x,y,z);cooling.add(g);item('cooling',g);
     for(const dx of [-.385,.385])box(g,.075,.84,.39,dx,0,0,m.black);
     for(const dy of [-.385,.385])box(g,.70,.075,.39,0,dy,0,m.black);
     for(const face of [-1,1]){ring(g,.34,.018,0,0,face*.205,m.edge);ring(g,.255,.01,0,0,face*.214,m.steel);ring(g,.165,.01,0,0,face*.214,m.steel);}
     for(let n=0;n<7;n++){const a=n*Math.PI*2/7;const blade=roundBox(g,.15,.27,.018,Math.sin(a)*.16,Math.cos(a)*.16,0,m.dark,.008);blade.rotation.z=-a+.50;blade.rotation.y=.32;}
     const hub=cyl(g,.09,.22,0,0,0,m.black,20);hub.rotation.x=Math.PI/2;
     for(let j=0;j<4;j++){const a=j*Math.PI/2;const strut=box(g,.035,.32,.013,Math.sin(a)*.17,Math.cos(a)*.17,.23,m.steel);strut.rotation.z=-a}
     for(const dx of [-.35,.35])for(const dy of [-.35,.35]){const pin=cyl(g,.025,.018,dx,dy,.24,m.edge);pin.rotation.x=Math.PI/2;}
     box(g,.20,.033,.16,0,.425,0,m.white);
   }
   // Hot-swap power modules: 76 × 40 × 336 mm; stacked vertically along right rail.
   const psu=group('psu');
   for(let i=0;i<2;i++){
     const g=new T.Group();g.position.z=exploded?-.70-i*.28:0;g.position.y=exploded?i*.25:0;psu.add(g);item('psu',g);
     const x=1.73,y=.23+i*.405,z=-1.51;roundBox(g,.76,.385,3.36,x,y,z,m.steel,.008);
     box(g,.67,.008,2.81,x,y+.201,z+.12,m.edge);box(g,.57,.004,1.05,x,y+.209,z+.12,m.steel);
     label(g,s.psuW+'W / HOT SWAP',.57,.32,x,y+.213,-2.54);
     box(g,.72,.365,.04,x,y,-3.215,m.dark);
     for(let row=0;row<3;row++)for(let col=0;col<6;col++)box(g,.049,.041,.007,x-.29+col*.067,y-.095+row*.078,-3.24,m.black);
     roundBox(g,.23,.16,.045,x+.18,y,-3.26,m.black,.017);tube(g,[[x-.28,y-.1,-3.25],[x-.28,y-.1,-3.44],[x+.26,y-.1,-3.44],[x+.26,y-.1,-3.25]],.023,m.edge);
     box(g,.09,.045,.09,x+.27,y+.16,-3.30,m.orange);box(g,.031,.030,.005,x-.29,y+.12,-3.243,m.led);
   }
   // Tidy routed power loom and SAS cables; no wire crosses a CPU or fan opening.
   for(let i=0;i<7;i++){const x=1.08+i*.035;tube(board,[[1.5,.25,.28],[1.25,.64,.28],[x,.57,-.03],[x,.28,-.34]],.018,i%3===0?m.red:i%3===1?m.yellow:m.wire)}
   for(let i=0;i<2;i++){tube(board,[[-1.89+i*.06,.23,-.42],[-2.04+i*.06,.30,.2],[-2.02+i*.06,.24,1.24],[-1.25+i*.25,.28,1.51]],.027,m.black);box(board,.20,.10,.14,-1.25+i*.25,.25,1.51,m.dark)}
   const nic=group('network');nic.position.y=lift*.6;pcbSurface(nic,.55,1.22,-1.60,.38,-2.55);box(nic,.23,.045,.33,-1.60,.43,-2.55,m.edge);for(let i=0;i<8;i++)box(nic,.017,.10,.31,-1.70+i*.028,.49,-2.55,m.steel);
   box(nic,.62,.48,.029,-1.60,.44,-3.245,m.edge);for(let i=0;i<2;i++){box(nic,.19,.14,.14,-1.76+i*.27,.45,-3.27,m.edge);box(nic,.15,.10,.005,-1.76+i*.27,.45,-3.344,m.black)}
   const raid=group('raid');raid.position.y=lift*.45;pcbSurface(raid,.39,.90,-.97,.38,-2.68);box(raid,.29,.09,.35,-.97,.44,-2.65,m.dark);for(let i=0;i<7;i++)box(raid,.025,.1,.31,-1.07+i*.035,.52,-2.65,m.edge);
   const cover=group('cover');cover.visible=!coverOpen;const cy=exploded?2.55:.905;box(cover,4.30,.026,6.42,0,cy,0,m.steel);for(const x of [-2.13,2.13])box(cover,.025,.11,6.38,x,cy-.044,0,m.steel);roundBox(cover,.56,.025,.33,0,cy+.028,-1.10,m.dark,.01);box(cover,.38,.028,.12,0,cy+.054,-1.1,m.black);label(cover,'KLAMAS / RACK SERVER',1.10,.30,-.97,cy+.019,1.3);
   applyView();requestDraw();
 }
 const hotspots=[['cpu','CPU',[.18,.84,-.68]],['memory','RAM',[-.68,.55,-.66]],['drive','SSD',[-1.1,.65,3.24]],['psu','Питание',[1.73,.91,-1.63]],['network','Сеть',[-1.6,.65,-2.58]]].map(([k,title,pos],i)=>{
   const b=document.createElement('button');b.className='hotspot';b.innerHTML='<span>'+(i+1)+'</span><em>'+title+'</em>';b.setAttribute('aria-label','Выбрать: '+title);b.dataset.part=k;host.append(b);b.addEventListener('mouseenter',()=>highlight(k));b.addEventListener('mouseleave',()=>highlight(focused));return {b,k,pos:new T.Vector3(...pos)};
 });
 function highlight(k){for(const [name,list] of Object.entries(groups))for(const g of list)g.traverse(o=>{if(o.isMesh&&o.material.emissive)o.material.emissive.setHex(0)});/* Shared metals stay neutral: focus is communicated by labels and framing. */for(const h of hotspots)h.b.classList.toggle('selected',h.k===k);}
 function applyView(){
   for(const [name,list] of Object.entries(groups))for(const g of list)g.visible=detail?(name===focused):(name==='cover'?!coverOpen:true);
   for(const [name,list] of Object.entries(inspectItems))for(let i=0;i<list.length;i++)list[i].visible=!detail||i===0;
   if(detail&&focused==='drive'){for(const o of groups.drive[0].children)if(!inspectItems.drive.includes(o))o.visible=false;}
   else if(!detail){for(const o of groups.drive[0].children)o.visible=true;}
   if(detail&&groups[focused]){const b=new T.Box3();for(const g of (inspectItems[focused]?.slice(0,1)||groups[focused]))b.expandByObject(g);b.getCenter(target);const size=b.getSize(new T.Vector3());distance=Math.max(3.4,size.length()*1.65);}
   else target.set(0,exploded?.75:.30,0);
   host.classList.toggle('detail-mode',detail);const names={cpu:'Процессор и радиатор',memory:'Модуль DDR5 ECC',drive:'Корзина и накопитель',psu:'Модуль питания',network:'Сетевой адаптер',raid:'RAID-контроллер',board:'Материнская плата',cooling:'Вентилятор 80 мм',platform:'Корпус 2U'};document.getElementById('model-caption').textContent=detail?names[focused]:'Rack Server 2U';document.getElementById('model-subtitle').textContent=detail?'Одна деталь из вашей конфигурации':'437 × 647 × 89 мм';highlight(focused);
 }
 function draw(){
   frame=0;camera.position.set(target.x+Math.sin(theta)*Math.sin(phi)*distance,target.y+Math.cos(phi)*distance,target.z+Math.cos(theta)*Math.sin(phi)*distance);camera.lookAt(target);camera.updateMatrixWorld();renderer.render(scene,camera);
   for(const h of hotspots){const p=h.pos.clone();if(exploded)p.y+=h.k==='cpu'?1.1:h.k==='memory'?.8:.4;p.project(camera);h.b.style.left=(p.x*.5+.5)*host.clientWidth+'px';h.b.style.top=(.5-p.y*.5)*host.clientHeight+'px';h.b.hidden=detail||!coverOpen||p.z>1||Math.abs(p.x)>.9||Math.abs(p.y)>.86;}
 }
 function requestDraw(){if(!frame)frame=requestAnimationFrame(draw)}
 function resize(){renderer.setSize(host.clientWidth,host.clientHeight);camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix();requestDraw()}
 new ResizeObserver(resize).observe(host);
 const pointers=new Map();let pinch=0;
 canvas.addEventListener('pointerdown',e=>{pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});canvas.setPointerCapture(e.pointerId);pinch=0});
 canvas.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;const prev=pointers.get(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===1){theta-=(e.clientX-prev.x)*.009;phi=Math.max(.12,Math.min(1.55,phi+(e.clientY-prev.y)*.009))}else{const [a,b]=[...pointers.values()],d=Math.hypot(a.x-b.x,a.y-b.y);if(pinch)distance=Math.max(2.2,Math.min(22,distance*pinch/d));pinch=d}requestDraw()});
 for(const evt of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(evt,e=>{pointers.delete(e.pointerId);pinch=0});
 canvas.addEventListener('wheel',e=>{e.preventDefault();distance=Math.max(2.2,Math.min(22,distance+e.deltaY*.009));requestDraw()},{passive:false});
 canvas.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','='].includes(e.key))return;e.preventDefault();theta+=e.key==='ArrowLeft'?-.15:e.key==='ArrowRight'?.15:0;phi=Math.max(.12,Math.min(1.55,phi+(e.key==='ArrowUp'?-.12:e.key==='ArrowDown'?.12:0)));distance=Math.max(2.2,Math.min(22,distance+(e.key==='-'?.7:['+','='].includes(e.key)?-.7:0)));requestDraw()});
 const api={rebuild:build,focus(k){focused=k;highlight(k);if(detail){applyView();requestDraw()}},detail(value){detail=value&&!!focused;if(detail){coverOpen=true;theta=['memory','network'].includes(focused)?1.1:.38;phi=.92;}else distance=exploded?15:12.7;applyView();requestDraw();return detail},setView(view){if(view==='front'){theta=0;phi=1.52}else if(view==='top'){theta=0;phi=.12}else if(view==='rear'){theta=Math.PI;phi=1.27}else{theta=.38;phi=.92;distance=exploded?15:12.7;detail=false;applyView()}requestDraw()},cover(){coverOpen=!coverOpen;exploded=false;detail=false;distance=12.7;applyView();requestDraw();return coverOpen},explode(){exploded=!exploded;coverOpen=true;detail=false;distance=exploded?15:12.7;build();return exploded},zoom(n){distance=Math.max(2.2,Math.min(22,distance+n));requestDraw()},isSoftware:renderer.isSoftware};
 build();resize();onReady?.(api);return api;
}
