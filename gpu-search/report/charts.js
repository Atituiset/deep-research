const C = {
  get bg() { return document.documentElement.classList.contains('light') ? '#f8fafc' : '#0a0e17'; },
  get surface() { return document.documentElement.classList.contains('light') ? '#ffffff' : '#111827'; },
  get surface2() { return document.documentElement.classList.contains('light') ? '#f1f5f9' : '#1a2332'; },
  get border() { return document.documentElement.classList.contains('light') ? '#cbd5e1' : '#1e3a5f'; },
  get accent() { return document.documentElement.classList.contains('light') ? '#2563eb' : '#3b82f6'; },
  get accent2() { return document.documentElement.classList.contains('light') ? '#7c3aed' : '#8b5cf6'; },
  get green() { return document.documentElement.classList.contains('light') ? '#059669' : '#10b981'; },
  get orange() { return document.documentElement.classList.contains('light') ? '#d97706' : '#f59e0b'; },
  get red() { return document.documentElement.classList.contains('light') ? '#dc2626' : '#ef4444'; },
  get cyan() { return document.documentElement.classList.contains('light') ? '#0891b2' : '#06b6d4'; },
  get text() { return document.documentElement.classList.contains('light') ? '#0f172a' : '#e2e8f0'; },
  get text2() { return document.documentElement.classList.contains('light') ? '#475569' : '#94a3b8'; },
  get text3() { return document.documentElement.classList.contains('light') ? '#94a3b8' : '#64748b'; },
  get purple() { return document.documentElement.classList.contains('light') ? '#7c3aed' : '#a78bfa'; },
  get pink() { return document.documentElement.classList.contains('light') ? '#db2777' : '#ec4899'; },
  get yellow() { return document.documentElement.classList.contains('light') ? '#ca8a04' : '#fbbf24'; }
}
const DPR=window.devicePixelRatio||1
function initCanvas(id,h){
const c=document.getElementById(id)
if(!c)return null
let parentW = c.parentElement.clientWidth
if (!parentW || parentW < 10) {
  parentW = (c.parentElement.parentElement && c.parentElement.parentElement.clientWidth) || window.innerWidth || 360
}
const w=Math.max(280, parentW-56)
c.width=w*DPR
c.height=h*DPR
c.style.width=w+'px'
c.style.height=h+'px'
const ctx=c.getContext('2d')
ctx.scale(DPR,DPR)
return{ctx,w,h}
}
function roundedRect(ctx,x,y,w,h,r){
r=Math.min(r,w/2,h/2)
ctx.beginPath()
ctx.moveTo(x+r,y)
ctx.lineTo(x+w-r,y)
ctx.quadraticCurveTo(x+w,y,x+w,y+r)
ctx.lineTo(x+w,y+h-r)
ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h)
ctx.lineTo(x+r,y+h)
ctx.quadraticCurveTo(x,y+h,x,y+h-r)
ctx.lineTo(x,y+r)
ctx.quadraticCurveTo(x,y,x+r,y)
ctx.closePath()
}
function drawArrow(ctx,x1,y1,x2,y2,color,lw){
color=color||C.text3;lw=lw||1.5
ctx.save()
ctx.strokeStyle=color;ctx.lineWidth=lw
ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()
const a=Math.atan2(y2-y1,x2-x1),hl=8
ctx.beginPath()
ctx.moveTo(x2,y2)
ctx.lineTo(x2-hl*Math.cos(a-Math.PI/6),y2-hl*Math.sin(a-Math.PI/6))
ctx.lineTo(x2-hl*Math.cos(a+Math.PI/6),y2-hl*Math.sin(a+Math.PI/6))
ctx.closePath();ctx.fillStyle=color;ctx.fill()
ctx.restore()
}
function wrapText(ctx,text,x,y,maxW,lh){
const words=text.split('');let line=''
for(let i=0;i<words.length;i++){
const test=line+words[i]
if(ctx.measureText(test).width>maxW&&line){
ctx.fillText(line,x,y);line=words[i];y+=lh
}else line=test
}
ctx.fillText(line,x,y)
}

function drawEcosystem(id){
const s=initCanvas(id,450);if(!s)return
const{ctx,w,h}=s
const cx=w/2,cy=h/2
const labels=[
{text:_L('云端重型算力','Cloud Compute')[0],sub:_L('NVIDIA GPU / Google TPU / ASIC','NVIDIA GPU / Google TPU / ASIC')[0],color:C.accent,r:48,angle:-Math.PI*0.3},
{text:_L('端侧边缘智能','Edge Compute')[0],sub:_L('Apple M5 / Qualcomm NPU / Tesla AI5','Apple M5 / Qualcomm NPU / Tesla AI5')[0],color:C.green,r:48,angle:Math.PI*0.85},
{text:_L('底层物理支撑','Physical Support')[0],sub:_L('ASML EUV / TSMC CoPoS / 硅光子','ASML EUV / TSMC CoPoS / Photonics')[0],color:C.orange,r:48,angle:Math.PI*0.3},
{text:_L('数据格式革命','Format Revolution')[0],sub:_L('OCP MX / NVFP4 / FP4量化','OCP MX / NVFP4 / FP4 Quant')[0],color:C.purple,r:48,angle:Math.PI*1.35},
]
labels.forEach((n,i)=>{
const nx=cx+Math.cos(n.angle)*150,ny=cy+Math.sin(n.angle)*140
ctx.beginPath();ctx.arc(nx,ny,n.r,0,Math.PI*2)
ctx.fillStyle=n.color+'15';ctx.fill()
ctx.strokeStyle=n.color;ctx.lineWidth=2;ctx.stroke()
ctx.font='bold 12px Inter,sans-serif';ctx.fillStyle=n.color;ctx.textAlign='center'
ctx.fillText(n.text,nx,ny-10)
ctx.font='10px Inter,sans-serif';ctx.fillStyle=C.text3
wrapText(ctx,n.sub,nx,ny+8,n.r*1.4,13)
drawArrow(ctx,cx,cy,nx-Math.cos(n.angle)*n.r,ny-Math.sin(n.angle)*n.r,n.color+'60',1)
})
ctx.beginPath();ctx.arc(cx,cy,32,0,Math.PI*2)
ctx.fillStyle=C.accent2+'30';ctx.fill()
ctx.strokeStyle=C.accent2;ctx.lineWidth=2;ctx.stroke()
ctx.font='bold 11px Inter,sans-serif';ctx.fillStyle=C.text;ctx.textAlign='center'
ctx.fillText('2026 AI',cx,cy-4)
ctx.fillText(_L('计算生态','Ecosystem')[0],cx,cy+9)
}

function drawCamps(id){
const s=initCanvas(id,350);if(!s)return
const{ctx,w,h}=s
const bars=[
{label:'SIMT\n(GPU)',vals:[95,70,60,85,40],cat:'NVIDIA',color:C.accent},
{label:'Systolic\n(TPU)',vals:[70,90,85,50,75],cat:'Google',color:C.green},
{label:'Spatial\n(NPU)',vals:[30,40,95,30,98],cat:'Apple/Qualcomm',color:C.orange},
]
const dims=[_S('通用性', 'Generality'),_S('能效比', 'Energy Efficiency'),_S('推理效率', 'Inference Efficiency'),_S('训练效率', 'Training Efficiency'),_S('面积效率', 'Area Efficiency')]
const left=80,right=20,top=50,bot=40
const chartW=w-left-right,chartH=h-top-bot
const groupW=chartW/bars.length,barW=groupW*0.7
const dimH=barW/dims.length
ctx.font='bold 11px Inter,sans-serif';ctx.fillStyle=C.text3;ctx.textAlign='right'
dims.forEach((d,i)=>{
const y=top+chartH*(1-(i+0.5)/dims.length)
ctx.fillText(d,left-8,y+4)
})
ctx.textAlign='center';ctx.font='11px Inter,sans-serif'
bars.forEach((g,gi)=>{
const gx=left+gi*groupW+(groupW-barW)/2
g.vals.forEach((v,di)=>{
const y=top+chartH*(1-(di+0.5)/dims.length)-dimH/2
const bw=barW*(v/100)
roundedRect(ctx,gx,y,bw,dimH-2,3)
ctx.fillStyle=g.color+'90';ctx.fill()
})
ctx.font='bold 11px Inter,sans-serif';ctx.fillStyle=g.color
const cx2=gx+barW/2
const lines=g.label.split('\n')
lines.forEach((l,li)=>ctx.fillText(l,cx2,top+chartH+14+li*14))
ctx.font='10px Inter,sans-serif';ctx.fillStyle=C.text3
ctx.fillText(g.cat,cx2,top+chartH+14+lines.length*14+2)
})
}

function drawFlopsEvolution(id){
const s=initCanvas(id,320);if(!s)return
const{ctx,w,h}=s
const data=[
{label:'H100\n(2022)',fp4:0,color:C.text3},
{label:'B200\n(2024)',fp4:9,color:C.accent},
{label:'R100\n(2026)',fp4:50,color:C.accent2},
]
const left=70,right=30,top=40,bot=50
const cw=w-left-right,ch=h-top-bot
const maxV=55
ctx.font='10px Inter,sans-serif';ctx.fillStyle=C.text3;ctx.textAlign='right'
for(let i=0;i<=5;i++){
const v=i*11,y=top+ch*(1-v/maxV)
ctx.fillText(v+'P',left-8,y+4)
ctx.strokeStyle=C.border;ctx.lineWidth=0.5;ctx.beginPath();ctx.moveTo(left,y);ctx.lineTo(w-right,y);ctx.stroke()
}
const bw=cw/data.length*0.5
data.forEach((d,i)=>{
const x=left+cw*(i+0.5)/data.length-bw/2
const bh=ch*d.fp4/maxV
const grad=ctx.createLinearGradient(x,top+ch-bh,x,top+ch)
grad.addColorStop(0,d.color);grad.addColorStop(1,d.color+'40')
roundedRect(ctx,x,top+ch-bh,bw,bh,6)
ctx.fillStyle=grad;ctx.fill()
ctx.font='bold 13px Inter,sans-serif';ctx.fillStyle=d.color;ctx.textAlign='center'
if(d.fp4>0)ctx.fillText(d.fp4+'P',x+bw/2,top+ch-bh-8)
ctx.font='11px Inter,sans-serif';ctx.fillStyle=C.text3
const ls=d.label.split('\n')
ls.forEach((l,li)=>ctx.fillText(l,left+cw*(i+0.5)/data.length,top+ch+14+li*13))
})
ctx.font='bold 12px Inter,sans-serif';ctx.fillStyle=C.text2;ctx.textAlign='center'
ctx.fillText(_S('FP4算力 (PFLOPS)', 'FP4 Performance (PFLOPS)'),w/2,18)
}

function drawSIMT(id){
const s=initCanvas(id,430);if(!s)return
const{ctx,w,h}=s
const cx=w/2
const boxes=[
{y:30,text:_S('外部总线 (PCIe / NVLink)', 'External Bus (PCIe / NVLink)'),color:C.accent,w:w*0.6},
{y:110,text:_S('控制逻辑与线程块调度器', 'Control Logic & Thread Block Scheduler'),color:C.text3,w:w*0.45},
]
boxes.forEach(b=>{
roundedRect(ctx,cx-b.w/2,b.y,b.w,36,8)
ctx.fillStyle=b.color+'20';ctx.fill()
ctx.strokeStyle=b.color;ctx.lineWidth=2;ctx.stroke()
ctx.font='bold 12px Inter,sans-serif';ctx.fillStyle=C.text;ctx.textAlign='center'
ctx.fillText(b.text,cx,b.y+23)
})
drawArrow(ctx,cx,66,cx,110,C.accent)
const clusters=[_S('ALU 簇 1\nTensor Core', 'ALU Cluster 1\nTensor Core'),_S('ALU 簇 2\nTensor Core', 'ALU Cluster 2\nTensor Core'),_S('ALU 簇 N\nTensor Core', 'ALU Cluster N\nTensor Core')]
const cw2=(w-80)/3
clusters.forEach((t,i)=>{
const x=40+i*cw2
roundedRect(ctx,x,200,cw2-10,50,8)
ctx.fillStyle=C.orange+'20';ctx.fill()
ctx.strokeStyle=C.orange;ctx.lineWidth=1.5;ctx.stroke()
ctx.font='11px Inter,sans-serif';ctx.fillStyle=C.text;ctx.textAlign='center'
const ls=t.split('\n')
ls.forEach((l,li)=>ctx.fillText(l,x+(cw2-10)/2,218+li*14))
})
drawArrow(ctx,cx-60,146,cx-80,200,C.text3)
drawArrow(ctx,cx,146,cx,200,C.text3)
drawArrow(ctx,cx+60,146,cx+80,200,C.text3)
const tips=[
{icon:'→',text:_S('同指令调度', 'Co-instruction Scheduling'),x:30,y:290},
{icon:'⚡',text:_S('大规模并行', 'Massive Parallelism'),x:w/2-40,y:290},
{icon:'🔄',text:_S('动态线程切换', 'Dynamic Thread Switching'),x:w-140,y:290},
]
ctx.font='12px Inter,sans-serif';ctx.textAlign='left'
tips.forEach(t=>{
ctx.fillStyle=C.accent;ctx.fillText(t.icon,t.x,t.y)
ctx.fillStyle=C.text2;ctx.fillText(t.text,t.x+22,t.y)
})
const perf=330
ctx.font='bold 11px Inter,sans-serif';ctx.fillStyle=C.cyan;ctx.textAlign='center'
 ctx.fillText(_S('核心特征：极高吞吐量 + CUDA生态壁垒 + 通用灵活性', 'Core Features: Ultra-high throughput + CUDA ecosystem barrier + General flexibility'),cx,330)
 ctx.strokeStyle=C.border;ctx.lineWidth=0.5;ctx.beginPath();ctx.moveTo(20,perf);ctx.lineTo(w-20,perf);ctx.stroke()
ctx.font='11px Inter,sans-serif';ctx.textAlign='left';ctx.fillStyle=C.text3
ctx.fillText(_S('GPU以数千ALU并行处理，Tensor Core专攻矩阵乘法。优势在通用性，劣势在控制逻辑开销大', 'GPU processes in parallel with thousands of ALUs, while Tensor Cores specialize in matrix multiplication. Advantage: generality. Disadvantage: high control logic overhead.'),30,perf+22)
ctx.fillText(_S('NVIDIA通过CUDA抽象将复杂SIMT细节完全隐藏，使开发者无需理解底层即能高效编程', 'NVIDIA completely hides complex SIMT details via CUDA abstraction, enabling efficient programming without understanding hardware.'),30,perf+40)
}

function drawSystolic(id){
const s=initCanvas(id,380);if(!s)return
const{ctx,w,h}=s
const cx=w/2
const rows=4,cols=5,cellW=60,cellH=40
const gx=cx-cols*cellW/2,gy=40
ctx.font='bold 11px Inter,sans-serif';ctx.fillStyle=C.green;ctx.textAlign='center'
ctx.fillText(_S('二维脉动阵列 (Systolic Array)', '2D Systolic Array'),cx,25)
for(let r=0;r<rows;r++){
for(let c=0;c<cols;c++){
const x=gx+c*cellW+4,y=gy+r*cellH+4
roundedRect(ctx,x,y,cellW-8,cellH-8,4)
ctx.fillStyle=C.green+'15';ctx.fill()
ctx.strokeStyle=C.green+'80';ctx.lineWidth=1;ctx.stroke()
ctx.font='10px Inter,sans-serif';ctx.fillStyle=C.green;ctx.textAlign='center'
ctx.fillText('PE',x+(cellW-8)/2,y+(cellH-8)/2+4)
if(c<cols-1)drawArrow(ctx,x+cellW-8,y+(cellH-8)/2,x+cellW+4,y+(cellH-8)/2,C.green+'50',1)
if(r<rows-1)drawArrow(ctx,x+(cellW-8)/2,y+cellH-8,x+(cellW-8)/2,y+cellH+4,C.green+'50',1)
}
}
ctx.font='bold 10px Inter,sans-serif';ctx.fillStyle=C.orange;ctx.textAlign='left'
ctx.fillText(_S('权重 →', 'Weight →'),gx-2,gy-6)
ctx.save();ctx.translate(gx-14,gy+rows*cellH/2);ctx.rotate(-Math.PI/2)
ctx.fillText(_S('激活 ↑', 'Activation ↑'),0,0);ctx.restore()
const by=gy+rows*cellH+30
ctx.font='11px Inter,sans-serif';ctx.fillStyle=C.text2;ctx.textAlign='center'
ctx.fillText(_S('数据在PE间脉动流动，无需回写主内存', 'Data flows systolically between PEs, no need to write back to main memory'),cx,by)
ctx.fillText(_S('极高内存带宽利用率 → 极低功耗 → 专精矩阵运算', 'Ultra-high memory bandwidth utilization → Extremely low power → Matrix specialized'),cx,by+18)
ctx.fillStyle=C.cyan;ctx.font='bold 11px Inter,sans-serif'
ctx.fillText(_S('核心：确定性数据流 + 高能效 + 低灵活性', 'Core: Deterministic Data Flow + High Energy Efficiency + Low Flexibility'),cx,by+42)
}

