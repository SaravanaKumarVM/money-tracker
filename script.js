let data = [];

const date = document.getElementById("date");
const type = document.getElementById("type");
const category = document.getElementById("category");
const notes = document.getElementById("notes");
const amount = document.getElementById("amount");
const tableBody = document.getElementById("tableBody");
const monthFilter = document.getElementById("monthFilter");

const incomeSpan = document.getElementById("incomeSpan");
const expenseSpan = document.getElementById("expenseSpan");
const remainingSpan = document.getElementById("remainingSpan");

const icici = document.getElementById("icici");
const hdfc = document.getElementById("hdfc");
const axis = document.getElementById("axis");

const party = document.getElementById("party");
const own = document.getElementById("own");
const home = document.getElementById("home");
const vmd = document.getElementById("vmd");
const vmdd = document.getElementById("vmdd");
const vml = document.getElementById("vml");

const loan = document.getElementById("loan");
const rent = document.getElementById("rent");
const sip = document.getElementById("sip");
const others = document.getElementById("others");

const othList = document.getElementById("othList");
const cardTotalSpan = document.getElementById("cardTotal");

const CARD_RULES = {
    ICICI: {
        bill: 18
    },
    HDFC: {
        bill: 16
    },
    AXIS: {
        bill: 23
    }
};

function normalizeDate(d) {
    if (d.split("-")[0].length === 4) return d;
    const p = d.split("-");
    return `${p[2]}-${p[1]}-${p[0]}`;
}

function getMonthKey(d) {
    return new Date(normalizeDate(d))
        .toLocaleString("en", {
            month: "short",
            year: "numeric"
        })
        .replace(/\s/g, "").toUpperCase();
}

function getCardBillMonth(d, b) {
    const rule = CARD_RULES[b];
    const dt = new Date(normalizeDate(d));
    let m = dt.getMonth(),
        y = dt.getFullYear();

    if (dt.getDate() <= rule.bill) {
        m++;
    } else {
        m += 2;
    }

    if (m > 11) {
        y += Math.floor(m / 12);
        m %= 12;
    }

    return new Date(y, m, 1)
        .toLocaleString("en", {
            month: "short",
            year: "numeric"
        })
        .replace(/\s/g, "").toUpperCase();
}

function save() {
    localStorage.setItem("moneyData", JSON.stringify(data));
}

function addEntry() {
    if (!date.value || !amount.value) return alert("Enter Date & Amount");

    const w = category.value.toUpperCase().split(" ");
    const bank = ["ICICI", "HDFC", "AXIS"].find(b => w.includes(b));

    data.push({
        date: normalizeDate(date.value),
        type: type.value,
        desc: category.value,
        notes: notes.value,
        amt: +amount.value,
        mode: bank ? "CARD" : "POCKET",
        bank: bank || null,
        billMonth: bank ? getCardBillMonth(date.value, bank) : getMonthKey(date.value),
        spendMonth: getMonthKey(date.value)
    });

    setTimeout(() => {
        category.value = "";
        amount.value = "";
        notes.value = "";
    }, 0);
    save();
    buildMonth();
    renderTable();
}

//function buildMonth() {
    //const m = [...new Set(data.map(e => e.billMonth))];
    //monthFilter.innerHTML = "";
    //m.forEach(x => monthFilter.appendChild(new Option(x, x)));
    //if (m.length) monthFilter.value = m[m.length - 1];
//}
function buildMonth(){
  const months = new Set();

  data.forEach(e=>{
    months.add(e.spendMonth);     // real month first
    months.add(e.billMonth);      // card months too
  });

  const list = [...months];
  monthFilter.innerHTML = "";

  list.forEach(x => monthFilter.appendChild(new Option(x, x)));

  const current = getMonthKey(new Date().toISOString().split("T")[0]);

  if(list.includes(current)){
    monthFilter.value = current;
  }else{
    monthFilter.value = list.sort().reverse()[0];
  }
}

function parseLedgerDate(str){
  const p = str.split("-");
  return p[0].length === 4
    ? new Date(p[0], p[1]-1, p[2])   // YYYY-MM-DD
    : new Date(p[2], p[1]-1, p[0]);  // DD-MM-YYYY
}

function sortTableByDate(){
  const tbody = document.getElementById("tableBody");
  const rows = Array.from(tbody.querySelectorAll("tr"));

  rows.sort((a,b)=>{
    const d1 = parseLedgerDate(a.cells[0].innerText.trim());
    const d2 = parseLedgerDate(b.cells[0].innerText.trim());
    return d1 - d2;
  });

  tbody.innerHTML="";
  rows.forEach(r=>tbody.appendChild(r));
}

