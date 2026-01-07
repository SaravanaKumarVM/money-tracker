const OWNER = "SaravanaKumarVM";
const REPO  = "money-tracker";

let data = [];

/* ---------- LOAD FROM GITHUB FILE ---------- */
async function loadData() {
    let r = await fetch(`https://raw.githubusercontent.com/${OWNER}/${REPO}/main/moneyData.json`);
    data = await r.json();
    renderTable();
}

/* ---------- SAVE VIA GITHUB ACTION ---------- */
async function saveData() {
    await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/dispatches`, {
        method: "POST",
        headers: {
            "Accept": "application/vnd.github.everest-preview+json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            event_type: "save_money",
            client_payload: { data: JSON.stringify(data, null, 2) }
        })
    });
}

/* ---------- UI ---------- */
function toggleTable() {
    let box = document.getElementById("tableBox");
    box.style.display = box.style.display === "none" ? "block" : "none";
}

function addEntry() {
    let entry = {
        date: date.value,
        type: type.value,
        description: category.value.toUpperCase(),
        amount: Number(amount.value)
    };
    data.push(entry);
    saveData();
}

/* ---------- MONTH FILTER ---------- */
function buildMonthDropdown() {
    let months = [...new Set(data.map(e =>
        new Date(e.date).toLocaleString('en',{month:'short',year:'numeric'})
            .toUpperCase().replace(" ","")
    ))];

    monthFilter.innerHTML = `<option value="ALL">ALL</option>`;
    months.forEach(m => monthFilter.innerHTML += `<option value="${m}">${m}</option>`);
}

/* ---------- RENDER ---------- */
function renderTable() {
    buildMonthDropdown();
    tableBody.innerHTML = "";

    let selectedMonth = monthFilter.value;
    let income = 0, expense = 0;
    let bank={ICICI:0,AXIS:0,HDFC:0};
    let owner={PARTY:0,OWN:0,HOME:0,VMD:0};
    let fixed={LOAN:0,RENT:0,SIP:0,OTHERS:0};
    let oth={};

    data.filter(e=>{
        let m=new Date(e.date).toLocaleString('en',{month:'short',year:'numeric'})
            .toUpperCase().replace(" ","");
        return selectedMonth==="ALL"||m===selectedMonth;
    }).forEach(e=>{
        tableBody.innerHTML+=`<tr><td>${e.date}</td><td>${e.type}</td><td>${e.description}</td><td>₹${e.amount}</td></tr>`;

        if(e.type==="Income"){ income+=e.amount; return; }

        let w=e.description.split(" ");

        if(w.includes("OTHERS")){
            fixed.OTHERS+=e.amount;
            expense+=e.amount;
            return;
        }

        let oi=w.indexOf("OTH");
        if(oi!==-1){
            let name=w[oi+1]||"UNKNOWN";
            oth[name]=(oth[name]||0)+e.amount;
            return;
        }

        expense+=e.amount;
        Object.keys(bank).forEach(k=>{ if(w.includes(k)) bank[k]+=e.amount; });
        Object.keys(owner).forEach(k=>{ if(w.includes(k)) owner[k]+=e.amount; });
        Object.keys(fixed).forEach(k=>{ if(w.includes(k)) fixed[k]+=e.amount; });
    });

    incomeSpan.innerText=income;
    expenseSpan.innerText=expense;
    remainingSpan.innerText=income-expense;
    icici.innerText=bank.ICICI; axis.innerText=bank.AXIS; hdfc.innerText=bank.HDFC;
    party.innerText=owner.PARTY; own.innerText=owner.OWN; home.innerText=owner.HOME; vmd.innerText=owner.VMD;
    loan.innerText=fixed.LOAN; rent.innerText=fixed.RENT; sip.innerText=fixed.SIP; others.innerText=fixed.OTHERS;

    othList.innerHTML="";
    Object.keys(oth).forEach(n=>othList.innerHTML+=`<li>${n}: ₹${oth[n]}</li>`);
}

/* ---------- INIT ---------- */
window.onload = loadData;
