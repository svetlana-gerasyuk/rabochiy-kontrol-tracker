/* Рабочий Контроль — слой данных (localStorage) */

const STORAGE_KEY = 'rk_data_v1';

/* ---------- Утилиты ---------- */

function pad(n) { return String(n).padStart(2, '0'); }

function dateToStr(d) {
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}

function timeToStr(d) {
  return pad(d.getHours()) + ':' + pad(d.getMinutes());
}

function nowIso() { return new Date().toISOString(); }

function todayStr() { return dateToStr(new Date()); }

function makeId(prefix) {
  return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/* ---------- Генерация демо-данных ---------- */

function buildDemoData() {
  const now = new Date();
  const d1 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const d2 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2);
  const d3 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3);
  const d4 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 4);
  const today = dateToStr(now);

  /* Бригады */
  const brigades = [
    { id: 'brig_1', name: 'Бригада «Север»', foremanId: 'emp_1' },
    { id: 'brig_2', name: 'Бригада «Юг»', foremanId: 'emp_6' }
  ];

  /* Объекты */
  const objects = [
    { id: 'obj_1', name: 'ЖК «Премиум Парк»', address: 'г. Москва, ул. Ленина, 45', brigadeId: 'brig_1', status: 'active', createdAt: dateToStr(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 45)) },
    { id: 'obj_2', name: 'ТЦ «Меридиан»', address: 'г. Москва, пр-т Мира, 120', brigadeId: 'brig_2', status: 'active', createdAt: dateToStr(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30)) },
    { id: 'obj_3', name: 'ЖК «Северный квартал»', address: 'г. Химки, ул. Пушкина, 78', brigadeId: 'brig_1', status: 'completed', createdAt: dateToStr(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 90)) }
  ];

  /* Сотрудники */
  const employees = [
    { id: 'emp_1', name: 'Иванов Алексей Петрович', position: 'Бригадир', brigadeId: 'brig_1', hourlyRate: 380, currentObjectId: 'obj_1', phone: '+7 (900) 111-22-33' },
    { id: 'emp_2', name: 'Петров Сергей Николаевич', position: 'Рабочий', brigadeId: 'brig_1', hourlyRate: 300, currentObjectId: 'obj_1', phone: '+7 (900) 222-33-44' },
    { id: 'emp_3', name: 'Сидоров Дмитрий Валерьевич', position: 'Рабочий', brigadeId: 'brig_1', hourlyRate: 280, currentObjectId: 'obj_1', phone: '+7 (900) 333-44-55' },
    { id: 'emp_4', name: 'Козлов Андрей Иванович', position: 'Рабочий', brigadeId: 'brig_1', hourlyRate: 320, currentObjectId: 'obj_1', phone: '+7 (900) 444-55-66' },
    { id: 'emp_5', name: 'Новиков Михаил Александрович', position: 'Рабочий', brigadeId: 'brig_1', hourlyRate: 260, currentObjectId: 'obj_3', phone: '+7 (900) 555-66-77' },
    { id: 'emp_6', name: 'Морозов Владимир Сергеевич', position: 'Бригадир', brigadeId: 'brig_2', hourlyRate: 370, currentObjectId: 'obj_2', phone: '+7 (900) 666-77-88' },
    { id: 'emp_7', name: 'Волков Никита Дмитриевич', position: 'Рабочий', brigadeId: 'brig_2', hourlyRate: 310, currentObjectId: 'obj_2', phone: '+7 (900) 777-88-99' },
    { id: 'emp_8', name: 'Соколов Артём Павлович', position: 'Рабочий', brigadeId: 'brig_2', hourlyRate: 290, currentObjectId: 'obj_2', phone: '+7 (900) 888-99-00' },
    { id: 'emp_9', name: 'Лебедев Кирилл Андреевич', position: 'Рабочий', brigadeId: 'brig_2', hourlyRate: 275, currentObjectId: 'obj_2', phone: '+7 (900) 999-00-11' },
    { id: 'emp_10', name: 'Кузнецов Роман Олегович', position: 'Рабочий', brigadeId: 'brig_2', hourlyRate: 295, currentObjectId: 'obj_2', phone: '+7 (900) 000-11-22' },
    { id: 'emp_11', name: 'Григорьев Олег Викторович', position: 'Рабочий', brigadeId: 'brig_1', hourlyRate: 270, currentObjectId: 'obj_1', phone: '+7 (900) 123-45-67' },
    { id: 'emp_12', name: 'Тарасов Илья Сергеевич', position: 'Рабочий', brigadeId: 'brig_2', hourlyRate: 300, currentObjectId: 'obj_2', phone: '+7 (900) 234-56-78' }
  ];

  /* Помощник генерации смен */
  function shift(worker, obj, day, startH, startM, durH) {
    const start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), startH, startM);
    const end = new Date(start.getTime() + durH * 3600000);
    return {
      id: makeId('shift'),
      employeeId: worker,
      objectId: obj,
      date: dateToStr(day),
      startTime: timeToStr(start),
      endTime: timeToStr(end),
      hours: durH,
      note: ''
    };
  }

  let shifts = [
    /* Смены за 4 дня */
    shift('emp_1', 'obj_1', d4, 8, 0, 8),
    shift('emp_2', 'obj_1', d4, 8, 0, 8),
    shift('emp_3', 'obj_1', d4, 8, 15, 7),
    shift('emp_6', 'obj_2', d4, 8, 0, 8),
    shift('emp_7', 'obj_2', d4, 8, 0, 8),
    shift('emp_9', 'obj_2', d4, 9, 0, 7),
    /* Смены за 3 дня */
    shift('emp_1', 'obj_1', d3, 8, 0, 8),
    shift('emp_2', 'obj_1', d3, 8, 0, 8),
    shift('emp_4', 'obj_1', d3, 8, 0, 8),
    shift('emp_6', 'obj_2', d3, 8, 0, 8),
    shift('emp_7', 'obj_2', d3, 8, 0, 8),
    shift('emp_8', 'obj_2', d3, 8, 15, 7),
    shift('emp_10', 'obj_2', d3, 8, 0, 8),
    shift('emp_12', 'obj_2', d3, 9, 0, 7),
    /* Смены за 2 дня */
    shift('emp_1', 'obj_1', d2, 8, 0, 8),
    shift('emp_2', 'obj_1', d2, 8, 0, 8),
    shift('emp_3', 'obj_1', d2, 8, 15, 7),
    shift('emp_4', 'obj_1', d2, 8, 0, 8),
    shift('emp_6', 'obj_2', d2, 8, 0, 8),
    shift('emp_7', 'obj_2', d2, 8, 0, 8),
    shift('emp_8', 'obj_2', d2, 9, 0, 7),
    shift('emp_10', 'obj_2', d2, 8, 0, 8),
    /* Вчерашние смены */
    shift('emp_1', 'obj_1', d1, 8, 0, 9),
    shift('emp_2', 'obj_1', d1, 8, 0, 9),
    shift('emp_3', 'obj_1', d1, 8, 15, 8),
    shift('emp_4', 'obj_1', d1, 8, 0, 9),
    shift('emp_11', 'obj_1', d1, 9, 0, 8),
    shift('emp_5', 'obj_3', d1, 8, 30, 7),
    shift('emp_6', 'obj_2', d1, 8, 0, 9),
    shift('emp_7', 'obj_2', d1, 8, 0, 9),
    shift('emp_8', 'obj_2', d1, 8, 15, 8),
    shift('emp_9', 'obj_2', d1, 9, 0, 8),
    shift('emp_10', 'obj_2', d1, 8, 0, 9),
    shift('emp_12', 'obj_2', d1, 8, 30, 8)
  ];

  /* Открытые смены (сейчас работают) */
  const openShifts = [
    { employeeId: 'emp_2', objectId: 'obj_1', startedAt: Date.now() - 2 * 3600000 },
    { employeeId: 'emp_7', objectId: 'obj_2', startedAt: Date.now() - 3 * 3600000 },
    { employeeId: 'emp_10', objectId: 'obj_2', startedAt: Date.now() - 1 * 3600000 },
    { employeeId: 'emp_4', objectId: 'obj_1', startedAt: Date.now() - 4 * 3600000 }
  ];
  openShifts.forEach(s => {
    const start = new Date(s.startedAt);
    shifts.push({
      id: makeId('shift'),
      employeeId: s.employeeId,
      objectId: s.objectId,
      date: today,
      startTime: timeToStr(start),
      endTime: null,
      hours: null,
      note: ''
    });
  });

  /* Авансы */
  const advances = [
    { id: 'adv_1', employeeId: 'emp_2', amount: 5000, comment: 'На продукты', status: 'paid', createdAt: dateToStr(d3) + 'T09:15:00' },
    { id: 'adv_2', employeeId: 'emp_3', amount: 3000, comment: 'Ремонт машины', status: 'approved', createdAt: dateToStr(d2) + 'T12:40:00' },
    { id: 'adv_3', employeeId: 'emp_7', amount: 6000, comment: 'На текущие расходы', status: 'pending', createdAt: dateToStr(d1) + 'T10:05:00' },
    { id: 'adv_4', employeeId: 'emp_8', amount: 10000, comment: 'Переезд', status: 'rejected', createdAt: dateToStr(d2) + 'T16:30:00' },
    { id: 'adv_5', employeeId: 'emp_4', amount: 7000, comment: 'На лечение', status: 'pending', createdAt: today + 'T08:25:00' },
    { id: 'adv_6', employeeId: 'emp_1', amount: 9000, comment: 'Семейные обстоятельства', status: 'approved', createdAt: dateToStr(d1) + 'T18:10:00' },
    { id: 'adv_7', employeeId: 'emp_9', amount: 4000, comment: 'Текущие расходы', status: 'paid', createdAt: dateToStr(d4) + 'T11:20:00' }
  ];

  /* Выплаты */
  const payments = [
    { id: 'pay_1', employeeId: 'emp_1', amount: 3000, date: dateToStr(d2), type: 'Зарплата', comment: 'Частичный аванс за неделю' },
    { id: 'pay_2', employeeId: 'emp_2', amount: 2500, date: dateToStr(d2), type: 'Зарплата', comment: 'Частичный аванс за неделю' },
    { id: 'pay_3', employeeId: 'emp_3', amount: 2500, date: dateToStr(d1), type: 'Зарплата', comment: 'Частичный аванс за неделю' },
    { id: 'pay_4', employeeId: 'emp_6', amount: 4000, date: dateToStr(d2), type: 'Зарплата', comment: 'Аванс за неделю' },
    { id: 'pay_5', employeeId: 'emp_7', amount: 3000, date: dateToStr(d1), type: 'Зарплата', comment: 'Аванс за неделю' },
    { id: 'pay_6', employeeId: 'emp_8', amount: 2500, date: dateToStr(d1), type: 'Зарплата', comment: 'Аванс за неделю' },
    { id: 'pay_7', employeeId: 'emp_2', amount: 5000, date: dateToStr(d2), type: 'Аванс', comment: 'Выплата аванса (запрос)' },
    { id: 'pay_8', employeeId: 'emp_9', amount: 4000, date: dateToStr(d3), type: 'Аванс', comment: 'Выплата аванса (запрос)' },
    { id: 'pay_9', employeeId: 'emp_4', amount: 1000, date: dateToStr(d1), type: 'Премия', comment: 'За качество работ' }
  ];

  return {
    version: 1,
    employees: employees,
    brigades: brigades,
    objects: objects,
    shifts: shifts,
    advances: advances,
    payments: payments
  };
}

