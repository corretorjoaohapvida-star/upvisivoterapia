(() => {
"use strict";
const cfg=window.ATLAS_UPSELL||{};
const filters=[...document.querySelectorAll("[data-theme]")];
filters.forEach(button=>button.addEventListener("click",()=>{
 filters.forEach(b=>b.setAttribute("aria-pressed",String(b===button)));
 document.querySelectorAll(".theme").forEach(p=>p.hidden=p.id!=="theme-"+button.dataset.theme);
}));
const dialog=document.querySelector("#image-dialog");
const dialogImage=document.querySelector("#dialog-img");
let trigger=null;
document.querySelectorAll("[data-image]").forEach(button=>button.addEventListener("click",()=>{
 trigger=button; dialogImage.src=button.dataset.image; dialogImage.alt=button.dataset.title;
 document.querySelector("#dialog-title").textContent=button.dataset.title;
 dialog.showModal();
}));
if(dialog){
 document.querySelector("#close-dialog").addEventListener("click",()=>dialog.close());
 dialog.addEventListener("click",e=>{if(e.target===dialog)dialog.close();});
 dialog.addEventListener("close",()=>{if(trigger)trigger.focus();});
}
const sticky=document.querySelector(".sticky"),offer=document.querySelector("#ajouter");
if(sticky&&offer&&"IntersectionObserver" in window){
 new IntersectionObserver(entries=>sticky.classList.toggle("is-hidden",entries[0].isIntersecting),{threshold:.1}).observe(offer);
}
document.querySelectorAll("[data-access]").forEach(a=>a.href=cfg.accessUrl||"https://consumer.hotmart.com/");
if(cfg.legalOwner&&document.querySelector("#owner-line")){
 const p=document.querySelector("#owner-line"); p.textContent=cfg.legalOwner;p.hidden=false;
}
const status=document.querySelector("#hotmart-status"), statusText=document.querySelector("#hotmart-status-text"), retry=document.querySelector("#hotmart-retry"), target=document.querySelector("#hotmart-sales-funnel");
if(!target)return;
const fail=()=>{status.hidden=false;statusText.textContent="Le opzioni Hotmart non sono disponibili. Ricarica la pagina o torna dal percorso del tuo ordine.";retry.hidden=false;};
retry.addEventListener("click",()=>window.location.reload());
// Widget supplied and explicitly authorized by the offer owner. This does not verify a purchase or delivery.
if(!cfg.hotmartWidgetEnabled){
 statusText.textContent="Le opzioni di aggiunta non sono disponibili al momento.";
 return;
}
// Only hide the empty localhost preview. On published pages Hotmart decides eligibility, not our URL heuristic.
const showOfficialWidget=!( ['localhost','127.0.0.1','[::1]'].includes(window.location.hostname)&&window.location.search.length<=1 );
if(!showOfficialWidget){
 target.hidden=true;
 statusText.textContent="Per visualizzare le opzioni di acquisto e rifiuto, apri questa pagina dal percorso del tuo ordine Hotmart.";
}else{
statusText.textContent="Caricamento delle opzioni sicure Hotmart…";
}
const script=document.createElement("script");script.src=cfg.hotmartScript;script.async=true;
script.onerror=fail;
script.onload=()=>{
 try{
  if(!window.checkoutElements||typeof window.checkoutElements.init!=="function"){fail();return;}
  // Official widget receives original page URL/query. No copied merchant ID or fabricated session.
  window.checkoutElements.init("salesFunnel").mount("#hotmart-sales-funnel");
  const observer=new MutationObserver(()=>{if(target.querySelector("iframe")){status.hidden=showOfficialWidget;observer.disconnect();}});
  observer.observe(target,{childList:true,subtree:true});
  if(target.querySelector("iframe")){status.hidden=showOfficialWidget;observer.disconnect();}
  window.setTimeout(()=>{observer.disconnect();if(!target.querySelector("iframe"))fail();},15000);
 }catch(_){fail();}
};
document.head.appendChild(script);
})();

