let myBarChart = null;
let dashboardFullList = []; 
let personBalances = {}; 

document.addEventListener('DOMContentLoaded', () => {
    const webAppUrl = "https://script.google.com/macros/s/AKfycby8B7bb6RUVRDI_yQE3fi7CidIOYE2T8e9hzzOoYczkXF4uZCzUUpeIwdVx9aQc_x_kMA/exec";

    // --- 1. ELEMENT SELECTION ---
    const modal = document.getElementById("loanModal");
    const openBtn = document.getElementById("openModalBtn");
    const closeBtn = document.querySelector(".close-btn");
    const loanForm = document.getElementById('loanForm');

    const paymentModal = document.getElementById("paymentModal");
    const openPaymentBtn = document.getElementById("openPaymentModalBtn");
    const closePaymentBtn = document.querySelector(".close-payment-btn");
    const paymentForm = document.getElementById('paymentForm');
    const paymentPersonSelect = document.getElementById('paymentPersonName');
    const paymentAmountInput = document.getElementById('paymentAmount'); 

    const loanTypeSelect = document.getElementById('loanType');
    const interestGroup = document.getElementById('interestGroup');
    const interestInput = document.getElementById('interestRate');
    const tenureGroup = document.getElementById('tenureGroup');
    const tenureInput = document.getElementById('tenure');
    const clientSearchInput = document.getElementById('clientSearchInput');
    const personNameInput = document.getElementById('personName');

    // --- 2. MODAL CONTROLS ---
    openBtn.onclick = () => { modal.style.display = "block"; };
    closeBtn.onclick = () => { 
        modal.style.display = "none"; 
        loanForm.reset();
        interestGroup.style.display = 'none';
        tenureGroup.style.display = 'none';
    };
    
    openPaymentBtn.onclick = () => { 
        paymentModal.style.display = "block"; 
        refreshNameDropdown(); 
    };
    closePaymentBtn.onclick = () => { paymentModal.style.display = "none"; };

    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = "none";
            loanForm.reset();
            interestGroup.style.display = 'none';
            tenureGroup.style.display = 'none';
        }
        if (event.target == paymentModal) paymentModal.style.display = "none";
    };

    function toggleGlobalLoader(show) {
        const loader = document.getElementById('loader-overlay');
        if (loader) loader.style.display = show ? 'flex' : 'none';
    }

    // --- 3. UI LOGIC ---

    // Auto-fill Loan Type when a name is selected/typed
    if (personNameInput) {
        personNameInput.addEventListener('input', function() {
            const typedName = this.value.trim().toLowerCase();
            if (typedName.length < 2) return; 

            const existing = dashboardFullList.find(item => {
                const cleanDataName = item.name.split('(')[0].trim().toLowerCase();
                return cleanDataName === typedName;
            });
            
            if (existing && existing.type) {
                loanTypeSelect.value = existing.type;
                loanTypeSelect.dispatchEvent(new Event('change'));
                this.style.borderColor = "#d4af37"; 
            } else {
                this.style.borderColor = "#ccc";
            }
        });
    }

    if (loanTypeSelect) {
        loanTypeSelect.addEventListener('change', function() {
            if (this.value === 'Company') {
                interestGroup.style.display = 'none';
                interestInput.value = '0';
                interestInput.required = false;
                tenureGroup.style.display = 'none';
                tenureInput.value = '1';
                tenureInput.required = false;
            } else {
                interestGroup.style.display = 'block';
                interestInput.required = true;
                tenureGroup.style.display = 'block';
                tenureInput.required = true;
            }
        });
    }

    paymentPersonSelect.addEventListener('change', function() {
        const selectedName = this.value;
        if (personBalances[selectedName] !== undefined) {
            const balance = personBalances[selectedName];
            paymentAmountInput.value = ""; 
            paymentAmountInput.placeholder = "Total Owed: ₹" + balance.toLocaleString('en-IN');
        } else {
            paymentAmountInput.placeholder = "Amount Paid";
        }
    });

    paymentAmountInput.addEventListener('input', function() {
        const selectedName = paymentPersonSelect.value;
        if (!selectedName || personBalances[selectedName] === undefined) return;

        const maxBalance = parseFloat(personBalances[selectedName]);
        const enteredAmount = parseFloat(this.value);

        if (!isNaN(enteredAmount) && enteredAmount > maxBalance) {
            alert("Amount Exceeded! You only owe ₹" + maxBalance.toLocaleString('en-IN'));
            this.value = maxBalance; 
        }
    });

    if(clientSearchInput) {
        clientSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') filterClientHistory();
        });
    }

    async function refreshNameDropdown() {
        paymentPersonSelect.innerHTML = '<option value="" disabled selected>Loading Names...</option>';
        try {
            const response = await fetch(webAppUrl);
            const data = await response.json();
            paymentPersonSelect.innerHTML = '<option value="" disabled selected>Select Person</option>';
            
            personBalances = {}; 

            if (data.fullList && data.fullList.length > 0) {
                data.fullList.forEach(item => {
                    const name = item.name.split('(')[0].trim(); 
                    const bal = parseFloat(item.balance) || 0;
                    personBalances[name] = (personBalances[name] || 0) + bal;
                });

                Object.keys(personBalances).forEach(name => {
                    if (personBalances[name] > 0) {
                        let opt = document.createElement('option');
                        opt.value = name;
                        opt.innerHTML = name;
                        paymentPersonSelect.appendChild(opt);
                    }
                });
            }
        } catch (e) { console.error("Error refreshing names:", e); }
    }

    // --- 4. DATA LOADING ---
    async function loadDashboardData() {
        toggleGlobalLoader(true);
        try {
            const response = await fetch(webAppUrl);
            const data = await response.json();
            
            dashboardFullList = data.fullList || [];
            updateSearchSuggestions(); 
        
            const mapping = {
                '.kpi-1 .value': data.totalPerson,
                '.kpi-2 .value': data.totalTypes,
                '.kpi-4 .value': "₹" + (parseFloat(data.totalAmount) || 0).toLocaleString('en-IN'),
                '.kpi-7 .value': "₹" + (parseFloat(data.totalBalance) || 0).toLocaleString('en-IN'),
                '.kpi-8 .value': "₹" + (parseFloat(data.companyTotal) || 0).toLocaleString('en-IN'),
                '.kpi-bank .value': "₹" + (parseFloat(data.bankTotal) || 0).toLocaleString('en-IN'),
                '.kpi-daily .value': "₹" + (parseFloat(data.dailyTotal) || 0).toLocaleString('en-IN'),
                '.kpi-private .value': "₹" + (parseFloat(data.privateLoanTotal) || 0).toLocaleString('en-IN'),
                '.kpi-others .value': "₹" + (parseFloat(data.othersTotal) || 0).toLocaleString('en-IN'),
                '.kpi-completed .value': data.completedCount || 0
            };

            for (let selector in mapping) {
                const el = document.querySelector(selector);
                if (el) el.innerText = mapping[selector];
            }

            if (data.labels && data.values) {
                updateBarChart(data.labels, data.values);
            }
        
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            toggleGlobalLoader(false);
        }
    }

    // --- 5. FORM SUBMISSIONS ---
    loanForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = loanForm.querySelector('button');
        submitBtn.innerHTML = '<span class="spinner"></span> Saving...';
        submitBtn.disabled = true;

        const rawName = document.getElementById('personName').value.trim();
        const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

        const payload = {
            action: "addLoan",
            personName: formattedName,
            amount: document.getElementById('loanAmount').value,
            interest: interestInput.value || "0",
            loanType: loanTypeSelect.value,
            tenure: tenureInput.value || "1"
        };

        try {
            await fetch(webAppUrl, {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: { 'Content-Type': 'text/plain;charset=utf-8' }
            });
            alert("Loan added successfully!");
            modal.style.display = "none"; 
            loanForm.reset(); 
            loadDashboardData(); 
        } catch (error) { alert("Error: " + error); } 
        finally { submitBtn.innerHTML = 'Save Loan'; submitBtn.disabled = false; }
    });

    paymentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('savePaymentBtn');
        submitBtn.innerHTML = '<span class="spinner"></span> Updating...';
        submitBtn.disabled = true;

        const payload = {
            action: "recordPayment",
            personName: document.getElementById('paymentPersonName').value,
            paymentAmount: document.getElementById('paymentAmount').value
        };

        try {
            const response = await fetch(webAppUrl, {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: { 'Content-Type': 'text/plain;charset=utf-8' }
            });
            const result = await response.text();
            alert(result);
            paymentModal.style.display = "none";
            paymentForm.reset();
            loadDashboardData();
        } catch (error) { alert("Error: " + error); } 
        finally { submitBtn.innerHTML = 'Update Balance'; submitBtn.disabled = false; }
    });

    loadDashboardData();
});

