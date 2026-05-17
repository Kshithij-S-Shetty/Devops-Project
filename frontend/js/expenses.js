/**
 * Expenses Page Logic
 * Handles CRUD operations and filtering for the transactions table.
 */

document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('expense-table-body');
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const expenseForm = document.getElementById('expense-form');
    const typeSelect = document.getElementById('expense-type');
    const categorySelect = document.getElementById('expense-category');
    
    // Setup Modal
    const modalControls = setupModal('expense-modal'); // Removed triggerBtnId to handle manually

    // Define Categories
    const expenseCategories = ['Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other Expense'];
    const incomeCategories = ['Salary', 'Freelancing', 'Business', 'Scholarship', 'Pocket Money', 'Investments', 'Bonus', 'Other Income'];

    // Populate filter dropdown
    function populateFilterDropdown() {
        const allCategories = [...expenseCategories, ...incomeCategories];
        let filterHtml = '<option value="All">All Categories</option>';
        allCategories.forEach(cat => {
            filterHtml += `<option value="${cat}">${cat}</option>`;
        });
        categoryFilter.innerHTML = filterHtml;
    }
    populateFilterDropdown();

    // Dynamically update category dropdown based on type
    function updateCategoryDropdown(type, selectedValue = '') {
        const categories = type === 'income' ? incomeCategories : expenseCategories;
        categorySelect.innerHTML = categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
        if (selectedValue && categories.includes(selectedValue)) {
            categorySelect.value = selectedValue;
        }
    }


    // Init Date to today
    document.getElementById('expense-date').valueAsDate = new Date();

    // Render Table
    async function renderTable() {
        const allTransactions = await getTransactions();
        const searchTerm = searchInput.value.toLowerCase();
        const catFilter = categoryFilter.value;

        // Apply filters
        const filtered = allTransactions.filter(e => {
            const matchSearch = e.description.toLowerCase().includes(searchTerm);
            const matchCat = catFilter === 'All' || e.category === catFilter;
            return matchSearch && matchCat;
        });

        if (filtered.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5">
                        <div class="text-center text-muted" style="padding: 3rem 0;">
                            <i class="fas fa-folder-open mb-2" style="font-size: 2.5rem; opacity: 0.5;"></i>
                            <p style="margin-top: 1rem;">No transactions found.</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        let html = '';
        filtered.forEach(tx => {
            const isIncome = tx.type === 'income';
            const colorClass = isIncome ? 'text-secondary' : 'text-danger';
            const sign = isIncome ? '+' : '-';
            
            const badgeClass = isIncome ? 'badge-success' : 'badge-danger';

            html += `
                <tr>
                    <td class="text-muted">${tx.date}</td>
                    <td style="font-weight: 500;">${tx.description}</td>
                    <td><span class="badge ${badgeClass}">${tx.category}</span></td>
                    <td class="${colorClass}" style="font-weight: 600;">${sign}${formatMoney(tx.amount)}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-action edit" onclick="handleEditTransaction('${tx._id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-action delete" onclick="handleDeleteTransaction('${tx._id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });

        tableBody.innerHTML = html;
    }

    // Filter event listeners
    searchInput.addEventListener('input', renderTable);
    categoryFilter.addEventListener('change', renderTable);

    // Form Submit (Add/Edit)
    expenseForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('expense-id').value;
        const type = document.getElementById('expense-type').value;
        const amount = document.getElementById('expense-amount').value;
        const category = document.getElementById('expense-category').value;
        const description = document.getElementById('expense-desc').value;
        const date = document.getElementById('expense-date').value;

        const data = { type, amount, category, description, date };

        try {
            if (id) {
                await updateTransaction(id, data);
            } else {
                await addTransaction(data);
            }

            modalControls.hide();
            expenseForm.reset();
            document.getElementById('expense-id').value = '';
            document.getElementById('expense-date').valueAsDate = new Date();
            await renderTable();
        } catch (err) {
            alert(err.message);
        }
    });

    // Make edit/delete globally available
    window.handleEditTransaction = async function(id) {
        const all = await getTransactions();
        const tx = all.find(t => t._id === id);
        if(!tx) return;

        document.getElementById('modal-title').innerText = 'Edit Transaction';
        document.getElementById('expense-id').value = tx._id;
        document.getElementById('expense-type').value = tx.type;
        updateCategoryDropdown(tx.type, tx.category); // Update categories dynamically
        document.getElementById('expense-amount').value = tx.amount;
        document.getElementById('expense-desc').value = tx.description;
        document.getElementById('expense-date').value = tx.date;

        modalControls.show();
    };

    window.handleDeleteTransaction = async function(id) {
        if(confirm('Are you sure you want to delete this transaction?')) {
            try {
                await deleteTransaction(id);
                await renderTable();
            } catch (err) {
                alert(err.message);
            }
        }
    };

    // Open Modal for Add Expense
    document.getElementById('btn-add-expense').addEventListener('click', () => {
        document.getElementById('modal-title').innerText = 'Add Expense';
        document.getElementById('expense-id').value = '';
        expenseForm.reset();
        document.getElementById('expense-type').value = 'expense';
        updateCategoryDropdown('expense');
        document.getElementById('expense-date').valueAsDate = new Date();
        modalControls.show();
    });

    // Open Modal for Add Income
    document.getElementById('btn-add-income').addEventListener('click', () => {
        document.getElementById('modal-title').innerText = 'Add Income';
        document.getElementById('expense-id').value = '';
        expenseForm.reset();
        document.getElementById('expense-type').value = 'income';
        updateCategoryDropdown('income');
        document.getElementById('expense-date').valueAsDate = new Date();
        modalControls.show();
    });

    // Initial Render
    renderTable();
});
