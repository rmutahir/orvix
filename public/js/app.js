const CITIES=["Karachi","Lahore","Islamabad","Rawalpindi","Faisalabad","Multan","Peshawar","Quetta","Hyderabad","Sialkot","Other"],PAY={cod:"Cash on Delivery",easypaisa:"EasyPaisa",jazzcash:"JazzCash"};
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const rs=n=>"Rs. "+Number(n).toLocaleString("en-PK");
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let S=null,cart={},cat="all";
try{cart=JSON.parse(localStorage.getItem("orvix")||"{}")}catch(e){}
const save=()=>{try{localStorage.setItem("orvix",JSON.stringify(cart))}catch(e){}};
let wl=[];try{wl=JSON.parse(localStorage.getItem("ov_wl")||"[]")}catch(e){}
const HP='<path d="M12 20s-7.500-4.600-7.500-10A4.300 4.300 0 0112 7.600 4.300 4.300 0 0119.500 10c0 5.400-7.500 10-7.500 10z"/>';
const heart=id=>`<button class="hb${wl.includes(id)?" on":""}" data-w="${id}" aria-label="Save to wishlist">${ic(HP,18)}</button>`;
const pic=p=>{const m=p.images||[];return m.length?`<img class="i1" src="${esc(m[0])}" alt="${esc(p.name)}" loading="lazy">${m[1]?`<img class="i2" src="${esc(m[1])}" alt="" loading="lazy">`:""}`:esc(p.e)};
function wlSync(){$("#wn").textContent=wl.length||""}
function wlRender(){const l=S.products.filter(p=>wl.includes(p.id));$("#wlg").innerHTML=l.length?l.map(card).join(""):`<p class="empty">Nothing saved yet.<br>Tap the heart on any product to keep it here.</p>`;revealAll()}
const P=i=>S&&S.products.find(p=>p.id==i);
const curPage=location.pathname.split("/").pop()||"index";
const pg=curPage.replace(/\.html$/,"")||"index";
const ic=(d,s=24)=>`<svg width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">${d}</svg>`;
const L=[["/","Home",'<path d="M3 11l9-8 9 8v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z"/>'],["shop","Shop",'<path d="M5 8h14l-1 12H6zM9 8a3 3 0 016 0"/>'],["contact","Contact Us",'<path d="M4 5h16v11H9l-5 4z"/>']];
const on=h=>h==="/"?(pg===""||pg==="index"):(pg===h);
document.body.insertAdjacentHTML("afterbegin",`<i class="pb" id="pb"></i><div class="ann" id="an" hidden></div>
<header class="hd"><div class="wrap"><a class="logo" href="/">ORVIX</a>
<nav class="nav">${L.map(l=>`<a class="${on(l[0])}" href="${l[0]}">${l[1]}</a>`).join("")}</nav>
<div class="rt"><a class="cartbtn" href="wishlist" aria-label="Wishlist">${ic(HP)}<b id="wn"></b></a><button class="cartbtn" id="th" aria-label="Switch light or dark mode">${ic('<path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/>')}</button><button class="cartbtn" aria-label="Open cart" data-cart>${ic('<path d="M5 8h14l-1 12H6zM9 8a3 3 0 016 0"/>')}<b id="cn"></b></button></div></div></header>
<nav class="tab" id="tb"><i class="hl"></i>${L.map(l=>`<a class="${on(l[0])}" href="${l[0]}">${ic(l[2],20)}${l[1]}</a>`).join("")}</nav>
<div id="d"><div class="ov" data-close></div><aside class="dr" aria-label="Cart"><h3><span>Your cart</span><button data-close aria-label="Close">×</button></h3><div class="items" id="items"></div><div class="sum" id="sum"></div><a class="btn w" id="co" href="checkout">Checkout</a></aside></div>
<div class="toast" id="ts"></div>`);
document.body.insertAdjacentHTML("beforeend",`<div class="hlp" id="help"></div><footer class="ft" id="ft"></footer>`);
(()=>{const hl=$("#tb .hl"),i=L.findIndex(l=>l[0]===pg),set=k=>hl.style.transform=`translateX(${k*100}%)`;let v=null;try{v=sessionStorage.getItem("ov_tab")}catch(e){}
 if(i<0)hl.style.opacity=0;else{set(v!==null&&+v!==i&&+v>=0?+v:i);requestAnimationFrame(()=>requestAnimationFrame(()=>set(i)));try{sessionStorage.setItem("ov_tab",i)}catch(e){}}
 $$("#tb a").forEach((a,k)=>a.addEventListener("pointerdown",()=>{hl.style.opacity=1;set(k)}))})();
