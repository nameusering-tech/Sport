const STORAGE_KEY = "sportik-fitness-v2";
const LEGACY_STORAGE_KEY = "forma-fitness-v1";

const defaultState = {
  onboarded: false,
  profile: {
    name: "Алексей",
    age: 31,
    height: 181,
    weight: 78,
    level: "Средний",
    goal: "Стать сильнее",
    frequency: 3,
    dumbbellWeight: 5,
    dumbbellCount: 2,
    notes: ""
  },
  stats: { workouts: 18, streak: 12, completed: 86 },
  completedDays: [0, 2, 4],
  currentWorkout: { exercise: 0, set: 0 },
  chat: [],
  updatedAt: 0,
  cloudUserId: null
};

const exercises = [
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

const weekData = [
  { name: "ПН", date: 6, type: "Верх тела", status: "done" },
  { name: "ВТ", date: 7, type: "Восстановление", status: "rest" },
  { name: "СР", date: 8, type: "Ноги", status: "done" },
  { name: "ЧТ", date: 9, type: "Мобилити", status: "rest" },
  { name: "ПТ", date: 10, type: "Всё тело", status: "done" },
  { name: "СБ", date: 11, type: "Отдых", status: "rest" },
  { name: "ВС", date: 12, type: "Верх + кор", status: "active" }
];

let state = loadState();
let onboardingStep = 0;
let onboardingGoal = state.profile.goal;
let onboardingFrequency = state.profile.frequency;
let toastTimer;
let motionFrame;
let motionProgress = 0;
let cloudClient = null;
let cloudSession = null;
let remoteSyncTimer;

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    const saved = raw ? JSON.parse(raw) : null;
    if (!saved) return structuredClone(defaultState);
    return {
      ...structuredClone(defaultState),
      ...saved,
      profile: { ...defaultState.profile, ...saved.profile },
      stats: { ...defaultState.stats, ...saved.stats },
      currentWorkout: { ...defaultState.currentWorkout, ...saved.currentWorkout }
    };
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
      } else if (day.status === "done") {
        showToast(`${day.type}: тренировка выполнена`);
      } else {
        showToast(`${day.type}: день восстановления`);
      }
    });
  });
}

