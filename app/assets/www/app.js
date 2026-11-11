(function(){
var $=function(i){return document.getElementById(i)};
var C=null,DB,rc=null,busy=false,tab='home',flt='all',UPD=false;
var KL={notes:'Notes',questions:'Practice',quiz:'Quiz',mid:'Mid exam',final:'Final exam',mock:'Mock exam'};
var IC={notes:'📝',questions:'❓',quiz:'⚡',mid:'📄',final:'🎯',mock:'🧪'};
var EX=['questions','quiz','mid','final','mock'];
var CT=[['telegram','✈️','Telegram'],['telegram_channel','📢','Telegram channel'],['phone','📞','Call us'],['email','✉️','Email'],['facebook','📘','Facebook'],['instagram','📸','Instagram'],['tiktok','🎵','TikTok'],['youtube','▶️','YouTube'],['website','🌐','Website']];
var NOC='<div class="card"><div class="ic">📶</div><div><h3>Content not downloaded yet</h3><small>Connect to the internet once to download your notes and exams.</small></div></div>';
var SK='<div class="sk"></div><div class="sk"></div><div class="sk"></div>';

function db(){return DB||(DB=new Promise(function(res,rej){var r=indexedDB.open('bdu',1);r.onupgradeneeded=function(){r.result.createObjectStore('kv')};r.onsuccess=function(){res(r.result)};r.onerror=function(){rej(r.error)}}))}
function kget(k){return db().then(function(d){return new Promise(function(res){var q=d.transaction('kv').objectStore('kv').get(k);q.onsuccess=function(){res(q.result)};q.onerror=function(){res(null)}})}).catch(function(){return null})}
function kset(k,v){return db().then(function(d){return new Promise(function(res,rej){var t=d.transaction('kv','readwrite');t.objectStore('kv').put(v,k);t.oncomplete=res;t.onerror=function(){rej(t.error)}})})}
function key(){return 'c:'+SB.phone}
function uid(){try{return JSON.parse(atob(SB.t.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))).sub}catch(e){return ''}}
function get(q,retry){return fetch(SB.U+'/rest/v1/'+q,{headers:{apikey:SB.K,Authorization:'Bearer '+SB.t}}).then(function(r){
 if(r.status==401&&!retry)return SB.refresh().then(function(ok){if(ok)return get(q,1);throw 0});
 if(!r.ok)throw r.status;return r.json()})}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function wm(p){var s="<svg xmlns='http://www.w3.org/2000/svg' width='190' height='130'><text x='10' y='75' font-size='16' fill='gray' fill-opacity='.2' transform='rotate(-25 95 65)' font-family='sans-serif'>"+p+"</text></svg>";
 var d=$('wm');if(!d){d=document.createElement('div');d.id='wm';document.body.appendChild(d)}
 d.style.backgroundImage='url("data:image/svg+xml,'+encodeURIComponent(s)+'")'}

function acc(c){return c.is_free||(C&&C.prem)}
function chap(id){return C.ch.filter(function(c){return c.id==id})[0]}
function qn(it){return it.data&&it.data.items?it.data.items.length:0}
function cnt(c){var n=0,q=0;(c.items||[]).forEach(function(it){if(it.kind=='notes')n++;else q+=qn(it)});return{n:n,q:q}}
function S(){return(C&&C.set)||{}}
function page(h){var d=document.createElement('div');d.className='pg';d.innerHTML='<div class="bar"><b class="bk">←</b><span></span></div><div class="bd"></div>';d.querySelector('span').textContent=h;document.body.appendChild(d);d.querySelector('.bk').onclick=function(){d.remove()};return d.querySelector('.bd')}
function row(ic,t,s,g,id,tag,lk){return '<div class="card" data-go="'+g+'" data-id="'+esc(id)+'"><div class="ic'+(lk?' lk':'')+'">'+ic+'</div><div style="min-width:0"><h3>'+esc(t)+'</h3><small>'+esc(s)+'</small></div>'+(tag||'')+'</div>'}
function tile(e,t,s,g){return '<div class="tile" data-go="'+g+'"><div class="e">'+e+'</div><b>'+t+'</b><small>'+s+'</small></div>'}
function sect(t,h){return '<div class="sec"><h2>'+t+'</h2></div>'+(h||'<div class="em">Nothing here yet</div>')}
function listFor(fn){var f='',p='';
 C.ch.forEach(function(c){var h='';
  if(acc(c)){(c.items||[]).forEach(function(it,k){if(fn(it))h+=row(IC[it.kind]||'📄',it.title,'Chapter '+c.no+' • '+(KL[it.kind]||it.kind)+(it.kind!='notes'?' • '+qn(it)+' questions':''),'open',c.id+':'+k)})}
  else h=row('🔒','Chapter '+c.no+' • '+c.title,'Premium content','premium','','<span class="tag lock">🔒</span>',1);
  if(c.is_free)f+=h;else p+=h});
 return{f:f,p:p}}

function home(){var v=$('v-home');if(!C){v.innerHTML=NOC;return}
 var n=0,q=0;C.ch.forEach(function(c){if(!acc(c))return;var k=cnt(c);n+=k.n;q+=k.q});
 var h='<div class="hero"><small>Welcome back 👋</small><h1>'+esc(SB.phone)+'</h1><span class="bdg'+(C.prem?' pro':'')+'">'+(C.prem?'⭐ PREMIUM MEMBER':'FREE PLAN')+'</span><div class="stats"><div class="st"><b>'+C.ch.length+'</b><span>Chapters</span></div><div class="st"><b>'+n+'</b><span>Notes</span></div><div class="st"><b>'+q+'</b><span>Questions</span></div></div></div>';
 h+='<div class="upd'+(UPD?' show':'')+'"><span>🔔 New update available</span><button data-go="update">Refresh</button></div>';
 h+='<div class="sec"><h2>Quick access</h2></div><div class="grid">'+tile('📝','Notes','Study notes','notes')+tile('🧪','Exams','Quizzes & mocks','exams')+tile(C.prem?'✅':'⭐','Premium',C.prem?'Active':'Unlock all','premium')+tile('🔄','Updates','Get new content','update')+'</div>';
 h+='<div class="sec"><h2>Chapters</h2><small>'+C.ch.length+' total</small></div>';
 C.ch.forEach(function(c){var ok=acc(c),k=cnt(c);
  h+='<div class="card" data-go="'+(ok?'chapter':'premium')+'" data-id="'+c.id+'"><div class="num'+(ok?'':' lk')+'">'+c.no+'</div><div style="min-width:0"><h3>'+esc(c.title)+'</h3><small>'+(ok?k.n+' notes • '+k.q+' questions':'🔒 Premium chapter')+'</small></div><span class="tag '+(ok?'free':'lock')+'">'+(c.is_free?'FREE':ok?'✅ OPEN':'🔒 PREMIUM')+'</span></div>'});
 v.innerHTML=h}
function notesV(){var v=$('v-notes');if(!C){v.innerHTML=NOC;return}
 var L=listFor(function(it){return it.kind=='notes'});
 v.innerHTML='<div class="sec"><h2>📝 Notes</h2></div>'+sect('Free notes',L.f)+sect('Premium notes',L.p)}
function examsV(){var v=$('v-exams');if(!C){v.innerHTML=NOC;return}
 var F=[['all','All'],['questions','Practice'],['quiz','Quiz'],['mid','Mid'],['final','Final'],['mock','Mock']];
 var h='<div class="sec"><h2>🧪 Exams & Practice</h2></div><div class="chips">'+F.map(function(f){return '<button class="chip'+(flt==f[0]?' on':'')+'" data-go="filter" data-id="'+f[0]+'">'+f[1]+'</button>'}).join('')+'</div>';
 var L=listFor(function(it){return EX.indexOf(it.kind)>=0&&(flt=='all'||it.kind==flt)});
 v.innerHTML=h+sect('Free',L.f)+sect('Premium',L.p)}
function profileV(){var v=$('v-profile'),pro=C&&C.prem,nP=0,eP=0,eA=0;
 if(C)C.ch.forEach(function(c){(c.items||[]).forEach(function(it){var ex=EX.indexOf(it.kind)>=0;if(ex&&acc(c))eA++;if(!c.is_free){if(it.kind=='notes')nP++;else if(ex)eP++}})});
 var h='<div class="pc"><div class="pa">👤</div><h2>'+esc(SB.phone)+'</h2><span class="bdg'+(pro?' pro':'')+'">'+(pro?'⭐ PREMIUM MEMBER':'FREE PLAN')+'</span></div>';
 h+='<div class="info"><div class="ir"><span>Phone number</span><b>'+esc(SB.phone)+'</b></div><div class="ir"><span>Account type</span><b>'+(pro?'Premium ⭐':'Free')+'</b></div><div class="ir"><span>Device</span><b>Linked to this phone ✅</b></div><div class="ir"><span>Last updated</span><b>'+(C&&C.t?esc(new Date(C.t).toLocaleString()):'—')+'</b></div><div class="ir"><span>App version</span><b>1.0</b></div></div>';
 h+='<div class="sec"><h2>My content</h2></div><div class="grid">'+tile('🧪','My Exams',eA+' available','exams')+tile(pro?'📝':'🔒','Premium Notes',pro?nP+' notes':'Locked',pro?'pnotes':'premium')+tile(pro?'🎯':'🔒','Premium Exams',pro?eP+' sets':'Locked',pro?'pexams':'premium')+tile('🔄','Updates','Check for new','update')+'</div>';
 if(!pro)h+='<button class="btn2" data-go="premium">⭐ Unlock Premium</button>';
 h+='<button class="btn3" data-go="logout">🚪 Logout</button>';
 v.innerHTML=h}
function renderTab(){['home','notes','exams','profile'].forEach(function(k){$('v-'+k).classList.toggle('on',k==tab);$('n-'+k).classList.toggle('on',k==tab)});
 ({home:home,notes:notesV,exams:examsV,profile:profileV})[tab]();
 $('dot').style.display=UPD?'block':'none';$('dp').textContent=(SB.phone||'')+(C&&C.prem?' • ⭐ Premium':'')}
function tabTo(a){tab=a;document.querySelectorAll('.pg').forEach(function(p){p.remove()});renderTab();scrollTo(0,0)}

function chapter(c){var b=page('Chapter '+c.no+' • '+c.title),its=c.items||[];
 if(!its.length){b.innerHTML='<p class="em">Content coming soon.<br>Open the menu and tap “Check for updates”.</p>';return}
 var h='';[['notes','📝 Notes'],['questions','❓ Practice questions'],['x','🧪 Exams']].forEach(function(g){var s='';
  its.forEach(function(it,i){var m=g[0]=='x'?(['quiz','mid','final','mock'].indexOf(it.kind)>=0):it.kind==g[0];
   if(m)s+=row(IC[it.kind]||'📄',it.title,KL[it.kind]+(it.kind!='notes'?' • '+qn(it)+' questions':''),'open',c.id+':'+i)});
  if(s)h+='<div class="sec"><h2>'+g[1]+'</h2></div>'+s});
 b.innerHTML=h}
function plist(k){if(!C.prem)return premium();var b=page(k=='notes'?'⭐ Premium Notes':'🎯 Premium Exams'),h='';
 C.ch.forEach(function(c){if(c.is_free)return;(c.items||[]).forEach(function(it,i){var ex=EX.indexOf(it.kind)>=0;
  if(k=='notes'?it.kind=='notes':ex)h+=row(IC[it.kind]||'📄',it.title,'Chapter '+c.no+' • '+KL[it.kind],'open',c.id+':'+i)})});
 b.innerHTML=h||'<p class="em">Nothing here yet</p>'}
function notes(it){var b=page(it.title);b.innerHTML='<div class="nt">'+(it.data.html||'')+'</div>'}
function quiz(it){var b=page(it.title),Q=(it.data&&it.data.items)||[],i=0,s=0;
 if(!Q.length){b.innerHTML='<p class="em">No questions yet</p>';return}
 function show(){
  if(i>=Q.length){var pc=Math.round(s/Q.length*100);
   b.innerHTML='<div class="res"><div class="ring" style="--v:'+pc+'"><span>'+pc+'%</span></div><h2>'+(pc>=70?'🎉 Great job!':pc>=50?'👍 Good effort':'📚 Keep practicing')+'</h2><p class="sub">You got '+s+' of '+Q.length+' correct</p><button class="btn2" id="rt">🔁 Try again</button></div>';
   $('rt').onclick=function(){i=0;s=0;show()};return}
  var q=Q[i],done=false;
  b.innerHTML='<div class="qh"><span>Question '+(i+1)+' of '+Q.length+'</span><span>✅ '+s+'</span></div><div class="prog"><i style="width:'+(i/Q.length*100)+'%"></i></div><h3 class="qq"></h3>';
  b.querySelector('.qq').textContent=q.q;
  q.o.forEach(function(o,k){var x=document.createElement('div');x.className='op';x.innerHTML='<i>'+'ABCDEFGH'[k]+'</i><span></span>';x.querySelector('span').textContent=o;
   x.onclick=function(){if(done)return;done=true;
    if(k==q.a){s++;x.classList.add('ok')}else{x.classList.add('no');b.querySelectorAll('.op')[q.a].classList.add('ok')}
    if(q.e){var e=document.createElement('div');e.className='ex';e.textContent='💡 '+q.e;b.appendChild(e)}
    var n=document.createElement('button');n.className='btn2';n.textContent=i+1<Q.length?'Next ➜':'Finish';
    n.onclick=function(){i++;show()};b.appendChild(n);n.scrollIntoView({behavior:'smooth',block:'end'})};
   b.appendChild(x)})}
 show()}

function link(k,v){v=String(v).trim();if(/^(https?:|tel:|mailto:)/.test(v))return v;
 if(k=='telegram'||k=='telegram_channel')return 'https://t.me/'+v.replace(/^@/,'');
 if(k=='phone')return 'tel:'+v.replace(/\s/g,'');if(k=='email')return 'mailto:'+v;return 'https://'+v}
function about(){var b=page('ℹ️ About us');
 b.innerHTML='<div class="pc"><img class="lg" src="icon.png" onerror="this.style.display=\'none\'"><h2>BDU PREMIUM</h2><small>Exam & Study Companion</small></div><div class="info"><div class="ab"></div></div><div class="sec"><h2>✨ What you get</h2></div><div class="info"><div class="ir"><b>📝 Best & premium notes</b></div><div class="ir"><b>❓ Practice questions per chapter</b></div><div class="ir"><b>🧪 Quizzes, mid, final & mock exams</b></div><div class="ir"><b>📶 Works offline</b></div></div><button class="btn2" data-go="contact">📞 Contact us</button>';
 b.querySelector('.ab').textContent=S().about||'BDU PREMIUM helps Bahir Dar University students prepare with premium notes, practice questions, quizzes and mock exams, even without internet.'}
function contact(){var b=page('📞 Contact us'),s=S(),h='';
 CT.forEach(function(c){if(!s[c[0]])return;h+='<a class="card" href="'+esc(link(c[0],s[c[0]]))+'"><div class="ic">'+c[1]+'</div><div style="min-width:0"><h3>'+c[2]+'</h3><small class="pay">'+esc(s[c[0]])+'</small></div><span class="tag free">Open</span></a>'});
 b.innerHTML='<p class="sub" style="margin-bottom:14px">We reply fastest on Telegram 💬</p>'+(h||'<p class="em">Contact details coming soon</p>')}

function premium(){var b=page('⭐ Premium');
 if(C&&C.prem){b.innerHTML='<div class="res"><div class="ring" style="--v:100"><span>⭐</span></div><h2>You are Premium</h2><p class="sub">All chapters, notes and exams are unlocked.</p></div>';return}
 b.innerHTML='<p class="em">Loading...</p>';rc=null;
 Promise.all([get('settings?select=key,value'),get('payments?select=status&order=created_at.desc&limit=1')]).then(function(r){
  var s={};r[0].forEach(function(x){s[x.key]=x.value});var p=r[1][0];
  if(p&&p.status=='approved'){b.innerHTML='<p class="em">✅ Approved! Unlocking your content...</p>';
   return download(true).then(function(){if(C&&C.prem){b.parentNode.remove();premium()}else b.innerHTML='<div class="ex">⚠️ Your payment was approved but your account is not unlocked yet. Please contact the admin.</div>'})}
  var h='<div class="pc"><div class="pa">⭐</div><h2>Unlock Premium</h2><small>All chapters • Premium notes • All exams</small></div>';
  if(s.price)h+='<div class="info"><div class="ir"><span>Price</span><b id="pr"></b></div></div>';
  h+='<div class="sec"><h2>💳 How to pay</h2></div><div class="ex pay" id="pi" style="white-space:pre-wrap"></div>';
  if(p&&p.status=='pending')h+='<div class="ex">⏳ Your receipt is waiting for admin approval. This page updates by itself.</div><button class="btn2" id="chk">🔄 Check status</button>';
  else{if(p&&p.status=='declined')h+='<div class="ex" style="background:rgba(239,68,68,.15)">❌ Your last receipt was declined. Please send a correct one.</div>';
   h+='<img id="pv" style="display:none;width:100%;border-radius:14px;margin-top:10px"><button class="btn2" id="pk">📎 Choose receipt screenshot</button><button class="btn2" id="sd" style="display:none;background:#10B981">📤 Send for approval</button>'}
  b.innerHTML=h;$('pi').textContent=s.payment_info||'Payment details coming soon';if(s.price)$('pr').textContent=s.price;
  if($('chk')){
   $('chk').onclick=function(){check().then(function(){if(C&&C.prem){b.parentNode.remove();premium()}else toast('⏳ Still waiting for approval')})};
   var iv=setInterval(function(){if(!document.body.contains(b)){clearInterval(iv);return}
    check().then(function(){if(C&&C.prem&&document.body.contains(b)){clearInterval(iv);b.parentNode.remove();premium()}})},15000)}
  if($('pk')){
   $('pk').onclick=function(){if(window.Native)Native.postMessage('pick')};
   window.onPicked=function(x){rc=x;$('pv').src='data:image/jpeg;base64,'+x;$('pv').style.display='block';$('sd').style.display='block'};
   $('sd').onclick=send}
 }).catch(function(){b.innerHTML='<p class="em">Could not load. Check your internet and try again 📵</p>'})}
function send(){if(!rc)return;var bt=$('sd');bt.disabled=true;bt.textContent='Sending...';
 var bin=atob(rc),u=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
 var path=uid()+'/'+Date.now()+'.jpg';
 SB.refresh().then(function(){return fetch(SB.U+'/storage/v1/object/receipts/'+path,{method:'POST',headers:{apikey:SB.K,Authorization:'Bearer '+SB.t,'Content-Type':'image/jpeg'},body:u})})
 .then(function(r){if(!r.ok)throw 'Upload failed';
  return fetch(SB.U+'/functions/v1/submit-receipt',{method:'POST',headers:{apikey:SB.K,Authorization:'Bearer '+SB.t,'Content-Type':'application/json'},body:JSON.stringify({path:path})})})
 .then(function(r){return r.json().then(function(j){if(!r.ok)throw j.error||'Failed'})})
 .then(function(){toast('✅ Sent! Wait for admin approval');var p=document.querySelectorAll('.pg');p[p.length-1].remove();premium()})
 .catch(function(e){toast('❌ '+(typeof e=='string'?e:'No internet'));bt.disabled=false;bt.textContent='📤 Send for approval'})}

function dl(t,p){$('dl').classList.add('on');$('dlt').textContent=t;$('dlf').style.width=(p||0)+'%'}
function dlx(){$('dl').classList.remove('on')}
function download(ui){
 if(busy)return Promise.resolve();busy=true;if(ui)dl('Connecting...',5);
 return Promise.all([get('profiles?select=is_premium'),get('content_version?select=version&id=eq.1'),get('chapters?select=*&order=no'),get('settings?select=key,value')]).then(function(r){
  var prem=!!(r[0][0]&&r[0][0].is_premium),ver=r[1][0]?r[1][0].version:0,ch=r[2],set={},out=[],i=0;
  r[3].forEach(function(x){set[x.key]=x.value});
  function next(){if(i>=ch.length)return Promise.resolve();var c=ch[i++];
   if(ui)dl('Downloading chapter '+i+' of '+ch.length,Math.round(i/ch.length*100));else toast('⬇️ Updating '+i+'/'+ch.length);
   return get('chapter_content?chapter_id=eq.'+c.id+'&select=kind,title,data&order=id').then(function(items){c.items=items;out.push(c);return next()})}
  return next().then(function(){C={ver:ver,prem:prem,t:Date.now(),set:set,ch:out};UPD=false;return kset(key(),C).catch(function(){})}).then(function(){busy=false;dlx();renderTab();toast('✅ Updated successfully')})
 }).catch(function(e){busy=false;dlx();throw e})}
function check(){
 return Promise.all([get('profiles?select=is_premium'),get('content_version?select=version&id=eq.1')]).then(function(r){
  var prem=!!(r[0][0]&&r[0][0].is_premium),ver=r[1][0]?r[1][0].version:0;
  if(!C||!C.set||C.prem!==prem)return download(!C);
  if(prem&&C.ch.some(function(c){return !c.is_free&&(!c.items||!c.items.length)}))return download(false);
  if(C.ver!==ver){UPD=true;renderTab()}
 }).catch(function(e){if(typeof e=='number'&&e>=400)toast('⚠️ Server error '+e)})}
function refresh(){if(busy)return;dl('Checking for updates...',10);
 Promise.all([get('profiles?select=is_premium'),get('content_version?select=version&id=eq.1')]).then(function(r){
  var prem=!!(r[0][0]&&r[0][0].is_premium),ver=r[1][0]?r[1][0].version:0;
  if(!C||!C.set||C.prem!==prem||C.ver!==ver)return download(true);
  dlx();toast('✅ You are up to date')
 }).catch(function(e){dlx();toast(typeof e=='number'&&e>=400?'⚠️ Server error '+e:'📵 No internet connection')})}

function closeDr(){$('dr').classList.remove('on');$('scrim').classList.remove('on')}
function go(a,id){
 if(['home','notes','exams','profile'].indexOf(a)>=0)return tabTo(a);
 if(!C&&['chapter','open','pnotes','pexams'].indexOf(a)>=0)return;
 if(a=='premium')premium();else if(a=='update')refresh();else if(a=='about')about();else if(a=='contact')contact();
 else if(a=='logout')SB.logout();else if(a=='chapter')chapter(chap(id));
 else if(a=='open'){var p=String(id).split(':'),c=chap(p[0]),it=c&&c.items&&c.items[p[1]];if(it)it.kind=='notes'?notes(it):quiz(it)}
 else if(a=='pnotes')plist('notes');else if(a=='pexams')plist('exam');
 else if(a=='filter'){flt=id;examsV()}}
document.addEventListener('click',function(e){var t=e.target.closest('[data-go]');if(!t)return;if(t.closest('#dr'))closeDr();go(t.getAttribute('data-go'),t.getAttribute('data-id'))});
$('mb').onclick=function(){$('dr').classList.add('on');$('scrim').classList.add('on')};
$('scrim').onclick=closeDr;
$('av').onclick=function(){tabTo('profile')};
window.goBack=function(){
 if($('dr').classList.contains('on')){closeDr();return true}
 var p=document.querySelectorAll('.pg');if(p.length){p[p.length-1].remove();return true}
 if(tab!='home'){tabTo('home');return true}
 return false};
document.addEventListener('visibilitychange',function(){if(!document.hidden&&SB.t)check()});
window.addEventListener('focus',function(){if(SB.t)check()});
window.addEventListener('online',function(){if(SB.t)check()});
window.addEventListener('loggedin',function(){wm(SB.phone);tab='home';$('v-home').innerHTML=SK;renderTab();$('v-home').innerHTML=SK;
 kget(key()).then(function(c){C=c||null;tabTo('home');check()})});
window.addEventListener('loggedout',function(){C=null;UPD=false;closeDr();document.querySelectorAll('.pg').forEach(function(p){p.remove()})});
})();
