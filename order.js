// ===============================
// ☕ ORDER.JS - BlackTea v2.2 (đã tinh chỉnh)
// ===============================

let hoaDonTam = [];
let loaiKhachHienTai = "";

// Khởi tạo màn hình Order
function khoiTaoOrder(loaiKhach) {
  loaiKhachHienTai = loaiKhach;

  // 🔷 Cập nhật header (giữ style gốc, chỉ thay nội dung)
  const header = document.querySelector("header");
  header.innerHTML = `
    <h1>${loaiKhach}</h1>
    <div class="header-icons">
      <button class="btn-close-order" id="btnCloseHeader">×</button>
    </div>
  `;

  // 👉 Gắn sự kiện nút × để quay về màn hình chính
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

  // ⚡ Nội dung phần order
  const main = document.querySelector(".main-container");
  main.innerHTML = `
    <div class="order-container">
      <div class="order-search">
        <input type="text" id="timMonInput" placeholder="Tìm món..." oninput="timMon()" />
      </div>

      <div class="order-categories" id="danhMucContainer"></div>

      <div class="order-content">
        <div class="order-list" id="dsMon"></div>
        <div class="hoa-don-tam empty" id="hoaDonTam">Chưa có món nào</div>
      </div>

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

  // ⚙️ Gắn sự kiện cho các nút
  document.getElementById("btnDatLai").addEventListener("click", datLai);
  document.getElementById("btnLuuDon").addEventListener("click", luuDon);
}



// -------------------------------
// Danh mục
function taoDanhMuc() {
  const dsDanhMuc = [...new Set(MENU.map((m) => m.cat))];
  const container = document.getElementById("danhMucContainer");
  container.innerHTML = "";

  const btnAll = document.createElement("button");
  btnAll.textContent = "Tất cả";
  btnAll.className = "danh-muc-btn";
  btnAll.onclick = () => hienThiMonTheoDanhMuc("");
  container.appendChild(btnAll);

  dsDanhMuc.forEach((ten) => {
    const btn = document.createElement("button");
    btn.className = "danh-muc-btn";
    btn.textContent = ten;
    btn.onclick = () => hienThiMonTheoDanhMuc(ten);
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
    const div = document.createElement("div");
    div.className = "mon-item";
    div.innerHTML = `
      <div>
        <div class="mon-ten">${mon.name}</div>
        <div class="mon-gia">${mon.price.toLocaleString()}₫</div>
      </div>
<div class="mon-qty">
  <button class="note-btn" onclick="toggleNotePopup(MENU.find(m => m.id === ${mon.id}), this)">☆</button>
  <button onclick="giamMon(${mon.id})">−</button>
  <span id="sl-${mon.id}">${timSoLuong(mon.id)}</span>
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
}

function giamMon(id) {
  const idx = hoaDonTam.findIndex((m) => m.id === id);
  if (idx > -1) {
    hoaDonTam[idx].soluong--;
    if (hoaDonTam[idx].soluong <= 0) {
      hoaDonTam.splice(idx, 1);
    }
    capNhatHoaDon();

    // 🔁 Cập nhật lại danh sách món trên màn hình
    const currentCategoryBtn = document.querySelector(".danh-muc-btn.active");
    const currentCategory = currentCategoryBtn ? currentCategoryBtn.textContent : "";
    hienThiMonTheoDanhMuc(currentCategory);
  }
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
}

// -------------------------------
// Lưu đơn ra màn chính
function luuDon() {
  if (hoaDonTam.length === 0) {
    alert("Chưa có món nào để lưu!");
    return;
  }

  // 🔹 Nếu là khách mang đi thì chỉ khi lưu đơn mới tăng số thứ tự
  if (loaiKhachHienTai === "Khách mang đi") {
    loaiKhachHienTai = taoTenKhach("Khách mang đi"); // Sinh tên thật sự (Mang đi 1, 2, 3…)
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

  // 🔁 Khôi phục lại header về trạng thái ban đầu
  const header = document.querySelector("header");
  header.innerHTML = `
    <h1>BlackTea</h1>
    <div class="header-icons">
      <span class="icon-btn">🧾</span>
      <span class="icon-btn">⚙️</span>
    </div>
  `;

  // 👉 Quay về màn hình chính và render lại danh sách
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
  hienThiManHinhChinh();
  renderTables();
}
