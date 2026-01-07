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

const party = document.getElementById("party");
const own = document.getElementById("own");
const home = document.getElementById("home");
const vmd = document.getElementById("vmd");

const loan = document.getElementById("loan");
const rent = document.getElementById("rent");
const sip = document.getElementById("sip");
const others = document.getElementById("others");

const othList = document.getElementById("othList");

let data = JSON.parse(localStorage.getItem("moneyData")) || [];

function toggleTable() {
    let box = document.getElementById("tableBox");
    box.style.display = box.style.display === "none" ? "block" : "none";
}

function addEntry() {
    data.push({
        date: date.value,
        type: type.value,
        description: category.value.toUpperCase(),
        amount: Number(amount.value)
    });
    localStorage.setItem("moneyData", JSON.stringify(data));
    renderTable();
}

function exportBackup() {
    if (!data || data.length === 0) {
        alert("No data to export!");
        return;
    }

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "ra_money_backup.json";
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}


function importBackup(file){
    let r=new FileReader();
    r.onload=e=>{
        data=JSON.parse(e.target.result);
        localStorage.setItem("moneyData",JSON.stringify(data));
        renderTable();
    };
    r.readAsText(file);
}

function buildMonthDropdown() {
    let months = [...new Set(data.map(e =>
        new Date(e.date).toLocaleString('en',{month:'short',year:'numeric'}).toUpperCase().replace(" ","")
    ))];
    monthFilter.innerHTML=`<option value="ALL">ALL</option>`;
    months.forEach(m=>monthFilter.innerHTML+=`<option>${m}</option>`);
}

function renderTable(){
    buildMonthDropdown();
    tableBody.innerHTML="";
    let selectedMonth=monthFilter.value;
    let income=0,expense=0;
    let bank={ICICI:0,AXIS:0,HDFC:0};
    let owner={PARTY:0,OWN:0,HOME:0,VMD:0};
    let fixed={LOAN:0,RENT:0,SIP:0,OTHERS:0};
    let oth={};

    data.filter(e=>{
        let m=new Date(e.date).toLocaleString('en',{month:'short',year:'numeric'}).toUpperCase().replace(" ","");
        return selectedMonth==="ALL"||m===selectedMonth;
    }).forEach(e=>{
        tableBody.innerHTML+=`<tr><td>${e.date}</td><td>${e.type}</td><td>${e.description}</td><td>₹${e.amount}</td></tr>`;

        if(e.type==="Income"){income+=e.amount;return;}

        let w=e.description.split(" ");

        if(w.includes("OTHERS")){fixed.OTHERS+=e.amount;expense+=e.amount;}
        else if(w.includes("OTH")){
            let i=w.indexOf("OTH");
            let n=w[i+1]||"UNKNOWN";
            oth[n]=(oth[n]||0)+e.amount;
        }else{
            expense+=e.amount;
            Object.keys(bank).forEach(k=>{if(w.includes(k))bank[k]+=e.amount;});
            Object.keys(owner).forEach(k=>{if(w.includes(k))owner[k]+=e.amount;});
            Object.keys(fixed).forEach(k=>{if(w.includes(k))fixed[k]+=e.amount;});
        }
    });

    incomeSpan.innerText=income;
    expenseSpan.innerText=expense;
    remainingSpan.innerText=income-expense;
    icici.innerText=bank.ICICI;axis.innerText=bank.AXIS;hdfc.innerText=bank.HDFC;
    party.innerText=owner.PARTY;own.innerText=owner.OWN;home.innerText=owner.HOME;vmd.innerText=owner.VMD;
    loan.innerText=fixed.LOAN;rent.innerText=fixed.RENT;sip.innerText=fixed.SIP;others.innerText=fixed.OTHERS;
    othList.innerHTML="";
    Object.keys(oth).forEach(n=>othList.innerHTML+=`<li>${n}: ₹${oth[n]}</li>`);
}

renderTable();
