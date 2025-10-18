// ================================
// 📦 BlackTea POS v2.3 - app.js (đã chỉnh chọn bàn kiểu icon ghế)
// ================================

// 🔢 Biến đếm đơn "Mang đi"
let demMangDi = 0;

// ✅ Tải dữ liệu khi mở trang
window.addEventListener("load", () => {
  const saved = localStorage.getItem("BT_TABLES");
  if (saved) hoaDonChinh = JSON.parse(saved); // ✅ đổi TABLES → hoaDonChinh
  loadDemMangDi();
});

// ✅ Lưu dữ liệu ra localStorage
function saveAll() {
  localStorage.setItem("BT_TABLES", JSON.stringify(hoaDonChinh)); // ✅ đổi TABLES → hoaDonChinh
}

// ✅ Lưu và tải bộ đếm mang đi (reset mỗi ngày)
function loadDemMangDi() {
  const data = JSON.parse(localStorage.getItem("BT_DEM_MANGDI") || "{}");
  const today = new Date().toLocaleDateString("vi-VN");

  if (data.date === today) {
    demMangDi = data.count || 0;
  } else {
    demMangDi = 0;
    localStorage.setItem("BT_DEM_MANGDI", JSON.stringify({ date: today, count: 0 }));
  }
}

function saveDemMangDi() {
  const today = new Date().toLocaleDateString("vi-VN");
  localStorage.setItem("BT_DEM_MANGDI", JSON.stringify({ date: today, count: demMangDi }));
}

// ✅ Sinh tên khách theo loại
function taoTenKhach(loai, maBan = "") {
  if (loai === "Khách mang đi") {
    demMangDi++;
    saveDemMangDi();
    return `Mang đi ${demMangDi}`;
  }

  if (loai.startsWith("Khách tại bàn")) {
    if (maBan.startsWith("L")) return `Bàn lầu ${maBan.slice(1)}`;
    if (maBan.startsWith("NT")) return `Bàn ngoài trời ${maBan.slice(2)}`;
    if (maBan.startsWith("T")) return `Bàn tường ${maBan.slice(1)}`;
    if (maBan.startsWith("G")) return `Bàn giữa ${maBan.slice(1)}`;
    if (maBan.startsWith("N")) return `Bàn nệm ${maBan.slice(1)}`;
  }

  return loai;
}

// ================================
// 🚀 Khởi động ứng dụng
// ================================
document.addEventListener("DOMContentLoaded", () => {
  khoiTaoUngDung();
});

function khoiTaoUngDung() {
  console.log("🚀 Khởi động BlackTea POS v2.3...");
  hienThiManHinhChinh();
}

// ================================
// 🏠 Màn hình chính
// ================================
function hienThiManHinhChinh() {
  const main = document.querySelector(".main-container");
  main.innerHTML = `
    <div class="btn-group">
      <button id="btnMangDi" class="btn hieuung-noi">Khách mang đi</button>
      <button id="btnGheQuan" class="btn hieuung-noi">Khách ghé quán</button>
    </div>

    <div class="table-list"></div>
  `;

  // 👉 Gắn sự kiện
  document.getElementById("btnMangDi").addEventListener("click", () => {
    khoiTaoOrder("Khách mang đi"); 
  });

  document.getElementById("btnGheQuan").addEventListener("click", () => {
    themKhachTaiQuan();
  });

  renderTables();
}

