// ================================
// 💰 Thanh Toán + Lịch sử - BlackTea POS v2.6
// ================================
// 🔹 Mở màn hình thanh toán (bố cục giống mochitietdon)
function moManHinhThanhToan(don) {
  if (!don) return;
  const main = document.querySelector(".main-container");
  const header = document.querySelector("header");

  // Header giống mochitietdon + chữ trắng
  header.innerHTML = `
    <h1 class="invoice-title-ct" style="color: #fff;">Thanh toán đơn hàng</h1>
    <div class="header-icons">
      <button id="btnBackPayment" class="btn-close">×</button>
    </div>
  `;

  // Danh sách món
  const htmlChiTiet = don.cart.map(m => `
    <div class="mon-item">
      <div class="mon-left">
        <span class="mon-name">${m.name}</span>
        <span class="mon-sub">${m.soluong} × ${m.price.toLocaleString()}đ</span>
      </div>
      <div class="mon-right">${(m.soluong * m.price).toLocaleString()}đ</div>
    </div>
  `).join("");

  // Tổng tiền
  const tongTien = don.cart.reduce((a, m) => a + m.price * m.soluong, 0);

  main.innerHTML = `
    <div class="order-detail-ct">
      <div class="invoice-header-ct">
        <div class="invoice-title-ct">${don.name}</div>
        <div class="invoice-time-ct">Thời gian: ${new Date(don.createdAt).toLocaleString("vi-VN")}</div>
      </div>

      <div class="order-content-ct">
        ${htmlChiTiet}
      </div>

      <div class="order-total-ct">
        <strong>Tổng cộng: ${tongTien.toLocaleString()}đ</strong>
      </div>

      <div class="order-footer-ct">
        <button id="btnChuyenKhoan" class="btn-primary">💳 Chuyển khoản</button>
        <button id="btnTienMat" class="btn-primary">💵 Tiền mặt</button>
      </div>
    </div>
  `;

  // Nút quay lại
  document.getElementById("btnBackPayment")?.addEventListener("click", () => {
    khoiPhucHeaderMacDinh();
    hienThiManHinhChinh();
    renderTables();
  });

  // Hai hình thức thanh toán
  document.getElementById("btnChuyenKhoan")?.addEventListener("click", () => {
    xuLyThanhToan(don, "Chuyển khoản");
  });
  document.getElementById("btnTienMat")?.addEventListener("click", () => {
    xuLyThanhToan(don, "Tiền mặt");
  });
}

// ================================
// ✅ Xử lý thanh toán thật sự
// ================================
function xuLyThanhToan(don, kieuThanhToan = "") {
  if (!don) return;
  const xacNhan = confirm(`Xác nhận thanh toán "${don.name}" (${kieuThanhToan})?`);
  if (!xacNhan) return;

  don.status = "done";
  don.paidAt = new Date().toISOString();
  don.paymentType = kieuThanhToan;

  // Lưu lịch sử
  let lichSu = JSON.parse(localStorage.getItem("BT_LICHSU_THANHTOAN") || "[]");
  lichSu.push(don);
  localStorage.setItem("BT_LICHSU_THANHTOAN", JSON.stringify(lichSu));

  // Xoá khỏi danh sách đang phục vụ
  if (typeof hoaDonChinh !== "undefined" && Array.isArray(hoaDonChinh))
    hoaDonChinh = hoaDonChinh.filter(d => d.id !== don.id);

  if (typeof saveAll === "function") saveAll();

  // Thông báo
  if (typeof hienThongBao === "function")
    hienThongBao(`💰 Đã thanh toán ${don.name} (${kieuThanhToan})`);
  else
    alert(`💰 Đã thanh toán ${don.name} (${kieuThanhToan})`);

  // 🧭 Quay về màn chính + khôi phục header
  khoiPhucHeaderMacDinh();
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

  // 🔹 Thêm ô lọc ngày
  main.innerHTML = `
    <div style="text-align:right; padding:8px 12px;">
      <input type="date" id="filterDate" style="padding:6px 8px; border-radius:6px; border:1px solid #ccc;">
    </div>
    <div id="lichsuContainer"></div>
  `;

  const lichsuContainer = document.getElementById("lichsuContainer");

  // 🔹 Hàm render theo ngày
  function renderLichSu(ngayChon = null) {
    let danhSach = [...data].reverse();

    if (ngayChon) {
      danhSach = danhSach.filter(d => {
        const ngayThanhToan = new Date(d.paidAt).toLocaleDateString("vi-VN");
        return ngayThanhToan === new Date(ngayChon).toLocaleDateString("vi-VN");
      });
    }

    if (!danhSach.length) {
      lichsuContainer.innerHTML = `<p style="padding:10px;">📭 Không có hóa đơn nào trong ngày này.</p>`;
      return;
    }

    lichsuContainer.innerHTML = danhSach.map(d => `
      <div>
        <strong>${d.name}</strong> 
        (${new Date(d.paidAt).toLocaleString("vi-VN")})<br>
        ${d.cart.length} món • 
        Tổng: ${d.cart.reduce((a, m) => a + m.price * m.soluong, 0).toLocaleString()}đ<br>
        Hình thức: ${d.paymentType || "Không rõ"}
      </div>
      <hr>
    `).join("");
  }

  renderLichSu(); // hiển thị mặc định (tất cả)

  // 🔹 Lọc khi chọn ngày
  document.getElementById("filterDate").addEventListener("change", (e) => {
    renderLichSu(e.target.value);
  });

  // 🔙 Nút quay lại
  document.getElementById("btnBack")?.addEventListener("click", () => {
    khoiPhucHeaderMacDinh();
    hienThiManHinhChinh();
    renderTables();
  });
}



