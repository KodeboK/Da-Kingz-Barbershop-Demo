import { DEFAULT_SERVICES, DEFAULT_BARBERS, quote, money } from './catalog.js';
export function setupSeamlessBooking(dialog) {
    if (!dialog)
        return;
    const root = dialog.querySelector('[data-booking-root]');
    if (!root)
        return;
    const demo = document.documentElement.dataset.page === 'demo';const privacyURL=demo?(document.querySelector('base')?.getAttribute('href')||'/').replace(/es\/?$/,'')+'privacy/':'/privacy';
    let catalog = DEFAULT_SERVICES, barbers = DEFAULT_BARBERS, step = 0, busy = false, csrf = '', attempt = null, chosenBarber = 'miguel', chosenService = 'haircut', details = {}, attemptKey = crypto.randomUUID(), providerResult = null, config={recognitionDays:90}, initialized=false;
    const text = (en, es) => document.documentElement.lang === 'es' ? es : en, lang = () => document.documentElement.lang === 'es' ? 'es' : 'en';
    const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const current = () => quote(catalog.find(s => s.id === chosenService), barbers.find(b => b.id === chosenBarber));
    async function api(endpoint, data) { const r = await fetch('/api/booking/' + endpoint, { method: data ? 'POST' : 'GET', headers: data ? { 'Content-Type': 'application/json', 'X-Kingz-CSRF': csrf } : {}, body: data ? JSON.stringify(data) : undefined, cache: 'no-store' }); const v = await r.json(); if (!r.ok)
        throw Error(v.error || text('Please try again or use direct booking.', 'Inténtalo de nuevo o reserva directamente.')); return v; }
    function fallback() { const b = barbers.find(b => b.id === chosenBarber) || DEFAULT_BARBERS[0]; return demo ? `<p class="booking-notice">${text('Demonstration only. No information is saved and no appointments are submitted.', 'Solo demostración. No se guardan datos ni se envían citas.')}</p>` : `<a class="button outline direct-booking" href="${esc(b.url)}" target="_blank" rel="noopener noreferrer">${text('Book directly with Calendly', 'Reservar directamente en Calendly')}</a><p class="booking-fineprint">${text('Direct booking works even when our secure form is unavailable.', 'La reserva directa funciona aunque nuestro formulario no esté disponible.')}</p>`; }
    function progress() { return `<ol class="booking-progress">${[['Barber', 'Barbero'], ['Service', 'Servicio'], ['Details', 'Datos'], ['Schedule', 'Horario']].map(([en, es], i) => `<li ${i === step ? 'aria-current="step"' : ''} class="${i < step ? 'complete' : ''}">${text(en, es)}</li>`).join('')}</ol>`; }
    function formInput(name, en, es, type, autocomplete) { return `<label>${text(en, es)}<input name="${name}" type="${type}" autocomplete="${autocomplete}" value="${esc(details[name] || '')}" required maxlength="${name === 'email' ? 254 : 80}" ${type === 'tel' ? 'inputmode="tel" placeholder="+1 845 555 0123"' : ''}></label>`; }
    function render() { root.innerHTML = progress() + `<div role="alert" class="booking-error" data-booking-error></div>` + (step === 0 ? `<h3>${text('Choose your barber', 'Elige tu barbero')}</h3><div class="barber-options">${barbers.filter(b => b.enabled).map(b => `<button type="button" data-barber="${esc(b.id)}" aria-pressed="${b.id === chosenBarber}"><strong>${esc(b.name)}</strong><span>Da Kingz Barbershop</span></button>`).join('')}</div>` : step === 1 ? `<h3>${text('Choose your service', 'Elige tu servicio')}</h3><div class="service-options">${catalog.filter(s => s.enabled && barbers.find(b => b.id === chosenBarber)?.services?.[s.id] !== false).map(s => { const q = quote(s, barbers.find(b => b.id === chosenBarber)); return `<button type="button" data-service-choice="${esc(s.id)}" aria-pressed="${s.id === chosenService}"><span>${esc(lang() === 'es' ? s.es : s.en)}</span><strong>${money(q.cents)}</strong></button>`; }).join('')}</div>` : step === 2 ? `<div class="booking-quote"><strong>${esc(current().barberName)}</strong><span>${esc(current()[lang()])} · ${money(current().cents)}</span></div><form data-customer-form>${formInput('firstName', 'First name', 'Nombre', 'text', 'given-name')}${formInput('lastName', 'Last name', 'Apellido', 'text', 'family-name')}${formInput('email', 'Email', 'Correo electrónico', 'email', 'email')}${formInput('phone', 'Cellphone', 'Celular', 'tel', 'tel')}<label class="honeypot" aria-hidden="true">Website<input name="website" tabindex="-1" autocomplete="off"></label><label class="consent"><input type="checkbox" name="privacy" required ${details.privacy ? 'checked' : ''}>${text('I agree to secure storage of these details and their transfer to Calendly to arrange this appointment.', 'Acepto el almacenamiento seguro de estos datos y su transferencia a Calendly para gestionar esta cita.')} <a href="${privacyURL}" target="_blank" rel="noopener">${text('Privacy', 'Privacidad')}</a></label><label class="consent"><input name="remember" type="checkbox" ${details.remember ? 'checked' : ''}>${text(`Remember this device for ${config.recognitionDays} days. Existing profiles require verification.`,`Recordar este dispositivo por ${config.recognitionDays} días. Los perfiles existentes requieren verificación.`)}</label><label class="consent"><input name="emailMarketing" type="checkbox" ${details.emailMarketing ? 'checked' : ''}>${text('Optional: email reminders and offers.', 'Opcional: recordatorios y ofertas por correo.')}</label><label class="consent"><input name="smsMarketing" type="checkbox" ${details.smsMarketing ? 'checked' : ''}>${text('Optional: text message reminders and offers.', 'Opcional: recordatorios y ofertas por mensaje de texto.')}</label><p class="booking-fineprint">${text('If you continue in an external Calendly page, the prefilled details appear in its URL. The embedded option transfers them using JavaScript instead.', 'Si continúas en una página externa de Calendly, los datos aparecen en su enlace. La opción integrada los transfiere mediante JavaScript.')}</p><label>${text('Booking method', 'Método de reserva')}<select name="method">${[...new Set([barbers.find(b=>b.id===chosenBarber)?.primary,barbers.find(b=>b.id===chosenBarber)?.fallback])].filter(x=>x&&x!=='api').map(method=>`<option value="${method}">${method==='prefill_embed'?text('Embedded Calendly','Calendly integrado'):method==='prefill_redirect'?text('Prefilled Calendly page','Página de Calendly con tus datos'):method==='manual'?text('Contact barber','Contactar al barbero'):text('Direct Calendly page','Página directa de Calendly')}</option>`).join('')}</select></label><div data-turnstile-host></div><button type="submit" class="button primary" ${busy ? 'disabled' : ''}>${demo ? text('Preview next step', 'Ver siguiente paso') : text('Save details and continue', 'Guardar datos y continuar')}</button></form>` : `<h3>${text('Select your date and time in Calendly', 'Elige fecha y hora en Calendly')}</h3><p>${text('Calendly controls availability and the appointment duration. Website pricing does not update Calendly automatically.', 'Calendly controla la disponibilidad y duración. Los precios del sitio no se actualizan automáticamente en Calendly.')}</p><div data-provider-area></div><p class="booking-notice">${text('A transfer is not a confirmed appointment. Finish scheduling inside Calendly.', 'La transferencia no confirma una cita. Completa la reserva dentro de Calendly.')}</p>`) + `<div class="booking-step-actions">${step > 0 ? `<button type="button" class="button outline" data-booking-back>${text('Back', 'Atrás')}</button>` : ''}${step < 2 ? `<button type="button" class="button primary" data-booking-next>${text('Continue', 'Continuar')}</button>` : ''}</div>${fallback()}`; if (step === 3 && providerResult)
        showProvider(); if(step===2&&config.turnstile)mountChallenge(); }
    function error(e) {const translations={'The price changed. Review the current price and continue.':'El precio cambió. Revisa el precio actual y continúa.','Pricing changed. Return to the service step to review it.':'El precio cambió. Vuelve al servicio para revisarlo.','Please reload the booking form.':'Vuelve a cargar el formulario.','Enter your name and a valid email address.':'Escribe tu nombre y un correo válido.','Use a country code for numbers outside the US.':'Incluye el código de país para números fuera de EE. UU.','This verification channel is not configured. Continue with a new booking.':'La verificación aún no está disponible. Continúa con una reserva nueva.','A site service is temporarily unavailable.':'El servicio no está disponible. Usa la reserva directa.'};root.querySelector('[data-booking-error]').textContent = lang()==='es'?(translations[e.message]||e.message):e.message; }
    async function initialize() { if (demo) {
        render();
        return;
    } try {
        const [cfg, session, recovered] = await Promise.all([api('catalog'), api('session'), api('recover')]);
        config=cfg;catalog = cfg.catalog;
        barbers = cfg.barbers;
        csrf = session.csrf || '';if(csrf)api('initiate',{language:lang(),source:new URLSearchParams(location.search).get('utm_source')||'direct'}).catch(()=>{});
        const recognized=await api('express-details').catch(()=>({recognized:false}));if(recognized.recognized){details=recognized.details;chosenBarber=recognized.preferences.barber||chosenBarber;chosenService=recognized.preferences.service||chosenService;}
        if (recovered.attempt) {
            attempt = recovered.attempt.id;
            chosenBarber = recovered.attempt.barberId;
            chosenService = recovered.attempt.serviceId;
            details = recovered.attempt.details;
            step = 2;
        }
        if (!session.available)
            throw Error(text('Our secure form is unavailable. Please use direct Calendly booking.', 'El formulario seguro no está disponible. Reserva directamente en Calendly.'));
        render();
    }
    catch (e) {
        render();
        error(e);
        root.querySelectorAll('[data-booking-next]').forEach(b => b.disabled = true);
    } }
    root.addEventListener('click', e => { const b = e.target.closest('button'); if (!b)
        return; if (b.dataset.barber) {
        chosenBarber = b.dataset.barber;const first=catalog.find(s=>s.enabled&&barbers.find(b=>b.id===chosenBarber)?.services?.[s.id]!==false);chosenService=first?.id||'';
        attempt = null;
        attemptKey = crypto.randomUUID();
        render();
    } if (b.dataset.serviceChoice) {
        chosenService = b.dataset.serviceChoice;
        attempt = null;
        attemptKey = crypto.randomUUID();
        render();
    } if (b.hasAttribute('data-booking-next')) {
        if(!barbers.some(b=>b.id===chosenBarber&&b.enabled)||!chosenService){error(Error(text('Choose an available barber and service.','Elige un barbero y servicio disponible.')));return}step++;
        render();
    } if (b.hasAttribute('data-booking-back')) {
        if (step === 2)
            details = readForm();
        step--;
        render();
    } });
    function readForm() { const form = root.querySelector('[data-customer-form]'); if (!form)
        return details; const d = Object.fromEntries(new FormData(form)); for (const key of ['privacy', 'remember', 'emailMarketing', 'smsMarketing'])
        d[key] = form.elements[key].checked; d.turnstile=d['cf-turnstile-response']||'';return d; }
    root.addEventListener('invalid',e=>{if(lang()==='es')e.target.setCustomValidity(e.target.validity.typeMismatch?'Escribe un correo válido.':'Completa este campo para continuar.')},true);
    root.addEventListener('input', (e) => { if(e.target.setCustomValidity)e.target.setCustomValidity(''); if (attempt) {
        attempt = null;
        attemptKey = crypto.randomUUID();
    } });
    root.addEventListener('submit', async (e) => { e.preventDefault(); if (busy || !e.target.reportValidity())
        return; details = readForm(); busy = true; e.submitter.disabled = true; try {
        if (demo) {
            step = 3;
            providerResult = null;
            render();
            return;
        }
        if (!csrf)
            throw Error(text('Use direct booking below.', 'Usa la reserva directa.'));
        const q = current();
        const saved = attempt ? { id: attempt } : await api('capture', { ...details, language: lang(), barberId: chosenBarber, serviceId: chosenService, quotedCents: q.cents, attemptKey, source: new URLSearchParams(location.search).get('utm_source') || 'direct' });
        attempt = saved.id;
        providerResult = await api('transfer', { id: attempt, method:details.method });
        step = 3;
        render();
    }
    catch (e) {
        error(e);
    }
    finally {
        busy = false;
        const submit = root.querySelector('[type=submit]');
        if (submit)
            submit.disabled = false;
    } });
    let switchedFallback=false;async function detectFailure(){if(!dialog.open||step!==3||switchedFallback||root.querySelector('[data-calendly-host] iframe'))return;switchedFallback=true;try{providerResult=await api('transfer',{id:attempt,fallback:true});if(providerResult.method!=='prefill_embed'){showProvider();return}}catch{}error(Error(text('Calendly could not load. Use direct booking below.','Calendly no se pudo cargar. Usa la reserva directa.')))}
    function mountChallenge(){const mount=()=>{const host=root.querySelector('[data-turnstile-host]');if(host&&window.turnstile)window.turnstile.render(host,{sitekey:config.turnstile})};if(window.turnstile){mount();return}let script=document.querySelector('script[data-turnstile]');if(!script){script=document.createElement('script');script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';script.dataset.turnstile='true';document.head.append(script)}script.addEventListener('load',mount,{once:true});script.onerror=()=>error(Error(text('Use direct booking below.','Usa la reserva directa.')))}
    function showProvider() { const area = root.querySelector('[data-provider-area]'); if (providerResult.method !== 'prefill_embed') {
        area.innerHTML = `<a class="button primary" href="${esc(providerResult.url)}" rel="noreferrer noopener">${providerResult.method==='manual'?text('Call your barber','Llamar al barbero'):text('Continue to Calendly', 'Continuar a Calendly')}</a>`;
        return;
    } area.innerHTML = `<p data-embed-status>${text('Loading Calendly…', 'Cargando Calendly…')}</p><div data-calendly-host></div>`; const host = area.querySelector('[data-calendly-host]'); const mount = () => { if (!window.Calendly) {
        detectFailure();
        return;
    } window.Calendly.initInlineWidget({ url: providerResult.url, parentElement: host, prefill: providerResult.prefill, utm: providerResult.tracking }); area.querySelector('[data-embed-status]')?.remove(); }; if (window.Calendly)
        mount();
    else {
        let script = document.querySelector('script[data-calendly]');
        if (!script) {
            script = document.createElement('script');
            script.src = 'https://assets.calendly.com/Da-Kingz-Barbershop-Demo/assets/external/widget.js';
            script.dataset.calendly = 'true';
            script.onload = mount;
            script.onerror = detectFailure;
            document.head.append(script);
        }
        else
            script.addEventListener('load', mount, { once: true });
    } setTimeout(() => { if (dialog.open && step === 3 && !host.querySelector('iframe'))
        detectFailure(); }, providerResult.timeout * 1000); }
    addEventListener('message', async (e) => { const frame = root.querySelector('[data-calendly-host] iframe'); if (!frame || e.source !== frame.contentWindow || e.origin !== 'https://calendly.com' || e.data?.event !== 'calendly.event_scheduled' || !attempt || demo)
        return; try {
        await api('client-event', { id: attempt, event: e.data.payload?.event?.uri, invitee: e.data.payload?.invitee?.uri });
        root.querySelector('[data-booking-error]').textContent = text('Calendly reported scheduling. Confirmation is pending verification.', 'Calendly informó de la reserva. La confirmación está pendiente de verificación.');
    }
    catch { } });
    new MutationObserver(() => { if (dialog.open) {
        document.body.dataset.bookingActive = 'true';document.querySelector('[data-review-dialog][open]')?.close();
        if (!initialized) {
            initialized = true;
            initialize();
        }
    }
    else
        delete document.body.dataset.bookingActive; }).observe(dialog, { attributes: true, attributeFilter: ['open'] });
    document.addEventListener('kingz-service-booking',e=>{if(e.detail&&catalog.some(s=>s.id===e.detail)){chosenService=e.detail;attempt=null;attemptKey=crypto.randomUUID();if(initialized){step=1;render()}}});
    document.addEventListener('kingz-language', () => { if (dialog.open) {
        if (step === 2)
            details = readForm();
        render();
    } });
    render();
    if(!demo){const recognize=document.createElement('button');recognize.type='button';recognize.className='text-link returning-booking';recognize.textContent=text('Returning customer? Verify this device','¿Ya eres cliente? Verifica este dispositivo');document.querySelector('#booking .wrap')?.append(recognize);recognize.addEventListener('click',async()=>{const contact=prompt(text('Email for a secure verification link:','Correo para un enlace de verificación:'));if(!contact)return;try{const s=await api('session');csrf=s.csrf;await api('recognize',{channel:'email',contact,language:lang()});recognize.textContent=text('If a profile matches, check your email.','Si hay un perfil, revisa tu correo.')}catch(e){recognize.textContent=e.message}})}
    if (!demo)
        api('express').then(v => { if (!v.recognized || !v.personalize)
            return; const area = document.createElement('div'); area.className = 'express-greeting'; area.innerHTML = `<p>${text('Welcome back', 'Bienvenido de nuevo')}, ${esc(v.customer.firstName)}</p>${v.usual ? `<button class="button outline" data-usual>${text('Book my usual', 'Reservar lo de siempre')}</button>` : ''}<button type="button" class="text-link" data-forget>${text('Not you? Forget this device', '¿No eres tú? Olvidar dispositivo')}</button>`; document.querySelector('.hero-copy')?.append(area); area.querySelector('[data-usual]')?.addEventListener('click', () => { chosenBarber = v.usual.barberId; chosenService = v.usual.serviceId; step = 2; render(); document.querySelector('[data-book]')?.click(); }); area.querySelector('[data-forget]').addEventListener('click', async () => { const s = await api('session'); csrf = s.csrf; await api('forget', {}); area.remove(); }); }).catch(() => { });
}
