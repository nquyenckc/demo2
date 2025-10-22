// ================================
// 💰 Xử lý Thanh Toán - BlackTea POS
// ================================

// 🧾 Hàm xử lý thanh toán đơn
function xuLyThanhToan(don) {
  if (!don) return;

  const xacNhan = confirm(`Xác nhận thanh toán cho "${don.name}"?`);
  if (!xacNhan) return;

  // ✅ Cập nhật trạng thái đơn
  don.status = "done";
  don.paidAt = new Date().toISOString();

  // ✅ Lưu dữ liệu vào localStorage
  if (typeof saveAll === "function") saveAll();

  // ✅ Hiển thị thông báo
  if (typeof hienThongBao === "function") {
    hienThongBao(`💰 Đã thanh toán cho ${don.name}`);
  } else {
    alert(`💰 Đã thanh toán cho ${don.name}`);
  }

  // ✅ Xoá đơn khỏi danh sách chính
  if (typeof hoaDonChinh !== "undefined") {
    hoaDonChinh = hoaDonChinh.filter(d => d.id !== don.id);
    saveAll();
  }

  // ✅ Quay lại màn hình chính
  const header = document.querySelector("header");
  if (header) {
    header.innerHTML = `
      <h1>BlackTea</h1>
      <div class="header-icons">
        <span class="icon-btn"><i class="fas fa-clock-rotate-left" style="color:white;"></i></span>
        <span class="icon-btn"><i class="fas fa-gear" style="color:white;"></i></span>
      </div>
    `;
  }

  if (typeof hienThiManHinhChinh === "function") hienThiManHinhChinh();
  if (typeof renderTables === "function") renderTables();
}

// ================================
// (Tùy chọn) Hàm hiển thị lịch sử thanh toán
// ================================
function hienThiLichSuThanhToan() {
  const data = JSON.parse(localStorage.getItem("BT_LICHSU_THANHTOAN") || "[]");

  const main = document.querySelector(".main-container");
  if (!data.length) {
    main.innerHTML = "<p>Chưa có hóa đơn nào đã thanh toán.</p>";
    return;
  }

  main.innerHTML = data.map(d => `
    <div class="paid-item">
      <strong>${d.name}</strong><br>
      ${new Date(d.paidAt).toLocaleString("vi-VN")} • 
      ${d.cart.length} món • 
      ${d.cart.reduce((a, m) => a + m.price * m.soluong, 0).toLocaleString()}đ
    </div>
  `).join("");
}