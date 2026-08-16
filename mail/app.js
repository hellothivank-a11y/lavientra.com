// ===============================
// GLOBAL CRM STATE & VARIABLES
// ===============================
window.contacts = [];
window.logs = [];
window.followupLogs = [];
window.activeWorkspaceRegion = 'UK';
window.activeHistoryRegion = 'UK';
window.activeMainTab = 'workspace';

// ===============================
// NAVIGATION & UI FUNCTIONS
// ===============================
window.switchMainTab = function (tab) {
    window.activeMainTab = tab;

    const tabWs = document.getElementById('tabWorkspace');
    const tabHist = document.getElementById('tabHistory');
    const tabAnalytics = document.getElementById('tabAnalytics');

    if (tabWs) tabWs.classList.toggle('active', tab === 'workspace');
    if (tabHist) tabHist.classList.toggle('active', tab === 'history');
    if (tabAnalytics) tabAnalytics.classList.toggle('active', tab === 'analytics');

    const wsView = document.getElementById('workspaceView');
    const histView = document.getElementById('historyView');
    const analyticsView = document.getElementById('analyticsView');

    if (wsView) wsView.style.display = tab === 'workspace' ? 'block' : 'none';
    if (histView) histView.style.display = tab === 'history' ? 'block' : 'none';
    if (analyticsView) analyticsView.style.display = tab === 'analytics' ? 'block' : 'none';

    if (tab === 'analytics') window.renderAnalytics();
    if (tab === 'history') window.renderHistory();
    if (tab === 'workspace') window.renderContacts();
};

window.setWorkspaceRegion = function (region) {
    window.activeWorkspaceRegion = region;
    const btnUK = document.getElementById('wsBtnUK');
    const btnAus = document.getElementById('wsBtnAus');
    if (btnUK) btnUK.classList.toggle('active', region === 'UK');
    if (btnAus) btnAus.classList.toggle('active', region === 'Australia');
    window.renderContacts();
};

window.setHistoryRegion = function (region) {
    window.activeHistoryRegion = region;
    const btnUK = document.getElementById('histBtnUK');
    const btnAus = document.getElementById('histBtnAus');
    if (btnUK) btnUK.classList.toggle('active', region === 'UK');
    if (btnAus) btnAus.classList.toggle('active', region === 'Australia');
    window.renderHistory();
};

// ===============================
// DROPDOWN MENU FUNCTIONS
// ===============================
window.toggleCountryDropdown = function (e) {
    if (e) e.stopPropagation();
    const group = document.getElementById('countryDropdownGroup');
    if (group) {
        group.classList.toggle('open');
    }
};

window.selectCountry = function (value, text) {
    const hiddenInput = document.getElementById('country');
    if (hiddenInput) hiddenInput.value = value;

    const selectedText = document.getElementById('countrySelectedText');
    if (selectedText) selectedText.textContent = text;

    const options = document.querySelectorAll('#countryMenu .custom-option');
    options.forEach(opt => {
        opt.classList.toggle('selected', opt.getAttribute('data-value') === value);
    });

    const group = document.getElementById('countryDropdownGroup');
    if (group) group.classList.remove('open');
};

// Close dropdown on click outside
document.addEventListener('click', (e) => {
    const group = document.getElementById('countryDropdownGroup');
    if (group && !group.contains(e.target)) {
        group.classList.remove('open');
    }
});