$("#th").onclick=()=>{const t=document.documentElement.dataset.theme==="dark"?"light":"dark";document.documentElement.dataset.theme=t;try{localStorage.setItem("ov_t",t)}catch(e){}};
const toast=m=>{const t=$("#ts");t.textContent=m;t.classList.add("show");clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove("show"),1800)};
const feeFor=sub=>!S||!sub?0:(S.settings.freeOver>0&&sub>=S.settings.freeOver?0:S.settings.fee);
const card=p=>`<article class="card rv"><div class="ph" style="--h:${p.h}">${pic(p)}</div>${heart(p.id)}<h3>${esc(p.name)}</h3><p class="ds">${esc(p.desc)}</p><p>${esc(S.cats[p.cat][0])}${p.stock>0&&p.stock<=5?" · Only "+p.stock+" left":""}</p><div class="row"><b>${rs(p.price)}</b>${p.stock>0?`<button class="btn sm" data-add="${p.id}">Add</button>`:`<span class="mt">Sold out</span>`}</div></article>`;
const lines=ids=>ids.map(i=>{const p=P(i);return`<div class="it"><div class="ph" style="--h:${p.h}">${pic(p)}</div><div>${esc(p.name)}<small>${rs(p.price)}</small></div><div class="q"><button data-q="${i}:-1" aria-label="Less">−</button>${cart[i]}<button data-q="${i}:1" aria-label="More">+</button></div></div>`}).join("");
const totals=sub=>{const f=feeFor(sub);return`<div><span>Subtotal</span><span>${rs(sub)}</span></div><div><span>Delivery</span><span>${f?rs(f):"Free"}</span></div><div class="t"><span>Total</span><span>${rs(sub+f)}</span></div>`};
function draw(){const ids=S?Object.keys(cart).filter(i=>P(i)):[],n=ids.reduce((a,i)=>a+cart[i],0),sub=ids.reduce((a,i)=>a+P(i).price*cart[i],0);
 $("#cn").textContent=n;$("#cn").dataset.n=n;$("#items").innerHTML=ids.length?lines(ids):`<p class="empty">Your cart is empty.<br>Add something from the shop.</p>`;
 $("#sum").innerHTML=ids.length?totals(sub):"";$("#co").hidden=!ids.length;
 const ck=$("#ck");if(ck&&ck.dataset.on)$("#cks").innerHTML=ids.length?lines(ids)+`<div class="sum">${totals(sub)}</div>`:"";save()}
const setOpen=v=>$("#d").classList.toggle("open",v);
document.addEventListener("click",e=>{const t=e.target.closest("[data-add],[data-q],[data-cart],[data-close],[data-w]");if(!t)return;
 if(t.dataset.add){const p=P(t.dataset.add),c=cart[p.id]||0;if(c>=p.stock)return toast("Only "+p.stock+" in stock");cart[p.id]=c+1;draw();toast("Added to cart")}
 else if(t.dataset.q){const[i,d]=t.dataset.q.split(":");if(+d>0&&cart[i]>=P(i).stock)return toast("Only "+P(i).stock+" in stock");cart[i]=(cart[i]||0)+ +d;if(cart[i]<1)delete cart[i];draw();if($("#ck")&&!Object.keys(cart).length)checkout()}
 else if(t.dataset.w){const id=+t.dataset.w,k=wl.indexOf(id);k<0?wl.push(id):wl.splice(k,1);try{localStorage.setItem("ov_wl",JSON.stringify(wl))}catch(e){}$$(`[data-w="${id}"]`).forEach(b=>b.classList.toggle("on",k<0));wlSync();toast(k<0?"Saved to wishlist":"Removed from wishlist");if($("#wlg"))wlRender()}
 else if(t.hasAttribute("data-cart"))setOpen(true);else setOpen(false)});
