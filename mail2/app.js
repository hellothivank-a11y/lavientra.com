// =========================================================
// LAVIENTRA STUDIO OUTREACH CRM - CORE ENGINE & APP LOGIC
// =========================================================

// --- GLOBAL STATE & CONFIGURATION ---
window.contacts = [];
window.logs = [];
window.followupLogs = [];
window.activeWorkspaceRegion = 'UK';
window.activeHistoryRegion = 'UK';
window.activeMainTab = 'workspace';
window.activeOutreachChannel = 'email';
window.activeTemplateChannel = 'email';
window.activeTemplateType = 'initial';
window.parsedCsvLeads = [];
window.isSavingContact = false;

// Default Built-in Templates (Used as initial state and fallback)
const DEFAULT_TEMPLATES = {
    email: {
        initial: {
            subject: "Floor plan drafting support for {Company}",
            body: "Hi {Name},\n\nI’m from Lavientra Studio, and we help busy {Region} property photographers offload their floor plan drafting with a guaranteed 24-hour turnaround. We specialize in clean, RICS-compliant 2D layouts customized to your brand standards.\n\nIf you’d like to review our work or check our standard drafting workflow, feel free to visit us at lavientra.com. You can also submit field sketches directly through our client portal there.\n\nWe’d love to handle your first layout as a complimentary test run whenever you have a shoot lined up this week. No commitments.\n\nBest regards,\n\nThe Lavientra Studio Team"
        },
        followup: {
            subject: "Following up: Floor plan drafting support for {Company}",
            body: "Hi {Name},\n\nJust following up on my email from earlier this week regarding floor plan drafting support for your shoots in {Region}.\n\nI know you’re likely busy, so I'll keep this short—we’d still love to handle your first layout as a complimentary test run with a 24-hour turnaround, whenever you have a shoot lined up this week.\n\nFeel free to review our work or check our standard drafting workflow at lavientra.com. You can also submit field sketches directly through our client portal there.\n\nNo commitments.\n\nBest regards,\n\nThe Lavientra Studio Team"
        }
    },
    instagram: {
        initial: {
            subject: "",
            body: "Hi {Name},\n\nI came across your work in {Region} and love your property photography style! I'm with Lavientra Studio—we provide dedicated 24-hr turnaround floor plan drafting tailored to your brand.\n\nWe'd love to draft your first floor plan completely free as a test run on your next shoot this week! Feel free to check out lavientra.com or message back here if you'd like to try us out.\n\nBest,\nThe Lavientra Studio Team"
        },
        followup: {
            subject: "",
            body: "Hi {Name},\n\nQuick follow-up on my earlier message regarding floor plan drafting support for your shoots in {Region}.\n\nWould love to handle your first layout as a complimentary test run with a guaranteed 24-hr turnaround whenever you have a shoot this week! No commitments.\n\nBest,\nThe Lavientra Studio Team"
        }
    },
    linkedin: {
        initial: {
            subject: "",
            body: "Hi {Name},\n\nI noticed your impressive property media portfolio in {Region}. I'm reaching out from Lavientra Studio—we partner with real estate photographers to provide overnight, brand-customized 2D floor plans with a 24h turnaround.\n\nWe'd love to draft a complimentary floor plan for your next shoot to show you how seamless our workflow is. Check out lavientra.com for details.\n\nBest,\nThe Lavientra Studio Team"
        },
        followup: {
            subject: "",
            body: "Hi {Name},\n\nFollowing up on my previous note regarding floor plan drafting for {Company}. We're offering a free first layout turnaround if you have any upcoming shoots in {Region} this week!\n\nBest regards,\nThe Lavientra Studio Team"
        }
    },
    facebook: {
        initial: {
            subject: "",
            body: "Hi {Name} Team,\n\nHope business is going well in {Region}! We provide reliable 24-hour turnaround floor plan drafting for real estate photography studios.\n\nWe'd love to offer {Company} a free trial layout on your next client booking. Check out our work at lavientra.com or reply directly here!\n\nBest,\nThe Lavientra Studio Team"
        },
        followup: {
            subject: "",
            body: "Hi {Name},\n\nJust checking in to see if you have any upcoming property shoots in {Region} that need fast, professional floor plans. Our complimentary test layout offer is always open!\n\nBest regards,\nThe Lavientra Studio Team"
        }
    }
};

window.emailTemplates = JSON.parse(JSON.stringify(DEFAULT_TEMPLATES));

window.automationSettings = {
    cloudSchedulerActive: true,
    intervalMinutes: 3,
    dailyLimitUK: 50,
    dailyLimitAus: 50,
    nextBatchTime: "09:00 AM"
};

// =========================================================
// 1. THEME ENGINE (DARK / LIGHT MODE)
// =========================================================
window.initTheme = function () {
    const savedTheme = localStorage.getItem('lavientra_theme') || 'light';
    window.setTheme(savedTheme);
};

window.setTheme = function (theme) {
    window.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('lavientra_theme', theme);

    const themeIcon = document.getElementById('themeIcon');
    const themeLabel = document.getElementById('themeLabel');
    const pillLight = document.getElementById('themePillLight');
    const pillDark = document.getElementById('themePillDark');

    if (themeIcon) themeIcon.textContent = theme === 'dark' ? 'dark_mode' : 'light_mode';
    if (themeLabel) themeLabel.textContent = theme === 'dark' ? 'Dark Mode' : 'Light Mode';
    if (pillLight) pillLight.classList.toggle('active', theme === 'light');
    if (pillDark) pillDark.classList.toggle('active', theme === 'dark');
};

window.toggleTheme = function () {
    const nextTheme = window.theme === 'dark' ? 'light' : 'dark';
    window.setTheme(nextTheme);
    window.showToast(`Switched to ${nextTheme === 'dark' ? 'Dark' : 'Light'} Mode`, 'info');
};

// =========================================================
// 2. NAVIGATION & TAB SWITCHING
// =========================================================
window.switchMainTab = function (tab) {
    window.activeMainTab = tab;

    // Sidebar items
    const navItems = {
        workspace: document.getElementById('tabNavWorkspace'),
        queue: document.getElementById('tabNavQueue'),
        history: document.getElementById('tabNavHistory'),
        templates: document.getElementById('tabNavTemplates'),
        analytics: document.getElementById('tabNavAnalytics'),
        settings: document.getElementById('tabNavSettings')
    };

    Object.keys(navItems).forEach(key => {
        if (navItems[key]) navItems[key].classList.toggle('active', key === tab);
    });

    // View sections
    const viewSections = {
        workspace: document.getElementById('workspaceView'),
        queue: document.getElementById('queueView'),
        history: document.getElementById('historyView'),
        templates: document.getElementById('templatesView'),
        analytics: document.getElementById('analyticsView'),
        settings: document.getElementById('settingsView')
    };

    Object.keys(viewSections).forEach(key => {
        if (viewSections[key]) {
            viewSections[key].classList.toggle('active', key === tab);
        }
    });

    // Update Header Breadcrumbs & Title
    const titleEl = document.getElementById('headerTitle');
    const breadcrumbEl = document.getElementById('headerBreadcrumb');
    const regionGroup = document.getElementById('headerRegionGroup');

    if (regionGroup) {
        regionGroup.style.display = (tab === 'workspace' || tab === 'history') ? 'inline-flex' : 'none';
    }

    const titles = {
        workspace: { title: 'Workspace & Leads', crumb: 'CRM / Workspace' },
        queue: { title: 'Queue & Cloud Automation Hub', crumb: 'CRM / Queue & Automation' },
        history: { title: 'Outreach History Log', crumb: 'CRM / Outreach History' },
        templates: { title: 'Outreach Template Manager', crumb: 'CRM / Template Manager' },
        analytics: { title: 'Campaign Progress & Analytics', crumb: 'CRM / Analytics' },
        settings: { title: 'Preferences & System Settings', crumb: 'CRM / Settings' }
    };

    if (titles[tab]) {
        if (titleEl) titleEl.textContent = titles[tab].title;
        if (breadcrumbEl) breadcrumbEl.textContent = titles[tab].crumb;
    }

    // Trigger tab-specific render logic
    if (tab === 'workspace') window.renderContacts();
    if (tab === 'queue') window.renderQueueHub();
    if (tab === 'history') window.renderHistory();
    if (tab === 'templates') window.loadTemplateIntoEditor();
    if (tab === 'analytics') window.renderAnalytics();

    // Close mobile drawer if open
    window.closeMobileSidebar();
};