function drawNPUCompare(id){
const s=initCanvas(id,380);if(!s)return
const{ctx,w,h}=s
const cx=w/2
const archs=[
{name:'GPU (SIMT)',color:C.accent,desc:_S('通用并行\n高功耗\n控制逻辑重', 'General Parallelism\nHigh Power\nHeavy Control Logic'),y:40},
{name:'TPU (Systolic)',color:C.green,desc:_S('确定数据流\n矩阵专精\n灵活性有限', 'Deterministic Data Flow\nMatrix Specialization\nLimited Flexibility'),y:150},
{name:'NPU (Spatial)',color:C.orange,desc:_S('空间计算\n超低功耗\n端侧推理霸主', 'Spatial Computing\nUltra-low Power\nEdge Inference Ruler'),y:260},
]
archs.forEach(a=>{
roundedRect(ctx,20,a.y,w-40,90,10)
ctx.fillStyle=a.color+'10';ctx.fill()
ctx.strokeStyle=a.color+'60';ctx.lineWidth=1.5;ctx.stroke()
ctx.font='bold 14px Inter,sans-serif';ctx.fillStyle=a.color;ctx.textAlign='left'
ctx.fillText(a.name,36,a.y+28)
ctx.font='12px Inter,sans-serif';ctx.fillStyle=C.text2
a.desc.split('\n').forEach((l,i)=>ctx.fillText(l,36,a.y+48+i*16))
const metrics=a.name.includes('GPU')?[{l:_S('通用性', 'Generality'),v:95},{l:_S('能效', 'Efficiency'),v:30}]:
a.name.includes('TPU')?[{l:_S('通用性', 'Generality'),v:50},{l:_S('能效', 'Efficiency'),v:75}]:
[{l:_S('通用性', 'Generality'),v:25},{l:_S('能效', 'Efficiency'),v:95}]
const bx=w-200
metrics.forEach((m,i)=>{
ctx.font='10px Inter,sans-serif';ctx.fillStyle=C.text3;ctx.textAlign='left'
ctx.fillText(m.l,bx,a.y+30+i*30)
const mbw=120
roundedRect(ctx,bx+30,a.y+20+i*30,mbw,14,4)
ctx.fillStyle=C.surface2;ctx.fill()
roundedRect(ctx,bx+30,a.y+20+i*30,mbw*m.v/100,14,4)
ctx.fillStyle=a.color;ctx.fill()
ctx.font='10px Inter,sans-serif';ctx.fillStyle=C.text;ctx.textAlign='left'
ctx.fillText(m.v+'%',bx+32+mbw*m.v/100,a.y+31+i*30)
})
})
}

function drawRadar(id){
const s=initCanvas(id,400);if(!s)return
const{ctx,w,h}=s
const cx=w/2,cy=h/2+10,r=130
const dims=[_S('通用性', 'Generality'),_S('训练效率', 'Training Efficiency'),_S('推理效率', 'Inference Efficiency'),_S('能效比', 'Energy Efficiency'),_S('面积效率', 'Area Efficiency'),_S('生态成熟度', 'Ecosystem Maturity')]
const n=dims.length
const datasets=[
{name:'GPU (SIMT)',vals:[95,85,60,40,45,95],color:C.accent},
{name:'TPU (Systolic)',vals:[50,70,85,75,65,40],color:C.green},
{name:'NPU (Spatial)',vals:[25,15,95,98,90,20],color:C.orange},
]
for(let i=0;i<=4;i++){
const rr=r*(i+1)/5
ctx.beginPath()
for(let j=0;j<n;j++){
const a=-Math.PI/2+Math.PI*2*j/n
const x=cx+rr*Math.cos(a),y=cy+rr*Math.sin(a)
j===0?ctx.moveTo(x,y):ctx.lineTo(x,y)
}
ctx.closePath();ctx.strokeStyle=C.border;ctx.lineWidth=0.5;ctx.stroke()
}
for(let j=0;j<n;j++){
const a=-Math.PI/2+Math.PI*2*j/n
ctx.beginPath();ctx.moveTo(cx,cy)
ctx.lineTo(cx+r*Math.cos(a),cy+r*Math.sin(a))
ctx.strokeStyle=C.border;ctx.lineWidth=0.5;ctx.stroke()
const lx=cx+(r+20)*Math.cos(a),ly=cy+(r+20)*Math.sin(a)
ctx.font='11px Inter,sans-serif';ctx.fillStyle=C.text2;ctx.textAlign='center'
ctx.fillText(dims[j],lx,ly+4)
}
datasets.forEach(ds=>{
ctx.beginPath()
ds.vals.forEach((v,j)=>{
const a=-Math.PI/2+Math.PI*2*j/n
const x=cx+r*v/100*Math.cos(a),y=cy+r*v/100*Math.sin(a)
j===0?ctx.moveTo(x,y):ctx.lineTo(x,y)
})
ctx.closePath();ctx.fillStyle=ds.color+'15';ctx.fill()
ctx.strokeStyle=ds.color;ctx.lineWidth=2;ctx.stroke()
ds.vals.forEach((v,j)=>{
const a=-Math.PI/2+Math.PI*2*j/n
const x=cx+r*v/100*Math.cos(a),y=cy+r*v/100*Math.sin(a)
ctx.beginPath();ctx.arc(x,y,3,0,Math.PI*2);ctx.fillStyle=ds.color;ctx.fill()
})
})
const lx=20,ly=20
datasets.forEach((ds,i)=>{
ctx.beginPath();ctx.arc(lx,ly+i*18,4,0,Math.PI*2);ctx.fillStyle=ds.color;ctx.fill()
ctx.font='11px Inter,sans-serif';ctx.fillStyle=C.text2;ctx.textAlign='left'
ctx.fillText(ds.name,lx+10,ly+i*18+4)
})
}

function drawVeraRubin(id){
const s=initCanvas(id,420);if(!s)return
const{ctx,w,h}=s
const cx=w/2
roundedRect(ctx,cx-180,20,360,50,10)
ctx.fillStyle=C.accent+'20';ctx.fill();ctx.strokeStyle=C.accent;ctx.lineWidth=2;ctx.stroke()
ctx.font='bold 14px Inter,sans-serif';ctx.fillStyle=C.accent;ctx.textAlign='center'
ctx.fillText(_S('Vera CPU — 88 Olympus核心', 'Vera CPU — 88 Olympus Cores'),cx,42)
ctx.font='11px Inter,sans-serif';ctx.fillStyle=C.text3
ctx.fillText('LPDDR5X 1.2 TB/s | 164 MB L3 Cache',cx,58)
drawArrow(ctx,cx-40,70,cx-40,100,C.accent)
drawArrow(ctx,cx+40,70,cx+40,100,C.accent)
ctx.font='10px Inter,sans-serif';ctx.fillStyle=C.accent;ctx.textAlign='center'
ctx.fillText('NVLink-C2C',cx-80,88);ctx.fillText('(1.8 TB/s)',cx-80,100)
ctx.fillText('NVLink-C2C',cx+80,88);ctx.fillText('(1.8 TB/s)',cx+80,100)
const gY=110
;[-1,1].forEach((side,i)=>{
roundedRect(ctx,cx+side*120-80,gY,160,70,10)
ctx.fillStyle=C.accent2+'20';ctx.fill();ctx.strokeStyle=C.accent2;ctx.lineWidth=2;ctx.stroke()
ctx.font='bold 13px Inter,sans-serif';ctx.fillStyle=C.accent2;ctx.textAlign='center'
ctx.fillText('Rubin GPU '+(i+1),cx+side*120,gY+25)
ctx.font='11px Inter,sans-serif';ctx.fillStyle=C.text3
ctx.fillText('288 GB HBM4 | 22 TB/s',cx+side*120,gY+42)
ctx.fillText(_S('3360亿晶体管 | TSMC N3', '336 Billion Transistors | TSMC N3'),cx+side*120,gY+58)
})
drawArrow(ctx,cx-40,gY+35,cx+40,gY+35,C.cyan)
ctx.font='10px Inter,sans-serif';ctx.fillStyle=C.cyan;ctx.textAlign='center'
ctx.fillText(_S('NVLink 6 (双向 3.6 TB/s)', 'NVLink 6 (Bi-directional 3.6 TB/s)'),cx,gY+25)
const nY=200
roundedRect(ctx,cx-200,nY,400,55,10)
ctx.fillStyle=C.green+'15';ctx.fill();ctx.strokeStyle=C.green;ctx.lineWidth=1.5;ctx.stroke()
ctx.font='bold 12px Inter,sans-serif';ctx.fillStyle=C.green;ctx.textAlign='center'
ctx.fillText(_S('第六代 NVLink Switch', '6th Gen NVLink Switch'),cx,nY+20)
ctx.font='11px Inter,sans-serif';ctx.fillStyle=C.text3
ctx.fillText(_S('总带宽 28.8 TB/s | SHARP聚合通信协议 | 减少50%网络拥堵', 'Total Bandwidth 28.8 TB/s | SHARP Collective Comm Protocol | Reduces network congestion by 50%'),cx,nY+38)
drawArrow(ctx,cx,gY+70,cx,nY,C.green)
const pY=280
ctx.font='bold 12px Inter,sans-serif';ctx.fillStyle=C.orange;ctx.textAlign='center'
ctx.fillText(_S('关键突破：CPU与GPU物理边界被彻底打破 → 统一内存一致执行域', 'Key Breakthrough: CPU & GPU physical boundary completely broken → Unified Memory & coherent execution domain'),cx,pY)
ctx.font='11px Inter,sans-serif';ctx.fillStyle=C.text2
ctx.fillText(_S('Vera不再只是"外部主机"，而是紧密耦合的"数据引擎"', 'Vera is no longer just an "external host", but a tightly coupled "data engine"'),cx,pY+22)
ctx.fillText(_S('FP4推理: 50 PFLOPS (5.5x vs B200) | 内存带宽: 22 TB/s (2.75x vs B200)', 'FP4 Inference: 50 PFLOPS (5.5x vs B200) | Memory Bandwidth: 22 TB/s (2.75x vs B200)'),cx,pY+44)
}

function drawNvidiaGen(id){
const s=initCanvas(id,350);if(!s)return
const{ctx,w,h}=s
const left=80,right=30,top=50,bot=50
const cw=w-left-right,ch=h-top-bot
const metrics=[
{name:'FP4 PFLOPS',vals:[0,9,50],color:C.accent},
{name:'HBM TB/s',vals:[3.35,8,22],color:C.green},
{name:'NVLink GB/s',vals:[900,1800,3600],color:C.cyan},
]
const maxVals=[55,25,4000]
const genLabels=['H100','B200','R100']
const gw=cw/3
metrics.forEach((m,mi)=>{
const my=top+ch*mi/3
const mh=ch/3-10
m.vals.forEach((v,gi)=>{
const x=left+gi*gw+10
const bw=gw-20
const bh=mh*(v/maxVals[mi])
const by=my+mh-bh
roundedRect(ctx,x,by,bw,Math.max(bh,2),4)
const grad=ctx.createLinearGradient(x,by,x,my+mh)
grad.addColorStop(0,m.color);grad.addColorStop(1,m.color+'30')
ctx.fillStyle=grad;ctx.fill()
if(v>0){
ctx.font='bold 10px Inter,sans-serif';ctx.fillStyle=m.color;ctx.textAlign='center'
const txt=m.name.includes('NVLink')?v+' GB/s':m.name.includes('HBM')?v+' TB/s':v+'P'
ctx.fillText(txt,x+bw/2,by-6)
}
})
})
ctx.font='bold 11px Inter,sans-serif';ctx.fillStyle=C.text3;ctx.textAlign='center'
genLabels.forEach((l,i)=>ctx.fillText(l,left+i*gw+gw/2,top+ch+16))
metrics.forEach((m,i)=>{
ctx.font='11px Inter,sans-serif';ctx.fillStyle=m.color;ctx.textAlign='right'
ctx.fillText(m.name,left-8,top+ch*i/3+ch/6)
})
}

function drawHGX(id){
const s=initCanvas(id,350);if(!s)return
const{ctx,w,h}=s
const left=60,right=20,top=40,bot=50
const cw=w-left-right,ch=h-top-bot
const data=[
{gen:'HGX H100',mem:'1.1 TB (HBM3)',nvlink:'900 GB/s',net:'0.4 TB/s',color:C.text3},
{gen:'HGX B200',mem:'1.4 TB (HBM3e)',nvlink:'1.8 TB/s',net:'0.8 TB/s',color:C.accent},
{gen:'HGX B300',mem:'2.1 TB (HBM3e)',nvlink:'1.8 TB/s',net:'1.6 TB/s',color:C.accent},
{gen:'HGX Rubin',mem:'2.3 TB (HBM4)',nvlink:'3.6 TB/s',net:'1.6 TB/s',color:C.accent2},
]
const barH=ch/data.length-12
data.forEach((d,i)=>{
const y=top+i*(barH+12)
ctx.font='bold 11px Inter,sans-serif';ctx.fillStyle=d.color;ctx.textAlign='left'
ctx.fillText(d.gen,left,y+14)
const items=[
{label:_S('内存', 'Memory'),val:d.mem,maxV:2.5},
{label:'NVLink',val:d.nvlink,maxV:4},
{label:_S('网络', 'Network'),val:d.net,maxV:2},
]
const bx=left+90,aw=cw-120
items.forEach((it,j)=>{
const ix=bx+j*(aw/3+4),iw=aw/3-8
roundedRect(ctx,ix,y,iw,barH,4)
ctx.fillStyle=C.surface2;ctx.fill()
const pVals={mem:parseFloat(d.mem),nvlink:parseFloat(d.nvlink),net:parseFloat(d.net)}
const pMax={mem:2.5,nvlink:4,net:2}
const fillW=iw*Math.min(pVals[it.label]/pMax[it.label],1)
roundedRect(ctx,ix,y,Math.max(fillW,2),barH,4)
ctx.fillStyle=d.color+'50';ctx.fill()
ctx.font='9px Inter,sans-serif';ctx.fillStyle=C.text;ctx.textAlign='center'
ctx.fillText(it.val,ix+iw/2,y+barH/2+3)
})
})
}

function drawIronwood(id){
const s=initCanvas(id,400);if(!s)return
const{ctx,w,h}=s
const cx=w/2
roundedRect(ctx,cx-150,20,300,40,8)
ctx.fillStyle=C.orange+'20';ctx.fill();ctx.strokeStyle=C.orange;ctx.lineWidth=2;ctx.stroke()
ctx.font='bold 13px Inter,sans-serif';ctx.fillStyle=C.orange;ctx.textAlign='center'
ctx.fillText(_S('Google Axion 自研 ARM CPU', 'Google Axion Custom ARM CPU'),cx,38)
ctx.font='10px Inter,sans-serif';ctx.fillStyle=C.text3
ctx.fillText(_S('全栈统筹 · 零延迟指令派发', 'Full-stack Coordination · Zero-latency Instruction Dispatch'),cx,52)
drawArrow(ctx,cx-50,60,cx-100,90,C.orange)
drawArrow(ctx,cx+50,60,cx+100,90,C.orange)
;[{label:_S('TPU 8t (训练专精)', 'TPU 8t (Training Spec)'),x:cx-130,color:C.accent},
{label:_S('TPU 8i (推理专精)', 'TPU 8i (Inference Spec)'),x:cx+10,color:C.green}].forEach((t,i)=>{
roundedRect(ctx,t.x,90,120,160,8)
ctx.fillStyle=t.color+'15';ctx.fill();ctx.strokeStyle=t.color;ctx.lineWidth=1.5;ctx.stroke()
ctx.font='bold 11px Inter,sans-serif';ctx.fillStyle=t.color;ctx.textAlign='center'
ctx.fillText(t.label,t.x+60,108)
const specs=i===0?['3D Torus','SparseCore','HBM: 216 GB','SRAM: 128 MB','FP4: 12.6P']:
['Boardfly',_S('CAE引擎', 'CAE Engine'),'HBM: 288 GB','SRAM: 384 MB','FP4: 10.1P']
ctx.font='10px Inter,sans-serif';ctx.fillStyle=C.text2;ctx.textAlign='left'
specs.forEach((s,si)=>ctx.fillText(s,t.x+10,128+si*18))
})
ctx.font='bold 11px Inter,sans-serif';ctx.fillStyle=C.cyan;ctx.textAlign='center'
ctx.fillText(_S('首次训练/推理硬分化 — 标志ASIC进入专用化时代', 'First Training/Inference Separation — Marking dedicated ASIC era'),cx,280)
ctx.font='11px Inter,sans-serif';ctx.fillStyle=C.text2
ctx.fillText(_S('8t: 3D Torus → 9600芯片Superpod → 2PB共享内存', '8t: 3D Torus → 9600-chip Superpod → 2PB Shared Memory'),cx,302)
ctx.fillText(_S('8i: 384MB SRAM → 击破KV-Cache内存墙 → 性价比+80%', '8i: 384MB SRAM → Break the KV-Cache Memory Wall → Performance/Cost +80%'),cx,322)
}

function drawASICCompare(id){
const s=initCanvas(id,380);if(!s)return
const{ctx,w,h}=s
const data=[
{name:'Google\nTPU 8t',color:C.green,vals:{fp4:12.6,hbm:216,sram:128,tdp:500}},
{name:'Google\nTPU 8i',color:C.green,vals:{fp4:10.1,hbm:288,sram:384,tdp:450}},
{name:'Microsoft\nMaia 200',color:C.cyan,vals:{fp4:10,hbm:216,sram:272,tdp:750}},
{name:'Meta\nMTIA 500',color:C.purple,vals:{fp4:30,hbm:512,sram:200,tdp:900}},
{name:'AWS\nTrainium2',color:C.orange,vals:{fp4:2.6,hbm:96,sram:64,tdp:300}},
]
const left=70,right=20,top=40,bot=50
const cw=w-left-right,ch=h-top-bot
const gw=cw/data.length
const dims=[{key:'fp4',label:'FP4 (PFLOPS)',max:35},{key:'sram',label:'SRAM (MB)',max:450}]
dims.forEach((dim,di)=>{
const dy=top+di*ch/2
const dh=ch/2-15
data.forEach((d,i)=>{
const x=left+i*gw+8,bw=gw-16
const v=d.vals[dim.key]
const bh=dh*v/dim.max
const by=dy+dh-bh
roundedRect(ctx,x,by,bw,Math.max(bh,2),4)
const grad=ctx.createLinearGradient(x,by,x,dy+dh)
grad.addColorStop(0,d.color);grad.addColorStop(1,d.color+'30')
ctx.fillStyle=grad;ctx.fill()
ctx.font='bold 10px Inter,sans-serif';ctx.fillStyle=d.color;ctx.textAlign='center'
ctx.fillText(v,x+bw/2,by-5)
})
ctx.font='11px Inter,sans-serif';ctx.fillStyle=C.text3;ctx.textAlign='right'
ctx.fillText(dim.label,left-6,dy+dh/2+4)
})
data.forEach((d,i)=>{
const x=left+i*gw+gw/2
ctx.font='10px Inter,sans-serif';ctx.fillStyle=d.color;ctx.textAlign='center'
d.name.split('\n').forEach((l,li)=>ctx.fillText(l,x,top+ch+12+li*12))
})
}

