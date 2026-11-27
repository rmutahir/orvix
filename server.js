const express=require('express');require('express-async-errors');
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const PORT=process.env.PORT||3000,PASS=process.env.ADMIN_PASSWORD||'orvix123';
const FILE=path.join(__dirname,'data','db.json'),CATS=[['Wellness','🌿'],['Home','🏠'],['Content Creation','🎙️']];
/* ---- Data layer: replace read()/write() with a real database later ---- */
const seed={v:2,seq:1000,orders:[],reviews:[],cats:CATS.map(c=>[c[0],c[1],'']),settings:{email:'',fee:250,freeOver:0,whatsapp:'923000000000',easypaisa:'0300-0000000',jazzcash:'0300-0000000',acctTitle:'ORVIX',instagram:'',facebook:'',tiktok:''},content:{annOn:true,ann:'Cash on Delivery, EasyPaisa and JazzCash across Pakistan',heroTitle:'Beyond Everyday Essentials',heroText:'Carefully chosen products for wellness, home and content creation. Pay on delivery anywhere in Pakistan.',collTitle:'The collection'},products:[
{id:1,name:'EMS Neck & Lymphatic Massager',cat:0,price:4299,cost:2400,stock:25,e:'💆',h:320,desc:'Gentle pulses to ease neck tension after long days.',active:true,featured:true},
{id:2,name:'Portable USB-C Mini Blender',cat:1,price:2999,cost:1500,stock:30,e:'🥤',h:150,desc:'Fresh smoothies anywhere. Rechargeable over USB-C.',active:true,featured:true},
{id:3,name:'Sunset Projection Lamp',cat:1,price:1899,cost:850,stock:40,e:'🌅',h:25,desc:'Warm golden-hour glow for any wall or room.',active:true,featured:true},
{id:4,name:'Magnetic Phone Stand',cat:2,price:1499,cost:600,stock:50,e:'📱',h:250,desc:'Snaps on, adjusts to any angle. Great for filming.',active:true,featured:true},
{id:5,name:'RGB Ambient Light Bar',cat:2,price:3299,cost:1700,stock:20,e:'💡',h:265,desc:'Colour-shifting light for desks, setups and shoots.',active:true,featured:true},
{id:6,name:'Wireless Lavalier Collar Mic',cat:2,price:2499,cost:1200,stock:35,e:'🎙️',h:230,desc:'Clean sound for videos and calls. Clips to your collar.',active:true,featured:true}]};
const KV=process.env.KV_REST_API_URL||process.env.UPSTASH_REDIS_REST_URL,KT=process.env.KV_REST_API_TOKEN||process.env.UPSTASH_REDIS_REST_TOKEN;
const kv=async c=>{const r=await fetch(KV,{method:'POST',headers:{Authorization:'Bearer '+KT},body:JSON.stringify(c)}),j=await r.json();if(j.error)throw new Error(j.error);return j.result};
const clone=o=>JSON.parse(JSON.stringify(o)),noStore=()=>{throw new Error('Storage is not connected. Add the Upstash Redis integration in Vercel.')};
const write=async d=>{if(KV){await kv(['SET','orvix_db',JSON.stringify(d)]);return}if(process.env.VERCEL)noStore();fs.mkdirSync(path.dirname(FILE),{recursive:true});fs.writeFileSync(FILE,JSON.stringify(d,null,2))};
const read=async()=>{let d=null;
 if(KV){const v=await kv(['GET','orvix_db']);d=v?JSON.parse(v):null}else if(process.env.VERCEL)noStore();else{try{d=JSON.parse(fs.readFileSync(FILE,'utf8'))}catch(e){}}
 if(!d){d=clone(seed);await write(d);return d}
 if(!d.v){d.v=2;d.settings={...seed.settings,...d.settings,freeOver:0};d.content=d.content||seed.content;d.reviews=d.reviews||[];d.products.forEach(p=>p.featured=true);
  for(const k of['easypaisa','jazzcash'])if(/X/.test(d.settings[k]))d.settings[k]=seed.settings[k]}
 if(!d.cats)d.cats=CATS.map(c=>[c[0],c[1],'']);d.products.forEach(p=>{p.images=p.images||[]});d.settings.email=d.settings.email||'';return d};