// Helper: Title Case Converter
window.toTitleCase = function (str) {
    if (!str) return '';
    return str.trim().split(/\s+/).map(word => {
        if (!word) return '';
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');
};

// Helper: Copy Text to Clipboard
window.copyText = function (target, btnElement) {
    let text = '';
    if (target === 'emailSubject') {
        const el = document.getElementById('emailSubject');
        text = el ? el.value : '';
    } else if (target === 'generatedEmail') {
        const el = document.getElementById('generatedEmail');
        text = el ? el.value : '';
    } else if (target === 'all') {
        const sub = document.getElementById('emailSubject')?.value || '';
        const body = document.getElementById('generatedEmail')?.value || '';
        text = `Subject: ${sub}\n\n${body}`;
    }

    if (!text) return;

    navigator.clipboard.writeText(text).then(() => {
        if (!btnElement) return;
        const originalHTML = btnElement.innerHTML;
        btnElement.innerHTML = `<span class="material-symbols-outlined" style="font-size: 18px; color: #137333;">check</span> Copied!`;
        setTimeout(() => {
            btnElement.innerHTML = originalHTML;
        }, 1500);
    });
};

window.copyValue = function (text, btnElement) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
        if (!btnElement) return;
        const iconSpan = btnElement.querySelector('.material-symbols-outlined');
        if (!iconSpan) return;
        const originalIcon = iconSpan.innerText;
        iconSpan.innerText = 'check';
        iconSpan.style.color = '#137333';
        setTimeout(() => {
            iconSpan.innerText = originalIcon;
            iconSpan.style.color = '';
        }, 1500);
    });
};

window.closeTemplate = function () {
    const dialog = document.getElementById('emailDialog');
    if (dialog) dialog.close();
};

// ===============================
// RENDERING FUNCTIONS
// ===============================
window.renderContacts = function () {
    const tbody = document.getElementById('contactTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    // Filter: Only contacts in active workspace region that DO NOT have an initial log
    const pendingContacts = window.contacts.filter(c =>
        c.country === window.activeWorkspaceRegion &&
        !window.logs.some(l => l.email === c.email)
    );

    if (pendingContacts.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--md-sys-color-on-surface-variant); padding: 32px;">No pending contacts here. Try adding a new contact above!</td></tr>`;
        return;
    }

    pendingContacts.forEach(contact => {
        const tr = document.createElement('tr');
        const urlLink = contact.url ? (contact.url.startsWith('http') ? contact.url : 'https://' + contact.url) : '';
        const companyDisplay = window.toTitleCase(contact.company);
        const nameDisplay = (!contact.name || contact.name === 'Team') ? '-' : window.toTitleCase(contact.name);

        tr.innerHTML = `
        <td>
            <div style="display: flex; align-items: center; gap: 8px;">
                <strong>${companyDisplay}</strong>
                ${contact.url ? `
                    <a href="${urlLink}" target="_blank" title="Open Website" style="color: var(--md-sys-color-primary); display: inline-flex; align-items: center;">
                        <span class="material-symbols-outlined" style="font-size: 16px;">open_in_new</span>
                    </a>
                    <button class="icon-btn" onclick="copyValue('${contact.url}', this)" title="Copy Website URL">
                        <span class="material-symbols-outlined" style="font-size: 16px;">link</span>
                    </button>
                ` : ''}
            </div>
        </td>
        <td>${nameDisplay}</td>
        <td>
            <div style="display: flex; align-items: center; gap: 8px;">
                <span>${contact.email}</span>
                <button class="icon-btn" onclick="copyValue('${contact.email}', this)" title="Copy Email">
                    <span class="material-symbols-outlined" style="font-size: 16px;">content_copy</span>
                </button>
            </div>
        </td>
        <td>${contact.country}</td>
        <td>
            <button class="btn btn-tonal" onclick="generateEmail('${contact.id}', 'initial')">
                <span class="material-symbols-outlined" style="font-size: 18px;">edit_document</span> Draft Initial
            </button>
        </td>
    `;
        tbody.appendChild(tr);
    });
};