function drawAppleM5(id){
const s=initCanvas(id,380);if(!s)return
const{ctx,w,h}=s
const cx=w/2
roundedRect(ctx,cx-180,20,360,40,8)
ctx.fillStyle=C.accent+'20';ctx.fill();ctx.strokeStyle=C.accent;ctx.lineWidth=2;ctx.stroke()
ctx.font='bold 13px Inter,sans-serif';ctx.fillStyle=C.accent;ctx.textAlign='center'
ctx.fillText(_S('统一内存 (Unified Memory) — 153 GB/s', 'Unified Memory — 153 GB/s'),cx,45)
const comps=[
{name:_S('18核 CPU', '18-core CPU'),color:C.text3,x:cx-180,w:110},
{name:_S('16核 Neural Engine', '16-core Neural Engine'),color:C.purple,x:cx-60,w:120},
{name:_S('40核 GPU\n+Neural Accelerators', '40-core GPU\n+Neural Accelerators'),color:C.green,x:cx+70,w:120},
]
drawArrow(ctx,cx-80,60,cx-140,90,C.accent)
drawArrow(ctx,cx,60,cx,90,C.accent)
drawArrow(ctx,cx+80,60,cx+130,90,C.accent)
comps.forEach(c=>{
roundedRect(ctx,c.x,90,c.w,50,8)
ctx.fillStyle=c.color+'18';ctx.fill();ctx.strokeStyle=c.color;ctx.lineWidth=1.5;ctx.stroke()
ctx.font='bold 11px Inter,sans-serif';ctx.fillStyle=c.color;ctx.textAlign='center'
c.name.split('\n').forEach((l,i)=>ctx.fillText(l,c.x+c.w/2,108+i*14))
})
ctx.font='bold 11px Inter,sans-serif';ctx.fillStyle=C.green;ctx.textAlign='center'
ctx.fillText(_S('GPU核心内嵌专用Neural Accelerator → AI算力4x提升', 'GPU core with embedded dedicated Neural Accelerator → 4x AI compute boost'),cx,170)
ctx.font='11px Inter,sans-serif';ctx.fillStyle=C.text2
ctx.fillText(_S('M5 Pro/Max: TSMC 3nm | Fusion Architecture | 128 GB内存支持', 'M5 Pro/Max: TSMC 3nm | Fusion Architecture | 128 GB Memory Support'),cx,192)
ctx.fillText(_S('断网状态下满负荷运行数十亿至数百亿参数本地大模型', 'Offline operation under full load running billions to tens of billions parameters local models'),cx,212)
}

function drawEdgeNPUCompare(id){
const s=initCanvas(id,380);if(!s)return
const{ctx,w,h}=s
const data=[
{name:'Apple M5\nNeural Engine',tops:38,power:8,color:C.accent},
{name:'Qualcomm X Elite\nHexagon NPU',tops:45,power:10,color:C.orange},
{name:'Intel Core Ultra\nNPU',tops:11,power:6,color:C.cyan},
{name:'AMD Ryzen AI\nNPU',tops:16,power:7,color:C.red},
]
const left=90,right=30,top=50,bot=60
const cw=w-left-right,ch=h-top-bot
const bw=cw/data.length*0.55
const maxTops=50
data.forEach((d,i)=>{
const x=left+cw*(i+0.5)/data.length-bw/2
const bh=ch*d.tops/maxTops
const by=top+ch-bh
const grad=ctx.createLinearGradient(x,by,x,top+ch)
grad.addColorStop(0,d.color);grad.addColorStop(1,d.color+'30')
roundedRect(ctx,x,by,bw,bh,6);ctx.fillStyle=grad;ctx.fill()
ctx.font='bold 12px Inter,sans-serif';ctx.fillStyle=d.color;ctx.textAlign='center'
ctx.fillText(d.tops+' TOPS',x+bw/2,by-8)
const eff=d.tops/d.power
ctx.font='10px Inter,sans-serif';ctx.fillStyle=C.text3
ctx.fillText(eff.toFixed(1)+' TOPS/W',x+bw/2,by-22)
ctx.font='10px Inter,sans-serif';ctx.fillStyle=d.color
d.name.split('\n').forEach((l,li)=>ctx.fillText(l,x+bw/2,top+ch+12+li*12))
})
ctx.font='bold 12px Inter,sans-serif';ctx.fillStyle=C.text2;ctx.textAlign='center'
ctx.fillText(_S('端侧NPU算力与能效比 (2026)', 'Edge NPU Compute & Energy Efficiency (2026)'),w/2,20)
ctx.font='10px Inter,sans-serif';ctx.fillStyle=C.text3
ctx.fillText(_S('*紫色标注为TOPS/W能效比', '*Purple marks denote TOPS/W energy efficiency'),w/2,top+ch+50)
}

function drawOptimus(id){
const s=initCanvas(id,350);if(!s)return
const{ctx,w,h}=s
const cy=h/2
const stages=[
{text:_S('多摄视觉阵列', 'Multi-camera Vision Array'),sub:_S('海量空间像素输入', 'Massive spatial pixel input'),color:C.orange,x:50,w:120},
{text:_S('AI4/AI5\n端侧计算大脑', 'AI4/AI5\nEdge Compute Brain'),sub:_S('极低延迟语义分割\n纯端到端神经规划', 'Ultra-low Latency Semantic Segmentation\nPure End-to-End Neural Planning'),color:C.accent,x:220,w:140},
{text:_S('22自由度\n伺服控制', '22 DoF\nServo Control'),sub:_S('精密机电实时动作', 'Precise electromechanical real-time actions'),color:C.green,x:410,w:130},
]
stages.forEach(s2=>{
roundedRect(ctx,s2.x,cy-45,s2.w,90,10)
ctx.fillStyle=s2.color+'15';ctx.fill();ctx.strokeStyle=s2.color;ctx.lineWidth=2;ctx.stroke()
ctx.font='bold 12px Inter,sans-serif';ctx.fillStyle=s2.color;ctx.textAlign='center'
s2.text.split('\n').forEach((l,i)=>ctx.fillText(l,s2.x+s2.w/2,cy-20+i*16))
ctx.font='10px Inter,sans-serif';ctx.fillStyle=C.text3
s2.sub.split('\n').forEach((l,i)=>ctx.fillText(l,s2.x+s2.w/2,cy+12+i*14))
})
drawArrow(ctx,170,cy,220,cy,C.text3)
drawArrow(ctx,360,cy,410,cy,C.text3)
ctx.font='bold 11px Inter,sans-serif';ctx.fillStyle=C.cyan;ctx.textAlign='center'
ctx.fillText(_S('云-端协同：70,000 GPU小时云端训练 → 剪枝量化 → 端侧NPU推理', 'Cloud-Edge Synergy: 70,000 GPU-hours cloud training → Pruning/Quantization → Edge NPU inference'),w/2,cy+70)
ctx.fillText(_S('2.3kWh电池 | 2小时+高负载作业 | 不依赖云端Wi-Fi', '2.3kWh Battery | 2+ Hours High-load | No Cloud Wi-Fi Dependency'),w/2,cy+90)
}

function drawFormatEfficiency(id){
const s=initCanvas(id,350);if(!s)return
const{ctx,w,h}=s
const left=80,right=30,top=40,bot=50
const cw=w-left-right,ch=h-top-bot
const data=[
{label:'FP32',bits:32,eff:1,color:C.text3},
{label:'FP16/BF16',bits:16,eff:2,color:C.text3},
{label:'FP8',bits:8,eff:4,color:C.accent},
{label:'FP4/MX4',bits:4,eff:8,color:C.accent2},
]
const maxE=9
data.forEach((d,i)=>{
const x=left+cw*(i+0.5)/data.length
const bh=ch*d.eff/maxE
const by=top+ch-bh
const bw=40
roundedRect(ctx,x-bw/2,by,bw,bh,6)
const grad=ctx.createLinearGradient(x-bw/2,by,x-bw/2,top+ch)
grad.addColorStop(0,d.color);grad.addColorStop(1,d.color+'30')
ctx.fillStyle=grad;ctx.fill()
ctx.font='bold 11px Inter,sans-serif';ctx.fillStyle=d.color;ctx.textAlign='center'
ctx.fillText(d.bits+'bit',x,by-18)
ctx.font='bold 12px Inter,sans-serif'
ctx.fillText(d.eff+'x',x,by-5)
ctx.font='11px Inter,sans-serif';ctx.fillStyle=C.text3
ctx.fillText(d.label,x,top+ch+16)
})
ctx.font='bold 12px Inter,sans-serif';ctx.fillStyle=C.text2;ctx.textAlign='center'
ctx.fillText(_S('相同内存带宽下的有效数据搬运倍率', 'Effective data transfer multiplier under same memory bandwidth'),w/2,18)
}

function drawMXBlock(id){
const s=initCanvas(id,420);if(!s)return
const{ctx,w,h}=s
const cx=w/2
roundedRect(ctx,cx-200,20,400,45,8)
ctx.fillStyle=C.purple+'20';ctx.fill();ctx.strokeStyle=C.purple;ctx.lineWidth=2;ctx.stroke()
ctx.font='bold 13px Inter,sans-serif';ctx.fillStyle=C.purple;ctx.textAlign='center'
ctx.fillText(_S('高精度块共享缩放因子 (Shared Exponent)', 'High-precision Block Shared Exponent'),cx,38)
ctx.font='11px Inter,sans-serif';ctx.fillStyle=C.text3
ctx.fillText(_S('E8M0 格式 — 范围 2⁻¹²⁷ 到 2¹²⁷', 'E8M0 Format — Range 2⁻¹²⁷ to 2¹²⁷'),cx,55)
drawArrow(ctx,cx-60,65,cx-120,95,C.purple+'80')
drawArrow(ctx,cx,cx>0?65:65,cx,cx>0?95:95,C.purple+'80')
drawArrow(ctx,cx+60,65,cx+120,95,C.purple+'80')
const elems=8
const ew=40,eh=30
const startX=cx-elems*ew/2-5
const blockY=95
ctx.fillStyle=C.surface2;ctx.fillRect(startX-5,blockY-5,elems*ew+18,eh+10)
ctx.strokeStyle=C.border;ctx.lineWidth=1;ctx.strokeRect(startX-5,blockY-5,elems*ew+18,eh+10)
for(let i=0;i<elems;i++){
const x=startX+i*(ew+2)
roundedRect(ctx,x,blockY,ew,eh,4)
ctx.fillStyle=C.orange+'30';ctx.fill();ctx.strokeStyle=C.orange;ctx.lineWidth=1;ctx.stroke()
ctx.font='bold 10px Inter,sans-serif';ctx.fillStyle=C.orange;ctx.textAlign='center'
ctx.fillText('E2M1',x+ew/2,blockY+14)
ctx.font='9px Inter,sans-serif';ctx.fillStyle=C.text3
ctx.fillText('4-bit',x+ew/2,blockY+26)
}
ctx.font='10px Inter,sans-serif';ctx.fillStyle=C.text3;ctx.textAlign='center'
ctx.fillText(_S('(共32元素为一个微块, 此处示意8个)', '(Total 32 elements per micro-block, 8 shown here)'),cx,blockY+eh+18)
drawArrow(ctx,cx,blockY+eh+25,cx,blockY+eh+55,C.cyan)
roundedRect(ctx,cx-170,blockY+eh+55,340,40,8)
ctx.fillStyle=C.green+'15';ctx.fill();ctx.strokeStyle=C.green;ctx.lineWidth=1.5;ctx.stroke()
ctx.font='bold 12px Inter,sans-serif';ctx.fillStyle=C.green;ctx.textAlign='center'
ctx.fillText(_S('Tensor Core 乘加流水线', 'Tensor Core Multiply-Accumulate Pipeline'),cx,blockY+eh+72)
ctx.font='10px Inter,sans-serif';ctx.fillStyle=C.text3
ctx.fillText(_S('硬件级瞬间解析共享缩放因子 → 输出逼近FP16精度结果', 'Hardware-level instant parsing of shared scaling factors → Output closely approaches FP16 accuracy'),cx,blockY+eh+87)
}

function drawNVFP4(id){
const s=initCanvas(id,350);if(!s)return
const{ctx,w,h}=s
const cx=w/2
ctx.font='bold 13px Inter,sans-serif';ctx.fillStyle=C.text2;ctx.textAlign='center'
ctx.fillText(_S('缩放因子精度对比', 'Scaling Factor Accuracy Comparison'),cx,25)
const rows=[
{name:_S('标准 MX-FP4', 'Standard MX-FP4'),scale:'E8M0 (8bit)',desc:_S('仅2的幂次缩放\n离散跳变 · 精度有限', 'Powers of 2 scaling only\nDiscrete steps · Limited accuracy'),color:C.orange,y:60},
{name:'NVIDIA NVFP4',scale:'E4M3 (8bit FP8)',desc:_S('含小数部分缩放\n连续光滑 · 精度高', 'Fractional scaling included\nContinuous & smooth · High precision'),color:C.accent,y:180},
]
rows.forEach(r=>{
roundedRect(ctx,30,r.y,w-60,90,10)
ctx.fillStyle=r.color+'10';ctx.fill();ctx.strokeStyle=r.color;ctx.lineWidth=1.5;ctx.stroke()
ctx.font='bold 12px Inter,sans-serif';ctx.fillStyle=r.color;ctx.textAlign='left'
ctx.fillText(r.name,50,r.y+22)
ctx.font='11px Inter,sans-serif';ctx.fillStyle=C.text3
ctx.fillText(_S('缩放因子: ', 'Scaling Factor: ')+r.scale,50,r.y+42)
r.desc.split('\n').forEach((l,i)=>ctx.fillText(l,50,r.y+62+i*16))
const bx=w-180,bw=120
ctx.beginPath()
for(let i=0;i<bw;i++){
const x=bx+i
let y2
if(r.name.includes(_S('标准', 'Standard'))){
y2=r.y+45+Math.round(Math.pow(2,Math.floor(i/30)))*2
}else{
y2=r.y+45+Math.sin(i/15)*15+20
}
i===0?ctx.moveTo(x,y2):ctx.lineTo(x,y2)
}
ctx.strokeStyle=r.color;ctx.lineWidth=2;ctx.stroke()
})
}

function drawHighNA(id){
const s=initCanvas(id,380);if(!s)return
const{ctx,w,h}=s
const cx=w/2
const sides=[
{label:_S('传统 EUV\n(NA 0.33)', 'Traditional EUV\n(NA 0.33)'),sub:_S('13.5nm 分辨率极限', '13.5nm Resolution Limit'),feat:_S('需多重曝光', 'Multi-exposure required'),color:C.red,x:cx-180},
{label:'High-NA EUV\nEXE:5200 (NA 0.55)',sub:_S('8nm 分辨率极限', '8nm Resolution Limit'),feat:_S('单次曝光极细雕刻', 'Single-exposure ultra-fine engraving'),color:C.green,x:cx+20},
]
sides.forEach(s2=>{
roundedRect(ctx,s2.x,30,160,80,10)
ctx.fillStyle=s2.color+'15';ctx.fill();ctx.strokeStyle=s2.color;ctx.lineWidth=2;ctx.stroke()
ctx.font='bold 12px Inter,sans-serif';ctx.fillStyle=s2.color;ctx.textAlign='center'
s2.label.split('\n').forEach((l,i)=>ctx.fillText(l,s2.x+80,50+i*16))
ctx.font='11px Inter,sans-serif';ctx.fillStyle=C.text3
ctx.fillText(s2.sub,s2.x+80,88)
})
ctx.font='bold 16px Inter,sans-serif';ctx.fillStyle=C.text3;ctx.textAlign='center'
ctx.fillText('VS',cx,65)
const ly=140
ctx.font='bold 12px Inter,sans-serif';ctx.fillStyle=C.orange;ctx.textAlign='center'
ctx.fillText(_S('单台造价: 4亿欧元 (~4.3亿美元)', 'Unit Cost: €400M (~$430M)'),cx,ly)
ctx.font='11px Inter,sans-serif';ctx.fillStyle=C.text2
ctx.fillText(_S('2026 Q1: 50万片晶圆加工测试完成 → 正式商用量产', '2026 Q1: 500k Wafers Processed/Tested → Official Commercial Mass Production'),cx,ly+20)
ctx.fillText(_S('Intel 14A / Samsung / TSMC 均已部署', 'Intel 14A / Samsung / TSMC all deployed'),cx,ly+40)
ctx.fillText(_S('直通 1.4nm 制程 → 彻底消除多重曝光良率损失', 'Direct to 1.4nm process → Completely eliminates yield loss from multi-patterning'),cx,ly+60)
ctx.font='bold 11px Inter,sans-serif';ctx.fillStyle=C.red;ctx.textAlign='center'
ctx.fillText(_S('全球AI算力芯片的量产交付 → 完全受制于数十台High-NA光刻机', 'Global AI compute chip delivery → Completely constrained by dozens of High-NA EUV scanners'),cx,ly+90)
}

