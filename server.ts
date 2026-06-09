import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(process.cwd(), "data.json");

// Middleware
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Initialize Gemini SDK with telemetry header
const ai = process.env.GEMINI_API_KEY 
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

// Mock database initial state
const defaultEvents = [
  {
    id: "neon-genesis",
    name: "Neon Genesis: Underground",
    type: "aniversario",
    dateTime: "2026-06-19T22:00",
    location: "Techno Warehouse District, Bloco 7, São Paulo",
    description: "Prepare-se para uma experiência sensorial única no coração da cidade. Uma fusão de lasers de neonindigo, fumaça profunda e sonoridades Techno que marcam a nova era de Solstice.",
    isPublic: true,
    requiresApproval: true,
    allowPlusOne: true,
    peopleLimit: 250,
    rsvpDeadline: "2026-06-17",
    vaquinhaEnabled: true,
    vaquinhaGoal: 15000,
    vaquinhaCollected: 12450,
    vaquinhaValuePerPerson: 100,
    selectedTemplate: "neon-tokyo",
    backgroundColor: "#0b1326",
    fontFamily: "Outfit",
    coverImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuDvd8oMbkabVu-PijBUrfdVKi4zBd9ILL1gkaT8wSB7xL_ohgTBKPDFnSAuwq-AH4TsZrQVhX7d7bpfO8_dS7lDQVmGWzQStvwdfWiposVIeN3CXaZxVm6APjzm_DixHzfNtw6weB2OsPfKAJI-MadHNLMiQuO-SrF_uzOTREGHQ8vTAMiOnr1TOBTvj_uTas3_6AwTmbMZAX5cEmXAWiYARmR4F3MmJS5GrDcWVTaYp32nE_tb6x3TpqqCDRmsXVCgnkJUSs6AM5E",
    vibeScore: 9.8,
    djSetlistReady: true,
    dressingCode: "Cyber Chic",
    guests: [
      { id: "g1", name: "Julia Mendes", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuC5OEoHxs6KaUj6UAXJGK6T0fvLGe8SXtA4edUFsgCPdAsachgS2chJvIrmbZsOSVq3EnZVTcRU1qHyWtTiafWDQptWfcQT7Dvz2xYIywGavKY0vb88pATMNb_seU5fyiYERFCmg_QFMyrEyWRalLHSd_HRVcqKZmHTkzAwBObJvaF6AnPyZstDAHkngnlxnJPCK_QgOD56JIv-57NxP5yYYBvHWKI-cX5XOr4JopQTISES6QKBajxlbkLKpdmHxvvshia8vi7cJ50", status: "VOU", confirmedAt: "2026-06-09T08:00:00Z" },
      { id: "g2", name: "Marcus P.", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuArK61BoYc5JbkwTVZVVeIdEBKTCLNx2Ittz7BonYrIJr5dR4I9_iqgNTl_t2I21c7YCxhBVU4afxtoI8E78ecrnxc9ViZD1QJONKGhl4bXLu_XT6Gdm37W15E7pspZPXBLQ2TKko3zCBwJJRRWaSnGXJ3I9R4qRxF6X1Py4OBo5d9h-1_ylmo_A4tB1asmcNhWOJN1dlcbX2Jty4z3r0noPPoIwkPAD9pYDYOVscxCTueTD3CpzAGlhc9tB0nUlYYQ3Wk9NRBzhM4", status: "VOU", confirmedAt: "2026-06-09T08:15:00Z" },
      { id: "g3", name: "Lucas Tech", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDRt0uDEqwQNtWX2A0BwPnCJUimTVmoSDxw3BzVAob7Na5khcKEXfXlOSXkwlnlHUwv3GKV4g33Wyr30V5l70Kn8JRO8uVd-9ErpczCfuvGX8gO6q9iQekuCyVm7NOD7pXSVECEPVC_slHVxJAJUNwLUf3nJl5DGdgqlDZ0nzf7_tfzrmOcyRqbtp2-jzOYvlJkuYNdEcL8A0keNdc0KlK9s-scxiPEW-vykuKSFwl_dEnz_hQuBOAtcScWafWeeaTwmXdVx6oF_h0", status: "VOU", confirmedAt: "2026-06-09T10:00:00Z" }
    ],
    contributions: [
      { id: "c1", contributorName: "Julia Mendes", contributorAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuC5OEoHxs6KaUj6UAXJGK6T0fvLGe8SXtA4edUFsgCPdAsachgS2chJvIrmbZsOSVq3EnZVTcRU1qHyWtTiafWDQptWfcQT7Dvz2xYIywGavKY0vb88pATMNb_seU5fyiYERFCmg_QFMyrEyWRalLHSd_HRVcqKZmHTkzAwBObJvaF6AnPyZstDAHkngnlxnJPCK_QgOD56JIv-57NxP5yYYBvHWKI-cX5XOr4JopQTISES6QKBajxlbkLKpdmHxvvshia8vi7cJ50", amount: 100, message: "Aproveitem muito a lua de mel!", createdAt: "2026-06-09T08:02:00Z" }
    ],
    vibeWall: [
      { id: "v1", url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAJuBz5OfrhcNI5Ffc8G5vY3oZGxaHXirpy053XKUP-Bvsg2ZQrYPI4aYMVyD7Y0uxDAUskzh-OhfjZcb9VLFlZixMS0ghjqn1jUMwALXY3otuKHKQ6NP6-EDX1W8LR5gIBsvrz0oYTGOjprTmiVB2Ou9_tFyC3u1n9FwbIZPr_nS4vtlpC-Rvn8Qk68bl9oTDzPC3hm2rW5AW8q3nTHFHJd52zTAJ4HVh9w4ObyStmkh1Z5HrC5j3sUfC1ROMFL1sAFICNrlYMGv8", authorName: "Lucas M.", authorAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuArK61BoYc5JbkwTVZVVeIdEBKTCLNx2Ittz7BonYrIJr5dR4I9_iqgNTl_t2I21c7YCxhBVU4afxtoI8E78ecrnxc9ViZD1QJONKGhl4bXLu_XT6Gdm37W15E7pspZPXBLQ2TKko3zCBwJJRRWaSnGXJ3I9R4qRxF6X1Py4OBo5d9h-1_ylmo_A4tB1asmcNhWOJN1dlcbX2Jty4z3r0noPPoIwkPAD9pYDYOVscxCTueTD3CpzAGlhc9tB0nUlYYQ3Wk9NRBzhM4", createdAt: "2026-06-09T10:10:00Z", likes: 8 },
      { id: "v2", url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBqBAxfRug6A5uYzu8wUQYrVHMXGZ4jpWg3c9RoOjA8zC3GyeuvKKCOXDH9XRpSxpHLh7ZWAiBIUY0Ea1mCJHwRfoqC3yrylD7f4Q2fcSeCloqWP4TBXguaBymUodddCzhZGZNsAQxtmZiKpXy5yVzE86TnxsXpBte6Zt2QKbg_LJUMxeb7ufzK7jsPOu-g_u4ntpQTMSEdRNyP6JLjv4vTPK4GIlU9s4z8OIn0kqwDNXK1biBF8ksUzdqbjkMlodn-Oko1re0LSro", authorName: "Ana Flávia", authorAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBKSXNBNDcgkW_kpuFWxy1K4JoCFRnRGhlKTWH5wBdFiYIUK-ooXMPzi4WByrNnVgqDmcw5C22I3Znylon5Zy5rVxsUaOrkCUZZDHeF2ODRPhptaqNTYltg3cJDgWcVy6nkB7K41jrXJoYQByHFaPIbfkLsQnoteEz4Bu6qMmtmR77R-EONvLb_DIU2i6k0MYVhLqdPCee2eyb_OdO_IGJ-ZOS33FAqPrPFGPhrtMYPXtVi43v3ZB3tXaIgkw2Zvohq0OM3PcX_-j8", createdAt: "2026-06-09T10:15:00Z", likes: 5 }
    ],
    status: "ACTIVE"
  },
  {
    id: "brunch-domingo",
    name: "Brunch de Domingo",
    type: "outros",
    dateTime: "2026-06-21T11:30",
    location: "Vila Madalena Rooftop, São Paulo",
    description: "Um brunch ultra sofisticado ao por do sol, com espumante de cortesia no rooftop. Minimalismo e luz dourada para curtir com os amigos.",
    isPublic: false,
    requiresApproval: true,
    allowPlusOne: false,
    peopleLimit: 40,
    rsvpDeadline: "2026-06-19",
    vaquinhaEnabled: false,
    vaquinhaCollected: 0,
    selectedTemplate: "ethereal",
    backgroundColor: "#2d3449",
    fontFamily: "Outfit",
    coverImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuCv7WfwYkfV3L03TrbAol7a2A1d7AdM0P_iBGMeQkLxkNba7U1O_50fWqUSYHFKZyuw6BN2ywJ9XR6Wp8GH7qCwJddii_mjumhpKKdBuG2rY5-misZpnIh6kiGSxY8LTFcLg1uWWBy3uzsc6gbBUhBzcmXPiOooBp07B5EISl5pZ7pJ3RqftrrfmyqpMdnekQTXtMnnIHDQF5c7x-eYYxRFBQW-OTRCSnOCow3mjrBIuEHU9aOC6Zead_iOvTw8SiRtFDvEuWgcCbg",
    vibeScore: 9.0,
    djSetlistReady: false,
    dressingCode: "Comfy Chic / Neutral",
    guests: [],
    contributions: [],
    vibeWall: [],
    status: "DRAFT"
  },
  {
    id: "creative-jam",
    name: "Creative Jam Session",
    type: "outros",
    dateTime: "2026-06-12T14:00",
    location: "Co-working Art Space, Vila Madalena",
    description: "Tarde criativa para designers, músicos e mentes livres. Traga suas ferramentas e junte-se a essa troca de energia pura e arte.",
    isPublic: true,
    requiresApproval: false,
    allowPlusOne: true,
    peopleLimit: 80,
    rsvpDeadline: "2026-06-11",
    vaquinhaEnabled: false,
    vaquinhaCollected: 0,
    selectedTemplate: "neural",
    backgroundColor: "#0b1326",
    fontFamily: "mono",
    coverImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuCdRgAw0ZKWc8S1_7mZQGihRLCYVToydCHXf5Vn524qx8chbQyDstcx8NAdKM29jMC_WBcsV0ZW3peBoK64apF8v0TKLfAKpsqXAbkKcOHE_yBupnzOR91X8YOvd8AoewP1M8MyBa4CsHI7mace6XzGWmpBdzyHDzjbGMcUQxGgVnzhlR-R_MMAszvKQbbfAMiEpvJ5lE-j8KDvW36OyntKAfxuCdroAx4WMCCtDy6HXiLICbPEbKjOWdDhkADwQ4Bb_cDagmL_JPQ",
    vibeScore: 8.5,
    djSetlistReady: true,
    dressingCode: "Creative Indiewear",
    guests: [],
    contributions: [],
    vibeWall: [],
    status: "ACTIVE"
  },
  {
    id: "tech-founders",
    name: "Tech Founders Mixer",
    type: "outros",
    dateTime: "2026-06-11T19:00",
    location: "The Lab Space, Pinheiros, São Paulo",
    description: "Happy hour exclusivo para fundadores e mentes brilhantes de startups. Conexões reais em um espaço imersivo com luzes futuristas.",
    isPublic: true,
    requiresApproval: true,
    allowPlusOne: false,
    peopleLimit: 120,
    rsvpDeadline: "2026-06-10",
    vaquinhaEnabled: false,
    vaquinhaCollected: 0,
    selectedTemplate: "liquid-glass",
    backgroundColor: "#002f38",
    fontFamily: "Outfit",
    coverImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuC2qyavauRIr-7K0Fs_YpuLgs2-Qmksow-c3z8dgetfzCvuboRZsVY2pOHcstN5JFoiyx1aEb3CLMp3c_1zt-67cAIH8TQAE9DLswY9miI1vcgRxnkGLDmh17a57Zf3nBvxotDoJOo7FsgF2lm3w1PEdpWegZPUgDYFx6NZtpi8qUo0_KSjbDQ375a_PoHFrImbCvCjDzOs61ISdOwS33k5tdkuGt4cDf96uMLHXAp4sc_q5cDw_Sf_-vme1gZLNkYvARFiUFj1Rvs",
    vibeScore: 9.5,
    djSetlistReady: true,
    dressingCode: "Tech Casual",
    guests: [],
    contributions: [],
    vibeWall: [],
    status: "ACTIVE"
  }
];

let events = [...defaultEvents];

// Persistence Helpers
function loadPersistedData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const rawData = fs.readFileSync(DATA_FILE, "utf-8");
      events = JSON.parse(rawData);
      console.log(`Loaded ${events.length} events from database.`);
    } else {
      savePersistedData();
    }
  } catch (err) {
    console.error("Error reading persistence DB file, reverting to defaults.", err);
  }
}

function savePersistedData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(events, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing persistence DB file", err);
  }
}