window.setGlobalRegion = function (region) {
    window.activeWorkspaceRegion = region;
    window.activeHistoryRegion = region;

    const gUK = document.getElementById('globalBtnUK');
    const gAus = document.getElementById('globalBtnAus');
    if (gUK) gUK.classList.toggle('active', region === 'UK');
    if (gAus) gAus.classList.toggle('active', region === 'Australia');

    const wsUK = document.getElementById('wsBtnUK');
    const wsAus = document.getElementById('wsBtnAus');
    if (wsUK) wsUK.classList.toggle('active', region === 'UK');
    if (wsAus) wsAus.classList.toggle('active', region === 'Australia');

    const hUK = document.getElementById('histBtnUK');
    const hAus = document.getElementById('histBtnAus');
    if (hUK) hUK.classList.toggle('active', region === 'UK');
    if (hAus) hAus.classList.toggle('active', region === 'Australia');

    if (window.activeMainTab === 'workspace') window.renderContacts();
    if (window.activeMainTab === 'history') window.renderHistory();
};

window.setWorkspaceRegion = function (region) {
    window.setGlobalRegion(region);
};

window.setHistoryRegion = function (region) {
    window.setGlobalRegion(region);
};

window.toggleMobileSidebar = function () {
    const sidebar = document.getElementById('appSidebar');
    if (sidebar) sidebar.classList.toggle('open');
};

window.closeMobileSidebar = function () {
    const sidebar = document.getElementById('appSidebar');
    if (sidebar) sidebar.classList.remove('open');
};