function renderPlanBoard() {
  const board = document.getElementById("planBoard");
  const tasks = [
    [{ type: "workout done", time: "18:30", title: "Верх тела", meta: "38 мин · 5 упражнений" }],
    [{ type: "recovery", time: "В ТЕЧЕНИЕ ДНЯ", title: "Восстановление", meta: "8 000 шагов · растяжка" }],
    [{ type: "workout done", time: "19:00", title: "Ноги & ягодицы", meta: "42 мин · 6 упражнений" }],
    [{ type: "recovery", time: "08:30", title: "Мобилити", meta: "15 мин · всё тело" }],
    [{ type: "workout done", time: "18:00", title: "Всё тело", meta: "45 мин · 6 упражнений" }],
    [{ type: "recovery", time: "СВОБОДНЫЙ ДЕНЬ", title: "Полный отдых", meta: "Фокус на сне и питании" }],
    [{ type: "workout", time: "11:00", title: "Верх тела & кор", meta: "38 мин · 5 упражнений" }, { type: "recovery", time: "ВЕЧЕРОМ", title: "Лёгкая прогулка", meta: "20–30 минут" }]
  ];

  board.innerHTML = weekData.map((day, i) => `
    <div class="plan-column ${i === 6 ? "today" : ""}">
      <div class="plan-column-head"><span>${day.name}</span><strong>${day.date}</strong></div>
      <div class="plan-day-body">
        ${tasks[i].map(task => `<article class="plan-item ${task.type}"><small>${task.time}</small><strong>${task.title}</strong><span>${task.meta}</span></article>`).join("")}
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
      <span class="exercise-thumb"><img src="${exercise.image}" alt="" loading="lazy" /><i>▶</i></span>
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
  motionProgress = 0;
  document.getElementById("techniqueRange").value = 0;
  document.getElementById("techniqueImageWrap").style.setProperty("--motion", 0);
  document.getElementById("techniqueImageWrap").classList.add("playing");
  document.getElementById("techniquePlayBtn").innerHTML = "<span>Ⅱ</span> Пауза";
  document.getElementById("techniqueModal").classList.remove("hidden");
  document.body.style.overflow = "hidden";
  startMotionLoop();
}

function closeTechnique() {
  document.getElementById("techniqueModal").classList.add("hidden");
  cancelAnimationFrame(motionFrame);
  if (document.getElementById("workoutModal").classList.contains("hidden")) document.body.style.overflow = "";
}

function setMotionProgress(value, target = "technique") {
  motionProgress = Number(value);
  const wrap = document.getElementById(target === "workout" ? "workoutMotionPlayer" : "techniqueImageWrap");
  const range = document.getElementById(target === "workout" ? "workoutMotionRange" : "techniqueRange");
  wrap.style.setProperty("--motion", motionProgress / 100);
  range.value = motionProgress;
  const phase = motionProgress < 35 ? "СТАРТ" : motionProgress > 65 ? "ФИНИШ" : "ДВИЖЕНИЕ";
  if (target === "workout") document.getElementById("workoutMotionPhase").textContent = phase;
  else document.getElementById("techniquePhase").textContent = phase;
}

function startMotionLoop() {
  cancelAnimationFrame(motionFrame);
  let lastTime = performance.now();
  let direction = 1;
  const tick = time => {
    const wrap = document.getElementById("techniqueImageWrap");
    if (!wrap.classList.contains("playing") || document.getElementById("techniqueModal").classList.contains("hidden")) return;
    const delta = Math.min(40, time - lastTime);
    lastTime = time;
    motionProgress += direction * delta * 0.025;
    if (motionProgress >= 100) { motionProgress = 100; direction = -1; }
    if (motionProgress <= 0) { motionProgress = 0; direction = 1; }
    setMotionProgress(motionProgress);
    motionFrame = requestAnimationFrame(tick);
  };
  motionFrame = requestAnimationFrame(tick);
}

function renderChart() {
  const values = [42, 58, 44, 72, 63, 84, 68, 92];
  const chart = document.getElementById("barChart");
  chart.innerHTML = values.map((value, i) => `<div class="bar-group"><div class="bar ${i === values.length - 1 ? "current" : ""}" style="height:${value}%"></div><span>${i + 1}</span></div>`).join("");
}

function renderProfile() {
  const { profile, stats } = state;
  const firstLetter = profile.name.trim().charAt(0).toUpperCase() || "Я";
  document.getElementById("sidebarName").textContent = profile.name;
  document.getElementById("sidebarStreak").textContent = stats.streak;
  document.getElementById("profileDisplayName").textContent = profile.name;
  document.querySelector(".goal-tag").textContent = `Цель: ${profile.goal.toLowerCase()}`;
  document.getElementById("profileAvatar").textContent = firstLetter;
  document.querySelector(".mobile-avatar").textContent = firstLetter;
  document.querySelectorAll(".avatar").forEach(avatar => avatar.textContent = firstLetter);
  document.getElementById("metricWorkouts").textContent = stats.workouts;
  document.getElementById("metricStreak").textContent = stats.streak;
  document.getElementById("metricPercent").textContent = `${stats.completed}%`;

  const form = document.getElementById("profileForm");
  for (const [key, value] of Object.entries(profile)) {
    if (form.elements[key]) form.elements[key].value = value;
  }
  updateGreeting();
}

function updateGreeting() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Доброе утро" : hour < 18 ? "Добрый день" : "Добрый вечер";
  document.getElementById("pageTitle").textContent = `${greeting}, ${state.profile.name}`;
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
  const { exercise: exerciseIndex, set } = state.currentWorkout;
  const exercise = exercises[exerciseIndex];
  const reference = getLibraryExercise(exercise.id);
  const exerciseWeight = formatExerciseWeight(exercise);
  document.getElementById("workoutCounter").textContent = `УПРАЖНЕНИЕ ${exerciseIndex + 1} ИЗ ${exercises.length}`;
  document.getElementById("workoutExerciseTitle").textContent = exercise.name;
  document.getElementById("workoutExerciseMeta").textContent = `${exercise.sets} подхода · ${exercise.reps} · ${exerciseWeight}`;
  document.getElementById("workoutExerciseImage").src = reference.image;
  document.getElementById("workoutExerciseImage").alt = `Техника: ${exercise.name}`;
  document.getElementById("workoutMotionRange").value = 0;
  document.getElementById("workoutMotionPlayer").style.setProperty("--motion", 0);
  document.getElementById("workoutProgressBar").style.width = `${((exerciseIndex + set / exercise.sets) / exercises.length) * 100}%`;
  document.getElementById("prevExerciseBtn").disabled = exerciseIndex === 0 && set === 0;
  document.getElementById("completeSetBtn").textContent = exerciseIndex === exercises.length - 1 && set === exercise.sets - 1 ? "Завершить тренировку" : "Завершить подход";
  document.getElementById("setTable").innerHTML = Array.from({ length: exercise.sets }, (_, i) => `
    <div class="set-row ${i < set ? "done" : ""}">
      <span>${i < set ? "✓" : i + 1}</span><b>${exercise.reps}</b><b>${exerciseWeight}</b><small>${i < set ? "готово" : ""}</small>
    </div>`).join("");
}

function completeSet() {
  const current = state.currentWorkout;
  const exercise = exercises[current.exercise];
  current.set += 1;
  if (current.set >= exercise.sets) {
    if (current.exercise >= exercises.length - 1) {
      state.stats.workouts += 1;
      state.stats.completed = Math.min(100, state.stats.completed + 1);
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

async function requestAIReply(message) {
  if (!cloudSession?.access_token) return null;
  const response = await fetch("/api/coach", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${cloudSession.access_token}` },
    body: JSON.stringify({ message, profile: state.profile, stats: state.stats, workout: exercises.map(item => ({ name: item.name, sets: item.sets, reps: item.reps, weight: formatExerciseWeight(item) })), history: state.chat.slice(-8) })
  });
  if (!response.ok) throw new Error(`AI ${response.status}`);
  const data = await response.json();
  return data.reply || null;
}

