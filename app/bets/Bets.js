// Betting Page JavaScript Logic

// Mock betting data
const bettingHistory = [
    {
        id: 1,
        event: "World Wrestling Championships 2025",
        match: "David Taylor vs. Hassan Yazdani",
        bet: "David Taylor to win",
        weight: "86kg Final",
        amount: 50,
        odds: "1.85",
        potential: 92.50,
        status: "won",
        date: "2025-01-28",
        result: "Won $42.50"
    },
    {
        id: 2,
        event: "European Championships",
        match: "Kyle Dake vs. Bajrang Punia",
        bet: "Match to go to overtime",
        weight: "65kg Semifinal",
        amount: 25,
        odds: "3.20",
        potential: 80,
        status: "lost",
        date: "2025-01-25",
        result: "Lost $25.00"
    },
    {
        id: 3,
        event: "Pan American Championships",
        match: "Gable Steveson vs. Geno Petriashvili",
        bet: "Geno Petriashvili to win",
        weight: "125kg Championship",
        amount: 100,
        odds: "1.75",
        potential: 175,
        status: "pending",
        date: "2025-02-01",
        result: "Pending"
    },
    {
        id: 4,
        event: "Asian Championships",
        match: "Takuto Otoguro vs. Yuki Takahashi",
        bet: "Takuto Otoguro to win",
        weight: "65kg Final",
        amount: 75,
        odds: "2.10",
        potential: 157.50,
        status: "won",
        date: "2025-01-20",
        result: "Won $82.50"
    },
    {
        id: 5,
        event: "Continental Cup",
        match: "Jordan Burroughs vs. Frank Chamizo",
        bet: "Match total points over 8.5",
        weight: "74kg",
        amount: 30,
        odds: "2.45",
        potential: 73.50,
        status: "lost",
        date: "2025-01-15",
        result: "Lost $30.00"
    }
];

// State management
let currentTab = 'history';
let filterStatus = 'all';
let searchTerm = '';

// DOM elements
const historyTab = document.getElementById('history-tab');
const currentTab_el = document.getElementById('current-tab');
const filtersSection = document.getElementById('filters-section');
const searchInput = document.getElementById('search-input');
const statusFilter = document.getElementById('status-filter');
const historyContent = document.getElementById('history-content');
const currentContent = document.getElementById('current-content');
const emptyState = document.getElementById('empty-state');

// Calculate statistics
function calculateStats() {
    const currentBets = bettingHistory.filter(bet => bet.status === 'pending');
    const wonBets = bettingHistory.filter(bet => bet.status === 'won');
    const lostBets = bettingHistory.filter(bet => bet.status === 'lost');
    
    const stats = {
        totalBets: bettingHistory.length,
        wonBets: wonBets.length,
        lostBets: lostBets.length,
        pendingBets: currentBets.length,
        totalWagered: bettingHistory.reduce((sum, bet) => sum + bet.amount, 0),
        totalWon: wonBets.reduce((sum, bet) => sum + (bet.potential - bet.amount), 0),
        totalLost: lostBets.reduce((sum, bet) => sum + bet.amount, 0)
    };

    const winRate = stats.totalBets > 0 ? 
        ((stats.wonBets / (stats.wonBets + stats.lostBets)) * 100).toFixed(1) : 0;
    const netProfit = stats.totalWon - stats.totalLost;

    return { ...stats, winRate, netProfit };
}

// Update statistics display
function updateStatsDisplay() {
    const stats = calculateStats();
    
    document.getElementById('total-bets').textContent = stats.totalBets;
    document.getElementById('win-rate').textContent = `${stats.winRate}%`;
    document.getElementById('total-wagered').textContent = `$${stats.totalWagered}`;
    document.getElementById('pending-bets').textContent = stats.pendingBets;
    document.getElementById('current-count').textContent = stats.pendingBets;
    
    const netProfitEl = document.getElementById('net-profit');
    const profitLabelEl = document.getElementById('profit-label');
    
    netProfitEl.textContent = `${stats.netProfit >= 0 ? '+' : ''}$${stats.netProfit.toFixed(2)}`;
    netProfitEl.className = `text-2xl font-bold ${stats.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`;
    profitLabelEl.textContent = `Net ${stats.netProfit >= 0 ? 'Profit' : 'Loss'}`;
    profitLabelEl.className = `text-sm ${stats.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`;
}

// Get status icon HTML
function getStatusIcon(status) {
    const icons = {
        won: '<i data-lucide="check-circle" class="w-5 h-5 text-green-500"></i>',
        lost: '<i data-lucide="x-circle" class="w-5 h-5 text-red-500"></i>',
        pending: '<i data-lucide="clock" class="w-5 h-5 text-yellow-500"></i>'
    };
    return icons[status] || '';
}