function drawPackaging(id){
const s=initCanvas(id,380);if(!s)return
const{ctx,w,h}=s
const data=[
{name:'CoWoS-S',year:'2016',area:'~800mm²',desc:_S('硅中介层\n2.5D封装', 'Silicon Interposer\n2.5D Packaging'),color:C.text3},
{name:'CoWoS-L',year:'2023',area:'~1200mm²',desc:_S('局部硅桥+有机基板\nHBM3e集成', 'Local Silicon Bridge + Organic Substrate\nHBM3e Integration'),color:C.accent},
{name:'CoWoS-L+',year:'2025',area:'~1600mm²',desc:_S('扩展中介层\n12-HBM支持', 'Expanded Interposer\n12-HBM Support'),color:C.accent},
{name:'CoPoS',year:'2026+',area:_S('310×310mm面板', '310×310mm Panel'),desc:_S('巨幅面板级封装\n突破光罩极限', 'Giant Panel-level Packaging\nBreak the Reticle Limit'),color:C.accent2},
]
const top=40,bot=60,left=20,right=20
const ch=h-top-bot
const step=(w-40)/(data.length-1)
ctx.beginPath()
ctx.moveTo(left+20,top+ch/2)
data.forEach((d,i)=>{
const x=left+20+i*step
const y=top+ch/2-Math.sin(i*0.5)*60
if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y)
})
ctx.strokeStyle=C.accent+'60';ctx.lineWidth=3;ctx.stroke()
data.forEach((d,i)=>{
const x=left+20+i*step
const y=top+ch/2-Math.sin(i*0.5)*60
ctx.beginPath();ctx.arc(x,y,8,0,Math.PI*2);ctx.fillStyle=d.color;ctx.fill()
ctx.font='bold 11px Inter,sans-serif';ctx.fillStyle=d.color;ctx.textAlign='center'
ctx.fillText(d.name,x,y-18)
ctx.font='10px Inter,sans-serif';ctx.fillStyle=C.text3
ctx.fillText(d.year,x,y+22)
ctx.fillText(d.area,x,y+36)
d.desc.split('\n').forEach((l,li)=>ctx.fillText(l,x,y+50+li*12))
})
ctx.font='bold 12px Inter,sans-serif';ctx.fillStyle=C.text2;ctx.textAlign='center'
ctx.fillText(_S('先进封装技术演进：从晶圆级到面板级', 'Advanced Packaging Evolution: Wafer-level to Panel-level'),w/2,20)
}

function drawFoundry(id){
const s=initCanvas(id,380);if(!s)return
const{ctx,w,h}=s
const foundries=[
{name:'TSMC',nodes:['N5 (5nm)','N3 (3nm)','N3E','N2 (2nm)','A16 (1.6nm)'],color:C.accent},
{name:'Samsung',nodes:['SF5 (5nm)','SF3 (3nm)','SF2 (2nm)','SF1.4 (1.4nm)'],color:C.green},
{name:'Intel',nodes:['Intel 4','Intel 3','Intel 20A','Intel 18A','Intel 14A (1.4nm)'],color:C.cyan},
{name:'SMIC',nodes:['N+1 (14nm)','N+2 (7nm equiv.)','N+3 (5nm equiv.?)'],color:C.red},
]
const top=40,bot=20,left=70,right=20
const ch=h-top-bot
const rowH=ch/foundries.length
foundries.forEach((f,fi)=>{
const y=top+fi*rowH
ctx.font='bold 12px Inter,sans-serif';ctx.fillStyle=f.color;ctx.textAlign='left'
ctx.fillText(f.name,left-60,y+rowH/2+4)
const nw=(w-left-right)/6
f.nodes.forEach((n,ni)=>{
const nx=left+ni*nw+nw/2
roundedRect(ctx,nx-35,y+rowH/2-12,70,24,6)
ctx.fillStyle=f.color+'20';ctx.fill();ctx.strokeStyle=f.color+'60';ctx.lineWidth=1;ctx.stroke()
ctx.font='9px Inter,sans-serif';ctx.fillStyle=C.text2;ctx.textAlign='center'
ctx.fillText(n,nx,y+rowH/2+4)
if(ni<f.nodes.length-1)drawArrow(ctx,nx+36,y+rowH/2,nx+nw-36,y+rowH/2,f.color+'40',1)
})
})
ctx.font='bold 12px Inter,sans-serif';ctx.fillStyle=C.text2;ctx.textAlign='center'
ctx.fillText(_S('全球主要代工厂制程节点演进', 'Process Node Evolution of Global Foundries'),w/2,18)
}

function drawAscend(id){
const s=initCanvas(id,380);if(!s)return
const{ctx,w,h}=s
const cx=w/2
ctx.font='bold 12px Inter,sans-serif';ctx.fillStyle=C.text3;ctx.textAlign='center'
ctx.fillText(_S('普通有机材料承载大基板 (Organic Substrate)', 'Common organic materials carrying large substrate (Organic Substrate)'),cx,25)
ctx.setLineDash([5,5]);ctx.strokeStyle=C.border;ctx.lineWidth=2
ctx.strokeRect(40,40,w-80,220);ctx.setLineDash([])
;[0,1].forEach(i=>{
const dx=cx-120+i*140
roundedRect(ctx,dx,60,100,80,8)
ctx.fillStyle=C.green+'15';ctx.fill();ctx.strokeStyle=C.green;ctx.lineWidth=1.5;ctx.stroke()
ctx.font='bold 11px Inter,sans-serif';ctx.fillStyle=C.green;ctx.textAlign='center'
ctx.fillText(_S('算力硅片 Die ', 'Compute Die')+(i+1),dx+50,85)
ctx.font='10px Inter,sans-serif';ctx.fillStyle=C.text3
ctx.fillText('SMIC N+2',dx+50,102)
ctx.fillText(_S('(7nm等效)', '(7nm equivalent)'),dx+50,116)
})
drawArrow(ctx,cx-20,100,cx+20,100,C.text3+'80',1)
ctx.font='9px Inter,sans-serif';ctx.fillStyle=C.red;ctx.textAlign='center'
ctx.fillText(_S('铜走线 (带宽受限)', 'Copper Interconnect (Bandwidth limited)'),cx,92)
;[0,1].forEach(i=>{
const hx=cx-80+i*100
roundedRect(ctx,hx,165,60,28,4)
ctx.fillStyle=C.orange+'20';ctx.fill();ctx.strokeStyle=C.orange;ctx.lineWidth=1;ctx.stroke()
ctx.font='9px Inter,sans-serif';ctx.fillStyle=C.orange;ctx.textAlign='center'
ctx.fillText('HBM2e',hx+30,183)
})
ctx.font='bold 11px Inter,sans-serif';ctx.fillStyle=C.red;ctx.textAlign='center'
ctx.fillText(_S('Die-to-Die带宽 vs NVIDIA: 差距10-20x', 'Die-to-Die Bandwidth vs NVIDIA: 10-20x Gap'),cx,220)
ctx.font='11px Inter,sans-serif';ctx.fillStyle=C.text2
ctx.fillText(_S('FP16: 670-800 TFLOPS | HBM带宽: 900 GB/s | ≈H100的80%', 'FP16: 670-800 TFLOPS | HBM Bandwidth: 900 GB/s | ≈80% of H100'),cx,245)
}

function drawAscendVsH100(id){
const s=initCanvas(id,380);if(!s)return
const{ctx,w,h}=s
const left=100,right=30,top=40,bot=50
const cw=w-left-right,ch=h-top-bot
const metrics=[
{name:'FP16 (TFLOPS)',h100:990,ascend:735,max:1100},
{name:_S('HBM带宽 (GB/s)', 'HBM Bandwidth (GB/s)'),h100:3350,ascend:900,max:3500},
{name:_S('制程 (nm↓)', 'Process (nm↓)'),h100:4,ascend:7,max:8},
{name:_S('晶体管 (亿)', 'Transistors (100M)'),h100:800,ascend:530,max:900},
]
const barH=ch/metrics.length-15
metrics.forEach((m,i)=>{
const y=top+i*(barH+15)
ctx.font='11px Inter,sans-serif';ctx.fillStyle=C.text2;ctx.textAlign='right'
ctx.fillText(m.name,left-8,y+barH/2+4)
const bw=(cw-30)/2
const h100w=bw*(1-m.h100/m.max)
const ascw=bw*(1-m.ascend/m.max)
roundedRect(ctx,left,y,bw,barH/2-2,4)
ctx.fillStyle=C.accent+'40';ctx.fill()
roundedRect(ctx,left,y,bw*h100w/m.max,barH/2-2,4)
ctx.fillStyle=C.accent;ctx.fill()
ctx.font='10px Inter,sans-serif';ctx.fillStyle=C.text;ctx.textAlign='left'
ctx.fillText(m.h100,left+bw*h100w/m.max+4,y+barH/4)
roundedRect(ctx,left,y+barH/2+2,bw,barH/2-2,4)
ctx.fillStyle=C.red+'40';ctx.fill()
roundedRect(ctx,left,y+barH/2+2,bw*ascw/m.max,barH/2-2,4)
ctx.fillStyle=C.red;ctx.fill()
ctx.font='10px Inter,sans-serif';ctx.fillStyle=C.text;ctx.textAlign='left'
ctx.fillText(m.ascend,left+bw*ascw/m.max+4,y+barH*3/4+2)
})
ctx.font='10px Inter,sans-serif';ctx.textAlign='center'
ctx.fillStyle=C.accent;ctx.fillText('■ NVIDIA H100',w/2-60,top+ch+16)
ctx.fillStyle=C.red;ctx.fillText('■ Ascend 910C',w/2+60,top+ch+16)
}

function drawDualTrack(id){
const s=initCanvas(id,320);if(!s)return
const{ctx,w,h}=s
const cy=h/2
const boxes=[
{text:_S('海外NVIDIA GPU', 'Overseas NVIDIA GPU'),sub:_S('前沿预训练\n(高精度·高容错率)', 'Frontier Pre-training\n(High Precision · High Fault Tolerance)'),color:C.accent,x:40},
{text:_S('国产Ascend集群', 'Domestic Ascend Cluster'),sub:_S('大规模推理部署\n(自主可控·低成本)', 'Large-scale Inference Deployment\n(Self-controllable · Low cost)'),color:C.green,x:260},
]
const arrowX=w/2
boxes.forEach(b=>{
roundedRect(ctx,b.x,cy-40,150,80,10)
ctx.fillStyle=b.color+'15';ctx.fill();ctx.strokeStyle=b.color;ctx.lineWidth=2;ctx.stroke()
ctx.font='bold 12px Inter,sans-serif';ctx.fillStyle=b.color;ctx.textAlign='center'
ctx.fillText(b.text,b.x+75,cy-15)
ctx.font='10px Inter,sans-serif';ctx.fillStyle=C.text3
b.sub.split('\n').forEach((l,i)=>ctx.fillText(l,b.x+75,cy+5+i*14))
})
ctx.font='bold 12px Inter,sans-serif';ctx.fillStyle=C.orange;ctx.textAlign='center'
ctx.fillText(_S('模型完成训练', 'Model completes training'),arrowX,cy-8)
drawArrow(ctx,arrowX-50,cy,arrowX+50,cy,C.orange)
ctx.font='10px Inter,sans-serif';ctx.fillStyle=C.text3
ctx.fillText(_S('→ 推理部署迁移', '→ Inference Deployment Migration'),arrowX,cy+8)
ctx.font='bold 11px Inter,sans-serif';ctx.fillStyle=C.text2;ctx.textAlign='center'
ctx.fillText(_S('双轨并行：训练用NVIDIA，推理用Ascend — 中国AI产业生存法则', 'Dual-track Parallel: NVIDIA for training, Ascend for inference — China\'s AI industry survival law'),w/2,cy+60)
}

function drawSummary(id){
const s=initCanvas(id,420);if(!s)return
const{ctx,w,h}=s
const cx=w/2,cy=h/2
const themes=[
{text:_S('架构解体', 'Architectural Disintegration'),sub:_S('CPU+GPU融合\nNVLink-C2C / Axion', 'CPU+GPU Fusion\nNVLink-C2C / Axion'),color:C.accent,angle:0},
{text:_S('训练/推理分化', 'Training/Inference Bifurcation'),sub:_S('TPU 8t/8i\nASIC定制化', 'TPU 8t/8i\nCustom ASIC'),color:C.green,angle:Math.PI/2},
{text:_S('数据格式重构', 'Data Format Reconstruction'),sub:_S('OCP MX / NVFP4\n软件定义硬件', 'OCP MX / NVFP4\nSoftware-defined Hardware'),color:C.purple,angle:Math.PI},
{text:_S('物理堡垒', 'Physical Fortress'),sub:_S('High-NA EUV\nCoPoS封装', 'High-NA EUV\nCoPoS Packaging'),color:C.orange,angle:3*Math.PI/2},
]
const r=130
themes.forEach((t,i)=>{
const nx=cx+Math.cos(t.angle)*r,ny=cy+Math.sin(t.angle)*r
ctx.beginPath();ctx.arc(nx,ny,55,0,Math.PI*2)
ctx.fillStyle=t.color+'12';ctx.fill()
ctx.strokeStyle=t.color;ctx.lineWidth=2;ctx.stroke()
ctx.font='bold 11px Inter,sans-serif';ctx.fillStyle=t.color;ctx.textAlign='center'
ctx.fillText(t.text,nx,ny-12)
ctx.font='9px Inter,sans-serif';ctx.fillStyle=C.text3
t.sub.split('\n').forEach((l,li)=>ctx.fillText(l,nx,ny+4+li*12))
const ex=cx+Math.cos(t.angle)*40,ey=cy+Math.sin(t.angle)*40
drawArrow(ctx,ex,ey,nx-Math.cos(t.angle)*55,ny-Math.sin(t.angle)*55,t.color+'50',1.5)
})
ctx.beginPath();ctx.arc(cx,cy,36,0,Math.PI*2)
const grad=ctx.createRadialGradient(cx,cy,0,cx,cy,36)
grad.addColorStop(0,C.accent2+'40');grad.addColorStop(1,C.accent2+'10')
ctx.fillStyle=grad;ctx.fill();ctx.strokeStyle=C.accent2;ctx.lineWidth=2;ctx.stroke()
ctx.font='bold 11px Inter,sans-serif';ctx.fillStyle=C.text;ctx.textAlign='center'
ctx.fillText('2026',cx,cy-4)
ctx.fillText(_S('AI芯片', 'AI Chips'),cx,cy+10)
const nextA=themes.map((_,i)=>{const a=themes[(i+1)%themes.length].angle;return a})
themes.forEach((t,i)=>{
const a1=t.angle+0.3,a2=nextA[i]-0.3
const r2=75
const nx1=cx+Math.cos(a1)*r2,ny1=cy+Math.sin(a1)*r2
const nx2=cx+Math.cos(a2)*r2,ny2=cy+Math.sin(a2)*r2
 ctx.beginPath();ctx.moveTo(nx1,ny1);ctx.lineTo(nx2,ny2)
 ctx.strokeStyle=C.text3+'30';ctx.lineWidth=1;ctx.setLineDash([3,3]);ctx.stroke();ctx.setLineDash([])
 })
}

function _L(zh,en){
const lang=window.__lang||'zh';
if(lang==='en' && en) return en.split('\n');
return zh.split('\n');
}

function _S(zh,en){
const lang=window.__lang||'zh';
return (lang==='en' && en)?en:zh;
}

function drawVendorMap(id){
const s=initCanvas(id,600);if(!s)return
const{ctx,w,h}=s
const cx=w/2,cy=h/2+10

const vendors=[
{name:_L('华为昇腾','Huawei Ascend'),sub:_L('Da Vinci\n910C·800TF','Da Vinci\n910C·800TF'),color:C.red,r:46,ring:0,pos:0},
{name:_L('昆仑芯','Kunlunxin'),sub:_L('XPU-R\n256TOPS','XPU-R\n256TOPS'),color:C.orange,r:44,ring:0,pos:1},
{name:_L('寒武纪','Cambricon'),sub:_L('MLU370\n256TOPS','MLU370\n256TOPS'),color:C.green,r:42,ring:0,pos:2},
{name:_L('壁仞科技','Biren'),sub:_L('壁砺166\nChiplet','Bili166\nChiplet'),color:C.cyan,r:40,ring:1,pos:0},
{name:_L('天数智芯','Iluvatar'),sub:_L('天垓150\nGPU兼容','Tianguai150\nGPU'),color:C.purple,r:38,ring:1,pos:1},
{name:_L('摩尔线程','Moore Threads'),sub:_L('MTT S4000\n全功能GPU','MTT S4000\nFull GPU'),color:C.accent,r:38,ring:1,pos:2},
{name:_L('燧原科技','Enflame'),sub:_L('CloudBlade\n推理专精','CloudBlade\nInference'),color:C.orange,r:36,ring:2,pos:0},
{name:_L('海光信息','Hygon'),sub:_L('DCU\nx86授权','DCU\nx86 License'),color:C.red,r:36,ring:2,pos:1},
{name:_L('沐曦科技','Muxi'),sub:_L('自研GPU\n云端训推','Prop GPU\nTrain+Infer'),color:C.purple,r:34,ring:2,pos:2},
]

const rings=[{R:120,count:3,offset:Math.PI/2},{R:190,count:3,offset:Math.PI/2+Math.PI/6},{R:260,count:3,offset:Math.PI/2-Math.PI/6}]
const groups=[
{label:_L('自研架构派','Proprietary'),color:C.accent},
{label:_L('GPU兼容派','GPU Compatible'),color:C.green},
{label:_L('特殊路线派','Special Route'),color:C.orange},
]

vendors.forEach(v=>{
const ring=rings[v.ring]
const angle=-ring.offset+Math.PI*2*v.pos/ring.count
const nx=cx+Math.cos(angle)*ring.R
const ny=cy+Math.sin(angle)*ring.R*0.7
ctx.beginPath();ctx.arc(nx,ny,v.r,0,Math.PI*2)
ctx.fillStyle=v.color+'12';ctx.fill()
ctx.strokeStyle=v.color;ctx.lineWidth=1.5;ctx.stroke()
ctx.font='bold 10px Inter,sans-serif';ctx.fillStyle=v.color;ctx.textAlign='center'
ctx.fillText(v.name[0],nx,ny-10)
ctx.font='8px Inter,sans-serif';ctx.fillStyle=C.text3
v.sub.forEach((l,li)=>ctx.fillText(l,nx,ny+4+li*10))
drawArrow(ctx,cx,cy,nx-Math.cos(angle)*v.r,ny-Math.sin(angle)*v.r*0.35,v.color+'35',0.8)
})

ctx.beginPath();ctx.arc(cx,cy,26,0,Math.PI*2)
const grad=ctx.createRadialGradient(cx,cy,0,cx,cy,26)
grad.addColorStop(0,C.accent2+'40');grad.addColorStop(1,C.accent2+'10')
ctx.fillStyle=grad;ctx.fill();ctx.strokeStyle=C.accent2;ctx.lineWidth=2;ctx.stroke()
const center=_L('国产AI\n芯片生态','China AI\nChip Ecosystem')
ctx.font='bold 9px Inter,sans-serif';ctx.fillStyle=C.text;ctx.textAlign='center'
center.forEach((l,li)=>ctx.fillText(l,cx,cy-4+li*10))

const lx=12,ly=14
groups.forEach((g,gi)=>{
ctx.font='bold 9px Inter,sans-serif';ctx.fillStyle=g.color;ctx.textAlign='left'
ctx.fillText(g.label[0],lx,ly+gi*15)
})
}