function renderTable() {
    tableBody.innerHTML = "";
    let inc = 0,
        cardTotal = 0,
        pocketTotal = 0;
    let cardBills = {
        ICICI: 0,
        HDFC: 0,
        AXIS: 0
    };
    let owner = {
        PARTY: 0,
        OWN: 0,
        HOME: 0,
        VMD: 0,
        VMDD: 0,
        VML: 0
    };
    let fixed = {
        LOAN: 0,
        RENT: 0,
        SIP: 0,
        OTHERS: 0
    };
    let oth = {};

    const sel = monthFilter.value;

data.forEach((e, i) => {
        if (e.billMonth !== sel) return;

        tableBody.innerHTML += `
<tr>
  <td>${e.date}</td>
  <td>
    ${
      e.type === "Income"
        ? `<span class="badge income">INCOME</span>`
        : `<span class="badge ${e.mode==='CARD'?'card':'pocket'}">${e.mode}</span>`
    }
  </td>
  <td>${e.desc}</td>
  <td>₹${e.amt}</td>
  <td><button onclick="deleteEntry(${i})">❌</button></td>
  <td class="notes-col">${e.notes||""}</td>
</tr>`; 

        if (e.type === "Income") {
            inc += e.amt;
            return;
        }

        const w = e.desc.toUpperCase().split(" ");

        if (w.includes("OTH")) {
            const n = w[w.indexOf("OTH") + 1] || "UNKNOWN";
            oth[n] = (oth[n] || 0) + e.amt;
            return;
        }

        Object.keys(owner).forEach(k => w.includes(k) && (owner[k] += e.amt));
        Object.keys(fixed).forEach(k => w.includes(k) && (fixed[k] += e.amt));

        if (e.mode === "CARD") {
            cardTotal += e.amt;
            cardBills[e.bank] += e.amt;
        } else {
            if (e.spendMonth === sel) pocketTotal += e.amt;
        }
    });

    incomeSpan.innerText = inc;
    expenseSpan.innerText = cardTotal + pocketTotal;
    remainingSpan.innerText = inc - cardTotal - pocketTotal;

    icici.innerText = cardBills.ICICI;
    hdfc.innerText = cardBills.HDFC;
    axis.innerText = cardBills.AXIS;

    party.innerText = owner.PARTY;
    own.innerText = owner.OWN;
    home.innerText = owner.HOME;
    vmd.innerText = owner.VMD;
    vmdd.innerText = owner.VMDD;
    vml.innerText = owner.VML;

    loan.innerText = fixed.LOAN;
    rent.innerText = fixed.RENT;
    sip.innerText = fixed.SIP;
    others.innerText = fixed.OTHERS;

    cardTotalSpan.innerText = cardTotal;

    othList.innerHTML = "";
    Object.keys(oth).forEach(n => othList.innerHTML += `<li>${n}: ₹${oth[n]}</li>`);

sortTableByDate();
}

function deleteEntry(i) {
    if (!confirm("Delete?")) return;
    data.splice(i, 1);
    save();
    buildMonth();
    renderTable();
}

function toggleTable() {
    const box = document.getElementById("tableBox");
    box.style.display = box.style.display === "none" ? "block" : "none";
}

function clearAll() {
    if (!confirm("This will delete entire money history. Continue?")) return;
    data = [];
    localStorage.removeItem("moneyData");
    buildMonth();
    renderTable();
}

function mailReport() {
    const sel = monthFilter.value;

    let body = `Saravana Money Tracker Report - ${sel}\n\n`;

    body += `Total Income: ₹${incomeSpan.innerText}\n`;
    body += `Total Expense: ₹${expenseSpan.innerText}\n`;
    body += `Remaining: ₹${remainingSpan.innerText}\n\n`;

    body += `--- Card Expenses ---\n`;
    body += `ICICI: ₹${icici.innerText}\n`;
    body += `HDFC: ₹${hdfc.innerText}\n`;
    body += `AXIS: ₹${axis.innerText}\n\n`;

    body += `--- Ownership ---\n`;
    body += `PARTY: ₹${party.innerText}\nOWN: ₹${own.innerText}\nHOME: ₹${home.innerText}\nVMD: ₹${vmd.innerText}\nVMDD: ₹${vmdd.innerText}\nVML: ₹${vml.innerText}\n\n`;

    body += `--- Fixed Commitments ---\n`;
    body += `LOAN: ₹${loan.innerText}\nRENT: ₹${rent.innerText}\nSIP: ₹${sip.innerText}\nOTHERS: ₹${others.innerText}\n\n`;

    body += `--- Ledger ---\n`;
    document.querySelectorAll("#tableBody tr").forEach(r => {
        body += `${r.cells[0].innerText} | ${r.cells[1].innerText} | ${r.cells[2].innerText} | ${r.cells[3].innerText} | ${r.cells[4].innerText}\n`;
    });

    window.location.href =
        `mailto:saravanamrkpm@gmail.com?subject=Money Report ${sel}&body=${encodeURIComponent(body)}`;
}

let notesVisible = false;

function toggleNotes() {
    const box = document.getElementById("tableBox");
    const btn = event.target;
    notesVisible = !notesVisible;
    if (notesVisible) {
        box.classList.remove("hide-notes");
        btn.innerText = "Hide Notes";
    } else {
        box.classList.add("hide-notes");
        btn.innerText = "Show Notes";
    }
}

//window.onload = () => {
    //data = JSON.parse(localStorage.getItem("moneyData")) || [];
    //buildMonth();
    //renderTable();
    //document.getElementById("tableBox").classList.add("hide-notes");
//};

window.addEventListener("pageshow", () => {
  data = JSON.parse(localStorage.getItem("moneyData")) || [];

  buildMonth();

  const now = new Date();
  const current =
    now.toLocaleString("en",{month:"short",year:"numeric"})
       .replace(/\s/g,"")
       .toUpperCase();

  // 🔥 force reset without triggering change
  monthFilter.removeEventListener("change", renderTable);
  monthFilter.value = current;
  monthFilter.addEventListener("change", () => renderTable());

  renderTable();
  document.getElementById("tableBox").classList.add("hide-notes");
});



