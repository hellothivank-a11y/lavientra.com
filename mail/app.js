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
// Helper: Format Social URL
window.formatSocialUrl = function (url, channel) {
    if (!url) return '';
    url = url.trim();
    if (url.startsWith('http://') || url.startsWith('https://')) return url;

    const cleanHandle = url.replace(/^@/, '').trim();
    if (channel === 'instagram') return `https://instagram.com/${cleanHandle}`;
    if (channel === 'linkedin') return url.startsWith('in/') ? `https://linkedin.com/${cleanHandle}` : `https://linkedin.com/in/${cleanHandle}`;
    if (channel === 'facebook') return `https://facebook.com/${cleanHandle}`;
    return `https://${url}`;
};

// Helper: Get Channel Badge HTML with Clean SVG Logos
window.getChannelBadge = function (channel) {
    switch (channel) {
        case 'instagram':
            return `<span class="badge-channel badge-channel-instagram"><svg class="channel-svg-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg> <span>Instagram</span></span>`;
        case 'linkedin':
            return `<span class="badge-channel badge-channel-linkedin"><svg class="channel-svg-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.46c-.95 0-1.72.77-1.72 1.72s.77 1.72 1.72 1.72 1.72-.77 1.72-1.72-.77-1.72-1.72-1.72z"/></svg> <span>LinkedIn</span></span>`;
        case 'facebook':
            return `<span class="badge-channel badge-channel-facebook"><svg class="channel-svg-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/></svg> <span>Facebook</span></span>`;
        case 'email':
        default:
            return `<span class="badge-channel badge-channel-email"><svg class="channel-svg-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg> <span>Email</span></span>`;
    }
};

// Channel Switcher in Add Contact Form
window.activeOutreachChannel = 'email';

window.setOutreachChannel = function (channel) {
    window.activeOutreachChannel = channel;
    const hiddenInput = document.getElementById('outreachChannel');
    if (hiddenInput) hiddenInput.value = channel;

    const btnEmail = document.getElementById('channelBtnEmail');
    const btnIg = document.getElementById('channelBtnInstagram');
    const btnLi = document.getElementById('channelBtnLinkedin');
    const btnFb = document.getElementById('channelBtnFacebook');

    if (btnEmail) btnEmail.classList.toggle('active', channel === 'email');
    if (btnIg) btnIg.classList.toggle('active', channel === 'instagram');
    if (btnLi) btnLi.classList.toggle('active', channel === 'linkedin');
    if (btnFb) btnFb.classList.toggle('active', channel === 'facebook');

    const emailGroup = document.getElementById('emailInputGroup');
    const emailInput = document.getElementById('clientEmail');
    const emailLabel = document.getElementById('clientEmailLabel');

    const socialGroup = document.getElementById('socialUrlGroup');
    const socialInput = document.getElementById('socialUrl');
    const socialLabel = document.getElementById('socialUrlLabel');

    if (channel === 'email') {
        if (emailInput) {
            emailInput.required = true;
            if (emailLabel) emailLabel.textContent = 'Email Address *';
            emailInput.placeholder = 'contact@company.com';
        }
        if (socialGroup) socialGroup.style.display = 'none';
        if (socialInput) socialInput.required = false;
    } else {
        if (emailInput) {
            emailInput.required = false;
            if (emailLabel) emailLabel.textContent = 'Email Address (Optional)';
            emailInput.placeholder = 'contact@company.com (optional)';
        }
        if (socialGroup) socialGroup.style.display = 'block';
        if (socialInput) {
            socialInput.required = true;
            if (channel === 'instagram') {
                socialInput.placeholder = 'https://instagram.com/username or @handle';
                if (socialLabel) socialLabel.textContent = 'Instagram Profile URL / Handle *';
            } else if (channel === 'linkedin') {
                socialInput.placeholder = 'https://linkedin.com/in/username';
                if (socialLabel) socialLabel.textContent = 'LinkedIn Profile URL *';
            } else if (channel === 'facebook') {
                socialInput.placeholder = 'https://facebook.com/page-or-profile';
                if (socialLabel) socialLabel.textContent = 'Facebook Profile / Page *';
            }
            socialInput.focus();
        }
    }
    if (typeof window.checkEmailDuplicate === 'function') window.checkEmailDuplicate();
};