loadPersistedData();

// API REST routes
// 1. Get all events
app.get("/api/events", (req, res) => {
  res.json(events);
});

// 2. Get event by id
app.get("/api/events/:id", (req, res) => {
  const event = events.find((e) => e.id === req.params.id);
  if (!event) {
    return res.status(404).json({ error: "Evento não encontrado" });
  }
  res.json(event);
});

// 3. Create event
app.post("/api/events", (req, res) => {
  const newEventData = req.body;
  if (!newEventData.name) {
    return res.status(400).json({ error: "Nome do evento é obrigatório" });
  }

  // Cover image mapper based on template or random fallback
  let fallbackCover = "https://lh3.googleusercontent.com/aida-public/AB6AXuBUSpL12c9kIy1AQ6nDdqKtNeNAeEGiJ-db6GVsa3_SXGNr4DIqeFewloMLm4XhpQYlyG0i2yHWBe-uF_Tvtz2dLnPLMVW47RGR3B8QdGt5CklYJS6btAIKBfZh7tz6C1G73X-r6et5dhl0vf0WiGHjTqXKCGpnGFYfYVbsHTp86c6Djqrd5MNC1OSUya0HJzwKix0Tp7lXwDg3dmlRGIqLA7wfkTFO6ZDnXnXT6O1tTmDouCfYCLSn6arttHnZsangFXLl7CHAscg";
  if (newEventData.selectedTemplate === "neon-tokyo") {
    fallbackCover = "https://lh3.googleusercontent.com/aida-public/AB6AXuDdbAy5Olq_N-F6XUCgc2OUYm31P95HhrhoTm7X3RcycenRFu10fZazVwOlGriTBePlFbJOQ8b5iIbWvR2NYoBhQIgB-e2Ko5iI2pZvPUFUebsTlMhDM6rnmSGosP9_9D42HJda2kdsWrE-BDtXd5prryFPhVAuJZvUy27VDQ3s7QONVHBA2uCK7IdTsXLpCBGKifNAs378tToSsALKsro0WNQT1zqdesN6H-6i8vT8R3Ln70WseDalQoNJD9gQ4kLi73lT65IoDZ4";
  } else if (newEventData.selectedTemplate === "ethereal") {
    fallbackCover = "https://lh3.googleusercontent.com/aida-public/AB6AXuBlzwN2WuDvH8HAct9GJtN4TjKX6suPlt7tKqaVm3E3PAmBatcerm_cgNmJ6VZtGiR7Q3Gdd-lW2SAgPe_1lWRg9DY49URTdC_KWYzFzCM-kyyfXAHbwImvQJkOQNBfvWW2yaOtY-_3vaUKv6881Osfkq0MNvTk4Y1RQsO_qtGk0Dgqi8yAbFX0pYbk3e3uwWvgBHFyV-pDc40Bc0ERVeFjUvTVe4YdRiwcGkNCyQ1LE2Y6E5M5749y7PRLFX5z-h0EiAqsQ78psSM";
  }

  const generatedId = newEventData.name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-") + "-" + Math.floor(Math.random() * 1000);

  const cleanEvent = {
    id: generatedId,
    name: newEventData.name,
    type: newEventData.type || "outros",
    dateTime: newEventData.dateTime || new Date().toISOString().slice(0, 16),
    location: newEventData.location || "Local em Breve",
    description: newEventData.description || "",
    isPublic: newEventData.isPublic !== undefined ? newEventData.isPublic : true,
    requiresApproval: newEventData.requiresApproval !== undefined ? newEventData.requiresApproval : false,
    allowPlusOne: newEventData.allowPlusOne !== undefined ? newEventData.allowPlusOne : true,
    peopleLimit: newEventData.peopleLimit ? Number(newEventData.peopleLimit) : null,
    rsvpDeadline: newEventData.rsvpDeadline || null,
    vaquinhaEnabled: !!newEventData.vaquinhaEnabled,
    vaquinhaGoal: newEventData.vaquinhaGoal ? Number(newEventData.vaquinhaGoal) : null,
    vaquinhaCollected: 0,
    vaquinhaValuePerPerson: newEventData.vaquinhaValuePerPerson ? Number(newEventData.vaquinhaValuePerPerson) : null,
    selectedTemplate: newEventData.selectedTemplate || "neon-tokyo",
    backgroundColor: newEventData.backgroundColor || "#0b1326",
    fontFamily: newEventData.fontFamily || "Outfit",
    coverImage: newEventData.coverImage || fallbackCover,
    vibeScore: Number((7.0 + Math.random() * 2.8).toFixed(1)),
    djSetlistReady: Math.random() > 0.3,
    dressingCode: newEventData.dressingCode || "Cyber Chic",
    guests: [],
    contributions: [],
    vibeWall: [],
    status: newEventData.status || "ACTIVE"
  };

  events.unshift(cleanEvent);
  savePersistedData();
  res.status(201).json(cleanEvent);
});

