let podsData = [];
let servicesData = [];
let eventsData = [];

document.addEventListener('DOMContentLoaded', () => {
    initializeTabs();
    initializeSearch();
    loadAllData();
    
    setInterval(() => {
        loadAllData();
    }, 60000);
    
    document.getElementById('refresh-btn').addEventListener('click', () => {
        loadAllData();
    });
});

function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.dataset.tab;
            
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });
}

function initializeSearch() {
    document.getElementById('pods-search').addEventListener('input', (e) => {
        filterPods(e.target.value);
    });
    
    document.getElementById('services-search').addEventListener('input', (e) => {
        filterServices(e.target.value);
    });
    
    document.getElementById('events-search').addEventListener('input', (e) => {
        filterEvents(e.target.value);
    });
}

async function loadAllData() {
    await loadPods();
    await loadServices();
    await loadEvents();
}

async function loadPods() {
    const loading = document.getElementById('pods-loading');
    const error = document.getElementById('pods-error');
    const table = document.getElementById('pods-table');
    
    loading.style.display = 'block';
    error.classList.add('hidden');
    table.classList.add('hidden');
    
    try {
        const response = await fetch('/pods');
        const data = await response.json();
        
        if (!response.ok || data.error) {
            const errorMsg = data.detail?.message || data.detail || data.error || JSON.stringify(data);
            throw new Error(errorMsg);
        }
        
        podsData = data;
        renderPods(data);
        
        loading.style.display = 'none';
        table.classList.remove('hidden');
    } catch (err) {
        loading.style.display = 'none';
        error.textContent = err.message;
        error.classList.remove('hidden');
    }
}

function renderPods(pods) {
    const tbody = document.getElementById('pods-tbody');
    const count = document.getElementById('pods-count');
    
    tbody.innerHTML = '';
    
    if (!Array.isArray(pods) || pods.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 40px;">No pods found</td></tr>';
        count.textContent = 'No pods';
        return;
    }
    
    pods.forEach(pod => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><span class="namespace-badge">${escapeHtml(pod.namespace)}</span></td>
            <td><strong>${escapeHtml(pod.name)}</strong></td>
            <td><code>${escapeHtml(pod.pod_ip || 'N/A')}</code></td>
        `;
        tbody.appendChild(row);
    });
    
    count.textContent = `Total: ${pods.length} pod${pods.length !== 1 ? 's' : ''}`;
}

function filterPods(query) {
    const filtered = podsData.filter(pod => {
        const searchStr = `${pod.name} ${pod.namespace} ${pod.pod_ip}`.toLowerCase();
        return searchStr.includes(query.toLowerCase());
    });
    renderPods(filtered);
}

async function loadServices() {
    const loading = document.getElementById('services-loading');
    const error = document.getElementById('services-error');
    const table = document.getElementById('services-table');
    
    loading.style.display = 'block';
    error.classList.add('hidden');
    table.classList.add('hidden');
    
    try {
        const response = await fetch('/services');
        const data = await response.json();
        
        if (!response.ok || data.error) {
            const errorMsg = data.detail?.message || data.detail || data.error || JSON.stringify(data);
            throw new Error(errorMsg);
        }
        
        servicesData = data;
        renderServices(data);
        
        loading.style.display = 'none';
        table.classList.remove('hidden');
    } catch (err) {
        loading.style.display = 'none';
        error.textContent = err.message;
        error.classList.remove('hidden');
    }
}

function renderServices(services) {
    const tbody = document.getElementById('services-tbody');
    const count = document.getElementById('services-count');
    
    tbody.innerHTML = '';
    
    if (!Array.isArray(services) || services.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px;">No services found</td></tr>';
        count.textContent = 'No services';
        return;
    }
    
    services.forEach(svc => {
        const ports = svc.ports || [];
        const selector = svc.selector || {};
        
        const portsHtml = ports.length > 0 
            ? `<div class="port-list">${ports.map(p => 
                `<span class="port-item">${p.port}:${p.target_port}/${p.protocol}</span>`
              ).join('')}</div>`
            : '<span style="color: #9ca3af;">None</span>';
        
        const selectorHtml = Object.keys(selector).length > 0
            ? `<div class="selector-list">${Object.entries(selector).map(([k, v]) => 
                `${k}=${v}`
              ).join('<br>')}</div>`
            : '<span style="color: #9ca3af;">None</span>';
        
        const typeClass = svc.type.toLowerCase().replace(/\s+/g, '');
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><span class="namespace-badge">${escapeHtml(svc.namespace)}</span></td>
            <td><strong>${escapeHtml(svc.name)}</strong></td>
            <td><span class="badge badge-${typeClass}">${escapeHtml(svc.type)}</span></td>
            <td><code>${escapeHtml(svc.cluster_ip)}</code></td>
            <td>${portsHtml}</td>
            <td>${selectorHtml}</td>
        `;
        tbody.appendChild(row);
    });
    
    count.textContent = `Total: ${services.length} service${services.length !== 1 ? 's' : ''}`;
}

