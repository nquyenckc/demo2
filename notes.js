// ===============================
// 📝 notes.js - popup ghi chú (Đường / Đá) - BlackTea v2.3
// ===============================

function toggleNotePopup(item, btn) {
  // 🧠 Xác định nguồn dữ liệu (currentTable hoặc hoaDonTam)
  let cartRef = null;
  if (typeof currentTable !== "undefined" && currentTable && currentTable.cart) {
    cartRef = currentTable.cart;
  } else if (typeof hoaDonTam !== "undefined") {
    cartRef = hoaDonTam;
  } else {
    hienThongBao("⚠️ Chưa có đơn hoặc bàn nào được chọn!");
    return;
  }

  // Nếu đã có popup cũ thì remove
  const existing = document.querySelector(".popup-note");
  if (existing) existing.remove();

// ✅ Chỉ gán mặc định nếu chưa có
if (item.sugarLevel === undefined) item.sugarLevel = 2;
if (item.iceLevel === undefined) item.iceLevel = 3;


  // Giao diện popup
const popup = document.createElement("div");
popup.className = "popup-note";
popup.innerHTML = `
  <div class="popup-row">
    <div class="row-top">
      <label>Độ ngọt:</label>
      <span class="slider-label">${getSugarLabels()[item.sugarLevel]}</span>
    </div>
    <input type="range" min="0" max="4" step="1" value="${item.sugarLevel}" class="slider" data-type="sugar">
  </div>

  <div class="popup-row">
    <div class="row-top">
      <label>Mức đá:</label>
      <span class="slider-label">${getIceLabels()[item.iceLevel]}</span>
    </div>
    <input type="range" min="0" max="3" step="1" value="${item.iceLevel}" class="slider" data-type="ice">
  </div>

  <div class="popup-actions">
    <button class="btn hieuung-nhat cancel">✖</button>
    <button class="btn hieuung-noi confirm">✔</button>
  </div>
`;
  document.body.appendChild(popup);
  positionPopupNearButton(popup, btn);

  // 🎚 Cập nhật slider
  popup.querySelectorAll(".slider").forEach((slider) => {
    slider.addEventListener("input", (e) => {
      const lvl = parseInt(e.target.value);
      const type = e.target.dataset.type;
      const label = e.target
        .closest(".popup-row")
        .querySelector(".slider-label");

      if (type === "sugar") {
        item.sugarLevel = lvl;
        label.textContent = getSugarLabels()[lvl];
      } else if (type === "ice") {
        item.iceLevel = lvl;
        label.textContent = getIceLabels()[lvl];
      }
    });
  });

  // -----------------
  // Xử lý nút bấm
  popup.addEventListener("click", async (ev) => {
    ev.stopPropagation();

    // ❌ Hủy
    if (ev.target.classList.contains("cancel")) {
      popup.remove();
      return;
    }

    // ✅ Xác nhận
    if (ev.target.classList.contains("confirm")) {
      const sugarLabel = getSugarLabels()[item.sugarLevel];
      const iceLabel = getIceLabels()[item.iceLevel];
      const isNormalSugar = sugarLabel === "Bình thường";
      const isNormalIce = iceLabel === "Bình thường";

      // Nếu cả hai đều bình thường → bỏ sao, không ghi chú
      if (isNormalSugar && isNormalIce) {
        btn.classList.remove("active");
        const icon = btn.querySelector("i");
        if (icon) {
          icon.classList.remove("fa-solid");
          icon.classList.add("fa-regular");
        }
        popup.remove();
        return;
      }

      // Clone món ghi chú (Đơn ảo)
      const baseQty = cartRef.find((it) => it.id === item.id)?.soluong || 0;
      const noteCount = cartRef.filter(
        (it) => it.id === item.id && it.isNoteOnly
      ).length;
      if (noteCount >= baseQty) {
        hienThongBao(`Đã ghi chú đủ ${baseQty} ly cho món "${item.name}"`);
        return;
      }

      // 🧩 Giảm 1 ly từ món gốc nếu còn
      const goc = cartRef.find((it) => it.id === item.id && !it.isNoteOnly);
      if (goc && goc.soluong > 0) {
        goc.soluong--;
        if (goc.soluong === 0) {
          const idx = cartRef.indexOf(goc);
          if (idx > -1) cartRef.splice(idx, 1);
        }
      }

      // 🆕 Tạo món có ghi chú gọn, tránh lặp tên
      const newItem = JSON.parse(JSON.stringify(item));
      newItem.isNoteOnly = true;

      // 🧹 Loại bỏ phần "(...)" nếu có trong tên cũ
      let baseName = item.name;
      if (baseName.includes("(")) baseName = baseName.split("(")[0].trim();

      // Chỉ thêm phần khác “Bình thường”
      const ghiChuParts = [];
      if (!isNormalSugar) ghiChuParts.push(sugarLabel);
      if (!isNormalIce) ghiChuParts.push(iceLabel);

      newItem.note = ghiChuParts.join(", ");
      newItem.name = ghiChuParts.length
        ? `${baseName} (${newItem.note})`
        : baseName;
      newItem.soluong = 1;
      newItem.price = item.price;

      cartRef.push(newItem);

      // ⭐ Cập nhật sao (tô đặc)
      btn.classList.add("active");
      const icon = btn.querySelector("i");
      if (icon) {
        icon.classList.remove("fa-regular");
        icon.classList.add("fa-solid");
      }

      try {
        if (typeof capNhatHoaDon === "function") capNhatHoaDon();
        if (typeof saveAll === "function") await saveAll();
        if (typeof renderTables === "function") renderTables();
      } catch (err) {
        console.error("❌ Lỗi khi cập nhật ghi chú:", err);
      }

      popup.remove();
    }
  });

  // Tự đóng khi click ra ngoài
  setTimeout(() => {
    document.addEventListener(
      "click",
      function onDocClick(ev) {
        if (!popup.contains(ev.target)) popup.remove();
      },
      { once: true }
    );
  }, 100);
}

