let chart; 
let incomeTotal = 0;
let expensesTotal = 0
let removeBtn, editBtn, addBtn, clearBtn;
let filteredTransactions;
let editTransactionId = null; 
let settings = {};
let transactions = [];

async function loadCategories() {
    try {
        const response = await fetch("http://localhost:5002/categories");
        if (!response.ok) {
            throw new Error("Failed to fetch categories");
        }
        const json = await response.json();
        const categories = json.data;

        const categoriesDropdown = document.getElementById("categories");
        const categoriesAddPopupDropdown = document.getElementById("addPopupCategory");
        const categoriesEditPopupDropdown = document.getElementById("popupCategory");
        categoriesDropdown.innerHTML = ""; 
        categoriesAddPopupDropdown.innerHTML = "";
        categoriesEditPopupDropdown.innerHTML = "";

        const filterOption = document.createElement("option");
        filterOption.value = "ignore";
        filterOption.textContent = "Search by Category";
        categoriesDropdown.appendChild(filterOption);

        const popupAddOption = document.createElement("option");
        popupAddOption.value = "";
        popupAddOption.disabled = true;
        popupAddOption.selected = true;
        popupAddOption.textContent = "Select Category";
        categoriesAddPopupDropdown.appendChild(popupAddOption);

        const popupEditOption = document.createElement("option");
        popupEditOption.value = "";
        popupEditOption.disabled = true;
        popupEditOption.selected = true;
        popupEditOption.textContent = "Select Category";
        categoriesEditPopupDropdown.appendChild(popupEditOption);

        categories.forEach(category => {
            const option = document.createElement("option");
            option.value = category.category;
            option.textContent = category.category;
            categoriesDropdown.appendChild(option.cloneNode(true));
            categoriesAddPopupDropdown.appendChild(option.cloneNode(true));
            categoriesEditPopupDropdown.appendChild(option.cloneNode(true));
        });

        console.log("Categories loaded successfully!");
    } catch (error) {
        console.error("Error loading categories:", error);
    }
}

document.addEventListener("DOMContentLoaded", loadCategories);

async function loadFromDataBase() {
    try {
        const response = await fetch('http://localhost:5002/transactions');
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const json = await response.json();

        transactions = json.data || [];
        createTable(transactions);
    }
    catch (error) {
        console.error("Error fetching transactions:", error);
    }
}

function validateField(value, errorElementId, fieldName, validationType = 'required') {
    const errorElement = document.getElementById(errorElementId);
    const inputElement = errorElement.previousElementSibling;
    let errorMessage = '';
    
    if (validationType === 'amount') {
        const numValue = parseFloat(value);
        if (value.trim() === '') {
            errorMessage = 'Amount is required';
        } else if (isNaN(numValue)) {
            errorMessage = 'Please enter a valid number';
        } else if (numValue <= 0) {
            errorMessage = 'Amount must be a positive number';
        }
    } else if (validationType === 'select') {
        if (!value || value === '') {
            errorMessage = `Please select a ${fieldName}`;
        }
    } else if (validationType === 'date') {
        if (!value || value === '') {
            errorMessage = 'Date is required';
        }
    } else {
        // Generic required field
        if (!value || value.trim() === '') {
            errorMessage = `${fieldName} is required`;
        }
    }
    
    if (errorMessage) {
        inputElement.classList.add('has-error');
        errorElement.textContent = errorMessage;
        return false;
    } else {
        inputElement.classList.remove('has-error');
        errorElement.textContent = '';
        return true;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const addTypeSelect = document.getElementById('addPopupType');
    const addAmountInput = document.getElementById('addPopupAmount');
    const addCategorySelect = document.getElementById('addPopupCategory');
    const addDateInput = document.getElementById('addPopupDate');
    
    if (addTypeSelect) {
        addTypeSelect.addEventListener('change', function() {
            validateField(this.value, 'addTypeError', 'Type', 'select');
        });
    }
    
    if (addAmountInput) {
        addAmountInput.addEventListener('input', function() {
            validateField(this.value, 'addAmountError', 'Amount', 'amount');
        });
    }
    
    if (addCategorySelect) {
        addCategorySelect.addEventListener('change', function() {
            validateField(this.value, 'addCategoryError', 'Category', 'select');
        });
    }
    
    if (addDateInput) {
        addDateInput.addEventListener('change', function() {
            validateField(this.value, 'addDateError', 'Date', 'date');
        });
    }
    
    const editTypeSelect = document.getElementById('popupType');
    const editAmountInput = document.getElementById('popupAmount');
    const editCategorySelect = document.getElementById('popupCategory');
    const editDateInput = document.getElementById('popupDate');
    
    if (editTypeSelect) {
        editTypeSelect.addEventListener('change', function() {
            validateField(this.value, 'editTypeError', 'Type', 'select');
        });
    }
    
    if (editAmountInput) {
        editAmountInput.addEventListener('input', function() {
            validateField(this.value, 'editAmountError', 'Amount', 'amount');
        });
    }
    
    if (editCategorySelect) {
        editCategorySelect.addEventListener('change', function() {
            validateField(this.value, 'editCategoryError', 'Category', 'select');
        });
    }
    
    if (editDateInput) {
        editDateInput.addEventListener('change', function() {
            validateField(this.value, 'editDateError', 'Date', 'date');
        });
    }
});