// =========================================================
// 3. DROPDOWN & INPUT HELPERS
// =========================================================
window.toggleCountryDropdown = function (e) {
    if (e) e.stopPropagation();
    const group = document.getElementById('countryDropdownGroup');
    if (group) group.classList.toggle('open');
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

document.addEventListener('click', (e) => {
    const group = document.getElementById('countryDropdownGroup');
    if (group && !group.contains(e.target)) {
        group.classList.remove('open');
    }
});

window.toTitleCase = function (str) {
    if (!str) return '';
    return str.trim().split(/\s+/).map(word => {
        if (!word) return '';
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');
};

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
        text = sub ? `Subject: ${sub}\n\n${body}` : body;
    }

    if (!text) return;

    navigator.clipboard.writeText(text).then(() => {
        if (!btnElement) return;
        const originalHTML = btnElement.innerHTML;
        btnElement.innerHTML = `<span class="material-symbols-outlined" style="font-size: 16px; color: var(--success);">check</span> Copied!`;
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
        iconSpan.style.color = 'var(--success)';
        setTimeout(() => {
            iconSpan.innerText = originalIcon;
            iconSpan.style.color = '';
        }, 1500);
    });
};

window.showToast = function (message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    let icon = 'info';
    if (type === 'success') icon = 'check_circle';
    if (type === 'warning') icon = 'warning';
    if (type === 'error') icon = 'error';

    toast.innerHTML = `
        <span class="material-symbols-outlined" style="color: var(--${type === 'info' ? 'primary' : type}); font-size: 20px;">${icon}</span>
        <span>${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
};

// =========================================================
// 4. OUTREACH CHANNELS & BADGES
// =========================================================
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

window.checkEmailDuplicate = function () {
    if (window.isSavingContact) return;

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
        if (existing.replied) statusText = 'Replied (Follow-up Stopped)';
        else if (isFollowup) statusText = 'Follow-up Sent';
        else if (isSent) statusText = 'Initial Outreach Sent';

        warningEl.innerHTML = `<span class="material-symbols-outlined" style="font-size: 16px;">warning</span> <span><strong>Duplicate Warning:</strong> Registered for <strong>${compName}</strong> (${region}) • <em>${statusText}</em></span>`;
        warningEl.style.display = 'flex';
        emailInput.classList.add('input-duplicate-error');
    } else {
        warningEl.style.display = 'none';
        warningEl.innerHTML = '';
        emailInput.classList.remove('input-duplicate-error');
    }
};

// =========================================================
// 5. CONTACT STATUS & "REPLIED" LOGIC
// =========================================================
window.getContactStatusInfo = function (contact) {
    if (contact && (contact.replied === true || contact.status === 'replied')) {
        return { status: 'replied', days: null, label: '💬 Replied (Stopped)', isReplied: true };
    }

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
        return { status: 'never_sent', days: null, label: 'Not Sent', isReplied: false };
    }

    const now = new Date();
    const diffTime = Math.max(0, now.getTime() - lastDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays >= 3) {
        return { status: 'followup_due', days: diffDays, label: `⚠️ Follow-up Due (${diffDays}d ago)`, isReplied: false };
    } else {
        const dayText = diffDays === 0 ? 'Today' : `${diffDays}d ago`;
        return { status: 'sent_recent', days: diffDays, label: `✅ Sent (${dayText})`, isReplied: false };
    }
};

window.markAsReplied = async function (contactId, shouldMarkReplied = true) {
    if (!contactsCol || !contactId) return;

    try {
        await contactsCol.doc(contactId).update({
            replied: shouldMarkReplied,
            stopFollowup: shouldMarkReplied,
            repliedAt: shouldMarkReplied ? firebase.firestore.FieldValue.serverTimestamp() : null
        });

        window.showToast(
            shouldMarkReplied ? 'Marked as Replied! Follow-ups stopped for this lead.' : 'Replied status removed. Lead restored to active queue.',
            'success'
        );
    } catch (err) {
        window.showToast('Failed to update reply status: ' + err.message, 'error');
    }
};

// =========================================================
// 6. WORKSPACE & CONTACTS RENDERING
// =========================================================
window.renderContacts = function () {
    const tbody = document.getElementById('contactTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const searchTerm = (document.getElementById('workspaceSearchInput')?.value || '').toLowerCase().trim();

    // Filter contacts for active region and search term
    let filtered = window.contacts.filter(c => c.country === window.activeWorkspaceRegion);
    if (searchTerm) {
        filtered = filtered.filter(c =>
            (c.company && c.company.toLowerCase().includes(searchTerm)) ||
            (c.name && c.name.toLowerCase().includes(searchTerm)) ||
            (c.email && c.email.toLowerCase().includes(searchTerm)) ||
            (c.socialUrl && c.socialUrl.toLowerCase().includes(searchTerm))
        );
    }

    // Sidebar badge counts
    const pendingWorkspaceCount = window.contacts.filter(c => {
        const s = window.getContactStatusInfo(c).status;
        return s === 'never_sent' || s === 'followup_due';
    }).length;
    const dueCount = window.contacts.filter(c => window.getContactStatusInfo(c).status === 'followup_due').length;

    const sideBadgePending = document.getElementById('sidebarBadgePending');
    const sideBadgeDue = document.getElementById('sidebarBadgeDue');
    if (sideBadgePending) sideBadgePending.textContent = pendingWorkspaceCount;
    if (sideBadgeDue) sideBadgeDue.textContent = `${dueCount} Due`;

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 36px;">No contacts found matching criteria. Add a new contact or try a different filter!</td></tr>`;
        return;
    }

    // Count occurrences of each email to flag any duplicates
    const emailCounts = {};
    window.contacts.forEach(c => {
        if (c.email) {
            const normalized = c.email.trim().toLowerCase();
            emailCounts[normalized] = (emailCounts[normalized] || 0) + 1;
        }
    });

    // Priority Sort: Follow-up Due (1), Never Sent (2), Recently Sent (3), Replied (4)
    const sorted = [...filtered].sort((a, b) => {
        const statusA = window.getContactStatusInfo(a).status;
        const statusB = window.getContactStatusInfo(b).status;
        const priority = { 'followup_due': 1, 'never_sent': 2, 'sent_recent': 3, 'replied': 4 };
        return (priority[statusA] || 5) - (priority[statusB] || 5);
    });

    sorted.forEach(contact => {
        const tr = document.createElement('tr');
        const channel = contact.channel || 'email';
        const urlLink = contact.url ? (contact.url.startsWith('http') ? contact.url : 'https://' + contact.url) : '';
        const companyDisplay = window.toTitleCase(contact.company);
        const nameDisplay = (!contact.name || contact.name === 'Team') ? '-' : window.toTitleCase(contact.name);
        const isDuplicate = contact.email && emailCounts[contact.email.trim().toLowerCase()] > 1;

        const statusInfo = window.getContactStatusInfo(contact);
        let statusBadgeHtml = '';
        let actionBtnHtml = '';

        const isEmailChannel = channel === 'email';
        const draftLabel = isEmailChannel ? 'Draft Email' : 'Draft DM';
        const followUpLabel = isEmailChannel ? 'Follow Up' : 'Follow Up DM';

        if (statusInfo.status === 'replied') {
            statusBadgeHtml = `<span class="badge-status badge-replied"><span class="material-symbols-outlined" style="font-size: 14px;">forum</span> Replied</span>`;
            actionBtnHtml = `<button class="btn btn-outline btn-sm" onclick="markAsReplied('${contact.id}', false)" title="Unmark Replied & Resume Follow-up"><span class="material-symbols-outlined" style="font-size: 14px;">undo</span> Resume</button>`;
        } else if (statusInfo.status === 'followup_due') {
            statusBadgeHtml = `<span class="badge-status badge-followup-due" title="3+ days elapsed since last email"><span class="material-symbols-outlined" style="font-size: 14px;">warning</span> Follow-up Due (${statusInfo.days}d)</span>`;
            actionBtnHtml = `
                <button class="btn btn-followup btn-sm" onclick="generateEmail('${contact.id}', 'followup')"><span class="material-symbols-outlined" style="font-size: 14px;">forward_to_inbox</span> ${followUpLabel}</button>
                <button class="btn btn-tonal btn-sm" onclick="markAsReplied('${contact.id}', true)" title="Mark as Replied to Stop Follow-up"><span class="material-symbols-outlined" style="font-size: 14px;">check_circle</span> Replied</button>
            `;
        } else if (statusInfo.status === 'sent_recent') {
            const dayText = statusInfo.days === 0 ? 'Today' : `${statusInfo.days}d ago`;
            statusBadgeHtml = `<span class="badge-status badge-sent"><span class="material-symbols-outlined" style="font-size: 14px;">check_circle</span> Sent (${dayText})</span>`;
            actionBtnHtml = `
                <button class="btn btn-tonal btn-sm" onclick="generateEmail('${contact.id}', 'initial')"><span class="material-symbols-outlined" style="font-size: 14px;">edit_document</span> ${draftLabel}</button>
                <button class="btn btn-tonal btn-sm" onclick="markAsReplied('${contact.id}', true)" title="Mark as Replied"><span class="material-symbols-outlined" style="font-size: 14px;">check_circle</span> Replied</button>
            `;
        } else {
            statusBadgeHtml = `<span class="badge-status badge-not-sent"><span class="material-symbols-outlined" style="font-size: 14px;">schedule</span> Not Sent</span>`;
            actionBtnHtml = `<button class="btn btn-primary btn-sm" onclick="generateEmail('${contact.id}', 'initial')"><span class="material-symbols-outlined" style="font-size: 14px;">send</span> ${draftLabel}</button>`;
        }

        // Render Channel & Target cell
        let targetHtml = '';
        const channelBadgeHtml = window.getChannelBadge(channel);

        if (channel === 'email') {
            targetHtml = `
                <div style="display: flex; flex-direction: column; gap: 3px;">
                    <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                        ${channelBadgeHtml}
                        <span style="font-size: 13px;">${contact.email || '-'}</span>
                        ${contact.email ? `<button class="icon-btn" onclick="copyValue('${contact.email}', this)" title="Copy Email"><span class="material-symbols-outlined" style="font-size: 15px;">content_copy</span></button>` : ''}
                        ${isDuplicate ? `<span class="badge-duplicate"><span class="material-symbols-outlined" style="font-size: 12px;">warning</span> Duplicate</span>` : ''}
                    </div>
                </div>
            `;
        } else {
            const fullSocialUrl = window.formatSocialUrl(contact.socialUrl, channel);
            targetHtml = `
                <div style="display: flex; flex-direction: column; gap: 3px;">
                    <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                        ${channelBadgeHtml}
                        <a href="${fullSocialUrl}" target="_blank" style="color: var(--primary); font-weight: 500; display: inline-flex; align-items: center; gap: 3px; text-decoration: none;">
                            <span>${contact.socialUrl || 'Profile'}</span>
                            <span class="material-symbols-outlined" style="font-size: 14px;">open_in_new</span>
                        </a>
                        ${contact.socialUrl ? `<button class="icon-btn" onclick="copyValue('${contact.socialUrl}', this)" title="Copy URL"><span class="material-symbols-outlined" style="font-size: 15px;">content_copy</span></button>` : ''}
                    </div>
                    ${contact.email ? `<span style="font-size: 11.5px; color: var(--text-muted);">Email: ${contact.email}</span>` : ''}
                </div>
            `;
        }

        tr.innerHTML = `
            <td>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <strong style="font-weight: 600;">${companyDisplay}</strong>
                    ${contact.url ? `
                        <a href="${urlLink}" target="_blank" title="Visit Website" style="color: var(--primary); display: inline-flex; align-items: center;">
                            <span class="material-symbols-outlined" style="font-size: 15px;">open_in_new</span>
                        </a>
                        <button class="icon-btn" onclick="copyValue('${contact.url}', this)" title="Copy Website URL">
                            <span class="material-symbols-outlined" style="font-size: 15px;">link</span>
                        </button>
                    ` : ''}
                </div>
            </td>
            <td>${nameDisplay}</td>
            <td>${targetHtml}</td>
            <td><span style="font-weight: 500;">${contact.country === 'Australia' ? '🇦🇺 AUS' : '🇬🇧 UK'}</span></td>
            <td>${statusBadgeHtml}</td>
            <td style="text-align: right;">
                <div style="display: inline-flex; gap: 6px; align-items: center;">
                    ${actionBtnHtml}
                    <button class="icon-btn" onclick="deleteContact('${contact.id}', '${companyDisplay}')" title="Delete Lead" style="color: var(--error);">
                        <span class="material-symbols-outlined" style="font-size: 17px;">delete</span>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
};

// =========================================================
// 7. QUEUE & CLOUD SCHEDULER HUB
// =========================================================
window.toggleAutomationState = async function (isActive) {
    window.automationSettings.cloudSchedulerActive = isActive;

    const switchLabel = document.getElementById('switchLabelText');
    const headerPill = document.getElementById('headerAutomationPill');
    const headerText = document.getElementById('headerAutomationText');
    const hubPill = document.getElementById('hubAutomationStatusPill');
    const hubText = document.getElementById('hubAutomationStatusText');

    if (switchLabel) switchLabel.textContent = isActive ? 'Automation On' : 'Automation Paused';
    
    if (headerPill) {
        headerPill.className = `automation-status-pill ${isActive ? 'status-active' : 'status-paused'}`;
    }
    if (headerText) headerText.textContent = isActive ? 'Scheduler Active' : 'Scheduler Paused';
    if (hubPill) {
        hubPill.className = `automation-status-pill ${isActive ? 'status-active' : 'status-paused'}`;
    }
    if (hubText) hubText.textContent = isActive ? 'Active' : 'Paused';

    if (db) {
        try {
            await db.collection('settings').doc('automation').set({
                cloudSchedulerActive: isActive,
                intervalMinutes: 3,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            window.showToast(isActive ? 'Cloud Scheduler is now Active.' : 'Cloud Scheduler is Paused.', 'info');
        } catch (err) {
            console.error('Failed to sync automation settings to Firestore:', err);
        }
    }
};

window.renderQueueHub = function () {
    const ukTimeline = document.getElementById('ukTimelineList');
    const ausTimeline = document.getElementById('ausTimelineList');
    const totalQueuedEl = document.getElementById('queueTotalQueued');
    const totalRepliedEl = document.getElementById('queueTotalReplied');
    const ukBadge = document.getElementById('ukQueueBadge');
    const ausBadge = document.getElementById('ausQueueBadge');

    // Pending leads (never sent or follow-up due, and not replied)
    const ukQueue = window.contacts.filter(c => c.country === 'UK' && !c.replied && (window.getContactStatusInfo(c).status === 'never_sent' || window.getContactStatusInfo(c).status === 'followup_due'));
    const ausQueue = window.contacts.filter(c => c.country === 'Australia' && !c.replied && (window.getContactStatusInfo(c).status === 'never_sent' || window.getContactStatusInfo(c).status === 'followup_due'));
    const totalReplied = window.contacts.filter(c => c.replied).length;

    if (totalQueuedEl) totalQueuedEl.textContent = ukQueue.length + ausQueue.length;
    if (totalRepliedEl) totalRepliedEl.textContent = totalReplied;
    if (ukBadge) ukBadge.textContent = `${ukQueue.length} Queued`;
    if (ausBadge) ausBadge.textContent = `${ausQueue.length} Queued`;

    // Helper to generate simulated 3-minute gap timeline
    const generateTimelineHtml = (list, startHour = 9, startMin = 0) => {
        if (list.length === 0) {
            return `<div style="text-align: center; color: var(--text-muted); padding: 24px;">No pending leads in this region's dispatch queue.</div>`;
        }

        let html = '';
        let currentHour = startHour;
        let currentMin = startMin;

        list.slice(0, 15).forEach((contact, idx) => {
            const timeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')} AM`;
            const statusInfo = window.getContactStatusInfo(contact);
            const isFollowup = statusInfo.status === 'followup_due';

            html += `
                <div class="timeline-item">
                    <div style="display: flex; align-items: center; gap: 10px; overflow: hidden;">
                        <span class="timeline-time-badge"><span class="material-symbols-outlined" style="font-size: 13px;">schedule</span> ${timeStr}</span>
                        <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                            <strong>${window.toTitleCase(contact.company)}</strong>
                            <span style="font-size: 11.5px; color: var(--text-muted); margin-left: 6px;">(${contact.channel || 'email'})</span>
                        </div>
                    </div>
                    <div>
                        ${isFollowup ? `<span class="badge-status badge-followup-due" style="font-size: 11px; padding: 2px 6px;">Follow-up</span>` : `<span class="badge-status badge-not-sent" style="font-size: 11px; padding: 2px 6px;">Initial</span>`}
                    </div>
                </div>
            `;

            if (idx < list.length - 1 && idx < 14) {
                html += `<div class="gap-indicator"><span>⏳ 3 min deliverability gap</span></div>`;
            }

            // Increment time by 3 minutes
            currentMin += 3;
            if (currentMin >= 60) {
                currentHour += Math.floor(currentMin / 60);
                currentMin = currentMin % 60;
            }
        });

        if (list.length > 15) {
            html += `<div style="text-align: center; color: var(--text-muted); font-size: 12px; padding: 8px;">+ ${list.length - 15} more leads scheduled...</div>`;
        }

        return html;
    };

    if (ukTimeline) ukTimeline.innerHTML = generateTimelineHtml(ukQueue, 9, 0);
    if (ausTimeline) ausTimeline.innerHTML = generateTimelineHtml(ausQueue, 9, 0);
};