// 4. Update Event details / configuration / design
app.put("/api/events/:id", (req, res) => {
  const index = events.findIndex((e) => e.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Evento não encontrado" });
  }

  const existing = events[index];
  const updatedData = req.body;

  events[index] = {
    ...existing,
    ...updatedData,
    id: existing.id, // ID must remain structural
    guests: existing.guests, // retain guests array unless mutated specifically
    contributions: existing.contributions,
    vibeWall: existing.vibeWall,
    vaquinhaCollected: existing.vaquinhaCollected // preserve accrued wallet amount
  };

  savePersistedData();
  res.json(events[index]);
});

// 5. Delete or change status
app.delete("/api/events/:id", (req, res) => {
  const index = events.findIndex((e) => e.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Evento não encontrado" });
  }
  events.splice(index, 1);
  savePersistedData();
  res.json({ success: true });
});

// 6. Confirm attendance (RSVP)
app.post("/api/events/:id/rsvp", (req, res) => {
  const event = events.find((e) => e.id === req.params.id);
  if (!event) {
    return res.status(404).json({ error: "Evento não encontrado" });
  }

  const { name, phone, avatar, status } = req.body;
  if (!name || !status) {
    return res.status(400).json({ error: "Nome e status são obrigatórios" });
  }

  const guestId = "g-" + Math.floor(Math.random() * 100000);
  const newGuest = {
    id: guestId,
    name,
    phone: phone || "",
    avatar: avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuBNCV4-eHpvPuW5TzqjJE7wuHUafcHpR4haj9FaBRIS9j7mLCko6G3rO4wCMGazWbmJk4RKYse_2Qzypy6i8APrWiCq5RJRx8Lm_E7ox8zW4Oxk2gHu8KtkiE-LwKJQNEr--GuOig-Xf46AlLmU-0LERrjwrV0pADd8jGj7lRu-yPFXsg-xQG3AKcf7T4Yu4AdQH1jtJenqTvXkmmlYWLQdL7Rm0bKBUfSKbCoSG3Jek9ObHMaUlEO5m0rqmqqu0oHe7rhRIvQfU38",
    status,
    confirmedAt: new Date().toISOString()
  };

  // Remove existing RSVP from same name to clean up duplicates
  event.guests = event.guests.filter((g) => g.name.toLowerCase() !== name.toLowerCase());
  event.guests.push(newGuest);

  savePersistedData();
  res.json(event);
});

