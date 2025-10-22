// ================================
// 💰 Xử lý Thanh Toán - BlackTea POS v2.5
// ================================

// 🔹 Mở màn hình thanh toán
function moManHinhThanhToan(don) {
  if (!don) return;
  const main = document.querySelector(".main-container");
  const header = document.querySelector("header");

  header.innerHTML = `
    <h1>Thanh toán</h1>
    <div class="header-icons">
      <button id="btnBackPayment" class="btn-close-order" title="Quay lại">×</button>
    </div>
  `;

  // 🧾 Chi tiết đơn hàng
  const tongTien = don.cart.reduce((a, m) => a + m.price * m.soluong, 0);
  const htmlChiTiet = don.cart
    .map(
      (m) => `
      <div class="pay-item">
        <span>${m.name}</span>
        <span>${m.soluong} × ${m.price.toLocaleString()}đ</span>
      </div>
    `
    )
    .join("");

  main.innerHTML = `
    <div class="payment-screen">
      <div class="payment-info">
        <h2>${don.name}</h2>
        <p>Thời gian tạo: ${new Date(don.createdAt).toLocaleString("vi-VN")}</p>
      </div>

      <div class="payment-items">
        ${htmlChiTiet}
      </div>

      <div class="payment-total">
        Tổng cộng: <strong>${tongTien.toLocaleString()}đ</strong>
      </div>

      <div class="payment-methods">
        <button class="btn-payment" id="btnChuyenKhoan">💳 Chuyển khoản</button>
        <button class="btn-payment" id="btnTienMat">💵 Tiền mặt</button>
      </div>
    </div>
  `;

  // 🔙 Nút quay lại
  document.getElementById("btnBackPayment")?.addEventListener("click", () => {
    hienThiManHinhChinh();
    renderTables();
  });

  // 💳 Thanh toán chuyển khoản
  document.getElementById("btnChuyenKhoan")?.addEventListener("click", () => {
    xuLyThanhToan(don, "Chuyển khoản");
  });

  // 💵 Thanh toán tiền mặt
  document.getElementById("btnTienMat")?.addEventListener("click", () => {
    xuLyThanhToan(don, "Tiền mặt");
  });
}



// ================================
// ✅ Hàm xử lý thanh toán thật sự
// ================================
function xuLyThanhToan(don, kieuThanhToan = "") {
  if (!don) return;

  const xacNhan = confirm(
    `Xác nhận thanh toán đơn "${don.name}" bằng hình thức "${kieuThanhToan}"?`
  );
  if (!xacNhan) return;

  // 🧾 Cập nhật trạng thái
  don.status = "done";
  don.paidAt = new Date().toISOString();
  don.paymentType = kieuThanhToan;

  // 💾 Lưu vào lịch sử
  let lichSu = JSON.parse(localStorage.getItem("BT_LICHSU_THANHTOAN") || "[]");
  lichSu.push(don);
  localStorage.setItem("BT_LICHSU_THANHTOAN", JSON.stringify(lichSu));

  // 🗑 Xoá khỏi danh sách đang phục vụ
  if (typeof hoaDonChinh !== "undefined" && Array.isArray(hoaDonChinh)) {
    hoaDonChinh = hoaDonChinh.filter((d) => d.id !== don.id);
  }
  if (typeof saveAll === "function") saveAll();

  // ✅ Thông báo
  if (typeof hienThongBao === "function")
    hienThongBao(`💰 Đã thanh toán ${don.name} (${kieuThanhToan})`);
  else alert(`💰 Đã thanh toán ${don.name} (${kieuThanhToan})`);

  // ↩ Quay lại màn hình chính
  hienThiManHinhChinh();
  renderTables();
}



// ================================
// 📜 Lịch sử Thanh Toán
// ================================
function hienThiLichSuThanhToan() {
  const data = JSON.parse(localStorage.getItem("BT_LICHSU_THANHTOAN") || "[]");
  const main = document.querySelector(".main-container");
  const header = document.querySelector("header");

  header.innerHTML = `
    <h1>Lịch sử thanh toán</h1>
    <div class="header-icons">
      <button id="btnBack" class="btn-close-order" title="Quay lại">×</button>
    </div>
  `;

  if (!data.length) {
    main.innerHTML = `<div class="lichsu-trong"><p>📭 Chưa có hóa đơn nào đã thanh toán.</p></div>`;
    document.getElementById("btnBack")?.addEventListener("click", () => {
      hienThiManHinhChinh();
      renderTables();
    });
    return;
  }

  const danhSach = [...data].reverse();

  main.innerHTML = `
    <div class="lichsu-list">
      ${danhSach
        .map(
          (d) => `
        <div class="lichsu-item">
          <div class="lichsu-header">
            <strong>${d.name}</strong>
            <span class="lichsu-time">${new Date(d.paidAt).toLocaleString(
              "vi-VN"
            )}</span>
          </div>
          <div class="lichsu-info">
            ${d.cart.length} món • Tổng: <strong>${d.cart
              .reduce((a, m) => a + m.price * m.soluong, 0)
              .toLocaleString()}đ</strong>
            <div class="lichsu-type">💳 ${d.paymentType || "Không rõ"}</div>
          </div>
        </div>
      `
        )
        .join("")}
    </div>

    <div class="lichsu-footer">
      <button class="btn-xoa-lichsu">🗑 Xóa toàn bộ lịch sử</button>
    </div>
  `;

  document.getElementById("btnBack")?.addEventListener("click", () => {
    hienThiManHinhChinh();
    renderTables();
  });

  document.querySelector(".btn-xoa-lichsu")?.addEventListener("click", () => {
    if (confirm("Xóa toàn bộ lịch sử thanh toán?")) {
      localStorage.removeItem("BT_LICHSU_THANHTOAN");
      hienThiLichSuThanhToan();
    }
  });
}