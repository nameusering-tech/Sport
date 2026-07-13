const STORAGE_KEY = "sportik-fitness-v2";
const LEGACY_STORAGE_KEY = "forma-fitness-v1";
const MIC_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15.5a4 4 0 0 0 4-4V6a4 4 0 1 0-8 0v5.5a4 4 0 0 0 4 4Z"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3M9 21h6"/></svg>';
const STOP_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="2"/></svg>';

const defaultState = {
  schemaVersion: 3,
  onboarded: false,
  profile: {
    name: "",
    age: 0,
    height: 0,
    weight: 0,
    level: "Начинающий",
    levelConfirmed: false,
    goal: "Не выбрана",
    frequency: 0,
    dumbbellWeight: 5,
    dumbbellCount: 2,
    sessionMinutes: 0,
    equipmentNotes: "",
    equipmentConfirmed: false,
    notes: ""
  },
  stats: { workouts: 0, streak: 0, completed: 0, totalMinutes: 0 },
  completedDays: [],
  workoutPlan: [],
  schedule: [],
  coachInterviewStarted: false,
  currentWorkout: { exercise: 0, set: 0 },
  chat: [],
  updatedAt: 0,
  cloudUserId: null
};

const starterExercises = [
  { id: "floor-press", name: "Жим гантелей лёжа", sets: 3, reps: "10 повторов", weightMode: "pair" },
  { id: "one-arm-row", name: "Тяга гантели в упоре", sets: 3, reps: "10 на сторону", weightMode: "single" },
  { id: "overhead-press", name: "Жим гантелей сидя", sets: 2, reps: "12 повторов", weightMode: "pair" },
  { id: "bench-crunch", name: "Скручивания на скамье", sets: 2, reps: "15 повторов", weightMode: "body" },
  { id: "plank-shoulder-tap", name: "Планка с касанием плеч", sets: 2, reps: "40 секунд", weightMode: "body" }
];

const exerciseLibrary = [
  { id: "floor-press", name: "Жим гантелей лёжа", image: "assets/exercises/floor-press.png", muscles: "Грудь · трицепс · плечи", duration: "45 сек", equipment: "2 гантели", steps: ["Лягте устойчиво, согните колени и прижмите стопы.", "Держите гантели над грудью, локти под углом около 45°.", "Выжмите гантели вверх без удара друг о друга и плавно опустите."], tip: "С вашими гантелями по 5 кг начинайте с 8–10 медленных повторов." },
  { id: "one-arm-row", name: "Тяга гантели в упоре", image: "assets/exercises/one-arm-row.png", muscles: "Широчайшие · верх спины · бицепс", duration: "50 сек", equipment: "1 гантель + скамья", steps: ["Поставьте ладонь и колено на скамью, спина нейтральна.", "Свободная рука полностью выпрямлена, плечо не провисает.", "Ведите локоть к тазу и сведите лопатку, затем опустите вес."], tip: "Не разворачивайте корпус вслед за гантелью — двигается плечо и локоть." },
  { id: "overhead-press", name: "Жим гантелей над головой", image: "assets/exercises/overhead-press.png", muscles: "Плечи · трицепс · верх груди", duration: "45 сек", equipment: "2 гантели", steps: ["Сядьте или встаньте устойчиво, напрягите кор.", "Поднимите гантели к плечам, запястья держите ровно.", "Выжмите вверх без прогиба в пояснице и плавно вернитесь."], tip: "Если техника портится с двумя гантелями, выполняйте по одной руке." },
  { id: "bench-crunch", name: "Скручивания на скамье", image: "assets/exercises/bench-crunch.png", muscles: "Прямая мышца живота · кор", duration: "40 сек", equipment: "Скамья", steps: ["Зафиксируйте стопы и прижмите поясницу к скамье.", "На выдохе приблизьте рёбра к тазу, не тяните шею руками.", "Остановитесь до потери напряжения и медленно опуститесь."], tip: "Это короткое скручивание, а не полный подъём корпуса." },
  { id: "plank-shoulder-tap", name: "Планка с касанием плеч", image: "assets/exercises/plank-shoulder-tap.png", muscles: "Кор · плечи · грудь", duration: "40 сек", equipment: "Без оборудования", steps: ["Встаньте в высокую планку, стопы немного шире таза.", "Перенесите вес на одну руку и коснитесь противоположного плеча.", "Удерживайте таз параллельно полу и чередуйте стороны."], tip: "Чем шире стоят стопы, тем легче удерживать таз неподвижным." },
  { id: "push-up", name: "Отжимания", image: "assets/exercises/push-up.png", muscles: "Грудь · плечи · трицепс · кор", duration: "45 сек", equipment: "Без оборудования", steps: ["Поставьте ладони чуть шире плеч и вытянитесь в прямую линию.", "Опускайте грудь между ладонями, локти направляйте назад-в стороны.", "Оттолкнитесь от пола, сохраняя корпус жёстким."], tip: "Если тяжело, поставьте ладони на скамью — техника останется той же." },
  { id: "lateral-raise", name: "Разведения гантелей", image: "assets/exercises/lateral-raise.png", muscles: "Средняя дельта · плечи", duration: "40 сек", equipment: "2 гантели", steps: ["Встаньте ровно, слегка согните локти.", "Поднимайте руки в стороны до уровня плеч без рывка.", "Медленно опустите гантели, сохраняя напряжение."], tip: "Гантели по 5 кг могут быть тяжёлыми: сократите амплитуду или работайте по одной руке." },
  { id: "biceps-curl", name: "Сгибания на бицепс", image: "assets/exercises/biceps-curl.png", muscles: "Бицепс · предплечья", duration: "45 сек", equipment: "2 гантели", steps: ["Прижмите локти к корпусу и расправьте плечи.", "Согните руки без раскачивания корпуса.", "Задержитесь сверху и опускайте вес медленнее, чем поднимали."], tip: "Сохраняйте запястья прямыми и не выводите локти вперёд." },
  { id: "dumbbell-squat", name: "Присед с гантелями", image: "assets/exercises/dumbbell-squat.png", muscles: "Квадрицепс · ягодицы · задняя поверхность бедра", duration: "50 сек", equipment: "2 гантели", steps: ["Поставьте стопы примерно на ширине плеч, носки слегка наружу.", "Отведите таз назад и согните колени, сохраняя грудь раскрытой.", "Оттолкнитесь всей стопой и полностью выпрямитесь."], tip: "Колени движутся в направлении носков, пятки остаются на полу." },
  { id: "bulgarian-split-squat", name: "Болгарский сплит-присед", image: "assets/exercises/bulgarian-split-squat.png", muscles: "Ягодицы · квадрицепс · стабилизаторы", duration: "55 сек", equipment: "Скамья", steps: ["Поставьте заднюю стопу на скамью, переднюю — достаточно далеко вперёд.", "Опускайтесь вертикально, ведя заднее колено к полу.", "Надавите пяткой передней ноги и вернитесь вверх."], tip: "Сначала освойте движение без гантелей, затем добавьте по 5 кг." }
];

