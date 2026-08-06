const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let particles = [];

function resizeCanvas() {
  const scale = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * scale;
  canvas.height = window.innerHeight * scale;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  const amount = Math.min(112, Math.max(48, Math.floor(window.innerWidth / 16)));
  particles = Array.from({ length: amount }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    vx: (Math.random() - 0.5) * 0.16,
    vy: (Math.random() - 0.5) * 0.16,
    r: Math.random() * 2.2 + 0.45,
    alpha: Math.random() * 0.56 + 0.16,
    mint: Math.random() > 0.34,
    macro: Math.random() > 0.91,
    tag: ['KCAL', 'PRO', 'CARB', 'FAT'][Math.floor(Math.random() * 4)]
  }));
}

function drawParticles() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  ctx.clearRect(0, 0, width, height);

  for (let i = 0; i < particles.length; i += 1) {
    const p = particles[i];
    if (!prefersReducedMotion) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -10 || p.x > width + 10) p.vx *= -1;
      if (p.y < -10 || p.y > height + 10) p.vy *= -1;
    }
    if (p.macro) {
      ctx.beginPath();
      ctx.strokeStyle = p.mint ? `rgba(83, 245, 202, ${p.alpha * 0.62})` : `rgba(174, 141, 255, ${p.alpha * 0.62})`;
      ctx.lineWidth = 1;
      ctx.arc(p.x, p.y, p.r * 3.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.font = '9px Arial';
      ctx.fillStyle = p.mint ? `rgba(151, 255, 223, ${p.alpha})` : `rgba(218, 198, 255, ${p.alpha})`;
      ctx.fillText(p.tag, p.x + p.r * 4, p.y - p.r * 3);
    }
    ctx.beginPath();
    ctx.fillStyle = p.mint ? `rgba(83, 245, 202, ${p.alpha})` : `rgba(174, 141, 255, ${p.alpha})`;
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();

    for (let j = i + 1; j < particles.length; j += 1) {
      const other = particles[j];
      const dx = p.x - other.x;
      const dy = p.y - other.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 150) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(117, 211, 217, ${0.15 * (1 - dist / 150)})`;
        ctx.lineWidth = 0.7;
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(other.x, other.y);
        ctx.stroke();
      }
    }
  }
  if (!prefersReducedMotion) requestAnimationFrame(drawParticles);
}

resizeCanvas();
drawParticles();
window.addEventListener('resize', resizeCanvas);

const topbar = document.querySelector('.topbar');
window.addEventListener('scroll', () => {
  topbar.classList.toggle('scrolled', window.scrollY > 16);
}, { passive: true });

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((item) => observer.observe(item));

const demoData = {
  food: {
    eyebrow: '演示 A · 多模态食物营养估算',
    title: '上传一张饭菜图，得到可解释的营养区间',
    question: '请识别图片中的全部饭菜，估算每种食物的份量、热量、蛋白质、碳水化合物和脂肪。我的目标是减脂，请评价这顿饭是否合适，并给出下一餐建议。',
    nodes: ['用户意图分类', '食物识别', '营养分析与下餐建议'],
    answer: '识别出米饭、番茄炒蛋、青椒牛肉、青菜和汤品。系统会基于图像清晰度与份量可见性，以“合理区间”输出热量和三大营养素；不确定的食材会主动标注，不伪造精确值。',
    img: 'assets/meal-chinese.png',
    alt: '中式健康套餐测试图'
  },
  plan: {
    eyebrow: '演示 B · 档案建立与饮食对话',
    title: '一句话建立健康档案，生成可执行饮食方案',
    question: '我25岁，女性，身高165厘米、体重60公斤，每周进行3次力量训练和2次慢跑，目标是在3个月内健康减脂到56公斤。我不喜欢吃香菜。请计算每日热量和蛋白质需求，并帮我安排一日饮食方案。',
    nodes: ['用户意图分类', '档案记录与营养对话'],
    answer: '系统提取年龄、身高体重、运动频率、减脂目标与饮食偏好，给出每日热量和蛋白质建议，并把信息沉淀为可持续对话的健康档案。医疗风险场景会提示咨询医生或持证营养师。',
    img: '',
    alt: ''
  },
  map: {
    eyebrow: '演示 C · 高德 MCP 本地健康餐推荐',
    title: '从位置和目标出发，只推荐真实搜索结果',
    question: '我现在在北京三里屯，想找3公里以内适合减脂的轻食或健身餐厅。我的目标是高蛋白、低碳水，请根据高德地图的真实结果推荐最多3家。',
    nodes: ['用户意图分类', '位置与饮食目标提取', '位置地理编码', '坐标提取', '周边餐厅搜索', '餐厅排序推荐'],
    answer: '系统调用高德 MCP，按饮食契合度、距离、评分和价格排序。餐厅名称、地址、评分和人均均只来自工具返回；字段缺失会显示“未提供”。若工具报错或额度不足，则停止推荐并如实说明。',
    img: '',
    alt: ''
  }
};

const tabButtons = [...document.querySelectorAll('.demo-tab')];
const demoQuestion = document.getElementById('demo-question');
const demoNodes = document.getElementById('flow-nodes');
const demoAnswer = document.getElementById('demo-answer');
const demoImageBox = document.getElementById('demo-image');
const demoImage = demoImageBox.querySelector('img');

function renderDemo(key) {
  const item = demoData[key];
  tabButtons.forEach((button) => {
    const active = button.dataset.demo === key;
    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', String(active));
  });
  demoImageBox.dataset.mode = key;
  demoImageBox.setAttribute('aria-label', item.title);
  demoQuestion.textContent = item.question;
  demoNodes.innerHTML = item.nodes.map((node, index) => `
    <span class="flow-node">${node}</span>${index < item.nodes.length - 1 ? '<span class="flow-arrow">→</span>' : ''}
  `).join('');
  demoAnswer.textContent = item.answer;
  if (item.img) {
    demoImage.src = item.img;
    demoImage.alt = item.alt;
    demoImageBox.classList.remove('is-empty');
  } else {
    demoImage.removeAttribute('src');
    demoImage.alt = '';
    demoImageBox.classList.add('is-empty');
  }
}

tabButtons.forEach((button) => button.addEventListener('click', () => renderDemo(button.dataset.demo)));

const presentButton = document.getElementById('presentation-mode');
presentButton?.addEventListener('click', async () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  try {
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
  } catch (_) {
    // Browsers may disallow fullscreen in an embedded preview; scrolling still works.
  }
});

document.addEventListener('keydown', (event) => {
  if ((event.key === 'p' || event.key === 'P') && !event.metaKey && !event.ctrlKey) {
    presentButton?.click();
  }
});

renderDemo('food');