// --- 6. HISTORY & SUGGESTION LOGIC ---
function updateSearchSuggestions() {
    const searchList = document.getElementById('clientNamesList');
    const entryList = document.getElementById('allClientsList');
    
    const uniqueNames = [...new Set(dashboardFullList.map(item => {
        return item.name.split('(')[0].trim();
    }))];
    
    uniqueNames.sort();
    const optionsHtml = uniqueNames.map(name => `<option value="${name}">`).join('');
    
    if (searchList) searchList.innerHTML = optionsHtml;
    if (entryList) entryList.innerHTML = optionsHtml;
}

function filterClientHistory() {
    const input = document.getElementById('clientSearchInput');
    const filter = input.value.trim().toUpperCase();
    const listContainer = document.getElementById('historyList');
    
    if (filter === "") return;

    const history = dashboardFullList.filter(item => {
        return item.name.split('(')[0].trim().toUpperCase() === filter;
    });

    if (history.length === 0) {
        listContainer.innerHTML = "<li>No records found</li>";
        return;
    }

    listContainer.innerHTML = history.map(item => {
        const bal = parseFloat(item.balance) || 0;
        // Logic: If 'amount' is zero/missing, show the original 'totalWithInt'
        const amt = parseFloat(item.amount) || parseFloat(item.totalWithInt) || 0;
        
        const isCleared = bal <= 0;

        return `
        <li style="padding: 15px; border-bottom: 1px solid #eee; background: ${isCleared ? '#f0fdf4' : '#fff'}; border-left: 5px solid ${isCleared ? '#22c55e' : '#ef4444'}; margin-bottom: 5px; border-radius: 4px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: bold; color: #333;">${item.type}</span>
                <span style="color: ${isCleared ? '#166534' : '#991b1b'}; background: ${isCleared ? '#dcfce7' : '#fee2e2'}; font-weight: 800; font-size: 0.65rem; padding: 2px 8px; border-radius: 10px; text-transform: uppercase;">
                    ${isCleared ? 'Cleared' : 'Pending'}
                </span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 10px;">
                <div>
                    <small style="color: #666; display: block; font-size: 0.7rem; text-transform: uppercase;">Original Loan</small>
                    <span style="color: #333; font-weight: 600;">₹${amt.toLocaleString('en-IN')}</span>
                </div>
                <div style="text-align: right;">
                    <small style="color: #666; display: block; font-size: 0.7rem; text-transform: uppercase;">Current Balance</small>
                    <span style="font-weight: 800; color: ${isCleared ? '#166534' : '#b91c1c'}; font-size: 1rem;">
                        ₹${bal.toLocaleString('en-IN')}
                    </span>
                </div>
            </div>
        </li>`;
    }).join('');
}