async function load(){for(let attempt=0;attempt<3;attempt++){try{const r=await fetch("/api/store");if(r.ok){S=await r.json();Object.keys(cart).forEach(i=>{const p=P(i);if(!p||p.stock<1)delete cart[i];else cart[i]=Math.min(cart[i],p.stock)});return}}catch(e){}await new Promise(r=>setTimeout(r,800))}S=null}
function apply(){const c=(S&&S.content)||{},an=$("#an");an.hidden=!(c.annOn&&c.ann);an.textContent=c.ann||"";document.documentElement.style.setProperty("--ah",an.hidden?"0px":"34px");
 const h=$("h1[data-split]");if(h&&c.heroTitle)h.textContent=c.heroTitle;if($("#heroText")&&c.heroText)$("#heroText").textContent=c.heroText;if($("#collTitle")&&c.collTitle)$("#collTitle").textContent=c.collTitle;
 $$("h1[data-split]").forEach(h=>{h.innerHTML=h.textContent.trim().split(" ").map((w,i)=>`<span class="w" style="--i:${i}">${esc(w)}</span>`).join(" ")})}
const SV={ig:'<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".7" fill="currentColor"/>',fb:'<path d="M14 8h3V4h-3a4 4 0 00-4 4v2H7v4h3v7h4v-7h3l1-4h-4V8z"/>',tt:'<path d="M14 3v11.5a3 3 0 11-3-3M14 3c.4 2.6 2.2 4.4 5 4.6"/>',wa:'<path d="M3 21l1.7-5A8.5 8.5 0 1112 20.5a8.5 8.5 0 01-4.2-1.1z"/><path d="M9.500 8.500c0 3 3 6 6 6"/>',hs:'<path d="M4 14v-2a8 8 0 0116 0v2M4 14h3v5H5a1 1 0 01-1-1zM20 14h-3v5h2a1 1 0 001-1zM17 19v1a2 2 0 01-2 2h-3"/>',ml:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',lk:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>'};
function foot(){const s=S?S.settings:{},E=x=>/^https?:\/\//.test(x||""),ar="<i>↗</i>";
 const so=[["instagram","ig","Instagram"],["facebook","fb","Facebook"],["tiktok","tt","TikTok"]].filter(x=>E(s[x[0]])).map(x=>`<a href="${esc(s[x[0]])}" target="_blank" rel="noopener" aria-label="${x[2]}">${ic(SV[x[1]],18)}</a>`);
 if(s.whatsapp)so.push(`<a href="https://wa.me/${esc(s.whatsapp)}" target="_blank" rel="noopener" aria-label="WhatsApp">${ic(SV.wa,18)}</a>`);
 $("#help").innerHTML=`<div class="wrap"><div class="hb2"><div class="hh"><span class="hi">${ic(SV.hs,26)}</span><div><h3>We're always here to help</h3><p>Real people, ready to answer your questions</p></div></div>
<a class="hc" href="faq.html"><span class="ci">?</span><span><small>HELP CENTRE</small>FAQs &amp; answers</span>${ar}</a>
${s.whatsapp?`<a class="hc hc-wa" href="https://wa.me/${esc(s.whatsapp)}" target="_blank" rel="noopener"><span class="ci" style="background:#25D366;color:#fff">${ic(SV.wa,20)}</span><span><small style="color:#25D366;font-weight:700">WHATSAPP</small>Chat with us</span>${ar}</a>`:""}
${s.email?`<a class="hc" href="mailto:${esc(s.email)}"><span class="ci">${ic(SV.ml,20)}</span><span><small>EMAIL SUPPORT</small>${esc(s.email)}</span>${ar}</a>`:""}</div></div>`;
 $("#ft").innerHTML=`<div class="wrap"><div class="fg"><div><p>ORVIX. Beyond Everyday Essentials. Carefully chosen products, delivered across Pakistan.</p></div>
<div><h4>Shop</h4><a href="shop.html">All products</a>${(S?S.cats:[]).map((c,i)=>`<a href="shop.html?cat=${i}">${esc(c[0])}</a>`).join("")}</div>
<div><h4>Company</h4><a href="about.html">About us</a><a href="reviews.html">Reviews</a><a href="wishlist.html">Wishlist</a><a href="faq.html">FAQs</a><a href="contact.html">Contact us</a></div>
<div><h4>Policies</h4><a href="privacy.html">Privacy Policy</a><a href="terms.html">Terms &amp; Conditions</a><a href="shipping.html">Shipping &amp; Payments</a><a href="returns.html">Returns &amp; Refunds</a></div></div>
<div class="fbt"><div class="fl"><b class="logo">ORVIX</b>${so.length?'<span class="sep"></span>':""}<div class="soc">${so.join("")}</div></div>
<div class="pay"><span class="sec">${ic(SV.lk,18)} Secure payments</span><span class="pm">Cash on Delivery</span><span class="pm" style="display:inline-flex;align-items:center;justify-content:center;background:#fff;padding:3px 8px;border-radius:6px;height:26px"><img src="/assets/aistudio/image_c9d9d226.png" alt="EasyPaisa" style="height:18px;width:55px;object-fit:contain"></span><span class="pm" style="display:inline-flex;align-items:center;justify-content:center;background:#fff;padding:3px 8px;border-radius:6px;height:26px"><img src="/assets/aistudio/image_78d26bda.png" alt="JazzCash" style="height:18px;width:55px;object-fit:contain"></span></div></div>
<div class="fb"><span>© ${new Date().getFullYear()} ORVIX. All rights reserved.</span><span>Beyond Everyday Essentials</span></div></div>`}
const OFF=`<p class="empty">We could not load the store right now.<br>Please check your connection and <a class="lnk" href="#" onclick="location.reload();return false">try again</a>.</p>`;
function shop(){const g=$("#grid"),c0=new URLSearchParams(location.search).get("cat");if(c0!==null)cat=c0;
 $("#chips").innerHTML=[["all","All"],...S.cats.map((c,i)=>[String(i),c[0]])].map(c=>`<button class="chip" data-c="${c[0]}">${esc(c[1])}</button>`).join("");
 const run=()=>{const q=$("#q").value.toLowerCase(),s=$("#sort").value;$$(".chip").forEach(b=>b.classList.toggle("on",b.dataset.c==cat));
  const l=S.products.filter(p=>(cat=="all"||p.cat==cat)&&p.name.toLowerCase().includes(q));if(s=="lo")l.sort((a,b)=>a.price-b.price);if(s=="hi")l.sort((a,b)=>b.price-a.price);
  g.innerHTML=l.length?l.map(card).join(""):`<p class="empty">No products match. Try another search or category.</p>`;revealAll()};
 $("#chips").onclick=e=>{if(e.target.dataset.c){cat=e.target.dataset.c;run()}};$("#q").oninput=run;$("#sort").onchange=run;run()}