window.renderHistory = function () {
    const initialContainer = document.getElementById('historyInitialContainer');
    const followupContainer = document.getElementById('historyFollowupContainer');
    if (!initialContainer || !followupContainer) return;

    initialContainer.innerHTML = '';
    followupContainer.innerHTML = '';

    // Grouping logic for INITIAL LOGS that have NO FOLLOW-UP LOG YET
    const initialLogsInRegion = window.logs.filter(l => l.country === window.activeHistoryRegion);
    const pendingFollowupLogs = initialLogsInRegion.filter(l => !window.followupLogs.some(fl => fl.email === l.email));

    const initialByDate = {};
    pendingFollowupLogs.forEach(l => {
        if (!initialByDate[l.dateString]) initialByDate[l.dateString] = [];
        initialByDate[l.dateString].push(l);
    });

    if (Object.keys(initialByDate).length === 0) {
        initialContainer.innerHTML = `<p style="color: var(--md-sys-color-on-surface-variant); padding: 16px; margin: 0;">No contacts waiting for follow-up.</p>`;
    } else {
        Object.keys(initialByDate).sort((a, b) => new Date(b) - new Date(a)).forEach(date => {
            let html = `<h3 style="margin-top: 16px; margin-bottom: 12px; color: var(--md-sys-color-on-surface-variant); display: flex; align-items: center; gap: 8px;"><span class="material-symbols-outlined" style="font-size: 18px;">calendar_today</span> ${date}</h3><table><thead><tr><th>Company</th><th>Name</th><th>Email</th><th>Action</th></tr></thead><tbody>`;
            initialByDate[date].forEach(log => {
                const contact = window.contacts.find(c => c.email === log.email);
                const companyName = contact ? window.toTitleCase(contact.company) : log.email;
                const clientName = contact ? ((!contact.name || contact.name === 'Team') ? '-' : window.toTitleCase(contact.name)) : '-';
                const contactId = contact ? contact.id : null;

                html += `<tr>
                    <td><strong>${companyName}</strong></td>
                    <td>${clientName}</td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span>${log.email}</span>
                            <button class="icon-btn" onclick="copyValue('${log.email}', this)" title="Copy Email"><span class="material-symbols-outlined" style="font-size: 16px;">content_copy</span></button>
                        </div>
                    </td>
                    <td>
                        <div style="display: flex; gap: 8px;">
                            ${contactId ? `<button class="btn btn-warning" style="height: 32px; padding: 0 12px; font-size: 12px;" onclick="generateEmail('${contactId}', 'followup')"><span class="material-symbols-outlined" style="font-size: 16px;">forward_to_inbox</span> Draft Follow-up</button>` : ''}
                            <button class="btn btn-error" style="height: 32px; padding: 0 12px; font-size: 12px;" onclick="markUnsent('${log.id}', 'logs')"><span class="material-symbols-outlined" style="font-size: 16px;">undo</span> Unsent Initial</button>
                        </div>
                    </td>
                </tr>`;
            });
            html += `</tbody></table>`;
            initialContainer.innerHTML += html;
        });
    }

    // Grouping logic for FOLLOW-UP LOGS
    const followupLogsInRegion = window.followupLogs.filter(l => l.country === window.activeHistoryRegion);
    const followupByDate = {};
    followupLogsInRegion.forEach(l => {
        if (!followupByDate[l.dateString]) followupByDate[l.dateString] = [];
        followupByDate[l.dateString].push(l);
    });

    if (Object.keys(followupByDate).length === 0) {
        followupContainer.innerHTML = `<p style="color: var(--md-sys-color-on-surface-variant); padding: 16px; margin: 0;">No follow-ups sent yet.</p>`;
    } else {
        Object.keys(followupByDate).sort((a, b) => new Date(b) - new Date(a)).forEach(date => {
            let html = `<h3 style="margin-top: 16px; margin-bottom: 12px; color: var(--md-sys-color-on-surface-variant); display: flex; align-items: center; gap: 8px;"><span class="material-symbols-outlined" style="font-size: 18px;">calendar_today</span> ${date}</h3><table><thead><tr><th>Company</th><th>Name</th><th>Email</th><th>Action</th></tr></thead><tbody>`;
            followupByDate[date].forEach(log => {
                const contact = window.contacts.find(c => c.email === log.email);
                const companyName = contact ? window.toTitleCase(contact.company) : log.email;
                const clientName = contact ? ((!contact.name || contact.name === 'Team') ? '-' : window.toTitleCase(contact.name)) : '-';

                html += `<tr>
                    <td><strong>${companyName}</strong></td>
                    <td>${clientName}</td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span>${log.email}</span>
                            <button class="icon-btn" onclick="copyValue('${log.email}', this)" title="Copy Email"><span class="material-symbols-outlined" style="font-size: 16px;">content_copy</span></button>
                        </div>
                    </td>
                    <td>
                        <button class="btn btn-error" style="height: 32px; padding: 0 12px; font-size: 12px;" onclick="markUnsent('${log.id}', 'followup_logs')"><span class="material-symbols-outlined" style="font-size: 16px;">undo</span> Unsent Follow-up</button>
                    </td>
                </tr>`;
            });
            html += `</tbody></table>`;
            followupContainer.innerHTML += html;
        });
    }
};

