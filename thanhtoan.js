// ================================
// 💵 THANH TOÁN + LỊCH SỬ ĐƠN
// ================================
let lichSuDon = JSON.parse(localStorage.getItem("lichSuDon") || "[]");

// ----- MỞ MÀN HÌNH THANH TOÁN -----
function moThanhToan(don) {
  $("order-screen").style.display = "none";
  $("payment-screen").style.display = "block";
  renderThanhToan(don);
  window.donDangTT = don; // lưu đơn đang thanh toán
}

// ----- HIỂN THỊ GIAO DIỆN THANH TOÁN -----
function renderThanhToan(don) {
  const container = $("paymentContent");
  if (!container) return;

  const tong = tinhTongTien(don.cart);
  container.innerHTML = `
    <h2>Thanh toán đơn ${don.ma}</h2>
    <p><b>Tổng cộng:</b> ${tong.toLocaleString()}đ</p>

    <div class="ptt-group">
      <button onclick="chonPTT('cash')">💵 Tiền mặt</button>
      <button onclick="chonPTT('bank')">🏦 Chuyển khoản</button>
      <button onclick="chonPTT('card')">💳 Thẻ</button>
    </div>

    <button class="xacnhan-btn" onclick="xacNhanThanhToan()">✅ Xác nhận thanh toán</button>
  `;
  don.phuongThuc = "cash";
}

function chonPTT(loai) {
  if (window.donDangTT) window.donDangTT.phuongThuc = loai;
}

function tinhTongTien(cart) {
  return cart.reduce((sum, it) => sum + (it.gia || 0) * (it.qty || 0), 0);
}

// ----- XÁC NHẬN THANH TOÁN -----
function xacNhanThanhToan() {
  const don = window.donDangTT;
  if (!don) return;

  don.status = "paid";
  don.thoiGianThanhToan = new Date().toLocaleString();
  don.tong = tinhTongTien(don.cart);
  lichSuDon.push(don);
  localStorage.setItem("lichSuDon", JSON.stringify(lichSuDon));

  // 💬 Thông báo in bill tạm thời
  alert("✅ Thanh toán thành công!\n🧾 Tính năng in hóa đơn sẽ được cập nhật sau.");

  saveAll();
  veManHinhChinh();
}

// ----- MỞ LỊCH SỬ -----
function moLichSu() {
  $("home-screen").style.display = "none";
  $("history-screen").style.display = "block";
  renderLichSu();
}

function renderLichSu() {
  const container = $("historyContent");
  if (!container) return;

  if (lichSuDon.length === 0) {
    container.innerHTML = "<p>Chưa có đơn nào.</p>";
    return;
  }

  container.innerHTML = lichSuDon.map(d => `
    <div class="history-item">
      <b>${d.ma}</b> — ${d.thoiGianThanhToan}<br>
      ${d.tong.toLocaleString()}đ — ${d.phuongThuc || "?"}
      <button onclick="thongBaoInbill()">🧾 In lại</button>
    </div>
  `).join("");
}

// 💬 Placeholder inbill
function thongBaoInbill() {
  alert("🧾 Tính năng in hóa đơn sẽ được cập nhật sau.");
}