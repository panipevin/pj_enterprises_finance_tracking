// let myBarChart = null;
// let dashboardFullList = []; 
// let personBalances = {}; 

// document.addEventListener('DOMContentLoaded', () => {
//     const webAppUrl = "https://script.google.com/macros/s/AKfycby8B7bb6RUVRDI_yQE3fi7CidIOYE2T8e9hzzOoYczkXF4uZCzUUpeIwdVx9aQc_x_kMA/exec";

//     // --- 1. ELEMENT SELECTION ---
//     const modal = document.getElementById("loanModal");
//     const openBtn = document.getElementById("openModalBtn");
//     const closeBtn = document.querySelector(".close-btn");
//     const loanForm = document.getElementById('loanForm');

//     const paymentModal = document.getElementById("paymentModal");
//     const openPaymentBtn = document.getElementById("openPaymentModalBtn");
//     const closePaymentBtn = document.querySelector(".close-payment-btn");
//     const paymentForm = document.getElementById('paymentForm');
//     const paymentPersonSelect = document.getElementById('paymentPersonName');
//     const paymentAmountInput = document.getElementById('paymentAmount'); 

//     const loanTypeSelect = document.getElementById('loanType');
//     const interestGroup = document.getElementById('interestGroup');
//     const interestInput = document.getElementById('interestRate');
//     const tenureGroup = document.getElementById('tenureGroup');
//     const tenureInput = document.getElementById('tenure');

//     // --- 2. MODAL CONTROLS ---
//     openBtn.onclick = () => { modal.style.display = "block"; };
//     closeBtn.onclick = () => { 
//         modal.style.display = "none"; 
//         loanForm.reset();
//         interestGroup.style.display = 'none';
//         tenureGroup.style.display = 'none';
//     };
    
//     openPaymentBtn.onclick = () => { 
//         paymentModal.style.display = "block"; 
//         refreshNameDropdown(); 
//     };
//     closePaymentBtn.onclick = () => { paymentModal.style.display = "none"; };

//     window.onclick = (event) => {
//         if (event.target == modal) {
//             modal.style.display = "none";
//             loanForm.reset();
//             interestGroup.style.display = 'none';
//             tenureGroup.style.display = 'none';
//         }
//         if (event.target == paymentModal) paymentModal.style.display = "none";
//     };

//     function toggleGlobalLoader(show) {
//         const loader = document.getElementById('loader-overlay');
//         if (loader) loader.style.display = show ? 'flex' : 'none';
//     }

//     // --- 3. UI LOGIC (Show/Hide Interest & Tenure) ---
//     if (loanTypeSelect) {
//         loanTypeSelect.addEventListener('change', function() {
//             if (this.value === 'Company') {
//                 interestGroup.style.display = 'none';
//                 interestInput.value = '0';
//                 interestInput.required = false;
//                 tenureGroup.style.display = 'none';
//                 tenureInput.value = '1';
//                 tenureInput.required = false;
//             } else {
//                 interestGroup.style.display = 'block';
//                 interestInput.required = true;
//                 tenureGroup.style.display = 'block';
//                 tenureInput.required = true;
//             }
//         });
//     }

//     // --- SET BALANCE AS BACKGROUND (PLACEHOLDER) ---
//     paymentPersonSelect.addEventListener('change', function() {
//         const selectedName = this.value;
//         if (personBalances[selectedName] !== undefined) {
//             const balance = personBalances[selectedName];
//             paymentAmountInput.value = ""; 
//             paymentAmountInput.placeholder = "Current Balance: ₹" + balance;
//         } else {
//             paymentAmountInput.placeholder = "Amount Paid";
//         }
//     });

//     // --- PREVENT OVERPAYMENT ALERT ---
//     paymentAmountInput.addEventListener('input', function() {
//         const selectedName = paymentPersonSelect.value;
//         if (!selectedName || personBalances[selectedName] === undefined) return;

//         const maxBalance = parseFloat(personBalances[selectedName]);
//         const enteredAmount = parseFloat(this.value);

//         if (!isNaN(enteredAmount) && enteredAmount > maxBalance) {
//             alert("Amount Exceeded! You only owe ₹" + maxBalance);
//             this.value = maxBalance; 
//         }
//     });

