const MAX_HABITS = 5;

const habits = [];

const motivationalQuotes = [
    'La fuerza no viene de la capacidad. Viene de la voluntad.',
    'El éxito es la suma de pequeños esfuerzos repetidos día tras día.',
    'No esperes. El momento nunca será perfecto.',
    'El único modo de hacer un gran trabajo es amar lo que haces.',
    'El futuro pertenece a quienes creen en la belleza de sus sueños.',
    'Tu tiempo es limitado, no lo desperdicies viviendo la vida de otros.',
    'El fracaso es la oportunidad de empezar de nuevo con más inteligencia.',
    'No cuentes los días, haz que los días cuenten.',
    'La disciplina es el puente entre metas y logros.',
    'Pequeños pasos diarios llevan a grandes cambios.',
    'La persistencia es el camino del éxito.',
    'Hoy es el primer día del resto de tu vida.',
    'El secreto para avanzar es empezar.',
    'Cada día es una nueva oportunidad para ser mejor.',
    'Los límites solo existen en tu mente.',
    'La acción es la clave fundamental para todo éxito.',
    'Transforma tus hábitos, transforma tu vida.',
    'El progreso es progreso, no importa lo pequeño que sea.',
    'La consistencia vence al talento.',
    'Hoy es el mañana que esperabas ayer.',
];

let dailyQuoteText = getRandomQuote();

// function createHabitObject(name, frequency) {
//     return {
//         id: ++habitIdCounter,
//         name: name,
//         frequency: frequency,
//         createdAt: new Date().toISOString(),
//         rename: function (newName) {
//             this.name = newName;
//         },
//     };
// }

// function Habit(name, frequency) {
//     this.id = ++habitIdCounter;
//     this.name = name;
//     this.frequency = frequency;
//     this.createdAt = new Date().toISOString();
// }

// Habit.prototype.rename = function rename(newName) {
//     this.name = newName;
// };

class LogTracker {
    #dates = [];

    addLog(date) {
        if (typeof date != 'string' || date.length != 10) {
            return null;
        }
        this.#dates.push(date);
        return date;
    }

    getLogs() {
        return [...this.#dates];
    }
}

class Habit {
    #name;
    #frequency;
    #id;
    #tracker;

    constructor(name, frequency) {
        this.#id = Habit.createId();
        this.name = name;
        this.frequency = frequency;
        this.createdAt = new Date().toISOString();
        this.#tracker = new LogTracker();
    }

    rename(newName) {
        this.name = newName;
    }

    registerCheckIn(date) {
        const created = this.#tracker.addLog(date);
        if (!created) {
            return null;
        }
        return {
            habitId: this.#id,
            date: created,
        };
    }

    get logs() {
        return this.#tracker.getLogs();
    }

    get name() {
        return this.#name;
    }

    get frequency() {
        return this.#frequency;
    }

    get id() {
        return this.#id;
    }

    set name(value) {
        const normalized = value.trim();
        if (normalized.length < 3) {
            throw new Error('El nombre del hábito debe de tener al menos 3 caracteres.');
        }
        this.#name = normalized;
    }

    set frequency(value) {
        const validFrequency = ['daily', 'weekly']; // Invariantes
        if (!validFrequency.includes(value)) {
            throw new Error('La frecuencia debe de ser "daily" o "weekly"');
        }
        this.#frequency = value;
    }

    toDisplayString() {
        return `${this.name} (${this.frequency})`;
    }

    static createId() {
        return Date.now() + Math.floor(Math.random() * 1000);
    }
}

class TimedHabit extends Habit {
    #targetMinutes;

    constructor(name, frequency, targetMinutes) {
        super(name, frequency);
        this.targetMinutes = targetMinutes;
    }

    get targetMinutes() {
        return this.#targetMinutes;
    }

    set targetMinutes(value) {
        const minutes = Number(value);
        if (isNaN(minutes) || minutes <= 0) {
            throw new Error('El objetivo de tiempo debe de ser un número positivo')
        }
        this.#targetMinutes = minutes;
    }