window.generateEmail = function (id, type = 'initial') {
    const contact = window.contacts.find(c => c.id === id);
    if (!contact) return;

    const dialog = document.getElementById('emailDialog');
    if (!dialog) return;

    const companyFormatted = window.toTitleCase(contact.company);
    const nameFormatted = window.toTitleCase(contact.name);

    let greeting = (!contact.name || contact.name === "Team") ? `Hi ${companyFormatted} Team,` : `Hi ${nameFormatted},`;
    const regionText = contact.country === 'Australia' ? 'Australia' : 'UK';

    let subject = '';
    let template = '';

    if (type === 'followup') {
        document.getElementById('modalDialogTitle').innerText = 'Draft Follow-up Email 📩';
        subject = `Following up: Floor plan drafting support for ${companyFormatted}`;
        template = `${greeting}\n\nI wanted to quickly follow up on my previous message regarding floor plan drafting support for ${companyFormatted}.\n\nI know you’re likely busy, so I'll keep this short—we’d still love to handle your first layout as a complimentary test run with a 24-hour turnaround, whenever you have a shoot lined up this week.\n\nFeel free to review our work or check our standard drafting workflow at lavientra.com. You can also submit field sketches directly through our client portal there.\n\nNo commitments.\n\nBest regards,\n\nThe Lavientra Studio Team`;
    } else {
        document.getElementById('modalDialogTitle').innerText = 'Draft Initial Email';
        subject = `Floor plan drafting support for ${companyFormatted}`;
        template = `${greeting}\n\nI’m from Lavientra Studio, and we help busy ${regionText} property photographers offload their floor plan drafting with a guaranteed 24-hour turnaround. We specialize in clean, RICS-compliant 2D layouts customized to your brand standards.\n\nIf you’d like to review our work or check our standard drafting workflow, feel free to visit us at lavientra.com. You can also submit field sketches directly through our client portal there.\n\nWe’d love to handle your first layout as a complimentary test run whenever you have a shoot lined up this week. No commitments.\n\nBest regards,\n\nThe Lavientra Studio Team`;
    }

    document.getElementById('emailSubject').value = subject;
    document.getElementById('generatedEmail').value = template;
    document.getElementById('currentEmailTarget').value = contact.email;
    document.getElementById('currentEmailType').value = type;

    dialog.showModal();
};