//     async function refreshNameDropdown() {
//         paymentPersonSelect.innerHTML = '<option value="" disabled selected>Loading Names...</option>';
//         paymentAmountInput.placeholder = "Amount Paid";
//         try {
//             const response = await fetch(webAppUrl);
//             const data = await response.json();
//             paymentPersonSelect.innerHTML = '<option value="" disabled selected>Select Person</option>';
            
//             personBalances = {}; 

//             if (data.fullList && data.fullList.length > 0) {
//                 data.fullList.forEach(item => {
//                     personBalances[item.name] = parseFloat(item.balance);
                    
//                     let opt = document.createElement('option');
//                     opt.value = name; // Note: Ensure your AppScript sends name correctly
//                     opt.innerHTML = item.name;
//                     paymentPersonSelect.appendChild(opt);
//                 });
//             }
//         } catch (e) { console.error("Error refreshing names:", e); }
//     }

//     // --- 4. DATA LOADING ---
//     async function loadDashboardData() {
//         toggleGlobalLoader(true);
//         try {
//             const response = await fetch(webAppUrl);
//             const data = await response.json();
            
//             dashboardFullList = data.fullList || [];
        
//             const mapping = {
//                 '.kpi-1 .value': data.totalPerson,
//                 '.kpi-2 .value': data.totalTypes,
//                 '.kpi-4 .value': "₹" + (data.totalAmount || 0),
//                 '.kpi-7 .value': "₹" + (data.totalBalance || 0),
//                 '.kpi-8 .value': "₹" + (data.companyTotal || 0),
//                 '.kpi-bank .value': "₹" + (data.bankTotal || 0),
//                 '.kpi-daily .value': "₹" + (data.dailyTotal || 0),
//                 '.kpi-private .value': "₹" + (data.privateLoanTotal || 0),
//                 '.kpi-others .value': "₹" + (data.othersTotal || 0),
//                 '.kpi-completed .value': data.completedCount || 0
//             };

//             for (let selector in mapping) {
//                 const el = document.querySelector(selector);
//                 if (el) el.innerText = mapping[selector];
//             }

//             if (data.labels && data.values) {
//                 updateBarChart(data.labels, data.values);
//             }
        
//         } catch (error) {
//             console.error("Error loading data:", error);
//         } finally {
//             toggleGlobalLoader(false);
//         }
//     }

//     // --- 5. FORM SUBMISSIONS ---
//     loanForm.addEventListener('submit', async (e) => {
//         e.preventDefault();
//         const submitBtn = loanForm.querySelector('button');
//         submitBtn.innerHTML = '<span class="spinner"></span> Saving...';
//         submitBtn.disabled = true;

//         const payload = {
//             action: "addLoan",
//             personName: document.getElementById('personName').value,
//             amount: document.getElementById('loanAmount').value,
//             interest: interestInput.value || "0",
//             loanType: loanTypeSelect.value,
//             tenure: tenureInput.value || "1"
//         };

//         try {
//             await fetch(webAppUrl, {
//                 method: 'POST',
//                 body: JSON.stringify(payload),
//                 headers: { 'Content-Type': 'text/plain;charset=utf-8' }
//             });
//             alert("Loan added successfully!");
//             modal.style.display = "none"; 
//             loanForm.reset(); 
//             interestGroup.style.display = 'none';
//             tenureGroup.style.display = 'none'; 
//             loadDashboardData(); 
//         } catch (error) { alert("Error: " + error); } 
//         finally { submitBtn.innerHTML = 'Save Loan'; submitBtn.disabled = false; }
//     });

//     paymentForm.addEventListener('submit', async (e) => {
//         e.preventDefault();
//         const submitBtn = document.getElementById('savePaymentBtn');
//         submitBtn.innerHTML = '<span class="spinner"></span> Updating...';
//         submitBtn.disabled = true;

//         const payload = {
//             action: "recordPayment",
//             personName: document.getElementById('paymentPersonName').value,
//             paymentAmount: document.getElementById('paymentAmount').value
//         };

//         try {
//             await fetch(webAppUrl, {
//                 method: 'POST',
//                 body: JSON.stringify(payload),
//                 headers: { 'Content-Type': 'text/plain;charset=utf-8' }
//             });
//             alert("Payment Recorded!");
//             paymentModal.style.display = "none";
//             paymentForm.reset();
//             loadDashboardData();
//         } catch (error) { alert("Error: " + error); } 
//         finally { submitBtn.innerHTML = 'Update Balance'; submitBtn.disabled = false; }
//     });

