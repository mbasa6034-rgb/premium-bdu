(function(){
var U='https://gpqmzioipdpgfwymjjfp.supabase.co';
var K='sb_publishable_hA9Shuy0QkhkX-VN0Ymzzw_yYMUegyW';
var S=null,signup=false,$=function(i){return document.getElementById(i)};
window.SB={U:U,K:K,t:null,phone:''};
var ov=document.createElement('div');ov.id='auth';
ov.innerHTML='<div class="box"><img src="icon.png" onerror="this.style.display=\'none\'" style="width:72px;border-radius:18px"><h2>BDU PREMIUM</h2><p>Login to continue</p><input id="ph" type="tel" placeholder="Phone: 09XXXXXXXX" maxlength="10"><input id="pw" type="password" placeholder="Password (min 6)"><button id="go">Login</button><a id="sw">Create account</a><small id="er"></small></div>';
document.body.appendChild(ov);
var sh=document.createElement('div');sh.id='sheet';
sh.innerHTML='<div class="box"><h2>👤 Profile</h2><p id="who"></p><button id="lo">Logout</button><button class="alt" id="cl">Close</button></div>';
document.body.appendChild(sh);
function api(path,body,tok){var h={'apikey':K,'Content-Type':'application/json'};if(tok)h['Authorization']='Bearer '+tok;
 return fetch(U+path,{method:'POST',headers:h,body:JSON.stringify(body)}).then(function(r){return r.json().then(function(j){return {ok:r.ok,s:r.status,j:j}})})}
function err(m){$('er').textContent=m||''}
function save(j,p){S={a:j.access_token,r:j.refresh_token,p:p};SB.t=j.access_token;SB.phone=p;localStorage.setItem('bdu_s',JSON.stringify(S))}
function logout(m){localStorage.removeItem('bdu_s');S=null;SB.t=null;sh.style.display='none';ov.style.display='flex';err(m);window.dispatchEvent(new Event('loggedout'))}
SB.refresh=function(){if(!S)return Promise.resolve(false);
 return api('/auth/v1/token?grant_type=refresh_token',{refresh_token:S.r}).then(function(x){
  if(x.ok&&x.j.access_token){save(x.j,S.p);return true}
  if(x.s==400||x.s==401)logout('Please login again');
  return false})};
function enter(){api('/rest/v1/rpc/claim_device',{p_device:window.DEVICE_ID},S.a).then(function(x){
 if(x.ok&&x.j===true){ov.style.display='none';err('');window.dispatchEvent(new Event('loggedin'))}
 else if(x.ok)logout('This account is used on another phone 📵');
 else err('Server error, try again')}).catch(function(){err('No internet connection')})}
function offline(){ov.style.display='none';window.dispatchEvent(new Event('loggedin'))}
$('sw').onclick=function(){signup=!signup;$('go').textContent=signup?'Create account':'Login';$('sw').textContent=signup?'I have an account':'Create account';err()};
$('go').onclick=function(){var p=$('ph').value.trim(),w=$('pw').value;
 if(!/^0[79]\d{8}$/.test(p))return err('Enter a valid phone like 09XXXXXXXX');
 if(w.length<6)return err('Password must be at least 6 characters');
 err('Please wait...');
 api(signup?'/auth/v1/signup':'/auth/v1/token?grant_type=password',{email:p+'@bdupremium.app',password:w}).then(function(x){
  if(x.ok&&x.j.access_token){save(x.j,p);enter()}
  else err(x.j.msg||x.j.error_description||x.j.message||'Failed')}).catch(function(){err('No internet connection')})};
$('npr').onclick=function(){if(S){$('who').textContent='📱 '+S.p;sh.style.display='flex'}};
$('cl').onclick=function(){sh.style.display='none'};
$('lo').onclick=function(){logout('')};
function start(){var s=localStorage.getItem('bdu_s');if(!s)return;S=JSON.parse(s);SB.t=S.a;SB.phone=S.p;
 api('/auth/v1/token?grant_type=refresh_token',{refresh_token:S.r}).then(function(x){
  if(x.ok&&x.j.access_token){save(x.j,S.p);enter()}
  else if(x.s==400||x.s==401)logout('Please login again');
  else offline()}).catch(offline)}
if(window.DEVICE_ID)start();else window.addEventListener('deviceready',start);
})();