// =========================================================
// 8. DYNAMIC TEMPLATE MANAGER
// =========================================================
window.switchTemplateChannel = function (channel) {
    window.activeTemplateChannel = channel;
    const channels = ['email', 'instagram', 'linkedin', 'facebook'];
    channels.forEach(c => {
        const btn = document.getElementById(`tplChan${c.charAt(0).toUpperCase() + c.slice(1)}`);
        if (btn) btn.classList.toggle('active', c === channel);
    });

    const subjectGroup = document.getElementById('templateSubjectGroup');
    const bodyLabel = document.getElementById('templateBodyLabel');
    if (subjectGroup) subjectGroup.style.display = channel === 'email' ? 'block' : 'none';
    if (bodyLabel) bodyLabel.textContent = channel === 'email' ? 'Email Body Copy' : `${channel.charAt(0).toUpperCase() + channel.slice(1)} DM Copy`;

    window.loadTemplateIntoEditor();
};

window.switchTemplateType = function (type) {
    window.activeTemplateType = type;
    const btnInit = document.getElementById('tplTypeInitial');
    const btnFollow = document.getElementById('tplTypeFollowup');

    if (btnInit) btnInit.classList.toggle('active', type === 'initial');
    if (btnFollow) btnFollow.classList.toggle('active', type === 'followup');

    window.loadTemplateIntoEditor();
};

window.loadTemplateIntoEditor = function () {
    const channel = window.activeTemplateChannel;
    const type = window.activeTemplateType;

    const tpl = window.emailTemplates[channel]?.[type] || DEFAULT_TEMPLATES[channel]?.[type] || { subject: '', body: '' };

    const subjectInput = document.getElementById('templateSubjectInput');
    const bodyInput = document.getElementById('templateBodyInput');

    if (subjectInput) subjectInput.value = tpl.subject || '';
    if (bodyInput) bodyInput.value = tpl.body || '';

    window.updateTemplatePreview();
};

window.updateTemplatePreview = function () {
    const channel = window.activeTemplateChannel;
    const subjectVal = document.getElementById('templateSubjectInput')?.value || '';
    const bodyVal = document.getElementById('templateBodyInput')?.value || '';

    // Cache into in-memory template
    if (!window.emailTemplates[channel]) window.emailTemplates[channel] = {};
    if (!window.emailTemplates[channel][window.activeTemplateType]) window.emailTemplates[channel][window.activeTemplateType] = {};
    window.emailTemplates[channel][window.activeTemplateType].subject = subjectVal;
    window.emailTemplates[channel][window.activeTemplateType].body = bodyVal;

    // Simulate lead placeholders
    const sampleLead = {
        name: "John Miller",
        company: "Apex Property Media",
        region: "UK"
    };

    const renderedSubject = subjectVal
        .replace(/\{Name\}/g, sampleLead.name)
        .replace(/\{Company\}/g, sampleLead.company)
        .replace(/\{Region\}/g, sampleLead.region);

    const renderedBody = bodyVal
        .replace(/\{Name\}/g, sampleLead.name)
        .replace(/\{Company\}/g, sampleLead.company)
        .replace(/\{Region\}/g, sampleLead.region);

    const previewSub = document.getElementById('templatePreviewSubject');
    const previewBody = document.getElementById('templatePreviewBody');

    if (previewSub) {
        if (channel === 'email') {
            previewSub.style.display = 'block';
            previewSub.innerHTML = `<strong>Subject:</strong> ${renderedSubject || '<span style="color: var(--text-muted);">[No subject]</span>'}`;
        } else {
            previewSub.style.display = 'none';
        }
    }
    if (previewBody) {
        previewBody.textContent = renderedBody || '[Message body preview will appear here...]';
    }
};

window.insertPlaceholder = function (placeholder) {
    const textarea = document.getElementById('templateBodyInput');
    if (!textarea) return;

    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const currentValue = textarea.value;

    textarea.value = currentValue.substring(0, startPos) + placeholder + currentValue.substring(endPos);
    textarea.focus();
    textarea.selectionStart = textarea.selectionEnd = startPos + placeholder.length;

    window.updateTemplatePreview();
};

window.saveTemplatesToFirestore = async function () {
    if (!db) {
        window.showToast("Database connecting... please wait.", "warning");
        return;
    }

    try {
        await db.collection('settings').doc('emailTemplates').set(window.emailTemplates, { merge: true });
        window.showToast("Templates successfully saved to Cloud Firestore!", "success");
    } catch (err) {
        window.showToast("Failed to save templates: " + err.message, "error");
    }
};

window.resetTemplatesToDefault = function () {
    if (!confirm("Are you sure you want to reset all templates back to default system copy?")) return;
    window.emailTemplates = JSON.parse(JSON.stringify(DEFAULT_TEMPLATES));
    window.loadTemplateIntoEditor();
    window.saveTemplatesToFirestore();
    window.showToast("Templates reset to defaults.", "info");
};

// =========================================================
// 9. DRAFT EMAIL / DM MODAL LOGIC
// =========================================================
window.generateEmail = function (id, type = 'initial') {
    const contact = window.contacts.find(c => c.id === id);
    if (!contact) return;

    const dialog = document.getElementById('emailDialog');
    if (!dialog) return;

    const channel = contact.channel || 'email';
    const companyFormatted = window.toTitleCase(contact.company);
    const nameFormatted = (!contact.name || contact.name === 'Team') ? 'Team' : window.toTitleCase(contact.name);
    const regionText = contact.country === 'Australia' ? 'Australia' : 'UK';

    const tplConfig = window.emailTemplates[channel]?.[type] || DEFAULT_TEMPLATES[channel]?.[type] || { subject: '', body: '' };

    let subject = (tplConfig.subject || '')
        .replace(/\{Name\}/g, nameFormatted)
        .replace(/\{Company\}/g, companyFormatted)
        .replace(/\{Region\}/g, regionText);

    let body = (tplConfig.body || '')
        .replace(/\{Name\}/g, nameFormatted)
        .replace(/\{Company\}/g, companyFormatted)
        .replace(/\{Region\}/g, regionText);

    const subjectRow = document.getElementById('dialogSubjectRow');
    const modalTitle = document.getElementById('modalDialogTitle');
    const modalOpenBtn = document.getElementById('modalOpenPlatformBtn');
    const modalMarkBtn = document.getElementById('modalMarkAsSentBtn');
    const dialogBodyLabel = document.getElementById('dialogBodyLabel');

    if (channel === 'email') {
        if (subjectRow) subjectRow.style.display = 'flex';
        if (dialogBodyLabel) dialogBodyLabel.textContent = 'Message Body';
        if (modalTitle) modalTitle.innerText = type === 'followup' ? 'Draft Follow-up Email' : 'Draft Initial Email';

        if (modalOpenBtn) {
            modalOpenBtn.style.display = 'inline-flex';
            modalOpenBtn.innerHTML = `<span class="material-symbols-outlined">mail</span> Open in Gmail & Log`;
        }
    } else {
        if (subjectRow) subjectRow.style.display = 'none';
        if (dialogBodyLabel) dialogBodyLabel.textContent = 'DM Message';
        const channelName = channel.charAt(0).toUpperCase() + channel.slice(1);
        if (modalTitle) modalTitle.innerText = type === 'followup' ? `Draft ${channelName} Follow-up DM` : `Draft ${channelName} DM`;

        if (modalOpenBtn) {
            if (contact.socialUrl) {
                modalOpenBtn.style.display = 'inline-flex';
                modalOpenBtn.innerHTML = `<span class="material-symbols-outlined">open_in_new</span> Open ${channelName} & Log`;
            } else {
                modalOpenBtn.style.display = 'none';
            }
        }
    }

    if (modalMarkBtn) {
        modalMarkBtn.innerHTML = `<span class="material-symbols-outlined">send</span> Mark as Sent`;
    }

    document.getElementById('emailSubject').value = subject;
    document.getElementById('generatedEmail').value = body;
    document.getElementById('currentContactId').value = contact.id;
    document.getElementById('currentEmailTarget').value = contact.email || '';
    document.getElementById('currentEmailType').value = type;
    document.getElementById('currentChannelType').value = channel;

    dialog.showModal();
};