// ----------------------
// Helpers
function getSugarLabels() {
  return ["Không ngọt", "Ít ngọt", "Bình thường", "Ngọt vừa", "Ngọt nhiều"];
}
function getIceLabels() {
  return ["Không đá", "Ít đá", "Đá vừa", "Bình thường"];
}

// ----------------------
// Helpers
// ----------------------
function getSugarLabels() {
  return ['Không ngọt', 'Ít ngọt', 'Bình thường', 'Ngọt vừa', 'Ngọt nhiều'];
}

function getIceLabels() {
  return ['Không đá', 'Ít đá', 'Đá vừa', 'Bình thường'];
}

function positionPopupNearButton(popup, btn) {
  // 📌 Lấy vị trí nút sao
  const rect = btn.getBoundingClientRect();
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

  // 📦 Ẩn popup tạm để đo đúng kích thước mà không gây reflow
  popup.style.visibility = "hidden";
  popup.style.display = "block";
  const popupWidth = popup.offsetWidth;
  const popupHeight = popup.offsetHeight;
  popup.style.visibility = "";
  popup.style.display = "";

  // 🧭 Tính toán vị trí
  let top = rect.bottom + scrollTop + 6;
  const screenHeight = window.innerHeight;
  if (rect.bottom + popupHeight > screenHeight - 10)
    top = rect.top + scrollTop - popupHeight - 6;

  // Căn giữa popup ngay dưới nút sao
  let left = rect.left + scrollLeft + rect.width / 2 - popupWidth / 2;
  const screenWidth = window.innerWidth;
  if (left < 6) left = 6;
  if (left + popupWidth > screenWidth - 6)
    left = screenWidth - popupWidth - 6;

  // 🧩 Áp dụng vị trí cuối cùng
  popup.style.position = "absolute";
  popup.style.top = `${top}px`;
  popup.style.left = `${left}px`;
  popup.style.transform = "none"; // bỏ translateX(-50%) gây rung
  popup.style.transition = "opacity 0.12s ease, transform 0.12s ease";
  popup.style.zIndex = 1000;
}


// ===============================
// 🔔 Thông báo ngắn (hiện rồi tự tắt)
// ===============================
function hienThongBao(noiDung, loai = "thanhcong", thoigian = 2000) {
  const tb = document.createElement("div");
  tb.className = `thong-bao ${loai}`;
  tb.textContent = noiDung;
  document.body.appendChild(tb);

  setTimeout(() => tb.classList.add("hien"), 10);
  setTimeout(() => tb.classList.remove("hien"), thoigian);
  setTimeout(() => tb.remove(), thoigian + 300);
}

// ===============================
// ⚙️ Hộp xác nhận (có nút Đồng ý / Hủy)
// ===============================
function hopXacNhan(noiDung, khiDongY, khiHuy) {
  const hop = document.createElement("div");
  hop.className = "xac-nhan";
  hop.innerHTML = `
    <h3>${noiDung}</h3>
    <div class="nut">
      <button class="dongy">Đồng ý</button>
      <button class="huy">Hủy</button>
    </div>
  `;
  document.body.appendChild(hop);

  hop.querySelector(".dongy").addEventListener("click", () => {
    hop.remove();
    if (khiDongY) khiDongY();
  });

  hop.querySelector(".huy").addEventListener("click", () => {
    hop.remove();
    if (khiHuy) khiHuy();
  });
}