/* ---- App ---- */
const app=express(),store=path.join(__dirname,'public'),adm=path.join(__dirname,'public','admin');
app.use(express.json({limit:'50kb'}));
const bad=(res,m,c=400)=>res.status(c).json({error:m});
app.get('/api/store',async(q,r)=>{const d=(await read()),s=d.settings;r.json({cats:d.cats,settings:s,content:d.content,products:d.products.filter(p=>p.active).map(({cost,...p})=>p)})});
app.post('/api/orders',async(req,res)=>{
 const b=req.body||{},d=(await read()),s=d.settings,phone=String(b.phone||'').replace(/[\s-]/g,''),t=k=>String(b[k]||'').trim().slice(0,200);
 if(t('first').length<2||t('last').length<2)return bad(res,'Please enter your first and last name.');
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t('email')))return bad(res,'Please enter a valid email address.');
 if(!/^03\d{9}$/.test(phone))return bad(res,'Enter an 11-digit mobile number like 03XX-XXXXXXX.');
 if(!t('city')||t('address').length<8)return bad(res,'Please enter your city and full address.');
 if(!['cod','easypaisa','jazzcash'].includes(b.payment))return bad(res,'Choose a payment method.');
 if(b.payment!=='cod'&&!/^[A-Za-z0-9-]{6,30}$/.test(t('txn')))return bad(res,'Enter the transaction ID from your payment.');
 const items=[];
 for(const i of(Array.isArray(b.items)?b.items:[]).slice(0,30)){const p=d.products.find(x=>x.id===+i.id&&x.active),q=Math.floor(+i.qty);
  if(!p||!(q>=1&&q<=20))return bad(res,'One item in your cart is no longer available.');
  if(p.stock<q)return bad(res,`${p.name}: only ${p.stock} left.`);items.push({id:p.id,name:p.name,price:p.price,cost:p.cost,qty:q})}
 if(!items.length)return bad(res,'Your cart is empty.');
 items.forEach(i=>d.products.find(p=>p.id===i.id).stock-=i.qty);
 const sub=items.reduce((a,i)=>a+i.price*i.qty,0),fee=s.freeOver>0&&sub>=s.freeOver?0:s.fee,no='OV'+(++d.seq);
 d.orders.push({no,name:t('first')+' '+t('last'),email:t('email'),phone,city:t('city'),address:t('address'),payment:b.payment,txn:t('txn'),paid:false,status:'pending',supplier:'',tracking:'',items,sub,fee,total:sub+fee,created:Date.now(),timeline:[{t:Date.now(),x:'Order placed'}]});
 await write(d);res.json({no,total:sub+fee,sub,fee,payment:b.payment,name:t('first')+' '+t('last'),city:t('city'),address:t('address'),items:items.map(({id,cost,...i})=>i)})});
/* ---- Reviews (public submit, admin approves) ---- */
const rl=new Map();
app.get('/api/reviews',async(q,r)=>r.json((await read()).reviews.filter(v=>v.status==='approved').slice(-100).reverse().map(({name,rating,text,created})=>({name,rating,text,created}))));
app.post('/api/reviews',async(q,r)=>{const b=q.body||{},n=(rl.get(q.ip)||[]).filter(t=>t>Date.now()-36e5);if(n.length>=3)return bad(r,'Too many reviews. Please try again later.',429);
 const name=String(b.name||'').trim().slice(0,60),text=String(b.text||'').trim().slice(0,600),rating=Math.round(+b.rating);
 if(name.length<2||text.length<10||!(rating>=1&&rating<=5))return bad(r,'Add your name, a rating and a review of at least 10 characters.');
 const d=(await read());d.reviews.push({id:Math.max(0,...d.reviews.map(x=>x.id))+1,name,rating,text,status:'pending',created:Date.now()});await write(d);rl.set(q.ip,[...n,Date.now()]);r.json({ok:1})});