async function submitChat(text) {
  const clean = text.trim();
  if (!clean) return;
  addChatMessage(clean, "user");
  document.getElementById("chatInput").value = "";
  const typing = document.createElement("div");
  typing.className = "message assistant typing";
  typing.innerHTML = `<span class="tiny-coach">S</span><div><p>Думаю…</p></div>`;
  document.getElementById("chatMessages").appendChild(typing);
  document.getElementById("chatMessages").scrollTop = document.getElementById("chatMessages").scrollHeight;
  try {
    const aiReply = await requestAIReply(clean);
    typing.remove();
    addAssistantMessage(aiReply || getCoachReply(clean));
  } catch {
    typing.remove();
    addAssistantMessage(`${getCoachReply(clean)} Сейчас отвечаю в автономном режиме — облачный AI временно недоступен.`);
  }
}

function renderSavedChat() {
  state.chat.slice(-8).forEach(item => addChatMessage(item.text, item.role, false));
}

function setSyncStatus(label, mode = "local") {
  const button = document.getElementById("syncStatusBtn");
  button.querySelector("span").textContent = label;
  button.dataset.mode = mode;
}

function updateAuthUI() {
  const signedIn = Boolean(cloudSession?.user);
  document.getElementById("signedOutView").classList.toggle("hidden", signedIn);
  document.getElementById("signedInView").classList.toggle("hidden", !signedIn);
  if (signedIn) {
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
    return;
  }
  try {
    const { createClient } = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");
    const supabaseUrl = config.supabaseUrl
      .trim()
      .replace(/\/(?:rest|auth)\/v1\/?$/i, "")
      .replace(/\/$/, "");
    cloudClient = createClient(supabaseUrl, config.supabaseAnonKey, { auth: { persistSession: true, detectSessionInUrl: true } });
    const { data } = await cloudClient.auth.getSession();
    await handleCloudSession(data.session);
    cloudClient.auth.onAuthStateChange((_event, session) => setTimeout(() => handleCloudSession(session), 0));
    if (!data.session) {
      document.getElementById("cloudSetupNotice").textContent = "Облако подключено. Войдите по e-mail или через Google.";
      setSyncStatus("Войти", "ready");
    }
  } catch {
    setSyncStatus("Локально", "local");
    document.getElementById("cloudSetupNotice").textContent = "Не удалось связаться с облаком. Локальные данные сохранены.";
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
      state.cloudUserId = session.user.id;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      renderProfile();
      renderWeek();
      document.getElementById("chatMessages").innerHTML = "";
      renderSavedChat();
      showToast("Прогресс загружен из облака");
    } else await syncNow();
  } else if (!error) await syncNow();
  setSyncStatus("Синхронизировано", "synced");
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

