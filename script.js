let data=[];

const date=document.getElementById("date");
const type=document.getElementById("type");
const category=document.getElementById("category");
const amount=document.getElementById("amount");
const tableBody=document.getElementById("tableBody");
const monthFilter=document.getElementById("monthFilter");

const incomeSpan=document.getElementById("incomeSpan");
const expenseSpan=document.getElementById("expenseSpan");
const remainingSpan=document.getElementById("remainingSpan");

const icici=document.getElementById("icici");
const hdfc=document.getElementById("hdfc");
const axis=document.getElementById("axis");

const party=document.getElementById("party");
const own=document.getElementById("own");
const home=document.getElementById("home");
const vmd=document.getElementById("vmd");
const vmdd=document.getElementById("vmdd");
const vml=document.getElementById("vml");

const loan=document.getElementById("loan");
const rent=document.getElementById("rent");
const sip=document.getElementById("sip");
const others=document.getElementById("others");

const othList=document.getElementById("othList");
const cardTotalSpan=document.getElementById("cardTotal");

const CARD_RULES={ICICI:{bill:18},HDFC:{bill:16},AXIS:{bill:23}};

function normalizeDate(d){
  if(d.split("-")[0].length===4) return d;
  const p=d.split("-");
  return `${p[2]}-${p[1]}-${p[0]}`;
}

function getMonthKey(d){
  return new Date(normalizeDate(d))
    .toLocaleString("en",{month:"short",year:"numeric"})
    .replace(/\s/g,"").toUpperCase();
}

function getCardBillMonth(d,b){
  const dt=new Date(normalizeDate(d));
  let m=dt.getMonth(),y=dt.getFullYear();
  if(dt.getDate()>=CARD_RULES[b].bill){
    m++; if(m>11){m=0;y++;}
  }
  return new Date(y,m,1)
    .toLocaleString("en",{month:"short",year:"numeric"})
    .replace(/\s/g,"").toUpperCase();
}

function save(){localStorage.setItem("moneyData",JSON.stringify(data));}

function addEntry(){
  if(!date.value||!amount.value) return alert("Enter Date & Amount");

  const w=category.value.toUpperCase().split(" ");
  const bank=["ICICI","HDFC","AXIS"].find(b=>w.includes(b));

  data.push({
    date:normalizeDate(date.value),
    type:type.value,
    desc:category.value,
    amt:+amount.value,
    mode:bank?"CARD":"POCKET",
    bank:bank||null,
    billMonth:bank?getCardBillMonth(date.value,bank):getMonthKey(date.value)
  });

  setTimeout(()=>{category.value="";amount.value="";},0);

  save();buildMonth();renderTable();
}

function buildMonth(){
  const m=[...new Set(data.map(e=>e.billMonth))];
  monthFilter.innerHTML="";
  m.forEach(x=>monthFilter.appendChild(new Option(x,x)));
  if(m.length) monthFilter.value=m[m.length-1];
}

function renderTable(){
  tableBody.innerHTML="";
  let inc=0,cardTotal=0,pocketTotal=0;
  let cardBills={ICICI:0,HDFC:0,AXIS:0};
  let owner={PARTY:0,OWN:0,HOME:0,VMD:0,VMDD:0,VML:0};
  let fixed={LOAN:0,RENT:0,SIP:0,OTHERS:0};
  let oth={};

  const sel=monthFilter.value;

  data.forEach((e,i)=>{
    if(e.billMonth!==sel) return;

    tableBody.innerHTML+=`
      <tr>
        <td>${e.date}</td>
        <td><span class="badge ${e.mode==='CARD'?'card':'pocket'}">${e.mode}</span></td>
        <td>${e.desc}</td>
        <td>₹${e.amt}</td>
        <td><button onclick="deleteEntry(${i})">❌</button></td>
      </tr>`;

    if(e.type==="Income"){inc+=e.amt;return;}

    const w=e.desc.toUpperCase().split(" ");

    if(w.includes("OTH")){
      const n=w[w.indexOf("OTH")+1]||"UNKNOWN";
      oth[n]=(oth[n]||0)+e.amt;
      return;
    }

    Object.keys(owner).forEach(k=>w.includes(k)&&(owner[k]+=e.amt));
    Object.keys(fixed).forEach(k=>w.includes(k)&&(fixed[k]+=e.amt));

    if(e.mode==="CARD"){
      cardTotal+=e.amt;
      cardBills[e.bank]+=e.amt;
    }else pocketTotal+=e.amt;
  });

  incomeSpan.innerText=inc;
  expenseSpan.innerText=cardTotal+pocketTotal;
  remainingSpan.innerText=inc-cardTotal-pocketTotal;

  icici.innerText=cardBills.ICICI;
  hdfc.innerText=cardBills.HDFC;
  axis.innerText=cardBills.AXIS;

  party.innerText=owner.PARTY;
  own.innerText=owner.OWN;
  home.innerText=owner.HOME;
  vmd.innerText=owner.VMD;
  vmdd.innerText=owner.VMDD;
  vml.innerText=owner.VML;

  loan.innerText=fixed.LOAN;
  rent.innerText=fixed.RENT;
  sip.innerText=fixed.SIP;
  others.innerText=fixed.OTHERS;

  cardTotalSpan.innerText=cardTotal;

  othList.innerHTML="";
  Object.keys(oth).forEach(n=>othList.innerHTML+=`<li>${n}: ₹${oth[n]}</li>`);
}

function deleteEntry(i){
  if(!confirm("Delete?"))return;
  data.splice(i,1);
  save();buildMonth();renderTable();
}

window.onload=()=>{
  data=JSON.parse(localStorage.getItem("moneyData"))||[];
  buildMonth();renderTable();
};
