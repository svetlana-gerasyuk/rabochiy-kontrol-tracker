/* Рабочий Контроль — приложение (UI, роутинг, события) */

/* ========== Иконки (inline SVG) ========== */
const ICONS = {
  grid: '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
  users: '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  building: '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  clock: '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  trend: '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
  card: '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>',
  chart: '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>'
};

/* ========== Роли и навигация ========== */
const ROLES = {
  worker: { label: 'Рабочий', userEmployeeId: 'emp_2' },
  foreman: { label: 'Бригадир', userEmployeeId: 'emp_1' },
  manager: { label: 'Руководитель', userEmployeeId: null },
  accountant: { label: 'Бухгалтер', userEmployeeId: null }
};

const NAV_GROUPS = [
  { title: 'Панель', items: ['dashboard'] },
  { title: 'Операции', items: ['employees', 'objects', 'shifts'] },
  { title: 'Финансы', items: ['advances', 'payments'] },
  { title: 'Аналитика', items: ['reports'] }
];

const NAV = {
  dashboard: { label: 'Дашборд', icon: 'grid' },
  employees: { label: 'Сотрудники', icon: 'users' },
  objects: { label: 'Объекты', icon: 'building' },
  shifts: { label: 'Рабочее время', icon: 'clock' },
  advances: { label: 'Авансы', icon: 'trend' },
  payments: { label: 'Выплаты', icon: 'card' },
  reports: { label: 'Отчёты', icon: 'chart' }
};

const ROLE_SECTIONS = {
  worker: ['dashboard', 'shifts', 'advances'],
  foreman: ['dashboard', 'employees', 'objects', 'shifts', 'advances'],
  manager: ['dashboard', 'employees', 'objects', 'shifts', 'advances', 'payments', 'reports'],
  accountant: ['dashboard', 'employees', 'advances', 'payments', 'reports']
};

/* ========== Утилиты ========== */

function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function pad(n) { return String(n).padStart(2, '0'); }

function fmtMoney(n) {
  return Math.round(n).toLocaleString('ru-RU') + ' ₽';
}

function fmtMoneyShort(n) {
  const v = Math.round(n);
  if (Math.abs(v) >= 1000000) return (v / 1000000).toFixed(1).replace('.', ',') + ' млн ₽';
  if (Math.abs(v) >= 1000) return (v / 1000).toFixed(1).replace('.', ',') + ' тыс ₽';
  return v + ' ₽';
}

function fmtDate(dstr) {
  if (!dstr) return '—';
  const d = new Date(dstr);
  if (isNaN(d)) return dstr;
  return pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + '.' + d.getFullYear();
}

function fmtDateTime(dstr) {
  if (!dstr) return '—';
  const d = new Date(dstr);
  if (isNaN(d)) return dstr;
  return pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
}

function sortBy(arr, fn) {
  return [...arr].sort((a, b) => {
    const x = fn(a), y = fn(b);
    if (x < y) return -1;
    if (x > y) return 1;
    return 0;
  });
}

function balanceClass(b) { return b < 0 ? 'amount-negative' : 'amount-positive'; }

/* ========== Приложение ========== */