// Helper: Check duplicate email in real-time
window.checkEmailDuplicate = function () {
    const emailInput = document.getElementById('clientEmail');
    const warningEl = document.getElementById('emailDuplicateWarning');
    if (!emailInput || !warningEl) return;

    const emailVal = emailInput.value.trim().toLowerCase();
    if (!emailVal || !emailVal.includes('@')) {
        warningEl.style.display = 'none';
        warningEl.innerHTML = '';
        emailInput.classList.remove('input-duplicate-error');
        return;
    }

    const existing = window.contacts.find(c => c.email && c.email.trim().toLowerCase() === emailVal);
    if (existing) {
        const compName = window.toTitleCase(existing.company || 'Unknown');
        const region = existing.country || 'Unknown Region';
        const isSent = window.logs.some(l => l.email && l.email.trim().toLowerCase() === emailVal);
        const isFollowup = window.followupLogs.some(l => l.email && l.email.trim().toLowerCase() === emailVal);

        let statusText = 'Pending in Workspace';
        if (isFollowup) statusText = 'Follow-up Sent';
        else if (isSent) statusText = 'Initial Outreach Sent';

        warningEl.innerHTML = `<span class="material-symbols-outlined" style="font-size: 18px;">warning</span> <span><strong>Duplicate Email Warning:</strong> This address is already saved for <strong>${compName}</strong> (${region}) • <em>${statusText}</em></span>`;
        warningEl.style.display = 'flex';
        emailInput.classList.add('input-duplicate-error');
    } else {
        warningEl.style.display = 'none';
        warningEl.innerHTML = '';
        emailInput.classList.remove('input-duplicate-error');
    }
};

// Helper: Calculate days passed and determine contact status
window.getContactStatusInfo = function (contact) {
    let lastDate = null;
    if (contact && contact.lastSentDate) {
        if (contact.lastSentDate.toDate && typeof contact.lastSentDate.toDate === 'function') {
            lastDate = contact.lastSentDate.toDate();
        } else if (contact.lastSentDate instanceof Date) {
            lastDate = contact.lastSentDate;
        } else if (typeof contact.lastSentDate === 'string' || typeof contact.lastSentDate === 'number') {
            lastDate = new Date(contact.lastSentDate);
        }
    }

    // Fallback: check logs if contact.lastSentDate was not yet written
    if (!lastDate && contact) {
        const contactLogs = [
            ...window.logs.filter(l => (contact.id && l.contactId === contact.id) || (contact.email && l.email && l.email.trim().toLowerCase() === contact.email.trim().toLowerCase())),
            ...window.followupLogs.filter(l => (contact.id && l.contactId === contact.id) || (contact.email && l.email && l.email.trim().toLowerCase() === contact.email.trim().toLowerCase()))
        ];
        if (contactLogs.length > 0) {
            contactLogs.sort((a, b) => {
                const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : (a.isoDate ? new Date(a.isoDate) : new Date(0));
                const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : (b.isoDate ? new Date(b.isoDate) : new Date(0));
                return dateB - dateA;
            });
            const topLog = contactLogs[0];
            if (topLog.createdAt?.toDate) {
                lastDate = topLog.createdAt.toDate();
            } else if (topLog.isoDate) {
                lastDate = new Date(topLog.isoDate);
            }
        }
    }

    if (!lastDate || isNaN(lastDate.getTime())) {
        return { status: 'never_sent', days: null, label: 'Not Sent' };
    }

    const now = new Date();
    const diffTime = Math.max(0, now.getTime() - lastDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays >= 3) {
        return { status: 'followup_due', days: diffDays, label: `⚠️ Follow-up Due (${diffDays}d ago)` };
    } else {
        const dayText = diffDays === 0 ? 'Today' : `${diffDays}d ago`;
        return { status: 'sent_recent', days: diffDays, label: `✅ Sent (${dayText})` };
    }
};

