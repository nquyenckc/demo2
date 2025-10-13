// ================================
// 📦 BlackTea POS v2 - app.js
// ================================

document.addEventListener("DOMContentLoaded", () => {
  khoiTaoUngDung();
});

function khoiTaoUngDung() {
  console.log("🚀 Khởi động BlackTea POS v2...");
  hienThiManHinhChinh();
}

// ================================
// 🏠 Màn hình chính
// ================================

function hienThiManHinhChinh() {
  const main = document.querySelector(".main-container");
  main.innerHTML = `
    <div class="btn-group">
      <button id="btnMangDi" class="btn">Khách mang đi</button>
      <button id="btnGheQuan" class="btn">Khách ghé quán</button>
    </div>

    <div class="table-list">
      <p class="empty-state">Chưa có đơn hàng nào</p>
    </div>
  `;

  document.getElementById("btnMangDi").addEventListener("click", () => {
    hienThiManOrder("Khách mang đi");
  });

  document.getElementById("btnGheQuan").addEventListener("click", () => {
    themKhachTaiQuan(); // gọi popup chọn bàn
  });
}


// Chọn bàn cho khách tại quán
function themKhachTaiQuan() {
  // Tạo lớp overlay + popup
  const overlay = document.createElement("div");
  overlay.className = "popup-overlay";

  const popup = document.createElement("div");
  popup.className = "popup-table";

popup.innerHTML = `
  <fieldset>
    <legend>Bàn trên lầu</legend>
    <div class="group">
      ${["L1","L2","L3","L4"].map(b => `<button class="ban-btn">${b}</button>`).join("")}
    </div>
  </fieldset>

  <fieldset>
    <legend>Bàn ngoài trời</legend>
    <div class="group">
      ${["NT1","NT2"].map(b => `<button class="ban-btn">${b}</button>`).join("")}
    </div>
  </fieldset>

  <div class="table-row">
    <fieldset class="table-col">
      <legend>Bàn tường</legend>
      <div class="group-vertical">
        ${["T1","T2","T3","T4"].map(b => `<button class="ban-btn">${b}</button>`).join("")}
      </div>
    </fieldset>

    <fieldset class="table-col">
      <legend>Bàn giữa</legend>
      <div class="group-vertical">
        ${["G1","G2","G3","G4"].map(b => `<button class="ban-btn">${b}</button>`).join("")}
      </div>
    </fieldset>

    <fieldset class="table-col">
      <legend>Bàn nệm</legend>
      <div class="group-vertical">
        ${["N1","N2","N3","N4"].map(b => `<button class="ban-btn">${b}</button>`).join("")}
      </div>
    </fieldset>
  </div>

  <div class="popup-actions">
    <button class="btn-cancel">Huỷ</button>
    <button class="btn-primary">Chọn bàn</button>
  </div>
`;


  overlay.appendChild(popup);
  document.body.appendChild(overlay);

  // --- Xử lý chọn bàn ---
  let banDuocChon = null;

  popup.querySelectorAll(".ban-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      popup.querySelectorAll(".ban-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      banDuocChon = btn.textContent;
    });
  });

  // --- Nút Huỷ ---
  popup.querySelector(".btn-cancel").addEventListener("click", () => {
    overlay.remove();
  });

  // --- Nút Chọn bàn ---
  popup.querySelector(".btn-primary").addEventListener("click", () => {
    if (!banDuocChon) {
      alert("Vui lòng chọn bàn!");
      return;
    }

    // Tạo bàn mới hoặc lấy bàn cũ
    const timThay = TABLES.find(b => b.name === banDuocChon);
    let banHienTai;
    if (timThay) {
      banHienTai = timThay;
    } else {
      banHienTai = {
        id: Date.now(),
        name: banDuocChon,
        items: [],
        total: 0,
        time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
      };
      TABLES.push(banHienTai);
      luuToanBoDuLieu();
    }

    currentTable = banHienTai;
    overlay.remove(); // đóng popup
    hienThiManOrder(banHienTai.name); // mở order tương ứng
  });
}

function themBanCoTen(tenBan) {
  const timThay = TABLES.find(b => b.name === tenBan);
  if (timThay) {
    moBan(timThay.id);
    return;
  }

  const banMoi = {
    id: Date.now(),
    name: tenBan,
    items: [],
    total: 0,
    time: new Date().toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit"
    })
  };

  TABLES.push(banMoi);
  luuToanBoDuLieu();
  moBan(banMoi.id);
}

function moBan(idBan) {
  const ban = TABLES.find(b => b.id === idBan);
  if (!ban) return;
  currentTable = ban;
  hienThiManOrder(ban.name);
}