const App = {
  state: {
    role: 'manager',
    section: 'dashboard'
  },

  /* ---------- Инициализация ---------- */

  init() {
    Store.init();
    const roleParam = new URLSearchParams(location.search).get('role');
    if (roleParam && ROLES[roleParam]) {
      this.state.role = roleParam;
      localStorage.setItem('rk_role', roleParam);
    } else {
      const savedRole = localStorage.getItem('rk_role');
      if (savedRole && ROLES[savedRole]) this.state.role = savedRole;
    }
    document.getElementById('roleSelect').value = this.state.role;

    this.bindEvents();
    this.route();
    window.addEventListener('hashchange', () => this.route());
  },

  currentUser() {
    const r = ROLES[this.state.role];
    return r && r.userEmployeeId ? Store.findEmployee(r.userEmployeeId) : null;
  },

  visibleEmployees() {
    const data = Store.get();
    const user = this.currentUser();
    if (!user) return data.employees;
    return data.employees.filter(e => e.brigadeId === user.brigadeId);
  },

  ownBrigadeId() {
    const user = this.currentUser();
    return user ? user.brigadeId : null;
  },

  /* ---------- Роутинг ---------- */

  route() {
    const hash = location.hash.replace(/^#\/?/, '');
    const section = NAV[hash] ? hash : 'dashboard';
    this.state.section = section;
    this.renderShell();
    this.render();
  },

  navigate(section) {
    location.hash = '#/' + section;
  },

  /* ---------- Оболочка (навигация, шапка) ---------- */

  renderShell() {
    this.renderNav();
    this.renderTopbar();
  },

  renderNav() {
    const allowed = ROLE_SECTIONS[this.state.role] || [];
    const nav = document.getElementById('sidebarNav');
    let html = '';
    NAV_GROUPS.forEach(group => {
      const items = group.items.filter(id => allowed.includes(id));
      if (!items.length) return;
      html += '<div class="nav-group-title">' + esc(group.title) + '</div>';
      items.forEach(id => {
        const n = NAV[id];
        html += '<button class="nav-item ' + (id === this.state.section ? 'active' : '') + '" data-action="nav" data-nav="' + id + '">' + ICONS[n.icon] + '<span>' + esc(n.label) + '</span></button>';
      });
    });
    nav.innerHTML = html;
  },

  renderTopbar() {
    const r = ROLES[this.state.role];
    const user = this.currentUser();
    const bc = document.getElementById('topbarBreadcrumb');
    bc.innerHTML = esc(NAV[this.state.section].label);

    const info = document.getElementById('topbarUser');
    if (user) {
      const initials = user.name.split(' ').slice(0, 2).map(w => w[0]).join('');
      info.innerHTML = '<div class="user-avatar">' + esc(initials) + '</div><div class="user-info"><strong>' + esc(user.name.split(' ').slice(1).join(' ')) + '</strong><span>Демо-роль: ' + esc(r.label) + '</span></div>';
    } else {
      info.innerHTML = '<div class="user-avatar">' + esc(r.label[0]) + '</div><div class="user-info"><strong>Демо-режим</strong><span>Роль: ' + esc(r.label) + '</span></div>';
    }
  },

  /* ---------- Основной рендер ---------- */

  render() {
    const section = this.state.section;
    const map = {
      dashboard: () => this.renderDashboard(),
      employees: () => this.renderEmployees(),
      objects: () => this.renderObjects(),
      shifts: () => this.renderShifts(),
      advances: () => this.renderAdvances(),
      payments: () => this.renderPayments(),
      reports: () => this.renderReports()
    };
    const content = document.getElementById('content');
    content.innerHTML = map[section] ? map[section]() : this.renderDashboard();
  },

  pageHeader(title, subtitle, actionsHtml) {
    return '<div class="page-header"><div><h2 class="page-title">' + esc(title) + '</h2><p class="page-subtitle">' + esc(subtitle) + '</p></div>' + (actionsHtml || '') + '</div>';
  },

  statCard(icon, color, label, value, sub, accent) {
    return '<div class="stat-card"><div class="stat-icon ' + color + '">' + (ICONS[icon] || '') + '</div><div class="stat-label">' + label + '</div><div class="stat-value ' + (accent || '') + '">' + value + '</div>' + (sub ? '<div class="stat-sub">' + sub + '</div>' : '') + '</div>';
  },

  /* ================= ДАШБОРД ================= */

  renderDashboard() {
    const role = this.state.role;
    if (role === 'worker') return this.dashboardWorker();
    if (role === 'foreman') return this.dashboardForeman();
    if (role === 'accountant') return this.dashboardAccountant();
    return this.dashboardManager();
  },

  dashboardManager() {
    const data = Store.get();
    const today = todayStr2();
    const stats = data.employees.map(e => ({ e, s: Store.getEmployeeStats(e.id) }));

    const totalEmployees = data.employees.length;
    const workingToday = new Set(data.shifts.filter(s => s.date === today).map(s => s.employeeId)).size;
    const activeObjects = data.objects.filter(o => o.status === 'active').length;
    const pendingAdvances = data.advances.filter(a => a.status === 'pending').length;
    const totalEarned = stats.reduce((s, x) => s + x.s.earned, 0);
    const totalBalance = stats.reduce((s, x) => s + Math.max(x.s.balance, 0), 0);

    const cards = this.statCard('users', 'primary', 'Всего сотрудников', totalEmployees, 'в ' + data.brigades.length + ' бригадах') +
      this.statCard('clock', 'success', 'Сегодня на смене', workingToday, 'за ' + fmtDate(today)) +
      this.statCard('building', 'info', 'Активные объекты', activeObjects, 'из ' + data.objects.length) +
      this.statCard('trend', 'warning', 'Запросы на аванс', pendingAdvances, 'ожидают решения') +
      this.statCard('card', 'primary', 'Начислено', fmtMoney(totalEarned), 'за 4 рабочих дня') +
      this.statCard('trend', 'success', 'Остаток к выплате', fmtMoney(totalBalance), 'по всем сотрудникам');

    const workingNow = data.shifts.filter(s => !s.endTime)
      .map(s => ({ s, e: Store.findEmployee(s.employeeId), o: Store.findObject(s.objectId) }))
      .filter(x => x.e);
    const recentAdvances = sortBy(
      data.advances.map(a => ({ a, e: Store.findEmployee(a.employeeId) })),
      x => -new Date(x.a.createdAt).getTime()
    ).slice(0, 4);

    return this.pageHeader('Дашборд', 'Сводка по компании на сегодня')
      + '<div class="stats-grid">' + cards + '</div>'
      + '<div class="grid-2-1">'
      + '<div class="card"><div class="card-header"><h3 class="card-title">Последние события</h3></div><div class="card-body">' + this.recentEvents(data, null, 10) + '</div></div>'
      + '<div>'
      + '<div class="card" style="margin-bottom:20px"><div class="card-header"><h3 class="card-title">Сейчас на смене</h3></div><div class="card-body">' + this.workingNowList(workingNow) + '</div></div>'
      + '<div class="card"><div class="card-header"><h3 class="card-title">Последние запросы на аванс</h3></div><div class="card-body">' + this.advanceList(recentAdvances) + '</div></div>'
      + '</div></div>';
  },

  dashboardForeman() {
    const data = Store.get();
    const brigadeId = this.ownBrigadeId();
    const brig = Store.findBrigade(brigadeId);
    const brigadeEmps = data.employees.filter(e => e.brigadeId === brigadeId);
    const today = todayStr2();
    const brigadeShifts = data.shifts.filter(s => s.date === today && brigadeEmps.some(e => e.id === s.employeeId));

    const workingToday = new Set(brigadeShifts.map(s => s.employeeId)).size;
    const activeObjects = data.objects.filter(o => o.brigadeId === brigadeId && o.status === 'active').length;
    const pendingAdvances = data.advances.filter(a => a.status === 'pending' && brigadeEmps.some(e => e.id === a.employeeId)).length;
    const brigStats = brigadeEmps.map(e => Store.getEmployeeStats(e.id));
    const totalEarned = brigStats.reduce((s, x) => s + x.earned, 0);
    const totalBalance = brigStats.reduce((s, x) => s + Math.max(x.balance, 0), 0);

    const cards = this.statCard('users', 'primary', 'Сотрудников в бригаде', brigadeEmps.length, esc(brig ? brig.name : '')) +
      this.statCard('clock', 'success', 'Сегодня на смене', workingToday, 'из бригады') +
      this.statCard('building', 'info', 'Активные объекты', activeObjects, 'ваши') +
      this.statCard('trend', 'warning', 'Запросы на аванс', pendingAdvances, 'в бригаде') +
      this.statCard('card', 'primary', 'Начислено', fmtMoney(totalEarned), 'по бригаде') +
      this.statCard('trend', 'success', 'Остаток к выплате', fmtMoney(totalBalance), 'по бригаде');

    const workingNow = data.shifts.filter(s => !s.endTime && brigadeEmps.some(e => e.id === s.employeeId))
      .map(s => ({ s, e: Store.findEmployee(s.employeeId), o: Store.findObject(s.objectId) }));
    const recentAdvances = sortBy(
      data.advances.filter(a => brigadeEmps.some(e => e.id === a.employeeId)).map(a => ({ a, e: Store.findEmployee(a.employeeId) })),
      x => -new Date(x.a.createdAt).getTime()
    ).slice(0, 4);

    return this.pageHeader('Дашборд', 'Обзор по бригаде «' + (!brig ? '' : brig.name.replace('Бригада ', '')) + '»')
      + '<div class="stats-grid">' + cards + '</div>'
      + '<div class="grid-2-1">'
      + '<div class="card"><div class="card-header"><h3 class="card-title">Последние события бригады</h3></div><div class="card-body">' + this.recentEvents(data, brigadeId, 10) + '</div></div>'
      + '<div>'
      + '<div class="card" style="margin-bottom:20px"><div class="card-header"><h3 class="card-title">Сейчас на смене</h3></div><div class="card-body">' + this.workingNowList(workingNow) + '</div></div>'
      + '<div class="card"><div class="card-header"><h3 class="card-title">Последние запросы на аванс</h3></div><div class="card-body">' + this.advanceList(recentAdvances) + '</div></div>'
      + '</div></div>';
  },

  dashboardAccountant() {
    const data = Store.get();
    const stats = data.employees.map(e => Store.getEmployeeStats(e.id));
    const totalEarned = stats.reduce((s, x) => s + x.earned, 0);
    const totalPaid = data.payments.reduce((s, p) => s + p.amount, 0);
    const totalAdvances = data.employees.reduce((s, e) => s + this.employeeAdvancesSum(e.id), 0);
    const totalBalance = stats.reduce((s, x) => s + Math.max(x.balance, 0), 0);
    const employeesWithDebt = stats.filter(x => x.balance < 0).length;

    const cards = this.statCard('card', 'primary', 'Начислено', fmtMoney(totalEarned), 'по всем сотрудникам') +
      this.statCard('card', 'success', 'Выплачено', fmtMoney(totalPaid), 'все выплаты') +
      this.statCard('trend', 'info', 'Одобрено авансами', fmtMoney(totalAdvances), 'к удержанию') +
      this.statCard('trend', 'success', 'Остаток к выплате', fmtMoney(totalBalance), 'положительный остаток') +
      this.statCard('users', 'warning', 'Сотрудников с долгом', employeesWithDebt, 'остаток меньше нуля') +
      this.statCard('users', 'gray', 'Всего сотрудников', data.employees.length, 'в штате');

    const recentPayments = sortBy(
      data.payments.map(p => ({ p, e: Store.findEmployee(p.employeeId) })),
      x => -new Date(x.p.date).getTime()
    ).slice(0, 6);

    const recentAdvances = sortBy(
      data.advances.map(a => ({ a, e: Store.findEmployee(a.employeeId) })),
      x => -new Date(x.a.createdAt).getTime()
    ).slice(0, 6);

    return this.pageHeader('Дашборд', 'Финансовая сводка компании')
      + '<div class="stats-grid">' + cards + '</div>'
      + '<div class="grid-2">'
      + '<div class="card"><div class="card-header"><h3 class="card-title">Последние выплаты</h3></div><div class="card-body">' + this.paymentsMini(recentPayments) + '</div></div>'
      + '<div class="card"><div class="card-header"><h3 class="card-title">Последние авансы</h3></div><div class="card-body">' + this.advanceList(recentAdvances) + '</div></div>'
      + '</div>';
  },

  dashboardWorker() {
    const user = this.currentUser();
    if (!user) return this.pageHeader('Дашборд', 'Сотрудник не найден');
    const s = Store.getEmployeeStats(user.id);
    const active = Store.getActiveShift(user.id);
    const data = Store.get();
    const myShifts = sortBy(data.shifts.filter(x => x.employeeId === user.id), x => -new Date(x.date + 'T' + (x.startTime || '00:00')).getTime()).slice(0, 5);
    const myAdvances = sortBy(data.advances.filter(a => a.employeeId === user.id), x => -new Date(x.createdAt).getTime());

    const cards = this.statCard('clock', 'success', 'Мои часы', s.totalHours + ' ч', 'за последние дни') +
      this.statCard('card', 'primary', 'Начислено', fmtMoney(s.earned), 'часы × ставка') +
      this.statCard('trend', 'info', 'Авансы (одобрено)', fmtMoney(s.advancesTaken), 'учтены в остатке') +
      this.statCard('trend', 'warning', 'Остаток к выплате', fmtMoney(s.balance), fmtMoney(s.paidTotal) + ' уже выплачено');

    return this.pageHeader('Дашборд', 'Личный кабинет: ' + user.name)
      + '<div class="stats-grid">' + cards + '</div>'
      + this.shiftControlPanel(user, active)
      + '<div class="grid-2">'
      + '<div class="card"><div class="card-header"><h3 class="card-title">Мои смены</h3></div><div class="card-body">' + this.myShiftsTable(myShifts) + '</div></div>'
      + '<div class="card"><div class="card-header"><h3 class="card-title">Мои запросы на аванс <button class="btn btn-primary btn-sm" data-action="open-advance-form">+ Новый</button></h3></div><div class="card-body">' + this.myAdvancesList(myAdvances) + '</div></div>'
      + '</div>';
  },

  /* ---------- Блоки дашборда ---------- */

  recentEvents(data, brigadeId, limit) {
    const evs = [];
    const inScope = (id) => !brigadeId || Store.findEmployee(id).brigadeId === brigadeId;

    data.shifts.forEach(s => {
      if (!inScope(s.employeeId)) return;
      const e = Store.findEmployee(s.employeeId);
      const o = Store.findObject(s.objectId);
      const t = new Date(s.date + 'T' + s.startTime);
      if (s.endTime) {
        evs.push({ t, color: 'info', text: (e ? e.name : '—') + ' завершил(а) смену на объекте «' + (o ? o.name : '—') + '» — ' + (s.hours || 0) + ' ч' });
      } else {
        evs.push({ t, color: 'success', text: (e ? e.name : '—') + ' начал(а) смену на объекте «' + (o ? o.name : '—') + '»' });
      }
    });
    data.advances.forEach(a => {
      if (!inScope(a.employeeId)) return;
      const e = Store.findEmployee(a.employeeId);
      const map = { pending: 'warning', approved: 'info', rejected: 'danger', paid: 'success' };
      const t = new Date(a.createdAt);
      evs.push({ t, color: map[a.status] || 'gray', text: 'Запрос на аванс: ' + (e ? e.name : '—') + ' — ' + fmtMoney(a.amount) + ' (' + advStatusLabel(a.status) + ')' });
    });
    data.payments.forEach(p => {
      if (!inScope(p.employeeId)) return;
      const e = Store.findEmployee(p.employeeId);
      evs.push({ t: new Date(p.date), color: 'success', text: 'Выплата: ' + (e ? e.name : '—') + ' — ' + fmtMoney(p.amount) + ' (' + p.type + ')' });
    });

    evs.sort((a, b) => b.t - a.t);
    const list = evs.slice(0, limit);
    if (!list.length) return '<div class="empty-state"><div class="empty-icon">—</div><p>Событий пока нет</p></div>';
    return '<ul class="timeline">' + list.map(x =>
      '<li><span class="timeline-dot ' + x.color + '"></span><span class="timeline-text">' + esc(x.text) + '</span><span class="timeline-time">' + fmtDateTimeShort(x.t) + '</span></li>'
    ).join('') + '</ul>';
  },

  workingNowList(rows) {
    if (!rows.length) return '<div class="empty-state"><div class="empty-icon">—</div><p>Сейчас никто не работает</p></div>';
    return rows.map(x => {
      const hrs = x.s.startTime;
      return '<div style="display:flex;align-items:center;gap:12px;padding:9px 0;border-bottom:1px solid var(--gray-100)">' +
        '<span class="employee-avatar">' + esc(initials(x.e.name)) + '</span>' +
        '<div style="flex:1"><div style="font-weight:500">' + esc(x.e.name) + '</div><div style="font-size:12px;color:var(--text-muted)">' + esc(x.o ? x.o.name : '—') + '</div></div>' +
        '<span class="badge badge-success">с ' + esc(hrs) + '</span></div>';
    }).join('');
  },

  advanceList(rows) {
    if (!rows.length) return '<div class="empty-state"><div class="empty-icon">—</div><p>Запросов нет</p></div>';
    return rows.map(x => '<div style="display:flex;align-items:center;gap:12px;padding:9px 0;border-bottom:1px solid var(--gray-100)">' +
      '<div style="flex:1"><div style="font-weight:500">' + esc(x.e ? x.e.name : '—') + '</div><div style="font-size:12px;color:var(--text-muted)">' + fmtMoney(x.a.amount) + ' &middot; ' + esc(x.a.comment || 'без комментария') + '</div></div>' +
      advBadge(x.a.status) + '</div>').join('');
  },

  paymentsMini(rows) {
    if (!rows.length) return '<div class="empty-state"><div class="empty-icon">—</div><p>Выплат нет</p></div>';
    return rows.map(x => '<div style="display:flex;align-items:center;gap:12px;padding:9px 0;border-bottom:1px solid var(--gray-100)">' +
      '<div style="flex:1"><div style="font-weight:500">' + esc(x.e ? x.e.name : '—') + '</div><div style="font-size:12px;color:var(--text-muted)">' + esc(x.p.type) + ' &middot; ' + fmtDate(x.p.date) + '</div></div>' +
      '<span class="amount amount-positive">' + esc(fmtMoney(x.p.amount)) + '</span></div>').join('');
  },

  shiftControlPanel(user, active) {
    if (active) {
      return '<div class="current-shift-card on"><div class="current-shift-info"><h3>Смена идёт</h3>' +
        '<p>Начало: ' + fmtDate(active.date) + ' в ' + esc(active.startTime) + '. Нажмите «Закончить смену» — длительность рассчитается автоматически.</p></div>' +
        '<button class="btn btn-danger" data-action="end-shift">Закончить смену</button></div>';
    }
    return '<div class="current-shift-card off"><div class="current-shift-info"><h3>Вы не на смене</h3>' +
      '<p>Нажмите «Начать смену», чтобы зафиксировать начало рабочего дня. Объект: ' + esc((Store.findObject(user.currentObjectId) || { name: '—' }).name) + '</p></div>' +
      '<button class="btn btn-success" data-action="start-shift">Начать смену</button></div>';
  },

  /* ================= СОТРУДНИКИ ================= */

  renderEmployees() {
    const role = this.state.role;
    if (role === 'worker') return this.employeeSelf();
    const emps = this.visibleEmployees();
    const rows = emps.map(e => {
      const s = Store.getEmployeeStats(e.id);
      const brig = Store.findBrigade(e.brigadeId);
      const obj = Store.findObject(e.currentObjectId);
      const onShift = !!Store.getActiveShift(e.id);
      const statusBadge = onShift ? '<span class="badge badge-success">Работает</span>' : '<span class="badge badge-gray">Не на смене</span>';
      const balanceCls = s.balance < 0 ? 'amount-negative' : '';
      return '<tr>' +
        '<td><div class="employee-cell"><span class="employee-avatar">' + esc(initials(e.name)) + '</span><div><div class="name">' + esc(e.name) + '</div><div class="sub">' + esc(e.position) + '</div></div></div></td>' +
        '<td>' + esc(brig ? brig.name : '—') + '</td>' +
        '<td>' + fmtMoney(e.hourlyRate) + '/ч</td>' +
        '<td>' + esc(obj ? obj.name : '—') + '</td>' +
        '<td>' + statusBadge + '</td>' +
        '<td class="amount">' + (s.totalHours || 0) + ' ч</td>' +
        '<td class="amount">' + esc(fmtMoney(s.earned)) + '</td>' +
        '<td class="amount ' + balanceCls + '">' + esc(fmtMoney(s.balance)) + '</td>' +
        '<td><button class="btn btn-secondary btn-sm" data-action="open-employee" data-id="' + e.id + '">Открыть</button></td>' +
        '</tr>';
    }).join('');

    const table = '<div class="card"><div class="card-header"><h3 class="card-title">Сотрудники</h3><span class="badge badge-primary">' + emps.length + ' чел.</span></div>' +
      '<div class="card-body table-wrap"><table><thead><tr>' +
      '<th>Сотрудник</th><th>Бригада</th><th>Ставка</th><th>Объект</th><th>Статус</th><th>Часы</th><th>Начислено</th><th>Остаток</th><th></th>' +
      '</tr></thead><tbody>' + (rows || '<tr><td colspan="9"><div class="empty-state"><p>Нет сотрудников</p></div></td></tr>') + '</tbody></table></div></div>';

    return this.pageHeader('Сотрудники', 'Состав команды и финансовые показатели') + table;
  },

  employeeSelf() {
    const user = this.currentUser();
    return this.pageHeader('Мой профиль', 'Ваша учётная карточка')
      + '<div style="max-width:760px">' + this.employeeCard(user.id) + '</div>';
  },

  employeeCard(id) {
    const e = Store.findEmployee(id);
    if (!e) return '<div class="empty-state"><p>Сотрудник не найден</p></div>';
    const s = Store.getEmployeeStats(id);
    const brig = Store.findBrigade(e.brigadeId);
    const obj = Store.findObject(e.currentObjectId);
    const onShift = !!s.activeShift;
    const data = Store.get();
    const myShifts = sortBy(data.shifts.filter(x => x.employeeId === id), x => -new Date(x.date + 'T' + (x.startTime || '00:00')).getTime()).slice(0, 6);
    const myAdv = sortBy(data.advances.filter(a => a.employeeId === id), x => -new Date(x.createdAt).getTime());
    const myPay = sortBy(data.payments.filter(p => p.employeeId === id), x => -new Date(x.date).getTime());

    return '<div class="card"><div class="card-body">' +
      '<div class="hero"><div class="hero-avatar">' + esc(initials(e.name)) + '</div><div><h3>' + esc(e.name) + '</h3><p>' + esc(e.position) + (brig ? ' &middot; ' + esc(brig.name) : '') + '</p></div>' +
      '<div style="margin-left:auto">' + (onShift ? '<span class="badge badge-success">Работает</span>' : '<span class="badge badge-gray">Не на смене</span>') + '</div></div>' +

      '<div class="detail-grid">' +
      '<div class="detail-item"><div class="d-label">Бригада</div><div class="d-value">' + esc(brig ? brig.name : '—') + '</div></div>' +
      '<div class="detail-item"><div class="d-label">Текущий объект</div><div class="d-value">' + esc(obj ? obj.name : '—') + '</div></div>' +
      '<div class="detail-item"><div class="d-label">Ставка за час</div><div class="d-value">' + fmtMoney(e.hourlyRate) + '</div></div>' +
      '<div class="detail-item"><div class="d-label">Телефон</div><div class="d-value">' + esc(e.phone || '—') + '</div></div>' +
      '<div class="detail-item"><div class="d-label">Отработано часов</div><div class="d-value">' + (s.totalHours || 0) + ' ч</div></div>' +
      '<div class="detail-item"><div class="d-label">Смен проведено</div><div class="d-value">' + s.shiftCount + '</div></div>' +
      '</div>' +

      '<hr class="divider">' +
      '<div class="detail-grid">' +
      '<div class="detail-item" style="background:var(--primary-light)"><div class="d-label">Начислено</div><div class="d-value">' + esc(fmtMoney(s.earned)) + '</div></div>' +
      '<div class="detail-item" style="background:var(--info-light)"><div class="d-label">Авансы (одобрено)</div><div class="d-value">' + esc(fmtMoney(s.advancesTaken)) + '</div></div>' +
      '<div class="detail-item" style="background:var(--success-light)"><div class="d-label">Выплачено</div><div class="d-value">' + esc(fmtMoney(s.paidTotal)) + '</div></div>' +
      '<div class="detail-item" style="background:' + (s.balance < 0 ? 'var(--danger-light)' : 'var(--success-light)') + '"><div class="d-label">Остаток к выплате</div><div class="d-value">' + esc(fmtMoney(s.balance)) + '</div></div>' +
      '</div>' +
      this.progress(s) +

      '<hr class="divider">' +
      '<h4 style="font-size:14px;margin-bottom:10px">Последние смены</h4>' + this.myShiftsTable(myShifts, true) +
      '<hr class="divider">' +
      '<div class="grid-2">' +
      '<div><h4 style="font-size:14px;margin-bottom:10px">Запросы на аванс</h4>' + this.myAdvancesList(myAdv, true) + '</div>' +
      '<div><h4 style="font-size:14px;margin-bottom:10px">Выплаты</h4>' + this.paymentsShort(myPay, true) + '</div>' +
      '</div>' +
      '</div></div>';
  },

  progress(s) {
    if (s.earned <= 0) return '';
    const pct = Math.max(0, Math.min(100, Math.round(((s.paidTotal + s.advancesTaken) / s.earned) * 100)));
    return '<div style="margin-top:16px"><div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-muted)"><span>Прогресс расчёта</span><span>выплачено+авансы: ' + pct + '% от начисления</span></div>' +
      '<div class="progress"><div class="progress-bar" style="width:' + pct + '%"></div></div></div>';
  },

  /* ================= ОБЪЕКТЫ ================= */

  renderObjects() {
    const data = Store.get();
    const brigadeId = this.ownBrigadeId();
    const objs = data.objects.filter(o => !brigadeId || o.brigadeId === brigadeId);

    const cards = objs.map(o => {
      const st = Store.getObjectStats(o.id);
      const brig = Store.findBrigade(o.brigadeId);
      const statusBadge = o.status === 'active' ? '<span class="badge badge-success">Активен</span>' : '<span class="badge badge-gray">Завершён</span>';
      return '<div class="card stat-card" style="display:flex;flex-direction:column;gap:10px">' +
        '<div class="stat-icon info">' + ICONS.building + '</div>' +
        '<div style="font-weight:600;font-size:15px;color:var(--gray-800)">' + esc(o.name) + '</div>' +
        '<div style="font-size:12px;color:var(--text-muted)">' + esc(o.address) + '</div>' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:auto">' + statusBadge +
        '<button class="btn btn-secondary btn-sm" data-action="open-object" data-id="' + o.id + '">Открыть</button></div>' +
        '<div style="border-top:1px solid var(--gray-100);padding-top:10px;display:flex;justify-content:space-between;font-size:12px;color:var(--text-muted)">' +
        '<span>' + esc(brig ? brig.name : '—') + '</span><span>Затраты: <b style="color:var(--gray-800)">' + esc(fmtMoneyShort(st.earned)) + '</b></span></div>' +
        '</div>';
    }).join('');

    return this.pageHeader('Объекты', 'Строительные объекты и затраты на оплату труда') +
      '<div class="stats-grid">' + cards + '</div>';
  },

  objectCard(id) {
    const o = Store.findObject(id);
    if (!o) return '<div class="empty-state"><p>Объект не найден</p></div>';
    const st = Store.getObjectStats(id);
    const brig = Store.findBrigade(o.brigadeId);

    const empRows = st.employees.map(e => {
      const es = Store.getEmployeeStats(e.id);
      const onShift = !!Store.getActiveShift(e.id);
      return '<tr><td><div class="employee-cell"><span class="employee-avatar">' + esc(initials(e.name)) + '</span><div><div class="name">' + esc(e.name) + '</div><div class="sub">' + esc(e.position) + '</div></div></div></td>' +
        '<td>' + esc(onShift ? 'На смене' : 'Не на смене') + '</td>' +
        '<td class="amount">' + fmtMoney(e.hourlyRate) + '/ч</td>' +
        '<td class="amount">' + (es.totalHours || 0) + ' ч</td>' +
        '<td class="amount">' + esc(fmtMoney(es.earned)) + '</td></tr>';
    }).join('');

    return '<div class="card"><div class="card-body">' +
      '<div class="hero"><div class="hero-avatar" style="background:linear-gradient(135deg,#3b82f6,#6366f1)">' + ICONS.building.replace('class="nav-icon"', 'style="width:22px;height:22px"') + '</div>' +
      '<div><h3>' + esc(o.name) + '</h3><p>' + esc(o.address) + '</p></div>' +
      '<div style="margin-left:auto">' + (o.status === 'active' ? '<span class="badge badge-success">Активен</span>' : '<span class="badge badge-gray">Завершён</span>') + '</div></div>' +

      '<div class="detail-grid">' +
      '<div class="detail-item"><div class="d-label">Ответственная бригада</div><div class="d-value">' + esc(brig ? brig.name : '—') + '</div></div>' +
      '<div class="detail-item"><div class="d-label">Бригадир</div><div class="d-value">' + esc(brig ? (Store.findEmployee(brig.foremanId) || { name: '—' }).name : '—') + '</div></div>' +
      '<div class="detail-item"><div class="d-label">Сотрудников на объекте</div><div class="d-value">' + st.employeeCount + '</div></div>' +
      '<div class="detail-item"><div class="d-label">Отработано часов</div><div class="d-value">' + st.hours + ' ч</div></div>' +
      '<div class="detail-item" style="background:var(--primary-light)"><div class="d-label">Затраты на оплату труда</div><div class="d-value">' + esc(fmtMoney(st.earned)) + '</div></div>' +
      '<div class="detail-item"><div class="d-label">Начало работ</div><div class="d-value">' + fmtDate(o.createdAt) + '</div></div>' +
      '</div>' +

      '<hr class="divider">' +
      '<h4 style="font-size:14px;margin-bottom:10px">Занятые сотрудники</h4>' +
      '<div class="table-wrap"><table><thead><tr><th>Сотрудник</th><th>Статус</th><th>Ставка</th><th>Часы</th><th>Начислено</th></tr></thead><tbody>' +
      (empRows || '<tr><td colspan="5"><div class="empty-state"><p>Сотрудников нет</p></div></td></tr>') +
      '</tbody></table></div>' +
      '</div></div>';
  },

  /* ================= РАБОЧЕЕ ВРЕМЯ ================= */

  renderShifts() {
    const role = this.state.role;
    if (role === 'worker') return this.shiftsWorker();
    return this.shiftsTable();
  },

  shiftsWorker() {
    const user = this.currentUser();
    const active = Store.getActiveShift(user.id);
    const data = Store.get();
    const myShifts = sortBy(data.shifts.filter(x => x.employeeId === user.id), x => -new Date(x.date + 'T' + (x.startTime || '00:00')).getTime());
    return this.pageHeader('Рабочее время', 'Учёт ваших смен')
      + this.shiftControlPanel(user, active)
      + '<div class="card"><div class="card-header"><h3 class="card-title">История смен</h3></div><div class="card-body table-wrap">' +
      this.myShiftsTable(myShifts) + '</div></div>';
  },

  shiftsTable() {
    const data = Store.get();
    const brigadeId = this.ownBrigadeId();
    const shifts = sortBy(
      data.shifts.filter(s => !brigadeId || (Store.findEmployee(s.employeeId) || {}).brigadeId === brigadeId),
      x => -new Date(x.date + 'T' + (x.startTime || '00:00')).getTime()
    );

    const rows = shifts.map(s => {
      const e = Store.findEmployee(s.employeeId);
      const o = Store.findObject(s.objectId);
      const statusBadge = s.endTime ? '<span class="badge badge-gray">Завершена</span>' : '<span class="badge badge-success">Идёт</span>';
      return '<tr>' +
        '<td><div class="employee-cell"><span class="employee-avatar">' + esc(initials(e ? e.name : '—')) + '</span><div class="name">' + esc(e ? e.name : '—') + '</div></div></td>' +
        '<td>' + esc(o ? o.name : '—') + '</td>' +
        '<td>' + fmtDate(s.date) + '</td>' +
        '<td>' + esc(s.startTime || '—') + '</td>' +
        '<td>' + esc(s.endTime || '—') + '</td>' +
        '<td class="amount">' + (s.hours != null ? s.hours + ' ч' : '…') + '</td>' +
        '<td>' + statusBadge + '</td>' +
        '</tr>';
    }).join('');

    return this.pageHeader('Рабочее время', 'Смены сотрудников по дате и времени') +
      '<div class="card"><div class="card-body table-wrap"><table><thead><tr>' +
      '<th>Сотрудник</th><th>Объект</th><th>Дата</th><th>Начало</th><th>Окончание</th><th>Часы</th><th>Статус</th></tr></thead><tbody>' +
      (rows || '<tr><td colspan="7"><div class="empty-state"><p>Смен нет</p></div></td></tr>') +
      '</tbody></table></div></div>';
  },

  myShiftsTable(shifts, mini) {
    if (!shifts.length) return '<div class="empty-state"><div class="empty-icon">—</div><p>Смен пока нет</p></div>';
    const rows = shifts.slice(0, mini ? 5 : 30).map(s => {
      const o = Store.findObject(s.objectId);
      return '<tr>' +
        '<td>' + fmtDate(s.date) + '</td>' +
        '<td>' + esc(o ? o.name : '—') + '</td>' +
        '<td>' + esc(s.startTime || '—') + '</td>' +
        '<td>' + esc(s.endTime || '—') + '</td>' +
        '<td class="amount">' + (s.hours != null ? s.hours + ' ч' : '…') + '</td>' +
        '</tr>';
    }).join('');
    return '<div class="table-wrap"><table><thead><tr><th>Дата</th><th>Объект</th><th>Начало</th><th>Окончание</th><th>Часы</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
  },

  /* ================= АВАНСЫ ================= */

  renderAdvances() {
    const role = this.state.role;
    const data = Store.get();
    const user = this.currentUser();
    const brigadeId = this.ownBrigadeId();
    const scopeEmp = user ? [user.id] : (brigadeId ? data.employees.filter(e => e.brigadeId === brigadeId).map(e => e.id) : data.employees.map(e => e.id));

    const advs = sortBy(
      data.advances.filter(a => scopeEmp.includes(a.employeeId)).map(a => ({ a, e: Store.findEmployee(a.employeeId) })),
      x => -new Date(x.a.createdAt).getTime()
    );

    const rows = advs.map(x => {
      const isManager = role === 'manager';
      let actions = '';
      if (isManager && x.a.status === 'pending') {
        actions = '<div class="table-actions"><button class="btn btn-success btn-sm" data-action="advance-approve" data-id="' + x.a.id + '">Одобрить</button>' +
          '<button class="btn btn-danger btn-sm" data-action="advance-reject" data-id="' + x.a.id + '">Отклонить</button></div>';
      } else if (isManager && x.a.status === 'approved') {
        actions = '<button class="btn btn-primary btn-sm" data-action="advance-pay" data-id="' + x.a.id + '">Выплатить</button>';
      } else {
        actions = '<span style="color:var(--gray-400);font-size:12px">—</span>';
      }
      return '<tr>' +
        '<td>' + esc(x.e ? x.e.name : '—') + '</td>' +
        '<td class="amount">' + fmtMoney(x.a.amount) + '</td>' +
        '<td>' + esc(x.a.comment || '—') + '</td>' +
        '<td>' + fmtDateTime(x.a.createdAt) + '</td>' +
        '<td>' + advBadge(x.a.status) + '</td>' +
        '<td>' + actions + '</td>' +
        '</tr>';
    }).join('');

    const createBtn = (role === 'worker')
      ? '<button class="btn btn-primary" data-action="open-advance-form">+ Запросить аванс</button>'
      : '';

    return this.pageHeader('Авансы', 'Запросы сотрудников на аванс', createBtn) +
      '<div class="card"><div class="card-body table-wrap"><table><thead><tr>' +
      '<th>Сотрудник</th><th>Сумма</th><th>Комментарий</th><th>Создан</th><th>Статус</th><th>Действия</th></tr></thead><tbody>' +
      (rows || '<tr><td colspan="6"><div class="empty-state"><p>Запросов нет</p></div></td></tr>') +
      '</tbody></table></div></div>';
  },

  myAdvancesList(advs, mini) {
    if (!advs.length) return '<div class="empty-state"><div class="empty-icon">—</div><p>Запросов нет</p></div>';
    const rows = advs.slice(0, mini ? 8 : 30).map(a => '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--gray-100)">' +
      '<div><div style="font-weight:500">' + esc(fmtMoney(a.amount)) + '</div><div style="font-size:12px;color:var(--text-muted)">' + esc(a.comment || '') + ' &middot; ' + fmtDateTime(a.createdAt) + '</div></div>' +
      advBadge(a.status) + '</div>').join('');
    return '<div>' + rows + '</div>';
  },

  employeeAdvancesSum(id) {
    return Store.get().advances
      .filter(a => a.employeeId === id && (a.status === 'approved' || a.status === 'paid'))
      .reduce((s, a) => s + a.amount, 0);
  },

  /* ================= ВЫПЛАТЫ ================= */

  renderPayments() {
    const data = Store.get();
    const pays = sortBy(
      data.payments.map(p => ({ p, e: Store.findEmployee(p.employeeId) })),
      x => -new Date(x.p.date + 'T00:00:00').getTime()
    );

    const rows = pays.map(x => '<tr>' +
      '<td><div class="employee-cell"><span class="employee-avatar">' + esc(initials(x.e ? x.e.name : '—')) + '</span><div><div class="name">' + esc(x.e ? x.e.name : '—') + '</div><div class="sub">' + esc(x.e ? x.e.position : '') + '</div></div></div></td>' +
      '<td class="amount">' + fmtMoney(x.p.amount) + '</td>' +
      '<td>' + fmtDate(x.p.date) + '</td>' +
      '<td><span class="badge badge-info">' + esc(x.p.type) + '</span></td>' +
      '<td style="color:var(--text-muted)">' + esc(x.p.comment || '—') + '</td>' +
      '</tr>').join('');

    return this.pageHeader('Выплаты', 'Зафиксированные выплаты сотрудникам', '<button class="btn btn-primary" data-action="open-payment-form">+ Создать выплату</button>') +
      '<div class="card"><div class="card-body table-wrap"><table><thead><tr>' +
      '<th>Сотрудник</th><th>Сумма</th><th>Дата</th><th>Тип</th><th>Комментарий</th></tr></thead><tbody>' +
      (rows || '<tr><td colspan="5"><div class="empty-state"><p>Выплат нет</p></div></td></tr>') +
      '</tbody></table></div></div>';
  },

  paymentsShort(pays, mini) {
    if (!pays.length) return '<div class="empty-state"><div class="empty-icon">—</div><p>Выплат нет</p></div>';
    const rows = pays.slice(0, mini ? 8 : 30).map(p => '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--gray-100)">' +
      '<div><div style="font-weight:500">' + esc(fmtMoney(p.amount)) + '</div><div style="font-size:12px;color:var(--text-muted)">' + esc(p.type) + ' &middot; ' + fmtDate(p.date) + '</div></div>' +
      '<span class="amount amount-positive">' + esc(fmtMoney(p.amount)) + '</span></div>').join('');
    return '<div>' + rows + '</div>';
  },

  /* ================= ОТЧЁТЫ ================= */

  renderReports() {
    const data = Store.get();
    const stats = data.employees.map(e => ({ e, s: Store.getEmployeeStats(e.id), b: Store.findBrigade(e.brigadeId) }));

    const totalEarned = stats.reduce((s, x) => s + x.s.earned, 0);
    const totalPaid = data.payments.reduce((s, p) => s + p.amount, 0);
    const totalAdv = stats.reduce((s, x) => s + this.employeeAdvancesSum(x.e.id), 0);
    const totalBalance = stats.reduce((s, x) => s + Math.max(x.s.balance, 0), 0);

    const empRows = sortBy(stats, x => -x.s.earned).map(x => {
      const cls = x.s.balance < 0 ? 'amount-negative' : '';
      return '<tr>' +
        '<td><div class="employee-cell"><span class="employee-avatar">' + esc(initials(x.e.name)) + '</span><div class="name">' + esc(x.e.name) + '</div></div></td>' +
        '<td>' + esc(x.b ? x.b.name : '—') + '</td>' +
        '<td class="amount">' + (x.s.totalHours || 0) + ' ч</td>' +
        '<td class="amount">' + fmtMoney(x.e.hourlyRate) + '/ч</td>' +
        '<td class="amount">' + esc(fmtMoney(x.s.earned)) + '</td>' +
        '<td class="amount">' + esc(fmtMoney(this.employeeAdvancesSum(x.e.id))) + '</td>' +
        '<td class="amount">' + esc(fmtMoney(x.s.paidTotal)) + '</td>' +
        '<td class="amount ' + cls + '">' + esc(fmtMoney(x.s.balance)) + '</td>' +
        '</tr>';
    }).join('');

    const objRows = data.objects.map(o => {
      const st = Store.getObjectStats(o.id);
      const brig = Store.findBrigade(o.brigadeId);
      return '<tr><td>' + esc(o.name) + '</td><td>' + esc(brig ? brig.name : '—') + '</td>' +
        '<td>' + st.employeeCount + '</td><td>'+ (o.status === 'active' ? '<span class="badge badge-success">Активен</span>' : '<span class="badge badge-gray">Завершён</span>') + '</td>' +
        '<td class="amount">' + st.hours + ' ч</td>' +
        '<td class="amount">' + esc(fmtMoney(st.earned)) + '</td></tr>';
    }).join('');

    const top = sortBy(stats, x => -x.s.earned).slice(0, 5).map((x, i) =>
      '<div class="rank-item"><span class="rank-num">' + (i + 1) + '</span><span class="r-name">' + esc(x.e.name) + '</span><span class="r-value">' + esc(fmtMoney(x.s.earned)) + '</span></div>'
    ).join('');

    return this.pageHeader('Отчёты', 'Сводная статистика по начислениям, выплатам и объектам') +

      '<div class="card report-block"><div class="card-body">' +
      '<h3 class="card-title" style="margin-bottom:14px">Общие показатели</h3>' +
      '<div class="report-flex"><span class="big">' + esc(fmtMoney(totalEarned)) + '</span><span style="color:var(--text-muted)">начислено всего</span></div>' +
      '<div class="summary-row" style="margin-top:12px"><span class="s-label">Начислено всем сотрудникам</span><span class="s-value">' + esc(fmtMoney(totalEarned)) + '</span></div>' +
      '<div class="summary-row"><span class="s-label">Одобрено авансами</span><span class="s-value">' + esc(fmtMoney(totalAdv)) + '</span></div>' +
      '<div class="summary-row"><span class="s-label">Произведено выплат</span><span class="s-value">' + esc(fmtMoney(totalPaid)) + '</span></div>' +
      '<div class="summary-row total"><span class="s-label">Остаток к выплате</span><span class="s-value">' + esc(fmtMoney(totalBalance)) + '</span></div>' +
      '</div></div>' +

      '<div class="card report-block"><div class="card-header"><h3 class="card-title">Начисления по сотрудникам</h3></div>' +
      '<div class="card-body table-wrap"><table><thead><tr>' +
      '<th>Сотрудник</th><th>Бригада</th><th>Часы</th><th>Ставка</th><th>Начислено</th><th>Авансы</th><th>Выплачено</th><th>Остаток</th>' +
      '</tr></thead><tbody>' + (empRows || '<tr><td colspan="8"><div class="empty-state"><p>Нет данных</p></div></td></tr>') + '</tbody></table></div></div>' +

      '<div class="grid-2-1">' +
      '<div class="card report-block"><div class="card-header"><h3 class="card-title">Затраты по объектам</h3></div>' +
      '<div class="card-body table-wrap"><table><thead><tr>' +
      '<th>Объект</th><th>Бригада</th><th>Сотрудников</th><th>Статус</th><th>Часы</th><th>Затраты</th>' +
      '</tr></thead><tbody>' + (objRows || '<tr><td colspan="6"><div class="empty-state"><p>Нет данных</p></div></td></tr>') + '</tbody></table></div></div>' +
      '<div class="card report-block"><div class="card-header"><h3 class="card-title">Топ по начислениям</h3></div><div class="card-body">' + top + '</div></div>' +
      '</div>';
  },

  /* ================= МОДАЛКИ ================= */

  openModal(title, bodyHtml, footerHtml) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = bodyHtml;
    document.getElementById('modalFooter').innerHTML = footerHtml || '';
    document.getElementById('modalOverlay').classList.add('open');
  },

  closeModal() {
    document.getElementById('modalOverlay').classList.remove('open');
  },

  advanceFormModal() {
    const user = this.currentUser();
    const obj = Store.findObject(user.currentObjectId);
    this.openModal('Запрос на аванс', '' +
      '<form id="advanceForm" novalidate>' +
      '<div class="form-group"><label>Сотрудник</label><input class="form-control" value="' + esc(user.name) + '" readonly></div>' +
      '<div class="form-group"><label>Текущий объект</label><input class="form-control" value="' + esc(obj ? obj.name : '—') + '" readonly></div>' +
      '<div class="form-group"><label>Сумма, ₽ <span class="req">*</span></label><input class="form-control" type="text" name="amount" inputmode="decimal" autocomplete="off" placeholder="Например, 5000"></div>' +
      '<div class="form-group"><label>Комментарий</label><textarea class="form-control" name="comment" placeholder="Зачем нужен аванс"></textarea></div>' +
      '<div class="form-error" id="advanceError" hidden></div>' +
      '</form>', '<button class="btn btn-secondary" id="modalCancel">Отмена</button><button class="btn btn-primary" form="advanceForm" type="submit">Отправить запрос</button>');
  },

  paymentFormModal() {
    const data = Store.get();
    const opts = data.employees.map(e => '<option value="' + e.id + '">' + esc(e.name) + '</option>').join('');
    this.openModal('Новая выплата', '' +
      '<form id="paymentForm" novalidate>' +
      '<div class="form-group"><label>Сотрудник <span class="req">*</span></label><select class="form-control" name="employeeId">' + opts + '</select></div>' +
      '<div class="form-group"><label>Сумма, ₽ <span class="req">*</span></label><input class="form-control" type="text" name="amount" inputmode="decimal" autocomplete="off" placeholder="Например, 15000"></div>' +
      '<div class="form-group"><label>Дата <span class="req">*</span></label><input class="form-control" type="date" name="date" value="' + todayStr2() + '"></div>' +
      '<div class="form-group"><label>Тип выплаты</label><select class="form-control" name="type">' +
      '<option value="Зарплата">Зарплата</option><option value="Аванс">Аванс</option><option value="Премия">Премия</option><option value="Прочее">Прочее</option></select></div>' +
      '<div class="form-group"><label>Комментарий</label><textarea class="form-control" name="comment" placeholder="Назначение выплаты"></textarea></div>' +
      '<div class="form-error" id="paymentError" hidden></div>' +
      '</form>', '<button class="btn btn-secondary" id="modalCancel">Отмена</button><button class="btn btn-primary" form="paymentForm" type="submit">Провести выплату</button>');
  },

  confirmResetModal() {
    this.openModal('Сбросить демо-данные',
      '<p style="line-height:1.6">Сбросить все изменения и восстановить исходные демо-данные?<br><br>Это действие нельзя отменить.</p>',
      '<button class="btn btn-secondary" id="modalCancel">Отмена</button><button class="btn btn-danger" id="confirmReset">Да, сбросить</button>');
  },

  /* ================= События ================= */

  bindEvents() {
    /* Клик — делегирование */
    document.addEventListener('click', (ev) => {
      const t = ev.target;
      const el = t.closest ? t.closest('[data-action]') : null;
      if (el) {
        const action = el.getAttribute('data-action');
        if (action === 'nav') { this.navigate(el.getAttribute('data-nav')); }
        else if (action === 'open-employee') this.openModal('Карточка сотрудника', this.employeeCard(el.getAttribute('data-id')));
        else if (action === 'open-object') this.openModal('Карточка объекта', this.objectCard(el.getAttribute('data-id')));
        else if (action === 'start-shift') this.startShift();
        else if (action === 'end-shift') this.endShift();
        else if (action === 'advance-approve') this.advanceAction(el.getAttribute('data-id'), 'approved');
        else if (action === 'advance-reject') this.advanceAction(el.getAttribute('data-id'), 'rejected');
        else if (action === 'advance-pay') this.advanceAction(el.getAttribute('data-id'), 'paid');
        else if (action === 'open-advance-form') this.advanceFormModal();
        else if (action === 'open-payment-form') this.paymentFormModal();
        return;
      }
      if (t.id === 'modalClose' || t.id === 'modalCancel') { this.closeModal(); return; }
      if (t.id === 'confirmReset') { this.doReset(); return; }
    });

    /* Смена роли */
    document.getElementById('roleSelect').addEventListener('change', (ev) => {
      const role = ev.target.value;
      this.state.role = role;
      localStorage.setItem('rk_role', role);
      if (!(ROLE_SECTIONS[role] || []).includes(this.state.section)) {
        this.state.section = 'dashboard';
        location.hash = '#/dashboard';
      }
      this.renderShell();
      this.render();
      this.showToast('Демо-роль изменена: ' + ROLES[role].label, 'info');
    });

    /* Выйти из формы по Esc */
    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape') this.closeModal();
    });

    /* Клик по подложке модалки */
    document.getElementById('modalOverlay').addEventListener('click', (ev) => {
      if (ev.target === ev.currentTarget) this.closeModal();
    });

    /* Подписка форм */
    document.addEventListener('submit', (ev) => {
      if (ev.target.id === 'advanceForm') { ev.preventDefault(); this.submitAdvance(ev.target); }
      else if (ev.target.id === 'paymentForm') { ev.preventDefault(); this.submitPayment(ev.target); }
    });

    /* Сброс данных */
    document.getElementById('resetBtn').addEventListener('click', (ev) => {
      ev.preventDefault();
      this.confirmResetModal();
    });

    /* Мобильное меню */
    document.getElementById('menuToggle').addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('open');
      document.getElementById('sidebarOverlay').classList.toggle('open');
    });
    document.getElementById('sidebarOverlay').addEventListener('click', () => {
      document.getElementById('sidebar').classList.remove('open');
      document.getElementById('sidebarOverlay').classList.remove('open');
    });

    /* Закрывать мобильное меню при переходе по пунктам */
    document.getElementById('sidebarNav').addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('sidebarOverlay').classList.remove('open');
      }
    });
  },

  /* ---------- Действия ---------- */

  startShift() {
    const user = this.currentUser();
    if (!user) return;
    if (Store.getActiveShift(user.id)) { this.showToast('Смена уже идёт', 'warning'); return; }
    Store.startShift(user.id);
    this.showToast('Смена начата в ' + timeToStr2(new Date()), 'success');
    this.renderDashboardContent();
  },

  endShift() {
    const user = this.currentUser();
    if (!user) return;
    const res = Store.endShift(user.id);
    if (!res) { this.showToast('Нет активной смены', 'warning'); return; }
    this.showToast('Смена завершена: ' + res.hours + ' ч', 'success');
    this.renderDashboardContent();
  },

  renderDashboardContent() {
    const content = document.getElementById('content');
    content.innerHTML = this.renderDashboard();
  },

  advanceAction(id, newStatus) {
    const adv = Store.updateAdvance(id, { status: newStatus });
    if (!adv) return;
    if (newStatus === 'paid') {
      Store.addPayment({
        id: makeId('pay'),
        employeeId: adv.employeeId,
        amount: adv.amount,
        date: todayStr2(),
        type: 'Аванс',
        comment: 'Выплата аванса (запрос)'
      });
      this.showToast('Аванс выплачен, остаток пересчитан', 'success');
    } else if (newStatus === 'approved') {
      this.showToast('Аванс одобрен, остаток пересчитан', 'success');
    } else if (newStatus === 'rejected') {
      this.showToast('Запрос отклонён', 'info');
    }
    this.render();
    this.renderNav();
  },

  submitAdvance(form) {
    const fd = new FormData(form);
    const raw = ((fd.get('amount') || '').toString()).trim();
    const user = this.currentUser();
    const errBox = document.getElementById('advanceError');
    const fail = (msg) => {
      if (errBox) { errBox.textContent = msg; errBox.hidden = false; }
      this.showToast(msg, 'error');
      const amountInput = form.querySelector('input[name="amount"]');
      if (amountInput) amountInput.focus();
      return;
    };

    if (raw === '') return fail('Укажите сумму аванса.');
    const amount = Number(raw.replace(',', '.'));
    if (!Number.isFinite(amount)) return fail('Сумма должна быть числом.');
    if (amount <= 0) return fail('Сумма должна быть больше нуля.');

    if (errBox) errBox.hidden = true;
    Store.addAdvance({
      id: makeId('adv'),
      employeeId: user.id,
      amount: amount,
      comment: (fd.get('comment') || '').trim(),
      status: 'pending',
      createdAt: dateTimeIso()
    });
    this.closeModal();
    this.showToast('Запрос на аванс отправлен руководителю', 'success');
    this.render();
    this.renderNav();
  },

  submitPayment(form) {
    const fd = new FormData(form);
    const raw = ((fd.get('amount') || '').toString()).trim();
    const errBox = document.getElementById('paymentError');
    const fail = (msg) => {
      if (errBox) { errBox.textContent = msg; errBox.hidden = false; }
      this.showToast(msg, 'error');
      return;
    };

    const employeeId = fd.get('employeeId');
    if (!employeeId) return fail('Выберите сотрудника.');
    const date = (fd.get('date') || '').toString().trim() || todayStr2();
    if (raw === '') return fail('Укажите сумму выплаты.');
    const amount = Number(raw.replace(',', '.'));
    if (!Number.isFinite(amount)) return fail('Сумма должна быть числом.');
    if (amount <= 0) return fail('Сумма должна быть больше нуля.');

    if (errBox) errBox.hidden = true;
    Store.addPayment({
      id: makeId('pay'),
      employeeId: employeeId,
      amount: amount,
      date: date,
      type: fd.get('type') || 'Зарплата',
      comment: (fd.get('comment') || '').trim()
    });
    this.closeModal();
    this.showToast('Выплата проведена, остаток пересчитан', 'success');
    this.render();
    this.renderNav();
  },

  doReset() {
    Store.reset();
    this.closeModal();
    this.state.section = 'dashboard';
    this.renderShell();
    this.render();
    if (location.hash !== '#/dashboard') location.hash = '#/dashboard';
    this.showToast('Демо-данные восстановлены', 'success');
  },

  /* ---------- Тост ---------- */

  showToast(message, type) {
    const cont = document.getElementById('toastContainer');
    const el = document.createElement('div');
    el.className = 'toast ' + (type || 'info');
    el.textContent = message;
    cont.appendChild(el);
    setTimeout(() => {
      el.classList.add('hide');
      setTimeout(() => el.remove(), 400);
    }, 3200);
  }
};

/* ========== Вспомогательные функции (глобальные) ========== */

function todayStr2() {
  const now = new Date();
  return now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());
}

function timeToStr2(d) {
  return pad(d.getHours()) + ':' + pad(d.getMinutes());
}

function dateTimeIso() {
  return todayStr2() + 'T' + timeToStr2(new Date()) + ':00';
}

function initials(name) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('');
}

function fmtDateTimeShort(d) {
  return pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
}

function advStatusLabel(s) {
  return { pending: 'Ожидает', approved: 'Одобрено', rejected: 'Отклонено', paid: 'Выплачено' }[s] || s;
}

function advBadge(s) {
  const map = {
    pending: 'badge-warning',
    approved: 'badge-info',
    rejected: 'badge-danger',
    paid: 'badge-success'
  };
  return '<span class="badge ' + (map[s] || 'badge-gray') + '">' + advStatusLabel(s) + '</span>';
}

/* ---------- Запуск ---------- */
App.init();