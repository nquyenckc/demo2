// ===============================
// 📝 notes.js - xử lý nút "sao" và popup chỉnh Đường/Đá (tách từ app v8)
// ===============================

// Gọi từ menu rendering: toggleNotePopup(item, btn)
// item: object từ MENU (một món), btn: nút DOM tương ứng (star button)

function toggleNotePopup(item, btn) {
  // Nếu đã có popup cũ thì remove
  const existing = document.querySelector('.popup-note');
  if (existing) existing.remove();

  // đảm bảo có giá trị mặc định
  if (item.sugarLevel === undefined) item.sugarLevel = 2;
  if (item.iceLevel === undefined) item.iceLevel = 3;

  // tạo popup
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

  // Vị trí hiển thị thông minh (dựa vào btn)
  positionPopupNearButton(popup, btn);

  // Khi click confirm / cancel xử lý
  popup.addEventListener('click', async function (ev) {
    ev.stopPropagation();

    if (ev.target.classList.contains('confirm')) {
      const isNormalSugar = Number(item.sugarLevel) === 2;
      const isNormalIce = Number(item.iceLevel) === 3;

      // tìm index item trong currentTable.cart (nếu có)
      const idx = currentTable.cart.findIndex(it => it.id === item.id);

      if (idx >= 0) {
        // nếu thao tác trở về mặc định -> reset giá trị lưu trên cart (nếu lưu trước đó)
        if (isNormalSugar && isNormalIce) {
          currentTable.cart[idx].sugarLevel = 2;
          currentTable.cart[idx].iceLevel = 3;
          currentTable.cart[idx].star = false;
        } else {
          // else: thêm 1 item ghi chú ảo (isNoteOnly)
          // giới hạn số ghi chú = số lượng thực (baseQty) của món
          const baseQty = currentTable.cart
            .filter(it => it.id === item.id && !it.isNoteOnly)
            .reduce((sum, it) => sum + (it.qty || 0), 0);

          const noteCount = currentTable.cart
            .filter(it => it.id === item.id && it.isNoteOnly)
            .length;

          if (noteCount >= baseQty) {
            showCustomAlert(`Đã ghi chú đủ ${baseQty} ly cho món "${item.name}"`);
            return;
          }

          const newItem = JSON.parse(JSON.stringify(item));
          newItem.sugarLevel = item.sugarLevel;
          newItem.iceLevel = item.iceLevel;
          newItem.star = true;
          newItem.qty = 0; // không ảnh hưởng tổng cộng
          newItem.isNoteOnly = true;
          currentTable.cart.push(newItem);
        }
      }

      // cập nhật trạng thái hiển thị của nút sao
      if (isNormalSugar && isNormalIce) {
        btn.innerText = '☆';
        btn.classList.remove('active');
      } else {
        btn.innerText = '★';
        btn.classList.add('active');
      }
      item.star = !(Number(item.sugarLevel) === 2 && Number(item.iceLevel) === 3);

      popup.remove();

      // Cập nhật TABLES/currentTable => lưu & render giao diện
      const tableIdx = TABLES.findIndex(t => t.id === currentTable.id);
      if (tableIdx >= 0) TABLES[tableIdx] = JSON.parse(JSON.stringify(currentTable));

      try {
        // saveAll, renderTables, renderCart cần tồn tại toàn cục (từ app.js)
        if (typeof saveAll === 'function') await saveAll();
        if (typeof renderTables === 'function') renderTables();
        if (typeof renderCart === 'function') renderCart();
      } catch (err) {
        console.error('❌ Lỗi khi lưu ghi chú:', err);
      }
    }

    if (ev.target.classList.contains('cancel')) popup.remove();
  });

  // slider xử lý
  popup.querySelectorAll('.slider').forEach(slider => {
    slider.addEventListener('input', e => {
      const lvl = parseInt(e.target.value);
      const type = e.target.dataset.type;
      const row = e.target.closest('.popup-row');
      const title = row.querySelector('label');
      const label = row.querySelector('.slider-label');

      // cập nhật label text
      if (type === 'sugar') label.textContent = getSugarLabels()[lvl];
      if (type === 'ice') label.textContent = getIceLabels()[lvl];

      // style thay đổi (nếu muốn)
      if (type === 'sugar') item.sugarLevel = lvl;
      if (type === 'ice') item.iceLevel = lvl;
    });
  });

  // tự remove popup khi click ra ngoài
  document.addEventListener('click', function onDocClick() {
    if (popup && popup.parentNode) popup.remove();
    document.removeEventListener('click', onDocClick);
  }, { once: true });
}


// ----------------------
// Helper functions used by the note popup
// ----------------------
function getSugarLabels() {
  return ['Không','Ít','Bình thường','Thêm ít','Thêm nhiều'];
}
function getIceLabels() {
  return ['Không đá','Đá ít','Đá vừa','Bình thường'];
}

function positionPopupNearButton(popup, btn) {
  // đặt popup gần button, cố gắng hiển thị trên hoặc dưới tùy chỗ trống
  const rect = btn.getBoundingClientRect();
  const popupRect = popup.getBoundingClientRect();
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const screenHeight = window.innerHeight;
  let top = rect.bottom + scrollTop + 5;
  if (rect.bottom + popupRect.height > screenHeight - 10) {
    top = rect.top + scrollTop - popupRect.height - 5;
  }
  let left = rect.left + rect.width / 2;
  const screenWidth = window.innerWidth;
  if (left - popupRect.width / 2 < 5) left = popupRect.width / 2 + 5;
  if (left + popupRect.width / 2 > screenWidth - 5)
    left = screenWidth - popupRect.width / 2 - 5;

  popup.style.position = 'absolute';
  popup.style.top = `${top}px`;
  popup.style.left = `${left}px`;
  popup.style.transform = 'translateX(-50%)';
  popup.style.zIndex = 1000;
}
