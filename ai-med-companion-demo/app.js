const doses = [
  {
    time: "08:00",
    name: "缬沙坦胶囊",
    amount: "80mg · 1 粒",
    note: "早餐后服用",
    status: "done",
    tags: ["降压药", "已服用 08:12"],
  },
  {
    time: "12:30",
    name: "二甲双胍片",
    amount: "0.5g · 1 片",
    note: "午餐后服用",
    status: "done",
    tags: ["控糖药", "已服用 12:41"],
  },
  {
    time: "18:30",
    name: "阿托伐他汀钙片",
    amount: "20mg · 1 片",
    note: "晚饭后 30 分钟",
    status: "pending",
    tags: ["调脂药", "待提醒"],
  },
];

const medicines = [
  { name: "缬沙坦胶囊", plan: "每日 1 次 · 早餐后", stock: 22, total: 28, warning: "低血压症状需记录" },
  { name: "二甲双胍片", plan: "每日 2 次 · 餐后", stock: 36, total: 60, warning: "胃部不适时反馈" },
  { name: "阿托伐他汀钙片", plan: "每日 1 次 · 晚饭后", stock: 18, total: 30, warning: "肌肉酸痛需关注" },
  { name: "维生素 D 滴剂", plan: "每周 1 次 · 周日", stock: 7, total: 10, warning: "避免重复补充" },
];

const answers = {
  "漏服": "如果距离下一次服药还有较长时间，可按说明书或医生建议补服；如果已经接近下一次服药时间，不要加倍服用。请记录漏服，并观察血压或血糖是否异常。",
  "副作用": "常见轻微不适可以先记录发生时间、症状和持续多久。出现胸闷、严重皮疹、呼吸困难、持续头晕等情况，应尽快联系医生或急诊。",
  "一起": "不要自行合并新药、保健品或中成药。请先确认药名、剂量和服用时间，系统会提示潜在重复成分或相互作用，但最终调整应由医生或药师确认。",
};

const quickQuestions = [
  "降压药漏服一次怎么办？",
  "这个药有哪些常见副作用？",
  "感冒药能和现在的药一起吃吗？",
];

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2200);
}

function renderDoses() {
  const list = document.querySelector("#doseList");
  list.innerHTML = doses
    .map((dose, index) => {
      const statusClass = dose.status === "pending" ? "pending" : dose.status === "skipped" ? "skipped" : "";
      const actions =
        dose.status === "pending"
          ? `<div class="dose-actions">
              <button class="mini-button confirm" type="button" data-action="taken" data-index="${index}">确认已服</button>
              <button class="mini-button" type="button" data-action="skip" data-index="${index}">稍后提醒</button>
            </div>`
          : `<div class="dose-actions"><span class="tag">${dose.status === "skipped" ? "已推迟" : "已记录"}</span></div>`;
      return `<article class="dose-card ${statusClass}">
        <div class="time">${dose.time}</div>
        <div>
          <h3>${dose.name}</h3>
          <p class="muted">${dose.amount} · ${dose.note}</p>
          <div class="dose-meta">${dose.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}</div>
        </div>
        ${actions}
      </article>`;
    })
    .join("");

  const doneCount = doses.filter((dose) => dose.status === "done").length;
  document.querySelector("#todayCount").textContent = `${doneCount}/${doses.length}`;
}

function renderCabinet() {
  const grid = document.querySelector("#cabinetGrid");
  grid.innerHTML = medicines
    .map((medicine) => {
      const percent = Math.round((medicine.stock / medicine.total) * 100);
      return `<article class="medicine-card">
        <header>
          <div>
            <h3>${medicine.name}</h3>
            <p class="muted">${medicine.plan}</p>
          </div>
          <span class="stock">${medicine.stock} 余量</span>
        </header>
        <p>${medicine.warning}</p>
        <div class="progress" aria-label="库存 ${percent}%"><span style="width:${percent}%"></span></div>
      </article>`;
    })
    .join("");
}

function renderQuestions() {
  const container = document.querySelector("#quickQuestions");
  container.innerHTML = quickQuestions
    .map((question) => `<button type="button" data-question="${question}">${question}</button>`)
    .join("");
}

function answerQuestion(question) {
  const key = Object.keys(answers).find((item) => question.includes(item));
  const answer = key
    ? answers[key]
    : "我会先核对药名、剂量、服药时间和既往疾病，再给出风险提示。涉及换药、停药或加量时，请让医生或药师确认。";
  document.querySelector("#answerBox").innerHTML = `<strong>AI 药师建议</strong><p>${answer}</p>`;
}

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab, .view").forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");
    document.querySelector(`#${tab.dataset.tab}`).classList.add("active");
  });
});

document.addEventListener("click", (event) => {
  const target = event.target.closest("button");
  if (!target) return;

  const action = target.dataset.action;
  if (action) {
    const dose = doses[Number(target.dataset.index)];
    if (action === "taken") {
      dose.status = "done";
      dose.tags = ["调脂药", "已服用 18:36"];
      showToast("已记录本次服药，家属端同步完成");
    } else {
      dose.status = "skipped";
      dose.tags = ["调脂药", "20 分钟后再次提醒"];
      showToast("已设置 20 分钟后再次提醒");
    }
    renderDoses();
  }

  if (target.dataset.question) {
    document.querySelector("#questionInput").value = target.dataset.question;
    answerQuestion(target.dataset.question);
  }
});

document.querySelector("#scanBtn").addEventListener("click", () => {
  const frame = document.querySelector(".camera-frame");
  const panel = document.querySelector("#recognitionPanel");
  frame.classList.add("scanning");
  panel.innerHTML = `<p class="muted">识别中</p><h3>正在读取药盒文字和批准文号</h3><p>预计 2 秒内完成。</p>`;

  window.setTimeout(() => {
    frame.classList.remove("scanning");
    panel.innerHTML = `<p class="muted">识别完成 · 需用户确认</p>
      <h3>缬沙坦胶囊 80mg</h3>
      <ul>
        <li>建议计划：每日 1 次，早餐后服用</li>
        <li>药品类型：降压药</li>
        <li>库存：28 粒，预计可用 28 天</li>
        <li>风险提醒：头晕、血压过低需记录</li>
      </ul>
      <button class="primary-button" type="button" id="saveScan">确认放入药箱</button>`;
    document.querySelector("#saveScan").addEventListener("click", () => showToast("已放入电子药箱，并生成明早 08:00 提醒"));
  }, 1500);
});

document.querySelector("#voiceBtn").addEventListener("click", () => {
  showToast("语音提醒：李阿姨，晚饭后请服用阿托伐他汀钙片 1 片");
});

document.querySelector("#askBtn").addEventListener("click", () => {
  answerQuestion(document.querySelector("#questionInput").value);
});

document.querySelector("#refillBtn").addEventListener("click", () => {
  showToast("可通过拍照识别或家属端远程添加药品");
});

renderDoses();
renderCabinet();
renderQuestions();
