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
  let data = JSON.parse(localStorage.getItem("BT_LICHSU_THANHTOAN") || "[]");
  const main = document.querySelector(".main-container");
  const header = document.querySelector("header");

  header.innerHTML = `
    <h1>Lịch sử thanh toán</h1>
    <div class="header-icons">
      <button id="btnBack" class="btn-close-order" title="Quay lại">×</button>
    </div>
  `;

  // 🔹 Thanh lọc ở trên cùng
  main.innerHTML = `
    <div class="filter-bar">
      <input type="date" id="filterDate">
      <select id="filterType">
        <option value="all">Tất cả</option>
        <option value="Chuyển khoản">Chuyển khoản</option>
        <option value="Tiền mặt">Tiền mặt</option>
      </select>
    </div>
    <div id="historyList"></div>

    <!-- 🔹 Popup xem lại -->
    <div id="popupChiTiet" class="popup hidden">
      <div class="popup-content">
        <button id="btnDongPopup" class="popup-close">×</button>
        <div id="popupNoiDung"></div>
        <div class="popup-actions">
          <button id="btnThoatPopup" class="btn-secondary hieuung-nhat">Thoát</button>
          <button id="btnInLai" class="btn-primary hieuung-noi">🖨️ In lại</button>
        </div>
      </div>
    </div>
  `;

  const renderList = () => {
    const dateVal = document.getElementById("filterDate").value;
    const typeVal = document.getElementById("filterType").value;
    const container = document.getElementById("historyList");

    let filtered = [...data];

    // Lọc theo ngày
    if (dateVal) {
      filtered = filtered.filter(d => {
        const ngayThanhToan = new Date(d.paidAt).toLocaleDateString("vi-VN");
        const ngayChon = new Date(dateVal).toLocaleDateString("vi-VN");
        return ngayThanhToan === ngayChon;
      });
    }

    // Lọc theo hình thức thanh toán
    if (typeVal !== "all") {
      filtered = filtered.filter(d => d.paymentType === typeVal);
    }

    if (!filtered.length) {
      container.innerHTML = `<p>📭 Không có hóa đơn nào phù hợp.</p>`;
      return;
    }

    const danhSach = [...filtered].reverse();
    container.innerHTML = danhSach
      .map(
        (d, i) => `
      <div class="lichsu-item">
        <div>
          <strong>${d.name}</strong> 
          (${new Date(d.paidAt).toLocaleString("vi-VN")})<br>
          ${d.cart.length} món • 
          Tổng: ${d.cart
            .reduce((a, m) => a + m.price * m.soluong, 0)
            .toLocaleString()}đ<br>
          Hình thức: ${d.paymentType || "Không rõ"}
        </div>
        <button class="btn-primary btn-xemlai hieuung-noi" data-index="${i}">👁️ Xem lại</button>
      </div>
      <hr>`
      )
      .join("");

    // Gắn sự kiện Xem lại
    document.querySelectorAll(".btn-xemlai").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const idx = e.target.dataset.index;
        const don = filtered[filtered.length - 1 - idx];
        moPopupChiTietDon(don);
      });
    });
  };

  renderList();

  // Gắn sự kiện lọc
  document.getElementById("filterDate").addEventListener("change", renderList);
  document.getElementById("filterType").addEventListener("change", renderList);

  // Nút quay lại
  document.getElementById("btnBack")?.addEventListener("click", () => {
    khoiPhucHeaderMacDinh();
    hienThiManHinhChinh();
    renderTables();
  });
}

// 🔹 Popup xem chi tiết hóa đơn
function moPopupChiTietDon(don) {
  const popup = document.getElementById("popupChiTiet");
  const noiDung = document.getElementById("popupNoiDung");
  if (!popup || !noiDung) return;

  const tongTien = don.cart.reduce((a, m) => a + m.price * m.soluong, 0);
  const timeStr = new Date(don.paidAt || don.createdAt).toLocaleString("vi-VN");

  noiDung.innerHTML = `
    <h3>${don.name}</h3>
    <p><small>Thanh toán lúc: ${timeStr}</small></p>
    <div class="popup-list">
      ${don.cart
        .map(
          (m) => `
        <div class="popup-item">
          <span>${m.name}</span>
          <span>${m.soluong} × ${m.price.toLocaleString()}đ</span>
        </div>`
        )
        .join("")}
    </div>
    <hr>
    <p><strong>Tổng cộng: ${tongTien.toLocaleString()}đ</strong></p>
    <p>Hình thức: ${don.paymentType || "Không rõ"}</p>
  `;

  popup.classList.remove("hidden");

  // Đóng popup (nút × hoặc Thoát)
  const closePopup = () => popup.classList.add("hidden");
  document.getElementById("btnDongPopup")?.addEventListener("click", closePopup);
  document.getElementById("btnThoatPopup")?.addEventListener("click", closePopup);

  // In lại hóa đơn
  document.getElementById("btnInLai")?.addEventListener("click", () => {
    window.print();
  });
}