function drawChinaVendorMatrix(id){
const s=initCanvas(id,460);if(!s)return
const{ctx,w,h}=s
const left=90,right=20,top=40,bot=55
const cw=w-left-right,ch=h-top-bot
const vendors=[
{name:_L('华为\n910C','Huawei\n910C'),color:C.red},
{name:_L('昆仑芯\nR200','Kunlunxin\nR200'),color:C.orange},
{name:_L('寒武纪\nMLU370','Cambricon\nMLU370'),color:C.green},
{name:_L('天数智芯\n天垓150','Iluvatar\nTianguai'),color:C.purple},
{name:_L('壁仞\n166M','Biren\n166M'),color:C.cyan},
{name:_L('摩尔线程\nS4000','Moore\nS4000'),color:C.accent},
{name:_L('海光\nDCU','Hygon\nDCU'),color:C.red},
{name:_L('燧原\nEnflame','Enflame'),color:C.orange},
{name:_L('沐曦\nMuxi','Muxi'),color:C.purple},
]
const dims=[
{name:_L('峰值算力','PeakFLOPS'),max:100},
{name:_L('软件生态','SoftEco'),max:100},
{name:_L('制造工艺','Process'),max:100},
{name:_L('部署规模','Deploy'),max:100},
{name:_L('性价比','CostEff'),max:100},
]
const vals=[
[80,75,50,90,55],
[30,35,55,45,60],
[25,30,45,25,50],
[20,25,40,15,40],
[35,20,35,20,45],
[15,18,35,10,35],
[40,55,40,50,50],
[20,20,35,20,40],
[10,10,25,5,30],
]
const gw=cw/vendors.length
const dimH=ch/dims.length
dims.forEach((d,di)=>{
const dy=top+di*dimH
 ctx.font='13px Inter,sans-serif';ctx.fillStyle=C.text2;ctx.textAlign='right'
 ctx.fillText(d.name[0],left-8,dy+dimH/2+4)
ctx.strokeStyle=C.border;ctx.lineWidth=0.5
ctx.beginPath();ctx.moveTo(left,dy+dimH);ctx.lineTo(w-right,dy+dimH);ctx.stroke()
})
vendors.forEach((v,vi)=>{
 const vx=left+vi*gw
 vals[vi].forEach((val,di)=>{
 const dy=top+di*dimH
 const bw=Math.max(gw*0.7*val/dims[di].max,2)
const bh=dimH*0.55
const bx=vx+(gw-bw)/2
const by=dy+(dimH-bh)/2
roundedRect(ctx,vi%2===0?vx+4:vx+6,by,bw,bh,3)
ctx.fillStyle=v.color+'50';ctx.fill()
})
 ctx.font='8px Inter,sans-serif';ctx.fillStyle=v.color;ctx.textAlign='center'
 v.name.forEach((l,li)=>ctx.fillText(l,left+vi*gw+gw/2,top+ch+12+li*10))
})
}

function drawKunlunTimeline(id){
const s=initCanvas(id,380);if(!s)return
const{ctx,w,h}=s
const top=50,bot=60,left=30,right=30
const ch2=h-top-bot
const data=[
{year:'2011',label:_L('启动FPGA\nAI加速器','FPGA AI\nAccelerator'),color:C.text3},
{year:'2015',label:_L('FPGA部署\n超5千片','5K FPGAs\nDeployed'),color:C.text3},
{year:'2017',label:_L('Hot Chips\n发布XPU架构','Hot Chips\nXPU Arch'),color:C.green},
{year:'2018',label:_L('正式启动\nAI芯片研发','Start AI\nChip R&D'),color:C.accent},
{year:'2020',label:_L('1代产品\n大规模部署','Gen1 Mass\nDeployment'),color:C.orange},
{year:'2021.04',label:_L('独立融资\n公司化运营','Independent\nSpin-off'),color:C.accent2},
{year:'2021.08',label:_L('2代产品\n量产','Gen2 Mass\nProduction'),color:C.orange},
{year:'2024',label:_L('3代量产\n大模型适配','Gen3 Prod\nLLM Ready'),color:C.red},
{year:'2025',label:_L('32/64卡\n超节点落地','32/64 Card\nSuper-Node'),color:C.cyan},
{year:'2026-27',label:_L('下一代产品\n多元化需求','Next Gen\nDiversified'),color:C.purple},
]
const step=(w-left-right)/(data.length-1)
ctx.beginPath()
data.forEach((d,i)=>{
const x=left+i*step
const y=top+ch2/2-Math.sin(i*0.4)*40
if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y)
})
ctx.strokeStyle=C.accent+'60';ctx.lineWidth=3;ctx.stroke()
data.forEach((d,i)=>{
const x=left+i*step
const y=top+ch2/2-Math.sin(i*0.4)*40
ctx.beginPath();ctx.arc(x,y,7,0,Math.PI*2);ctx.fillStyle=d.color;ctx.fill()
 ctx.font='bold 10px Inter,sans-serif';ctx.fillStyle=d.color;ctx.textAlign='center'
 ctx.fillText(d.year,x,y-16)
 ctx.font='9px Inter,sans-serif';ctx.fillStyle=C.text3
 if(Array.isArray(d.label))d.label.forEach((l,li)=>ctx.fillText(l,x,y+14+li*11))
 else d.label.split('\n').forEach((l,li)=>ctx.fillText(l,x,y+14+li*11))
})
 ctx.font='bold 12px Inter,sans-serif';ctx.fillStyle=C.text2;ctx.textAlign='center'
 const tlt=_L('昆仑芯科技发展历程 (2011-2027)','Kunlunxin Timeline 2011-2027')
 ctx.fillText(Array.isArray(tlt)?tlt[0]:tlt,w/2,25)
}

function drawChinaDilemma(id){
const s=initCanvas(id,380);if(!s)return
const{ctx,w,h}=s
const cx=w/2,cy=h/2
const dilemmas=[
{label:_L('制造代差','Mfg Gap'),sub:_L('SMIC 7nm\nvs TSMC 3nm\n两代制程差距','SMIC 7nm\nvs TSMC 3nm\n2-Gen Gap'),color:C.red,angle:-Math.PI/2},
{label:_L('封装落后','Pkg Lag'),sub:_L('无CoWoS\nDie间带宽\n差距10-20x','No CoWoS\nDie BW\n10-20x Gap'),color:C.orange,angle:0},
{label:_L('软件生态','Soft Eco'),sub:_L('CUDA 400万+\n开发者 vs\n国产碎片化','CUDA 4M+\nDevs vs\nDomestic'),color:C.accent2,angle:Math.PI/2},
{label:_L('标准碎片','Std Frag'),sub:_L('9大厂商\n9套架构\n互不兼容','9 Vendors\n9 Archs\nIncompat'),color:C.cyan,angle:Math.PI},
]
const R=120
 dilemmas.forEach((d,i)=>{
 const nx=cx+Math.cos(d.angle)*R,ny=cy+Math.sin(d.angle)*R
 ctx.beginPath();ctx.arc(nx,ny,55,0,Math.PI*2)
 ctx.fillStyle=d.color+'12';ctx.fill()
 ctx.strokeStyle=d.color;ctx.lineWidth=2;ctx.stroke()
 ctx.font='bold 12px Inter,sans-serif';ctx.fillStyle=d.color;ctx.textAlign='center'
 ctx.fillText(Array.isArray(d.label)?d.label[0]:d.label,nx,ny-18)
 ctx.font='10px Inter,sans-serif';ctx.fillStyle=C.text3
 const sub=Array.isArray(d.sub)?d.sub:d.sub.split('\n')
 sub.forEach((l,li)=>ctx.fillText(l,nx,ny+2+li*13))
const ex=cx+Math.cos(d.angle)*35,ey=cy+Math.sin(d.angle)*35
drawArrow(ctx,ex,ey,nx-Math.cos(d.angle)*55,ny-Math.sin(d.angle)*55,d.color+'60',1.5)
})
ctx.beginPath();ctx.arc(cx,cy,32,0,Math.PI*2)
const grad=ctx.createRadialGradient(cx,cy,0,cx,cy,32)
grad.addColorStop(0,C.red+'40');grad.addColorStop(1,C.red+'10')
ctx.fillStyle=grad;ctx.fill();ctx.strokeStyle=C.red;ctx.lineWidth=2;ctx.stroke()
 ctx.font='bold 10px Inter,sans-serif';ctx.fillStyle=C.text;ctx.textAlign='center'
 const dc=_L('国产AI\n芯片困境','Domestic AI\nChip Dilemmas')
 dc.forEach((l,li)=>ctx.fillText(l,cx,cy-4+li*10))
const nextA=dilemmas.map((_,i)=>dilemmas[(i+1)%dilemmas.length].angle)
dilemmas.forEach((d,i)=>{
const a1=d.angle+0.35,a2=nextA[i]-0.35
const r2=70
const nx1=cx+Math.cos(a1)*r2,ny1=cy+Math.sin(a1)*r2
const nx2=cx+Math.cos(a2)*r2,ny2=cy+Math.sin(a2)*r2
ctx.beginPath();ctx.moveTo(nx1,ny1);ctx.lineTo(nx2,ny2)
ctx.strokeStyle=C.text3+'30';ctx.lineWidth=1;ctx.setLineDash([3,3]);ctx.stroke();ctx.setLineDash([])
})
}

function drawChinaVsNvidia(id){
const s=initCanvas(id,400);if(!s)return
const{ctx,w,h}=s
const left=100,right=30,top=40,bot=65
const cw=w-left-right,ch=h-top-bot
const vendors=[
{name:'NVIDIA H100',fp16:990,mem:3350,proc:4,color:C.accent},
{name:_L('华为910C','Huawei910C').join(''),fp16:735,mem:900,proc:7,color:C.red},
{name:_L('昆仑芯R200','KunlunxinR200').join(''),fp16:128,mem:512,proc:7,color:C.orange},
{name:_L('壁仞166M','Biren166M').join(''),fp16:200,mem:600,proc:7,color:C.cyan},
{name:_L('寒武纪370','Cambricon370').join(''),fp16:100,mem:400,proc:7,color:C.green},
]
const metrics=[
{label:_L('FP16 TFLOPS','FP16 TFLOPS'),max:1100,key:'fp16'},
{label:_L('HBM带宽 GB/s','HBM BW GB/s'),max:3500,key:'mem'},
]
metrics.forEach((m,mi)=>{
const my=top+mi*ch/2
const mh=ch/2-20
vendors.forEach((v,vi)=>{
const bw=cw/vendors.length*0.6
const x=left+vi*cw/vendors.length+(cw/vendors.length-bw)/2
const bh=mh*v[m.key]/m.max
const by=my+mh-bh
roundedRect(ctx,x,by,bw,Math.max(bh,2),5)
const grad=ctx.createLinearGradient(x,by,x,my+mh)
grad.addColorStop(0,v.color);grad.addColorStop(1,v.color+'30')
ctx.fillStyle=grad;ctx.fill()
ctx.font='bold 9px Inter,sans-serif';ctx.fillStyle=v.color;ctx.textAlign='center'
const txt=m.key==='fp16'?v.fp16+'T':v.mem+'G/s'
ctx.fillText(txt,x+bw/2,by-5)
})
 ctx.font='bold 11px Inter,sans-serif';ctx.fillStyle=C.text2;ctx.textAlign='right'
 ctx.fillText(Array.isArray(m.label)?m.label[0]:m.label,left-8,my+mh/2+4)
ctx.strokeStyle=C.border;ctx.lineWidth=0.5
ctx.beginPath();ctx.moveTo(left,my+mh);ctx.lineTo(w-right,my+mh);ctx.stroke()
})
vendors.forEach((v,i)=>{
const x=left+i*cw/vendors.length+cw/vendors.length/2
ctx.font='9px Inter,sans-serif';ctx.fillStyle=v.color;ctx.textAlign='center'
v.name.split(' ').forEach((l,li)=>ctx.fillText(l,x,top+ch+12+li*11))
})
 const tlt2=_L('国产AI芯片 vs NVIDIA 旗舰关键参数对比','Domestic Chips vs NVIDIA Flagship')
 ctx.font='bold 11px Inter,sans-serif';ctx.fillStyle=C.text2;ctx.textAlign='center'
 ctx.fillText(Array.isArray(tlt2)?tlt2[0]:tlt2,w/2,18)
}

function drawAMDArch(id){
const s=initCanvas(id,420);if(!s)return
const{ctx,w,h}=s
const cx=w/2
const top=35,cy=top+180
roundedRect(ctx,cx-180,top,360,45,8)
ctx.fillStyle=C.orange+'20';ctx.fill();ctx.strokeStyle=C.orange;ctx.lineWidth=2;ctx.stroke()
ctx.font='bold 13px Inter,sans-serif';ctx.fillStyle=C.orange;ctx.textAlign='center'
ctx.fillText('AMD EPYC CPU (SP5 Socket)',cx,top+20)
ctx.font='11px Inter,sans-serif';ctx.fillStyle=C.text3
ctx.fillText(_S('Infinity Fabric — 统一内存访问', 'Infinity Fabric — Unified Memory Access'),cx,top+38)
const dies=[
{label:'IOD',sub:'Infinity\nFabric\nHub',color:C.text3,x:cx-150,w:80},
{label:'AID',sub:'CDNA3\nCompute',color:C.accent,x:cx-40,w:110},
{label:'AID',sub:'CDNA3\nCompute',color:C.accent2,x:cx+90,w:110},
]
dies.forEach(d=>{
roundedRect(ctx,d.x,top+65,d.w,70,6)
ctx.fillStyle=d.color+'15';ctx.fill();ctx.strokeStyle=d.color;ctx.lineWidth=1.5;ctx.stroke()
ctx.font='bold 11px Inter,sans-serif';ctx.fillStyle=d.color;ctx.textAlign='center'
ctx.fillText(d.label,d.x+d.w/2,top+80)
ctx.font='9px Inter,sans-serif';ctx.fillStyle=C.text3
d.sub.split('\n').forEach((l,i)=>ctx.fillText(l,d.x+d.w/2,top+100+i*12))
})
drawArrow(ctx,cx-110,top+65,cx-110,top+40,C.orange+'80')
drawArrow(ctx,cx+110,top+65,cx+110,top+40,C.orange+'80')
drawArrow(ctx,cx-70,top+100,cx-50,top+100,C.text3)
drawArrow(ctx,cx+50,top+100,cx+70,top+100,C.text3)
const hbms=4
const hbW=55,hbH=20,startX=cx-hbms*hbW/2
for(let i=0;i<hbms;i++){
roundedRect(ctx,startX+i*hbW+3,top+155,hbW-6,hbH,3)
ctx.fillStyle=C.green+'30';ctx.fill();ctx.strokeStyle=C.green;ctx.lineWidth=1;ctx.stroke()
ctx.font='10px Inter,sans-serif';ctx.fillStyle=C.green;ctx.textAlign='center'
ctx.fillText('HBM3',startX+i*hbW+hbW/2,top+155+hbH-5)
}
ctx.font='bold 11px Inter,sans-serif';ctx.fillStyle=C.green;ctx.textAlign='center'
ctx.fillText('192 GB HBM3 | 5.3 TB/s',cx,top+190)
drawArrow(ctx,cx,top+135,cx,top+155,C.green+'50')
const specs=[
{icon:'▸',text:_S('8× CDNA3 计算芯粒 (5nm)', '8× CDNA3 Compute Chiplet (5nm)'),x:20,y:240},
{icon:'▸',text:_S('304 Compute Units | 19,456 流处理器', '304 Compute Units | 19,456 Stream Processors'),x:20,y:260},
{icon:'▸',text:_S('1530 亿晶体管 (TSMC 5nm+6nm)', '153 Billion Transistors (TSMC 5nm+6nm)'),x:20,y:280},
{icon:'▸',text:'FP16: 1.3 PFLOPS | FP8: 2.6 PFLOPS',x:20,y:300},
{icon:'▸',text:'TDP: 750W | PCIe 5.0',x:20,y:320},
{icon:'▸',text:_S('ROCm 6.0 | HIP → CUDA 翻译层', 'ROCm 6.0 | HIP → CUDA Translation Layer'),x:20,y:340},
]
ctx.font='12px Inter,sans-serif';ctx.textAlign='left'
specs.forEach(s=>{
ctx.fillStyle=C.orange;ctx.fillText(s.icon,s.x,s.y)
ctx.fillStyle=C.text2;ctx.fillText(s.text,s.x+18,s.y)
})
ctx.font='bold 11px Inter,sans-serif';ctx.fillStyle=C.cyan;ctx.textAlign='center'
ctx.fillText(_S('MI300X 采用 Chiplet 异构集成：5nm CDNA3 计算芯粒 + 6nm IOD，通过 Infinity Fabric 互联', 'MI300X uses Chiplet heterogeneous integration: 5nm CDNA3 Compute Chiplet + 6nm IOD, connected via Infinity Fabric'),cx,370)
}

