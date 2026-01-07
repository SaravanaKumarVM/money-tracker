let data = JSON.parse(localStorage.getItem("moneyData")) || [];

const date = document.getElementById("date");
const type = document.getElementById("type");
const category = document.getElementById("category");
const amount = document.getElementById("amount");
const tableBody = document.getElementById("tableBody");
const monthFilter = document.getElementById("monthFilter");
const incomeSpan = document.getElementById("incomeSpan");
const expenseSpan = document.getElementById("expenseSpan");
const remainingSpan = document.getElementById("remainingSpan");

function save(){
  localStorage.setItem("moneyData",JSON.stringify(data));
}

function addEntry(){
  if(!date.value || !amount.value) return alert("Enter date & amount");
  data.push({
    date:date.value,
    type:type.value,
    desc:category.value,
    amt:+amount.value
  });
  save();
  renderTable();
}

function deleteEntry(i){
  data.splice(i,1);
  save();
  renderTable();
}

function clearAll(){
  if(confirm("Clear entire ledger?")){
    data=[];
    localStorage.removeItem("moneyData");
    renderTable();
  }
}

function toggleTable(){
  const t=document.getElementById("tableBox");
  t.style.display=t.style.display==="none"?"block":"none";
}

function exportData(){
  let sel=monthFilter.value;
  let f=data.filter(e=>{
    let m=new Date(e.date).toLocaleString('en',{month:'short',year:'numeric'}).replace(" ","");
    return sel==="ALL"||m===sel;
  });
  let b=new Blob([JSON.stringify(f,null,2)],{type:"application/json"});
  let a=document.createElement("a");
  a.href=URL.createObjectURL(b);
  a.download=`ra_money_${sel}.json`;
  a.click();
}

function importBackup(file){
  let r=new FileReader();
  r.onload=e=>{
    data=[...data,...JSON.parse(e.target.result)];
    save(); renderTable();
  };
  r.readAsText(file);
}

function buildMonth(){
  let m=[...new Set(data.map(e=>new Date(e.date).toLocaleString('en',{month:'short',year:'numeric'}).replace(" ","")))];
  monthFilter.innerHTML="<option>ALL</option>";
  m.forEach(x=>monthFilter.innerHTML+=`<option>${x}</option>`);
}

function renderTable(){
  buildMonth();
  tableBody.innerHTML="";
  let inc=0,exp=0,sel=monthFilter.value;

  data.forEach((e,i)=>{
    let m=new Date(e.date).toLocaleString('en',{month:'short',year:'numeric'}).replace(" ","");
    if(sel!=="ALL"&&sel!==m) return;

    tableBody.innerHTML+=
      `<tr>
        <td>${e.date}</td>
        <td>${e.type}</td>
        <td>${e.desc}</td>
        <td>₹${e.amt}</td>
        <td><button onclick="deleteEntry(${i})">❌</button></td>
      </tr>`;

    e.type==="Income"?inc+=e.amt:exp+=e.amt;
  });

  incomeSpan.innerText=inc;
  expenseSpan.innerText=exp;
  remainingSpan.innerText=inc-exp;
}

renderTable();