//     loadDashboardData();
// });

// // --- 6. INTERNAL DROPDOWN & 3D MAGIC ANIMATION LOGIC ---
// function toggleCardDetails(cardElement, category) {
//     const isZoomed = cardElement.classList.contains('magic-zoom');
    
//     if (isZoomed) {
//         closeMagic();
//         return;
//     }

//     // Close any other open magic cards first
//     closeMagic();

//     // Start Magic Animation
//     const overlay = document.getElementById('magic-overlay');
//     const wrapper = document.querySelector('.dashboard-wrapper');
    
//     if (overlay) overlay.style.display = 'block';
//     if (wrapper) wrapper.classList.add('blurred');
    
//     // Apply 3D Horizontal Spin and Center
//     cardElement.classList.add('magic-zoom');
//     cardElement.classList.add('active');

//     const listContainer = cardElement.querySelector('.dropdown-list ul');
//     if (!listContainer) return;

//     if (category === 'Types') {
//         const counts = {};
//         dashboardFullList.forEach(item => {
//             const type = item.type || "Uncategorized";
//             counts[type] = (counts[type] || 0) + 1;
//         });
//         listContainer.innerHTML = Object.keys(counts).length === 0 
//             ? "<li>No types found</li>" 
//             : Object.entries(counts).map(([type, count]) => `<li><span class="name">${type}</span> <span class="amt">${count}</span></li>`).join('');
//     } else {
//         const filtered = dashboardFullList.filter(item => {
//             if (category === 'Total' || category === 'Total Amount') return true;
//             if (category === 'Completed') return Number(item.balance) <= 0;
//             if (category === 'Balance') return Number(item.balance) > 0;
//             return item.type === category;
//         });

//         listContainer.innerHTML = filtered.length === 0 
//             ? "<li>No records found</li>" 
//             : filtered.map(item => `<li><span class="name">${item.name}</span> <span class="amt">₹${item.balance}</span></li>`).join('');
//     }
// }

// // Function to reverse 3D magic animation
// function closeMagic() {
//     const zoomedCard = document.querySelector('.card.magic-zoom');
//     const overlay = document.getElementById('magic-overlay');
//     const wrapper = document.querySelector('.dashboard-wrapper');

//     if (zoomedCard) {
//         // Reverse 3D spin and fade
//         zoomedCard.style.transform = "translate(-50%, -50%) rotateY(0deg) scale(0.5)";
//         zoomedCard.style.opacity = "0";

//         setTimeout(() => {
//             zoomedCard.classList.remove('magic-zoom');
//             zoomedCard.classList.remove('active');
//             zoomedCard.style.transform = ""; // Reset inline styles
//             zoomedCard.style.opacity = "";
//         }, 500);
//     }
    
//     if (overlay) overlay.style.display = 'none';
//     if (wrapper) wrapper.classList.remove('blurred');
// }

// // --- 7. CHARTING ---
// function updateBarChart(labels, values) {
//     const canvas = document.getElementById('loanBarChart');
//     if (!canvas) return; 
//     const ctx = canvas.getContext('2d');
//     if (myBarChart) { myBarChart.destroy(); }

