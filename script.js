// CONFIGURATION
const CONFIG = {
    projectTypes: { 'Static': 2.1, 'Complex': 2.3, 'Digital': 2.4, 'Fast-track': 2.55 },
    labour: { 'Low': 0.05, 'Medium': 0.1, 'High': 0.15 },
    installation: { 'Normal': 0.05, 'Height': 0.1, 'Night': 0.15 },
    risk: { 'Low': 0.05, 'Medium': 0.1, 'High': 0.15 },
    assumptions: { totalMarginPct: 0.525 } 
};

const DEFAULTS = { materialCost: 0, projectType: 'Static', labour: 'Low', installation: 'Normal', risk: 'Low' };
let state = { ...DEFAULTS };

// DOM Elements
const materialInput = document.getElementById('materialInput');
const sidebarFinalPriceDisplay = document.getElementById('sidebarFinalPriceDisplay');
const basePriceDisplay = document.getElementById('basePriceDisplay');
const factoryPriceDisplay = document.getElementById('factoryPriceDisplay');
const commercialStatusDisplay = document.getElementById('commercialStatusDisplay');
const progressBar = document.getElementById('progressBar');
const statusBadgeContainer = document.getElementById('statusBadgeContainer');
const statusBadge = document.getElementById('statusBadge');
const statusText = document.getElementById('statusText');
const statusPulse = document.getElementById('statusPulse');

// CALCULATIONS
function calculate() {
    const basePrice = state.materialCost * CONFIG.projectTypes[state.projectType];
    const uplift = CONFIG.labour[state.labour] + CONFIG.installation[state.installation] + CONFIG.risk[state.risk];
    const grossPrice = basePrice * (1 + uplift);
    const factoryPrice = state.materialCost / (1 - CONFIG.assumptions.totalMarginPct);

    let discount = grossPrice < 50000 ? 0.02 : grossPrice < 100000 ? 0.05 : 0.07;
    const finalPrice = grossPrice * (1 - discount);
    return { basePrice, grossPrice, factoryPrice, finalPrice };
}

// BUTTON GROUPS
function renderGroup(containerId, data, key, isGrid = false) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    Object.keys(data).forEach(label => {
        const btn = document.createElement('button');
        btn.innerText = label;
        btn.className = `py-2 text-[11px] font-bold rounded-md border transition-all ${state[key] === label ? 'btn-active' : 'btn-inactive'}`;
        if (!isGrid) btn.classList.add('flex-1');
        btn.onclick = () => { state[key] = label; createButtonGroups(); update(); };
        container.appendChild(btn);
    });
}
function createButtonGroups() {
    renderGroup('projectTypes', CONFIG.projectTypes, 'projectType', true);
    renderGroup('labourIntensity', CONFIG.labour, 'labour');
    renderGroup('installationComplexity', CONFIG.installation, 'installation');
    renderGroup('authorityRisk', CONFIG.risk, 'risk');
}

// UI UPDATE
function update() {
    const res = calculate();
    const hasInput = state.materialCost > 0;
    const isApproved = res.grossPrice >= res.factoryPrice;

    sidebarFinalPriceDisplay.innerText = Math.round(res.finalPrice).toLocaleString();
    basePriceDisplay.innerText = Math.round(res.basePrice).toLocaleString();
    factoryPriceDisplay.innerText = Math.round(res.factoryPrice).toLocaleString();
    sidebarFinalPriceDisplay.className = `text-4xl font-black tracking-tighter transition-colors duration-300 ${hasInput && !isApproved ? 'text-red-400' : 'text-blue-400'}`;

    if (hasInput) {
        statusBadgeContainer.classList.remove('hidden');
        statusText.innerText = isApproved ? 'APPROVE' : 'REJECT – BELOW FACTORY';
        statusBadge.className = `px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm ${isApproved ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`;
        statusPulse.className = `w-2 h-2 rounded-full animate-pulse ${isApproved ? 'bg-emerald-500' : 'bg-red-500'}`;
        commercialStatusDisplay.innerText = isApproved ? 'APPROVE' : 'REJECT – BELOW FACTORY';
        commercialStatusDisplay.className = `font-bold uppercase tracking-widest ${isApproved ? 'text-emerald-400' : 'text-red-500'}`;
        progressBar.style.width = `${Math.min(100, (res.grossPrice / res.factoryPrice) * 100)}%`;
        progressBar.className = `h-full transition-all duration-1000 ${isApproved ? 'bg-emerald-500' : 'bg-red-500'}`;
    } else {
        statusBadgeContainer.classList.add('hidden');
        commercialStatusDisplay.innerText = '—';
        commercialStatusDisplay.className = 'font-bold';
        progressBar.style.width = '0%';
    }
}

// EVENTS
materialInput.addEventListener('input', e => { state.materialCost = Math.max(0, Number(e.target.value)); update(); });
document.getElementById('resetBtn').onclick = () => { state = { ...DEFAULTS }; materialInput.value = ''; createButtonGroups(); update(); };

// INIT
window.onload = () => { lucide.createIcons(); createButtonGroups(); update(); };
