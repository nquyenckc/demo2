// ================================
// 💰 Xử lý Thanh Toán + Lịch sử - BlackTea POS v2.3
// ================================

// 🧾 Hàm xử lý thanh toán đơn
function xuLyThanhToan(don) {
  if (!don) return;

  const xacNhan = confirm(`Xác nhận thanh toán cho "${don.name}"?`);
  if (!xacNhan) return;

  // ✅ Cập nhật trạng thái đơn
  don.status = "done";
  don.paidAt = new Date().toISOString();

  // ✅ Lưu vào danh sách lịch sử thanh toán
  let lichSu = JSON.parse(localStorage.getItem("BT_LICHSU_THANHTOAN") || "[]");
  lichSu.push(don);
  localStorage.setItem("BT_LICHSU_THANHTOAN", JSON.stringify(lichSu));

  // ✅ Xoá đơn khỏi danh sách đang phục vụ
  if (typeof hoaDonChinh !== "undefined" && Array.isArray(hoaDonChinh)) {
    hoaDonChinh = hoaDonChinh.filter(d => d.id !== don.id);
  }

  // ✅ Lưu lại dữ liệu mới
  if (typeof saveAll === "function") saveAll();

  // ✅ Hiển thị thông báo
  if (typeof hienThongBao === "function") {
    hienThongBao(`💰 Đã thanh toán cho ${don.name}`);
  } else {
    alert(`💰 Đã thanh toán cho ${don.name}`);
  }

  // ✅ Quay lại màn hình chính
  const header = document.querySelector("header");
  if (header) {
    header.innerHTML = `
      <h1>BlackTea</h1>
      <div class="header-icons">
        <span id="btnLichSu" class="icon-btn" title="Lịch sử">
          <i class="fas fa-clock-rotate-left" style="color:white;"></i>
        </span>
        <span class="icon-btn"><i class="fas fa-gear" style="color:white;"></i></span>
      </div>
    `;
  }

  if (typeof hienThiManHinhChinh === "function") hienThiManHinhChinh();
  if (typeof renderTables === "function") renderTables();

  // Gắn lại sự kiện cho nút xem lịch sử
  document.getElementById("btnLichSu")?.addEventListener("click", hienThiLichSuThanhToan);
}



// ================================
// 📜 Hiển thị Lịch sử Thanh Toán
// ================================
function hienThiLichSuThanhToan() {
  const data = JSON.parse(localStorage.getItem("BT_LICHSU_THANHTOAN") || "[]");
  const main = document.querySelector(".main-container");
  const header = document.querySelector("header");

  if (header) {
    header.innerHTML = `
      <h1>Lịch sử thanh toán</h1>
      <div class="header-icons">
        <button id="btnBack" class="btn-close-order">×</button>
      </div>
    `;
  }

  if (!data.length) {
    main.innerHTML = `
      <div class="lichsu-trong">
        <p>Chưa có hóa đơn nào đã thanh toán.</p>
      </div>
    `;
    document.getElementById("btnBack")?.addEventListener("click", () => {
      header.innerHTML = `
        <h1>BlackTea</h1>
        <div class="header-icons">
          <span id="btnLichSu" class="icon-btn"><i class="fas fa-clock-rotate-left" style="color:white;"></i></span>
          <span class="icon-btn"><i class="fas fa-gear" style="color:white;"></i></span>
        </div>
      `;
      hienThiManHinhChinh();
      renderTables();
      document.getElementById("btnLichSu")?.addEventListener("click", hienThiLichSuThanhToan);
    });
    return;
  }

  // 🔄 Đảo ngược để hóa đơn mới nhất lên đầu
  const danhSach = [...data].reverse();

  main.innerHTML = `
    <div class="lichsu-list">
      ${danhSach.map(d => `
        <div class="lichsu-item">
          <div class="lichsu-header">
            <strong>${d.name}</strong>
            <span class="lichsu-time">${new Date(d.paidAt).toLocaleString("vi-VN")}</span>
          </div>
          <div class="lichsu-info">
            ${d.cart.length} món • Tổng: 
            <strong>${d.cart.reduce((a, m) => a + m.price * m.soluong, 0).toLocaleString()}đ</strong>
          </div>
        </div>
      `).join("")}
    </div>
  `;

  // 🔙 Nút quay lại
  document.getElementById("btnBack")?.addEventListener("click", () => {
    header.innerHTML = `
      <h1>BlackTea</h1>
      <div class="header-icons">
        <span id="btnLichSu" class="icon-btn"><i class="fas fa-clock-rotate-left" style="color:white;"></i></span>
        <span class="icon-btn"><i class="fas fa-gear" style="color:white;"></i></span>
      </div>
    `;
    hienThiManHinhChinh();
    renderTables();
    document.getElementById("btnLichSu")?.addEventListener("click", hienThiLichSuThanhToan);
  });
}