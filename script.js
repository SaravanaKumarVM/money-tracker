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
    let bankTotals = { ICICI:0, AXIS:0, HDFC:0 };
    let ownerTotals = { PARTY:0, OWN:0, HOME:0, VMD:0 };
    let fixedTotals = { LOAN:0, RENT:0, SIP:0, OTHERS:0 };
    let othTotals = {};

    data.forEach(e => {
        tableBody.innerHTML += `
        <tr>
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

        let desc = e.description;

        // OTH Handling
        if (desc.includes("OTH")) {
            let parts = desc.split(" ");
            let idx = parts.indexOf("OTH");
            let name = parts[idx+1] || "UNKNOWN";
            othTotals[name] = (othTotals[name] || 0) + e.amount;
            return;
        }

        // Bank totals
        Object.keys(bankTotals).forEach(b => {
            if (desc.includes(b)) bankTotals[b] += e.amount;
        });

        // Owner totals
        Object.keys(ownerTotals).forEach(o => {
            if (desc.includes(o)) ownerTotals[o] += e.amount;
        });

        // Fixed totals
        Object.keys(fixedTotals).forEach(f => {
            if (desc.includes(f)) fixedTotals[f] += e.amount;
        });
    });

    incomeSpan.innerText = income;
    expenseSpan.innerText = expense;
    savingsSpan.innerText = income - expense;

    console.log("Bank Totals", bankTotals);
    console.log("Owner Totals", ownerTotals);
    console.log("Fixed Totals", fixedTotals);
    console.log("OTH Totals", othTotals);
}

renderTable();
