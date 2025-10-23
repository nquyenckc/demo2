// ================================
// 📦 BlackTea POS v2.3 - app.js (nút X thống nhất)
// ================================

// 🔢 Biến đếm đơn "Mang đi"
let demMangDi = 0;

// ✅ Tải dữ liệu khi mở trang
window.addEventListener("load", () => {
  try {
    const saved = localStorage.getItem("BT_TABLES");
    if (saved) hoaDonChinh = JSON.parse(saved);
    loadDemMangDi();

    if (typeof renderTables === "function") renderTables();
  } catch (err) {
    console.error("Lỗi khi load dữ liệu:", err);
  }
});

// ✅ Lưu dữ liệu ra localStorage
function saveAll() {
  localStorage.setItem("BT_TABLES", JSON.stringify(hoaDonChinh));
}

// ✅ Lưu và tải bộ đếm mang đi
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

  khoiPhucHeaderMacDinh();

  document.getElementById("btnMangDi").addEventListener("click", () => {
    khoiTaoOrder("Khách mang đi");
    const orderContainer = document.querySelector(".order-container");
    if (orderContainer) openScreen(orderContainer);
  });

  document.getElementById("btnGheQuan").addEventListener("click", () => {
    themKhachTaiQuan();
  });

  renderTables();
}

function khoiPhucHeaderMacDinh() {
  const header = document.querySelector("header");
  if (!header) return;

  header.innerHTML = `
    <h1>BlackTea</h1>
    <div class="header-icons">
      <span id="btnLichSu" class="icon-btn" title="Lịch sử thanh toán">
        <i class="fas fa-clock-rotate-left" style="color:white;"></i>
      </span>
      <span class="icon-btn" title="Cài đặt">
        <i class="fas fa-gear" style="color:white;"></i>
      </span>
    </div>
  `;

  document.getElementById("btnLichSu")?.addEventListener("click", hienThiLichSuThanhToan);
}

// ================================
// 🧾 Danh sách đơn ngoài màn hình chính
// ================================
function renderTables() {
  const div = document.querySelector(".table-list");
  const dsDon = hoaDonChinh || [];

  if (dsDon.length === 0) {
    div.innerHTML = `<p class="empty-state">Chưa có đơn hàng nào</p>`;
    return;
  }

  const danhSachHienThi = [...dsDon].reverse();

  div.innerHTML = danhSachHienThi
    .map((t, i) => {
      const tongTien = t.cart.reduce((a, m) => a + m.price * m.soluong, 0).toLocaleString();
      const soMon = t.cart.length;
      const coGhiChu = t.cart.some((m) => m.note && m.note.trim() !== "");
      const trangThai = t.status || "waiting";
      const iconTrangThai = `<img src="icons/caphe.svg" class="icon-app" alt="Cà phê">`;
      const iconNote = coGhiChu ? `<i class="fa-solid fa-note-sticky note"></i>` : "";

      return `
        <div class="order-card ${trangThai}" data-index="${i}">
          <div class="order-left">
            <div class="order-name">${t.name}</div>
            <div class="order-info">${soMon} món • ${tongTien}đ</div>
            <div class="order-time">
              ${new Date(t.createdAt).toLocaleTimeString("vi-VN",{hour:"2-digit",minute:"2-digit"})}
            </div>
          </div>
          <div class="status-box ${trangThai}">
            ${iconTrangThai}${iconNote}
          </div>
        </div>
      `;
    }).join("");

  div.querySelectorAll(".order-card").forEach((card) => {
    card.addEventListener("click", () => {
      const index = parseInt(card.dataset.index);
      const don = danhSachHienThi[index];
      if (!don) return;
      moChiTietDon(don.id);
    });
  });
}

// ================================
// 🪑 Popup chọn bàn kiểu icon ghế (giữ nguyên)
// ================================
function themKhachTaiQuan() {
  // Giữ nguyên popup bàn
}

// ================================
// 🔹 Hàm đóng màn hình chung (nút X thống nhất)
// ================================
function dongManHinh(el) {
  if (!el) return;
  closeScreen(el, () => {
    khoiPhucHeaderMacDinh();
    hienThiManHinhChinh();
    renderTables();
  });
}