// ================================
// ☕ SLIDER XÁC NHẬN ĐƠN - có thể gọi từ app.js
// ================================
function khoiTaoSliderXacNhan(don, onXacNhan) {
  const slider = document.getElementById("sliderConfirm");
  if (!slider) return;

  const handle = slider.querySelector(".handle");
  const text = slider.querySelector(".text");

  // 🔧 Đảm bảo icon đúng
  handle.innerHTML = `<img src="icons/caphe.svg" alt="icon" class="slider-icon">`;

  let isDragging = false;
  let startX = 0;

  handle.addEventListener("mousedown", startDrag);
  handle.addEventListener("touchstart", startDrag, { passive: true });

  function startDrag(e) {
    if (slider.classList.contains("success")) return;
    isDragging = true;
    startX = e.touches ? e.touches[0].clientX : e.clientX;
    document.addEventListener("mousemove", onDrag);
    document.addEventListener("mouseup", endDrag);
    document.addEventListener("touchmove", onDrag);
    document.addEventListener("touchend", endDrag);
  }

  function onDrag(e) {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    let diff = clientX - startX;
    const max = slider.offsetWidth - handle.offsetWidth - 8;
    if (diff < 0) diff = 0;
    if (diff > max) diff = max;
    handle.style.left = diff + "px";
  }

  function endDrag() {
    if (!isDragging) return;
    isDragging = false;
    const maxPos = slider.offsetWidth - handle.offsetWidth - 8;
    const current = parseInt(handle.style.left) || 0;

    if (current >= maxPos * 0.9) {
      // ✅ Thành công
      slider.classList.add("success");
      handle.style.left = maxPos + "px";
      text.innerText = "Đã xác nhận";
      slider.style.animation = "confirmShake 0.4s ease";

      // 🔄 Hiệu ứng rung nhẹ cho icon
      const img = handle.querySelector("img");
      if (img) {
        img.style.animation = "iconBounce 0.5s ease";
        setTimeout(() => (img.style.animation = ""), 500);
      }

      // 🧩 Gọi callback sau khi xác nhận
      if (typeof onXacNhan === "function") onXacNhan(don);

    } else {
      // ❌ Trượt chưa đủ xa, trả lại vị trí ban đầu
      handle.style.left = "5px";
      handle.innerHTML = `<img src="icons/caphe.svg" alt="icon" class="slider-icon">`;
    }

    document.removeEventListener("mousemove", onDrag);
    document.removeEventListener("mouseup", endDrag);
    document.removeEventListener("touchmove", onDrag);
    document.removeEventListener("touchend", endDrag);
  }
}

// Mở màn hình từ trái sang phải
function openScreen(el) {
  if (!el) return;
  el.classList.remove('slide-out-left', 'active');  // reset nếu đang đóng
  el.classList.add('slide-in-right');              // chuẩn bị class mở
  // cho trình duyệt nhận class mới trước khi thêm active
  requestAnimationFrame(() => el.classList.add('active'));
}

// Đóng màn hình sang trái (trượt ngược)
function closeScreen(el, cb) {
  if (!el) {
    if (typeof cb === 'function') cb();
    return;
  }
  el.classList.remove('slide-in-right', 'active'); // reset nếu đang mở
  el.classList.add('slide-out-left');              // chuẩn bị đóng
  requestAnimationFrame(() => el.classList.add('active'));

  // callback khi transition kết thúc
  const onTransitionEnd = () => {
    el.removeEventListener('transitionend', onTransitionEnd);
    if (typeof cb === 'function') cb();
  };
  el.addEventListener('transitionend', onTransitionEnd);
}

// Make globally available
window.openScreen = openScreen;
window.closeScreen = closeScreen;

/**
 * closeScreen: Trượt phần tử ra khỏi màn hình và gọi callback sau khi kết thúc.
 * @param {HTMLElement} el - Phần tử cần trượt ra
 * @param {Function} callback - Hàm sẽ gọi sau khi trượt xong
 */
function closeScreen(el, callback) {
  if (!el) return;

  // Thêm class slide-out-left để trượt ra
  el.classList.add("slide-out-left");

  // Đảm bảo layout đã được repaint trước khi active
  requestAnimationFrame(() => {
    el.classList.add("active");
  });

  // Thời gian transition phải trùng với CSS (~0.3s)
  const transitionTime = 300; 

  setTimeout(() => {
    // Xóa phần tử hoặc reset class
    el.classList.remove("slide-out-left", "active");
    if (typeof callback === "function") callback();
  }, transitionTime);
}

/**
 * openScreen: Trượt phần tử vào màn hình từ trái sang phải
 * @param {HTMLElement} el 
 */
function openScreen(el) {
  if (!el) return;

  el.classList.add("slide-in-right");
  requestAnimationFrame(() => {
    el.classList.add("active");
  });
}