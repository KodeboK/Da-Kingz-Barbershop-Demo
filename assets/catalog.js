export const DEFAULT_SERVICES = [
 ['haircut','Haircut','Corte de cabello',3000,'scissors'],
 ['haircut-shave','Haircut + Shave','Corte de cabello y afeitado',3500,'razor'],
 ['haircut-hot-towel','Haircut + Hot Towel Shave','Corte y afeitado con toalla caliente',4000,'towel'],
 ['kids-haircut','Kids’ Haircut (Under 10)','Corte infantil (menores de 10 años)',2000,'child'],
 ['hot-towel-shave','Hot Towel Shave','Afeitado con toalla caliente',2000,'towel'],
 ['shave','Shave','Afeitado',1500,'razor'],
 ['tape-up','Tape-Up','Degradado en patillas y nuca',2500,'clipper'],
 ['shape-up','Shape-Up','Perfilado de cabello',1000,'clipper'],
 ['eyebrows','Eyebrows','Cejas',500,'brow'],
 ['shape-up-beard','Shape-Up + Beard','Perfilado de cabello y barba',2000,'razor'],
].map(([id,en,es,cents,icon])=>({id,en,es,cents,icon,descriptionEn:'',descriptionEs:'',enabled:true,providerMap:{},promotion:null}));
export const DEFAULT_BARBERS=[{id:'miguel',name:'Miguel S. Barber',enabled:true,provider:'calendly',url:'https://calendly.com/miguel_barber/haircut',duration:35,primary:'prefill_redirect',fallback:'prefill_embed',timeout:20,services:{},prices:{},mappings:{first_name:'firstName',last_name:'lastName',email:'email',a1:'serviceLabel',a2:'phone'},apiAuthorized:false,contact:''}];
export const METHODS=['prefill_redirect','prefill_embed','direct','manual','api'];
export const money=cents=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(cents/100);
export function quote(service,barber,at=Date.now()){
 if(!service?.enabled||!barber?.enabled||barber.services?.[service.id]===false)throw Error('This service is unavailable. Please choose another.');
 let cents=barber.prices?.[service.id]??service.cents;
 const promo=service.promotion;
 if(promo&&Date.parse(promo.startsAt)<=at&&Date.parse(promo.endsAt)>at)cents=Math.min(cents,promo.cents);
 return {serviceId:service.id,barberId:barber.id,barberName:barber.name,en:service.en,es:service.es,cents,currency:'USD',providerLabel:service.providerMap?.[barber.id]||null};
}
export function priceLabel(service,barbers,lang='en'){
 if(!service.enabled)return money(service.cents);
 const prices=barbers.filter(b=>b.enabled&&b.services?.[service.id]!==false).map(b=>quote(service,b).cents);
 return (new Set(prices).size>1?(lang==='es'?'Desde ':'From '):'')+money(prices.length?Math.min(...prices):service.cents);
}