async function addButton() {

    try {

        const type = document.getElementById('addPopupType').value;
        const amountInput = document.getElementById('addPopupAmount').value;
        const category = document.getElementById('addPopupCategory').value;
        const date = document.getElementById('addPopupDate').value;
        const description = document.getElementById('addPopupDescription').value;
    
        const isTypeValid = validateField(type, 'addTypeError', 'Type', 'select');
        const isAmountValid = validateField(amountInput, 'addAmountError', 'Amount', 'amount');
        const isCategoryValid = validateField(category, 'addCategoryError', 'Category', 'select');
        const isDateValid = validateField(date, 'addDateError', 'Date', 'date');

        if (!isTypeValid || !isAmountValid || !isCategoryValid || !isDateValid) {
            return;
        }

        const amount = parseFloat(amountInput);

        const response = await fetch('http://localhost:5002/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: type,
                amount: amount,
                category: category,
                date: date,
                description: description
            })
        });
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const json = await response.json();
        transactions.push(json.data);
        createTable(transactions);
        closePopup();

    } catch (error) {
        console.error("Error posting a transaction.", error);
    }
}

async function confirmEdit() {
    try {
        const type = document.getElementById('popupType').value;
        const amountInput = document.getElementById('popupAmount').value;
        const category = document.getElementById('popupCategory').value;
        const date = document.getElementById('popupDate').value;
        const description = document.getElementById('popupDescription').value;

        const isTypeValid = validateField(type, 'editTypeError', 'Type', 'select');
        const isAmountValid = validateField(amountInput, 'editAmountError', 'Amount', 'amount');
        const isCategoryValid = validateField(category, 'editCategoryError', 'Category', 'select');
        const isDateValid = validateField(date, 'editDateError', 'Date', 'date');

        if (!isTypeValid || !isAmountValid || !isCategoryValid || !isDateValid) {
            return;
        }

        const amount = parseFloat(amountInput);

        const response = await fetch(`http://localhost:5002/transactions/${editTransactionId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: editTransactionId,
                type: type,
                amount: amount,
                category: category,
                date: date,
                description: description,
            }),
        });

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const json = await response.json();

        console.log("Before update - transactions:", [...transactions]);

        console.log("Received data from server:", json.data);
        console.log("Looking for transaction with ID:", editTransactionId);

        const index = transactions.findIndex(t => t.id === editTransactionId);
        console.log("Found index:", index);

        if (index !== -1) {
            transactions[index] = json.data;
            console.log("After update - transactions:", [...transactions]); 

        } else {
            console.error("Transaction not found in array!");
        }

        const refreshResponse = await fetch('http://localhost:5002/transactions');
        if (!refreshResponse.ok) {
            throw new Error(`Response status: ${refreshResponse.status}`);
        }
        const refreshJson = await refreshResponse.json();
        transactions = refreshJson.data;

        createTable(transactions);
        
        removeBtn.disabled = true;
        editBtn.disabled = true;
        removeBtn.classList.add("disabled");
        editBtn.classList.add("disabled");
        
        closePopup();
    } catch (error) {
        console.error("Error updating transaction:", error);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const addBtn = document.getElementById("addBtn");
    const removeBtn = document.getElementById("removeBtn");
    const editBtn = document.getElementById("editBtn");

    addBtn.onclick = function () {
        openPopup('add');
    };

    removeBtn.onclick = async function () {
        try {
            const selectedRows = document.querySelectorAll("#transactionsTable tr.selected");
    
            if (selectedRows.length === 0) {
                alert("Please select at least one row to remove.");
                return;
            }
    
            const ids = Array.from(selectedRows).map(row => row.querySelector("td").textContent);
    
            const confirmMessage = selectedRows.length > 1
                ? `Are you sure you want to delete the selected ${selectedRows.length} rows?`
                : "Are you sure you want to delete the selected row?";
    
            const confirmDelete = confirm(confirmMessage);
            if (!confirmDelete) return;
    
            const response = await fetch("http://localhost:5002/transactions", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids }),
            });
    
            if (!response.ok) {
                throw new Error(`Failed to delete transactions: ${response.status}`);
            }
    
            transactions = transactions.filter(transaction => !ids.includes(String(transaction.id)));
    
            selectedRows.forEach(row => row.remove());
    
            createTable(transactions);
            
            removeBtn.disabled = true;
            editBtn.disabled = true;
            removeBtn.classList.add("disabled");
            editBtn.classList.add("disabled");
            
            closePopup();
    
            alert("Transaction(s) deleted successfully!");
        } catch (error) {
            console.error("Error deleting transaction(s):", error);
            alert("Failed to delete transaction(s). Please try again.");
        }
    };

    editBtn.onclick = function () {
        const selectedRows = document.querySelectorAll("#transactionsTable tr.selected");
        if (selectedRows.length === 1) {
            editButton(selectedRows[0]);
        } else {
            alert("Please select only one row to edit.");
        }
    };
});

async function masterFilter() {
    filteredTransactions = transactions.slice();

    const type = document.getElementById("type").value;
    const categories = document.getElementById("categories").value;
    const amount = document.getElementById("amount").value;
    const input = document.querySelector(".input-wrapper .input").value.toUpperCase();

    console.log("Dropdown selection value:", type);
    console.log("Dropdown selection value:", categories);
    console.log("Dropdown selection value:", amount);
    console.log("Dropdown selection value:", input);

    if (type !== "ignore") {
        filteredTransactions = filteredTransactions.filter(transaction => 
            type === "Expenses" 
                ? transaction.type === "expense" 
                : transaction.type === "income"
        );
    }

    if (categories !== "ignore") {
        filteredTransactions = filteredTransactions.filter(transaction => transaction.category === categories);
    }

    if (amount !== "ignore") {
        try {
            const sort = amount === "ascAmount" ? "asc" : "desc";
            const response = await fetch(`http://localhost:5002/transactions?sort=${sort}`);
            if (!response.ok) {
                throw new Error("Failed to fetch sorted transactions");
            }
            const json = await response.json();
            filteredTransactions = json.data; 
        } catch (error) {
            console.error("Error fetching sorted transactions:", error);
        }
    } else {
        filteredTransactions = filteredTransactions.sort((a, b) => a.id - b.id);
    }

    if (input !== "") {
        filteredTransactions = filteredTransactions.filter(transaction => {
            return (
                transaction.type.toUpperCase().includes(input) ||
                transaction.category.toUpperCase().includes(input) ||
                transaction.description.toUpperCase().includes(input) ||
                transaction.date.includes(input) || 
                String(transaction.amount).includes(input) 
            );
        });
    }

    console.log("Filtered Transactions after selection:", filteredTransactions);
    createTable(filteredTransactions);
}