/* ---------- Хранилище ---------- */

const Store = {
  data: null,

  init() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        this.data = JSON.parse(raw);
        if (!this.data || !Array.isArray(this.data.employees)) throw new Error('bad data');
        return;
      }
    } catch (e) { /* повреждённые данные — пересоздаём */ }
    this.data = buildDemoData();
    this.save();
  },

  save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data)); } catch (e) { /* без сохранения */ }
  },

  reset() {
    this.data = buildDemoData();
    this.save();
  },

  get() { return this.data; },

  findEmployee(id) { return this.data.employees.find(e => e.id === id); },
  findBrigade(id) { return this.data.brigades.find(b => b.id === id); },
  findObject(id) { return this.data.objects.find(o => o.id === id); },

  /* ---------- Смены ---------- */

  getActiveShift(employeeId) {
    return this.data.shifts.find(s => s.employeeId === employeeId && s.endTime === null);
  },

  startShift(employeeId) {
    const emp = this.findEmployee(employeeId);
    if (!emp) return null;
    const now = new Date();
    const shift = {
      id: makeId('shift'),
      employeeId: employeeId,
      objectId: emp.currentObjectId,
      date: dateToStr(now),
      startTime: timeToStr(now),
      endTime: null,
      hours: null,
      note: ''
    };
    this.data.shifts.push(shift);
    this.save();
    return shift;
  },

  endShift(employeeId) {
    const shift = this.getActiveShift(employeeId);
    if (!shift) return null;
    const now = new Date();
    const start = new Date();
    const parts = shift.date.split('-');
    start.setFullYear(+parts[0], +parts[1] - 1, +parts[2]);
    const sm = shift.startTime.split(':');
    start.setHours(+sm[0], +sm[1], 0, 0);
    const mins = Math.max(0, Math.round((now - start) / 60000));
    const hours = Math.round((mins / 60) * 100) / 100;
    shift.endTime = timeToStr(now);
    shift.hours = hours;
    this.save();
    return shift;
  },

  /* ---------- Авансы ---------- */

  addAdvance(adv) {
    this.data.advances.push(adv);
    this.save();
    return adv;
  },

  updateAdvance(id, patch) {
    const adv = this.data.advances.find(a => a.id === id);
    if (adv) { Object.assign(adv, patch); this.save(); }
    return adv;
  },

  /* ---------- Выплаты ---------- */

  addPayment(pay) {
    this.data.payments.push(pay);
    this.save();
    return pay;
  },

  /* ---------- Расчёты ---------- */

  getEmployeeStats(id) {
    const emp = this.findEmployee(id);
    if (!emp) return null;

    const shifts = this.data.shifts.filter(s => s.employeeId === id);
    const totalHours = shifts.reduce((sum, s) => sum + (s.hours || 0), 0);
    const earned = totalHours * emp.hourlyRate;

    /* В остаток идут только одобренные авансы; выплаченные учтены в выплатах */
    const advancesTaken = this.data.advances
      .filter(a => a.employeeId === id && a.status === 'approved')
      .reduce((sum, a) => sum + a.amount, 0);

    const paidTotal = this.data.payments
      .filter(p => p.employeeId === id)
      .reduce((sum, p) => sum + p.amount, 0);

    const balance = earned - advancesTaken - paidTotal;

    return {
      totalHours: Math.round(totalHours * 100) / 100,
      earned: Math.round(earned),
      advancesTaken: Math.round(advancesTaken),
      paidTotal: Math.round(paidTotal),
      balance: Math.round(balance),
      shiftCount: shifts.length,
      activeShift: this.getActiveShift(id)
    };
  },

  getObjectStats(id) {
    const obj = this.findObject(id);
    if (!obj) return null;

    const emps = this.data.employees.filter(e => e.currentObjectId === id && e.brigadeId === obj.brigadeId);
    const earned = emps.reduce((sum, e) => sum + (this.getEmployeeStats(e.id) || { earned: 0 }).earned, 0);
    const hours = emps.reduce((sum, e) => sum + ((this.getEmployeeStats(e.id) || {}).totalHours || 0), 0);

    return {
      employeeCount: emps.length,
      earned: Math.round(earned),
      hours: Math.round(hours * 100) / 100,
      employees: emps
    };
  },

  getBrigadeInfo(id) {
    return this.data.brigades.find(b => b.id === id);
  }
};