function getWeekData() {
  const names = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"];
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  return names.map((name, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    const planned = state.schedule.find(item => Number(item.day) === index);
    return { name, date: date.getDate(), type: planned?.title || "Пусто", status: planned ? "active" : "empty" };
  });
}

function getExercises() {
  return Array.isArray(state.workoutPlan) ? state.workoutPlan : [];
}

let state = loadState();
let onboardingStep = 0;
let onboardingGoal = state.profile.goal;
let onboardingFrequency = state.profile.frequency;
let toastTimer;
let cloudClient = null;
let cloudSession = null;
let remoteSyncTimer;
let voiceRecorder = null;
let voiceStream = null;
let voiceChunks = [];
let voiceTimer = null;
let speechRecognition = null;
let voiceSubmitAfterStop = false;
let authGateSkipped = false;
let emailCooldownUntil = 0;
let emailCooldownTimer = null;

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    const saved = raw ? JSON.parse(raw) : null;
    if (!saved) return structuredClone(defaultState);
    const merged = {
      ...structuredClone(defaultState),
      ...saved,
      profile: { ...defaultState.profile, ...saved.profile },
      stats: { ...defaultState.stats, ...saved.stats },
      currentWorkout: { ...defaultState.currentWorkout, ...saved.currentWorkout }
    };
    if (Number(saved.schemaVersion || 0) < 3) {
      merged.schemaVersion = 3;
      merged.stats = structuredClone(defaultState.stats);
      merged.completedDays = [];
      merged.workoutPlan = [];
      merged.schedule = [];
      merged.currentWorkout = { exercise: 0, set: 0 };
    }
    return merged;
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState() {
  state.updatedAt = Date.now();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  queueRemoteSync();
}

function formatExerciseWeight(exercise) {
  if (exercise.weightMode === "body") return "Свой вес";
  const weight = Number(state.profile.dumbbellWeight) || 5;
  const count = Math.max(1, Math.min(2, Number(state.profile.dumbbellCount) || 2));
  if (exercise.weightMode === "single" || count === 1) return `${weight} кг`;
  return `2 × ${weight} кг`;
}

function getLibraryExercise(id) {
  return exerciseLibrary.find(item => item.id === id) || exerciseLibrary[0];
}