window.closeTemplate = function () {
    const dialog = document.getElementById('emailDialog');
    if (dialog) dialog.close();
};

// =========================================================
// 10. CSV BULK IMPORTER
// =========================================================
window.openCsvModal = function () {
    const dialog = document.getElementById('csvImportDialog');
    if (dialog) {
        window.resetCsvModal();
        dialog.showModal();
    }
};

window.closeCsvModal = function () {
    const dialog = document.getElementById('csvImportDialog');
    if (dialog) dialog.close();
};

window.resetCsvModal = function () {
    window.parsedCsvLeads = [];
    const previewContainer = document.getElementById('csvPreviewContainer');
    const tableBody = document.getElementById('csvPreviewTableBody');
    const fileInput = document.getElementById('csvFileInput');
    const btnExecute = document.getElementById('btnExecuteCsvImport');
    const progressContainer = document.getElementById('csvProgressBarContainer');

    if (previewContainer) previewContainer.style.display = 'none';
    if (tableBody) tableBody.innerHTML = '';
    if (fileInput) fileInput.value = '';
    if (btnExecute) btnExecute.disabled = true;
    if (progressContainer) progressContainer.style.display = 'none';
};

window.handleCsvFileSelect = function (e) {
    const file = e.target.files?.[0];
    if (!file) return;
    window.processCsvFile(file);
};

window.processCsvFile = function (file) {
    const reader = new FileReader();
    reader.onload = function (evt) {
        const text = evt.target.result;
        window.parseCsvText(text);
    };
    reader.readAsText(file);
};

window.parseCsvText = function (text) {
    const lines = text.split(/\r\n|\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length < 2) {
        window.showToast("CSV file must have at least a header row and 1 data row.", "warning");
        return;
    }

    // Split CSV Line respecting quotes
    const splitCsvLine = (line) => {
        const result = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"' || char === "'") {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim().replace(/^["']|["']$/g, ''));
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.trim().replace(/^["']|["']$/g, ''));
        return result;
    };

    const headers = splitCsvLine(lines[0]).map(h => h.toLowerCase().trim());
    
    // Autodetect header indexes
    const findIndex = (keywords) => headers.findIndex(h => keywords.some(k => h.includes(k)));

    const idxCompany = findIndex(['company', 'studio', 'business']);
    const idxName = findIndex(['name', 'contact', 'person', 'client']);
    const idxEmail = findIndex(['email', 'mail']);
    const idxChannel = findIndex(['channel', 'platform', 'type']);
    const idxSocial = findIndex(['social', 'instagram', 'linkedin', 'facebook', 'handle', 'profile']);
    const idxCountry = findIndex(['country', 'region', 'market', 'location']);
    const idxWebsite = findIndex(['website', 'url', 'web', 'site']);

    const validLeads = [];
    const existingEmails = new Set(window.contacts.map(c => (c.email || '').toLowerCase().trim()));
    let duplicateCount = 0;

    for (let i = 1; i < lines.length; i++) {
        const row = splitCsvLine(lines[i]);
        if (row.length === 0 || row.every(col => col === '')) continue;

        const company = idxCompany !== -1 ? window.toTitleCase(row[idxCompany]) : '';
        const name = idxName !== -1 && row[idxName] ? window.toTitleCase(row[idxName]) : 'Team';
        const email = idxEmail !== -1 ? (row[idxEmail] || '').trim().toLowerCase() : '';
        let channel = idxChannel !== -1 ? (row[idxChannel] || '').trim().toLowerCase() : 'email';
        if (!['email', 'instagram', 'linkedin', 'facebook'].includes(channel)) channel = 'email';
        const socialUrl = idxSocial !== -1 ? (row[idxSocial] || '').trim() : '';
        let country = idxCountry !== -1 ? (row[idxCountry] || '').trim() : 'UK';
        if (country.toLowerCase().includes('aus') || country.toLowerCase().includes('australia')) {
            country = 'Australia';
        } else {
            country = 'UK';
        }
        const website = idxWebsite !== -1 ? (row[idxWebsite] || '').trim() : '';

        if (!company && !email && !socialUrl) continue;

        const isDuplicate = email && existingEmails.has(email);
        if (isDuplicate) duplicateCount++;

        validLeads.push({
            company: company || 'Unknown Studio',
            name: name || 'Team',
            email,
            channel,
            socialUrl,
            country,
            url: website,
            isDuplicate
        });
    }

    window.parsedCsvLeads = validLeads;
    window.renderCsvPreview(validLeads, duplicateCount);
};

window.renderCsvPreview = function (leads, duplicateCount) {
    const previewContainer = document.getElementById('csvPreviewContainer');
    const tableBody = document.getElementById('csvPreviewTableBody');
    const parsedCountEl = document.getElementById('csvParsedCount');
    const dupCountEl = document.getElementById('csvDuplicateCount');
    const btnExecute = document.getElementById('btnExecuteCsvImport');

    if (previewContainer) previewContainer.style.display = 'block';
    if (parsedCountEl) parsedCountEl.textContent = `${leads.length} Leads Ready for Import`;
    if (dupCountEl) dupCountEl.textContent = duplicateCount > 0 ? `⚠️ ${duplicateCount} potential duplicates found` : '';
    if (btnExecute) btnExecute.disabled = leads.length === 0;

    if (!tableBody) return;
    tableBody.innerHTML = '';

    leads.slice(0, 30).forEach(lead => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${lead.company}</strong></td>
            <td>${lead.name}</td>
            <td>
                <div style="display: flex; align-items: center; gap: 6px;">
                    ${window.getChannelBadge(lead.channel)}
                    <span>${lead.email || lead.socialUrl || '-'}</span>
                </div>
            </td>
            <td>${lead.country === 'Australia' ? '🇦🇺 AUS' : '🇬🇧 UK'}</td>
            <td>
                ${lead.isDuplicate ? `<span class="badge-duplicate"><span class="material-symbols-outlined" style="font-size: 12px;">warning</span> Existing Email</span>` : `<span class="badge-status badge-not-sent" style="font-size: 11px;">New Lead</span>`}
            </td>
        `;
        tableBody.appendChild(tr);
    });

    if (leads.length > 30) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="5" style="text-align: center; color: var(--text-muted); font-size: 12px; padding: 10px;">... and ${leads.length - 30} more leads</td>`;
        tableBody.appendChild(tr);
    }
};

window.executeCsvImport = async function () {
    if (!contactsCol || window.parsedCsvLeads.length === 0) return;

    const btnExecute = document.getElementById('btnExecuteCsvImport');
    const progressContainer = document.getElementById('csvProgressBarContainer');
    const progressBarFill = document.getElementById('csvProgressBarFill');
    const progressText = document.getElementById('csvProgressText');

    if (btnExecute) btnExecute.disabled = true;
    if (progressContainer) progressContainer.style.display = 'block';

    const leads = window.parsedCsvLeads;
    const batchSize = 300;
    let savedCount = 0;

    try {
        for (let i = 0; i < leads.length; i += batchSize) {
            const chunk = leads.slice(i, i + batchSize);
            const batch = db.batch();

            chunk.forEach(lead => {
                const docRef = contactsCol.doc();
                batch.set(docRef, {
                    company: lead.company,
                    name: lead.name,
                    email: lead.email,
                    channel: lead.channel,
                    socialUrl: lead.socialUrl,
                    country: lead.country,
                    url: lead.url,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            });

            await batch.commit();
            savedCount += chunk.length;

            const progressPct = Math.round((savedCount / leads.length) * 100);
            if (progressBarFill) progressBarFill.style.width = `${progressPct}%`;
            if (progressText) progressText.textContent = `Imported ${savedCount} of ${leads.length} leads (${progressPct}%)...`;
        }

        window.showToast(`Successfully imported ${savedCount} leads into Cloud!`, 'success');
        setTimeout(() => {
            window.closeCsvModal();
            window.renderContacts();
        }, 800);
    } catch (err) {
        window.showToast("CSV import encountered an error: " + err.message, "error");
        if (btnExecute) btnExecute.disabled = false;
    }
};

window.downloadSampleCsv = function () {
    const csvContent = "Company Name,Client Name,Email,Channel,Social URL,Region,Website URL\n" +
        "Apex Property Media,John Miller,contact@apexmedia.co.uk,email,,UK,https://apexmedia.co.uk\n" +
        "Sydney Real Estate Shoots,Sarah Jenkins,,instagram,https://instagram.com/sydneypropertyshoots,Australia,https://sydneyshoots.com.au\n" +
        "London Luxe Photography,David Clark,david@londonluxe.com,linkedin,https://linkedin.com/in/davidclark-photo,UK,https://londonluxe.com\n";

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'lavientra_leads_sample.csv';
    link.click();
    URL.revokeObjectURL(link.href);
};

window.exportContactsCsv = function () {
    if (window.contacts.length === 0) {
        window.showToast("No contacts available to export.", "warning");
        return;
    }

    let csv = "Company Name,Contact Name,Channel,Email,Social URL,Region,Website,Status,Replied\n";
    window.contacts.forEach(c => {
        const comp = `"${(c.company || '').replace(/"/g, '""')}"`;
        const name = `"${(c.name || '').replace(/"/g, '""')}"`;
        const channel = c.channel || 'email';
        const email = c.email || '';
        const social = `"${(c.socialUrl || '').replace(/"/g, '""')}"`;
        const region = c.country || 'UK';
        const url = `"${(c.url || '').replace(/"/g, '""')}"`;
        const status = window.getContactStatusInfo(c).status;
        const replied = c.replied ? 'YES' : 'NO';

        csv += `${comp},${name},${channel},${email},${social},${region},${url},${status},${replied}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `lavientra_contacts_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    window.showToast("Contacts exported successfully.", "success");
};

// Setup Drag & Drop listeners
document.addEventListener('DOMContentLoaded', () => {
    const dropzone = document.getElementById('csvDropzone');
    if (dropzone) {
        ['dragenter', 'dragover'].forEach(eventName => {
            dropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                dropzone.classList.add('dragover');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                dropzone.classList.remove('dragover');
            });
        });

        dropzone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                window.processCsvFile(files[0]);
            }
        });
    }

    // Modal click-outside to close
    const emailDialog = document.getElementById('emailDialog');
    if (emailDialog) {
        emailDialog.addEventListener('click', (e) => {
            const rect = emailDialog.getBoundingClientRect();
            if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
                emailDialog.close();
            }
        });
    }

    const csvDialog = document.getElementById('csvImportDialog');
    if (csvDialog) {
        csvDialog.addEventListener('click', (e) => {
            const rect = csvDialog.getBoundingClientRect();
            if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
                csvDialog.close();
            }
        });
    }

    // Init theme
    window.initTheme();
});