window.renderAnalytics = function () {
    const todayIso = new Date().toISOString().split('T')[0];
    const logsData = window.logs;
    const followupData = window.followupLogs;
    const contactsData = window.contacts;

    // Overall Stats
    const totalContacts = contactsData.length;
    const totalInitialSent = logsData.length;
    const totalFollowupsSent = followupData.length;

    const initialSentToday = logsData.filter(l => l.isoDate === todayIso).length;
    const followupsSentToday = followupData.filter(l => l.isoDate === todayIso).length;
    const sentToday = initialSentToday + followupsSentToday;

    const completionRate = totalContacts > 0 ? Math.round((totalInitialSent / totalContacts) * 100) : 0;

    const elTotalContacts = document.getElementById('metricTotalContacts');
    const elTotalSent = document.getElementById('metricTotalSent');
    const elTotalFollowups = document.getElementById('metricTotalFollowupsSent');
    const elSentToday = document.getElementById('metricSentToday');
    const elRate = document.getElementById('metricCompletionRate');

    if (elTotalContacts) elTotalContacts.innerText = totalContacts;
    if (elTotalSent) elTotalSent.innerText = totalInitialSent;
    if (elTotalFollowups) elTotalFollowups.innerText = totalFollowupsSent;
    if (elSentToday) elSentToday.innerText = sentToday;
    if (elRate) elRate.innerText = `${completionRate}%`;

    // UK Stats
    const ukContacts = contactsData.filter(c => c.country === 'UK').length;
    const ukSent = logsData.filter(l => l.country === 'UK').length;
    const ukFollowups = followupData.filter(l => l.country === 'UK').length;
    const ukPending = Math.max(0, ukContacts - ukSent);
    const ukToday = logsData.filter(l => l.country === 'UK' && l.isoDate === todayIso).length + followupData.filter(l => l.country === 'UK' && l.isoDate === todayIso).length;
    const ukRate = ukContacts > 0 ? Math.round((ukSent / ukContacts) * 100) : 0;

    const ukListCount = document.getElementById('ukListCount');
    const ukSentCount = document.getElementById('ukSentCount');
    const ukFollowupCount = document.getElementById('ukFollowupCount');
    const ukPendingCount = document.getElementById('ukPendingCount');
    const ukTodayCount = document.getElementById('ukTodayCount');
    const ukCompletionBadge = document.getElementById('ukCompletionBadge');
    const ukProgressBar = document.getElementById('ukProgressBar');

    if (ukListCount) ukListCount.innerText = ukContacts;
    if (ukSentCount) ukSentCount.innerText = ukSent;
    if (ukFollowupCount) ukFollowupCount.innerText = ukFollowups;
    if (ukPendingCount) ukPendingCount.innerText = ukPending;
    if (ukTodayCount) ukTodayCount.innerText = ukToday;
    if (ukCompletionBadge) ukCompletionBadge.innerText = `${ukRate}% Done`;
    if (ukProgressBar) ukProgressBar.style.width = `${Math.min(100, ukRate)}%`;

    // Australia Stats
    const ausContacts = contactsData.filter(c => c.country === 'Australia').length;
    const ausSent = logsData.filter(l => l.country === 'Australia').length;
    const ausFollowups = followupData.filter(l => l.country === 'Australia').length;
    const ausPending = Math.max(0, ausContacts - ausSent);
    const ausToday = logsData.filter(l => l.country === 'Australia' && l.isoDate === todayIso).length + followupData.filter(l => l.country === 'Australia' && l.isoDate === todayIso).length;
    const ausRate = ausContacts > 0 ? Math.round((ausSent / ausContacts) * 100) : 0;

    const ausListCount = document.getElementById('ausListCount');
    const ausSentCount = document.getElementById('ausSentCount');
    const ausFollowupCount = document.getElementById('ausFollowupCount');
    const ausPendingCount = document.getElementById('ausPendingCount');
    const ausTodayCount = document.getElementById('ausTodayCount');
    const ausCompletionBadge = document.getElementById('ausCompletionBadge');
    const ausProgressBar = document.getElementById('ausProgressBar');

    if (ausListCount) ausListCount.innerText = ausContacts;
    if (ausSentCount) ausSentCount.innerText = ausSent;
    if (ausFollowupCount) ausFollowupCount.innerText = ausFollowups;
    if (ausPendingCount) ausPendingCount.innerText = ausPending;
    if (ausTodayCount) ausTodayCount.innerText = ausToday;
    if (ausCompletionBadge) ausCompletionBadge.innerText = `${ausRate}% Done`;
    if (ausProgressBar) ausProgressBar.style.width = `${Math.min(100, ausRate)}%`;
};

// ===============================
// FIREBASE FIRESTORE INTEGRATION
// ===============================
const firebaseConfig = {
    apiKey: "AIzaSyCVcML4xiZXMqKzcBiJrtfJI4kC-3ZvDbU",
    authDomain: "mail-list-f302b.firebaseapp.com",
    projectId: "mail-list-f302b",
    storageBucket: "mail-list-f302b.firebasestorage.app",
    messagingSenderId: "871998549668",
    appId: "1:871998549668:web:dcf0386e63cb1cbcac8031",
    measurementId: "G-WSGP0WHQ8P"
};

