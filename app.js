const $=(s,r=document)=>r.querySelector(s),R=document.documentElement,LS=localStorage;
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
R.dataset.theme=LS.th||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');
R.style.fontSize=(LS.fs||100)+'%';
const base=()=>fetch('data.json?'+Date.now()).then(r=>r.json());
async function load(a){if(a)try{const l=LS.getItem('satr_data');if(l)return JSON.parse(l)}catch(e){}return base()}
const cfg=()=>{const h=location.hostname,g=location.pathname.split('/')[1]||'';return{o:LS.go||h.split('.')[0],r:LS.gr||(g&&!g.includes('.')?g:h)}};
const enc=new TextEncoder(),b64=u=>btoa(String.fromCharCode(...u)),ub=t=>Uint8Array.from(atob(t),c=>c.charCodeAt(0));
async function ky(pw,salt){const m=await crypto.subtle.importKey('raw',enc.encode(pw),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:250000,hash:'SHA-256'},m,{name:'AES-GCM',length:256},false,['encrypt','decrypt'])}
async function seal(t,pw){const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));return{s:b64(salt),i:b64(iv),c:b64(new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},await ky(pw,salt),enc.encode(t))))}}
async function unseal(o,pw){return new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:ub(o.i)},await ky(pw,ub(o.s)),ub(o.c)))}
function toast(m){const t=$('#ts');t.textContent=m;t.style.display='block';setTimeout(()=>t.style.display='none',3000)}
function chrome(d,page){
 const s=d.site;R.style.setProperty('--ac',s.accent);R.style.setProperty('--r',s.radius+'px');R.style.setProperty('--hf',`'${s.font}'`);
 document.title=s.name+' | '+page;
 if(s.logo){let i=$('link[rel=icon]');if(!i){i=document.createElement('link');i.rel='icon';document.head.appendChild(i)}i.href=s.logo}
 const cur=location.pathname.split('/').pop()||'index.html';
 const L=[['index.html','الرئيسية'],...d.menus.map(m=>[m.url,m.title]),['team.html','الإشراف']];
 $('#hd').innerHTML=`<div class="w bar"><a class="logo" href="index.html">${s.logo?`<img class="lg" src="${esc(s.logo)}" alt="${esc(s.name)}">${s.showName?esc(s.name):''}`:`<b>${esc(s.name[0])}</b>${esc(s.name)}`}</a><nav>${L.map(l=>`<a href="${esc(l[0])}" class="${l[0]==cur?'on':''}">${esc(l[1])}</a>`).join('')}</nav><div class="tools"><button data-f="-10" aria-label="تصغير الخط">أ-</button><button data-f="10" aria-label="تكبير الخط">أ+</button><button id="tg" aria-label="تبديل الوضع الداكن">◐</button></div></div>`;
 $('#ft').innerHTML=`<div class="w">${esc(s.name)} — ${esc(s.tagline)}</div>`;
 $('#hd').onclick=e=>{const b=e.target.closest('button');if(!b)return;
  if(b.dataset.f){LS.fs=Math.min(160,Math.max(80,+(LS.fs||100)+ +b.dataset.f));R.style.fontSize=LS.fs+'%'}
  if(b.id=='tg'){LS.th=R.dataset.theme=='dark'?'light':'dark';R.dataset.theme=LS.th}}
}
async function fresh(){try{if(!LS.gt)return null;const c=cfg(),r=await fetch(`https://api.github.com/repos/${c.o}/${c.r}/contents/data.json`,{headers:{Authorization:'Bearer '+LS.gt,Accept:'application/vnd.github.raw+json'}});return r.ok?await r.json():null}catch(e){return null}}
async function boot(p){const d=(p=='admin'&&!LS.getItem('satr_data')&&await fresh())||await load(p=='admin');chrome(d,{home:d.site.tagline,team:'الإشراف',admin:'لوحة التحكم'}[p]);({home,team,admin})[p](d)}
const hue=i=>`hsl(${(i*47)%360} 35% 38%)`;
function home(d){
 let q='',cat='',typ='';
 $('#app').innerHTML=`<section class="hero"><div class="w"><h1>${esc(d.site.name)}</h1><p>${esc(d.site.tagline)}</p><input id="q" type="search" aria-label="بحث" placeholder="ابحث بالعنوان أو المؤلف أو الموضوع"></div></section><div class="w"><div class="chips" id="ch"></div><div class="grid" id="gr"></div></div><dialog id="dg"></dialog>`;
 const T=[['','الكل'],['book','كتب'],['research','أبحاث']];
 const draw=()=>{
  $('#ch').innerHTML=T.map(t=>`<button data-t="${t[0]}" class="${typ==t[0]?'on':''}">${t[1]}</button>`).join('')+'<i></i>'+['',...d.cats].map(c=>`<button data-c="${esc(c)}" class="${cat==c?'on':''}">${c?esc(c):'كل القوائم'}</button>`).join('');
  const L=d.items.filter(i=>(!typ||i.type==typ)&&(!cat||i.cat==cat)&&[i.title,i.author,i.desc,i.cat].join(' ').includes(q));
  $('#gr').innerHTML=L.length?L.map(i=>`<button class="card" data-id="${i.id}">${i.cover?`<img class="cv" src="${esc(i.cover)}" alt="">`:`<div class="cv" style="background:${hue(i.id)}">${esc(i.title[0])}</div>`}<div class="m"><h3>${esc(i.title)}</h3><small>${esc(i.author)}${i.year?' — '+esc(i.year):''}</small><br><span class="tag">${i.type=='book'?'كتاب':'بحث'}</span></div></button>`).join(''):'<p class="empty">لا توجد نتائج. غيّر كلمة البحث أو اختر «كل القوائم».</p>'};
 draw();
 $('#q').oninput=e=>{q=e.target.value.trim();draw()};
 $('#ch').onclick=e=>{const b=e.target.closest('button');if(!b)return;if('t'in b.dataset)typ=b.dataset.t;else cat=b.dataset.c;draw()};
 $('#gr').onclick=e=>{const b=e.target.closest('.card');if(!b)return;const i=d.items.find(x=>x.id==b.dataset.id);
  $('#dg').innerHTML=`<h2>${esc(i.title)}</h2><p class="mut">${esc(i.author)} — ${esc(i.cat)}${i.year?' — '+esc(i.year):''}</p><p>${esc(i.desc)}</p>${i.link?`<a class="btn" href="${esc(i.link)}" target="_blank" rel="noopener">فتح الملف</a> `:''}<button class="btn g" onclick="this.closest('dialog').close()">إغلاق</button>`;$('#dg').showModal()};
}
function team(d){
 $('#app').innerHTML=`<section class="hero"><div class="w"><h1>الإشراف على الموقع</h1><p>${esc(d.about)}</p></div></section><div class="w"><h2>فريق الإشراف</h2><div class="grid t">${d.team.map(m=>`<div class="card"><div class="av">${esc(m.name[0])}</div><h3>${esc(m.name)}</h3><b>${esc(m.role)}</b><span class="mut">${esc(m.bio)}</span></div>`).join('')}</div><h2>معايير النشر</h2><ul class="pol">${d.policy.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`}