async function loginWithEmail() {
  if (!cloudClient) return showToast("Сначала подключите Supabase по инструкции в README");
  const email = document.getElementById("authEmail").value.trim();
  if (!email) return showToast("Введите e-mail");
  const redirectTo = `${location.origin}${location.pathname}`;
  const { error } = await cloudClient.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } });
  showToast(error ? `Не удалось отправить ссылку: ${error.message}` : "Ссылка для входа отправлена на почту");
}

async function loginWithGoogle() {
  if (!cloudClient) return showToast("Сначала подключите Supabase по инструкции в README");
  const { error } = await cloudClient.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${location.origin}${location.pathname}` } });
  if (error) showToast(`Вход недоступен: ${error.message}`);
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
    state.profile.name = document.getElementById("onboardingName").value.trim() || "Алексей";
    state.profile.age = Number(document.getElementById("onboardingAge").value) || 31;
    state.profile.height = Number(document.getElementById("onboardingHeight").value) || 181;
    state.profile.weight = Number(document.getElementById("onboardingWeight").value) || 78;
    state.profile.goal = onboardingGoal;
    state.profile.frequency = onboardingFrequency;
  }
  state.onboarded = true;
  saveState();
  renderProfile();
  document.getElementById("onboardingModal").classList.add("hidden");
  document.body.style.overflow = "";
  showToast("Персональный план готов");
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
  document.getElementById("openTechniqueBtn").addEventListener("click", () => openTechnique(exercises[state.currentWorkout.exercise].id));
  document.getElementById("closeTechniqueBtn").addEventListener("click", closeTechnique);
  document.getElementById("techniqueModal").addEventListener("click", event => { if (event.target.id === "techniqueModal") closeTechnique(); });
  document.getElementById("techniqueRange").addEventListener("input", event => {
    document.getElementById("techniqueImageWrap").classList.remove("playing");
    document.getElementById("techniquePlayBtn").innerHTML = "<span>▶</span> Продолжить";
    setMotionProgress(event.target.value);
  });
  document.getElementById("techniquePlayBtn").addEventListener("click", () => {
    const wrap = document.getElementById("techniqueImageWrap");
    const playing = wrap.classList.toggle("playing");
    document.getElementById("techniquePlayBtn").innerHTML = playing ? "<span>Ⅱ</span> Пауза" : "<span>▶</span> Продолжить";
    if (playing) startMotionLoop(); else cancelAnimationFrame(motionFrame);
  });
  document.getElementById("workoutMotionRange").addEventListener("input", event => {
    document.getElementById("workoutMotionPlayer").classList.remove("playing");
    document.getElementById("workoutMotionToggle").textContent = "▶";
    setMotionProgress(event.target.value, "workout");
  });
  document.getElementById("workoutMotionToggle").addEventListener("click", () => {
    const player = document.getElementById("workoutMotionPlayer");
    const playing = player.classList.toggle("playing");
    document.getElementById("workoutMotionToggle").textContent = playing ? "Ⅱ" : "▶";
  });

  document.getElementById("chatForm").addEventListener("submit", event => {
    event.preventDefault();
    submitChat(document.getElementById("chatInput").value);
  });
  document.querySelectorAll("#quickPrompts button").forEach(button => button.addEventListener("click", () => submitChat(button.textContent)));
  document.getElementById("clearChatBtn").addEventListener("click", () => {
    const initial = document.querySelector("#chatMessages .message:first-child");
    document.getElementById("chatMessages").innerHTML = "";
    if (initial) document.getElementById("chatMessages").appendChild(initial);
    state.chat = [];
    saveState();
    showToast("История диалога очищена");
  });
  document.getElementById("mobileCoachBtn").addEventListener("click", () => {
    document.querySelector(".coach-panel").classList.toggle("mobile-open");
  });

  document.getElementById("saveProfileBtn").addEventListener("click", () => {
    const data = new FormData(document.getElementById("profileForm"));
    state.profile = {
      ...state.profile,
      name: String(data.get("name") || "Алексей").trim(),
      age: Number(data.get("age")),
      height: Number(data.get("height")),
      weight: Number(data.get("weight")),
      level: String(data.get("level")),
      goal: String(data.get("goal")),
      dumbbellWeight: Math.max(1, Number(data.get("dumbbellWeight")) || 5),
      dumbbellCount: Math.max(1, Math.min(2, Number(data.get("dumbbellCount")) || 2)),
      notes: String(data.get("notes"))
    };
    saveState();
    renderProfile();
    showToast(`Профиль обновлён — учтены гантели по ${state.profile.dumbbellWeight} кг`);
    addAssistantMessage(`Запомнил оборудование: ${state.profile.dumbbellCount === 1 ? "одна гантель" : "две гантели"} по ${state.profile.dumbbellWeight} кг. Буду подбирать повторения и темп под этот вес.`);
  });

  document.getElementById("adaptPlanBtn").addEventListener("click", () => {
    switchPage("today");
    setTimeout(() => {
      if (window.innerWidth <= 700) document.querySelector(".coach-panel").classList.add("mobile-open");
      document.getElementById("chatInput").focus();
      addAssistantMessage("Давайте адаптируем план. Что изменилось: график, самочувствие, цель или доступное оборудование?");
    }, 250);
  });

  document.getElementById("notificationBtn").addEventListener("click", () => showToast("На сегодня одно напоминание: тренировка в 11:00"));
  document.getElementById("syncStatusBtn").addEventListener("click", () => switchPage("profile"));
  document.getElementById("emailLoginBtn").addEventListener("click", loginWithEmail);
  document.getElementById("googleLoginBtn").addEventListener("click", loginWithGoogle);
  document.getElementById("logoutBtn").addEventListener("click", async () => {
    if (cloudClient) await cloudClient.auth.signOut();
    cloudSession = null;
    updateAuthUI();
    setSyncStatus("Войти", "ready");
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
    }
  });
}

function init() {
  renderWeek();
  renderPlanBoard();
  renderExerciseLibrary();
  renderChart();
  renderProfile();
  renderSavedChat();
  bindEvents();
  initCloud();
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) navigator.serviceWorker.register("service-worker.js").catch(() => {});
  if (!state.onboarded) {
    document.getElementById("onboardingModal").classList.remove("hidden");
    document.body.style.overflow = "hidden";
    showOnboardingStep(0);
  }
}

init();
