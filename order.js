// ================================
// ☕ Giao diện Order món - BlackTea v2.0
// ================================

// MENU được load từ menu.js
// MENU = [{ id, name, price, cat }, ...]

let danhMucHienTai = "Cà phê";
let gioHang = {};
let banHienTai = null;

// -----------------------------
// Hiển thị giao diện order món
// -----------------------------
function hienThiManOrder(tenBan) {
  banHienTai = tenBan;

  document.body.innerHTML = `
  <div class="order-container">
    <div class="order-header">
      <div class="order-title">BlackTea <span>${tenBan}</span></div>
      <button class="btn-close" onclick="troVeManHinhChinh()">×</button>
    </div>

    <div class="order-content">
      <div class="order-search">
        <input type="text" id="timMonInput" placeholder="Nhập món cần tìm..." oninput="timMon()">
      </div>

      <div class="order-categories" id="danhMucContainer">
        ${taoDanhMucHTML()}
      </div>

      <div class="order-list" id="danhSachMon">
        ${taoDanhSachMonHTML(danhMucHienTai)}
      </div>

      <div class="hoa-don-tam" id="hoaDonTam">
        <p style="color:#999;font-size:14px;">Chưa chọn món nào</p>
      </div>
    </div>

    <div class="order-footer">
      <div class="order-buttons">
        <button onclick="datLaiDon()">Đặt lại</button>
        <button class="btn-primary" onclick="luuDon()">Lưu đơn</button>
      </div>
    </div>
  </div>
`;

}

// -----------------------------
// Các hàm tạo HTML
// -----------------------------
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

// -----------------------------
// Chức năng chính
// -----------------------------
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
  hoaDonTam(); // cập nhật danh sách món đã chọn
}

// -----------------------------
// Hiển thị danh sách món đã chọn
// -----------------------------
function hoaDonTam() {
  const khungHoaDon = document.getElementById("hoaDonTam");
  if (!khungHoaDon) return;

  const monDaChon = Object.entries(gioHang);
  if (monDaChon.length === 0) {
    khungHoaDon.innerHTML = `<p style="color:#999;font-size:14px;">Chưa chọn món nào</p>`;
    return;
  }

  khungHoaDon.innerHTML = monDaChon.map(([id, item]) => {
    const mon = MENU.find(m => m.id == id);
    return `
      <div class="hoa-don-item">
        <span>${mon.name}</span>
        <span>${item.soLuong} × ${mon.price.toLocaleString()}</span>
      </div>
    `;
  }).join("");
}

// -----------------------------
// Các nút điều khiển đơn
// -----------------------------
function datLaiDon() {
  gioHang = {};
  document.querySelectorAll('[id^="soLuong_"]').forEach(el => el.textContent = 0);
  hoaDonTam();
}

function luuDon() {
  alert("Đã lưu đơn cho " + banHienTai + "!");
  troVeManHinhChinh();
}

function troVeManHinhChinh() {
  location.reload(); // tạm thời quay lại màn hình chính
}

// -----------------------------
// Tìm món trong danh sách
// -----------------------------
function timMon() {
  const tuKhoa = document.getElementById("timMonInput").value.toLowerCase();
  const ds = MENU.filter(m => m.cat === danhMucHienTai && m.name.toLowerCase().includes(tuKhoa));
  document.getElementById("danhSachMon").innerHTML = ds.map(mon => `
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
/* ================================
   🧩 Tự động sắp danh mục cho kín hàng (BlackTea v2)
   ================================ */

function sapXepDanhMuc() {
  const container = document.querySelector('.order-categories');
  if (!container) return;

  // Lấy danh sách nút
  const buttons = Array.from(container.children);

  // Reset thứ tự về ban đầu (tránh xếp chồng nhiều lần)
  buttons.forEach(btn => container.appendChild(btn));

  const rowWidth = container.clientWidth;
  let currentRow = [];
  let currentWidth = 0;
  const finalOrder = [];

  // Đo chiều rộng thực tế từng nút
  const widths = buttons.map(btn => btn.offsetWidth + 6); // + gap 6px

  buttons.forEach((btn, i) => {
    const w = widths[i];
    if (currentWidth + w <= rowWidth) {
      currentRow.push(btn);
      currentWidth += w;
    } else {
      // Khi hàng đầy, thêm hàng đó vào thứ tự cuối cùng
      finalOrder.push(...currentRow);
      currentRow = [btn];
      currentWidth = w;
    }
  });
  // Thêm hàng cuối
  finalOrder.push(...currentRow);

  // Gắn lại theo thứ tự tối ưu
  finalOrder.forEach(btn => container.appendChild(btn));
}

// Chạy khi load và khi xoay màn hình / resize
window.addEventListener('load', sapXepDanhMuc);
window.addEventListener('resize', () => {
  clearTimeout(window.__sapxepTimeout);
  window.__sapxepTimeout = setTimeout(sapXepDanhMuc, 200);
});