function drawAMDRoadmap(id){
const s=initCanvas(id,350);if(!s)return
const{ctx,w,h}=s
const top=40,bot=50,left=30,right=30
const ch2=h-top-bot
const data=[
{name:'MI250X',year:'2022',spec:'FP16: 383T',color:C.text3},
{name:'MI300X',year:'2023',spec:'FP16: 1.3P',color:C.orange},
{name:'MI325X',year:'2024',spec:'288GB HBM3e',color:C.accent},
{name:'MI350',year:'2025',spec:'CDNA4, 3nm',color:C.accent2},
{name:'MI400',year:'2026+',spec:'CDNA5, 2nm?',color:C.purple},
]
const step=(w-left-right)/(data.length-1)
ctx.beginPath()
data.forEach((d,i)=>{
const x=left+i*step
const y=top+ch2/2+Math.sin(i*0.6)*50
if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y)
})
ctx.strokeStyle=C.orange+'60';ctx.lineWidth=3;ctx.stroke()
data.forEach((d,i)=>{
const x=left+i*step
const y=top+ch2/2+Math.sin(i*0.6)*50
const r=i===3?10:i===4?10:7
ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=d.color;ctx.fill()
ctx.font='bold 10px Inter,sans-serif';ctx.fillStyle=d.color;ctx.textAlign='center'
ctx.fillText(d.name,x,y-20)
ctx.font='9px Inter,sans-serif';ctx.fillStyle=C.text3
ctx.fillText(d.year,x,y+16)
ctx.fillText(d.spec,x,y+28)
})
ctx.font='bold 12px Inter,sans-serif';ctx.fillStyle=C.text2;ctx.textAlign='center'
ctx.fillText(_S('AMD Instinct 产品路线图', 'AMD Instinct Product Roadmap'),w/2,20)
}

function drawAMDvsNvidia(id){
const s=initCanvas(id,380);if(!s)return
const{ctx,w,h}=s
const left=100,right=30,top=40,bot=55
const cw=w-left-right,ch=h-top-bot
const products=[
{name:'H100',fp16:990,mem:80,tbw:3350,color:C.accent},
{name:'MI300X',fp16:1300,mem:192,tbw:5300,color:C.orange},
{name:'B200',fp16:2250,mem:192,tbw:8000,color:C.accent2},
{name:'MI325X',fp16:1300,mem:288,tbw:6000,color:C.red},
]
const metrics=[
{label:'FP16 PFLOPS',key:'fp16',max:2500},
{label:_S('HBM容量 GB', 'HBM Capacity (GB)'),key:'mem',max:300},
]
metrics.forEach((m,mi)=>{
const my=top+mi*ch/2
const mh=ch/2-20
products.forEach((p,pi)=>{
const bw=cw/products.length*0.6
const x=left+pi*cw/products.length+(cw/products.length-bw)/2
const bh=mh*p[m.key]/m.max
const by=my+mh-bh
roundedRect(ctx,x,by,bw,Math.max(bh,3),5)
const g=ctx.createLinearGradient(x,by,x,my+mh)
g.addColorStop(0,p.color);g.addColorStop(1,p.color+'30')
ctx.fillStyle=g;ctx.fill()
ctx.font='bold 9px Inter,sans-serif';ctx.fillStyle=p.color;ctx.textAlign='center'
ctx.fillText(p[m.key],x+bw/2,by-4)
})
ctx.font='bold 11px Inter,sans-serif';ctx.fillStyle=C.text2;ctx.textAlign='right'
ctx.fillText(m.label,left-8,my+mh/2+4)
ctx.strokeStyle=C.border;ctx.lineWidth=0.5
ctx.beginPath();ctx.moveTo(left,my+mh);ctx.lineTo(w-right,my+mh);ctx.stroke()
})
products.forEach((p,i)=>{
const x=left+i*cw/products.length+cw/products.length/2
ctx.font='8px Inter,sans-serif';ctx.fillStyle=p.color;ctx.textAlign='center'
ctx.fillText(p.name,x,top+ch+10)
})
ctx.font='bold 11px Inter,sans-serif';ctx.fillStyle=C.text2;ctx.textAlign='center'
ctx.fillText(_S('AMD Instinct vs NVIDIA 旗舰参数 (2024-2025)', 'AMD Instinct vs NVIDIA Flagship Specs (2024-2025)'),w/2,18)
}

function drawUALink(id){
const s=initCanvas(id,360);if(!s)return
const{ctx,w,h}=s
const cx=w/2,cy=h/2
const members=[
{name:'AMD',color:C.orange},
{name:'Broadcom',color:C.red},
{name:'Intel',color:C.cyan},
{name:'Google',color:C.green},
{name:'Microsoft',color:C.accent},
{name:'Meta',color:C.accent2},
{name:'HPE',color:C.purple},
]
const R=120
const circleColor=C.orange
members.forEach((m,i)=>{
const a=-Math.PI/2+Math.PI*2*i/members.length
const nx=cx+Math.cos(a)*R,ny=cy+Math.sin(a)*R
ctx.beginPath();ctx.arc(nx,ny,26,0,Math.PI*2)
ctx.fillStyle=m.color+'15';ctx.fill()
ctx.strokeStyle=m.color;ctx.lineWidth=1.5;ctx.stroke()
ctx.font='bold 9px Inter,sans-serif';ctx.fillStyle=m.color;ctx.textAlign='center'
ctx.fillText(m.name,nx,ny+3)
drawArrow(ctx,cx,cy,nx-Math.cos(a)*26,ny-Math.sin(a)*26,m.color+'40',0.8)
const na=members[(i+1)%members.length].angle
if(na!==undefined){
const mx=cx+Math.cos((a+na)/2)*R*0.5
ctx.font='italic 8px Inter,sans-serif';ctx.fillStyle=C.text3
}
})
ctx.beginPath();ctx.arc(cx,cy,35,0,Math.PI*2)
const g=ctx.createRadialGradient(cx,cy,0,cx,cy,35)
g.addColorStop(0,C.orange+'40');g.addColorStop(1,C.orange+'10')
ctx.fillStyle=g;ctx.fill();ctx.strokeStyle=C.orange;ctx.lineWidth=2;ctx.stroke()
ctx.font='bold 10px Inter,sans-serif';ctx.fillStyle=C.text;ctx.textAlign='center'
ctx.fillText('UALink',cx,cy-4);ctx.fillText(_S('联盟', 'Alliance'),cx,cy+9)
ctx.font='bold 11px Inter,sans-serif';ctx.fillStyle=C.text2;ctx.textAlign='center'
ctx.fillText(_S('Ultra Accelerator Link — 开放GPU互联标准挑战NVLink', 'Ultra Accelerator Link — Open GPU Interconnect Challenging NVLink'),w/2,20)
ctx.font='10px Inter,sans-serif';ctx.fillStyle=C.text3;ctx.textAlign='center'
ctx.fillText(_S('定义开放加速器互联规范 · 目标200GB/s单链路带宽 · 对标NVLink 6', 'Define open accelerator interconnect spec · Target 200GB/s per link bandwidth · Challenge NVLink 6'),w/2,cy+R+50)
ctx.fillText(_S('已排除NVIDIA | Cisco已加入 | 2026年商用', 'NVIDIA excluded | Cisco joined | Commercial by 2026'),w/2,cy+R+68)
}

function drawGaudiArch(id){
const s=initCanvas(id,380);if(!s)return
const{ctx,w,h}=s
const cx=w/2
const top=40
roundedRect(ctx,cx-200,top,400,40,8)
ctx.fillStyle=C.cyan+'20';ctx.fill();ctx.strokeStyle=C.cyan;ctx.lineWidth=2;ctx.stroke()
ctx.font='bold 13px Inter,sans-serif';ctx.fillStyle=C.cyan;ctx.textAlign='center'
ctx.fillText('Gaudi 3 — 5nm · 128GB HBM2e · 3.7 TB/s',cx,top+27)
const engines=[
{label:'Matrix\nEngine',sub:'2x Gaudi2\nFP8: 1.8P',color:C.cyan,x:cx-160,w:80},
{label:'TPC\n(Cores)',sub:_S('64个\nVLIW SIMD', '64\nVLIW SIMD'),color:C.green,x:cx-60,w:80},
{label:'Media\nEngine',sub:_S('编解码\n加速', 'Codec\nAcceleration'),color:C.orange,x:cx+40,w:80},
{label:'NIC ×24',sub:'200GbE\nRoCEv2',color:C.accent2,x:cx+140,w:80},
]
engines.forEach(e=>{
roundedRect(ctx,e.x,top+55,e.w,65,6)
ctx.fillStyle=e.color+'15';ctx.fill();ctx.strokeStyle=e.color;ctx.lineWidth=1.5;ctx.stroke()
ctx.font='bold 10px Inter,sans-serif';ctx.fillStyle=e.color;ctx.textAlign='center'
e.label.split('\n').forEach((l,i)=>ctx.fillText(l,e.x+e.w/2,top+70+i*14))
ctx.font='9px Inter,sans-serif';ctx.fillStyle=C.text3
e.sub.split('\n').forEach((l,i)=>ctx.fillText(l,e.x+e.w/2,top+100+i*12))
})
ctx.font='bold 12px Inter,sans-serif';ctx.fillStyle=C.text;ctx.textAlign='center'
ctx.fillText(_S('24× 200GbE RoCEv2 直连 → 替代 NVLink', '24× 200GbE RoCEv2 Direct Connect → Replacing NVLink'),cx,top+150)
ctx.font='11px Inter,sans-serif';ctx.fillStyle=C.text2
ctx.fillText(_S('每芯片集成了24个200GbE RoCEv2端口，支持全缩减(All-Reduce)硬件加速', '24x 200GbE RoCEv2 ports per chip, supporting hardware-accelerated All-Reduce'),cx,top+170)
ctx.fillText(_S('不需要专用交换芯片 → 以太网原生→大幅降低集群建设成本', 'No dedicated switch chip required → Native Ethernet → Drastically lowers cluster cost'),cx,top+190)
const rows=[
{icon:'✓',text:_S('Gaudi 3 BF16: 1.8 PFLOPS | 训练吞吐接近H100 80%', 'Gaudi 3 BF16: 1.8 PFLOPS | Training throughput close to 80% of H100'),y:230},
{icon:'✓',text:_S('24× 200GbE = 4.8 Tb/s 总网络带宽 | RDMA over Converged Ethernet', '24× 200GbE = 4.8 Tb/s Total Bandwidth | RDMA over Converged Ethernet'),y:252},
{icon:'✓',text:_S('OneAPI / SYCL → 跨架构统一编程', 'OneAPI / SYCL → Cross-architecture Unified Programming'),y:274},
{icon:'⚠',text:_S('生态尚弱: 算子覆盖度≈CUDA 30% | 框架适配需额外工程', 'Weak Ecosystem: Operator coverage ≈30% of CUDA | Extra engineering required'),y:296},
]
ctx.font='11px Inter,sans-serif';ctx.textAlign='left'
rows.forEach(r=>{
ctx.fillStyle=r.icon=== '✓'?C.green:C.orange;ctx.fillText(r.icon,30,r.y)
ctx.fillStyle=C.text2;ctx.fillText(r.text,50,r.y)
})
ctx.font='bold 11px Inter,sans-serif';ctx.fillStyle=C.cyan;ctx.textAlign='center'
ctx.fillText(_S('Gaudi 路线核心洞察：用标准以太网生态替代专有互联，但软件生态仍需5年追赶', 'Gaudi Core Insight: Standard Ethernet replaces proprietary interconnect, but software ecosystem needs 5 years to catch up.'),cx,340)
}

function drawEmergingCompare(id){
const s=initCanvas(id,420);if(!s)return
const{ctx,w,h}=s
const left=100,right=30,top=40,bot=55
const cw=w-left-right,ch=h-top-bot
const chips=[
{name:'Groq\nLPU',color:C.orange,cores:800,sram:230,proc:4},
{name:'Cerebras\nWSE-3',color:C.red,cores:900000,sram:44000,proc:5},
{name:'Tenstorrent\nBlackhole',color:C.accent2,cores:140,sram:128,proc:4},
{name:'Graphcore\nIPU C600',color:C.green,cores:1472,sram:900,proc:7},
{name:'SambaNova\nSN40L',color:C.cyan,cores:1040,sram:520,proc:5},
]
const metrics=[
{label:_S('片上核心数 (对数)', 'On-chip Cores (Log Scale)'),key:'cores',max:900000,log:true},
{label:_S('片上SRAM (MB)', 'On-chip SRAM (MB)'),key:'sram',max:45000},
]
metrics.forEach((m,mi)=>{
const my=top+mi*ch/2
const mh=ch/2-20
chips.forEach((c,ci)=>{
const bw=cw/chips.length*0.6
const x=left+ci*cw/chips.length+(cw/chips.length-bw)/2
let bh
if(m.log&&c[m.key]>0){
bh=mh*(Math.log10(c[m.key])/Math.log10(m.max))
}else{
bh=mh*c[m.key]/m.max
}
bh=Math.max(bh,3)
const by=my+mh-bh
roundedRect(ctx,x,by,bw,bh,4)
const g=ctx.createLinearGradient(x,by,x,my+mh)
g.addColorStop(0,c.color);g.addColorStop(1,c.color+'20')
ctx.fillStyle=g;ctx.fill()
ctx.font='bold 8px Inter,sans-serif';ctx.fillStyle=c.color;ctx.textAlign='center'
const val=c[m.key]
let txt=''
if(m.log){if(val>=1000000)txt=(val/1000000).toFixed(1)+'M';else if(val>=1000)txt=(val/1000).toFixed(1)+'K';else txt=val.toString()}
else txt=val.toString()
ctx.fillText(txt,x+bw/2,by-3)
})
ctx.font='bold 10px Inter,sans-serif';ctx.fillStyle=C.text2;ctx.textAlign='right'
ctx.fillText(m.label,left-8,my+mh/2+4)
ctx.strokeStyle=C.border;ctx.lineWidth=0.5
ctx.beginPath();ctx.moveTo(left,my+mh);ctx.lineTo(w-right,my+mh);ctx.stroke()
})
chips.forEach((c,i)=>{
const x=left+i*cw/chips.length+cw/chips.length/2
ctx.font='8px Inter,sans-serif';ctx.fillStyle=c.color;ctx.textAlign='center'
c.name.split('\n').forEach((l,li)=>ctx.fillText(l,x,top+ch+10+li*11))
})
ctx.font='bold 11px Inter,sans-serif';ctx.fillStyle=C.text2;ctx.textAlign='center'
ctx.fillText(_S('新兴AI芯片架构对比 (片上资源)', 'Emerging AI Chip Architecture Comparison (On-chip Resources)'),w/2,18)
}

function drawCudaMoat(id){
const s=initCanvas(id,380);if(!s)return
const{ctx,w,h}=s
const left=90,right=20,top=40,bot=55
const cw=w-left-right,ch=h-top-bot
const ecosystems=[
{name:'CUDA\n(NVIDIA)',devs:4.2,libraries:300,frameworks:95,market:92,color:C.accent},
{name:'ROCm\n(AMD)',devs:0.8,libraries:45,frameworks:70,market:7,color:C.orange},
{name:'SYCL/oneAPI\n(Intel)',devs:1.2,libraries:60,frameworks:55,market:6,color:C.cyan},
{name:'CANN\n(Huawei)',devs:0.3,libraries:20,frameworks:30,market:20,color:C.red},
]
const dims=[
{label:_S('开发者 (M)', 'Developers (M)'),key:'devs',max:5},
{label:_S('库数量 (x20)', 'Number of Libraries (x20)'),key:'libraries',max:400},
{label:_S('框架覆盖%', 'Framework Coverage %'),key:'frameworks',max:100},
]
dims.forEach((dim,di)=>{
const my=top+di*ch/3
const mh=ch/3
ecosystems.forEach((e,ei)=>{
const bw=cw/ecosystems.length*0.6
const x=left+ei*cw/ecosystems.length+(cw/ecosystems.length-bw)/2
const bh=mh*e[dim.key]/dim.max
const by=my+mh*0.9-bh
roundRect2(ctx,x,by,bw,Math.max(bh,3),4,e.color)
ctx.font='bold 8px Inter,sans-serif';ctx.fillStyle=e.color;ctx.textAlign='center'
let txt=e[dim.key]
if(dim.key==='libraries')txt=txt*20
if(dim.key==='devs')txt=txt.toFixed(1)+'M'
else if(typeof txt==='number')txt=Math.round(txt).toString()
ctx.fillText(txt,x+bw/2,by-3)
})
ctx.font='10px Inter,sans-serif';ctx.fillStyle=C.text2;ctx.textAlign='right'
ctx.fillText(dim.label,left-8,my+mh/2)
if(di<dims.length-1){
ctx.strokeStyle=C.border;ctx.lineWidth=0.5
ctx.beginPath();ctx.moveTo(left,my+mh*0.9);ctx.lineTo(w-right,my+mh*0.9);ctx.stroke()
}
})
ecosystems.forEach((e,i)=>{
const x=left+i*cw/ecosystems.length+cw/ecosystems.length/2
ctx.font='8px Inter,sans-serif';ctx.fillStyle=e.color;ctx.textAlign='center'
e.name.split('\n').forEach((l,li)=>ctx.fillText(l,x,top+ch+12+li*10))
})
ctx.font='bold 11px Inter,sans-serif';ctx.fillStyle=C.text2;ctx.textAlign='center'
ctx.fillText(_S('AI芯片软件生态对比 — CUDA护城河', 'AI Chip Software Ecosystem Comparison — CUDA Moat'),w/2,18)
}