// 6b. Toggle guest payment status (paid/unpaid)
app.post("/api/events/:id/guests/:guestId/toggle-paid", (req, res) => {
  const event = events.find((e) => e.id === req.params.id);
  if (!event) {
    return res.status(404).json({ error: "Evento não encontrado" });
  }

  const guest = event.guests.find((g) => g.id === req.params.guestId);
  if (!guest) {
    return res.status(404).json({ error: "Convidado não encontrado" });
  }

  guest.paid = !guest.paid;
  savePersistedData();
  res.json(event);
});

// 7. Contribute to Honeymoon Fund / Vaquinha
app.post("/api/events/:id/fund", (req, res) => {
  const event = events.find((e) => e.id === req.params.id);
  if (!event) {
    return res.status(404).json({ error: "Evento não encontrado" });
  }

  const { contributorName, contributorAvatar, amount, message } = req.body;
  if (!contributorName || !amount) {
    return res.status(400).json({ error: "Nome e quantia são obrigatórios" });
  }

  const contributionId = "c-" + Math.floor(Math.random() * 100000);
  const contribution = {
    id: contributionId,
    contributorName,
    contributorAvatar: contributorAvatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuBNCV4-eHpvPuW5TzqjJE7wuHUafcHpR4haj9FaBRIS9j7mLCko6G3rO4wCMGazWbmJk4RKYse_2Qzypy6i8APrWiCq5RJRx8Lm_E7ox8zW4Oxk2gHu8KtkiE-LwKJQNEr--GuOig-Xf46AlLmU-0LERrjwrV0pADd8jGj7lRu-yPFXsg-xQG3AKcf7T4Yu4AdQH1jtJenqTvXkmmlYWLQdL7Rm0bKBUfSKbCoSG3Jek9ObHMaUlEO5m0rqmqqu0oHe7rhRIvQfU38",
    amount: Number(amount),
    message,
    createdAt: new Date().toISOString()
  };

  event.contributions.push(contribution);
  event.vaquinhaCollected = (event.vaquinhaCollected || 0) + Number(amount);

  // Automatically mark guest with the same name as paid
  const matchedGuest = event.guests.find(
    (g) => g.name.toLowerCase().trim() === contributorName.toLowerCase().trim()
  );
  if (matchedGuest) {
    matchedGuest.paid = true;
  }

  savePersistedData();
  res.json(event);
});

