// ===============================
// ☕ ORDER.JS - BlackTea v2.1
// ===============================

// Dữ liệu hóa đơn tạm
let hoaDonTam = [];

// Khởi tạo màn hình Order
function khoiTaoOrder(loaiKhach) {
  const body = document.body;
  body.innerHTML = `
    <div class="order-container" id="order-container">
      <div class="order-header">
        <div>${loaiKhach}</div>
        <button class="btn-close" onclick="quayLaiTrangChinh()">×</button>
      </div>

      <div class="order-search">
        <input type="text" id="timMonInput" placeholder="Tìm món..." oninput="timMon()" />
      </div>

      <div class="order-categories" id="danhMucContainer"></div>

      <div class="order-content">
        <div class="order-list" id="dsMon"></div>
        <div class="hoa-don-tam empty" id="hoaDonTam">Chưa có món nào</div>
      </div>

      <!-- ⚡ chỉ 1 footer duy nhất -->
      <div class="order-footer">
        <div class="order-total">Tổng: <span id="tongTien">0đ</span></div>
        <div class="order-buttons">
          <button id="btnDatLai">Đặt lại</button>
          <button id="btnLuuDon" class="btn-primary">Lưu đơn</button>
        </div>
      </div>
    </div>
  `;

  taoDanhMuc();
  hienThiMonTheoDanhMuc("");

  // ⚡ Gắn sự kiện lại sau khi DOM render
  document.getElementById("btnDatLai").addEventListener("click", datLaiDon);
  document.getElementById("btnLuuDon").addEventListener("click", luuDon);
}


// -------------------------------
// Hiển thị danh mục món
function taoDanhMuc() {
  const dsDanhMuc = [ ...new Set(MENU.map((m) => m.cat))];
  const container = document.getElementById("danhMucContainer");
  container.innerHTML = "";

  dsDanhMuc.forEach((ten) => {
    const btn = document.createElement("button");
    btn.className = "danh-muc-btn";
    btn.textContent = ten;
    btn.onclick = () => hienThiMonTheoDanhMuc(ten);
    container.appendChild(btn);
  });
}

// -------------------------------
// Hiển thị danh sách món theo danh mục
function hienThiMonTheoDanhMuc(danhMuc) {
  const dsMon = document.getElementById("dsMon");
  dsMon.innerHTML = "";

  const loc = danhMuc === "Tất cả" ? MENU : MENU.filter((m) => m.cat === danhMuc);

  loc.forEach((mon) => {
    const div = document.createElement("div");
    div.className = "mon-item";
    div.innerHTML = `
      <div>
        <div class="mon-ten">${mon.name}</div>
        <div class="mon-gia">${mon.price.toLocaleString()}₫</div>
      </div>
      <div class="mon-qty">
        <button onclick="giamMon(${mon.id})">−</button>
        <span id="sl-${mon.id}">${timSoLuong(mon.id)}</span>
        <button onclick="themMon(${mon.id})">+</button>
      </div>
    `;
    dsMon.appendChild(div);
  });
}

// -------------------------------
// Thêm, giảm, cập nhật món
function timSoLuong(id) {
  const mon = hoaDonTam.find((m) => m.id === id);
  return mon ? mon.soluong : 0;
}

function themMon(id) {
  const mon = MENU.find((m) => m.id === id);
  const tonTai = hoaDonTam.find((m) => m.id === id);

  if (tonTai) tonTai.soluong++;
  else hoaDonTam.push({ ...mon, soluong: 1 });

  capNhatHoaDon();
}

function giamMon(id) {
  const idx = hoaDonTam.findIndex((m) => m.id === id);
  if (idx > -1) {
    hoaDonTam[idx].soluong--;
    if (hoaDonTam[idx].soluong <= 0) hoaDonTam.splice(idx, 1);
    capNhatHoaDon();
  }
}

// -------------------------------
// Cập nhật hóa đơn & tổng tiền
function capNhatHoaDon() {
  const hdDiv = document.getElementById("hoaDonTam");
  hdDiv.innerHTML = "";
  hdDiv.classList.remove("empty");

  if (hoaDonTam.length === 0) {
    hdDiv.classList.add("empty");
    hdDiv.textContent = "Chưa có món nào";
  } else {
    hoaDonTam.forEach((m) => {
      const dong = document.createElement("div");
      dong.className = "hoa-don-item";
      dong.innerHTML = `
        <span>${m.name} x${m.soluong}</span>
        <span>${(m.price * m.soluong).toLocaleString()}₫</span>
      `;
      hdDiv.appendChild(dong);
    });
  }

  // Cập nhật tổng tiền
  const tong = hoaDonTam.reduce((t, m) => t + m.price * m.soluong, 0);
  document.getElementById("tongTien").textContent = `${tong.toLocaleString()}₫`;

  // Cập nhật lại số lượng hiển thị
  hoaDonTam.forEach((m) => {
    const slEl = document.getElementById(`sl-${m.id}`);
    if (slEl) slEl.textContent = m.soluong;
  });
}

// -------------------------------
// Chức năng footer
function datLai() {
  hoaDonTam = [];
  capNhatHoaDon();
}

function luuDon() {
  if (hoaDonTam.length === 0) {
    alert("Chưa có món nào để lưu!");
    return;
  }
  alert("💾 Đơn đã được lưu tạm!");
  hoaDonTam = [];
  capNhatHoaDon();
}

// -------------------------------
// Tìm món theo từ khóa
function timMon() {
  const tuKhoa = document.getElementById("timMonInput").value.toLowerCase();
  const ketQua = MENU.filter((m) => m.name.toLowerCase().includes(tuKhoa));
  const dsMon = document.getElementById("dsMon");
  dsMon.innerHTML = "";

  ketQua.forEach((mon) => {
    const div = document.createElement("div");
    div.className = "mon-item";
    div.innerHTML = `
      <div>
        <div class="mon-ten">${mon.name}</div>
        <div class="mon-gia">${mon.price.toLocaleString()}₫</div>
      </div>
      <div class="mon-qty">
        <button onclick="giamMon(${mon.id})">−</button>
        <span id="sl-${mon.id}">${timSoLuong(mon.id)}</span>
        <button onclick="themMon(${mon.id})">+</button>
      </div>
    `;
    dsMon.appendChild(div);
  });
}

// -------------------------------
// Quay lại màn hình chính
function quayLaiTrangChinh() {
  location.reload();
}


