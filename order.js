// ===============================
// ☕ ORDER.JS - BlackTea v2.3 (có logic sao động)
// ===============================

let hoaDonTam = [];
let loaiKhachHienTai = "";

// -------------------------------
// Khởi tạo màn hình Order
function khoiTaoOrder(loaiKhach) {
  loaiKhachHienTai = loaiKhach;

  const header = document.querySelector("header");
  header.innerHTML = `
    <h1>${loaiKhach}</h1>
    <div class="header-icons">
      <button class="btn-close-order" id="btnCloseHeader">×</button>
    </div>
  `;

  document.getElementById("btnCloseHeader").addEventListener("click", () => {
    header.innerHTML = `
      <h1>BlackTea</h1>
      <div class="header-icons">
        <span class="icon-btn">🧾</span>
        <span class="icon-btn">⚙️</span>
      </div>
    `;
    hienThiManHinhChinh();
    renderTables();
  });

  const main = document.querySelector(".main-container");
main.innerHTML = `
  <div class="order-container">

    <div class="order-header">
      ...
    </div>

    <div class="order-content">
      <div class="order-list" id="dsMon"></div>
    </div>

    <!-- 🔹 Tách hóa đơn tạm ra khỏi phần cuộn -->
    <div class="hoa-don-tam empty" id="hoaDonTam">Chưa có món nào</div>

    <div class="order-footer">
      ...
    </div>

  </div>
`;

  taoDanhMuc();
  hienThiMonTheoDanhMuc("");

  document.getElementById("btnDatLai").addEventListener("click", datLai);
  document.getElementById("btnLuuDon").addEventListener("click", luuDon);
}

// -------------------------------
function taoDanhMuc() {
  const dsDanhMuc = [...new Set(MENU.map((m) => m.cat))];
  const container = document.getElementById("danhMucContainer");
  container.innerHTML = "";

  dsDanhMuc.forEach((ten) => {
    const btn = document.createElement("button");
    btn.className = "danh-muc-btn";
    btn.textContent = ten;
    btn.onclick = () => {
      document.querySelectorAll(".danh-muc-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      hienThiMonTheoDanhMuc(ten);
    };
    container.appendChild(btn);
  });
}

// -------------------------------
// Hiển thị danh sách món
function hienThiMonTheoDanhMuc(danhMuc) {
  const dsMon = document.getElementById("dsMon");
  dsMon.innerHTML = "";

  const loc = danhMuc === "" ? MENU : MENU.filter((m) => m.cat === danhMuc);

  loc.forEach((mon) => {
    const sl = timSoLuong(mon.id);
    const div = document.createElement("div");
    div.className = "mon-item";
    div.innerHTML = `
      <div>
        <div class="mon-ten">${mon.name}</div>
        <div class="mon-gia">${mon.price.toLocaleString()}₫</div>
      </div>
      <div class="mon-qty" id="qty-${mon.id}">
        <button class="note-btn ${sl > 0 ? '' : 'hidden'}" onclick="toggleNotePopup(MENU.find(m => m.id === ${mon.id}), this)">☆</button>
        <button onclick="giamMon(${mon.id})">−</button>
        <span id="sl-${mon.id}">${sl}</span>
        <button onclick="themMon(${mon.id})">+</button>
      </div>
    `;
    dsMon.appendChild(div);
  });
}

// -------------------------------
// Thêm / giảm món
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

  // ⭐ Cập nhật sao hiển thị
  const noteBtn = document.querySelector(`#qty-${id} .note-btn`);
  if (noteBtn) noteBtn.classList.remove("hidden");
}

function giamMon(id) {
  const idx = hoaDonTam.findIndex((m) => m.id === id);
  if (idx > -1) {
    hoaDonTam[idx].soluong--;
    if (hoaDonTam[idx].soluong <= 0) hoaDonTam.splice(idx, 1);
  }

  capNhatHoaDon();

  // ⭐ Ẩn sao nếu số lượng = 0
  const noteBtn = document.querySelector(`#qty-${id} .note-btn`);
  if (noteBtn && timSoLuong(id) === 0) noteBtn.classList.add("hidden");
}

// -------------------------------
// Cập nhật hóa đơn
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

  const tong = hoaDonTam.reduce((t, m) => t + m.price * m.soluong, 0);
  document.getElementById("tongTien").textContent = `${tong.toLocaleString()}₫`;

  hoaDonTam.forEach((m) => {
    const slEl = document.getElementById(`sl-${m.id}`);
    if (slEl) slEl.textContent = m.soluong;
  });
}

// -------------------------------
// Đặt lại đơn
function datLai() {
  hoaDonTam = [];
  capNhatHoaDon();
  hienThiMonTheoDanhMuc("");
}

// -------------------------------
// Lưu đơn
function luuDon() {
  if (hoaDonTam.length === 0) {
    alert("Chưa có món nào để lưu!");
    return;
  }

  if (loaiKhachHienTai === "Khách mang đi") {
    loaiKhachHienTai = taoTenKhach("Khách mang đi");
  }

  const donMoi = {
    id: Date.now(),
    name: loaiKhachHienTai,
    cart: [...hoaDonTam],
    createdAt: Date.now()
  };

  TABLES.push(donMoi);
  saveAll();

  hoaDonTam = [];
  capNhatHoaDon();

  alert("✅ Đã lưu đơn!");

  const header = document.querySelector("header");
  header.innerHTML = `
    <h1>BlackTea</h1>
    <div class="header-icons">
      <span class="icon-btn">🧾</span>
      <span class="icon-btn">⚙️</span>
    </div>
  `;

  hienThiManHinhChinh();
  renderTables();
}

// -------------------------------
// Tìm món theo từ khóa
function timMon() {
  const tuKhoa = document.getElementById("timMonInput").value.toLowerCase();
  const ketQua = MENU.filter((m) => m.name.toLowerCase().includes(tuKhoa));
  const dsMon = document.getElementById("dsMon");
  dsMon.innerHTML = "";

  ketQua.forEach((mon) => {
    const sl = timSoLuong(mon.id);
    const div = document.createElement("div");
    div.className = "mon-item";
    div.innerHTML = `
      <div>
        <div class="mon-ten">${mon.name}</div>
        <div class="mon-gia">${mon.price.toLocaleString()}₫</div>
      </div>
      <div class="mon-qty" id="qty-${mon.id}">
        <button class="note-btn ${sl > 0 ? '' : 'hidden'}" onclick="toggleNotePopup(MENU.find(m => m.id === ${mon.id}), this)">☆</button>
        <button onclick="giamMon(${mon.id})">−</button>
        <span id="sl-${mon.id}">${sl}</span>
        <button onclick="themMon(${mon.id})">+</button>
      </div>
    `;
    dsMon.appendChild(div);
  });
}


