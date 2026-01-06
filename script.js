let data = JSON.parse(localStorage.getItem("moneyData")) || [];

function addEntry() {
    let entry = {
        date: date.value,
        type: type.value,
        category: category.value,
        amount: Number(amount.value)
    };

    data.push(entry);
    localStorage.setItem("moneyData", JSON.stringify(data));
    renderTable();
}

function renderTable() {
    tableBody.innerHTML = "";
    let totalIncome = 0, totalExpense = 0;

    data.forEach(e => {
        tableBody.innerHTML += `
        <tr>
            <td>${e.date}</td>
            <td>${e.type}</td>
            <td>${e.category}</td>
            <td>₹${e.amount}</td>
        </tr>`;

        if (e.type === "Income") totalIncome += e.amount;
        else totalExpense += e.amount;
    });

    income.innerText = totalIncome;
    expense.innerText = totalExpense;
    savings.innerText = totalIncome - totalExpense;
}

renderTable();