/* ---- Admin API (password protected) ---- */
const sha=x=>crypto.createHash('sha256').update(x).digest(),SEC=process.env.SESSION_SECRET||PASS+'orvix-session',sig=e=>crypto.createHmac('sha256',SEC).update(String(e)).digest('hex'),mk=()=>{const e=Date.now()+864e5;return e+'.'+sig(e)},okTok=k=>{const[e,x]=String(k||'').split('.');return +e>Date.now()&&!!x&&x.length===64&&crypto.timingSafeEqual(Buffer.from(x),Buffer.from(sig(e)))};
const A=express.Router();
app.post('/api/admin/login',async(q,r)=>{if(process.env.VERCEL&&!process.env.ADMIN_PASSWORD)return bad(r,'Admin password is not set. Add ADMIN_PASSWORD in Vercel and redeploy.',503);const ok=crypto.timingSafeEqual(sha(String(q.body.password||'')),sha(PASS));
 setTimeout(()=>{if(!ok)return bad(r,'Wrong password',401);const k=mk();
 r.setHeader('Set-Cookie',`sid=${k}; HttpOnly; SameSite=Strict; Path=/; Max-Age=86400${q.headers['x-forwarded-proto']==='https'?'; Secure':''}`);r.json({ok:1})},400)});
A.use((q,r,n)=>{const k=((q.headers.cookie||'').match(/(?:^|;\s*)sid=([\w.]+)/)||[])[1];if(process.env.VERCEL&&!process.env.ADMIN_PASSWORD)return bad(r,'Admin password is not set.',503);if(okTok(k))return n();bad(r,'Please sign in',401)});
A.post('/logout',async(q,r)=>{r.setHeader('Set-Cookie','sid=; Max-Age=0; Path=/');r.json({ok:1})});
A.get('/data',async(q,r)=>r.json(await read()));
A.put('/products',async(req,res)=>{const d=(await read()),b=req.body,p={name:String(b.name||'').trim().slice(0,100),cat:Math.min(d.cats.length-1,Math.max(0,+b.cat||0)),price:Math.max(0,+b.price||0),cost:Math.max(0,+b.cost||0),stock:Math.max(0,Math.floor(+b.stock||0)),e:String(b.e||'📦').slice(0,4),desc:String(b.desc||'').slice(0,400),active:!!b.active,featured:!!b.featured,images:(Array.isArray(b.images)?b.images:[]).filter(u=>typeof u==='string'&&u.length<400&&/^(https:\/\/|\/uploads\/)/.test(u)).slice(0,6)};
 if(!p.name)return bad(res,'Name is required');
 if(b.id){const i=d.products.findIndex(x=>x.id===b.id);if(i<0)return bad(res,'Not found',404);d.products[i]={...d.products[i],...p}}
 else{p.id=Math.max(0,...d.products.map(x=>x.id))+1;p.h=(p.id*47)%360;d.products.push(p)}
 await write(d);res.json(d.products)});
A.delete('/products/:id',async(q,r)=>{const d=(await read());d.products=d.products.filter(p=>p.id!==+q.params.id);await write(d);r.json(d.products)});
A.put('/settings',async(q,r)=>{const d=(await read()),b=q.body;d.settings={fee:Math.max(0,+b.fee||0),freeOver:Math.max(0,+b.freeOver||0),whatsapp:String(b.whatsapp||'').replace(/\D/g,''),easypaisa:String(b.easypaisa||'').slice(0,20),jazzcash:String(b.jazzcash||'').slice(0,20),acctTitle:String(b.acctTitle||'').slice(0,60),instagram:String(b.instagram||'').slice(0,200),facebook:String(b.facebook||'').slice(0,200),tiktok:String(b.tiktok||'').slice(0,200),email:String(b.email||'').slice(0,100)};await write(d);r.json(d.settings)});
A.patch('/orders/:no',async(req,res)=>{const d=(await read()),o=d.orders.find(x=>x.no===req.params.no);if(!o)return bad(res,'Order not found',404);
 const{action:a,value:v}=req.body,log=x=>o.timeline.push({t:Date.now(),x}),closed=['delivered','cancelled'].includes(o.status);
 if(a==='verify'&&!closed){o.paid=true;log('Payment verified')}
 else if(a==='confirm'&&o.status==='pending'){o.status='confirmed';log('Order confirmed')}
 else if(a==='supplier'&&!closed){o.supplier=String(v||'').slice(0,80);log('Supplier set: '+(o.supplier||'none'))}
 else if(a==='ship'&&o.status==='confirmed'){o.status='shipped';o.tracking=String(v||'').slice(0,60);log('Shipped. Tracking: '+(o.tracking||'n/a'))}
 else if(a==='deliver'&&o.status==='shipped'){o.status='delivered';o.paid=true;log('Delivered')}
 else if(a==='cancel'&&!closed){o.status='cancelled';o.items.forEach(i=>{const p=d.products.find(x=>x.id===i.id);if(p)p.stock+=i.qty});log('Cancelled. Stock restored')}
 else return bad(res,'That step is not available for this order.');
 await write(d);res.json(o)});
