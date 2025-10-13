// ================================
// ☕ Giao diện Order món
// ================================

// Giả sử biến MENU đã được load từ file menu.js
// MENU = [{ id, name, price, cat }, ...]

let danhMucHienTai = "Cà phê";
let gioHang = {};
let banHienTai = null;

// Hàm hiển thị giao diện order
function hienThiManOrder(tenBan) {
  banHienTai = tenBan;
  document.body.innerHTML = `
    <div class="order-container">
      <div class="order-header">
        <div class="order-title">BlackTea <span>${tenBan}</span></div>
        <button class="btn-close" onclick="troVeManHinhChinh()">×</button>
      </div>

      <div class="order-search">
        <input type="text" id="timMonInput" placeholder="Nhập món cần tìm..." oninput="timMon()">
      </div>

      <div class="order-categories" id="danhMucContainer">
        ${taoDanhMucHTML()}
      </div>

      <div class="order-list" id="danhSachMon">
        ${taoDanhSachMonHTML(danhMucHienTai)}
      </div>

      <div class="order-footer">
        <div class="order-total">Tổng: <span id="tongTien">0</span> VND</div>
        <div class="order-buttons">
          <button onclick="datLaiDon()">Đặt lại</button>
          <button class="btn-primary" onclick="luuDon()">Lưu đơn</button>
        </div>
      </div>
    </div>
  `;
}

// ====== Các hàm phụ ======

function taoDanhMucHTML() {
  const danhMuc = [...new Set(MENU.map(m => m.cat))];
  return danhMuc.map(cat => `
    <button class="danh-muc-btn ${cat === danhMucHienTai ? 'active' : ''}" onclick="chonDanhMuc('${cat}')">${cat}</button>
  `).join("");
}

function taoDanhSachMonHTML(cat) {
  const ds = MENU.filter(m => m.cat === cat);
  return ds.map(mon => `
    <div class="mon-item">
      <div>
        <div class="mon-ten">${mon.name}</div>
        <div class="mon-gia">${mon.price.toLocaleString()} VND</div>
      </div>
      <div class="mon-qty">
        <button onclick="giamMon(${mon.id})">–</button>
        <span id="soLuong_${mon.id}">${gioHang[mon.id]?.soLuong || 0}</span>
        <button onclick="tangMon(${mon.id})">+</button>
      </div>
    </div>
  `).join("");
}

function chonDanhMuc(cat) {
  danhMucHienTai = cat;
  document.getElementById("danhMucContainer").innerHTML = taoDanhMucHTML();
  document.getElementById("danhSachMon").innerHTML = taoDanhSachMonHTML(cat);
}

function tangMon(id) {
  if (!gioHang[id]) gioHang[id] = { soLuong: 0 };
  gioHang[id].soLuong++;
  capNhatSoLuong(id);
}

function giamMon(id) {
  if (gioHang[id]?.soLuong > 0) {
    gioHang[id].soLuong--;
    if (gioHang[id].soLuong === 0) delete gioHang[id];
    capNhatSoLuong(id);
  }
}

function capNhatSoLuong(id) {
  document.getElementById(`soLuong_${id}`).textContent = gioHang[id]?.soLuong || 0;
  tinhTongTien();
}

function tinhTongTien() {
  let tong = 0;
  for (const id in gioHang) {
    const mon = MENU.find(m => m.id == id);
    tong += mon.price * gioHang[id].soLuong;
  }
  document.getElementById("tongTien").textContent = tong.toLocaleString();
}

function datLaiDon() {
  gioHang = {};
  tinhTongTien();
  document.querySelectorAll('[id^="soLuong_"]').forEach(el => el.textContent = 0);
}

function luuDon() {
  alert("Đã lưu đơn cho " + banHienTai + "!");
  troVeManHinhChinh();
}

function troVeManHinhChinh() {
  location.reload(); // tạm thời quay lại màn hình chính
}
