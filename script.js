let data = [];

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

/* ---------- Helpers ---------- */
function normalizeDate(d) {
  if (!d) return "";
  if (d.split("-")[0].length === 4) return d;
  const p = d.split("-");
  return `${p[2]}-${p[1]}-${p[0]}`;
}

function getMonthKey(d) {
  const dt = new Date(normalizeDate(d));
  return dt
    .toLocaleString("en", { month: "short", year: "numeric" })
    .replace(/\s/g, "")
    .toUpperCase();
}

function save() {
  localStorage.setItem("moneyData", JSON.stringify(data));
}

/* ---------- Month Dropdown ---------- */
function buildMonth() {
  const current = monthFilter.value || "ALL";
  const months = [...new Set(data.map((e) => getMonthKey(e.date)))];

  monthFilter.innerHTML = "";
  monthFilter.appendChild(new Option("ALL", "ALL"));
  months.forEach((m) => monthFilter.appendChild(new Option(m, m)));

  monthFilter.value = months.includes(current) ? current : "ALL";
}

/* ---------- Core ---------- */
function addEntry() {
  if (!date.value || !amount.value) return alert("Enter Date & Amount");

  data.push({
    date: normalizeDate(date.value),
    type: type.value,
    desc: category.value,
    amt: +amount.value,
  });

  // 🔥 Clear fields after add
  setTimeout(()=>{
    category.value = "";
    amount.value = "";
    date.blur();
    category.blur();
    amount.blur();
  }, 0);


  save();
  buildMonth();
  renderTable();
}


function deleteEntry(i){
  if(!confirm("Delete this entry?")) return;
  data.splice(i,1);
  save();
  buildMonth();
  renderTable();
}


function clearAll() {
  if (!confirm("Clear entire ledger?")) return;
  data = [];
  localStorage.removeItem("moneyData");
  buildMonth();
  renderTable();
}

function toggleTable() {
  const t = document.getElementById("tableBox");
  t.style.display = t.style.display === "none" ? "block" : "none";
}

