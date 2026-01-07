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

const icici=document.getElementById("icici");
const axis=document.getElementById("axis");
const hdfc=document.getElementById("hdfc");

const party=document.getElementById("party");
const own=document.getElementById("own");
const home=document.getElementById("home");
const vmd=document.getElementById("vmd");

const loan=document.getElementById("loan");
const rent=document.getElementById("rent");
const sip=document.getElementById("sip");
const others=document.getElementById("others");

const othList=document.getElementById("othList");

function parseDate(d){
  if(d.includes("-")){
    const parts = d.split("-");
    if(parts[0].length===4) return new Date(d);         // YYYY-MM-DD
    return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`); // DD-MM-YYYY
  }
  return new Date(d);
}


function save(){
  localStorage.setItem("moneyData",JSON.stringify(data));
}

function getMonthKey(d){
  const dt = parseDate(d);
  if(isNaN(dt)) return "INVALID";
  return dt.toLocaleString('en',{month:'short',year:'numeric'})
           .replace(/\s/g,"")
           .toUpperCase();
}


function buildMonth(){
  let prev = monthFilter.value || "ALL";

  let months = [...new Set(data.map(e => getMonthKey(e.date)))];

  monthFilter.innerHTML = `<option value="ALL">ALL</option>`;
  months.forEach(m=>{
    monthFilter.innerHTML += `<option value="${m}">${m}</option>`;
  });

  monthFilter.value = months.includes(prev) ? prev : "ALL";
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
  buildMonth();
  renderTable();
}

function deleteEntry(i){
  data.splice(i,1);
  save();
  buildMonth();
  renderTable();
}

function clearAll(){
  if(confirm("Clear entire ledger?")){
    data=[];
    localStorage.removeItem("moneyData");
    buildMonth();
    renderTable();
  }
}

function toggleTable(){
  const t=document.getElementById("tableBox");
  t.style.display=t.style.display==="none"?"block":"none";
}

function exportData(){
  let sel = monthFilter.value;

  let filtered = data.filter(e=>{
    let m = new Date(e.date)
      .toLocaleString('en',{month:'short',year:'numeric'})
      .replace(" ","");
    return sel==="ALL" || m===sel;
  });

  let csv = "Date,Type,Description,Amount\n";

  filtered.forEach(e=>{
    csv += `${e.date},${e.type},"${e.desc}",${e.amt}\n`;
  });

  const blob = new Blob([csv],{type:"text/csv"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `ra_money_${sel}.csv`;
  a.click();
}


function importBackup(file){
  let r=new FileReader();
  r.onload=e=>{
    data=[...data,...JSON.parse(e.target.result)];
    save();
    buildMonth();
    renderTable();
  };
  r.readAsText(file);
}

function buildMonth(){
  let m=[...new Set(data.map(e=>new Date(e.date).toLocaleString('en',{month:'short',year:'numeric'}).replace(" ","")))];
  monthFilter.innerHTML="<option>ALL</option>";
  m.forEach(x=>monthFilter.innerHTML+=`<option>${x}</option>`);
}


function renderTable(){

  tableBody.innerHTML="";

  let inc=0,exp=0;
  let bank={ICICI:0,AXIS:0,HDFC:0};
  let owner={PARTY:0,OWN:0,HOME:0,VMD:0};
  let fixed={LOAN:0,RENT:0,SIP:0,OTHERS:0};
  let oth={};

  let sel=monthFilter.value;

  data.forEach((e,i)=>{

    let m=getMonthKey(e.date);
    if(sel!=="ALL" && sel!==m) return;

    tableBody.innerHTML+=
      `<tr>
        <td>${e.date}</td>
        <td>${e.type}</td>
        <td>${e.desc}</td>
        <td>₹${e.amt}</td>
        <td><button onclick="deleteEntry(${i})">❌</button></td>
      </tr>`;

    if(e.type==="Income"){inc+=e.amt;return;}

    exp+=e.amt;
    let w=e.desc.toUpperCase().split(" ");

    Object.keys(bank).forEach(k=>{ if(w.includes(k)) bank[k]+=e.amt; });
    Object.keys(owner).forEach(k=>{ if(w.includes(k)) owner[k]+=e.amt; });
    Object.keys(fixed).forEach(k=>{ if(w.includes(k)) fixed[k]+=e.amt; });

    if(w.includes("OTH")){
      let i=w.indexOf("OTH");
      let n=w[i+1]||"UNKNOWN";
      oth[n]=(oth[n]||0)+e.amt;
    }
  });

  incomeSpan.innerText=inc;
  expenseSpan.innerText=exp;
  remainingSpan.innerText=inc-exp;

  icici.innerText=bank.ICICI; axis.innerText=bank.AXIS; hdfc.innerText=bank.HDFC;
  party.innerText=owner.PARTY; own.innerText=owner.OWN; home.innerText=owner.HOME; vmd.innerText=owner.VMD;
  loan.innerText=fixed.LOAN; rent.innerText=fixed.RENT; sip.innerText=fixed.SIP; others.innerText=fixed.OTHERS;

  othList.innerHTML="";
  Object.keys(oth).forEach(n=>{
    othList.innerHTML+=`<li>${n}: ₹${oth[n]}</li>`;
  });
}


renderTable();