async function darkModeFunction() {
    try {
        const element = document.getElementById("body");
        const darkMode = !element.classList.contains("darkmode");

        if (darkMode) {
            element.classList.add("darkmode");
        } else {
            element.classList.remove("darkmode");
        }

        const response = await fetch('http://localhost:5002/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ darkMode }),
        });

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const json = await response.json();
        console.log("Dark mode updated in database:", json);

        settings.darkMode = darkMode;
        
        setChartBackground();
    } catch (error) {
        console.error("Error updating dark mode:", error);
    }
}

async function loadDarkMode() {
    try {
        const element = document.getElementById("body");
        const response = await fetch('http://localhost:5002/settings');
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const json = await response.json();
        console.log(json);

        settings = json.data[0] || { darkMode: false };

        if (settings.darkMode) {
            element.classList.add("darkmode");
        }
        else {
            element.classList.remove("darkmode");
        }
    }
    catch (error) {
        console.error("Error fetching settings:", error);
    }

    setChartBackground();
}

window.onload = async function() {
    await loadFromDataBase(); 
    await loadDarkMode();

    const type = document.getElementById("type");
    const categories = document.getElementById("categories");
    const amount = document.getElementById("amount");
    const input = document.querySelector(".input-wrapper .input");

    removeBtn = document.querySelector(".remove-selected button");
    editBtn = document.querySelector(".edit-selected button");
    addBtn = document.querySelector(".add-selected button");
    clearBtn = document.querySelector(".clear button");

    removeBtn.disabled = true;
    editBtn.disabled = true;
    addBtn.disabled = false;
    addBtn.classList.remove("disabled");
    clearBtn.disabled = true;

    type.addEventListener("change", () => {
        filterChecker();
        masterFilter(); 
    });
    categories.addEventListener("change", () => {
        filterChecker();
        masterFilter(); 
    });
    amount.addEventListener("change", () => {
        filterChecker();
        masterFilter(); 
    });
    input.addEventListener("input", () => {
        filterChecker();
        masterFilter(); 
    });

    filterChecker();
    clearButton(); 
}