function showToast(text) {
  const toast = document.getElementById("toast");
  toast.textContent = text;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function renderWeek() {
  const weekData = getWeekData();
  const strip = document.getElementById("weekStrip");
  strip.innerHTML = weekData.map((day, index) => `
    <button class="day-card ${day.status}" data-day="${index}" aria-label="${day.name}, ${day.date} июля, ${day.type}">
      <span class="day-name">${day.name}</span>
      <strong>${day.date}</strong>
      <span class="day-type">${day.type}</span>
      <i class="workout-dot"></i>
    </button>`).join("");

  strip.querySelectorAll(".day-card").forEach(card => {
    card.addEventListener("click", () => {
      const day = weekData[Number(card.dataset.day)];
      if (day.status === "active") {
        document.getElementById("startWorkoutBtn").click();
      } else {
        showToast("Этот день пока пуст — попросите тренера составить расписание");
      }
    });
  });
}

function renderPlanBoard() {
  const board = document.getElementById("planBoard");
  const weekData = getWeekData();

  board.innerHTML = weekData.map((day, i) => `
    <div class="plan-column ${i === 6 ? "today" : ""}">
      <div class="plan-column-head"><span>${day.name}</span><strong>${day.date}</strong></div>
      <div class="plan-day-body">
        ${state.schedule.filter(item => Number(item.day) === i).map(task => `<article class="plan-item workout"><small>${escapeHtml(task.time || "ПО ПЛАНУ")}</small><strong>${escapeHtml(task.title)}</strong><span>${getExercises().length} упражнений</span></article>`).join("")}
        <button class="plan-add" data-plan-day="${i}">＋ Добавить заметку</button>
      </div>
    </div>`).join("");

  board.querySelectorAll(".plan-add").forEach(button => button.addEventListener("click", () => {
    const note = prompt("Заметка на этот день:");
    if (!note?.trim()) return;
    const item = document.createElement("article");
    item.className = "plan-item recovery";
    item.innerHTML = `<small>ВАША ЗАМЕТКА</small><strong>${escapeHtml(note.trim())}</strong><span>Ассистент учтёт это в плане</span>`;
    button.before(item);
    showToast("Заметка добавлена в план");
  }));
}

function renderExerciseLibrary() {
  const library = document.getElementById("exerciseLibrary");
  library.innerHTML = exerciseLibrary.map((exercise, index) => `
    <button class="exercise-card" data-exercise-id="${exercise.id}" aria-label="Открыть технику: ${exercise.name}">
      <span class="exercise-thumb"><img src="${exercise.image}" alt="${escapeHtml(exercise.name)}" loading="lazy" /></span>
      <span class="exercise-card-copy"><small>${String(index + 1).padStart(2, "0")} · ${exercise.equipment}</small><strong>${exercise.name}</strong><span>${exercise.muscles}</span></span>
    </button>`).join("");
  library.querySelectorAll(".exercise-card").forEach(card => card.addEventListener("click", () => openTechnique(card.dataset.exerciseId)));
}

function openTechnique(id) {
  const exercise = getLibraryExercise(id);
  document.getElementById("techniqueImage").src = exercise.image;
  document.getElementById("techniqueImage").alt = `Техника: ${exercise.name}`;
  document.getElementById("techniqueTitle").textContent = exercise.name;
  document.getElementById("techniqueMuscles").textContent = exercise.muscles;
  document.getElementById("techniqueTip").textContent = exercise.tip;
  document.getElementById("techniqueSteps").innerHTML = exercise.steps.map((step, index) => `<div><span>${index + 1}</span><p>${escapeHtml(step)}</p></div>`).join("");
  document.getElementById("techniqueModal").classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeTechnique() {
  document.getElementById("techniqueModal").classList.add("hidden");
  if (document.getElementById("workoutModal").classList.contains("hidden")) document.body.style.overflow = "";
}

function renderDashboard() {
  const plan = getExercises();
  const hasPlan = plan.length > 0;
  const totalSets = plan.reduce((sum, item) => sum + Number(item.sets || 0), 0);
  const duration = Number(state.planMeta?.duration || 0);
  document.querySelector(".hero-copy h2").innerHTML = hasPlan ? escapeHtml(state.planMeta?.title || "Персональная тренировка") : "План пока<br />не создан";
  document.querySelector(".hero-copy > p").textContent = hasPlan ? `Силовая · ${state.planMeta?.intensity || "Адаптивная нагрузка"}` : "Расскажите SPORTIK Coach о себе — он заполнит план";
  const heroNumbers = document.querySelectorAll(".hero-stats strong");
  [duration, plan.length, totalSets].forEach((value, index) => { if (heroNumbers[index]) heroNumbers[index].textContent = value; });
  const startButton = document.getElementById("startWorkoutBtn");
  startButton.disabled = !hasPlan;
  startButton.querySelector("span").textContent = hasPlan ? "Начать тренировку" : "Сначала создайте план с ИИ";
  document.querySelector(".coach-summary p").innerHTML = hasPlan ? "<strong>План создан</strong><br />Изменения ассистента сохранены автоматически" : "<strong>Начните с разговора</strong><br />План и расписание пока пусты";
  document.querySelector(".upcoming-list").innerHTML = state.schedule.length
    ? state.schedule.slice(0, 2).map(item => `<article class="upcoming-card"><div class="date-tile"><strong>${Number(item.day) + 1}</strong><span>ДЕНЬ</span></div><div class="upcoming-copy"><strong>${escapeHtml(item.title)}</strong><span>${plan.length} упражнений · ${duration} мин</span></div></article>`).join("")
    : '<article class="empty-state">Здесь появятся тренировки, которые составит SPORTIK Coach.</article>';
}

function renderChart() {
  const values = Array(8).fill(0);
  const chart = document.getElementById("barChart");
  chart.innerHTML = values.map((value, i) => `<div class="bar-group"><div class="bar ${i === values.length - 1 ? "current" : ""}" style="height:${value}%"></div><span>${i + 1}</span></div>`).join("");
}

function renderProfile() {
  const { profile, stats } = state;
  const firstLetter = profile.name.trim().charAt(0).toUpperCase() || "Я";
  document.getElementById("sidebarName").textContent = profile.name || "Новый пользователь";
  document.getElementById("sidebarStreak").textContent = stats.streak;
  document.getElementById("profileDisplayName").textContent = profile.name || "Профиль не заполнен";
  document.querySelector(".goal-tag").textContent = profile.goal === "Не выбрана" ? "Цель не выбрана" : `Цель: ${profile.goal.toLowerCase()}`;
  document.getElementById("profileAvatar").textContent = firstLetter;
  document.querySelector(".mobile-avatar").textContent = firstLetter;
  document.querySelectorAll(".avatar").forEach(avatar => avatar.textContent = firstLetter);
  document.getElementById("metricWorkouts").textContent = stats.workouts;
  document.getElementById("metricStreak").textContent = stats.streak;
  document.getElementById("metricPercent").textContent = `${stats.completed}%`;
  document.getElementById("metricTotalTime").innerHTML = `${Number(stats.totalMinutes || 0)}<span>м</span>`;

  const form = document.getElementById("profileForm");
  for (const [key, value] of Object.entries(profile)) {
    if (form.elements[key]) form.elements[key].value = value;
  }
  if (profile.equipmentConfirmed) {
    const equipment = String(profile.equipmentNotes || "").toLowerCase();
    form.querySelector('[name="equipment"][value="dumbbells"]').checked = /гантел/.test(equipment);
    form.querySelector('[name="equipment"][value="bench"]').checked = /скам|табур|bench/.test(equipment);
    form.querySelector('[name="equipment"][value="bands"]').checked = /резин|эспанд|band/.test(equipment);
  }
  updateGreeting();
}

function updateGreeting() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Доброе утро" : hour < 18 ? "Добрый день" : "Добрый вечер";
  document.getElementById("pageTitle").textContent = state.profile.name ? `${greeting}, ${state.profile.name}` : greeting;
  const date = new Date();
  const formatted = new Intl.DateTimeFormat("ru-RU", { weekday: "long", day: "numeric", month: "long" }).format(date);
  document.getElementById("todayDate").textContent = formatted.toUpperCase();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
}

function switchPage(pageName) {
  document.querySelectorAll(".page").forEach(page => page.classList.toggle("active", page.id === `page-${pageName}`));
  document.querySelectorAll(".nav-item[data-page]").forEach(item => item.classList.toggle("active", item.dataset.page === pageName));
  document.querySelector(".coach-panel")?.classList.remove("mobile-open");
  document.getElementById("mobileCoachBtn")?.classList.remove("active");

  const headings = {
    today: () => updateGreeting(),
    plan: () => document.getElementById("pageTitle").textContent = "Мой план",
    progress: () => document.getElementById("pageTitle").textContent = "Прогресс",
    profile: () => document.getElementById("pageTitle").textContent = "Профиль"
  };
  headings[pageName]?.();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function openWorkout() {
  if (!getExercises().length) return showToast("Сначала попросите SPORTIK Coach составить план");
  state.currentWorkout = { exercise: 0, set: 0 };
  renderWorkout();
  document.getElementById("workoutModal").classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeWorkout() {
  document.getElementById("workoutModal").classList.add("hidden");
  document.body.style.overflow = "";
}

function renderWorkout() {
  const exercises = getExercises();
  const { exercise: exerciseIndex, set } = state.currentWorkout;
  const exercise = exercises[exerciseIndex];
  const reference = getLibraryExercise(exercise.id);
  const exerciseWeight = formatExerciseWeight(exercise);
  document.getElementById("workoutCounter").textContent = `УПРАЖНЕНИЕ ${exerciseIndex + 1} ИЗ ${exercises.length}`;
  document.getElementById("workoutExerciseTitle").textContent = exercise.name;
  document.getElementById("workoutExerciseMeta").textContent = `${exercise.sets} подхода · ${exercise.reps} · ${exerciseWeight}`;
  document.getElementById("workoutExerciseImage").src = reference.image;
  document.getElementById("workoutExerciseImage").alt = `Техника: ${exercise.name}`;
  document.getElementById("workoutProgressBar").style.width = `${((exerciseIndex + set / exercise.sets) / exercises.length) * 100}%`;
  document.getElementById("prevExerciseBtn").disabled = exerciseIndex === 0 && set === 0;
  document.getElementById("completeSetBtn").textContent = exerciseIndex === exercises.length - 1 && set === exercise.sets - 1 ? "Завершить тренировку" : "Завершить подход";
  document.getElementById("setTable").innerHTML = Array.from({ length: exercise.sets }, (_, i) => `
    <div class="set-row ${i < set ? "done" : ""}">
      <span>${i < set ? "✓" : i + 1}</span><b>${exercise.reps}</b><b>${exerciseWeight}</b><small>${i < set ? "готово" : ""}</small>
    </div>`).join("");
}

function completeSet() {
  const exercises = getExercises();
  const current = state.currentWorkout;
  const exercise = exercises[current.exercise];
  current.set += 1;
  if (current.set >= exercise.sets) {
    if (current.exercise >= exercises.length - 1) {
      state.stats.workouts += 1;
      state.stats.streak += 1;
      state.stats.totalMinutes += Number(state.planMeta?.duration || 0);
      state.stats.completed = 100;
      saveState();
      renderProfile();
      closeWorkout();
      showToast("Тренировка завершена — отличная работа!");
      addAssistantMessage("Тренировка записана. Вы выполнили весь объём — я обновил прогресс и учту результат в следующем занятии.");
      return;
    }
    current.exercise += 1;
    current.set = 0;
  }
  saveState();
  renderWorkout();
}

function previousExercise() {
  const exercises = getExercises();
  const current = state.currentWorkout;
  if (current.set > 0) current.set -= 1;
  else if (current.exercise > 0) {
    current.exercise -= 1;
    current.set = exercises[current.exercise].sets - 1;
  }
  renderWorkout();
}

function addChatMessage(text, role = "assistant", persist = true) {
  const messages = document.getElementById("chatMessages");
  const row = document.createElement("div");
  row.className = `message ${role}`;
  const time = new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  row.innerHTML = role === "assistant"
    ? `<span class="tiny-coach">S</span><div><p>${escapeHtml(text)}</p><time>${time}</time></div>`
    : `<div><p>${escapeHtml(text)}</p><time>${time}</time></div>`;
  messages.appendChild(row);
  messages.scrollTop = messages.scrollHeight;
  if (persist) {
    state.chat.push({ text, role, time: Date.now() });
    state.chat = state.chat.slice(-16);
    saveState();
  }
}

function addAssistantMessage(text) {
  addChatMessage(text, "assistant");
}

const EQUIPMENT_REPLY_OPTIONS = new Set(["Гантели", "Штанга и блины", "Гири", "Тренировочная скамья", "Турник", "Резинки", "Эспандер", "Петли TRX", "Стул или табурет", "Рюкзак с книгами", "Бутылки с водой", "Только собственный вес", "Другое"]);

function renderReplyOptions(options = []) {
  const container = document.getElementById("quickPrompts");
  const choices = [...new Set((Array.isArray(options) ? options : []).map(item => String(item || "").trim()).filter(Boolean))].slice(0, 13);
  container.innerHTML = "";
  if (!choices.length) return;
  const multiple = choices.filter(option => EQUIPMENT_REPLY_OPTIONS.has(option)).length >= 3;
  if (multiple) {
    const hint = document.createElement("span");
    hint.className = "quick-prompts-hint";
    hint.textContent = "Можно выбрать несколько вариантов";
    container.appendChild(hint);
  }
  choices.forEach(option => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = option;
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => {
      if (!multiple) return submitChat(option);
      if (option === "Только собственный вес") {
        container.querySelectorAll("button.option-selected").forEach(item => item.classList.remove("option-selected"));
      } else {
        [...container.querySelectorAll("button")].find(item => item.textContent === "Только собственный вес")?.classList.remove("option-selected");
      }
      button.classList.toggle("option-selected");
      button.setAttribute("aria-pressed", String(button.classList.contains("option-selected")));
    });
    container.appendChild(button);
  });
  if (multiple) {
    const done = document.createElement("button");
    done.type = "button";
    done.className = "quick-prompts-done";
    done.textContent = "Готово →";
    done.addEventListener("click", () => {
      const selected = [...container.querySelectorAll("button.option-selected")].map(button => button.textContent);
      if (!selected.length) return showToast("Выберите хотя бы один вариант");
      submitChat(`Дома для тренировок есть: ${selected.join(", ")}.`);
    });
    container.appendChild(done);
  }
}

function getCoachReply(input) {
  const text = input.toLowerCase();
  if (/20|мало времени|быстр|коротк/.test(text)) {
    document.querySelector(".hero-stats div:first-child strong").textContent = "20";
    document.querySelector(".hero-stats div:nth-child(2) strong").textContent = "3";
    return "Готово. Сократил тренировку до 20 минут: жим гантелей, тяга в упоре и круг на кор. Разминку оставил — она важна для безопасности.";
  }
  if (/плохо спал|не высп|устал|нет сил/.test(text)) {
    document.querySelector(".hero-copy > p").textContent = "Силовая · Низкая нагрузка";
    return `Понял. Оставляю доступные гантели по ${state.profile.dumbbellWeight} кг, но убираю один подход в каждом упражнении и замедляю темп. После разминки оцените самочувствие.`;
  }
  if (/болит|боль|травм|колен|спин/.test(text)) {
    return "При боли лучше не тренироваться через дискомфорт. Напишите, где именно и как давно болит — я исключу провоцирующие движения. При острой или нарастающей боли обратитесь к врачу.";
  }
  if (/измени|замени|другую/.test(text)) {
    return "Конечно. Могу заменить отдельное упражнение, снизить нагрузку или перенести занятие. Напишите, что именно неудобно — время, упражнение или самочувствие.";
  }
  if (/гантел|вес/.test(text)) {
    const countText = Number(state.profile.dumbbellCount) === 1 ? "одна гантель" : "две гантели";
    return `Я учёл: у вас ${countText} по ${state.profile.dumbbellWeight} кг. Для жима используйте доступный вес и регулируйте сложность повторами, темпом и количеством подходов — докупать более тяжёлый вес для этого плана не нужно.`;
  }
  if (/привет|доброе|здравств/.test(text)) {
    return `Привет, ${state.profile.name}! Я уже учёл ваш план и последние результаты. Сегодня работаем над верхом тела и кором — готовы начать?`;
  }
  return "Я учту это в вашем плане. Сейчас оптимально сохранить сегодняшнюю тренировку, а нагрузку оценить после первого подхода. Хотите изменить длительность, вес или набор упражнений?";
}

function applyCoachProfilePatch(patch) {
  if (!patch || typeof patch !== "object") return false;
  let changed = false;
  const setText = (key, value) => {
    const clean = String(value || "").trim().slice(0, 500);
    if (clean && state.profile[key] !== clean) { state.profile[key] = clean; changed = true; }
  };
  const setNumber = (key, value, max) => {
    const next = Math.max(0, Math.min(max, Number(value) || 0));
    if (next && state.profile[key] !== next) { state.profile[key] = next; changed = true; }
  };
  setText("goal", patch.goal);
  setText("level", patch.level);
  setText("equipmentNotes", patch.equipmentNotes);
  setText("notes", patch.limitations);
  setNumber("age", patch.age, 120);
  setNumber("frequency", patch.frequency, 7);
  setNumber("sessionMinutes", patch.sessionMinutes, 120);
  if (patch.level && !state.profile.levelConfirmed) { state.profile.levelConfirmed = true; changed = true; }
  if (patch.equipmentNotes && !state.profile.equipmentConfirmed) { state.profile.equipmentConfirmed = true; changed = true; }
  if (changed) {
    saveState();
    renderProfile();
  }
  return changed;
}

function applyCoachUpdate(update) {
  applyCoachProfilePatch(update?.profilePatch);
  if (!update?.planUpdated || !update.plan) return false;
  const allowedIds = new Set(exerciseLibrary.map(item => item.id));
  const nextPlan = (update.plan.exercises || []).filter(item => allowedIds.has(item.id)).map(item => ({
    id: item.id,
    name: getLibraryExercise(item.id).name,
    sets: Math.max(1, Math.min(6, Number(item.sets) || 1)),
    reps: String(item.reps || "10 повторов").slice(0, 40),
    weightMode: ["body", "single", "pair"].includes(item.weightMode) ? item.weightMode : "body"
  }));
  if (!nextPlan.length) return false;
  state.workoutPlan = nextPlan;
  state.planMeta = { title: String(update.plan.title || "Персональная тренировка").slice(0, 80), intensity: String(update.plan.intensity || "Адаптивная"), duration: Math.max(5, Math.min(120, Number(update.plan.duration) || 30)) };
  state.schedule = (update.plan.schedule || []).slice(0, 7).map(item => ({ day: Math.max(0, Math.min(6, Number(item.day) || 0)), title: String(item.title || state.planMeta.title).slice(0, 80), time: String(item.time || "По плану").slice(0, 30) }));
  saveState();
  renderDashboard();
  renderWeek();
  renderPlanBoard();
  return true;
}

async function requestAIReply(message) {
  if (!cloudSession?.access_token) throw new Error("AUTH_REQUIRED");
  const response = await fetch("/api/coach", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(cloudSession?.access_token ? { Authorization: `Bearer ${cloudSession.access_token}` } : {}) },
    body: JSON.stringify({ message, profile: state.profile, stats: state.stats, workout: getExercises().map(item => ({ id: item.id, name: item.name, sets: item.sets, reps: item.reps, weight: formatExerciseWeight(item) })), schedule: state.schedule, history: state.chat.slice(0, -1).slice(-16) })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || data.error || `AI ${response.status}`);
  return data;
}

