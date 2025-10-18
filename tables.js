/* ===============================
   📋 Quản lý Hóa Đơn Chính
   =============================== */

let hoaDonChinh = [];
let hoaDonHienTai = null; // ✅ thay cho currentTable

// 🧩 Tải dữ liệu hóa đơn từ localStorage
function loadAll() {
  const local = localStorage.getItem("BT_TABLES");
  if (local) hoaDonChinh = JSON.parse(local);
  else hoaDonChinh = [];
}

// 💾 Lưu toàn bộ dữ liệu vào localStorage
function saveAll() {
  localStorage.setItem("BT_TABLES", JSON.stringify(hoaDonChinh));
}

// 🆕 Tạo hóa đơn mới (bàn mới)
function createNewTable(name, type = "mangdi") {
  const don = {
    id: Date.now(),
    name: name,
    type: type,
    cart: [],
    served: false,
    createdAt: Date.now(),
    _isDraft: true
  };
  hoaDonChinh.push(don);
  saveAll();
  return don;
}

// 🔍 Mở hóa đơn theo ID
function openTable(id) {
  const don = hoaDonChinh.find(t => t.id === id);
  if (don) hoaDonHienTai = don; // ✅ đổi currentTable → hoaDonHienTai
  return don;
}

// ❌ Đóng hóa đơn hiện tại
function closeCurrentTable() {
  if (!hoaDonHienTai) return;
  hoaDonChinh = hoaDonChinh.filter(t => t.id !== hoaDonHienTai.id);
  hoaDonHienTai = null; // ✅
  saveAll();
}

// 💾 Cập nhật lại hóa đơn hiện tại
function updateCurrentTable() {
  if (!hoaDonHienTai) return;
  const index = hoaDonChinh.findIndex(t => t.id === hoaDonHienTai.id);
  if (index >= 0) hoaDonChinh[index] = hoaDonHienTai;
  saveAll();
}

// 🧮 Lọc hóa đơn đang phục vụ
function getActiveTables() {
  return hoaDonChinh.filter(t => !t.served);
}

// 🧾 Xóa toàn bộ hóa đơn (reset hệ thống)
function clearAllTables() {
  hoaDonChinh = [];
  localStorage.removeItem("BT_TABLES");
}

// ⚙️ Khởi tạo khi mở app
loadAll();


// Mở đơn hàng từ màn hình
// ================================
// 📋 Hiển thị chi tiết đơn (mang đi / tại bàn)
// ================================
function openMangDiDetail(id) {
  const don = hoaDonChinh.find((d) => d.id === id);
  if (!don) return;

  const main = document.querySelector(".main-container");
  main.innerHTML = `
    <div class="order-detail">
      <h2>Hóa đơn</h2>
      <p class="created-time">Thời gian tạo: ${new Date(
        don.createdAt
      ).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })} ${new Date(don.createdAt).toLocaleDateString("vi-VN")}</p>

      <div class="hoa-don-chi-tiet">
        ${don.cart
          .map(
            (m) => `
          <div class="hoa-don-item">
            <div class="ten-mon">
              ${m.name}
              ${m.note ? `<span class="note-text">(${m.note})</span>` : ""}
            </div>
            <div class="gia-mon">${m.price.toLocaleString()}đ</div>
            <div class="so-luong">${m.price.toLocaleString()} x ${m.soluong}</div>
          </div>
        `
          )
          .join("")}
      </div>

      <div class="confirm-section">
        <label class="switch">
          <input type="checkbox" id="togglePhucVu" ${
            don.status === "serving" ? "checked" : ""
          }>
          <span class="slider"></span>
        </label>
        <span class="switch-label">${
          don.status === "serving" ? "Đang phục vụ" : "Chờ phục vụ"
        }</span>
      </div>
    </div>
  `;

  // 🧭 Cập nhật header hiện có
  const header = document.querySelector(".app-header");
  if (header) {
    header.innerHTML = `
      <div class="header-content">
        <span class="header-title">${don.name}</span>
        <button class="header-close" id="btnCloseDetail">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    `;
    header.style.justifyContent = "space-between";
    header.style.alignItems = "center";
    header.style.padding = "0 14px";
  }

  // 🔙 Nút đóng → quay lại màn hình chính
  document.getElementById("btnCloseDetail").addEventListener("click", () => {
    hienThiManHinhChinh();
    khoiPhucHeaderMacDinh();
  });

  // 🔘 Xử lý nút gạt phục vụ
  const toggle = document.getElementById("togglePhucVu");
  const label = document.querySelector(".switch-label");

  toggle.addEventListener("change", () => {
    don.status = toggle.checked ? "serving" : "waiting";
    label.textContent = toggle.checked ? "Đang phục vụ" : "Chờ phục vụ";
    saveAll();
  });
}

// ================================
// 🎚 Slider xác nhận đơn mang đi
// ================================
function khoiTaoSliderMangDi(onXacNhan) {
  const slider = document.getElementById("sliderConfirm");
  if (!slider) return;
  const handle = slider.querySelector(".handle");
  const text = slider.querySelector(".text");

  let isDragging = false, startX = 0;

  handle.addEventListener("mousedown", startDrag);
  handle.addEventListener("touchstart", startDrag, { passive: true });

  function startDrag(e) {
    if (slider.classList.contains("success")) return;
    isDragging = true;
    startX = e.touches ? e.touches[0].clientX : e.clientX;
    document.addEventListener("mousemove", onDrag);
    document.addEventListener("mouseup", endDrag);
    document.addEventListener("touchmove", onDrag);
    document.addEventListener("touchend", endDrag);
  }

  function onDrag(e) {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    let diff = clientX - startX;
    const max = slider.offsetWidth - handle.offsetWidth - 8;
    diff = Math.max(0, Math.min(diff, max));
    handle.style.left = diff + "px";
  }

  function endDrag() {
    if (!isDragging) return;
    isDragging = false;
    const maxPos = slider.offsetWidth - handle.offsetWidth - 8;
    const current = parseInt(handle.style.left) || 0;

    if (current >= maxPos * 0.9) {
      slider.classList.add("success");
      handle.style.left = maxPos + "px";
      text.innerText = "Đang phục vụ";
      if (typeof onXacNhan === "function") onXacNhan();
    } else {
      handle.style.left = "5px";
    }

    document.removeEventListener("mousemove", onDrag);
    document.removeEventListener("mouseup", endDrag);
    document.removeEventListener("touchmove", onDrag);
    document.removeEventListener("touchend", endDrag);
  }
}
