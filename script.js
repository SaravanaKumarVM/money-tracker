let data = [];

/* -------- DOM -------- */
const date = document.getElementById("date");
const type = document.getElementById("type");
const category = document.getElementById("category");
const amount = document.getElementById("amount");
const tableBody = document.getElementById("tableBody");
const monthFilter = document.getElementById("monthFilter");

const incomeSpan = document.getElementById("incomeSpan");
const expenseSpan = document.getElementById("expenseSpan");
const remainingSpan = document.getElementById("remainingSpan");

const icici = document.getElementById("icici");
const axis = document.getElementById("axis");
const hdfc = document.getElementById("hdfc");

const loan = document.getElementById("loan");
const rent = document.getElementById("rent");
const sip = document.getElementById("sip");
const others = document.getElementById("others");

const cardTotalSpan = document.getElementById("cardTotal");
const cardList = document.getElementById("cardList");

/* -------- Card Rules -------- */
const CARD_RULES = {
  ICICI:{bill:18,due:5},
  HDFC:{bill:16,due:5},
  AXIS:{bill:23,due:10}
};

/* -------- Helpers -------- */
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

function getCardBillMonth(d,bank){
  const dt=new Date(normalizeDate(d));
  let m=dt.getMonth(), y=dt.getFullYear();
  if(dt.getDate()>=CARD_RULES[bank].bill){
    m++; if(m>11){m=0;y++;}
  }
  return new Date(y,m,1)
    .toLocaleString("en",{month:"short",year:"numeric"})
    .replace(/\s/g,"").toUpperCase();
}

function save(){ localStorage.setItem("moneyData",JSON.stringify(data)); }

/* -------- Add Entry -------- */
function addEntry(){
  if(!date.value||!amount.value) return alert("Enter Date & Amount");

  const words=category.value.toUpperCase().split(" ");
  const bank=["ICICI","HDFC","AXIS"].find(b=>words.includes(b));

  data.push({
    date:normalizeDate(date.value),
    type:type.value,
    desc:category.value,
    amt:+amount.value,
    mode:bank?"CARD":"POCKET",
    bank:bank||null,
    billMonth:bank?getCardBillMonth(date.value,bank):getMonthKey(date.value)
  });

  setTimeout(()=>{
    category.value="";amount.value="";
    date.blur();category.blur();amount.blur();
  },0);

  save();buildMonth();renderTable();
}

/* -------- Month Dropdown -------- */
function buildMonth(){
  const cur=monthFilter.value||"ALL";
  const m=[...new Set(data.map(e=>e.billMonth))];
  monthFilter.innerHTML="";
  monthFilter.appendChild(new Option("ALL","ALL"));
  m.forEach(x=>monthFilter.appendChild(new Option(x,x)));
  monthFilter.value=m.includes(cur)?cur:"ALL";
}

/* -------- Render -------- */
function renderTable(){
  tableBody.innerHTML="";
  let inc=0, cardTotal=0, pocketTotal=0;
  let cardBills={ICICI:0,HDFC:0,AXIS:0};

  const sel=monthFilter.value;

  data.forEach((e,i)=>{
    if(sel!=="ALL" && e.billMonth!==sel) return;

    tableBody.innerHTML+=`
      <tr>
        <td>${e.date}</td>
        <td>${e.mode}</td>
        <td>${e.desc}</td>
        <td>₹${e.amt}</td>
        <td><button onclick="deleteEntry(${i})">❌</button></td>
      </tr>`;

    if(e.type==="Income"){ inc+=e.amt; return; }

    if(e.mode==="CARD"){
      cardTotal+=e.amt;
      cardBills[e.bank]+=e.amt;
    }else{
      pocketTotal+=e.amt;
    }
  });

  incomeSpan.innerText=inc;
  expenseSpan.innerText=cardTotal+pocketTotal;

  const fixedTotal=
    +loan.innerText + +rent.innerText + +sip.innerText + +others.innerText;

  remainingSpan.innerText = inc - fixedTotal - cardTotal - pocketTotal;

  icici.innerText=cardBills.ICICI;
  hdfc.innerText=cardBills.HDFC;
  axis.innerText=cardBills.AXIS;

  cardTotalSpan.innerText=cardTotal;
  cardList.innerHTML="";
  Object.keys(cardBills).forEach(b=>{
    cardList.innerHTML+=`<li>${b}: ₹${cardBills[b]}</li>`;
  });
}

/* -------- Delete -------- */
function deleteEntry(i){
  if(!confirm("Delete?")) return;
  data.splice(i,1);
  save();buildMonth();renderTable();
}

/* -------- Init -------- */
window.onload=()=>{
  data=JSON.parse(localStorage.getItem("moneyData"))||[];
  buildMonth();renderTable();
};