function admin(d){
 const save=m=>{LS.setItem('satr_data',JSON.stringify(d));chrome(d,'لوحة التحكم');toast(m||'تم الحفظ');if(LS.gt)pub(d)};
 const tabs={look:'المظهر',items:'الكتب والأبحاث',menus:'القوائم',team:'الإشراف',pub:'النشر'};
 if(!LS.gt&&d.vault){$('#app').innerHTML='<div class="w" style="max-width:440px;padding:48px 20px"><div class="pn"><h2>دخول الإدارة</h2><div class="fm"><label>كلمة المرور<input id="up" type="password"></label></div><p><button class="btn" id="un">دخول</button></p></div></div>';$('#un').onclick=async()=>{try{LS.gt=await unseal(d.vault,$('#up').value);location.reload()}catch(e){toast('كلمة المرور غير صحيحة')}};$('#up').onkeydown=e=>e.key=='Enter'&&$('#un').click();return}
 let tab=LS.gt?'look':'pub',eid=null;
 const inp=(id,l,v='',t='text')=>`<label>${l}<input id="${id}" type="${t}" value="${esc(v)}"></label>`;
 const del=(k,i)=>`<button class="btn g" data-del="${k}:${i}">حذف</button>`;
 const P={
  look:()=>`<div class="pn"><h2>شكل الموقع</h2><div class="fm">${inp('n','اسم الموقع',d.site.name)}${inp('tg','الوصف المختصر',d.site.tagline)}${inp('ac','اللون الأساسي',d.site.accent,'color')}<label>استدارة الزوايا<input id="rd" type="range" min="0" max="24" value="${d.site.radius}"></label><label>خط العناوين<select id="fn">${['Amiri','Cairo'].map(f=>`<option ${f==d.site.font?'selected':''}>${f}</option>`).join('')}</select></label><label class="f">شعار الموقع (صورة تظهر بدل الاسم)<input id="lf" type="file" accept="image/*"></label>${d.site.logo?`<div class="f"><img class="lg" src="${esc(d.site.logo)}" alt=""> <button class="btn g" id="rl">حذف الشعار</button></div>`:''}<label><span><input id="sn" type="checkbox" ${d.site.showName?'checked':''}> إظهار اسم الموقع بجانب الشعار</span></label><label class="f">نص صفحة الإشراف<textarea id="ab" rows="3">${esc(d.about)}</textarea></label></div><p><button class="btn" id="sv">حفظ المظهر</button></p></div>`,
  items:()=>{const i=d.items.find(x=>x.id==eid)||{type:'book',title:'',author:'',cat:d.cats[0]||'',year:'',cover:'',link:'',desc:''};
   return `<div class="pn"><h2>${eid?'تعديل':'إضافة'} كتاب أو بحث</h2><div class="fm"><label>النوع<select id="ty"><option value="book" ${i.type=='book'?'selected':''}>كتاب</option><option value="research" ${i.type=='research'?'selected':''}>بحث</option></select></label>${inp('ti','العنوان',i.title)}${inp('au','المؤلف أو الباحث',i.author)}<label>القائمة<select id="ca">${d.cats.map(c=>`<option ${c==i.cat?'selected':''}>${esc(c)}</option>`).join('')}</select></label>${inp('yr','السنة',i.year)}${inp('cv','رابط صورة الغلاف',i.cover)}${inp('lk','رابط الملف',i.link)}<label class="f">الوصف<textarea id="ds" rows="3">${esc(i.desc)}</textarea></label></div><p><button class="btn" id="ad">${eid?'حفظ التعديل':'إضافة'}</button></p></div><div class="pn"><h2>المحتوى الحالي (${d.items.length})</h2>${d.items.map(x=>`<div class="rw"><span>${esc(x.title)} <small class="mut">${x.type=='book'?'كتاب':'بحث'}</small></span><span><button class="btn g" data-ed="${x.id}">تعديل</button>${del('items',x.id)}</span></div>`).join('')}</div>`},
  menus:()=>`<div class="pn"><h2>روابط القائمة العلوية</h2><div class="fm">${inp('mt','العنوان')}${inp('mu','الرابط (مثل page.html)')}</div><p><button class="btn" id="am">إضافة رابط</button></p>${d.menus.map((m,k)=>`<div class="rw"><span>${esc(m.title)} <small class="mut">${esc(m.url)}</small></span>${del('menus',k)}</div>`).join('')}</div><div class="pn"><h2>قوائم التصنيف</h2><div class="fm">${inp('ct','اسم القائمة الجديدة')}</div><p><button class="btn" id="ac2">إضافة قائمة</button></p>${d.cats.map((c,k)=>`<div class="rw"><span>${esc(c)}</span>${del('cats',k)}</div>`).join('')}</div>`,
  team:()=>`<div class="pn"><h2>فريق الإشراف</h2><div class="fm">${inp('tn','الاسم')}${inp('tr','المنصب')}${inp('tb','نبذة قصيرة')}</div><p><button class="btn" id="at">إضافة مشرف</button></p>${d.team.map((m,k)=>`<div class="rw"><span>${esc(m.name)} <small class="mut">${esc(m.role)}</small></span>${del('team',k)}</div>`).join('')}</div><div class="pn"><h2>معايير النشر</h2><label class="fm"><textarea id="po" rows="5">${esc(d.policy.join('\n'))}</textarea></label><p><button class="btn" id="sp">حفظ المعايير (سطر لكل معيار)</button></p></div>`,
  pub:()=>{const c=cfg();return `<div class="pn"><h2>النشر على GitHub</h2>${LS.gt?`<p>هذا الجهاز مربوط بالمستودع <b>${esc(c.o)}/${esc(c.r)}</b>. أي حفظ بيتنشر تلقائيًا.</p><p><button class="btn" id="pb">نشر الآن</button> <button class="btn g" id="lo">تسجيل الخروج من هذا الجهاز</button></p>`:`<p class="mut">اعمل الربط مرة واحدة. الرمز بيتحفظ مشفّر بكلمة مرور، وبعدها على أي جهاز تدخل بكلمة المرور بس. استخدم كلمة مرور قوية (١٢ حرف أو أكتر).</p><div class="fm">${inp('gt','رمز الوصول (Fine-grained token بصلاحية Contents)','','password')}${inp('pw','كلمة مرور الإدارة','','password')}</div><p><button class="btn" id="sk">ربط وحفظ</button></p>`}<details><summary>إعدادات متقدمة</summary><div class="fm">${inp('go','اسم الحساب',c.o)}${inp('gr','اسم المستودع',c.r)}</div><p><button class="btn g" id="sa">حفظ الإعدادات</button></p></details></div><div class="pn"><h2>نسخة احتياطية</h2><p><button class="btn g" id="dl">تنزيل data.json</button> <label class="btn g">استيراد data.json<input id="im" type="file" accept=".json" hidden></label> <button class="btn g" id="rs">إلغاء التعديلات غير المنشورة</button></p></div>`}};
 const draw=()=>{$('#app').innerHTML=`<div class="w ad"><aside>${Object.entries(tabs).map(([k,v])=>`<button data-tab="${k}" class="${k==tab?'on':''}">${v}</button>`).join('')}</aside><section>${LS.getItem('satr_data')?'<div class="pn"><b>فيه تعديلات لسه ما اتنشرتش.</b> <button class="btn" id="pb2">نشر الآن</button></div>':''}${P[tab]()}</section></div>`};
 const v=id=>$('#'+id).value.trim();
 const applyLook=()=>{Object.assign(d.site,{name:v('n'),tagline:v('tg'),accent:v('ac'),radius:+v('rd'),font:v('fn'),showName:$('#sn').checked});d.about=v('ab')};
 const setLogo=u=>{applyLook();d.site.logo=u;save('تم رفع الشعار');draw()};
 draw();
 $('#app').addEventListener('input',e=>{if(tab=='look'&&e.target.id=='ac'||e.target.id=='rd'){R.style.setProperty('--ac',v('ac'));R.style.setProperty('--r',v('rd')+'px')}});
 $('#app').onclick=async e=>{const b=e.target.closest('button');if(!b)return;const id=b.id,D=b.dataset;
  if(D.tab){tab=D.tab;eid=null}
  else if(D.ed){eid=+D.ed;tab='items'}
  else if(D.del){const[k,i]=D.del.split(':');if(k=='items')d.items=d.items.filter(x=>x.id!=i);else d[k].splice(+i,1);save('تم الحذف')}
  else if(id=='sv'){applyLook();save()}
  else if(id=='rl'){applyLook();delete d.site.logo;save('تم حذف الشعار')}
  else if(id=='ad'){if(!v('ti'))return toast('اكتب العنوان أولًا');const o={type:v('ty'),title:v('ti'),author:v('au'),cat:v('ca'),year:v('yr'),cover:v('cv'),link:v('lk'),desc:v('ds')};
   if(eid)Object.assign(d.items.find(x=>x.id==eid),o);else d.items.unshift({id:Date.now(),...o});eid=null;save('تم الحفظ')}
  else if(id=='am'){if(v('mt')&&v('mu')){d.menus.push({title:v('mt'),url:v('mu')});save()}else return toast('أدخل العنوان والرابط')}
  else if(id=='ac2'){if(v('ct')){d.cats.push(v('ct'));save()}else return toast('اكتب اسم القائمة')}
  else if(id=='at'){if(v('tn')){d.team.push({name:v('tn'),role:v('tr'),bio:v('tb')});save()}else return toast('اكتب الاسم')}
  else if(id=='sp'){d.policy=v('po').split('\n').map(x=>x.trim()).filter(Boolean);save()}
  else if(id=='dl'){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(d,null,1)],{type:'application/json'}));a.download='data.json';a.click();return}
  else if(id=='rs'){LS.removeItem('satr_data');return location.reload()}
  else if(id=='pb'||id=='pb2'){await pub(d);return}
  else if(id=='sa'){LS.go=v('go');LS.gr=v('gr');return toast('تم حفظ الإعدادات')}
  else if(id=='lo'){LS.removeItem('gt');return location.reload()}
  else if(id=='sk'){const t=v('gt'),w=$('#pw').value;if(!t||w.length<8)return toast('أدخل الرمز وكلمة مرور ٨ أحرف على الأقل');LS.gt=t;d.vault=await seal(t,w);save('تم الربط')}
  draw()};
 $('#app').addEventListener('change',e=>{if(e.target.id=='lf'){const f=e.target.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>{if(f.type=='image/svg+xml')return setLogo(rd.result);const im=new Image();im.onload=()=>{const h=Math.min(120,im.height),w=Math.round(im.width*h/im.height),c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(im,0,0,w,h);setLogo(c.toDataURL('image/png'))};im.src=rd.result};rd.readAsDataURL(f);return}
 if(e.target.id=='im'){const f=e.target.files[0];f.text().then(t=>{Object.assign(d,JSON.parse(t));save('تم الاستيراد');draw()})}});
}
let Q=Promise.resolve();
const pub=d=>Q=Q.then(()=>pub1(d));
async function pub1(d){
 if(!LS.gt)return toast('اربط الحساب أولًا من تبويب النشر');
 const c=cfg(),u=`https://api.github.com/repos/${c.o}/${c.r}/contents/data.json`,h={Authorization:'Bearer '+LS.gt,Accept:'application/vnd.github+json'};
 try{let sha;const t='?t='+Date.now(),o={headers:h,cache:'no-store'};const g=await fetch(u+t,o);if(g.ok)sha=(await g.json()).sha;else{const l=await fetch(u.replace('/data.json','')+t,o);if(l.ok){const a=await l.json();sha=(Array.isArray(a)?a.find(f=>f.name=='data.json'):null)?.sha}}
  const x=await fetch(u,{method:'PUT',headers:h,body:JSON.stringify({message:'تحديث محتوى سطر',sha,content:btoa(unescape(encodeURIComponent(JSON.stringify(d,null,1))))})});
  if(x.ok){LS.removeItem('satr_data');const b=$('#pb2');if(b)b.closest('.pn').remove();toast('تم النشر. يظهر على كل الأجهزة بعد دقيقة تقريبًا')}else{const j=await x.json().catch(()=>({}));toast('فشل النشر: '+x.status+' '+(j.message||'')+(sha?'':' (قراءة الملف الحالي: '+g.status+')'))}
 }catch(e){toast('تعذر الاتصال بـ GitHub')}
}