// 8. Add media to Vibe Wall (base64 or URL)
app.post("/api/events/:id/vibe-wall", (req, res) => {
  const event = events.find((e) => e.id === req.params.id);
  if (!event) {
    return res.status(404).json({ error: "Evento não encontrado" });
  }

  const { url, authorName, authorAvatar } = req.body;
  if (!url || !authorName) {
    return res.status(400).json({ error: "URL da imagem e autor são necessários" });
  }

  const vibeId = "v-" + Math.floor(Math.random() * 100000);
  const newVibe = {
    id: vibeId,
    url,
    authorName,
    authorAvatar: authorAvatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuBNCV4-eHpvPuW5TzqjJE7wuHUafcHpR4haj9FaBRIS9j7mLCko6G3rO4wCMGazWbmJk4RKYse_2Qzypy6i8APrWiCq5RJRx8Lm_E7ox8zW4Oxk2gHu8KtkiE-LwKJQNEr--GuOig-Xf46AlLmU-0LERrjwrV0pADd8jGj7lRu-yPFXsg-xQG3AKcf7T4Yu4AdQH1jtJenqTvXkmmlYWLQdL7Rm0bKBUfSKbCoSG3Jek9ObHMaUlEO5m0rqmqqu0oHe7rhRIvQfU38",
    createdAt: new Date().toISOString(),
    likes: 0
  };

  event.vibeWall.unshift(newVibe);
  savePersistedData();
  res.json(event);
});