function roundRect2(ctx,x,y,w,h,r,color){
roundedRect(ctx,x,y,w,h,r)
const g=ctx.createLinearGradient(x,y,x,y+h)
g.addColorStop(0,color);g.addColorStop(1,color+'20')
ctx.fillStyle=g;ctx.fill()
}

function drawFrameworkMatrix(id){
const s=initCanvas(id,420);if(!s)return
const{ctx,w,h}=s
const frameworks=['PyTorch','TensorFlow','JAX','ONNX\nRuntime','vLLM','OpenXLA','Mind-\nSpore','Paddle-\nPaddle']
const platforms=['CUDA','ROCm','SYCL','CANN','OpenCL']
const matrix=[
[5,4,4,5,5,5,0,0],
[4,3,3,4,3,2,0,0],
[3,3,2,3,2,2,0,0],
[0,0,0,1,0,0,5,4],
[2,1,1,2,1,1,0,0],
]
const left=90,right=20,top=50,bot=50
const cw=w-left-right,ch=h-top-bot
const cellW=cw/frameworks.length
const cellH=ch/platforms.length
ctx.font='10px Inter,sans-serif';ctx.fillStyle=C.text3;ctx.textAlign='center'
frameworks.forEach((f,i)=>{
const lines=f.split('\n')
lines.forEach((l,li)=>ctx.fillText(l,left+i*cellW+cellW/2,top-8+li*12))
})
platforms.forEach((p,i)=>{
ctx.font='9px Inter,sans-serif';ctx.fillStyle=C.text2;ctx.textAlign='right'
ctx.fillText(p,left-8,top+i*cellH+cellH/2+3)
})
const colors=['#ef444460','#f59e0b60','#fbbf2460','#10b98160','#3b82f660']
for(let r=0;r<platforms.length;r++){
for(let c=0;c<frameworks.length;c++){
const v=matrix[r][c]
if(v>0){
roundedRect(ctx,left+c*cellW+4,top+r*cellH+4,cellW-8,cellH-8,4)
ctx.fillStyle=colors[v-1];ctx.fill()
ctx.font='bold 10px Inter,sans-serif';ctx.fillStyle=C.text;ctx.textAlign='center'
ctx.fillText('★★★★★'.slice(0,v),left+c*cellW+cellW/2,top+r*cellH+cellH/2+3)
}else{
ctx.font='9px Inter,sans-serif';ctx.fillStyle=C.text3;ctx.textAlign='center'
ctx.fillText('—',left+c*cellW+cellW/2,top+r*cellH+cellH/2+3)
}
}
}
ctx.font='bold 11px Inter,sans-serif';ctx.fillStyle=C.text2;ctx.textAlign='center'
ctx.fillText(_S('AI框架 × 加速平台兼容性矩阵 (★越多支持越好)', 'AI Framework × Accel Platform Compatibility Matrix (★ More is better)'),w/2,20)
}

function drawRingTopology(ctx, x, y, w, h) {
  const cx = x + w / 2;
  const cy = y + h / 2 - 5;
  const r = Math.min(w, h) * 0.32;
  const nodes = 5;
  
  ctx.font = 'bold 11px Inter,sans-serif';
  ctx.fillStyle = C.text;
  ctx.textAlign = 'center';
  ctx.fillText(_S('环形拓扑 (Ring)', 'Ring Topology'), cx, y + 10);
  
  ctx.strokeStyle = C.border;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  
  const pts = [];
  for (let i = 0; i < nodes; i++) {
    const angle = (i * Math.PI * 2) / nodes - Math.PI / 2;
    pts.push({
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle)
    });
  }
  
  for (let i = 0; i < nodes; i++) {
    const next = (i + 1) % nodes;
    const hx = pts[i].x + (pts[next].x - pts[i].x) * 0.55;
    const hy = pts[i].y + (pts[next].y - pts[i].y) * 0.55;
    drawArrow(ctx, pts[i].x, pts[i].y, hx, hy, C.green, 1);
  }
  
  pts.forEach((pt, i) => {
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 9, 0, Math.PI * 2);
    ctx.fillStyle = C.surface2;
    ctx.fill();
    ctx.strokeStyle = C.green;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    ctx.font = 'bold 8px Inter,sans-serif';
    ctx.fillStyle = C.text;
    ctx.textAlign = 'center';
    ctx.fillText('G' + i, pt.x, pt.y + 3);
  });
}

function drawTreeTopology(ctx, x, y, w, h) {
  const cx = x + w / 2;
  const cy = y + h / 2 - 5;
  
  ctx.font = 'bold 11px Inter,sans-serif';
  ctx.fillStyle = C.text;
  ctx.textAlign = 'center';
  ctx.fillText(_S('双二叉树拓扑 (Tree)', 'Tree Topology'), cx, y + 10);
  
  const l0 = { x: cx, y: cy - 25 };
  const l1_0 = { x: cx - 22, y: cy - 2 };
  const l1_1 = { x: cx + 22, y: cy - 2 };
  const l2_0 = { x: cx - 35, y: cy + 22 };
  const l2_1 = { x: cx - 12, y: cy + 22 };
  const l2_2 = { x: cx + 12, y: cy + 22 };
  const l2_3 = { x: cx + 35, y: cy + 22 };
  
  ctx.strokeStyle = C.border;
  ctx.lineWidth = 1;
  const drawLink = (p1, p2) => {
    ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
  };
  drawLink(l0, l1_0); drawLink(l0, l1_1);
  drawLink(l1_0, l2_0); drawLink(l1_0, l2_1);
  drawLink(l1_1, l2_2); drawLink(l1_1, l2_3);
  
  const nodes = [
    { pt: l0, name: 'G0', root: true },
    { pt: l1_0, name: 'G1' }, { pt: l1_1, name: 'G2' },
    { pt: l2_0, name: 'G3' }, { pt: l2_1, name: 'G4' },
    { pt: l2_2, name: 'G5' }, { pt: l2_3, name: 'G6' }
  ];
  
  nodes.forEach(n => {
    ctx.beginPath();
    ctx.arc(n.pt.x, n.pt.y, 8, 0, Math.PI * 2);
    ctx.fillStyle = C.surface2;
    ctx.fill();
    ctx.strokeStyle = n.root ? C.accent2 : C.accent;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    ctx.font = 'bold 7px Inter,sans-serif';
    ctx.fillStyle = C.text;
    ctx.textAlign = 'center';
    ctx.fillText(n.name, n.pt.x, n.pt.y + 2.5);
  });
}

