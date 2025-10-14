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
    alert("⚠️ Chưa có đơn hoặc bàn nào được chọn!");
    return;
  }

  // Nếu đã có popup cũ thì remove
  const existing = document.querySelector('.popup-note');
  if (existing) existing.remove();

  // Giá trị mặc định
  if (item.sugarLevel === undefined) item.sugarLevel = 2;
  if (item.iceLevel === undefined) item.iceLevel = 3;

  // Giao diện popup
  const popup = document.createElement('div');
  popup.className = 'popup-note';
  popup.innerHTML = `
    <div class="popup-row">
      <label>Đường:</label>
      <input type="range" min="0" max="4" step="1" value="${item.sugarLevel}" class="slider" data-type="sugar">
      <span class="slider-label">${getSugarLabels()[item.sugarLevel]}</span>
    </div>
    <div class="popup-row">
      <label>Đá:</label>
      <input type="range" min="0" max="3" step="1" value="${item.iceLevel}" class="slider" data-type="ice">
      <span class="slider-label">${getIceLabels()[item.iceLevel]}</span>
    </div>
    <div class="popup-actions">
      <button class="cancel">✖</button>
      <button class="confirm">✔</button>
    </div>
  `;
  document.body.appendChild(popup);

  positionPopupNearButton(popup, btn);

  // -----------------
  // 🎚 Xử lý slider
  popup.querySelectorAll('.slider').forEach(slider => {
    slider.addEventListener('input', e => {
      const lvl = parseInt(e.target.value);
      const type = e.target.dataset.type;
      const label = e.target.closest('.popup-row').querySelector('.slider-label');

      if (type === 'sugar') {
        item.sugarLevel = lvl;
        label.textContent = getSugarLabels()[lvl];
      } else if (type === 'ice') {
        item.iceLevel = lvl;
        label.textContent = getIceLabels()[lvl];
      }
    });
  });

  // -----------------
  // Xử lý nút bấm
  popup.addEventListener('click', async (ev) => {
    ev.stopPropagation();

    // ❌ Hủy
    if (ev.target.classList.contains('cancel')) {
      popup.remove();
      return;
    }

    // ✅ Xác nhận
    if (ev.target.classList.contains('confirm')) {
      const isNormalSugar = Number(item.sugarLevel) === 2;
      const isNormalIce = Number(item.iceLevel) === 3;

      // Nếu bình thường -> bỏ sao, không ghi chú
      if (isNormalSugar && isNormalIce) {
        btn.innerText = '☆';
        btn.classList.remove('active');
        popup.remove();
        return;
      }

      // -----------------
      // Clone món ghi chú (Đơn ảo)
      const baseQty = cartRef.find(it => it.id === item.id)?.soluong || 0;
      const noteCount = cartRef.filter(it => it.id === item.id && it.isNoteOnly).length;

      if (noteCount >= baseQty) {
        alert(`Đã ghi chú đủ ${baseQty} ly cho món "${item.name}"`);
        return;
      }

      const newItem = JSON.parse(JSON.stringify(item));
      newItem.isNoteOnly = true;
      newItem.note = `Đường: ${getSugarLabels()[item.sugarLevel]}, Đá: ${getIceLabels()[item.iceLevel]}`;
      newItem.name = `${item.name} (${getSugarLabels()[item.sugarLevel]}, ${getIceLabels()[item.iceLevel]})`;
      newItem.soluong = 1;
      newItem.price = item.price; // giữ giá gốc

      cartRef.push(newItem);

      // ⭐ Cập nhật sao
      btn.innerText = '★';
      btn.classList.add('active');

      // -----------------
      // Cập nhật UI và dữ liệu
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
// ----------------------
function getSugarLabels() {
  return ['Không', 'Ít', 'Bình thường', 'Thêm ít', 'Thêm nhiều'];
}
function getIceLabels() {
  return ['Không đá', 'Đá ít', 'Đá vừa', 'Bình thường'];
}
function positionPopupNearButton(popup, btn) {
  const rect = btn.getBoundingClientRect();
  const popupRect = popup.getBoundingClientRect();
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const screenHeight = window.innerHeight;

  let top = rect.bottom + scrollTop + 5;
  if (rect.bottom + popupRect.height > screenHeight - 10)
    top = rect.top + scrollTop - popupRect.height - 5;

  let left = rect.left + rect.width / 2;
  const screenWidth = window.innerWidth;
  if (left - popupRect.width / 2 < 5) left = popupRect.width / 2 + 5;
  if (left + popupRect.width / 2 > screenWidth - 5)
    left = screenWidth - popupRect.width / 2 - 5;

  popup.style.position = "absolute";
  popup.style.top = `${top}px`;
  popup.style.left = `${left}px`;
  popup.style.transform = "translateX(-50%)";
  popup.style.zIndex = 1000;
}
