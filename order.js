// ================================
// ☕ BlackTea POS v2 - order.js
// Màn hình đặt món
// ================================

function hienThiManOrder(loaiKhach) {
  const main = document.querySelector(".main-container");

  main.innerHTML = `
    <div class="order-header">
      <button id="btnBack" class="btn-back">⬅</button>
      <h2>${loaiKhach}</h2>
    </div>

    <div class="order-search">
      <input type="text" id="timMon" placeholder="Tìm món nhanh..." />
    </div>

    <div class="order-category">
      <button class="cat-btn">Cà phê</button>
      <button class="cat-btn">Trà</button>
      <button class="cat-btn">Matcha</button>
      <button class="cat-btn">Sữa chua</button>
    </div>

    <div class="order-list">
      <p class="empty-state">Danh sách món sẽ hiển thị ở đây</p>
    </div>
  `;

  // Sự kiện quay lại
  document.getElementById("btnBack").addEventListener("click", () => {
    hienThiManHinhChinh();
  });

  // (Sau này ta sẽ bổ sung: hiển thị món từ MENU, tìm kiếm, chọn món, v.v.)
}
