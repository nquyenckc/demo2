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

    <div class="order-search">
      <input type="text" id="timMonInput" placeholder="Tìm món..." oninput="timMon()" />
    </div>

    <div class="order-categories" id="danhMucContainer"></div>

    <!-- 🔹 Danh sách món (cuộn được) -->
    <div class="order-content">
      <div class="order-list" id="dsMon"></div>
    </div>

    <!-- 🔹 Hóa đơn tạm (cố định, không cuộn, nội dung bên trong cuộn) -->
    <div class="hoa-don-tam empty" id="hoaDonTam">Chưa có món nào</div>

    <!-- 🔹 Thanh tổng / footer (cố định đáy) -->
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

  document.getElementById("btnDatLai").addEventListener("click", datLai);
  document.getElementById("btnLuuDon").addEventListener("click", luuDon);
  setTimeout(updateOrderOffsets, 100); // đợi render xong rồi tính lại
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
        <button class="note-btn ${sl > 0 ? '' : 'faded'}" onclick="if(${sl} > 0) toggleNotePopup(MENU.find(m => m.id === ${mon.id}), this)">☆</button>
        <button class="btn-minus ${sl > 0 ? '' : 'faded'}" onclick="if(${sl} > 0) giamMon(${mon.id})">−</button>
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

  const qtyBox = document.querySelector(`#qty-${id}`);
  const noteBtn = qtyBox.querySelector(".note-btn");
  const giamBtn = qtyBox.querySelector(".btn-minus");

  // Khi có ít nhất 1 món → hiện rõ và bật nút
  if (noteBtn) noteBtn.classList.remove("faded");
  if (giamBtn) giamBtn.classList.remove("faded");

  // Gán lại onclick khi có món
  noteBtn.setAttribute("onclick", `toggleNotePopup(MENU.find(m => m.id === ${id}), this)`);
  giamBtn.setAttribute("onclick", `giamMon(${id})`);
}
function giamMon(id) {
  const idx = hoaDonTam.findIndex((m) => m.id === id);
  if (idx > -1) {
    hoaDonTam[idx].soluong--;
    if (hoaDonTam[idx].soluong <= 0) hoaDonTam.splice(idx, 1);
  }

  const qtyBox = document.querySelector(`#qty-${id}`);
  const slEl = document.getElementById(`sl-${id}`);
  const noteBtn = qtyBox.querySelector(".note-btn");
  const giamBtn = qtyBox.querySelector(".btn-minus");

  const mon = hoaDonTam.find((m) => m.id === id);
  const sl = mon ? mon.soluong : 0;
  if (slEl) slEl.textContent = sl;

  // Khi = 0 → mờ sao & trừ + khóa bấm
  if (sl === 0) {
    if (noteBtn) {
      noteBtn.classList.add("faded");
      noteBtn.setAttribute("onclick", ""); // khóa click
    }
    if (giamBtn) {
      giamBtn.classList.add("faded");
      giamBtn.setAttribute("onclick", ""); // khóa click
    }
  }

  capNhatHoaDon();
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

  // ✅ Đổi TABLES → hoaDonChinh để đồng bộ với tables.js mới
  hoaDonChinh.push(donMoi);
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


// =============================================
// 📏 Tự tính khoảng trống hiển thị cho danh sách món
// =============================================
function updateOrderOffsets() {
  const header = document.querySelector('header');
  const search = document.querySelector('.order-search');
  const categories = document.querySelector('.order-categories');
  const hoaDon = document.querySelector('.hoa-don-tam');
  const footer = document.querySelector('.order-footer');

  const gap = 10;
  const headerH = header ? header.offsetHeight : 0;
  const searchH = search ? search.offsetHeight : 0;
  const catH = categories ? categories.offsetHeight : 0;
  const hoaDonH = hoaDon ? hoaDon.offsetHeight : 0;
  const footerH = footer ? footer.offsetHeight : 0;

  // top = header + 10 + search + 10 + categories + 10
  const topPx = headerH + gap + searchH + gap + catH + gap;
  // bottom = hoa-don + 10 + footer + 10
  const bottomPx = hoaDonH + gap + footerH + gap;

  document.documentElement.style.setProperty('--order-top', `${topPx}px`);
  document.documentElement.style.setProperty('--order-bottom', `${bottomPx}px`);
}

// Sau khi render xong popup, gọi updateOffset:
window.addEventListener('resize', updateOrderOffsets);