function drawRHDTopology(ctx, x, y, w, h) {
  const cx = x + w / 2;
  const cy = y + h / 2 - 5;
  
  ctx.font = 'bold 11px Inter,sans-serif';
  ctx.fillStyle = C.text;
  ctx.textAlign = 'center';
  ctx.fillText(_S('递归折半倍增 (RHD)', 'RHD Topology'), cx, y + 10);
  
  const n0 = { x: cx - 22, y: cy - 20 };
  const n1 = { x: cx + 22, y: cy - 20 };
  const n2 = { x: cx - 22, y: cy + 18 };
  const n3 = { x: cx + 22, y: cy + 18 };
  
  ctx.strokeStyle = C.border;
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 2]);
  ctx.beginPath(); ctx.moveTo(n0.x, n0.y); ctx.lineTo(n1.x, n1.y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(n2.x, n2.y); ctx.lineTo(n3.x, n3.y); ctx.stroke();
  
  ctx.strokeStyle = C.accent2 + '50';
  ctx.beginPath(); ctx.moveTo(n0.x, n0.y); ctx.lineTo(n2.x, n2.y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(n1.x, n1.y); ctx.lineTo(n3.x, n3.y); ctx.stroke();
  ctx.setLineDash([]);
  
  drawArrow(ctx, n0.x + 8, n0.y, n1.x - 8, n1.y, C.orange, 1);
  drawArrow(ctx, n1.x - 8, n1.y, n0.x + 8, n0.y, C.orange, 1);
  drawArrow(ctx, n2.x + 8, n2.y, n3.x - 8, n3.y, C.orange, 1);
  drawArrow(ctx, n3.x - 8, n3.y, n2.x + 8, n2.y, C.orange, 1);
  
  const nodes = [
    { pt: n0, name: 'G0' }, { pt: n1, name: 'G1' },
    { pt: n2, name: 'G2' }, { pt: n3, name: 'G3' }
  ];
  
  nodes.forEach(n => {
    ctx.beginPath();
    ctx.arc(n.pt.x, n.pt.y, 9, 0, Math.PI * 2);
    ctx.fillStyle = C.surface2;
    ctx.fill();
    ctx.strokeStyle = C.orange;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    ctx.font = 'bold 8px Inter,sans-serif';
    ctx.fillStyle = C.text;
    ctx.textAlign = 'center';
    ctx.fillText(n.name, n.pt.x, n.pt.y + 3);
  });
}

function drawMetricCard(ctx, x, y, w, h, title, titleColor, metrics) {
  roundedRect(ctx, x, y, w, h, 8);
  ctx.fillStyle = C.surface;
  ctx.fill();
  ctx.strokeStyle = C.border;
  ctx.lineWidth = 1;
  ctx.stroke();
  
  ctx.font = 'bold 11px Inter,sans-serif';
  ctx.fillStyle = titleColor;
  ctx.textAlign = 'center';
  ctx.fillText(title, x + w / 2, y + 16);
  
  ctx.strokeStyle = C.border;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(x + 10, y + 24);
  ctx.lineTo(x + w - 10, y + 24);
  ctx.stroke();
  
  metrics.forEach((m, idx) => {
    const my = y + 38 + idx * 24;
    ctx.font = '9px Inter,sans-serif';
    ctx.fillStyle = C.text3;
    ctx.textAlign = 'left';
    ctx.fillText(m.label, x + 10, my);
    
    ctx.font = 'bold 9px Inter,sans-serif';
    ctx.fillStyle = m.color || C.text;
    ctx.textAlign = 'right';
    ctx.fillText(m.val, x + w - 10, my);
  });
}

function drawAllReduce(id) {
  const s = initCanvas(id, 380); if (!s) return;
  const { ctx, w, h } = s;
  const cx = w / 2;
  const colW = w / 3;
  const colY = 40;
  const diagramH = 120;
  
  ctx.font = 'bold 12px Inter,sans-serif';
  ctx.fillStyle = C.text2;
  ctx.textAlign = 'center';
  ctx.fillText(_S('All-Reduce 核心算法拓扑与通信复杂度对比', 'All-Reduce Algorithms Topology & Communication Complexity'), cx, 20);

  drawRingTopology(ctx, colW * 0 + 10, colY, colW - 20, diagramH);
  drawTreeTopology(ctx, colW * 1 + 10, colY, colW - 20, diagramH);
  drawRHDTopology(ctx, colW * 2 + 10, colY, colW - 20, diagramH);
  
  ctx.strokeStyle = C.border;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(20, colY + diagramH + 10);
  ctx.lineTo(w - 20, colY + diagramH + 10);
  ctx.stroke();
  
  const metricY = colY + diagramH + 25;
  
  drawMetricCard(ctx, colW * 0 + 10, metricY, colW - 20, 130, 'Ring All-Reduce', C.green, [
    { label: _S('延迟步数', 'Latency Steps'), val: '2(N-1) → O(N)', color: C.red },
    { label: _S('带宽效率', 'Bandwidth Eff.'), val: '~100%', color: C.green },
    { label: _S('通信量/卡', 'Volume / GPU'), val: '2(N-1)/N · D', color: C.text2 },
    { label: _S('最适规模', 'Best Scale'), val: _S('大消息 / <512卡', 'Large Msg / <512 GPUs'), color: C.accent }
  ]);

  drawMetricCard(ctx, colW * 1 + 10, metricY, colW - 20, 130, 'Tree All-Reduce', C.accent, [
    { label: _S('延迟步数', 'Latency Steps'), val: '2·log₂(N) → O(log N)', color: C.green },
    { label: _S('带宽效率', 'Bandwidth Eff.'), val: '~50% (双树可优化)', color: C.orange },
    { label: _S('通信量/卡', 'Volume / GPU'), val: '2 · D', color: C.text2 },
    { label: _S('最适规模', 'Best Scale'), val: _S('小消息 / >1000卡', 'Small Msg / >1000 GPUs'), color: C.accent }
  ]);

  drawMetricCard(ctx, colW * 2 + 10, metricY, colW - 20, 130, 'Recursive H-D', C.orange, [
    { label: _S('延迟步数', 'Latency Steps'), val: '2·log₂(N) → O(log N)', color: C.green },
    { label: _S('带宽效率', 'Bandwidth Eff.'), val: '波动的步进效率', color: C.orange },
    { label: _S('通信量/卡', 'Volume / GPU'), val: '2 · D', color: C.text2 },
    { label: _S('最适规模', 'Best Scale'), val: _S('2的幂次方卡集群', '2^k GPU Clusters'), color: C.accent }
  ]);
}

function drawInterconnectWall(id) {
  const s = initCanvas(id, 360); if (!s) return;
  const { ctx, w, h } = s;
  
  const padding = 20;
  const colW = (w - padding * 3) / 2;
  const colH = 160;
  const colY = 40;
  
  // Left col
  const lx = padding;
  roundedRect(ctx, lx, colY, colW, colH, 8);
  ctx.fillStyle = C.surface2; ctx.fill();
  ctx.strokeStyle = C.border; ctx.stroke();
  
  // Right col
  const rx = padding * 2 + colW;
  roundedRect(ctx, rx, colY, colW, colH, 8);
  ctx.fillStyle = C.surface2; ctx.fill();
  ctx.strokeStyle = C.border; ctx.stroke();
  
  // Titles
  ctx.font = 'bold 13px Inter, sans-serif';
  ctx.fillStyle = C.accent; ctx.textAlign = 'center';
  ctx.fillText('NVIDIA NVLink 5 & NVSwitch 5', lx + colW/2, colY + 22);
  ctx.fillStyle = C.orange;
  ctx.fillText(_S('国产主流 HCCS / 片间环网', 'Domestic HCCS / Ring Mesh'), rx + colW/2, colY + 22);
  
  // Draw nodes for NVLink (fully connected mesh)
  const lcx = lx + colW/2, lcy = colY + colH/2 + 10;
  const numNodes = 6;
  const nodesL = [];
  const radius = 35;
  for (let i = 0; i < numNodes; i++) {
    const angle = (i * 2 * Math.PI) / numNodes;
    nodesL.push({ x: lcx + radius * Math.cos(angle), y: lcy + radius * Math.sin(angle) });
  }
  // Draw all-to-all connection lines
  ctx.lineWidth = 1;
  for (let i = 0; i < numNodes; i++) {
    for (let j = i + 1; j < numNodes; j++) {
      ctx.strokeStyle = C.accent + '40';
      ctx.beginPath(); ctx.moveTo(nodesL[i].x, nodesL[i].y); ctx.lineTo(nodesL[j].x, nodesL[j].y); ctx.stroke();
    }
  }
  // Draw node points
  nodesL.forEach(n => {
    ctx.beginPath(); ctx.arc(n.x, n.y, 4, 0, Math.PI*2);
    ctx.fillStyle = C.cyan; ctx.fill();
    ctx.strokeStyle = C.accent; ctx.stroke();
  });
  
  // Draw nodes for HCCS (Ring mesh)
  const rcx = rx + colW/2, rcy = colY + colH/2 + 10;
  const nodesR = [];
  for (let i = 0; i < numNodes; i++) {
    const angle = (i * 2 * Math.PI) / numNodes;
    nodesR.push({ x: rcx + radius * Math.cos(angle), y: rcy + radius * Math.sin(angle) });
  }
  // Draw ring-only connections
  for (let i = 0; i < numNodes; i++) {
    const nextNode = nodesR[(i + 1) % numNodes];
    ctx.strokeStyle = C.orange + '90';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(nodesR[i].x, nodesR[i].y); ctx.lineTo(nextNode.x, nextNode.y); ctx.stroke();
  }
  // Draw node points
  nodesR.forEach(n => {
    ctx.beginPath(); ctx.arc(n.x, n.y, 4, 0, Math.PI*2);
    ctx.fillStyle = C.yellow; ctx.fill();
    ctx.strokeStyle = C.orange; ctx.stroke();
  });
  
  // Stats below drawings
  ctx.font = '11px Inter, sans-serif'; ctx.fillStyle = C.text2;
  ctx.fillText(_S('双向片间带宽: 1.8 TB/s', 'Bi-dir Bandwidth: 1.8 TB/s'), lx + colW/2, colY + colH - 25);
  ctx.fillText(_S('无损互连域: 576 GPUs', 'Non-blocking Domain: 576 GPUs'), lx + colW/2, colY + colH - 10);
  
  ctx.fillText(_S('双向片间带宽: 160-240 GB/s', 'Bi-dir Bandwidth: 160-240 GB/s'), rx + colW/2, colY + colH - 25);
  ctx.fillText(_S('瓶颈互连域: 8-16/32 GPUs', 'Bottleneck Scale: 8-32 GPUs'), rx + colW/2, colY + colH - 10);
  
  // Lower part: Comparison line chart (Scaling efficiency vs cluster size)
  const chartY = colY + colH + 30;
  const chartH = h - chartY - 45;
  const chartW = w - padding * 2;
  const clx = padding;
  
  ctx.strokeStyle = C.border; ctx.lineWidth = 0.5;
  ctx.beginPath(); ctx.moveTo(clx, chartY); ctx.lineTo(clx + chartW, chartY); ctx.stroke();
  
  // Draw chart axes
  ctx.strokeStyle = C.text3; ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(clx + 40, chartY);
  ctx.lineTo(clx + 40, chartY + chartH);
  ctx.lineTo(clx + chartW, chartY + chartH);
  ctx.stroke();
  
  // Axis titles
  ctx.font = '10px Inter, sans-serif'; ctx.fillStyle = C.text3; ctx.textAlign = 'left';
  ctx.fillText(_S('扩展效率 (%)', 'Scaling Efficiency (%)'), clx + 5, chartY - 5);
  ctx.textAlign = 'right';
  ctx.fillText(_S('集群芯片数量', 'Cluster GPU Count'), clx + chartW, chartY + chartH + 35);
  
  // Grid lines & labels
  const points = [8, 32, 64, 128, 256, 512];
  const nvPoints = [98, 97, 96, 95, 93, 91];
  const cnPoints = [85, 78, 68, 55, 42, 28];
  
  ctx.textAlign = 'center';
  points.forEach((pt, i) => {
    const x = clx + 60 + (i * (chartW - 80)) / (points.length - 1);
    ctx.fillText(pt, x, chartY + chartH + 15);
    ctx.beginPath(); ctx.moveTo(x, chartY + chartH); ctx.lineTo(x, chartY + chartH - 4); ctx.strokeStyle = C.text3; ctx.stroke();
  });
  
  ctx.textAlign = 'right';
  [100, 75, 50, 25].forEach(val => {
    const y = chartY + chartH * (1 - val/100);
    ctx.fillText(val + '%', clx + 32, y + 4);
    ctx.beginPath(); ctx.moveTo(clx + 36, y); ctx.lineTo(clx + 40, y); ctx.strokeStyle = C.text3; ctx.stroke();
  });
  
  // Plot curves
  function drawCurve(pts, color, label) {
    ctx.beginPath();
    pts.forEach((val, i) => {
      const x = clx + 60 + (i * (chartW - 80)) / (pts.length - 1);
      const y = chartY + chartH * (1 - val/100);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.stroke();
    
    // Draw dots
    pts.forEach((val, i) => {
      const x = clx + 60 + (i * (chartW - 80)) / (pts.length - 1);
      const y = chartY + chartH * (1 - val/100);
      ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI*2);
      ctx.fillStyle = color; ctx.fill();
    });
    
    // Draw curve label at the end
    const lastX = clx + 60 + (pts.length - 1) * (chartW - 80) / (pts.length - 1);
    const lastY = chartY + chartH * (1 - pts[pts.length - 1]/100);
    ctx.font = 'bold 9px Inter, sans-serif'; ctx.fillStyle = color; ctx.textAlign = 'left';
    ctx.fillText(label, lastX + 5, lastY + 3);
  }
  
  drawCurve(nvPoints, C.accent, 'NVIDIA NVLink');
  drawCurve(cnPoints, C.orange, _S('自研/低速环网', 'HCCS / Ring'));
}

function drawMemoryPackagingGap(id) {
  const s = initCanvas(id, 380); if (!s) return;
  const { ctx, w, h } = s;
  
  const padding = 20;
  const colW = (w - padding * 3) / 2;
  const colH = 170;
  const colY = 40;
  
  // Left Panel: CoWoS silicon interposer
  const lx = padding;
  roundedRect(ctx, lx, colY, colW, colH, 8);
  ctx.fillStyle = C.surface2; ctx.fill();
  ctx.strokeStyle = C.border; ctx.stroke();
  
  // Right Panel: Organic substrate
  const rx = padding * 2 + colW;
  roundedRect(ctx, rx, colY, colW, colH, 8);
  ctx.fillStyle = C.surface2; ctx.fill();
  ctx.strokeStyle = C.border; ctx.stroke();
  
  // Titles
  ctx.font = 'bold 12.5px Inter, sans-serif';
  ctx.fillStyle = C.cyan; ctx.textAlign = 'center';
  ctx.fillText('TSMC CoWoS 2.5D Packaging', lx + colW/2, colY + 22);
  ctx.fillStyle = C.accent2;
  ctx.fillText(_S('国内有机/替代封装工艺', 'Organic Substrate'), rx + colW/2, colY + 22);
  
  const drawSiliconInterposer = (ox) => {
    // 1. Organic Substrate (bottom)
    ctx.fillStyle = '#1e293b';
    roundedRect(ctx, ox + 15, colY + 120, colW - 30, 20, 3); ctx.fill();
    ctx.font = 'bold 9px Inter, sans-serif'; ctx.fillStyle = '#94a3b8';
    ctx.fillText(_S('基板 (Substrate)', 'Organic Substrate'), ox + colW/2, colY + 133);
    
    // 2. Silicon Interposer (middle)
    ctx.fillStyle = C.cyan + '30';
    roundedRect(ctx, ox + 25, colY + 85, colW - 50, 15, 2); ctx.fill();
    ctx.strokeStyle = C.cyan; ctx.lineWidth = 1; ctx.stroke();
    ctx.font = '8px Inter, sans-serif'; ctx.fillStyle = C.cyan;
    ctx.fillText(_S('硅中介层 (Silicon Interposer)', 'Silicon Interposer'), ox + colW/2, colY + 95);
    
    // 3. Dense microbumps
    ctx.lineWidth = 1; ctx.strokeStyle = C.text2;
    for (let i = 0; i < 15; i++) {
      const bx = ox + 35 + (i * (colW - 70)) / 14;
      ctx.beginPath(); ctx.moveTo(bx, colY + 100); ctx.lineTo(bx, colY + 120); ctx.stroke();
    }
    
    // 4. HBM & Logic Die on top
    // Logic Die (center)
    ctx.fillStyle = C.accent + '60';
    roundedRect(ctx, ox + colW/2 - 25, colY + 50, 50, 20, 2); ctx.fill();
    ctx.strokeStyle = C.accent; ctx.stroke();
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 8px Inter, sans-serif';
    ctx.fillText('Logic', ox + colW/2, colY + 62);
    
    // HBM Die (left)
    ctx.fillStyle = C.green + '60';
    roundedRect(ctx, ox + colW/2 - 75, colY + 50, 40, 20, 2); ctx.fill();
    ctx.strokeStyle = C.green; ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.fillText('HBM3e', ox + colW/2 - 55, colY + 62);
    
    // HBM Die (right)
    ctx.fillStyle = C.green + '60';
    roundedRect(ctx, ox + colW/2 + 35, colY + 50, 40, 20, 2); ctx.fill();
    ctx.strokeStyle = C.green; ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.fillText('HBM3e', ox + colW/2 + 55, colY + 62);
    
    // 5. High-density TSVs
    ctx.strokeStyle = C.cyan; ctx.lineWidth = 0.8;
    for (let i = 0; i < 28; i++) {
      const bx = ox + colW/2 - 70 + (i * 140) / 27;
      ctx.beginPath(); ctx.moveTo(bx, colY + 70); ctx.lineTo(bx, colY + 85); ctx.stroke();
    }
    
    ctx.fillStyle = C.green; ctx.font = 'bold 9px Inter, sans-serif';
    ctx.fillText(_S('超高密度微凸块 (Pitch < 55μm)', 'Ultra Dense Microbumps (< 55μm)'), ox + colW/2, colY + 42);
  }
  
  const drawOrganicSubstrateGap = (ox) => {
    // 1. Organic Substrate (bottom)
    ctx.fillStyle = '#1e293b';
    roundedRect(ctx, ox + 15, colY + 120, colW - 30, 20, 3); ctx.fill();
    ctx.font = 'bold 9px Inter, sans-serif'; ctx.fillStyle = '#94a3b8';
    ctx.fillText(_S('基板 (Substrate)', 'Organic Substrate'), ox + colW/2, colY + 133);
    
    // 2. Coarse packaging interface
    ctx.fillStyle = C.accent2 + '15';
    roundedRect(ctx, ox + 25, colY + 85, colW - 50, 15, 2); ctx.fill();
    ctx.strokeStyle = C.accent2; ctx.lineWidth = 1; ctx.stroke();
    ctx.font = '8px Inter, sans-serif'; ctx.fillStyle = C.accent2;
    ctx.fillText(_S('有机中介层 (Organic Carrier)', 'Organic Substrate Carrier'), ox + colW/2, colY + 95);
    
    // 3. Coarse bumps
    ctx.lineWidth = 1.2; ctx.strokeStyle = C.text2;
    for (let i = 0; i < 8; i++) {
      const bx = ox + 35 + (i * (colW - 70)) / 7;
      ctx.beginPath(); ctx.moveTo(bx, colY + 100); ctx.lineTo(bx, colY + 120); ctx.stroke();
    }
    
    // 4. Dual Dies on top
    ctx.fillStyle = C.accent2 + '50';
    roundedRect(ctx, ox + colW/2 - 70, colY + 50, 65, 20, 2); ctx.fill();
    ctx.strokeStyle = C.accent2; ctx.stroke();
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 8px Inter, sans-serif';
    ctx.fillText('Die A', ox + colW/2 - 38, colY + 62);
    
    roundedRect(ctx, ox + colW/2 + 5, colY + 50, 65, 20, 2); ctx.fill();
    ctx.strokeStyle = C.accent2; ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Die B', ox + colW/2 + 38, colY + 62);
    
    // 5. Coarser copper bumps
    ctx.strokeStyle = C.accent2; ctx.lineWidth = 1.5;
    for (let i = 0; i < 12; i++) {
      const bx = ox + colW/2 - 65 + (i * 130) / 11;
      ctx.beginPath(); ctx.moveTo(bx, colY + 70); ctx.lineTo(bx, colY + 85); ctx.stroke();
    }
    
    ctx.fillStyle = C.red; ctx.font = 'bold 9px Inter, sans-serif';
    ctx.fillText(_S('粗糙铜柱走线 (Pitch > 100μm)', 'Coarser Bumps (Pitch > 100μm)'), ox + colW/2, colY + 42);
  }
  
  drawSiliconInterposer(lx);
  drawOrganicSubstrateGap(rx);
  
  // Bottom Part: Bandwidth comparison
  const barY = colY + colH + 30;
  const barH = h - barY - 40;
  const barW = w - padding * 2;
  const clx = padding;
  
  ctx.strokeStyle = C.border; ctx.lineWidth = 0.5;
  ctx.beginPath(); ctx.moveTo(clx, barY); ctx.lineTo(clx + barW, barY); ctx.stroke();
  
  ctx.font = 'bold 11px Inter, sans-serif'; ctx.fillStyle = C.text; ctx.textAlign = 'left';
  ctx.fillText(_S('显存带宽对比 (HBM Bandwidth Comparison)', 'HBM Bandwidth Comparison (TB/s)'), clx + 10, barY + 20);
  
  const drawBar = (by, label, val, maxVal, color) => {
    ctx.font = '10px Inter, sans-serif'; ctx.fillStyle = C.text2; ctx.textAlign = 'left';
    ctx.fillText(label, clx + 10, by + 12);
    
    const maxBarW = barW - 180;
    const currentBarW = maxBarW * (val / maxVal);
    roundedRect(ctx, clx + 100, by + 3, currentBarW, 12, 3);
    ctx.fillStyle = color; ctx.fill();
    
    ctx.font = 'bold 10px Inter, sans-serif'; ctx.fillStyle = color;
    ctx.fillText(val + ' TB/s', clx + 110 + currentBarW, by + 12);
  }
  
  drawBar(barY + 35, 'NVIDIA B200', 8.0, 8.0, C.cyan);
  drawBar(barY + 55, 'NVIDIA H100', 3.35, 8.0, C.accent);
  drawBar(barY + 75, _S('国产自研芯片 (昇腾等)', 'Domestic (Ascend/Kunlun)'), 1.6, 8.0, C.orange);
}

function drawProcessPowerWall(id) {
  const s = initCanvas(id, 360); if (!s) return;
  const { ctx, w, h } = s;
  
  const padding = 20;
  const colW = (w - padding * 3) / 2;
  const colH = 150;
  const colY = 40;
  
  // Left col
  const lx = padding;
  roundedRect(ctx, lx, colY, colW, colH, 8);
  ctx.fillStyle = C.surface2; ctx.fill();
  ctx.strokeStyle = C.border; ctx.stroke();
  
  // Right col
  const rx = padding * 2 + colW;
  roundedRect(ctx, rx, colY, colW, colH, 8);
  ctx.fillStyle = C.surface2; ctx.fill();
  ctx.strokeStyle = C.border; ctx.stroke();
  
  // Titles
  ctx.font = 'bold 12.5px Inter, sans-serif';
  ctx.fillStyle = C.green; ctx.textAlign = 'center';
  ctx.fillText('TSMC 4NP Monolithic (104B Tr)', lx + colW/2, colY + 22);
  ctx.fillStyle = C.red;
  ctx.fillText(_S('SMIC N+2 Dual-Die Chiplet', 'SMIC N+2 Dual-Die Chiplet'), rx + colW/2, colY + 22);
  
  const drawBlackwellDie = (ox) => {
    const dcx = ox + colW/2, dcy = colY + colH/2 + 10;
    const dw = 75, dh = 75;
    
    roundedRect(ctx, dcx - dw/2, dcy - dh/2, dw, dh, 4);
    const grad = ctx.createLinearGradient(dcx - dw/2, dcy - dh/2, dcx + dw/2, dcy + dh/2);
    grad.addColorStop(0, C.accent + '60');
    grad.addColorStop(1, C.cyan + '60');
    ctx.fillStyle = grad; ctx.fill();
    ctx.strokeStyle = C.cyan; ctx.lineWidth = 1.5; ctx.stroke();
    
    ctx.strokeStyle = '#ffffff30'; ctx.lineWidth = 1;
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath(); ctx.moveTo(dcx - dw/2 + (i * dw) / 4, dcy - dh/2); ctx.lineTo(dcx - dw/2 + (i * dw) / 4, dcy + dh/2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(dcx - dw/2, dcy - dh/2 + (i * dh) / 4); ctx.lineTo(dcx + dw/2, dcy - dh/2 + (i * dh) / 4); ctx.stroke();
    }
    
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 9px Inter, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('104B Transistors', dcx, dcy - 5);
    ctx.fillStyle = C.cyan; ctx.font = '8px Inter, sans-serif';
    ctx.fillText(_S('100% 能效比', '100% Energy Eff.'), dcx, dcy + 10);
  }
  
  const drawDomesticDie = (ox) => {
    const dcx = ox + colW/2, dcy = colY + colH/2 + 10;
    const dw = 42, dh = 70;
    
    roundedRect(ctx, dcx - dw - 2, dcy - dh/2, dw, dh, 3);
    ctx.fillStyle = C.red + '35'; ctx.fill();
    ctx.strokeStyle = C.red; ctx.lineWidth = 1; ctx.stroke();
    
    roundedRect(ctx, dcx + 2, dcy - dh/2, dw, dh, 3);
    ctx.fillStyle = C.red + '35'; ctx.fill();
    ctx.strokeStyle = C.red; ctx.lineWidth = 1; ctx.stroke();
    
    ctx.strokeStyle = C.orange; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(dcx, dcy - dh/3); ctx.lineTo(dcx, dcy + dh/3); ctx.stroke();
    
    ctx.fillStyle = C.orange;
    ctx.beginPath(); ctx.arc(dcx, dcy, 3, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(dcx, dcy - 12, 2.5, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(dcx, dcy + 12, 2.5, 0, Math.PI*2); ctx.fill();
    
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 9px Inter, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('53B + 53B Die', dcx, dcy - 5);
    ctx.fillStyle = C.orange; ctx.font = '8px Inter, sans-serif';
    ctx.fillText(_S('+60% 功耗与热损', '+60% Power Loss'), dcx, dcy + 10);
  }
  
  drawBlackwellDie(lx);
  drawDomesticDie(rx);
  
  // Bottom Part: Transistor density
  const barY = colY + colH + 25;
  const barH = h - barY - 40;
  const barW = w - padding * 2;
  const clx = padding;
  
  ctx.strokeStyle = C.border; ctx.lineWidth = 0.5;
  ctx.beginPath(); ctx.moveTo(clx, barY); ctx.lineTo(clx + barW, barY); ctx.stroke();
  
  ctx.font = 'bold 11px Inter, sans-serif'; ctx.fillStyle = C.text; ctx.textAlign = 'left';
  ctx.fillText(_S('晶体管密度对比 (Transistor Density MTr/mm²)', 'Transistor Density Comparison (MTr/mm²)'), clx + 10, barY + 20);
  
  const drawBar = (by, label, val, maxVal, color) => {
    ctx.font = '10px Inter, sans-serif'; ctx.fillStyle = C.text2; ctx.textAlign = 'left';
    ctx.fillText(label, clx + 10, by + 12);
    
    const maxBarW = barW - 200;
    const currentBarW = maxBarW * (val / maxVal);
    roundedRect(ctx, clx + 120, by + 3, currentBarW, 12, 3);
    ctx.fillStyle = color; ctx.fill();
    
    ctx.font = 'bold 10px Inter, sans-serif'; ctx.fillStyle = color;
    ctx.fillText(val + ' M/mm²', clx + 130 + currentBarW, by + 12);
  }
  
  drawBar(barY + 35, 'TSMC 3nm (Rubin Target)', 220, 220, C.green);
  drawBar(barY + 55, 'TSMC 4NP (Blackwell)', 150, 220, C.accent);
  drawBar(barY + 75, _S('SMIC N+2 (~7nm等效)', 'SMIC N+2 (~7nm equivalent)'), 48, 220, C.red);
}
