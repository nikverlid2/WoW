// A depth-buffered fallback for browsers without WebGL. Uses the same geometry.
export function createSoftwareRenderer(T) {
  const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
  let width=1,height=1,ratio=1,buffer,depth;
  const textures=new WeakMap();
  function textureData(map){
    if(!map?.image)return null;
    if(textures.has(map))return textures.get(map);
    const c=document.createElement('canvas');c.width=map.image.width;c.height=map.image.height;
    const g=c.getContext('2d');g.drawImage(map.image,0,0);
    const t={data:g.getImageData(0,0,c.width,c.height).data,w:c.width,h:c.height};textures.set(map,t);return t;
  }
  return {domElement:canvas,isSoftware:true,shadowMap:{},setPixelRatio:r=>{ratio=Math.min(r,1)},setSize(w,h){width=Math.round(w*ratio);height=Math.round(h*ratio);canvas.width=width;canvas.height=height;canvas.style.width=w+'px';canvas.style.height=h+'px';buffer=ctx.createImageData(width,height);depth=new Float32Array(width*height)},render(scene,camera){
    if(!buffer)return;depth.fill(Infinity);buffer.data.fill(0);
    scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
    const light=new T.Vector3(-.4,.85,.6).normalize(),v=new T.Vector3(),normal=new T.Vector3(),edge=new T.Vector3(),view=new T.Vector3();
    const pixels=buffer.data;
    scene.traverse(o=>{
      if(!o.isMesh||!o.visible||o.material.isShadowMaterial)return;
      for(let p=o.parent;p;p=p.parent)if(!p.visible)return;
      const geo=o.geometry,pos=geo.attributes.position,uv=geo.attributes.uv,idx=geo.index,mat=o.material;
      if(!pos||Array.isArray(mat))return;
      const color=mat.color.clone().convertLinearToSRGB(),world=[],proj=[],tex=textureData(mat.map);
      const vp=new T.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);
      for(let i=0;i<pos.count;i++){
        const a=new T.Vector3().fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld);world.push(a);
        const p=new T.Vector4(a.x,a.y,a.z,1).applyMatrix4(vp),q=1/p.w;
        proj.push([(p.x*q*.5+.5)*width,(.5-p.y*q*.5)*height,p.z*q,q,uv?uv.getX(i)*q:0,uv?uv.getY(i)*q:0]);
      }
      const count=idx?idx.count:pos.count;
      for(let j=0;j<count;j+=3){
        const ai=idx?idx.getX(j):j,bi=idx?idx.getX(j+1):j+1,ci=idx?idx.getX(j+2):j+2;
        normal.subVectors(world[bi],world[ai]).cross(edge.subVectors(world[ci],world[ai])).normalize();
        view.subVectors(camera.position,world[ai]).normalize();if(normal.dot(view)<=0&&mat.side!==T.DoubleSide)continue;
        const a=proj[ai],b=proj[bi],c=proj[ci];if(a[2]>1||b[2]>1||c[2]>1||a[3]<0||b[3]<0||c[3]<0)continue;
        const den=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1]);if(Math.abs(den)<.00001)continue;
        const x0=Math.max(0,Math.floor(Math.min(a[0],b[0],c[0]))),x1=Math.min(width-1,Math.ceil(Math.max(a[0],b[0],c[0])));
        const y0=Math.max(0,Math.floor(Math.min(a[1],b[1],c[1]))),y1=Math.min(height-1,Math.ceil(Math.max(a[1],b[1],c[1])));
        const metal=mat.metalness||0;
        const shade=mat.isMeshBasicMaterial?1:.48+.44*Math.max(0,normal.dot(light))+.12*Math.max(0,normal.y);
        const half=v.copy(light).add(view).normalize();
        const spec=mat.isMeshBasicMaterial?0:Math.pow(Math.max(0,normal.dot(half)),22)*(metal*.30+.03);
        const rgb=[color.r,color.g,color.b].map(n=>Math.min(255,(n*shade+spec)*255));
        const k0=(b[1]-c[1])/den,k1=(c[0]-b[0])/den,k2=(c[1]-a[1])/den,k3=(a[0]-c[0])/den;
        for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
          const u=k0*(x+.5-c[0])+k1*(y+.5-c[1]),w=k2*(x+.5-c[0])+k3*(y+.5-c[1]),t=1-u-w;
          if(u<-.00001||w<-.00001||t<-.00001)continue;
          const z=u*a[2]+w*b[2]+t*c[2],n=y*width+x;if(z>=depth[n])continue;
          depth[n]=z;const p=n*4;
          if(tex){const q=u*a[3]+w*b[3]+t*c[3],tx=Math.max(0,Math.min(tex.w-1,Math.floor((u*a[4]+w*b[4]+t*c[4])/q*tex.w))),ty=Math.max(0,Math.min(tex.h-1,Math.floor((1-(u*a[5]+w*b[5]+t*c[5])/q)*tex.h))),tp=(ty*tex.w+tx)*4;for(let ch=0;ch<3;ch++)pixels[p+ch]=tex.data[tp+ch]*shade;pixels[p+3]=255;}
          else{pixels[p]=rgb[0];pixels[p+1]=rgb[1];pixels[p+2]=rgb[2];pixels[p+3]=255;}
        }
      }
    });
    ctx.putImageData(buffer,0,0);
  }};
}
