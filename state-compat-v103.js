(()=>{if(window.__AGP_STATE_COMPAT_V103)return;window.__AGP_STATE_COMPAT_V103=true;
const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'{}')}catch{return{}}};
const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
const variants=read('inventoryLeadVariants');let changed=false;const validVariants=new Set(['A','B','C']);Object.keys(variants).forEach(id=>{if(!validVariants.has(variants[id])){variants[id]='A';changed=true}});if(changed)write('inventoryLeadVariants',variants);
const replies=read('inventoryLeadReplies');const validReply=new Set(['info','price','interested','internal','person','no']);let repliesChanged=false;Object.entries(replies).forEach(([id,r])=>{if(r&&r.type&&!validReply.has(r.type)){replies[id]={...r,type:'info'};repliesChanged=true}});if(repliesChanged)write('inventoryLeadReplies',replies);
})();