/* ---------- Export ---------- */
function exportData(){
  const sel = monthFilter.value;
  const filtered = data.filter(e => sel==="ALL" || getMonthKey(e.date)===sel);

  let csv = `SUMMARY - ${sel}\n`;
  csv += `Total Income,${incomeSpan.innerText}\n`;
  csv += `Total Expense,${expenseSpan.innerText}\n`;
  csv += `Remaining,${remainingSpan.innerText}\n\n`;

  csv += `Bank Wise\n`;
  csv += `ICICI,${icici.innerText}\nAXIS,${axis.innerText}\nHDFC,${hdfc.innerText}\n\n`;

  csv += `Ownership Wise\n`;
  csv += `PARTY,${party.innerText}\nOWN,${own.innerText}\nHOME,${home.innerText}\nVMD,${vmd.innerText}\n\n`;

  csv += `Fixed Commitments\n`;
  csv += `LOAN,${loan.innerText}\nRENT,${rent.innerText}\nSIP,${sip.innerText}\nOTHERS,${others.innerText}\n\n`;

  csv += `Date,Type,Description,Amount\n`;
  filtered.forEach(e=>{
    csv += `${e.date},${e.type},"${e.desc}",${e.amt}\n`;
  });

  const blob = new Blob([csv],{type:"text/csv"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `ra_money_${sel}.csv`;
  a.click();
}

function mailReport(){

  let sel = monthFilter.value;

  let body = `Saravana Money Tracker Report (${sel})\n\n`;

  body += `Total Income: ₹${incomeSpan.innerText}\n`;
  body += `Total Expense: ₹${expenseSpan.innerText}\n`;
  body += `Remaining: ₹${remainingSpan.innerText}\n\n`;

  body += `--- Bank Wise ---\n`;
  body += `ICICI: ₹${icici.innerText}\nAXIS: ₹${axis.innerText}\nHDFC: ₹${hdfc.innerText}\n\n`;

  body += `--- Ownership Wise ---\n`;
  body += `PARTY: ₹${party.innerText}\nOWN: ₹${own.innerText}\nHOME: ₹${home.innerText}\nVMD: ₹${vmd.innerText}\n\n`;

  body += `--- Fixed Commitments ---\n`;
  body += `LOAN: ₹${loan.innerText}\nRENT: ₹${rent.innerText}\nSIP: ₹${sip.innerText}\nOTHERS: ₹${others.innerText}\n\n`;

  body += `--- Ledger ---\n`;
  document.querySelectorAll("#tableBody tr").forEach(r=>{
    body += `${r.cells[0].innerText} | ${r.cells[1].innerText} | ${r.cells[2].innerText} | ₹${r.cells[3].innerText}\n`;
  });

  window.location.href =
    `mailto:saravanamrkpm@gmail.com?subject=Money Report ${sel}&body=${encodeURIComponent(body)}`;
}



/* ---------- Import ---------- */
function importBackup(file) {
  const r = new FileReader();
  r.onload = (e) => {
    data = [...data, ...JSON.parse(e.target.result)];
    save();
    buildMonth();
    renderTable();
  };
  r.readAsText(file);
}

/* ---------- Render ---------- */
function renderTable() {
  tableBody.innerHTML = "";

  let inc = 0,
    exp = 0;
  let bank = { ICICI: 0, AXIS: 0, HDFC: 0 };
  let owner = { PARTY: 0, OWN: 0, HOME: 0, VMD: 0 };
  let fixed = { LOAN: 0, RENT: 0, SIP: 0, OTHERS: 0 };
  let oth = {};

  const sel = monthFilter.value;

  data.forEach((e, i) => {
    if (sel !== "ALL" && getMonthKey(e.date) !== sel) return;
  
    tableBody.innerHTML += `
      <tr>
        <td>${e.date}</td>
        <td>${e.type}</td>
        <td>${e.desc}</td>
        <td>₹${e.amt}</td>
        <td><button onclick="deleteEntry(${i})">❌</button></td>
      </tr>`;
  
    const w = e.desc.toUpperCase().split(" ");
  
    // ---------- INCOME ----------
    if (e.type === "Income") {
      inc += e.amt;
      return;
    }
  
    // ---------- OTH FRIEND (STOP EVERYTHING ELSE) ----------
    if (w.includes("OTH")) {
      const n = w[w.indexOf("OTH") + 1] || "UNKNOWN";
      oth[n] = (oth[n] || 0) + e.amt;
      return; // ⛔ Prevents Total Expense & other buckets
    }
  
    // ---------- NORMAL EXPENSE ----------
    exp += e.amt;
  
    Object.keys(bank).forEach(k => w.includes(k) && (bank[k] += e.amt));
    Object.keys(owner).forEach(k => w.includes(k) && (owner[k] += e.amt));
    Object.keys(fixed).forEach(k => w.includes(k) && (fixed[k] += e.amt));
  });


  incomeSpan.innerText = inc;
  expenseSpan.innerText = exp;
  remainingSpan.innerText = inc - exp;

  icici.innerText = bank.ICICI;
  axis.innerText = bank.AXIS;
  hdfc.innerText = bank.HDFC;

  party.innerText = owner.PARTY;
  own.innerText = owner.OWN;
  home.innerText = owner.HOME;
  vmd.innerText = owner.VMD;

  loan.innerText = fixed.LOAN;
  rent.innerText = fixed.RENT;
  sip.innerText = fixed.SIP;
  others.innerText = fixed.OTHERS;

  othList.innerHTML = "";
  Object.keys(oth).forEach((n) => {
    othList.innerHTML += `<li>${n}: ₹${oth[n]}</li>`;
  });
}

/* ---------- Init ---------- */
window.onload = () => {
  data = JSON.parse(localStorage.getItem("moneyData")) || [];
  buildMonth();
  renderTable();
};