// =========================================================
// 11. OUTREACH HISTORY RENDERING
// =========================================================
window.renderHistory = function () {
    const initialContainer = document.getElementById('historyInitialContainer');
    const followupContainer = document.getElementById('historyFollowupContainer');
    if (!initialContainer || !followupContainer) return;

    initialContainer.innerHTML = '';
    followupContainer.innerHTML = '';

    const searchTerm = (document.getElementById('historySearchInput')?.value || '').toLowerCase().trim();

    // Grouping logic for INITIAL LOGS that have NO FOLLOW-UP LOG YET
    let initialLogsInRegion = window.logs.filter(l => l.country === window.activeHistoryRegion);
    let pendingFollowupLogs = initialLogsInRegion.filter(l => !window.followupLogs.some(fl => (l.contactId && fl.contactId === l.contactId) || (l.email && fl.email === l.email)));

    if (searchTerm) {
        pendingFollowupLogs = pendingFollowupLogs.filter(l =>
            (l.company && l.company.toLowerCase().includes(searchTerm)) ||
            (l.email && l.email.toLowerCase().includes(searchTerm))
        );
    }

    const initialByDate = {};
    pendingFollowupLogs.forEach(l => {
        if (!initialByDate[l.dateString]) initialByDate[l.dateString] = [];
        initialByDate[l.dateString].push(l);
    });

    const sideBadgeHistory = document.getElementById('sidebarBadgeHistory');
    if (sideBadgeHistory) sideBadgeHistory.textContent = window.logs.length + window.followupLogs.length;

    if (Object.keys(initialByDate).length === 0) {
        initialContainer.innerHTML = `<p style="color: var(--text-muted); padding: 16px; margin: 0; font-size: 13.5px;">No initial outreaches waiting for follow-up.</p>`;
    } else {
        Object.keys(initialByDate).sort((a, b) => new Date(b) - new Date(a)).forEach(date => {
            let html = `
                <h3 style="margin-top: 16px; margin-bottom: 12px; font-size: 13px; color: var(--text-secondary); display: flex; align-items: center; gap: 6px;">
                    <span class="material-symbols-outlined" style="font-size: 16px;">calendar_today</span> ${date}
                </h3>
                <div class="table-responsive" style="margin-bottom: 16px;">
                    <table>
                        <thead>
                            <tr>
                                <th>Company</th>
                                <th>Contact Person</th>
                                <th>Target & Channel</th>
                                <th style="text-align: right;">Action</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            initialByDate[date].forEach(log => {
                const contact = window.contacts.find(c => (log.contactId && c.id === log.contactId) || (log.email && c.email === log.email) || (log.email && c.socialUrl === log.email));
                const companyName = contact ? window.toTitleCase(contact.company) : (log.company || log.email);
                const clientName = contact ? ((!contact.name || contact.name === 'Team') ? '-' : window.toTitleCase(contact.name)) : '-';
                const contactId = contact ? contact.id : null;
                const channel = contact ? (contact.channel || 'email') : (log.channel || 'email');
                const channelBadge = window.getChannelBadge(channel);
                const isEmail = channel === 'email';
                const displayTarget = log.email || (contact ? (contact.email || contact.socialUrl) : '-');
                const isReplied = contact && contact.replied;

                html += `
                    <tr>
                        <td><strong>${companyName}</strong></td>
                        <td>${clientName}</td>
                        <td>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                ${channelBadge}
                                <span>${displayTarget}</span>
                                <button class="icon-btn" onclick="copyValue('${displayTarget}', this)" title="Copy Target"><span class="material-symbols-outlined" style="font-size: 14px;">content_copy</span></button>
                            </div>
                        </td>
                        <td style="text-align: right;">
                            <div style="display: inline-flex; gap: 6px;">
                                ${contactId && !isReplied ? `<button class="btn btn-followup btn-sm" onclick="generateEmail('${contactId}', 'followup')"><span class="material-symbols-outlined" style="font-size: 14px;">forward_to_inbox</span> ${isEmail ? 'Draft Follow-up' : 'Follow-up DM'}</button>` : ''}
                                ${contactId ? `<button class="btn btn-tonal btn-sm" onclick="markAsReplied('${contactId}', ${!isReplied})">${isReplied ? 'Unmark Replied' : 'Mark Replied'}</button>` : ''}
                                <button class="btn btn-error btn-sm" onclick="markUnsent('${log.id}', 'logs')"><span class="material-symbols-outlined" style="font-size: 14px;">undo</span> Unsent</button>
                            </div>
                        </td>
                    </tr>
                `;
            });

            html += `</tbody></table></div>`;
            initialContainer.innerHTML += html;
        });
    }

    // Grouping logic for FOLLOW-UP LOGS
    let followupLogsInRegion = window.followupLogs.filter(l => l.country === window.activeHistoryRegion);
    if (searchTerm) {
        followupLogsInRegion = followupLogsInRegion.filter(l =>
            (l.company && l.company.toLowerCase().includes(searchTerm)) ||
            (l.email && l.email.toLowerCase().includes(searchTerm))
        );
    }

    const followupByDate = {};
    followupLogsInRegion.forEach(l => {
        if (!followupByDate[l.dateString]) followupByDate[l.dateString] = [];
        followupByDate[l.dateString].push(l);
    });

    if (Object.keys(followupByDate).length === 0) {
        followupContainer.innerHTML = `<p style="color: var(--text-muted); padding: 16px; margin: 0; font-size: 13.5px;">No follow-ups logged yet.</p>`;
    } else {
        Object.keys(followupByDate).sort((a, b) => new Date(b) - new Date(a)).forEach(date => {
            let html = `
                <h3 style="margin-top: 16px; margin-bottom: 12px; font-size: 13px; color: var(--text-secondary); display: flex; align-items: center; gap: 6px;">
                    <span class="material-symbols-outlined" style="font-size: 16px;">calendar_today</span> ${date}
                </h3>
                <div class="table-responsive" style="margin-bottom: 16px;">
                    <table>
                        <thead>
                            <tr>
                                <th>Company</th>
                                <th>Contact Person</th>
                                <th>Target & Channel</th>
                                <th style="text-align: right;">Action</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            followupByDate[date].forEach(log => {
                const contact = window.contacts.find(c => (log.contactId && c.id === log.contactId) || (log.email && c.email === log.email) || (log.email && c.socialUrl === log.email));
                const companyName = contact ? window.toTitleCase(contact.company) : (log.company || log.email);
                const clientName = contact ? ((!contact.name || contact.name === 'Team') ? '-' : window.toTitleCase(contact.name)) : '-';
                const channel = contact ? (contact.channel || 'email') : (log.channel || 'email');
                const channelBadge = window.getChannelBadge(channel);
                const displayTarget = log.email || (contact ? (contact.email || contact.socialUrl) : '-');

                html += `
                    <tr>
                        <td><strong>${companyName}</strong></td>
                        <td>${clientName}</td>
                        <td>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                ${channelBadge}
                                <span>${displayTarget}</span>
                                <button class="icon-btn" onclick="copyValue('${displayTarget}', this)" title="Copy Target"><span class="material-symbols-outlined" style="font-size: 14px;">content_copy</span></button>
                            </div>
                        </td>
                        <td style="text-align: right;">
                            <button class="btn btn-error btn-sm" onclick="markUnsent('${log.id}', 'followup_logs')"><span class="material-symbols-outlined" style="font-size: 14px;">undo</span> Unsent</button>
                        </td>
                    </tr>
                `;
            });

            html += `</tbody></table></div>`;
            followupContainer.innerHTML += html;
        });
    }
};