// ================================
// 🧾 Hiển thị danh sách đơn ngoài màn hình chính
// ================================
function renderTables() {
  const div = document.querySelector(".table-list");
  const dsDon = hoaDonChinh || [];

  if (dsDon.length === 0) {
    div.innerHTML = `<p class="empty-state">Chưa có đơn hàng nào</p>`;
    return;
  }

  div.innerHTML = dsDon.map((t) => {
    const tongTien = t.cart.reduce((a, m) => a + m.price * m.soluong, 0).toLocaleString();
    const soMon = t.cart.length;
    const coGhiChu = t.cart.some((m) => m.note && m.note.trim() !== "");
    const trangThai = "waiting";

    const iconTrangThai = `<i class="fa-solid fa-mug-hot main"></i>`;
    const iconNote = coGhiChu ? `<i class="fa-solid fa-note-sticky note"></i>` : "";

    return `
      <div class="order-card ${trangThai}">
        <div class="order-left">
          <div class="order-name">${t.name}</div>
          <div class="order-info">${soMon} món • ${tongTien}đ</div>
          <div class="order-time">
            ${new Date(t.createdAt).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
        <div class="status-box ${trangThai}">
          ${iconTrangThai}
          ${iconNote}
        </div>
      </div>
    `;
  }).join("");
}

// ================================
// 🪑 Popup chọn bàn kiểu icon ghế
// ================================
function themKhachTaiQuan() {
  const overlay = document.createElement("div");
  overlay.className = "popup-overlay";

  const popup = document.createElement("div");
  popup.className = "popup-table";

  popup.innerHTML = `
    <fieldset>
      <legend>Bàn trên lầu</legend>
      <div class="group">
        ${["L1","L2","L3","L4"].map(b => `
          <div class="icon-box" onclick="chonBanIcon(this,'${b}')">
            <i class="fas fa-couch"></i>
            <span>${b}</span>
          </div>
        `).join("")}
      </div>
    </fieldset>

    <fieldset>
      <legend>Bàn ngoài trời</legend>
      <div class="group">
        ${["NT1","NT2"].map(b => `
          <div class="icon-box" onclick="chonBanIcon(this,'${b}')">
            <i class="fas fa-couch"></i>
            <span>${b}</span>
          </div>
        `).join("")}
      </div>
    </fieldset>

    <div class="table-row">
      <fieldset class="table-col">
        <legend>Bàn tường</legend>
        <div class="group-vertical">
          ${["T1","T2","T3","T4"].map(b => `
            <div class="icon-box" onclick="chonBanIcon(this,'${b}')">
              <i class="fas fa-couch"></i>
              <span>${b}</span>
            </div>
          `).join("")}
        </div>
      </fieldset>

      <fieldset class="table-col">
        <legend>Bàn giữa</legend>
        <div class="group-vertical">
          ${["G1","G2","G3","G4"].map(b => `
            <div class="icon-box" onclick="chonBanIcon(this,'${b}')">
              <i class="fas fa-couch"></i>
              <span>${b}</span>
            </div>
          `).join("")}
        </div>
      </fieldset>

      <fieldset class="table-col">
        <legend>Bàn nệm</legend>
        <div class="group-vertical">
          ${["N1","N2","N3","N4"].map(b => `
            <div class="icon-box" onclick="chonBanIcon(this,'${b}')">
              <i class="fas fa-couch"></i>
              <span>${b}</span>
            </div>
          `).join("")}
        </div>
      </fieldset>
    </div>

    <div class="popup-actions">
      <button class="btn-cancel hieuung-noi">Huỷ</button>
      <button class="btn-primary hieuung-noi">Chọn bàn</button>
    </div>
  `;

  overlay.appendChild(popup);
  document.body.appendChild(overlay);

  let banDuocChon = null;

  // Sự kiện cho các nút
  popup.querySelector(".btn-cancel").addEventListener("click", () => overlay.remove());

  popup.querySelector(".btn-primary").addEventListener("click", () => {
    if (!banDuocChon) {
      hienThongBao("Vui lòng chọn bàn");
      return;
    }
    overlay.remove();

    const tenDon = taoTenKhach("Khách tại bàn", banDuocChon);
    khoiTaoOrder(tenDon);
  });

  // Hàm chọn bàn icon
  window.chonBanIcon = function (el, maBan) {
    popup.querySelectorAll(".icon-box").forEach(e => e.classList.remove("active"));
    el.classList.add("active");
    banDuocChon = maBan;
  };
}


