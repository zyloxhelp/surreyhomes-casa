/* Surrey Homes — GHL Form Handler FINAL */
(function(){

var TOKEN = 'pit-6e10658c-8903-4db0-9f7f-c6ec2d4a3728';
var LOC   = 'mfjOQXgc3G64dTDYevkh';
var WF    = '04f882c6-ce3c-4c04-b3cd-72637be2ac9d';

function showSuccess(btn){
  if(!btn)return;
  btn.textContent="✓ Sent! I'll reply within 45 minutes.";
  btn.style.cssText='background:#2d7a4a;color:#fff;width:100%;padding:.85rem;border-radius:8px;border:none;font-size:.95rem;cursor:default;display:block;text-align:center;font-family:inherit;font-weight:600;';
  btn.disabled=true;
}

async function createContact(d){
  // Use UPSERT — works even if contact already exists
  var r = await fetch('https://services.leadconnectorhq.com/contacts/upsert',{
    method:'POST',
    headers:{
      'Authorization':'Bearer '+TOKEN,
      'Content-Type':'application/json',
      'Version':'2021-07-28'
    },
    body:JSON.stringify({
      locationId: LOC,
      firstName:  d.firstName || 'Website',
      lastName:   d.lastName  || 'Lead',
      email:      d.email     || '',
      phone:      d.phone     || '',
      address1:   d.address   || '',
      source:     'Website surreyhomes.casa',
      tags:       ['website-lead']
    })
  });
  var j = await r.json();
  var id = j && j.contact && j.contact.id;

  if(id){
    // Add note with full details
    fetch('https://services.leadconnectorhq.com/contacts/'+id+'/notes',{
      method:'POST',
      headers:{'Authorization':'Bearer '+TOKEN,'Content-Type':'application/json','Version':'2021-07-28'},
      body:JSON.stringify({
        body:'WEBSITE LEAD\nService: '+(d.service||'Not specified')+
             '\nPage: '+(d.page||window.location.pathname)+
             '\nAddress: '+(d.address||'')+
             '\nMessage: '+(d.message||'')+
             '\nTime: '+new Date().toLocaleString('en-CA',{timeZone:'America/Vancouver'})
      })
    }).catch(function(){});

    // Trigger "New Lead Welcome" workflow
    fetch('https://services.leadconnectorhq.com/contacts/'+id+'/workflow/'+WF,{
      method:'POST',
      headers:{'Authorization':'Bearer '+TOKEN,'Content-Type':'application/json','Version':'2021-07-28'},
      body:JSON.stringify({eventStartTime:new Date().toISOString()})
    }).catch(function(){});
  }
  return id;
}

function getData(form){
  var d={page:window.location.pathname};
  var els=form.querySelectorAll('input,select,textarea');
  for(var i=0;i<els.length;i++){
    var el=els[i];
    var v=(el.value||'').trim();
    var p=(el.placeholder||'').toLowerCase();
    var n=(el.name||el.id||'').toLowerCase();
    var t=(el.type||'').toLowerCase();
    if(!v||t==='submit'||t==='button'||n==='bot-field')continue;
    if(t==='email'||n.indexOf('email')>-1||p.indexOf('email')>-1)       {d.email=v;}
    else if(t==='tel'||n.indexOf('phone')>-1||p.indexOf('phone')>-1)    {d.phone=v;}
    else if(n.indexOf('first')>-1||p.indexOf('first name')>-1)          {d.firstName=v;}
    else if(n.indexOf('last')>-1 ||p.indexOf('last name')>-1)           {d.lastName=v;}
    else if(n.indexOf('address')>-1||p.indexOf('address')>-1)           {d.address=v;}
    else if((n.indexOf('name')>-1||p==='name'||p.indexOf('your name')>-1)&&!d.firstName){
      var pts=v.split(' ');d.firstName=pts[0];d.lastName=pts.slice(1).join(' ');
    }
    else if(el.tagName==='SELECT')                                        {d.service=v;}
    else if(el.tagName==='TEXTAREA'||n.indexOf('message')>-1)            {d.message=v;}
  }
  return d;
}

window.submitForm=async function(e){
  e.preventDefault();
  var btn=e.target.querySelector('[type="submit"]');
  if(btn&&btn.disabled)return;
  if(btn){btn.textContent='Sending...';btn.disabled=true;}
  try{
    var id=await createContact(getData(e.target));
    if(id)showSuccess(btn);
    else{if(btn){btn.textContent='Send Message ›';btn.disabled=false;}}
  }catch(err){
    console.error('Form error:',err);
    if(btn){btn.textContent='Send Message ›';btn.disabled=false;}
  }
};

window.handleModalSubmit=async function(e){
  e.preventDefault();
  var btn=e.target.querySelector('[type="submit"]');
  if(btn&&btn.disabled)return;
  if(btn){btn.textContent='Sending...';btn.disabled=true;}
  try{
    var d=getData(e.target);
    var svcEl=document.getElementById('modalService');
    if(svcEl&&svcEl.value)d.service=svcEl.value;
    var id=await createContact(d);
    if(id){
      showSuccess(btn);
      setTimeout(function(){if(typeof closeModal!=='undefined')closeModal();},2000);
    } else {if(btn){btn.textContent='Send ›';btn.disabled=false;}}
  }catch(err){
    console.error(err);
    if(btn){btn.textContent='Send ›';btn.disabled=false;}
  }
};

window.submitRentalForm=async function(e){
  e.preventDefault();
  var btn=e.target.querySelector('[type="submit"]');
  if(btn&&btn.disabled)return;
  if(btn){btn.textContent='Sending...';btn.disabled=true;}
  try{
    var d=getData(e.target);
    d.service='Rental '+(d.service||'');
    var id=await createContact(d);
    if(id)showSuccess(btn);
    else{if(btn){btn.textContent='Send ›';btn.disabled=false;}}
  }catch(err){
    console.error(err);
    if(btn){btn.textContent='Send ›';btn.disabled=false;}
  }
};

})();