function render(){const fe=$("#feat"),ct=$("#cats"),gr=$("#grid"),wg=$("#wlg");
 if(!S){[fe,ct,gr,wg].forEach(x=>x&&(x.innerHTML=OFF));return}
 if(fe){const f=S.products.filter(p=>p.featured);fe.innerHTML=f.map(card).join("");fe.closest("section").hidden=!f.length}
 if(ct)ct.innerHTML=S.cats.map((c,i)=>`<a class="cat rv" style="--h:${(i*70+250)%360}" href="shop.html?cat=${i}">${c[2]?`<img src="${esc(c[2])}" alt="${esc(c[0])}" loading="lazy">`:`<i class="em">${esc(c[1])}</i>`}<b class="lab">${esc(c[0])} ${ic('<path d="M5 12h14M13 6l6 6-6 6"/>',16)}</b></a>`).join("");
 if(gr)shop();if(wg)wlRender();revealAll()}
/* checkout */
const pay=()=>($("[name=pay]:checked")||{}).value||"cod";
const fl=(id,l,inner)=>`<div class="fld" id="w_${id}"><label for="${id}">${l}</label>${inner}<small class="e" id="e_${id}" role="alert"></small></div>`;
const RULES={n1:v=>v.length<2&&"Enter your first name.",n2:v=>v.length<2&&"Enter your last name.",em:v=>!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)&&"Enter a valid email address.",
 ph:v=>{const d=v.replace(/\D/g,"");return d.length<11?"Enter your 11-digit mobile number, like 03XX-XXXXXXX.":!/^03/.test(d)&&"Mobile numbers start with 03."},ad:v=>v.length<8&&"Enter your full address with house and street.",tx:v=>pay()!=="cod"&&!/^[A-Za-z0-9-]{6,30}$/.test(v)&&"Enter the transaction ID from your payment receipt."};