    toDisplayString() {
        const baseString = super.toDisplayString();
        return `${baseString} ${this.#targetMinutes}`;
    }
}

function addHabit(name, frequency) {
    if (habits.length >= MAX_HABITS) {
        showMessage('Has alcanzado el límite de 5 hábitos', 'error');
        return null;
    }

    if (!name || name.trim().length === 0) {
        showMessage('El nombre del hábito es obligatorio', 'error');
        return null;
    }

    try {
        const habit = new Habit(name.trim(), frequency);
        habits.push(habit);
        return habit;
    } catch (error) {
        showMessage(error.message, 'error');
        return null;
    }

}

function logHabit(habitId, date) {
    const habit = habits.find((h) => h.id === habitId);

    if (!habit) {
        showMessage('Hábito no encontrado', 'error');
        return null;
    }

    return habit.registerCheckIn(date);
}

function getStatistics() {
    const totalHabits = habits.length;
    const totalCheckIns = logs.length;

    let mostActiveHabit = '-';
    if (logs.length > 0) {
        const habitCounts = {};
        logs.forEach((log) => {
            habitCounts[log.habitName] = (habitCounts[log.habitName] || 0) + 1;
        });

        mostActiveHabit = Object.entries(habitCounts).sort((a, b) => b[1] - a[1])[0][0];
    }

    return {
        totalHabits,
        totalCheckIns,
        mostActiveHabit,
    };
}

function showMessage(message, type = 'success') {
    const messageBox = document.getElementById('messageBox');
    messageBox.textContent = message;
    messageBox.className = `message-box ${type}`;

    setTimeout(() => {
        messageBox.classList.add('hidden');
    }, 3000);
}

function renderHabits() {
    const habitsTable = document.getElementById('habitsTable');
    const habitSelect = document.getElementById('habitSelect');
    const createHabitBtn = document.getElementById('openCreateModal');

    if (habits.length === 0) {
        habitsTable.innerHTML =
            '<p class="empty-state">No hay hábitos. Haz clic en "Crear Hábito" para comenzar.</p>';
        habitSelect.innerHTML = '<option value="">Selecciona un hábito</option>';
        createHabitBtn.style.display = 'block';
        return;
    }

    // Ocultar botón de crear hábito si se alcanzó el límite
    if (habits.length >= MAX_HABITS) {
        createHabitBtn.style.display = 'none';
    } else {
        createHabitBtn.style.display = 'block';
    }

    const monthDays = getCurrentMonthDays();

    const headerRow = `
    <div class="habit-row habit-header">
      <span class="habit-day-label">Día</span>
      ${habits.map((habit) => `<span class="habit-name">${habit.name}</span>`).join('')}
    </div>
  `;

    const dayRows = monthDays
        .map((date, index) => {
            const dateObj = new Date(date + 'T00:00:00');
            const dayLabel = String(dateObj.getDate()).padStart(2, '0');

            return `
        <div class="habit-row">
          <span class="habit-day">${dayLabel}</span>
          ${habits
                    .map((habit) => {
                        const habitLogs = habit.getLogs();
                        const isChecked = habitLogs.some((log) => log.date === date);
                        return `<div class="habit-checkbox ${isChecked ? 'checked' : ''}" 
                         data-habit-id="${habit.id}" 
                         data-date="${date}"></div>`;
                    })
                    .join('')}
        </div>
      `;
        })
        .join('');

    habitsTable.innerHTML = headerRow + dayRows;

    habitSelect.innerHTML =
        '<option value="">Selecciona un hábito</option>' +
        habits.map((habit) => `<option value="${habit.id}">${habit.name}</option>`).join('');

    attachCheckboxListeners();
}

function getCurrentMonthDays() {
    const dates = [];
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const currentDay = today.getDate();

    for (let day = 1; day <= currentDay; day++) {
        const date = new Date(year, month, day);
        dates.push(date.toISOString().split('T')[0]);
    }

    return dates;
}

function attachCheckboxListeners() {
    document.querySelectorAll('.habit-checkbox').forEach((checkbox) => {
        checkbox.addEventListener('click', function () {
            const habitId = parseInt(this.dataset.habitId);
            const date = this.dataset.date;

            if (this.classList.contains('checked')) {
                removeLog(habitId, date);
                this.classList.remove('checked');
                showMessage('Check-in removido', 'success');
            } else {
                const log = logHabit(habitId, date);
                if (log) {
                    this.classList.add('checked');
                    showMessage('Check-in registrado', 'success');
                }
            }
        });
    });
}

function removeLog(habitId, date) {
    const index = logs.findIndex((log) => log.habitId === habitId && log.date === date);
    if (index !== -1) {
        logs.splice(index, 1);
    }
}

function updateDateTime() {
    const now = new Date();
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = [
        'Enero',
        'Febrero',
        'Marzo',
        'Abril',
        'Mayo',
        'Junio',
        'Julio',
        'Agosto',
        'Septiembre',
        'Octubre',
        'Noviembre',
        'Diciembre',
    ];

    document.getElementById('dayNumber').textContent = now.getDate();
    document.getElementById('monthName').textContent = months[now.getMonth()];
    document.getElementById('dayName').textContent = days[now.getDay()];
}

function getRandomQuote() {
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    return motivationalQuotes[randomIndex];
}

function renderQuote() {
    const savedQuote = document.getElementById('savedQuote');
    savedQuote.textContent = dailyQuoteText || 'Escribe tu frase del día...';
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

function setupModalListeners() {
    document.getElementById('openCreateModal').addEventListener('click', () => {
        openModal('createHabitModal');
    });

    document.getElementById('openRegisterModal').addEventListener('click', () => {
        if (habits.length === 0) {
            showMessage('Primero crea un hábito', 'error');
            return;
        }
        openModal('registerModal');
    });

    document.querySelectorAll('.close-modal').forEach((btn) => {
        btn.addEventListener('click', function () {
            closeModal(this.dataset.modal);
        });
    });

    document.querySelectorAll('.btn-secondary').forEach((btn) => {
        btn.addEventListener('click', function () {
            const modalId = this.dataset.modal;
            if (modalId) {
                closeModal(modalId);
            }
        });
    });

    document.querySelectorAll('.modal').forEach((modal) => {
        modal.addEventListener('click', function (e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    });
}

function initApp() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('checkInDate').value = today;

    updateDateTime();
    setupModalListeners();

    document.getElementById('createHabitBtn').addEventListener('click', () => {
        const name = document.getElementById('habitName').value;
        const frequency = document.getElementById('habitFrequency').value;

        const habit = addHabit(name, frequency);
        if (habit) {
            showMessage(`Hábito "${habit.name}" creado exitosamente`, 'success');
            document.getElementById('habitName').value = '';
            renderHabits();
            closeModal('createHabitModal');

            // Si se alcanzó el límite, mostrar mensaje
            if (habits.length >= MAX_HABITS) {
                showMessage('Has alcanzado el límite máximo de 5 hábitos', 'success');
            }
        }
    });

    document.getElementById('checkInBtn').addEventListener('click', () => {
        const habitId = parseInt(document.getElementById('habitSelect').value);
        const date = document.getElementById('checkInDate').value;

        if (!habitId || !date) {
            showMessage('Selecciona un hábito y una fecha', 'error');
            return;
        }

        const log = logHabit(habitId, date);
        if (log) {
            const habit = habits.find((h) => h.id === habitId);
            showMessage(`Check-in registrado para ${log.habitName}`, 'success');
            renderHabits();
            closeModal('registerModal');
        }
    });

    renderHabits();
    renderQuote();

    console.log('Habit Tracker inicializado');
    const demoHabit = new Habit('Leer', 'daily');
    const demoTimedHabit = new TimedHabit('Meditar', 'daily', 20);
    console.log('Habit normal: ', demoHabit.toDisplayString());
    console.log('TimedHabit: ', demoTimedHabit.toDisplayString());
    console.log('instanceof Habit: ', demoTimedHabit instanceof Habit);
    console.log('intanceof TimedHabit: ', demoTimedHabit instanceof TimedHabit);
}

document.addEventListener('DOMContentLoaded', initApp);