async function submitChat(text) {
  const clean = text.trim();
  if (!clean) return;
  renderReplyOptions([]);
  addChatMessage(clean, "user");
  document.getElementById("chatInput").value = "";
  const typing = document.createElement("div");
  typing.className = "message assistant typing";
  typing.innerHTML = `<span class="tiny-coach">S</span><div><p>Думаю…</p></div>`;
  document.getElementById("chatMessages").appendChild(typing);
  document.getElementById("chatMessages").scrollTop = document.getElementById("chatMessages").scrollHeight;
  try {
    const result = await requestAIReply(clean);
    typing.remove();
    const planChanged = applyCoachUpdate(result);
    let reply = result?.reply || getCoachReply(clean);
    if (planChanged && !/мой план|создал.*план/i.test(reply)) {
      reply = `Готово — я создал для вас персональный план. Откройте раздел «Мой план», чтобы всё проверить. ${reply}`;
    }
    addAssistantMessage(reply);
    renderReplyOptions(result?.replyOptions);
  } catch (error) {
    typing.remove();
    const quotaExceeded = /quota|billing|insufficient_quota/i.test(error?.message || "");
    addAssistantMessage(error?.message === "AUTH_REQUIRED"
      ? "Чтобы я мог безопасно создать и сохранить ваш персональный план, сначала войдите в аккаунт в разделе «Профиль»."
      : quotaExceeded
        ? `${getCoachReply(clean)} Голос распознан, но лимит OpenAI API исчерпан. Пополните баланс API, чтобы включить полный AI-ответ.`
        : `${getCoachReply(clean)} Облачный AI временно недоступен: ${error?.message || "неизвестная ошибка"}.`);
  }
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function resetVoiceButton() {
  const button = document.getElementById("voiceBtn");
  button.classList.remove("recording", "transcribing");
  button.innerHTML = MIC_ICON;
  button.setAttribute("aria-label", "Записать голосовое сообщение");
  button.setAttribute("aria-pressed", "false");
  document.getElementById("chatInput").placeholder = "Спросить тренера…";
}

async function transcribeVoice(blob, sendAfterTranscription = false) {
  const button = document.getElementById("voiceBtn");
  button.classList.remove("recording");
  button.classList.add("transcribing");
  button.textContent = "…";
  document.getElementById("chatInput").placeholder = "Распознаю голос…";
  try {
    const audio = await blobToBase64(blob);
    const response = await fetch("/api/transcribe", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${cloudSession.access_token}` },
      body: JSON.stringify({ audio, mimeType: blob.type || "audio/webm" })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || data.error || "Не удалось распознать речь");
    const input = document.getElementById("chatInput");
    input.value = `${input.value.trim()} ${data.text}`.trim();
    if (sendAfterTranscription) await submitChat(input.value);
  } catch (error) {
    showToast(error?.message || "Не удалось обработать голосовое сообщение");
  } finally {
    resetVoiceButton();
  }
}

function stopVoiceRecording(sendAfterStop = false) {
  voiceSubmitAfterStop = sendAfterStop;
  if (speechRecognition) {
    if (typeof speechRecognition._sportikFinish === "function") speechRecognition._sportikFinish(sendAfterStop);
    else speechRecognition.stop();
    return;
  }
  clearTimeout(voiceTimer);
  if (voiceRecorder?.state === "recording") voiceRecorder.stop();
}

function startBrowserSpeechRecognition() {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) return false;

  const recognition = new Recognition();
  let finalText = document.getElementById("chatInput").value.trim();
  if (finalText) finalText += " ";
  let fatalError = false;
  let stopRequested = false;
  let finished = false;
  let restartTimer = null;
  speechRecognition = recognition;
  recognition.lang = "ru-RU";
  recognition.continuous = true;
  recognition.interimResults = true;

  const finishRecognition = async () => {
    if (finished) return;
    finished = true;
    clearTimeout(voiceTimer);
    clearTimeout(restartTimer);
    speechRecognition = null;
    const text = document.getElementById("chatInput").value.trim();
    const shouldSend = voiceSubmitAfterStop;
    voiceSubmitAfterStop = false;
    resetVoiceButton();
    if (!fatalError && shouldSend && text) await submitChat(text);
  };

  recognition._sportikFinish = (sendAfterStop = false) => {
    voiceSubmitAfterStop = sendAfterStop;
    stopRequested = true;
    clearTimeout(restartTimer);
    if (recognition._sportikActive) {
      try { recognition.stop(); } catch { finishRecognition(); }
    } else finishRecognition();
  };

  recognition.onstart = () => {
    recognition._sportikActive = true;
    const button = document.getElementById("voiceBtn");
    button.classList.add("recording");
    button.innerHTML = STOP_ICON;
    button.setAttribute("aria-label", "Остановить запись");
    button.setAttribute("aria-pressed", "true");
    document.getElementById("chatInput").placeholder = "■ — пауза, оранжевая стрелка — отправить";
  };

  recognition.onresult = event => {
    let interimText = "";
    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      const text = event.results[index][0]?.transcript || "";
      if (event.results[index].isFinal) finalText += `${text} `;
      else interimText += text;
    }
    document.getElementById("chatInput").value = `${finalText}${interimText}`.trim();
  };

  recognition.onerror = event => {
    if (event.error === "no-speech") return;
    if (event.error === "aborted" && stopRequested) return;
    fatalError = true;
    const messages = {
      "not-allowed": "Разрешите SPORTIK использовать микрофон. Если системный запрос не появился, нажмите замок рядом с адресом сайта.",
      "audio-capture": "Микрофон не найден или занят другим приложением.",
      network: "Браузеру не удалось распознать речь. Проверьте интернет и повторите."
    };
    showToast(messages[event.error] || "Не удалось распознать голос");
  };

  recognition.onend = async () => {
    recognition._sportikActive = false;
    if (!fatalError && !stopRequested && !finished) {
      document.getElementById("chatInput").placeholder = "Пауза… продолжаю слушать";
      restartTimer = setTimeout(() => {
        if (speechRecognition !== recognition || stopRequested || finished) return;
        try { recognition.start(); } catch { finishRecognition(); }
      }, 350);
      return;
    }
    await finishRecognition();
  };

  try {
    recognition.start();
    voiceTimer = setTimeout(() => recognition._sportikFinish(false), 5 * 60_000);
    return true;
  } catch {
    speechRecognition = null;
    return false;
  }
}

async function toggleVoiceRecording() {
  if (speechRecognition) return stopVoiceRecording(false);
  if (voiceRecorder?.state === "recording") return stopVoiceRecording(false);
  if (document.getElementById("voiceBtn").classList.contains("transcribing")) return showToast("Подождите, я распознаю предыдущую запись");
  if (!cloudSession?.access_token) {
    showToast("Войдите в аккаунт, чтобы использовать голосовой ввод");
    switchPage("profile");
    return;
  }
  voiceSubmitAfterStop = false;
  if (startBrowserSpeechRecognition()) return;
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") return showToast("Запись голоса не поддерживается этим браузером");
  try {
    voiceStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    const candidates = ["audio/mp4", "audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus"];
    const mimeType = candidates.find(type => MediaRecorder.isTypeSupported(type));
    voiceChunks = [];
    voiceRecorder = new MediaRecorder(voiceStream, mimeType ? { mimeType } : undefined);
    voiceRecorder.ondataavailable = event => { if (event.data.size) voiceChunks.push(event.data); };
    voiceRecorder.onstop = async () => {
      voiceStream?.getTracks().forEach(track => track.stop());
      const blob = new Blob(voiceChunks, { type: voiceRecorder.mimeType || mimeType || "audio/webm" });
      const shouldSend = voiceSubmitAfterStop;
      voiceSubmitAfterStop = false;
      voiceRecorder = null;
      if (blob.size > 100) await transcribeVoice(blob, shouldSend); else resetVoiceButton();
    };
    voiceRecorder.start(250);
    const button = document.getElementById("voiceBtn");
    button.classList.add("recording");
    button.innerHTML = STOP_ICON;
    button.setAttribute("aria-label", "Остановить запись");
    button.setAttribute("aria-pressed", "true");
    document.getElementById("chatInput").placeholder = "■ — пауза, оранжевая стрелка — отправить";
    voiceTimer = setTimeout(() => stopVoiceRecording(false), 5 * 60_000);
  } catch (error) {
    resetVoiceButton();
    showToast(error?.name === "NotAllowedError"
      ? "Браузер заблокировал микрофон. Если вы уже нажали «Запретить», разрешите его через значок замка рядом с адресом сайта."
      : "Не удалось включить микрофон");
  }
}

function renderSavedChat() {
  state.chat.slice(-16).forEach(item => addChatMessage(item.text, item.role, false));
}

function startCoachInterview() {
  if (state.coachInterviewStarted || getExercises().length) return;
  state.coachInterviewStarted = true;
  saveState();
  addAssistantMessage("Привет! Я задам несколько коротких вопросов и затем сам создам ваш план. Начнём: какая у вас главная цель — стать сильнее, набрать мышцы, снизить вес или поддерживать форму?");
  renderReplyOptions(["Стать сильнее", "Набрать мышцы", "Снизить вес", "Поддерживать форму"]);
  if (window.innerWidth <= 700) {
    switchPage("today");
    document.querySelector(".coach-panel")?.classList.add("mobile-open");
    document.querySelectorAll(".mobile-nav .nav-item").forEach(item => item.classList.remove("active"));
    document.getElementById("mobileCoachBtn")?.classList.add("active");
  }
}

function setSyncStatus(label, mode = "local") {
  const button = document.getElementById("syncStatusBtn");
  button.querySelector("span").textContent = label;
  button.dataset.mode = mode;
}

function setAuthGateStatus(message = "") {
  document.getElementById("authGateStatus").textContent = message;
}

function showAuthGate(message = "") {
  if (authGateSkipped || cloudSession?.user) return;
  document.getElementById("onboardingModal").classList.add("hidden");
  document.getElementById("authGateModal").classList.remove("hidden");
  setAuthGateStatus(message);
  document.body.style.overflow = "hidden";
}

function hideAuthGate() {
  document.getElementById("authGateModal").classList.add("hidden");
  document.body.style.overflow = "";
}

function maybeShowOnboarding() {
  if (cloudSession?.user && !state.coachInterviewStarted && !getExercises().length) {
    if (!state.onboarded) {
      state.onboarded = true;
      saveState();
    }
    startCoachInterview();
  } else if (!state.onboarded && authGateSkipped) {
    document.getElementById("onboardingModal").classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }
}

function readAuthError() {
  const query = new URLSearchParams(location.search);
  const hash = new URLSearchParams(location.hash.replace(/^#/, ""));
  const description = query.get("error_description") || hash.get("error_description");
  if (!description) return "";
  history.replaceState({}, document.title, location.pathname);
  return decodeURIComponent(description.replace(/\+/g, " "));
}

function updateAuthUI() {
  const signedIn = Boolean(cloudSession?.user);
  document.getElementById("signedOutView").classList.toggle("hidden", signedIn);
  document.getElementById("signedInView").classList.toggle("hidden", !signedIn);
  if (signedIn) {
    hideAuthGate();
    document.getElementById("accountEmail").textContent = cloudSession.user.email || "Аккаунт SPORTIK";
    document.getElementById("cloudSetupNotice").textContent = "Данные защищены правилами доступа и синхронизируются между устройствами.";
    setSyncStatus("Синхронизировано", "synced");
  }
}

async function initCloud() {
  let config = window.SPORTIK_CONFIG || {};
  try {
    if (location.protocol !== "file:") {
      const response = await fetch("/api/config");
      if (response.ok) config = await response.json();
    }
  } catch { /* автономный режим */ }
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    setSyncStatus("Локально", "local");
    setAuthGateStatus("Облачный вход временно недоступен. Можно продолжить без аккаунта.");
    return;
  }
  try {
    const { createClient } = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");
    const supabaseUrl = config.supabaseUrl
      .trim()
      .replace(/\/(?:rest|auth)\/v1\/?$/i, "")
      .replace(/\/$/, "");
    cloudClient = createClient(supabaseUrl, config.supabaseAnonKey, {
      auth: { persistSession: true, detectSessionInUrl: false, flowType: "pkce" }
    });
    const callbackUrl = new URL(location.href);
    const authCode = callbackUrl.searchParams.get("code");
    const authHash = new URLSearchParams(callbackUrl.hash.replace(/^#/, ""));
    const accessToken = authHash.get("access_token");
    const refreshToken = authHash.get("refresh_token");
    let session = null;
    if (accessToken && refreshToken) {
      const { data, error } = await cloudClient.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });
      history.replaceState({}, document.title, location.pathname);
      if (error) throw error;
      session = data.session;
    } else if (authCode) {
      const { data, error } = await cloudClient.auth.exchangeCodeForSession(authCode);
      history.replaceState({}, document.title, location.pathname);
      if (error) throw error;
      session = data.session;
    } else {
      const { data } = await cloudClient.auth.getSession();
      session = data.session;
    }
    const authError = readAuthError();
    await handleCloudSession(session);
    cloudClient.auth.onAuthStateChange((_event, session) => setTimeout(() => handleCloudSession(session), 0));
    if (!session) {
      document.getElementById("cloudSetupNotice").textContent = "Облако подключено. Войдите по e-mail или через Google.";
      setSyncStatus("Войти", "ready");
      showAuthGate(authError);
    }
  } catch {
    setSyncStatus("Локально", "local");
    document.getElementById("cloudSetupNotice").textContent = "Не удалось связаться с облаком. Локальные данные сохранены.";
    showAuthGate("Не удалось связаться с облаком. Можно продолжить без аккаунта и повторить вход позже.");
  }
}

async function handleCloudSession(session) {
  cloudSession = session;
  updateAuthUI();
  if (!session || !cloudClient) return;
  setSyncStatus("Синхронизация…", "syncing");
  const { data, error } = await cloudClient.from("user_state").select("state, updated_at").eq("user_id", session.user.id).maybeSingle();
  if (!error && data?.state) {
    const remoteState = data.state;
    const sameAccount = state.cloudUserId === session.user.id;
    if (!sameAccount || Number(remoteState.updatedAt || 0) > Number(state.updatedAt || 0)) {
      state = { ...structuredClone(defaultState), ...remoteState, profile: { ...defaultState.profile, ...remoteState.profile }, stats: { ...defaultState.stats, ...remoteState.stats } };
      if (Number(remoteState.schemaVersion || 0) < 3) {
        state.schemaVersion = 3;
        state.stats = structuredClone(defaultState.stats);
        state.completedDays = [];
        state.workoutPlan = [];
        state.schedule = [];
      }
      state.cloudUserId = session.user.id;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      renderProfile();
      renderDashboard();
      renderWeek();
      renderPlanBoard();
      renderChart();
      document.getElementById("chatMessages").innerHTML = "";
      renderSavedChat();
      showToast("Прогресс загружен из облака");
    } else await syncNow();
  } else if (!error) await syncNow();
  setSyncStatus("Синхронизировано", "synced");
  maybeShowOnboarding();
}

function queueRemoteSync() {
  if (!cloudClient || !cloudSession?.user) return;
  clearTimeout(remoteSyncTimer);
  setSyncStatus("Сохранение…", "syncing");
  remoteSyncTimer = setTimeout(syncNow, 800);
}

async function syncNow() {
  if (!cloudClient || !cloudSession?.user) return;
  state.cloudUserId = cloudSession.user.id;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  const { error } = await cloudClient.from("user_state").upsert({ user_id: cloudSession.user.id, state, updated_at: new Date().toISOString() });
  setSyncStatus(error ? "Ошибка облака" : "Синхронизировано", error ? "error" : "synced");
}

function updateEmailCooldown() {
  const seconds = Math.max(0, Math.ceil((emailCooldownUntil - Date.now()) / 1000));
  const buttons = [document.getElementById("emailLoginBtn"), document.getElementById("authGateEmailBtn")];
  buttons.forEach(button => {
    button.disabled = seconds > 0;
    button.textContent = seconds > 0 ? `Повторить через ${seconds} сек` : "Получить ссылку для входа";
  });
  if (seconds > 0) emailCooldownTimer = setTimeout(updateEmailCooldown, 1000);
}

async function loginWithEmail(inputId = "authEmail") {
  if (!cloudClient) return showToast("Сначала подключите Supabase по инструкции в README");
  if (Date.now() < emailCooldownUntil) return;
  const email = document.getElementById(inputId).value.trim();
  if (!email) return showToast("Введите e-mail");
  const redirectTo = `${location.origin}${location.pathname}`;
  const { error } = await cloudClient.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } });
  if (error) {
    const rateLimited = /rate|seconds|security purposes|too many/i.test(error.message);
    const message = rateLimited ? "Слишком много запросов. Подождите минуту или войдите через Google." : `Не удалось отправить ссылку: ${error.message}`;
    setAuthGateStatus(message);
    showToast(message);
    return;
  }
  emailCooldownUntil = Date.now() + 60_000;
  clearTimeout(emailCooldownTimer);
  updateEmailCooldown();
  const message = "Ссылка отправлена. Откройте только самое новое письмо — предыдущие ссылки становятся недействительными.";
  setAuthGateStatus(message);
  showToast(message);
}

async function loginWithGoogle() {
  if (!cloudClient) return showToast("Сначала подключите Supabase по инструкции в README");
  setAuthGateStatus("Перенаправляем в Google…");
  const { error } = await cloudClient.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${location.origin}${location.pathname}` } });
  if (error) {
    setAuthGateStatus(`Google-вход недоступен: ${error.message}`);
    showToast(`Вход недоступен: ${error.message}`);
  }
}

