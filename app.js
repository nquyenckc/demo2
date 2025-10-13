// ================================
// 📦 BlackTea POS v2 - app.js
// Điều khiển chính & điều hướng màn hình
// ================================

document.addEventListener("DOMContentLoaded", () => {
  khoiTaoUngDung();
});

function khoiTaoUngDung() {
  console.log("🚀 Khởi động BlackTea POS v2...");
  hienThiManHinhChinh();
}

// Hiển thị giao diện màn hình chính
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

  // Sự kiện nút
  document.getElementById("btnMangDi").addEventListener("click", () => {
    moManOrder("Khách mang đi");
  });

  document.getElementById("btnGheQuan").addEventListener("click", () => {
    moManOrder("Khách ghé quán");
  });
}

// Chuyển sang màn order
function moManOrder(loaiKhach) {
  console.log("🧾 Mở màn order cho:", loaiKhach);
  hienThiManOrder(loaiKhach); // Hàm này nằm trong order.js
}