A.put('/content',async(q,r)=>{const d=(await read()),b=q.body,s=(k,n)=>String(b[k]||'').slice(0,n);d.content={annOn:!!b.annOn,ann:s('ann',140),heroTitle:s('heroTitle',60),heroText:s('heroText',200),collTitle:s('collTitle',60)};d.cats=d.cats.map((c,i)=>[s('cn'+i,40)||c[0],s('ce'+i,4)||c[1],/^(https:\/\/|\/uploads\/)/.test(s('ci'+i,400))?s('ci'+i,400):'']);await write(d);r.json(d.content)});
A.patch('/reviews/:id',async(q,r)=>{const d=(await read()),v=d.reviews.find(x=>x.id===+q.params.id);if(!v)return bad(r,'Not found',404);v.status='approved';await write(d);r.json(v)});
A.delete('/reviews/:id',async(q,r)=>{const d=(await read());d.reviews=d.reviews.filter(x=>x.id!==+q.params.id);await write(d);r.json({ok:1})});
A.post('/upload',express.raw({type:'image/*',limit:'4mb'}),async(q,r)=>{const b=q.body;if(!Buffer.isBuffer(b)||b.length<100||b[0]!==0xFF||b[1]!==0xD8)return bad(r,'Please upload a JPG or PNG photo.');
 const name=`${Date.now()}-${crypto.randomBytes(3).toString('hex')}.jpg`;
 if(process.env.BLOB_READ_WRITE_TOKEN){const{put}=require('@vercel/blob');const o=await put('products/'+name,b,{access:'public',contentType:'image/jpeg'});return r.json({url:o.url})}
 if(process.env.VERCEL)return bad(r,'Image storage is not connected. In Vercel open Storage, create a Blob store, connect it to this project, then redeploy.',503);
 fs.mkdirSync(path.join(store,'uploads'),{recursive:true});fs.writeFileSync(path.join(store,'uploads',name),b);r.json({url:'/uploads/'+name})});
app.use('/api/admin',A);
/* ---- Hosts: admin.yourdomain.com serves the dashboard, everything else the store ---- */
app.use((q,r,n)=>{if(/^admin\./i.test(q.hostname)&&!q.path.startsWith('/api'))return express.static(adm)(q,r,()=>r.sendFile(path.join(adm,'index.html')));n()});
app.use('/admin',express.static(adm));
app.use(express.static(store));
app.use((q,r)=>{if(q.path.startsWith('/api'))return bad(r,'Not found',404);r.status(404).sendFile(path.join(store,'404.html'))});
app.use((e,q,r,n)=>{console.error(e);const c=e.status&&e.status<500?e.status:500;if(q.path.startsWith('/api'))return bad(r,c<500?'Invalid request.':'Something went wrong on our side. Please try again.',c);r.status(c).sendFile(path.join(store,'error.html'))});
if(require.main===module)app.listen(PORT,'0.0.0.0',()=>console.log(`ORVIX store: http://localhost:${PORT}\nAdmin:       http://localhost:${PORT}/admin  (or admin.localhost:${PORT})`));
module.exports=app;
