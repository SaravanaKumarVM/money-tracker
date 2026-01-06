function toggleTable() {
    let box = document.getElementById("tableBox");
    box.style.display = box.style.display === "none" ? "block" : "none";
}

let data = JSON.parse(localStorage.getItem("moneyData")) || [];

function addEntry() {
    let entry = {
        date: date.value,
        type: type.value,
        description: category.value.toUpperCase(),
        amount: Number(amount.value)
    };
    data.push(entry);
    localStorage.setItem("moneyData", JSON.stringify(data));
    renderTable();
}

function renderTable() {
    tableBody.innerHTML = "";

    let income = 0, expense = 0;
    let bank = {ICICI:0, AXIS:0, HDFC:0};
    let owner = {PARTY:0, OWN:0, HOME:0, VMD:0};
    let fixed = {LOAN:0, RENT:0, SIP:0, OTHERS:0};
    let oth = {};

    data.forEach(e => {
        tableBody.innerHTML += `<tr>
            <td>${e.date}</td>
            <td>${e.type}</td>
            <td>${e.description}</td>
            <td>₹${e.amount}</td>
        </tr>`;

        if (e.type === "Income") {
            income += e.amount;
            return;
        }

        expense += e.amount;
        let d = e.description;

        if (d.includes("OTH")) {
            let parts = d.split(" ");
            let i = parts.indexOf("OTH");
            let name = parts[i+1] || "UNKNOWN";
            oth[name] = (oth[name] || 0) + e.amount;
            return;
        }

        Object.keys(bank).forEach(k => { if (d.includes(k)) bank[k] += e.amount; });
        Object.keys(owner).forEach(k => { if (d.includes(k)) owner[k] += e.amount; });
        Object.keys(fixed).forEach(k => { if (d.includes(k)) fixed[k] += e.amount; });
    });

    incomeSpan.innerText = income;
    expenseSpan.innerText = expense;
    savingsSpan.innerText = income - expense;

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
    Object.keys(oth).forEach(n => {
        othList.innerHTML += `<li>${n} : ₹${oth[n]}</li>`;
    });
}

renderTable();