function filterServices(query) {
    const filtered = servicesData.filter(svc => {
        const searchStr = `${svc.name} ${svc.namespace} ${svc.type} ${svc.cluster_ip}`.toLowerCase();
        return searchStr.includes(query.toLowerCase());
    });
    renderServices(filtered);
}

async function loadEvents() {
    const loading = document.getElementById('events-loading');
    const error = document.getElementById('events-error');
    const table = document.getElementById('events-table');
    
    loading.style.display = 'block';
    error.classList.add('hidden');
    table.classList.add('hidden');
    
    try {
        const response = await fetch('/events');
        const data = await response.json();
        
        if (!response.ok || data.error) {
            const errorMsg = data.detail?.message || data.detail || data.error || JSON.stringify(data);
            throw new Error(errorMsg);
        }
        
        eventsData = data;
        renderEvents(data);
        
        loading.style.display = 'none';
        table.classList.remove('hidden');
    } catch (err) {
        loading.style.display = 'none';
        error.textContent = err.message;
        error.classList.remove('hidden');
    }
}

function renderEvents(events) {
    const tbody = document.getElementById('events-tbody');
    const count = document.getElementById('events-count');
    
    tbody.innerHTML = '';
    
    if (!Array.isArray(events) || events.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px;">No events found</td></tr>';
        count.textContent = 'No events';
        return;
    }
    
    events.forEach(event => {
        const obj = event.involved_object || {};
        const lastSeen = event.last_timestamp || event.first_timestamp || 'Unknown';
        
        const typeClass = event.type.toLowerCase() === 'warning' ? 'badge-warning' : 'badge-normal';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><span class="badge ${typeClass}">${escapeHtml(event.type)}</span></td>
            <td><span class="namespace-badge">${escapeHtml(event.namespace)}</span></td>
            <td><strong>${escapeHtml(event.reason)}</strong></td>
            <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis;" title="${escapeHtml(event.message)}">
                ${escapeHtml(event.message || 'N/A')}
            </td>
            <td>
                <div class="object-info">
                    <span class="object-kind">${escapeHtml(obj.kind || 'N/A')}</span><br>
                    <small>${escapeHtml(obj.name || 'N/A')}</small>
                </div>
            </td>
            <td><small>${formatTimestamp(lastSeen)}</small></td>
        `;
        tbody.appendChild(row);
    });
    
    count.textContent = `Total: ${events.length} event${events.length !== 1 ? 's' : ''}`;
}

function filterEvents(query) {
    const filtered = eventsData.filter(event => {
        const obj = event.involved_object || {};
        const searchStr = `${event.name} ${event.namespace} ${event.reason} ${event.message} ${obj.kind} ${obj.name}`.toLowerCase();
        return searchStr.includes(query.toLowerCase());
    });
    renderEvents(filtered);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatTimestamp(timestamp) {
    if (!timestamp || timestamp === 'None') return 'N/A';
    try {
        const date = new Date(timestamp);
        return date.toLocaleString();
    } catch {
        return timestamp;
    }
}

