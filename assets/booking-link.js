export const BOOKING_NOTICE_VERSION='2026-11-booking-v2';
export const FALLBACK_CONTACT='tel:+18454805578';
export function prefilledBookingURL(barber,details,label,attempt='',language='en'){
 const u=new URL(barber.url);if(u.origin!=='https://calendly.com'||u.username||u.password)throw Error('Online booking is unavailable.');
 for(const key of ['month','first_name','last_name','email','a1','a2'])u.searchParams.delete(key);
 const fields={first_name:details.firstName,last_name:details.lastName,email:details.email,a1:label,a2:details.phone};
 const values={...details,serviceLabel:label};for(const [key,field] of Object.entries(barber.mappings||{}))if(Object.hasOwn(fields,key)&&values[field])fields[key]=values[field];
 for(const [key,value] of Object.entries(fields))if(value)u.searchParams.set(key,value);
 u.searchParams.set('hide_event_type_details','1');u.searchParams.set('hide_gdpr_banner','1');u.searchParams.set('locale',language==='es'?'es':'en');
 if(attempt)u.searchParams.set('utm_content',attempt);
 return u.href;
}

export function normalizePhone(v){let s=String(v||'').trim();if(!/^[+\d().\s-]+$/.test(s))throw Error('Enter a valid cellphone number.');const digits=s.replace(/\D/g,'');if(digits.length===10&&!s.startsWith('+'))return '+1'+digits;if(digits.length===11&&digits.startsWith('1'))return '+'+digits;if(s.startsWith('+')&&/^[1-9]\d{6,14}$/.test(digits))return '+'+digits;throw Error('Use a country code for numbers outside the US.');}
export function customerDetails(data){const firstName=String(data.firstName||'').trim().slice(0,80),lastName=String(data.lastName||'').trim().slice(0,80),email=String(data.email||'').trim().toLowerCase();if(!firstName||!lastName||!/^\S+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254)throw Error('Enter your name and a valid email address.');return {firstName,lastName,email,phone:normalizePhone(data.phone),language:data.language==='es'?'es':'en'};}