//     myBarChart = new Chart(ctx, {
//         type: 'bar',
//         data: {
//             labels: labels, 
//             datasets: [{
//                 label: 'Current Balance (₹)',
//                 data: values, 
//                 backgroundColor: '#60a5fa', 
//                 borderRadius: 6,
//                 borderSkipped: false,
//             }]
//         },
//         options: {
//             responsive: true,
//             maintainAspectRatio: false,
//             plugins: { legend: { display: false } },
//             scales: {
//                 y: { beginAtZero: true, grid: { color: '#f0f0f0' } },
//                 x: { grid: { display: false } }
//             }
//         }
//     });
// }

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

    // --- 3. UI LOGIC (Show/Hide Interest & Tenure) ---
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

    // --- SET BALANCE AS BACKGROUND (PLACEHOLDER) ---
    paymentPersonSelect.addEventListener('change', function() {
        const selectedName = this.value;
        if (personBalances[selectedName] !== undefined) {
            const balance = personBalances[selectedName];
            paymentAmountInput.value = ""; 
            paymentAmountInput.placeholder = "Current Balance: ₹" + balance;
        } else {
            paymentAmountInput.placeholder = "Amount Paid";
        }
    });

    // --- PREVENT OVERPAYMENT ALERT ---
    paymentAmountInput.addEventListener('input', function() {
        const selectedName = paymentPersonSelect.value;
        if (!selectedName || personBalances[selectedName] === undefined) return;

        const maxBalance = parseFloat(personBalances[selectedName]);
        const enteredAmount = parseFloat(this.value);

        if (!isNaN(enteredAmount) && enteredAmount > maxBalance) {
            alert("Amount Exceeded! You only owe ₹" + maxBalance);
            this.value = maxBalance; 
        }
    });

    async function refreshNameDropdown() {
        paymentPersonSelect.innerHTML = '<option value="" disabled selected>Loading Names...</option>';
        paymentAmountInput.placeholder = "Amount Paid";
        try {
            const response = await fetch(webAppUrl);
            const data = await response.json();
            paymentPersonSelect.innerHTML = '<option value="" disabled selected>Select Person</option>';
            
            personBalances = {}; 

            if (data.fullList && data.fullList.length > 0) {
                data.fullList.forEach(item => {
                    personBalances[item.name] = parseFloat(item.balance);
                    let opt = document.createElement('option');
                    opt.value = item.name;
                    opt.innerHTML = item.name;
                    paymentPersonSelect.appendChild(opt);
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
        
            const mapping = {
                '.kpi-1 .value': data.totalPerson,
                '.kpi-2 .value': data.totalTypes,
                '.kpi-4 .value': "₹" + (data.totalAmount || 0),
                '.kpi-7 .value': "₹" + (data.totalBalance || 0),
                '.kpi-8 .value': "₹" + (data.companyTotal || 0),
                '.kpi-bank .value': "₹" + (data.bankTotal || 0),
                '.kpi-daily .value': "₹" + (data.dailyTotal || 0),
                '.kpi-private .value': "₹" + (data.privateLoanTotal || 0),
                '.kpi-others .value': "₹" + (data.othersTotal || 0),
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

        const payload = {
            action: "addLoan",
            personName: document.getElementById('personName').value,
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
            interestGroup.style.display = 'none';
            tenureGroup.style.display = 'none'; 
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
            await fetch(webAppUrl, {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: { 'Content-Type': 'text/plain;charset=utf-8' }
            });
            alert("Payment Recorded!");
            paymentModal.style.display = "none";
            paymentForm.reset();
            loadDashboardData();
        } catch (error) { alert("Error: " + error); } 
        finally { submitBtn.innerHTML = 'Update Balance'; submitBtn.disabled = false; }
    });

    loadDashboardData();
});

// --- 6. INTERNAL DROPDOWN LOGIC (ANIMATION REMOVED) ---
function toggleCardDetails(cardElement, category) {
    const isActive = cardElement.classList.contains('active');
    
    // Close all other open cards to act like an accordion
    document.querySelectorAll('.card').forEach(c => c.classList.remove('active'));
    
    if (!isActive) {
        cardElement.classList.add('active');
        const listContainer = cardElement.querySelector('.dropdown-list ul');
        if (!listContainer) return;

        if (category === 'Types') {
            const counts = {};
            dashboardFullList.forEach(item => {
                const type = item.type || "Uncategorized";
                counts[type] = (counts[type] || 0) + 1;
            });
            listContainer.innerHTML = Object.keys(counts).length === 0 
                ? "<li>No types found</li>" 
                : Object.entries(counts).map(([type, count]) => `<li><span class="name">${type}</span> <span class="amt">${count}</span></li>`).join('');
            return;
        }

        const filtered = dashboardFullList.filter(item => {
            if (category === 'Total' || category === 'Total Amount') return true;
            if (category === 'Completed') return Number(item.balance) <= 0;
            if (category === 'Balance') return Number(item.balance) > 0;
            return item.type === category;
        });

        listContainer.innerHTML = filtered.length === 0 
            ? "<li>No records found</li>" 
            : filtered.map(item => `<li><span class="name">${item.name}</span> <span class="amt">₹${item.balance}</span></li>`).join('');
    }
}

// --- 7. CHARTING ---
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
                borderSkipped: false,
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