// ================================
// 🧾 Chi tiết đơn
// ================================
function moChiTietDon(id) {
  const don = hoaDonChinh.find(d => d.id === id);
  if (!don) return;

  const main = document.querySelector(".main-container");
  const header = document.querySelector("header");

  header.innerHTML = `
    <h1>${don.name}</h1>
    <div class="header-icons">
      <button id="btnCloseChiTiet" class="btn-close-order">×</button>
    </div>
  `;

  const createdAt = new Date(don.createdAt);
  const timeStr = createdAt.toLocaleString('vi-VN',{hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit',year:'numeric'});

  const footerHTML = don.status === "serving"
    ? `
      <div class="order-footer-ct" id="footerChiTietDon">
        <div class="order-buttons">
          <button class="btn-themmon">Thêm món</button>
          <button class="btn-primary btn-thanhtoan">Thanh toán</button>
        </div>
      </div>
    `
    : `
      <div class="order-footer-ct" id="footerChiTietDon">
        <div class="slider" id="sliderConfirm">
          <div class="handle">
            <img src="icon/caphe.svg" alt="icon" class="slider-icon">
          </div>
          <div class="text">Kéo để xác nhận</div>
        </div>
      </div>
    `;

  main.innerHTML = `
    <div class="order-detail-ct">
      <div class="invoice-header-ct">
        <div class="invoice-title-ct">Hóa đơn</div>
        <div class="invoice-time-ct">Thời gian tạo: ${timeStr}</div>
      </div>
      <div class="order-content-ct">
        ${don.cart.map(m => {
          let tenGoc = m.name.includes("(")? m.name.split("(")[0].trim(): m.name;
          return `
<div class="mon-item">
  <div class="mon-left">
    <div style="display:flex;align-items:center;gap:4px;">
      <span class="mon-name">${tenGoc}</span>
      ${m.note ? `<span class="mon-note">(${m.note})</span>` : ""}
    </div>
    <div class="mon-sub">
      ${(m.price).toLocaleString()}đ x ${m.soluong}
    </div>
  </div>
  <div class="mon-right">
    ${(m.price * m.soluong).toLocaleString()}đ
  </div>
</div>`;}).join("")}
        <div class="order-total-ct">
          Tổng cộng: <strong>${don.cart.reduce((a,m)=>a+m.price*m.soluong,0).toLocaleString()}đ</strong>
        </div>
      </div>
    </div>
    ${footerHTML}
  `;

  const btnClose = document.getElementById("btnCloseChiTiet");
  if (btnClose) {
    btnClose.addEventListener("click", () => dongManHinh(document.querySelector(".order-detail-ct")));
  }

  if (typeof khoiTaoSliderXacNhan === 'function' && don.status !== "serving") {
    khoiTaoSliderXacNhan(don,function(donDaXacNhan){
      donDaXacNhan.status="serving";
      const slider=document.getElementById("sliderConfirm");
      if(slider) slider.style.display="none";
      saveAll();

      const footer=document.getElementById("footerChiTietDon");
      if(footer){
        footer.innerHTML=`
          <div class="order-buttons">
            <button class="btn-themmon">Thêm món</button>
            <button class="btn-primary btn-thanhtoan">Thanh toán</button>
          </div>`;
      }

      document.querySelector(".btn-themmon")?.addEventListener("click",()=>{
        khoiTaoOrder(don.name,don);
        hoaDonTam=[...don.cart,...hoaDonTam];
        capNhatHoaDon();
      });

      document.querySelector(".btn-thanhtoan")?.addEventListener("click",()=>{
        moManHinhThanhToan(don);
      });

      renderTables();
    });
  } else if(don.status==="serving"){
    document.querySelector(".btn-themmon")?.addEventListener("click",()=>{
      khoiTaoOrder(don.name,don);
      hoaDonTam=[...don.cart,...hoaDonTam];
      capNhatHoaDon();
    });
    document.querySelector(".btn-thanhtoan")?.addEventListener("click",()=>{
      moManHinhThanhToan(don);
    });
  }
}

// ================================
// Slider confirm, autoLoadIcons, popup bàn giữ nguyên
// ================================