function createTable(data = transactions) {
    const tbody = document.querySelector("#transactionsTable tbody");
    tbody.innerHTML = ""; 
    
    if (!data || data.length === 0) {
        const emptyRow = document.createElement("tr");
        emptyRow.className = "empty-state-row";
        const emptyCell = document.createElement("td");
        emptyCell.colSpan = 6;
        emptyCell.className = "empty-state-cell";
        emptyCell.innerHTML = `
            <div class="empty-content">
                <h3>No Transactions Yet</h3>
                <p>Start tracking your finances by adding your first transaction.</p>
            </div>
        `;
        emptyRow.appendChild(emptyCell);
        tbody.appendChild(emptyRow);
        
        const chartWrapper = document.querySelector(".chart-wrapper");
        chartWrapper.style.display = "none";
    } else {
        data.forEach(transaction => {
            var tr = document.createElement("tr");
            tr.addEventListener("click", selectRow);
            Object.values(transaction).forEach(cell => {
                var td = document.createElement("td");
                td.textContent = cell;
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        
        const chartWrapper = document.querySelector(".chart-wrapper");
        chartWrapper.style.display = "flex";
    }
    
    color();
    income();
    expenses();
    balance();
    calculateAndDrawChart();
}


function openPopup(type, options = {}) {
    const popup = document.getElementById("popup");
    const popupTitle = document.getElementById("popupTitle");
    const addTransactionForm = document.getElementById("addTransactionForm");
    const editTransactionForm = document.getElementById("editTransactionForm");
    const removeTransactionForm = document.getElementById("removeTransactionForm");
    const confirmAction = document.getElementById("confirmAction");

    if (type === 'add') {
        popupTitle.textContent = "Add Transaction";
        addTransactionForm.style.display = "block";
        removeTransactionForm.style.display = "none";
        editTransactionForm.style.display = "none";
        
        document.getElementById('addPopupType').selectedIndex = 0;
        document.getElementById('addPopupAmount').value = '';
        document.getElementById('addPopupCategory').selectedIndex = 0;
        document.getElementById('addPopupDate').value = '';
        document.getElementById('addPopupDescription').value = '';
        
        ['addTypeError', 'addAmountError', 'addCategoryError', 'addDateError'].forEach(errorId => {
            const errorElement = document.getElementById(errorId);
            if (errorElement) {
                const inputElement = errorElement.previousElementSibling;
                if (inputElement) {
                    inputElement.classList.remove('has-error');
                }
                errorElement.textContent = '';
            }
        });
    } 
    else if (type === 'remove') {
        popupTitle.textContent = "Remove Transaction";
        addTransactionForm.style.display = "none";
        removeTransactionForm.style.display = "block";
        editTransactionForm.style.display = "none";

        document.getElementById("confirmationText").textContent = options.message || "Are you sure?";

        confirmAction.onclick = function () {
            options.onConfirm();
            closePopup();
        };
    }
    else {
        popupTitle.textContent = "Edit Transaction";
        addTransactionForm.style.display = "none";
        removeTransactionForm.style.display = "none";
        editTransactionForm.style.display = "block";

        confirmAction.onclick = confirmEdit;
    }

    popup.style.display = "flex";
}


function closePopup() {
    document.getElementById("popup").style.display = "none";
}


function editButton() {
    const selectedRows = document.querySelectorAll("#transactionsTable tr.selected");

    if (selectedRows.length !== 1) {
        alert("Please select exactly one row to edit.");
        return;
    }

    const cells = selectedRows[0].querySelectorAll("td");
    editTransactionId = cells[0].textContent; 

    document.getElementById('popupType').value = cells[1].textContent;
    document.getElementById('popupAmount').value = parseFloat(cells[2].textContent);
    document.getElementById('popupCategory').value = cells[3].textContent;
    document.getElementById('popupDate').value = cells[4].textContent;
    document.getElementById('popupDescription').value = cells[5].textContent;
    
    ['editTypeError', 'editAmountError', 'editCategoryError', 'editDateError'].forEach(errorId => {
        const errorElement = document.getElementById(errorId);
        if (errorElement) {
            const inputElement = errorElement.previousElementSibling;
            if (inputElement) {
                inputElement.classList.remove('has-error');
            }
            errorElement.textContent = '';
        }
    });

    openPopup('edit');
}


function filterChecker() {
    const input = document.querySelector(".input-wrapper .input").value.trim();
    const type = document.getElementById("type").value;
    const categories = document.getElementById("categories").value;
    const amount = document.getElementById("amount").value;

    console.log("Filter Values ->", { input, type, categories, amount });

    const isAnyFilterActive = input !== "" || type !== "ignore" || categories !== "ignore" || amount !== "ignore";

    if (isAnyFilterActive) {
        clearBtn.disabled = false;
        clearBtn.classList.remove("disabled");
        console.log("Clear button enabled because a filter is active.");
    } else {
        clearBtn.disabled = true;
        clearBtn.classList.add("disabled");
        console.log("Clear button disabled because no filters are active.");
    }
}


function selectRow() {
    this.classList.toggle("selected");
    const selectedRows = document.querySelectorAll("#transactionsTable tr.selected");

    if (selectedRows.length > 0) {
        console.log("Row selected!");
        removeBtn.disabled = false;
        editBtn.disabled = false;
        removeBtn.classList.remove("disabled");
        editBtn.classList.remove("disabled");
    } 
    else {
        console.log("No rows selected!");
        removeBtn.disabled = true;
        editBtn.disabled = true;
        removeBtn.classList.add("disabled");
        editBtn.classList.add("disabled");
    }
}


function income() {
    const incomeContainer = document.getElementsByClassName("income")[0];

    let text = incomeContainer.querySelector("p.income-total");

    if (!text) {
        text = document.createElement("p");
        text.classList.add("income-total"); 
        incomeContainer.appendChild(text);  
    }

    incomeTotal = 0;
    transactions.forEach(cell => {
        if (cell.type === "income") {
            incomeTotal += cell.amount;
        }
    });

    text.textContent = "$" + incomeTotal; 
}

function expenses(){
    const expenseContainer = document.getElementsByClassName("expenses")[0];

    let text = expenseContainer.querySelector("p.expense-total");
    
        if (!text) {
        text = document.createElement("p");
        text.classList.add("expense-total"); 
        expenseContainer.appendChild(text);  
    }

    expensesTotal = 0;
    transactions.forEach(cell => {
        if (cell.type === "expense") {
            expensesTotal += cell.amount;
        }
    });
    
    text.textContent = "$" + expensesTotal;
}

function balance(){
    const balanceContainer = document.getElementsByClassName("balance")[0];

    let text = balanceContainer.querySelector("p.balance-total");
    
    if (!text) {
        text = document.createElement("p");
        text.classList.add("balance-total"); 
        balanceContainer.appendChild(text);  
    }
    
    let balanceTotal = 0;
    balanceTotal = incomeTotal - expensesTotal;
    text.textContent = "$" + balanceTotal; 
}

function color(){
    const cells = document.querySelectorAll("#transactionsTable td")
    cells.forEach(cell => {
        if (cell.textContent == "income") {
            cell.style.color = "green";
        }
        else if(cell.textContent == "expense"){
            cell.style.color = "red"
        }
    });
}

function clearButton() {
    clearBtn = document.querySelector(".clear button");
    const input = document.querySelector(".input-wrapper .input");
    const amount = document.getElementById("amount");
    const type = document.getElementById("type");
    const categories = document.getElementById("categories");

    clearBtn.addEventListener("click", function() {
        input.value = "";
        amount.value = "ignore";
        type.value = "ignore";
        categories.value = "ignore";

        filterChecker();
        masterFilter();
        createTable(filteredTransactions);
    });
}

function clearChart() {
    if (chart) {
        chart.dispose();
        chart = null;
    }
}

function setChartBackground() {
    if (!chart) {
        console.warn("Chart is not initialized.");
        return;
    }
    const isDarkMode = document.body.classList.contains("darkmode");
    chart.background()
        .fill(isDarkMode ? "#1a1f26" : "#ffffffff")
        .cornerType("round")
        .corners(12);
    
    chart.title().fontColor(isDarkMode ? "#f2f2f2" : "#333");
}


function calculateAndDrawChart() {
    const chartWrapper = document.querySelector(".chart-wrapper");
    
    if (!transactions || transactions.length === 0) {
        chartWrapper.style.display = "none";
        clearChart();
        return;
    }
    
    chartWrapper.style.display = "flex";
    
    clearChart();

    let incomeTotal = 0;
    let expensesTotal = 0;
    transactions.forEach(transaction => {
        if (transaction.type === "income") {
            incomeTotal += transaction.amount;
        } else if (transaction.type === "expense") {
            expensesTotal += transaction.amount;
        }
    });

    const data = anychart.data.set([
        ["Income", incomeTotal],
        ["Expenses", expensesTotal],
    ]);

    chart = anychart.pie(data);

    const palette = anychart.palettes.distinctColors();
    palette.items([{ color: "#5D9C59" }, { color: "#DF2E38" }]);
    chart.palette(palette);

    const isDarkMode = document.body.classList.contains("darkmode");
    chart.title()
        .enabled(true)
        .text("Income vs Expenses")
        .fontSize(18)

    chart.container("chart-container");
    chart.draw();
    
    setChartBackground();
}