const check=id=>{const el=$("#"+id);if(!el)return true;const m=RULES[id](el.value.trim());$("#w_"+id).classList.toggle("bad",!!m);$("#e_"+id).textContent=m||"";return!m};
function checkout(){const ck=$("#ck");if(!ck)return;if(!S){ck.innerHTML=OFF;return}ck.dataset.on=1;
 const ids=Object.keys(cart).filter(i=>P(i));if(!ids.length){ck.innerHTML=`<p class="empty">Your cart is empty.<br><a class="lnk" href="shop.html">Go to the shop</a></p>`;return}
 ck.innerHTML=`<div class="cg"><div><h2>Your details</h2><div class="two">${fl("n1","First name",'<input id="n1" autocomplete="given-name">')}${fl("n2","Last name",'<input id="n2" autocomplete="family-name">')}</div>
${fl("em","Email",'<input id="em" type="email" autocomplete="email" inputmode="email">')}${fl("ph","Mobile number",'<input id="ph" inputmode="numeric" autocomplete="tel" placeholder="03XX-XXXXXXX" maxlength="12">')}
${fl("ct","City",`<select id="ct">${CITIES.map(c=>`<option>${c}</option>`).join("")}</select>`)}${fl("ad","Full address",'<textarea id="ad" rows="3" autocomplete="street-address" placeholder="House, street, area"></textarea>')}
<h2>Payment</h2><div class="fm" style="padding:0"><fieldset><label><input type="radio" name="pay" value="cod" checked> Cash on Delivery</label><label style="display:flex;align-items:center;gap:8px"><input type="radio" name="pay" value="easypaisa"> EasyPaisa <img src="/assets/aistudio/image_c9d9d226.png" alt="EasyPaisa" style="height:20px;object-fit:contain;background:#fff;padding:2px 6px;border-radius:4px"></label><label style="display:flex;align-items:center;gap:8px"><input type="radio" name="pay" value="jazzcash"> JazzCash <img src="/assets/aistudio/image_78d26bda.png" alt="JazzCash" style="height:20px;object-fit:contain;background:#fff;padding:2px 6px;border-radius:4px"></label></fieldset></div>
<div id="wl" hidden></div><p class="err" id="fe" role="alert"></p><button class="btn w" id="po">Place order</button></div>
<aside class="sm"><h2>Order summary</h2><div id="cks"></div></aside></div>`;draw();
 ck.addEventListener("input",e=>{if(e.target.id==="ph"){const d=e.target.value.replace(/\D/g,"").slice(0,11);e.target.value=d.length>4?d.slice(0,4)+"-"+d.slice(4):d}if(RULES[e.target.id]&&$("#w_"+e.target.id).classList.contains("bad"))check(e.target.id)});
 ck.addEventListener("focusout",e=>{if(RULES[e.target.id])check(e.target.id)});
 ck.addEventListener("change",e=>{if(e.target.name!=="pay")return;const v=pay(),w=$("#wl"),sub=Object.keys(cart).reduce((a,i)=>a+(P(i)?P(i).price*cart[i]:0),0);w.hidden=v==="cod";
  if(v!=="cod")w.innerHTML=`<div class="wb">Send <b>${rs(sub+feeFor(sub))}</b> to ${PAY[v]} account<b>${esc(S.settings[v])}</b>Account title: ${esc(S.settings.acctTitle||"ORVIX")}</div>${fl("tx","Transaction ID",'<input id="tx" autocomplete="off" placeholder="From your payment receipt">')}`});
 $("#po").onclick=async()=>{const ids=["n1","n2","em","ph","ad",...(pay()!=="cod"?["tx"]:[])],bad=ids.filter(i=>!check(i));if(bad.length){$("#"+bad[0]).focus();return}
  const g=i=>$("#"+i).value.trim(),b=$("#po");b.disabled=true;b.textContent="Placing order...";$("#fe").textContent="";
  try{const r=await fetch("/api/orders",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({first:g("n1"),last:g("n2"),email:g("em"),phone:g("ph"),city:g("ct"),address:g("ad"),payment:pay(),txn:pay()==="cod"?"":g("tx"),items:Object.keys(cart).map(i=>({id:+i,qty:cart[i]}))})}),j=await r.json();
   if(!r.ok){$("#fe").textContent=j.error;b.disabled=false;b.textContent="Place order";return}
   try{sessionStorage.setItem("ov_last",JSON.stringify(j))}catch(e){}cart={};save();location.href="confirmation.html"}
  catch(x){$("#fe").textContent="Could not reach the store. Check your connection and try again.";b.disabled=false;b.textContent="Place order"}}}
