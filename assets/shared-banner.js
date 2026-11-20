import {setupBanner,bannerSettings,endDateLabel} from './banner.js';
let last='';
async function update(){
 try{
 const response=await fetch('https://da-kingz-barbershop.bk441012.chatgpt.site/public/banner',{cache:'no-store'});if(!response.ok)return;
 const b=bannerSettings(await response.json());const current=JSON.stringify(b);if(current===last)return;last=current;
 const old=document.querySelector('.temporary-banner');if(old)old.remove();document.documentElement.classList.remove('has-temporary-banner');
 if(!b.enabled||!b.endsAt||Date.parse(b.endsAt)<=Date.now())return;
 const aside=document.createElement('aside');aside.className='temporary-banner';aside.dataset.endsAt=b.endsAt;aside.setAttribute('aria-label','Shop announcement');
 const copy=document.createElement('div');copy.className='announcement-copy';const strong=document.createElement('strong');strong.textContent=b.message;const end=document.createElement('small');end.textContent='Ends '+endDateLabel(b.endsAt);copy.append(strong,end);
 const timer=document.createElement('div');timer.className='announcement-clock';timer.setAttribute('role','timer');for(const key of ['days','hours','minutes','seconds']){const cell=document.createElement('span');const val=document.createElement('b');val.dataset.count=key;const label=document.createElement('small');label.textContent=key.toUpperCase();cell.append(val,label);timer.append(cell)}
 aside.append(copy,timer);document.body.prepend(aside);document.documentElement.classList.add('has-temporary-banner');setupBanner();
 }catch{}
}
update();setInterval(update,30000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)update()});