window.renderContacts = function () {
    const tbody = document.getElementById('contactTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    // Filter contacts for the active workspace region
    const regionContacts = window.contacts.filter(c => c.country === window.activeWorkspaceRegion);

    if (regionContacts.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--md-sys-color-on-surface-variant); padding: 32px;">No contacts found for this region. Try adding a new contact above!</td></tr>`;
        return;
    }

    // Count occurrences of each email to flag any existing duplicates
    const emailCounts = {};
    window.contacts.forEach(c => {
        if (c.email) {
            const normalized = c.email.trim().toLowerCase();
            emailCounts[normalized] = (emailCounts[normalized] || 0) + 1;
        }
    });

    // Priority Sort: Follow-up Due first, then Never Sent, then Recently Sent
    const sortedContacts = [...regionContacts].sort((a, b) => {
        const statusA = window.getContactStatusInfo(a).status;
        const statusB = window.getContactStatusInfo(b).status;
        const priority = { 'followup_due': 1, 'never_sent': 2, 'sent_recent': 3 };
        return (priority[statusA] || 4) - (priority[statusB] || 4);
    });

    sortedContacts.forEach(contact => {
        const tr = document.createElement('tr');
        const channel = contact.channel || 'email';
        const urlLink = contact.url ? (contact.url.startsWith('http') ? contact.url : 'https://' + contact.url) : '';
        const companyDisplay = window.toTitleCase(contact.company);
        const nameDisplay = (!contact.name || contact.name === 'Team') ? '-' : window.toTitleCase(contact.name);
        const isDuplicate = contact.email && emailCounts[contact.email.trim().toLowerCase()] > 1;

        const statusInfo = window.getContactStatusInfo(contact);
        let statusBadgeHtml = '';
        let actionBtnHtml = '';

        // Dynamic Draft Button Label based on Channel & Follow-up status
        const isEmailChannel = channel === 'email';
        const draftLabel = isEmailChannel ? 'Draft Email' : 'Draft DM';
        const followUpLabel = isEmailChannel ? 'Follow Up' : 'Follow Up DM';

        if (statusInfo.status === 'followup_due') {
            statusBadgeHtml = `<span class="badge-status badge-followup-due" title="3 or more days elapsed since last outreach"><span class="material-symbols-outlined" style="font-size: 14px;">warning</span> Follow-up Due (${statusInfo.days}d ago)</span>`;
            actionBtnHtml = `<button class="btn btn-followup" onclick="generateEmail('${contact.id}', 'followup')"><span class="material-symbols-outlined" style="font-size: 18px;">forward_to_inbox</span> ${followUpLabel}</button>`;
        } else if (statusInfo.status === 'sent_recent') {
            const dayText = statusInfo.days === 0 ? 'Today' : `${statusInfo.days}d ago`;
            statusBadgeHtml = `<span class="badge-status badge-sent"><span class="material-symbols-outlined" style="font-size: 14px;">check_circle</span> Sent (${dayText})</span>`;
            actionBtnHtml = `<button class="btn btn-tonal" onclick="generateEmail('${contact.id}', 'initial')"><span class="material-symbols-outlined" style="font-size: 18px;">edit_document</span> ${draftLabel}</button>`;
        } else {
            statusBadgeHtml = `<span class="badge-status badge-not-sent"><span class="material-symbols-outlined" style="font-size: 14px;">schedule</span> Not Sent</span>`;
            actionBtnHtml = `<button class="btn btn-primary" onclick="generateEmail('${contact.id}', 'initial')"><span class="material-symbols-outlined" style="font-size: 18px;">edit_document</span> ${draftLabel}</button>`;
        }

        // Render Channel & Target cell
        let targetHtml = '';
        const channelBadgeHtml = window.getChannelBadge(channel);

        if (channel === 'email') {
            targetHtml = `
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                        ${channelBadgeHtml}
                        <span>${contact.email || '-'}</span>
                        ${contact.email ? `<button class="icon-btn" onclick="copyValue('${contact.email}', this)" title="Copy Email"><span class="material-symbols-outlined" style="font-size: 16px;">content_copy</span></button>` : ''}
                        ${isDuplicate ? `<span class="badge-duplicate" title="Duplicate email found"><span class="material-symbols-outlined" style="font-size: 13px;">warning</span> Duplicate</span>` : ''}
                    </div>
                </div>
            `;
        } else {
            const fullSocialUrl = window.formatSocialUrl(contact.socialUrl, channel);
            targetHtml = `
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                        ${channelBadgeHtml}
                        <a href="${fullSocialUrl}" target="_blank" style="color: var(--md-sys-color-primary); font-weight: 500; display: inline-flex; align-items: center; gap: 4px; text-decoration: none;">
                            <span>${contact.socialUrl || 'View Profile'}</span>
                            <span class="material-symbols-outlined" style="font-size: 15px;">open_in_new</span>
                        </a>
                        ${contact.socialUrl ? `<button class="icon-btn" onclick="copyValue('${contact.socialUrl}', this)" title="Copy Handle/URL"><span class="material-symbols-outlined" style="font-size: 16px;">content_copy</span></button>` : ''}
                    </div>
                    ${contact.email ? `<span style="font-size: 12px; color: var(--md-sys-color-on-surface-variant); padding-left: 2px;">Email: ${contact.email}</span>` : ''}
                </div>
            `;
        }

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
        <td>${targetHtml}</td>
        <td>${contact.country}</td>
        <td>${statusBadgeHtml}</td>
        <td>
            <div style="display: flex; gap: 8px; align-items: center;">
                ${actionBtnHtml}
                <button class="icon-btn" onclick="deleteContact('${contact.id}', '${companyDisplay}')" title="Delete Contact" style="color: var(--md-sys-color-error);">
                    <span class="material-symbols-outlined" style="font-size: 18px;">delete</span>
                </button>
            </div>
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
    const pendingFollowupLogs = initialLogsInRegion.filter(l => !window.followupLogs.some(fl => (l.contactId && fl.contactId === l.contactId) || (l.email && fl.email === l.email)));

    const initialByDate = {};
    pendingFollowupLogs.forEach(l => {
        if (!initialByDate[l.dateString]) initialByDate[l.dateString] = [];
        initialByDate[l.dateString].push(l);
    });

    if (Object.keys(initialByDate).length === 0) {
        initialContainer.innerHTML = `<p style="color: var(--md-sys-color-on-surface-variant); padding: 16px; margin: 0;">No contacts waiting for follow-up.</p>`;
    } else {
        Object.keys(initialByDate).sort((a, b) => new Date(b) - new Date(a)).forEach(date => {
            let html = `<h3 style="margin-top: 16px; margin-bottom: 12px; color: var(--md-sys-color-on-surface-variant); display: flex; align-items: center; gap: 8px;"><span class="material-symbols-outlined" style="font-size: 18px;">calendar_today</span> ${date}</h3><table><thead><tr><th>Company</th><th>Name</th><th>Channel & Target</th><th>Action</th></tr></thead><tbody>`;
            initialByDate[date].forEach(log => {
                const contact = window.contacts.find(c => (log.contactId && c.id === log.contactId) || (log.email && c.email === log.email) || (log.email && c.socialUrl === log.email));
                const companyName = contact ? window.toTitleCase(contact.company) : (log.company || log.email);
                const clientName = contact ? ((!contact.name || contact.name === 'Team') ? '-' : window.toTitleCase(contact.name)) : '-';
                const contactId = contact ? contact.id : null;
                const channel = contact ? (contact.channel || 'email') : (log.channel || 'email');
                const channelBadge = window.getChannelBadge(channel);
                const isEmail = channel === 'email';
                const displayTarget = log.email || (contact ? (contact.email || contact.socialUrl) : '-');

                html += `<tr>
                    <td><strong>${companyName}</strong></td>
                    <td>${clientName}</td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            ${channelBadge}
                            <span>${displayTarget}</span>
                            <button class="icon-btn" onclick="copyValue('${displayTarget}', this)" title="Copy Target"><span class="material-symbols-outlined" style="font-size: 16px;">content_copy</span></button>
                        </div>
                    </td>
                    <td>
                        <div style="display: flex; gap: 8px;">
                            ${contactId ? `<button class="btn btn-followup" style="height: 32px; padding: 0 12px; font-size: 12px;" onclick="generateEmail('${contactId}', 'followup')"><span class="material-symbols-outlined" style="font-size: 16px;">forward_to_inbox</span> ${isEmail ? 'Draft Follow-up' : 'Draft Follow-up DM'}</button>` : ''}
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
            let html = `<h3 style="margin-top: 16px; margin-bottom: 12px; color: var(--md-sys-color-on-surface-variant); display: flex; align-items: center; gap: 8px;"><span class="material-symbols-outlined" style="font-size: 18px;">calendar_today</span> ${date}</h3><table><thead><tr><th>Company</th><th>Name</th><th>Channel & Target</th><th>Action</th></tr></thead><tbody>`;
            followupByDate[date].forEach(log => {
                const contact = window.contacts.find(c => (log.contactId && c.id === log.contactId) || (log.email && c.email === log.email) || (log.email && c.socialUrl === log.email));
                const companyName = contact ? window.toTitleCase(contact.company) : (log.company || log.email);
                const clientName = contact ? ((!contact.name || contact.name === 'Team') ? '-' : window.toTitleCase(contact.name)) : '-';
                const channel = contact ? (contact.channel || 'email') : (log.channel || 'email');
                const channelBadge = window.getChannelBadge(channel);
                const displayTarget = log.email || (contact ? (contact.email || contact.socialUrl) : '-');

                html += `<tr>
                    <td><strong>${companyName}</strong></td>
                    <td>${clientName}</td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            ${channelBadge}
                            <span>${displayTarget}</span>
                            <button class="icon-btn" onclick="copyValue('${displayTarget}', this)" title="Copy Target"><span class="material-symbols-outlined" style="font-size: 16px;">content_copy</span></button>
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

    const channel = contact.channel || 'email';
    const companyFormatted = window.toTitleCase(contact.company);
    const nameFormatted = window.toTitleCase(contact.name);

    let greeting = (!contact.name || contact.name === "Team") ? `Hi ${companyFormatted} Team,` : `Hi ${nameFormatted},`;
    const regionText = contact.country === 'Australia' ? 'Australia' : 'UK';

    const subjectRow = document.getElementById('dialogSubjectRow');
    const modalTitle = document.getElementById('modalDialogTitle');
    const modalSubmitBtn = document.getElementById('modalSubmitBtn');
    const dialogBodyLabel = document.getElementById('dialogBodyLabel');

    let subject = '';
    let template = '';

    if (channel === 'email') {
        if (subjectRow) subjectRow.style.display = 'flex';
        if (dialogBodyLabel) dialogBodyLabel.textContent = 'Message Body';

        if (type === 'followup') {
            if (modalTitle) modalTitle.innerText = 'Draft Follow-up Email';
            subject = `Following up: Floor plan drafting support for ${companyFormatted}`;
            template = `${greeting}\n\nJust following up on my email from earlier this week regarding floor plan drafting support for your shoots in ${regionText}.\n\nI know you’re likely busy, so I'll keep this short—we’d still love to handle your first layout as a complimentary test run with a 24-hour turnaround, whenever you have a shoot lined up this week.\n\nFeel free to review our work or check our standard drafting workflow at lavientra.com. You can also submit field sketches directly through our client portal there.\n\nNo commitments.\n\nBest regards,\n\nThe Lavientra Studio Team`;
        } else {
            if (modalTitle) modalTitle.innerText = 'Draft Initial Email';
            subject = `Floor plan drafting support for ${companyFormatted}`;
            template = `${greeting}\n\nI’m from Lavientra Studio, and we help busy ${regionText} property photographers offload their floor plan drafting with a guaranteed 24-hour turnaround. We specialize in clean, RICS-compliant 2D layouts customized to your brand standards.\n\nIf you’d like to review our work or check our standard drafting workflow, feel free to visit us at lavientra.com. You can also submit field sketches directly through our client portal there.\n\nWe’d love to handle your first layout as a complimentary test run whenever you have a shoot lined up this week. No commitments.\n\nBest regards,\n\nThe Lavientra Studio Team`;
        }

        if (modalSubmitBtn) {
            modalSubmitBtn.innerHTML = `<span class="material-symbols-outlined">mail</span> Open in Gmail & Log`;
        }
    } else {
        // Social DM
        if (subjectRow) subjectRow.style.display = 'none';
        if (dialogBodyLabel) dialogBodyLabel.textContent = 'DM Message';

        const channelName = channel.charAt(0).toUpperCase() + channel.slice(1);

        if (type === 'followup') {
            if (modalTitle) modalTitle.innerText = `Draft ${channelName} Follow-up DM`;
            template = `${greeting}\n\nQuick follow-up on my earlier message regarding floor plan drafting support for your shoots in ${regionText}.\n\nWould love to handle your first layout as a complimentary test run with a guaranteed 24-hr turnaround whenever you have a shoot this week! No commitments.\n\nBest,\nThe Lavientra Studio Team`;
        } else {
            if (modalTitle) modalTitle.innerText = `Draft ${channelName} DM`;
            template = `${greeting}\n\nI came across your work in ${regionText} and love your property photography style! I'm with Lavientra Studio—we provide dedicated 24-hr turnaround floor plan drafting tailored to your brand.\n\nWe'd love to draft your first floor plan completely free as a test run on your next shoot this week! Feel free to check out lavientra.com or message back here if you'd like to try us out.\n\nBest,\nThe Lavientra Studio Team`;
        }

        if (modalSubmitBtn) {
            modalSubmitBtn.innerHTML = `<span class="material-symbols-outlined">open_in_new</span> Open ${channelName} Profile & Log`;
        }
    }

    document.getElementById('emailSubject').value = subject;
    document.getElementById('generatedEmail').value = template;
    document.getElementById('currentContactId').value = contact.id;
    document.getElementById('currentEmailTarget').value = contact.email || '';
    document.getElementById('currentEmailType').value = type;
    document.getElementById('currentChannelType').value = channel;

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
    const pendingFollowupsTotal = contactsData.filter(c => window.getContactStatusInfo(c).status === 'followup_due').length;

    const initialSentToday = logsData.filter(l => l.isoDate === todayIso).length;
    const followupsSentToday = followupData.filter(l => l.isoDate === todayIso).length;
    const sentToday = initialSentToday + followupsSentToday;

    const completionRate = totalContacts > 0 ? Math.round((totalInitialSent / totalContacts) * 100) : 0;

    const elTotalContacts = document.getElementById('metricTotalContacts');
    const elPendingFollowups = document.getElementById('metricPendingFollowups');
    const elTotalSent = document.getElementById('metricTotalSent');
    const elTotalFollowups = document.getElementById('metricTotalFollowupsSent');
    const elSentToday = document.getElementById('metricSentToday');
    const elRate = document.getElementById('metricCompletionRate');

    if (elTotalContacts) elTotalContacts.innerText = totalContacts;
    if (elPendingFollowups) elPendingFollowups.innerText = pendingFollowupsTotal;
    if (elTotalSent) elTotalSent.innerText = totalInitialSent;
    if (elTotalFollowups) elTotalFollowups.innerText = totalFollowupsSent;
    if (elSentToday) elSentToday.innerText = sentToday;
    if (elRate) elRate.innerText = `${completionRate}%`;

    // UK Stats
    const ukContacts = contactsData.filter(c => c.country === 'UK');
    const ukContactsCount = ukContacts.length;
    const ukPendingFollowupsCount = ukContacts.filter(c => window.getContactStatusInfo(c).status === 'followup_due').length;
    const ukSent = logsData.filter(l => l.country === 'UK').length;
    const ukFollowups = followupData.filter(l => l.country === 'UK').length;
    const ukPending = Math.max(0, ukContactsCount - ukSent);
    const ukToday = logsData.filter(l => l.country === 'UK' && l.isoDate === todayIso).length + followupData.filter(l => l.country === 'UK' && l.isoDate === todayIso).length;
    const ukRate = ukContactsCount > 0 ? Math.round((ukSent / ukContactsCount) * 100) : 0;

    const ukListCount = document.getElementById('ukListCount');
    const elUkPendingFollowups = document.getElementById('ukPendingFollowups');
    const ukSentCount = document.getElementById('ukSentCount');
    const ukFollowupCount = document.getElementById('ukFollowupCount');
    const ukPendingCount = document.getElementById('ukPendingCount');
    const ukTodayCount = document.getElementById('ukTodayCount');
    const ukCompletionBadge = document.getElementById('ukCompletionBadge');
    const ukProgressBar = document.getElementById('ukProgressBar');

    if (ukListCount) ukListCount.innerText = ukContactsCount;
    if (elUkPendingFollowups) elUkPendingFollowups.innerText = ukPendingFollowupsCount;
    if (ukSentCount) ukSentCount.innerText = ukSent;
    if (ukFollowupCount) ukFollowupCount.innerText = ukFollowups;
    if (ukPendingCount) ukPendingCount.innerText = ukPending;
    if (ukTodayCount) ukTodayCount.innerText = ukToday;
    if (ukCompletionBadge) ukCompletionBadge.innerText = `${ukRate}% Done`;
    if (ukProgressBar) ukProgressBar.style.width = `${Math.min(100, ukRate)}%`;

    // Australia Stats
    const ausContacts = contactsData.filter(c => c.country === 'Australia');
    const ausContactsCount = ausContacts.length;
    const ausPendingFollowupsCount = ausContacts.filter(c => window.getContactStatusInfo(c).status === 'followup_due').length;
    const ausSent = logsData.filter(l => l.country === 'Australia').length;
    const ausFollowups = followupData.filter(l => l.country === 'Australia').length;
    const ausPending = Math.max(0, ausContactsCount - ausSent);
    const ausToday = logsData.filter(l => l.country === 'Australia' && l.isoDate === todayIso).length + followupData.filter(l => l.country === 'Australia' && l.isoDate === todayIso).length;
    const ausRate = ausContactsCount > 0 ? Math.round((ausSent / ausContactsCount) * 100) : 0;

    const ausListCount = document.getElementById('ausListCount');
    const elAusPendingFollowups = document.getElementById('ausPendingFollowups');
    const ausSentCount = document.getElementById('ausSentCount');
    const ausFollowupCount = document.getElementById('ausFollowupCount');
    const ausPendingCount = document.getElementById('ausPendingCount');
    const ausTodayCount = document.getElementById('ausTodayCount');
    const ausCompletionBadge = document.getElementById('ausCompletionBadge');
    const ausProgressBar = document.getElementById('ausProgressBar');

    if (ausListCount) ausListCount.innerText = ausContactsCount;
    if (elAusPendingFollowups) elAusPendingFollowups.innerText = ausPendingFollowupsCount;
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
        if (typeof window.checkEmailDuplicate === 'function') window.checkEmailDuplicate();
    }, (err) => console.error("Contacts sync error:", err));

    logsCol.orderBy("createdAt", "desc").onSnapshot((snapshot) => {
        window.logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        window.renderContacts();
        window.renderHistory();
        window.renderAnalytics();
        if (typeof window.checkEmailDuplicate === 'function') window.checkEmailDuplicate();
    }, (err) => console.error("Logs sync error:", err));

    followupLogsCol.orderBy("createdAt", "desc").onSnapshot((snapshot) => {
        window.followupLogs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        window.renderHistory();
        window.renderAnalytics();
        if (typeof window.checkEmailDuplicate === 'function') window.checkEmailDuplicate();
    }, (err) => console.error("Followup logs sync error:", err));
}

// Start Firebase sync
initFirebase();

// -- Delete Contact Action --
window.deleteContact = async function (contactId, companyName) {
    if (!confirm(`Are you sure you want to delete "${companyName || 'this contact'}" from the database?`)) return;
    try {
        await contactsCol.doc(contactId).delete();
    } catch (e) {
        alert("Error deleting contact: " + e.message);
    }
};

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
    const channel = document.getElementById('outreachChannel')?.value || window.activeOutreachChannel || 'email';
    const url = document.getElementById('companyUrl').value.trim();
    const socialUrl = document.getElementById('socialUrl')?.value.trim() || '';
    const nameRaw = document.getElementById('clientName').value;
    const companyRaw = document.getElementById('companyName').value;
    const emailRaw = document.getElementById('clientEmail').value;
    const country = document.getElementById('country').value;

    if (!companyRaw) {
        alert("Please enter Company Name!");
        document.getElementById('companyName')?.focus();
        return;
    }

    if (channel === 'email' && !emailRaw) {
        alert("Email Address is required for Email outreach channel!");
        document.getElementById('clientEmail')?.focus();
        return;
    }

    if (channel !== 'email' && !socialUrl) {
        const channelTitle = channel.charAt(0).toUpperCase() + channel.slice(1);
        alert(`${channelTitle} Profile URL or Handle is required!`);
        document.getElementById('socialUrl')?.focus();
        return;
    }

    const email = emailRaw ? emailRaw.trim().toLowerCase() : '';

    // Prevent duplicate email entry if email is provided
    if (email) {
        const existingContact = window.contacts.find(c => c.email && c.email.trim().toLowerCase() === email);
        if (existingContact) {
            const comp = window.toTitleCase(existingContact.company || 'Unknown');
            const region = existingContact.country || 'Unknown';
            const isSent = window.logs.some(l => l.email && l.email.trim().toLowerCase() === email);
            const isFollowup = window.followupLogs.some(l => l.email && l.email.trim().toLowerCase() === email);
            
            let status = 'Pending in Workspace';
            if (isFollowup) status = 'Follow-up Sent';
            else if (isSent) status = 'Initial Outreach Sent';

            alert(`⚠️ Duplicate Email Detected!\n\nThe email address "${email}" is already registered for:\n• Company: ${comp}\n• Region: ${region}\n• Status: ${status}\n\nPlease check and use a unique email address.`);
            
            if (typeof window.checkEmailDuplicate === 'function') window.checkEmailDuplicate();
            const emailInput = document.getElementById('clientEmail');
            if (emailInput) emailInput.focus();
            return;
        }
    }

    if (!contactsCol) {
        alert("Connecting to database... please try again.");
        return;
    }

    const company = window.toTitleCase(companyRaw);
    const name = nameRaw ? window.toTitleCase(nameRaw) : "Team";

    try {
        await contactsCol.add({
            channel,
            url,
            socialUrl,
            name,
            company,
            email,
            country,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        document.getElementById('companyUrl').value = '';
        if (document.getElementById('socialUrl')) document.getElementById('socialUrl').value = '';
        document.getElementById('clientName').value = '';
        document.getElementById('companyName').value = '';
        document.getElementById('clientEmail').value = '';

        const warningEl = document.getElementById('emailDuplicateWarning');
        if (warningEl) {
            warningEl.style.display = 'none';
            warningEl.innerHTML = '';
        }
        const emailInput = document.getElementById('clientEmail');
        if (emailInput) emailInput.classList.remove('input-duplicate-error');

        window.setWorkspaceRegion(country);
    } catch (e) {
        alert("Error saving contact: " + e.message);
    }
};

// -- Save Log to Firebase & Open Platform --
window.markAsSent = async function () {
    const contactId = document.getElementById('currentContactId')?.value;
    const email = document.getElementById('currentEmailTarget')?.value || '';
    const type = document.getElementById('currentEmailType')?.value || 'initial';
    const channel = document.getElementById('currentChannelType')?.value || 'email';
    const subject = document.getElementById('emailSubject')?.value || '';
    const body = document.getElementById('generatedEmail')?.value || '';

    const targetContact = window.contacts.find(c => c.id === contactId || (c.email && email && c.email.trim().toLowerCase() === email.trim().toLowerCase()));
    const country = targetContact ? targetContact.country : 'UK';
    const targetCol = type === 'followup' ? followupLogsCol : logsCol;

    const date = new Date();
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    const dateString = date.toLocaleDateString('en-US', options);
    const isoDate = date.toISOString().split('T')[0];

    // Open appropriate platform
    if (channel === 'email' && email) {
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(gmailUrl, '_blank');
    } else if (targetContact && targetContact.socialUrl) {
        const socUrl = window.formatSocialUrl(targetContact.socialUrl, channel);
        if (socUrl) window.open(socUrl, '_blank');
    }

    if (!targetCol) {
        alert("Connecting to database... please try again.");
        return;
    }

    try {
        await targetCol.add({
            contactId: targetContact?.id || '',
            channel: channel,
            email: email || targetContact?.socialUrl || '',
            company: targetContact?.company || '',
            dateString: dateString,
            isoDate: isoDate,
            country: country,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Update corresponding contact in Firestore with lastSentDate
        if (targetContact && targetContact.id && contactsCol) {
            await contactsCol.doc(targetContact.id).update({
                lastSentDate: firebase.firestore.FieldValue.serverTimestamp(),
                lastSentType: type
            });
        }

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