function confirmPage(){const c=$("#conf");if(!c)return;let o=null;try{o=JSON.parse(sessionStorage.getItem("ov_last"))}catch(e){}
 if(!o){c.innerHTML=`<h1>No recent order</h1><p class="mt">Place an order from the shop to see your confirmation here.</p><br><a class="btn" href="shop.html">Go to shop</a>`;return}
 const w=o.payment!=="cod";
 c.innerHTML=`<h1>Thank you, ${esc(o.name.split(" ")[0])}.</h1><p>Your order <b>${esc(o.no)}</b> has been received.</p>
 <p class="note">${w?"Your order will be confirmed once your payment has been verified. A member of our team will contact you shortly.":"Our team will contact you shortly to confirm your order and arrange delivery."}</p>
 <div class="sm" style="margin-top:20px">${o.items.map(i=>`<div class="it"><div>${esc(i.name)}<small>${i.qty} × ${rs(i.price)}</small></div><div>${rs(i.price*i.qty)}</div></div>`).join("")}<div class="sum"><div><span>Subtotal</span><span>${rs(o.sub)}</span></div><div><span>Delivery</span><span>${o.fee?rs(o.fee):"Free"}</span></div><div class="t"><span>Total</span><span>${rs(o.total)}</span></div></div>
 <p class="mt">Payment: ${PAY[o.payment]}<br>Deliver to: ${esc(o.address)}, ${esc(o.city)}</p></div><br><a class="btn" href="shop.html">Continue shopping</a>`}