let db, contactsCol, logsCol, followupLogsCol;

function initFirebase() {
    if (typeof firebase === 'undefined') {
        setTimeout(initFirebase, 200);
        return;
    }

    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    db = firebase.firestore();

    contactsCol = db.collection("contacts");
    logsCol = db.collection("logs");
    followupLogsCol = db.collection("followup_logs");

    // Live Sync Listeners
    contactsCol.orderBy("createdAt", "desc").onSnapshot((snapshot) => {
        window.contacts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        window.renderContacts();
        window.renderHistory();
        window.renderAnalytics();
    }, (err) => console.error("Contacts sync error:", err));

    logsCol.orderBy("createdAt", "desc").onSnapshot((snapshot) => {
        window.logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        window.renderContacts();
        window.renderHistory();
        window.renderAnalytics();
    }, (err) => console.error("Logs sync error:", err));

    followupLogsCol.orderBy("createdAt", "desc").onSnapshot((snapshot) => {
        window.followupLogs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        window.renderHistory();
        window.renderAnalytics();
    }, (err) => console.error("Followup logs sync error:", err));
}

// Start Firebase sync
initFirebase();

// -- Unsent Action: Delete Log from Firestore --
window.markUnsent = async function (logId, colName) {
    if (!confirm("Are you sure you want to mark this mail as Unsent? This will remove it from history.")) return;
    try {
        await db.collection(colName).doc(logId).delete();
    } catch (e) {
        alert("Error deleting log: " + e.message);
    }
};

// -- Save Contact to Firebase --
window.addContact = async function () {
    const url = document.getElementById('companyUrl').value;
    const nameRaw = document.getElementById('clientName').value;
    const companyRaw = document.getElementById('companyName').value;
    const email = document.getElementById('clientEmail').value;
    const country = document.getElementById('country').value;

    if (!companyRaw || !email) {
        alert("Company එක සහ Email එක අනිවාර්යයි!");
        return;
    }

    if (!contactsCol) {
        alert("Connecting to database... please try again.");
        return;
    }

    const company = window.toTitleCase(companyRaw);
    const name = nameRaw ? window.toTitleCase(nameRaw) : "Team";

    try {
        await contactsCol.add({
            url, name, company, email, country,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        document.getElementById('companyUrl').value = '';
        document.getElementById('clientName').value = '';
        document.getElementById('companyName').value = '';
        document.getElementById('clientEmail').value = '';

        window.setWorkspaceRegion(country);
    } catch (e) {
        alert("Error saving contact: " + e.message);
    }
};

// -- Save Log to Firebase --
window.markAsSent = async function () {
    const email = document.getElementById('currentEmailTarget').value;
    const type = document.getElementById('currentEmailType').value || 'initial';
    const date = new Date();
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    const dateString = date.toLocaleDateString('en-US', options);
    const isoDate = date.toISOString().split('T')[0];

    const targetContact = window.contacts.find(c => c.email === email);
    const country = targetContact ? targetContact.country : 'UK';
    const targetCol = type === 'followup' ? followupLogsCol : logsCol;

    if (!targetCol) {
        alert("Connecting to database... please try again.");
        return;
    }

    try {
        await targetCol.add({
            email: email,
            dateString: dateString,
            isoDate: isoDate,
            country: country,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        window.closeTemplate();
    } catch (e) {
        alert("Error saving log: " + e.message);
    }
};

// Setup light dismiss on modal
document.addEventListener('DOMContentLoaded', () => {
    const dialog = document.getElementById('emailDialog');
    if (dialog) {
        dialog.addEventListener('click', (e) => {
            const dialogDimensions = dialog.getBoundingClientRect();
            if (
                e.clientX < dialogDimensions.left ||
                e.clientX > dialogDimensions.right ||
                e.clientY < dialogDimensions.top ||
                e.clientY > dialogDimensions.bottom
            ) {
                dialog.close();
            }
        });
    }
});
