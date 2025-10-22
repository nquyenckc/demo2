// ================================
// 💰 Thanh Toán + Lịch sử - BlackTea POS v2.6
// ================================

// 🔹 Mở màn hình thanh toán
function moManHinhThanhToan(don) {
  if (!don) return;
  const main = document.querySelector(".main-container");
  const header = document.querySelector("header");

  // Header riêng cho màn thanh toán
  header.innerHTML = `
    <h1>Thanh toán</h1>
    <div class="header-icons">
      <button id="btnBackPayment" class="btn-close-order" title="Quay lại">×</button>
    </div>
  `;

  const tongTien = don.cart.reduce((a, m) => a + m.price * m.soluong, 0);
  const htmlChiTiet = don.cart.map(m => `
    <div>
      ${m.name} — ${m.soluong} × ${m.price.toLocaleString()}đ
    </div>
  `).join("");

  main.innerHTML = `
    <div>
      <h2>${don.name}</h2>
      <p>Thời gian tạo: ${new Date(don.createdAt).toLocaleString("vi-VN")}</p>
      <div>${htmlChiTiet}</div>
      <hr>
      <p><strong>Tổng cộng: ${tongTien.toLocaleString()}đ</strong></p>

      <div>
        <button id="btnChuyenKhoan">💳 Chuyển khoản</button>
        <button id="btnTienMat">💵 Tiền mặt</button>
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

  if (!data.length) {
    main.innerHTML = `<p>📭 Chưa có hóa đơn nào đã thanh toán.</p>`;
  } else {
    const danhSach = [...data].reverse();
    main.innerHTML = danhSach.map(d => `
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

  document.getElementById("btnBack")?.addEventListener("click", () => {
    khoiPhucHeaderMacDinh();
    hienThiManHinhChinh();
    renderTables();
  });
}



// ================================
// 🔁 Hàm khôi phục header gốc + gắn lại nút lịch sử
// ================================
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

  // Gắn lại sự kiện
  document.getElementById("btnLichSu")?.addEventListener("click", hienThiLichSuThanhToan);
}