function clearSearch() {
    document.getElementById('clientSearchInput').value = "";
    document.getElementById('historyList').innerHTML = "<li style='color:#888; text-align:center; margin-top:20px;'>Enter a name and press Lookup</li>";
}

// --- 7. GROUPED DROPDOWN LOGIC ---
function toggleCardDetails(cardElement, category) {
    const isActive = cardElement.classList.contains('active');
    document.querySelectorAll('.card').forEach(c => c.classList.remove('active'));
    
    if (!isActive) {
        cardElement.classList.add('active');
        
        // Handle Search card focus
        if (category === 'Search') {
            const input = document.getElementById('clientSearchInput');
            if (input) input.focus();
            return;
        }

        const listContainer = cardElement.querySelector('.dropdown-list ul');
        if (!listContainer) return;

        // --- NEW: SPECIAL LOGIC FOR "TYPES" CARD (KPI-2) ---
        if (category === 'Types') {
            const typeTotals = {};
            dashboardFullList.forEach(item => {
                const typeName = item.type || "Others";
                const bal = parseFloat(item.balance) || 0;
                typeTotals[typeName] = (typeTotals[typeName] || 0) + bal;
            });

            const sortedTypes = Object.keys(typeTotals).sort();
            listContainer.innerHTML = sortedTypes.length === 0 
                ? "<li>No records found</li>" 
                : sortedTypes.map(t => `
                    <li>
                        <span class="name">${t}</span> 
                        <span class="amt">₹${typeTotals[t].toLocaleString('en-IN')}</span>
                    </li>`).join('');
            return; // Exit after handling Types
        }

        // --- STANDARD LOGIC FOR ALL OTHER CARDS ---
        const filtered = dashboardFullList.filter(item => {
            if (category === 'Total' || category === 'Total Amount') return true;
            if (category === 'Completed') return Number(item.balance) <= 0;
            if (category === 'Balance') return Number(item.balance) > 0;
            return item.type === category;
        });

        const grouped = {};
        filtered.forEach(item => {
            const name = item.name.split('(')[0].trim(); 
            const bal = parseFloat(item.balance) || 0;
            grouped[name] = (grouped[name] || 0) + bal;
        });

        const sortedNames = Object.keys(grouped).sort();
        listContainer.innerHTML = sortedNames.length === 0 
            ? "<li>No records found</li>" 
            : sortedNames.map(name => `
                <li>
                    <span class="name">${name}</span> 
                    <span class="amt">₹${grouped[name].toLocaleString('en-IN')}</span>
                </li>`).join('');
    }
}

// --- 8. CHARTING ---
function updateBarChart(labels, values) {
    const canvas = document.getElementById('loanBarChart');
    if (!canvas) return; 
    const ctx = canvas.getContext('2d');
    if (myBarChart) { myBarChart.destroy(); }

    myBarChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels, 
            datasets: [{
                label: 'Current Balance (₹)',
                data: values, 
                backgroundColor: '#60a5fa', 
                borderRadius: 6,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: '#f0f0f0' } },
                x: { grid: { display: false } }
            }
        }
    });
}