// =========================================================
// 12. PROGRESS & ANALYTICS
// =========================================================
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
    const totalReplied = contactsData.filter(c => c.replied).length;

    const initialSentToday = logsData.filter(l => l.isoDate === todayIso).length;
    const followupsSentToday = followupData.filter(l => l.isoDate === todayIso).length;
    const sentToday = initialSentToday + followupsSentToday;

    const completionRate = totalContacts > 0 ? Math.round((totalInitialSent / totalContacts) * 100) : 0;

    const elTotalContacts = document.getElementById('metricTotalContacts');
    const elPendingFollowups = document.getElementById('metricPendingFollowups');
    const elTotalSent = document.getElementById('metricTotalSent');
    const elTotalFollowups = document.getElementById('metricTotalFollowupsSent');
    const elTotalReplied = document.getElementById('metricTotalReplied');
    const elRate = document.getElementById('metricCompletionRate');

    if (elTotalContacts) elTotalContacts.innerText = totalContacts;
    if (elPendingFollowups) elPendingFollowups.innerText = pendingFollowupsTotal;
    if (elTotalSent) elTotalSent.innerText = totalInitialSent;
    if (elTotalFollowups) elTotalFollowups.innerText = totalFollowupsSent;
    if (elTotalReplied) elTotalReplied.innerText = totalReplied;
    if (elRate) elRate.innerText = `${completionRate}%`;

    // UK Stats
    const ukContacts = contactsData.filter(c => c.country === 'UK');
    const ukContactsCount = ukContacts.length;
    const ukPendingFollowupsCount = ukContacts.filter(c => window.getContactStatusInfo(c).status === 'followup_due').length;
    const ukSent = logsData.filter(l => l.country === 'UK').length;
    const ukFollowups = followupData.filter(l => l.country === 'UK').length;
    const ukReplied = ukContacts.filter(c => c.replied).length;
    const ukPending = Math.max(0, ukContactsCount - ukSent);
    const ukToday = logsData.filter(l => l.country === 'UK' && l.isoDate === todayIso).length + followupData.filter(l => l.country === 'UK' && l.isoDate === todayIso).length;
    const ukRate = ukContactsCount > 0 ? Math.round((ukSent / ukContactsCount) * 100) : 0;

    const ukListCount = document.getElementById('ukListCount');
    const elUkPendingFollowups = document.getElementById('ukPendingFollowups');
    const ukSentCount = document.getElementById('ukSentCount');
    const ukFollowupCount = document.getElementById('ukFollowupCount');
    const elUkRepliedCount = document.getElementById('ukRepliedCount');
    const ukPendingCount = document.getElementById('ukPendingCount');
    const ukTodayCount = document.getElementById('ukTodayCount');
    const ukCompletionBadge = document.getElementById('ukCompletionBadge');
    const ukProgressBar = document.getElementById('ukProgressBar');

    if (ukListCount) ukListCount.innerText = ukContactsCount;
    if (elUkPendingFollowups) elUkPendingFollowups.innerText = ukPendingFollowupsCount;
    if (ukSentCount) ukSentCount.innerText = ukSent;
    if (ukFollowupCount) ukFollowupCount.innerText = ukFollowups;
    if (elUkRepliedCount) elUkRepliedCount.innerText = ukReplied;
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
    const ausReplied = ausContacts.filter(c => c.replied).length;
    const ausPending = Math.max(0, ausContactsCount - ausSent);
    const ausToday = logsData.filter(l => l.country === 'Australia' && l.isoDate === todayIso).length + followupData.filter(l => l.country === 'Australia' && l.isoDate === todayIso).length;
    const ausRate = ausContactsCount > 0 ? Math.round((ausSent / ausContactsCount) * 100) : 0;

    const ausListCount = document.getElementById('ausListCount');
    const elAusPendingFollowups = document.getElementById('ausPendingFollowups');
    const ausSentCount = document.getElementById('ausSentCount');
    const ausFollowupCount = document.getElementById('ausFollowupCount');
    const elAusRepliedCount = document.getElementById('ausRepliedCount');
    const ausPendingCount = document.getElementById('ausPendingCount');
    const ausTodayCount = document.getElementById('ausTodayCount');
    const ausCompletionBadge = document.getElementById('ausCompletionBadge');
    const ausProgressBar = document.getElementById('ausProgressBar');

    if (ausListCount) ausListCount.innerText = ausContactsCount;
    if (elAusPendingFollowups) elAusPendingFollowups.innerText = ausPendingFollowupsCount;
    if (ausSentCount) ausSentCount.innerText = ausSent;
    if (ausFollowupCount) ausFollowupCount.innerText = ausFollowups;
    if (elAusRepliedCount) elAusRepliedCount.innerText = ausReplied;
    if (ausPendingCount) ausPendingCount.innerText = ausPending;
    if (ausTodayCount) ausTodayCount.innerText = ausToday;
    if (ausCompletionBadge) ausCompletionBadge.innerText = `${ausRate}% Done`;
    if (ausProgressBar) ausProgressBar.style.width = `${Math.min(100, ausRate)}%`;
};

// =========================================================
// 13. FIREBASE AUTH & FIRESTORE INTEGRATION
// =========================================================
const ALLOWED_EMAILS = [
    "thivanka.ltk@gmail.com",
    "lavientra@gmail.com"
];

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
let unsubscribeContacts = null;
let unsubscribeLogs = null;
let unsubscribeFollowupLogs = null;
let unsubscribeTemplates = null;
let unsubscribeAutomation = null;

function startDatabaseSync() {
    stopDatabaseSync();

    if (!contactsCol || !logsCol || !followupLogsCol) return;

    unsubscribeContacts = contactsCol.orderBy("createdAt", "desc").onSnapshot((snapshot) => {
        window.contacts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (window.activeMainTab === 'workspace') window.renderContacts();
        if (window.activeMainTab === 'queue') window.renderQueueHub();
        if (window.activeMainTab === 'history') window.renderHistory();
        if (window.activeMainTab === 'analytics') window.renderAnalytics();
    }, (err) => console.error("Contacts sync error:", err));

    unsubscribeLogs = logsCol.orderBy("createdAt", "desc").onSnapshot((snapshot) => {
        window.logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (window.activeMainTab === 'workspace') window.renderContacts();
        if (window.activeMainTab === 'history') window.renderHistory();
        if (window.activeMainTab === 'analytics') window.renderAnalytics();
    }, (err) => console.error("Logs sync error:", err));

    unsubscribeFollowupLogs = followupLogsCol.orderBy("createdAt", "desc").onSnapshot((snapshot) => {
        window.followupLogs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (window.activeMainTab === 'history') window.renderHistory();
        if (window.activeMainTab === 'analytics') window.renderAnalytics();
    }, (err) => console.error("Followup logs sync error:", err));

    // Templates sync from settings/emailTemplates
    if (db) {
        unsubscribeTemplates = db.collection("settings").doc("emailTemplates").onSnapshot((doc) => {
            if (doc.exists) {
                const data = doc.data();
                window.emailTemplates = { ...window.emailTemplates, ...data };
                if (window.activeMainTab === 'templates') window.loadTemplateIntoEditor();
            }
        }, (err) => console.error("Templates sync error:", err));

        // Automation settings sync from settings/automation
        unsubscribeAutomation = db.collection("settings").doc("automation").onSnapshot((doc) => {
            if (doc.exists) {
                const data = doc.data();
                window.automationSettings = { ...window.automationSettings, ...data };
                const switchEl = document.getElementById('automationToggleSwitch');
                if (switchEl && typeof data.cloudSchedulerActive === 'boolean') {
                    switchEl.checked = data.cloudSchedulerActive;
                }
            }
        }, (err) => console.error("Automation sync error:", err));
    }
}