function showOnboardingStep(step) {
  onboardingStep = step;
  document.querySelectorAll(".onboarding-step").forEach((el, i) => el.classList.toggle("active", i === step));
  document.getElementById("onboardingBar").style.width = `${((step + 1) / 3) * 100}%`;
  document.getElementById("onboardingBack").classList.toggle("hidden", step === 0);
  document.getElementById("onboardingNext").innerHTML = step === 2 ? "Создать мой план <span>→</span>" : "Продолжить <span>→</span>";
}

function finishOnboarding(useInputs = true) {
  if (useInputs) {
    state.profile.name = document.getElementById("onboardingName").value.trim();
    state.profile.age = Number(document.getElementById("onboardingAge").value) || 0;
    state.profile.height = Number(document.getElementById("onboardingHeight").value) || 0;
    state.profile.weight = Number(document.getElementById("onboardingWeight").value) || 0;
    state.profile.goal = onboardingGoal;
    state.profile.frequency = onboardingFrequency;
  }
  state.onboarded = true;
  saveState();
  renderProfile();
  document.getElementById("onboardingModal").classList.add("hidden");
  document.body.style.overflow = "";
  renderDashboard();
  showToast("Данные сохранены — теперь составьте план вместе с SPORTIK Coach");
}

function bindEvents() {
  document.querySelectorAll("[data-page]").forEach(button => button.addEventListener("click", event => {
    event.preventDefault();
    switchPage(button.dataset.page);
  }));

  document.getElementById("startWorkoutBtn").addEventListener("click", openWorkout);
  document.querySelector("[data-close-modal]").addEventListener("click", closeWorkout);
  document.getElementById("workoutModal").addEventListener("click", event => { if (event.target.id === "workoutModal") closeWorkout(); });
  document.getElementById("completeSetBtn").addEventListener("click", completeSet);
  document.getElementById("prevExerciseBtn").addEventListener("click", previousExercise);
  document.getElementById("openTechniqueBtn").addEventListener("click", () => {
    const exercise = getExercises()[state.currentWorkout.exercise];
    if (exercise) openTechnique(exercise.id);
  });
  document.getElementById("closeTechniqueBtn").addEventListener("click", closeTechnique);
  document.getElementById("techniqueModal").addEventListener("click", event => { if (event.target.id === "techniqueModal") closeTechnique(); });
  document.getElementById("chatForm").addEventListener("submit", event => {
    event.preventDefault();
    if (speechRecognition || voiceRecorder?.state === "recording") {
      stopVoiceRecording(true);
      return;
    }
    submitChat(document.getElementById("chatInput").value);
  });
  document.getElementById("voiceBtn").addEventListener("click", toggleVoiceRecording);
  document.querySelectorAll("#quickPrompts button").forEach(button => button.addEventListener("click", () => submitChat(button.textContent)));
  document.getElementById("clearChatBtn").addEventListener("click", () => {
    document.getElementById("chatMessages").innerHTML = "";
    state.chat = [];
    state.coachInterviewStarted = false;
    saveState();
    showToast("История диалога очищена — начинаем интервью заново");
    if (cloudSession?.user) startCoachInterview();
  });
  document.getElementById("mobileCoachBtn").addEventListener("click", () => {
    const panel = document.querySelector(".coach-panel");
    const coachButton = document.getElementById("mobileCoachBtn");
    if (panel.classList.contains("mobile-open")) {
      panel.classList.remove("mobile-open");
      coachButton.classList.remove("active");
      document.querySelector('.mobile-nav .nav-item[data-page="today"]')?.classList.add("active");
      return;
    }
    switchPage("today");
    panel.classList.add("mobile-open");
    document.querySelectorAll(".mobile-nav .nav-item").forEach(item => item.classList.remove("active"));
    coachButton.classList.add("active");
  });

  document.getElementById("saveProfileBtn").addEventListener("click", () => {
    const data = new FormData(document.getElementById("profileForm"));
    const equipment = data.getAll("equipment");
    const dumbbellWeight = Math.max(1, Number(data.get("dumbbellWeight")) || 5);
    const dumbbellCount = Math.max(1, Math.min(2, Number(data.get("dumbbellCount")) || 2));
    const equipmentNotes = [
      equipment.includes("dumbbells") ? `${dumbbellCount} гантели по ${dumbbellWeight} кг` : "",
      equipment.includes("bench") ? "тренировочная скамья" : "",
      equipment.includes("bands") ? "резинки" : ""
    ].filter(Boolean).join(", ") || "только вес собственного тела";
    state.profile = {
      ...state.profile,
      name: String(data.get("name") || "").trim(),
      age: Number(data.get("age")),
      height: Number(data.get("height")),
      weight: Number(data.get("weight")),
      level: String(data.get("level")),
      levelConfirmed: true,
      goal: String(data.get("goal")),
      dumbbellWeight,
      dumbbellCount,
      equipmentNotes,
      equipmentConfirmed: true,
      notes: String(data.get("notes"))
    };
    saveState();
    renderProfile();
    showToast("Профиль и домашнее оборудование обновлены");
    addAssistantMessage(`Запомнил домашнее оборудование: ${equipmentNotes}. Буду строить план только вокруг того, что у вас действительно есть.`);
  });

  document.getElementById("adaptPlanBtn").addEventListener("click", () => {
    switchPage("today");
    setTimeout(() => {
      if (window.innerWidth <= 700) document.querySelector(".coach-panel").classList.add("mobile-open");
      document.getElementById("chatInput").focus();
      addAssistantMessage("Давайте адаптируем план. Что изменилось: график, самочувствие, цель или доступное оборудование?");
    }, 250);
  });

  document.getElementById("notificationBtn").addEventListener("click", () => showToast(state.schedule.length ? "Расписание активно" : "Напоминаний пока нет"));
  document.getElementById("syncStatusBtn").addEventListener("click", () => switchPage("profile"));
  document.getElementById("emailLoginBtn").addEventListener("click", () => loginWithEmail("authEmail"));
  document.getElementById("googleLoginBtn").addEventListener("click", loginWithGoogle);
  document.getElementById("authGateEmailBtn").addEventListener("click", () => loginWithEmail("authGateEmail"));
  document.getElementById("authGateGoogleBtn").addEventListener("click", loginWithGoogle);
  document.getElementById("continueAsGuestBtn").addEventListener("click", () => {
    authGateSkipped = true;
    hideAuthGate();
    maybeShowOnboarding();
  });
  document.getElementById("logoutBtn").addEventListener("click", async () => {
    stopVoiceRecording();
    if (cloudClient) await cloudClient.auth.signOut();
    cloudSession = null;
    state = structuredClone(defaultState);
    localStorage.removeItem(STORAGE_KEY);
    document.getElementById("chatMessages").innerHTML = "";
    renderProfile();
    renderDashboard();
    renderWeek();
    renderPlanBoard();
    renderChart();
    updateAuthUI();
    setSyncStatus("Войти", "ready");
    authGateSkipped = false;
    showAuthGate("Вы вышли из аккаунта. Войдите снова, чтобы восстановить сохранённые данные.");
    showToast("Вы вышли из аккаунта");
  });

  document.querySelectorAll("[data-choice]").forEach(group => {
    group.querySelectorAll("button").forEach(button => button.addEventListener("click", () => {
      group.querySelectorAll("button").forEach(el => el.classList.remove("selected"));
      button.classList.add("selected");
      if (group.dataset.choice === "goal") onboardingGoal = button.dataset.value;
      if (group.dataset.choice === "frequency") onboardingFrequency = Number(button.dataset.value);
    }));
  });
  document.getElementById("onboardingNext").addEventListener("click", () => {
    if (onboardingStep < 2) showOnboardingStep(onboardingStep + 1);
    else finishOnboarding(true);
  });
  document.getElementById("onboardingBack").addEventListener("click", () => showOnboardingStep(Math.max(0, onboardingStep - 1)));
  document.getElementById("skipOnboarding").addEventListener("click", () => finishOnboarding(false));

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeTechnique();
      closeWorkout();
      document.querySelector(".coach-panel")?.classList.remove("mobile-open");
      document.getElementById("mobileCoachBtn")?.classList.remove("active");
    }
  });
}

function init() {
  renderWeek();
  renderPlanBoard();
  renderExerciseLibrary();
  renderChart();
  renderProfile();
  renderDashboard();
  renderSavedChat();
  bindEvents();
  showAuthGate("Проверяем сохранённый вход…");
  initCloud();
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) navigator.serviceWorker.register("service-worker.js").catch(() => {});
}

init();
