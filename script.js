let data=[];

async function loadFromGitHub(){
  const r=await fetch("/load");
  data=await r.json();
  renderTable();
}

async function saveToGitHub(){
  await fetch("/save",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});
}

async function addEntry(){
  data.push({date:date.value,type:type.value,description:category.value.toUpperCase(),amount:+amount.value});
  await saveToGitHub();
  renderTable();
}

function exportBackup(){
  let m=monthFilter.value;
  let f=data.filter(e=>{
    let d=new Date(e.date).toLocaleString('en',{month:'short',year:'numeric'}).toUpperCase().replace(" ","");
    return m==="ALL"||d===m;
  });
  let b=new Blob([JSON.stringify(f,null,2)],{type:"application/json"});
  let a=document.createElement("a");
  a.href=URL.createObjectURL(b);
  a.download=`ra_money_${m}.json`;
  a.click();
}

async function importBackup(file){
  let r=new FileReader();
  r.onload=async e=>{
    data=[...data,...JSON.parse(e.target.result)];
    await saveToGitHub();
    renderTable();
  };
  r.readAsText(file);
}

loadFromGitHub();
