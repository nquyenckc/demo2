// ================================
// 🍵 BlackTea POS v2 - Chọn món & giỏ hàng
// ================================

// Hiển thị danh sách món
function hienThiDanhSachMon() {
  const main = document.querySelector(".main-container");
  main.innerHTML = `
    <div class="order-header">
      <button id="btnBack" class="btn-back">⬅</button>
      <h2>${currentTable.name}</h2>
    </div>

    <div class="order-search">
      <input type="text" id="timMon" placeholder="Tìm món..." />
    </div>

    <div class="order-category">
      ${[...new Set(MENU.map(m => m.cat))].map(cat => `<button class="cat-btn">${cat}</button>`).join("")}
    </div>

    <div class="menu-list">
      ${MENU.map(m => `
        <div class="menu-row">
          <div class="menu-left">
            <div class="menu-name">${m.name}</div>
            <div class="menu-price">${dinhDangTien(m.price)}đ</div>
          </div>
          <div class="qty-controls">
            <button onclick="giamMon(${m.id})">−</button>
            <span id="qty-${m.id}">${laySoLuongMon(m.id)}</span>
            <button onclick="themMon(${m.id})">+</button>
          </div>
        </div>
      `).join("")}
    </div>

    <div class="cart-summary">
      <div class="cart-total">Tổng: ${dinhDangTien(tinhTong())}đ</div>
      <div class="cart-actions">
        <button class="btn btn-primary">Thanh toán</button>
      </div>
    </div>
  `;

  document.getElementById("btnBack").addEventListener("click", () => {
    hienThiDanhSachBan();
  });
}

// Thêm món
function themMon(idMon) {
  const mon = MENU.find(m => m.id === idMon);
  if (!mon) return;
  const existing = currentTable.items.find(i => i.id === idMon);
  if (existing) existing.qty++;
  else currentTable.items.push({ ...mon, qty: 1 });
  capNhatGioHang();
}

// Giảm món
function giamMon(idMon) {
  const item = currentTable.items.find(i => i.id === idMon);
  if (!item) return;
  item.qty--;
  if (item.qty <= 0) {
    currentTable.items = currentTable.items.filter(i => i.id !== idMon);
  }
  capNhatGioHang();
}

// Lấy số lượng món đang có
function laySoLuongMon(idMon) {
  const item = currentTable.items.find(i => i.id === idMon);
  return item ? item.qty : 0;
}

// Cập nhật giỏ hàng và tổng tiền
function capNhatGioHang() {
  luuToanBoDuLieu();
  hienThiDanhSachMon();
}

// Tính tổng tiền
function tinhTong() {
  return currentTable.items.reduce((sum, i) => sum + i.price * i.qty, 0);
}

// Định dạng tiền
function dinhDangTien(v) {
  return v.toLocaleString("vi-VN");
}
