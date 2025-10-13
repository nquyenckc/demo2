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
   🧩 SẮP XẾP DANH MỤC TỰ ĐỘNG (Cách 2 - robust)
   ================================ */

(function(){
  // Debounce helper
  function debounce(fn, wait=120){
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(()=>fn(...args), wait);
    };
  }

  // Lấy khoảng gap giữa các item (hỗ trợ gap, columnGap, fallback)
  function getGap(container){
    const style = getComputedStyle(container);
    // modern: columnGap or gap
    const g1 = parseFloat(style.columnGap || style.getPropertyValue('column-gap') || 0);
    const g2 = parseFloat(style.gap || style.getPropertyValue('gap') || 0);
    return (g1 || g2) || 6; // fallback 6px if none
  }

  // Đo width thật sự của phần tử (bao gồm margin left/right)
  function fullWidth(el){
    const rect = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    const ml = parseFloat(s.marginLeft) || 0;
    const mr = parseFloat(s.marginRight) || 0;
    return rect.width + ml + mr;
  }

  function sapXepDanhMucOnce(){
    const container = document.querySelector('.order-categories');
    if (!container) return;

    // Nếu container rỗng chưa render đủ, thử lùi lại chút
    if (container.children.length === 0) return;

    // Lưu thứ tự gốc 1 lần để không phá dữ liệu nguồn
    if (!container._originalOrder) {
      container._originalOrder = Array.from(container.children);
    }

    // Use original set (in case current DOM was reordered earlier)
    let buttons = Array.from(container._originalOrder);

    // Re-attach each so we measure consistent elements in DOM
    buttons.forEach(btn => {
      if (!container.contains(btn)) container.appendChild(btn);
    });

    // Force a reflow to ensure measurements are correct
    // (browser will have rendered, but ensure up-to-date)
    // eslint-disable-next-line no-unused-expressions
    container.offsetWidth;

    const rowWidth = container.clientWidth; // available width
    const gap = getGap(container);

    // Measure each button's displayed width
    const widths = buttons.map(btn => Math.ceil(fullWidth(btn)));

    // Pack rows greedily (first-fit per row)
    let currentRow = [];
    let curWidth = 0;
    const finalOrder = [];

    for (let i = 0; i < buttons.length; i++){
      const w = widths[i];
      // if currentRow empty, always put first
      const addWidth = currentRow.length === 0 ? w : (w + gap);
      if (curWidth + addWidth <= rowWidth || currentRow.length === 0) {
        currentRow.push(buttons[i]);
        curWidth += addWidth;
      } else {
        finalOrder.push(...currentRow);
        currentRow = [buttons[i]];
        curWidth = w;
      }
    }
    if (currentRow.length) finalOrder.push(...currentRow);

    // Append in final order
    finalOrder.forEach(btn => container.appendChild(btn));
  }

  // wrapper that waits for fonts & render then runs
  function scheduleArrange(){
    const run = () => {
      // run a couple times to be safe (fonts, images)
      sapXepDanhMucOnce();
      setTimeout(sapXepDanhMucOnce, 80);
      setTimeout(sapXepDanhMucOnce, 220);
    };

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(run).catch(run);
    } else {
      // fallback
      setTimeout(run, 50);
    }
  }

  // Run on load + resize (debounced)
  window.addEventListener('load', scheduleArrange);
  window.addEventListener('orientationchange', scheduleArrange);
  window.addEventListener('resize', debounce(scheduleArrange, 160));
  // If your app re-renders category buttons dynamically, call scheduleArrange() after that update.
  // Expose for manual calls:
  window.sapXepDanhMuc = scheduleArrange;
})();