// Get status CSS classes
function getStatusClasses(status) {
    const classes = {
        won: 'status-won',
        lost: 'status-lost',
        pending: 'status-pending'
    };
    return classes[status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';
}

// Create bet card HTML
function createBetCard(bet, isPending = false) {
    const statusIcon = getStatusIcon(bet.status);
    const statusClasses = getStatusClasses(bet.status);
    const cardClasses = isPending ? 
        'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg p-6 border border-yellow-500/20 pulse-glow' :
        'bg-slate-700/30 rounded-lg p-6 border border-slate-600 hover:border-slate-500 transition-colors card-hover';

    return `
        <div class="${cardClasses}">
            <div class="flex items-start justify-between">
                <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                        ${statusIcon}
                        <h3 class="text-white font-semibold">${bet.event}</h3>
                        <span class="px-2 py-1 rounded-full text-xs font-medium border ${statusClasses}">
                            ${bet.status.charAt(0).toUpperCase() + bet.status.slice(1)}
                        </span>
                        ${isPending ? '<span class="px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">Live</span>' : ''}
                    </div>
                    <p class="text-slate-300 mb-1">${bet.match} - ${bet.weight}</p>
                    <p class="text-slate-400 text-sm mb-3">${bet.bet}</p>
                    <div class="flex items-center gap-4 text-sm">
                        <span class="text-slate-400">
                            <i data-lucide="calendar" class="w-4 h-4 inline mr-1"></i>
                            ${new Date(bet.date).toLocaleDateString()}
                        </span>
                        <span class="text-white">${isPending ? 'Wagered' : 'Bet'}: $${bet.amount}</span>
                        <span class="text-slate-400">Odds: ${bet.odds}</span>
                        ${bet.status === 'pending' ? 
                            `<span class="text-yellow-400">Potential Win: $${bet.potential.toFixed(2)}</span>` : 
                            ''
                        }
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-lg font-bold ${
                        bet.status === 'won' ? 'text-green-400' :
                        bet.status === 'lost' ? 'text-red-400' :
                        'text-yellow-400'
                    }">
                        ${bet.result}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Filter betting history
function filterBettingHistory() {
    return bettingHistory.filter(bet => {
        const matchesStatus = filterStatus === 'all' || bet.status === filterStatus;
        const matchesSearch = searchTerm === '' || 
            bet.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bet.match.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bet.bet.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });
}

// Render betting history
function renderBettingHistory() {
    const filteredHistory = filterBettingHistory();
    
    if (filteredHistory.length === 0) {
        historyContent.innerHTML = `
            <div class="text-center py-12">
                <i data-lucide="dollar-sign" class="w-16 h-16 text-slate-600 mx-auto mb-4"></i>
                <p class="text-slate-400 text-lg">No bets found</p>
                <p class="text-slate-500">Try adjusting your search or filters</p>
            </div>
        `;
    } else {
        historyContent.innerHTML = filteredHistory.map(bet => createBetCard(bet)).join('');
    }
    
    // Re-initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Render current bets
function renderCurrentBets() {
    const currentBets = bettingHistory.filter(bet => bet.status === 'pending');
    
    if (currentBets.length === 0) {
        currentContent.innerHTML = `
            <div class="text-center py-12">
                <i data-lucide="clock" class="w-16 h-16 text-slate-600 mx-auto mb-4"></i>
                <p class="text-slate-400 text-lg">No pending bets</p>
                <p class="text-slate-500">Place a bet to see it here</p>
            </div>
        `;
    } else {
        currentContent.innerHTML = currentBets.map(bet => createBetCard(bet, true)).join('');
    }
    
    // Re-initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Switch tabs
function switchTab(tab) {
    currentTab = tab;
    
    // Update tab styles
    if (tab === 'history') {
        historyTab.className = 'px-6 py-4 font-medium transition-colors tab-active';
        currentTab_el.className = 'px-6 py-4 font-medium transition-colors tab-inactive';
        filtersSection.classList.remove('hidden');
        historyContent.classList.remove('hidden');
        currentContent.classList.add('hidden');
        renderBettingHistory();
    } else {
        historyTab.className = 'px-6 py-4 font-medium transition-colors tab-inactive';
        currentTab_el.className = 'px-6 py-4 font-medium transition-colors tab-active';
        filtersSection.classList.add('hidden');
        historyContent.classList.add('hidden');
        currentContent.classList.remove('hidden');
        renderCurrentBets();
    }
}

// Event listeners
function initializeEventListeners() {
    historyTab.addEventListener('click', () => switchTab('history'));
    currentTab_el.addEventListener('click', () => switchTab('current'));
    
    searchInput.addEventListener('input', (e) => {
        searchTerm = e.target.value;
        if (currentTab === 'history') {
            renderBettingHistory();
        }
    });
    
    statusFilter.addEventListener('change', (e) => {
        filterStatus = e.target.value;
        if (currentTab === 'history') {
            renderBettingHistory();
        }
    });
}

// Initialize the page
function initializePage() {
    updateStatsDisplay();
    switchTab('history');
    initializeEventListeners();
    
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Run when DOM is loaded
document.addEventListener('DOMContentLoaded', initializePage);

// Export functions for potential use in other modules
window.BettingPage = {
    calculateStats,
    updateStatsDisplay,
    renderBettingHistory,
    renderCurrentBets,
    switchTab,
    bettingHistory
};