function stopDatabaseSync() {
    if (typeof unsubscribeContacts === 'function') { unsubscribeContacts(); unsubscribeContacts = null; }
    if (typeof unsubscribeLogs === 'function') { unsubscribeLogs(); unsubscribeLogs = null; }
    if (typeof unsubscribeFollowupLogs === 'function') { unsubscribeFollowupLogs(); unsubscribeFollowupLogs = null; }
    if (typeof unsubscribeTemplates === 'function') { unsubscribeTemplates(); unsubscribeTemplates = null; }
    if (typeof unsubscribeAutomation === 'function') { unsubscribeAutomation(); unsubscribeAutomation = null; }
}

function initFirebase() {
    if (typeof firebase === 'undefined' || typeof firebase.auth !== 'function') {
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

    firebase.auth().onAuthStateChanged((user) => {
        const loginContainer = document.getElementById('loginContainer');
        const appContainer = document.getElementById('appContainer');

        if (user) {
            const userEmail = (user.email || '').toLowerCase().trim();
            if (ALLOWED_EMAILS.includes(userEmail)) {
                if (loginContainer) loginContainer.style.display = 'none';
                if (appContainer) appContainer.style.display = 'flex';

                // Display User profile
                const nameDisplay = document.getElementById('userNameDisplay');
                const emailDisplay = document.getElementById('userEmailDisplay');
                const avatarLetter = document.getElementById('userAvatarLetter');
                const settingsEmail = document.getElementById('settingsAuthEmailDisplay');

                const displayName = user.displayName || userEmail.split('@')[0];
                if (nameDisplay) nameDisplay.textContent = displayName;
                if (emailDisplay) emailDisplay.textContent = userEmail;
                if (avatarLetter) avatarLetter.textContent = displayName.charAt(0).toUpperCase();
                if (settingsEmail) settingsEmail.textContent = userEmail;

                startDatabaseSync();
            } else {
                alert("Access Denied: Your email (" + user.email + ") is not authorized to access this outreach application.");
                firebase.auth().signOut();
            }
        } else {
            if (loginContainer) loginContainer.style.display = 'flex';
            if (appContainer) appContainer.style.display = 'none';
            stopDatabaseSync();
            window.contacts = [];
            window.logs = [];
            window.followupLogs = [];
        }
    });
}

initFirebase();

window.loginWithGoogle = async function () {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        await firebase.auth().signInWithPopup(provider);
    } catch (error) {
        if (error.code !== 'auth/popup-closed-by-user') {
            alert("Sign in failed: " + error.message);
        }
    }
};

window.logout = async function () {
    try {
        await firebase.auth().signOut();
    } catch (error) {
        alert("Logout failed: " + error.message);
    }
};

window.deleteContact = async function (contactId, companyName) {
    if (!confirm(`Are you sure you want to delete "${companyName || 'this contact'}" from the database?`)) return;
    try {
        await contactsCol.doc(contactId).delete();
        window.showToast("Contact deleted.", "info");
    } catch (e) {
        window.showToast("Error deleting contact: " + e.message, "error");
    }
};

window.markUnsent = async function (logId, colName) {
    if (!confirm("Are you sure you want to mark this mail as Unsent? This will remove it from history.")) return;
    try {
        await db.collection(colName).doc(logId).delete();
        window.showToast("Outreach marked as Unsent.", "info");
    } catch (e) {
        window.showToast("Error deleting log: " + e.message, "error");
    }
};

window.clearContactForm = function () {
    const compEl = document.getElementById('companyName');
    const clientEl = document.getElementById('clientName');
    const emailEl = document.getElementById('clientEmail');
    const socialEl = document.getElementById('socialUrl');
    const urlEl = document.getElementById('companyUrl');

    if (compEl) compEl.value = '';
    if (clientEl) clientEl.value = '';
    if (emailEl) emailEl.value = '';
    if (socialEl) socialEl.value = '';
    if (urlEl) urlEl.value = '';

    const warningEl = document.getElementById('emailDuplicateWarning');
    if (warningEl) {
        warningEl.style.display = 'none';
        warningEl.innerHTML = '';
    }
    if (emailEl) emailEl.classList.remove('input-duplicate-error');

    window.setOutreachChannel('email');
    if (compEl) compEl.focus();
};

window.addContact = async function () {
    const channel = document.getElementById('outreachChannel')?.value || window.activeOutreachChannel || 'email';
    const url = document.getElementById('companyUrl').value.trim();
    const socialUrl = document.getElementById('socialUrl')?.value.trim() || '';
    const nameRaw = document.getElementById('clientName').value;
    const companyRaw = document.getElementById('companyName').value;
    const emailRaw = document.getElementById('clientEmail').value;
    const country = document.getElementById('country').value;

    if (!companyRaw) {
        window.showToast("Please enter Company / Studio Name!", "warning");
        document.getElementById('companyName')?.focus();
        return;
    }

    if (channel === 'email' && !emailRaw) {
        window.showToast("Email Address is required for Email channel!", "warning");
        document.getElementById('clientEmail')?.focus();
        return;
    }

    if (channel !== 'email' && !socialUrl) {
        const channelTitle = channel.charAt(0).toUpperCase() + channel.slice(1);
        window.showToast(`${channelTitle} Profile URL or Handle is required!`, "warning");
        document.getElementById('socialUrl')?.focus();
        return;
    }

    const email = emailRaw ? emailRaw.trim().toLowerCase() : '';

    if (email) {
        const existingContact = window.contacts.find(c => c.email && c.email.trim().toLowerCase() === email);
        if (existingContact) {
            const comp = window.toTitleCase(existingContact.company || 'Unknown');
            const region = existingContact.country || 'Unknown';
            const isSent = window.logs.some(l => l.email && l.email.trim().toLowerCase() === email);
            const isFollowup = window.followupLogs.some(l => l.email && l.email.trim().toLowerCase() === email);

            let status = 'Pending in Workspace';
            if (existingContact.replied) status = 'Replied (Follow-up Stopped)';
            else if (isFollowup) status = 'Follow-up Sent';
            else if (isSent) status = 'Initial Outreach Sent';

            alert(`⚠️ Duplicate Email Detected!\n\nThe email address "${email}" is already registered for:\n• Company: ${comp}\n• Region: ${region}\n• Status: ${status}\n\nPlease check and use a unique email address.`);
            
            if (typeof window.checkEmailDuplicate === 'function') window.checkEmailDuplicate();
            const emailInput = document.getElementById('clientEmail');
            if (emailInput) emailInput.focus();
            return;
        }
    }

    if (!contactsCol) {
        window.showToast("Connecting to database... please try again.", "warning");
        return;
    }

    const company = window.toTitleCase(companyRaw);
    const name = nameRaw ? window.toTitleCase(nameRaw) : "Team";

    window.isSavingContact = true;
    const warningEl = document.getElementById('emailDuplicateWarning');
    if (warningEl) {
        warningEl.style.display = 'none';
        warningEl.innerHTML = '';
    }

    try {
        await contactsCol.add({
            channel,
            url,
            socialUrl,
            name,
            company,
            email,
            country,
            replied: false,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        window.clearContactForm();
        window.setWorkspaceRegion(country);
        window.showToast(`Saved "${company}" to Cloud Database!`, "success");
    } catch (e) {
        window.showToast("Error saving contact: " + e.message, "error");
    } finally {
        window.isSavingContact = false;
    }
};

window.markAsSent = async function (openPlatform = false) {
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

    if (openPlatform) {
        if (channel === 'email' && email) {
            const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            window.open(gmailUrl, '_blank');
        } else if (targetContact && targetContact.socialUrl) {
            const socUrl = window.formatSocialUrl(targetContact.socialUrl, channel);
            if (socUrl) window.open(socUrl, '_blank');
        }
    }

    if (!targetCol) {
        window.showToast("Connecting to database... please try again.", "warning");
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

        if (targetContact && targetContact.id && contactsCol) {
            await contactsCol.doc(targetContact.id).update({
                lastSentDate: firebase.firestore.FieldValue.serverTimestamp(),
                lastSentType: type
            });
        }

        window.closeTemplate();
        window.showToast(`Logged ${type === 'followup' ? 'follow-up' : 'initial'} outreach for ${targetContact?.company || 'contact'}.`, 'success');
    } catch (e) {
        window.showToast("Error saving log: " + e.message, "error");
    }
};
