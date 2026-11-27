import {DEFAULT_SERVICES} from "./catalog.js";
export const SPANISH={
'© 2026 All rights reserved.':'© 2026 Todos los derechos reservados.','Shop branding and supplied media belong to their respective owners.':'La marca de la barbería y el material proporcionado pertenecen a sus respectivos propietarios.','How was your visit?':'¿Qué tal tu visita?','Dismiss review reminder':'Cerrar recordatorio de reseña',
'BARBERSHOP · NYACK, NY':'BARBERÍA · NYACK, NY','days':'días','hours':'horas','minutes':'minutos','seconds':'segundos','Choose a sample time':'Elige un horario de ejemplo','Switch color theme':'Cambiar tema',
'BARBERSHOP':'BARBERÍA','EVERY CUT.':'CADA CORTE.','A STATEMENT.':'CON ESTILO.','Haircuts, beard trims and custom designs in Nyack, New York.':'Cortes, arreglo de barba y diseños personalizados en Nyack, Nueva York.',
'Book':'Citas','Call':'Llamar','Book Appointment':'Reservar cita','Get Directions':'Cómo llegar','Services':'Servicios','Gallery':'Galería','Visit':'Visítanos','Directions':'Cómo ir','Privacy':'Privacidad','Terms & rights':'Términos y derechos','All rights reserved.':'Todos los derechos reservados.','View gallery':'Ver galería','Explore services':'Explorar servicios','Find the shop':'Encontrar la barbería','EXPLORE THE SHOP':'CONOCE LA BARBERÍA','THE KINGZ STANDARD':'EL ESTÁNDAR KINGZ','THE DETAILS':'LOS DETALLES','MAKE THE CUT.':'HACEN LA DIFERENCIA.','A fresh fade. A clean neckline. A beard shaped to suit you. Tell us what you’re after when you sit down in the chair.':'Un degradado fresco. Una nuca impecable. Una barba a tu medida. Cuéntanos qué buscas al sentarte en el sillón.',
'FEATURED CUTS.':'CORTES DESTACADOS.','SERVICES & PRICING':'SERVICIOS Y PRECIOS','IN THE':'EN EL','CHAIR.':'SILLÓN.','Haircut':'Corte de pelo','Beard Trim (Corte de barba)':'Arreglo de barba','Hair Designs (Diseños en el pelo)':'Diseños en el pelo','Hair Coloring':'Coloración de cabello','Hair Extensions':'Extensiones de cabello','Hair Designs':'Diseños','Haircuts':'Cortes','The Shop':'La barbería','All photos':'Todas las fotos','Call the shop for pricing and availability.':'Llama para consultar precios y disponibilidad.','Book this service':'Reservar este servicio','INSIDE DA KINGZ':'DENTRO DE DA KINGZ','YOUR CHAIR':'TU SILLÓN','IN NYACK.':'EN NYACK.','Find Da Kingz at 4 Waldron Ave. Tell us how you wear your hair, what you want to change and what you want to keep.':'Encuéntranos en 4 Waldron Ave. Cuéntanos cómo llevas tu cabello, qué quieres cambiar y qué quieres mantener.',
'THE GALLERY':'LA GALERÍA','DA KINGZ':'DA KINGZ','IN FOCUS.':'EN IMÁGENES.','View on Instagram':'Ver en Instagram','APPOINTMENTS':'CITAS','BOOK':'RESERVA','YOUR CHAIR.':'TU SILLÓN.','Call the shop to set up your next cut.':'Llama para programar tu próximo corte.','Choose your barber and service, then schedule in Calendly.':'Elige tu barbero y servicio, y reserva en Calendly.','ON INSTAGRAM':'EN INSTAGRAM','FOLLOW THE':'SIGUE A LOS','KINGZ.':'KINGZ.','VISIT THE SHOP':'VISÍTANOS','PULL UP.':'VEN.','GET FRESH.':'RENUEVA TU ESTILO.','From the community':'Nuestra comunidad','Read Google reviews':'Leer reseñas en Google','Load Map':'Cargar mapa',
'Open until':'Hasta','Closing soon at':'Cierra pronto','Opens at':'Abre','Shop hours':'Horario','Shop Hours':'Horario','Monday':'Lunes','Tuesday':'Martes','Wednesday':'Miércoles','Thursday':'Jueves','Friday':'Viernes','Saturday':'Sábado','Sunday':'Domingo','Closed':'Cerrado','Ready to book?':'¿Listo para reservar?',
'Book an appointment':'Reserva una cita','Schedule preview · Sample times only':'Vista previa · Horarios de ejemplo','Barber':'Barbero','Barber #1':'Barbero #1','Barber #2':'Barbero #2','Barber #3':'Barbero #3','Service':'Servicio','Appointment platform':'Plataforma de citas','Google Calendar':'Google Calendar','Calendly':'Calendly','Google Calendar appointment preview. Times below are examples.':'Vista previa de Google Calendar. Los horarios son ejemplos.','Calendly-managed appointment preview. Times below are examples; no appointment is submitted.':'Vista previa de citas con Calendly. Los horarios son ejemplos; no se reserva ninguna cita.','Choose a date':'Elige una fecha','Eastern Time':'Hora del Este','Online booking is coming soon. Call the shop to make an appointment.':'Las reservas en línea estarán disponibles pronto. Llama para reservar.','Call to book':'Llamar para reservar','Let us know your experience by leaving us a review':'Cuéntanos tu experiencia dejando una reseña','Leave a review':'Dejar una reseña','Maybe later':'Quizás después','DAYS':'DÍAS','HOURS':'HORAS','MINUTES':'MINUTOS','SECONDS':'SEGUNDOS','Close booking':'Cerrar reservas','Close gallery':'Cerrar galería','Close review invitation':'Cerrar invitación de reseña','Previous month':'Mes anterior','Next month':'Mes siguiente','Return to top':'Volver al inicio','Skip to content':'Saltar al contenido','Switch to light theme':'Cambiar a tema claro','Switch to dark theme':'Cambiar a tema oscuro',
};
export function setupExperience(){
 const es={...SPANISH,...Object.fromEntries(DEFAULT_SERVICES.map(s=>[s.en,s.es]))};
 let language=document.documentElement.dataset.languageRoute || (/\/es\/?$/.test(location.pathname)?'es':'en');
 const base=document.querySelector('base'),siteRoot=base?.getAttribute('href').replace(/es\/?$/,'')||'/';
 function syncRoute(){const path=siteRoot+(language==='es'?'es/':'');if(location.pathname!==path)history.replaceState(null,'',path+location.search+location.hash);if(base)base.setAttribute('href',path);try{localStorage.setItem('kingz-language',language)}catch{}}
 syncRoute();
 const originals=new WeakMap(), originalsAttr=new WeakMap();
 const inverse=Object.fromEntries(Object.entries(es).map(([a,b])=>[b,a]));
 let queued=false;
 function translate(){
  document.documentElement.lang=language;
  document.querySelectorAll('[data-copy-en]').forEach(el=>{const v=language==='es'?el.dataset.copyEs:el.dataset.copyEn;if(el.textContent!==v)el.textContent=v});
  document.querySelectorAll('[data-lang]').forEach(b=>b.dataset.active=String(b.dataset.lang===language));
  document.querySelector('[data-language-toggle]')?.setAttribute('aria-checked',String(language==='es'));
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  let node;
  while((node=walker.nextNode())){
   if(node.parentElement?.closest('script,style,[data-lang],[data-copy-en],.dock-effect'))continue;
   const current=node.textContent, trimmed=current.trim();
   if(!trimmed)continue;
   let base=originals.get(node);
   if(!base|| (current!==base&&current.trim()!==es[base.trim()])){base=inverse[trimmed]?current.replace(trimmed,inverse[trimmed]):current;originals.set(node,base)}
   const text=language==='es'&&es[base.trim()]?base.replace(base.trim(),es[base.trim()]):base;
   if(current!==text)node.textContent=text;
  }
  document.querySelectorAll('[aria-label],[title]').forEach(el=>{
   let record=originalsAttr.get(el)||{};
   for(const attr of ['aria-label','title']){const v=el.getAttribute(attr);if(!v)continue;if(!record[attr])record[attr]=inverse[v]||v;const next=language==='es'?(es[record[attr]]||record[attr]):record[attr];if(v!==next)el.setAttribute(attr,next)}
   originalsAttr.set(el,record);
  });
 }
 document.querySelector('[data-language-toggle]')?.addEventListener('click',()=>{language=language==='en'?'es':'en';syncRoute();translate();document.dispatchEvent(new Event('kingz-language'))});
 const observer=new MutationObserver(()=>{if(!queued){queued=true;queueMicrotask(()=>{queued=false;translate()})}});
 observer.observe(document.body,{childList:true,subtree:true,characterData:true});translate();
 const dialog=document.querySelector('#review-invite');
 const services=[...document.querySelectorAll('#services .service summary')];
 const section=document.querySelector('#services');
 let shown=false,eligible=false,visited=false,revealTimer=0,scanQueued=false,previous;
 const passedServices=()=>section&&section.getBoundingClientRect().bottom<=((document.querySelector('.site-head')?.getBoundingClientRect().bottom||80)+12);
 const show=()=>{
  if(document.body.dataset.bookingActive==='true'||!dialog||!eligible||shown||!passedServices()||document.hidden||document.querySelector('dialog[open]'))return;
  shown=true;previous=document.activeElement;dialog.showModal();dialog.querySelector('.review-dismiss').focus();
 };
 function scan(){
  if(!dialog||shown||!services.length||!section)return;
  const bounds=section.getBoundingClientRect();
  const headerBottom=(document.querySelector('.site-head')?.getBoundingClientRect().bottom||80)+12;
  if(bounds.top<innerHeight&&bounds.bottom>headerBottom)visited=true;
  eligible=visited&&passedServices();
  if(!eligible){clearTimeout(revealTimer);revealTimer=0;return}
  if(!revealTimer)revealTimer=setTimeout(()=>{revealTimer=0;show()},500);
 }
 const queueScan=()=>{if(!scanQueued){scanQueued=true;requestAnimationFrame(()=>{scanQueued=false;scan()})}};
 addEventListener('scroll',queueScan,{passive:true});addEventListener('resize',queueScan);document.addEventListener('click',queueScan);setTimeout(scan,1000);
 document.addEventListener('visibilitychange',show);document.addEventListener('close',show,true);
 dialog?.addEventListener('close',()=>previous?.focus());
 dialog?.addEventListener('click',e=>{if(e.target===dialog||e.target.closest('.review-dismiss,.review-later'))dialog.close()});
 const reviewSection=document.querySelector('.reviews'),bubble=document.querySelector('.review-bubble');
 if(reviewSection&&bubble){
  const watch=new IntersectionObserver(entries=>{if(!entries.some(e=>e.isIntersecting))return;watch.disconnect();bubble.hidden=false;setTimeout(()=>bubble.hidden=true,12000)},{threshold:.4});watch.observe(reviewSection);
  bubble.querySelector('.bubble-dismiss')?.addEventListener('click',()=>bubble.hidden=true);
  bubble.querySelector('a')?.addEventListener('click',()=>bubble.hidden=true);
 }

}