// 9. Like vibe check photo
app.post("/api/events/:id/vibe-wall/:photoId/like", (req, res) => {
  const event = events.find((e) => e.id === req.params.id);
  if (!event) {
    return res.status(404).json({ error: "Evento não encontrado" });
  }

  const photo = event.vibeWall.find((v) => v.id === req.params.photoId);
  if (!photo) {
    return res.status(404).json({ error: "A foto não existe" });
  }

  photo.likes = (photo.likes || 0) + 1;
  savePersistedData();
  res.json(event);
});

// 10. Gemini Vibe Copilot Suggestion Generator
app.post("/api/ai/suggest", async (req, res) => {
  if (!ai) {
    return res.status(503).json({
      error: "O serviço de IA do Gemini não está configurado nesta instância. Verifique se o segredo GEMINI_API_KEY foi adicionado.",
    });
  }

  const { title, type } = req.body;
  if (!title) {
    return res.status(400).json({ error: "O título do evento é necessário para gerar sugestões." });
  }

  try {
    const prompt = `Gere uma descrição atraente de convite em português e um dress code que combine perfeitamente para um evento chamado "${title}" do tipo "${type || "outros"}".
Seja moderno, focado em influências digitais e estéticas da geração Z (Cyber Chic, Tech Casual, Minimal, Sunset Sunset).
Responda APENAS em JSON em formato plano, sem blocos de código markdown ou texto explicativo extra:
{
  "description": "Texto da descrição aqui rápido e envolvente",
  "dressingCode": "Nome Curto Do Dress Code"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const solution = response.text ? JSON.parse(response.text.trim()) : { 
      description: "Prepare-se para uma experiência lendária e única com nosso coletivo.", 
      dressingCode: "Vibe Própria" 
    };
    
    res.json(solution);
  } catch (error: any) {
    console.error("Gemini suggestion failed:", error);
    res.status(500).json({ error: "Falha na geração com Inteligência Artificial: " + error.message });
  }
});

// Mock phone OTP services
app.post("/api/auth/register-phone", (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ error: "Número de celular inválido." });
  }
  // Simply mock successful trigger
  res.json({ success: true, message: "Código enviado com sucesso!" });
});

app.post("/api/auth/verify-otp", (req, res) => {
  const { code } = req.body;
  if (!code || code.length < 4) {
    return res.status(400).json({ error: "Código inválido." });
  }
  res.json({ success: true });
});

// Vite Setup with Express Middleware Fallback
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Solstice server listening at http://localhost:${PORT}`);
  });
}

startServer();