/* reviews */
async function reviewsPage(){const l=$("#rv");if(!l)return;try{const a=await (await fetch("/api/reviews")).json(),avg=a.length?a.reduce((x,r)=>x+r.rating,0)/a.length:0;
 $("#rsum").textContent=a.length?`${avg.toFixed(1)} out of 5 from ${a.length} ${a.length==1?"review":"reviews"}`:"No reviews yet. Be the first to share your experience.";
 l.innerHTML=a.map(r=>`<div class="rvc"><b>${"★".repeat(r.rating)}${"☆".repeat(5-r.rating)}</b><p style="color:var(--ink);margin:6px 0">${esc(r.text)}</p><small>${esc(r.name)}</small></div>`).join("")}catch(e){l.innerHTML=OFF}
 $("#rf").onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target),m=$("#rm");try{const r=await fetch("/api/reviews",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(Object.fromEntries(f))}),j=await r.json();m.textContent=r.ok?"Thank you. Your review will appear once it has been approved.":j.error;if(r.ok)e.target.reset()}catch(x){m.textContent="Could not send your review. Please try again."}}}
const cf=$("#cf");if(cf)cf.onsubmit=e=>{e.preventDefault();const f=new FormData(cf);window.open(`https://wa.me/${S?S.settings.whatsapp:""}?text=${encodeURIComponent(`Hi ORVIX, I'm ${f.get("n")}.\n${f.get("m")}`)}`,"_blank");toast("Opening WhatsApp")};
/* life */
const hero=$(".hero");if(hero)hero.addEventListener("pointermove",e=>{const r=hero.getBoundingClientRect();hero.style.setProperty("--mx",((e.clientX-r.left)/r.width-.5)*2);hero.style.setProperty("--my",((e.clientY-r.top)/r.height-.5)*2)});
document.addEventListener("pointermove",e=>{if(e.pointerType!=="mouse")return;const c=e.target.closest(".card");if(!c)return;const r=c.getBoundingClientRect();c.style.setProperty("--ry",((e.clientX-r.left)/r.width-.5)*14+"deg");c.style.setProperty("--rx",((e.clientY-r.top)/r.height-.5)*-14+"deg")});
document.addEventListener("pointerout",e=>{const c=e.target.closest&&e.target.closest(".card");if(c&&!c.contains(e.relatedTarget)){c.style.setProperty("--rx","0deg");c.style.setProperty("--ry","0deg")}});
const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add("in");io.unobserve(x.target)}}),{threshold:.15});
function revealAll(){$$(".rv:not(.in),.step:not(.in)").forEach(el=>io.observe(el))}revealAll();
let tk=0;addEventListener("scroll",()=>{if(!tk){tk=1;requestAnimationFrame(()=>{document.documentElement.style.setProperty("--y",scrollY);$("#pb").style.transform=`scaleX(${scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight)})`;tk=0})}},{passive:true});
const SKC=n=>Array(n).fill('<div class="card"><div class="sk" style="aspect-ratio:1"></div><div class="sk" style="height:14px;width:80%"></div><div class="sk" style="height:12px;width:55%"></div><div class="sk" style="height:34px;margin-top:6px"></div></div>').join("");
const sk=(id,h)=>{const e=$(id);if(e)e.innerHTML=h},B=(h,x="")=>`<div class="sk" style="height:${h}px;${x}"></div>`;
sk("#feat",SKC(3));sk("#wlg",SKC(4));sk("#grid",SKC(6));sk("#cats",Array(3).fill(B(110,"border-radius:22px")).join(""));sk("#rv",Array(3).fill(B(90,"margin-bottom:12px;border-radius:18px")).join(""));
sk("#ck",`<div class="cg"><div>${B(48,"margin-bottom:14px")}${B(48,"margin-bottom:14px")}${B(48,"margin-bottom:14px")}${B(96)}</div>${B(280,"border-radius:22px")}</div>`);
draw();wlSync();foot();load().then(()=>{apply();render();draw();foot();checkout();confirmPage();reviewsPage()});
