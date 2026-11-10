(function(){
var $=function(i){return document.getElementById(i)};
var C=null,DB,rc=null,busy=false;
function db(){return DB||(DB=new Promise(function(res,rej){var r=indexedDB.open('bdu',1);r.onupgradeneeded=function(){r.result.createObjectStore('kv')};r.onsuccess=function(){res(r.result)};r.onerror=function(){rej(r.error)}}))}
function kget(k){return db().then(function(d){return new Promise(function(res){var q=d.transaction('kv').objectStore('kv').get(k);q.onsuccess=function(){res(q.result)};q.onerror=function(){res(null)}})}).catch(function(){return null})}
function kset(k,v){return db().then(function(d){return new Promise(function(res,rej){var t=d.transaction('kv','readwrite');t.objectStore('kv').put(v,k);t.oncomplete=res;t.onerror=function(){rej(t.error)}})})}
function key(){return 'c:'+SB.phone}
function uid(){try{return JSON.parse(atob(SB.t.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))).sub}catch(e){return ''}}
function get(q,retry){return fetch(SB.U+'/rest/v1/'+q,{headers:{apikey:SB.K,Authorization:'Bearer '+SB.t}}).then(function(r){
 if(r.status==401&&!retry)return SB.refresh().then(function(ok){if(ok)return get(q,1);throw 0});
 if(!r.ok)throw r.status;return r.json()})}
function wm(p){var s="<svg xmlns='http://www.w3.org/2000/svg' width='190' height='130'><text x='10' y='75' font-size='16' fill='gray' fill-opacity='.2' transform='rotate(-25 95 65)' font-family='sans-serif'>"+p+"</text></svg>";
 var d=$('wm');if(!d){d=document.createElement('div');d.id='wm';document.body.appendChild(d)}
 d.style.backgroundImage='url("data:image/svg+xml,'+encodeURIComponent(s)+'")'}
window.goBack=function(){var p=document.querySelectorAll('.pg');if(p.length){p[p.length-1].remove();return true}return false};
function page(h){var d=document.createElement('div');d.className='pg';d.innerHTML='<div class="bar"><b class="bk">←</b><span></span></div><div class="bd"></div>';d.querySelector('span').textContent=h;document.body.appendChild(d);d.querySelector('.bk').onclick=function(){d.remove()};return d.querySelector('.bd')}
function card(b,icon,t,s,fn){var d=document.createElement('div');d.className='card';d.innerHTML='<div class="ic">'+icon+'</div><div><h3></h3><small></small></div>';d.querySelector('h3').textContent=t;d.querySelector('small').textContent=s;d.onclick=fn;b.appendChild(d)}
var IC={notes:'📝',questions:'❓',quiz:'⚡',mid:'📄',final:'🎯',mock:'🧪'};

function render(){var L=$('list');L.innerHTML='';
 $('unl').textContent=(C&&C.prem)?'🔄 Sync content':'⭐ Unlock Premium';
 if(!C){L.innerHTML='<div class="card">Connect to the internet once to download your content 📶</div>';return}
 if(!C.ch.length){L.innerHTML='<div class="card">No chapters yet</div>';return}
 C.ch.forEach(function(c){var ok=c.is_free||C.prem,d=document.createElement('div');d.className='card';
  d.innerHTML='<div class="ic">📘</div><div><h3>Chapter '+c.no+'</h3><small></small></div><span class="tag '+(ok?'free':'lock')+'">'+(c.is_free?'FREE':ok?'✅ OPEN':'🔒 PREMIUM')+'</span>';
  d.querySelector('small').textContent=c.title;
  d.onclick=function(){ok?chapter(c):toast('🔒 Premium required')};L.appendChild(d)})}

function chapter(c){var b=page('Chapter '+c.no+' • '+c.title);
 if(!c.items||!c.items.length){b.innerHTML='<p class="em">Content coming soon.<br>Tap Sync content on the home screen if you just paid.</p>';return}
 c.items.forEach(function(it){card(b,IC[it.kind]||'📄',it.title,it.kind,function(){it.kind=='notes'?notes(it):quiz(it)})})}
function notes(it){var b=page(it.title);b.innerHTML='<div class="nt">'+(it.data.html||'')+'</div>'}
function quiz(it){var b=page(it.title),Q=(it.data&&it.data.items)||[],i=0,s=0;
 if(!Q.length){b.innerHTML='<p class="em">No questions yet</p>';return}
 function show(){
  if(i>=Q.length){b.innerHTML='<div class="box2"><h2>🎉 Done!</h2><p>Score: '+s+' / '+Q.length+'</p></div>';return}
  var q=Q[i],done=false;b.innerHTML='<small>Question '+(i+1)+' / '+Q.length+'</small><h3 class="qq"></h3>';
  b.querySelector('.qq').textContent=q.q;
  q.o.forEach(function(o,k){var x=document.createElement('div');x.className='op';x.textContent=o;
   x.onclick=function(){if(done)return;done=true;
    if(k==q.a){s++;x.classList.add('ok')}else{x.classList.add('no');b.querySelectorAll('.op')[q.a].classList.add('ok')}
    if(q.e){var e=document.createElement('div');e.className='ex';e.textContent='💡 '+q.e;b.appendChild(e)}
    var n=document.createElement('button');n.className='btn2';n.textContent=i+1<Q.length?'Next ➜':'Finish';
    n.onclick=function(){i++;show()};b.appendChild(n)};
   b.appendChild(x)})}
 show()}
function exams(){var b=page('📝 Exams'),n=0;
 (C?C.ch:[]).forEach(function(c){(c.items||[]).forEach(function(it){
  if(['quiz','mid','final','mock'].indexOf(it.kind)<0)return;n++;
  card(b,IC[it.kind],it.title,'Chapter '+c.no+' • '+it.kind,function(){quiz(it)})})});
 if(!n)b.innerHTML='<p class="em">No exams yet</p>'}

function premium(){var b=page('⭐ Premium');
 if(C&&C.prem){b.innerHTML='<div class="box2"><h2>✅ You are Premium</h2><p>All chapters are unlocked.</p></div>';return}
 b.innerHTML='<p class="em">Loading...</p>';rc=null;
 Promise.all([get('settings?select=key,value'),get('payments?select=status&order=created_at.desc&limit=1')]).then(function(r){
  var s={};r[0].forEach(function(x){s[x.key]=x.value});var p=r[1][0];
  if(p&&p.status=='approved'){
   b.innerHTML='<p class="em">✅ Approved! Unlocking your content...</p>';
   return download().then(function(){
    if(C&&C.prem){b.parentNode.remove();premium()}
    else b.innerHTML='<div class="ex">⚠️ Your payment was approved but your account is not unlocked yet. Please contact the admin.</div>'})}
  var h='<h3>Unlock all chapters</h3>';if(s.price)h+='<p style="margin:8px 0"><b>Price:</b> <span id="pr"></span></p>';
  h+='<div class="ex pay" id="pi" style="white-space:pre-wrap"></div>';
  if(p&&p.status=='pending')h+='<div class="ex">⏳ Your receipt is waiting for admin approval. This page updates by itself.</div><button class="btn2" id="chk">🔄 Check status</button>';
  else{if(p&&p.status=='declined')h+='<div class="ex" style="background:rgba(239,68,68,.15)">❌ Your last receipt was declined. Please send a correct one.</div>';
   h+='<img id="pv" style="display:none;width:100%;border-radius:14px;margin-top:10px"><button class="btn2" id="pk">📎 Choose receipt screenshot</button><button class="btn2" id="sd" style="display:none;background:#10B981">📤 Send for approval</button>'}
  b.innerHTML=h;$('pi').textContent=s.payment_info||'Payment details coming soon';if(s.price)$('pr').textContent=s.price;
  if($('chk')){
   $('chk').onclick=function(){check().then(function(){if(C&&C.prem){b.parentNode.remove();premium()}else toast('⏳ Still waiting for approval')})};
   var iv=setInterval(function(){
    if(!document.body.contains(b)){clearInterval(iv);return}
    check().then(function(){if(C&&C.prem&&document.body.contains(b)){clearInterval(iv);b.parentNode.remove();premium()}})},15000)}
  if($('pk')){
   $('pk').onclick=function(){if(window.Native)Native.postMessage('pick')};
   window.onPicked=function(x){rc=x;$('pv').src='data:image/jpeg;base64,'+x;$('pv').style.display='block';$('sd').style.display='block'};
   $('sd').onclick=send}
 }).catch(function(){b.innerHTML='<p class="em">Could not load. Check your internet and try again 📵</p>'})}
function send(){if(!rc)return;var bt=$('sd');bt.disabled=true;bt.textContent='Sending...';
 var bin=atob(rc),u=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
 var path=uid()+'/'+Date.now()+'.jpg';
 SB.refresh().then(function(){
  return fetch(SB.U+'/storage/v1/object/receipts/'+path,{method:'POST',headers:{apikey:SB.K,Authorization:'Bearer '+SB.t,'Content-Type':'image/jpeg'},body:u})})
 .then(function(r){if(!r.ok)throw 'Upload failed';
  return fetch(SB.U+'/functions/v1/submit-receipt',{method:'POST',headers:{apikey:SB.K,Authorization:'Bearer '+SB.t,'Content-Type':'application/json'},body:JSON.stringify({path:path})})})
 .then(function(r){return r.json().then(function(j){if(!r.ok)throw j.error||'Failed'})})
 .then(function(){toast('✅ Sent! Wait for admin approval');var p=document.querySelectorAll('.pg');p[p.length-1].remove();premium()})
 .catch(function(e){toast('❌ '+(typeof e=='string'?e:'No internet'));bt.disabled=false;bt.textContent='📤 Send for approval'})}

function download(q){
 if(busy)return Promise.resolve();busy=true;
 return Promise.all([get('profiles?select=is_premium'),get('content_version?select=version&id=eq.1'),get('chapters?select=*&order=no')]).then(function(r){
  var prem=!!(r[0][0]&&r[0][0].is_premium),ver=r[1][0]?r[1][0].version:0,ch=r[2],out=[],i=0;
  function next(){if(i>=ch.length)return Promise.resolve();var c=ch[i++];if(!q)toast('⬇️ Downloading '+i+'/'+ch.length);
   return get('chapter_content?chapter_id=eq.'+c.id+'&select=kind,title,data&order=id').then(function(items){c.items=items;out.push(c);return next()})}
  return next().then(function(){C={ver:ver,prem:prem,ch:out};return kset(key(),C).catch(function(){})}).then(function(){render();if(!q)toast('✅ Updated')})
 }).then(function(){busy=false},function(e){busy=false;throw e})}
function check(){
 return Promise.all([get('profiles?select=is_premium'),get('content_version?select=version&id=eq.1')]).then(function(r){
  var prem=!!(r[0][0]&&r[0][0].is_premium),ver=r[1][0]?r[1][0].version:0;
  if(!C||C.prem!==prem)return download();
  if(prem&&C.ch.some(function(c){return !c.is_free&&(!c.items||!c.items.length)}))return download(true);
  if(C.ver!==ver)$('upd').style.display='flex'
 }).catch(function(e){if(typeof e=='number'&&e>=400)toast('⚠️ Server error '+e)})}

$('ub').onclick=function(){$('upd').style.display='none';download().catch(function(){toast('❌ Update failed, try again')})};
$('nh').onclick=function(){document.querySelectorAll('.pg').forEach(function(p){p.remove()});scrollTo(0,0)};
$('ne').onclick=exams;$('np').onclick=premium;
$('unl').onclick=function(){if(C&&C.prem)download().catch(function(){toast('❌ Sync failed, check your internet')});else premium()};
document.addEventListener('visibilitychange',function(){if(!document.hidden&&SB.t)check()});
window.addEventListener('focus',function(){if(SB.t)check()});
window.addEventListener('online',function(){if(SB.t)check()});
window.addEventListener('loggedin',function(){wm(SB.phone);kget(key()).then(function(c){C=c||null;render();check()})});
})();
